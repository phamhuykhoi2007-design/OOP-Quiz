/* Kiểm thử kho 1.500 câu trắc nghiệm (500 dễ + 500 trung bình + 500 khó = 600 câu sinh tham số + 900 câu lý thuyết C#),
   kho 300 câu tự luận theo đúng 3 form ảnh có hướng dẫn đầy đủ,
   quy tắc chống trùng lặp và 2 chế độ Ôn tập (40 + 5 từ kho) & Làm bài thi 120 phút (50 phân hóa + 5 TL). */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const context = vm.createContext({});
for (const file of ['mcq-generators.js', 'essay-generators.js', 'exam-core.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}
const { ExamMCQ, ExamEssay, ExamCore } = context;

function seeded(seed) {
  let n = seed >>> 0;
  return () => ((n = (Math.imul(1664525, n) + 1013904223) >>> 0) / 4294967296);
}

test('Kho trắc nghiệm có sẵn đúng 1500 câu (500 dễ, 500 trung bình, 500 khó), đủ chương và không trùng lặp', () => {
  assert.deepEqual({ ...ExamMCQ.BANK_COUNTS }, { easy: 500, medium: 500, hard: 500, total: 1500 });
  const bank = ExamMCQ.getBank();
  assert.equal(bank.length, 1500);
  const easy = bank.filter(q => q.difficulty === 'easy');
  const medium = bank.filter(q => q.difficulty === 'medium');
  const hard = bank.filter(q => q.difficulty === 'hard');
  assert.equal(easy.length, 500);
  assert.equal(medium.length, 500);
  assert.equal(hard.length, 500);

  const expectedByCh = { 1: 40, 2: 104, 3: 132, 4: 100, 5: 124 };
  for (const group of [easy, medium, hard]) {
    for (let ch = 1; ch <= 5; ch++) {
      assert.equal(group.filter(q => q.ch === ch).length, expectedByCh[ch], `Số câu ở ch=${ch} phải đúng chuẩn kho 1500 câu`);
    }
  }

  const sigs = new Set();
  const bankIds = new Set();
  for (const q of bank) {
    assert.equal(q.type, 'mcq');
    assert.ok(q.bankId && !bankIds.has(q.bankId), 'bankId duy nhất: ' + q.bankId);
    bankIds.add(q.bankId);
    const sig = q.title.trim() + '\u0000' + (q.code ? q.code.trim() : '');
    assert.ok(!sigs.has(sig), 'Không được trùng nội dung câu hỏi trong kho 1500 câu: ' + q.title);
    sigs.add(sig);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.every(o => typeof o === 'string' && o.trim().length > 0));
    assert.ok(Number.isInteger(q.ch) && q.ch >= 1 && q.ch <= 5);
    assert.ok(typeof q.explain === 'string' && q.explain.trim().length > 0);
    assert.ok(typeof q.source === 'string' && q.source.trim().length > 0);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.equal(ExamCore.check(q, q.answer).correct, true);
  }

  // Kiểm tra đối chiếu các câu ranh giới trong bộ 900 câu lý thuyết C# vừa nạp
  const byTpl = new Map(bank.map(q => [q.templateId, q]));
  assert.equal(byTpl.get('kb900-q1').difficulty, 'easy');
  assert.equal(byTpl.get('kb900-q1').ch, 2);
  assert.equal(byTpl.get('kb900-q1').options[byTpl.get('kb900-q1').answer], 'Tạo thể hiện');
  assert.equal(byTpl.get('kb900-q300').difficulty, 'easy');
  assert.equal(byTpl.get('kb900-q300').ch, 5);
  assert.equal(byTpl.get('kb900-q301').difficulty, 'medium');
  assert.equal(byTpl.get('kb900-q301').ch, 2);
  assert.equal(byTpl.get('kb900-q301').options[byTpl.get('kb900-q301').answer], 'public void In() { }');
  assert.equal(byTpl.get('kb900-q600').difficulty, 'medium');
  assert.equal(byTpl.get('kb900-q600').ch, 5);
  assert.equal(byTpl.get('kb900-q601').difficulty, 'hard');
  assert.equal(byTpl.get('kb900-q601').ch, 2);
  assert.equal(byTpl.get('kb900-q601').options[byTpl.get('kb900-q601').answer], '6');
  assert.equal(byTpl.get('kb900-q900').difficulty, 'hard');
  assert.equal(byTpl.get('kb900-q900').ch, 5);
  assert.equal(byTpl.get('kb900-q900').options[byTpl.get('kb900-q900').answer], 'Ghi đè ToString');
});

test('Kho tự luận có sẵn đúng 300 câu (100 đóng gói, 100 kế thừa, 100 đa hình) đúng form ảnh và đủ hướng dẫn', () => {
  const bank = ExamEssay.getBank();
  assert.equal(bank.length, 300);
  assert.equal(bank.filter(q => q.formId === 'encapsulation').length, 100);
  assert.equal(bank.filter(q => q.formId === 'inheritance').length, 100);
  assert.equal(bank.filter(q => q.formId === 'polymorphism').length, 100);

  const bankIds = new Set();
  const sigs = new Set();
  for (const q of bank) {
    assert.equal(q.type, 'essay');
    assert.equal(q.formVersion, 2);
    assert.ok(q.bankId && !bankIds.has(q.bankId));
    bankIds.add(q.bankId);
    assert.ok(typeof q.introduction === 'string' && q.introduction.length > 30, 'Phải có lời dẫn đề bài đầy đủ');
    assert.ok(Array.isArray(q.sections) && q.sections.length >= 2, 'Phải có các mục hướng dẫn từng lớp');
    q.sections.forEach((sec, idx) => {
      assert.ok(sec.title.startsWith((idx + 1) + '.'), 'Đánh số mục hướng dẫn');
      assert.ok(Array.isArray(sec.items) && sec.items.length >= 3);
    });
    assert.ok(q.blanks.length >= 60 && q.blanks.length <= 80, 'Số ô trống từ 60..80, got ' + q.blanks.length);
    const model = q.blanks.map(b => b.ok[0]);
    assert.equal(ExamCore.check(q, model).correct, true);
    const sig = JSON.stringify([q.title, q.parameters, q.blanks.map(b => b.ok[0])]);
    assert.ok(!sigs.has(sig), '300 bài tự luận trong kho phải phân biệt nhau: ' + q.bankId);
    sigs.add(sig);
  }
});

test('Chế độ Làm bài thi (120 phút): 50 câu TN phân hóa (10 dễ + 15 trung bình + 25 khó xếp lộn xộn) + 5 câu TL, chống trùng lặp giữa các đề', () => {
  assert.equal(ExamCore.DURATION_SECONDS, 120 * 60);
  ExamMCQ.resetHistory();
  ExamEssay.resetHistory();

  const seenEasy = new Set();
  const seenMedium = new Set();
  const seenHard = new Set();
  const seenEssays = new Set();

  // Rút 8 đề thi liên tiếp: 8 * 10 = 80 câu dễ (< 200), 8 * 15 = 120 câu TB (< 200), 8 * 25 = 200 câu khó (= 200), 8 * 5 = 40 câu TL (< 300)
  for (let i = 1; i <= 8; i++) {
    const deck = ExamCore.buildExam(seeded(1000 + i));
    assert.equal(deck.length, 55);
    assert.equal(ExamCore.validateExam(deck), true);
    assert.equal(ExamCore.validate(deck, { mode: 'exam' }), true);

    const mcqs = deck.slice(0, 50);
    const essays = deck.slice(50);
    assert.equal(mcqs.filter(q => q.difficulty === 'easy').length, 10);
    assert.equal(mcqs.filter(q => q.difficulty === 'medium').length, 15);
    assert.equal(mcqs.filter(q => q.difficulty === 'hard').length, 25);
    assert.equal(essays.length, 5);
    assert.equal(new Set(essays.map(q => q.formId)).size, 3, 'Đủ cả 3 form tự luận trong mỗi đề thi');

    // Kiểm tra 50 câu trắc nghiệm được xếp lộn xộn nhau (không bị xếp theo khối 10 dễ -> 15 TB -> 25 khó)
    const diffOrder = mcqs.map(q => q.difficulty).join(',');
    const sortedOrder = Array(10).fill('easy').concat(Array(15).fill('medium'), Array(25).fill('hard')).join(',');
    assert.notEqual(diffOrder, sortedOrder, '50 câu trắc nghiệm phải được trộn lẫn lộn xộn các mức độ');

    for (const q of mcqs) {
      if (q.difficulty === 'easy') {
        assert.ok(!seenEasy.has(q.bankId), 'Không lặp lại câu dễ giữa 8 đề liên tiếp: ' + q.bankId);
        seenEasy.add(q.bankId);
      } else if (q.difficulty === 'medium') {
        assert.ok(!seenMedium.has(q.bankId), 'Không lặp lại câu trung bình giữa 8 đề liên tiếp: ' + q.bankId);
        seenMedium.add(q.bankId);
      } else {
        assert.ok(!seenHard.has(q.bankId), 'Không lặp lại câu khó trong 200 câu của 8 đề đầu: ' + q.bankId);
        seenHard.add(q.bankId);
      }
    }
    for (const e of essays) {
      assert.ok(!seenEssays.has(e.bankId), 'Không lặp lại câu tự luận giữa 8 đề liên tiếp: ' + e.bankId);
      seenEssays.add(e.bankId);
    }
  }
  assert.equal(seenEasy.size, 80);
  assert.equal(seenMedium.size, 120);
  assert.equal(seenHard.size, 200);
  assert.equal(seenEssays.size, 40);
});

test('Chấm bài thi tự động khi nộp bài / hết giờ 120 phút và khôi phục trạng thái bài thi', () => {
  const deck = ExamCore.buildExam(seeded(77));
  const draftAnswers = {};
  // Trả lời đúng 5 câu dễ đầu tiên, 5 câu TB đầu tiên, 5 câu khó đầu tiên và 2 bài tự luận đầu tiên
  let easyPicked = 0, medPicked = 0, hardPicked = 0;
  for (const q of deck.slice(0, 50)) {
    if (q.difficulty === 'easy' && easyPicked < 5) {
      draftAnswers[q.id] = { value: q.answer, attempts: 0 };
      easyPicked++;
    } else if (q.difficulty === 'medium' && medPicked < 5) {
      draftAnswers[q.id] = { value: q.answer, attempts: 0 };
      medPicked++;
    } else if (q.difficulty === 'hard' && hardPicked < 5) {
      draftAnswers[q.id] = { value: q.answer, attempts: 0 };
      hardPicked++;
    } else {
      draftAnswers[q.id] = { value: (q.answer + 1) % 4, attempts: 0 };
    }
  }
  deck.slice(50, 52).forEach(q => {
    draftAnswers[q.id] = { value: q.blanks.map(b => b.ok[0]), attempts: 0 };
  });

  const graded = ExamCore.gradeExam(deck, draftAnswers);
  const s = ExamCore.summary(deck, graded);
  assert.equal(s.mcq.correct, 15);
  assert.equal(s.mcq.revealed, 35);
  assert.equal(s.byDifficulty.easy.correct, 5);
  assert.equal(s.byDifficulty.easy.total, 10);
  assert.equal(s.byDifficulty.medium.correct, 5);
  assert.equal(s.byDifficulty.medium.total, 15);
  assert.equal(s.byDifficulty.hard.correct, 5);
  assert.equal(s.byDifficulty.hard.total, 25);
  assert.equal(s.essay.correct, 2);
  assert.equal(s.essay.revealed, 3);
  assert.equal(s.completed, 55);

  const snapshot = {
    version: 3,
    mode: 'exam',
    deck,
    answers: graded,
    idx: 52,
    finished: true,
    durationSeconds: 7200,
    remainingSeconds: 1234,
    deadline: Date.now() + 1234000,
    submitted: true,
    submittedReason: 'manual'
  };
  const restored = ExamCore.restore(JSON.stringify(snapshot));
  assert.ok(restored);
  assert.equal(restored.mode, 'exam');
  assert.equal(restored.idx, 52);
  assert.equal(restored.durationSeconds, 7200);
  assert.equal(restored.remainingSeconds, 1234);
  assert.equal(restored.submitted, true);
  assert.equal(restored.submittedReason, 'manual');
});

test('Giao diện index.html có đủ 2 nút Ôn tập và Làm bài thi (120 phút) cùng bộ đếm giờ', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /id="practiceModeBtn"[^>]*>.*Ôn tập/);
  assert.match(html, /id="examModeBtn"[^>]*>.*Làm bài thi \(120 phút\)/);
  assert.match(html, /id="examTimerBadge"/);
  assert.match(html, /id="timerText"[^>]*>120:00</);
  assert.match(html, /id="submitExamBtn"/);
  assert.match(html, /Kho 1500 TN/);
});

