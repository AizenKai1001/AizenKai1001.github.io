import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4174';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, checks: [], errors: [] };
const check = (name, details = {}) => report.checks.push({ name, status: 'pass', details });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'no-preference' });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__researchScene?.isAvailable());
  assert.equal(await page.locator('#research-scene canvas').count(), 1);
  assert.equal(await page.locator('#research-scene canvas').evaluate(canvas => getComputedStyle(canvas).touchAction), 'pan-y');
  check('One renderer and native vertical touch scrolling');

  for (const mode of ['worlds', 'systems', 'intelligence']) {
    await page.locator(`[data-scene-mode="${mode}"]`).click();
    await page.waitForFunction(expected => window.__researchScene.getStats().mode === expected, mode);
    await page.waitForFunction(() => !window.__researchScene.getStats().transitioning);
  }
  check('All three animated mode transitions settle');

  await page.evaluate(() => {
    document.querySelector('[data-scene-mode="worlds"]').click();
    document.querySelector('[data-scene-mode="systems"]').click();
    document.querySelector('[data-scene-mode="intelligence"]').click();
  });
  await page.waitForFunction(() => !window.__researchScene.getStats().transitioning);
  assert.equal(await page.evaluate(() => window.__researchScene.getStats().mode), 'intelligence');
  check('Rapid mode switching settles on the requested model');

  await page.locator('[data-scene-mode="worlds"]').click();
  await page.locator('#scene-pause').click();
  const paused = await page.evaluate(() => window.__researchScene.getStats());
  assert.equal(paused.explicitPaused, true);
  assert.equal(paused.transitioning, false);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => window.__researchScene.getStats().renders), paused.renders);
  check('Pause settles an in-progress transition and stops drawing');
  await page.locator('#scene-pause').click();

  const initialFrames = await page.evaluate(() => window.__researchScene.getStats().renders);
  await page.waitForTimeout(650);
  const deltaFrames = await page.evaluate(start => window.__researchScene.getStats().renders - start, initialFrames);
  assert(deltaFrames > 0 && deltaFrames <= 55, `Expected bounded active drawing, got ${deltaFrames} frames in 650ms`);
  check('Render rate is bounded during the sampled active interval', { frames: deltaFrames, intervalMs: 650 });

  const contextLossAvailable = await page.evaluate(() => {
    const gl = document.querySelector('#research-scene canvas').getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    window.__testContextLoss = extension;
    extension.loseContext();
    return true;
  });
  assert(contextLossAvailable, 'Chrome WebGL context-loss extension unavailable');
  await page.waitForFunction(() => !window.__researchScene.isAvailable());
  await page.locator('.theme-toggle').click();
  assert.equal(await page.evaluate(() => window.__researchScene.isAvailable()), false);
  assert.equal(await page.locator('[data-scene-mode="worlds"]').isDisabled(), true);
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__testContextLoss.restoreContext());
  await page.waitForFunction(() => window.__researchScene.isAvailable());
  assert.equal(await page.evaluate(() => window.__researchScene.getStats().theme), 'light');
  check('Theme changes preserve context-loss fallback and recover correctly');

  assert.deepEqual(report.errors, []);
  check('No uncaught page errors');
} catch (error) {
  report.checks.push({ name: 'model regression', status: 'fail', error: error.message });
  process.exitCode = 1;
} finally {
  await browser.close();
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/model-report.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report));
