/* Hợp đồng đề thi và chấm bài, không phụ thuộc giao diện.
   Hỗ trợ 2 chế độ:
   - Ôn tập (practice): 40 câu trắc nghiệm + 5 bài tự luận (không giới hạn thời gian)
   - Làm bài thi (exam): 50 câu trắc nghiệm phân hóa (10 dễ + 15 trung bình + 25 khó xếp lộn xộn) + 5 bài tự luận (80 phút) */
(function (global) {
  'use strict';

  var DURATION_SECONDS = 80 * 60; // 80 phút = 4800 giây

  function text(s) { return typeof s === 'string' && s.trim().length > 0; }

  function validQuestion(q) {
    if (!q || !text(q.id) || !text(q.title) || !text(q.explain) || !text(q.source) ||
        !Number.isInteger(q.ch) || q.ch < 1 || q.ch > 5) return false;
    if (q.type === 'mcq') return Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every(text) && new Set(q.options).size === 4 &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4 &&
      (q.code === undefined || typeof q.code === 'string');
    if (q.type !== 'essay' || !Array.isArray(q.requirements) || !q.requirements.length ||
        !q.requirements.every(text) || !Array.isArray(q.lines) || !q.lines.length ||
        !Array.isArray(q.blanks) || !q.blanks.length) return false;
    // Bài cũ vẫn khôi phục được; bài form mới phải đủ mô tả từng lớp.
    if (q.formVersion !== undefined && (q.formVersion !== 2 ||
        ['encapsulation', 'inheritance', 'polymorphism'].indexOf(q.formId) < 0 || !text(q.introduction) ||
        !Array.isArray(q.sections) || q.sections.length < 2 || !q.sections.every(function (section) {
          return section && text(section.title) && Array.isArray(section.items) && section.items.length && section.items.every(text);
        }))) return false;
    if (!q.blanks.every(function (b) { return b && Array.isArray(b.ok) && b.ok.length && b.ok.every(text); })) return false;
    var seen = [];
    var valid = q.lines.every(function (line) {
      return Array.isArray(line) && line.every(function (seg) {
        if (typeof seg === 'string') return true;
        if (!seg || !Number.isInteger(seg.b) || seg.b < 0 || seg.b >= q.blanks.length) return false;
        seen.push(seg.b); return true;
      });
    });
    return valid && seen.length === q.blanks.length && new Set(seen).size === q.blanks.length;
  }

  function validatePractice(deck) {
    return Array.isArray(deck) && deck.length === 45 && deck.every(validQuestion) &&
      new Set(deck.map(function (q) { return q.id; })).size === 45 &&
      deck.slice(0, 40).every(function (q) { return q.type === 'mcq'; }) &&
      deck.slice(40).every(function (q) { return q.type === 'essay'; });
  }

  function validateExam(deck) {
    if (!Array.isArray(deck) || deck.length !== 55 || !deck.every(validQuestion)) return false;
    if (new Set(deck.map(function (q) { return q.id; })).size !== 55) return false;
    var mcqs = deck.slice(0, 50);
    var essays = deck.slice(50);
    if (!mcqs.every(function (q) { return q.type === 'mcq'; })) return false;
    if (!essays.every(function (q) { return q.type === 'essay'; })) return false;
    var easyCount = mcqs.filter(function (q) { return q.difficulty === 'easy'; }).length;
    var mediumCount = mcqs.filter(function (q) { return q.difficulty === 'medium'; }).length;
    var hardCount = mcqs.filter(function (q) { return q.difficulty === 'hard'; }).length;
    return easyCount === 10 && mediumCount === 15 && hardCount === 25;
  }

  function validate(deck, options) {
    if (options && options.mode === 'exam') return validateExam(deck);
    if (options && options.mode === 'practice') return validatePractice(deck);
    return validatePractice(deck) || validateExam(deck);
  }

  function buildExam(rng, options) {
    var fn = rng || Math.random;
    var opts = Object.assign({ mode: 'exam', easy: 10, medium: 15, hard: 25, fromBank: true }, options || {});
    var mcqs = typeof global.ExamMCQ.generateExam === 'function'
      ? global.ExamMCQ.generateExam(fn, opts)
      : global.ExamMCQ.generate(fn, opts);
    var essays = typeof global.ExamEssay.generateExam === 'function'
      ? global.ExamEssay.generateExam(fn, opts)
      : global.ExamEssay.generate(fn, opts);
    var deck = mcqs.concat(essays);
    if (!validateExam(deck)) {
      throw new Error('Bộ sinh đề thi phải tạo đúng 50 câu trắc nghiệm (10 dễ, 15 trung bình, 25 khó) và 5 bài tự luận hợp lệ.');
    }
    return deck;
  }

  function build(rng, options) {
    if (options && options.mode === 'exam') {
      return buildExam(rng, options);
    }
    var fn = rng || Math.random;
    var opts = options || {};
    var mcqs = (opts.fromBank && typeof global.ExamMCQ.generatePractice === 'function')
      ? global.ExamMCQ.generatePractice(fn, opts)
      : global.ExamMCQ.generate(fn, opts);
    var deck = mcqs.concat(global.ExamEssay.generate(fn, opts));
    if (!validatePractice(deck)) throw new Error('Bộ sinh phải tạo đúng 40 câu trắc nghiệm và 5 bài tự luận hợp lệ.');
    return deck;
  }

  function refreshEssays(state, rng) {
    var isExam = state && (state.mode === 'exam' || (Array.isArray(state.deck) && state.deck.length === 55));
    var mcqCount = isExam ? 50 : 40;
    var fn = rng || Math.random;
    var newEssays = isExam && typeof global.ExamEssay.generateExam === 'function'
      ? global.ExamEssay.generateExam(fn, { mode: 'exam', fromBank: true })
      : global.ExamEssay.generate(fn);
    var deck = state.deck.slice(0, mcqCount).concat(newEssays);
    if (!validate(deck, { mode: isExam ? 'exam' : 'practice' })) {
      throw new Error('Bộ sinh tự luận không tạo đủ 5 bài hợp lệ.');
    }
    var answers = {};
    state.deck.slice(0, mcqCount).forEach(function (q) {
      if (Object.prototype.hasOwnProperty.call(state.answers, q.id)) answers[q.id] = state.answers[q.id];
    });
    return Object.assign({}, state, { deck: deck, answers: answers, idx: mcqCount, finished: false });
  }

  // So sánh token C#: bỏ khoảng trắng giữa token, giữ hoa/thường và nội dung chuỗi.
  function tokens(value) {
    return JSON.stringify(String(value).match(/@"(?:[^"]|"")*"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@?[\p{L}_][\p{L}\p{N}_]*|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDmMuUlL]*|==|!=|<=|>=|\+\+|--|&&|\|\||=>|\+=|-=|\*=|\/=|\?\?|\?\.|\S/gu) || []);
  }

  function check(q, value) {
    if (q.type === 'mcq') return { correct: Number.isInteger(value) && value === q.answer, fields: [] };
    var fields = q.blanks.map(function (b, i) {
      return Array.isArray(value) && typeof value[i] === 'string' && value[i].trim() !== '' &&
        b.ok.some(function (answer) { return tokens(answer) === tokens(value[i]); });
    });
    return { correct: fields.every(Boolean), fields: fields };
  }

  // Chấm toàn bộ đề thi khi nộp bài hoặc hết giờ (80 phút)
  function gradeExam(deck, answers) {
    var graded = {};
    deck.forEach(function (q) {
      var a = (answers && answers[q.id]) ? Object.assign({}, answers[q.id]) : {
        value: q.type === 'mcq' ? null : q.blanks.map(function () { return ''; }),
        attempts: 0
      };
      if (a.status === 'ok' || a.status === 'revealed') {
        graded[q.id] = a;
        return;
      }
      var res = check(q, a.value);
      if (res.correct) {
        graded[q.id] = {
          value: a.value,
          attempts: (a.attempts || 0) + 1,
          status: 'ok'
        };
      } else {
        graded[q.id] = {
          userValue: a.value,
          value: q.type === 'mcq' ? q.answer : q.blanks.map(function (b) { return b.ok[0]; }),
          attempts: (a.attempts || 0) + 1,
          status: 'revealed'
        };
      }
    });
    return graded;
  }

  function summary(deck, answers) {
    var result = {
      mcq: { total: 0, correct: 0, revealed: 0 },
      essay: { total: 0, correct: 0, revealed: 0 },
      byDifficulty: {
        easy: { total: 0, correct: 0, revealed: 0 },
        medium: { total: 0, correct: 0, revealed: 0 },
        hard: { total: 0, correct: 0, revealed: 0 }
      },
      completed: 0
    };
    deck.forEach(function (q) {
      var group = result[q.type], a = (answers && answers[q.id]) || {};
      group.total++;
      var diffBucket = (q.type === 'mcq' && q.difficulty && result.byDifficulty[q.difficulty])
        ? result.byDifficulty[q.difficulty]
        : null;
      if (diffBucket) diffBucket.total++;
      if (a.status === 'ok') {
        group.correct++;
        if (diffBucket) diffBucket.correct++;
        result.completed++;
      }
      if (a.status === 'revealed') {
        group.revealed++;
        if (diffBucket) diffBucket.revealed++;
        result.completed++;
      }
    });
    return result;
  }

  function restore(raw) {
    try {
      var s = JSON.parse(raw);
      if (!s || s.version !== 3 || !validate(s.deck) || !s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers)) return null;
      var answers = {};
      for (var i = 0; i < s.deck.length; i++) {
        var q = s.deck[i], a = s.answers[q.id];
        if (!a) continue;
        if (typeof a !== 'object' || (a.status && a.status !== 'ok' && a.status !== 'revealed')) return null;
        if (q.type === 'mcq' && a.value !== null && a.value !== undefined && (!Number.isInteger(a.value) || a.value < 0 || a.value > 3)) return null;
        if (q.type === 'essay' && (!Array.isArray(a.value) || a.value.length !== q.blanks.length || !a.value.every(function (v) { return typeof v === 'string'; }))) return null;
        if (a.status && !check(q, a.value).correct) return null;
        var entry = {
          value: a.value === undefined ? null : a.value,
          attempts: Number.isInteger(a.attempts) && a.attempts >= 0 ? a.attempts : 0,
          status: a.status
        };
        if (a.userValue !== undefined) entry.userValue = a.userValue;
        answers[q.id] = entry;
      }
      var isExam = s.mode === 'exam' || s.deck.length === 55;
      var restored = {
        version: 3,
        mode: isExam ? 'exam' : 'practice',
        deck: s.deck,
        answers: answers,
        idx: Number.isInteger(s.idx) && s.idx >= 0 && s.idx < s.deck.length ? s.idx : 0,
        finished: s.finished === true
      };
      if (isExam) {
        restored.durationSeconds = Number.isInteger(s.durationSeconds) && s.durationSeconds > 0 ? s.durationSeconds : DURATION_SECONDS;
        restored.remainingSeconds = typeof s.remainingSeconds === 'number' && s.remainingSeconds >= 0
          ? Math.min(restored.durationSeconds, Math.floor(s.remainingSeconds))
          : restored.durationSeconds;
        restored.deadline = typeof s.deadline === 'number' ? s.deadline : null;
        restored.submitted = s.submitted === true;
        restored.submittedReason = typeof s.submittedReason === 'string' ? s.submittedReason : null;
      }
      return restored;
    } catch (e) { return null; }
  }

  global.ExamCore = {
    DURATION_SECONDS: DURATION_SECONDS,
    build: build,
    buildExam: buildExam,
    refreshEssays: refreshEssays,
    validate: validate,
    validatePractice: validatePractice,
    validateExam: validateExam,
    check: check,
    gradeExam: gradeExam,
    summary: summary,
    restore: restore
  };
})(typeof window !== 'undefined' ? window : globalThis);
