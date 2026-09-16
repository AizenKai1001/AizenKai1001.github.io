import { labObservation, systemGroups, stoppedSystems, operationPatterns } from '../src/lab-systems.js';
import { widgetStudies } from '../src/widget-studies.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const pad = n => String(n).padStart(2, '0');

function preview(widget, compact = false) {
  const kind = widget.id;
  const lines = (count = 5) => Array.from({length:count}, (_, i) => `<i style="--trace:${28+(i*19)%65}%"></i>`).join('');
  let body;
  if (kind === 'network-flow-attribution') {
    body = `<div class="widget-preview-network"><svg viewBox="0 0 290 100" aria-hidden="true"><g fill="none" stroke="currentColor"><path class="widget-signal" d="M23 30h58l33 40h84l32 -40h38M23 70h59l32 -40h84l32 40h38"/><circle cx="23" cy="30" r="6"/><circle cx="23" cy="70" r="6"/><rect x="124" y="33" width="42" height="34" rx="3"/><circle cx="267" cy="30" r="6"/><circle cx="267" cy="70" r="6"/></g></svg><div><span>COLLECT</span><span>SNAPSHOT</span><span>DISPLAY</span></div></div>`;
  } else if (kind === 'realm-runtime-observability' || kind === 'game-server-operations') {
    body = `<div class="widget-preview-logs"><div class="log-indices" aria-hidden="true">01<br>02<br>03<br>04<br>05</div><div class="log-strokes" aria-hidden="true">${lines()}</div></div><span class="preview-bottom-label">WRAPPED OUTPUT / ADAPTIVE HISTORY</span>`;
  } else if (kind === 'codex-usage-freshness') {
    body = `<div class="widget-preview-windows"><div><span>USAGE WINDOW</span><b aria-hidden="true">—</b><i></i></div><div><span>RESET WINDOW</span><b aria-hidden="true">—</b><i></i></div></div><div class="preview-freshness"><span aria-hidden="true">◌</span> Fresh · stale · unavailable</div>`;
  } else if (kind === 'clock-weather-utility') {
    body = `<div class="widget-preview-clock"><div class="clock-face" aria-hidden="true"><i></i><b></b></div><div><span class="mono">TIME / DATE</span><p>Conditions<br><em>at a glance.</em></p></div></div>`;
  } else if (kind === 'media-operations-panel') {
    body = `<div class="widget-preview-media"><span>LIBRARY</span><span>FILES</span><span>CAPACITY</span><div aria-hidden="true">${lines(3)}</div></div><span class="preview-bottom-label">AGGREGATES / NO PERSONAL TITLES</span>`;
  } else if (kind === 'resource-ring-gauges' || kind === 'cairo-ambient-visuals') {
    body = `<div class="widget-preview-rings" aria-hidden="true"><i></i><i></i><i></i><span>✳</span></div><span class="preview-bottom-label">${kind==='resource-ring-gauges'?'MEASUREMENTS + VISUAL TREATMENT':'DECORATIVE / NO SENSOR INPUT'}</span>`;
  } else if (kind === 'training-telemetry-console') {
    body = `<div class="widget-preview-training"><span class="mono">PHASE / PROGRESS / FRESHNESS</span><svg viewBox="0 0 300 95" aria-hidden="true"><path class="plot-grid" d="M0 25h300M0 55h300M0 85h300"/><path class="plot-line" d="M0 14 35 36 63 30 101 59 140 49 178 70 207 64 253 79 300 82"/></svg></div><span class="preview-bottom-label">ILLUSTRATED CHART / NOT A RUN RESULT</span>`;
  } else {
    body = `<div class="widget-preview-system">${['CPU / MEMORY','GRAPHICS / THERMALS','SERVICE STATE'].map(label=>`<div><span>${label}</span><b aria-hidden="true">—</b></div>`).join('')}<div class="system-strip" aria-hidden="true">${lines(7)}</div></div>`;
  }
  return `<div class="widget-preview${compact?' preview-compact':''}" data-widget-art><div class="widget-preview-top"><span class="mono">${compact?'PANEL STUDY':'SCHEMATIC VIEW'}</span><span class="widget-beacon" aria-hidden="true"></span></div>${body}<div class="widget-preview-foot mono">ILLUSTRATION · PRIVATE READINGS OMITTED</div></div>`;
}

function runtimeRow(service) {
  const state = service.state === 'running' ? 'Observed running' : 'Not running';
  return `<li><span class="runtime-dot" aria-hidden="true"></span><div><strong>${esc(service.name)}</strong><p>${esc(service.role)}</p><span class="runtime-type">${esc(service.type)}</span></div><span class="runtime-state">${state}</span></li>`;
}

