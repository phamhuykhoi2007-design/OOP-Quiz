/* Hợp đồng và biên dịch đề tự luận theo ba form ảnh gốc. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'essay-generators.js'), 'utf8'), context, { filename: 'essay-generators.js' });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'exam-core.js'), 'utf8'), context, { filename: 'exam-core.js' });
let hasMcq = false;
try {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mcq-generators.js'), 'utf8'), context, { filename: 'mcq-generators.js' });
  hasMcq = !!context.ExamMCQ;
} catch (e) { hasMcq = false; }
const ExamEssay = context.ExamEssay;
const ExamCore = context.ExamCore;

assert.ok(ExamEssay && typeof ExamEssay.generate === 'function', 'globalThis.ExamEssay.generate must exist');

/* ---------- tiện ích ---------- */
const MARK = String.fromCharCode(1);
function seeded(seed) {
  let n = seed;
  return () => ((n = (Math.imul(1664525, n) + 1013904223) >>> 0) / 4294967296);
}
function solvedOf(q) {
  return q.lines.map(line => line.map(seg => typeof seg === 'string' ? seg : q.blanks[seg.b].ok[0]).join('')).join('\n');
}
function literalText(q) {
  return q.lines.map(line => line.map(seg => typeof seg === 'string' ? seg : '').join('')).join('\n');
}
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hasWord(text, w) { return new RegExp('\\b' + escRe(w) + '\\b').test(text); }

const WORD = /^[A-Za-z_][A-Za-z0-9_]*$/;
// Từ khóa C# (và 'value' trong accessor) không bắt buộc phải nêu trong đề bài.
const KEYWORDS = new Set(('abstract as base bool break byte case catch char checked class const continue ' +
  'decimal default delegate do double else enum event explicit extern false finally fixed float for foreach ' +
  'goto if implicit in int interface internal is lock long namespace new null object operator out override ' +
  'params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string ' +
  'struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile ' +
  'while value get set').split(' '));
const FRAMEWORK_MEMBERS = new Set(['Parse', 'ReadLine', 'WriteLine', 'Write', 'Length', 'IsNullOrWhiteSpace']);
const TEMPLATE_IDS = ['essay-encapsulation', 'essay-inheritance', 'essay-polymorphism'];

const dummyMcq = () => Array.from({ length: 40 }, (_, i) => ({ type: 'mcq', id: 'm' + i, ch: i % 5 + 1,
  title: 'Câu ' + i, options: ['class', 'Class', 'struct', 'interface'], answer: i % 4,
  explain: 'Giải thích', source: 'slide' }));

