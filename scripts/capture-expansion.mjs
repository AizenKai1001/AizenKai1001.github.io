import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4174';
const output = 'test-results/expansion';
const mobileOnly = process.argv.includes('--mobile-only');
await mkdir(output, { recursive:true });
const browser = await chromium.launch({ channel:'chrome', headless:true });
const report = { errors:[], captures:[] };
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1000}, colorScheme:'light', reducedMotion:'no-preference' });
  page.on('pageerror',error=>report.errors.push(error.message));
  async function visit(path) {
    await page.goto(base+path,{waitUntil:'load',timeout:20000});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>!window.__researchMotion||window.__researchMotion.getStats().activeAnimations===0,null,{timeout:6000});
  }
  async function capture(name,selector) {
    if(selector) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.waitForTimeout(120);
      await page.waitForFunction(()=>!window.__researchMotion||window.__researchMotion.getStats().activeAnimations===0,null,{timeout:6000});
      await page.locator(selector).screenshot({path:`${output}/${name}.png`});
    } else await page.screenshot({path:`${output}/${name}.png`});
    const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    const focus = await page.evaluate(()=>{
      const skip=document.querySelector('.skip-link');
      return {active:document.activeElement?.className,skipTop:skip?.getBoundingClientRect().top,skipTransform:skip?getComputedStyle(skip).transform:null};
    });
    report.captures.push({name,overflow,focus});
  }
  if (!mobileOnly) {
  await visit('/');
  await capture('home-light');
  await capture('overview','.lab-overview');
  await capture('atlas-light','.atlas-section');
  await capture('workbench-light','.archive-teaser');
  await page.locator('.theme-toggle').click();
  await capture('atlas-dark','.atlas-section');
  for (const [name,path] of [['projects','/projects/'],['research','/research/'],['credits','/credits/'],['dossier','/research/developmental-non-neural-ai/'],['realm','/projects/realm/']]) {
    await visit(path); await capture(`${name}-dark`);
  }
  }
  for (const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    await visit('/'); await capture(`atlas-${width}`,'.atlas-section');
    for(const [name,path] of [['projects','/projects/'],['research','/research/'],['credits','/credits/']]) {
      await visit(path); await capture(`${name}-${width}`);
    }
  }
} finally { await browser.close(); }
await writeFile(`${output}/captures.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
if(report.errors.length || report.captures.some(c=>c.overflow>1)) process.exitCode=1;