test('Giao diện index.html có nút chuyển chế độ sáng/tối và script chống FOUT', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /id="themeToggleBtn"/);
  assert.match(html, /data-theme/);
  assert.match(html, /oopQuiz\.theme/);
});

test('Chế độ Ôn tập (fromBank: true) rút 40 câu từ kho 1500 câu, đủ 5 chương và giữ nguyên nhãn Dễ / Trung bình / Khó', () => {
  ExamMCQ.resetHistory();
  ExamEssay.resetHistory();
  const seenBankIds = new Set();

  for (let round = 1; round <= 10; round++) {
    const deck = ExamCore.build(seeded(2000 + round), { fromBank: true });
    assert.equal(deck.length, 45);
    assert.equal(ExamCore.validatePractice(deck), true);
    const mcqs = deck.slice(0, 40);
    for (let ch = 1; ch <= 5; ch++) {
      assert.equal(mcqs.filter(q => q.ch === ch).length, 8, `Ôn tập phải có 8 câu ở chương ${ch}`);
    }
    const diffs = new Set(mcqs.map(q => q.difficulty));
    assert.deepEqual([...diffs].sort(), ['easy', 'hard', 'medium'], 'Ôn tập phải có đủ 3 mức Dễ / Trung bình / Khó');
    for (const q of mcqs) {
      assert.ok(q.bankId, 'Câu Ôn tập rút từ kho phải có bankId');
      assert.ok(!seenBankIds.has(q.bankId), '10 đề Ôn tập đầu không trùng lặp bankId: ' + q.bankId);
      seenBankIds.add(q.bankId);
    }
  }
  assert.equal(seenBankIds.size, 400);

  // Kiểm tra tái lập tất định khi trackHistory: false
  const a = ExamCore.build(seeded(42), { fromBank: true, trackHistory: false });
  const b = ExamCore.build(seeded(42), { fromBank: true, trackHistory: false });
  assert.deepEqual(a, b);
});

