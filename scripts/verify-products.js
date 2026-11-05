#!/usr/bin/env node
/**
 * verify-products.js
 *
 * Offline checks for the generated Products catalogue (spec §11.1, without search and redirects).
 * Sections: structure, table, nav (Tasks 5-7), then tree, breadcrumbs, populated, i18n, sitemap,
 * llms, tracking, contrast, assets (Task 8). Every failure line is tagged with its section.
 *
 * Usage:  cd scripts && node verify-products.js [--root DIR] [--data FILE]
 *   --root DIR   check the site in DIR instead of this checkout (e.g. a worktree on origin/master)
 *   --data FILE  use another copy of products-data.js (for mutation tests on the data)
 * Exits non-zero on any failure.
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

let ROOT = path.resolve(__dirname, '..');
let DATA_FILE = './products-data';
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--root') ROOT = path.resolve(process.argv[++i]);
  else if (a === '--data') DATA_FILE = path.resolve(process.argv[++i]);
  else { console.error(`Unknown argument: ${a}`); process.exit(2); }
}
const LANGS = ['en', 'es', 'pt', 'nl', 'fr'];
const PAGES = ['products/index.html', 'products/gear-reducers/index.html', 'products/gear-reducers/ocr-rp-series/index.html'];

// Spec §7: facts strip directly after the one-line description, above the hero.
const FAMILY_ORDER = 'crumbs h1 fam-desc #facts fam-hero #specs #dimensions #how #build #apps #support #faq fam-cta';

let failed = 0;
let passed = 0;
let SECTION = 'structure';
const TALLY = {};
function check(ok, msg) {
  const t = TALLY[SECTION] || (TALLY[SECTION] = { passed: 0, failed: 0 });
  if (ok) { passed++; t.passed++; }
  else { failed++; t.failed++; console.log(`FAIL  [${SECTION}] ${msg}`); }
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
SECTION = 'table';
const { UI, NODES, HUB } = require(DATA_FILE);
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
      // Fix wave C4: the speed symbols n2 / n1 are not uppercased with the rest of the header
      if (c.key === 'n2' || c.key === 'n1') {
        const sym = heads.eq(i).find('.col-name .sym');
        check(sym.length === 1 && sym.text() === c.key, `${file}: header ${c.key} needs its symbol in <span class="sym">${c.key}</span> (found ${sym.length})`);
      }
    });
    {
      const css = $('style').map((_, el) => $(el).html()).get().join('\n');
      check(/\.spec-table thead th\{[^}]*text-transform:uppercase/.test(css), `${file}: spec-table headers are no longer uppercase`);
      check(/\.spec-table \.sym\{[^}]*text-transform:none/.test(css), `${file}: no ".spec-table .sym{text-transform:none}" rule (n2/n1 would render as N2/N1)`);
    }
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

// ── NAV (Task 7, spec §9) ───────────────────────────────────
// Every site page links to the Products hub from the desktop nav, the mobile menu and the footer
// (language-prefixed on language pages); Products is the active nav item only on Products pages;
// nav_products exists in every translations block; index.html has the quote_prefill template.
SECTION = 'nav';
function evalTranslations(raw, file) {
  const s = raw.indexOf('const translations = {');
  if (s === -1) return null;
  // The object closes at the first line that is exactly "};" after the start
  const m = /\r?\n\};/.exec(raw.slice(s));
  if (!m) return null;
  try {
    // Repo-owned source files only, the same eval the build scripts use (build-lang-pages.js)
    // eslint-disable-next-line no-eval
    return eval(`(${raw.slice(s + 'const translations = '.length, s + m.index + m[0].length - 1)})`);
  } catch (e) { check(false, `${file}: translations object does not evaluate (${e.message})`); return null; }
}
const SITE_PAGES = ['index.html', 'about.html', 'depot.html', 'projects.html', 'privacy.html']
  .concat(fs.readdirSync(path.join(ROOT, 'services')).filter((f) => f.endsWith('.html')).map((f) => `services/${f}`));
for (const lang of LANGS) {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  const hub = `${prefix}/products/`;
  const pages = SITE_PAGES.map((rel) => ({ file: (lang === 'en' ? '' : `${lang}/`) + rel, isProduct: false }))
    .concat([{ file: hub.replace(/^\//, '') + 'index.html', isProduct: true }])
    .concat(PN.map((n) => ({ file: T.nodeUrl(PN, n.id, lang).replace(/^\//, '') + 'index.html', isProduct: true })));
  for (const { file, isProduct } of pages) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) { check(false, `${file}: missing (nav check)`); continue; }
    const $ = cheerio.load(fs.readFileSync(abs, 'utf-8'));
    const desk = $(`.nav-links a[href="${hub}"]`).length;
    const mob = $(`.mobile-menu a[href="${hub}"]`).length;
    const foot = $(`.footer-links a[href="${hub}"]`).length;
    // Fix round 1: the full-screen menu must scroll when its links are taller than the screen (320x568)
    const css = $('style').map((_, el) => $(el).html()).get().join('\n');
    const menuRule = (css.match(/\.mobile-menu\s*\{[^}]*\}/) || [''])[0].replace(/\s+/g, ' ');
    check(/inset: ?0/.test(menuRule) && /overflow-y: ?auto/.test(menuRule) && /justify-content: ?safe center/.test(menuRule),
      `${file}: .mobile-menu rule must have inset:0, overflow-y:auto and justify-content:safe center (got "${menuRule.slice(0, 170)}")`);
    // Fix wave D1: the close button must not scroll away with the (scrollable) menu
    const closeRule = (css.match(/\.mobile-close\s*\{[^}]*\}/) || [''])[0].replace(/\s+/g, ' ');
    check(/position: ?fixed/.test(closeRule) && /top: ?20px/.test(closeRule) && /right: ?24px/.test(closeRule),
      `${file}: .mobile-close rule must have position:fixed; top:20px; right:24px (got "${closeRule.slice(0, 120)}")`);
    check(desk === 1, `${file}: desktop nav has ${desk} link(s) to ${hub} (expected 1)`);
    check(mob === 1, `${file}: mobile menu has ${mob} link(s) to ${hub} (expected 1)`);
    check(foot === 1, `${file}: footer has ${foot} link(s) to ${hub} (expected 1)`);
    const unprefixed = lang === 'en' ? 0 : $('a[href^="/products/"]').not('.footer-langs a').length;
    check(unprefixed === 0, `${file}: ${unprefixed} link(s) to /products/ without the /${lang} prefix`);
    const label = $(`.nav-links a[href="${hub}"]`).text().trim();
    if (desk === 1 && lang !== 'en') check(label !== 'Products', `${file}: Products nav label is English on a ${lang} page`);
    const activeProducts = $(`.nav-links a.active[href="${hub}"]`).length;
    const activeAll = $('.nav-links a.active').length;
    const isGold = (el) => /(^|;)\s*color:\s*var\(--gold\)/.test($(el).attr('style') || '');
    const mobGold = $(`.mobile-menu a[href="${hub}"]`).toArray().some(isGold);
    if (isProduct) {
      check(activeProducts === 1 && activeAll === 1, `${file}: Products must be the only active nav item (products active ${activeProducts}, active items ${activeAll})`);
      check(mobGold, `${file}: Products not highlighted in the mobile menu on a Products page`);
      const otherGold = $('.mobile-menu a').filter((_, el) => $(el).attr('href') !== hub && isGold(el)).length;
      check(otherGold === 0, `${file}: ${otherGold} other mobile-menu item(s) highlighted on a Products page`);
    } else {
      check(activeProducts === 0, `${file}: Products is the active nav item on a non-Products page`);
      check(!mobGold, `${file}: Products highlighted in the mobile menu on a non-Products page`);
    }
  }
}
for (const rel of ['index.html', 'about.html', 'depot.html', 'projects.html', 'privacy.html']) {
  const t = evalTranslations(fs.readFileSync(path.join(ROOT, rel), 'utf-8'), rel);
  check(!!t, `${rel}: translations object not found`);
  if (!t) continue;
  for (const lang of LANGS) {
    check(!!(t[lang] && typeof t[lang].nav_products === 'string' && t[lang].nav_products.trim()), `${rel}: translations.${lang}.nav_products missing`);
    if (rel === 'index.html') {
      const q = t[lang] && t[lang].quote_prefill;
      check(typeof q === 'string' && q.includes('{model}'), `${rel}: translations.${lang}.quote_prefill missing or without {model}`);
      check(q === UI.quote_prefill[lang], `${rel}: translations.${lang}.quote_prefill "${q}" differs from UI.quote_prefill.${lang}`);
    }
  }
}
{
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
  check(/reducers:\s*'Motors & Gear Reducers'/.test(home), 'index.html: ?service= map has no reducers entry');
  check(home.includes('^[A-Za-z0-9 ._/-]{1,60}$'), 'index.html: ?item= validation pattern missing');
}
// Fix round 2: the prefill must not move the scroll position away from #contact (setSelectionRange on
// an unfocused textarea scrolled the page 1450-2300 px short of the form), so no caret/focus/scroll calls.
for (const file of LANGS.map((l) => (l === 'en' ? '' : `${l}/`) + 'index.html')) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const s = raw.indexOf('function prefillQuoteMessage(');
  check(s !== -1, `${file}: prefillQuoteMessage() not found`);
  if (s === -1) continue;
  const body = raw.slice(s, raw.indexOf('\n}', s) + 2);
  const bad = body.match(/setSelectionRange|selectionStart|selectionEnd|\.focus\(|scrollIntoView|scrollTo\(|\.select\(/g) || [];
  check(bad.length === 0, `${file}: prefillQuoteMessage() calls ${bad.join(', ')} (moves the page away from #contact)`);
  check(/msg\.value = tpl\.replace\('\{model\}', function \(\) \{ return item; \}\)/.test(body), `${file}: prefillQuoteMessage() no longer sets the value text-only with the $-safe replacer`);
}

// ════════════════════════════════════════════════════════════
// Task 8 sections (spec §10, §11.1). Expected sets come from the data through the build's own
// pageList(), so a page, sitemap URL or llms line is checked against what the data publishes.
// ════════════════════════════════════════════════════════════
const B = require('./build-product-pages');
const BASE = 'https://www.q2m.io';
const PL = B.pageList(NODES);
const pid = (pg) => (pg.node ? pg.node.id : null);
const urlOf = (id, lang) => T.nodeUrl(PL.pn, id, lang);
const fileOf = (url) => `${url.replace(/^\//, '')}index.html`;
const EXPECTED = []; // every generated page: { lang, id, kind, url, file }
for (const pg of PL.pages) for (const lang of LANGS) EXPECTED.push({ lang, id: pid(pg), kind: pg.kind, url: urlOf(pid(pg), lang), file: fileOf(urlOf(pid(pg), lang)) });
const readRoot = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), 'utf-8') : null);
const LOADED = new Map();
for (const e of EXPECTED) {
  const raw = readRoot(e.file);
  if (raw !== null) LOADED.set(e.file, { raw, $: cheerio.load(raw) });
}
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text, s) => new RegExp(`(^|[^\\p{L}\\p{N}])${reEsc(s)}($|[^\\p{L}\\p{N}])`, 'u').test(text);

// Unpublished fixture (spec §11.1 populated-only): a child of the first category with empty rows and
// live false, added in memory only. It must never become published, a page, a sitemap URL, an llms
// line or a tree link.
const FIRST_CAT = PL.pages.find((pg) => pg.kind === 'category');
const L5 = (s) => ({ en: s, es: s, pt: s, nl: s, fr: s });
const FIXTURE = {
  id: 'zz-unpublished-fixture', parent: FIRST_CAT ? FIRST_CAT.node.id : null, slug: 'zz-unpublished-fixture', order: 999,
  live: false, name: L5('Zz Unpublished Fixture'), description: L5('Fixture node that must stay unpublished.'),
  specs: { columns: [{ key: 'model', type: 'text' }], rows: [] },
};
const WITH_FIX = NODES.concat([FIXTURE]);

// ── TREE ────────────────────────────────────────────────────
SECTION = 'tree';
for (const e of EXPECTED) {
  const pg = LOADED.get(e.file);
  if (!pg) { check(false, `${e.file}: missing`); continue; }
  const { $ } = pg;
  const tree = $('.cat-tree');
  if (tree.length !== 1) { check(false, `${e.file}: expected one .cat-tree, found ${tree.length}`); continue; }
  check(tree.is('div') && tree.attr('role') === 'navigation' && tree.attr('aria-label') === UI.categories[e.lang],
    `${e.file}: .cat-tree must be <div role="navigation" aria-label="${UI.categories[e.lang]}"> (got <${tree.prop('tagName')} role="${tree.attr('role')}" aria-label="${tree.attr('aria-label')}">)`);
  check(tree.find('nav').length === 0, `${e.file}: <nav> inside .cat-tree`);
  const hrefs = tree.find('a').map((_, a) => $(a).attr('href')).get();
  const want = [urlOf(null, e.lang)].concat(PL.pn.map((n) => urlOf(n.id, e.lang)));
  const missing = want.filter((u) => !hrefs.includes(u));
  const extra = hrefs.filter((u) => !want.includes(u));
  check(missing.length === 0, `${e.file}: tree is missing link(s) to ${missing.join(', ')}`);
  check(extra.length === 0, `${e.file}: tree has link(s) to unpublished or unknown page(s) ${extra.join(', ')}`);
  check(hrefs.length === want.length, `${e.file}: tree has ${hrefs.length} links, expected ${want.length} (hub + published nodes, no duplicates)`);
  const pre = e.lang === 'en' ? '/products/' : `/${e.lang}/products/`;
  const unpref = hrefs.filter((u) => !u.startsWith(pre));
  check(unpref.length === 0, `${e.file}: tree link(s) not under ${pre}: ${unpref.join(', ')}`);
  const cur = tree.find('[aria-current]');
  check(cur.length === 1 && cur.attr('aria-current') === 'page' && cur.attr('href') === e.url,
    `${e.file}: tree aria-current must be one link to the page itself (${e.url}); found ${cur.length}: ${cur.map((_, a) => `${$(a).attr('href')}=${$(a).attr('aria-current')}`).get().join(', ')}`);
}

// ── BREADCRUMBS ─────────────────────────────────────────────
SECTION = 'breadcrumbs';
const urlToFile = (u) => { const p = u.replace(BASE, ''); return p.endsWith('/') ? `${p.slice(1)}index.html` : p.slice(1); };
for (const e of EXPECTED) {
  const pg = LOADED.get(e.file);
  if (!pg) { check(false, `${e.file}: missing`); continue; }
  const { $ } = pg;
  const lis = $('.crumbs li');
  const vis = lis.map((i, el) => {
    const a = $(el).children('a');
    const s = $(el).children('span[aria-current="page"]');
    return { name: $(el).text().trim(), url: a.length ? BASE + a.attr('href') : (s.length ? 'CURRENT' : null) };
  }).get();
  let bl = null;
  try {
    const ld = JSON.parse($('script[type="application/ld+json"]').html());
    bl = (ld['@graph'] || []).find((x) => x['@type'] === 'BreadcrumbList');
  } catch (err) { bl = null; }
  check(!!bl, `${e.file}: no BreadcrumbList in the JSON-LD`);
  if (!bl) continue;
  const items = bl.itemListElement || [];
  check(items.length === vis.length, `${e.file}: visible trail has ${vis.length} items, BreadcrumbList has ${items.length}`);
  items.forEach((it, i) => {
    const v = vis[i] || {};
    check(it.name === v.name, `${e.file}: breadcrumb ${i + 1} visible "${v.name}" != BreadcrumbList "${it.name}"`);
    if (i < items.length - 1) {
      check(it.item === v.url, `${e.file}: breadcrumb ${i + 1} visible link ${v.url} != BreadcrumbList item ${it.item}`);
      check(fs.existsSync(path.join(ROOT, urlToFile(it.item))), `${e.file}: breadcrumb ancestor ${it.item} has no file (${urlToFile(it.item)})`);
    } else {
      check(v.url === 'CURRENT', `${e.file}: last breadcrumb must be a <span aria-current="page">, not a link`);
      check(it.item === BASE + e.url, `${e.file}: last BreadcrumbList item ${it.item} is not the page ${BASE + e.url}`);
    }
  });
}

// ── POPULATED-ONLY / UNPUBLISHED ABSENCE / ORPHANS ──────────
SECTION = 'populated';
{
  // Independent oracle for spec §5: published iff rows or live copy, or a published descendant
  const own = (n) => !!((n.specs && Array.isArray(n.specs.rows) && n.specs.rows.length) || n.live === true);
  const pubFix = T.published(WITH_FIX);
  const desc = (id) => WITH_FIX.filter((n) => n.parent === id);
  const expectPub = (n) => own(n) || desc(n.id).some(expectPub);
  for (const n of WITH_FIX) check(pubFix.has(n.id) === expectPub(n), `${n.id}: published=${pubFix.has(n.id)}, expected ${expectPub(n)} (rows/live rule)`);
  check(!pubFix.has(FIXTURE.id), `fixture ${FIXTURE.id} (empty rows, live false) is published`);
  // The build's generators, run on data + fixture, produce exactly what they produce without it
  const ids = (pl) => pl.pages.map((pg) => `${pg.kind}:${pid(pg)}`).join(' ');
  check(ids(B.pageList(WITH_FIX)) === ids(PL), `pageList with the fixture differs: ${ids(B.pageList(WITH_FIX))}`);
  const lm = new Map();
  check(B.sitemapLines(WITH_FIX, lm, 'D').join('\n') === B.sitemapLines(NODES, lm, 'D').join('\n'), 'sitemap block generated with the fixture differs from the one without it');
  for (const full of [false, true]) check(B.llmsLines(WITH_FIX, full).join('\n') === B.llmsLines(NODES, full).join('\n'), `${full ? 'llms-full' : 'llms'} block generated with the fixture differs`);
  // On disk: no file, sitemap URL, llms line or tree link for any unpublished node (fixture included)
  const sm = readRoot('sitemap.xml') || '';
  const llms = [readRoot('llms.txt') || '', readRoot('llms-full.txt') || ''];
  const allTreeHrefs = new Set();
  for (const { $ } of LOADED.values()) $('.cat-tree a').each((_, a) => allTreeHrefs.add($(a).attr('href')));
  for (const n of WITH_FIX.filter((x) => !pubFix.has(x.id))) {
    for (const lang of LANGS) {
      const u = T.nodeUrl(WITH_FIX, n.id, lang);
      check(!fs.existsSync(path.join(ROOT, u.replace(/^\//, ''))), `unpublished ${n.id}: ${u} exists on disk`);
      check(!sm.includes(`<loc>${BASE}${u}</loc>`), `unpublished ${n.id}: ${BASE}${u} is in sitemap.xml`);
      check(!allTreeHrefs.has(u), `unpublished ${n.id}: tree link to ${u}`);
      llms.forEach((txt, k) => check(!txt.includes(BASE + u), `unpublished ${n.id}: ${BASE}${u} in ${k ? 'llms-full.txt' : 'llms.txt'}`));
    }
    llms.forEach((txt, k) => check(!hasWord(txt, n.name.en), `unpublished ${n.id}: name "${n.name.en}" in ${k ? 'llms-full.txt' : 'llms.txt'}`));
  }
  // Orphans: every file in the five products/ trees is an expected page (spec §10 stale output)
  const want = new Set(EXPECTED.map((e) => e.file));
  const walk = (dir, out) => {
    if (!fs.existsSync(dir)) return out;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs, out); else out.push(path.relative(ROOT, abs).replace(/\\/g, '/'));
    }
    return out;
  };
  const onDisk = LANGS.flatMap((l) => walk(path.join(ROOT, l === 'en' ? '' : l, 'products'), []));
  const orphans = onDisk.filter((f) => !want.has(f));
  check(orphans.length === 0, `orphan file(s) in the products trees: ${orphans.join(', ')}`);
}

// ── i18n ────────────────────────────────────────────────────
SECTION = 'i18n';
{
  // Data: every language map (an object with an "en" key) has all 5 languages, non-empty, and
  // language copies of objects have the same keys as English.
  const bad = [];
  const walkL = (v, where) => {
    if (!v || typeof v !== 'object') return;
    if (!Array.isArray(v) && Object.prototype.hasOwnProperty.call(v, 'en')) {
      for (const l of LANGS) {
        const x = v[l];
        const empty = x === undefined || x === null || (typeof x === 'string' && x.trim() === '') || (Array.isArray(x) && !x.length);
        if (empty) bad.push(`${where}.${l}`);
        else if (typeof x !== typeof v.en) bad.push(`${where}.${l} (type ${typeof x}, en is ${typeof v.en})`);
        else if (typeof x === 'object' && !Array.isArray(x)) {
          const k0 = Object.keys(v.en).sort().join(','); const k1 = Object.keys(x).sort().join(',');
          if (k0 !== k1) bad.push(`${where}.${l} keys differ from en`);
        }
      }
      for (const l of LANGS) walkL(v[l], `${where}.${l}`);
      return;
    }
    for (const [k, x] of Object.entries(v)) if (k !== 'rows') walkL(x, `${where}.${k}`);
  };
  walkL(UI, 'UI'); walkL(HUB, 'HUB');
  NODES.forEach((n) => walkL(n, n.id));
  check(bad.length === 0, `${bad.length} missing/empty language value(s) in the data: ${bad.slice(0, 6).join(', ')}`);
  // Pages: no data-i18n*; no English generated string on es/pt/nl/fr pages (visible text and the
  // alt / aria-label / title / placeholder attributes), compared against the English side of UI,
  // HUB and every published node's name and description.
  const strings = [];
  const addL = (m, key) => { if (m && typeof m.en === 'string') strings.push({ key, m }); };
  for (const [k, m] of Object.entries(UI)) addL(m, `UI.${k}`);
  for (const k of ['title', 'description', 'lead', 'moreLine']) addL(LANGS.reduce((o, l) => (o[l] = HUB[l][k], o), {}), `HUB.${k}`);
  for (const n of PL.pn) { addL(n.name, `${n.id}.name`); addL(n.description, `${n.id}.description`); if (n.tileImage) addL(n.tileImage.alt, `${n.id}.tileImage.alt`); }
  for (const e of EXPECTED) {
    const pg = LOADED.get(e.file);
    if (!pg) continue;
    const { $ } = pg;
    check($('[data-i18n],[data-i18n-html],[data-i18n-alt],[data-i18n-aria]').length === 0, `${e.file}: data-i18n attribute(s) left in the page`);
    if (e.lang === 'en') continue;
    const body = $('body').clone();
    body.find('script, style, noscript, .footer-langs').remove();
    const attrs = $('[alt],[aria-label],[title],[placeholder]').map((_, el) => ['alt', 'aria-label', 'title', 'placeholder'].map((a) => $(el).attr(a) || '').join(' | ')).get().join(' | ');
    const text = `${body.text().replace(/\s+/g, ' ')} | ${attrs} | ${$('title').text()} | ${$('meta[name="description"]').attr('content') || ''}`;
    const hits = [];
    for (const { key, m } of strings) {
      const en = m.en;
      const loc = m[e.lang] || '';
      const pieces = en.split(/\{[^}]+\}/).map((s) => s.trim()).filter((s) => s.length >= 4);
      for (const p of pieces) if (!hasWord(loc, p) && hasWord(text, p)) hits.push(`${key} "${p}"`);
    }
    check(hits.length === 0, `${e.file}: English string(s) on a ${e.lang} page: ${hits.slice(0, 5).join('; ')}`);
  }
}

// ── SITEMAP ─────────────────────────────────────────────────
SECTION = 'sitemap';
{
  const sm = readRoot('sitemap.xml') || '';
  const locs = [...sm.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((m) => m[1]);
  const isProd = (u) => /^https:\/\/www\.q2m\.io\/(?:(?:es|pt|nl|fr)\/)?products\//.test(u);
  const prod = locs.filter(isProd);
  const want = EXPECTED.map((e) => BASE + e.url);
  const missing = want.filter((u) => !prod.includes(u));
  const extra = prod.filter((u) => !want.includes(u));
  check(missing.length === 0, `sitemap.xml is missing ${missing.length} Products URL(s): ${missing.slice(0, 5).join(', ')}`);
  check(extra.length === 0, `sitemap.xml has ${extra.length} Products URL(s) that are not published pages: ${extra.slice(0, 5).join(', ')}`);
  check(prod.length === new Set(prod).size, `sitemap.xml lists a Products URL more than once`);
  check(new Set(locs).size === locs.length, `sitemap.xml has duplicate <loc> entries`);
  check(!/xhtml:link|xmlns:xhtml/.test(sm), 'sitemap.xml contains xhtml:link / xmlns:xhtml (plain <url> entries only)');
  const s = sm.indexOf(B.MARK.sitemap.start);
  const en = sm.indexOf(B.MARK.sitemap.end);
  check(sm.split(B.MARK.sitemap.start).length === 2 && sm.split(B.MARK.sitemap.end).length === 2 && s < en,
    `sitemap.xml needs exactly one ${B.MARK.sitemap.start} ... ${B.MARK.sitemap.end} block`);
  if (s !== -1 && en > s) {
    const inBlock = [...sm.slice(s, en).matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((m) => m[1]);
    check(inBlock.length === prod.length && inBlock.every(isProd), `sitemap.xml: ${prod.length - inBlock.filter(isProd).length} Products URL(s) outside the generated block, ${inBlock.filter((u) => !isProd(u)).length} other URL(s) inside it`);
    // Block is current: regenerating it from the data (keeping the file's dates) gives the same bytes
    const lastmods = new Map();
    for (const m of sm.matchAll(/<url>[\s\S]*?<loc>\s*([^<]*?)\s*<\/loc>[\s\S]*?<lastmod>\s*([^<]*?)\s*<\/lastmod>[\s\S]*?<\/url>/g)) lastmods.set(m[1], m[2]);
    const regen = B.spliceBlock(sm, 'sitemap.xml', B.MARK.sitemap, B.sitemapLines(NODES, lastmods, 'NO-DATE'), '</urlset>', 0);
    check(regen === sm, 'sitemap.xml products block is stale (differs from what build-product-pages.js generates); run npm run build-all');
    const bad = [...sm.slice(s, en).matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].filter((m) => !/^\d{4}-\d{2}-\d{2}$/.test(m[1]));
    check(bad.length === 0, `sitemap.xml products block: ${bad.length} lastmod value(s) not YYYY-MM-DD`);
  }
  // Every hreflang alternate (and the canonical) on a Products page is itself a sitemap URL
  for (const e of EXPECTED) {
    const pg = LOADED.get(e.file);
    if (!pg) continue;
    const { $ } = pg;
    const alts = $('link[rel="alternate"][hreflang]').map((_, l) => $(l).attr('href')).get();
    check(alts.length === LANGS.length + 1, `${e.file}: ${alts.length} hreflang alternates (expected ${LANGS.length} + x-default)`);
    const notIn = [...new Set(alts.concat([$('link[rel="canonical"]').attr('href')]))].filter((u) => !locs.includes(u));
    check(notIn.length === 0, `${e.file}: hreflang/canonical URL(s) not in sitemap.xml: ${notIn.join(', ')}`);
  }
}

// ── LLMS ────────────────────────────────────────────────────
SECTION = 'llms';
for (const [rel, full] of [['llms.txt', false], ['llms-full.txt', true]]) {
  const txt = readRoot(rel) || '';
  const lines = txt.split(/\r?\n/);
  const si = lines.indexOf(B.MARK.llms.start);
  const ei = lines.indexOf(B.MARK.llms.end);
  const nStart = lines.filter((l) => l === B.MARK.llms.start).length;
  const nEnd = lines.filter((l) => l === B.MARK.llms.end).length;
  check(nStart === 1 && nEnd === 1 && si < ei, `${rel}: needs exactly one "${B.MARK.llms.start}" ... "${B.MARK.llms.end}" block (found ${nStart} / ${nEnd})`);
  const block = si !== -1 && ei > si ? lines.slice(si, ei + 1) : [];
  const urls = block.flatMap((l) => l.match(/https:\/\/www\.q2m\.io\/[^\s)]*/g) || []);
  const want = EXPECTED.filter((e) => e.lang === 'en').map((e) => BASE + e.url);
  const missing = want.filter((u) => !urls.includes(u));
  const extra = urls.filter((u) => !want.includes(u));
  check(missing.length === 0, `${rel}: products block is missing ${missing.join(', ')}`);
  check(extra.length === 0, `${rel}: products block lists URL(s) that are not published pages: ${extra.join(', ')}`);
  check(urls.length === want.length, `${rel}: products block has ${urls.length} URLs, expected ${want.length}`);
  for (const ent of B.llmsEntries(NODES)) {
    const line = block.find((l) => l.includes(`${ent.url} `) || l.endsWith(ent.url));
    check(!!line && line.includes(`${ent.name}: ${ent.url}`), `${rel}: no "${ent.name}: ${ent.url}" line in the products block`);
  }
  const outside = lines.filter((l, i) => (i < si || i > ei) && /q2m\.io\/(?:(?:es|pt|nl|fr)\/)?products\//.test(l));
  check(outside.length === 0, `${rel}: ${outside.length} Products URL line(s) outside the generated block: ${outside.slice(0, 2).join(' | ')}`);
  if (block.length) {
    const regen = B.spliceBlock(txt, rel, B.MARK.llms, B.llmsLines(NODES, full), '## About page and Privacy Policy', 1);
    check(regen === txt, `${rel}: products block is stale (differs from what build-product-pages.js generates); run npm run build-all`);
  }
}

