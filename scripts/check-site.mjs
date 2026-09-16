import { chromium } from '../node_modules/playwright/index.mjs';
import axeCore from '../node_modules/axe-core/axe.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const BASE_ORIGIN = new URL(BASE_URL).origin;
const RESULTS_DIR_URL = new URL('../test-results/', import.meta.url);
const RESULTS_DIR = fileURLToPath(RESULTS_DIR_URL);

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
const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  mobile390: { width: 390, height: 844 },
  mobile320: { width: 320, height: 844 },
};

const report = {
  startedAt: new Date().toISOString(),
  baseURL: BASE_URL,
  browser: 'chrome',
  checks: [],
  axe: [],
};

let browser;
let failureCount = 0;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function screenshotPath(name) {
  return fileURLToPath(new URL(`${slugify(name)}.png`, RESULTS_DIR_URL));
}

function serializeError(error) {
  if (!error) return { message: 'Unknown failure' };
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function expect(condition, message, details) {
  if (condition) return;
  const error = new Error(message);
  if (details !== undefined) error.details = details;
  throw error;
}

async function check(name, fn, page) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({ name, status: 'pass', durationMs: Date.now() - started, details });
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    failureCount += 1;
    const entry = {
      name,
      status: 'fail',
      durationMs: Date.now() - started,
      error: serializeError(error),
    };
    if (error?.details !== undefined) entry.details = error.details;

    if (page && !page.isClosed()) {
      try {
        const path = screenshotPath(`failure-${name}`);
        await page.screenshot({ path, fullPage: true });
        entry.screenshot = path;
      } catch {
        // Keep the original failure as the useful signal.
      }
    }

    report.checks.push(entry);
    console.error(`FAIL ${name}: ${error.message}`);
    return false;
  }
}

function attachRuntimeErrors(page, bucket) {
  page.on('pageerror', error => {
    bucket.push({ type: 'pageerror', message: error.message });
  });
}

async function installLocalOnlyRouting(context) {
  await context.route('**/*', async route => {
    const requestURL = route.request().url();
    let parsed;
    try {
      parsed = new URL(requestURL);
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
  const context = await browser.newContext({
    colorScheme: 'light',
    ...options,
  });
  await installLocalOnlyRouting(context);
  return context;
}

async function gotoLocal(page, pathname = '/') {
  const response = await page.goto(`${BASE_URL}${pathname}`, {
    waitUntil: 'domcontentloaded',
    timeout: 15_000,
  });
  expect(response, `No navigation response for ${pathname}`);
  expect(response.ok(), `Local page returned HTTP ${response.status()} for ${pathname}`);
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
  return response;
}

async function waitForImages(page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const image of images) image.loading = 'eager';

    await Promise.race([
      Promise.all(images.map(image => {
        if (image.complete) return Promise.resolve();
        return new Promise(resolve => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      })),
      new Promise(resolve => setTimeout(resolve, 4_000)),
    ]);
  });
}

async function getBrokenImages(page) {
  await waitForImages(page);
  return page.evaluate(() => [...document.images]
    .filter(image => image.complete && image.naturalWidth === 0)
    .map(image => image.currentSrc || image.src || image.getAttribute('src')));
}

async function getOverflowDiagnostics(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const width = window.innerWidth;
    const delta = Math.max(root.scrollWidth, document.body?.scrollWidth || 0) - width;
    const offenders = [...document.querySelectorAll('body *')]
      .filter(element => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > width + 1);
      })
      .slice(0, 12)
      .map(element => {
        const rect = element.getBoundingClientRect();
        const id = element.id ? `#${element.id}` : '';
        const classes = typeof element.className === 'string' && element.className.trim()
          ? `.${element.className.trim().replace(/\s+/g, '.')}`
          : '';
        return {
          element: `${element.tagName.toLowerCase()}${id}${classes}`,
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
        };
      });
    return { viewportWidth: width, scrollWidth: root.scrollWidth, delta, offenders };
  });
}