test('Sinh đề Ôn tập và Đề thi liên tiếp nhiều vòng (excludeIds tích lũy) không bao giờ lỗi', () => {
  let history = { mcq: [], essay: [] };
  for (let round = 1; round <= 25; round++) {
    const practiceDeck = ExamCore.build(null, {
      fromBank: true,
      excludeIds: history.mcq.concat(history.essay)
    });
    assert.equal(practiceDeck.length, 45);
    assert.equal(new Set(practiceDeck.map(q => q.id)).size, 45);

    const deck = ExamCore.buildExam(null, {
      mode: 'exam',
      easy: 10,
      medium: 15,
      hard: 25,
      fromBank: true,
      excludeIds: history.mcq.concat(history.essay)
    });
    assert.equal(deck.length, 55, `Vòng ${round} phải đủ 55 câu`);
    const mcqs = deck.slice(0, 50);
    const essays = deck.slice(50);
    assert.equal(mcqs.length, 50);
    assert.equal(essays.length, 5);
    assert.equal(mcqs.filter(q => q.difficulty === 'easy').length, 10);
    assert.equal(mcqs.filter(q => q.difficulty === 'medium').length, 15);
    assert.equal(mcqs.filter(q => q.difficulty === 'hard').length, 25);
    assert.equal(new Set(deck.map(q => q.id)).size, 55, `Vòng ${round} không được trùng ID`);
    practiceDeck.concat(deck).forEach(q => {
      if (q.type === 'mcq') history.mcq.push(q.bankId || q.id);
      else history.essay.push(q.bankId || q.id);
    });
  }
});

