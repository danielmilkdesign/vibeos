const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./security-loader.cjs');

test('csvCell neutralizes formulas and escapes quotes in every field', () => {
  const { csvCell, clipboardCell, neutralizeFormula } = load('lib/lead-export.ts');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('+SUM(A1)'), '"\'+SUM(A1)"');
  assert.equal(csvCell('@cmd'), '"\'@cmd"');
  assert.equal(csvCell('-1'), '"\'-1"');
  assert.equal(csvCell('normal'), '"normal"');
  assert.equal(csvCell('a"quote'), '"a""quote"');
  assert.equal(csvCell(''), '""');
  assert.equal(csvCell(null), '""');
  assert.equal(neutralizeFormula('=1+1'), '\'=1+1');
  assert.equal(neutralizeFormula('plain'), 'plain');
  assert.equal(clipboardCell('a\nb'), 'a b');
  assert.equal(clipboardCell('=A1'), '\'=A1');
});