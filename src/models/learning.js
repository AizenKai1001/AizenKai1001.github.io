import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function createTaperedTubeGeometry(
  curve,
  {
    segments = 18,
    radialSegments = 7,
    startRadius = 0.055,
    endRadius = 0.018,
    swell = 0.08,
  } = {},
) {
  const frames = curve.computeFrenetFrames(segments, false);
  const positions = [];
  const normals = [];
  const indices = [];
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const faceA = new THREE.Vector3();
  const faceB = new THREE.Vector3();
  const faceC = new THREE.Vector3();
  const faceEdge = new THREE.Vector3();
  const faceNormal = new THREE.Vector3();
  const assignedNormal = new THREE.Vector3();
  const assignedNormalB = new THREE.Vector3();
  const assignedNormalC = new THREE.Vector3();

  const pushOutwardTriangle = (i0, i1, i2) => {
    faceA.fromArray(positions, i0 * 3);
    faceB.fromArray(positions, i1 * 3);
    faceC.fromArray(positions, i2 * 3);
    faceEdge.subVectors(faceC, faceA);
    faceNormal.subVectors(faceB, faceA).cross(faceEdge).normalize();
    assignedNormal.fromArray(normals, i0 * 3);
    assignedNormalB.fromArray(normals, i1 * 3);
    assignedNormalC.fromArray(normals, i2 * 3);
    assignedNormal.add(assignedNormalB).add(assignedNormalC).normalize();
    if (faceNormal.dot(assignedNormal) >= 0) indices.push(i0, i1, i2);
    else indices.push(i0, i2, i1);
  };

  for (let ring = 0; ring <= segments; ring += 1) {
    const t = ring / segments;
    curve.getPointAt(t, point);
    const taper = THREE.MathUtils.lerp(startRadius, endRadius, Math.pow(t, 0.9));
    const radius = taper * (1 + Math.sin(Math.PI * t) * swell);

    for (let side = 0; side < radialSegments; side += 1) {
      const angle = (side / radialSegments) * TAU;
      normal.copy(frames.normals[ring]).multiplyScalar(Math.cos(angle));
      normal.addScaledVector(frames.binormals[ring], Math.sin(angle)).normalize();
      positions.push(
        point.x + normal.x * radius,
        point.y + normal.y * radius,
        point.z + normal.z * radius,
      );
      normals.push(normal.x, normal.y, normal.z);
    }
  }

  for (let ring = 0; ring < segments; ring += 1) {
    for (let side = 0; side < radialSegments; side += 1) {
      const nextSide = (side + 1) % radialSegments;
      const a = ring * radialSegments + side;
      const b = ring * radialSegments + nextSide;
      const c = (ring + 1) * radialSegments + side;
      const d = (ring + 1) * radialSegments + nextSide;
      // Outward winding: the supplied vertex normals are radial, so keep the
      // triangle face normal aligned with them instead of facing into the tube.
      // The orientation check also handles the occasional Frenet-frame twist on
      // a sharply curved axon segment.
      pushOutwardTriangle(a, b, c);
      pushOutwardTriangle(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function makeBranchCurve(start, end, index, amount = 1) {
  const a = start.clone();
  const d = end.clone();
  const delta = d.clone().sub(a);
  const tangent = delta.clone().normalize();
  const fallback = Math.abs(tangent.y) > 0.92
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3().crossVectors(tangent, fallback).normalize();
  const up = new THREE.Vector3().crossVectors(side, tangent).normalize();
  const bend = (0.08 + (index % 5) * 0.018) * amount;
  const lift = (0.055 + (index % 3) * 0.025) * amount;
  const sign = index % 2 === 0 ? 1 : -1;
  const p1 = a.clone().lerp(d, 0.28)
    .addScaledVector(side, bend * sign)
    .addScaledVector(up, lift);
  const p2 = a.clone().lerp(d, 0.64)
    .addScaledVector(side, bend * -sign * 0.55)
    .addScaledVector(up, lift * 0.72);
  return new THREE.CatmullRomCurve3([a, p1, p2, d], false, 'catmullrom', 0.42);
}

function createSculptedSomaGeometry(radius = 0.4, detail = 3) {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let index = 0; index < position.count; index += 1) {
    v.fromBufferAttribute(position, index);
    const n = v.clone().normalize();
    const wave = 1
      + Math.sin(n.x * 7.2 + n.z * 2.8) * 0.055
      + Math.cos(n.y * 8.6 - n.x * 2.4) * 0.04;
    v.multiplyScalar(wave);
    v.y *= 0.88;
    v.z *= 1.08;
    position.setXYZ(index, v.x, v.y, v.z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function mergeAndDispose(geometries) {
  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  return merged;
}

function makeCurveRecord(nodes, from, to, index, tier = 'secondary', signal = false) {
  const start = new THREE.Vector3(...nodes[from]);
  const end = new THREE.Vector3(...nodes[to]);
  const curve = makeBranchCurve(start, end, index, tier === 'primary' ? 1.2 : 1);
  return { from, to, tier, signal, curve };
}

export function createLearningModel(materials, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'learning-organic-neuron';

  const modelRoot = new THREE.Group();
  modelRoot.name = 'learning-organic-volume';
  group.add(modelRoot);

  const support = new THREE.Group();
  support.name = 'learning-specimen-support';
  const supportPlate = new THREE.Mesh(
    new RoundedBoxGeometry(1.18, 0.08, 0.78, 4, 0.075),
    materials.stone,
  );
  supportPlate.position.set(-0.05, -0.69, 0.02);
  supportPlate.rotation.y = -0.13;
  const supportInsert = new THREE.Mesh(
    new RoundedBoxGeometry(0.72, 0.045, 0.38, 3, 0.045),
    materials.graphite,
  );
  supportInsert.position.set(-0.03, -0.63, 0.025);
  supportInsert.rotation.y = -0.13;
  const specimenStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.105, 0.58, 18),
    materials.brass,
  );
  specimenStem.position.set(0, -0.34, 0);
  support.add(supportPlate, supportInsert, specimenStem);
  group.add(support);

  const somaCenter = new THREE.Vector3(0, 0.34, 0);
  const soma = new THREE.Mesh(
    createSculptedSomaGeometry(mobile ? 0.34 : 0.39, mobile ? 2 : 3),
    materials.glass,
  );
  soma.position.copy(somaCenter);
  soma.rotation.set(-0.08, 0.17, 0.05);
  modelRoot.add(soma);

  const nucleus = new THREE.Mesh(
    new THREE.IcosahedronGeometry(mobile ? 0.115 : 0.135, 2),
    materials.copper,
  );
  nucleus.position.set(0.045, 0.38, 0.05);
  modelRoot.add(nucleus);

  const membraneBand = new THREE.Mesh(
    new THREE.TorusGeometry(mobile ? 0.36 : 0.405, 0.012, 7, 64),
    materials.brass,
  );
  membraneBand.position.copy(somaCenter);
  membraneBand.rotation.set(Math.PI / 2.25, 0.18, -0.12);
  modelRoot.add(membraneBand);

  // The explicit node layout forms one coherent neuron-like body, with broad 3D dendritic
  // fans instead of a planar tree. Branch geometry is merged into only a few meshes.
  const nodes = [
    [0, 0.34, 0],
    [-0.52, 0.7, 0.44], [0.54, 0.73, -0.42], [-0.16, 0.84, -0.67], [0.18, 0.81, 0.7],
    [-0.77, 0.48, -0.28], [0.8, 0.5, 0.22],
    [-1.08, 1.08, 0.76], [-0.82, 1.38, 0.24], [-0.4, 1.24, 1.02],
    [1.13, 1.12, -0.76], [0.91, 1.48, -0.13], [0.44, 1.33, -1.05],
    [-0.61, 1.28, -1.02], [0.02, 1.58, -0.84], [0.46, 1.18, -0.92],
    [-0.31, 1.46, 1.03], [0.3, 1.7, 0.8], [0.78, 1.19, 1.02],
    [-1.28, 0.82, -0.58], [-1.1, 1.24, -0.08], [-0.74, 0.96, -0.9],
    [1.3, 0.86, 0.48], [1.13, 1.36, 0.1], [0.98, 1.0, 0.84],
    [-1.36, 1.68, 0.52], [-0.72, 1.92, 0.05], [-0.22, 2.03, 0.94],
    [0.55, 1.98, -0.73], [1.23, 1.75, -0.3], [1.42, 1.48, 0.69], [0.9, 1.94, 0.56],
    [-0.9, 1.82, -0.92], [0.03, 2.18, -0.44], [0.56, 1.8, 1.06],
    [1.47, 1.24, -0.96], [-1.52, 1.27, 0.05],
    [0.18, 0.0, -0.08], [0.54, -0.2, -0.35], [1.08, -0.34, -0.68], [1.55, -0.23, -0.92],
    [1.78, 0.03, -0.75], [1.58, 0.22, -1.18],
  ];

  const edges = [
    [0, 1, 'primary', true], [0, 2, 'primary', true], [0, 3, 'primary', false], [0, 4, 'primary', true],
    [0, 5, 'primary', false], [0, 6, 'primary', false],
    [1, 7, 'secondary', true], [1, 8, 'secondary', false], [1, 9, 'secondary', false],
    [2, 10, 'secondary', true], [2, 11, 'secondary', false], [2, 12, 'secondary', false],
    [3, 13, 'secondary', false], [3, 14, 'secondary', true], [3, 15, 'secondary', false],
    [4, 16, 'secondary', false], [4, 17, 'secondary', true], [4, 18, 'secondary', false],
    [5, 19, 'secondary', false], [5, 20, 'secondary', true], [5, 21, 'secondary', false],
    [6, 22, 'secondary', false], [6, 23, 'secondary', true], [6, 24, 'secondary', false],
    [7, 25, 'terminal', false], [8, 26, 'terminal', true], [9, 27, 'terminal', false],
    [10, 29, 'terminal', true], [11, 29, 'terminal', false], [12, 35, 'terminal', false],
    [13, 32, 'terminal', false], [14, 33, 'terminal', true], [16, 27, 'terminal', false],
    [17, 31, 'terminal', true], [18, 34, 'terminal', false], [20, 36, 'terminal', false],
    [22, 30, 'terminal', false], [23, 31, 'terminal', true], [24, 30, 'terminal', false],
    // A single axon leaves the soma downward, then sweeps into its own terminal arbor.
    [0, 37, 'axon', true], [37, 38, 'axon', true], [38, 39, 'axon', true], [39, 40, 'axon', true],
    [40, 41, 'axonTerminal', true], [40, 42, 'axonTerminal', true],
  ];

  const branchBuckets = { primary: [], secondary: [], terminal: [], axon: [] };
  const signalCurves = [];
  const curveRecords = [];
  edges.forEach(([from, to, tier, signal], index) => {
    const normalizedTier = tier.startsWith('axon') ? 'axon' : tier;
    const record = makeCurveRecord(nodes, from, to, index, normalizedTier, signal);
    curveRecords.push(record);
    if (signal) signalCurves.push(record.curve);
    const isAxon = normalizedTier === 'axon';
    const radii = normalizedTier === 'primary'
      ? [0.07, 0.038]
      : normalizedTier === 'secondary'
        ? [0.046, 0.022]
        : normalizedTier === 'terminal'
          ? [0.027, 0.009]
          : [0.055, tier === 'axonTerminal' ? 0.011 : 0.031];
    branchBuckets[normalizedTier].push(createTaperedTubeGeometry(record.curve, {
      segments: mobile ? 12 : (normalizedTier === 'primary' || isAxon ? 20 : 15),
      radialSegments: mobile ? 5 : 7,
      startRadius: radii[0],
      endRadius: radii[1],
      swell: normalizedTier === 'primary' ? 0.12 : 0.07,
    }));
  });

  const primaryGeometry = mergeAndDispose(branchBuckets.primary);
  const secondaryGeometry = mergeAndDispose([...branchBuckets.secondary, ...branchBuckets.terminal]);
  const axonGeometry = mergeAndDispose(branchBuckets.axon);
  const primaryBranches = new THREE.Mesh(primaryGeometry, materials.pine);
  const secondaryBranches = new THREE.Mesh(secondaryGeometry, materials.sage);
  const axon = new THREE.Mesh(axonGeometry, materials.copper);
  modelRoot.add(primaryBranches, secondaryBranches, axon);

  const terminalNodeIndexes = Array.from(new Set(edges.map((edge) => edge[1]))).filter((index) => (
    !edges.some((edge) => edge[0] === index)
  ));
  const terminalGeometry = new THREE.IcosahedronGeometry(1, mobile ? 1 : 2);
  const terminals = new THREE.InstancedMesh(terminalGeometry, materials.stone, terminalNodeIndexes.length);
  const terminalTransform = new THREE.Object3D();
  const terminalSpecs = terminalNodeIndexes.map((nodeIndex, instanceIndex) => ({
    position: new THREE.Vector3(...nodes[nodeIndex]),
    scale: 0.045 + (instanceIndex % 4) * 0.009,
    phase: instanceIndex * 0.62,
  }));
  terminalSpecs.forEach((spec, instanceIndex) => {
    terminalTransform.position.copy(spec.position);
    terminalTransform.scale.setScalar(spec.scale);
    terminalTransform.rotation.set(0, instanceIndex * 0.41, instanceIndex * 0.23);
    terminalTransform.updateMatrix();
    terminals.setMatrixAt(instanceIndex, terminalTransform.matrix);
  });
  terminals.instanceMatrix.needsUpdate = true;
  modelRoot.add(terminals);

  const headGeometry = new THREE.SphereGeometry(1, mobile ? 8 : 12, mobile ? 6 : 8);
  const trainCount = mobile ? 4 : 6;
  const tailLength = mobile ? 2 : 3;
  const signalHeads = new THREE.InstancedMesh(headGeometry, materials.signal, trainCount);
  const signalTails = new THREE.InstancedMesh(headGeometry, materials.copper, trainCount * tailLength);
  modelRoot.add(signalHeads, signalTails);
  const signalTransform = new THREE.Object3D();
  const signalPoint = new THREE.Vector3();
  const firstSignalPosition = new THREE.Vector3();
  const trains = Array.from({ length: trainCount }, (_, index) => ({
    curve: signalCurves[(index * 3 + 1) % signalCurves.length],
    phase: (index / trainCount) * 0.87,
    speed: 0.11 + index * 0.011,
  }));

  const terminalHaloGeometry = new THREE.TorusGeometry(1, 0.1, 5, 28);
  const haloCount = mobile ? 5 : 8;
  const halos = new THREE.InstancedMesh(terminalHaloGeometry, materials.brass, haloCount);
  const haloSpecs = terminalSpecs.slice(0, haloCount);
  haloSpecs.forEach((spec, index) => {
    terminalTransform.position.copy(spec.position);
    terminalTransform.scale.setScalar(spec.scale * 1.75);
    terminalTransform.rotation.set(Math.PI / 2.4, index * 0.53, index * 0.19);
    terminalTransform.updateMatrix();
    halos.setMatrixAt(index, terminalTransform.matrix);
  });
  halos.instanceMatrix.needsUpdate = true;
  modelRoot.add(halos);

  const rootBaseScale = mobile ? 0.92 : 1;
  modelRoot.scale.setScalar(rootBaseScale);
  modelRoot.position.y = mobile ? -0.02 : 0;

  let poseTime = 0;
  let breathing = 0;

  function updateSignals(time) {
    trains.forEach((train, trainIndex) => {
      const t = (train.phase + time * train.speed) % 1;
      train.curve.getPointAt(t, signalPoint);
      if (trainIndex === 0) firstSignalPosition.copy(signalPoint);
      signalTransform.position.copy(signalPoint);
      signalTransform.scale.setScalar(trainIndex === 0 ? 0.047 : 0.04);
      signalTransform.rotation.set(0, 0, 0);
      signalTransform.updateMatrix();
      signalHeads.setMatrixAt(trainIndex, signalTransform.matrix);

      for (let tailIndex = 0; tailIndex < tailLength; tailIndex += 1) {
        const tailT = (t - (tailIndex + 1) * 0.038 + 1) % 1;
        train.curve.getPointAt(tailT, signalPoint);
        signalTransform.position.copy(signalPoint);
        signalTransform.scale.setScalar(0.028 - tailIndex * 0.005);
        signalTransform.updateMatrix();
        signalTails.setMatrixAt(trainIndex * tailLength + tailIndex, signalTransform.matrix);
      }
    });
    signalHeads.instanceMatrix.needsUpdate = true;
    signalTails.instanceMatrix.needsUpdate = true;
  }

  function updateTerminals(time) {
    terminalSpecs.forEach((spec, index) => {
      const pulse = 1 + Math.sin(time * 1.45 + spec.phase) * 0.13;
      terminalTransform.position.copy(spec.position);
      terminalTransform.scale.setScalar(spec.scale * pulse);
      terminalTransform.rotation.set(time * 0.07 + index * 0.14, index * 0.41, index * 0.23);
      terminalTransform.updateMatrix();
      terminals.setMatrixAt(index, terminalTransform.matrix);
    });
    terminals.instanceMatrix.needsUpdate = true;
  }

  function update(time, delta) {
    void delta;
    poseTime = Number.isFinite(time) ? Math.max(0, time) : poseTime;
    breathing = Math.sin(poseTime * 0.86) * 0.5 + 0.5;
    const breatheScale = 0.975 + breathing * 0.055;
    modelRoot.scale.set(
      rootBaseScale * (1 + Math.sin(poseTime * 0.72) * 0.012),
      rootBaseScale * breatheScale,
      rootBaseScale * (1 + Math.cos(poseTime * 0.68) * 0.014),
    );
    modelRoot.rotation.y = poseTime * 0.18;
    modelRoot.rotation.z = Math.sin(poseTime * 0.47) * 0.018;
    soma.scale.setScalar(0.97 + breathing * 0.075);
    nucleus.rotation.y = poseTime * 0.28;
    nucleus.rotation.x = poseTime * 0.11;
    membraneBand.rotation.z = -0.12 + Math.sin(poseTime * 0.52) * 0.09;
    updateSignals(poseTime);
    updateTerminals(poseTime);
  }

  group.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  signalHeads.castShadow = false;
  signalHeads.receiveShadow = false;
  signalTails.castShadow = false;
  signalTails.receiveShadow = false;

  update(0, 0);

  return {
    group,
    update,
    getPose() {
      return {
        signalPosition: {
          x: Number(firstSignalPosition.x.toFixed(3)),
          y: Number(firstSignalPosition.y.toFixed(3)),
          z: Number(firstSignalPosition.z.toFixed(3)),
        },
        breathing: Number(breathing.toFixed(3)),
        rotationY: Number(modelRoot.rotation.y.toFixed(3)),
        animationTime: Number(poseTime.toFixed(3)),
      };
    },
  };
}
