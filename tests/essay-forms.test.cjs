'use strict';
/* ============================================================
   tests/essay-forms.test.cjs — INDEPENDENT contract & structural
   test for the STRICT essay-form rewrite (formVersion: 2).

   Owns ONLY this file. Derives all requirements from the 18
   reference images (3 originals inspected):
     - c6b8f1e05a24208e40899f9661c64c53.jpg -> encapsulation (Sach)
     - 41f557c158bb00cd3f3697849d911b45.jpg -> inheritance  (NhanVien)
     - c3b047b7b7224e3b9189847e8154b71d.jpg -> polymorphism (SanPham)

   Contract (all obligation-bearing):
     H1  ExamEssay.generate(rng) returns EXACTLY 5 questions.
     H2  All 3 formId values 'encapsulation','inheritance','polymorphism'
         present in every deck; remaining 2 slots randomized picks from
         the SAME 3 forms (no arbitrary new forms); deck shuffled.
     H3  Over seeds, every formId occupies every deck position 0..4.
     H4  Existing schema keys {type,id,ch,title,requirements,lines,
         blanks,explain,source,templateId} kept, PLUS formVersion:2,
         formId, introduction:string, sections:[{title,items:string[]}].
     H5  requirements = flattening of introduction + sections.
     H6  lines segments are strings or {b:int}; blank indices are an
         in-bounds permutation (each blank used exactly once).
     H7  blanks[i].ok = non-empty array of non-empty strings.
     H8  Blank count per question >= 45 (hard min), <= 120 (ceiling);
         overall target range 45..100 must be maintained on average.
     H9  5 titles/scenarios unique within a deck; vary across seeds.
     H10 Seeded generation is deterministic (same seed => identical);
         different seeds change code AND blank mask beyond shuffle.
     H11 Numerical parameters (capacities, divisor, wage, markups,
         fees, thresholds, discounts) must be discoverable in prose
         (requirements/introduction/sections), not guessed.
     H12 Per-form exact C# structure (see checkEncap/checkInherit/
         checkPoly): fields, ctors, properties w/ validation, methods,
         Program statics, menu do-while/switch 1..4/0+default, non-virtual
         salary vs virtual dispatch vs abstract/virtual/override.
   Per-form structure (H12) — RED REPORTED, RESOLVED LATER:
   ============================================================
   RED EVIDENCE — first run vs pre-rewrite essay-generators.js
   (2026-11-10, command: node tests/essay-forms.test.cjs, node v24):

     ✖ H1/H2/H4-H8: deck composition + per-question schema (seed 1)
     ✖ H4-H8: schema + blank contract holds for every question over 120 seeds
     ✔ H10: same seed is deterministic
     ✔ H2/H3/H10: shuffle coverage + genuine variation beyond shuffle
     ✖ H12a: encapsulation form exact structure (120 seeds)
     ✖ H12b: inheritance form exact structure (120 seeds)
     ✖ H12c: polymorphism form exact structure (120 seeds)
     ✔ H8: blank-count distribution keeps the 45..100 target on average

     tests 8 / pass 3 / fail 5 — exit code 1.

     First error:
       AssertionError [ERR_ASSERTION]:
         seed1 q0 [encapsulation]: requirements must be the flattening of
         introduction+sections
         at checkSchema (tests/essay-forms.test.cjs)

   RED EVIDENCE — intermediate state during the parallel rewrite
   (same command): tests 8 / pass 7 / fail 1 — exit code 1.
   First error:
     AssertionError [ERR_ASSERTION]:
       seed 1 q3 [essay-polymorphism]: two nested for loops
       at checkPoly (tests/essay-forms.test.cjs)

   GREEN: after Main's rewrite landed, all 8 suites pass over 120 seeds
   (exit code 0, see 'node tests/essay-forms.test.cjs').
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../essay-generators.js'), 'utf8'), context, { filename: 'essay-generators.js' });

const FORMS = ['encapsulation', 'inheritance', 'polymorphism'];
const SEEDS = 120;

function makeRng(seed) { let s = seed >>> 0; return function () { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }; }
function generate(seed) { return context.ExamEssay.generate(makeRng(seed)); }
function solved(q) { return q.lines.map(l => l.map(seg => typeof seg === 'string' ? seg : q.blanks[seg.b].ok[0]).join('')).join('\n'); }
function masked(q) { return q.lines.map(l => l.map(seg => typeof seg === 'string' ? seg : '<#' + seg.b + '#>').join('')).join('\n'); }
function proseOf(q) { return q.requirements.join('\n'); }

/* capture the body { .. } after a matched declaration */
function bodyAfter(code, re, ctx, what) {
  const m = re.exec(code);
  assert.ok(m, ctx + ': missing ' + what);
  const from = m[0].trim().endsWith('{') ? m.index + m[0].length - 1 : m.index + m[0].length;
  const open = code.indexOf('{', from);
  assert.ok(open >= 0, ctx + ': no body for ' + what);
  let d = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') d++;
    else if (code[i] === '}') { d--; if (d === 0) return code.slice(open + 1, i); }
  }
  assert.ok(false, ctx + ': unbalanced braces for ' + what);
}
function classBody(code, name, ctx) { return bodyAfter(code, new RegExp('(?:abstract\\s+)?\\bclass\\s+' + name + '\\b[^{]*\\{'), ctx, 'class ' + name); }
function propBody(code, owner, type, name, ctx) { return bodyAfter(code, new RegExp('public\\s+' + type + '\\s+' + name + '\\s*\\{'), ctx, 'property ' + owner + '.' + name); }
function fnBody(code, name, ctx) { return bodyAfter(code, new RegExp('(?:int|void|double|string|bool)\\s+' + name + '\\s*\\('), ctx, 'method ' + name); }
function listingNames(code) {
  const out = [];
  const re = /\b(?:abstract\s+)?class\s+(\w+)/g;
  let m; while ((m = re.exec(code))) out.push(m[1]);
  return out;
}
/* number must appear in prose as a standalone token (not glued to digits/dots) */
function proseHasNum(text, num) {
  const esc = String(num).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^\\d.])' + esc + '(?![\\d.])', 'm').test(text);
}
function assertNumInProse(text, num, ctx, what) {
  assert.ok(proseHasNum(text, num), ctx + ': numeric param "' + num + '" (' + what + ') must be explicitly stated in prose');
}
/* menu case -> function call mapping inside a Main/do-while body */
function caseCalls(mainBody, n, ctx) {
  const m = new RegExp('case\\s+' + n + '\\s*:\\s*([\\s\\S]*?)break\\s*;').exec(mainBody);
  assert.ok(m, ctx + ': Main missing case ' + n);
  return m[1];
}
/* ---------- per-question generic contract (H4-H8) ---------- */
function checkSchema(q, ctx) {
  assert.equal(typeof q, 'object', ctx);
  assert.equal(q.type, 'essay', ctx);
  assert.equal(typeof q.id === 'string' && q.id.length > 0, true, ctx + ': id');
  assert.equal(typeof q.ch, 'number', ctx + ': ch');
  assert.equal(typeof q.title === 'string' && q.title.length > 0, true, ctx + ': title');
  assert.equal(typeof q.explain === 'string' && q.explain.length > 0, true, ctx + ': explain');
  assert.equal(typeof q.source === 'string' && q.source.length > 0, true, ctx + ': source');
  assert.equal(typeof q.templateId === 'string' && q.templateId.startsWith('essay-'), true, ctx + ': templateId');
  assert.equal(q.formVersion, 2, ctx + ': formVersion must be 2');
  assert.ok(FORMS.includes(q.formId), ctx + ': formId must be one of ' + FORMS.join('|'));
  assert.equal(typeof q.introduction === 'string' && q.introduction.length > 0, true, ctx + ': introduction');
  assert.ok(Array.isArray(q.sections) && q.sections.length >= 2, ctx + ': sections array');
  for (const s of q.sections) {
    assert.equal(typeof s.title === 'string' && s.title.length > 0, true, ctx + ': section title');
    assert.ok(Array.isArray(s.items) && s.items.length > 0, ctx + ': section items array');
    for (const it of s.items) assert.equal(typeof it === 'string' && it.length > 0, true, ctx + ': section item');
  }
  /* H5: requirements = flattening of introduction + sections (content-complete,
     merge-tolerant: sections may be emitted as one joined line each) */
  const req = q.requirements;
  assert.ok(Array.isArray(req) && req.length > 0 && req.every(r => typeof r === 'string' && r.length > 0), ctx + ': requirements array of strings');
  const norm = s => String(s).replace(/\s+/g, ' ').trim();
  const joined = norm(req.join(' \n '));
  const pieces = [q.introduction];
  for (const s of q.sections) pieces.push(s.title, ...s.items);
  let contentLen = 0;
  for (const p of pieces) {
    const n = norm(p);
    contentLen += n.length;
    assert.ok(joined.includes(n), ctx + ': requirements flattening loses section/introduction content "' + n.slice(0, 60) + '..."');
  }
  assert.ok(joined.length <= contentLen + 80 * pieces.length, ctx + ': requirements must not invent content beyond introduction+sections');
  assert.ok(Array.isArray(q.lines) && q.lines.length > 0, ctx + ': lines');
  const used = new Set();
  for (const line of q.lines) {
    assert.ok(Array.isArray(line) && line.length > 0, ctx + ': line array');
    for (const seg of line) {
      if (typeof seg === 'string') continue;
      assert.ok(seg && Number.isInteger(seg.b) && seg.b >= 0, ctx + ': segment {b}');
      assert.ok(seg.b < q.blanks.length, ctx + ': blank index out of bounds');
      assert.ok(!used.has(seg.b), ctx + ': blank ' + seg.b + ' used more than once');
      used.add(seg.b);
    }
  }
  assert.equal(used.size, q.blanks.length, ctx + ': blanks not fully referenced in lines');
  q.blanks.forEach((b, i) => {
    assert.ok(Array.isArray(b.ok) && b.ok.length > 0, ctx + ': blank ' + i + ' ok[]');
    for (const o of b.ok) assert.equal(typeof o === 'string' && o.length > 0, true, ctx + ': blank ' + i + ' ok entry');
  });
  assert.ok(q.blanks.length >= 45, ctx + ': at least 45 blanks, got ' + q.blanks.length);
  assert.ok(q.blanks.length <= 120, ctx + ': blank ceiling 120, got ' + q.blanks.length);
}

