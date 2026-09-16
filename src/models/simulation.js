import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const MODEL_RADIUS = 1.88;
const TERRAIN_BASE_Y = -0.31;
const TERRAIN_BOTTOM_Y = -0.46;
const PATROL_SPEED = 0.36;
const GAIT_SPEED = 3.15;

const LEG_SPECS = Object.freeze([
  { name: 'left-rear', side: -1, fore: -0.25, phase: 0 },
  { name: 'left-mid', side: -1, fore: 0.00, phase: Math.PI },
  { name: 'left-front', side: -1, fore: 0.25, phase: 0 },
  { name: 'right-rear', side: 1, fore: -0.25, phase: Math.PI },
  { name: 'right-mid', side: 1, fore: 0.00, phase: 0 },
  { name: 'right-front', side: 1, fore: 0.25, phase: Math.PI },
]);

const ROCKS = Object.freeze([
  [-1.46, -0.44, 0.95], [-1.20, -0.91, 0.74], [-0.92, 0.98, 0.62],
  [-0.58, -1.20, 0.48], [0.58, 1.15, 0.72], [0.92, -1.02, 0.56],
  [1.20, 0.83, 0.82], [1.48, -0.26, 0.68], [-1.58, 0.26, 0.52],
  [1.54, 0.38, 0.43], [0.22, 1.39, 0.46], [-0.16, -1.42, 0.57],
  [1.20, -0.72, 0.39], [-1.30, 0.72, 0.44],
]);

