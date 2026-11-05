'use strict';
/**
 * test-products-filters-dom.js
 *
 * Tests the DOM half of products-filters.js (init): the browser script is run unchanged in a
 * node:vm context against a minimal hand-written DOM stub (no jsdom, no new dependencies).
 * Column definitions and strings come from the built English family page's #filter-defs; rows
 * carry the data file's values as data-* attributes, like the real table.
 *
 * Covers: rows hidden with the hidden attribute, the Clear button disabling itself, the debounced
 * count text, the URL round trip on reload, non-filter query parameters and the hash kept on
 * replaceState, no URL rewrite on load, and reset() opening the closed phone disclosure.
 *
 * Usage:  cd scripts && node test-products-filters-dom.js
 */

const assert  = require('node:assert');
const fs      = require('fs');
const path    = require('path');
const vm      = require('vm');
const cheerio = require('cheerio');
const { NODES } = require('./products-data');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(__dirname, 'products-filters.js'), 'utf-8');
const PAGE = 'products/gear-reducers/ocr-rp-series/index.html';
const $ = cheerio.load(fs.readFileSync(path.join(ROOT, PAGE), 'utf-8'));
const DEFS = $('script#filter-defs').html();
const D = JSON.parse(DEFS);
const ROWS = NODES.find((n) => n.id === 'ocr-rp-series').specs.rows;
const PATHNAME = '/products/gear-reducers/ocr-rp-series/';

