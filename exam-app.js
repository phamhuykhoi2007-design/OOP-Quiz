/* Đề tự sinh offline: 40 trắc nghiệm và 5 chương trình C# điền khuyết. */
(function () {
  'use strict';
  var KEY = 'oopQuiz.exam.v3';
  var core = window.ExamCore, state, app;
  var chapters = { 1: 'Tổng quan OOP', 2: 'Lớp và đối tượng', 3: 'Đóng gói', 4: 'Kế thừa', 5: 'Đa hình' };
  function $(s) { return document.querySelector(s); }
  function all(s) { return Array.from(document.querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function notice(message) { $('#storageNotice').textContent = message; $('#storageNotice').classList.remove('hidden'); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { notice('Không thể lưu trên trình duyệt này. Bạn vẫn làm bài được, nhưng bài làm có thể mất khi đóng trang.'); return false; }
  }
  function current() { return state.deck[state.idx]; }
  function answer(q) {
    if (!state.answers[q.id]) state.answers[q.id] = { value: q.type === 'mcq' ? null : q.blanks.map(function () { return ''; }), attempts: 0 };
    return state.answers[q.id];
  }
  function hasWork() {
    return Object.values(state.answers).some(function (a) {
      return a.status || a.attempts || (Array.isArray(a.value) ? a.value.some(Boolean) : a.value !== null && a.value !== undefined);
    });
  }
  function oldEssayForm() {
    return state && typeof window.ExamEssay.FORM_VERSION === 'number' && state.deck.slice(40).some(function (q) {
      return q.formVersion !== window.ExamEssay.FORM_VERSION;
    });
  }
  function newEssays() {
    if (!state) return;
    var work = state.deck.slice(40).some(function (q) {
      var a = state.answers[q.id];
      return a && (a.status || a.attempts || (Array.isArray(a.value) && a.value.some(Boolean)));
    });
    if (work && !confirm('Đổi 5 bài tự luận sẽ thay câu trả lời tự luận hiện tại. 40 câu trắc nghiệm và bài làm trắc nghiệm được giữ nguyên. Tiếp tục?')) return;
    try {
      var next = core.refreshEssays(state);
      state = next;
      var saved = save(); render(true);
      if (saved) notice('Đã tạo 5 bài tự luận mới theo form ảnh. 40 câu trắc nghiệm và bài làm trắc nghiệm được giữ nguyên.');
    } catch (e) { notice('Chưa đổi được tự luận: ' + e.message + ' Bài làm hiện tại chưa bị thay đổi.'); }
  }
  function newExam(ask) {
    if (ask && hasWork() && !confirm('Tạo đề mới sẽ thay bài làm hiện tại. Bạn có muốn tiếp tục?')) return;
    try {
      // Chỉ thay bài cũ sau khi đã sinh và xác thực đầy đủ đề mới.
      var deck = core.build();
      state = { version: 3, deck: deck, answers: {}, idx: 0, finished: false };
      save(); render();
    } catch (e) {
      notice('Chưa tạo được đề: ' + e.message + ' Bài làm cũ chưa bị thay đổi.');
      if (!state) app.innerHTML = '<section class="card"><h1>Không thể tạo đề</h1><p>Hãy kiểm tra các file mcq-generators.js và essay-generators.js có trong cùng thư mục, rồi tải lại trang.</p></section>';
    }
  }
  function progress() {
    var s = core.summary(state.deck, state.answers);
    $('#progressText').textContent = 'Trắc nghiệm đúng ' + s.mcq.correct + '/40 · Tự luận đúng ' + s.essay.correct + '/5 · Đã xử lý ' + s.completed + '/45';
    $('#mcqTab').classList.toggle('active', !state.finished && state.idx < 40);
    $('#essayTab').classList.toggle('active', !state.finished && state.idx >= 40);
    $('#summaryBtn').classList.toggle('active', state.finished);
    ['mcqTab', 'essayTab', 'summaryBtn'].forEach(function (id) {
      $('#' + id).setAttribute('aria-pressed', $('#' + id).classList.contains('active'));
    });
    all('[data-go]').forEach(function (button) {
      var i = Number(button.dataset.go), q = state.deck[i], a = state.answers[q.id] || {};
      var label = (q.type === 'mcq' ? 'Câu ' + (i + 1) : 'Bài tự luận ' + (i - 39));
      button.classList.toggle('oks', a.status === 'ok');
      button.classList.toggle('rev', a.status === 'revealed');
      button.classList.toggle('draft', !a.status && (a.attempts > 0 || (Array.isArray(a.value) ? a.value.some(Boolean) : a.value !== undefined && a.value !== null)));
      button.classList.toggle('cur', !state.finished && i === state.idx);
      button.setAttribute('aria-current', !state.finished && i === state.idx ? 'step' : 'false');
      button.setAttribute('aria-label', label + (a.status === 'ok' ? ' · đúng' : a.status === 'revealed' ? ' · đã xem đáp án' : ' · chưa hoàn thành'));
      button.textContent = (q.type === 'mcq' ? i + 1 : 'B' + (i - 39)) + (a.status === 'ok' ? ' ✓' : a.status === 'revealed' ? ' ↗' : '');
    });
  }
  function navigation() {
    return '<aside class="exam-nav" aria-label="Danh sách câu hỏi"><h2>Đề tự sinh</h2>' +
      '<p>5 chương · C# · Luyện tập offline</p><h3>Trắc nghiệm</h3><div class="question-grid">' +
      state.deck.slice(0, 40).map(function (q, i) { return '<button type="button" class="qnav" data-go="' + i + '">' + (i + 1) + '</button>'; }).join('') +
      '</div><h3>Tự luận điền khuyết</h3><div class="question-grid essay-grid">' +
      state.deck.slice(40).map(function (q, i) { return '<button type="button" class="qnav" data-go="' + (40 + i) + '">B' + (i + 1) + '</button>'; }).join('') +
      '</div><p class="nav-legend">✓ Đúng · ↗ Xem đáp án<br>Viền xanh: đang làm · Nét đứt: có bản nháp</p>' +
      '<button type="button" class="secondary-btn" data-action="summary">Xem tổng kết</button></aside>';
  }
  function questionHTML(q) {
    var a = answer(q), html = '<section class="card question-card"><div class="qtop"><span class="qchip">Chương ' + q.ch + ' · ' + chapters[q.ch] +
      '</span><span class="qcount">' + (q.type === 'mcq' ? 'Câu ' + (state.idx + 1) + '/40' : 'Bài ' + (state.idx - 39) + '/5') + '</span></div>' +
      '<h1 class="qtitle" id="questionTitle" tabindex="-1">' + esc(q.title) + '</h1>';
    if (q.type === 'mcq') {
      if (q.code) html += '<pre class="codeblock mcq-code"><code>' + esc(q.code) + '</code></pre>';
      html += '<fieldset class="mcq-options"><legend>Chọn một đáp án đúng</legend>' + q.options.map(function (option, i) {
        return '<label class="mcq-option"><input type="radio" name="choice" value="' + i + '"' + (a.value === i ? ' checked' : '') +
          '><span><b>' + 'ABCD'[i] + '.</b> ' + esc(option) + '</span></label>';
      }).join('') + '</fieldset>';
    } else {
      if (q.formVersion === 2) {
        html += '<div class="essay-form-label">Form đề ảnh · ' + { encapsulation: 'Đóng gói', inheritance: 'Kế thừa và ép kiểu', polymorphism: 'Trừu tượng và đa hình' }[q.formId] + '</div>' +
          '<section class="requirements essay-assignment" aria-label="Đề bài tự luận"><p class="assignment-intro">' + esc(q.introduction) + '</p>' +
          q.sections.map(function (section) {
            return '<section class="assignment-section"><h2>' + esc(section.title) + '</h2><ul>' +
              section.items.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') + '</ul></section>';
          }).join('') + '</section>';
      } else {
        html += '<section class="requirements" aria-labelledby="requirementsTitle"><h2 id="requirementsTitle">Yêu cầu bài toán</h2><ul>' +
          q.requirements.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></section>';
      }
      html += '<div class="essay-code-heading"><h2>Hoàn thiện chương trình</h2><button type="button" class="link-btn" data-action="new-essays">Đổi 5 bài tự luận</button></div>' +
        '<p class="input-hint">Điền ' + q.blanks.length + ' ô trống. Phân biệt hoa/thường như C#; bỏ qua khoảng trắng giữa các token. Bản nháp tự lưu khi nhập.</p>' +
        '<div class="codeblock essay-code" role="group" aria-label="Chương trình C# cần hoàn thiện">' + q.lines.map(function (line) {
          return '<div class="cl">' + line.map(function (seg) {
            if (typeof seg === 'string') return '<span>' + esc(seg) + '</span>';
            return '<input class="blank" data-b="' + seg.b + '" value="' + esc(a.value[seg.b] || '') +
              '" aria-label="Ô trống ' + (seg.b + 1) + '" placeholder="' + (seg.b + 1) + '" spellcheck="false" autocomplete="off" autocapitalize="off">';
          }).join('') + '</div>';
        }).join('') + '</div>';
    }
    return html + '<div class="actionrow"><button type="button" id="checkBtn" class="primary-btn" data-action="check">Kiểm tra</button>' +
      '<button type="button" id="revealBtn" class="link-btn hidden" data-action="reveal">Xem đáp án</button>' +
      '<span id="feedback" class="fb-text" tabindex="-1" role="status" aria-live="polite"></span></div>' +
      '<div id="explain" class="explain hidden"></div><div class="cardfoot">' +
      '<button type="button" class="backbtn" data-action="back"' + (state.idx === 0 ? ' disabled' : '') + '>← Quay lại</button>' +
      '<button type="button" class="nextbtn" data-action="next">' + (state.idx === 44 ? 'Tổng kết' : state.idx === 39 ? 'Sang tự luận →' : 'Câu tiếp →') + '</button></div></section>';
  }
  function paintAnswer(showWrong) {
    var q = current(), a = answer(q), checked = core.check(q, a.value), locked = !!a.status;
    if (q.type === 'essay') all('.blank').forEach(function (input) {
      var i = Number(input.dataset.b);
      input.value = a.value[i] || '';
      input.readOnly = locked;
      input.classList.toggle('ok', locked || (showWrong && checked.fields[i]));
      input.classList.toggle('bad', !locked && showWrong && !checked.fields[i]);
      input.setAttribute('aria-invalid', !locked && showWrong && !checked.fields[i] ? 'true' : 'false');
      input.style.width = Math.min(42, Math.max(8, input.value.length + 2)) + 'ch';
    });
    else all('.mcq-option').forEach(function (label, i) {
      label.querySelector('input').disabled = locked;
      label.querySelector('input').checked = a.value === i;
      label.classList.toggle('correct-choice', locked && i === q.answer);
      label.classList.toggle('wrong-choice', showWrong && !locked && i === a.value && i !== q.answer);
    });
    $('#checkBtn').disabled = locked;
    $('#checkBtn').textContent = a.status === 'ok' ? 'Đã đúng ✓' : a.status === 'revealed' ? 'Đã xem đáp án' : 'Kiểm tra';
    $('#revealBtn').classList.toggle('hidden', locked || a.attempts < 2);
    var feedback = $('#feedback');
    feedback.className = 'fb-text' + (a.status === 'ok' ? ' ok' : showWrong && !locked ? ' bad' : '');
    feedback.textContent = a.status === 'ok' ? 'Chính xác! ✓' : a.status === 'revealed' ? 'Đã hiện đáp án; không tính là tự làm đúng.' :
      showWrong ? (q.type === 'mcq' ? 'Chưa đúng — hãy thử lại.' : 'Đúng ' + checked.fields.filter(Boolean).length + '/' + q.blanks.length + ' ô. Ô sai có viền đỏ; hãy kiểm tra hoa/thường.') : '';
    $('#explain').classList.toggle('hidden', !locked);
    if (locked) $('#explain').innerHTML = '<b>Giải thích: </b>' + esc(q.explain) + (q.type === 'essay' ?
      '<details><summary>Đáp án và giải thích từng ô</summary><ol>' + q.blanks.map(function (b) { return '<li><code>' + esc(b.ok[0]) + '</code>' + (b.explain ? ' — ' + esc(b.explain) : '') + '</li>'; }).join('') + '</ol></details>' : '') +
      '<p class="source-note">Nguồn dạng bài: ' + esc(q.source) + '</p>';
    progress();
  }
  function finishHTML() {
    var s = core.summary(state.deck, state.answers);
    return '<section class="card finish"><h1 id="questionTitle" tabindex="-1">' + (s.completed === 45 ? 'Tổng kết đề luyện tập' : 'Tổng kết hiện tại') + '</h1>' +
      '<p>' + (45 - s.completed ? 'Còn ' + (45 - s.completed) + ' câu/bài chưa hoàn thành. Bạn có thể quay lại làm tiếp.' : 'Bạn đã xử lý đủ 40 câu trắc nghiệm và 5 bài tự luận.') + '</p>' +
      '<div class="chapsum"><h2>Trắc nghiệm</h2><p>Tự làm đúng <b>' + s.mcq.correct + '/40</b> (' + Math.round(s.mcq.correct / 40 * 100) + '%) · Xem đáp án: ' + s.mcq.revealed + '</p>' +
      '<h2>Tự luận điền khuyết</h2><p>Tự làm đúng toàn bài <b>' + s.essay.correct + '/5</b> · Xem đáp án: ' + s.essay.revealed + '</p>' +
      '<p>Đáp án đã xem không được tính vào số câu tự làm đúng.</p></div>' +
      '<div class="fin-btns"><button type="button" class="primary-btn" data-action="continue">Quay lại bài làm</button>' +
      '<button type="button" class="regenbtn" data-action="new">Tạo đề mới 🎲</button></div></section>';
  }
  function render(focus) {
    app.innerHTML = '<div class="exam-layout">' + navigation() + '<div class="exam-content">' + (state.finished ? finishHTML() : questionHTML(current())) + '</div></div>';
    if (!state.finished) paintAnswer(false); else progress();
    if (focus) $('#questionTitle').focus({ preventScroll: false });
  }
  function go(index) { state.idx = index; state.finished = false; save(); render(true); }
  function summary() { state.finished = true; save(); render(true); }
  function check() {
    var q = current(), a = answer(q);
    if (a.status) return;
    if (q.type === 'mcq' && a.value === null) { $('#feedback').textContent = 'Hãy chọn một đáp án trước.'; return; }
    a.attempts++;
    if (core.check(q, a.value).correct) a.status = 'ok';
    save(); paintAnswer(true);
    if (a.status) $('#feedback').focus({ preventScroll: true });
  }
  function reveal() {
    var q = current(), a = answer(q);
    if (a.status || a.attempts < 2) return;
    a.value = q.type === 'mcq' ? q.answer : q.blanks.map(function (b) { return b.ok[0]; });
    a.status = 'revealed'; save(); paintAnswer(false); $('#feedback').focus({ preventScroll: true });
  }
  document.addEventListener('DOMContentLoaded', function () {
    app = $('#app');
    try {
      var raw = localStorage.getItem(KEY);
      state = core.restore(raw);
      if (raw && !state) notice('Bài lưu không hợp lệ hoặc thuộc phiên bản cũ. Đã tạo đề mới; tiến độ của bản web cũ vẫn được giữ riêng.');
    } catch (e) { notice('Trình duyệt không cho đọc bài lưu. Hãy giữ trang mở để tránh mất bài.'); }
    if (state) render(); else newExam(false);
    if (oldEssayForm()) notice('Bài tự luận đang lưu thuộc mẫu cũ. Bấm “Đổi 5 bài tự luận” để nhận đúng form ảnh; phần trắc nghiệm được giữ nguyên. Bài cũ chưa bị xóa.');
    $('#newExamBtn').addEventListener('click', function () { newExam(true); });
    $('#newEssaysBtn').addEventListener('click', newEssays);
    $('#clearBtn').addEventListener('click', function () {
      if (!state || !confirm('Xóa toàn bộ câu trả lời của đề hiện tại? Nội dung đề vẫn giữ nguyên.')) return;
      state.answers = {}; state.idx = 0; state.finished = false; save(); render(true);
    });
    $('#mcqTab').addEventListener('click', function () { if (state) go(0); });
    $('#essayTab').addEventListener('click', function () { if (state) go(40); });
    $('#summaryBtn').addEventListener('click', function () { if (state) summary(); });
    app.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button || !state) return;
      if (button.dataset.go !== undefined) { go(Number(button.dataset.go)); return; }
      switch (button.dataset.action) {
        case 'check': check(); break;
        case 'reveal': reveal(); break;
        case 'back': if (state.idx > 0) go(state.idx - 1); break;
        case 'next': if (state.idx < 44) go(state.idx + 1); else summary(); break;
        case 'summary': summary(); break;
        case 'continue': state.finished = false; save(); render(true); break;
        case 'new': newExam(true); break;
        case 'new-essays': newEssays(); break;
      }
    });
    app.addEventListener('input', function (event) {
      if (!state || state.finished) return;
      var q = current(), a = answer(q), input = event.target;
      if (a.status) return;
      if (input.matches('[name="choice"]')) { a.value = Number(input.value); paintAnswer(false); }
      else if (input.matches('.blank')) {
        a.value[Number(input.dataset.b)] = input.value;
        input.classList.remove('bad', 'ok'); input.setAttribute('aria-invalid', 'false');
        input.style.width = Math.min(42, Math.max(8, input.value.length + 2)) + 'ch';
      } else return;
      save(); progress();
    });
    app.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.matches('.blank') && !state.finished) {
        event.preventDefault(); if (!answer(current()).status) check();
      }
    });
  });
})();
