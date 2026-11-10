// Called after compiling solved forms as executables in a temporary folder.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const folder = process.argv[2];
const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
let count = 0;
for (const item of manifest) {
  const p = item.parameters;
  let input, expected;
  if (item.formId === 'encapsulation') {
    input = ['1', 'A01', 'Alpha', '100', '1', 'B02', 'Beta', '200', '4',
      '3', 'A01', '150', '4', '3', 'A01', '-7', '4', '3', 'MISSING', '4', '0'];
    expected = [300, 350, 350, 350];
  } else if (item.formId === 'inheritance') {
    input = ['1', 'O01', 'Office', String(p.divisor * 100), '1', '3',
      '1', 'P01', 'Production', '100', '2', '2', '2', '3', '4', '0'];
    expected = [400 + 2 * p.pieceRate];
  } else if (item.formId === 'polymorphism') {
    // Include food exactly on the expiry threshold and one day above it.
    input = ['1', 'F01', 'FoodBoundary', '200', '2', String(p.expiryDays),
      '1', 'E01', 'Electronic', '100', '1', '2',
      '1', 'F02', 'FoodRegular', '200', '2', String(p.expiryDays + 1), '3', '4', '0'];
    expected = [100 * Number(p.markup) + 2 * p.warrantyFee + 200 * Number(p.foodMarkup) * Number(p.discount) + 200 * Number(p.foodMarkup)];
  } else throw new Error('Unknown runtime form: ' + item.formId);
  const file = path.join(folder, item.file.replace(/\.cs$/, '.dll'));
  const run = spawnSync('dotnet', [file], { input: input.join('\n') + '\n', encoding: 'utf8', timeout: 15000 });
  assert.equal(run.status, 0, item.file + ': ' + run.stderr);
  const output = run.stdout;
  assert.ok(output.includes('Tam biet'), item.file + ': exits normally');
  assert.ok(!output.includes('Sai lua chon'), item.file + ': no unexpected menu routing');
  const totals = [...output.matchAll(/Tong(?: luong)?:\s*([\d.,Ee+-]+)/g)].map(m => Number(m[1].replace(',', '.')));
  assert.equal(totals.length, expected.length, item.file + ': number of total operations');
  totals.forEach((total, i) => assert.ok(Math.abs(total - expected[i]) < 1e-7, item.file + ': expected total ' + expected[i] + ', got ' + total));
  if (item.formId === 'encapsulation') {
    assert.ok(output.includes('Khong thay'), item.file + ': search miss returns to menu');
    assert.equal((output.match(/So doi tuong da tao: 2/g) || []).length, 4, item.file + ': count is shared, updates do not create objects');
  }
  if (item.formId === 'inheritance') {
    assert.ok(output.includes('Ngay cong: 3') && output.includes('San pham: 2'), item.file + ': derived ToString calls base');
    assert.ok(output.includes('So NV san xuat: 1'), item.file + ': counts the production subtype');
  }
  if (item.formId === 'polymorphism') {
    const ids = [...output.matchAll(/(E01|F01|F02) - /g)].map(m => m[1]);
    assert.deepEqual(ids, ['E01', 'F02', 'F01'], item.file + ': sort is descending and invokes XuatDS');
    assert.ok(output.includes('Con han: ' + p.expiryDays), item.file + ': overridden food Xuat is dispatched');
  }
  count++;
}
console.log('Runtime business checks: ' + count + ' programs passed (CRUD/property validation, inherited wages/count, polymorphic prices/expiry boundary/sort).');
