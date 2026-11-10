/* Test helper: output complete solved programs to a caller-selected temp folder.
   No C# answer is written into the web page before the learner checks/reveals. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const folder = process.argv[2];
assert.ok(folder && path.isAbsolute(folder), 'Supply an absolute output directory (prefer a temp directory)');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../essay-generators.js'), 'utf8'), context);
fs.mkdirSync(folder, { recursive: true });
let count = 0;
const manifest = [];
for (const seed of [1, 7, 42, 2026]) {
  let state = seed;
  const rng = () => ((state = (Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296);
  context.ExamEssay.generate(rng).forEach((q, i) => {
    const code = q.lines.map(line => line.map(segment => typeof segment === 'string' ? segment : q.blanks[segment.b].ok[0]).join('')).join('\n');
    const file = `seed-${seed}-essay-${i + 1}.cs`;
    fs.writeFileSync(path.join(folder, file), code, 'utf8'); count++;
    manifest.push({ file, formId: q.formId, parameters: q.parameters });
  });
}
console.log('Exported ' + count + ' solved C# programs into ' + folder);
fs.writeFileSync(path.join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
