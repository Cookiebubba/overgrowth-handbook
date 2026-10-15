(() => {
'use strict';
const CW = 150, RH = 124, PAD = 150;
const KEY = 'overgrowth-v2';
const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const $ = s => document.querySelector(s);
const isMobile = () => matchMedia('(max-width:760px)').matches;
const weekKey = () => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);

// Mechanical buff effects (everything else in `mods` is labeled as a real-world perk, not simulated)
const EFFECTS = {
  'founder-mode':        { swings: 1, txt: '+1 weekly swing charge' },
  'first-contractor':    { swings: 1, txt: '+1 weekly swing charge' },
  'runway-consult':      { runway: 6, arc: { discover: 1.5 }, txt: '+6 mo O₂; Discover gold ×1.5' },
  'boss-term-sheet':     { runway: 18, txt: '+18 mo O₂' },
  'runway-dayjob':       { noDrain: true, txt: 'O₂ never drains' },
  'boss-ramen':          { noDrain: true, txt: 'O₂ never drains' },
  'ship-weekly':         { arc: { build: 1.1 }, txt: 'Build gold ×1.1' },
  'payments':            { all: 1.25, txt: 'All gold ×1.25' },
  'productized':         { all: 1.2, txt: 'All gold ×1.2' },
  'boss-first-customer': { arc: { grow: 1.5 }, txt: 'Grow gold ×1.5' },
  'cold-outbound':       { arc: { grow: 1.3 }, txt: 'Grow gold ×1.3' },
  'pricing':             { arc: { scale: 1.5 }, txt: 'Scale gold ×1.5' },
  'path-venture':        { arc: { scale: 2 }, drainX: 2, txt: 'Scale gold ×2, but runway shown at half' },
  'product-hunt':        { bonus: 300, txt: 'One-time +300 gold on completion' },
  'ch-youtube':          { daily: 5, txt: '+5 gold per day (up to 7 days banked)' },
  'seo-content':         { daily: 5, txt: '+5 gold per day (up to 7 days banked)' },
};

let S = load();
function fresh() { return { gold: 0, unlocked: { 'founder-mode': 1 }, done: {}, runway: 6, swings: { week: weekKey(), active: [] }, filter: Object.keys(ARCS), sound: false, onboarded: false, harvest: today() }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.unlocked && s.done) return Object.assign(fresh(), s); } catch (e) {} return fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
if (S.swings.week !== weekKey()) S.swings = { week: weekKey(), active: [] };

const activeFx = () => Object.entries(EFFECTS).filter(([id]) => S.done[id]).map(([id, e]) => ({ id, ...e }));
const maxSwings = () => 3 + activeFx().reduce((a, e) => a + (e.swings || 0), 0);
function goldMul(n) { let m = 1; for (const e of activeFx()) { if (e.all) m *= e.all; if (e.arc && e.arc[n.arc]) m *= e.arc[n.arc]; } return m; }
const reward = n => Math.round(n.gold * goldMul(n));
const reqMet = n => n.req.every(r => S.done[r]);
const forkedAway = n => n.excl && SKILLS.some(o => o.excl === n.excl && o.id !== n.id && (S.unlocked[o.id] || S.done[o.id]));
function status(n) { if (S.done[n.id]) return 'done'; if (S.unlocked[n.id]) return 'unlocked'; if (forkedAway(n)) return 'forked'; if (reqMet(n)) return 'avail'; return 'locked'; }
function nextBest() {
  const order = (a, b) => a.c - b.c || a.r - b.r;
  const open = SKILLS.filter(n => status(n) === 'unlocked').sort(order);
  if (open.length) return { n: open[0], verb: 'FINISH' };
  const av = SKILLS.filter(n => status(n) === 'avail').sort((a, b) => (b.tier === 'root') - (a.tier === 'root') || order(a, b));
  return av.length ? { n: av[0], verb: S.gold >= av[0].cost ? 'CUT INTO' : 'NEED GOLD FOR' } : null;
}

// passive daily gold
(function harvest() { const days = Math.min(7, Math.floor((Date.parse(today()) - Date.parse(S.harvest || today())) / 864e5)); const per = activeFx().reduce((a, e) => a + (e.daily || 0), 0); if (days > 0 && per) { S.gold += days * per; setTimeout(() => toast(`Evergreen harvest: +◉${days * per}`), 900); } S.harvest = today(); save(); })();

