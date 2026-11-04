#!/usr/bin/env node
/**
 * verify-products.js
 *
 * Offline checks for the generated Products catalogue pages: page basics (Task 5) and the spec
 * table + filter scaffolding of every family with rows (Task 6);
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

// Spec §7: facts strip directly after the one-line description, above the hero.
const FAMILY_ORDER = 'crumbs h1 fam-desc #facts fam-hero #specs #dimensions #how #build #apps #support #faq fam-cta';

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
    const linkInSummary = $('summary a').length;
    check(linkInSummary === 0, `${file}: ${linkInSummary} link(s) inside <summary> (nested-interactive)`);
    $('a.tile').each((_, el) => {
      const img = $(el).find('img');
      if (img.length && $(el).find('.tile-name').text().trim()) {
        check(img.attr('alt') === '', `${file}: tile image next to a visible name must have alt="" (got "${img.attr('alt')}")`);
      }
    });
    if (rel.includes('ocr-rp-series')) {
      const order = $('.prod-main').children().map((_, el) => {
        const id = $(el).attr('id');
        if (id) return `#${id}`;
        const cls = ($(el).attr('class') || '').split(/\s+/)[0];
        return cls || el.tagName;
      }).get().join(' ');
      check(order === FAMILY_ORDER, `${file}: family section order is "${order}", expected "${FAMILY_ORDER}"`);
    }
    if (lang !== 'en') {
      const bad = raw.match(/(^|[^/\w.-])assets\/[^"' )]*/g) || [];
      check(bad.length === 0, `${file}: ${bad.length} assets/ path(s) without a leading slash (${bad.slice(0, 3).join(', ')})`);
    }
  }
}