// ── minimal DOM stub ───────────────────────────────────────
class Text { constructor(s) { this.textContent = String(s); this.parentNode = null; } }
class El {
  constructor(doc, tag) {
    this.ownerDocument = doc; this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = [];
    this.listeners = {}; this.parentNode = null; this.value = ''; this.disabled = false; this.open = false;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
  hasAttribute(k) { return this.getAttribute(k) !== null; }
  get id() { return this.getAttribute('id') || ''; }
  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(v) { if (v) this.attrs.hidden = ''; else delete this.attrs.hidden; }
  get className() { return this.getAttribute('class') || ''; }
  appendChild(c) {
    if (c.parentNode) c.parentNode.children.splice(c.parentNode.children.indexOf(c), 1);
    c.parentNode = this; this.children.push(c); return c;
  }
  get textContent() { return this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; this.appendChild(new Text(v)); }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  dispatch(type) { // bubbles
    const ev = { type, target: this };
    for (let n = this; n; n = n.parentNode) (n.listeners && n.listeners[type] || []).forEach((f) => f(ev));
  }
  click() { if (!this.disabled) this.dispatch('click'); }
  focus() { this.ownerDocument.activeElement = this; }
}
const walk = (root, pred, out = []) => {
  if (root instanceof El) { if (pred(root)) out.push(root); root.children.forEach((c) => walk(c, pred, out)); }
  return out;
};
const byClass = (root, cls) => walk(root, (e) => e.className.split(' ').includes(cls));

function load(search, hash, desktop) {
  const doc = { readyState: 'complete', activeElement: null };
  doc.createElement = (t) => new El(doc, t);
  doc.createTextNode = (s) => new Text(s);
  const table = doc.createElement('table');
  table.setAttribute('class', 'spec-table');
  const tbody = doc.createElement('tbody');
  table.appendChild(tbody);
  ROWS.forEach((r) => {
    const tr = doc.createElement('tr');
    tr.setAttribute('id', r.id);
    for (const k of ['size', 'ratio', 'n2', 'n1', 'kw', 'torque']) tr.setAttribute(`data-${k}`, String(r[k]));
    tbody.appendChild(tr);
  });
  table.tBodies = [tbody];
  Object.defineProperty(tbody, 'rows', { get: () => tbody.children });
  table.tHead = { rows: [{ cells: { length: 8 } }] };
  const rail = doc.createElement('aside'); rail.setAttribute('class', 'prod-rail');
  const slot = doc.createElement('div'); slot.setAttribute('class', 'spec-filter-slot');
  const defs = { textContent: DEFS };
  doc.querySelector = (sel) => ({ '.spec-table': table, '.prod-rail': rail, '.spec-filter-slot': slot }[sel] || null);
  doc.getElementById = (id) => (id === 'filter-defs' ? defs : null);
  doc.addEventListener = () => { throw new Error('readyState is complete: init must run at once'); };

  const location = { pathname: PATHNAME, search, hash };
  const urls = [];
  const history = {
    state: null,
    replaceState(state, title, url) {
      urls.push(url);
      const m = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(url);
      location.pathname = m[1]; location.search = m[2] || ''; location.hash = m[3] || '';
    },
  };
  let timers = [];
  let seq = 0;
  const ctx = {
    document: doc, location, history,
    setTimeout: (f) => { timers.push({ id: ++seq, f }); return seq; },
    clearTimeout: (id) => { timers = timers.filter((t) => t.id !== id); },
  };
  ctx.window = ctx;
  ctx.matchMedia = () => ({ matches: desktop, addEventListener() {} });
  vm.runInNewContext(SRC, ctx, { filename: 'products-filters.js' });

  const box = walk(rail, (e) => e.tagName === 'DETAILS').concat(walk(slot, (e) => e.tagName === 'DETAILS'))[0];
  const all = (cls) => byClass(box, cls).concat(byClass(table, cls));
  return {
    doc, table, rail, slot, box, urls, location,
    rows: tbody.children,
    visible: () => tbody.children.filter((r) => !r.hidden).map((r) => r.id),
    hiddenAttr: () => tbody.children.filter((r) => r.hasAttribute('hidden')).length,
    input: (id) => walk(box, (e) => e.id === id)[0],
    clears: () => all('filters-clear'),
    count: () => byClass(box, 'filters-count')[0].textContent,
    none: () => byClass(table, 'spec-none')[0],
    flush: () => { const t = timers; timers = []; t.forEach((x) => x.f()); },
    pending: () => timers.length,
    url: () => location.pathname + location.search + location.hash,
  };
}
const set = (p, id, v) => { const i = p.input(id); i.value = v; i.dispatch('input'); };
const want = (pred) => ROWS.filter(pred).map((r) => r.id);
const COUNT = (n) => D.strings.count.replace('{n}', n).replace('{total}', ROWS.length);

let tests = 0;
let failed = 0;
function t(name, fn) {
  try { fn(); tests++; console.log(`ok  ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message.split('\n').filter((l) => l.trim()).slice(0, 4).join(' | ')}`); }
}

// ── load ───────────────────────────────────────────────────
t('load with no query: all rows shown, Clear disabled, closed on phones, URL untouched', () => {
  const p = load('?utm_source=news', '#specs', false);
  assert.strictEqual(p.visible().length, 280);
  assert.strictEqual(p.hiddenAttr(), 0);
  assert.ok(p.box.parentNode === p.slot && p.box.open === false);
  assert.ok(p.clears().length >= 1 && p.clears()[0].disabled === true);
  assert.strictEqual(p.count(), COUNT(280));
  assert.deepStrictEqual(p.urls, [], 'replaceState must not be called when the filter state is empty and unchanged');
  assert.strictEqual(p.url(), `${PATHNAME}?utm_source=news#specs`);
});
t('load with a plain URL: no replaceState at all', () => {
  const p = load('', '', true);
  assert.deepStrictEqual(p.urls, []);
  assert.ok(p.box.parentNode === p.rail && p.box.open === true);
});
t('load with ?size=105&utm_source=x#specs: 35 rows, hidden attribute on the rest, URL untouched', () => {
  const p = load('?size=105&utm_source=x', '#specs', false);
  assert.deepStrictEqual(p.visible(), want((r) => String(r.size) === '105'));
  assert.strictEqual(p.hiddenAttr(), 280 - 35);
  assert.strictEqual(p.input('f-size').value, '105');
  assert.strictEqual(p.box.open, true, 'active filters open the phone disclosure');
  assert.strictEqual(p.clears()[0].disabled, false);
  assert.strictEqual(p.count(), COUNT(35), 'count is said at once on load');
  assert.deepStrictEqual(p.urls, []);
});

// ── typing ─────────────────────────────────────────────────
t('typing: rows filter at once, count is debounced, URL keeps utm_* and the hash', () => {
  const p = load('?utm_source=x&size=105', '#specs', true);
  set(p, 'f-kw-min', '5');
  const w = want((r) => String(r.size) === '105' && r.kw >= 5);
  assert.deepStrictEqual(p.visible(), w);
  assert.strictEqual(p.count(), COUNT(35), 'count text waits for the debounce');
  assert.strictEqual(p.pending(), 1);
  set(p, 'f-kw-max', '10');
  assert.strictEqual(p.pending(), 1, 'a new input replaces the pending announcement');
  const w2 = want((r) => String(r.size) === '105' && r.kw >= 5 && r.kw <= 10);
  p.flush();
  assert.strictEqual(p.count(), COUNT(w2.length));
  assert.strictEqual(p.url(), `${PATHNAME}?utm_source=x&size=105&kw-min=5&kw-max=10#specs`);
});
t('typing an unparsable number leaves that bound out of the URL', () => {
  const p = load('', '', true);
  set(p, 'f-kw-min', 'abc');
  assert.strictEqual(p.visible().length, 280);
  assert.strictEqual(p.clears()[0].disabled, true);
});

// ── clear ──────────────────────────────────────────────────
t('Clear: all rows back, Clear disables itself, filter params dropped, others kept, focus on the first control', () => {
  const p = load('?size=105&kw-min=5&utm_medium=email', '#x', true);
  const clear = p.clears()[0];
  clear.click();
  assert.strictEqual(p.visible().length, 280);
  assert.strictEqual(p.hiddenAttr(), 0);
  assert.strictEqual(clear.disabled, true);
  assert.strictEqual(p.input('f-size').value, '');
  assert.strictEqual(p.input('f-kw-min').value, '');
  assert.strictEqual(p.url(), `${PATHNAME}?utm_medium=email#x`);
  assert.strictEqual(p.doc.activeElement, p.input('f-size'));
  p.flush();
  assert.strictEqual(p.count(), COUNT(280));
});

// ── no match + phone reset ─────────────────────────────────
t('no match: the no-match row shows; its Clear opens the closed phone disclosure before focusing', () => {
  const p = load('?kw-min=10&kw-max=5', '', false);
  assert.strictEqual(p.visible().length, 0);
  assert.strictEqual(p.none().hidden, false);
  p.box.open = false; // the visitor closed the disclosure
  const inRow = p.clears().find((b) => walk(p.none(), (e) => e === b).length);
  assert.ok(inRow, 'a Clear button in the no-match row');
  inRow.click();
  assert.strictEqual(p.box.open, true, 'reset() must open the phone <details> before focusing');
  assert.strictEqual(p.doc.activeElement, p.input('f-size'));
  assert.strictEqual(p.none().hidden, true);
  assert.strictEqual(p.visible().length, 280);
  assert.strictEqual(p.url(), PATHNAME);
});

// ── reload round trip ──────────────────────────────────────
t('reload round trip: the URL written after filtering restores the same inputs and rows', () => {
  const a = load('?ref=1', '#specs', true);
  const sel = a.input('f-size'); sel.value = '125'; sel.dispatch('change');
  set(a, 'f-ratio-max', '20');
  set(a, 'f-torque-min', '500');
  const rowsA = a.visible();
  assert.ok(rowsA.length > 0 && rowsA.length < 280);
  const b = load(a.location.search, a.location.hash, true);
  assert.deepStrictEqual(b.visible(), rowsA);
  assert.deepStrictEqual(['f-size', 'f-ratio-max', 'f-torque-min'].map((id) => String(b.input(id).value)), ['125', '20', '500']);
  assert.deepStrictEqual(b.urls, [], 'reloading the written URL does not rewrite it');
  assert.strictEqual(b.url(), `${PATHNAME}?ref=1&size=125&ratio-max=20&torque-min=500#specs`);
});

t('products-filters.js stays under 7.5 KB raw (inlined on every family page)', () => {
  const bytes = Buffer.byteLength(SRC.replace(/\r\n/g, '\n'));
  assert.ok(bytes <= 7680, `${bytes} bytes`);
});

console.log(`${tests} DOM tests passed, ${failed} failed`);
if (failed) process.exit(1);