async function assertLayoutAndImages(page, label) {
  const [overflow, brokenImages] = await Promise.all([
    getOverflowDiagnostics(page),
    getBrokenImages(page),
  ]);
  expect(overflow.delta <= 1, `${label} has horizontal overflow`, overflow);
  expect(brokenImages.length === 0, `${label} has broken images`, { brokenImages });
  return { overflow, imageCount: await page.locator('img').count() };
}

async function runAxe(page, label, { assertClean = true } = {}) {
  // Contrast must be measured after finite entrance fades have reached their
  // final opacity. Keep the scene/ambient loops running; do not disable motion.
  await page.waitForTimeout(120);
  await page.waitForFunction(() => (
    !window.__researchMotion || window.__researchMotion.getStats().activeAnimations === 0
  ), null, { timeout: 4_000 });
  await page.addScriptTag({ content: axeCore.source });
  const result = await page.evaluate(async () => {
    const scan = await window.axe.run(document, { resultTypes: ['violations'] });
    return scan.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.map(node => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    }));
  });

  const serious = result.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
  report.axe.push({ label, violations: result, seriousOrCritical: serious });
  if (assertClean) {
    expect(serious.length === 0, `${label} has serious/critical axe violations`, { violations: serious });
  }
  return { totalViolations: result.length, seriousOrCritical: serious };
}

async function waitForSceneReady(page) {
  await page.waitForFunction(() => (
    window.__researchScene
    && window.__researchScene.isAvailable?.() === true
    && window.__researchScene.getStats?.().status === 'ready'
  ), null, { timeout: 12_000 });
}

async function sceneStats(page) {
  return page.evaluate(() => window.__researchScene?.getStats?.());
}

async function waitForRenderAdvance(page, previousRenders, timeout = 2_000) {
  await page.waitForFunction(previous => (
    window.__researchScene?.getStats?.().renders > previous
  ), previousRenders, { timeout });
}

async function testExperimentFilters(page) {
  const cases = [
    { filter: 'all', count: 6 },
    { filter: 'learning', count: 3 },
    { filter: 'simulation', count: 3 },
  ];

  const results = [];
  for (const testCase of cases) {
    const button = page.locator(`[data-filter="${testCase.filter}"]`);
    await button.click();
    await page.waitForFunction(({ filter, count }) => {
      const visible = [...document.querySelectorAll('[data-category]')]
        .filter(card => !card.hidden);
      const pressed = document.querySelector(`[data-filter="${filter}"]`)?.getAttribute('aria-pressed') === 'true';
      return visible.length === count && pressed;
    }, testCase);

    const visible = await page.locator('[data-category]:not([hidden])').count();
    const counter = (await page.locator('.experiment-count').textContent())?.trim();
    expect(visible === testCase.count, `Filter ${testCase.filter} expected ${testCase.count}, got ${visible}`);
    expect(counter?.startsWith(String(testCase.count).padStart(2, '0')), `Filter counter is wrong for ${testCase.filter}`, { counter });
    results.push({ ...testCase, counter });
  }

  await page.locator('[data-filter="all"]').click();
  return results;
}

async function testMobileMenu(page) {
  const toggle = page.locator('.menu-toggle');
  const nav = page.locator('#site-nav');
  await expectVisible(toggle, 'Mobile menu toggle');

  await toggle.click();
  expect(await toggle.getAttribute('aria-expanded') === 'true', 'Menu did not set aria-expanded=true');
  expect(await nav.evaluate(node => node.classList.contains('is-open')), 'Menu did not open');

  await page.keyboard.press('Escape');
  expect(await toggle.getAttribute('aria-expanded') === 'false', 'Escape did not close the menu');
  expect(!(await nav.evaluate(node => node.classList.contains('is-open'))), 'Menu retained is-open after Escape');
  expect(await toggle.evaluate(node => document.activeElement === node), 'Escape did not return focus to menu toggle');
}

