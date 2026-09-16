import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function setShadowFlags(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
}

function createTraceInstances(material, { count = 22, width = 2.62, depth = 1.66, phase = 0 } = {}) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const traces = new THREE.InstancedMesh(geometry, material, count);
  const transform = new THREE.Object3D();

  for (let index = 0; index < count; index += 1) {
    const horizontal = index % 3 !== 1;
    const row = Math.floor(index / 6);
    const slot = index % 6;
    const x = -width * 0.4 + slot * (width * 0.16) + Math.sin((index + phase) * 1.7) * 0.045;
    const z = -depth * 0.36 + row * (depth * 0.22) + Math.cos((index + phase) * 1.3) * 0.035;
    const length = 0.22 + ((index * 7) % 6) * 0.055;
    transform.position.set(x, 0.08, z);
    transform.rotation.set(0, 0, 0);
    transform.scale.set(
      horizontal ? length : 0.014,
      0.012,
      horizontal ? 0.014 : length,
    );
    transform.updateMatrix();
    traces.setMatrixAt(index, transform.matrix);
  }
  traces.instanceMatrix.needsUpdate = true;
  return traces;
}

function createViaInstances(material, { count = 26, width = 2.62, depth = 1.66, phase = 0 } = {}) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 9);
  const vias = new THREE.InstancedMesh(geometry, material, count);
  const transform = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const lane = index % 7;
    const row = Math.floor(index / 7);
    const x = -width * 0.39 + lane * width * 0.13 + Math.sin(index * 2.1 + phase) * 0.035;
    const z = -depth * 0.34 + row * depth * 0.2 + Math.cos(index * 1.4 + phase) * 0.025;
    transform.position.set(x, 0.086, z);
    transform.rotation.set(0, 0, 0);
    transform.scale.set(0.018, 0.024, 0.018);
    transform.updateMatrix();
    vias.setMatrixAt(index, transform.matrix);
  }
  vias.instanceMatrix.needsUpdate = true;
  return vias;
}

function createSmallChipInstances(material, { count = 8, phase = 0 } = {}) {
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
  const chips = new THREE.InstancedMesh(geometry, material, count);
  const transform = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const column = index % 4;
    const row = Math.floor(index / 4);
    const x = -0.98 + column * 0.58 + Math.sin(index + phase) * 0.035;
    const z = -0.53 + row * 0.86 + Math.cos(index * 1.3 + phase) * 0.035;
    transform.position.set(x, 0.135, z);
    transform.rotation.set(0, (index % 2) * 0.08, 0);
    transform.scale.set(0.18 + (index % 3) * 0.025, 0.075, 0.13 + (index % 2) * 0.03);
    transform.updateMatrix();
    chips.setMatrixAt(index, transform.matrix);
  }
  chips.instanceMatrix.needsUpdate = true;
  return chips;
}

function createFasteners(material, width, depth) {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 12);
  const fasteners = new THREE.InstancedMesh(geometry, material, 4);
  const transform = new THREE.Object3D();
  const positions = [
    [-width * 0.43, depth * 0.4],
    [width * 0.43, depth * 0.4],
    [-width * 0.43, -depth * 0.4],
    [width * 0.43, -depth * 0.4],
  ];
  positions.forEach(([x, z], index) => {
    transform.position.set(x, 0.105, z);
    transform.rotation.set(0, 0, 0);
    transform.scale.set(0.035, 0.035, 0.035);
    transform.updateMatrix();
    fasteners.setMatrixAt(index, transform.matrix);
  });
  fasteners.instanceMatrix.needsUpdate = true;
  return fasteners;
}

function createRibbonGeometry(points, width = 0.14, thickness = 0.025) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -thickness / 2);
  shape.lineTo(width / 2, -thickness / 2);
  shape.lineTo(width / 2, thickness / 2);
  shape.lineTo(-width / 2, thickness / 2);
  shape.closePath();
  const path = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.42);
  return new THREE.ExtrudeGeometry(shape, {
    steps: 28,
    bevelEnabled: false,
    extrudePath: path,
  });
}

