import { chromium } from '../node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4174').replace(/\/+$/, '');
const BASE_ORIGIN = new URL(BASE_URL).origin;
const RESULTS_DIR_URL = new URL('../test-results/', import.meta.url);
const RESULTS_DIR = fileURLToPath(RESULTS_DIR_URL);
const REPORT_PATH = fileURLToPath(new URL('visible-motion-report.json', RESULTS_DIR_URL));
const EVIDENCE_DIR_URL = new URL('../test-results/visible-motion/', import.meta.url);
const EVIDENCE_DIR = fileURLToPath(EVIDENCE_DIR_URL);

const DESKTOP = { width: 1440, height: 1000 };
const MOBILE_VIEWPORTS = [
  { label: 'mobile390', width: 390, height: 844 },
  { label: 'mobile320', width: 320, height: 844 },
];

// Pixel acceptance is intentionally much looser than the measured current scene
// (~10.5% changed pixels over 2.2 s). The gate catches visually frozen output
// without requiring a specific animation design or frame rate.
const PIXEL_THRESHOLD = 10;
const MIN_MOVING_FRACTION = 0.02;
const MAX_PAUSED_FRACTION = 0.001;
const MOTION_SAMPLE_MS = 2_000;
const PAUSED_SAMPLE_MS = 1_600;

const report = {
  startedAt: new Date().toISOString(),
  baseURL: BASE_URL,
  browser: 'chrome',
  pixelThreshold: PIXEL_THRESHOLD,
  checks: [],
};

let browser;
let failureCount = 0;

function expect(condition, message, details) {
  if (condition) return;
  const error = new Error(message);
  if (details !== undefined) error.details = details;
  throw error;
}

function serializeError(error) {
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack,
  };
}

