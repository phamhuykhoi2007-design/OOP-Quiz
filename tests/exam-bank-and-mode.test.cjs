/* Kiểm thử kho 840 câu trắc nghiệm (340 dễ + 200 lý thuyết C# + 120 dự đoán kết quả + 90 upcasting + 90 downcasting, không có câu medium/hard cũ),
   kho 350 câu tự luận theo đúng 3 form ảnh (116 đóng gói + 116 kế thừa + 118 đa hình),
   quy tắc chống trùng lặp và 2 chế độ Ôn tập (40 + 5 từ kho) & Làm bài thi 120 phút (50 phân nhóm + 5 TL). */
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

test('Kho trắc nghiệm có sẵn đúng 840 câu (340 dễ, 200 theory, 120 output, 90 upcasting, 90 downcasting), 0 câu medium/hard cũ, không trùng lặp', () => {
  assert.deepEqual({ ...ExamMCQ.BANK_COUNTS }, {
    easy: 340,
    theory: 200,
    output: 120,
    upcasting: 90,
    downcasting: 90,
    total: 840
  });
  const bank = ExamMCQ.getBank();
  assert.equal(bank.length, 840);
  const easy = bank.filter(q => q.difficulty === 'easy');
  const theory = bank.filter(q => q.difficulty === 'theory');
  const output = bank.filter(q => q.difficulty === 'output');
  const upcasting = bank.filter(q => q.difficulty === 'upcasting');
  const downcasting = bank.filter(q => q.difficulty === 'downcasting');
  assert.equal(easy.length, 340);
  assert.equal(theory.length, 200);
  assert.equal(output.length, 120);
  assert.equal(upcasting.length, 90);
  assert.equal(downcasting.length, 90);
  assert.equal(bank.filter(q => q.difficulty === 'medium').length, 0);
  assert.equal(bank.filter(q => q.difficulty === 'hard').length, 0);

  const sigs = new Set();
  const bankIds = new Set();
  for (const q of bank) {
    assert.equal(q.type, 'mcq');
    assert.ok(q.bankId && !bankIds.has(q.bankId), 'bankId duy nhất: ' + q.bankId);
    bankIds.add(q.bankId);
    const sig = q.title.trim() + '\u0000' + (q.code ? q.code.trim() : '');
    assert.ok(!sigs.has(sig), 'Không được trùng nội dung câu hỏi trong kho: ' + q.title);
    sigs.add(sig);

    assert.equal(q.options.length, 5, 'Toàn bộ 840 câu trắc nghiệm phải có đúng 5 lựa chọn A-E: ' + q.options.length);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.options.every(o => typeof o === 'string' && o.trim().length > 0));
    assert.ok(Number.isInteger(q.ch) && q.ch >= 1 && q.ch <= 5);
    assert.ok(typeof q.explain === 'string' && q.explain.trim().length > 0);
    assert.ok(typeof q.source === 'string' && q.source.trim().length > 0);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
    assert.equal(ExamCore.check(q, q.answer).correct, true);
  }

  // 500 câu từ file Word có 5 lựa chọn A-E
  const word500 = bank.filter(q => q.templateId && q.templateId.startsWith('w500-'));
  assert.equal(word500.length, 500);
  assert.ok(word500.every(q => q.options.length === 5), 'Toàn bộ 500 câu Word phải có đúng 5 lựa chọn A-E');

  // Kiểm tra đối chiếu các câu ranh giới trong bộ 500 câu Word
  const byTpl = new Map(bank.map(q => [q.templateId, q]));
  assert.equal(byTpl.get('w500-q1').difficulty, 'theory');
  assert.equal(byTpl.get('w500-q1').ch, 2);
  assert.equal(byTpl.get('w500-q1').options[byTpl.get('w500-q1').answer], 'public K() { }');
  assert.equal(byTpl.get('w500-q200').difficulty, 'theory');
  assert.equal(byTpl.get('w500-q200').ch, 5);
  assert.equal(byTpl.get('w500-q200').options[byTpl.get('w500-q200').answer], 'Có thể chứa trường thể hiện');
  assert.equal(byTpl.get('w500-q201').difficulty, 'output');
  assert.equal(byTpl.get('w500-q201').ch, 5);
  assert.equal(byTpl.get('w500-q201').options[byTpl.get('w500-q201').answer], 'GNC');
  assert.equal(byTpl.get('w500-q321').difficulty, 'upcasting');
  assert.equal(byTpl.get('w500-q321').ch, 4);
  assert.equal(byTpl.get('w500-q321').options[byTpl.get('w500-q321').answer], 'Con');
  assert.equal(byTpl.get('w500-q411').difficulty, 'downcasting');
  assert.equal(byTpl.get('w500-q411').ch, 4);
  assert.equal(byTpl.get('w500-q411').options[byTpl.get('w500-q411').answer], 'B');
  assert.equal(byTpl.get('w500-q500').difficulty, 'downcasting');
  assert.equal(byTpl.get('w500-q500').ch, 5);
  assert.equal(byTpl.get('w500-q500').options[byTpl.get('w500-q500').answer], '4');
});