function createBoardLayer(
  materials,
  {
    name,
    material,
    width,
    depth,
    basePosition,
    explode,
    tracePhase,
    mobile,
    mainChipPosition,
    mainChipScale,
  },
) {
  const layer = new THREE.Group();
  layer.name = name;
  layer.position.copy(basePosition);

  const board = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.08, depth, 4, 0.075),
    material,
  );
  layer.add(board);

  const edgeRail = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.91, 0.028, depth * 0.91, 3, 0.045),
    materials.etched,
  );
  edgeRail.position.y = 0.052;
  layer.add(edgeRail);

  layer.add(
    createTraceInstances(materials.copper, {
      count: mobile ? 13 : 22,
      width,
      depth,
      phase: tracePhase,
    }),
    createViaInstances(materials.brass, {
      count: mobile ? 16 : 26,
      width,
      depth,
      phase: tracePhase,
    }),
    createSmallChipInstances(materials.chip, {
      count: mobile ? 5 : 8,
      phase: tracePhase,
    }),
    createFasteners(materials.silver, width, depth),
  );

  const mainChip = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.13, 0.52, 4, 0.06),
    materials.chip,
  );
  mainChip.position.copy(mainChipPosition);
  mainChip.scale.copy(mainChipScale);
  layer.add(mainChip);

  const chipCap = new THREE.Mesh(
    new RoundedBoxGeometry(0.38, 0.025, 0.31, 3, 0.025),
    materials.graphite,
  );
  chipCap.position.copy(mainChipPosition);
  chipCap.position.y += 0.087;
  chipCap.scale.copy(mainChipScale);
  layer.add(chipCap);

  const pinGeometry = new THREE.BoxGeometry(1, 1, 1);
  const pinCount = mobile ? 12 : 20;
  const pins = new THREE.InstancedMesh(pinGeometry, materials.silver, pinCount);
  const transform = new THREE.Object3D();
  for (let index = 0; index < pinCount; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const slot = Math.floor(index / 2);
    transform.position.set(
      mainChipPosition.x + side * 0.35,
      Math.max(mainChipPosition.y - 0.025, 0.092),
      mainChipPosition.z - 0.23 + slot * (0.46 / Math.max(1, pinCount / 2 - 1)),
    );
    transform.scale.set(0.065, 0.018, 0.018);
    transform.updateMatrix();
    pins.setMatrixAt(index, transform.matrix);
  }
  pins.instanceMatrix.needsUpdate = true;
  layer.add(pins);

  return {
    group: layer,
    basePosition: basePosition.clone(),
    explode: explode.clone(),
  };
}