async function expectVisible(locator, label) {
  expect(await locator.count() > 0, `${label} is missing`);
  expect(await locator.first().isVisible(), `${label} is not visible`);
}

async function testScene(page) {
  await waitForSceneReady(page);
  await page.locator('#research-scene').scrollIntoViewIfNeeded();

  const modes = ['intelligence', 'worlds', 'systems'];
  for (const mode of modes) {
    const button = page.locator(`[data-scene-mode="${mode}"]`);
    expect(!(await button.isDisabled()), `Scene mode ${mode} is disabled`);
    await button.click();
    await page.waitForFunction(expected => window.__researchScene.getStats().mode === expected, mode);
    expect(await button.getAttribute('aria-pressed') === 'true', `Scene mode ${mode} did not become pressed`);
  }

  const reset = page.locator('#scene-reset');
  expect(!(await reset.isDisabled()), 'Scene reset is disabled');
  await reset.click();
  expect((await sceneStats(page)).status === 'ready', 'Scene was not ready after reset');

  const pause = page.locator('#scene-pause');
  expect(!(await pause.isDisabled()), 'Scene pause is disabled in normal motion mode');
  await pause.click();
  await page.waitForFunction(() => window.__researchScene.getStats().explicitPaused === true);
  await page.waitForTimeout(120);
  const pausedStart = (await sceneStats(page)).renders;
  await page.waitForTimeout(320);
  const pausedEnd = (await sceneStats(page)).renders;
  expect(pausedEnd === pausedStart, 'Paused scene continued rendering', { pausedStart, pausedEnd });

  await pause.click();
  await page.waitForFunction(() => window.__researchScene.getStats().explicitPaused === false);
  const resumedAt = (await sceneStats(page)).renders;
  await waitForRenderAdvance(page, resumedAt);

  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__researchScene.getStats().visible === false);
  await page.waitForTimeout(120);
  const offscreenStart = (await sceneStats(page)).renders;
  await page.waitForTimeout(350);
  const offscreenEnd = (await sceneStats(page)).renders;
  expect(offscreenEnd === offscreenStart, 'Offscreen scene continued rendering', { offscreenStart, offscreenEnd });

  await page.locator('#research-scene').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__researchScene.getStats().visible === true);
  const onscreenAt = (await sceneStats(page)).renders;
  await waitForRenderAdvance(page, onscreenAt);

  return await sceneStats(page);
}

async function testBackToTop(page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => window.scrollY > 100);
  await page.locator('footer a[href="#top"]').click();
  await page.waitForFunction(() => window.scrollY < 5);
  expect(await page.evaluate(() => location.hash) === '#top', 'Back-to-top did not target #top');
}

