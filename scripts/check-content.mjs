import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { experiments, notes } from '../src/content.js';
import { catalogProjects } from '../src/catalog.js';
import { researchTopics } from '../src/research.js';
import { expansionRoutes } from './render-expansion.mjs';

const root = resolve(process.argv[2] || 'dist');
assert(existsSync(join(root, 'index.html')), 'Run npm run build before npm run check.');
const read = file => readFileSync(file, 'utf8');
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk(root);
const expected = ['index.html', '404.html', ...experiments.map(p => `experiments/${p.id}/index.html`), ...notes.map(n => `notes/${n.id}/index.html`), ...expansionRoutes.map(path => `${path.slice(1)}index.html`)];
assert.equal(new Set([...experiments,...catalogProjects].map(p=>p.id)).size, experiments.length+catalogProjects.length, 'Duplicate project ids');
assert.equal(new Set(researchTopics.map(p=>p.id)).size, researchTopics.length, 'Duplicate research ids');
for (const record of [...catalogProjects,...researchTopics]) {
  assert(/^[a-z0-9-]+$/.test(record.id), `Invalid route id: ${record.id}`);
  assert(record.sections?.length >= 2, `Missing substantive content for ${record.id}`);
  for (const credit of record.credits || record.references || []) {
    assert(/^https:\/\//.test(credit.href), `Credit URL must be a public source: ${record.id}`);
    assert(credit.label?.length > 2 && credit.note?.length > 10, `Credit relationship missing: ${record.id}`);
  }
}
assert.equal(experiments.length, 6);
assert.equal(experiments.filter(p => p.tag === 'learning').length, 3);
assert.equal(experiments.filter(p => p.tag === 'simulation').length, 3);
let links = 0;

for (const route of expected) {
  const file = join(root, route);
  assert(existsSync(file), `Missing page: ${route}`);
  const html = read(file);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one H1 in ${route}`);
  assert(!/%%[A-Z]+%%|<!-- (?:HEAD|HEADER|FOOTER|NOTES|EXPERIMENTS) -->/.test(html), `Unresolved template in ${route}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${route}`);
  assert(/<html lang="en">/.test(html), `Missing document language: ${route}`);
  assert(/name="description"/.test(html), `Missing description: ${route}`);
}

for (const file of files.filter(file => extname(file) === '.html')) {
  const html = read(file);
  const relative = file.slice(root.length).replaceAll('\\', '/');
  const pageUrl = new URL(relative.replace(/index\.html$/, ''), 'https://portfolio.invalid');
  for (const [, raw] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const href = decode(raw);
    if (/^(?:https?:|mailto:|data:|tel:)/.test(href)) continue;
    assert.notEqual(href, '#', `Empty anchor in ${relative}`);
    const target = new URL(href, pageUrl);
    let destination = resolve(root, `.${decodeURIComponent(target.pathname)}`);
    assert(destination.startsWith(root), `Escaping local path in ${relative}`);
    if (existsSync(destination) && statSync(destination).isDirectory()) destination = join(destination, 'index.html');
    assert(existsSync(destination), `Broken ${href} in ${relative}`);
    if (target.hash && destination.endsWith('.html')) {
      const targetHtml = read(destination);
      assert(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `Missing anchor ${href} in ${relative}`);
    }
    links++;
  }
}

// Published first-party files must not bring back the retired integrations.
const forbidden = [/192\.168\.\d+\.\d+/, /(?:[A-Z]:\\(?:Users|dev)|[A-Z]:\/(?:Users|dev))\b/i, /corsproxy\.io/i, /password=|api[_-]?key\s*[=:]\s*['"]/i];
for (const file of files.filter(file => /\.(?:html|js|json|css|xml|txt)$/.test(file))) {
  const text = read(file);
  for (const pattern of forbidden) assert(!pattern.test(text), `Private/retired integration in ${file.slice(root.length)} (${pattern})`);
}
for (const asset of ['favicon.svg', 'robots.txt', 'sitemap.xml', 'media/research-study.webp', 'media/social-preview.jpg']) assert(existsSync(join(root, asset)), `Missing ${asset}`);

const distinction = JSON.parse(read(join(root, 'evidence/distinction.json')));
assert.equal(distinction.benchmark.heldOutVisual.correct, 480);
assert.equal(distinction.benchmark.heldOutVisual.noMotionBaseline.correct, 347);
assert.equal(distinction.scope.trainingSeeds.length, 5);
const plasticity = JSON.parse(read(join(root, 'evidence/plasticity.json')));
assert.equal(plasticity.scope.taskCount, 400);
assert.equal(plasticity.scope.armCount, 3);
const chartPage = read(join(root, 'experiments/plasticity/index.html'));
for (const arm of ['backprop', 'reset', 'cbp']) {
  const displayed = plasticity.results[arm].lateToEarlyLossRatio.toFixed(2);
  assert(chartPage.includes(`${displayed}×`), `Chart differs from exported ${arm} evidence`);
}
console.log(`PASS: ${expected.length} content pages, ${links} local links/assets, required metadata, evidence values, and published-output privacy checks.`);
