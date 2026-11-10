const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../essay-generators.js'), 'utf8'), context);
for (let seed = 1; seed <= 30; seed++) {
  let state = seed;
  const rng = () => ((state = (Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296);
  for (const q of context.ExamEssay.generate(rng)) {
    const solved = q.lines.map(line => line.map(seg => typeof seg === 'string' ? seg : q.blanks[seg.b].ok[0]).join('')).join('\n');
    const requirements = q.requirements.join('\n');
    if (q.formId === 'inheritance') {
      const p = q.parameters;
      assert.ok(requirements.includes('chia ' + p.divisor), 'Office wage divisor is specified');
      assert.ok(requirements.includes('nhân ' + p.pieceRate), 'Production wage rate is specified');
      assert.ok(solved.includes('_luongCB / ' + p.divisor + ' * _ngayCong'));
      assert.ok(solved.includes('_luongCB + _soSP * ' + p.pieceRate));
      const counted = solved.match(/static void DemSanXuat\(\)[\s\S]*?if \(ds\[i\] is (\w+)\)/)[1];
      assert.ok(requirements.includes('đếm các đối tượng ' + counted), 'Requested count type matches code');
      assert.equal(/virtual double Luong/.test(solved), false, 'Original is/cast form is not replaced by virtual salary dispatch');
    }
    if (q.formId === 'polymorphism') {
      const p = q.parameters;
      for (const value of [p.markup, p.foodMarkup, p.warrantyFee, p.expiryDays, p.discount]) {
        assert.ok(requirements.includes(String(value)), 'Price parameter is given: ' + value);
      }
      assert.ok(solved.includes('_conHan <= ' + p.expiryDays), 'Inclusive expiry boundary follows the photo');
      assert.ok(solved.includes('private double _giaGoc;'));
      assert.ok(solved.includes('base.Xuat();'));
    }
    assert.match(solved, /case 0:\s*Console\.WriteLine\("Tam biet"\);\s*break;/, q.templateId + ': zero must exit without an invalid-choice warning');
    assert.ok(solved.includes('Console.WriteLine("Danh sach da day")'), q.templateId + ': full array must report why add was refused');
    assert.ok(requirements.includes(String(q.parameters.capacity)), 'Array capacity is specified');
    if (q.formId === 'encapsulation') {
      assert.ok(solved.includes('this.Gia = gia;'));
      assert.ok(solved.includes('!string.IsNullOrWhiteSpace(value)'));
      assert.ok(solved.includes('ds[i].Ma == ma'), 'Search is by ID, not name or price');
    }
  }
}
console.log('essay regressions: exact form methods, explicit parameters, consistent wages/counting, expiry boundary, validated properties and exit/full-array behavior passed');
