import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import axe from 'axe-core';
import { labProjects } from '../src/lab-projects.js';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4174').replace(/\/$/, '');
const origin = new URL(base).origin;
const output = 'test-results/lab';
await mkdir(output, { recursive: true });
const report = { base, started: new Date().toISOString(), checks: [], axe: [], errors: [], captures: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function check(name, run) {
  try { const details = await run(); report.checks.push({ name, status: 'pass', details }); console.log(`PASS ${name}`); }
  catch (error) { report.checks.push({ name, status: 'fail', error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  // The portfolio must never need access to the real lab; only public font resources may leave this origin.
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    const allowed = url.origin === origin || ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
    return /^https?:$/.test(url.protocol) && !allowed ? route.abort() : route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  async function settle() {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !window.__researchMotion || window.__researchMotion.getStats().activeAnimations === 0, null, { timeout: 7000 });
  }
  async function visit(route) {
    const response = await page.goto(base + route, { waitUntil: 'load', timeout: 20000 });
    assert(response.ok(), `${route} did not load`);
    await settle();
  }
  async function scan(route) {
    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, `${route} overflows by ${overflow}px`);
    assert.equal(await page.locator('h1').count(), 1, route);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => (await window.axe.run()).violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })));
    report.axe.push({ route, violations });
    assert.equal(violations.length, 0, `${route}: ${JSON.stringify(violations)}`);
  }

  await check('Homepage and navigation expose the two hardware stories', async () => {
    await visit('/');
    assert.equal(await page.locator('.site-nav a[href="/lab/"]').count(), 1);
    assert.equal(await page.locator('#homelab .hardware-card').count(), 2);
    assert(await page.locator('#homelab a[href="/projects/pico-audio-lab/"]').count() > 0);
    await page.locator('#homelab').scrollIntoViewIfNeeded();
    await settle();
    await page.locator('#homelab').screenshot({ path: `${output}/home-section-light.png` });
  });
  await check('Lab hub and every new project have original content and source credits', async () => {
    await visit('/lab/');
    assert.equal(await page.locator('.hardware-card').count(), 2);
    for (const project of labProjects) {
      await visit(`/projects/${project.id}/`);
      assert.equal(await page.locator('h1').innerText(), project.name);
      assert(await page.locator('#credits .source-item').count() >= 2);
      assert(await page.locator('.article-body > section').count() >= 4);
      await scan(project.id);
    }
    await visit('/projects/?q=raspberry');
    assert(await page.locator('[data-catalog-item]:not([hidden]) h2').allTextContents().then(titles => titles.some(t => t.includes('Pico'))));
    await visit('/credits/?q=micropython');
    assert(await page.locator('[data-source-item]:not([hidden]) .source-usedby a[href="/projects/pico-audio-lab/"]').count() > 0);
  });
  await check('Concept illustrations animate automatically and obey Pause', async () => {
    await visit('/lab/');
    await page.locator('.hardware-grid').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelectorAll('.hardware-card.ambient-visible').length === 2);
    assert.equal(await page.evaluate(() => window.__researchMotion.getStats().paused), false);
    assert(await page.locator('.hardware-card .speaker-diaphragm').evaluate(el => el.getAnimations().some(a => a.playState === 'running')));
    await page.locator('.motion-toggle').click();
    assert.equal(await page.evaluate(() => window.__researchMotion.getStats().paused), true);
    assert.equal(await page.locator('.speaker-diaphragm').evaluate(el => el.getAnimations().filter(a => a.playState === 'running').length), 0);
  });
  await check('Lab layout and typography work in both themes at desktop and phone widths', async () => {
    for (const theme of ['light', 'dark']) {
      for (const width of [1440, 1000, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(value => localStorage.setItem('research-theme', value), theme);
        await visit('/lab/');
        await scan(`${theme} ${width}px /lab/`);
        const name = `${theme}-${width}`;
        await page.screenshot({ path: `${output}/${name}.png` });
        report.captures.push(name);
      }
    }
  });
  await check('Reduced-motion and JavaScript-free reading remain usable', async () => {
    const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const reducedPage = await reduced.newPage();
    try {
      await reducedPage.goto(base + '/lab/', { waitUntil: 'load' });
      await reducedPage.locator('.hardware-grid').scrollIntoViewIfNeeded();
      assert.equal(await reducedPage.evaluate(() => window.__researchMotion.getStats().paused), true);
      assert.equal(await reducedPage.locator('.speaker-diaphragm').evaluate(el => el.getAnimations().length), 0);
    } finally { await reduced.close(); }
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      const staticPage = await nojs.newPage();
      await staticPage.goto(base + '/lab/', { waitUntil: 'load' });
      assert.equal(await staticPage.locator('.hardware-card').count(), 2);
      assert(await staticPage.locator('.site-nav').isVisible());
    } finally { await nojs.close(); }
  });
  await check('No uncaught page errors', async () => assert.deepEqual(report.errors, []));
} finally {
  await browser.close();
  report.finished = new Date().toISOString();
  report.passes = report.checks.filter(c => c.status === 'pass').length;
  report.failures = report.checks.filter(c => c.status === 'fail').length;
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passes: report.passes, failures: report.failures, scans: report.axe.length }));
  if (report.failures) process.exitCode = 1;
}
