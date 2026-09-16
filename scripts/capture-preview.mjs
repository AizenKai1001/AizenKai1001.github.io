import { chromium } from 'playwright';
import axeCore from 'axe-core';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/';
const visualChecks = [];
async function checkFontLoadedLayout(page, label) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    manropeLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Manrope' && face.status === 'loaded'),
    instrumentSerifLoaded: [...document.fonts].some(face => face.family.replace(/["']/g, '') === 'Instrument Serif' && face.status === 'loaded')
  }));
  assert(layout.scrollWidth <= layout.viewport + 1, `${label}: horizontal overflow`);
  assert(layout.manropeLoaded && layout.instrumentSerifLoaded, `${label}: requested web fonts did not load`);
  await page.addScriptTag({ content: axeCore.source });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
  visualChecks.push({ label, ...layout, violations });
  assert.equal(violations.length, 0, `${label}: accessibility findings ${JSON.stringify(violations)}`);
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => window.__researchScene?.isAvailable(), { timeout: 15000 });
  await page.locator('#scene-pause').click();
  await page.locator('#scene-reset').click();
  await page.screenshot({ path: 'test-results/home-desktop.png' });
  await page.locator('#research-scene').screenshot({ path: 'test-results/research-study.png' });
  await page.screenshot({ path: 'test-results/home-full.png', fullPage: true });
  await checkFontLoadedLayout(page, 'font-loaded desktop home');
  console.log(JSON.stringify({ errors, stats: await page.evaluate(() => window.__researchScene.getStats()) }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/home-mobile.png' });
  await page.screenshot({ path: 'test-results/home-mobile-full.png', fullPage: true });
  await checkFontLoadedLayout(page, 'font-loaded mobile 390 home');
  console.log(JSON.stringify({ mobileWidth: await page.evaluate(() => document.documentElement.scrollWidth), viewport: 390 }));
  await page.setViewportSize({ width: 320, height: 844 });
  for (const path of ['/', '/experiments/evoforge/', '/experiments/forgegrad/']) {
    await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' });
    await checkFontLoadedLayout(page, `font-loaded 320 ${path}`);
  }
  await page.screenshot({ path: 'test-results/forgegrad-mobile-320.png', fullPage: true });
  assert.equal(errors.length, 0, `Uncaught errors: ${errors.join('; ')}`);
  console.log(JSON.stringify({ visualChecks }));
} finally {
  writeFileSync('test-results/font-loaded-report.json', JSON.stringify(visualChecks, null, 2));
  await browser.close();
}