// ---------- sound (WebAudio, muted by default) ----------
let ac = null;
function beep(seq) { if (!S.sound) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); let t = ac.currentTime; for (const [f, d, type] of seq) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d); t += d * .8; } } catch (e) {} }
const SFX = { cut: [[220, .05, 'sawtooth'], [440, .06], [660, .08]], coin: [[988, .06], [1319, .14]], boss: [[523, .1], [659, .1], [784, .1], [1047, .3]], nope: [[160, .15, 'sawtooth']], tap: [[700, .03]] };

// ---------- tree ----------
const vp = $('#viewport'), world = $('#world'), nodesEl = $('#nodes'), svg = $('#vines');
const maxC = Math.max(...SKILLS.map(s => s.c)), maxR = Math.max(...SKILLS.map(s => s.r));
const W = PAD * 2 + maxC * CW, H = PAD + 30 + maxR * RH + 150;
world.style.width = W + 'px'; world.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H);
const pos = n => [PAD + n.c * CW, PAD + 30 + n.r * RH];
function staticLayer() {
  let o = `<rect x="0" y="${H - 60}" width="${W}" height="60" fill="#8a5a2e"/><rect x="0" y="${H - 60}" width="${W}" height="10" fill="#3fa535"/>`;
  for (const [k, a] of Object.entries(ARCS)) {
    const cs = SKILLS.filter(s => s.arc === k).map(s => s.c);
    const x0 = PAD + Math.min(...cs) * CW - CW / 2, x1 = PAD + Math.max(...cs) * CW + CW / 2;
    o += `<rect x="${x0}" y="70" width="${x1 - x0}" height="${H - 130}" fill="${a.color}" fill-opacity="0.13"/>
      <rect x="${x0}" y="70" width="${x1 - x0}" height="6" fill="${a.color}"/>
      <text class="biome-label" x="${x0 + 10}" y="52">${a.name}</text>`;
  }
  for (let x = 0; x < W; x += 16) { const h = 10 + ((x * 7) % 17); o += `<rect x="${x}" y="${H - 60 - h}" width="5" height="${h}" fill="#3fa535"/><rect x="${x + 7}" y="${H - 60 - h * .6}" width="5" height="${h * .6}" fill="#6cd043"/>`; }
  return o;
}
const STATIC = staticLayer();
function vinePath(a, b) { const [x1, y1] = pos(a), [x2, y2] = pos(b); const mx = (x1 + x2) / 2, wob = ((a.c * 13 + b.r * 7) % 3 - 1) * 26; return `M${x1},${y1} C${mx + wob},${y1} ${mx - wob},${y2} ${x2},${y2}`; }
let sel = null, hintId = null;
function renderTree() {
  let g = STATIC;
  for (const n of SKILLS) for (const r of n.req) {
    const p = byId[r], cls = S.done[n.id] ? 'lit' : S.done[r] ? 'live' : '', d = vinePath(p, n);
    const [x1, y1] = pos(p), [x2, y2] = pos(n), cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    g += `<path class="vine ${cls}" d="${d}"/><path class="vine-core" d="${d}"/><rect class="leaf" x="${cx - 7}" y="${cy - 12}" width="14" height="9" transform="rotate(-30 ${cx} ${cy})"/>`;
  }
  svg.innerHTML = g;
  const q = ($('#search').value || '').toLowerCase().trim();
  const nb = nextBest(); hintId = nb && nb.n.id;
  nodesEl.innerHTML = SKILLS.map(n => {
    const st = status(n), [x, y] = pos(n);
    const hit = (!q || (n.name + ' ' + n.blurb + ' ' + n.why + ' ' + n.steps.join(' ')).toLowerCase().includes(q)) && S.filter.includes(n.arc);
    const grass = (st === 'locked' || st === 'avail') ? '<div class="grassy"></div>' : '';
    return `<div class="node ${n.tier} ${st}${hit ? '' : ' dimmed'}${sel === n.id ? ' sel' : ''}${hintId === n.id ? ' hint' : ''}" data-id="${n.id}" style="left:${x}px;top:${y}px" title="${n.blurb.replace(/"/g, '&quot;')}"><span class="ico">${n.icon}</span>${grass}<div class="nm">${n.name}</div>${st === 'avail' && n.cost ? `<div class="cost">◉${n.cost}</div>` : ''}</div>`;
  }).join('');
  $('#next').textContent = nb ? `▶ ${nb.verb}: ${nb.n.icon} ${nb.n.name}` : (Object.keys(S.done).length === SKILLS.length ? '🏆 FIELD CLEARED' : '');
  renderHud();
}