test('Kho tự luận có sẵn đúng 350 câu (116 đóng gói, 116 kế thừa, 118 đa hình) đúng form ảnh và đủ hướng dẫn', () => {
  const bank = ExamEssay.getBank();
  assert.equal(bank.length, 350);
  assert.equal(bank.filter(q => q.formId === 'encapsulation').length, 116);
  assert.equal(bank.filter(q => q.formId === 'inheritance').length, 116);
  assert.equal(bank.filter(q => q.formId === 'polymorphism').length, 118);

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
      assert.ok(Array.isArray(sec.items) && sec.items.length >= 2);
    });
    assert.ok(q.blanks.length >= 60 && q.blanks.length <= 80, 'Số ô trống từ 60..80, got ' + q.blanks.length);
    const model = q.blanks.map(b => b.ok[0]);
    assert.equal(ExamCore.check(q, model).correct, true);
    const sig = JSON.stringify([q.title, q.parameters, q.blanks.map(b => b.ok[0])]);
    assert.ok(!sigs.has(sig), '350 bài tự luận trong kho phải phân biệt nhau: ' + q.bankId);
    sigs.add(sig);
  }
});

test('Chế độ Làm bài thi (120 phút): 50 câu TN phân nhóm (16 dễ + 10 theory + 8 output + 8 up + 8 down xếp lộn xộn) + 5 câu TL, chống trùng lặp giữa các đề', () => {
  assert.equal(ExamCore.DURATION_SECONDS, 120 * 60);
  ExamMCQ.resetHistory();
  ExamEssay.resetHistory();

  const seenEasy = new Set();
  const seenTheory = new Set();
  const seenOutput = new Set();
  const seenUp = new Set();
  const seenDown = new Set();
  const seenEssays = new Set();

  // Rút 8 đề thi liên tiếp: 8 * 16 = 128 dễ (< 340), 8 * 10 = 80 theory (< 200), 8 * 8 = 64 output/up/down (< 120, 90, 90), 8 * 5 = 40 TL (< 350)
  for (let i = 1; i <= 8; i++) {
    const deck = ExamCore.buildExam(seeded(1000 + i));
    assert.equal(deck.length, 55);
    assert.equal(ExamCore.validateExam(deck), true);
    assert.equal(ExamCore.validate(deck, { mode: 'exam' }), true);

    const mcqs = deck.slice(0, 50);
    const essays = deck.slice(50);
    assert.equal(mcqs.filter(q => q.difficulty === 'easy').length, 16);
    assert.equal(mcqs.filter(q => q.difficulty === 'theory').length, 10);
    assert.equal(mcqs.filter(q => q.difficulty === 'output').length, 8);
    assert.equal(mcqs.filter(q => q.difficulty === 'upcasting').length, 8);
    assert.equal(mcqs.filter(q => q.difficulty === 'downcasting').length, 8);
    assert.equal(essays.length, 5);
    assert.equal(new Set(essays.map(q => q.formId)).size, 3, 'Đủ cả 3 form tự luận trong mỗi đề thi');

    // Kiểm tra 50 câu trắc nghiệm được xếp lộn xộn nhau
    const diffOrder = mcqs.map(q => q.difficulty).join(',');
    const sortedOrder = Array(16).fill('easy').concat(
      Array(10).fill('theory'),
      Array(8).fill('output'),
      Array(8).fill('upcasting'),
      Array(8).fill('downcasting')
    ).join(',');
    assert.notEqual(diffOrder, sortedOrder, '50 câu trắc nghiệm phải được trộn lẫn lộn xộn các mức độ');

    for (const q of mcqs) {
      if (q.difficulty === 'easy') {
        assert.ok(!seenEasy.has(q.bankId), 'Không lặp lại câu dễ giữa 8 đề liên tiếp: ' + q.bankId);
        seenEasy.add(q.bankId);
      } else if (q.difficulty === 'theory') {
        assert.ok(!seenTheory.has(q.bankId), 'Không lặp lại câu theory: ' + q.bankId);
        seenTheory.add(q.bankId);
      } else if (q.difficulty === 'output') {
        assert.ok(!seenOutput.has(q.bankId), 'Không lặp lại câu output: ' + q.bankId);
        seenOutput.add(q.bankId);
      } else if (q.difficulty === 'upcasting') {
        assert.ok(!seenUp.has(q.bankId), 'Không lặp lại câu upcasting: ' + q.bankId);
        seenUp.add(q.bankId);
      } else if (q.difficulty === 'downcasting') {
        assert.ok(!seenDown.has(q.bankId), 'Không lặp lại câu downcasting: ' + q.bankId);
        seenDown.add(q.bankId);
      }
    }
    for (const e of essays) {
      assert.ok(!seenEssays.has(e.bankId), 'Không lặp lại câu tự luận giữa 8 đề liên tiếp: ' + e.bankId);
      seenEssays.add(e.bankId);
    }
  }
  assert.equal(seenEasy.size, 128);
  assert.equal(seenTheory.size, 80);
  assert.equal(seenOutput.size, 64);
  assert.equal(seenUp.size, 64);
  assert.equal(seenDown.size, 64);
  assert.equal(seenEssays.size, 40);
});

