#!/usr/bin/env node
/**
 * update-sitemap-lastmod.js
 *
 * Refreshes every <lastmod> in sitemap.xml from git history.
 *
 * Usage:
 *   node scripts/update-sitemap-lastmod.js [--root DIR]
 *
 * For each <url><loc>, the URL path is mapped to its source file
 * ("/" -> index.html, "/es/" -> es/index.html, "/depot.html" -> depot.html).
 * lastmod = committer date of the last commit touching that file
 * (`git log -1 --format=%cs`, TZ=UTC), or today's local date if the file has
 * uncommitted changes. Missing files, files without history, and shallow
 * clones (where history is unreliable) leave the entry unchanged with a warning.
 * Only the text inside <lastmod> is rewritten; all other bytes are preserved.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  let root = path.resolve(__dirname, '..');
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') {
      if (i + 1 >= argv.length) { console.error('--root requires a directory'); process.exit(2); }
      root = path.resolve(argv[++i]);
    } else if (a.startsWith('--root=')) {
      root = path.resolve(a.slice(7));
    } else {
      console.error('Unknown argument: ' + a);
      process.exit(2);
    }
  }
  return root;
}

function git(root, args) {
  const r = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    env: Object.assign({}, process.env, { TZ: 'UTC' }),
    windowsHide: true,
  });
  return { ok: r.status === 0 && !r.error, out: (r.stdout || '').trim() };
}

function todayLocal() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function urlToFile(loc) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(loc.trim()).pathname); }
  catch (e) { return null; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const rel = pathname.replace(/^\/+/, '');
  if (!rel || rel.split('/').some(s => s === '..')) return null;
  return rel;
}

function main() {
  const root = parseArgs(process.argv.slice(2));
  const sitemapPath = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found in ' + root);
    process.exit(1);
  }
  const original = fs.readFileSync(sitemapPath, 'utf8');

  const shallow = git(root, ['rev-parse', '--is-shallow-repository']).out === 'true';
  const today = todayLocal();
  let updated = 0, unchanged = 0;

  const result = original.replace(/<url>[\s\S]*?<\/url>/g, block => {
    const locM = /<loc>([\s\S]*?)<\/loc>/.exec(block);
    const lmM  = /(<lastmod>)([\s\S]*?)(<\/lastmod>)/.exec(block);
    if (!locM || !lmM) { unchanged++; return block; }

    const loc = locM[1].trim();
    const rel = urlToFile(loc);
    if (!rel) {
      console.warn('WARN: cannot map ' + loc + ' to a source file; unchanged');
      unchanged++; return block;
    }

    let date = null;
    const exists = fs.existsSync(path.join(root, ...rel.split('/')));
    const dirty = git(root, ['status', '--porcelain', '--', rel]);
    if (dirty.ok && dirty.out !== '') {
      date = today;
    } else if (!exists) {
      console.warn('WARN: ' + rel + ' not found for ' + loc + '; unchanged');
    } else if (shallow) {
      console.warn('WARN: shallow clone, git history unreliable for ' + rel + '; unchanged');
    } else {
      const log = git(root, ['log', '-1', '--format=%cs', '--', rel]);
      if (log.ok && /^\d{4}-\d{2}-\d{2}$/.test(log.out)) date = log.out;
      else console.warn('WARN: no git history for ' + rel + '; unchanged');
    }

    if (!date) { unchanged++; return block; }
    if (lmM[2] === date) unchanged++; else updated++;
    return block.slice(0, lmM.index) + lmM[1] + date + lmM[3] + block.slice(lmM.index + lmM[0].length);
  });

  if (result !== original) fs.writeFileSync(sitemapPath, result, 'utf8');
  console.log('sitemap.xml: ' + updated + ' updated, ' + unchanged + ' unchanged');
}

main();
