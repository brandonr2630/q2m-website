'use strict';
/**
 * test-products-filters.js
 *
 * Node tests for the pure parts of products-filters.js (query parsing, row matching, query
 * serialisation) plus static checks of the generated English family page: the filter logic run
 * over the page's own data-* attributes must give the same rows as the data file.
 *
 * Usage:  cd scripts && node test-products-filters.js
 */

const assert  = require('node:assert');
const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');
const F       = require('./products-filters');
const { NODES } = require('./products-data');

const ROOT = path.resolve(__dirname, '..');
const fam  = NODES.find((n) => n.id === 'ocr-rp-series');
const ROWS = fam.specs.rows;

const SIZES = [...new Set(ROWS.map((r) => String(r.size)))];
const COLS = [
  { key: 'size', type: 'enum', options: SIZES },
  { key: 'ratio', type: 'range' },
  { key: 'kw', type: 'range' },
  { key: 'torque', type: 'range' },
];
const dataGet = (r) => (k) => String(r[k]);
const pick = (state, rows = ROWS) => rows.filter((r) => F.matches(dataGet(r), state, COLS)).map((r) => r.id);

let tests = 0;
function t(name, fn) { fn(); tests++; console.log(`ok  ${name}`); }

// ── parseQuery ─────────────────────────────────────────────
t('parseQuery reads enum and range keys', () => {
  assert.deepStrictEqual(F.parseQuery('?size=105&kw-min=5&kw-max=10', COLS), { size: '105', 'kw-min': 5, 'kw-max': 10 });
});
t('parseQuery accepts decimals with a point', () => {
  assert.deepStrictEqual(F.parseQuery('?ratio-min=3.64', COLS), { 'ratio-min': 3.64 });
});
t('parseQuery ignores abc, empty, comma decimals, unknown keys and unknown enum values', () => {
  assert.deepStrictEqual(F.parseQuery('?kw-min=abc', COLS), {});
  assert.deepStrictEqual(F.parseQuery('?kw-min=&kw-max=%20', COLS), {});
  assert.deepStrictEqual(F.parseQuery('?kw-min=5,5', COLS), {});
  assert.deepStrictEqual(F.parseQuery('?size=999&foo=1&n2-min=3', COLS), {});
  assert.deepStrictEqual(F.parseQuery('', COLS), {});
  assert.deepStrictEqual(F.parseQuery('?kw-min=abc&size=105', COLS), { size: '105' });
});
t('parseQuery survives malformed percent-encoding', () => {
  assert.deepStrictEqual(F.parseQuery('?size=%E0%A4%A&kw-max=10', COLS), { 'kw-max': 10 });
});

// ── matches ────────────────────────────────────────────────
t('no filter matches all 280 rows', () => {
  assert.strictEqual(pick({}).length, ROWS.length);
  assert.strictEqual(ROWS.length, 280);
});
t('size 105 gives exactly that size (35 rows)', () => {
  const ids = pick({ size: '105' });
  assert.strictEqual(ids.length, 35);
  assert.deepStrictEqual(ids, ROWS.filter((r) => String(r.size) === '105').map((r) => r.id));
});
t('kw 5..10 gives only rows with 5 <= kw <= 10', () => {
  const ids = pick({ 'kw-min': 5, 'kw-max': 10 });
  assert.deepStrictEqual(ids, ROWS.filter((r) => r.kw >= 5 && r.kw <= 10).map((r) => r.id));
  assert.ok(ids.length > 0);
});
t('size and kw together give the intersection', () => {
  const a = new Set(pick({ size: '105' }));
  const b = pick({ 'kw-min': 5, 'kw-max': 10 }).filter((id) => a.has(id));
  assert.deepStrictEqual(pick({ size: '105', 'kw-min': 5, 'kw-max': 10 }), b);
  assert.ok(b.length > 0 && b.length < a.size);
});
t('min greater than max matches nothing and does not throw', () => {
  assert.deepStrictEqual(pick({ 'kw-min': 10, 'kw-max': 5 }), []);
});
t('a row with a non-numeric value never matches an active range', () => {
  assert.strictEqual(F.matches(() => 'n/a', { 'kw-min': 0 }, COLS), false);
  assert.strictEqual(F.matches(() => 'n/a', {}, COLS), true);
});

