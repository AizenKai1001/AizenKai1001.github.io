import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '..');
const distRoot = join(repoRoot, 'dist');

const findings = [];
const scopeIssues = [];
const allowances = new Map();
const seenFindings = new Set();

const placeholderWords = /\b(?:example|placeholder|sample|dummy|redacted|changeme|replace[_ -]?me|your[_ -]?(?:key|token|secret|password|username|user|name|host)|test[_ -]?(?:key|token|secret))\b/i;
const obviousPlaceholderValue = /(?:<[^>]+>|\$\{[^}]+\}|%[A-Z0-9_]+%|YOUR_[A-Z0-9_]+|REPLACE[_-]?ME|CHANGEME|REDACTED)/i;

const rules = [
  {
    category: 'mac-address',
    regex: /(?<![0-9a-f])(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}(?![0-9a-f])/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'local-account-path',
    regex: /(?:[a-z]:[\\/]Users[\\/][^\\/\s"'<>]+(?:[\\/][^\s"'<>]+)+|\/(?:home|Users)\/[^/\s"'<>]+(?:\/[^\s"'<>]+)+)/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'absolute-workspace-path',
    regex: /[a-z]:[\\/](?:dev|src|repos?|projects?|Documents|Desktop|Downloads|OneDrive|AppData)(?:[\\/][^\s"'<>`]+)+/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'unc-path',
    regex: /\\\\[a-z0-9._-]+\\[a-z0-9$._-]+(?:\\[^\s"'<>]+)*/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'private-key',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    category: 'known-secret-prefix',
    regex: /(?:gh[pousr]_[a-z0-9]{20,}|github_pat_[a-z0-9_]{20,}|sk-[a-z0-9_-]{20,}|xox[baprs]-[a-z0-9-]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'credential-assignment',
    regex: /(?:api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token|session[_-]?(?:id|token)|client[_-]?secret|password|passwd|authorization|cookie)\s*[:=]\s*["']?[^\s"']{12,}/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'bearer-or-basic-credential',
    regex: /\b(?:Bearer|Basic)\s+[a-z0-9._~+/=-]{20,}/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'jwt',
    regex: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    placeholdersAllowed: true,
  },
  {
    category: 'credentialed-url',
    regex: /(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/@:]+:[^\s/@]+@/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'webhook-credential',
    regex: /https?:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/\d+\/[a-z0-9._-]{20,}/gi,
    placeholdersAllowed: true,
  },
  {
    category: 'device-or-account-identifier',
    regex: /(?:device|machine|hardware|host|account)[_-]?(?:id|uuid)\s*[:=]\s*["']?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
    placeholdersAllowed: true,
  },
];

const textExtensions = new Set([
  '.cjs', '.css', '.csv', '.env', '.gitignore', '.gitattributes', '.html', '.ini', '.js', '.jsx', '.json',
  '.lock', '.md', '.mjs', '.scss', '.svg', '.toml', '.ts', '.tsx', '.txt', '.xml', '.yaml', '.yml',
]);
const binaryExtensions = new Set([
  '.avif', '.bmp', '.eot', '.gif', '.ico', '.jpeg', '.jpg', '.mp3', '.mp4', '.ogg', '.otf', '.pdf', '.png',
  '.ttf', '.wav', '.webm', '.webp', '.woff', '.woff2', '.zip',
]);
const textBasenames = new Set(['.gitattributes', '.gitignore', '.nojekyll', 'LICENSE', 'NOTICE', 'README']);

function bumpAllowance(kind) {
  allowances.set(kind, (allowances.get(kind) || 0) + 1);
}

function repoRelative(file) {
  return relative(repoRoot, file).replaceAll('\\', '/');
}

function runGit(args, options = {}) {
  const hasEncoding = Object.prototype.hasOwnProperty.call(options, 'encoding');
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: hasEncoding ? options.encoding : 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function gitRefExists(ref) {
  const result = spawnSync('git', ['rev-parse', '--verify', '--quiet', ref], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0;
}

function classifyByName(file) {
  const extension = extname(file).toLowerCase();
  const basename = file.replaceAll('\\', '/').split('/').pop();
  if (textExtensions.has(extension) || textBasenames.has(basename)) return 'text';
  if (binaryExtensions.has(extension)) return 'binary';
  return 'unknown';
}

function looksBinary(buffer) {
  const sampleLength = Math.min(buffer.length, 8192);
  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] === 0) return true;
  }
  return false;
}

function addFinding({ scope, file, line, category, commits = null }) {
  const commitKey = commits ? commits.join(',') : '';
  const key = `${scope}|${file}|${line}|${category}|${commitKey}`;
  if (seenFindings.has(key)) return;
  seenFindings.add(key);
  findings.push({ scope, file, line, category, commits });
}

function isPlaceholder(line, match) {
  if (obviousPlaceholderValue.test(match)) return true;
  if (placeholderWords.test(line)) return true;
  return false;
}

function isSecurityPatternLiteral(category, match) {
  if (category !== 'credential-assignment') return false;
  const assignment = match.match(/[:=]\s*["']?(.+)$/);
  return assignment ? /^(?:\||\\|\[|\(|\?)/.test(assignment[1]) : false;
}

function scanIpAddresses(line, record) {
  const ipv4 = /(?<!\d)(?:\d{1,3}\.){3}\d{1,3}(?!\d)/g;
  for (const match of line.matchAll(ipv4)) {
    const value = match[0];
    if (isIP(value) !== 4) continue;
    const octets = value.split('.').map(Number);
    const loopback = octets[0] === 127 || value === '0.0.0.0';
    const documentation = (octets[0] === 192 && octets[1] === 0 && octets[2] === 2)
      || (octets[0] === 198 && octets[1] === 51 && octets[2] === 100)
      || (octets[0] === 203 && octets[1] === 0 && octets[2] === 113);
    if (loopback) {
      bumpAllowance('loopback-address');
      continue;
    }
    if (documentation || isPlaceholder(line, value)) {
      bumpAllowance('documented-example-address');
      continue;
    }
    addFinding({ ...record, category: 'network-address' });
  }

  const ipv6Candidates = /(?<![a-z0-9_-])\[?[0-9a-f:]{2,}\]?(?![a-z0-9_-])/gi;
  for (const match of line.matchAll(ipv6Candidates)) {
    const value = match[0].replace(/^\[/, '').replace(/\]$/, '');
    if (!value.includes(':') || isIP(value) !== 6) continue;
    if (value === '::1' || value === '::') {
      bumpAllowance('loopback-address');
      continue;
    }
    if (isPlaceholder(line, value)) {
      bumpAllowance('documented-example-address');
      continue;
    }
    addFinding({ ...record, category: 'network-address' });
  }
}

function scanUrls(line, record) {
  const urls = /https?:\/\/(\[[^\]]+\]|[a-z0-9._-]+)(?::\d+)?/gi;
  const publicInfrastructureHosts = new Set([
    'cloudflare.com', 'developers.cloudflare.com', 'docker.com', 'docs.docker.com', 'github.com', 'n8n.io', 'docs.n8n.io',
  ]);
  for (const match of line.matchAll(urls)) {
    const rawHost = match[1];
    const host = rawHost.replace(/^\[/, '').replace(/\]$/, '').toLowerCase();
    if (host === 'localhost' || host === '0.0.0.0' || isIP(host) === 4 && host.startsWith('127.') || host === '::1') {
      bumpAllowance('loopback-url');
      continue;
    }
    if (isIP(host)) continue; // Address detector reports non-loopback IPs.
    if (host.endsWith('.local') || host.endsWith('.lan') || host.endsWith('.internal') || host.endsWith('.localdomain') || host.endsWith('.home.arpa') || !host.includes('.')) {
      if (!isPlaceholder(line, match[0])) addFinding({ ...record, category: 'internal-host-url' });
      else bumpAllowance('placeholder-host');
      continue;
    }
    const tunnelHost = host.endsWith('.trycloudflare.com') || host.endsWith('.ngrok.io') || host.endsWith('.ngrok-free.app') || host.endsWith('.loca.lt') || host.endsWith('.serveo.net');
    if (tunnelHost) {
      if (!isPlaceholder(line, match[0])) addFinding({ ...record, category: 'tunnel-endpoint-url' });
      else bumpAllowance('placeholder-host');
      continue;
    }
    const knownPublic = [...publicInfrastructureHosts].some(domain => host === domain || host.endsWith(`.${domain}`));
    if (!knownPublic && /(?:^|[.-])(?:webhooks?|tunnel|homelab|portainer|proxmox|nas|n8n)(?:[.-]|$)/i.test(host)) {
      if (!isPlaceholder(line, match[0])) addFinding({ ...record, category: 'infrastructure-endpoint-url' });
      else bumpAllowance('placeholder-host');
    }
  }
}

function scanLine(line, record) {
  scanIpAddresses(line, record);
  scanUrls(line, record);
  for (const rule of rules) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    for (const match of line.matchAll(regex)) {
      if (isSecurityPatternLiteral(rule.category, match[0])) {
        bumpAllowance('security-pattern-literal');
        continue;
      }
      if (rule.placeholdersAllowed && isPlaceholder(line, match[0])) {
        bumpAllowance('placeholder-secret-or-identifier');
        continue;
      }
      addFinding({ ...record, category: rule.category });
    }
  }
}

function scanText(text, scope, file, commit = null) {
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    scanLine(lines[index], { scope, file, line: index + 1, commits: commit ? [commit] : null });
  }
}

function scanBinary(buffer, scope, file, commit = null) {
  const representations = [];
  for (const encoding of ['latin1', 'utf16le']) {
    const decoded = buffer.toString(encoding);
    const strings = decoded.match(/[\x20-\x7E]{8,}/g) || [];
    representations.push(...strings);
  }
  for (const text of representations) {
    const before = findings.length;
    scanText(text, scope, file, commit);
    for (let index = before; index < findings.length; index += 1) findings[index].line = 'binary';
  }
}

function walkFiles(root) {
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(full));
    else if (entry.isFile()) result.push(full);
    else scopeIssues.push(`unsupported filesystem entry: ${repoRelative(full)}`);
  }
  return result;
}

function currentRepoFiles() {
  const output = runGit(['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
  return [...new Set(output.split('\0').filter(Boolean))].sort();
}

function scanFilesystemFile(fullPath, scope, displayPath) {
  const stat = lstatSync(fullPath);
  if (!stat.isFile()) {
    scopeIssues.push(`unsupported tracked entry: ${displayPath}`);
    return { text: 0, binary: 0 };
  }
  const buffer = readFileSync(fullPath);
  if (looksBinary(buffer)) {
    scanBinary(buffer, scope, displayPath);
    return { text: 0, binary: 1 };
  }
  scanText(buffer.toString('utf8'), scope, displayPath);
  return { text: 1, binary: 0 };
}

function scanCurrentTree() {
  const counts = { files: 0, text: 0, binary: 0 };
  for (const file of currentRepoFiles()) {
    const full = join(repoRoot, file);
    if (!existsSync(full)) {
      scopeIssues.push(`tracked/unignored file missing from worktree: ${file}`);
      continue;
    }
    const result = scanFilesystemFile(full, 'repo', file.replaceAll('\\', '/'));
    counts.files += 1;
    counts.text += result.text;
    counts.binary += result.binary;
  }
  return counts;
}

function scanDist() {
  const counts = { files: 0, text: 0, binary: 0 };
  if (!existsSync(distRoot)) {
    scopeIssues.push('generated publication output missing: dist/');
    return counts;
  }
  for (const full of walkFiles(distRoot)) {
    const display = `dist/${relative(distRoot, full).replaceAll('\\', '/')}`;
    const result = scanFilesystemFile(full, 'dist', display);
    counts.files += 1;
    counts.text += result.text;
    counts.binary += result.binary;
  }
  return counts;
}

function parseGrepLine(line) {
  const match = line.match(/^([^:]+):(.+?):(\d+):(.*)$/);
  if (!match) return null;
  return { commit: match[1], file: match[2], line: Number(match[3]), content: match[4] };
}

function candidateHistoryPattern() {
  const pieces = [
    '(?:\\d{1,3}\\.){3}\\d{1,3}',
    'https?://',
    '(?:[0-9a-f]{1,4}:){2,}',
    '[0-9a-f]{0,4}::[0-9a-f:]*',
    ...rules.map(rule => rule.regex.source),
  ];
  return pieces.map(source => `(?:${source})`).join('|');
}

function historyTree(commit) {
  const output = runGit(['ls-tree', '-r', '-z', commit]);
  return output.split('\0').filter(Boolean).map(record => {
    const match = record.match(/^(\d+)\s+(\w+)\s+([0-9a-f]+)\t(.*)$/);
    return match ? { mode: match[1], type: match[2], oid: match[3], file: match[4] } : null;
  }).filter(Boolean);
}

function scanHistory(baseRef) {
  const commits = runGit(['rev-list', '--reverse', `${baseRef}..HEAD`]).trim().split(/\s+/).filter(Boolean);
  const historyBinaryBlobs = new Set();
  const historyAggregate = new Map();
  const candidate = candidateHistoryPattern();

  for (const commit of commits) {
    const grep = spawnSync('git', ['grep', '-I', '-n', '-P', '-i', '-e', candidate, commit, '--'], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (grep.status !== 0 && grep.status !== 1) {
      scopeIssues.push(`history text scan failed for commit ${commit.slice(0, 7)}`);
    } else if (grep.status === 0) {
      for (const rawLine of grep.stdout.split(/\r?\n/).filter(Boolean)) {
        const parsed = parseGrepLine(rawLine);
        if (!parsed) {
          scopeIssues.push(`unparsed history grep result for commit ${commit.slice(0, 7)}`);
          continue;
        }
        const before = findings.length;
        scanLine(parsed.content, { scope: 'history', file: parsed.file, line: parsed.line, commits: [commit.slice(0, 7)] });
        for (const item of findings.slice(before)) {
          if (item.scope !== 'history') continue;
          const key = `${item.file}|${item.line}|${item.category}`;
          const existing = historyAggregate.get(key) || { ...item, commits: [] };
          if (!existing.commits.includes(commit.slice(0, 7))) existing.commits.push(commit.slice(0, 7));
          historyAggregate.set(key, existing);
        }
      }
    }

    for (const entry of historyTree(commit)) {
      if (entry.mode === '160000' || entry.type === 'commit') {
        scopeIssues.push(`submodule content not audited in history: ${entry.file}`);
        continue;
      }
      if (entry.mode === '120000') {
        scopeIssues.push(`symlink requires manual publication review in history: ${entry.file}`);
        continue;
      }
      const classification = classifyByName(entry.file);
      if (classification === 'unknown') {
        scopeIssues.push(`unknown historical file type not classified: ${entry.file}`);
        continue;
      }
      if (classification !== 'binary' || historyBinaryBlobs.has(entry.oid)) continue;
      historyBinaryBlobs.add(entry.oid);
      try {
        const buffer = runGit(['cat-file', 'blob', entry.oid], { encoding: null });
        const before = findings.length;
        scanBinary(buffer, 'history-binary', entry.file, commit.slice(0, 7));
        for (const item of findings.slice(before)) {
          const key = `${item.file}|binary|${item.category}`;
          const existing = historyAggregate.get(key) || { ...item, scope: 'history-binary', line: 'binary', commits: [] };
          if (!existing.commits.includes(commit.slice(0, 7))) existing.commits.push(commit.slice(0, 7));
          historyAggregate.set(key, existing);
        }
      } catch {
        scopeIssues.push(`historical binary blob could not be audited: ${entry.file}`);
      }
    }
  }

  for (let index = findings.length - 1; index >= 0; index -= 1) {
    if (findings[index].scope === 'history' || findings[index].scope === 'history-binary') findings.splice(index, 1);
  }
  for (const item of historyAggregate.values()) findings.push(item);
  return { commits: commits.length, binaryBlobs: historyBinaryBlobs.size };
}

function formatFinding(item) {
  const commitText = item.commits?.length ? ` commits=${item.commits.join(',')}` : '';
  return `[${item.scope}] ${item.file}:${item.line} ${item.category}${commitText}`;
}

function main() {
  let baseRef = process.env.PUBLICATION_BASE_REF;
  if (!baseRef) baseRef = gitRefExists('refs/remotes/origin/main') ? 'origin/main' : 'main';
  const currentTreeOnly = baseRef === 'HEAD';
  if (!gitRefExists(baseRef)) scopeIssues.push(`publication base ref unavailable: ${baseRef}`);

  let repoCounts = { files: 0, text: 0, binary: 0 };
  let distCounts = { files: 0, text: 0, binary: 0 };
  let historyCounts = { commits: 0, binaryBlobs: 0 };

  try { repoCounts = scanCurrentTree(); } catch (error) { scopeIssues.push(`current-tree scan failed: ${error?.name || 'Error'}`); }
  try { distCounts = scanDist(); } catch (error) { scopeIssues.push(`dist scan failed: ${error?.name || 'Error'}`); }
  if (!currentTreeOnly && gitRefExists(baseRef)) {
    try { historyCounts = scanHistory(baseRef); } catch (error) { scopeIssues.push(`history scan failed: ${error?.name || 'Error'}`); }
  }

  findings.sort((a, b) => `${a.scope}|${a.file}|${a.line}|${a.category}`.localeCompare(`${b.scope}|${b.file}|${b.line}|${b.category}`));
  const status = findings.length === 0 && scopeIssues.length === 0 ? 'PASS' : 'FAIL';
  console.log(`${status}: publication privacy audit`);
  console.log(`Mode: ${currentTreeOnly ? 'current-tree-only' : 'release-history'}; base=${baseRef}; repo files=${repoCounts.files} (text=${repoCounts.text}, binary=${repoCounts.binary}); dist files=${distCounts.files} (text=${distCounts.text}, binary=${distCounts.binary}); outgoing commits=${historyCounts.commits}; historical binary blobs=${historyCounts.binaryBlobs}.`);
  console.log(`Suspicious findings=${findings.length}; scope issues=${scopeIssues.length}; allowed generic/example matches=${[...allowances.values()].reduce((sum, value) => sum + value, 0)}.`);
  for (const item of findings) console.log(formatFinding(item));
  for (const issue of [...new Set(scopeIssues)].sort()) console.log(`[scope] ${issue}`);
  if (status === 'PASS') console.log('No suspicious publication patterns were found in the audited scope.');
  else console.log('Publication is blocked until all findings and scope issues are reviewed or removed. Matched values are intentionally never printed.');
  process.exitCode = status === 'PASS' ? 0 : 1;
}

main();
