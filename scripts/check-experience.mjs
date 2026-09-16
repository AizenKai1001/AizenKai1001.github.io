import { chromium } from '../node_modules/playwright/index.mjs';
import axeCore from '../node_modules/axe-core/axe.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const BASE_ORIGIN = new URL(BASE_URL).origin;
const RESULTS_DIR_URL = new URL('../test-results/', import.meta.url);
const RESULTS_DIR = fileURLToPath(RESULTS_DIR_URL);
const REPORT_PATH = fileURLToPath(new URL('experience-report.json', RESULTS_DIR_URL));

const EXPERIMENT_PATHS = [
  '/experiments/distinction/',
  '/experiments/doomfly/',
  '/experiments/forgelab/',
  '/experiments/plasticity/',
  '/experiments/evoforge/',
  '/experiments/forgegrad/',
];

const NOTE_PATHS = [
  '/notes/learning-through-counterexamples/',
  '/notes/when-the-benchmark-lies/',
  '/notes/negative-results/',
];

const DETAIL_PATHS = [...EXPERIMENT_PATHS, ...NOTE_PATHS];
const AXE_PATHS = ['/', ...DETAIL_PATHS];
const STORAGE_KEY = 'research-theme';
const MOTION_KEY = 'research-motion';
const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  mobile390: { width: 390, height: 844 },
  mobile320: { width: 320, height: 844 },
};

const report = { startedAt: new Date().toISOString(), baseURL: BASE_URL, browser: 'chrome', checks: [], axe: [] };
let browser;
let failureCount = 0;

function serializeError(error) {
  if (!error) return { message: 'Unknown failure' };
  return { name: error.name, message: error.message, stack: error.stack };
}

function expect(condition, message, details) {
  if (condition) return;
  const error = new Error(message);
  if (details !== undefined) error.details = details;
  throw error;
}