/* ---------- 1. Hợp đồng từng câu ---------- */
function assertContract(q, label) {
  assert.equal(q.type, 'essay', label + ' type');
  assert.match(q.id, /^essay-/, label + ' id prefix');
  assert.ok(Number.isInteger(q.ch) && q.ch >= 2 && q.ch <= 5, label + ' ch in 2..5, got ' + q.ch);
  assert.ok(typeof q.title === 'string' && q.title.trim().length > 0, label + ' title');
  assert.ok(typeof q.explain === 'string' && q.explain.trim().length > 0, label + ' explain');
  assert.ok(typeof q.source === 'string' && q.source.trim().length > 0, label + ' source');
  assert.ok(typeof q.templateId === 'string' && TEMPLATE_IDS.includes(q.templateId), label + ' templateId');
  assert.equal(q.formVersion, 2, label + ' strict photo form version');
  assert.ok(typeof q.introduction === 'string' && q.introduction.length > 20, label + ' assignment introduction');
  assert.ok(Array.isArray(q.sections) && q.sections.length >= 2, label + ' numbered class sections');
  q.sections.forEach((section, i) => {
    assert.ok(section.title.startsWith((i + 1) + '.'), label + ' section numbering');
    assert.ok(Array.isArray(section.items) && section.items.length >= 3 && section.items.every(s => typeof s === 'string' && s.trim()), label + ' class requirements');
  });
  assert.ok(Array.isArray(q.requirements) && q.requirements.length >= 3, label + ' requirements');
  q.requirements.forEach(r => assert.ok(typeof r === 'string' && r.trim().length > 0, label + ' requirement text'));
  assert.ok(Array.isArray(q.lines) && q.lines.length > 0, label + ' lines');

  assert.ok(Array.isArray(q.blanks) && q.blanks.length >= 45 && q.blanks.length <= 100,
    label + ' blanks in 45..100, got ' + (q.blanks && q.blanks.length));
  const seen = [];
  q.lines.forEach(line => {
    assert.ok(Array.isArray(line), label + ' line is array');
    line.forEach(seg => {
      if (typeof seg === 'string') return;
      assert.ok(seg && typeof seg === 'object' && Number.isInteger(seg.b), label + ' segment shape');
      seen.push(seg.b);
    });
  });
  assert.equal(seen.length, q.blanks.length, label + ' moi blank dung mot lan');
  assert.equal(new Set(seen).size, q.blanks.length, label + ' chi so khong trung');
  assert.deepEqual([...seen].sort((a, b) => a - b), Array.from(q.blanks, (_, i) => i), label + ' chi so phu du 0..n-1');

  q.blanks.forEach((b, i) => {
    assert.ok(b && Array.isArray(b.ok) && b.ok.length > 0, label + ' blank ' + i + ' ok');
    assert.equal(new Set(b.ok).size, b.ok.length, label + ' blank ' + i + ' ok khong trung');
    b.ok.forEach(a => assert.ok(typeof a === 'string' && a.trim().length > 0, label + ' blank ' + i + ' noi dung'));
    assert.ok(typeof b.explain === 'string' && b.explain.trim().length > 0, label + ' blank ' + i + ' explain');
  });

  const solved = solvedOf(q);
  assert.ok(!solved.includes(MARK), label + ' khong sot marker trong dap an');
  assert.equal(solved.split('\n')[0].trim(), 'using System;', label + ' bat dau bang using System;');
  assert.ok(solved.includes('static void Main'), label + ' co Main');
  assert.ok([...solved].every(ch => ch.charCodeAt(0) < 128), label + ' code ASCII-only');
  const count = (re, s) => (s.match(re) || []).length;
  assert.equal(count(/\{/g, solved), count(/\}/g, solved), label + ' ngoac {} can');
  assert.equal(count(/\(/g, solved), count(/\)/g, solved), label + ' ngoac () can');

  /* Form ảnh giữ code ngữ cảnh: một từ khóa có thể xuất hiện ở chỗ khác.
     Không xóa toàn bộ mọi lần xuất hiện chỉ để che một từ khóa; tên riêng
     cần suy ra được từ đề/khung code. Không in danh sách đáp án vào code. */
  const literals = literalText(q);
  const reqText = q.requirements.join('\n');
  q.blanks.forEach((b, i) => {
    const ans = b.ok[0];
    if (!WORD.test(ans)) return;
    if (!KEYWORDS.has(ans) && !FRAMEWORK_MEMBERS.has(ans)) {
      assert.ok(hasWord(reqText, ans) || hasWord(literals, ans),
        label + " blank " + i + " ten '" + ans + "' phai duoc neu trong de hoac khung code");
    }
  });
  return solved;
}

