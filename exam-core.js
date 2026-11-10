/* Hợp đồng đề thi và chấm bài, không phụ thuộc giao diện. */
(function (global) {
  'use strict';
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
  function validate(deck) {
    return Array.isArray(deck) && deck.length === 45 && deck.every(validQuestion) &&
      new Set(deck.map(function (q) { return q.id; })).size === 45 &&
      deck.slice(0, 40).every(function (q) { return q.type === 'mcq'; }) &&
      deck.slice(40).every(function (q) { return q.type === 'essay'; });
  }
  function build(rng) {
    var deck = global.ExamMCQ.generate(rng || Math.random).concat(global.ExamEssay.generate(rng || Math.random));
    if (!validate(deck)) throw new Error('Bộ sinh phải tạo đúng 40 câu trắc nghiệm và 5 bài tự luận hợp lệ.');
    return deck;
  }
  function refreshEssays(state, rng) {
    var deck = state.deck.slice(0, 40).concat(global.ExamEssay.generate(rng || Math.random));
    if (!validate(deck)) throw new Error('Bộ sinh tự luận không tạo đủ 5 bài hợp lệ.');
    var answers = {};
    state.deck.slice(0, 40).forEach(function (q) {
      if (Object.prototype.hasOwnProperty.call(state.answers, q.id)) answers[q.id] = state.answers[q.id];
    });
    return Object.assign({}, state, { deck: deck, answers: answers, idx: 40, finished: false });
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
  function summary(deck, answers) {
    var result = { mcq: { total: 0, correct: 0, revealed: 0 }, essay: { total: 0, correct: 0, revealed: 0 }, completed: 0 };
    deck.forEach(function (q) {
      var group = result[q.type], a = answers[q.id] || {};
      group.total++;
      if (a.status === 'ok') { group.correct++; result.completed++; }
      if (a.status === 'revealed') { group.revealed++; result.completed++; }
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
        answers[q.id] = { value: a.value === undefined ? null : a.value, attempts: Number.isInteger(a.attempts) && a.attempts >= 0 ? a.attempts : 0, status: a.status };
      }
      return { version: 3, deck: s.deck, answers: answers,
        idx: Number.isInteger(s.idx) && s.idx >= 0 && s.idx < 45 ? s.idx : 0, finished: s.finished === true };
    } catch (e) { return null; }
  }
  global.ExamCore = { build: build, refreshEssays: refreshEssays, validate: validate, check: check, summary: summary, restore: restore };
})(typeof window !== 'undefined' ? window : globalThis);