test('Chấm bài thi tự động khi nộp bài / hết giờ 120 phút và khôi phục trạng thái bài thi (hỗ trợ cả đáp án 4 và 5 lựa chọn)', () => {
  const deck = ExamCore.buildExam(seeded(77));
  const draftAnswers = {};
  // Trả lời đúng một số câu và 2 bài tự luận đầu tiên
  let countCorrect = 0;
  deck.slice(0, 50).forEach((q, idx) => {
    if (idx < 20) {
      draftAnswers[q.id] = { value: q.answer, attempts: 0 };
      countCorrect++;
    } else {
      draftAnswers[q.id] = { value: (q.answer + 1) % q.options.length, attempts: 0 };
    }
  });
  deck.slice(50, 52).forEach(q => {
    draftAnswers[q.id] = { value: q.blanks.map(b => b.ok[0]), attempts: 0 };
  });

  const graded = ExamCore.gradeExam(deck, draftAnswers);
  const s = ExamCore.summary(deck, graded);
  assert.equal(s.mcq.correct, 20);
  assert.equal(s.mcq.revealed, 30);
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

test('Giao diện index.html có đủ 2 nút Ôn tập và Làm bài thi (120 phút), bộ đếm giờ và nhãn kho 840 TN & 350 Tự luận', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /id="practiceModeBtn"[^>]*>.*Ôn tập/);
  assert.match(html, /id="examModeBtn"[^>]*>.*Làm bài thi \(120 phút\)/);
  assert.match(html, /id="examTimerBadge"/);
  assert.match(html, /id="timerText"[^>]*>120:00</);
  assert.match(html, /id="submitExamBtn"/);
  assert.match(html, /Kho 840 TN &amp; 350 Tự luận/);
});

test('Giao diện index.html có nút chuyển chế độ sáng/tối và script chống FOUT', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /id="themeToggleBtn"/);
  assert.match(html, /data-theme/);
  assert.match(html, /oopQuiz\.theme/);
});

test('Chế độ Ôn tập (fromBank: true) rút 40 câu từ kho 840 câu, đủ 5 chương và bao gồm các nhóm câu hỏi', () => {
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
    assert.ok(diffs.size >= 3, 'Ôn tập phải có phong phú các nhóm câu hỏi');
    for (const q of mcqs) {
      assert.ok(q.bankId, 'Câu Ôn tập rút từ kho phải có bankId');
      if (round <= 5) {
        assert.ok(!seenBankIds.has(q.bankId), '5 đề Ôn tập đầu (40/8 câu Chương 1 = 5 vòng) không trùng lặp bankId: ' + q.bankId);
      }
      seenBankIds.add(q.bankId);
    }
    if (round === 5) assert.equal(seenBankIds.size, 200);
  }
  assert.ok(seenBankIds.size >= 300);

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
      easy: 16,
      theory: 10,
      output: 8,
      upcasting: 8,
      downcasting: 8,
      fromBank: true,
      excludeIds: history.mcq.concat(history.essay)
    });
    assert.equal(deck.length, 55, `Vòng ${round} phải đủ 55 câu`);
    const mcqs = deck.slice(0, 50);
    const essays = deck.slice(50);
    assert.equal(mcqs.length, 50);
    assert.equal(essays.length, 5);
    assert.equal(mcqs.filter(q => q.difficulty === 'easy').length, 16);
    assert.equal(mcqs.filter(q => q.difficulty === 'theory').length, 10);
    assert.equal(mcqs.filter(q => q.difficulty === 'output').length, 8);
    assert.equal(mcqs.filter(q => q.difficulty === 'upcasting').length, 8);
    assert.equal(mcqs.filter(q => q.difficulty === 'downcasting').length, 8);
    assert.equal(new Set(deck.map(q => q.id)).size, 55, `Vòng ${round} không được trùng ID`);
    practiceDeck.concat(deck).forEach(q => {
      if (q.type === 'mcq') history.mcq.push(q.bankId || q.id);
      else history.essay.push(q.bankId || q.id);
    });
  }
});
