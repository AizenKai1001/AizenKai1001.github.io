import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import axe from 'axe-core';
import { systemGroups, labObservation } from '../src/lab-systems.js';
import { widgetStudies } from '../src/widget-studies.js';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4174').replace(/\/$/,'');
const origin = new URL(base).origin;
const dir = 'test-results/observatory';
await mkdir(dir,{recursive:true});
const report = {base,started:new Date().toISOString(),checks:[],axe:[],errors:[],blockedRequests:0};
const browser = await chromium.launch({channel:'chrome',headless:true});
async function check(name,run) {
  try { const details=await run(); report.checks.push({name,status:'pass',details}); console.log(`PASS ${name}`); }
  catch(error) { report.checks.push({name,status:'fail',error:error.message}); console.error(`FAIL ${name}: ${error.message}`); }
}

try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'no-preference'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    const allowed=url.origin===origin||['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname);
    if(/^https?:$/.test(url.protocol)&&!allowed) { report.blockedRequests++; return route.abort(); }
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  async function settle() {
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>!window.__researchMotion||window.__researchMotion.getStats().activeAnimations===0,null,{timeout:7000});
  }
  async function visit(route) {
    const result=await page.goto(base+route,{waitUntil:'load',timeout:20000});
    if (result) assert(result.ok(),`${route}: HTTP ${result.status()}`);
    else assert.equal(new URL(page.url()).pathname,new URL(base+route).pathname,'Fragment navigation stayed on its document');
    await settle();
  }
  async function scan(label) {
    assert(await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)<=innerWidth+1),`${label}: horizontal overflow`);
    await page.addScriptTag({content:axe.source});
    const violations=await page.evaluate(async()=>(await window.axe.run()).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})));
    report.axe.push({label,violations}); assert.equal(violations.length,0,`${label}: ${JSON.stringify(violations)}`);
  }

  await check('Observed system groups filter correctly and stopped workloads remain explicit',async()=>{
    await visit('/lab/');
    assert((await page.locator('#systems .observation-note').innerText()).includes(labObservation.label.toUpperCase()));
    assert.equal(await page.locator('[data-system-group]').count(),systemGroups.length);
    for(const group of systemGroups) {
      await page.locator(`[data-system-filter="${group.id}"]`).click();
      assert.equal(await page.locator('[data-system-group]:not([hidden])').count(),1);
      assert(await page.locator(`[data-system-group="${group.id}"]`).isVisible());
    }
    await page.locator('[data-system-filter="all"]').click();
    assert.equal(await page.locator('[data-system-group]:not([hidden])').count(),systemGroups.length);
    await page.locator('.stopped-systems summary').click();
    assert(await page.locator('.stopped-systems a[href="/projects/craftax-live/"]').isVisible());
    await page.locator('#systems').screenshot({path:`${dir}/systems-light.png`});
    return {groups:systemGroups.length};
  });
  await check('Every widget study can be selected and has clear sources and state',async()=>{
    await visit('/lab/widgets/');
    for(const widget of widgetStudies) {
      await page.locator(`[data-widget-select="${widget.id}"]`).click(); await settle();
      assert.equal(await page.locator('[data-widget-panel]:not([hidden])').count(),1);
      const panel=page.locator(`[data-widget-panel="${widget.id}"]`);
      assert(await panel.isVisible());
      assert.equal(await panel.locator('.widget-study-state').innerText(),widget.state);
      assert.equal(await panel.locator('.source-item').count(),widget.credits.length);
      assert.equal(new URL(page.url()).hash,`#${widget.id}`);
    }
    assert.equal(widgetStudies.filter(w=>w.state==='Observed running').length,6);
    return {studies:widgetStudies.length};
  });
  await check('Keyboard navigation, direct hashes and credit deep links select the right study',async()=>{
    await visit('/lab/widgets/#network-flow-attribution');
    assert(await page.locator('#network-flow-attribution').isVisible());
    await page.locator('[data-widget-select]').first().focus();
    await page.keyboard.press('ArrowDown'); await settle();
    assert.equal(await page.locator('[data-widget-select]').nth(1).getAttribute('aria-current'),'true');
    await page.keyboard.press('End'); await settle();
    assert(await page.locator('#cairo-ambient-visuals').isVisible());
    await page.reload({waitUntil:'load'}); await settle();
    assert(await page.locator('#cairo-ambient-visuals').isVisible());
    await visit('/lab/widgets/#codex-usage-freshness-credits');
    assert(await page.locator('#codex-usage-freshness').isVisible());
    await visit('/lab/widgets/#unrecognized-study');
    assert.equal(await page.locator('[data-widget-panel]:not([hidden])').count(),1);
  });
  await check('Schematic motion plays, pauses and stays separate from measurements',async()=>{
    await visit('/lab/widgets/#network-flow-attribution');
    await page.locator('#network-flow-attribution .widget-preview').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#network-flow-attribution [data-widget-art]').classList.contains('ambient-visible'));
    assert(await page.locator('#network-flow-attribution .widget-signal').evaluate(el=>el.getAnimations().some(a=>a.playState==='running')));
    await page.locator('.motion-toggle').click();
    assert.equal(await page.locator('#network-flow-attribution .widget-signal').evaluate(el=>el.getAnimations().filter(a=>a.playState==='running').length),0);
    assert((await page.locator('#network-flow-attribution .widget-preview-foot').innerText()).includes('ILLUSTRATION'));
  });
  await check('Desktop and phone layouts are accessible in light and dark themes',async()=>{
    for(const theme of ['light','dark']) {
      await page.evaluate(value=>localStorage.setItem('research-theme',value),theme);
      for(const width of [1440,390,320]) {
        await page.setViewportSize({width,height:1000});
        for(const route of ['/lab/','/lab/widgets/#system-service-overview','/lab/widgets/#codex-usage-freshness']) {
          await visit(route); await scan(`${theme} ${width}px ${route}`);
        }
        await visit('/lab/widgets/#network-flow-attribution');
        await page.screenshot({path:`${dir}/widgets-${theme}-${width}.png`});
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await visit('/lab/');
    await page.locator('#widgets').scrollIntoViewIfNeeded(); await settle();
    await page.locator('#widgets').screenshot({path:`${dir}/widget-gallery-dark.png`});
  });
  await check('No-JavaScript reading and reduced-motion preferences remain supported',async()=>{
    const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    try {
      const p=await plain.newPage(); await p.goto(base+'/lab/widgets/',{waitUntil:'load'});
      assert.equal(await p.locator('[data-widget-panel]').count(),widgetStudies.length);
      assert.equal(await p.locator('[data-widget-panel][hidden]').count(),0);
      assert(await p.locator('.site-nav').isVisible());
    } finally { await plain.close(); }
    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
    try {
      const p=await reduced.newPage(); await p.goto(base+'/lab/widgets/#network-flow-attribution',{waitUntil:'load'});
      await p.locator('#network-flow-attribution .widget-preview').scrollIntoViewIfNeeded();
      assert.equal(await p.evaluate(()=>window.__researchMotion.getStats().paused),true);
      assert.equal(await p.locator('#network-flow-attribution .widget-signal').evaluate(el=>el.getAnimations().length),0);
    } finally { await reduced.close(); }
  });
  await check('Homepage 3D still starts and public pages make no infrastructure requests',async()=>{
    await page.setViewportSize({width:1440,height:1000}); await visit('/');
    await page.waitForFunction(()=>window.__researchScene?.isAvailable());
    await page.waitForFunction(()=>window.__researchScene.getStats().animationTime>0.5);
    assert.equal(await page.locator('#research-scene canvas').count(),1);
    assert.deepEqual(report.errors,[]); assert.equal(report.blockedRequests,0);
  });
} finally {
  await browser.close(); report.finished=new Date().toISOString();
  report.passes=report.checks.filter(c=>c.status==='pass').length;
  report.failures=report.checks.filter(c=>c.status==='fail').length;
  await writeFile(`${dir}/report.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({passes:report.passes,failures:report.failures,axeScans:report.axe.length}));
  if(report.failures) process.exitCode=1;
}