async function check(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({ name, status: 'pass', durationMs: Date.now() - started, details });
    console.log(`PASS ${name}`);
  } catch (error) {
    failureCount += 1;
    const entry = {
      name,
      status: 'fail',
      durationMs: Date.now() - started,
      error: serializeError(error),
    };
    if (error?.details !== undefined) entry.details = error.details;
    report.checks.push(entry);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function installLocalOnlyRouting(context) {
  await context.route('**/*', async route => {
    let parsed;
    try {
      parsed = new URL(route.request().url());
    } catch {
      return route.continue();
    }
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
  const response = await page.goto(`${BASE_URL}${pathname}`, {
    waitUntil: 'domcontentloaded',
    timeout: 15_000,
  });
  expect(response, `No navigation response for ${pathname}`);
  expect(response.ok(), `HTTP ${response.status()} for ${pathname}`);
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
}

async function waitForSceneReady(page) {
  await page.waitForFunction(() => (
    window.__researchScene?.isAvailable?.() === true
    && window.__researchScene?.getStats?.().status === 'ready'
  ), null, { timeout: 12_000 });
  await page.locator('#research-scene').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function waitForSceneSettled(page) {
  await page.waitForFunction(() => window.__researchScene?.getStats?.().transitioning === false, null, { timeout: 5_000 });
  await page.waitForTimeout(180);
}

async function sceneStats(page) {
  return page.evaluate(() => window.__researchScene?.getStats?.() ?? null);
}

async function motionStats(page) {
  return page.evaluate(() => window.__researchMotion?.getStats?.() ?? null);
}

async function storageValue(page, key) {
  return page.evaluate(storageKey => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return '__blocked__';
    }
  }, key);
}

async function canvasPng(page) {
  const canvas = page.locator('#research-scene canvas');
  expect(await canvas.count() === 1, 'Expected exactly one research-scene canvas');
  expect(await canvas.isVisible(), 'Research-scene canvas is not visible');
  return canvas.screenshot({ type: 'png' });
}

function comparePngBuffers(before, after) {
  const payload = JSON.stringify({
    before: before.toString('base64'),
    after: after.toString('base64'),
    threshold: PIXEL_THRESHOLD,
  });

  const python = String.raw`
import base64, io, json, sys
from PIL import Image

payload = json.load(sys.stdin)
a = Image.open(io.BytesIO(base64.b64decode(payload['before']))).convert('RGBA')
b = Image.open(io.BytesIO(base64.b64decode(payload['after']))).convert('RGBA')
if a.size != b.size:
    raise SystemExit(f'image sizes differ: {a.size} vs {b.size}')

threshold = int(payload['threshold'])
pa = list(a.getdata())
pb = list(b.getdata())
changed = 0
nontransparent = 0
sum_delta = 0
max_sum_delta = 0

for left, right in zip(pa, pb):
    if left[3] or right[3]:
        nontransparent += 1
    deltas = [abs(left[i] - right[i]) for i in range(3)]
    rgb_sum = sum(deltas)
    sum_delta += rgb_sum
    max_sum_delta = max(max_sum_delta, rgb_sum)
    if max(deltas) >= threshold:
        changed += 1

total = len(pa)
print(json.dumps({
    'width': a.size[0],
    'height': a.size[1],
    'pixels': total,
    'nontransparentPixels': nontransparent,
    'changedPixels': changed,
    'changedFraction': changed / total if total else 0,
    'meanRgbAbsDelta': sum_delta / (total * 3) if total else 0,
    'maxRgbSumDelta': max_sum_delta,
}))
`;

  const result = spawnSync('python', ['-c', python], {
    input: payload,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`Pillow PNG comparison failed: ${(result.stderr || result.stdout || '').trim()}`);
  }
  return JSON.parse(result.stdout);
}

async function pixelPair(page, waitMs, evidenceName) {
  // Keep the pointer parked away from the canvas so pointer parallax cannot be
  // mistaken for ambient animation in the before/after pair.
  await page.mouse.move(8, 8);
  await page.waitForTimeout(80);
  const startStats = await sceneStats(page);
  const before = await canvasPng(page);
  await page.waitForTimeout(waitMs);
  const after = await canvasPng(page);
  const endStats = await sceneStats(page);
  if (evidenceName) {
    await Promise.all([
      writeFile(fileURLToPath(new URL(`${evidenceName}-before.png`, EVIDENCE_DIR_URL)), before),
      writeFile(fileURLToPath(new URL(`${evidenceName}-after.png`, EVIDENCE_DIR_URL)), after),
    ]);
  }
  const metrics = comparePngBuffers(before, after);
  expect(
    metrics.nontransparentPixels > metrics.pixels * 0.25,
    'Canvas compositor sample is unexpectedly transparent/empty',
    metrics,
  );
  return {
    ...metrics,
    animationTimeStart: startStats?.animationTime ?? null,
    animationTimeEnd: endStats?.animationTime ?? null,
    animationTimeDelta: (
      typeof startStats?.animationTime === 'number' && typeof endStats?.animationTime === 'number'
        ? endStats.animationTime - startStats.animationTime
        : null
    ),
    evidence: evidenceName ? {
      before: `test-results/visible-motion/${evidenceName}-before.png`,
      after: `test-results/visible-motion/${evidenceName}-after.png`,
    } : null,
  };
}

function assertMoving(metrics, label) {
  expect(
    metrics.changedFraction >= MIN_MOVING_FRACTION,
    `${label} did not visibly change enough (${(metrics.changedFraction * 100).toFixed(3)}%)`,
    metrics,
  );
  expect(
    metrics.animationTimeDelta === null || metrics.animationTimeDelta > 0.5,
    `${label} changed pixels but animationTime did not materially advance`,
    metrics,
  );
}

function assertStable(metrics, label) {
  expect(
    metrics.changedFraction <= MAX_PAUSED_FRACTION,
    `${label} kept visibly changing while expected to be static (${(metrics.changedFraction * 100).toFixed(3)}%)`,
    metrics,
  );
  expect(
    metrics.animationTimeDelta === null || Math.abs(metrics.animationTimeDelta) <= 0.01,
    `${label} froze pixels but animationTime still advanced`,
    metrics,
  );
}

async function ensurePlaying(page) {
  const stats = await motionStats(page);
  if (!stats?.paused) return;
  const play = page.locator('#scene-play');
  expect(await play.count() === 1 && await play.isVisible(), 'Play animations button is not visible while paused', stats);
  await play.click();
  await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === false);
}

async function pauseScene(page) {
  if ((await motionStats(page))?.paused) return;
  await page.locator('#scene-pause').click();
  await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === true);
  await waitForSceneSettled(page);
}

