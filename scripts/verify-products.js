#!/usr/bin/env node
/**
 * verify-products.js
 *
 * Offline checks for the generated Products catalogue pages. Minimal for now (Task 5);
 * Task 8 extends this file with the full section list (tree, breadcrumbs, populated, i18n,
 * table, sitemap, llms, tracking, contrast, assets).
 *
 * Usage:  cd scripts && node verify-products.js      (exits non-zero on any failure)
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

const ROOT  = path.resolve(__dirname, '..');
const LANGS = ['en', 'es', 'pt', 'nl', 'fr'];
const PAGES = ['products/index.html', 'products/gear-reducers/index.html', 'products/gear-reducers/ocr-rp-series/index.html'];

let failed = 0;
let passed = 0;
function check(ok, msg) {
  if (ok) passed++;
  else { failed++; console.log(`FAIL  ${msg}`); }
}

for (const lang of LANGS) {
  for (const rel of PAGES) {
    const file = (lang === 'en' ? '' : `${lang}/`) + rel;
    const abs = path.join(ROOT, file);
    const exists = fs.existsSync(abs);
    check(exists, `${file}: missing`);
    if (!exists) continue;
    const raw = fs.readFileSync(abs, 'utf-8');
    const $ = cheerio.load(raw);
    const tree = $('.cat-tree');
    check(tree.length === 1, `${file}: expected one .cat-tree, found ${tree.length}`);
    check(tree.find('nav').length === 0 && !/<nav[\s>]/i.test($.html(tree)), `${file}: <nav> inside .cat-tree`);
    check(tree.is('nav') === false, `${file}: .cat-tree is a <nav> element`);
    const cur = tree.find('[aria-current="page"]').length;
    check(cur === 1, `${file}: expected exactly one aria-current="page" in the tree, found ${cur}`);
    if (lang !== 'en') {
      const bad = raw.match(/(^|[^/\w.-])assets\/[^"' )]*/g) || [];
      check(bad.length === 0, `${file}: ${bad.length} assets/ path(s) without a leading slash (${bad.slice(0, 3).join(', ')})`);
    }
  }
}

const hubFile = path.join(ROOT, 'products/index.html');
if (fs.existsSync(hubFile)) {
  const $ = cheerio.load(fs.readFileSync(hubFile, 'utf-8'));
  const tiles = $('a.tile');
  check(tiles.length === 1, `products/index.html: expected exactly one a.tile, found ${tiles.length}`);
  check(tiles.first().attr('href') === '/products/gear-reducers/', `products/index.html: tile href is ${tiles.first().attr('href')}, expected /products/gear-reducers/`);
}

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