// ── clear / active / query round trip ──────────────────────
t('clear state is inactive and serialises to an empty query', () => {
  assert.strictEqual(F.activeCount({}, COLS), 0);
  assert.strictEqual(F.toQuery({}, COLS), '');
  assert.strictEqual(pick({}).length, 280);
});
t('activeCount counts filtered columns, not keys', () => {
  assert.strictEqual(F.activeCount({ size: '105', 'kw-min': 5, 'kw-max': 10 }, COLS), 2);
});
t('toQuery is in column order and round-trips', () => {
  const s = { 'kw-max': 10, size: '105', 'ratio-min': 3.64 };
  const q = F.toQuery(s, COLS);
  assert.strictEqual(q, '?size=105&ratio-min=3.64&kw-max=10');
  assert.deepStrictEqual(F.parseQuery(q, COLS), { size: '105', 'ratio-min': 3.64, 'kw-max': 10 });
  assert.strictEqual(F.toQuery(F.parseQuery(q, COLS), COLS), q);
});
t('withQuery replaces filter params and keeps the others in order', () => {
  assert.strictEqual(F.withQuery('?utm_source=x&size=105&kw-min=3&ref=2', '?size=125', COLS), '?utm_source=x&ref=2&size=125');
  assert.strictEqual(F.withQuery('?utm_source=x&size=105', '', COLS), '?utm_source=x');
  assert.strictEqual(F.withQuery('?size=105', '', COLS), '');
  assert.strictEqual(F.withQuery('', '?kw-max=10', COLS), '?kw-max=10');
  assert.strictEqual(F.withQuery('?a=%E0%A4%A&kw%2Dmin=2', '', COLS), '?a=%E0%A4%A');
});
t('fill replaces {n} and {total}', () => {
  assert.strictEqual(F.fill('Showing {n} of {total} models', { n: 35, total: 280 }), 'Showing 35 of 280 models');
});

// ── generated English family page ──────────────────────────
const file = 'products/gear-reducers/ocr-rp-series/index.html';
const $ = cheerio.load(fs.readFileSync(path.join(ROOT, file), 'utf-8'));
const trs = $('table.spec-table tbody tr');
t(`${file}: 280 rows with ids in data order`, () => {
  assert.strictEqual(trs.length, 280);
  assert.deepStrictEqual(trs.map((_, el) => $(el).attr('id')).get(), ROWS.map((r) => r.id));
});
const defsEl = $('script#filter-defs[type="application/json"]');
const defs = JSON.parse(defsEl.html() || 'null');
t(`${file}: filter-defs JSON lists size, ratio, kw, torque`, () => {
  assert.ok(defs && Array.isArray(defs.columns));
  assert.deepStrictEqual(defs.columns.map((c) => c.key), ['size', 'ratio', 'kw', 'torque']);
  assert.deepStrictEqual(defs.columns[0].options, SIZES);
  assert.strictEqual(defs.strings.count, 'Showing {n} of {total} models');
});
const pageRows = trs.map((_, el) => ({ id: $(el).attr('id'), get: (k) => $(el).attr(`data-${k}`) })).get();
function pagePick(state) { return pageRows.filter((r) => F.matches(r.get, state, defs.columns)).map((r) => r.id); }
for (const state of [{ size: '105' }, { 'kw-min': 5, 'kw-max': 10 }, { size: '105', 'kw-min': 5, 'kw-max': 10 }, { 'torque-min': 1000 }, { 'ratio-max': 10 }]) {
  t(`${file}: filter ${JSON.stringify(state)} on the page's data-* equals the data file`, () => {
    const got = pagePick(state);
    const want = pick(state);
    const extra = got.filter((id) => !want.includes(id));
    const missing = want.filter((id) => !got.includes(id));
    assert.ok(!extra.length && !missing.length, `page rows differ from data: extra ${extra.join(', ') || '-'}; missing ${missing.join(', ') || '-'}`);
  });
}
t(`${file}: every data-* equals the data value`, () => {
  const bad = [];
  pageRows.forEach((r, i) => { for (const k of ['size', 'ratio', 'n2', 'n1', 'kw', 'torque']) if (r.get(k) !== String(ROWS[i][k])) bad.push(`${r.id} data-${k}="${r.get(k)}" (data ${ROWS[i][k]})`); });
  assert.deepStrictEqual(bad, []);
});
t(`${file}: no filter markup without JS; script inlined once`, () => {
  assert.strictEqual($('.filters').length, 0);
  assert.strictEqual($('script:not([type])').filter((_, el) => ($(el).html() || '').includes('filter-defs')).length, 1);
});

console.log(`${tests} tests passed`);
