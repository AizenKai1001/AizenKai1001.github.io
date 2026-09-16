import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

import { researchTopics } from '../src/research.js';
import { featuredCredits, siteCredits } from '../src/credits.js';
import { systemGroups } from '../src/lab-systems.js';
import { widgetStudies } from '../src/widget-studies.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const outputDir = path.join(repoRoot, 'test-results');
const outputPath = path.join(outputDir, 'source-links.json');

const timeoutMs = Number.parseInt(process.env.SOURCE_LINK_TIMEOUT_MS || '8000', 10);
const concurrency = 4;
const maxHtmlBytes = 512 * 1024;

function cleanText(value = '') {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHtmlTitle(html) {
  const metaPatterns = [
    /<meta\s+[^>]*name=["']citation_title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']citation_title["'][^>]*>/i,
    /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i,
  ];

  for (const pattern of metaPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? cleanText(title.replace(/<[^>]+>/g, ' ')) : null;
}

async function readHtmlPrefix(response, controller) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';

  try {
    while (total < maxHtmlBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      text += decoder.decode(value, { stream: true });
      if (/<\/title>/i.test(text) || /citation_title|property=["']og:title/i.test(text)) break;
    }
  } finally {
    try { await reader.cancel(); } catch { /* response may already be closed */ }
    controller.abort();
  }

  return text;
}

function classifyHttp(status) {
  if (status >= 200 && status < 300) return 'reachable';
  if (status === 403 || status === 429) return 'blocked';
  if (status === 404 || status === 410) return 'broken';
  if (status === 401) return 'auth-required';
  return 'unreachable';
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'portfolio-source-link-check/1.0 (+https://github.com/AizenKai1001)',
        accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const classification = classifyHttp(response.status);
    let title = null;

    if (response.ok && /text\/html|application\/xhtml\+xml/i.test(contentType)) {
      const html = await readHtmlPrefix(response, controller);
      title = extractHtmlTitle(html);
    } else {
      try { await response.body?.cancel(); } catch { /* no-op */ }
    }

    return {
      url,
      classification,
      status: response.status,
      statusText: response.statusText,
      resolvedUrl: response.url || url,
      contentType,
      title,
      elapsedMs: Math.round(performance.now() - started),
      error: null,
    };
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return {
      url,
      classification: timedOut ? 'timeout' : 'unreachable',
      status: null,
      statusText: null,
      resolvedUrl: null,
      contentType: null,
      title: null,
      elapsedMs: Math.round(performance.now() - started),
      error: String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function addOccurrence(bucket, { href, label, note = '', source, owner = null, type = null }) {
  if (typeof href !== 'string' || !href.startsWith('https://')) return;
  if (!bucket.has(href)) bucket.set(href, []);
  bucket.get(href).push({ source, owner, type, label, note });
}

function collectReferences() {
  const refs = new Map();

  for (const topic of researchTopics) {
    for (const reference of topic.references || []) {
      addOccurrence(refs, {
        ...reference,
        source: 'research',
        owner: topic.id,
        type: topic.category,
      });
    }
  }

  for (const [projectId, credits] of Object.entries(featuredCredits || {})) {
    for (const credit of credits || []) {
      addOccurrence(refs, {
        ...credit,
        source: 'featured-credit',
        owner: projectId,
      });
    }
  }

  for (const credit of siteCredits || []) {
    addOccurrence(refs, {
      ...credit,
      source: 'site-credit',
      owner: 'site',
      type: credit.type || null,
    });
  }

  for (const group of systemGroups) {
    for (const credit of group.credits) addOccurrence(refs, { ...credit, source: 'lab-system', owner: group.id });
  }
  for (const widget of widgetStudies) {
    for (const credit of widget.credits) addOccurrence(refs, { ...credit, source: 'widget-study', owner: widget.id });
  }
  return refs;
}

async function addCatalogReferences(refs) {
  const catalogPath = path.join(repoRoot, 'src', 'catalog.js');
  try {
    await access(catalogPath, fsConstants.R_OK);
  } catch {
    return { present: false, projectCount: 0 };
  }

  const module = await import(`${pathToFileURL(catalogPath).href}?sourceLinkCheck=${Date.now()}`);
  const projects = Array.isArray(module.catalogProjects) ? module.catalogProjects : [];
  for (const project of projects) {
    for (const credit of project.credits || []) {
      addOccurrence(refs, {
        ...credit,
        source: 'catalog-credit',
        owner: project.id,
        type: project.category || null,
      });
    }
    for (const link of project.links || []) {
      addOccurrence(refs, {
        ...link,
        source: 'catalog-link',
        owner: project.id,
        type: project.category || null,
      });
    }
  }

  return { present: true, projectCount: projects.length };
}

const refs = collectReferences();
const catalog = await addCatalogReferences(refs);
const urls = [...refs.keys()].sort();

console.log(`Checking ${urls.length} distinct HTTPS references (concurrency=${concurrency}, timeout=${timeoutMs}ms)...`);
const checks = await mapLimit(urls, concurrency, checkUrl);

const results = checks.map((check) => ({
  ...check,
  occurrences: refs.get(check.url),
}));

const counts = results.reduce((acc, result) => {
  acc[result.classification] = (acc[result.classification] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  settings: {
    timeoutMs,
    concurrency,
    method: 'GET',
    redirect: 'follow',
    maxHtmlBytes,
  },
  inputs: {
    researchTopics: researchTopics.length,
    featuredCreditGroups: Object.keys(featuredCredits || {}).length,
    siteCredits: siteCredits?.length || 0,
    catalog,
  },
  summary: {
    distinctHttpsReferences: results.length,
    classifications: counts,
  },
  results,
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
console.log(JSON.stringify(report.summary, null, 2));

// Link availability is evidence for review, not a build gate. Bot blocks, rate limits,
// transient network failures, and publisher anti-automation must not fail the site build.
process.exitCode = 0;
