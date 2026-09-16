import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { identity, experiments, notes } from '../src/content.js';
import { homeExpansion, renderExpansion, expansionRoutes, creditsBlock, projectRecords } from './render-expansion.mjs';
import { labShowcase, renderLabPage } from './render-lab.mjs';
import { featuredCredits } from '../src/credits.js';

const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const arrow = '<span aria-hidden="true">↗</span>';
const write = (file, value) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, value.replace(/[\t ]+$/gm, ''), 'utf8');
};
const external = href => /^https:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
const themeInit = readFileSync('src/theme-init.js', 'utf8');

const head = (title, description, path = '/') => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f2f0e9">
  <meta name="color-scheme" content="light dark">
  <script>${themeInit}</script>
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <link rel="canonical" href="${identity.site}${path}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${identity.site}${path}">
  <meta property="og:image" content="${identity.site}/media/social-preview.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;650;700;750;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/style.css">
  <link rel="stylesheet" href="/src/experience.css">
  <link rel="stylesheet" href="/src/atlas.css">
  <link rel="stylesheet" href="/src/lab.css">
  <script type="module" src="/src/main.js"></script>`;

const header = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="reading-progress" aria-hidden="true"></div>
  <header class="site-header">
    <a class="identity" href="/" aria-label="Jancarlos Espinal, home">
      <span class="monogram" aria-hidden="true">je<span>✳</span></span>
      <span class="identity-text">Jancarlos Espinal<small>AI experiments & research</small></span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
      <a href="/#experiments">Experiments</a><a href="/projects/">Workbench</a><a href="/research/">Research</a><a href="/lab/">Homelab</a><a href="/credits/">Credits</a>
      <a class="nav-contact" href="/#contact">Let’s talk ${arrow}</a>
    </nav>
    <div class="header-tools">
      <button class="theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false" title="Switch to dark mode"><span class="theme-icon" aria-hidden="true"><svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.2 14.2A8.5 8.5 0 0 1 9.8 3.8a8.5 8.5 0 1 0 10.4 10.4Z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3.6"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg></span><span class="theme-label">Dark</span></button>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
    </div>
  </header>`;

const footer = `
  <footer class="site-footer wrap">
    <a class="footer-signature" href="/">Jancarlos Espinal<span>Always a work in progress.</span></a>
    <div class="footer-links"><a href="/projects/">Workbench ${arrow}</a><a href="/research/">Research ${arrow}</a><a href="/lab/">Homelab ${arrow}</a><a href="/credits/">Credits ${arrow}</a><a href="${identity.github}" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a><a href="mailto:${identity.email}">Email ${arrow}</a><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
    <div class="footer-bottom"><p>© 2026 · Made with curiosity.</p><div class="motion-settings"><button class="motion-toggle" type="button" aria-pressed="false" aria-label="Pause page animations"><span aria-hidden="true">Ⅱ</span> Pause motion</button><button class="motion-reset" type="button" title="Use your device's motion preference">Use device setting</button></div></div>
  </footer>`;

const chart = `
  <div class="plasticity-visual" role="img" aria-label="Plasticity Bench: late-to-early final loss ratio, backpropagation 0.62, reset 1.10, continual backpropagation 0.57. 400-task Adam run. A ratio below 1 means later tasks had lower loss.">
    <div class="chart-header"><span class="mono">PLASTICITY / 400 TASKS</span><span class="chart-key">Late ÷ early loss</span></div>
    <div class="chart-bars">
      <div class="chart-bar-row"><span>Backprop</span><div class="chart-track"><i style="--bar:51.67%"></i></div><b>0.62×</b></div>
      <div class="chart-bar-row"><span>Reset</span><div class="chart-track"><i style="--bar:91.67%"></i></div><b>1.10×</b></div>
      <div class="chart-bar-row"><span>Continual BP</span><div class="chart-track"><i style="--bar:47.5%"></i></div><b>0.57×</b></div>
    </div>
    <div class="chart-caption"><span class="small-dot"></span> The expected performance loss did not appear.</div>
    <span class="chart-footnote">Selected conditions · lower means better later-task learning</span>
  </div>`;

function experimentVisual(project) {
  if (project.id === 'plasticity') return chart;
  if (project.id === 'forgelab') return `<div class="audit-visual"><span class="mono">NEUROEVOLUTION / A REVISED RESULT</span><div class="audit-value">0 <small>/ 12</small></div><p>Old champions met the revised walking controls.</p><small>After the energy-artifact correction · recorded evaluation</small></div>`;
  if (project.image && existsSync(`public${project.image}`)) return `<div class="capture ${project.id}-capture"><img src="${project.image}" alt="${escape(project.alt)}" width="1400" height="875" loading="lazy" decoding="async"><span class="capture-caption">${project.id === 'distinction' ? 'Recorded prototype dashboard · cropped' : 'ViZDoom frame · upstream DOOMFLY asset'} <span aria-hidden="true">↗</span></span></div>`;
  const steps = project.id === 'forgegrad' ? ['Forward', 'Loss', 'Backward'] : ['Sense', 'Act', 'Evolve'];
  return `<div class="diagram-visual"><span class="mono">${escape(project.area)} / CONCEPTUAL OVERVIEW</span><div class="diagram-path">${steps.map(step => `<span>${step}</span>`).join('<i aria-hidden="true">→</i>')}</div><p>${escape(project.factLabel)}</p></div>`;
}

