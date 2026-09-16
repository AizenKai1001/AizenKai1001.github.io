import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLearningModel } from './models/learning.js';
import { createSimulationModel } from './models/simulation.js';
import { createSystemsModel } from './models/systems.js';

const MODES = ['intelligence', 'worlds', 'systems'];
const PALETTES = {
  light: { ivory: 0xece7d8, stone: 0xbcb4a3, pine: 0x244c40, sage: 0x78937a,
    graphite: 0x263130, copper: 0xbc643c, brass: 0xa48550, silver: 0xabb9b6,
    etched: 0x698074, signal: 0xffb06a, glass: 0xb8d5bf, rubber: 0x1d2823, chip: 0x172e28 },
  dark: { ivory: 0xe2dece, stone: 0x909c8b, pine: 0x345b4b, sage: 0x95b098,
    graphite: 0x334641, copper: 0xd38c59, brass: 0xb99c64, silver: 0xbdcac1,
    etched: 0x95b6a3, signal: 0xffc18e, glass: 0xa4cbb9, rubber: 0x17251e, chip: 0x1b352c },
};
const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
const themeName = name => name === 'dark' ? 'dark' : 'light';

function releaseObjects(root, extras = []) {
  const geometries = new Set();
  const materials = new Set(extras);
  const textures = new Set();
  root?.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    material.dispose();
  }
  geometries.forEach(g => g.dispose());
  textures.forEach(t => t.dispose());
}

function fallback(container, notify, initialTheme, reason) {
  let theme = themeName(initialTheme);
  let mode = MODES[0];
  container?.setAttribute?.('data-scene-state', 'fallback');
  notify({ status: 'fallback', reason, theme, mode });
  return {
    setMode(value) { if (MODES.includes(value)) mode = value; return false; },
    setTheme(value) { theme = themeName(value); return theme; },
    setPaused() {}, setReducedMotion() {}, setScrollProgress() {}, reset() {}, dispose() {},
    getStats: () => ({ status: 'fallback', reason, theme, mode, paused: true, reducedMotion: true, transitioning: false, animationTime: 0, renders: 0 }),
  };
}

