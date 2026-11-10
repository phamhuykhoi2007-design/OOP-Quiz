/* ============================================================
   Tests cho ExamMCQ — chạy bằng Node built-in test/assert.
   Không cần thư viện ngoài.
   ============================================================ */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

require(path.join(__dirname, "..", "mcq-generators.js"));
const ExamMCQ = globalThis.ExamMCQ;

/* PRNG nhỏ, tất định — mulberry32 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}

function checkDeck(deck) {
  assert.ok(Array.isArray(deck), "generate() phải trả về array");
  assert.equal(deck.length, 40, "mỗi đề phải có đúng 40 câu");

  const ids = new Set();
  const keys = new Set();
  const templateIds = new Set();
  const chapterCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const answerCounts = [0, 0, 0, 0];

  for (const q of deck) {
    assert.equal(q.type, "mcq");
    assert.ok(isNonEmptyString(q.id), "id phải là chuỗi khác rỗng");
    assert.match(q.id, /^mcq-/, "id phải bắt đầu bằng mcq-");
    assert.ok(!ids.has(q.id), "id phải duy nhất trong đề: " + q.id);
    ids.add(q.id);

    assert.ok(Number.isInteger(q.ch) && q.ch >= 1 && q.ch <= 5, "ch phải là 1..5");
    chapterCounts[q.ch]++;

    assert.ok(isNonEmptyString(q.title), "title phải là chuỗi khác rỗng");
    assert.ok(q.code === undefined || isNonEmptyString(q.code), "code nếu có phải là chuỗi khác rỗng");

    assert.ok(Array.isArray(q.options) && q.options.length === 4, "options phải có đúng 4 phần tử");
    assert.equal(new Set(q.options).size, 4, "4 options phải khác nhau");
    q.options.forEach(function (opt, i) {
      assert.ok(isNonEmptyString(opt), "option " + i + " phải là chuỗi khác rỗng");
    });

    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3, "answer phải là 0..3");
    answerCounts[q.answer]++;

    assert.ok(isNonEmptyString(q.explain), "explain phải là chuỗi khác rỗng");
    assert.ok(isNonEmptyString(q.source), "source phải là chuỗi khác rỗng");
    assert.ok(isNonEmptyString(q.templateId), "templateId phải là chuỗi khác rỗng");

    const key = q.title + "\u0000" + (q.code || "");
    assert.ok(!keys.has(key), "không được trùng stem+code trong đề: " + q.title);
    keys.add(key);

    assert.ok(!templateIds.has(q.templateId), "templateId phải duy nhất trong đề: " + q.templateId);
    templateIds.add(q.templateId);
  }

  for (let ch = 1; ch <= 5; ch++) {
    assert.equal(chapterCounts[ch], 8, "mỗi chương phải có đúng 8 câu, chương " + ch);
  }
  assert.equal(templateIds.size, 40, "mỗi đề phải dùng 40 template khác nhau");

  return { answerCounts, templateIds };
}

test("ExamMCQ contract tồn tại", function () {
  assert.ok(ExamMCQ, "globalThis.ExamMCQ phải tồn tại");
  assert.equal(typeof ExamMCQ.generate, "function");
});

test("300 seed tất định: đúng 40 câu, schema, 8 câu/chương, không trùng", function () {
  const allTemplateIds = new Set();
  const allSources = new Set();
  const sourceByChapter = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() };
  const answerCounts = [0, 0, 0, 0];
  const templateVariants = new Map(); // templateId -> Set(signature)
  const templateAnswers = new Map();  // templateId -> Set(answer)

  for (let seed = 1; seed <= 300; seed++) {
    const deck = ExamMCQ.generate(mulberry32(seed));
    const result = checkDeck(deck);

    for (let i = 0; i < 4; i++) answerCounts[i] += result.answerCounts[i];
    for (const q of deck) {
      allTemplateIds.add(q.templateId);
      allSources.add(q.source);
      sourceByChapter[q.ch].add(q.source);

      const sig = [q.title, q.code || "", q.options.join("\u0001"), q.explain].join("\u0000");
      if (!templateVariants.has(q.templateId)) templateVariants.set(q.templateId, new Set());
      templateVariants.get(q.templateId).add(sig);

      if (!templateAnswers.has(q.templateId)) templateAnswers.set(q.templateId, new Set());
      templateAnswers.get(q.templateId).add(q.answer);
    }
  }

  assert.ok(allTemplateIds.size >= 40, "phải có ít nhất 40 template khái niệm khác nhau, thực tế " + allTemplateIds.size);
  assert.ok(allSources.size >= 5, "phải dùng ít nhất 5 nguồn tài liệu khác nhau");

  for (let ch = 1; ch <= 5; ch++) {
    assert.ok(sourceByChapter[ch].size > 0, "chương " + ch + " phải có source");
  }
  const sourcePatterns = {
    1: /Chương 1|Tổng quan/i,
    2: /Chương 2|Lớp và đối tượng/i,
    3: /Chương 3|Đóng gói/i,
    4: /Chương 4|Kế [Tt]hừa/i,
    5: /Chương 5|Đa hình/i
  };
  for (let ch = 1; ch <= 5; ch++) {
    for (const src of sourceByChapter[ch]) {
      assert.match(src, sourcePatterns[ch], "source chương " + ch + " phải nhắc tài liệu tương ứng: " + src);
    }
  }

  for (let i = 0; i < 4; i++) {
    assert.ok(answerCounts[i] > 0, "vị trí đáp án " + i + " phải xuất hiện sau 300 seed");
  }

  for (const [tid, variants] of templateVariants) {
    assert.ok(variants.size >= 2, "template " + tid + " phải có ít nhất 2 biến thể khác nhau");
  }
  for (const [tid, answers] of templateAnswers) {
    assert.ok(answers.size >= 2, "template " + tid + " phải xáo vị trí đáp án qua các seed");
  }
});

test("cùng seed => đề giống hệt; khác seed => có biến đổi", function () {
  const a = ExamMCQ.generate(mulberry32(12345));
  const b = ExamMCQ.generate(mulberry32(12345));
  const c = ExamMCQ.generate(mulberry32(12346));

  assert.deepEqual(a, b, "cùng seed phải cho cùng đề");
  assert.notDeepEqual(a, c, "seed khác phải cho đề khác");
});

test("rng mặc định (Math.random) vẫn trả đúng 40 câu hợp lệ", function () {
  const deck = ExamMCQ.generate();
  checkDeck(deck);
});

test("rng hằng số không làm treo và vẫn trả đúng 40 câu", function () {
  let calls = 0;
  const deck = ExamMCQ.generate(function () { calls++; return 0.5; });
  checkDeck(deck);
  assert.ok(calls > 0, "generate phải dùng rng được truyền vào");
});

test("Regression ngữ nghĩa C# hiện đại: primary constructor, interface/abstract, hiding, cast, single inheritance", function () {
  const byTemplate = new Map();
  for (let seed = 1; seed <= 800; seed++) {
    for (const q of ExamMCQ.generate(mulberry32(seed))) {
      if (!byTemplate.has(q.templateId)) byTemplate.set(q.templateId, []);
      byTemplate.get(q.templateId).push(q);
    }
  }

  function questions(id) {
    const arr = byTemplate.get(id) || [];
    assert.ok(arr.length > 0, "phải gặp template " + id + " trong 800 seed");
    return arr;
  }

  // Ensure every conditional mode is actually exercised, so the regressions cannot silently skip.
  assert.ok(questions("c2-class-syntax").some(q => q.title.includes("KHÔNG hợp lệ")));
  assert.ok(questions("c2-class-syntax").some(q => !q.title.includes("KHÔNG hợp lệ")));
  assert.ok(questions("c5-interface-implement").some(q => q.code));
  assert.ok(questions("c4-new-hiding").some(q => q.title.includes("cùng chữ ký")));
  assert.ok(questions("c4-base-ref-limits").some(q => q.title.startsWith("Phép gán")));
  assert.ok(questions("c4-single-inheritance").some(q => q.title.includes("tối đa bao nhiêu")));
  assert.ok(questions("c4-single-inheritance").some(q => !q.title.includes("tối đa bao nhiêu")));
  assert.ok(questions("c5-interface-vs-abstract").some(q => q.title.includes("Điểm khác biệt")));
  assert.ok(questions("c5-interface-vs-abstract").some(q => !q.title.includes("Điểm khác biệt")));

  // 1) C# 12 primary constructor: `class X() { }` is valid, must not be an invalid choice/distractor.
  for (const q of questions("c2-class-syntax")) {
    for (const opt of q.options) {
      assert.ok(!/class\s+\w+\s*\(\s*\)\s*\{/.test(opt),
        "không được dùng class X() { } làm đáp án: " + opt);
    }
    const correct = q.options[q.answer];
    if (q.title.includes("KHÔNG hợp lệ")) {
      assert.ok(correct.includes("[]"), "đáp án sai phải là cú pháp ngoặc vuông: " + correct);
    } else {
      assert.ok(correct.includes("public class"), "đáp án đúng phải là khai báo lớp thường: " + correct);
    }
  }

  // 2) Missing interface member: concrete class must implement it; abstract class must declare an abstract member.
  for (const q of questions("c5-interface-implement")) {
    if (!q.code) continue;
    assert.match(q.code, /interface\s+\w+\s*\{\s*void\s+\w+\(\);/);
    assert.ok(!/abstract\s+class/.test(q.code), "lớp trong câu phải là lớp cụ thể");
    assert.ok(q.explain.includes("không có cài đặt mặc định"));
    assert.ok(q.explain.includes("abstract"));
    assert.ok(q.explain.includes("khai báo"));
    assert.ok(!q.explain.includes("trừ khi lớp được khai báo abstract"));
    assert.ok(q.options[q.answer].includes("Lỗi biên dịch"));
  }

  // 3) Abstract method question must be scoped to classes, not interfaces.
  for (const q of questions("c5-abstract-method-syntax")) {
    assert.ok(q.explain.includes("phạm vi lớp"), "explain phải scope theo lớp: " + q.explain);
  }

  // 4) Interface no-body statements must be scoped to classic C# / no default implementation.
  for (const q of questions("c5-interface-members")) {
    assert.ok(q.explain.includes("cổ điển") || q.explain.includes("C# 8"));
    assert.ok(q.explain.includes("cài đặt mặc định"));
    assert.ok(!q.explain.includes("hợp đồng thuần túy"));
  }
  for (const q of questions("c5-interface-vs-abstract")) {
    assert.ok(!q.explain.includes("hợp đồng thuần túy"));
    if (q.title.includes("Điểm khác biệt")) {
      const correct = q.options[q.answer];
      assert.ok(correct.includes("constructor instance"));
      assert.ok(correct.includes("nhiều interface"));
      assert.ok(correct.includes("tối đa một"));
      assert.ok(q.explain.includes("cổ điển") || q.explain.includes("C# 8"));
      assert.ok(q.explain.includes("cài đặt mặc định"));
    } else {
      assert.ok(q.explain.includes("tối đa một"));
      assert.ok(q.options[q.answer].includes("nhiều interface"));
    }
  }

  // 5) Hiding: same signature + nonvirtual base instance method => CS0108.
  for (const q of questions("c4-new-hiding")) {
    if (!q.title.includes("cùng chữ ký")) continue;
    assert.ok(q.title.includes("cùng chữ ký"));
    assert.ok(q.title.includes("không virtual"));
    assert.ok(q.explain.includes("CS0108"));
    assert.ok(q.explain.includes("nạp chồng"));
    assert.ok(q.code && /class\s+\w+\s*:\s*\w+\s*\{/.test(q.code));
  }

  // 6) Downcast of exact base object: no compile, explicit cast throws.
  for (const q of questions("c4-base-ref-limits")) {
    if (!q.title.startsWith("Phép gán")) continue;
    const correct = q.options[q.answer];
    assert.ok(correct.includes("Không biên dịch"));
    assert.ok(correct.includes("InvalidCastException"));
    assert.ok(correct.includes("thực tế là"));
    assert.ok(q.explain.includes("ngầm"));
    assert.ok(q.explain.includes("InvalidCastException"));
    assert.ok(q.explain.includes("thực sự đang trỏ tới"));
  }

  // 7) Single inheritance: max one direct base class, not exactly one.
  for (const q of questions("c4-single-inheritance")) {
    for (const opt of q.options) {
      assert.notEqual(opt, "Đúng một lớp");
    }
    assert.ok(q.explain.includes("tối đa một"));
    assert.ok(q.explain.includes("object"));
    if (q.title.includes("tối đa bao nhiêu")) {
      assert.ok(q.options[q.answer].includes("Tối đa một"));
    } else {
      assert.ok(q.options[q.answer].includes("tối đa một"));
    }
  }
});
