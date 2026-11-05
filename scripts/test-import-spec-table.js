'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { importRating } = require('./import-spec-table.js');

const HEAD = 'table,source_page,size,ratio,quantity,unit,value\n';
const BLOCK_1 = [
  'rating_single_stage,8,85,3.64,output_rpm,rpm,355',
  'rating_single_stage,8,85,3.64,input_rpm,rpm,1292',
  'rating_single_stage,8,85,3.64,power_kw,kW,5.95',
  'rating_single_stage,8,85,3.64,torque_nm,Nm,160',
];
const BLOCK_2 = [
  'rating_single_stage,8,85,3.64,output_rpm,rpm,280',
  'rating_single_stage,8,85,3.64,input_rpm,rpm,1019',
  'rating_single_stage,8,85,3.64,power_kw,kW,5.13',
  'rating_single_stage,8,85,3.64,torque_nm,Nm,175',
];
const csv = (lines) => HEAD + lines.join('\n') + '\n';

// two blocks, file order, id/model/kw
{
  const rows = importRating(csv(BLOCK_1.concat(BLOCK_2)));
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].id, 'RP85-3.64-355');
  assert.strictEqual(rows[0].model, 'RP 85');
  assert.strictEqual(rows[0].size, '85');
  assert.strictEqual(rows[0].ratio, '3.64');
  assert.strictEqual(rows[0].n2, 355);
  assert.strictEqual(rows[0].n1, 1292);
  assert.strictEqual(rows[0].kw, 5.95);
  assert.strictEqual(rows[0].torque, 160);
  assert.strictEqual(rows[1].id, 'RP85-3.64-280');
  assert.strictEqual(rows[1].kw, 5.13);
  assert.ok(!('stage' in rows[0]), 'no stage field');
  assert.deepStrictEqual(Object.keys(rows[0]), ['id', 'model', 'size', 'ratio', 'n2', 'n1', 'kw', 'torque']);
}

// non-rating tables skipped
{
  const rows = importRating(csv([
    'weights,3,85,,weight_kg,kg,12',
    'input_speed,3,85,,input_rpm,rpm,1450',
    'efficiency_single_stage,3,,,efficiency,%,97',
    'efficiency_double_stage,3,,,efficiency,%,94',
  ].concat(BLOCK_1)));
  assert.strictEqual(rows.length, 1);
}

// duplicate id fails naming the id
assert.throws(() => importRating(csv(BLOCK_1.concat(BLOCK_1))), /RP85-3\.64-355/);

// missing quantity throws naming the line (line 4 = power_kw missing, torque misplaced)
assert.throws(
  () => importRating(csv([BLOCK_1[0], BLOCK_1[1], BLOCK_1[3]].concat(BLOCK_2))),
  /line 4/
);
// incomplete trailing group throws
assert.throws(() => importRating(csv(BLOCK_1.slice(0, 3))), /incomplete/);

// comma decimal throws (quoted or not)
assert.throws(
  () => importRating(csv([BLOCK_1[0], BLOCK_1[1], 'rating_single_stage,8,85,3.64,power_kw,kW,"5,95"', BLOCK_1[3]])),
  /line 4/
);
assert.throws(
  () => importRating(csv([BLOCK_1[0], BLOCK_1[1], 'rating_single_stage,8,85,3.64,power_kw,kW,5,95', BLOCK_1[3]])),
  /line 4/
);
// non-numeric throws
assert.throws(
  () => importRating(csv([BLOCK_1[0], BLOCK_1[1], 'rating_single_stage,8,85,3.64,power_kw,kW,abc', BLOCK_1[3]])),
  /line 4/
);

// generated real data
{
  const rows = require('./products-data/ocr-rp-rows.js');
  assert.strictEqual(rows.length, 280);
  assert.strictEqual(new Set(rows.map((r) => r.size)).size, 8);
  assert.strictEqual(new Set(rows.map((r) => r.id)).size, 280);
  assert.strictEqual(Math.max(...rows.map((r) => r.kw)), 155);
  assert.strictEqual(Math.max(...rows.map((r) => r.torque)), 11280);
  assert.ok(rows.every((r) => !('stage' in r)));
  // generated file matches a fresh import of the committed CSV
  const fresh = importRating(fs.readFileSync(path.join(__dirname, 'products-data/ocr-rp-rating.csv'), 'utf8'));
  assert.deepStrictEqual(rows, fresh);
}

console.log('import-spec-table tests passed');