async function testAllModesVisibleMotion() {
  const context = await createContext({ viewport: DESKTOP, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    expect((await motionStats(page))?.paused === false, 'Plain visit failed to autoplay');
    expect((await sceneStats(page))?.paused === false, 'Plain visit produced a paused renderer');
    expect(new URL(page.url()).search === '', 'Autoplay must not need a special query');
    await page.waitForFunction(
      () => (window.__researchScene?.getStats?.().animationTime ?? 0) >= 2,
      null,
      { timeout: 8_000 },
    );

    const results = {};
    for (const mode of ['intelligence', 'worlds', 'systems']) {
      const button = page.locator(`[data-scene-mode="${mode}"]`);
      expect(await button.count() === 1, `Missing scene mode button ${mode}`);
      await button.click();
      await page.waitForFunction(expected => window.__researchScene?.getStats?.().mode === expected, mode);
      await waitForSceneSettled(page);
      const metrics = await pixelPair(page, MOTION_SAMPLE_MS, `mode-${mode}`);
      assertMoving(metrics, `${mode} mode`);
      results[mode] = metrics;
    }

    await pauseScene(page);
    const paused = await pixelPair(page, PAUSED_SAMPLE_MS, 'mode-systems-paused');
    assertStable(paused, 'Explicitly paused scene');
    expect((await page.locator('#scene-pause').innerText()).includes('Play'), '#scene-pause should display Play while paused');
    expect(await page.locator('#scene-play').isVisible(), '#scene-play should be visible while paused');

    return { modes: results, paused };
  } finally {
    await context.close();
  }
}

async function testReducedMotionOptIn() {
  const context = await createContext({ viewport: DESKTOP, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    await waitForSceneSettled(page);

    const initialMotion = await motionStats(page);
    const initialScene = await sceneStats(page);
    expect(initialMotion?.systemReducedMotion === true, 'Browser reduced-motion preference was not observed', initialMotion);
    expect(initialMotion?.paused === true && initialMotion?.reducedMotion === true, 'Reduced-motion default should be paused', initialMotion);
    expect(initialScene?.paused === true && initialScene?.reducedMotion === true, 'Scene did not honor reduced-motion default', initialScene);
    expect(!(await page.locator('#scene-pause').isDisabled()), '#scene-pause must remain enabled so the user can opt in');
    expect(!(await page.locator('.motion-toggle').isDisabled()), 'Footer motion toggle must remain enabled under reduced motion');
    expect(await page.locator('#scene-play').isVisible(), '#scene-play must be visible under reduced-motion default');
    expect((await page.locator('#scene-motion-state').innerText()).toLowerCase().includes('reduced'), 'Reduced-motion status is not visibly explained');

    const staticMetrics = await pixelPair(page, PAUSED_SAMPLE_MS, 'reduced-default-static');
    assertStable(staticMetrics, 'Reduced-motion default scene');

    await page.locator('#scene-play').click();
    await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === false);
    await page.waitForFunction(() => window.__researchScene?.getStats?.().reducedMotion === false);
    expect(await storageValue(page, 'research-motion') === 'playing', 'Explicit Play did not persist playing');
    const playingMetrics = await pixelPair(page, MOTION_SAMPLE_MS, 'reduced-explicit-play');
    assertMoving(playingMetrics, 'Reduced-motion explicit Play');

    await page.locator('#scene-pause').click();
    await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === true);
    await waitForSceneSettled(page);
    const repausedMetrics = await pixelPair(page, PAUSED_SAMPLE_MS, 'reduced-explicit-pause');
    assertStable(repausedMetrics, 'Scene after explicit Pause');

    await page.locator('.motion-reset').click();
    await page.waitForFunction(() => document.documentElement.dataset.motionChoice === 'system');
    await page.waitForFunction(() => window.__researchMotion?.getStats?.().reducedMotion === true);
    expect(await storageValue(page, 'research-motion') === null, 'Use device setting did not clear research-motion');
    expect(await page.locator('#scene-play').isVisible(), 'Play button should return after restoring reduced-motion system default');

    return { staticMetrics, playingMetrics, repausedMetrics };
  } finally {
    await context.close();
  }
}

async function testLegacyPauseAutoplay() {
  const context = await createContext({ viewport: DESKTOP, reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('research-motion', 'paused');
    } catch {
      // The actual site has the same storage fallback; this test requires normal storage.
    }
  });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    await waitForSceneSettled(page);
    const motion = await motionStats(page);
    expect(motion?.paused === false, 'A legacy stored pause prevented autoplay', motion);
    expect(await storageValue(page, 'research-motion') === null, 'Legacy paused value was not retired');
    await page.waitForFunction(() => window.__researchScene.getStats().animationTime >= 2);
    const playingMetrics = await pixelPair(page, MOTION_SAMPLE_MS, 'legacy-pause-autoplay');
    assertMoving(playingMetrics, 'Plain visit with old saved pause');
    await pauseScene(page);
    const staticMetrics = await pixelPair(page, PAUSED_SAMPLE_MS, 'current-page-pause');
    assertStable(staticMetrics, 'Current-page Pause');
    await page.reload({ waitUntil: 'load' });
    await waitForSceneReady(page);
    expect((await sceneStats(page))?.paused === false, 'Reload did not restore autoplay');
    await page.waitForFunction(() => window.__researchScene.getStats().animationTime >= 2);
    const reloadMetrics = await pixelPair(page, MOTION_SAMPLE_MS, 'reload-autoplay');
    assertMoving(reloadMetrics, 'Autoplay after reloading a paused page');
    return { playingMetrics, staticMetrics, reloadMetrics };
  } finally {
    await context.close();
  }
}

