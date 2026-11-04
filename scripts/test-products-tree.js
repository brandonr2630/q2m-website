'use strict';
const assert = require('node:assert');
const T = require('./products-tree.js');

const L = (s) => ({ en: s, es: s, pt: s, nl: s, fr: s });

function fixture() {
  return [
    { id: 'gear-reducers', parent: null, slug: 'gear-reducers', order: 1, name: L('Gear Reducers'), description: L('d'), intro: L('i') },
    { id: 'ocr-rp-series', parent: 'gear-reducers', slug: 'ocr-rp-series', order: 1, name: L('RP'), description: L('d'),
      brand: 'OCR', serviceParam: 'rp', specs: { columns: ['model', 'size'], rows: [{ id: 'a', model: 'RP1', size: 10 }] } },
    { id: 'empty', parent: 'gear-reducers', slug: 'empty', order: 2, name: L('Empty'), description: L('d'),
      brand: 'OCR', serviceParam: 'e', specs: { columns: ['model'], rows: [] } },
    { id: 'conveyors', parent: null, slug: 'conveyors', order: 2, name: L('Conveyors'), description: L('d'), intro: L('i') },
  ];
}

function throwsWith(nodes, id, label) {
  assert.throws(() => T.validate(nodes), (e) => e instanceof Error && e.message.includes(id), label);
}

assert.deepStrictEqual(T.LANG_CODES, ['en', 'es', 'pt', 'nl', 'fr']);

// published
let n = fixture();
let pub = T.published(n);
assert.strictEqual(pub.has('ocr-rp-series'), true);
assert.strictEqual(pub.has('gear-reducers'), true);
assert.strictEqual(pub.has('empty'), false);
assert.strictEqual(pub.has('conveyors'), false);
n[2].live = true;
assert.strictEqual(T.published(n).has('empty'), true);

// childrenOf / pathTo
n = fixture();
assert.deepStrictEqual(T.childrenOf(n, null).map((x) => x.id), ['gear-reducers', 'conveyors']);
assert.deepStrictEqual(T.childrenOf(n, 'gear-reducers').map((x) => x.id), ['ocr-rp-series', 'empty']);
assert.deepStrictEqual(T.pathTo(n, 'ocr-rp-series').map((x) => x.id), ['gear-reducers', 'ocr-rp-series']);

// nodeUrl
assert.strictEqual(T.nodeUrl(n, 'ocr-rp-series', 'es'), '/es/products/gear-reducers/ocr-rp-series/');
assert.strictEqual(T.nodeUrl(n, null, 'en'), '/products/');
assert.strictEqual(T.nodeUrl(n, 'gear-reducers', 'en'), '/products/gear-reducers/');

// validate ok
T.validate(fixture());

// validate failures
n = fixture(); n[2].slug = 'ocr-rp-series';
throwsWith(n, 'empty', 'duplicate sibling slug');

n = fixture(); n[1].parent = 'nope';
throwsWith(n, 'ocr-rp-series', 'unknown parent');

n = fixture(); n[0].parent = 'ocr-rp-series';
assert.throws(() => T.validate(n), /cycle/);

n = fixture(); delete n[1].name.es;
throwsWith(n, 'ocr-rp-series', 'missing es name');

n = fixture(); n[3].description.en = 'x'.repeat(161);
throwsWith(n, 'conveyors', 'description too long');
n = fixture(); n[3].description.en = 'x'.repeat(160);
T.validate(n);

n = fixture(); n[3].slug = 'Bad_Slug';
throwsWith(n, 'conveyors', 'bad slug');

n = fixture(); n[1].specs.rows[0].bogus = 1;
throwsWith(n, 'ocr-rp-series', 'row key not in columns');

console.log('all tree tests passed');