// ---------- HUD ----------
let shownGold = S.gold;
function effRunway() { let r = Number(S.runway) || 0; for (const e of activeFx()) r += e.runway || 0; if (activeFx().some(e => e.drainX)) r = r / 2; return Math.round(r * 10) / 10; }
function renderHud() {
  const gEl = $('#gold');
  if (shownGold !== S.gold) { const from = shownGold, to = S.gold, t0 = performance.now(); shownGold = to; gEl.classList.remove('pop'); void gEl.offsetWidth; gEl.classList.add('pop');
    const step = t => { const k = Math.min(1, (t - t0) / 600); gEl.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  } else gEl.textContent = S.gold;
  const r = effRunway(), safe = activeFx().some(e => e.noDrain), bar = $('#o2bar');
  bar.style.width = (safe ? 100 : Math.min(100, r / 24 * 100)) + '%';
  bar.parentElement.classList.toggle('low', !safe && r < 6);
  bar.parentElement.parentElement.title = safe ? 'Oxygen stable: runway no longer drains' : `${r} months effective runway${r < 6 ? ' (LOW: consult, cut costs or raise prices)' : ''}`;
  const gates = SKILLS.filter(n => n.gate), pct = Math.round(gates.filter(n => S.done[n.id]).length / gates.length * 100);
  $('#readybar').style.width = pct + '%'; $('#readypct').textContent = pct + '%';
  const used = S.swings.active.length, mx = maxSwings();
  $('#swings').textContent = '⚔'.repeat(Math.max(0, mx - used)) + '·'.repeat(Math.min(used, mx));
  $('#depth').textContent = Object.keys(S.done).length + '/' + SKILLS.length;
  $('#btn-sound').textContent = S.sound ? '🔊' : '🔇';
}

// ---------- panel ----------
const list = (a, tag = 'ul') => a && a.length ? `<${tag}>${a.map(x => `<li>${x}</li>`).join('')}</${tag}>` : '';
function sheetOpen(el) { el.classList.remove('hidden'); el.scrollTop = 0; }
function openNode(id) {
  const n = byId[id]; if (!n) return; sel = id;
  const st = status(n), arc = ARCS[n.arc];
  const reqs = n.req.map(r => `<span class="tag row" data-open="${r}" style="background:${S.done[r] ? '#e3f7c6' : '#ffe0d6'}">${S.done[r] ? '✔' : '✖'} ${byId[r].name}</span>`).join('') || '<span class="empty">None: start here.</span>';
  const kids = SKILLS.filter(k => k.req.includes(id)).map(k => `<span class="tag row" data-open="${k.id}">${k.icon} ${k.name}</span>`).join('');
  const rivals = n.excl ? SKILLS.filter(o => o.excl === n.excl && o.id !== n.id).map(o => o.name).join(', ') : '';
  const swinging = S.swings.active.includes(id), rw = reward(n), fx = EFFECTS[id];
  let act = '';
  if (st === 'avail') act = `<button class="gold" data-a="unlock">✂ CUT IN · ◉${n.cost}</button>${S.gold < n.cost ? `<span class="empty">You have ◉${S.gold}. Finish an open chapter to earn more.</span>` : ''}`;
  if (st === 'unlocked') act = `<button class="gold" data-a="done">✔ DONE-WHEN MET · +◉${rw}</button><button data-a="swing">${swinging ? '✖ END SWING' : '⚔ SWING THIS WEEK'}</button>`;
  if (st === 'done') act = `<span class="tag" style="background:#e3f7c6">✔ CUT</span><button data-a="undo">UNDO</button>`;
  if (n.excl && (st === 'unlocked' || st === 'done')) act += `<button class="danger" data-a="replant">REPLANT FORK</button>`;
  if (st === 'locked') act = `<span class="empty">🌿 Overgrown: finish the prerequisites below first.</span>`;
  if (st === 'forked') act = `<span class="empty">You chose a different fork (${rivals}). Open it and hit REPLANT to switch.</span>`;
  $('#panel-body').innerHTML = `
    <span class="tag" style="background:${arc.color}">${arc.name}</span><span class="tag">${n.tier.toUpperCase()}</span>${n.gate ? '<span class="tag" style="background:#ffe9a8">LAUNCH GATE</span>' : ''}${n.excl ? `<span class="tag" style="background:#f0dcff">FORK · excludes ${rivals}</span>` : ''}
    <h2>${n.icon} ${n.name}</h2><p><i>${n.blurb}</i></p>
    <div class="actions">${act}</div>
    <h3>DONE WHEN</h3><div class="done-when">${n.done}</div>
    ${n.week ? `<h3>⚔ DO THIS WEEK</h3><p>${n.week}</p>` : ''}
    <h3>WHY IT MATTERS</h3><p>${n.why}</p>
    <h3>STEPS</h3>${list(n.steps, 'ol')}
    ${n.template ? `<h3>TEMPLATE</h3><div class="tpl">${n.template}</div>` : ''}
    <h3>PITFALLS</h3><div class="pit">${list(n.pitfalls)}</div>
    ${n.mods && n.mods.length ? `<h3>GRANTS</h3>${fx ? `<div class="buff fx">⚙ <b>In-game effect:</b> ${fx.txt}</div>` : ''}${n.mods.map(m => `<div class="buff perk">📜 ${m}${fx ? '' : ' <small>(real-world perk, not simulated)</small>'}</div>`).join('')}` : ''}
    <h3>REQUIRES</h3><div>${reqs}</div>
    ${kids ? `<h3>UNLOCKS</h3><div>${kids}</div>` : ''}`;
  sheetOpen($('#panel')); $('#drawer').classList.add('hidden');
  renderTree();
}
function fxAt(n) { const el = nodesEl.querySelector(`[data-id="${n.id}"]`); if (!el) return [innerWidth / 2, innerHeight / 2]; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
$('#panel').addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) { beep(SFX.tap); openNode(o.dataset.open); focusNode(byId[o.dataset.open]); return; }
  const b = e.target.closest('[data-a]'); if (!b || !sel) return; const n = byId[sel], a = b.dataset.a;
  if (a === 'unlock') {
    if (S.gold < n.cost) { beep(SFX.nope); shake(); return toast(`Need ◉${n.cost - S.gold} more gold`); }
    S.gold -= n.cost; S.unlocked[n.id] = 1; save(); renderTree(); const [x, y] = fxAt(n); cutFx(x, y); bumpNode(n); beep(SFX.cut); toast('✂ Grass cut: chapter open');
  }
  if (a === 'done') {
    const rw = reward(n) + ((EFFECTS[n.id] || {}).bonus || 0); const before = new Set(SKILLS.filter(k => status(k) === 'avail').map(k => k.id));
    S.done[n.id] = 1; S.gold += rw; S.swings.active = S.swings.active.filter(x => x !== n.id); save(); renderTree();
    const [x, y] = fxAt(n); cutFx(x, y); coinFx(x, y, rw); bumpNode(n); beep(SFX.coin);
    const fresh = SKILLS.filter(k => status(k) === 'avail' && !before.has(k.id));
    if (n.tier === 'root') { shake(); beep(SFX.boss); bossModal(n, rw, fresh); }
    else toast(`+◉${rw}${fresh.length ? ` · ${fresh.length} new path${fresh.length > 1 ? 's' : ''} revealed` : ''}`);
  }
  if (a === 'undo') { delete S.done[n.id]; S.gold = Math.max(0, S.gold - reward(n)); }
  if (a === 'swing') { const i = S.swings.active.indexOf(n.id); if (i >= 0) S.swings.active.splice(i, 1); else if (S.swings.active.length >= maxSwings()) { beep(SFX.nope); return toast('No swing charges left. They refill Monday.'); } else { S.swings.active.push(n.id); beep(SFX.tap); toast('⚔ Added to This Week'); } }
  if (a === 'replant') { if (S.done[n.id]) S.gold = Math.max(0, S.gold - reward(n)); S.gold += n.cost; delete S.done[n.id]; delete S.unlocked[n.id]; toast('🌱 Fork replanted: choose again'); }
  save(); openNode(n.id);
});
$('#close').onclick = () => { $('#panel').classList.add('hidden'); sel = null; renderTree(); };
$('#dclose').onclick = () => $('#drawer').classList.add('hidden');

