'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const T = require('./products-tree.js');
const { UI, NODES, HUB } = require('./products-data.js');

const ROOT = path.join(__dirname, '..');
const FACTS = 'C:/Users/brand/AppData/Local/Temp/claude/92ed5f8a592859d9/7c650761-cd96-46c4-852d-7831d3e4c839/scratchpad/ocr/technical-facts.md';

// tree validates
assert.doesNotThrow(() => T.validate(NODES));

// published set
assert.deepStrictEqual([...T.published(NODES)].sort(), ['gear-reducers', 'ocr-rp-series']);

const family = NODES.find((n) => n.id === 'ocr-rp-series');
const category = NODES.find((n) => n.id === 'gear-reducers');
assert.ok(family && category);
assert.strictEqual(family.live, true);
assert.strictEqual(family.serviceParam, 'reducers');
assert.strictEqual(category.order, 10);

// rows
assert.strictEqual(family.specs.rows.length, 280);

// dimension weights vs CSV (read independently)
const csv = fs.readFileSync(path.join(__dirname, 'products-data', 'ocr-rp-rating.csv'), 'utf8').trim().split(/\r?\n/);
const weights = {};
for (const line of csv) {
  const c = line.split(',');
  if (c[4] === 'weight_kg') weights[c[2]] = Number(c[6]);
}
assert.strictEqual(Object.keys(weights).length, 8);
assert.strictEqual(family.dimensions.length, 8);
for (const d of family.dimensions) {
  assert.strictEqual(d.weightKg, weights[String(d.size)], `weight for size ${d.size}`);
  assert.ok(d.w > 0 && d.h > 0, `dim ${d.size} w/h`);
}

// referenced image files exist
function checkFile(f) {
  assert.ok(typeof f === 'string' && fs.existsSync(path.join(ROOT, f)), `missing image ${f}`);
}
for (const n of NODES) {
  if (n.tileImage) checkFile(n.tileImage.file);
  for (const im of n.images || []) { checkFile(im.file); if (im.jpg) checkFile(im.jpg); }
  for (const d of n.dimensions || []) checkFile(d.file);
}
assert.strictEqual(category.tileImage.file, 'assets/products/ocr-rp/tile.webp');

// category intro and image alts have 5 languages
function langs5(obj, label) {
  for (const l of T.LANG_CODES) {
    assert.ok(obj && typeof obj[l] === 'string' && obj[l].trim() !== '', `${label}.${l}`);
  }
}
for (const n of NODES) {
  const isCategory = n.parent == null;
  if (isCategory) langs5(n.intro, `${n.id}.intro`);
  if (n.tileImage) langs5(n.tileImage.alt, `${n.id}.tileImage.alt`);
  (n.images || []).forEach((im, i) => langs5(im.alt, `${n.id}.images[${i}].alt`));
  (n.dimensions || []).forEach((d) => langs5(d.alt, `${n.id}.dim.${d.size}.alt`));
  langs5(n.name, `${n.id}.name`);
  langs5(n.description, `${n.id}.description`);
}

// UI keys
const UI_KEYS = ['products', 'all_categories', 'categories', 'crumb_home', 'request_quote', 'filter_models', 'filter_all',
  'filter_clear', 'filter_count', 'filter_none', 'col_model', 'col_size', 'col_ratio', 'col_n2', 'col_n1', 'col_kw',
  'col_torque', 'spec_caption', 'dims_heading', 'dims_weight', 'quote_prefill', 'enquire_cta', 'brand_link',
  'filter_min', 'filter_max', 'filter_active'];
for (const k of UI_KEYS) langs5(UI[k], `UI.${k}`);
for (const l of T.LANG_CODES) {
  assert.ok(UI.filter_active[l].includes('{n}'), `filter_active ${l}`);
  assert.ok(UI.filter_count[l].includes('{n}') && UI.filter_count[l].includes('{total}'), `filter_count ${l}`);
  assert.ok(UI.dims_weight[l].includes('{kg}'), `dims_weight ${l}`);
  assert.ok(UI.quote_prefill[l].includes('{model}'), `quote_prefill ${l}`);
}

// migrated copy present in 5 languages
for (const l of T.LANG_CODES) {
  const c = family.copy[l];
  for (const k of ['title', 'description', 'h1Html', 'lead', 'facts', 'how', 'build', 'apps', 'support' + 'Html', 'faq']) {
    assert.ok(c[k] && c[k].length > 0, `copy.${l}.${k}`);
  }
  assert.strictEqual(family.description[l], c.description);
  assert.ok(HUB[l] && HUB[l].title, `HUB.${l}`);
}

// banned words anywhere in the nodes
const dump = JSON.stringify(NODES) + JSON.stringify(HUB);
for (const w of ['Agip', 'Shell', 'Mobil', 'Castrol', 'Danfoss']) {
  assert.ok(!new RegExp(w, 'i').test(dump), `banned word ${w}`);
}

// numbers in English facts, build, note and FAQ appear in the extraction or the rows
const factsMd = fs.readFileSync(FACTS, 'utf8');
const rowsText = JSON.stringify(family.specs.rows);
const en = family.copy.en;
const strings = [];
en.facts.forEach(([a, b]) => strings.push(a, b));
en.build.forEach((s) => strings.push(s));
strings.push(en.buildNote);
en.faq.forEach(([q, a]) => strings.push(q, a));
const nums = new Set();
for (const s of strings) for (const m of s.match(/\d[\d,]*(?:\.\d+)?/g) || []) nums.add(m.replace(/,/g, '').replace(/\.$/, ''));
const factsNorm = factsMd.replace(/(\d),(\d{3})/g, '$1$2');
for (const n of nums) {
  assert.ok(new RegExp(`(^|[^\\d.])${n.replace('.', '\\.')}([^\\d]|\\.(?!\\d)|$)`).test(factsNorm) || rowsText.includes(n), `number ${n} not found in extraction or rows`);
}

console.log('test-products-data: all assertions passed');
