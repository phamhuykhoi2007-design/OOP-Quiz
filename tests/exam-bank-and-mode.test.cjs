/* Kiểm thử kho 600 câu trắc nghiệm (200 dễ + 200 trung bình + 200 khó),
   kho 300 câu tự luận theo đúng 3 form ảnh có hướng dẫn đầy đủ,
   quy tắc chống trùng lặp và chế độ Làm bài thi 80 phút (50 TN phân hóa + 5 TL). */
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

test('Kho trắc nghiệm có sẵn đúng 600 câu (200 dễ, 200 trung bình, 200 khó), chia đều 5 chương và không trùng lặp', () => {
  const bank = ExamMCQ.getBank();
  assert.equal(bank.length, 600);
  const easy = bank.filter(q => q.difficulty === 'easy');
  const medium = bank.filter(q => q.difficulty === 'medium');
  const hard = bank.filter(q => q.difficulty === 'hard');
  assert.equal(easy.length, 200);
  assert.equal(medium.length, 200);
  assert.equal(hard.length, 200);

  for (const group of [easy, medium, hard]) {
    for (let ch = 1; ch <= 5; ch++) {
      assert.equal(group.filter(q => q.ch === ch).length, 40, `Mỗi chương phải có đúng 40 câu ở từng mức độ (ch=${ch})`);
    }
  }

  const sigs = new Set();
  const bankIds = new Set();
  for (const q of bank) {
    assert.equal(q.type, 'mcq');
    assert.ok(q.bankId && !bankIds.has(q.bankId), 'bankId duy nhất: ' + q.bankId);
    bankIds.add(q.bankId);
    const sig = q.title.trim() + '\u0000' + (q.code ? q.code.trim() : '');
    assert.ok(!sigs.has(sig), 'Không được trùng nội dung câu hỏi trong kho 600 câu: ' + q.title);
    sigs.add(sig);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.equal(ExamCore.check(q, q.answer).correct, true);
  }
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

test('Chế độ Làm bài thi (80 phút): 50 câu TN phân hóa (10 dễ + 15 trung bình + 25 khó xếp lộn xộn) + 5 câu TL, chống trùng lặp giữa các đề', () => {
  assert.equal(ExamCore.DURATION_SECONDS, 80 * 60);
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

test('Chấm bài thi tự động khi nộp bài / hết giờ 80 phút và khôi phục trạng thái bài thi', () => {
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
    durationSeconds: 4800,
    remainingSeconds: 1234,
    deadline: Date.now() + 1234000,
    submitted: true,
    submittedReason: 'manual'
  };
  const restored = ExamCore.restore(JSON.stringify(snapshot));
  assert.ok(restored);
  assert.equal(restored.mode, 'exam');
  assert.equal(restored.idx, 52);
  assert.equal(restored.remainingSeconds, 1234);
  assert.equal(restored.submitted, true);
  assert.equal(restored.submittedReason, 'manual');
});

test('Giao diện index.html có đủ 2 nút Ôn tập và Làm bài thi (80 phút) cùng bộ đếm giờ', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /id="practiceModeBtn"[^>]*>.*Ôn tập/);
  assert.match(html, /id="examModeBtn"[^>]*>.*Làm bài thi \(80 phút\)/);
  assert.match(html, /id="examTimerBadge"/);
  assert.match(html, /id="timerText"[^>]*>80:00</);
  assert.match(html, /id="submitExamBtn"/);
});