/* ---------- shared Main/menu checks (exact menu, 0 exits clean) ---------- */
function checkMain(q, code, mapping, ctx) {
  const main = fnBody(code, 'Main', ctx);
  assert.match(main, /\bdo\s*\{/, ctx + ': Main uses do-while');
  assert.ok(/\}\s*while\s*\(\s*chon\s*!=\s*0\s*\)/.test(main), ctx + ': do-while(chon != 0)');
  assert.match(main, /switch\s*\(\s*chon\s*\)/, ctx + ': switch(chon)');
  assert.match(main, /chon\s*=\s*int\.Parse\s*\(\s*Console\.ReadLine\s*\(\s*\)\s*\)/, ctx + ': menu int input');
  assert.match(main, /default\s*:/, ctx + ': switch default branch');
  assert.match(main, /case 0:\s*Console\.WriteLine\("Tam biet"\);\s*break;/, ctx + ': case 0 exits without invalid-choice warning');
  assert.ok(!/case 0:[\s\S]*?Gia tri khong hop le/.test(main), ctx + ': case 0 must not warn invalid choice');
  for (const m of mapping) {
    assert.ok(caseCalls(main, m[0], ctx).includes(m[1] + '('), ctx + ': case ' + m[0] + ' must call ' + m[1]);
  }
  return main;
}
/* full-array guard + add bookkeeping used by every Them() */
function checkThemShape(them, ctx) {
  assert.ok(them.includes('Danh sach da day'), ctx + ': Them reports full array');
  assert.match(them, /n\s*>=?\s*ds\.Length/, ctx + ': Them full guard via ds.Length');
  assert.match(them, /ds\[\s*n\s*\]\s*=/, ctx + ': Them stores at ds[n]');
  assert.ok(/n\s*=\s*n\s*\+\s*1/.test(them) || /n\s*\+\+/.test(them), ctx + ': Them increments n');
}
/* ---------- H12a: encapsulation form (exact structure) ---------- */
function checkEncap(q, code, prose, ctx) {
  const classes = listingNames(code);
  assert.equal(classes.length, 2, ctx + ': exactly domain class + Program');
  const cls = classes.find(c => c !== 'Program');
  assert.ok(cls, ctx + ': domain class');
  assert.match(code, /private\s+string\s+_ma\s*;/, ctx);
  assert.match(code, /private\s+string\s+_ten\s*;/, ctx);
  assert.match(code, /private\s+double\s+_gia\s*;/, ctx);
  assert.match(code, /private\s+static\s+int\s+_dem\s*=\s*0\s*;/, ctx);
  const ctor = bodyAfter(code, new RegExp('public\\s+' + cls + '\\s*\\(\\s*string\\s+ma\\s*,\\s*string\\s+ten\\s*,\\s*double\\s+gia\\s*\\)'), ctx, 'parameterized constructor(string ma,string ten,double gia)');
  assert.match(ctor, /_ma\s*=\s*ma\s*;/, ctx + ': ctor sets _ma');
  assert.match(ctor, /_ten\s*=\s*ten\s*;/, ctx + ': ctor sets _ten');
  assert.match(ctor, /this\.Gia\s*=\s*gia\s*;/, ctx + ': ctor assigns gia via this.Gia (validated)');
  assert.match(ctor, /_dem\s*\+\+\s*;/, ctx + ': ctor increments _dem after Gia');
  assert.ok(new RegExp('public\\s+string\\s+Ma\\s*(\\{\\s*get\\s*\\{\\s*return\\s+_ma\\s*;\\s*\\}\\s*\\}|=>\\s*_ma\\s*;)').test(code), ctx + ': Ma get-only');
  assert.ok(new RegExp('public\\s+static\\s+int\\s+Dem\\s*(\\{\\s*get\\s*\\{\\s*return\\s+_dem\\s*;\\s*\\}\\s*\\}|=>\\s*_dem\\s*;)').test(code), ctx + ': static Dem get-only');
  const tenP = propBody(code, cls, 'string', 'Ten', ctx);
  assert.ok(/get\s*\{\s*return\s+_ten\s*;\s*\}/.test(tenP) && /set\s*\{[\s\S]*?if\s*\(\s*!\s*string\.IsNullOrWhiteSpace\s*\(\s*value\s*\)\s*\)\s*\{?\s*_ten\s*=\s*value\s*;/.test(tenP), ctx + ': Ten get/set validated !string.IsNullOrWhiteSpace(value)');
  const giaP = propBody(code, cls, 'double', 'Gia', ctx);
  assert.ok(/get\s*\{\s*return\s+_gia\s*;\s*\}/.test(giaP) && /set\s*\{[\s\S]*?if\s*\(\s*value\s*>\s*0\s*\)\s*\{?\s*_gia\s*=\s*value\s*;/.test(giaP), ctx + ': Gia get/set validated value > 0');
  const xuat = fnBody(code, 'Xuat', ctx);
  assert.match(xuat, /Console\.WriteLine/, ctx + ': Xuat prints');
  assert.ok(/_ma|\.Ma/.test(xuat) && /_ten|\.Ten/.test(xuat) && /_gia|\.Gia/.test(xuat), ctx + ': Xuat prints ma, ten, gia');
  const capM = new RegExp('static\\s+' + cls + '\\[\\]\\s+ds\\s*=\\s*new\\s+' + cls + '\\[(\\d+)\\]').exec(code);
  assert.ok(capM, ctx + ': static domain array ds with fixed capacity');
  assertNumInProse(prose, capM[1], ctx, 'array capacity');
  assert.match(code, /static\s+int\s+n\s*=\s*0\s*;/, ctx + ': static int n = 0');
  const tim = fnBody(code, 'Tim', ctx);
  assert.match(tim, /for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;/, ctx + ': Tim loops ds[0..n-1]');
  assert.match(tim, /return\s+-1\s*;/, ctx + ': Tim returns -1 when not found');
  const them = fnBody(code, 'Them', ctx);
  checkThemShape(them, ctx);
  assert.match(them, new RegExp('new\\s+' + cls + '\\s*\\('), ctx + ': Them creates domain object');
  const xuatds = fnBody(code, 'XuatDS', ctx);
  assert.match(xuatds, /for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;/, ctx + ': XuatDS loops');
  assert.match(xuatds, /ds\[i\]\.Xuat\s*\(\s*\)/, ctx + ': XuatDS calls Xuat');
  const capnhat = fnBody(code, 'CapNhatGia', ctx);
  assert.match(capnhat, /Tim\s*\(/, ctx + ': CapNhatGia searches via Tim');
  assert.match(capnhat, /\.Gia\s*=/, ctx + ': CapNhatGia sets Gia');
  const tong = fnBody(code, 'TongGia', ctx);
  assert.match(tong, /\btong\b/, ctx + ': TongGia accumulates into tong');
  assert.match(tong, new RegExp(cls + '\\.Dem|\\bDem\\b'), ctx + ': TongGia prints ' + cls + '.Dem');
  checkMain(q, code, [[1, 'Them'], [2, 'XuatDS'], [3, 'CapNhatGia'], [4, 'TongGia']], ctx);
  for (const fn of ['Them', 'XuatDS', 'CapNhatGia', 'TongGia', 'Tim']) {
    assert.ok(prose.includes(fn), ctx + ': prose must state menu function ' + fn);
  }
}
/* ---------- H12b: inheritance form (exact structure) ---------- */
function checkInherit(q, code, prose, ctx) {
  const classes = listingNames(code);
  assert.equal(classes.length, 4, ctx + ': base + 2 subclasses + Program');
  const links = [...code.matchAll(/\bclass\s+(\w+)\s*:\s*(\w+)/g)].map(m => ({ c: m[1], p: m[2] }));
  assert.equal(links.length, 2, ctx + ': exactly two inheritance clauses');
  const baseName = links[0].p;
  assert.ok(links.every(l => l.p === baseName), ctx + ': both subclasses inherit the same base');
  const office = links.map(l => l.c).find(c => /VanPhong/.test(c));
  const prod = links.map(l => l.c).find(c => /SanXuat/.test(c));
  assert.ok(office && prod && office !== prod, ctx + ': office + production subclass names');
  const base = classBody(code, baseName, ctx);
  assert.match(base, /private\s+string\s+_ma\s*;/, ctx);
  assert.match(base, /private\s+string\s+_ten\s*;/, ctx);
  assert.match(base, /protected\s+double\s+_luongCB\s*;/, ctx + ': protected _luongCB');
  const bctor = bodyAfter(base, new RegExp('public\\s+' + baseName + '\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*\\)'), ctx, 'base constructor');
  assert.match(bctor, /_ma\s*=\s*\w+\s*;/, ctx);
  assert.match(bctor, /_ten\s*=\s*\w+\s*;/, ctx);
  assert.match(bctor, /_luongCB\s*=\s*\w+\s*;/, ctx);
  assert.ok(new RegExp('public\\s+string\\s+Ma\\s*(\\{\\s*get\\s*\\{\\s*return\\s+_ma\\s*;\\s*\\}\\s*\\}|=>\\s*_ma\\s*;)').test(base), ctx + ': Ma get-only');
  const tenP = propBody(code, baseName, 'string', 'Ten', ctx);
  assert.ok(/get\s*\{\s*return\s+_ten\s*;\s*\}/.test(tenP) && /set\s*\{[\s\S]*?_ten\s*=\s*value\s*;/.test(tenP), ctx + ': Ten get/set');
  const bts = bodyAfter(base, /public\s+override\s+string\s+ToString\s*\(/, ctx, 'base ToString override');
  assert.match(bts, /_luongCB/, ctx + ': base ToString prints base salary');
  assert.ok(!/LuongThucLinh/.test(bts), ctx + ': base ToString must NOT use dynamic salary');
  const officeBody = classBody(code, office, ctx);
  const prodBody = classBody(code, prod, ctx);
  assert.match(officeBody, /private\s+int\s+_ngayCong\s*;/, ctx + ': office _ngayCong');
  assert.match(prodBody, /private\s+int\s+_soSP\s*;/, ctx + ': production _soSP');
  const octor = bodyAfter(officeBody, new RegExp('public\\s+' + office + '\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)'), ctx, 'office constructor');
  assert.ok(/base\s*\(/.test(officeBody), ctx + ': office ctor calls base');
  const pctor = bodyAfter(prodBody, new RegExp('public\\s+' + prod + '\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)'), ctx, 'production constructor');
  assert.ok(/base\s*\(/.test(prodBody), ctx + ': production ctor calls base');
  assert.ok(!/virtual/.test(code), ctx + ': LuongThucLinh is NON-virtual (no virtual keyword anywhere)');
  const lus = code.match(/public\s+double\s+LuongThucLinh\s*\(\s*\)/g) || [];
  assert.equal(lus.length, 2, ctx + ': two public non-virtual LuongThucLinh');
  const oLu = new RegExp('public\\s+double\\s+LuongThucLinh\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+_luongCB\\s*/\\s*(\\d+)\\s*\\*\\s*_ngayCong\\s*;').exec(officeBody);
  assert.ok(oLu, ctx + ': office salary = _luongCB / divisor * _ngayCong');
  assertNumInProse(prose, oLu[1], ctx, 'office salary divisor');
  const pLu = new RegExp('public\\s+double\\s+LuongThucLinh\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+_luongCB\\s*\\+\\s*_soSP\\s*\\*\\s*(\\d+)\\s*;').exec(prodBody);
  assert.ok(pLu, ctx + ': production salary = _luongCB + _soSP * wage');
  assertNumInProse(prose, pLu[1], ctx, 'production wage');
  const ots = bodyAfter(officeBody, /public\s+override\s+string\s+ToString\s*\(/, ctx, 'office ToString override');
  assert.ok(/base\.ToString\s*\(\s*\)/.test(ots) && /_ngayCong/.test(ots), ctx + ': office ToString uses base.ToString + _ngayCong');
  const pts = bodyAfter(prodBody, /public\s+override\s+string\s+ToString\s*\(/, ctx, 'production ToString override');
  assert.ok(/base\.ToString\s*\(\s*\)/.test(pts) && /_soSP/.test(pts), ctx + ': production ToString uses base.ToString + _soSP');
  const capM = new RegExp('static\\s+' + baseName + '\\[\\]\\s+ds\\s*=\\s*new\\s+' + baseName + '\\[(\\d+)\\]').exec(code);
  assert.ok(capM, ctx + ': static base-typed array ds');
  assertNumInProse(prose, capM[1], ctx, 'array capacity');
  assert.match(code, /static\s+int\s+n\s*=\s*0\s*;/, ctx + ': static int n = 0');
  const them = fnBody(code, 'Them', ctx);
  checkThemShape(them, ctx);
  assert.match(them, new RegExp('new\\s+' + office + '\\s*\\('), ctx + ': Them creates office employee');
  assert.match(them, new RegExp('new\\s+' + prod + '\\s*\\('), ctx + ': Them creates production employee');
  const xuatds = fnBody(code, 'XuatDS', ctx);
  assert.match(xuatds, /for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;/, ctx + ': XuatDS loops');
  assert.match(xuatds, /Console\.WriteLine\s*\(\s*ds\[i\]\s*\)/, ctx + ': XuatDS prints via ToString dispatch');
  const tong = fnBody(code, 'TongLuong', ctx);
  assert.match(tong, /\btong\b/, ctx + ': TongLuong accumulates into tong');
  assert.ok(new RegExp('is\\s+' + office).test(tong), ctx + ': TongLuong checks is office');
  assert.ok(new RegExp('\\(\\s*' + office + '\\s*\\)\\s*ds\\[i\\]').test(tong) || new RegExp('\\(\\s*' + office + '\\s*\\)\\s*\\w+').test(tong), ctx + ': TongLuong explicit office cast');
  assert.ok(new RegExp('\\(\\s*' + prod + '\\s*\\)\\s*ds\\[i\\]').test(tong) || new RegExp('\\(\\s*' + prod + '\\s*\\)\\s*\\w+').test(tong), ctx + ': TongLuong explicit production cast');
  assert.ok(new RegExp('LuongThucLinh\\s*\\(').test(tong), ctx + ': TongLuong calls LuongThucLinh on casts');
  assert.ok(!new RegExp('ds\\[i\\]\\.LuongThucLinh').test(tong), ctx + ': no virtual-style ds[i].LuongThucLinh dispatch');
  const dem = fnBody(code, 'DemSanXuat', ctx);
  assert.ok(new RegExp('is\\s+' + prod).test(dem), ctx + ': DemSanXuat counts with is');
  assert.match(dem, /Console\.WriteLine/, ctx + ': DemSanXuat prints count');
  checkMain(q, code, [[1, 'Them'], [2, 'XuatDS'], [3, 'TongLuong'], [4, 'DemSanXuat']], ctx);
  for (const fn of ['Them', 'XuatDS', 'TongLuong', 'DemSanXuat', 'LuongThucLinh', 'VanPhong', 'SanXuat']) {
    assert.ok(prose.includes(fn), ctx + ': prose must state ' + fn);
  }
}
/* ---------- H12c: polymorphism form (exact structure) ---------- */
function checkPoly(q, code, prose, ctx) {
  const classes = listingNames(code);
  assert.equal(classes.length, 4, ctx + ': abstract base + 2 children + Program');
  const abs = /\babstract\s+class\s+(\w+)/.exec(code);
  assert.ok(abs, ctx + ': abstract base class');
  const base = abs[1];
  const links = [...code.matchAll(/\bclass\s+(\w+)\s*:\s*(\w+)/g)].map(m => ({ c: m[1], p: m[2] }));
  assert.equal(links.length, 2, ctx + ': exactly two children inherit the abstract base');
  assert.ok(links.every(l => l.p === base), ctx + ': children inherit the abstract base');
  const kidBodies = links.map(l => ({ name: l.c, body: classBody(code, l.c, ctx) }));
  const elec = kidBodies.find(k => k.body.includes('_thangBH'));
  const food = kidBodies.find(k => k.body.includes('_conHan'));
  assert.ok(elec && food && elec !== food, ctx + ': electronics (_thangBH) + food (_conHan) children');
  for (const k of kidBodies) assert.ok(/base\s*\(/.test(k.body), ctx + ': child ' + k.name + ' ctor calls base');
  const bBody = classBody(code, base, ctx);
  assert.match(bBody, /private\s+string\s+_ma\s*;/, ctx);
  assert.match(bBody, /private\s+string\s+_ten\s*;/, ctx);
  assert.match(bBody, /private\s+double\s+_giaGoc\s*;/, ctx);
  const ctor = bodyAfter(bBody, new RegExp('public\\s+' + base + '\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*\\)'), ctx, 'base constructor');
  assert.match(ctor, /_ma\s*=\s*\w+\s*;/, ctx);
  assert.match(ctor, /_ten\s*=\s*\w+\s*;/, ctx);
  assert.match(ctor, /this\.GiaGoc\s*=\s*\w+\s*;/, ctx + ': ctor assigns via this.GiaGoc');
  assert.ok(new RegExp('public\\s+string\\s+Ma\\s*(\\{\\s*get\\s*\\{\\s*return\\s+_ma\\s*;\\s*\\}\\s*\\}|=>\\s*_ma\\s*;)').test(bBody), ctx + ': Ma get-only');
  const giaP = propBody(bBody, base, 'double', 'GiaGoc', ctx);
  assert.ok(/get\s*\{\s*return\s+_giaGoc\s*;\s*\}/.test(giaP) && /set\s*\{[\s\S]*?if\s*\(\s*value\s*>\s*0\s*\)\s*\{?\s*_giaGoc\s*=\s*value\s*;/.test(giaP), ctx + ': GiaGoc get/set validated value > 0');
  assert.match(bBody, /public\s+abstract\s+double\s+TinhGiaBan\s*\(\s*\)\s*;/, ctx + ': abstract TinhGiaBan');
  const xv = bodyAfter(bBody, /public\s+virtual\s+void\s+Xuat\s*\(/, ctx, 'virtual Xuat in base');
  assert.ok(/TinhGiaBan/.test(xv) && /_ma|\.Ma/.test(xv) && /_ten|\.Ten/.test(xv), ctx + ': virtual Xuat prints ma, ten, sell price');
  /* electronics pricing: GiaGoc * markup + _thangBH * fee */
  const elab = new RegExp('GiaGoc\\s*\\*\\s*(\\d+(?:\\.\\d+)?)\\s*\\+\\s*_thangBH\\s*\\*\\s*(\\d+)\\s*;').exec(elec.body);
  assert.ok(elab, ctx + ': electronics price GiaGoc*markup + _thangBH*fee');
  assertNumInProse(prose, elab[1], ctx, 'electronics markup');
  assertNumInProse(prose, elab[2], ctx, 'electronics warranty fee');
  /* food pricing: gia = GiaGoc * markup; if (_conHan <= threshold) return gia * discount; otherwise plain */
  const fB = food.body;
  const fmk = /GiaGoc\s*\*\s*(\d+(?:\.\d+)?)\s*;/.exec(fB);
  const fth = /_conHan\s*<=\s*(\d+)\s*\)/.exec(fB);
  assert.ok(fmk && fth, ctx + ': food price GiaGoc*markup then if (_conHan <= threshold)');
  const fdisc = /\*\s*(\d+(?:\.\d+)?)\s*;/.exec(fB.slice(fth.index + fth[0].length));
  assert.ok(fdisc, ctx + ': discount multiply applied under threshold');
  assertNumInProse(prose, fmk[1], ctx, 'food markup');
  assertNumInProse(prose, fth[1], ctx, 'food expiry threshold');
  assertNumInProse(prose, fdisc[1], ctx, 'food discount factor');
  const fts = bodyAfter(fB, /public\s+override\s+void\s+Xuat\s*\(/, ctx, 'food Xuat override');
  assert.ok(/base\.Xuat\s*\(\s*\)/.test(fts) && /_conHan/.test(fts), ctx + ': food Xuat calls base.Xuat then prints _conHan');
  const capM = new RegExp('static\\s+' + base + '\\[\\]\\s+ds\\s*=\\s*new\\s+' + base + '\\[(\\d+)\\]').exec(code);
  assert.ok(capM, ctx + ': static base-typed array ds');
  assertNumInProse(prose, capM[1], ctx, 'array capacity');
  assert.match(code, /static\s+int\s+n\s*=\s*0\s*;/, ctx + ': static int n = 0');
  const them = fnBody(code, 'Them', ctx);
  checkThemShape(them, ctx);
  assert.match(them, new RegExp('new\\s+' + elec.name + '\\s*\\('), ctx + ': Them creates electronics');
  assert.match(them, new RegExp('new\\s+' + food.name + '\\s*\\('), ctx + ': Them creates food');
  const xuatds = fnBody(code, 'XuatDS', ctx);
  assert.match(xuatds, /ds\[i\]\.Xuat\s*\(\s*\)/, ctx + ': XuatDS calls Xuat (dispatch)');
  const sap = fnBody(code, 'SapXepGiamDan', ctx);
  assert.match(sap, /for\s*\(\s*int\s+i\s*=\s*0\s*;/, ctx + ': outer for loop');
  assert.match(sap, /for\s*\(\s*int\s+j\s*=/, ctx + ': nested inner for loop');
  assert.match(sap, /ds\[i\]\.TinhGiaBan\s*\(\s*\)\s*<\s*ds\[j\]\.TinhGiaBan\s*\(\s*\)/, ctx + ': descending compare');
  assert.match(sap, new RegExp(base + '\\s+tam\\s*(?:=\\s*ds\\[i\\]\\s*)?;'), ctx + ': swap variable typed as base class');
  assert.match(sap, /ds\[i\]\s*=\s*ds\[j\]\s*;\s*ds\[j\]\s*=\s*tam\s*;/, ctx + ': swap via tam');
  assert.match(sap, /XuatDS\s*\(\s*\)/, ctx + ': then calls XuatDS');
  const tong = fnBody(code, 'TongGiaTri', ctx);
  assert.match(tong, /\btong\b/, ctx + ': TongGiaTri accumulates into tong');
  assert.match(tong, /TinhGiaBan\s*\(\s*\)/, ctx + ': TongGiaTri uses sell price');
  checkMain(q, code, [[1, 'Them'], [2, 'XuatDS'], [3, 'SapXepGiamDan'], [4, 'TongGiaTri']], ctx);
  for (const fn of ['Them', 'XuatDS', 'SapXepGiamDan', 'TongGiaTri', 'TinhGiaBan']) {
    assert.ok(prose.includes(fn), ctx + ': prose must state ' + fn);
  }
}
/* ---------- build the seeded corpus once, reuse in every suite ---------- */
let decks;
function allDecks() {
  if (!decks) {
    decks = [];
    for (let seed = 1; seed <= SEEDS; seed++) decks.push({ seed, qs: generate(seed) });
  }
  return decks;
}

test('H1/H2/H4-H8: deck composition + per-question schema (seed 1)', () => {
  const qs = generate(1);
  assert.equal(qs.length, 5, 'generate(rng) must return exactly 5 questions');
  const counts = {};
  for (const f of FORMS) counts[f] = 0;
  for (const q of qs) counts[q.formId]++;
  for (const f of FORMS) assert.ok(counts[f] >= 1, 'formId ' + f + ' must be present in the deck');
  const extraTotal = Object.values(counts).reduce((a, b) => a + b, 0) - 3;
  assert.equal(extraTotal, 2, 'exactly 2 randomized extra slots');
  assert.equal(new Set(qs.map(q => q.id)).size, 5, 'ids must be unique');
  assert.equal(new Set(qs.map(q => q.title)).size, 5, '5 titles must be unique within a deck');
  assert.equal(new Set(qs.map(q => solved(q))).size, 5, '5 scenarios (solved code) must be unique within a deck');
  qs.forEach((q, i) => checkSchema(q, 'seed1 q' + i + ' [' + q.formId + ']'));
});

test('H4-H8: schema + blank contract holds for every question over 120 seeds', () => {
  for (const { seed, qs } of allDecks()) {
    assert.equal(qs.length, 5, 'seed ' + seed + ': exactly 5 questions');
    qs.forEach((q, i) => checkSchema(q, 'seed ' + seed + ' q' + i + ' [' + q.formId + ']'));
    assert.equal(new Set(qs.map(q => q.title)).size, 5, 'seed ' + seed + ': titles unique');
    assert.equal(new Set(qs.map(q => solved(q))).size, 5, 'seed ' + seed + ': scenarios unique');
  }
});

test('H10: same seed is deterministic', () => {
  for (let seed = 1; seed <= 10; seed++) {
    assert.deepEqual(JSON.parse(JSON.stringify(generate(seed))), JSON.parse(JSON.stringify(generate(seed))), 'seed ' + seed + ' must be deterministic');
  }
});

test('H2/H3/H10: shuffle coverage + genuine variation beyond shuffle (120 seeds)', () => {
  const decks = allDecks();
  const seenAt = {}; // formId -> Set(positions)
  const solvedBy = {}, maskBy = {};
  const extras = {};
  for (const f of FORMS) { seenAt[f] = new Set(); solvedBy[f] = []; maskBy[f] = []; extras[f] = 0; }
  for (const { qs } of decks) {
    const counts = {};
    for (const q of qs) {
      seenAt[q.formId].add(qs.indexOf(q));
      counts[q.formId] = (counts[q.formId] || 0) + 1;
      solvedBy[q.formId].push(solved(q));
      maskBy[q.formId].push(masked(q));
    }
    for (const f of FORMS) extras[f] += Math.max(0, (counts[f] || 0) - 1);
  }
  for (const f of FORMS) {
    assert.equal(seenAt[f].size, 5, 'formId ' + f + ' must occupy every deck position (shuffled)');
    const distinctSolved = new Set(solvedBy[f]).size;
    const distinctMask = new Set(maskBy[f]).size;
    assert.ok(distinctSolved >= 12, f + ': scenarios vary across seeds (distinct solved=' + distinctSolved + ')');
    assert.ok(distinctMask >= 8, f + ': blank masks vary across seeds (distinct=' + distinctMask + ')');
    let diff = 0;
    for (let i = 1; i < solvedBy[f].length; i++) if (solvedBy[f][i] !== solvedBy[f][i - 1]) diff++;
    assert.ok(diff >= 0.5 * (solvedBy[f].length - 1), f + ': consecutive seeds must change code (' + diff + '/' + (solvedBy[f].length - 1) + ')');
    assert.ok(extras[f] >= 30, f + ': must be picked as a randomized extra often (got ' + extras[f] + ')');
  }
});

test('H12a: encapsulation form exact structure (every occurrence over 120 seeds)', () => {
  for (const { seed, qs } of allDecks()) {
    qs.forEach((q, i) => {
      if (q.formId !== 'encapsulation') return;
      const ctx = 'seed ' + seed + ' q' + i + ' [' + q.templateId + ']';
      checkEncap(q, solved(q), proseOf(q), ctx);
    });
  }
});

test('H12b: inheritance form exact structure (every occurrence over 120 seeds)', () => {
  for (const { seed, qs } of allDecks()) {
    qs.forEach((q, i) => {
      if (q.formId !== 'inheritance') return;
      const ctx = 'seed ' + seed + ' q' + i + ' [' + q.templateId + ']';
      checkInherit(q, solved(q), proseOf(q), ctx);
    });
  }
});

test('H12c: polymorphism form exact structure (every occurrence over 120 seeds)', () => {
  for (const { seed, qs } of allDecks()) {
    qs.forEach((q, i) => {
      if (q.formId !== 'polymorphism') return;
      const ctx = 'seed ' + seed + ' q' + i + ' [' + q.templateId + ']';
      checkPoly(q, solved(q), proseOf(q), ctx);
    });
  }
});

test('H8: blank-count distribution keeps the 45..100 target on average', () => {
  let total = 0, count = 0, min = Infinity;
  for (const { qs } of allDecks()) for (const q of qs) { total += q.blanks.length; count++; min = Math.min(min, q.blanks.length); }
  const avg = total / count;
  assert.ok(min >= 45, 'no question below 45 blanks (min=' + min + ')');
  assert.ok(avg <= 100, 'average blank count stays in target band 45..100 (avg=' + avg.toFixed(1) + ')');
});
