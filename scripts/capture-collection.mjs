import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'test-results/collection';
const base = process.env.BASE_URL || 'http://127.0.0.1:4174';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (process.argv.includes('--references')) {
    for (const [name, url] of [
      ['still', 'https://still.mingjyunhung.com/'],
      ['architecture', 'https://blacklead-studio.webflow.io/'],
      ['materials', 'https://threejs.org/examples/webgl_materials_physical_transmission.html'],
    ]) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(4500);
        await page.screenshot({ path: `${output}/reference-${name}.png` });
        report.push({ name, url, title: await page.title() });
      } catch (error) { report.push({ name, url, error: error.message }); }
    }
  } else {
    // A plain visit: no query, storage reset, user-profile reuse, or forced Play.
    await page.goto(base, { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(() => window.__researchScene?.isAvailable());
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ['light', 'dark']) {
      if (await page.getAttribute('html', 'data-theme') !== theme) await page.locator('.theme-toggle').click();
      for (const mode of ['intelligence', 'worlds', 'systems']) {
        await page.locator(`[data-scene-mode="${mode}"]`).click();
        await page.waitForFunction(() => !window.__researchScene.getStats().transitioning);
        await page.waitForTimeout(2200);
        const stats = await page.evaluate(() => window.__researchScene.getStats());
        if (stats.paused) throw new Error('Plain-visit autoplay unexpectedly paused');
        await page.locator('#research-scene canvas').screenshot({ path: `${output}/${theme}-${mode}.png` });
        if (mode === 'intelligence') await page.screenshot({ path: `${output}/home-${theme}.png` });
        report.push({ theme, mode, stats });
      }
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('[data-scene-mode="intelligence"]').click();
      await page.locator('#scene-reset').click();
      await page.waitForTimeout(1400);
      await page.locator('#research-scene').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/mobile-${width}.png` });
      const delta = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (delta > 1) throw new Error(`${width}px overflow: ${delta}`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
  }
} finally { await browser.close(); }
await writeFile(`${output}/capture-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