async function testReducedMotion(browserInstance) {
  const context = await createContext({
    viewport: VIEWPORTS.desktop,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  attachRuntimeErrors(page, runtimeErrors);
  try {
    await gotoLocal(page, '/');
    await waitForSceneReady(page);
    const initial = await sceneStats(page);
    expect(initial.reducedMotion === true, 'Reduced-motion context did not produce a reduced-motion scene', initial);
    expect(!(await page.locator('#scene-pause').isDisabled()), 'Pause/Play button should stay enabled under OS reduced motion so the user can opt in');

    await page.waitForTimeout(120);
    const staticStart = (await sceneStats(page)).renders;
    await page.waitForTimeout(350);
    const staticEnd = (await sceneStats(page)).renders;
    expect(staticEnd === staticStart, 'Reduced-motion scene rendered continuously', { staticStart, staticEnd });

    for (const mode of ['worlds', 'systems', 'intelligence']) {
      const button = page.locator(`[data-scene-mode="${mode}"]`);
      expect(!(await button.isDisabled()), `Reduced-motion mode button ${mode} is disabled`);
      await button.click();
      await page.waitForFunction(expected => window.__researchScene.getStats().mode === expected, mode);
    }

    const reset = page.locator('#scene-reset');
    expect(!(await reset.isDisabled()), 'Reduced-motion reset button is disabled');
    await reset.click();
    expect(runtimeErrors.length === 0, 'Runtime errors occurred during reduced-motion controls', runtimeErrors);
    await page.screenshot({ path: screenshotPath('home-reduced-motion'), fullPage: true });
    return await sceneStats(page);
  } finally {
    await context.close();
  }
}

async function testNoJavaScript() {
  const context = await createContext({
    viewport: VIEWPORTS.mobile390,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  try {
    await gotoLocal(page, '/');
    await expectVisible(page.locator('h1'), 'No-JS home heading');
    expect((await page.locator('h1').innerText()).trim().length > 0, 'No-JS home heading is empty');
    expect(await page.locator('[data-category]').count() === 6, 'No-JS experiment content is incomplete');

    const navLinks = page.locator('#site-nav a');
    expect(await navLinks.count() >= 4, 'No-JS mobile nav is incomplete');
    for (let index = 0; index < await navLinks.count(); index += 1) {
      expect(await navLinks.nth(index).isVisible(), `No-JS nav link ${index + 1} is hidden`);
    }

    await assertLayoutAndImages(page, 'no-JS mobile 390');
    await page.screenshot({ path: screenshotPath('home-no-js-mobile-390'), fullPage: true });
  } finally {
    await context.close();
  }
}

async function testWebGLFallback() {
  const context = await createContext({ viewport: VIEWPORTS.desktop });
  await context.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, ...args) {
      if (typeof type === 'string' && type.toLowerCase().startsWith('webgl')) return null;
      return originalGetContext.call(this, type, ...args);
    };
  });

  const page = await context.newPage();
  const runtimeErrors = [];
  attachRuntimeErrors(page, runtimeErrors);
  try {
    await gotoLocal(page, '/');
    await page.waitForFunction(() => (
      window.__researchScene
      && window.__researchScene.isAvailable?.() === false
      && document.querySelector('#research-scene')?.dataset.sceneState === 'fallback'
    ), null, { timeout: 12_000 });

    await expectVisible(page.locator('#hero-title'), 'Fallback home heading');
    expect(await page.locator('[data-category]').count() === 6, 'Fallback page lost research content');
    await expectVisible(page.locator('.scene-poster'), 'Static scene poster');
    expect(await page.locator('[data-scene-mode="intelligence"]').isDisabled(), 'Fallback scene controls should be disabled');
    await testExperimentFilters(page);
    await page.screenshot({ path: screenshotPath('home-webgl-fallback'), fullPage: true });
    return { runtimeErrors };
  } finally {
    await context.close();
  }
}

async function testDetailPages(page, { labelPrefix = 'desktop' } = {}) {
  const results = [];
  for (const pathname of DETAIL_PATHS) {
    await gotoLocal(page, pathname);
    const h1 = page.locator('h1');
    await expectVisible(h1, `${pathname} h1`);
    const heading = (await h1.innerText()).trim();
    expect(heading.length >= 4, `${pathname} has an empty/placeholder h1`, { heading });
    expect(!/^(undefined|null|title)$/i.test(heading), `${pathname} has an invalid h1`, { heading });
    await assertLayoutAndImages(page, `${labelPrefix} ${pathname}`);
    results.push({ pathname, heading });
  }
  return results;
}

async function testDetailAxe(page, labelPrefix = 'desktop') {
  const seriousAxeViolations = [];
  for (const pathname of DETAIL_PATHS) {
    await gotoLocal(page, pathname);
    const axeResult = await runAxe(page, `${labelPrefix} ${pathname}`, { assertClean: false });
    if (axeResult.seriousOrCritical.length > 0) {
      seriousAxeViolations.push({ pathname, violations: axeResult.seriousOrCritical });
    }
  }
  expect(
    seriousAxeViolations.length === 0,
    `${labelPrefix} detail pages have serious/critical axe violations`,
    { pages: seriousAxeViolations },
  );
  return seriousAxeViolations;
}

async function runNormalDesktopSuite() {
  const context = await createContext({
    viewport: VIEWPORTS.desktop,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  attachRuntimeErrors(page, runtimeErrors);
  try {
    await gotoLocal(page, '/');
    await check('desktop home has no overflow or broken images', () => assertLayoutAndImages(page, 'desktop home'), page);
    await check('experiment filters show 6 / 3 / 3', () => testExperimentFilters(page), page);
    await check('scene modes, pause/resume/reset, and offscreen pause', () => testScene(page), page);
    await check('back-to-top returns to #top', () => testBackToTop(page), page);
    await check('axe home has no serious/critical violations', () => runAxe(page, 'desktop home'), page);
    await page.screenshot({ path: screenshotPath('home-desktop-1440x1000'), fullPage: true });

    await check('all six experiment pages and three notes have real h1 content', async () => {
      const details = await testDetailPages(page, { labelPrefix: 'desktop' });
      expect(details.length === 9, 'Expected nine detail/note pages', { details });
      return details;
    }, page);
    await check(
      'axe experiment and note pages have no serious/critical violations',
      () => testDetailAxe(page, 'desktop'),
      page,
    );

    await gotoLocal(page, '/experiments/distinction/');
    await page.screenshot({ path: screenshotPath('detail-distinction-desktop'), fullPage: true });
    await check('desktop runtime has no uncaught page errors', () => {
      expect(runtimeErrors.length === 0, 'Uncaught page errors occurred', runtimeErrors);
      return runtimeErrors;
    }, page);
  } finally {
    await context.close();
  }
}

async function runMobileSuite(name, viewport, { verifyDetails = false } = {}) {
  const context = await createContext({
    viewport,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  attachRuntimeErrors(page, runtimeErrors);
  try {
    await gotoLocal(page, '/');
    await check(`${name} home has no overflow or broken images`, () => assertLayoutAndImages(page, `${name} home`), page);
    await check(`${name} nav opens and Escape closes it`, () => testMobileMenu(page), page);
    await page.screenshot({ path: screenshotPath(`home-${name}`), fullPage: true });

    if (verifyDetails) {
      await check(`${name} detail/note pages remain responsive`, () => testDetailPages(page, {
        axe: false,
        labelPrefix: name,
      }), page);
    }

    await check(`${name} runtime has no uncaught page errors`, () => {
      expect(runtimeErrors.length === 0, 'Uncaught page errors occurred', runtimeErrors);
      return runtimeErrors;
    }, page);
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(RESULTS_DIR, { recursive: true });
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--enable-webgl', '--use-angle=swiftshader'],
    });
    await runNormalDesktopSuite();
    await runMobileSuite('mobile-390x844', VIEWPORTS.mobile390);
    await runMobileSuite('mobile-320x844', VIEWPORTS.mobile320, { verifyDetails: true });
    await check('reduced motion is static with mode/reset controls usable', () => testReducedMotion(browser));
    await check('no-JS content and mobile navigation remain readable', () => testNoJavaScript());
    await check('forced WebGL failure falls back without losing content', () => testWebGLFallback());
  } catch (error) {
    failureCount += 1;
    report.checks.push({ name: 'runner', status: 'fail', error: serializeError(error) });
    console.error(`FAIL runner: ${error.message}`);
  } finally {
    if (browser) await browser.close();
    report.finishedAt = new Date().toISOString();
    report.failures = report.checks.filter(item => item.status === 'fail').length;
    report.passes = report.checks.filter(item => item.status === 'pass').length;
    await writeFile(
      fileURLToPath(new URL('smoke-report.json', RESULTS_DIR_URL)),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    );
  }

  if (failureCount > 0) {
    console.error(`\n${failureCount} smoke check(s) failed. See test-results/smoke-report.json.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll smoke checks passed. Report: test-results/smoke-report.json`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
