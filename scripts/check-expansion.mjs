import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { catalogProjects } from '../src/catalog.js';
import { researchTopics } from '../src/research.js';
import { archiveAdditions } from '../src/archive-additions.js';
import { projectRecords, sourceRecords } from './render-expansion.mjs';

const base=(process.env.BASE_URL || 'http://127.0.0.1:4174').replace(/\/$/,'');
const origin=new URL(base).origin;
const report={base,started:new Date().toISOString(),checks:[],axe:[],errors:[]};
await mkdir('test-results/expansion',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
let page;
async function check(name,fn) {
  try { const details=await fn(); report.checks.push({name,status:'pass',details}); console.log(`PASS ${name}`); }
  catch(error) { report.checks.push({name,status:'fail',error:error.message}); console.error(`FAIL ${name}: ${error.message}`); }
}
async function visit(path) {
  const response=await page.goto(base+path,{waitUntil:'load',timeout:20000});
  assert(response.ok(),`${path} HTTP ${response.status()}`);
  await page.waitForFunction(()=>!window.__researchMotion || window.__researchMotion.getStats().activeAnimations===0,null,{timeout:6000});
}
async function overflow() { return page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth); }
async function audit(label) {
  await page.addScriptTag({content:axe.source});
  const violations=await page.evaluate(async()=> (await window.axe.run(document,{resultTypes:['violations']})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  report.axe.push({label,violations});
  assert.equal(violations.filter(v=>['critical','serious'].includes(v.impact)).length,0,`${label}: ${JSON.stringify(violations)}`);
}
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'no-preference'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    return /^https?:$/.test(url.protocol)&&url.origin!==origin?route.abort():route.continue();
  });
  page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  await check('Project archive search, categories, empty state, sorting and layout',async()=>{
    await visit('/projects/');
    const items=page.locator('[data-catalog-item]');
    assert.equal(await items.count(),projectRecords.length);
    await page.locator('#project-search').fill('unlikely-no-project-7854');
    assert.equal(await page.locator('[data-catalog-item]:not([hidden])').count(),0);
    assert(await page.locator('#project-empty').isVisible());
    await page.locator('[data-clear-search="project"]').click();
    await page.locator('#project-search').fill('Distinction');
    const matched=await page.locator('[data-catalog-item]:not([hidden]) h2').allTextContents();
    assert(matched.some(x=>x.includes('Distinction AI')));
    await page.locator('#project-search').fill('');
    for(const category of [...new Set(projectRecords.map(p=>p.category))]) {
      await page.locator(`[data-catalog-filter="${category}"]`).click();
      assert.equal(await page.locator('[data-catalog-item]:not([hidden])').count(),projectRecords.filter(p=>p.category===category).length,category);
    }
    await page.locator('[data-catalog-filter="all"]').click();
    await page.locator('#project-sort').selectOption('name');
    const titles=await page.locator('[data-catalog-item]').evaluateAll(items=>items.map(item=>item.dataset.title));
    assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b)));
    await page.locator('[data-layout="list"]').first().click();
    assert.equal(await page.locator('#catalog-grid').getAttribute('data-layout'),'list');
    await page.reload({waitUntil:'load'});
    assert.equal(await page.locator('#catalog-grid').getAttribute('data-layout'),'list');
    return {projects:projectRecords.length};
  });
  await check('Research search/filter and original references',async()=>{
    await visit('/research/');
    assert.equal(await page.locator('[data-research-item]').count(),researchTopics.length);
    for(const category of [...new Set(researchTopics.map(r=>r.category))]) {
      await page.locator(`[data-research-filter="${category}"]`).click();
      assert.equal(await page.locator('[data-research-item]:not([hidden])').count(),researchTopics.filter(r=>r.category===category).length);
    }
    await page.locator('[data-research-filter="all"]').click();
    await page.locator('#research-search').fill('xxxxx-nothing');
    assert(await page.locator('#research-empty').isVisible());
    await page.locator('[data-clear-search="research"]').click();
    assert.equal(await page.locator('[data-research-item]:not([hidden])').count(),researchTopics.length);
    return {dossiers:researchTopics.length};
  });
  await check('Source directory supports lookup and links back to related work',async()=>{
    await visit('/credits/');
    assert.equal(await page.locator('[data-source-item]').count(),sourceRecords.length);
    await page.locator('#source-search').fill('micrograd');
    assert(await page.locator('[data-source-item]:not([hidden])').count()>0);
    assert(await page.locator('[data-source-item]:not([hidden]) .source-usedby a').count()>0);
    await page.locator('#source-search').fill('xxxx-absent');
    assert(await page.locator('#source-empty').isVisible());
    return {sources:sourceRecords.length};
  });
  await check('Interactive research atlas works with clicks and keyboard',async()=>{
    await visit('/');
    for(const category of [...new Set(researchTopics.map(r=>r.category))]) {
      const button=page.locator(`[data-atlas-category="${category}"]`);
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('[data-atlas-panel]:not([hidden])').count(),1);
      assert(await page.locator(`[data-atlas-panel="${category}"]`).isVisible());
    }
    await page.locator('[data-atlas-category]').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-atlas-category]').nth(1).getAttribute('aria-pressed'),'true');
  });
  const newRoutes=process.argv.includes('--additions')
    ? ['/projects/','/credits/',...archiveAdditions.map(p=>`/projects/${p.id}/`)]
    : ['/projects/','/research/','/credits/',...catalogProjects.map(p=>`/projects/${p.id}/`),...researchTopics.map(r=>`/research/${r.id}/`)];
  await check('Every added page has real content, credits and accessible light layout',async()=>{
    for(const route of newRoutes) {
      await visit(route);
      assert.equal(await page.locator('h1').count(),1,route);
      assert((await page.locator('h1').innerText()).trim().length>3,route);
      assert(await overflow()<=1,`${route} overflow`);
      if(route.split('/').filter(Boolean).length>1) {
        assert.equal(await page.locator('#credits').count(),1,`${route} credit section`);
        assert(await page.locator('.article-body > section').count()>=3,route);
      }
      await audit(`light ${route}`);
    }
    return {pages:newRoutes.length};
  });
  await check('Dark archive, sources, research and mobile layouts remain readable',async()=>{
    await page.emulateMedia({colorScheme:'dark'});
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const route of ['/', '/projects/','/research/','/credits/',`/research/${researchTopics[0].id}/`,`/projects/${catalogProjects[0].id}/`]) {
        await visit(route);
        assert(await overflow()<=1,`${width}px ${route} overflow`);
        if(width===1440) await audit(`dark ${route}`);
      }
    }
    return {widths:[1440,390,320]};
  });
  await check('Content and archive navigation work without JavaScript',async()=>{
    const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const staticPage=await staticContext.newPage();
    try {
      await staticPage.goto(base+'/projects/');
      assert.equal(await staticPage.locator('[data-catalog-item]').count(),projectRecords.length);
      assert(await staticPage.locator('.site-nav').isVisible());
      await staticPage.goto(base+'/research/');
      assert.equal(await staticPage.locator('[data-research-item]').count(),researchTopics.length);
    } finally { await staticContext.close(); }
  });
  await check('No uncaught runtime errors',async()=>assert.deepEqual(report.errors,[]));
} finally {
  await browser.close();
  report.finished=new Date().toISOString();
  report.passes=report.checks.filter(c=>c.status==='pass').length;
  report.failures=report.checks.filter(c=>c.status==='fail').length;
  await writeFile('test-results/expansion/report.json',JSON.stringify(report,null,2));
  if(report.failures) process.exitCode=1;
  console.log(JSON.stringify({passes:report.passes,failures:report.failures,axeScans:report.axe.length,violations:report.axe.reduce((n,r)=>n+r.violations.length,0)}));
}