/* ---------- 2. Sinh 30 de co seed, kiem hop dong ---------- */
const seeds = Array.from({ length: 30 }, (_, i) => i + 1);
const signatures = new Set();
for (const seed of seeds) {
  const deck = ExamEssay.generate(seeded(seed));
  assert.ok(Array.isArray(deck) && deck.length === 5, 'seed ' + seed + ': dung 5 bai tu luan');
  assert.equal(new Set(deck.map(q => q.id)).size, 5, 'seed ' + seed + ' id duy nhat');
  assert.equal(new Set(deck.map(q => q.title)).size, 5, 'seed ' + seed + ' title duy nhat');
  assert.deepEqual([...new Set(deck.map(q => q.templateId))].sort(), [...TEMPLATE_IDS].sort(),
    'seed ' + seed + ': 5 bai luon du ca 3 form goc');
  const solvedList = deck.map((q, i) => assertContract(q, 'seed ' + seed + ' essay ' + (i + 1)));
  const deckClasses = [];
  solvedList.forEach((code, i) => {
    const names = [...code.matchAll(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map(m => m[1]);
    assert.ok(names.includes('Program'), 'seed ' + seed + ' essay ' + (i + 1) + ' co class Program');
    names.filter(n => n !== 'Program').forEach(n => deckClasses.push(n));
  });
  assert.equal(new Set(deckClasses).size, deckClasses.length,
    'seed ' + seed + ': ten class trong cung mot de khong trung (ke ca lop co/derived)');
  signatures.add(JSON.stringify([deck.map(q => q.title), deck.map(q => q.requirements),
    deck.map(q => q.lines), deck.map(q => q.blanks.map(b => b.ok))]));
}

/* ---------- 3. Bat bien: trung seed thi trung de, khac seed thi khac de ---------- */
assert.equal(JSON.stringify(ExamEssay.generate(seeded(123))), JSON.stringify(ExamEssay.generate(seeded(123))),
  'sinh xac dinh theo seed');
assert.ok(signatures.size >= 25, '30 seed sinh ra it nhat 25 de khac nhau, got ' + signatures.size);

/* ---------- 4. rng tuy chon (mac dinh Math.random) ---------- */
{
  const deck = ExamEssay.generate();
  assert.equal(deck.length, 5, 'generate() khong tham so van chay');
  deck.forEach((q, i) => assertContract(q, 'default-rng essay ' + (i + 1)));
}

/* ---------- 5. Tich hop exam-core: 40 trac nghiem + 5 tu luan ---------- */
{
  const deck = dummyMcq().concat(ExamEssay.generate(seeded(5)));
  assert.equal(ExamCore.validate(deck), true, 'exam-core.validate chap nhan deck 40+5');
  deck.slice(40).forEach(q => {
    const model = q.blanks.map(b => b.ok[0]);
    assert.equal(ExamCore.check(q, model).correct, true, q.id + ' cham dung dap an mau');
    const spaced = model.map(a => '  ' + a + '\n');
    assert.equal(ExamCore.check(q, spaced).correct, true, q.id + ' khong xet khoang trang');
    const wrong = model.slice();
    const idx = wrong.findIndex(a => WORD.test(a) && a !== a.toUpperCase());
    if (idx >= 0) {
      wrong[idx] = wrong[idx].toUpperCase() !== wrong[idx]
        ? wrong[idx].toUpperCase() : wrong[idx][0].toLowerCase() + wrong[idx].slice(1);
      assert.equal(ExamCore.check(q, wrong).correct, false, q.id + ' phan biet hoa/thuong');
    }
  });
  if (hasMcq) assert.equal(ExamCore.build(seeded(9)).length, 45, 'ExamCore.build tao du 45 cau');
}

/* ---------- 6. Bieu dich that 5 chuong dai dien (seed 1) — neu co cong cu ---------- */
function findDotnet() {
  const where = spawnSync('where', ['dotnet'], { encoding: 'utf8' });
  if (where.status === 0 && where.stdout) {
    const first = where.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean)[0];
    if (first && fs.existsSync(first)) return first;
  }
  const fallback = 'C:\\Program Files\\dotnet\\dotnet.exe';
  return fs.existsSync(fallback) ? fallback : null;
}
function highestVersionDir(parent) {
  if (!fs.existsSync(parent)) return null;
  const dirs = fs.readdirSync(parent, { withFileTypes: true }).filter(d => d.isDirectory());
  const parsed = dirs.map(d => {
    const v = (d.name.split('-')[0]).match(/^(\d+)\.(\d+)\.(\d+)/);
    return { path: path.join(parent, d.name), key: v ? [+v[1], +v[2], +v[3]] : [0, 0, 0] };
  });
  parsed.sort((a, b) => (b.key[0] - a.key[0]) || (b.key[1] - a.key[1]) || (b.key[2] - a.key[2]));
  return parsed.length ? parsed[0].path : null;
}
function compileSection() {
  const dotnet = findDotnet();
  if (!dotnet) { console.log('essay compile: bo qua — khong tim thay dotnet'); return; }
  const dotnetRoot = path.dirname(dotnet);
  const sdkRoot = highestVersionDir(path.join(dotnetRoot, 'sdk'));
  const csc = sdkRoot && path.join(sdkRoot, 'Roslyn', 'bincore', 'csc.dll');
  const pack = highestVersionDir(path.join(dotnetRoot, 'packs', 'Microsoft.NETCore.App.Ref'));
  const refDir = pack && highestVersionDir(path.join(pack, 'ref'));
  if (!csc || !refDir || !fs.existsSync(csc)) {
    console.log('essay compile: bo qua — thieu SDK Roslyn hoac ref assemblies');
    return;
  }
  const tempBase = 'C:\\Users\\Perseus\\AppData\\Local\\Temp\\opencode';
  fs.mkdirSync(tempBase, { recursive: true });
  const outDir = fs.mkdtempSync(path.join(tempBase, 'essay-compile-'));
  const refs = fs.readdirSync(refDir).filter(f => f.endsWith('.dll')).map(f => '-r:"' + path.join(refDir, f) + '"');
  let compiled = 0;
  for (const seed of [1]) {
    const deck = ExamEssay.generate(seeded(seed));
    deck.forEach((q, i) => {
      const src = path.join(outDir, 'seed-' + seed + '-essay-' + (i + 1) + '.cs');
      const dll = src.replace(/\.cs$/, '.dll');
      fs.writeFileSync(src, solvedOf(q), 'utf8');
      const rsp = src.replace(/\.cs$/, '.rsp');
      const lines = ['-nologo', '-target:library', '-nostdlib+', '-out:"' + dll + '"']
        .concat(refs, ['"' + src + '"']);
      fs.writeFileSync(rsp, lines.join('\r\n'), 'utf8');
      const r = spawnSync(dotnet, [csc, '@' + rsp], { encoding: 'utf8', timeout: 180000 });
      assert.equal(r.status, 0, 'bien dich C# that bai: ' + path.basename(src) + '\n' +
        (r.stdout || '') + (r.stderr || ''));
      compiled++;
    });
  }
  console.log('essay compile: ' + compiled + ' chuong C# hop le (thu muc ' + outDir + ')');
}

compileSection();
console.log('essay: 30 seed strict photo forms, contextual cloze, deterministic variation and exam-core integration passed');