async function testMotionQueryOptIn() {
  const context = await createContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/?motion=play');
    await waitForSceneReady(page);
    await waitForSceneSettled(page);
    const url = new URL(page.url());
    expect(url.searchParams.has('motion') === false, '?motion=play remained in the address after opt-in');
    const motion = await motionStats(page);
    const scene = await sceneStats(page);
    expect(motion?.systemReducedMotion === true, 'Query opt-in test lost the OS reduced-motion condition', motion);
    expect(motion?.paused === false && motion?.reducedMotion === false && motion?.choice === 'playing', '?motion=play did not opt in', motion);
    expect(scene?.paused === false && scene?.reducedMotion === false, 'Scene did not honor ?motion=play opt-in', scene);
    expect(await storageValue(page, 'research-motion') === 'playing', '?motion=play did not persist playing');
    const metrics = await pixelPair(page, MOTION_SAMPLE_MS, 'query-play-under-reduce');
    assertMoving(metrics, '?motion=play scene');
    return metrics;
  } finally {
    await context.close();
  }
}

async function wheelTo(page, targetY) {
  await page.mouse.move(120, Math.min(500, DESKTOP.height / 2));
  const current = await page.evaluate(() => window.scrollY);
  const delta = targetY - current;
  if (Math.abs(delta) < 2) return current;
  await page.mouse.wheel(0, delta);
  await page.waitForFunction(target => Math.abs(window.scrollY - target) < 12, targetY, { timeout: 4_000 }).catch(() => {});
  await page.waitForTimeout(140);
  return page.evaluate(() => window.scrollY);
}

async function testNativeScrollJourney() {
  const context = await createContext({ viewport: DESKTOP, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/?motion=play');
    await waitForSceneReady(page);
    await ensurePlaying(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(160);

    const structure = await page.evaluate(() => ({
      hero: Boolean(document.querySelector('.kinetic-hero')),
      track: Boolean(document.querySelector('.kinetic-hero .hero-track')),
      visualPosition: getComputedStyle(document.querySelector('.kinetic-hero .hero-visual')).position,
      chapters: [...document.querySelectorAll('.kinetic-hero [data-journey-mode]')].map(el => ({ id: el.id, mode: el.dataset.journeyMode })),
    }));
    expect(structure.hero && structure.track, 'Kinetic hero/track is missing', structure);
    expect(structure.visualPosition === 'sticky', 'Desktop hero visual is not sticky', structure);
    expect(JSON.stringify(structure.chapters.map(item => item.mode)) === JSON.stringify(['intelligence', 'worlds', 'systems']), 'Journey chapter order is wrong', structure);

    // Manual mode selection should survive idle time until an actual scroll moves the page.
    await page.locator('[data-scene-mode="systems"]').click();
    await page.waitForFunction(() => window.__researchScene?.getStats?.().mode === 'systems');
    await waitForSceneSettled(page);
    await page.waitForTimeout(350);
    expect((await sceneStats(page))?.mode === 'systems', 'Manual systems selection was immediately overridden without scrolling');
    await page.mouse.move(120, 480);
    await page.mouse.wheel(0, 60);
    await page.waitForFunction(() => window.scrollY > 24);
    await page.waitForFunction(() => window.__researchScene?.getStats?.().mode === 'intelligence');

    // Capture a visible viewpoint change while remaining in the first chapter.
    await pauseScene(page);
    const beforeScroll = await canvasPng(page);
    await writeFile(fileURLToPath(new URL('scroll-viewpoint-before.png', EVIDENCE_DIR_URL)), beforeScroll);
    await page.locator('#scene-play').click();
    await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === false);
    const targetWithinFirst = await page.evaluate(() => {
      const simulation = document.querySelector('#study-simulation');
      const absoluteTop = simulation.getBoundingClientRect().top + window.scrollY;
      return Math.max(window.scrollY + 40, absoluteTop - innerHeight * 0.68);
    });
    const yWithinFirst = await wheelTo(page, targetWithinFirst);
    await page.waitForFunction(() => window.__researchScene?.getStats?.().mode === 'intelligence');
    const journeyProgress = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.querySelector('.kinetic-hero')).getPropertyValue('--journey-progress')) || 0);
    expect(journeyProgress > 0.01, 'Native scroll did not advance journey progress', { journeyProgress, yWithinFirst });
    await pauseScene(page);
    const afterScroll = await canvasPng(page);
    await writeFile(fileURLToPath(new URL('scroll-viewpoint-after.png', EVIDENCE_DIR_URL)), afterScroll);
    const viewpointDiff = comparePngBuffers(beforeScroll, afterScroll);
    expect(viewpointDiff.changedFraction >= MIN_MOVING_FRACTION, 'Native scroll did not visibly change the canvas viewpoint', viewpointDiff);

    // Resume, then use native wheel scrolling to cross chapter midpoints.
    await page.locator('#scene-play').click();
    await page.waitForFunction(() => window.__researchMotion?.getStats?.().paused === false);
    const simulationTarget = await page.evaluate(() => {
      const el = document.querySelector('#study-simulation');
      return el.getBoundingClientRect().top + window.scrollY - innerHeight * 0.44;
    });
    const worldsY = await wheelTo(page, simulationTarget);
    await page.waitForFunction(() => window.__researchScene?.getStats?.().mode === 'worlds');
    expect(await page.locator('#study-simulation').evaluate(el => el.classList.contains('is-current')), 'Simulation chapter did not become current');

    const systemsTarget = await page.evaluate(() => {
      const el = document.querySelector('#study-systems');
      return el.getBoundingClientRect().top + window.scrollY - innerHeight * 0.44;
    });
    const systemsY = await wheelTo(page, systemsTarget);
    await page.waitForFunction(() => window.__researchScene?.getStats?.().mode === 'systems');
    expect(await page.locator('#study-systems').evaluate(el => el.classList.contains('is-current')), 'Systems chapter did not become current');
    expect(systemsY > worldsY && worldsY > yWithinFirst, 'Native page scroll did not progress monotonically', { yWithinFirst, worldsY, systemsY });

    return { structure, yWithinFirst, worldsY, systemsY, journeyProgress, viewpointDiff };
  } finally {
    await context.close();
  }
}