// ---------- drawers ----------
function drawer(html) { $('#drawer-body').innerHTML = html; sheetOpen($('#drawer')); $('#panel').classList.add('hidden'); }
$('#btn-buffs').onclick = () => {
  const fx = activeFx(), perks = SKILLS.filter(n => S.done[n.id] && n.mods && n.mods.length && !EFFECTS[n.id]);
  const arcs = Object.keys(ARCS).map(k => `${ARCS[k].name.split(' · ')[1]}: ×${goldMul({ arc: k }).toFixed(2)}`).join('<br>');
  drawer(`<h2>⚙ ACTIVE BUFFS</h2>
   <h3>GOLD MULTIPLIERS (LIVE)</h3><div class="mult">${arcs}</div>
   <h3>IN-GAME EFFECTS</h3>${fx.length ? fx.map(e => `<div class="buff fx">⚙ ${e.txt}<br><small>from ${byId[e.id].icon} ${byId[e.id].name}</small></div>`).join('') : '<p class="empty">None yet. Completing First Swing gives +1 swing, and Payments Live gives ×1.25 gold.</p>'}
   <h3>REAL-WORLD PERKS (NOT SIMULATED)</h3>${perks.length ? perks.map(n => n.mods.map(m => `<div class="buff perk">📜 ${m}<br><small>from ${n.icon} ${n.name}</small></div>`).join('')).join('') : '<p class="empty">These are the real advantages a finished chapter gives you, like sharper copy or a warm audience.</p>'}
   <h3>LAUNCH GATES</h3>${list(SKILLS.filter(n => n.gate).map(n => `<span class="row" data-open="${n.id}">${S.done[n.id] ? '✔' : '□'} ${n.name}</span>`))}`);
};
$('#btn-week').onclick = () => {
  const row = n => `<div class="buff fx row" data-open="${n.id}">${n.icon} <b>${n.name}</b><br>⚔ ${n.week || n.done}</div>`;
  const act = S.swings.active.map(id => byId[id]), open = SKILLS.filter(n => status(n) === 'unlocked' && !S.swings.active.includes(n.id)), av = SKILLS.filter(n => status(n) === 'avail').slice(0, 6);
  drawer(`<h2>⚔ THIS WEEK</h2><p>Up to ${maxSwings()} active swings at a time. They refill every Monday.</p>
   <h3>ACTIVE SWINGS (${act.length}/${maxSwings()})</h3>${act.length ? act.map(row).join('') : '<p class="empty">None yet. Open a chapter and tap ⚔ SWING THIS WEEK.</p>'}
   <h3>OPEN CHAPTERS</h3>${open.length ? open.map(row).join('') : '<p class="empty">No open chapters.</p>'}
   <h3>READY TO CUT</h3>${av.length ? av.map(row).join('') : '<p class="empty">Finish prerequisites to reveal more.</p>'}`);
};
$('#drawer').addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t) { openNode(t.dataset.open); focusNode(byId[t.dataset.open]); } });
$('#btn-reset').onclick = () => { if (confirm('Burn the field and restart? All progress will be cleared.')) { const snd = S.sound; S = fresh(); S.sound = snd; S.onboarded = true; shownGold = 0; save(); sel = null; $('#panel').classList.add('hidden'); $('#drawer').classList.add('hidden'); $('#search').value = ''; renderFilters(); renderTree(); fit(); toast('🔥 Field reset'); } };
$('#btn-sound').onclick = () => { S.sound = !S.sound; save(); renderHud(); beep(SFX.coin); };
$('#btn-menu').onclick = () => { $('#top').classList.toggle('open'); setTop(); };
$('#btn-help').onclick = () => onboard(0);
$('#next').onclick = () => { const nb = nextBest(); if (nb) { focusNode(nb.n); openNode(nb.n.id); } };
$('#runway').value = S.runway;
$('#runway').oninput = e => { S.runway = Math.max(0, Number(e.target.value) || 0); save(); renderHud(); };
$('#search').oninput = () => { renderTree(); const q = $('#search').value.trim().toLowerCase(); if (q) { const m = SKILLS.find(n => n.name.toLowerCase().includes(q)); if (m) focusNode(m); } };
function renderFilters() { $('#arcfilters').innerHTML = Object.entries(ARCS).map(([k, a]) => `<span class="chip ${S.filter.includes(k) ? 'on' : ''}" data-k="${k}"><i style="background:${a.color}"></i>${a.name.split(' · ')[1]}</span>`).join(''); }
$('#arcfilters').onclick = e => { const c = e.target.closest('[data-k]'); if (!c) return; const k = c.dataset.k; S.filter = S.filter.includes(k) ? S.filter.filter(x => x !== k) : [...S.filter, k]; save(); renderFilters(); renderTree(); };