// ── TABLE + FILTERS (Task 6, spec §7.1-7.2) ─────────────────
// For every family with rows, in every language: the full table is in the static HTML and agrees
// with the data; the filter UI is not in the markup (JS builds it); the rail holds no tree.
const { UI, NODES } = require('./products-data');
const T = require('./products-tree');
const FILTER_SRC = fs.readFileSync(path.join(__dirname, 'products-filters.js'), 'utf-8').replace(/\r\n/g, '\n').trim();
const PUBSET = T.published(NODES);
const PN = NODES.filter((n) => PUBSET.has(n.id));
for (const fam of PN.filter((n) => n.specs && n.specs.rows && n.specs.rows.length)) {
  const cols = fam.specs.columns;
  const rows = fam.specs.rows;
  for (const lang of LANGS) {
    const url = T.nodeUrl(PN, fam.id, lang);
    const file = `${url.replace(/^\//, '')}index.html`;
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) { check(false, `${file}: missing (family with rows)`); continue; }
    const $ = cheerio.load(fs.readFileSync(abs, 'utf-8'));
    const table = $('#specs table.spec-table');
    check(table.length === 1, `${file}: expected one table.spec-table inside #specs, found ${table.length}`);
    if (table.length !== 1) continue;
    const capId = table.find('caption').attr('id');
    check(table.find('caption').text().trim() !== '' && !!capId, `${file}: spec table caption missing, empty or without id`);
    const scroll = table.parent('.spec-scroll');
    check(scroll.length === 1 && scroll.attr('tabindex') === '0' && scroll.attr('role') === 'region' && scroll.attr('aria-labelledby') === capId,
      `${file}: table must sit in .spec-scroll with tabindex="0", role="region", aria-labelledby="${capId}"`);
    const heads = table.find('thead th');
    check(heads.length === cols.length + 1 && heads.filter('[scope="col"]').length === heads.length,
      `${file}: expected ${cols.length + 1} th scope="col" (columns + quote), found ${heads.filter('[scope="col"]').length}/${heads.length}`);
    cols.forEach((c, i) => {
      const want = UI[`col_${c.key}`][lang];
      const got = heads.eq(i).find('.col-name').text().trim();
      check(got === want, `${file}: header ${i + 1} is "${got}", expected "${want}"`);
      const unit = heads.eq(i).find('.unit').text().trim();
      check(unit === (c.unit ? `(${c.unit})` : ''), `${file}: header ${c.key} unit "${unit}", expected "${c.unit ? `(${c.unit})` : ''}"`);
    });
    const trs = table.find('tbody tr');
    check(trs.length === rows.length, `${file}: ${trs.length} table rows, data has ${rows.length}`);
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const bad = [];
    trs.each((i, el) => {
      const tr = $(el);
      const r = rows[i];
      if (!r) return;
      if (tr.attr('id') !== r.id) bad.push(`row ${i + 1}: id "${tr.attr('id')}", expected "${r.id}"`);
      if (tr.attr('hidden') !== undefined) bad.push(`${r.id}: hidden in static HTML`);
      const cells = tr.children('th, td');
      if (!cells.eq(0).is('th[scope="row"]') || cells.eq(0).text().trim() !== String(r.model)) bad.push(`${r.id}: first cell is not th scope="row" "${r.model}"`);
      cols.forEach((c, j) => {
        if (c.key === 'model') return;
        const cell = cells.eq(j).text().trim();
        const dv = tr.attr(`data-${c.key}`);
        if (dv !== String(r[c.key])) bad.push(`${r.id}: data-${c.key}="${dv}", data file has ${r[c.key]}`);
        if (cell !== dv) bad.push(`${r.id}: ${c.key} cell "${cell}" differs from data-${c.key}="${dv}"`);
        if (c.type === 'number' && !/^-?\d+(\.\d+)?$/.test(cell)) bad.push(`${r.id}: ${c.key} cell "${cell}" is not a plain point-decimal number`);
      });
      const a = cells.last().find('a');
      const href = `${prefix}/?service=${fam.serviceParam}&item=${r.id}#contact`;
      if (a.attr('href') !== href) bad.push(`${r.id}: quote href "${a.attr('href')}", expected "${href}"`);
      if (a.text().trim() !== UI.request_quote[lang]) bad.push(`${r.id}: quote label "${a.text().trim()}"`);
    });
    check(bad.length === 0, `${file}: ${bad.length} table problem(s): ${bad.slice(0, 5).join('; ')}`);
    // Filters: definitions inline, translated; no filter markup in the static HTML; script inlined once
    let defs = null;
    try { defs = JSON.parse($('script#filter-defs[type="application/json"]').html()); } catch (e) { defs = null; }
    check(!!defs, `${file}: script#filter-defs missing or not valid JSON`);
    if (defs) {
      const fcols = cols.filter((c) => c.filter);
      check(JSON.stringify(defs.columns.map((c) => c.key)) === JSON.stringify(fcols.map((c) => c.key)), `${file}: filter-defs columns ${defs.columns.map((c) => c.key)} != ${fcols.map((c) => c.key)}`);
      defs.columns.forEach((d) => check(d.label === UI[`col_${d.key}`][lang], `${file}: filter label for ${d.key} is "${d.label}", expected "${UI[`col_${d.key}`][lang]}"`));
      for (const [k, ui] of [['models', 'filter_models'], ['all', 'filter_all'], ['clear', 'filter_clear'], ['count', 'filter_count'], ['none', 'filter_none'], ['min', 'filter_min'], ['max', 'filter_max'], ['active', 'filter_active']]) {
        check(defs.strings && defs.strings[k] === UI[ui][lang], `${file}: filter-defs string "${k}" is "${defs.strings && defs.strings[k]}", expected UI.${ui}.${lang}`);
      }
      const sizes = [...new Set(rows.map((r) => String(r.size)))];
      const enumDef = defs.columns.find((c) => c.key === 'size');
      check(!!enumDef && JSON.stringify(enumDef.options) === JSON.stringify(sizes), `${file}: size options ${enumDef && enumDef.options} != ${sizes}`);
    }
    check($('.filters').length === 0, `${file}: .filters markup in the static HTML (must be built by JS)`);
    const inl = $('script:not([type])').filter((_, el) => ($(el).html() || '').replace(/\r\n/g, '\n').trim() === FILTER_SRC);
    check(inl.length === 1, `${file}: products-filters.js inlined ${inl.length} times (expected 1)`);
    check(!/localStorage|document\.cookie|fetch\(|XMLHttpRequest/.test(FILTER_SRC), `${file}: filter script uses storage or network`);
    check($('.prod-rail').children().length === 0, `${file}: rail must be empty in static HTML on a family with rows (JS puts the filters there)`);
    check($('#specs .cat-tree').length === 1, `${file}: the Categories tree must sit in #specs above the table on a family with rows`);
    check($('#specs .spec-filter-slot').length === 1, `${file}: #specs needs one .spec-filter-slot for the phone filters`);
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