export function systemsSection() {
  return `<section class="lab-systems-section wrap section-space" id="systems" aria-labelledby="systems-observed-title" data-system-index>
    <div class="section-heading"><div><span class="section-kicker mono">THE OPERATING NOTEBOOK</span><h2 id="systems-observed-title">More than<br><em>a stack of containers.</em></h2></div><p>The software, observers, and host services around the experiments. This selection is grounded in an inspection of the running lab.</p></div>
    <div class="observation-note"><span class="mono">OBSERVED ${esc(labObservation.label.toUpperCase())}</span><p>Recorded process state, not a live status feed. A running process does not by itself verify every application feature.</p></div>
    <div class="system-filters" role="group" aria-label="Filter lab systems"><button type="button" data-system-filter="all" aria-pressed="true">All systems</button>${systemGroups.map(g=>`<button type="button" data-system-filter="${g.id}" aria-pressed="false">${esc(g.title)}</button>`).join('')}</div>
    <p class="system-result mono" role="status">${systemGroups.length} system groups</p>
    <div class="system-group-grid">${systemGroups.map((g,i)=>`<article class="system-group" data-system-group="${g.id}"><div class="system-group-header"><span class="mono">${pad(i+1)} / ${g.id.toUpperCase()}</span><span class="system-group-glyph" aria-hidden="true">${['⌘','↗','▧','◎','▤','✳'][i]}</span></div><h3>${esc(g.title)}</h3><p class="system-group-summary">${esc(g.description)}</p><ul class="runtime-list">${g.services.map(runtimeRow).join('')}</ul><p class="system-lesson">${esc(g.lesson)}</p><a class="system-credit-link" href="/credits/">Platform sources & credits ${arrow}</a></article>`).join('')}</div>
    <details class="stopped-systems"><summary>Configured workloads that were not running at inspection <span aria-hidden="true">+</span></summary><p>Stored containers or service definitions remain available for later work. Their presence is not presented as an active runtime.</p><div>${stoppedSystems.map(s=>`<a href="${s.href}">${esc(s.name)} ${arrow}</a>`).join('')}</div></details>
    <div class="operation-patterns">${operationPatterns.map((p,i)=>`<article><span class="mono">PATTERN ${pad(i+1)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('')}</div>
  </section>`;
}

export function widgetTeaser() {
  const selected = ['system-service-overview','network-flow-attribution','realm-runtime-observability','codex-usage-freshness','clock-weather-utility','media-operations-panel'].map(id=>widgetStudies.find(w=>w.id===id)).filter(Boolean);
  return `<section class="widget-teaser wrap section-space" id="widgets" aria-labelledby="widget-teaser-title"><div class="section-heading"><div><span class="section-kicker mono">THE DESKTOP AS AN INSTRUMENT</span><h2 id="widget-teaser-title">Keep the signals<br><em>in sight.</em></h2></div><p>Conky panels connect host measurements, application APIs, cached snapshots, and logs. Explore the design without exposing the lab’s readings.</p></div><div class="widget-teaser-grid">${selected.map(w=>`<a class="widget-teaser-card" href="/lab/widgets/#${w.id}">${preview(w,true)}<div><span class="mono">${esc(w.group)}</span><h3>${esc(w.title)} ${arrow}</h3></div></a>`).join('')}</div><a class="archive-cta" href="/lab/widgets/"><span>Explore the widget collection</span><span class="mono">DATA / FRESHNESS / PRESENTATION</span>${arrow}</a></section>`;
}

export function renderWidgetPage({head,header,footer,write,creditsBlock}) {
  const content = `<section class="index-hero wrap"><a class="back-link mono" href="/lab/">← Homelab & hardware</a><div class="index-hero-grid"><div><span class="section-kicker mono">THE WIDGET COLLECTION</span><h1>A desktop that<br><em>tells a story.</em></h1></div><div class="index-hero-note"><p>Small purpose-built panels for the things I need to notice: resource use, service state, network flows, application behavior, and stale data.</p><span class="mono">CONKY / PYTHON / SHELL / LUA / CAIRO</span></div></div></section>
    <section class="widget-explorer wrap" aria-label="Widget studies" data-widget-explorer><div class="observation-note"><span class="mono">${esc(labObservation.label.toUpperCase())}</span><p>Six families represent the eight panels observed running. Stored training, game, and visual studies are labeled separately. Previews are original schematics, not screenshots or live telemetry.</p></div><div class="widget-explorer-layout"><nav class="widget-selector" aria-label="Choose a widget study">${widgetStudies.map((w,i)=>`<a href="#${w.id}" data-widget-select="${w.id}" aria-controls="${w.id}"><span class="mono">${pad(i+1)}</span><span>${esc(w.title)}<small>${esc(w.state)}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</nav><div class="widget-panels">${widgetStudies.map((w,i)=>`<article id="${w.id}" class="widget-study" data-widget-panel="${w.id}"><div class="widget-study-heading"><span class="mono">STUDY ${pad(i+1)} / ${esc(w.group.toUpperCase())}</span><span class="widget-study-state" data-state="${w.state==='Observed running'?'running':'stored'}">${esc(w.state)}</span></div><h2>${esc(w.title)}</h2><p class="widget-study-intro">${esc(w.summary)}</p>${preview(w)}<section class="widget-mechanism"><span class="mono">HOW IT WORKS</span><h3>From a source to a useful signal.</h3><p>${esc(w.mechanism)}</p></section><section class="widget-boundary"><span class="mono">WHAT THE PANEL CAN TELL YOU</span><p>${esc(w.limit)}</p></section>${creditsBlock(w.credits,{id:`${w.id}-credits`,title:'The tools behind the panel'})}</article>`).join('')}</div></div></section>`;
  write('lab/widgets/index.html',`<!doctype html><html lang="en"><head>${head('Homelab widgets — Jancarlos Espinal','Custom Conky widget studies for system telemetry, network attribution, application logs, quota freshness, media, and desktop graphics.','/lab/widgets/')}</head><body class="expansion-page widget-page" id="top">${header}<main id="main">${content}</main>${footer}</body></html>`);
}