// ---------- pan / pinch / wheel ----------
let tx = 0, ty = 0, sc = 1;
const apply = () => { world.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`; };
const clampS = s => Math.min(1.8, Math.max(.22, s));
function fit() { const r = vp.getBoundingClientRect(); sc = clampS(isMobile() ? Math.min(.62, r.height / H) : Math.min(1, r.height / H)); tx = isMobile() ? 10 - (PAD - 70) * sc : 20; ty = (r.height - H * sc) / 2; apply(); }
function focusNode(n) { const r = vp.getBoundingClientRect(); const [x, y] = pos(n); const fy = isMobile() && !$('#panel').classList.contains('hidden') ? r.height * .1 + 30 : r.height / 2; tx = (isMobile() ? r.width / 2 : r.width / 3) - x * sc; ty = fy - y * sc; world.style.transition = 'transform .35s ease-out'; apply(); setTimeout(() => world.style.transition = '', 360); }
const ptrs = new Map(); let pan = null, pinch = null, moved = false;
vp.addEventListener('pointerdown', e => {
  if (e.target.closest('#legend,#next')) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
  if (ptrs.size === 1) { pan = { x: e.clientX - tx, y: e.clientY - ty, sx: e.clientX, sy: e.clientY, target: e.target }; moved = false; }
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: sc, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx, ty }; moved = true; }
});
vp.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect(); const ns = clampS(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d); const mx = pinch.mx - r.left, my = pinch.my - r.top; tx = mx - (mx - pinch.tx) * ns / pinch.s; ty = my - (my - pinch.ty) * ns / pinch.s; sc = ns; apply(); return; }
  if (!pan) return;
  if (Math.abs(e.clientX - pan.sx) + Math.abs(e.clientY - pan.sy) > 8) { moved = true; vp.classList.add('drag'); }
  if (moved) { tx = e.clientX - pan.x; ty = e.clientY - pan.y; apply(); }
});
function ptrEnd(e) {
  if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 1) { const [p] = [...ptrs.values()]; pan = { x: p.x - tx, y: p.y - ty, sx: p.x, sy: p.y }; return; }
  if (pan && !moved) { const el = pan.target && pan.target.closest && pan.target.closest('.node'); if (el) { beep(SFX.tap); openNode(el.dataset.id); if (isMobile()) focusNode(byId[el.dataset.id]); } }
  pan = null; vp.classList.remove('drag');
}
vp.addEventListener('pointerup', ptrEnd); vp.addEventListener('pointercancel', ptrEnd);
vp.addEventListener('wheel', e => { e.preventDefault(); const r = vp.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; const ns = clampS(sc * (e.deltaY < 0 ? 1.12 : .89)); tx = mx - (mx - tx) * ns / sc; ty = my - (my - ty) * ns / sc; sc = ns; apply(); }, { passive: false });
$('#btn-fit').onclick = fit;
function setTop() { document.documentElement.style.setProperty('--toph', $('#top').offsetHeight + 'px'); }
window.addEventListener('resize', () => { setTop(); });

// ---------- juice ----------
const layer = $('#fxlayer');
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2000); }
function shake() { vp.classList.remove('shake'); void vp.offsetWidth; vp.classList.add('shake'); if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {} }
function bumpNode(n) { const el = nodesEl.querySelector(`[data-id="${n.id}"]`); if (el) { el.classList.add('cutnow'); setTimeout(() => el.classList.remove('cutnow'), 500); } }
function spawn(cls, x, y, txt) { const b = document.createElement('div'); b.className = cls; b.style.left = x + 'px'; b.style.top = y + 'px'; if (txt) b.textContent = txt; layer.appendChild(b); return b; }
function cutFx(x, y) {
  for (let i = 0; i < 26; i++) { const b = spawn('blade', x, y); const a = -Math.PI * Math.random(), d = 50 + Math.random() * 90;
    b.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 1, offset: .6 }, { transform: `translate(${Math.cos(a) * d * 1.2}px,${Math.sin(a) * d + 80}px) rotate(${(Math.random() - .5) * 900}deg)`, opacity: 0 }], { duration: 800 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.4,1)' }).onfinish = () => b.remove(); }
  const s = spawn('plus', x - 20, y - 20, '✂'); s.animate([{ transform: 'rotate(-90deg) scale(.5)', opacity: 1 }, { transform: 'rotate(200deg) scale(2)', opacity: 0 }], { duration: 450 }).onfinish = () => s.remove();
}
function coinFx(x, y, amt) {
  const g = $('#gold').getBoundingClientRect(), gx = g.left + 10, gy = g.top + 6;
  for (let i = 0; i < Math.min(14, 4 + amt / 15); i++) { const c = spawn('coinfx', x, y); const ox = (Math.random() - .5) * 120, oy = -40 - Math.random() * 70;
    c.animate([{ transform: 'translate(0,0) scale(.4)' }, { transform: `translate(${ox}px,${oy}px) scale(1.1)`, offset: .35 }, { transform: `translate(${gx - x}px,${gy - y}px) scale(.6)`, opacity: .9 }], { duration: 900 + i * 40, easing: 'cubic-bezier(.5,0,.7,1)' }).onfinish = () => c.remove(); }
  const p = spawn('plus', x - 30, y - 50, `+${amt}`); p.animate([{ transform: 'translateY(0) scale(.6)', opacity: 1 }, { transform: 'translateY(-50px) scale(1.4)', opacity: 1, offset: .5 }, { transform: 'translateY(-80px) scale(1.2)', opacity: 0 }], { duration: 1100 }).onfinish = () => p.remove();
}
function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="card">${html}</div>`; m.classList.remove('hidden'); }
$('#modal').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; const v = b.dataset.m; if (v === 'close') { S.onboarded = true; save(); $('#modal').classList.add('hidden'); } else if (v.startsWith('ob')) onboard(+v.slice(2)); else if (v.startsWith('go:')) { $('#modal').classList.add('hidden'); openNode(v.slice(3)); focusNode(byId[v.slice(3)]); } });
function bossModal(n, rw, fresh) {
  const nextArc = fresh.length ? ARCS[fresh[0].arc].name : null;
  modal(`<div class="boss"><div class="big">${n.icon}</div><h2>ROOT DESTROYED!</h2><p><b>${n.name.replace('ROOT: ', '')}</b></p><p>+◉${rw} gold${nextArc ? `<br>New biome: <b>${nextArc}</b>` : ''}</p>${(n.mods || []).map(m => `<div class="buff fx">${m}</div>`).join('')}
   <div class="actions" style="justify-content:center">${fresh[0] ? `<button class="gold" data-m="go:${fresh[0].id}">▶ ${fresh[0].name}</button>` : ''}<button data-m="close">KEEP CUTTING</button></div></div>`);
}
const OB = [
  ['🌾', 'CUT YOUR WAY IN', 'Each tile is a playbook chapter hidden in the grass. Tap a glowing tile, read it, and spend <b>◉ gold</b> to cut it open.'],
  ['◉', 'EARN GOLD BY DOING', 'Gold only comes from tapping <b>DONE-WHEN MET</b> after you hit the real-world outcome. Reading alone pays nothing. Bosses are real milestones like your first paying customer.'],
  ['🫧', 'WATCH YOUR METERS', '<b>O₂</b> is your runway in months (tap it to edit). It turns red under 6. <b>LAUNCH</b> fills as you finish launch-gate chapters. Follow the yellow <b>▶ NEXT</b> button.']
];
function onboard(i) { if (i >= OB.length) { S.onboarded = true; save(); $('#modal').classList.add('hidden'); const nb = nextBest(); if (nb) { openNode(nb.n.id); focusNode(nb.n); } return; } const [ic, t, p] = OB[i];
  modal(`<div class="big">${ic}</div><h2>${t}</h2><p>${p}</p><div class="steps">${i + 1} / ${OB.length}</div><div class="actions" style="justify-content:center"><button data-m="close">SKIP</button><button class="gold" data-m="ob${i + 1}">${i === OB.length - 1 ? "LET'S CUT ▶" : 'NEXT ▶'}</button></div>`); }

setTop(); renderFilters(); renderTree(); fit();
if (!S.onboarded) onboard(0);
window.__og = { get state() { return S; } };
})();
