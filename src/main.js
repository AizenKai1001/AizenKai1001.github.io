import { createThemeController } from './theme.js';
import { createMotionController } from './motion.js';
import { createJourney } from './journey.js';
import { createExplorer } from './explorer.js';
import { createObservatory } from './observatory.js';

// All research content is static HTML. These modules progressively enhance it.
document.documentElement.classList.add('js');
const theme = createThemeController();
const motion = createMotionController();
const explorer = createExplorer(motion);
const observatory = createObservatory(motion);
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu(returnFocus = false) {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
  if (returnFocus) menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('is-open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav?.classList.contains('is-open')) closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 821px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  for (const card of cards) card.hidden = category !== 'all' && card.dataset.category !== category;
  const visible = cards.filter(card => !card.hidden);
  const counter = document.querySelector('.experiment-count');
  if (counter) counter.textContent = `${String(visible.length).padStart(2, '0')} ${visible.length === 1 ? 'SELECTED STUDY' : 'SELECTED STUDIES'}`;
  motion.revealFiltered(visible);
}));

// Read-only diagnostics for the local preview checks; no network access.
window.__researchMotion = { getStats: motion.getStats };
const stage = document.querySelector('#research-scene');
let scene;
let journey;
if (stage) {
  const pauseButton = document.querySelector('#scene-pause');
  const resetButton = document.querySelector('#scene-reset');
  const playButton = document.querySelector('#scene-play');
  const playbackState = document.querySelector('#scene-motion-state');
  const modeButtons = [...document.querySelectorAll('[data-scene-mode]')];
  const captions = { intelligence: '01 / SIGNAL & STRUCTURE', worlds: '02 / THE EMBODIED EXPLORER', systems: '03 / INSIDE THE PROCESSOR' };
  const labels = { intelligence: 'branching neuron with traveling signals', worlds: 'articulated inspection robot in a miniature landscape', systems: 'layered processor assembly with circuit boards and cooling components' };
  let mode = 'intelligence';
  let available = false;

  function syncPause() {
    const paused = motion.isPaused();
    pauseButton.disabled = !available;
    pauseButton.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Resume animations' : 'Pause animations';
    pauseButton.setAttribute('aria-label', label);
    pauseButton.setAttribute('title', label);
    pauseButton.innerHTML = `<span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span><span class="playback-label">${paused ? 'Play' : 'Pause'}</span>`;
    playButton.hidden = !available || !paused;
    playButton.disabled = !available;
    playbackState.textContent = !available ? 'Static illustration' : motion.isReduced() ? 'Your device prefers reduced motion' : paused ? 'Animation paused' : 'Animation playing';
    playbackState.dataset.playing = String(available && !paused);
    scene?.setReducedMotion?.(motion.isReduced());
    scene?.setPaused(paused);
  }
  function sceneState(state) {
    if (state.status !== 'ready' && state.status !== 'fallback') return;
    available = state.status === 'ready';
    stage.classList.toggle('is-ready', available);
    document.querySelector('#scene-hint').textContent = available ? 'Drag to orbit ↔' : 'Static study';
    document.querySelector('#scene-status').textContent = available ? 'Interactive study ready. Choose Learning, Simulation, or Systems below.' : 'The interactive study is unavailable. The static illustration and all research content remain available.';
    for (const control of [...modeButtons, pauseButton, resetButton]) control.disabled = !available;
    pauseButton.disabled = !available;
    playButton.hidden = !available || !motion.isPaused();
    playbackState.textContent = !available ? 'Static illustration' : motion.isReduced() ? 'Your device prefers reduced motion' : motion.isPaused() ? 'Animation paused' : 'Animation playing';
    playbackState.dataset.playing = String(available && !motion.isPaused());
  }
  for (const control of [...modeButtons, pauseButton, resetButton]) control.disabled = true;
  syncPause();
  motion.subscribe(syncPause);
  theme.subscribe(value => scene?.setTheme?.(value));
  pauseButton.addEventListener('click', () => motion.setPaused(!motion.isPaused()));
  playButton.addEventListener('click', () => motion.setPaused(false));
  resetButton.setAttribute('title', 'Reset scene view');
  resetButton.addEventListener('click', () => scene?.reset());
  function selectMode(nextMode, { fromScroll = false } = {}) {
    if (!captions[nextMode]) return;
    if (!fromScroll) journey?.manualSelection();
    const changed = mode !== nextMode;
    mode = nextMode;
    if (changed) scene?.setMode(mode);
    modeButtons.forEach(other => other.setAttribute('aria-pressed', String(other.dataset.sceneMode === mode)));
    const caption = document.querySelector('#scene-caption');
    caption.textContent = captions[mode];
    motion.animate(caption, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360 });
    stage.setAttribute('aria-label', `Interactive sculpture of a ${labels[mode]}; an artistic study, not live experiment data. Use the controls below to change the study or pause motion.`);
    if (!fromScroll) document.querySelector('#scene-status').textContent = `${captions[mode].slice(5)} study selected.`;
  }
  modeButtons.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.sceneMode)));

  requestAnimationFrame(() => {
    import('./scene.js').then(async ({ createScene }) => {
      scene = await createScene(stage, { theme: theme.getTheme(), reducedMotion: motion.isReduced(), onState: sceneState });
      if (!scene) return sceneState({ status: 'fallback' });
      scene.setTheme?.(theme.getTheme());
      // Do not reset the initial assembly when the selected mode is unchanged.
      if (scene.getStats().mode !== mode) scene.setMode(mode);
      syncPause();
      window.__researchScene = { getStats: () => scene.getStats(), isAvailable: () => available };
      journey = createJourney(document.querySelector('.kinetic-hero'), { scene, motion, selectMode });
    }).catch(() => sceneState({ status: 'fallback' }));
  });
}

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  scene?.dispose();
  journey?.dispose();
  explorer.dispose();
  observatory.dispose();
  motion.dispose();
  theme.dispose();
});
