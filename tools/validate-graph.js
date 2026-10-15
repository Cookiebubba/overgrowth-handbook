#!/usr/bin/env node
// Validates the skill graph: ids, cycles, reachability per fork choice, redundant/silly gates, minimal paths to milestones.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../skills-data.js', 'utf8').replace(/^const /gm, 'var ');
eval(src);
const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
let errors = 0, warns = 0;
const err = m => { errors++; console.log('ERROR  ' + m); };
const warn = m => { warns++; console.log('WARN   ' + m); };
const info = m => console.log('info   ' + m);
const deps = n => [...n.all, ...n.any.flat()];
// 1. ids and shapes
const seen = new Set();
for (const n of SKILLS) {
  if (seen.has(n.id)) err(`duplicate id ${n.id}`); seen.add(n.id);
  for (const k of ['what', 'goal', 'why', 'ic']) if (!n[k]) err(`${n.id} missing ${k}`);
  if (!ARCS[n.arc]) err(`${n.id} unknown arc ${n.arc}`);
  for (const d of deps(n)) { if (!byId[d]) err(`${n.id} -> unknown ${d}`); if (d === n.id) err(`${n.id} requires itself`); }
  for (const g of n.any) { if (!g.length) err(`${n.id} has empty any-group`); if (g.length === 1) warn(`${n.id} any-group with one option (${g[0]}): should be in all`); }
  if (n.all.length > 3) warn(`${n.id} has ${n.all.length} hard requirements`);
}
const roots = SKILLS.filter(n => !deps(n).length); info(`roots: ${roots.map(r => r.id).join(', ')}`);
// 2. cycles
const state = {}; const stack = [];
function dfs(id) { state[id] = 1; stack.push(id); for (const d of deps(byId[id])) { if (state[d] === 1) err(`cycle: ${[...stack.slice(stack.indexOf(d)), d].join(' -> ')}`); else if (!state[d]) dfs(d); } state[id] = 2; stack.pop(); }
SKILLS.forEach(n => state[n.id] || dfs(n.id));
// 3. reachability for every combination of fork choices
const groups = [...new Set(SKILLS.filter(n => n.excl).map(n => n.excl))];
const opts = groups.map(g => SKILLS.filter(n => n.excl === g).map(n => n.id));
const combos = opts.reduce((acc, o) => acc.flatMap(c => o.map(x => [...c, x])), [[]]);
const met = (n, done) => n.all.every(d => done.has(d)) && n.any.every(g => g.some(d => done.has(d)));
const reachedAny = new Set();
for (const c of combos) {
  const chosen = new Set(c), done = new Set(); let changed = true;
  while (changed) { changed = false; for (const n of SKILLS) { if (done.has(n.id)) continue; if (n.excl && !chosen.has(n.id)) continue; if (met(n, done)) { done.add(n.id); changed = true; } } }
  const blocked = SKILLS.filter(n => !done.has(n.id) && !(n.excl && !chosen.has(n.id)));
  info(`forks [${c.join(', ')}]: ${done.size} reachable${blocked.length ? `, blocked by fork: ${blocked.map(b => b.id).join(', ')}` : ''}`);
  done.forEach(d => reachedAny.add(d));
}
SKILLS.filter(n => !reachedAny.has(n.id)).forEach(n => err(`unreachable under every fork choice: ${n.id}`));
// 4. ancestors & redundancy
const anc = {}; const aa = {}; const anyAnc = id => aa[id] || (aa[id] = new Set([...byId[id].all, ...(byId[id].any.length===1 && byId[id].any[0].length===1 ? byId[id].any[0] : [])].flatMap(d => [d, ...anyAnc(d)]))); const ancOf = id => anc[id] || (anc[id] = new Set(byId[id].all.flatMap(d => [d, ...ancOf(d)])));
for (const n of SKILLS) for (const a of n.all) for (const b of n.all) if (a !== b && ancOf(b).has(a)) warn(`${n.id}: hard req ${a} is redundant (already required by ${b})`);
for (const n of SKILLS) for (const g of n.any) for (const d of g) if (n.all.some(a => ancOf(a).has(d) || a === d)) warn(`${n.id}: any-option ${d} is already guaranteed by a hard req`);
for (const n of SKILLS) for (const g of n.any) for (const a of g) for (const b of g) if (a !== b && (ancOf(b).has(a) || anyAnc(b).has(a))) warn(`${n.id}: any-option ${b} always implies ${a}; ${b} is a dominated option`);
// 5. silly gates: hard requirement on a fork option from outside that fork's own branch
for (const n of SKILLS) for (const a of n.all) { const f = byId[a]; if (f.excl && n.arc !== f.arc && !n.excl) warn(`${n.id} hard-requires fork option ${a}; players on the other fork are locked out`); }
// 6. minimal path (fewest chapters) to each milestone
function minSet(id, memo = {}) {
  if (memo[id]) return memo[id];
  const n = byId[id]; let s = new Set([id]);
  for (const a of n.all) minSet(a, memo).forEach(x => s.add(x));
  for (const g of n.any) { let best = null; for (const d of g) { const t = minSet(d, memo); const u = new Set([...s, ...t]); if (!best || u.size < best.size) best = u; } s = best; }
  return (memo[id] = s);
}
for (const n of SKILLS.filter(n => n.tier === 'root')) { const s = minSet(n.id); info(`fewest chapters to clear ${n.id}: ${s.size} (${[...s].join(', ')})`); }
const g = byId[LAUNCH_GATE]; if (!g) err('LAUNCH_GATE missing'); else info(`launch gate needs ALL[${g.all}] + ANY ${JSON.stringify(g.any)}`);
console.log(`\n${SKILLS.length} nodes · ${errors} errors · ${warns} warnings`);
process.exit(errors ? 1 : 0);