// Fix wave D2: spliceBlock with BOTH markers gone must fail loudly when the file already has
// Products URLs/lines (no second block), and still insert into a file that has none.
{
  const cases = [
    ['sitemap.xml', B.MARK.sitemap, '</urlset>', 0, (l) => /\/products\//.test(l)],
    ['llms.txt', B.MARK.llms, '## About page and Privacy Policy', 1, (l) => /\/products\/|^## Products/.test(l)],
  ];
  for (const [rel, mark, anchor, gap, isProd] of cases) {
    const raw = readRoot(rel) || '';
    const noMarks = raw.split('\n').filter((l) => !l.includes(mark.start) && !l.includes(mark.end)).join('\n');
    let err = '';
    try { B.spliceBlock(noMarks, rel, mark, ['NEW BLOCK'], anchor, gap); } catch (e) { err = e.message; }
    check(err.startsWith(`${rel}:`) && /Products/.test(err), `${rel}: spliceBlock without markers but with Products content must throw (got ${err ? `"${err}"` : 'no error'})`);
    let s = raw.indexOf(mark.start); s = raw.lastIndexOf('\n', s) + 1;
    const e = raw.indexOf(mark.end) + mark.end.length;
    const clean = (raw.slice(0, s) + raw.slice(e)).split('\n').filter((l) => !isProd(l)).join('\n');
    let out = null;
    try { out = B.spliceBlock(clean, rel, mark, ['NEW BLOCK'], anchor, gap); } catch (x) { out = x.message; }
    check(typeof out === 'string' && out.split('NEW BLOCK').length === 2, `${rel}: spliceBlock into a file with no block and no Products content must insert once (got ${String(out).slice(0, 80)})`);
  }
}

// ── TRACKING ────────────────────────────────────────────────
// No storage, cookies, analytics, beacons or fetch in the Products pages or the filter script. The only
// third-party requests are the cloned shell's Google Fonts and the jsdelivr flag CSS (site-wide, allow-listed by URL).
SECTION = 'tracking';
{
  const GF = 'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Share+Tech+Mono&display=swap';
  const ALLOW = new Set([GF, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net',
    'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css']);
  const BAD = /localStorage|document\.cookie|gtag|analytics|sendBeacon|XMLHttpRequest|fetch\s*\(/i;
  const filt = readRoot('scripts/products-filters.js');
  check(filt !== null, 'scripts/products-filters.js: missing');
  const srcs = [...LOADED.entries()].map(([f, p]) => [f, p.raw]).concat(filt === null ? [] : [['scripts/products-filters.js', filt]]);
  for (const [f, raw] of srcs) {
    const m = raw.match(new RegExp(BAD.source, 'gi')) || [];
    check(m.length === 0, `${f}: tracking/storage/network string(s): ${[...new Set(m)].join(', ')}`);
    if (!f.endsWith('.html')) continue;
    // Raw tag scan (also sees markup inside <noscript>): resource URLs of script/link/img/source/iframe/...
    const off = [];
    for (const t of raw.matchAll(/<(script|link|img|source|iframe|embed|object|audio|video|track)\b[^>]*>/gi)) {
      if (/^link$/i.test(t[1]) && /rel=["'](?:canonical|alternate)["']/i.test(t[0])) continue;
      for (const a of t[0].matchAll(/\s(?:src|href|srcset|data|poster)=["']([^"']+)["']/gi)) {
        const u = a[1].replace(/&amp;/g, '&');
        if (/^(https?:)?\/\//i.test(u) && !u.startsWith(`${BASE}/`) && !ALLOW.has(u)) off.push(u);
      }
    }
    check(off.length === 0, `${f}: third-party resource(s) not on the allow-list: ${off.slice(0, 3).join(', ')}`);
  }
}

// ── CONTRAST ────────────────────────────────────────────────
// The Products CSS never colours text with --text-3; and no shell rule that does matches anything
// inside main.products-page (the shell's .page-hero p.page-updated rule is removed with the hero).
SECTION = 'contrast';
{
  const TEXT3 = /(^|[{;\s])color\s*:\s*var\(\s*--text-3\s*\)/;
  const rules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
  for (const e of EXPECTED) {
    const pg = LOADED.get(e.file);
    if (!pg) continue;
    const { $ } = pg;
    const pc = $('style#products-css');
    check(pc.length === 1, `${e.file}: expected one <style id="products-css">, found ${pc.length}`);
    if (pc.length !== 1) continue;
    const prs = rules(pc.html());
    const unscoped = prs.filter((r) => r.sel.split(',').some((s) => !s.trim().startsWith('.products-page')));
    check(unscoped.length === 0, `${e.file}: products CSS rule(s) not scoped to .products-page: ${unscoped.map((r) => r.sel).slice(0, 3).join(' | ')}`);
    const t3 = prs.filter((r) => TEXT3.test(`;${r.body}`));
    check(t3.length === 0, `${e.file}: products CSS sets text colour with --text-3: ${t3.map((r) => r.sel).join(' | ')}`);
    const main = $('main.products-page');
    const shell = $('style').not('#products-css').map((_, s) => $(s).html()).get().join('\n');
    for (const r of rules(shell).filter((x) => TEXT3.test(`;${x.body}`))) {
      for (const sel of r.sel.split(',')) {
        const plain = sel.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').trim();
        let n = 0;
        try { n = main.find(plain).length + (main.is(plain) ? 1 : 0); } catch (err) { n = -1; }
        check(n === 0, `${e.file}: shell rule "${sel.trim()}" sets color:var(--text-3) and matches ${n === -1 ? '(unparseable selector)' : n} element(s) in the Products content`);
      }
    }
  }
}

// ── ASSETS ──────────────────────────────────────────────────
SECTION = 'assets';
{
  const OIL = /\b(Agip|Aral|Castrol|Esso|Mobil|Shell|Texaco|Danfoss)\b/g;
  for (const e of EXPECTED) {
    const pg = LOADED.get(e.file);
    if (!pg) continue;
    const { $, raw } = pg;
    const refs = $('img[src]').map((_, el) => $(el).attr('src')).get()
      .concat($('source[srcset]').map((_, el) => $(el).attr('srcset').split(',').map((c) => c.trim().split(/\s+/)[0])).get());
    const dir = path.posix.dirname(e.file);
    const gone = refs.filter((u) => !/^(https?:|data:)/.test(u)).filter((u) => {
      const clean = u.split(/[?#]/)[0];
      const rel = clean.startsWith('/') ? clean.slice(1) : path.posix.join(dir, clean);
      return !fs.existsSync(path.join(ROOT, rel));
    });
    check(gone.length === 0, `${e.file}: ${gone.length} image reference(s) not found on disk: ${gone.slice(0, 3).join(', ')}`);
    if (e.lang !== 'en') {
      const bad = raw.match(/(^|[^/\w.-])assets\/[^"' )]*/g) || [];
      check(bad.length === 0, `${e.file}: ${bad.length} assets/ path(s) without a leading slash`);
    }
  }
  // Every file in the five products/ trees (not only the expected pages): no oil-maker names
  const walk = (dir, out) => {
    if (!fs.existsSync(dir)) return out;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs, out); else out.push(abs);
    }
    return out;
  };
  const files = LANGS.flatMap((l) => walk(path.join(ROOT, l === 'en' ? '' : l, 'products'), []));
  check(files.length > 0, 'no files in the products/ trees');
  for (const abs of files) {
    const m = fs.readFileSync(abs, 'utf-8').match(OIL) || [];
    check(m.length === 0, `${path.relative(ROOT, abs).replace(/\\/g, '/')}: names ${[...new Set(m)].join(', ')}`);
  }
}

for (const [s, t] of Object.entries(TALLY)) console.log(`  ${s.padEnd(12)} ${t.passed} passed, ${t.failed} failed`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
