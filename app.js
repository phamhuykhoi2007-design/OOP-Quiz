/* ============================================================
   Ôn tập OOP — logic quiz điền từ
   ============================================================ */
(function () {
  "use strict";

  var QUESTIONS = window.QUESTIONS;
  var TEMPLATES = window.TEMPLATES || [];
  var LS_SOLVED = "oopQuiz.solved.v2";
  var LS_CH = "oopQuiz.ch.v2";
  var LS_MODE = "oopQuiz.mode.v1";
  var LS_GEN = "oopQuiz.gen.v1";
  var GEN_SIZE = 10;

  var state = {
    solved: {},        // { qid: "ok" | "revealed" }
    ch: 0,             // 0 = tất cả (chế đề có sẵn)
    mode: "static",    // "static" | "gen"
    deck: [],
    idx: 0,
    attempts: 0,
    solvedNow: false,
    revealedNow: false
  };
  var genRound = 0;

  var app = null;

  /* ---------------- tiện ích ---------------- */
  function $(sel, root) { return (root || app).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || app).querySelectorAll(sel)); }
  function $docAll(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function norm(s) {
    return String(s).toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(LS_SOLVED);
      if (raw) state.solved = JSON.parse(raw) || {};
      var c = parseInt(localStorage.getItem(LS_CH), 10);
      state.ch = isNaN(c) ? 0 : c;
      state.mode = localStorage.getItem(LS_MODE) === "gen" ? "gen" : "static";
    } catch (e) { state.solved = {}; state.ch = 0; state.mode = "static"; }
  }

  function saveProgress() {
    try {
      localStorage.setItem(LS_SOLVED, JSON.stringify(state.solved));
      localStorage.setItem(LS_CH, String(state.ch));
    } catch (e) { /* không lưu được thì bỏ qua */ }
  }

  function persistMode() {
    try { localStorage.setItem(LS_MODE, state.mode); } catch (e) {}
  }

  function persistGen() {
    try { localStorage.setItem(LS_GEN, JSON.stringify({ deck: state.deck, idx: state.idx })); } catch (e) {}
  }

  function restoreGen() {
    try {
      var raw = localStorage.getItem(LS_GEN);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.deck) || !obj.deck.length) return false;
      var okAll = obj.deck.every(function (q) {
        return q && typeof q.id === "string" && Array.isArray(q.lines) && Array.isArray(q.blanks) && typeof q.title === "string";
      });
      if (!okAll) return false;
      state.deck = obj.deck;
      state.mode = "gen";
      state.idx = (!isNaN(obj.idx) && obj.idx >= 0 && obj.idx < obj.deck.length) ? obj.idx : 0;
      return true;
    } catch (e) { return false; }
  }

  /* Quên kết quả của các đề gen cũ (id bắt đầu bằng "g") */
  function purgeGenSolved() {
    Object.keys(state.solved).forEach(function (k) {
      if (k.charAt(0) === "g") delete state.solved[k];
    });
  }

  /* Sinh một đề mới: 10 câu từ các template KHÁC NHAU */
  function buildGenDeck() {
    state.mode = "gen";
    purgeGenSolved();
    var pool = TEMPLATES.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    genRound++;
    var deck = [];
    for (var i2 = 0; i2 < pool.length && deck.length < GEN_SIZE; i2++) {
      var q = null;
      try { q = pool[i2].make(Math.random); } catch (err) { continue; }
      if (!q) continue;
      q.id = "g" + pool[i2].id.split("-").join("") + "-r" + genRound + "-" + deck.length;
      deck.push(q);
    }
    if (!deck.length) { setChapter(state.ch, false); return; }
    state.deck = deck;
    state.idx = 0;
    $docAll(".pill").forEach(function (p) { p.classList.remove("active"); });
    persistGen();
    persistMode();
    updateModeButtons();
    updateProgressText();
    renderQuestion();
  }

  function isSolved(q) { return !!state.solved[q.id]; }

  function solutionWidth(b) {
    return Math.min(30, Math.max(7, (b.w || 4) + 3));
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- đặt bộ đề ---------------- */
  function setChapter(ch, keepIdx) {
    state.mode = "static";
    persistMode();
    updateModeButtons();
    state.ch = ch;
    state.deck = QUESTIONS.filter(function (q) { return ch === 0 || q.ch === ch; });
    if (!keepIdx) {
      var first = state.deck.findIndex(function (q) { return !isSolved(q); });
      state.idx = first === -1 ? 0 : first;
    }
    $docAll(".pill").forEach(function (p) {
      p.classList.toggle("active", parseInt(p.dataset.ch, 10) === ch);
    });
    saveProgress();
    updateProgressText();
    var unsolved = state.deck.some(function (q) { return !isSolved(q); });
    if (!unsolved) renderFinish();
    else renderQuestion();
  }

  function updateProgressText() {
    var n = state.deck.length;
    var ok = state.deck.filter(function (q) { return state.solved[q.id] === "ok"; }).length;
    var rev = state.deck.filter(function (q) { return state.solved[q.id] === "revealed"; }).length;
    var el = document.getElementById("progressText");
    if (n === 0) { el.innerHTML = "Không có câu hỏi nào"; return; }
    el.innerHTML = "Đã đúng <b>" + ok + "/" + n + "</b> câu" + (rev ? " (xem đáp án: " + rev + ")" : "");
  }

  /* ---------------- hiển thị câu hỏi ---------------- */
  function renderQuestion() {
    var q = state.deck[state.idx];
    state.attempts = 0;
    state.solvedNow = isSolved(q);
    state.revealedNow = (state.solved[q.id] === "revealed");

    var html = [];
    html.push('<section class="card" id="qcard">');
    html.push('<div class="qtop">');
    html.push('<span class="qchip">Chương ' + q.ch + " · " + CHAPTER_NAMES[q.ch] + "</span>");
    html.push('<span class="qcount">Câu ' + (state.idx + 1) + "/" + state.deck.length + (state.mode === "gen" ? " · đề tự sinh" : "") + "</span>");
    html.push("</div>");
    html.push('<h1 class="qtitle">' + esc(q.title) + "</h1>");
    html.push('<div class="codeblock">');

    q.lines.forEach(function (line) {
      html.push('<div class="cl">');
      line.forEach(function (seg) {
        if (typeof seg === "string") {
          html.push("<span>" + esc(seg) + "</span>");
        } else {
          var b = q.blanks[seg.b];
          html.push('<input class="blank" data-b="' + seg.b + '" style="width:' + solutionWidth(b) +
            'ch" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Ô điền thứ ' + (seg.b + 1) + '">');
        }
      });
      html.push("</div>");
    });

    html.push("</div>");
    html.push('<div class="actionrow">');
    html.push('<button id="checkBtn" class="primary-btn" type="button">Check</button>');
    html.push('<span id="fb" class="fb-text"></span>');
    html.push('<button id="revealBtn" class="link-btn hidden" type="button">Xem đáp án</button>');
    html.push("</div>");
    html.push('<div id="explain" class="explain hidden"><b>Giải thích: </b>' + esc(q.explain) + "</div>");
    html.push('<div class="cardfoot">');
    if (state.mode === "gen") {
      html.push('<button id="regenBtn" class="regenbtn" type="button">Tạo đề khác 🎲</button>');
    }
    html.push('<button id="backBtn" class="backbtn" type="button"' + (state.idx <= 0 ? " disabled" : "") +
      '>Quay lại <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15.5 4.5 L8.5 12 L15.5 19.5" stroke="#344054" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>");
    html.push('<div class="dots" id="dots"></div>');
    html.push('<button id="nextBtn" class="nextbtn" type="button">Next' +
      ' <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M8.5 4.5 L15.5 12 L8.5 19.5" stroke="#344054" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>");
    html.push("</div>");
    html.push("</section>");

    app.innerHTML = html.join("");
    buildDots();

    var checkBtn = $("#checkBtn");
    var nextBtn = $("#nextBtn");
    var backBtn = $("#backBtn");
    if (backBtn) backBtn.addEventListener("click", goBack);
    var regenBtn = $("#regenBtn");
    if (regenBtn) regenBtn.addEventListener("click", function () { buildGenDeck(); });

    if (state.solvedNow) {
      applySolvedState(q);
    } else {
      $all(".blank").forEach(function (inp) {
        inp.addEventListener("input", function () {
          inp.classList.remove("bad", "ok");
          var b = q.blanks[+inp.dataset.b];
          var vw = Math.min(30, Math.max(solutionWidth(b), inp.value.length + 3));
          inp.style.width = vw + "ch";
        });
      });
      var first = $(".blank");
      if (first) { first.focus(); }
    }

    checkBtn.addEventListener("click", runCheck);
    nextBtn.addEventListener("click", goNext);
    var rb = $("#revealBtn");
    if (rb) rb.addEventListener("click", revealListener);
    bindDots();
    updateProgressText();
  }

  var CHAPTER_NAMES = { 1: "Tổng quan về OOP", 2: "Lớp và đối tượng", 3: "Đóng gói", 4: "Kế thừa" };

  function buildDots() {
    var wrap = $("#dots");
    wrap.innerHTML = "";
    state.deck.forEach(function (qq, i) {
      var d = document.createElement("span");
      d.className = "dot";
      var st = state.solved[qq.id];
      if (st === "ok") d.classList.add("oks");
      else if (st === "revealed") d.classList.add("rev");
      if (i === state.idx) d.classList.add("cur");
      d.title = "Câu " + (i + 1) + " · Chương " + qq.ch + (st ? (st === "ok" ? " · đã đúng" : " · đã xem đáp án") : "");
      d.setAttribute("data-i", i);
      wrap.appendChild(d);
    });
  }

  function bindDots() {
    $all("#dots .dot").forEach(function (d) {
      d.addEventListener("click", function () {
        var i = parseInt(d.getAttribute("data-i"), 10);
        if (!isNaN(i)) {
          state.idx = i;
          if (state.mode === "gen") persistGen();
          renderQuestion();
        }
      });
    });
  }

  /* ---------------- kiểm tra / trả lời ---------------- */
  function currentQuestion() { return state.deck[state.idx]; }

  function runCheck() {
    var q = currentQuestion();
    if (!q || state.solvedNow) return;
    var inputs = $all(".blank");
    var allOk = true;

    inputs.forEach(function (inp) {
      var b = q.blanks[+inp.dataset.b];
      var v = inp.value;
      var ok = v.trim() !== "" && b.ok.some(function (a) { return norm(a) === norm(v); });
      inp.classList.toggle("ok", ok);
      inp.classList.toggle("bad", !ok);
      if (!ok) allOk = false;
    });

    state.attempts++;
    var fb = $("#fb");

    if (allOk) {
      fb.className = "fb-text ok";
      fb.textContent = "Chính xác! ✓";
      markSolved(q, false);
    } else {
      fb.className = "fb-text bad";
      fb.textContent = "Chưa đúng — hãy thử lại!";
      var cb = $("#codeblock", app) || $(".codeblock");
      cb.classList.add("shake");
      setTimeout(function () { cb.classList.remove("shake"); }, 340);
      if (state.attempts >= 2) {
        var rb = $("#revealBtn");
        if (rb) rb.classList.remove("hidden");
      }
    }
  }

  function markSolved(q, revealed) {
    state.solvedNow = true;
    state.revealedNow = revealed;
    state.solved[q.id] = revealed ? "revealed" : "ok";
    saveProgress();

    var inputs = $all(".blank");
    if (revealed) {
      inputs.forEach(function (inp) {
        var b = q.blanks[+inp.dataset.b];
        inp.value = b.ok[0];
        inp.classList.remove("bad");
        inp.classList.add("ok");
        var bw = Math.min(30, Math.max(solutionWidth(b), b.ok[0].length + 3));
        inp.style.width = bw + "ch";
      });
    }
    inputs.forEach(function (inp) { inp.readOnly = true; });

    var cb = $("#checkBtn");
    cb.disabled = true;
    cb.classList.add("done");
    cb.textContent = revealed ? "Đã xem đáp án" : "Đã đúng ✓";

    var fb = $("#fb");
    if (revealed) {
      fb.className = "fb-text hint";
      fb.textContent = "Đã hiển thị đáp án — hãy đọc lại phần giải thích để nhớ nhé!";
      state.solved[q.id] = "revealed";
      saveProgress();
    }

    $("#explain").classList.remove("hidden");
    var rb = $("#revealBtn");
    if (rb) rb.classList.add("hidden");

    $("#nextBtn").classList.add("ready");
    buildDots();
    updateProgressText();
  }

  var revealListener = function () {
    var q = currentQuestion();
    if (q && !state.solvedNow) {
      markSolved(q, true);
    }
  };

  /* ---------------- chuyển câu ---------------- */
  function goBack() {
    if (state.idx <= 0) return;
    state.idx--;
    if (state.mode === "gen") persistGen();
    renderQuestion();
  }

  function goNext() {
    if (state.idx < state.deck.length - 1) {
      state.idx++;
      if (state.mode === "gen") persistGen();
      renderQuestion();
    } else {
      renderFinish();
    }
  }

  function applySolvedState(q) {
    var revealed = state.revealedNow;
    var inputs = $all(".blank");
    inputs.forEach(function (inp) {
      var b = q.blanks[+inp.dataset.b];
      if (revealed || norm(inp.value) === "") {
        inp.value = b.ok[0];
        var bw = Math.min(30, Math.max(solutionWidth(b), b.ok[0].length + 3));
        inp.style.width = bw + "ch";
      }
      inp.readOnly = true;
      inp.classList.add("ok");
      inp.classList.remove("bad");
    });

    var cb = $("#checkBtn");
    cb.disabled = true;
    cb.classList.add("done");
    cb.textContent = revealed ? "Đã xem đáp án" : "Đã đúng ✓";

    var fb = $("#fb");
    fb.className = revealed ? "fb-text hint" : "fb-text ok";
    fb.textContent = revealed ? "Đã hiển thị đáp án — hãy đọc lại phần giải thích để nhớ nhé!" : "Chính xác! ✓";

    $("#explain").classList.remove("hidden");
    $("#nextBtn").classList.add("ready");
  }

  /* ---------------- màn hình tổng kết ---------------- */
  function renderFinish() {
    var n = state.deck.length;
    var ok = state.deck.filter(function (q) { return state.solved[q.id] === "ok"; }).length;
    var rev = state.deck.filter(function (q) { return state.solved[q.id] === "revealed"; }).length;
    var pct = n ? Math.round(((ok + rev) / n) * 100) : 0;

    var chaps = [];
    for (var c = 1; c <= 4; c++) {
      var set = state.deck.filter(function (q) { return q.ch === c; });
      if (!set.length) continue;
      var o = set.filter(function (q) { return state.solved[q.id] === "ok"; }).length;
      var r = set.filter(function (q) { return state.solved[q.id] === "revealed"; }).length;
      chaps.push({ ch: c, ok: o, rev: r, total: set.length });
    }

    var html = [];
    html.push('<section class="card finish">');
    html.push('<div class="fin-emoji">🎉</div>');
    html.push("<h1>Đã hoàn thành bộ ôn tập!</h1>");
    html.push('<p class="fin-score">Bạn trả lời đúng <b>' + ok + "/" + n + "</b> câu (" + pct + "%)" +
      (rev ? " · trong đó " + rev + " câu xem đáp án" : "") + "</p>");
    html.push('<div class="chapsum">');
    chaps.forEach(function (c) {
      var p = c.total ? Math.round(((c.ok + c.rev) / c.total) * 100) : 0;
      html.push('<div class="sumrow">');
      html.push('<span class="sumlabel">Chương ' + c.ch + " · " + CHAPTER_NAMES[c.ch] + "</span>");
      html.push('<span class="sumbar"><i style="width:' + p + '%"></i></span>');
      html.push('<span class="sumnum">' + (c.ok + c.rev) + "/" + c.total + " câu</span>");
      html.push("</div>");
    });
    html.push("</div>");
    html.push('<div class="fin-btns">');
    html.push('<button id="againBtn" class="primary-btn" type="button">' +
      (state.mode === "gen" ? "Tạo đề khác 🎲" : "Làm lại bộ này") + "</button>");
    html.push('<button id="clearAllBtn" class="secondary-btn" type="button">Xóa hết tiến độ</button>');
    html.push("</div>");
    html.push("</section>");

    app.innerHTML = html.join("");
    $("#againBtn").addEventListener("click", function () {
      if (state.mode === "gen") { buildGenDeck(); return; }
      state.deck.forEach(function (q) { delete state.solved[q.id]; });
      saveProgress();
      state.idx = 0;
      setChapter(state.ch, true);
    });
    $("#clearAllBtn").addEventListener("click", clearAll);
    updateProgressText();
  }

  /* ---------------- xóa tiến độ ---------------- */
  function clearAll() {
    if (!confirm("Xóa toàn bộ tiến độ ôn tập đã lưu?")) return;
    state.solved = {};
    saveProgress();
    if (state.mode === "gen") {
      state.idx = 0;
      persistGen();
      updateProgressText();
      renderQuestion();
    } else {
      setChapter(state.ch, false);
    }
  }

  /* ---------------- phím tắt ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var t = e.target;
    if (t && (t.tagName === "BUTTON")) return; // để nút tự xử lý
    var q = state.deck[state.idx];
    if (!q) return;
    e.preventDefault();
    if (state.solvedNow) goNext();
    else runCheck();
  });

  /* ---------------- khởi động ---------------- */
  function updateModeButtons() {
    $docAll(".modebtn").forEach(function (m) {
      m.classList.toggle("active", m.dataset.mode === state.mode);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    app = document.getElementById("app");
    loadProgress();

    $docAll(".pill").forEach(function (p) {
      p.addEventListener("click", function () {
        setChapter(parseInt(p.dataset.ch, 10), false);
      });
    });

    $docAll(".modebtn").forEach(function (m) {
      m.addEventListener("click", function () {
        if (m.dataset.mode === "gen") buildGenDeck();
        else setChapter(state.ch, false);
      });
    });

    document.getElementById("clearBtn").addEventListener("click", clearAll);

    if (state.mode === "gen" && restoreGen()) {
      $docAll(".pill").forEach(function (p) { p.classList.remove("active"); });
      updateModeButtons();
      updateProgressText();
      var unsolved = state.deck.some(function (q) { return !isSolved(q); });
      if (!unsolved) renderFinish();
      else renderQuestion();
    } else {
      state.mode = "static";
      setChapter(state.ch, false);
    }
  });

})();
