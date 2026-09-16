import { identity, experiments } from '../src/content.js';
import { catalogProjects } from '../src/catalog.js';
import { researchTopics } from '../src/research.js';
import { featuredCredits, siteCredits, projectKind } from '../src/credits.js';
import { labIllustration } from '../src/lab-visuals.js';
import { systemGroups } from '../src/lab-systems.js';
import { widgetStudies } from '../src/widget-studies.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const arrow = '<span aria-hidden="true">↗</span>';
const external = href => /^https:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
const pad = n => String(n).padStart(2, '0');
export const categoryLabels = { learning: 'Learning', simulation: 'Simulation', tools: 'Tools', systems: 'Systems', graphics: 'Graphics', product: 'Products' };
const researchLabels = { learning: 'Learning & memory', simulation: 'Embodied intelligence', systems: 'AI systems', graphics: 'Worlds & graphics', foundations: 'Foundations' };

export const projectRecords = [
  ...experiments.map(p => ({ ...p, category: p.tag, kind: projectKind(p), credits: featuredCredits[p.id] || [], href: `/experiments/${p.id}/` })),
  ...catalogProjects.map(p => ({ ...p, href: `/projects/${p.id}/` }))
];
const byId = new Map(projectRecords.map(p => [p.id, p]));
const uniqueSources = new Map();
function collectSource(source, usedBy, type) {
  if (!/^https:\/\//.test(source.href)) return;
  const key = source.href.replace(/\/$/, '');
  if (!uniqueSources.has(key)) uniqueSources.set(key, { ...source, type: source.type || type, usedBy: [] });
  const entry = uniqueSources.get(key);
  if (!entry.usedBy.some(p => p.href === usedBy.href)) entry.usedBy.push(usedBy);
}
projectRecords.forEach(p => (p.credits || []).forEach(c => collectSource(c, { label: p.name, href: p.href }, 'Project source')));
researchTopics.forEach(r => r.references.forEach(c => collectSource(c, { label: r.title, href: `/research/${r.id}/` }, 'Research source')));
siteCredits.forEach(c => collectSource(c, { label: 'This portfolio', href: '/' }, c.type));
systemGroups.forEach(group => group.credits.forEach(c => collectSource(c, { label: group.title, href: '/lab/#systems' }, 'Lab platform')));
widgetStudies.forEach(widget => widget.credits.forEach(c => collectSource(c, { label: widget.title, href: `/lab/widgets/#${widget.id}` }, 'Widget tooling')));
export const sourceRecords = [...uniqueSources.values()].sort((a, b) => a.label.localeCompare(b.label));
const projectImages = {
  realmforge: { src:'/media/realmforge-editor.webp', caption:'Recorded RealmForge editor view; cropped above the console.' },
  veilborn: { src:'/media/veilborn-prototype.webp', caption:'Recorded Veilborn first-playable prototype. Engine and asset credits are listed below.' }
};

export function creditsBlock(credits, { id = 'credits', title = 'Built on the work of others' } = {}) {
  if (!credits?.length) return `<section class="source-block" id="${esc(id)}"><span class="mono">PROJECT PROVENANCE</span><p>The scope of this local work is documented in the project record above. A public upstream repository is only linked when its relationship has been established.</p></section>`;
  return `<section class="source-block" id="${esc(id)}"><div class="source-block-head"><span class="mono">SOURCES & CREDIT</span><h2>${esc(title)}</h2></div><div class="source-list">${credits.map((c, i) => `<div class="source-item"><span class="mono">${pad(i + 1)}</span><div><a href="${esc(c.href)}"${external(c.href)}>${esc(c.label)} ${arrow}</a><p>${esc(c.note)}</p></div></div>`).join('')}</div></section>`;
}

// Original decorative diagrams: category signatures, not project screenshots.
function signature(category, seed = 0) {
  let body = '';
  if (category === 'learning') {
    const nodes = [[48,92],[90,45],[95,145],[153,75],[162,135],[210,40],[214,110],[272,82]];
    body = `<g class="sig-flow">${[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[3,6],[4,6],[5,7],[6,7]].map(([a,b]) => `<path d="M${nodes[a]} Q${(nodes[a][0]+nodes[b][0])/2},${nodes[b][1]} ${nodes[b]}"/>`).join('')}</g>${nodes.map(([x,y], i) => `<circle class="sig-node n${i%3}" cx="${x}" cy="${y}" r="${i===3?14:7}"/>`).join('')}`;
  } else if (category === 'simulation' || category === 'graphics') {
    body = `<g class="sig-land">${[0,1,2,3].map(i => `<path d="M50 ${108+i*12}l95 -51 109 40 -95 55z"/>`).join('')}<path d="M83 103l39 -47 30 24 29 -44 37 65"/><path d="M122 56v77m59 -97v98m-29 -54v73"/><circle class="sig-node n1" cx="181" cy="36" r="5"/></g>`;
  } else if (category === 'systems') {
    body = `<g class="sig-board">${[0,1,2].map(i => `<path d="M65 ${96-i*25}l102 -40 99 40 -102 46z"/>`).join('')}<path d="M90 115v-65m152 64V48M164 26v105"/><path class="sig-flow" d="M94 95l70 -27 68 27m-111 9 44 20 64 -31"/></g><circle class="sig-node n1" cx="164" cy="26" r="7"/>`;
  } else if (category === 'product') {
    body = `<g><rect x="60" y="32" width="210" height="130" rx="9"/><path d="M60 61h210m-157 0v101"/><circle cx="77" cy="47" r="3"/><circle cx="89" cy="47" r="3"/>${[0,1,2].map(i => `<rect class="sig-panel" x="${128+i*41}" y="78" width="31" height="42" rx="3"/>`).join('')}<path class="sig-flow" d="M128 133h103m-103 12h66"/></g>`;
  } else {
    body = `<g><rect x="44" y="61" width="72" height="70" rx="7"/><rect x="213" y="61" width="72" height="70" rx="7"/><path class="sig-flow" d="M116 96h97m-68 -20 20 20 -20 20"/><path d="M59 85l12 11 -12 11m23 0h20m128 -29h38m-38 17h24m-24 17h38"/></g>`;
  }
  return `<svg class="signature signature-${esc(category)}" viewBox="0 0 330 190" aria-hidden="true" style="--signature-delay:${seed%5 * -0.7}s"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

function card(p, index, compact = false) {
  const credits = p.credits || [];
  const image = projectImages[p.id] || (p.image ? { src:p.image } : null);
  const searchable = [p.name,p.area,p.category,p.summary,...p.tech,p.kind,p.status,...credits.map(c=>c.label)].join(' ');
  const art = ['homelab-platform','pico-audio-lab'].includes(p.id) ? labIllustration(p.id) : signature(p.category,index);
  return `<article class="archive-card${compact ? ' archive-card-small' : ''}" data-catalog-item data-catalog-category="${esc(p.category)}" data-search="${esc(searchable.toLowerCase())}" data-title="${esc(p.name.toLowerCase())}" data-order="${index}">
    <a class="archive-art${image?' has-capture':''}" href="${p.href}" tabindex="-1" aria-hidden="true">${image?`<img src="${image.src}" alt="" width="1400" height="800" loading="lazy">`:art}<span class="archive-id mono">${pad(index+1)} / ${image?'RECORDED PROJECT VIEW':esc(p.category)}</span></a>
    <div class="archive-card-body"><div class="archive-card-meta"><span class="mono">${esc(p.area)}</span><span class="archive-state">${esc(p.status)}</span></div><h2><a href="${p.href}">${esc(p.name)} ${arrow}</a></h2><p>${esc(p.summary)}</p><div class="archive-tech">${p.tech.slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="archive-origin"><span>${esc(projectKind(p))}</span>${credits.length?`<a href="${p.href}#credits" aria-label="Sources and credits for ${esc(p.name)}">${credits.length} ${credits.length===1?'source':'sources'} ↗</a>`:''}</div></div>
  </article>`;
}

function filters(labels, prefix) {
  return `<div class="index-filters" role="group" aria-label="Filter by topic"><button type="button" data-${prefix}-filter="all" aria-pressed="true">All</button>${Object.entries(labels).map(([id,label])=>`<button type="button" data-${prefix}-filter="${id}" aria-pressed="false">${esc(label)}</button>`).join('')}</div>`;
}

function searchBox(id,label,placeholder) {
  return `<label class="index-search" for="${id}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">${label}</span><input id="${id}" type="search" placeholder="${placeholder}" autocomplete="off" spellcheck="false"></label>`;
}

function topicCards(topics = researchTopics) {
  return topics.map((r,i)=>`<article class="dossier-card" data-research-item data-research-category="${esc(r.category)}" data-search="${esc([r.title,r.category,r.summary,r.question,...r.references.map(c=>c.label)].join(' ').toLowerCase())}"><div class="dossier-heading"><span class="mono">R${pad(i+1)} / ${esc(researchLabels[r.category] || r.category)}</span><span aria-hidden="true">↗</span></div><h2><a href="/research/${r.id}/">${esc(r.title)}</a></h2><p>${esc(r.summary)}</p><div class="dossier-bottom"><span>${esc(r.status)}</span><span>${r.references.length} primary ${r.references.length===1?'source':'sources'}</span></div></article>`).join('');
}

function atlas() {
  const groups = Object.keys(researchLabels).map(category=>({category,topics:researchTopics.filter(r=>r.category===category)})).filter(g=>g.topics.length);
  const positions = [[23,26],[70,19],[77,58],[54,83],[22,69]];
  return `<section class="atlas-section section-space" id="research" aria-labelledby="atlas-title"><div class="wrap">
    <div class="section-heading"><div><span class="section-kicker mono">02 / FOLLOW THE QUESTIONS</span><h2 id="atlas-title">A map of<br><em>what I’m exploring.</em></h2></div><p>Learning systems, synthetic worlds, and the questions underneath them. Follow a thread from an idea to its sources and experiments.</p></div>
    <div class="research-atlas" data-atlas><div class="atlas-map"><div class="atlas-graticule" aria-hidden="true"></div><svg class="atlas-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${groups.map((g,i)=>`<path class="atlas-connection" data-atlas-line="${g.category}" d="M48 48 Q${positions[i][0]} 48 ${positions[i][0]} ${positions[i][1]}"/>`).join('')}</svg><div class="atlas-center" aria-hidden="true"><span class="atlas-star">✳</span><span class="mono">CURIOSITY<br>→ EXPERIMENT</span></div>${groups.map((g,i)=>`<button class="atlas-node" type="button" data-atlas-category="${g.category}" aria-pressed="${i===0}" style="--x:${positions[i][0]}%;--y:${positions[i][1]}%"><span class="atlas-node-dot" aria-hidden="true"></span><span class="mono">0${i+1} / ${pad(g.topics.length)} THREADS</span><strong>${researchLabels[g.category]}</strong></button>`).join('')}<span class="atlas-coordinate mono" aria-hidden="true">IDEAS · METHODS · EXPERIMENTS</span></div>
    <div class="atlas-sidebar"><span class="mono atlas-sidebar-label">SELECT A RESEARCH DIRECTION</span>${groups.map((g,i)=>`<section class="atlas-panel" data-atlas-panel="${g.category}" aria-labelledby="atlas-panel-${g.category}"><h3 id="atlas-panel-${g.category}">${researchLabels[g.category]}</h3><div class="atlas-topic-list">${g.topics.map(r=>`<a href="/research/${r.id}/"><span>${esc(r.title)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>`).join('')}<a class="text-link atlas-all" href="/research/">Read all ${researchTopics.length} research dossiers ${arrow}</a></div></div>
    <div class="atlas-footer"><span class="mono">CONNECTED BY QUESTIONS. GROUNDED IN SOURCES.</span><a href="/credits/">Meet the original authors ${arrow}</a></div>
  </div></section>`;
}

export function homeExpansion() {
  const candidates = ['craftax-live','ironforge','llm-forge','mcsim','realmforge','realm','aimforge','modelfit'];
  const chosen = candidates.map(id=>byId.get(id)).filter(Boolean).slice(0,6);
  for (const p of catalogProjects) { if (chosen.length >= 6) break; if(!chosen.some(c=>c.id===p.id)) chosen.push(byId.get(p.id)); }
  return {
    overview: `<div class="lab-overview wrap"><div class="overview-title"><span class="mono">THE OPEN NOTEBOOK</span><p>Things built.<br><em>Questions still open.</em></p></div><a href="/projects/"><strong>${pad(projectRecords.length)}</strong><span>projects & tools ${arrow}</span></a><a href="/research/"><strong>${pad(researchTopics.length)}</strong><span>research dossiers ${arrow}</span></a><a href="/credits/"><strong>${pad(sourceRecords.length)}</strong><span>credited sources ${arrow}</span></a></div>`,
    atlas: atlas(),
    archive: `<section class="archive-teaser wrap section-space" id="workbench" aria-labelledby="archive-title"><div class="section-heading"><div><span class="section-kicker mono">03 / BEYOND THE FEATURED EXPERIMENTS</span><h2 id="archive-title">The rest of<br><em>the workbench.</em></h2></div><p>Training tools, visual worlds, personal software, and the infrastructure that connects them. Explore the wider project archive.</p></div><div class="archive-preview-grid">${chosen.map((p,i)=>card(p,i,true)).join('')}</div><a class="archive-cta" href="/projects/"><span>Explore all ${projectRecords.length} projects</span><span class="mono">SEARCH / FILTER / FOLLOW THE SOURCES</span><span aria-hidden="true">↗</span></a></section>`,
    creditStrip: `<section class="credit-band wrap"><span class="credit-asterisk" aria-hidden="true">✳</span><div><span class="mono">GOOD WORK HAS A LINEAGE</span><h2>Credit belongs<br><em>with the work.</em></h2><p>Original implementations, upstream experiments, and research notes are labeled throughout. Follow the papers, repositories, datasets, and creators behind them.</p></div><a class="button button-outline" href="/credits/">Sources & acknowledgments ${arrow}</a></section>`
  };
}

const articleSections = sections => sections.map((s,i)=>`<section id="section-${i+1}"><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></section>`).join('');
const relatedLinks = ids => [...new Set(ids)].map(id=>byId.get(id)).filter(Boolean).map(p=>`<a href="${p.href}">${esc(p.name)} ${arrow}</a>`).join('');
const researchConnections = {
  'agents-tools-runtime':['001-agent','revolo','homelab-mcp'],
  'memory-retrieval-adaptation':['001-agent','llm-forge'],
  'evaluation-fixed-yardsticks':['toolcall-bench','craftax-live'],
  'gpu-execution-memory-wall':['gpu-roofline-probe','modelfit'],
  'low-bit-inference-quantization':['modelfit','quantization-fly-study'],
  'world-models-predictive-video':['craftax-live','mcsim','ironforge'],
  'from-scratch-learning-systems':['llm-forge','ironforge'],
  'immersive-web-graphics':['realmforge','newvox','webgl-reference-lab'],
  'spacetime-gravity-problem-time':['archived-physics-engine'],
  'time-entropy-information':['archived-physics-engine']
};
const expansionRoutes = ['/projects/','/research/','/credits/','/lab/','/lab/widgets/',...catalogProjects.map(p=>`/projects/${p.id}/`),...researchTopics.map(r=>`/research/${r.id}/`)];
export { expansionRoutes };

export function renderExpansion({ head, header, footer, write }) {
  const page = (title,desc,route,content,classes='')=>`<!doctype html><html lang="en"><head>${head(title,desc,route)}</head><body class="expansion-page ${classes}" id="top">${header}<main id="main">${content}</main>${footer}</body></html>`;
  const archiveHero = `<section class="index-hero wrap"><a class="back-link mono" href="/">← The research notebook</a><div class="index-hero-grid"><div><span class="section-kicker mono">THE WORKBENCH / ${pad(projectRecords.length)} ENTRIES</span><h1>Ideas made<br><em>tangible.</em></h1></div><div class="index-hero-note"><p>A wider look at my experiments, prototypes, and tools. Each record separates what I built, what I studied, and what comes from other people.</p><span class="mono">LEARNING · SIMULATION · SOFTWARE · GRAPHICS</span></div></div></section>`;
  write('projects/index.html',page('Project archive — Jancarlos Espinal','Browse AI experiments, simulation projects, developer tools, graphics, and personal software.','/projects/',`${archiveHero}<section class="wrap project-index" aria-label="Project archive" data-project-index><div class="index-toolbar">${searchBox('project-search','Search projects','Search projects, tools, or technologies…')}<label class="sort-control">Sort <select id="project-sort"><option value="default">Research first</option><option value="name">A–Z</option></select></label><div class="view-switch" role="group" aria-label="Project layout"><button type="button" data-layout="grid" aria-pressed="true" aria-label="Grid view">▦</button><button type="button" data-layout="list" aria-pressed="false" aria-label="List view">☰</button></div></div>${filters(categoryLabels,'catalog')}<div class="index-count"><span id="project-result-count" role="status">${projectRecords.length} projects</span><span class="mono">DOCUMENTED WORK · ORIGINAL AUTHORS CREDITED</span></div><div class="catalog-grid" id="catalog-grid">${projectRecords.map((p,i)=>card(p,i)).join('')}</div><div class="index-empty" id="project-empty" hidden><h2>No projects match that search.</h2><p>Try a technology, a project name, or another category.</p><button type="button" data-clear-search="project">Clear filters</button></div><p class="index-footnote">Related working copies and asset folders are grouped into their parent projects. A local repository or experiment is not presented as a published product. Bot service advertising remains retired.</p></section>`,'archive-page'));

  const researchHero = `<section class="index-hero wrap"><a class="back-link mono" href="/#research">← Research atlas</a><div class="index-hero-grid"><div><span class="section-kicker mono">THE READING ROOM / ${pad(researchTopics.length)} DOSSIERS</span><h1>Questions worth<br><em>staying with.</em></h1></div><div class="index-hero-note"><p>Notes from the literature, working hypotheses, and lessons from experiments. A reading record is different from a demonstrated result; each dossier makes that distinction.</p><a class="text-link" href="/credits/">Original authors & sources ${arrow}</a></div></div></section>`;
  write('research/index.html',page('Research reading room — Jancarlos Espinal','Explore research on learning, memory, embodied agents, AI systems, graphics, and foundations.','/research/',`${researchHero}<section class="wrap research-index" aria-label="Research dossiers" data-research-index><div class="index-toolbar">${searchBox('research-search','Search research','Search questions, methods, or authors…')}</div>${filters(researchLabels,'research')}<div class="index-count"><span id="research-result-count" role="status">${researchTopics.length} dossiers</span><span class="mono">A RESEARCH NOTEBOOK, WITH ITS SOURCES</span></div><div class="dossier-grid">${topicCards()}</div><div class="index-empty" id="research-empty" hidden><h2>No research matches that search.</h2><p>Try another question or a broader topic.</p><button type="button" data-clear-search="research">Clear filters</button></div></section>`,'reading-room'));

  for (const [index,p] of catalogProjects.entries()) {
    const image = projectImages[p.id];
    const art = image ? `<img src="${image.src}" alt="${esc(image.caption)}" width="1400" height="800" loading="lazy">` : ['homelab-platform','pico-audio-lab'].includes(p.id) ? labIllustration(p.id) : signature(p.category,index);
    const related = relatedLinks(p.related || []);
    const content = `<section class="detail-hero wrap"><a class="back-link mono" href="/projects/">← All projects</a><div class="detail-kicker"><span class="mono">${esc(p.area)} / ${esc(projectKind(p))}</span><span class="status">${esc(p.status)}</span></div><h1>${esc(p.name)}</h1><p class="detail-question">${esc(p.question)}</p><ul class="tech-tags">${p.tech.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section><div class="project-banner wrap"><div class="banner-signature">${art}<span class="mono">ORIGINAL CATEGORY STUDY · ${esc(p.category)}</span></div><div class="banner-question"><span class="mono">THE PROJECT</span><p>${esc(p.summary)}</p><a class="text-link" href="#credits">Sources & credit ${arrow}</a></div></div><div class="article-layout wrap"><aside class="article-aside"><span class="mono">IN THIS RECORD</span><nav aria-label="On this page">${p.sections.map((s,i)=>`<a href="#section-${i+1}">${esc(s.title)}</a>`).join('')}<a href="#credits">Sources & credit</a></nav><span class="mono">PROJECT TYPE</span><p>${esc(projectKind(p))}</p>${related?`<span class="mono">CONNECTED WORK</span><div class="related-links">${related}</div>`:''}</aside><article class="article-body">${articleSections(p.sections)}<div class="evidence-note"><span class="mono">RECORD & SCOPE</span><p>${esc(p.evidence)}</p></div>${creditsBlock(p.credits || [])}${p.links?.length?`<div class="article-links">${p.links.map(l=>`<a class="button button-outline" href="${esc(l.href)}"${external(l.href)}>${esc(l.label)} ${arrow}</a>`).join('')}</div>`:''}</article></div><section class="detail-next wrap"><span class="mono">KEEP EXPLORING</span><a href="/projects/">The project archive ${arrow}</a></section>`;
    const illustrated = image ? content.replace('class="project-banner wrap"','class="project-banner wrap project-capture-banner"').replace(`ORIGINAL CATEGORY STUDY · ${esc(p.category)}`,esc(image.caption)) : content;
    write(`projects/${p.id}/index.html`,page(`${p.name} — Project archive`,p.summary,`/projects/${p.id}/`,illustrated,'detail-page project-record'));
  }

  for (const [index,r] of researchTopics.entries()) {
    const related = relatedLinks([...(r.related || []), ...(researchConnections[r.id] || [])]);
    const content = `<section class="detail-hero wrap"><a class="back-link mono" href="/research/">← The reading room</a><div class="detail-kicker"><span class="mono">DOSSIER R${pad(index+1)} / ${esc(researchLabels[r.category])}</span><span class="status">${esc(r.status)}</span></div><h1>${esc(r.title)}</h1><p class="detail-question">${esc(r.question)}</p></section><div class="dossier-intro wrap"><span class="dossier-serial" aria-hidden="true">R${pad(index+1)}</span><p>${esc(r.summary)}</p><span class="mono">${r.references.length} PRIMARY SOURCES<br>READING · TESTING · REVISING</span></div><div class="article-layout wrap"><aside class="article-aside"><span class="mono">IN THIS DOSSIER</span><nav aria-label="On this page">${r.sections.map((s,i)=>`<a href="#section-${i+1}">${esc(s.title)}</a>`).join('')}<a href="#credits">Papers & references</a></nav>${related?`<span class="mono">CONNECTED EXPERIMENTS</span><div class="related-links">${related}</div>`:''}</aside><article class="article-body">${articleSections(r.sections)}<div class="evidence-note"><span class="mono">FROM THE RESEARCH RECORD</span><p>${esc(r.evidence)}</p></div>${creditsBlock(r.references,{title:'The people and ideas behind this question'})}</article></div><section class="detail-next wrap"><span class="mono">KEEP READING</span><a href="/research/">The reading room ${arrow}</a></section>`;
    write(`research/${r.id}/index.html`,page(`${r.title} — Research notebook`,r.summary,`/research/${r.id}/`,content,'detail-page research-dossier'));
  }

  const sourceCards = sourceRecords.map((c,i)=>`<article class="credit-record" data-source-item data-search="${esc([c.label,c.type,c.note,...c.usedBy.map(p=>p.label)].join(' ').toLowerCase())}"><span class="mono credit-number">${pad(i+1)}</span><div><span class="mono source-type">${esc(c.type)}</span><h2><a href="${esc(c.href)}"${external(c.href)}>${esc(c.label)} ${arrow}</a></h2><p>${esc(c.note)}</p><div class="source-usedby"><span>Referenced in</span>${c.usedBy.map(p=>`<a href="${p.href}">${esc(p.label)}</a>`).join('')}</div></div></article>`).join('');
  write('credits/index.html',page('Sources & acknowledgments — Jancarlos Espinal','Original authors, repositories, papers, software, datasets, and design references behind this portfolio.','/credits/',`<section class="index-hero wrap"><a class="back-link mono" href="/">← The research notebook</a><div class="index-hero-grid"><div><span class="section-kicker mono">SOURCES & ACKNOWLEDGMENTS</span><h1>Nothing built<br><em>in isolation.</em></h1></div><div class="index-hero-note"><p>Research has a lineage. These are the original authors, maintainers, tools, and ideas referenced across this notebook, with links back to their work.</p><span class="mono">${sourceRecords.length} DISTINCT SOURCES / ${projectRecords.length} PROJECT RECORDS</span></div></div></section><section class="credit-principles wrap"><div><span class="mono">01 / IMPLEMENTATION</span><h2>What I built</h2><p>Local code, experiments, and adaptations are described at their actual scope. Forks and extensions name the upstream project.</p></div><div><span class="mono">02 / RESEARCH</span><h2>What I studied</h2><p>Papers and methods remain the work of their authors. Reading or implementing a method is not a claim to invent it.</p></div><div><span class="mono">03 / MATERIALS</span><h2>What I used</h2><p>Software, datasets, typefaces, and visual references keep their attribution. Reference artwork is not claimed as original.</p></div></section><section class="wrap credit-index" aria-label="Source directory" data-source-index><div class="index-toolbar">${searchBox('source-search','Search sources','Find an author, repository, or project…')}</div><div class="index-count"><span id="source-result-count" role="status">${sourceRecords.length} sources</span><a href="/notices.txt">Website dependency notices ↗</a></div><div class="credit-directory">${sourceCards}</div><div class="index-empty" id="source-empty" hidden><h2>No sources match that search.</h2><button type="button" data-clear-search="source">Clear search</button></div></section>`,'credits-page'));
}