async function check(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({ name, status: 'pass', durationMs: Date.now() - started, details });
    console.log(`PASS ${name}`);
  } catch (error) {
    failureCount += 1;
    const entry = { name, status: 'fail', durationMs: Date.now() - started, error: serializeError(error) };
    if (error?.details !== undefined) entry.details = error.details;
    report.checks.push(entry);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function attachRuntimeErrors(page, bucket) {
  page.on('pageerror', error => bucket.push({ type: 'pageerror', message: error.message }));
}

async function installLocalOnlyRouting(context) {
  await context.route('**/*', async route => {
    let parsed;
    try { parsed = new URL(route.request().url()); } catch { return route.continue(); }
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin !== BASE_ORIGIN) {
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
}

async function createContext(options = {}) {
  const context = await browser.newContext(options);
  await installLocalOnlyRouting(context);
  return context;
}

async function gotoLocal(page, pathname = '/') {
  const response = await page.goto(`${BASE_URL}${pathname}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
  expect(response, `No navigation response for ${pathname}`);
  expect(response.ok(), `Local page returned HTTP ${response.status()} for ${pathname}`);
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
}

async function expectVisible(locator, label) {
  expect(await locator.count() > 0, `${label} is missing`);
  expect(await locator.first().isVisible(), `${label} is not visible`);
}

async function readThemeState(page, readStorage = true) {
  return page.evaluate(({ storageKey, readStorageValue }) => {
    const button = document.querySelector('.theme-toggle');
    let storedTheme = null;
    let storageReadable = true;
    if (readStorageValue) {
      try { storedTheme = window.localStorage.getItem(storageKey); } catch { storageReadable = false; }
    }
    return {
      theme: document.documentElement.dataset.theme || null,
      storedTheme,
      storageReadable,
      button: button ? {
        ariaLabel: button.getAttribute('aria-label'),
        title: button.getAttribute('title'),
        ariaPressed: button.getAttribute('aria-pressed'),
        visible: Boolean(button.getClientRects().length),
      } : null,
      sceneTheme: window.__researchScene?.getStats?.().theme ?? null,
    };
  }, { storageKey: STORAGE_KEY, readStorageValue: readStorage });
}

async function assertThemeUI(page, expectedTheme, options = {}) {
  const { expectedStoredTheme, requireSceneTheme = false, readStorage = true } = options;
  await expectVisible(page.locator('.theme-toggle'), 'Theme toggle');
  const expectedLabel = `Switch to ${expectedTheme === 'dark' ? 'light' : 'dark'} mode`;
  const state = await readThemeState(page, readStorage);
  expect(state.theme === expectedTheme, `Expected html[data-theme]=${expectedTheme}`, state);
  expect(state.button?.ariaLabel === expectedLabel, `Expected aria-label ${expectedLabel}`, state);
  expect(state.button?.title === expectedLabel, `Expected title ${expectedLabel}`, state);
  expect(state.button?.ariaPressed === String(expectedTheme === 'dark'), 'aria-pressed does not match theme', state);
  if (expectedStoredTheme !== undefined) {
    expect(state.storageReadable, 'Theme storage unexpectedly unreadable', state);
    expect(state.storedTheme === expectedStoredTheme, `Expected stored theme ${expectedStoredTheme}`, state);
  }
  if (requireSceneTheme) expect(state.sceneTheme === expectedTheme, `Scene theme should be ${expectedTheme}`, state);
  return state;
}

async function waitForTheme(page, theme, scene = false) {
  await page.waitForFunction(({ expected, checkScene }) => {
    if (document.documentElement.dataset.theme !== expected) return false;
    return !checkScene || window.__researchScene?.getStats?.().theme === expected;
  }, { expected: theme, checkScene: scene }, { timeout: 5_000 });
}

async function waitForSceneReady(page) {
  await page.waitForFunction(() => window.__researchScene?.isAvailable?.() === true && window.__researchScene.getStats?.().status === 'ready', null, { timeout: 12_000 });
}

async function readMotionState(page) {
  return page.evaluate(motionKey => {
    let stored = null;
    try { stored = window.localStorage.getItem(motionKey); } catch { /* optional storage */ }
    const button = document.querySelector('.motion-toggle');
    return {
      dataMotion: document.documentElement.dataset.motion || null,
      stored,
      stats: window.__researchMotion?.getStats?.() ?? null,
      scenePaused: window.__researchScene?.getStats?.().paused ?? null,
      button: button ? {
        visible: Boolean(button.getClientRects().length),
        disabled: button.disabled,
        ariaPressed: button.getAttribute('aria-pressed'),
        ariaLabel: button.getAttribute('aria-label'),
      } : null,
    };
  }, MOTION_KEY);
}

async function assertReadable(page, label, expectExperiments = false) {
  const h1 = page.locator('h1');
  await expectVisible(h1, `${label} h1`);
  expect((await h1.innerText()).trim().length > 0, `${label} h1 is empty`);
  await expectVisible(page.locator('main'), `${label} main content`);
  if (expectExperiments) expect(await page.locator('[data-category]').count() === 6, `${label} experiment list is incomplete`);
}

async function runAxe(page, label) {
  await page.addScriptTag({ content: axeCore.source });
  const violations = await page.evaluate(async () => {
    const result = await window.axe.run(document, { resultTypes: ['violations'] });
    return result.violations.map(v => ({
      id: v.id, impact: v.impact, help: v.help, description: v.description,
      nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })),
    }));
  });
  const meaningful = violations.filter(v => ['moderate', 'serious', 'critical'].includes(v.impact));
  report.axe.push({ label, totalViolations: violations.length, meaningful, violations });
  expect(meaningful.length === 0, `${label} has moderate/serious/critical axe violations`, { meaningful });
  return { totalViolations: violations.length, meaningfulCount: meaningful.length };
}

async function testThemeViewport(name, viewport) {
  const context = await createContext({ viewport, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await assertThemeUI(page, 'light', { expectedStoredTheme: null });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'dark');
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark' });
    expect(errors.length === 0, `${name} theme toggle caused uncaught errors`, errors);
    return { viewport };
  } finally { await context.close(); }
}

async function testPersistenceAndScene() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    await assertThemeUI(page, 'light', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'dark', true);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark', requireSceneTheme: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
    await waitForSceneReady(page);
    await waitForTheme(page, 'dark', true);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark', requireSceneTheme: true });
    await gotoLocal(page, '/experiments/distinction/');
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark' });
    await assertReadable(page, 'dark experiment article');
    await gotoLocal(page, '/notes/negative-results/');
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark' });
    await assertReadable(page, 'dark note article');
    expect(errors.length === 0, 'Persistence/article navigation produced uncaught errors', errors);
  } finally { await context.close(); }
}

async function testSystemThemeDefaultsAndLiveChanges() {
  const darkContext = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark' });
  const darkPage = await darkContext.newPage();
  try {
    await gotoLocal(darkPage, '/');
    await assertThemeUI(darkPage, 'dark', { expectedStoredTheme: null });
  } finally { await darkContext.close(); }

  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'light' });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    await assertThemeUI(page, 'light', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.emulateMedia({ colorScheme: 'dark' });
    await waitForTheme(page, 'dark', true);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.emulateMedia({ colorScheme: 'light' });
    await waitForTheme(page, 'light', true);
    await assertThemeUI(page, 'light', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'dark', true);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark', requireSceneTheme: true });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(100);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: 'dark', requireSceneTheme: true });
    expect(errors.length === 0, 'Live color-scheme handling produced uncaught errors', errors);
  } finally { await context.close(); }
}

async function testUnavailableLocalStorage() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark' });
  await context.addInitScript(() => {
    const fail = () => { throw new DOMException('Storage blocked for regression test', 'SecurityError'); };
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, get: fail });
    } catch {
      Storage.prototype.getItem = fail;
      Storage.prototype.setItem = fail;
      Storage.prototype.removeItem = fail;
    }
  });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await assertThemeUI(page, 'dark', { readStorage: false });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'light');
    await assertThemeUI(page, 'light', { readStorage: false });
    expect(errors.length === 0, 'Blocked localStorage caused uncaught errors', errors);
  } finally { await context.close(); }
}

async function testReducedMotionWithTheme() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    const initial = await page.evaluate(() => window.__researchScene.getStats());
    expect(initial.reducedMotion === true, 'Scene did not observe reduced motion', initial);
    expect(!(await page.locator('#scene-pause').isDisabled()), 'Pause/Play control should stay enabled under reduced motion so the user can opt in');
    const reducedMotionState = await readMotionState(page);
    expect(reducedMotionState.dataMotion === 'reduced', 'Root motion state should be reduced under OS reduced motion', reducedMotionState);
    expect(reducedMotionState.stats?.reducedMotion === true, 'Global motion stats did not report reduced motion', reducedMotionState);
    expect(reducedMotionState.button?.disabled === false, 'Footer motion toggle should stay enabled under OS reduced motion so the user can opt in', reducedMotionState);
    await assertThemeUI(page, 'dark', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.waitForTimeout(120);
    const renderStart = (await page.evaluate(() => window.__researchScene.getStats())).renders;
    await page.waitForTimeout(320);
    const renderEnd = (await page.evaluate(() => window.__researchScene.getStats())).renders;
    expect(renderEnd === renderStart, 'Reduced-motion scene continued rendering', { renderStart, renderEnd });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'light', true);
    await assertThemeUI(page, 'light', { expectedStoredTheme: 'light', requireSceneTheme: true });
    expect(errors.length === 0, 'Reduced-motion theme switch caused uncaught errors', errors);
  } finally { await context.close(); }
}

async function testPagePauseAndNewVisitAutoplay() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    const initial = await readMotionState(page);
    expect(initial.dataMotion === 'full', 'Motion should start full with no stored explicit pause', initial);
    expect(initial.stored === null, 'Motion preference should start unstored', initial);
    expect(initial.stats?.paused === false, 'Global motion should start unpaused', initial);
    expect(initial.button?.visible === true && initial.button.disabled === false, 'Footer motion toggle should be usable', initial);
    expect(initial.button?.ariaPressed === 'false', 'Footer motion toggle should start unpressed', initial);
    expect(initial.button?.ariaLabel === 'Pause page animations', 'Footer motion toggle has the wrong initial label', initial);

    await page.locator('.motion-toggle').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'paused' && window.__researchMotion?.getStats?.().paused === true);
    const paused = await readMotionState(page);
    expect(paused.stored === null, 'Current-page pause should not prevent future autoplay', paused);
    expect(paused.button?.ariaPressed === 'true', 'Footer motion toggle did not become pressed', paused);
    expect(paused.button?.ariaLabel === 'Resume page animations', 'Footer motion toggle has the wrong paused label', paused);
    expect(paused.scenePaused === true, 'Global motion pause did not pause the 3D scene', paused);

    await gotoLocal(page, '/experiments/evoforge/');
    const article = await readMotionState(page);
    expect(article.dataMotion === 'full', 'New article visit did not restore autoplay', article);
    expect(article.stored === null, 'Pause should remain local to the previous page', article);
    expect(article.stats?.paused === false, 'New page retained old paused state', article);
    expect(article.button?.ariaPressed === 'false', 'New page control does not reflect autoplay', article);
    await assertReadable(page, 'autoplay article');
    expect(errors.length === 0, 'Explicit motion pause/navigation caused uncaught errors', errors);
    return { initial, paused, article };
  } finally { await context.close(); }
}

async function testNoJavaScriptReading() {
  const context = await createContext({ viewport: VIEWPORTS.mobile390, colorScheme: 'dark', javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/');
    await assertReadable(page, 'no-JS dark home', true);
    const navLinks = page.locator('#site-nav a');
    expect(await navLinks.count() >= 4, 'No-JS navigation is incomplete');
    for (let i = 0; i < await navLinks.count(); i += 1) expect(await navLinks.nth(i).isVisible(), `No-JS nav link ${i + 1} is hidden`);
    await gotoLocal(page, '/experiments/plasticity/');
    await assertReadable(page, 'no-JS experiment article');
  } finally { await context.close(); }
}

async function testWebGLFallbackReadingAndTheme() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark' });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(type, ...args) {
      if (typeof type === 'string' && type.toLowerCase().startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  const errors = [];
  attachRuntimeErrors(page, errors);
  try {
    await gotoLocal(page, '/');
    await page.waitForFunction(() => window.__researchScene?.isAvailable?.() === false && document.querySelector('#research-scene')?.dataset.sceneState === 'fallback', null, { timeout: 12_000 });
    await assertReadable(page, 'WebGL fallback home', true);
    await expectVisible(page.locator('.scene-poster'), 'WebGL fallback poster');
    await assertThemeUI(page, 'dark', { expectedStoredTheme: null, requireSceneTheme: true });
    await page.locator('.theme-toggle').click();
    await waitForTheme(page, 'light', true);
    await assertThemeUI(page, 'light', { expectedStoredTheme: 'light', requireSceneTheme: true });
    expect(errors.length === 0, 'Fallback/theme path produced uncaught errors', errors);
  } finally { await context.close(); }
}

async function testDarkModeAxe() {
  const context = await createContext({ viewport: VIEWPORTS.desktop, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    const results = [];
    for (const pathname of AXE_PATHS) {
      await gotoLocal(page, pathname);
      await assertThemeUI(page, 'dark', { expectedStoredTheme: null });
      await assertReadable(page, `dark axe ${pathname}`, pathname === '/');
      results.push({ pathname, ...(await runAxe(page, `dark ${pathname}`)) });
    }
    return results;
  } finally { await context.close(); }
}

async function main() {
  await mkdir(RESULTS_DIR, { recursive: true });
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader'] });
    await check('desktop light/dark toggle contract', () => testThemeViewport('desktop', VIEWPORTS.desktop));
    await check('mobile 390 light/dark toggle contract', () => testThemeViewport('mobile390', VIEWPORTS.mobile390));
    await check('mobile 320 light/dark toggle contract', () => testThemeViewport('mobile320', VIEWPORTS.mobile320));
    await check('theme persists across reload and article navigation; scene stays in sync', testPersistenceAndScene);
    await check('system theme initializes and updates live until the user stores a preference', testSystemThemeDefaultsAndLiveChanges);
    await check('blocked localStorage does not break theme initialization or toggling', testUnavailableLocalStorage);
    await check('reduced motion remains static while theme switching and scene theme sync work', testReducedMotionWithTheme);
    await check('Pause stops the current page; a new article visit restores autoplay', testPagePauseAndNewVisitAutoplay);
    await check('no-JS dark reading remains usable on home and an experiment article', testNoJavaScriptReading);
    await check('forced WebGL fallback keeps content readable and theme state synchronized', testWebGLFallbackReadingAndTheme);
    await check('dark-mode axe scan: home + six experiments + three notes', testDarkModeAxe);
  } catch (error) {
    failureCount += 1;
    report.checks.push({ name: 'runner', status: 'fail', error: serializeError(error) });
    console.error(`FAIL runner: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    report.finishedAt = new Date().toISOString();
    report.failures = report.checks.filter(item => item.status === 'fail').length;
    report.passes = report.checks.filter(item => item.status === 'pass').length;
    report.axeTotalViolations = report.axe.reduce((total, item) => total + item.totalViolations, 0);
    report.axeMeaningfulViolations = report.axe.reduce((total, item) => total + item.meaningful.length, 0);
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (failureCount > 0) {
    console.error(`\n${failureCount} experience check(s) failed. See test-results/experience-report.json.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll experience checks passed. Axe total violations: ${report.axeTotalViolations}. Report: test-results/experience-report.json`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
