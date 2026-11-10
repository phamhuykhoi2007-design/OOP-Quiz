// Optional runtime check: requires Playwright (test-only), no dependency in the web app.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const real = process.argv.includes('--real');
const root = path.resolve(__dirname, '..');
const fixtureMCQ = `window.ExamMCQ={generate:()=>Array.from({length:40},(_,i)=>({type:'mcq',id:'m'+i,ch:i%5+1,title:'Câu '+(i+1)+' <kiểm tra>',code:'class A {}',options:['class','Class','struct','interface'],answer:i%4,explain:'Giải thích <đúng>',source:'slide'}))};`;
const fixtureEssay = `window.ExamEssay={generate:()=>Array.from({length:5},(_,i)=>({type:'essay',id:'e'+i,ch:3,title:'Bài '+(i+1),requirements:['Viết lớp có tên <A>'],lines:[[{b:1},' A { string ',{b:0},'; }']],blanks:[{ok:['Ten'],explain:'Tên trường'},{ok:['class'],explain:'Từ khóa lớp'}],explain:'Đóng gói',source:'ảnh'}))};`;
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(target, (err, body) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' }[path.extname(target)] || 'text/plain');
    res.end(body);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    if (!real) {
      await page.route('**/mcq-generators.js', route => route.fulfill({ contentType: 'text/javascript', body: fixtureMCQ }));
      await page.route('**/essay-generators.js', route => route.fulfill({ contentType: 'text/javascript', body: fixtureEssay }));
    }
    await page.goto(base); await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('[data-go]').count(), 45);
    assert.equal(await page.locator('input[name=choice]').count(), 4);
    const firstDeck = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')).deck);
    const first = firstDeck[0];
    await page.locator('#checkBtn').click();
    assert.match(await page.locator('#feedback').innerText(), /chọn/);
    await page.locator('input[name=choice]').nth(first.answer).check();
    await page.locator('#checkBtn').click();
    assert.match(await page.locator('#progressText').innerText(), /đúng 1\/40/);
    assert.equal(await page.locator('#checkBtn').isDisabled(), true);
    await page.locator('[data-go="1"]').click();
    await page.locator('input[name=choice]').nth((firstDeck[1].answer + 1) % 4).check();
    await page.locator('#checkBtn').click(); await page.locator('#checkBtn').click();
    await page.locator('input[name=choice]').nth(firstDeck[1].answer).check();
    assert.equal(await page.locator('.wrong-choice').count(), 0, 'Changing choice clears stale feedback');
    await page.locator('#revealBtn').click();
    assert.match(await page.locator('#feedback').innerText(), /không tính/);
    await page.locator('#essayTab').click();
    const essay = firstDeck[40];
    assert.equal(await page.locator('.blank').count(), essay.blanks.length);
    await page.locator('.blank').first().fill('draft-do-not-lose');
    await page.reload(); await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('.blank').first().inputValue(), 'draft-do-not-lose');
    const markupDraft = '\"><img src=x onerror="window.quizInjected=1">';
    await page.locator('.blank').first().fill(markupDraft);
    await page.reload(); await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('.blank').first().inputValue(), markupDraft);
    assert.equal(await page.evaluate(() => window.quizInjected), undefined, 'Stored draft is escaped, not executed');
    assert.equal(await page.locator('img').count(), 0);
    for (let i = 0; i < essay.blanks.length; i++) await page.locator('[data-b="' + i + '"]').fill('');
    await page.locator('[data-b="0"]').fill(essay.blanks[0].ok[0]);
    await page.locator('#checkBtn').click();
    assert.match(await page.locator('#feedback').innerText(), new RegExp('Đúng 1/' + essay.blanks.length));
    assert.equal(await page.locator('.blank[aria-invalid="true"]').count(), essay.blanks.length - 1);
    for (let i = 0; i < essay.blanks.length; i++) await page.locator('[data-b="' + i + '"]').fill(essay.blanks[i].ok[0]);
    await page.locator('[data-b="0"]').press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'feedback', 'Keyboard submission keeps focus at result after locking');
    assert.match(await page.locator('#progressText').innerText(), /Tự luận đúng 1\/5/);
    assert.equal(await page.locator('.blank:not([readonly])').count(), 0);
    await page.locator('[data-go="41"]').click();
    await page.locator('.blank').first().fill('keep on navigation');
    await page.locator('#mcqTab').click();
    await page.locator('[data-go="41"]').click();
    assert.equal(await page.locator('.blank').first().inputValue(), 'keep on navigation');
    for (let i = 40; i < 45; i++) {
      await page.locator('[data-go="' + i + '"]').click();
      assert.equal(await page.locator('.blank').count(), firstDeck[i].blanks.length);
      assert.equal(await page.locator('.requirements li').count(), firstDeck[i].sections ? firstDeck[i].sections.reduce((n, section) => n + section.items.length, 0) : firstDeck[i].requirements.length);
      if (real) {
        assert.equal(await page.locator('.assignment-section').count(), firstDeck[i].sections.length);
        assert.equal(await page.locator('.assignment-intro').innerText(), firstDeck[i].introduction);
      }
      if (real) assert.ok(firstDeck[i].blanks.length >= 45);
    }
    await page.locator('[data-go="41"]').click();
    await page.locator('#summaryBtn').click();
    assert.match(await page.locator('h1').innerText(), /hiện tại/);
    assert.match(await page.locator('.finish').innerText(), /Xem đáp án: 1/);
    await page.reload(); await page.waitForLoadState('networkidle');
    assert.match(await page.locator('h1').innerText(), /hiện tại/);
    await page.locator('[data-action=continue]').click();
    await page.evaluate(() => localStorage.setItem('oopQuiz.solved.v2', 'legacy-progress'));
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#newExamBtn').click();
    assert.equal(await page.locator('.blank').first().inputValue(), 'keep on navigation');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#newExamBtn').click();
    assert.match(await page.locator('#progressText').innerText(), /đúng 0\/40/);
    assert.equal(await page.evaluate(() => localStorage.getItem('oopQuiz.solved.v2')), 'legacy-progress');
    if (real) {
      const nextDeck = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')).deck);
      assert.notEqual(JSON.stringify(nextDeck), JSON.stringify(firstDeck));
    }
    const beforeEssayRefresh = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')));
    await page.locator('input[name=choice]').nth(beforeEssayRefresh.deck[0].answer).check();
    await page.locator('#checkBtn').click();
    await page.locator('#essayTab').click();
    await page.locator('.blank').first().fill('essay-only-draft');
    const savedBeforeEssayRefresh = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')));
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#newEssaysBtn').click();
    assert.equal(await page.locator('.blank').first().inputValue(), 'essay-only-draft');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#newEssaysBtn').click();
    const refreshedEssays = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')));
    assert.deepEqual(refreshedEssays.deck.slice(0, 40), savedBeforeEssayRefresh.deck.slice(0, 40));
    const keptId = savedBeforeEssayRefresh.deck[0].id;
    assert.deepEqual(refreshedEssays.answers[keptId], savedBeforeEssayRefresh.answers[keptId]);
    assert.match(await page.locator('#progressText').innerText(), /đúng 1\/40/);
    assert.equal(await page.locator('.blank').first().inputValue(), '');
    if (real) {
      assert.notDeepEqual(refreshedEssays.deck.slice(40), savedBeforeEssayRefresh.deck.slice(40));
      assert.equal(new Set(refreshedEssays.deck.slice(40).map(q => q.formId)).size, 3);
      // Old snapshots must not wipe the working MCQ section on an upgrade.
      await page.locator('.blank').first().fill('legacy-essay-draft');
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('oopQuiz.exam.v3'));
        for (const q of s.deck.slice(40)) { delete q.formVersion; delete q.formId; delete q.sections; delete q.introduction; }
        localStorage.setItem('oopQuiz.exam.v3', JSON.stringify(s));
      });
      await page.reload(); await page.waitForLoadState('networkidle');
      assert.match(await page.locator('#storageNotice').innerText(), /mẫu cũ/);
      assert.equal(await page.locator('.blank').first().inputValue(), 'legacy-essay-draft');
      page.once('dialog', dialog => dialog.accept());
      await page.locator('#newEssaysBtn').click();
      const upgraded = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')));
      assert.deepEqual(upgraded.deck.slice(0, 40), savedBeforeEssayRefresh.deck.slice(0, 40));
      assert.deepEqual(upgraded.answers[keptId], savedBeforeEssayRefresh.answers[keptId]);
      assert.ok(upgraded.deck.slice(40).every(q => q.formVersion === 2));
    }
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('#essayTab').click();
      const bounds = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, width: innerWidth }));
      assert.ok(bounds.content <= bounds.width + 1, 'No page overflow at ' + width + ': ' + JSON.stringify(bounds));
    }
    if (process.env.SCREENSHOT_PATH) {
      await page.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: false });
      if (real) {
        const deck = await page.evaluate(() => JSON.parse(localStorage.getItem('oopQuiz.exam.v3')).deck);
        for (const form of ['encapsulation', 'inheritance', 'polymorphism']) {
          const index = deck.findIndex(q => q.formId === form);
          await page.locator('[data-go="' + index + '"]').click();
          await page.screenshot({ path: process.env.SCREENSHOT_PATH.replace(/\.png$/, '-' + form + '.png'), fullPage: false });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('#essayTab').click();
        await page.screenshot({ path: process.env.SCREENSHOT_PATH.replace(/\.png$/, '-mobile.png'), fullPage: false });
      }
    }
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#clearBtn').click();
    assert.match(await page.locator('#progressText').innerText(), /Đã xử lý 0\/45/);
    await page.evaluate(() => localStorage.setItem('oopQuiz.exam.v3', '{corrupt'));
    await page.reload(); await page.waitForLoadState('networkidle');
    assert.match(await page.locator('#storageNotice').innerText(), /không hợp lệ/);
    const blocked = await browser.newPage();
    if (!real) {
      await blocked.route('**/mcq-generators.js', route => route.fulfill({ contentType: 'text/javascript', body: fixtureMCQ }));
      await blocked.route('**/essay-generators.js', route => route.fulfill({ contentType: 'text/javascript', body: fixtureEssay }));
    }
    await blocked.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error('blocked for test'); }; });
    await blocked.goto(base); await blocked.waitForLoadState('networkidle');
    assert.match(await blocked.locator('#storageNotice').innerText(), /Không thể lưu/);
    assert.equal(await blocked.locator('[data-go]').count(), 45);
    await blocked.close();
    if (real) {
      const filePage = await browser.newPage();
      filePage.on('pageerror', err => errors.push(err.message));
      await filePage.goto('file:///' + root.replace(/\\/g, '/') + '/index.html');
      await filePage.waitForLoadState('networkidle');
      assert.equal(await filePage.locator('[data-go]').count(), 45, 'Direct index.html opens offline');
      await filePage.locator('#essayTab').click();
      assert.ok(await filePage.locator('.blank').count() >= 45);
      await filePage.close();
    }
    assert.deepEqual(errors, []);
    console.log('browser ' + (real ? 'REAL GENERATORS' : 'FIXTURES') + ': grading, reveal, drafts/reload/navigation, regeneration, legacy storage, summary, reset, corrupt/blocked storage, 4 viewport widths; zero console errors');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => server.close());
