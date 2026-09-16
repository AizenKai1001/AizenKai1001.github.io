import { labProjects } from '../src/lab-projects.js';
import { labIllustration } from '../src/lab-visuals.js';
import { systemsSection, widgetTeaser } from './render-observatory.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span aria-hidden="true">↗</span>';

export function labShowcase() {
  const platform=labProjects.find(p=>p.id==='homelab-platform');
  const pico=labProjects.find(p=>p.id==='pico-audio-lab');
  if (!platform || !pico) throw new Error('The lab showcase needs the verified homelab and Pico records.');
  return `<section class="hardware-section wrap section-space" id="homelab" aria-labelledby="hardware-title">
    <div class="section-heading"><div><span class="section-kicker mono">04 / THE HANDS-ON SIDE</span><h2 id="hardware-title">A place to run.<br>A reason to <em>tinker.</em></h2></div><p>My homelab keeps the software experiments close. Microcontrollers take the same curiosity onto the workbench—where code becomes timing, voltage, and sound.</p></div>
    <div class="hardware-grid">
      ${[[platform,'COMPUTE / STORAGE / AUTOMATION','The lab behind the experiments.'],[pico,'RASPBERRY PI / MICROPYTHON / AUDIO','Small board. Actual sound.']].map(([p,tag,title])=>`<article class="hardware-card"><div class="hardware-art">${labIllustration(p.id)}<span class="hardware-art-label mono">CONCEPT ILLUSTRATION</span></div><div class="hardware-copy"><span class="mono hardware-kicker">${tag}</span><h3><a href="/projects/${p.id}/">${title} ${arrow}</a></h3><p>${esc(p.summary)}</p><div class="hardware-card-footer"><span>${esc(p.status)}</span><a class="text-link" href="/projects/${p.id}/">Explore the project ${arrow}</a></div></div></article>`).join('')}
    </div><a class="archive-cta" href="/lab/"><span>Inside the homelab & hardware notebook</span><span class="mono">RUN / OBSERVE / REBUILD</span>${arrow}</a><div class="lab-shortcuts"><a href="/lab/#systems">Explore the observed systems ${arrow}</a><a href="/lab/widgets/">See how the desktop widgets work ${arrow}</a></div>
  </section>`;
}

export function renderLabPage({head,header,footer,write,projectRecords}) {
  const relatedIds=['homelab-widgets','homelab-mcp','n8n-browser','media-library-automation','modelfit'];
  const related=relatedIds.map(id=>projectRecords.find(p=>p.id===id)).filter(Boolean);
  const remaining=labProjects.filter(p=>!['homelab-platform','pico-audio-lab'].includes(p.id));
  const content=`<section class="index-hero wrap lab-intro"><a class="back-link mono" href="/">← The research notebook</a><div class="index-hero-grid"><div><span class="section-kicker mono">HOMELAB & HARDWARE</span><h1>Learn it.<br><em>Make it run.</em></h1></div><div class="index-hero-note"><p>Software becomes more interesting when I have to operate it. This is the side of my work that connects self-hosted systems, automation, and small hardware experiments.</p><span class="mono">OPERATIONS · OBSERVABILITY · EMBEDDED AUDIO</span></div></div></section>
    ${labShowcase()}
    ${systemsSection()}
    ${widgetTeaser()}
    <section class="lab-linked-projects wrap section-space" aria-labelledby="lab-links-title"><div class="section-heading"><div><span class="section-kicker mono">CONNECTED WORK</span><h2 id="lab-links-title">The pieces<br><em>around the lab.</em></h2></div><p>Purpose-built tools and integrations that grew out of running my own systems.</p></div><div class="lab-link-grid">${[...remaining.map(p=>({...p,href:`/projects/${p.id}/`})),...related].map(p=>`<a class="lab-project-link" href="${p.href}"><span class="mono">${esc(p.area)}</span><h3>${esc(p.name)} ${arrow}</h3><p>${esc(p.summary)}</p></a>`).join('')}</div><p class="lab-scope-note">The illustrations explain the projects. They are not a network diagram, hardware inventory, or live connection to my equipment. Original platforms and libraries are credited on each project page.</p></section>`;
  write('lab/index.html',`<!doctype html><html lang="en"><head>${head('Homelab & Raspberry Pi — Jancarlos Espinal','Self-hosted systems, observability, workflow automation, and Raspberry Pi Pico audio experiments.','/lab/')}</head><body class="expansion-page lab-page" id="top">${header}<main id="main">${content}</main>${footer}</body></html>`);
}