const PLANTS = Object.freeze([
  [-1.38, 0.05, 0.22], [-1.21, 0.62, 0.18], [-0.96, -0.97, 0.16],
  [-0.50, 1.25, 0.20], [0.00, -1.34, 0.17], [0.34, 1.31, 0.19],
  [0.83, -1.11, 0.20], [1.04, 1.00, 0.18], [1.43, 0.17, 0.21],
  [1.23, -0.62, 0.15], [-1.53, -0.43, 0.16], [0.63, 1.39, 0.14],
  [-0.25, 1.43, 0.15], [1.55, 0.53, 0.15], [-1.02, 1.01, 0.13],
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fract(value) {
  return value - Math.floor(value);
}

function gaussian(x, z, cx, cz, sx, sz, amplitude) {
  const dx = (x - cx) / sx;
  const dz = (z - cz) / sz;
  return amplitude * Math.exp(-(dx * dx + dz * dz));
}

function terrainHeight(x, z) {
  const broad = gaussian(x, z, -0.73, 0.57, 0.72, 0.54, 0.22);
  const shoulder = gaussian(x, z, 0.91, -0.42, 0.66, 0.58, 0.16);
  const north = gaussian(x, z, 0.35, 1.08, 0.52, 0.42, 0.105);
  const basin = gaussian(x, z, 0.05, -0.08, 0.78, 0.62, -0.035);
  const grain = Math.sin(x * 2.55 + z * 1.1) * Math.cos(z * 2.35 - x * 0.7) * 0.022;
  return TERRAIN_BASE_Y + broad + shoulder + north + basin + grain;
}

function hexBoundaryRadius(angle, circumradius = MODEL_RADIUS) {
  const sector = Math.PI / 3;
  const halfSector = sector / 2;
  let local = (angle + halfSector) % sector;
  if (local < 0) local += sector;
  local -= halfSector;
  const apothem = circumradius * Math.cos(halfSector);
  return apothem / Math.cos(local);
}

function createTerrainSurfaceGeometry({ mobile }) {
  const rings = mobile ? 6 : 9;
  const segments = mobile ? 48 : 72;
  const positions = [0, terrainHeight(0, 0), 0];
  const indices = [];

  for (let ring = 1; ring <= rings; ring += 1) {
    const ratio = ring / rings;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * TAU;
      const radius = hexBoundaryRadius(angle) * ratio;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, terrainHeight(x, z), z);
    }
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    indices.push(0, 1 + next, 1 + segment);
  }

  for (let ring = 1; ring < rings; ring += 1) {
    const current = 1 + (ring - 1) * segments;
    const nextRing = current + segments;
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      const a = current + segment;
      const b = current + next;
      const c = nextRing + segment;
      const d = nextRing + next;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createTerrainSkirtGeometry({ mobile }) {
  const segments = mobile ? 48 : 72;
  const positions = [];
  const indices = [];

  for (let segment = 0; segment < segments; segment += 1) {
    const angle = (segment / segments) * TAU;
    const radius = hexBoundaryRadius(angle);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    positions.push(x, terrainHeight(x, z), z, x, TERRAIN_BOTTOM_Y, z);
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    const top = segment * 2;
    const bottom = top + 1;
    const nextTop = next * 2;
    const nextBottom = nextTop + 1;
    indices.push(top, nextTop, bottom, nextTop, nextBottom, bottom);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function patrolPosition(angle, target) {
  target.set(
    0.75 * Math.cos(angle) + 0.06 * Math.cos(angle * 2),
    0,
    0.60 * Math.sin(angle),
  );
  target.y = terrainHeight(target.x, target.z);
  return target;
}

function patrolTangent(angle, target) {
  target.set(
    -0.75 * Math.sin(angle) - 0.12 * Math.sin(angle * 2),
    0,
    0.60 * Math.cos(angle),
  );
  return target.normalize();
}

function setShadowFlags(object, cast = true, receive = true) {
  object.traverse((child) => {
    if (!child.isMesh && !child.isInstancedMesh) return;
    child.castShadow = cast;
    child.receiveShadow = receive;
  });
  return object;
}

function setInstanceTransform(mesh, index, dummy, position, rotationY, scale) {
  dummy.position.copy(position);
  dummy.rotation.set(0, rotationY, 0);
  dummy.scale.copy(scale);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

export function createSimulationModel(materials, { mobile = false } = {}) {
  const group = new THREE.Group();
  group.name = 'simulation-vivarium';
  const content = new THREE.Group();
  content.name = 'simulation-vivarium-content';
  content.position.y = 0.15;
  group.add(content);

  const layerGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
  const layers = [
    { y: -0.73, h: 0.16, radius: 1.88, material: materials.graphite },
    { y: -0.615, h: 0.07, radius: 1.85, material: materials.copper },
    { y: -0.555, h: 0.08, radius: 1.82, material: materials.stone },
    { y: -0.495, h: 0.045, radius: 1.79, material: materials.pine },
  ];
  for (const layer of layers) {
    const mesh = new THREE.Mesh(layerGeometry, layer.material);
    mesh.position.y = layer.y;
    mesh.scale.set(layer.radius, layer.h, layer.radius);
    content.add(mesh);
  }

  const skirt = new THREE.Mesh(createTerrainSkirtGeometry({ mobile }), materials.pine);
  const terrain = new THREE.Mesh(createTerrainSurfaceGeometry({ mobile }), materials.sage);
  content.add(skirt, terrain);

  const terraceGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
  const terraceSpecs = [
    { x: -1.23, z: 0.72, r: 0.37, h: 0.075, m: materials.stone },
    { x: 1.28, z: -0.62, r: 0.32, h: 0.09, m: materials.pine },
    { x: 0.47, z: 1.31, r: 0.28, h: 0.065, m: materials.ivory },
  ];
  for (const spec of terraceSpecs) {
    const mesh = new THREE.Mesh(terraceGeometry, spec.m);
    const baseY = terrainHeight(spec.x, spec.z);
    mesh.position.set(spec.x, baseY + spec.h * 0.5 - 0.012, spec.z);
    mesh.scale.set(spec.r, spec.h, spec.r * 0.76);
    mesh.rotation.y = Math.PI / 6 + spec.x * 0.13;
    content.add(mesh);
  }

  const pathPoints = [];
  const pathSegments = mobile ? 42 : 64;
  for (let index = 0; index < pathSegments; index += 1) {
    const angle = (index / pathSegments) * TAU;
    const point = patrolPosition(angle, new THREE.Vector3());
    point.y += 0.026;
    pathPoints.push(point);
  }
  const patrolCurve = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.4);
  const path = new THREE.Mesh(
    new THREE.TubeGeometry(patrolCurve, mobile ? 72 : 112, 0.015, 6, true),
    materials.etched,
  );
  content.add(path);

  const dummy = new THREE.Object3D();
  const tmpPosition = new THREE.Vector3();
  const tmpScale = new THREE.Vector3();

  const rockCount = mobile ? 9 : ROCKS.length;
  const rocks = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.11, 0),
    materials.stone,
    rockCount,
  );
  for (let index = 0; index < rockCount; index += 1) {
    const [x, z, scale] = ROCKS[index];
    tmpPosition.set(x, terrainHeight(x, z) + 0.055 * scale, z);
    tmpScale.set(scale * 1.05, scale * 0.72, scale * 0.9);
    setInstanceTransform(rocks, index, dummy, tmpPosition, index * 0.91, tmpScale);
  }
  rocks.instanceMatrix.needsUpdate = true;
  content.add(rocks);

  const plantCount = mobile ? 10 : PLANTS.length;
  const stems = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.025, 1, 7, 1),
    materials.pine,
    plantCount,
  );
  const crowns = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.09, 0.22, 7, 1),
    materials.sage,
    plantCount,
  );
  for (let index = 0; index < plantCount; index += 1) {
    const [x, z, height] = PLANTS[index];
    const ground = terrainHeight(x, z);
    tmpPosition.set(x, ground + height * 0.46, z);
    tmpScale.set(1, height * 0.92, 1);
    setInstanceTransform(stems, index, dummy, tmpPosition, index * 0.37, tmpScale);
    tmpPosition.set(x, ground + height + 0.065, z);
    tmpScale.set(0.82 + (index % 3) * 0.12, 0.72 + (index % 2) * 0.16, 0.82 + (index % 3) * 0.12);
    setInstanceTransform(crowns, index, dummy, tmpPosition, index * 0.61, tmpScale);
  }
  stems.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  content.add(stems, crowns);

  const markerPositions = [
    [-1.25, 0.80], [1.25, 0.80], [1.25, -0.80], [-1.25, -0.80],
  ];
  const markerPosts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.022, 0.026, 1, 8, 1),
    materials.brass,
    markerPositions.length,
  );
  const markerLenses = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.055, 10, 8),
    materials.glass,
    markerPositions.length,
  );
  markerPositions.forEach(([x, z], index) => {
    const ground = terrainHeight(x, z);
    tmpPosition.set(x, ground + 0.14, z);
    tmpScale.set(1, 0.28, 1);
    setInstanceTransform(markerPosts, index, dummy, tmpPosition, 0, tmpScale);
    tmpPosition.set(x, ground + 0.30, z);
    tmpScale.setScalar(1);
    setInstanceTransform(markerLenses, index, dummy, tmpPosition, 0, tmpScale);
  });
  markerPosts.instanceMatrix.needsUpdate = true;
  markerLenses.instanceMatrix.needsUpdate = true;
  content.add(markerPosts, markerLenses);

  const robot = new THREE.Group();
  robot.name = 'six-legged-inspection-rig';
  const chassis = new THREE.Mesh(
    new RoundedBoxGeometry(0.86, 0.30, 0.62, 5, 0.095),
    materials.graphite,
  );
  const shell = new THREE.Mesh(
    new RoundedBoxGeometry(0.69, 0.18, 0.51, 5, 0.075),
    materials.pine,
  );
  shell.position.y = 0.20;
  const deck = new THREE.Mesh(
    new RoundedBoxGeometry(0.50, 0.055, 0.36, 4, 0.022),
    materials.ivory,
  );
  deck.position.set(0, 0.315, -0.015);
  const rearPack = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.15, 0.20, 4, 0.045),
    materials.chip,
  );
  rearPack.position.set(0, 0.19, -0.31);
  const frontPlate = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.15, 0.075, 4, 0.022),
    materials.copper,
  );
  frontPlate.position.set(0, 0.04, 0.34);
  const belly = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 0.10, 0.40, 4, 0.035),
    materials.rubber,
  );
  belly.position.y = -0.17;
  robot.add(chassis, shell, deck, rearPack, frontPlate, belly);

  const sideRailGeometry = new RoundedBoxGeometry(0.07, 0.075, 0.46, 3, 0.018);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(sideRailGeometry, materials.brass);
    rail.position.set(side * 0.43, 0.04, -0.01);
    robot.add(rail);
  }

  const sensor = new THREE.Group();
  sensor.name = 'sensor-head';
  sensor.position.set(0, 0.39, 0.19);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.16, 12), materials.brass);
  neck.position.y = 0.06;
  const sensorHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.30, 0.20, 0.24, 4, 0.06),
    materials.stone,
  );
  sensorHousing.position.set(0, 0.18, 0.015);
  const lensSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.09, 18), materials.copper);
  lensSleeve.rotation.x = Math.PI / 2;
  lensSleeve.position.set(0, 0.19, 0.15);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.082, 18, 12), materials.signal);
  lens.scale.z = 0.48;
  lens.position.set(0, 0.19, 0.205);
  const lensGlass = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 12), materials.glass);
  lensGlass.scale.z = 0.34;
  lensGlass.position.set(0, 0.19, 0.22);
  sensor.add(neck, sensorHousing, lensSleeve, lens, lensGlass);
  robot.add(sensor);

  const antenna = new THREE.Group();
  antenna.position.set(-0.20, 0.35, -0.18);
  const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.019, 0.28, 8), materials.brass);
  antennaStem.position.y = 0.14;
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), materials.signal);
  antennaTip.position.y = 0.30;
  antenna.add(antennaStem, antennaTip);
  robot.add(antenna);
  content.add(robot);

  const legSegmentGeometry = new THREE.CylinderGeometry(0.032, 0.045, 1, 8, 1, false);
  const legSegments = new THREE.InstancedMesh(legSegmentGeometry, materials.brass, LEG_SPECS.length * 2);
  const legJointGeometry = new THREE.SphereGeometry(0.055, 10, 8);
  const legJoints = new THREE.InstancedMesh(legJointGeometry, materials.copper, LEG_SPECS.length * 2);
  const footGeometry = new RoundedBoxGeometry(0.14, 0.045, 0.20, 3, 0.018);
  const feet = new THREE.InstancedMesh(footGeometry, materials.rubber, LEG_SPECS.length);
  legSegments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  legJoints.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  feet.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  content.add(legSegments, legJoints, feet);

  const segmentDummy = new THREE.Object3D();
  const jointDummy = new THREE.Object3D();
  const footDummy = new THREE.Object3D();
  const direction = new THREE.Vector3();
  const midpoint = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const hip = new THREE.Vector3();
  const knee = new THREE.Vector3();
  const foot = new THREE.Vector3();
  const patrol = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const legPose = LEG_SPECS.map((spec) => ({
    name: spec.name,
    phase: 0,
    foot: new THREE.Vector3(),
    knee: new THREE.Vector3(),
  }));

  function setSegmentInstance(index, start, end) {
    direction.subVectors(end, start);
    const length = Math.max(0.001, direction.length());
    midpoint.copy(start).add(end).multiplyScalar(0.5);
    segmentDummy.position.copy(midpoint);
    segmentDummy.quaternion.setFromUnitVectors(UP, direction.normalize());
    segmentDummy.scale.set(1, length, 1);
    segmentDummy.updateMatrix();
    legSegments.setMatrixAt(index, segmentDummy.matrix);
  }

  function setJointInstance(index, position, scale = 1) {
    jointDummy.position.copy(position);
    jointDummy.quaternion.identity();
    jointDummy.scale.setScalar(scale);
    jointDummy.updateMatrix();
    legJoints.setMatrixAt(index, jointDummy.matrix);
  }

  let lastTime = 0;
  let lastGaitPhase = 0;
  let lastHeading = 0;

  function update(time, delta = 0) {
    void delta;
    const t = Number.isFinite(time) ? time : 0;
    lastTime = t;
    const patrolAngle = t * PATROL_SPEED + 0.45;
    patrolPosition(patrolAngle, patrol);
    patrolTangent(patrolAngle, tangent);
    const heading = Math.atan2(tangent.x, tangent.z);
    lastHeading = heading;

    const bodyBob = Math.sin(t * GAIT_SPEED * 2) * 0.018;
    const bodyY = patrol.y + 0.69 + bodyBob;
    robot.position.set(patrol.x, bodyY, patrol.z);
    robot.rotation.y = heading;
    robot.rotation.z = Math.sin(t * 1.1) * 0.014;

    sensor.rotation.y = Math.sin(t * 0.72) * 0.28;
    sensor.rotation.x = Math.sin(t * 0.48 + 0.9) * 0.045;
    antenna.rotation.z = Math.sin(t * 1.3) * 0.035;

    forward.set(Math.sin(heading), 0, Math.cos(heading));
    right.set(Math.cos(heading), 0, -Math.sin(heading));
    const gait = t * GAIT_SPEED;
    lastGaitPhase = fract(gait / TAU);

    LEG_SPECS.forEach((spec, index) => {
      const phase = gait + spec.phase;
      const stride = Math.sin(phase) * 0.16;
      const lift = Math.max(0, Math.sin(phase)) * 0.145;

      hip.copy(robot.position)
        .addScaledVector(right, spec.side * 0.40)
        .addScaledVector(forward, spec.fore);
      hip.y -= 0.04;

      foot.copy(robot.position)
        .addScaledVector(right, spec.side * 0.66)
        .addScaledVector(forward, spec.fore - stride);
      const ground = terrainHeight(foot.x, foot.z);
      foot.y = ground + 0.028 + lift;

      knee.copy(hip).lerp(foot, 0.51)
        .addScaledVector(right, spec.side * 0.14);
      knee.y += 0.15 + lift * 0.25;

      setSegmentInstance(index * 2, hip, knee);
      setSegmentInstance(index * 2 + 1, knee, foot);
      setJointInstance(index * 2, hip, 0.92);
      setJointInstance(index * 2 + 1, knee, 1.05);

      footDummy.position.copy(foot);
      footDummy.position.y += 0.016;
      footDummy.rotation.set(0, heading, 0);
      footDummy.scale.set(1, 1, 1);
      footDummy.updateMatrix();
      feet.setMatrixAt(index, footDummy.matrix);

      legPose[index].phase = fract(phase / TAU);
      legPose[index].foot.copy(foot);
      legPose[index].knee.copy(knee);
    });

    legSegments.instanceMatrix.needsUpdate = true;
    legJoints.instanceMatrix.needsUpdate = true;
    feet.instanceMatrix.needsUpdate = true;
  }

  function getPose() {
    return {
      time: lastTime,
      agentPosition: {
        x: robot.position.x,
        y: robot.position.y + content.position.y,
        z: robot.position.z,
      },
      heading: lastHeading,
      gaitPhase: lastGaitPhase,
      legSamples: legPose.map((sample) => ({
        name: sample.name,
        phase: sample.phase,
        footTip: { x: sample.foot.x, y: sample.foot.y + content.position.y, z: sample.foot.z },
        knee: { x: sample.knee.x, y: sample.knee.y + content.position.y, z: sample.knee.z },
      })),
    };
  }

  setShadowFlags(group);
  update(0, 0);
  return { group, update, getPose };
}
