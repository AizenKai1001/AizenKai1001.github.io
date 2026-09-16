import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const output = 'test-results/experience';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const captures = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForFunction(() => window.__researchScene?.isAvailable());
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ['light', 'dark']) {
    if (await page.getAttribute('html', 'data-theme') !== theme) await page.locator('.theme-toggle').click();
    await page.waitForFunction(value => window.__researchScene?.getStats().theme === value, theme);
    for (const mode of ['intelligence', 'worlds', 'systems']) {
      await page.locator(`[data-scene-mode="${mode}"]`).click();
      await page.waitForTimeout(1700);
      await page.waitForFunction(() => window.__researchScene?.getStats().transitioning !== true);
      const moving = !await page.locator('#scene-pause').getAttribute('aria-pressed').then(value => value === 'true');
      if (moving) await page.locator('#scene-pause').click();
      await page.locator('#scene-reset').click();
      await page.locator('#research-scene').screenshot({ path: `${output}/model-${theme}-${mode}.png` });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `${output}/home-${theme}-${mode}.png` });
      captures.push({ theme, mode, stats: await page.evaluate(() => window.__researchScene.getStats()) });
      if (moving) await page.locator('#scene-pause').click();
    }
    await page.locator('[data-scene-mode="intelligence"]').click();
    await page.waitForTimeout(1000);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('#scene-reset').click();
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(450);
      await page.screenshot({ path: `${output}/home-${theme}-${width}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 1) throw new Error(`${theme} ${width}px has ${overflow}px overflow`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#scene-reset').click();
  }
  await context.close();
} finally { await browser.close(); }
console.log(JSON.stringify({ errors, captures }));
if (errors.length) process.exitCode = 1;
