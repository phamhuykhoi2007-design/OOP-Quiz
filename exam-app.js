/* Đề tự sinh offline:
   - Chế độ Ôn tập (practice): 40 câu trắc nghiệm + 5 bài tự luận điền khuyết (không giới hạn thời gian)
   - Chế độ Làm bài thi (exam): 80 phút, 50 câu trắc nghiệm phân hóa (10 Dễ + 15 Trung bình + 25 Khó xếp lộn xộn từ kho 600 câu) + 5 bài tự luận (từ kho 300 câu) */
(function () {
  'use strict';

  var KEY = 'oopQuiz.exam.v3';
  var HISTORY_KEY = 'oopQuiz.bankHistory.v1';
  var core = window.ExamCore, state, app, timerInterval = null;
  var chapters = { 1: 'Tổng quan OOP', 2: 'Lớp và đối tượng', 3: 'Đóng gói', 4: 'Kế thừa', 5: 'Đa hình' };
  var diffLabels = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };

  var ICONS = {
    check: '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    arrowLeft: '<svg class="btn-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    arrowRight: '<svg class="btn-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    code: '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    moon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    sun: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
  };

  function $(s) { return document.querySelector(s); }
  function all(s) { return Array.from(document.querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function escCode(s) {
    return esc(s).replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }
  function notice(message) {
    var box = $('#storageNotice');
    if (!box) return;
    var textEl = $('#storageNoticeText');
    if (textEl) textEl.textContent = message;
    else box.textContent = message;
    box.classList.remove('hidden');
  }
  function hideNotice() {
    var box = $('#storageNotice');
    if (box) box.classList.add('hidden');
  }

  function isExamMode() {
    return !!(state && (state.mode === 'exam' || state.deck.length === 55));
  }
  function mcqTotal() {
    return isExamMode() ? 50 : 40;
  }
  function deckTotal() {
    return state && Array.isArray(state.deck) ? state.deck.length : 45;
  }

  function loadBankHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return { mcq: [], essay: [] };
      var parsed = JSON.parse(raw);
      return {
        mcq: Array.isArray(parsed && parsed.mcq) ? parsed.mcq.filter(function (x) { return typeof x === 'string'; }) : [],
        essay: Array.isArray(parsed && parsed.essay) ? parsed.essay.filter(function (x) { return typeof x === 'string'; }) : []
      };
    } catch (e) {
      return { mcq: [], essay: [] };
    }
  }

  function recordBankHistory(deck) {
    try {
      var hist = loadBankHistory();
      var mcqSet = new Set(hist.mcq);
      var essaySet = new Set(hist.essay);
      deck.forEach(function (q) {
        var bId = q.bankId || q.id;
        if (!bId) return;
        if (q.type === 'mcq') mcqSet.add(bId);
        else if (q.type === 'essay') essaySet.add(bId);
      });
      var mcqArr = Array.from(mcqSet);
      var essayArr = Array.from(essaySet);
      if (mcqArr.length > 200) mcqArr = mcqArr.slice(mcqArr.length - 150);
      if (essayArr.length > 100) essayArr = essayArr.slice(essayArr.length - 75);
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ mcq: mcqArr, essay: essayArr }));
    } catch (e) {}
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { notice('Không thể lưu trên trình duyệt này. Bạn vẫn làm bài được, nhưng bài làm có thể mất khi đóng trang.'); return false; }
  }

  function current() { return state.deck[state.idx]; }
  function answer(q) {
    if (!state.answers[q.id]) state.answers[q.id] = { value: q.type === 'mcq' ? null : q.blanks.map(function () { return ''; }), attempts: 0 };
    return state.answers[q.id];
  }
  function isAnswered(q) {
    var a = state.answers[q.id];
    if (!a) return false;
    if (a.status) return true;
    if (q.type === 'mcq') return a.value !== null && a.value !== undefined;
    return Array.isArray(a.value) && a.value.some(function (v) { return typeof v === 'string' && v.trim() !== ''; });
  }
  function hasWork() {
    if (!state || !state.answers) return false;
    return Object.values(state.answers).some(function (a) {
      return a.status || a.attempts || (Array.isArray(a.value) ? a.value.some(Boolean) : a.value !== null && a.value !== undefined);
    });
  }
  function oldEssayForm() {
    var mTotal = mcqTotal();
    return state && typeof window.ExamEssay.FORM_VERSION === 'number' && state.deck.slice(mTotal).some(function (q) {
      return q.formVersion !== window.ExamEssay.FORM_VERSION;
    });
  }

  function formatTime(seconds) {
    var s = Math.max(0, Math.floor(seconds || 0));
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerUI() {
    var badge = $('#examTimerBadge');
    var timerText = $('#timerText');
    var submitBtn = $('#submitExamBtn');
    if (!badge || !timerText) return;
    if (!isExamMode()) {
      badge.classList.add('hidden');
      if (submitBtn) submitBtn.classList.add('hidden');
      return;
    }
    badge.classList.remove('hidden');
    var rem = state.remainingSeconds !== undefined ? state.remainingSeconds : (core.DURATION_SECONDS || 4800);
    timerText.textContent = state.submitted ? ('Đã nộp · ' + formatTime(rem)) : formatTime(rem);
    badge.classList.toggle('timer-warn', !state.submitted && rem <= 600 && rem > 180);
    badge.classList.toggle('timer-danger', !state.submitted && rem <= 180);
    badge.classList.toggle('timer-done', !!state.submitted);
    if (submitBtn) {
      submitBtn.classList.toggle('hidden', !!state.submitted);
    }
  }

  function startTimerIfNeeded() {
    stopTimer();
    if (!isExamMode()) {
      updateTimerUI();
      return;
    }
    if (state.submitted) {
      updateTimerUI();
      return;
    }
    var dur = state.durationSeconds || core.DURATION_SECONDS || 4800;
    if (!state.deadline) {
      var initialRem = typeof state.remainingSeconds === 'number' ? state.remainingSeconds : dur;
      state.deadline = Date.now() + initialRem * 1000;
      state.remainingSeconds = initialRem;
      save();
    } else {
      state.remainingSeconds = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    }
    updateTimerUI();
    if (state.remainingSeconds <= 0) {
      submitExam('timeout');
      return;
    }
    timerInterval = setInterval(function () {
      if (!state || !isExamMode() || state.submitted) {
        stopTimer();
        return;
      }
      var rem = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
      state.remainingSeconds = rem;
      updateTimerUI();
      if (rem % 5 === 0) save();
      if (rem <= 0) {
        stopTimer();
        submitExam('timeout');
      }
    }, 1000);
  }

  function submitExam(reason) {
    if (!state || !isExamMode() || state.submitted) return;
    if (reason === 'manual') {
      var answeredCount = state.deck.filter(isAnswered).length;
      var msg = 'Bạn đã làm ' + answeredCount + '/' + state.deck.length + ' câu (còn ' + formatTime(state.remainingSeconds) + ').\n' +
        'Nộp bài thi ngay bây giờ để chấm điểm toàn bộ 50 câu trắc nghiệm và 5 câu tự luận?';
      if (!confirm(msg)) return;
    }
    stopTimer();
    if (state.deadline) {
      state.remainingSeconds = reason === 'timeout' ? 0 : Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    }
    state.answers = core.gradeExam(state.deck, state.answers);
    state.submitted = true;
    state.submittedReason = reason || 'manual';
    state.finished = true;
    save();
    updateTimerUI();
    render(true);
    if (reason === 'timeout') {
      notice('Hết thời gian làm bài 80 phút! Hệ thống đã tự động thu bài và chấm điểm toàn bộ 50 câu trắc nghiệm và 5 câu tự luận.');
    } else {
      notice('Đã nộp bài thi thành công! Bạn có thể xem bảng điểm phân hóa hoặc bấm vào từng câu để xem lời giải chi tiết.');
    }
  }

  function newEssays() {
    if (!state) return;
    if (isExamMode() && state.submitted) {
      notice('Đề thi này đã nộp. Hãy bấm “Tạo đề mới” để bắt đầu đề thi 80 phút mới.');
      return;
    }
    var mTotal = mcqTotal();
    var work = state.deck.slice(mTotal).some(function (q) {
      var a = state.answers[q.id];
      return a && (a.status || a.attempts || (Array.isArray(a.value) && a.value.some(Boolean)));
    });
    if (work && !confirm('Đổi 5 bài tự luận sẽ thay câu trả lời tự luận hiện tại. ' + mTotal + ' câu trắc nghiệm và bài làm trắc nghiệm được giữ nguyên. Tiếp tục?')) return;
    try {
      var next = core.refreshEssays(state);
      state = next;
      recordBankHistory(state.deck.slice(mTotal));
      var saved = save(); render(true);
      if (saved) notice('Đã tạo 5 bài tự luận mới từ kho 300 bài theo form ảnh. ' + mTotal + ' câu trắc nghiệm và bài làm trắc nghiệm được giữ nguyên.');
    } catch (e) { notice('Chưa đổi được tự luận: ' + e.message + ' Bài làm hiện tại chưa bị thay đổi.'); }
  }

  function newExam(ask, targetMode) {
    var mode = targetMode || (isExamMode() ? 'exam' : 'practice');
    if (ask && hasWork() && !(isExamMode() && state.submitted)) {
      var promptMsg = mode === 'exam'
        ? 'Bắt đầu đề thi mới (80 phút · 50 câu trắc nghiệm phân hóa + 5 bài tự luận) sẽ thay bài làm hiện tại. Bạn có muốn tiếp tục?'
        : 'Tạo đề ôn tập mới sẽ thay bài làm hiện tại. Bạn có muốn tiếp tục?';
      if (!confirm(promptMsg)) return;
    }
    try {
      stopTimer();
      hideNotice();
      if (mode === 'exam') {
        var hist = loadBankHistory();
        var deckExam;
        try {
          deckExam = core.buildExam(null, {
            mode: 'exam',
            easy: 10,
            medium: 15,
            hard: 25,
            fromBank: true,
            excludeIds: hist.mcq.concat(hist.essay)
          });
        } catch (innerErr) {
          deckExam = core.buildExam(null, {
            mode: 'exam',
            easy: 10,
            medium: 15,
            hard: 25,
            fromBank: true,
            excludeIds: []
          });
        }
        recordBankHistory(deckExam);
        var dur = core.DURATION_SECONDS || 4800;
        state = {
          version: 3,
          mode: 'exam',
          deck: deckExam,
          answers: {},
          idx: 0,
          finished: false,
          durationSeconds: dur,
          remainingSeconds: dur,
          deadline: Date.now() + dur * 1000,
          submitted: false,
          submittedReason: null
        };
      } else {
        var deckPractice = core.build();
        state = {
          version: 3,
          mode: 'practice',
          deck: deckPractice,
          answers: {},
          idx: 0,
          finished: false
        };
      }
      save();
      startTimerIfNeeded();
      render();
    } catch (e) {
      notice('Chưa tạo được đề: ' + e.message + ' Bài làm cũ chưa bị thay đổi.');
      if (!state) app.innerHTML = '<section class="card"><h1>Không thể tạo đề</h1><p>Hãy kiểm tra các file mcq-generators.js và essay-generators.js có trong cùng thư mục, rồi tải lại trang.</p></section>';
    }
  }

  function switchMode(targetMode) {
    var currentMode = isExamMode() ? 'exam' : 'practice';
    if (state && currentMode === targetMode) return;
    newExam(true, targetMode);
  }

  function syncModeHeader() {
    var exam = isExamMode();
    var practiceBtn = $('#practiceModeBtn');
    var examBtn = $('#examModeBtn');
    if (practiceBtn && examBtn) {
      practiceBtn.classList.toggle('active', !exam);
      practiceBtn.setAttribute('aria-pressed', !exam ? 'true' : 'false');
      examBtn.classList.toggle('active', exam);
      examBtn.setAttribute('aria-pressed', exam ? 'true' : 'false');
    }
    var fmt = $('#examFormatText');
    if (fmt) {
      fmt.textContent = exam
        ? '50 Trắc nghiệm · 5 Tự luận'
        : '40 Trắc nghiệm · 5 Tự luận';
      fmt.classList.toggle('hidden', exam);
    }
    var mcqTab = $('#mcqTab');
    if (mcqTab) {
      mcqTab.textContent = exam
        ? 'Trắc nghiệm · 50 câu'
        : 'Trắc nghiệm · 40 câu';
    }
    var newEssaysBtn = $('#newEssaysBtn');
    if (newEssaysBtn) {
      newEssaysBtn.classList.toggle('hidden', exam);
    }
    updateTimerUI();
  }

  function progress() {
    syncModeHeader();
    var mTotal = mcqTotal();
    var total = deckTotal();
    var s = core.summary(state.deck, state.answers);
    if (isExamMode()) {
      var answeredCount = state.deck.filter(isAnswered).length;
      if (state.submitted) {
        $('#progressText').textContent = 'Kết quả bài thi: Trắc nghiệm đúng ' + s.mcq.correct + '/50 · Tự luận đúng ' + s.essay.correct + '/5 · Tổng đúng ' + (s.mcq.correct + s.essay.correct) + '/55';
      } else {
        var mcqAns = state.deck.slice(0, 50).filter(isAnswered).length;
        var essayAns = state.deck.slice(50).filter(isAnswered).length;
        $('#progressText').textContent = 'Trắc nghiệm đã làm ' + mcqAns + '/50 · Tự luận đã làm ' + essayAns + '/5 · Đã làm ' + answeredCount + '/55';
      }
    } else {
      $('#progressText').textContent = 'Trắc nghiệm đúng ' + s.mcq.correct + '/' + mTotal + ' · Tự luận đúng ' + s.essay.correct + '/5 · Đã xử lý ' + s.completed + '/' + total;
    }
    var pBar = $('#examProgressBar');
    if (pBar) {
      var countForBar = (isExamMode() && !state.submitted) ? state.deck.filter(isAnswered).length : s.completed;
      var pct = total > 0 ? Math.round((countForBar / total) * 100) : 0;
      pBar.style.width = pct + '%';
      pBar.setAttribute('aria-valuenow', pct);
    }
    $('#mcqTab').classList.toggle('active', !state.finished && state.idx < mTotal);
    $('#essayTab').classList.toggle('active', !state.finished && state.idx >= mTotal);
    $('#summaryBtn').classList.toggle('active', state.finished);
    ['mcqTab', 'essayTab', 'summaryBtn'].forEach(function (id) {
      $('#' + id).setAttribute('aria-pressed', $('#' + id).classList.contains('active'));
    });
    all('[data-go]').forEach(function (button) {
      var i = Number(button.dataset.go), q = state.deck[i], a = state.answers[q.id] || {};
      var label = (q.type === 'mcq' ? 'Câu ' + (i + 1) : 'Bài tự luận ' + (i - mTotal + 1));
      var isAns = isAnswered(q);
      button.textContent = q.type === 'mcq' ? String(i + 1) : ('B' + (i - mTotal + 1));
      if (isExamMode()) {
        if (state.submitted) {
          button.classList.toggle('oks', a.status === 'ok');
          button.classList.toggle('wrong', a.status === 'revealed');
          button.classList.remove('rev', 'draft');
          button.setAttribute('aria-label', label + (a.status === 'ok' ? ' · đúng' : ' · sai'));
        } else {
          button.classList.remove('oks', 'wrong', 'rev');
          button.classList.toggle('draft', isAns);
          button.setAttribute('aria-label', label + (isAns ? ' · đã làm' : ' · chưa làm'));
        }
      } else {
        button.classList.remove('wrong');
        button.classList.toggle('oks', a.status === 'ok');
        button.classList.toggle('rev', a.status === 'revealed');
        button.classList.toggle('draft', !a.status && isAns);
        button.setAttribute('aria-label', label + (a.status === 'ok' ? ' · đúng' : a.status === 'revealed' ? ' · đã xem đáp án' : isAns ? ' · đã điền nháp' : ' · chưa hoàn thành'));
      }
      button.classList.toggle('cur', !state.finished && i === state.idx);
      button.setAttribute('aria-current', !state.finished && i === state.idx ? 'step' : 'false');
    });
  }

  function navigation() {
    var mTotal = mcqTotal();
    var exam = isExamMode();
    var legendHTML = '';
    if (exam) {
      if (state.submitted) {
        legendHTML = '<span class="leg-item"><span class="leg-dot leg-ok"></span>Đúng</span>' +
          '<span class="leg-item"><span class="leg-dot leg-wrong"></span>Sai</span>' +
          '<span class="leg-item"><span class="leg-dot leg-cur"></span>Đang xem</span>';
      } else {
        legendHTML = '<span class="leg-item"><span class="leg-dot leg-draft"></span>Đã làm</span>' +
          '<span class="leg-item"><span class="leg-dot leg-empty"></span>Chưa làm</span>' +
          '<span class="leg-item"><span class="leg-dot leg-cur"></span>Đang xem</span>';
      }
    } else {
      legendHTML = '<span class="leg-item"><span class="leg-dot leg-ok"></span>Đúng</span>' +
        '<span class="leg-item"><span class="leg-dot leg-rev"></span>Xem đáp án</span>' +
        '<span class="leg-item"><span class="leg-dot leg-draft"></span>Nháp</span>' +
        '<span class="leg-item"><span class="leg-dot leg-cur"></span>Đang làm</span>';
    }
    return '<aside class="exam-nav" aria-label="Danh sách câu hỏi">' +
      '<div class="exam-nav-head"><h2>' + (exam ? 'Đề thi 80 phút' : 'Đề ôn tập') + '</h2>' +
      '<p>' + (exam ? '50 trắc nghiệm phân hóa · 5 tự luận · 80:00' : '40 trắc nghiệm · 5 tự luận · Tự do thời gian') + '</p></div>' +
      '<div class="nav-section-title"><h3>Trắc nghiệm</h3><span class="nav-badge">' + mTotal + ' câu</span></div>' +
      '<div class="question-grid">' +
      state.deck.slice(0, mTotal).map(function (q, i) { return '<button type="button" class="qnav" data-go="' + i + '">' + (i + 1) + '</button>'; }).join('') +
      '</div><div class="nav-section-title"><h3>Tự luận điền khuyết</h3><span class="nav-badge">5 bài</span></div>' +
      '<div class="question-grid essay-grid">' +
      state.deck.slice(mTotal).map(function (q, i) { return '<button type="button" class="qnav" data-go="' + (mTotal + i) + '">B' + (i + 1) + '</button>'; }).join('') +
      '</div><div class="nav-legend-box"><p class="nav-legend">' + legendHTML + '</p>' +
      '<div class="nav-kbd-hint"><span class="kbd-key">1–4</span> chọn · <span class="kbd-key">Enter</span> kiểm tra · <span class="kbd-key">← →</span> đổi câu</div></div>' +
      (exam && !state.submitted ? '<button type="button" class="submit-exam-btn nav-submit-btn" data-action="submit-exam">' + ICONS.check + '<span>Nộp bài thi ngay</span></button>' : '') +
      '<button type="button" class="secondary-btn" data-action="summary">Xem tổng kết</button></aside>';
  }

  function updateBlankCounter() {
    var badge = $('#blankProgress');
    var jumpBtn = $('#jumpBlankBtn');
    if (!badge) return;
    var blanks = all('.blank');
    if (!blanks.length) return;
    var filled = blanks.filter(function (el) { return el.value.trim() !== ''; }).length;
    var wrongCount = blanks.filter(function (el) { return el.classList.contains('bad'); }).length;
    badge.textContent = filled + '/' + blanks.length + ' ô';
    if (jumpBtn) {
      if (wrongCount > 0) {
        jumpBtn.textContent = 'Ô sai tiếp (' + wrongCount + ')';
        jumpBtn.classList.remove('hidden');
      } else if (filled < blanks.length) {
        jumpBtn.textContent = 'Ô trống tiếp';
        jumpBtn.classList.remove('hidden');
      } else {
        jumpBtn.classList.add('hidden');
      }
    }
  }

  function jumpToNextBlank() {
    var blanks = all('.blank');
    if (!blanks.length) return;
    var wrongBlanks = blanks.filter(function (el) { return el.classList.contains('bad'); });
    var targets = wrongBlanks.length ? wrongBlanks : blanks.filter(function (el) { return el.value.trim() === ''; });
    if (!targets.length) return;
    var active = document.activeElement;
    var currentIdx = blanks.indexOf(active);
    var next = targets.find(function (el) { return blanks.indexOf(el) > currentIdx; }) || targets[0];
    next.focus({ preventScroll: false });
    next.scrollIntoView({ block: 'center', behavior: (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth' });
  }

  function questionHTML(q) {
    var mTotal = mcqTotal();
    var total = deckTotal();
    var a = answer(q);
    var exam = isExamMode();
    var hideCheckButtons = exam;
    var diffChip = (q.type === 'mcq' && q.difficulty && diffLabels[q.difficulty])
      ? '<span class="diff-chip diff-' + esc(q.difficulty) + '">Mức độ: ' + esc(diffLabels[q.difficulty]) + '</span>'
      : '';
    var html = '<section class="card question-card"><div class="qtop"><div class="qchips"><span class="qchip">Chương ' + q.ch + ' · ' + chapters[q.ch] +
      '</span>' + diffChip + '</div><span class="qcount">' +
      (q.type === 'mcq' ? 'Câu ' + (state.idx + 1) + '/' + mTotal : 'Bài ' + (state.idx - mTotal + 1) + '/5') + '</span></div>' +
      '<h1 class="qtitle" id="questionTitle" tabindex="-1">' + escCode(q.title) + '</h1>';
    if (q.type === 'mcq') {
      if (q.code) {
        html += '<div class="code-box"><div class="code-box-header"><span class="code-file">' + ICONS.code + '<span>Snippet.cs</span></span><span class="code-lang">C# Console</span></div><pre class="codeblock mcq-code"><code>' + esc(q.code) + '</code></pre></div>';
      }
      html += '<fieldset class="mcq-options"><legend>Chọn một đáp án đúng</legend>' + q.options.map(function (option, i) {
        return '<label class="mcq-option" data-opt="' + i + '"><input type="radio" name="choice" value="' + i + '"' + (a.value === i ? ' checked' : '') +
          '><span class="opt-indicator">' + 'ABCD'[i] + '</span><span class="opt-body"><b>' + 'ABCD'[i] + '.</b> ' + escCode(option) + '</span>' +
          '<span class="opt-tag hidden"></span></label>';
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
      html += '<div class="essay-code-heading"><h2>Hoàn thiện chương trình</h2>' +
        (!isExamMode() ? '<button type="button" class="link-btn" data-action="new-essays">Đổi 5 bài tự luận</button>' : '') +
        '</div>' +
        '<p class="input-hint">Điền ' + q.blanks.length + ' ô trống. Phân biệt hoa/thường như C#; bỏ qua khoảng trắng giữa các token. Bản nháp tự lưu khi nhập.</p>' +
        '<div class="code-box"><div class="code-box-header"><span class="code-file">' + ICONS.code + '<span>Program.cs</span></span><div class="code-header-actions"><span id="blankProgress" class="blank-counter">0/' + q.blanks.length + ' ô</span><button type="button" id="jumpBlankBtn" class="code-jump-btn" data-action="next-blank">Ô trống tiếp</button></div></div><div class="codeblock essay-code" role="group" aria-label="Chương trình C# cần hoàn thiện">' + q.lines.map(function (line) {
          return '<div class="cl">' + line.map(function (seg) {
            if (typeof seg === 'string') return '<span>' + esc(seg) + '</span>';
            return '<input class="blank" data-b="' + seg.b + '" value="' + esc(a.value[seg.b] || '') +
              '" aria-label="Ô trống ' + (seg.b + 1) + '" placeholder="' + (seg.b + 1) + '" spellcheck="false" autocomplete="off" autocapitalize="off">';
          }).join('') + '</div>';
        }).join('') + '</div></div>';
    }
    var nextText = (state.idx === total - 1)
      ? (exam && !state.submitted ? (ICONS.check + '<span>Nộp bài thi</span>') : '<span>Tổng kết</span>' + ICONS.arrowRight)
      : (state.idx === mTotal - 1 ? '<span>Sang tự luận</span>' + ICONS.arrowRight : '<span>Câu tiếp</span>' + ICONS.arrowRight);
    return html + '<div class="actionrow">' +
      '<button type="button" id="checkBtn" class="primary-btn' + (hideCheckButtons ? ' hidden' : '') + '" data-action="check"' + (hideCheckButtons ? ' style="display:none"' : '') + '>Kiểm tra</button>' +
      '<button type="button" id="revealBtn" class="link-btn hidden" data-action="reveal"' + (hideCheckButtons ? ' style="display:none"' : '') + '>Xem đáp án</button>' +
      '<span id="feedback" class="fb-text" tabindex="-1" role="status" aria-live="polite"></span></div>' +
      '<div id="explain" class="explain hidden"></div><div class="cardfoot">' +
      '<button type="button" class="backbtn" data-action="back"' + (state.idx === 0 ? ' disabled' : '') + '>' + ICONS.arrowLeft + '<span>Quay lại</span></button>' +
      '<button type="button" class="nextbtn" data-action="next">' + nextText + '</button></div></section>';
  }

  function paintAnswer(showWrong) {
    var q = current(), a = answer(q);
    var exam = isExamMode();
    var locked = !exam ? !!a.status : !!state.submitted;
    var userVal = (a.userValue !== undefined) ? a.userValue : a.value;

    if (q.type === 'essay') {
      var checked = core.check(q, userVal);
      all('.blank').forEach(function (input) {
        var i = Number(input.dataset.b);
        input.value = (userVal && userVal[i]) ? userVal[i] : '';
        input.readOnly = locked;
        if (!locked) {
          input.classList.remove('ok', 'bad');
          input.setAttribute('aria-invalid', 'false');
          if (!exam && showWrong) {
            input.classList.toggle('ok', !!checked.fields[i]);
            input.classList.toggle('bad', !checked.fields[i]);
            input.setAttribute('aria-invalid', !checked.fields[i] ? 'true' : 'false');
          }
        } else {
          var isOk = checked.fields[i];
          input.classList.toggle('ok', isOk);
          input.classList.toggle('bad', !isOk);
          input.setAttribute('aria-invalid', isOk ? 'false' : 'true');
        }
        input.style.width = Math.min(42, Math.max(8, input.value.length + 2)) + 'ch';
      });
      updateBlankCounter();
    } else {
      all('.mcq-option').forEach(function (label, i) {
        var input = label.querySelector('input');
        input.disabled = locked;
        var tag = label.querySelector('.opt-tag');
        if (!locked) {
          input.checked = a.value === i;
          label.classList.remove('correct-choice', 'wrong-choice');
          if (!exam && showWrong) {
            label.classList.toggle('wrong-choice', i === a.value && i !== q.answer);
          }
          if (tag) tag.className = 'opt-tag hidden';
        } else {
          var isChosen = (userVal === i);
          input.checked = isChosen;
          var isCorrect = (i === q.answer);
          label.classList.toggle('correct-choice', isCorrect);
          label.classList.toggle('wrong-choice', isChosen && !isCorrect && (exam || a.status !== 'revealed'));
          if (tag) {
            if (isCorrect) {
              tag.innerHTML = ICONS.check + '<span>Đáp án đúng</span>';
              tag.className = 'opt-tag opt-tag-correct';
            } else if (isChosen && (exam || a.status !== 'revealed')) {
              tag.innerHTML = ICONS.x + '<span>Lựa chọn của bạn</span>';
              tag.className = 'opt-tag opt-tag-wrong';
            } else {
              tag.className = 'opt-tag hidden';
            }
          }
        }
      });
    }

    var checkBtn = $('#checkBtn');
    var revealBtn = $('#revealBtn');
    if (exam) {
      if (checkBtn) { checkBtn.style.display = 'none'; checkBtn.classList.add('hidden'); }
      if (revealBtn) { revealBtn.style.display = 'none'; revealBtn.classList.add('hidden'); }
    } else {
      if (checkBtn) {
        checkBtn.style.display = '';
        checkBtn.classList.remove('hidden');
        checkBtn.disabled = locked;
        checkBtn.textContent = a.status === 'ok' ? 'Đã đúng' : a.status === 'revealed' ? 'Đã xem đáp án' : 'Kiểm tra';
      }
      if (revealBtn) {
        revealBtn.style.display = '';
        revealBtn.classList.toggle('hidden', locked || a.attempts < 2);
      }
    }

    var feedback = $('#feedback');
    if (!locked) {
      feedback.className = 'fb-text';
      feedback.textContent = '';
      if (!exam && showWrong) {
        feedback.className = 'fb-text bad';
        feedback.textContent = q.type === 'mcq'
          ? 'Chưa đúng — hãy thử lại.'
          : 'Đúng ' + core.check(q, a.value).fields.filter(Boolean).length + '/' + q.blanks.length + ' ô. Ô sai có viền đỏ; hãy kiểm tra hoa/thường.';
      }
    } else if (!exam && a.status === 'revealed') {
      feedback.className = 'fb-text';
      feedback.textContent = 'Đã hiện đáp án; không tính là tự làm đúng.';
    } else {
      if (q.type === 'mcq') {
        var uChoice = (a.userValue !== undefined) ? a.userValue : a.value;
        if (uChoice === q.answer) {
          feedback.className = 'fb-text ok';
          feedback.innerHTML = ICONS.check + '<span>Chính xác! Bạn đã chọn đúng đáp án ' + 'ABCD'[q.answer] + '.</span>';
        } else if (uChoice !== null && uChoice !== undefined) {
          feedback.className = 'fb-text bad';
          feedback.innerHTML = ICONS.x + '<span>Chưa chính xác: Bạn đã chọn ' + 'ABCD'[uChoice] + '; đáp án đúng là ' + 'ABCD'[q.answer] + '.</span>';
        } else {
          feedback.className = 'fb-text bad';
          feedback.innerHTML = ICONS.x + '<span>Chưa chọn đáp án khi nộp bài; đáp án đúng là ' + 'ABCD'[q.answer] + '.</span>';
        }
      } else {
        var uVal = (a.userValue !== undefined) ? a.userValue : a.value;
        var chk = core.check(q, uVal);
        var corCount = chk.fields.filter(Boolean).length;
        if (corCount === q.blanks.length) {
          feedback.className = 'fb-text ok';
          feedback.innerHTML = ICONS.check + '<span>Chính xác! Bạn đã làm đúng toàn bộ ' + q.blanks.length + '/' + q.blanks.length + ' ô trống.</span>';
        } else {
          feedback.className = 'fb-text bad';
          feedback.innerHTML = ICONS.x + '<span>Kết quả tự luận: Đúng ' + corCount + '/' + q.blanks.length + ' ô. Các ô sai hoặc chưa điền được đánh dấu viền đỏ.</span>';
        }
      }
    }

    var explainBox = $('#explain');
    explainBox.classList.toggle('hidden', !locked);
    if (locked) {
      var expVal = (a.userValue !== undefined) ? a.userValue : a.value;
      var expChk = core.check(q, expVal);
      var essayDetail = '';
      if (q.type === 'essay') {
        essayDetail = '<div class="essay-review-panel"><h4>Đối chiếu chi tiết từng ô điền khuyết:</h4><ol class="essay-review-list">' +
          q.blanks.map(function (b, idx) {
            var val = (expVal && expVal[idx]) ? expVal[idx] : '(chưa điền)';
            var isOk = expChk.fields[idx];
            return '<li class="' + (isOk ? 'blank-ok' : 'blank-bad') + '">' +
              '<strong>Ô ' + (idx + 1) + ':</strong> Bạn điền: <code class="user-code">' + esc(val) + '</code> ' +
              (isOk ? '<span class="tag-ok">' + ICONS.check + 'Đúng</span>' : '<span class="tag-bad">' + ICONS.x + 'Chưa đúng</span> — Đáp án đúng: <code class="key-code">' + esc(b.ok[0]) + '</code>') +
              (b.explain ? ' <em>(' + esc(b.explain) + ')</em>' : '') +
              '</li>';
          }).join('') + '</ol></div>';
      }
      explainBox.innerHTML = '<b>Giải thích: </b>' + esc(q.explain) + essayDetail +
        '<p class="source-note">Nguồn dạng bài: ' + esc(q.source) + '</p>';
    }
    progress();
  }

  function finishHTML() {
    var mTotal = mcqTotal();
    var total = deckTotal();
    var s = core.summary(state.deck, state.answers);
    if (isExamMode()) {
      var dur = state.durationSeconds || core.DURATION_SECONDS || 4800;
      var rem = typeof state.remainingSeconds === 'number' ? state.remainingSeconds : dur;
      var spent = Math.max(0, dur - rem);
      var mcqAns = state.deck.slice(0, 50).filter(isAnswered).length;
      var essayAns = state.deck.slice(50).filter(isAnswered).length;
      var answeredCount = mcqAns + essayAns;

      if (!state.submitted) {
        return '<section class="card finish"><h1 id="questionTitle" tabindex="-1">Tổng kết tạm thời (Chưa nộp bài)</h1>' +
          '<p>Đã làm <b>' + answeredCount + '/55</b> câu (' + mcqAns + '/50 trắc nghiệm, ' + essayAns + '/5 tự luận). Còn lại ' + (55 - answeredCount) + ' câu chưa làm và còn <b>' + formatTime(rem) + '</b> thời gian làm bài.</p>' +
          '<div class="summary-kpi-strip">' +
          '<div class="kpi-cell kpi-lead"><div class="kpi-label">Tiến độ đã làm</div><div class="kpi-value">' + answeredCount + '/55</div><div class="kpi-sub">' + Math.round(answeredCount / 55 * 100) + '% toàn đề</div></div>' +
          '<div class="kpi-cell"><div class="kpi-label">Trắc nghiệm</div><div class="kpi-value">' + mcqAns + '/50</div><div class="kpi-sub">Đã chọn đáp án</div></div>' +
          '<div class="kpi-cell"><div class="kpi-label">Thời gian còn lại</div><div class="kpi-value">' + formatTime(rem) + '</div><div class="kpi-sub">Tự luận đã điền ' + essayAns + '/5</div></div>' +
          '</div>' +
          '<div class="chapsum"><p>Đề thi sẽ được chấm điểm toàn bộ sau khi bạn bấm <b>“Nộp bài thi ngay”</b> hoặc khi hết thời gian 80 phút. Sau khi nộp bài, bạn có thể xem lại chi tiết từng câu để biết rõ chỗ nào mình đúng, chỗ nào mình sai cùng lời giải thích chi tiết.</p></div>' +
          '<div class="fin-btns">' +
          '<button type="button" class="primary-btn" data-action="continue">Quay lại làm bài</button>' +
          '<button type="button" class="submit-exam-btn" data-action="submit-exam">' + ICONS.check + '<span>Nộp bài thi ngay</span></button>' +
          '<button type="button" class="regenbtn" data-action="new">Tạo đề thi mới</button>' +
          '</div></section>';
      }

      var title = state.submittedReason === 'timeout' ? 'Kết quả bài thi (Hết giờ 80 phút)' : 'Kết quả bài thi (Đã nộp bài)';
      var statusNote = 'Thời gian làm bài: ' + formatTime(spent) + ' / 80:00 · Bạn có thể bấm “Xem lại bài làm” hoặc chọn từng câu ở danh sách câu hỏi để xem chi tiết chỗ đúng, chỗ sai cùng giải thích.';
      var totalCorrect = s.mcq.correct + s.essay.correct;
      var mcqPct = Math.round(s.mcq.correct / 50 * 100);
      var totalPct = Math.round(totalCorrect / 55 * 100);
      return '<section class="card finish"><h1 id="questionTitle" tabindex="-1">' + esc(title) + '</h1>' +
        '<p>' + esc(statusNote) + '</p>' +
        '<div class="summary-kpi-strip">' +
        '<div class="kpi-cell kpi-lead"><div class="kpi-label">Tổng điểm đúng</div><div class="kpi-value">' + totalCorrect + '/55</div><div class="kpi-sub">Tỉ lệ đúng ' + totalPct + '%</div></div>' +
        '<div class="kpi-cell"><div class="kpi-label">Trắc nghiệm</div><div class="kpi-value">' + s.mcq.correct + '/50</div><div class="kpi-sub">' + mcqPct + '% chính xác</div></div>' +
        '<div class="kpi-cell"><div class="kpi-label">Tự luận điền khuyết</div><div class="kpi-value">' + s.essay.correct + '/5</div><div class="kpi-sub">Thời gian ' + formatTime(spent) + '</div></div>' +
        '</div>' +
        '<div class="chapsum"><h2>Trắc nghiệm phân hóa (50 câu)</h2>' +
        '<p>Tổng trắc nghiệm đúng: <b>' + s.mcq.correct + '/50</b> (' + mcqPct + '%)</p>' +
        '<div class="summary-bar-track" aria-hidden="true"><div class="summary-bar-fill" style="width:' + mcqPct + '%"></div></div>' +
        '<ul class="diff-breakdown">' +
        '<li><span class="diff-chip diff-easy">Mức Dễ (10 câu)</span><span class="diff-score"><b>' + s.byDifficulty.easy.correct + '/10</b> câu đúng</span></li>' +
        '<li><span class="diff-chip diff-medium">Mức Trung bình (15 câu)</span><span class="diff-score"><b>' + s.byDifficulty.medium.correct + '/15</b> câu đúng</span></li>' +
        '<li><span class="diff-chip diff-hard">Mức Khó (25 câu)</span><span class="diff-score"><b>' + s.byDifficulty.hard.correct + '/25</b> câu đúng</span></li>' +
        '</ul>' +
        '<h2>Tự luận điền khuyết (5 bài trong kho 300 câu)</h2>' +
        '<p>Tự làm đúng toàn bài: <b>' + s.essay.correct + '/5</b></p>' +
        '<div class="summary-bar-track" aria-hidden="true"><div class="summary-bar-fill fill-green" style="width:' + Math.round(s.essay.correct / 5 * 100) + '%"></div></div>' +
        '<p>Tổng đúng: <b>' + totalCorrect + '/55</b> câu (' + totalPct + '%)</p></div>' +
        '<div class="fin-btns"><button type="button" class="primary-btn" data-action="continue">Xem lại bài làm (chi tiết từng câu)</button>' +
        '<button type="button" class="regenbtn" data-action="new">Tạo đề thi mới</button></div></section>';
    }
    var pracMcqPct = Math.round(s.mcq.correct / mTotal * 100);
    var pracEssayPct = Math.round(s.essay.correct / 5 * 100);
    return '<section class="card finish"><h1 id="questionTitle" tabindex="-1">' + (s.completed === total ? 'Tổng kết đề luyện tập' : 'Tổng kết hiện tại') + '</h1>' +
      '<p>' + (total - s.completed ? 'Còn ' + (total - s.completed) + ' câu/bài chưa hoàn thành. Bạn có thể quay lại làm tiếp.' : 'Bạn đã xử lý đủ ' + mTotal + ' câu trắc nghiệm và 5 bài tự luận.') + '</p>' +
      '<div class="summary-kpi-strip">' +
      '<div class="kpi-cell kpi-lead"><div class="kpi-label">Đã hoàn thành</div><div class="kpi-value">' + s.completed + '/' + total + '</div><div class="kpi-sub">' + Math.round(s.completed / total * 100) + '% toàn đề</div></div>' +
      '<div class="kpi-cell"><div class="kpi-label">Trắc nghiệm đúng</div><div class="kpi-value">' + s.mcq.correct + '/' + mTotal + '</div><div class="kpi-sub">Xem đáp án: ' + s.mcq.revealed + '</div></div>' +
      '<div class="kpi-cell"><div class="kpi-label">Tự luận đúng</div><div class="kpi-value">' + s.essay.correct + '/5</div><div class="kpi-sub">Xem đáp án: ' + s.essay.revealed + '</div></div>' +
      '</div>' +
      '<div class="chapsum"><h2>Trắc nghiệm</h2><p>Tự làm đúng <b>' + s.mcq.correct + '/' + mTotal + '</b> (' + pracMcqPct + '%) · Xem đáp án: ' + s.mcq.revealed + '</p>' +
      '<div class="summary-bar-track" aria-hidden="true"><div class="summary-bar-fill" style="width:' + pracMcqPct + '%"></div></div>' +
      '<h2>Tự luận điền khuyết</h2><p>Tự làm đúng toàn bài <b>' + s.essay.correct + '/5</b> (' + pracEssayPct + '%) · Xem đáp án: ' + s.essay.revealed + '</p>' +
      '<div class="summary-bar-track" aria-hidden="true"><div class="summary-bar-fill fill-green" style="width:' + pracEssayPct + '%"></div></div>' +
      '<p>Đáp án đã xem không được tính vào số câu tự làm đúng.</p></div>' +
      '<div class="fin-btns"><button type="button" class="primary-btn" data-action="continue">Quay lại bài làm</button>' +
      '<button type="button" class="regenbtn" data-action="new">Tạo đề mới</button></div></section>';
  }

  function render(focus) {
    app.innerHTML = '<div class="exam-layout">' + navigation() + '<div class="exam-content">' + (state.finished ? finishHTML() : questionHTML(current())) + '</div></div>';
    if (!state.finished) paintAnswer(false); else progress();
    if (focus) $('#questionTitle').focus({ preventScroll: false });
  }

  function go(index) { state.idx = index; state.finished = false; save(); render(true); }
  function summary() { state.finished = true; save(); render(true); }
  function check() {
    if (isExamMode() && !state.submitted) return;
    var q = current(), a = answer(q);
    if (a.status) return;
    if (q.type === 'mcq' && a.value === null) { $('#feedback').textContent = 'Hãy chọn một đáp án trước.'; return; }
    a.attempts++;
    if (core.check(q, a.value).correct) a.status = 'ok';
    save(); paintAnswer(true);
    if (a.status) $('#feedback').focus({ preventScroll: true });
  }
  function reveal() {
    if (isExamMode() && !state.submitted) return;
    var q = current(), a = answer(q);
    if (a.status || a.attempts < 2) return;
    a.value = q.type === 'mcq' ? q.answer : q.blanks.map(function (b) { return b.ok[0]; });
    a.status = 'revealed'; save(); paintAnswer(false); $('#feedback').focus({ preventScroll: true });
  }

  function initTheme() {
    var THEME_KEY = 'oopQuiz.theme';
    var toggleBtn = $('#themeToggleBtn');
    if (!toggleBtn) return;
    var iconEl = toggleBtn.querySelector('.theme-icon');
    var metaEl = $('#themeColorMeta');

    function currentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function syncUI(theme) {
      var isDark = theme === 'dark';
      if (iconEl) {
        iconEl.innerHTML = isDark ? ICONS.sun : ICONS.moon;
      }
      if (metaEl) {
        metaEl.setAttribute('content', isDark ? '#0c1018' : '#f6f7f9');
      }
      var label = isDark ? 'Chuyển sang giao diện sáng (Alt + T)' : 'Chuyển sang giao diện tối (Alt + T)';
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }

    function setTheme(theme, saveUserChoice) {
      var rootEl = document.documentElement;
      rootEl.setAttribute('data-theme-switching', 'true');
      rootEl.setAttribute('data-theme', theme);
      void rootEl.offsetHeight;
      rootEl.removeAttribute('data-theme-switching');
      if (saveUserChoice) {
        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch (e) {}
      }
      syncUI(theme);
    }

    syncUI(currentTheme());

    toggleBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });

    if (window.matchMedia) {
      try {
        var mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', function (e) {
          try {
            if (!localStorage.getItem(THEME_KEY)) {
              setTheme(e.matches ? 'dark' : 'light', false);
            }
          } catch (err) {}
        });
      } catch (e) {}
    }

    return {
      toggle: function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next, true);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    app = $('#app');
    var themeCtrl = initTheme();
    try {
      var raw = localStorage.getItem(KEY);
      state = core.restore(raw);
      if (raw && !state) notice('Bài lưu không hợp lệ hoặc thuộc phiên bản cũ. Đã tạo đề mới; tiến độ của bản web cũ vẫn được giữ riêng.');
    } catch (e) { notice('Trình duyệt không cho đọc bài lưu. Hãy giữ trang mở để tránh mất bài.'); }
    if (state) {
      startTimerIfNeeded();
      render();
    } else {
      newExam(false, 'practice');
    }
    if (oldEssayForm()) notice('Bài tự luận đang lưu thuộc mẫu cũ. Bấm “Đổi 5 bài tự luận” để nhận đúng form ảnh; phần trắc nghiệm được giữ nguyên. Bài cũ chưa bị xóa.');

    var practiceBtn = $('#practiceModeBtn');
    var examBtn = $('#examModeBtn');
    var submitExamBtn = $('#submitExamBtn');
    var closeNoticeBtn = $('#closeNoticeBtn');
    var jumpNavBtn = $('#jumpNavBtn');

    if (practiceBtn) practiceBtn.addEventListener('click', function () { switchMode('practice'); });
    if (examBtn) examBtn.addEventListener('click', function () { switchMode('exam'); });
    if (submitExamBtn) submitExamBtn.addEventListener('click', function () { submitExam('manual'); });
    if (closeNoticeBtn) closeNoticeBtn.addEventListener('click', hideNotice);
    if (jumpNavBtn) {
      jumpNavBtn.addEventListener('click', function () {
        var nav = $('.exam-nav');
        if (!nav) return;
        var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        nav.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    }

    $('#newExamBtn').addEventListener('click', function () { newExam(true, isExamMode() ? 'exam' : 'practice'); });
    $('#newEssaysBtn').addEventListener('click', newEssays);
    $('#clearBtn').addEventListener('click', function () {
      if (!state || !confirm('Xóa toàn bộ câu trả lời của đề hiện tại? Nội dung đề vẫn giữ nguyên.')) return;
      state.answers = {};
      state.idx = 0;
      state.finished = false;
      if (isExamMode()) {
        var dur = state.durationSeconds || core.DURATION_SECONDS || 4800;
        state.remainingSeconds = dur;
        state.deadline = Date.now() + dur * 1000;
        state.submitted = false;
        state.submittedReason = null;
        startTimerIfNeeded();
      }
      save(); render(true);
    });
    $('#mcqTab').addEventListener('click', function () { if (state) go(0); });
    $('#essayTab').addEventListener('click', function () { if (state) go(mcqTotal()); });
    $('#summaryBtn').addEventListener('click', function () { if (state) summary(); });
    app.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button || !state) return;
      if (button.dataset.go !== undefined) { go(Number(button.dataset.go)); return; }
      switch (button.dataset.action) {
        case 'check': check(); break;
        case 'reveal': reveal(); break;
        case 'next-blank': jumpToNextBlank(); break;
        case 'back': if (state.idx > 0) go(state.idx - 1); break;
        case 'next':
          if (state.idx < deckTotal() - 1) {
            go(state.idx + 1);
          } else {
            if (isExamMode() && !state.submitted) submitExam('manual');
            else summary();
          }
          break;
        case 'summary': summary(); break;
        case 'continue': state.finished = false; save(); render(true); break;
        case 'new': newExam(true, isExamMode() ? 'exam' : 'practice'); break;
        case 'new-essays': newEssays(); break;
        case 'submit-exam': submitExam('manual'); break;
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
        updateBlankCounter();
      } else return;
      save(); progress();
    });
    app.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.matches('.blank') && !state.finished) {
        event.preventDefault();
        if (!isExamMode() && !answer(current()).status) check();
      }
    });

    window.addEventListener('keydown', function (event) {
      if (event.altKey && !event.ctrlKey && !event.metaKey && (event.key === 't' || event.key === 'T')) {
        event.preventDefault();
        if (themeCtrl) themeCtrl.toggle();
        return;
      }
      if (!state || state.finished || event.ctrlKey || event.altKey || event.metaKey) return;
      var target = event.target;
      var el = (target && target.nodeType === 1) ? target : null;
      if (el && el.matches('input[type="text"], input:not([type]), textarea, select, [contenteditable]')) return;

      var q = current();
      if (q && q.type === 'mcq') {
        var exam = isExamMode();
        var a = answer(q);
        var locked = !exam ? !!a.status : !!state.submitted;
        var keyLower = String(event.key || '').toLowerCase();
        var optIdx = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 }[keyLower];
        if (optIdx !== undefined && !locked && optIdx < q.options.length) {
          event.preventDefault();
          a.value = optIdx;
          save();
          paintAnswer(false);
          return;
        }
      }
      if (event.key === 'ArrowLeft' && state.idx > 0) {
        event.preventDefault();
        go(state.idx - 1);
      } else if (event.key === 'ArrowRight' && state.idx < deckTotal() - 1) {
        event.preventDefault();
        go(state.idx + 1);
      } else if (event.key === 'Enter' && (!el || !el.closest('button, a, label, summary, [role="button"], input'))) {
        if (!isExamMode() && !answer(current()).status) {
          event.preventDefault();
          check();
        }
      }
    });
  });
})();