function experimentCard(project, index) {
  return `<article class="experiment-card${index === 0 ? ' featured' : ''}" data-category="${project.tag}">
    <a class="experiment-visual" href="/experiments/${project.id}/" aria-label="Explore ${escape(project.name)}">${experimentVisual(project)}</a>
    <div class="experiment-copy">
      <div class="card-meta"><span class="mono">${project.number} / ${escape(project.area)}</span><span class="status"><i aria-hidden="true"></i>${escape(project.status)}</span></div>
      <h3><a href="/experiments/${project.id}/">${escape(project.name)} ${arrow}</a></h3>
      <p class="experiment-question">${escape(project.question)}</p>
      <p class="experiment-summary">${escape(project.summary)}</p>
      <div class="credit-inline"><span>${project.id === 'doomfly' ? 'Upstream experiments · nftechie / DOOMFLY' : 'Local research implementation'}</span><a href="/experiments/${project.id}/#credits">Sources & credit ↗</a></div>
      ${index === 0 ? `<div class="featured-fact"><strong>${escape(project.fact)}</strong><span>${escape(project.factLabel)}<small>${escape(project.scope)}</small></span></div>` : ''}
      <div class="card-bottom"><ul class="tech-tags" aria-label="Technologies">${project.tech.map(t => `<li>${escape(t)}</li>`).join('')}</ul><a class="text-link" href="/experiments/${project.id}/">Read experiment <span aria-hidden="true">↗</span><span class="sr-only">: ${escape(project.name)}</span></a></div>
    </div>
  </article>`;
}

const expanded = homeExpansion();
const home = readFileSync('site/home.html', 'utf8')
  .replace('<!-- HEAD -->', head('Jancarlos Espinal — AI Experiments & Research', 'Exploring learning, memory, and behavior through non-neural AI, embodied simulations, neuroevolution, and controlled experiments.'))
  .replace('<!-- HEADER -->', header)
  .replace('<!-- EXPERIMENTS -->', experiments.filter(p => !p.compact).map(experimentCard).join('\n'))
  .replace('<!-- OTHER STUDIES -->', experiments.filter(p => p.compact).map(p => `<a class="other-study" data-category="${p.tag}" href="/experiments/${p.id}/"><div><span class="mono">${p.number} / ${escape(p.area)}</span><h3>${escape(p.name)}</h3><p>${escape(p.summary)}</p></div><span aria-hidden="true">↗</span></a>`).join('\n'))
  .replace('<!-- NOTES -->', notes.map(n => `<a class="notebook-row" href="/notes/${n.id}/"><span class="note-number mono">${n.number}</span><div><span class="note-area mono">${escape(n.area)}</span><h3>${escape(n.title)}</h3><p>${escape(n.summary)}</p></div><time class="mono">${n.date}</time><span class="note-arrow" aria-hidden="true">↗</span></a>`).join('\n'))
  .replace('<!-- FOOTER -->', footer)
  .replace('<!-- LAB OVERVIEW -->', expanded.overview)
  .replace('<!-- RESEARCH ATLAS -->', expanded.atlas)
  .replace('<!-- WORKBENCH -->', expanded.archive)
  .replace('<!-- HOMELAB & HARDWARE -->', labShowcase())
  .replace('<!-- CREDIT BAND -->', expanded.creditStrip)
  .replaceAll('%%EMAIL%%', identity.email)
  .replaceAll('%%GITHUB%%', identity.github)
  .replaceAll('%%COUNT%%', String(experiments.length).padStart(2, '0'));
write('index.html', home);

