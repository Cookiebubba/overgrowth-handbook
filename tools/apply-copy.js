// Applies copy overrides in tools/copy/*.js to skills-data.js text fields only (ids/graph untouched).
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '../skills-data.js');
let src = fs.readFileSync(file, 'utf8');
const O = Object.assign({}, ...fs.readdirSync(path.join(__dirname, 'copy')).sort().map(f => require('./copy/' + f)));
const TEXT = ['what', 'blurb', 'why', 'steps', 'template', 'pitfalls', 'goal', 'week', 'mods'];
const v = eval(src.replace(/^const /gm, 'var ') + ';({SKILLS})');
let n = 0;
for (const s of v.SKILLS) {
  const o = O[s.id]; if (!o) { console.log('no override for', s.id); continue; }
  for (const k of Object.keys(o)) if (!TEXT.includes(k)) throw new Error(s.id + ' bad key ' + k);
  // locate this node's block
  const start = src.indexOf(`  id: "${s.id}",`); const end = src.indexOf('\n}', start);
  let block = src.slice(start, end);
  for (const k of TEXT) {
    if (!(k in o)) continue;
    const re = new RegExp(`^  ${k}: .*$`, 'm'); const line = `  ${k}: ${JSON.stringify(o[k])},`;
    if (re.test(block)) block = block.replace(re, () => line);
    else block = block.replace(/^  mods: /m, () => line + '\n  mods: ');
    n++;
  }
  src = src.slice(0, start) + block + src.slice(end);
}
for (const id of Object.keys(O)) if (!v.SKILLS.find(s => s.id === id)) throw new Error('unknown id ' + id);
fs.writeFileSync(file, src); console.log('fields written:', n, 'overrides:', Object.keys(O).length);
