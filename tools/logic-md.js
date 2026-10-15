// Prints the dependency map section of LOGIC.md from skills-data.js
const fs = require('fs'); eval(fs.readFileSync(__dirname + '/../skills-data.js', 'utf8').replace(/^const /gm, 'var '));
const byId = Object.fromEntries(SKILLS.map(s => [s.id, s])); const nm = id => byId[id].name.replace(/^(ROOT|GATE): /, '');
let o = '';
for (const [k, a] of Object.entries(ARCS)) {
  o += `\n### ${a.name}\n\n| Chapter | Needs ALL of (hard) | Plus ANY ONE of | Fork |\n|---|---|---|---|\n`;
  for (const n of SKILLS.filter(s => s.arc === k)) o += `| ${n.tier === 'root' ? '**' + n.name + '**' : n.name} | ${n.all.map(nm).join(', ') || '(start)'} | ${n.any.map(g => g.map(nm).join(' / ')).join('; then one of ') || ''} | ${n.excl || ''} |\n`;
}
const hard = SKILLS.filter(n => n.all.length && !n.any.length).length, mixed = SKILLS.filter(n => n.any.length).length;
o += `\nTotals: ${SKILLS.length} chapters. ${hard} have hard-only requirements, ${mixed} use any-of groups, and 1 is the start.\n`;
process.stdout.write(o);