for (const project of experiments) {
  const path = `/experiments/${project.id}/`;
  write(`experiments/${project.id}/index.html`, `<!doctype html><html lang="en"><head>${head(`${project.name} — Jancarlos Espinal`, project.summary, path)}</head><body class="detail-page" id="top">${header}
    <main id="main">
      <section class="detail-hero wrap"><a class="back-link mono" href="/#experiments">← All experiments</a><div class="detail-kicker"><span class="mono">EXPERIMENT ${project.number} / ${escape(project.area)}</span><span class="status"><i aria-hidden="true"></i>${escape(project.status)}</span></div><h1>${escape(project.name)}</h1><p class="detail-question">${escape(project.question)}</p><ul class="tech-tags">${project.tech.map(t => `<li>${escape(t)}</li>`).join('')}</ul></section>
      <div class="detail-image wrap">${experimentVisual(project)}</div>
      <div class="article-layout wrap"><aside class="article-aside"><span class="mono">EXPERIMENT NOTES</span><p>${escape(project.scope)}</p><span class="mono">REVIEWED</span><p>${identity.reviewed}</p><a href="#credits" class="text-link">Sources & credit ${arrow}</a><a href="/#contact" class="text-link">Discuss this work ${arrow}</a></aside><article class="article-body"><p class="article-intro">${escape(project.intro)}</p>${project.sections.map(s => `<section><h2>${escape(s.title)}</h2><p>${escape(s.text)}</p></section>`).join('')}<div class="evidence-note"><span class="mono">EVIDENCE & SCOPE</span><p>${escape(project.evidence)}</p><p>These are personal project results. Tests and implementation reviews are not independent scientific replication. The project’s current source and lab data remain local unless a public source is explicitly linked below.</p></div>${creditsBlock(featuredCredits[project.id])}<div class="article-links">${project.links.map(l => `<a class="button button-outline" href="${l.href}"${external(l.href)}>${escape(l.label)} ${arrow}</a>`).join('')}</div></article></div>
      <section class="detail-next wrap"><span class="mono">KEEP EXPLORING</span><a href="/experiments/${experiments[(experiments.indexOf(project) + 1) % experiments.length].id}/">${escape(experiments[(experiments.indexOf(project) + 1) % experiments.length].name)} ${arrow}</a></section>
    </main>${footer}</body></html>`);
}

for (const note of notes) {
  const project = experiments.find(p => p.id === note.related);
  write(`notes/${note.id}/index.html`, `<!doctype html><html lang="en"><head>${head(`${note.title} — Research Notebook`, note.summary, `/notes/${note.id}/`)}</head><body class="detail-page note-page" id="top">${header}<main id="main"><section class="detail-hero wrap"><a class="back-link mono" href="/#notebook">← Research notebook</a><div class="detail-kicker"><span class="mono">${escape(note.area)}</span><time class="mono">${note.date}</time></div><h1>${escape(note.title)}</h1><p class="detail-question">${escape(note.summary)}</p></section><div class="article-layout wrap"><aside class="article-aside"><span class="mono">A WORKING NOTE</span><p>An observation from the lab, with its assumptions left visible.</p><a href="/experiments/${project.id}/" class="text-link">${escape(project.name)} ${arrow}</a></aside><article class="article-body"><p class="article-intro">${escape(note.intro)}</p>${note.sections.map(s => `<section><h2>${escape(s.title)}</h2><p>${escape(s.text)}</p></section>`).join('')}<div class="evidence-note"><span class="mono">FROM THE EXPERIMENT</span><p>${escape(project.evidence)}</p></div><a class="button" href="/experiments/${project.id}/">Explore ${escape(project.name)} ${arrow}</a></article></div></main>${footer}</body></html>`);
}

write('404.html', `<!doctype html><html lang="en"><head>${head('Page not found — Jancarlos Espinal', 'Return to the AI experiments and research notebook.', '/404.html')}<meta name="robots" content="noindex"></head><body id="top">${header}<main class="not-found wrap" id="main"><span class="mono">404 / AN UNEXPECTED RESULT</span><h1>This path is<br><em>unexplored.</em></h1><p>The page may have moved. The experiments and research notebook are still here.</p><a class="button" href="/">Back to the lab <span aria-hidden="true">↗</span></a></main>${footer}</body></html>`);

// Keep old shared links useful while retiring the previous bot/service pages.
const redirects = { 'ai': '/#experiments', 'website': '/#about', 'discord': '/#experiments', 'projects/js-bot': '/#experiments', 'projects/xerox-bot': '/#experiments' };
for (const [from, to] of Object.entries(redirects)) write(`public/${from}/index.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${identity.site}${to}"><title>The portfolio has moved</title></head><body><p>The portfolio now focuses on AI experiments and research. <a href="${to}">Explore the new site</a>.</p></body></html>`);

renderExpansion({ head, header, footer, write });
renderLabPage({ head, header, footer, write, projectRecords });
// Dependency notices travel with the static output; no font files are redistributed.
const threeLicense = readFileSync('node_modules/three/LICENSE','utf8');
write('public/notices.txt', `WEBSITE DEPENDENCY NOTICES\n\nThree.js (rendering engine and addons)\n${threeLicense}\n\nOther software, typography, research, and visual references are credited at /credits/.\n`);
const routes = ['/', ...experiments.map(p => `/experiments/${p.id}/`), ...notes.map(n => `/notes/${n.id}/`), ...expansionRoutes];
write('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path => `<url><loc>${identity.site}${path}</loc></url>`).join('')}</urlset>`);
write('public/.nojekyll', '');
console.log(`Rendered home, ${experiments.length} experiments, ${notes.length} notes, 404 and legacy redirects.`);