async function overflowDiagnostics(page) {
  return page.evaluate(() => ({
    innerWidth: window.innerWidth,
    htmlScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body?.scrollWidth || 0,
    delta: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - window.innerWidth,
    theme: document.documentElement.dataset.theme,
  }));
}

async function testDarkMobileOverflow() {
  const results = [];
  for (const viewport of MOBILE_VIEWPORTS) {
    const context = await createContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    try {
      await gotoLocal(page, '/?motion=play');
      await waitForSceneReady(page);
      const overflow = await overflowDiagnostics(page);
      expect(overflow.theme === 'dark', `${viewport.label} did not initialize in dark mode`, overflow);
      expect(overflow.delta <= 1, `${viewport.label} has horizontal overflow`, overflow);
      const canvasBox = await page.locator('#research-scene canvas').boundingBox();
      expect(canvasBox && canvasBox.width <= viewport.width + 1, `${viewport.label} canvas exceeds the viewport`, { canvasBox, viewport });
      results.push({ viewport, overflow, canvasBox });
    } finally {
      await context.close();
    }
  }
  return results;
}

async function main() {
  await Promise.all([
    mkdir(RESULTS_DIR, { recursive: true }),
    mkdir(EVIDENCE_DIR, { recursive: true }),
  ]);
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--enable-webgl', '--use-angle=swiftshader'],
    });

    await check('plain visits autoplay all three models and Pause freezes visible pixels', testAllModesVisibleMotion);
    await check('OS reduced-motion defaults static; explicit Play animates; Pause/restoring device setting are stable', testReducedMotionOptIn);
    await check('legacy paused storage cannot stop autoplay; current-page pause works and reload autoplays', testLegacyPauseAutoplay);
    await check('?motion=play opts in under OS reduced motion, persists, animates, and removes its query', testMotionQueryOptIn);
    await check('native desktop scroll changes viewpoint, advances sticky journey studies, and releases manual override', testNativeScrollJourney);
    await check('dark mobile layouts at 390px and 320px have no horizontal overflow', testDarkMobileOverflow);
  } catch (error) {
    failureCount += 1;
    report.checks.push({ name: 'runner', status: 'fail', error: serializeError(error) });
    console.error(`FAIL runner: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    report.finishedAt = new Date().toISOString();
    report.passes = report.checks.filter(item => item.status === 'pass').length;
    report.failures = report.checks.filter(item => item.status === 'fail').length;
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  if (failureCount > 0) {
    console.error(`\n${failureCount} visible-motion check(s) failed. See test-results/visible-motion-report.json.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll visible-motion checks passed. Report: test-results/visible-motion-report.json`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