// One render lifecycle serves three original, separately authored models.
export function createScene(container, { theme = 'light', reducedMotion = null, onState = () => {} } = {}) {
  const notify = state => { try { onState(state); } catch { /* UI failures cannot kill rendering. */ } };
  if (!container?.appendChild || typeof window === 'undefined') return fallback(container, notify, theme, 'invalid-container');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch { return fallback(container, notify, theme, 'webgl-unavailable'); }

  const scene = new THREE.Scene();
  const disposers = [];
  const materials = {};
  let environmentTarget;
  let controls;
  let disposed = false;
  let failed = false;
  let lost = false;
  let frameId = 0;
  let intersects = true;
  let visible = !document.hidden;
  let explicitPaused = false;
  let currentTheme = themeName(theme);
  let hostReduced = typeof reducedMotion === 'boolean' ? reducedMotion : null;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const effectiveReduced = () => hostReduced ?? preference.matches;
  const canAnimate = () => !disposed && !failed && !lost && !explicitPaused && !effectiveReduced() && intersects && visible;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;user-select:none';
  container.appendChild(canvas);

  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    disposers.push(() => target.removeEventListener(event, handler, options));
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frameId);
    disposers.forEach(fn => fn());
    controls?.dispose();
    releaseObjects(scene, Object.values(materials));
    environmentTarget?.dispose();
    renderer.dispose();
    canvas.remove();
  }

  try {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 45);
    controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minPolarAngle = 0.48;
    controls.maxPolarAngle = 1.52;
    canvas.style.touchAction = 'pan-y'; // OrbitControls.connect sets this to none.

    const palette = PALETTES[currentTheme];
    for (const [name, color] of Object.entries(palette)) {
      const metal = ['copper', 'brass', 'silver'].includes(name);
      materials[name] = new THREE.MeshPhysicalMaterial({
        color, roughness: metal ? 0.32 : name === 'chip' ? 0.44 : 0.6,
        metalness: metal ? 0.82 : name === 'graphite' ? 0.32 : 0.08,
        clearcoat: ['ivory', 'pine', 'sage', 'chip'].includes(name) ? 0.3 : 0.1,
        clearcoatRoughness: 0.35,
      });
    }
    materials.signal.emissive.setHex(palette.signal);
    materials.signal.emissiveIntensity = 0.55;
    materials.signal.roughness = 0.24;
    materials.glass.transmission = 0.7;
    materials.glass.thickness = 0.2;
    materials.glass.roughness = 0.18;
    materials.glass.metalness = 0;
    materials.glass.ior = 1.35;
    materials.rubber.roughness = 0.88;

    function makeEnvironment() {
      const room = new RoomEnvironment();
      const generator = new THREE.PMREMGenerator(renderer);
      try {
        environmentTarget?.dispose();
        environmentTarget = generator.fromScene(room, 0.05);
        scene.environment = environmentTarget.texture;
      } finally { generator.dispose(); releaseObjects(room); }
    }
    makeEnvironment();
    const hemi = new THREE.HemisphereLight(0xf7f3e6, 0x29392f, 1.35);
    const key = new THREE.DirectionalLight(0xffebd9, 3);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.1, far: 18 });
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.018;
    const rim = new THREE.DirectionalLight(0xc2e8d8, 1.6);
    rim.position.set(-4, 3, -4);
    const front = new THREE.DirectionalLight(0xffe4ce, 0.5);
    front.position.set(-4, 1, 5);
    scene.add(hemi, key, rim, front);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ opacity: 0.17 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.13;
    shadow.receiveShadow = true;
    scene.add(shadow);
    const collection = new THREE.Group();
    scene.add(collection);
    const mobile = container.clientWidth <= 520;
    const models = {};
    const mounts = {};
    for (const [name, factory] of Object.entries({ intelligence: createLearningModel, worlds: createSimulationModel, systems: createSystemsModel })) {
      const model = factory(materials, { mobile });
      models[name] = model;
      const mount = new THREE.Group();
      mount.name = `study-${name}`;
      mount.visible = name === 'intelligence';
      mount.add(model.group);
      collection.add(mount);
      mounts[name] = mount;
      model.update(0, 0);
    }

    let mode = 'intelligence';
    let animationTime = 0;
    let lastTime = 0;
    let averageMs = 0;
    let renderCount = 0;
    let scrollProgress = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let transitioning = false;
    let previous = null;
    let transitionTime = 0;
    let opening = true;
    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const state = () => ({ status: failed || lost ? 'fallback' : 'ready', mode, theme: currentTheme, reducedMotion: effectiveReduced(), transitioning });

    function render() {
      if (disposed || failed || lost || !visible) return;
      try { renderer.render(scene, camera); renderCount++; }
      catch { failed = true; cancelAnimationFrame(frameId); canvas.style.visibility = 'hidden'; container.dataset.sceneState = 'fallback'; notify({ ...state(), reason: 'render-error' }); }
    }
    function scrollPose() {
      const amount = width <= 520 ? 0.5 : 1;
      collection.rotation.y = (scrollProgress * 0.75 - 0.08) * amount;
      collection.position.x = (scrollProgress - 0.4) * 0.25 * amount;
    }
    function settle() {
      opening = false;
      transitioning = false;
      previous = null;
      for (const [name, mount] of Object.entries(mounts)) {
        mount.visible = name === mode;
        mount.position.set(0, 0, 0);
        mount.rotation.set(0, 0, 0);
        mount.scale.setScalar(1);
      }
    }
    function animate(time, delta) {
      models[mode].update(time, delta);
      if (transitioning) {
        const p = clamp((time - transitionTime) / 0.95);
        const arrive = ease((p - 0.2) / 0.8);
        const depart = ease(p / 0.65);
        const active = mounts[mode];
        active.scale.setScalar(0.64 + arrive * 0.36);
        active.position.y = -(1 - arrive) * 0.48;
        active.rotation.y = (1 - arrive) * -0.5;
        if (previous) {
          models[previous].update(time, delta);
          const old = mounts[previous];
          old.visible = p < 0.65;
          old.scale.setScalar(1 - depart * 0.56);
          old.position.y = -depart * 0.5;
          old.rotation.y = depart * 0.4;
        }
        if (p >= 1) settle();
      } else if (opening) {
        const p = ease(time / 1.35);
        mounts[mode].scale.setScalar(0.85 + p * 0.15);
        mounts[mode].position.y = -(1 - p) * 0.3;
        if (p >= 1) settle();
      }
      pointer.lerp(targetPointer, 1 - Math.exp(-delta * 6));
      collection.rotation.x = -pointer.y * 0.026;
      collection.rotation.z = -pointer.x * 0.019;
      scrollPose();
    }
    function tick(now) {
      frameId = 0;
      if (!canAnimate()) return;
      if (lastTime && now - lastTime < 1000 / 60 - 0.6) { frameId = requestAnimationFrame(tick); return; }
      const elapsed = lastTime ? now - lastTime : 0;
      lastTime = now;
      const delta = Math.min(0.1, elapsed / 1000);
      animationTime += delta;
      if (elapsed) averageMs = averageMs ? averageMs * 0.92 + elapsed * 0.08 : elapsed;
      animate(animationTime, delta);
      controls.update();
      render();
      if (canAnimate()) frameId = requestAnimationFrame(tick);
    }
    function schedule() {
      controls.enableDamping = !explicitPaused && !effectiveReduced();
      if (canAnimate()) {
        if (!frameId) { lastTime = 0; frameId = requestAnimationFrame(tick); }
      } else {
        cancelAnimationFrame(frameId); frameId = 0; lastTime = 0;
        if (intersects && visible) render();
      }
    }
    function reset() {
      camera.position.set(5.1, 3.65, 7.7);
      controls.target.set(0, 0.45, 0);
      controls.update();
      render();
    }
    function resize() {
      const box = container.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(box.width));
      const nextHeight = Math.max(1, Math.round(box.height));
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth; height = nextHeight;
      dpr = Math.min(devicePixelRatio || 1, width <= 520 ? 1.25 : 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      collection.scale.setScalar(Math.min(1, camera.aspect / 0.88));
      scrollPose(); render();
    }
    function applyTheme(value, emit = true) {
      currentTheme = themeName(value);
      const colors = PALETTES[currentTheme];
      for (const [name, material] of Object.entries(materials)) material.color.setHex(colors[name]);
      materials.signal.emissive.setHex(colors.signal);
      const dark = currentTheme === 'dark';
      renderer.toneMappingExposure = dark ? 1.02 : 1.05;
      scene.environmentIntensity = dark ? 0.52 : 0.58;
      hemi.intensity = dark ? 1.05 : 1.3;
      key.intensity = dark ? 3.2 : 3.0;
      rim.intensity = dark ? 2.1 : 1.45;
      shadow.material.opacity = dark ? 0.3 : 0.17;
      render();
      if (emit) notify(state());
      return currentTheme;
    }

    listen(controls, 'change', () => { if (!canAnimate()) render(); });
    listen(canvas, 'pointermove', event => {
      if (event.pointerType === 'touch' || !canAnimate()) return;
      const rect = canvas.getBoundingClientRect();
      targetPointer.set(clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1), clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1));
    }, { passive: true });
    listen(canvas, 'pointerleave', () => targetPointer.set(0, 0));
    listen(document, 'visibilitychange', () => { visible = !document.hidden; schedule(); });
    listen(preference, 'change', () => { if (effectiveReduced()) settle(); schedule(); });
    listen(canvas, 'webglcontextlost', event => {
      event.preventDefault(); lost = true; cancelAnimationFrame(frameId); frameId = 0;
      canvas.style.visibility = 'hidden'; container.dataset.sceneState = 'fallback'; notify({ ...state(), reason: 'context-lost' });
    });
    listen(canvas, 'webglcontextrestored', () => {
      if (disposed) return;
      lost = false; makeEnvironment(); applyTheme(currentTheme, false);
      canvas.style.visibility = 'visible'; container.dataset.sceneState = 'ready';
      render(); schedule(); notify({ ...state(), recovered: true });
    });
    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(entries => { intersects = entries.at(-1)?.isIntersecting ?? false; schedule(); }, { threshold: 0.01 });
      observer.observe(container); disposers.push(() => observer.disconnect());
    }
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(resize);
      observer.observe(container); disposers.push(() => observer.disconnect());
    } else listen(window, 'resize', resize, { passive: true });
    resize(); reset(); applyTheme(currentTheme, false);
    if (effectiveReduced()) settle();
    container.dataset.sceneState = 'ready'; notify(state()); schedule();

    return {
      setMode(value) {
        if (!MODES.includes(value) || disposed || failed || lost) return false;
        if (mode === value) return true;
        const old = mode; settle(); mode = value;
        models[mode].update(animationTime, 0);
        if (explicitPaused || effectiveReduced()) settle();
        else {
          previous = old; transitioning = true; transitionTime = animationTime;
          mounts[old].visible = true; mounts[mode].visible = true;
          mounts[mode].scale.setScalar(0.64); mounts[mode].position.y = -0.48;
        }
        notify(state()); schedule(); return true;
      },
      setPaused(value) {
        const next = Boolean(value);
        if (next === explicitPaused) return next;
        explicitPaused = next;
        if (next && (transitioning || opening)) settle();
        schedule(); return next;
      },
      setReducedMotion(value) {
        const next = typeof value === 'boolean' ? value : null;
        if (next === hostReduced) return effectiveReduced();
        hostReduced = next;
        if (effectiveReduced()) settle();
        schedule(); notify(state()); return effectiveReduced();
      },
      setScrollProgress(value) {
        const next = clamp(Number(value) || 0);
        if (next === scrollProgress) return next;
        scrollProgress = next; scrollPose();
        if (!canAnimate()) render();
        return next;
      },
      setTheme(value) { return themeName(value) === currentTheme ? currentTheme : applyTheme(value); },
      reset, dispose,
      getStats: () => ({ ...state(), explicitPaused, paused: !canAnimate(), visible: intersects && visible,
        contextLost: lost, animationTime: Number(animationTime.toFixed(3)), scrollProgress,
        renders: renderCount, fps: averageMs ? Math.round(1000 / averageMs) : null,
        dpr, size: { width, height }, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
        model: models[mode].group.name, ...models[mode].getPose(),
      }),
    };
  } catch (error) {
    dispose();
    console.warn('Research collection initialization failed:', error);
    return fallback(container, notify, theme, 'initialization-error');
  }
}