export function createSystemsModel(materials, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'systems-exploded-processor';

  const support = new THREE.Group();
  support.name = 'systems-thin-support';
  const railGeometry = new RoundedBoxGeometry(2.88, 0.085, 0.17, 3, 0.055);
  const frontRail = new THREE.Mesh(railGeometry, materials.rubber);
  const rearRail = new THREE.Mesh(railGeometry, materials.rubber);
  frontRail.position.set(0, -0.86, 0.72);
  rearRail.position.set(0, -0.86, -0.72);
  const bridge = new THREE.Mesh(
    new RoundedBoxGeometry(0.36, 0.055, 1.54, 3, 0.04),
    materials.graphite,
  );
  bridge.position.set(-0.92, -0.81, 0);
  support.add(frontRail, rearRail, bridge);
  group.add(support);

  const boardWidth = mobile ? 2.5 : 2.76;
  const boardDepth = mobile ? 1.58 : 1.72;
  const layerSpecs = [
    {
      name: 'processor-base-board', material: materials.pine,
      width: boardWidth, depth: boardDepth,
      basePosition: new THREE.Vector3(0, -0.62, 0),
      explode: new THREE.Vector3(-0.05, 0.12, 0.02), tracePhase: 0.2,
      mainChipPosition: new THREE.Vector3(-0.32, 0.14, 0.04),
      mainChipScale: new THREE.Vector3(1.1, 1, 1.1),
    },
    {
      name: 'processor-logic-board', material: materials.sage,
      width: boardWidth * 0.94, depth: boardDepth * 0.92,
      basePosition: new THREE.Vector3(0.04, -0.18, 0.015),
      explode: new THREE.Vector3(0.04, 0.42, -0.03), tracePhase: 1.4,
      mainChipPosition: new THREE.Vector3(0.3, 0.14, -0.13),
      mainChipScale: new THREE.Vector3(0.92, 1, 0.92),
    },
    {
      name: 'processor-memory-board', material: materials.graphite,
      width: boardWidth * 0.87, depth: boardDepth * 0.84,
      basePosition: new THREE.Vector3(-0.05, 0.26, -0.02),
      explode: new THREE.Vector3(-0.03, 0.76, 0.05), tracePhase: 2.6,
      mainChipPosition: new THREE.Vector3(-0.14, 0.14, 0.13),
      mainChipScale: new THREE.Vector3(0.82, 1, 0.82),
    },
  ];

  const layers = layerSpecs.map((spec) => createBoardLayer(materials, { ...spec, mobile }));
  layers.forEach((layer) => group.add(layer.group));

  // Edge sockets give the stack a recognizable computing-module silhouette.
  const socketGeometry = new RoundedBoxGeometry(0.46, 0.18, 0.19, 3, 0.035);
  const sockets = new THREE.Group();
  const socketA = new THREE.Mesh(socketGeometry, materials.rubber);
  const socketB = new THREE.Mesh(socketGeometry, materials.rubber);
  socketA.position.set(-1.03, 0.13, 0.73);
  socketB.position.set(-0.43, 0.13, 0.73);
  sockets.add(socketA, socketB);
  layers[0].group.add(sockets);

  const sinkGroup = new THREE.Group();
  sinkGroup.name = 'systems-heat-sink';
  sinkGroup.position.set(-0.52, 0.2, 0.03);
  const sinkBase = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.11, 0.72, 3, 0.045),
    materials.silver,
  );
  const finCount = mobile ? 8 : 12;
  const finGeometry = new THREE.BoxGeometry(1, 1, 1);
  const fins = new THREE.InstancedMesh(finGeometry, materials.silver, finCount);
  const finTransform = new THREE.Object3D();
  for (let index = 0; index < finCount; index += 1) {
    finTransform.position.set(-0.39 + index * (0.78 / Math.max(1, finCount - 1)), 0.2, 0);
    finTransform.scale.set(0.025, 0.34, 0.68);
    finTransform.updateMatrix();
    fins.setMatrixAt(index, finTransform.matrix);
  }
  fins.instanceMatrix.needsUpdate = true;
  sinkGroup.add(sinkBase, fins);
  layers[2].group.add(sinkGroup);

  const housing = new THREE.Group();
  housing.name = 'processor-offset-housing';
  const housingBase = new THREE.Vector3(0.48, 0.9, 0.16);
  housing.position.copy(housingBase);
  const housingExplode = new THREE.Vector3(0.16, 1.0, 0.06);

  const roof = new THREE.Mesh(
    new RoundedBoxGeometry(1.5, 0.1, 1.16, 4, 0.07),
    materials.stone,
  );
  roof.position.y = 0.47;
  const housingFloor = new THREE.Mesh(
    new RoundedBoxGeometry(1.38, 0.07, 1.04, 4, 0.055),
    materials.graphite,
  );
  housingFloor.position.y = -0.26;
  const sideGeometry = new RoundedBoxGeometry(0.08, 0.78, 1.04, 3, 0.04);
  const leftSide = new THREE.Mesh(sideGeometry, materials.silver);
  const rightSide = new THREE.Mesh(sideGeometry, materials.silver);
  leftSide.position.set(-0.68, 0.1, 0);
  rightSide.position.set(0.68, 0.1, 0);
  const backWall = new THREE.Mesh(
    new RoundedBoxGeometry(1.34, 0.78, 0.07, 3, 0.035),
    materials.etched,
  );
  backWall.position.set(0, 0.1, -0.5);
  const window = new THREE.Mesh(
    new RoundedBoxGeometry(0.72, 0.32, 0.035, 3, 0.025),
    materials.glass,
  );
  window.position.set(0.18, 0.13, 0.53);
  housing.add(roof, housingFloor, leftSide, rightSide, backWall, window);

  const fan = new THREE.Group();
  fan.name = 'processor-cooling-fan';
  fan.position.set(-0.2, 0.52, 0.05);
  const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.025, 8, 48), materials.rubber);
  fanRing.rotation.x = Math.PI / 2;
  const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.055, 18), materials.copper);
  const bladeGeometry = new RoundedBoxGeometry(0.26, 0.025, 0.095, 3, 0.035);
  const blades = new THREE.InstancedMesh(bladeGeometry, materials.graphite, 6);
  const bladeTransform = new THREE.Object3D();
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * TAU;
    bladeTransform.position.set(Math.cos(angle) * 0.16, 0.02, Math.sin(angle) * 0.16);
    bladeTransform.rotation.set(0, -angle + Math.PI / 2, 0);
    bladeTransform.scale.set(1, 1, 1);
    bladeTransform.updateMatrix();
    blades.setMatrixAt(index, bladeTransform.matrix);
  }
  blades.instanceMatrix.needsUpdate = true;
  fan.add(fanRing, fanHub, blades);
  housing.add(fan);
  group.add(housing);

  const ribbonA = new THREE.Mesh(
    createRibbonGeometry([
      new THREE.Vector3(-1.0, 0.04, -0.52),
      new THREE.Vector3(-1.18, 0.22, -0.28),
      new THREE.Vector3(-1.05, 0.38, 0.12),
      new THREE.Vector3(-0.82, 0.2, 0.44),
    ], mobile ? 0.1 : 0.13, 0.022),
    materials.copper,
  );
  ribbonA.position.y = 0.11;
  layers[1].group.add(ribbonA);

  const ribbonB = new THREE.Mesh(
    createRibbonGeometry([
      new THREE.Vector3(0.72, 0.03, -0.46),
      new THREE.Vector3(0.98, 0.18, -0.23),
      new THREE.Vector3(0.92, 0.34, 0.18),
      new THREE.Vector3(0.62, 0.18, 0.46),
    ], mobile ? 0.09 : 0.12, 0.02),
    materials.brass,
  );
  ribbonB.position.y = 0.08;
  layers[2].group.add(ribbonB);

  // Small copper packets repeatedly move across the logic board bus.
  const packetCount = mobile ? 3 : 5;
  const packetGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
  const packets = new THREE.InstancedMesh(packetGeometry, materials.signal, packetCount);
  layers[1].group.add(packets);
  const packetTransform = new THREE.Object3D();
  const packetPoint = new THREE.Vector3();
  const packetPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.02, 0.15, -0.45),
    new THREE.Vector3(-0.62, 0.15, -0.12),
    new THREE.Vector3(-0.08, 0.15, -0.12),
    new THREE.Vector3(0.35, 0.15, 0.28),
    new THREE.Vector3(0.98, 0.15, 0.38),
  ], false, 'catmullrom', 0.25);

  const layerDelays = [0, 0.08, 0.17];
  let poseTime = 0;
  let systemsExplode = 0;
  let fanAngle = 0;
  const firstPacketPosition = new THREE.Vector3();

  function updatePackets(time) {
    for (let index = 0; index < packetCount; index += 1) {
      const t = (time * 0.13 + index / packetCount) % 1;
      packetPath.getPointAt(t, packetPoint);
      if (index === 0) firstPacketPosition.copy(packetPoint);
      packetTransform.position.copy(packetPoint);
      packetTransform.rotation.set(0, t * 0.28, 0);
      packetTransform.scale.set(0.11, 0.045, 0.075);
      packetTransform.updateMatrix();
      packets.setMatrixAt(index, packetTransform.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;
  }

  function update(time, delta) {
    void delta;
    poseTime = Number.isFinite(time) ? Math.max(0, time) : poseTime;
    const raw = (1 - Math.cos(poseTime * 0.72)) * 0.5;
    systemsExplode = smoothstep(raw);

    layers.forEach((layer, index) => {
      const delayed = smoothstep((systemsExplode - layerDelays[index]) / (1 - layerDelays[index]));
      layer.group.position.copy(layer.basePosition).addScaledVector(layer.explode, delayed);
      layer.group.rotation.y = Math.sin(poseTime * 0.42 + index * 0.8) * 0.025 * delayed;
    });

    const housingProgress = smoothstep((systemsExplode - 0.22) / 0.78);
    housing.position.copy(housingBase).addScaledVector(housingExplode, housingProgress);
    housing.rotation.y = 0.08 + housingProgress * 0.08;
    housing.rotation.z = -housingProgress * 0.025;

    fanAngle = (poseTime * 5.2) % TAU;
    fan.rotation.y = fanAngle;
    sinkGroup.rotation.y = Math.sin(poseTime * 0.38) * 0.025;
    updatePackets(poseTime);
  }

  setShadowFlags(group);
  update(0, 0);

  return {
    group,
    update,
    getPose() {
      return {
        systemsExplode: Number(systemsExplode.toFixed(3)),
        fanAngle: Number(fanAngle.toFixed(3)),
        packetPosition: {
          x: Number(firstPacketPosition.x.toFixed(3)),
          y: Number(firstPacketPosition.y.toFixed(3)),
          z: Number(firstPacketPosition.z.toFixed(3)),
        },
        animationTime: Number(poseTime.toFixed(3)),
      };
    },
  };
}
