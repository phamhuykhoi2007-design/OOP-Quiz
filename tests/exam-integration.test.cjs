const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({});
for (const file of ['mcq-generators.js', 'essay-generators.js', 'exam-core.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
}
function seeded(seed) {
  let n = seed;
  return () => ((n = (Math.imul(1664525, n) + 1013904223) >>> 0) / 4294967296);
}
const signatures = new Set();
const mcqContent = new Set(), essayContent = new Set();
const answerPositions = [0, 0, 0, 0];
for (let seed = 1; seed <= 100; seed++) {
  const deck = context.ExamCore.build(seeded(seed));
  assert.equal(context.ExamCore.validate(deck), true);
  assert.equal(new Set(deck.slice(0, 40).map(q => q.ch)).size, 5);
  assert.equal(new Set(deck.map(q => q.id)).size, 45);
  assert.equal(new Set(deck.slice(0, 40).map(q => q.title + '\n' + (q.code || ''))).size, 40);
  deck.slice(0, 40).forEach(q => answerPositions[q.answer]++);
  mcqContent.add(deck.slice(0, 40).map(q => JSON.stringify([q.ch, q.title, q.code || '', q.options[q.answer]])).sort().join('\n'));
  essayContent.add(deck.slice(40).map(q => JSON.stringify([q.title, q.requirements, q.lines, q.blanks.map(b => b.ok)])).sort().join('\n'));
  const answers = {};
  for (const q of deck) {
    const value = q.type === 'mcq' ? q.answer : q.blanks.map(b => b.ok[0]);
    assert.equal(context.ExamCore.check(q, value).correct, true, q.id + ' has a gradable model answer');
    answers[q.id] = { value, attempts: 1, status: 'ok' };
  }
  const summary = context.ExamCore.summary(deck, answers);
  assert.equal(summary.mcq.correct, 40); assert.equal(summary.essay.correct, 5);
  assert.equal(summary.completed, 45);
  const snapshot = { version: 3, deck, answers, idx: 44, finished: true };
  const restored = context.ExamCore.restore(JSON.stringify(snapshot));
  assert.ok(restored); assert.equal(restored.idx, 44); assert.equal(restored.finished, true);
  signatures.add(JSON.stringify(deck));
}
assert.equal(signatures.size, 100, '100 independently seeded exams are different');
assert.equal(mcqContent.size, 100, 'MCQ content varies, not just question/option ordering');
assert.equal(essayContent.size, 100, 'Essay content varies, not just ordering');
assert.ok(answerPositions.every(n => n > 500), 'Correct answers use all four positions across seeded exams');
assert.equal(JSON.stringify(context.ExamCore.build(seeded(42))), JSON.stringify(context.ExamCore.build(seeded(42))), 'Reproducible from the same RNG seed');
console.log('exam integration: 100 complete 40+5 exams, 5-chapter coverage, grading, snapshot restore and generation variation passed');
