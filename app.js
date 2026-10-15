(() => {
'use strict';
const KEY = 'overgrowth-v3';
const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const $ = s => document.querySelector(s);
const isMobile = () => matchMedia('(max-width:760px)').matches;
const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const deps = n => [...n.all, ...n.any.flat()];
const COIN = '<i class="ci"></i>';

// Mechanical bonus effects. Every other "grants" line is labeled a real-world perk (not simulated).
const EFFECTS = {
  'founder-mode': { swings: 1, txt: '+1 weekly focus slot' },
  'first-contractor': { swings: 1, txt: '+1 weekly focus slot' },
  'runway-consult': { runway: 6, arc: { discover: 1.5 }, txt: '+6 months runway; Discover gold ×1.5' },
  'boss-term-sheet': { runway: 18, txt: '+18 months runway' },
  'runway-dayjob': { noDrain: true, txt: 'Runway never runs out' },
  'boss-ramen': { noDrain: true, txt: 'Runway never runs out' },
  'ship-weekly': { arc: { build: 1.1 }, txt: 'Build gold ×1.1' },
  'payments': { all: 1.25, txt: 'All gold ×1.25' },
  'productized': { all: 1.2, txt: 'All gold ×1.2' },
  'boss-first-customer': { arc: { grow: 1.5 }, txt: 'Grow gold ×1.5' },
  'cold-outbound': { arc: { grow: 1.3 }, txt: 'Grow gold ×1.3' },
  'pricing': { arc: { scale: 1.5 }, txt: 'Scale gold ×1.5' },
  'path-venture': { arc: { scale: 2 }, drainX: 2, txt: 'Scale gold ×2, but runway counts half (you burn faster)' },
  'product-hunt': { bonus: 300, txt: 'One-time +300 gold when cleared' },
  'ch-youtube': { daily: 5, txt: '+5 gold per day (up to 7 days saved up)' },
  'seo-content': { daily: 5, txt: '+5 gold per day (up to 7 days saved up)' },
};

let S = load();
function fresh() { return { gold: 0, unlocked: { 'founder-mode': 1 }, done: {}, credit: {}, runway: 6, swings: { week: weekKey(), active: [] }, filter: Object.keys(ARCS), sound: true, music: true, sv: 2, onboarded: false, harvest: today(), theme: 'meadow' }; }
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.unlocked && s.done) { const o = Object.assign(fresh(), s); if (s.sv !== 2) { o.sound = true; o.sv = 2; o._migrated = 1; } return o; } } catch (e) {} return fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
if (S.swings.week !== weekKey()) S.swings = { week: weekKey(), active: [] };
// settings v2: sound is ON by default. Older saves were muted by the old default, so switch them on once; a later mute sticks.
if (S._migrated) { delete S._migrated; save(); }
document.body.className = S.theme === 'classic' ? 'classic' : 'meadow';

const activeFx = () => Object.entries(EFFECTS).filter(([id]) => S.done[id]).map(([id, e]) => ({ id, ...e }));
const maxSwings = () => 3 + activeFx().reduce((a, e) => a + (e.swings || 0), 0);
function goldMul(n) { let m = 1; for (const e of activeFx()) { if (e.all) m *= e.all; if (e.arc && e.arc[n.arc]) m *= e.arc[n.arc]; } return m; }
const reward = n => Math.round(n.gold * goldMul(n));
const reqMet = n => n.all.every(r => S.done[r]) && n.any.every(g => g.some(r => S.done[r]));
const rivals = n => n.excl ? SKILLS.filter(o => o.excl === n.excl && o.id !== n.id) : [];
const forkedAway = n => rivals(n).some(o => S.unlocked[o.id] || S.done[o.id]);
function status(n) { if (S.done[n.id]) return 'done'; if (S.unlocked[n.id]) return 'unlocked'; if (forkedAway(n)) return 'forked'; if (reqMet(n)) return 'avail'; return 'locked'; }
// border color like the game: gold = you can act on it, red = locked / too expensive
const border = (n, st) => (st === 'done' || st === 'unlocked' || (st === 'avail' && S.gold >= n.cost)) ? 'ok' : 'no';
function missing(n) {
  const m = []; const hard = n.all.filter(r => !S.done[r]); if (hard.length) m.push(hard.map(r => byId[r].name).join(' + '));
  n.any.filter(g => !g.some(r => S.done[r])).forEach(g => m.push('one of: ' + g.map(r => byId[r].name).join(' / ')));
  return m;
}
function nextBest() {
  const ord = (a, b) => (LAYOUT.depth?.[a.id] || 0) - (LAYOUT.depth?.[b.id] || 0) || a.cost - b.cost;
  const open = SKILLS.filter(n => status(n) === 'unlocked').sort(ord);
  if (open.length) return { n: open[0], verb: 'FINISH' };
  const av = SKILLS.filter(n => status(n) === 'avail').sort((a, b) => (b.tier === 'root') - (a.tier === 'root') || (S.gold >= b.cost) - (S.gold >= a.cost) || (!!a.excl) - (!!b.excl) || ord(a, b));
  return av.length ? { n: av[0], verb: S.gold >= av[0].cost ? 'UNLOCK' : 'SAVE UP FOR' } : null;
}
(function harvest() { const days = Math.min(7, Math.floor((Date.parse(today()) - Date.parse(S.harvest || today())) / 864e5)); const per = activeFx().reduce((a, e) => a + (e.daily || 0), 0); if (days > 0 && per) { S.gold += days * per; setTimeout(() => toast(`Evergreen content paid out: +${COIN}${days * per}`), 900); } S.harvest = today(); save(); })();

// ---------- sound (WebAudio; the context starts on the first user gesture) ----------
// Samples in audio/ were generated with ElevenLabs (sound effects + music) and tuned to C major.
// If a file fails to load or decode, the old procedural 8-bit sounds play instead.
let ac = null, noiseBuf = null, sfxBus = null, musicBus = null, duckG = null, musicSrc = null, bufsLoading = false;
const BUF = {}, AUD_V = '4.4', MUSIC_LOOP = { start: .3, len: 47.99274 }, MUSIC_VOL = .32;
const canOgg = (() => { try { return !!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"'); } catch (e) { return false; } })();
window.__sndlog = [];
function ctx() {
  if (!S.sound && !S.music) return null;
  try {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC();
      sfxBus = ac.createGain(); sfxBus.gain.value = .8; sfxBus.connect(ac.destination);
      musicBus = ac.createGain(); musicBus.gain.value = 0; duckG = ac.createGain(); musicBus.connect(duckG).connect(ac.destination); loadBufs(); }
    if (ac.state === 'suspended' && !document.hidden) ac.resume().then(startMusic, () => {});
    return ac;
  } catch (e) { return null; }
}
function audio() { return S.sound ? ctx() : null; }
function loadBufs() {
  if (bufsLoading) return; bufsLoading = true;
  for (const k of ['spill', 'coin', 'kaching', 'swoosh', 'fanfare', 'error', 'click', 'music'])
    fetch(`audio/${k}.${canOgg ? 'ogg' : 'mp3'}?v=${AUD_V}`).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(b => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).then(buf => { BUF[k] = buf; if (k === 'music') startMusic(); })
      .catch(() => { BUF[k] = null; }); // fall back to procedural sound
}
function play(k, vol, rate = 1, at = 0) {
  const a = audio(); if (!a || !BUF[k]) return false;
  const t = a.currentTime + at, s = a.createBufferSource(), g = a.createGain(); s.buffer = BUF[k]; s.playbackRate.value = rate; g.gain.value = vol;
  s.connect(g).connect(sfxBus); s.start(t); window.__sndlog.push({ k, t: performance.now() + at * 1000, rate, vol }); return true;
}
function startMusic() {
  if (!ac || !S.music || musicSrc || !BUF.music || ac.state !== 'running') return;
  const s = ac.createBufferSource(), t = ac.currentTime; s.buffer = BUF.music; s.loop = true; s.loopStart = MUSIC_LOOP.start; s.loopEnd = MUSIC_LOOP.start + MUSIC_LOOP.len;
  s.connect(musicBus); s.start(t + .05, MUSIC_LOOP.start); musicSrc = s; window.__sndlog.push({ k: 'music', t: performance.now() + 50 });
  musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(0, t); musicBus.gain.linearRampToValueAtTime(MUSIC_VOL, t + 2); // 2 s fade-in
}
function stopMusic() {
  if (!musicSrc) return; const s = musicSrc, t = ac.currentTime; musicSrc = null;
  musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t); musicBus.gain.linearRampToValueAtTime(0, t + .6); s.stop(t + .7);
}
function duck() { // dip the music under a coin burst, then ease back
  if (!ac || !musicSrc) return; const t = ac.currentTime, g = duckG.gain; window.__sndlog.push({ k: 'duck', t: performance.now() });
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(.45, t + .06); g.setTargetAtTime(1, t + .9, .35);
}
// Browsers block audio until a gesture: unlock on the first tap/click/key anywhere (a tap on a tile counts).
const unlockAudio = () => { ctx(); };
['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, unlockAudio, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else if (S.sound || S.music) ac.resume().then(startMusic, () => {}); });
function tone(f, d, type = 'square', vol = .06, at = 0, f2) {
  const a = audio(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + d);
  o.connect(g).connect(sfxBus); o.start(t); o.stop(t + d + .02);
}
function noise(d, vol = .12, at = 0, hp = 900) {
  const a = audio(); if (!a) return; const t = a.currentTime + at;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate * .5, a.sampleRate); const ch = noiseBuf.getChannelData(0); let last = 0; for (let i = 0; i < ch.length; i++) { if (i % 3 === 0) last = Math.random() * 2 - 1; ch[i] = last; } } // sample-and-hold = crunchy 8-bit noise
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); src.connect(f).connect(g).connect(sfxBus); src.start(t); src.stop(t + d + .02);
}
const SFX = { cut: [[220, .05, 'sawtooth'], [440, .06], [660, .08]], coin: [[988, .06], [1319, .14]], boss: [[523, .1], [659, .1], [784, .1], [1047, .3]], nope: [[160, .15, 'sawtooth']], tap: [[700, .03]] };
const SAMPLE = new Map([[SFX.tap, ['click', .35]], [SFX.cut, ['swoosh', .7]], [SFX.boss, ['fanfare', .5]], [SFX.nope, ['error', .4]], [SFX.coin, ['coin', .35]]]);
function beep(seq) { if (!S.sound) return; const sm = SAMPLE.get(seq); if (sm && play(sm[0], sm[1])) return; let at = 0; for (const [f, d, type] of seq) { tone(f, d, type || 'square', .06, at); at += d * .8; } }
function burstSfx(big) { duck(); if (play('spill', big ? .9 : .75)) return; noise(big ? .28 : .16, big ? .16 : .11); tone(big ? 520 : 680, big ? .2 : .12, 'square', .07, 0, 90); if (big) tone(260, .25, 'triangle', .08, .02, 60); }
// coin landing: a short clink per coin, pitch nudged upward; rate-limited so a swarm doesn't get noisy
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
let lastClink = 0, clinkStep = 0;
function clinkSfx(reset) {
  if (reset) { clinkStep = 0; return; }
  const now = performance.now(), slot = Math.max(now, lastClink + 48); if (slot - now > 260) return; lastClink = slot; // queue into 48ms slots; drop only if far behind
  const st = PENTA[Math.min(clinkStep++, 5)], at = (slot - now) / 1000;
  if (play('coin', .34, Math.pow(2, st / 48), at)) return; // real coin clink into the counter, nudged up a little per coin (max +3 semitones)
  const f = 1046.5 * Math.pow(2, PENTA[Math.min(clinkStep - 1, PENTA.length - 1)] / 12);
  tone(f, .05, 'square', .045, at); tone(f * 1.5, .09, 'square', .03, at + .035);
}
function kachingSfx() { if (!play('kaching', .62, 1, .03)) { tone(1046.5, .08, 'square', .05, .04); tone(1568, .18, 'square', .04, .1); } }

// ---------- tree ----------
const vp = $('#viewport'), world = $('#world'), nodesEl = $('#nodes'), svg = $('#vines');
const W = LAYOUT.W, H = LAYOUT.H, pos = n => LAYOUT.pos[n.id];
world.style.width = W + 'px'; world.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; };
function bez(p0, p1, p2, p3, t) { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; }
function vineGeom(a, b) {
  const p0 = pos(a), p3 = pos(b), dx = p3[0] - p0[0], dy = p3[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const h = hash(a.id + b.id), w1 = ((h % 5) - 2) * L * .045, w2 = (((h >> 3) % 5) - 2) * L * .045;
  const p1 = [p0[0] + dx * .33 + nx * w1, p0[1] + dy * .33 + ny * w1], p2 = [p0[0] + dx * .66 - nx * w2, p0[1] + dy * .66 - ny * w2];
  let thorns = ''; const k = Math.max(3, Math.floor(L / 22));
  for (let i = 1; i < k; i++) { const t = i / k, [x, y] = bez(p0, p1, p2, p3, t), [x2, y2] = bez(p0, p1, p2, p3, Math.min(1, t + .01)); const tx = x2 - x, ty = y2 - y, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl, side = i % 2 ? 1 : -1, px = -uy * side, py = ux * side;
    thorns += `M${(x - ux * 3).toFixed(1)},${(y - uy * 3).toFixed(1)}L${(x + px * 12 + ux * 3).toFixed(1)},${(y + py * 12 + uy * 3).toFixed(1)}L${(x + ux * 3).toFixed(1)},${(y + uy * 3).toFixed(1)}Z`; }
  return { d: `M${p0[0]},${p0[1]} C${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0]},${p3[1]}`, thorns };
}
const GEOM = {}; for (const n of SKILLS) for (const r of deps(n)) GEOM[r + '>' + n.id] = vineGeom(byId[r], n);
function clumpSVG() {
  let pts = ''; const N = 18; for (let i = 0; i < N * 2; i++) { const a = i / (N * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 26 + (i * 7 % 5) : 46 + (i * 13 % 7); pts += `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)} `; }
  let inner = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 18 : 32; inner += `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)} `; }
  return `<svg class="clump" viewBox="0 0 100 100"><polygon points="${pts}" fill="#3f7a2c" stroke="#101410" stroke-width="4" stroke-linejoin="round"/><polygon points="${inner}" fill="#5f9a3a" stroke="#2a5a1f" stroke-width="2"/><circle cx="50" cy="50" r="20" fill="#2a3a22" stroke="var(--bc)" stroke-width="4"/></svg>`;
}
const CLUMP = clumpSVG();
const ICONS = {}; SKILLS.forEach(n => ICONS[n.id] = iconSVG(n.ic, n.tier === 'root' ? 32 : 28));
let sel = null;
function renderTree() {
  const B = {}; let thorns = '';
  const add = (k, d) => B[k] = (B[k] || '') + d;
  for (const n of SKILLS) for (const r of deps(n)) {
    const g = GEOM[r + '>' + n.id], kind = n.all.includes(r) ? 'hard' : 'any', prim = LAYOUT.parent[n.id] === r ? 'p' : 's';
    const st = S.done[n.id] && S.done[r] ? 'lit' : S.done[r] ? 'live' : 'dim';
    add(`${kind}|${prim}|${st}`, g.d); if (kind === 'hard' && (prim === 'p' || st !== 'dim')) thorns += g.thorns;
  }
  const C = { hard: { dim: '#3c5a2c', live: '#6fae45', lit: '#a8ec5a' }, any: { dim: '#5a5a32', live: '#a4a442', lit: '#d8cf5a' } };
  const Wd = { p: [12, 6], s: [7, 3] };
  let o = '';
  for (const prim of ['s', 'p']) for (const st of ['dim', 'live', 'lit']) for (const kind of ['any', 'hard']) {
    const d = B[`${kind}|${prim}|${st}`]; if (!d) continue;
    o += `<path class="v-out" d="${d}" stroke-width="${Wd[prim][0]}"${prim === 's' ? (st === 'dim' ? ' opacity=".3"' : ' opacity=".6"') : ''}/><path class="v-in" d="${d}" stroke="${C[kind][st]}" stroke-width="${Wd[prim][1]}"${prim === 's' ? (st === 'dim' ? ' opacity=".35"' : ' opacity=".6"') : ''}/>`;
  }
  o += `<path class="thorn" d="${thorns}"/>`;
  svg.innerHTML = o;
  const q = ($('#search').value || '').toLowerCase().trim();
  const nb = nextBest(), hint = nb && nb.n.id;
  nodesEl.innerHTML = SKILLS.map(n => {
    const st = status(n), [x, y] = pos(n), b = border(n, st);
    const hit = (!q || (n.name + ' ' + n.what + ' ' + n.blurb + ' ' + n.steps.join(' ')).toLowerCase().includes(q)) && S.filter.includes(n.arc);
    const grass = st === 'avail' && n.tier !== 'root' ? '<div class="grassy"></div>' : '';
    const shape = n.tier === 'root' ? CLUMP : '<div class="dia"></div>';
    const cost = st === 'avail' && n.cost ? `<div class="cost">${COIN}${n.cost}</div>` : '';
    return `<div class="node ${n.tier} ${st} ${b}${hit ? '' : ' dimmed'}${sel === n.id ? ' sel' : ''}${hint === n.id ? ' hint' : ''}" data-id="${n.id}" style="left:${x}px;top:${y}px" aria-label="${esc(n.name + ': ' + n.what)}">${shape}${ICONS[n.id]}${grass}<div class="nm">${n.name.replace(/^(ROOT|GATE): /, '')}</div>${cost}</div>`;
  }).join('');
  $('#next').textContent = nb ? `▶ NEXT · ${nb.verb}: ${nb.n.name.replace(/^(ROOT|GATE): /, '')}` : (Object.keys(S.done).length === SKILLS.length ? '🏆 FIELD CLEARED' : '');
  renderHud();
}
const STLABEL = { done: '✔ Cleared', unlocked: 'Started: do the goal, then tap "I did it"', avail: 'Ready to unlock', locked: 'Locked', forked: 'You picked the other path' };
nodesEl.addEventListener('mouseover', e => { const el = e.target.closest('.node'); if (!el || isMobile()) return; const n = byId[el.dataset.id], st = status(n);
  const t = $('#tip'); const miss = st === 'locked' ? missing(n) : [];
  t.innerHTML = `<b>${esc(n.name)}</b>${esc(n.what)}<span class="st">${STLABEL[st]}${st === 'avail' ? ` · costs ${COIN}${n.cost}` : ''}${miss.length ? '<br>Needs: ' + esc(miss.join('; ')) : ''}</span>`;
  const r = el.getBoundingClientRect(), v = vp.getBoundingClientRect(); t.classList.remove('hidden');
  let lx = r.right - v.left + 8, ly = r.top - v.top; if (lx + 280 > v.width) lx = r.left - v.left - 290; t.style.left = Math.max(4, lx) + 'px'; t.style.top = Math.max(4, Math.min(ly, v.height - t.offsetHeight - 4)) + 'px'; });
nodesEl.addEventListener('mouseout', e => { if (e.target.closest('.node')) $('#tip').classList.add('hidden'); });

// ---------- HUD ----------
let shownGold = S.gold, coinRun = null;
function effRunway() { let r = Number(S.runway) || 0; for (const e of activeFx()) r += e.runway || 0; if (activeFx().some(e => e.drainX)) r = r / 2; return Math.round(r * 10) / 10; }
function gateProgress() { const g = byId[LAUNCH_GATE]; const parts = [...g.all.map(r => [r]), ...g.any]; return { done: parts.filter(p => p.some(r => S.done[r])).length, total: parts.length, parts }; }
function renderHud() {
  const gEl = $('#gold');
  if (coinRun) { /* coins in flight tick the counter as they land */ }
  else if (shownGold !== S.gold) { const from = shownGold, to = S.gold, t0 = performance.now(); shownGold = to; const pill = $('#coinpill'); pill.classList.remove('pop'); void pill.offsetWidth; pill.classList.add('pop');
    const step = t => { const k = Math.min(1, (t - t0) / 700); gEl.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  } else gEl.textContent = S.gold;
  const r = effRunway(), safe = activeFx().some(e => e.noDrain), bar = $('#o2bar');
  bar.style.width = (safe ? 100 : Math.min(100, r / 24 * 100)) + '%';
  bar.parentElement.classList.toggle('low', !safe && r < 6);
  bar.parentElement.parentElement.title = safe ? 'Runway is safe: it no longer runs out' : `${r} months of runway${r < 6 ? '. LOW: take client work, cut costs, or raise prices' : ''}. Tap the number to edit.`;
  const gp = gateProgress(); $('#readybar').style.width = (gp.done / gp.total * 100) + '%'; $('#readypct').textContent = S.done[LAUNCH_GATE] ? 'GO!' : `${gp.done}/${gp.total}`;
  const used = S.swings.active.length, mx = maxSwings();
  $('#swings').textContent = '■'.repeat(Math.min(used, mx)) + '□'.repeat(Math.max(0, mx - used));
  $('#depth').textContent = Object.keys(S.done).length + '/' + SKILLS.length;
  $('#btn-sound').textContent = S.sound ? '🔊' : '🔇';
  const mb = $('#btn-music'); mb.classList.toggle('off', !S.music); mb.title = S.music ? 'Music: on (tap to turn off)' : 'Music: off (tap to turn on)'; mb.setAttribute('aria-pressed', S.music ? 'true' : 'false');
  $('#btn-theme').textContent = S.theme === 'classic' ? '☾' : '☀';
}

// ---------- panel ----------
const list = (a, tag = 'ul') => a && a.length ? `<${tag}>${a.map(x => `<li>${x}</li>`).join('')}</${tag}>` : '';
function sheetOpen(el) { el.classList.remove('hidden'); el.scrollTop = 0; }
const reqTag = r => `<span class="tag req ${S.done[r] ? 'y' : 'n'}" data-open="${r}">${S.done[r] ? '✔' : '✖'} ${byId[r].name}</span>`;
function openNode(id) {
  const n = byId[id]; if (!n) return; sel = id; $('#tip').classList.add('hidden');
  const st = status(n), arc = ARCS[n.arc], rw = reward(n), fx = EFFECTS[id];
  const kids = SKILLS.filter(k => deps(k).includes(id)).map(k => `<span class="tag req" data-open="${k.id}">${k.name}</span>`).join('');
  const rv = rivals(n).map(o => o.name).join(', ');
  const swinging = S.swings.active.includes(id);
  const credit = `<button class="ghost" data-a="credit">I'VE ALREADY DONE THIS · +${COIN}${rw}</button>`;
  let act = '';
  if (st === 'avail' && !n.cost) act = `<button class="gold" data-a="done">✔ I DID IT · +${COIN}${rw}</button><span class="hint-line">Milestones are free to claim once you've really done them.</span>`;
  else if (st === 'avail') act = `<button class="gold" data-a="unlock">UNLOCK · ${COIN}${n.cost}</button>${credit}${S.gold < n.cost ? `<span class="hint-line">You have ${COIN}${S.gold}. Finish a chapter you've started to earn more.</span>` : ''}`;
  if (st === 'unlocked') act = `<button class="gold" data-a="done">✔ I DID IT · +${COIN}${rw}</button><button data-a="swing">${swinging ? 'REMOVE FROM THIS WEEK' : '+ ADD TO THIS WEEK'}</button>`;
  if (st === 'done') act = `<span class="tag req y">✔ CLEARED${S.credit[id] ? ' (credited)' : ''}</span><button class="ghost" data-a="undo">UNDO</button>`;
  if (n.excl && (st === 'unlocked' || st === 'done')) act += `<button class="danger" data-a="replant">CHANGE MY MIND</button>`;
  if (st === 'locked') act = `<span class="hint-line">🔒 Locked. Needs ${esc(missing(n).join('; '))}.</span>${credit}`;
  if (st === 'forked') act = `<span class="hint-line">You picked the other path (${rv}).</span><button data-a="switch">SWITCH TO THIS PATH</button>`;
  const reqHtml = (n.all.length ? `<div class="reqrow"><span class="lab">NEEDS ALL OF</span>${n.all.map(reqTag).join('')}</div>` : '') +
    n.any.map(g => `<div class="reqrow"><span class="lab">PLUS ANY ONE OF</span>${g.map(reqTag).join('')}</div>`).join('') || '<span class="empty">Nothing. This is where you start.</span>';
  $('#panel-body').innerHTML = `
    <span class="tag" style="background:${arc.color}">${arc.name}</span>${n.tier === 'root' ? '<span class="tag" style="background:#ffe9a8">MILESTONE</span>' : `<span class="tag">${n.tier.toUpperCase()}</span>`}${id === LAUNCH_GATE ? '<span class="tag" style="background:#ffe9a8">LAUNCH GATE</span>' : ''}${n.excl ? `<span class="tag" style="background:#f0dcff">PICK ONE · or ${rv}</span>` : ''}
    <h2>${iconSVG(n.ic, 36)}<span>${n.name}</span></h2>
    <div class="what"><b>WHAT THIS IS</b>${n.what}</div>
    <div class="goal"><b>TO CLEAR THIS:</b>${n.goal}</div>
    <div class="actions">${act}</div>
    ${n.week ? `<h3>START THIS WEEK</h3><p>${n.week}</p>` : ''}
    <h3>WHY IT MATTERS</h3><p>${n.why}</p>
    <h3>STEPS</h3>${list(n.steps, 'ol')}
    ${n.template ? `<h3>TEMPLATE</h3><div class="tpl">${n.template}</div>` : ''}
    <h3>COMMON MISTAKES</h3><div class="pit">${list(n.pitfalls)}</div>
    ${n.mods && n.mods.length ? `<h3>BONUSES</h3>${fx ? `<div class="buff fx">⚙ <b>In-game:</b> ${fx.txt}</div>` : ''}${n.mods.map(m => `<div class="buff perk">📜 ${m}${fx ? '' : ' <small>(real-world benefit, not simulated)</small>'}</div>`).join('')}` : ''}
    <h3>REQUIREMENTS</h3><div class="reqs">${reqHtml}</div>
    ${kids ? `<h3>LEADS TO</h3><div>${kids}</div>` : ''}`;
  sheetOpen($('#panel')); $('#drawer').classList.add('hidden');
  renderTree();
}
function fxAt(n) { const el = nodesEl.querySelector(`[data-id="${n.id}"]`); if (!el) return [innerWidth / 2, innerHeight / 2]; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
function clear(n, credited) {
  const rw = reward(n) + ((EFFECTS[n.id] || {}).bonus || 0); const before = new Set(SKILLS.filter(k => status(k) === 'avail').map(k => k.id));
  finishCoinRun(); coinRun = { from: S.gold, to: S.gold + rw, n: 0, landed: 0 };
  S.done[n.id] = 1; S.unlocked[n.id] = 1; if (credited) S.credit[n.id] = 1; S.gold += rw; S.swings.active = S.swings.active.filter(x => x !== n.id); save(); renderTree();
  const [x, y] = fxAt(n); cutFx(x, y); coinFx(x, y, rw, n.tier === 'root'); bumpNode(n);
  const fresh = SKILLS.filter(k => status(k) === 'avail' && !before.has(k.id));
  fresh.forEach((k, i) => setTimeout(() => { const [a, b] = fxAt(k); ringFx(a, b); }, 350 + i * 90));
  if (n.tier === 'root') { shake(); beep(SFX.boss); setTimeout(() => bossModal(n, rw, fresh), 450); }
  else { coinRun.msg = `+${COIN}${rw}${fresh.length ? ` · ${fresh.length} new chapter${fresh.length > 1 ? 's' : ''} ready` : ''}`; } // shown once the last coin lands, so the toast never covers the meter mid-flight
}
$('#panel').addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) { beep(SFX.tap); openNode(o.dataset.open); focusNode(byId[o.dataset.open]); return; }
  const b = e.target.closest('[data-a]'); if (!b || !sel) return; const n = byId[sel], a = b.dataset.a;
  // phone: the sheet covers most of the screen, so close it and bring the tile to the middle before the coins burst
  if (isMobile() && (a === 'done' || (a === 'credit' && !forkedAway(n)))) { $('#panel').classList.add('hidden'); sel = null; focusNode(n); setTimeout(() => clear(n, a === 'credit'), reduceMotion() ? 0 : 380); return; }
  if (a !== 'done' && a !== 'credit' && a !== 'swing') finishCoinRun();
  if (a === 'unlock') {
    if (S.gold < n.cost) { beep(SFX.nope); shake(); return toast(`Need ${COIN}${n.cost - S.gold} more gold`); }
    S.gold -= n.cost; S.unlocked[n.id] = 1; save(); renderTree(); const [x, y] = fxAt(n); cutFx(x, y); bumpNode(n); beep(SFX.cut); toast('✂ Unlocked! Now do the goal.');
  }
  if (a === 'done') clear(n, false);
  if (a === 'credit') { if (forkedAway(n)) return toast('You picked the other path. Switch first.'); clear(n, true); }
  if (a === 'undo') { delete S.done[n.id]; delete S.credit[n.id]; S.gold = Math.max(0, S.gold - reward(n)); }
  if (a === 'swing') { const i = S.swings.active.indexOf(n.id); if (i >= 0) S.swings.active.splice(i, 1); else if (S.swings.active.length >= maxSwings()) { beep(SFX.nope); return toast('This week is full. Slots refill on Monday.'); } else { S.swings.active.push(n.id); beep(SFX.tap); toast('Added to This Week'); } }
  if (a === 'replant') { if (S.done[n.id]) S.gold = Math.max(0, S.gold - reward(n)); if (!S.credit[n.id]) S.gold += n.cost; delete S.done[n.id]; delete S.unlocked[n.id]; delete S.credit[n.id]; toast('Choice undone: pick again'); }
  if (a === 'switch') { for (const r of rivals(n)) { if (S.done[r.id]) S.gold = Math.max(0, S.gold - reward(r)); if (S.unlocked[r.id] && !S.credit[r.id]) S.gold += r.cost; delete S.done[r.id]; delete S.unlocked[r.id]; delete S.credit[r.id]; } toast('Switched. This path is open now.'); }
  save(); openNode(n.id);
});
$('#close').onclick = () => { $('#panel').classList.add('hidden'); sel = null; renderTree(); };
$('#dclose').onclick = () => $('#drawer').classList.add('hidden');

// ---------- drawers ----------
function drawer(html) { $('#drawer-body').innerHTML = html; sheetOpen($('#drawer')); $('#panel').classList.add('hidden'); }
$('#btn-buffs').onclick = () => {
  const fx = activeFx(), perks = SKILLS.filter(n => S.done[n.id] && n.mods && n.mods.length && !EFFECTS[n.id]);
  const arcs = Object.keys(ARCS).map(k => `${ARCS[k].name}: ×${goldMul({ arc: k }).toFixed(2)}`).join('<br>');
  const gp = gateProgress();
  drawer(`<h2>BONUSES</h2>
   <h3>GOLD MULTIPLIERS RIGHT NOW</h3><div class="mult">${arcs}</div>
   <h3>IN-GAME EFFECTS</h3>${fx.length ? fx.map(e => `<div class="buff fx">⚙ ${e.txt}<br><small>from ${byId[e.id].name}</small></div>`).join('') : '<p class="empty">None yet. First Swing gives you an extra weekly slot, and Payments Live makes all gold worth 1.25×.</p>'}
   <h3>REAL-WORLD BENEFITS (NOT SIMULATED)</h3>${perks.length ? perks.map(n => n.mods.map(m => `<div class="buff perk">📜 ${m}<br><small>from ${n.name}</small></div>`).join('')).join('') : '<p class="empty">The real-life advantages you earn from cleared chapters will show up here.</p>'}
   <h3>LAUNCH ESSENTIALS (${gp.done}/${gp.total})</h3>${list(gp.parts.map(p => `<span class="row" data-open="${p[0]}">${p.some(r => S.done[r]) ? '✔' : '□'} ${p.map(r => byId[r].name).join(' <i>or</i> ')}</span>`))}`);
};
$('#btn-week').onclick = () => {
  const row = n => `<div class="buff fx row" data-open="${n.id}"><b>${n.name}</b><br>${n.week || n.goal}</div>`;
  const act = S.swings.active.map(id => byId[id]), open = SKILLS.filter(n => status(n) === 'unlocked' && !S.swings.active.includes(n.id)), av = SKILLS.filter(n => status(n) === 'avail').slice(0, 6);
  drawer(`<h2>THIS WEEK</h2><p>Focus on up to ${maxSwings()} chapters at a time. Slots refill every Monday.</p>
   <h3>FOCUSING ON (${act.length}/${maxSwings()})</h3>${act.length ? act.map(row).join('') : '<p class="empty">Nothing yet. Open a chapter and tap + ADD TO THIS WEEK.</p>'}
   <h3>STARTED</h3>${open.length ? open.map(row).join('') : '<p class="empty">No chapters started.</p>'}
   <h3>READY TO UNLOCK</h3>${av.length ? av.map(row).join('') : '<p class="empty">Clear more chapters to open new ones.</p>'}`);
};
$('#drawer').addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t) { openNode(t.dataset.open); focusNode(byId[t.dataset.open]); } });
$('#btn-reset').onclick = () => { if (confirm('Start over? This clears all your progress.')) { finishCoinRun(); const keep = { sound: S.sound, music: S.music, theme: S.theme }; S = Object.assign(fresh(), keep, { onboarded: true }); shownGold = 0; save(); sel = null; $('#panel').classList.add('hidden'); $('#drawer').classList.add('hidden'); $('#search').value = ''; $('#runway').value = S.runway; renderFilters(); renderTree(); fit(); toast('Fresh field. Good luck!'); } };
$('#btn-sound').onclick = () => { S.sound = !S.sound; save(); renderHud(); beep(SFX.coin); };
$('#btn-music').onclick = () => { S.music = !S.music; save(); renderHud(); if (S.music) { const a = ctx(); if (a) a.resume().then(startMusic, () => {}); toast('♪ Music on'); } else { stopMusic(); toast('Music off'); } };
$('#btn-theme').onclick = () => { S.theme = S.theme === 'classic' ? 'meadow' : 'classic'; document.body.className = S.theme; save(); renderHud(); setTop(); toast(S.theme === 'classic' ? 'Classic (dark) theme' : 'Meadow (day) theme'); };
$('#btn-menu').onclick = () => { $('#top').classList.toggle('open'); setTop(); };
$('#btn-help').onclick = () => intro(0);
$('#next').onclick = () => { const nb = nextBest(); if (nb) { openNode(nb.n.id); focusNode(nb.n); } };
$('#runway').value = S.runway;
$('#runway').oninput = e => { S.runway = Math.max(0, Number(e.target.value) || 0); save(); renderHud(); };
$('#search').oninput = () => { renderTree(); const q = $('#search').value.trim().toLowerCase(); if (q) { const m = SKILLS.find(n => (n.name + ' ' + n.what).toLowerCase().includes(q)); if (m) focusNode(m); } };
function renderFilters() { $('#arcfilters').innerHTML = Object.entries(ARCS).map(([k, a]) => `<span class="chip ${S.filter.includes(k) ? 'on' : ''}" data-k="${k}"><i style="background:${a.color}"></i>${a.name}</span>`).join(''); }
$('#arcfilters').onclick = e => { const c = e.target.closest('[data-k]'); if (!c) return; const k = c.dataset.k; S.filter = S.filter.includes(k) ? S.filter.filter(x => x !== k) : [...S.filter, k]; save(); renderFilters(); renderTree(); };

// ---------- pan / pinch / wheel ----------
let tx = 0, ty = 0, sc = 1;
const apply = () => { world.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`; };
const clampS = s => Math.min(2, Math.max(.2, s));
function fit() { const r = vp.getBoundingClientRect(); const pad = isMobile() ? 40 : 70; sc = clampS(Math.min((r.width - 20) / W, (r.height - pad * 2) / H)); tx = (r.width - W * sc) / 2; ty = (r.height - H * sc) / 2 + (isMobile() ? 6 : 10); apply(); }
function home() { const nb = nextBest(); sc = isMobile() ? .62 : .85; focusNode(nb ? nb.n : byId['founder-mode']); world.style.transition = ''; }
function focusNode(n, zoom) { const r = vp.getBoundingClientRect(); if (zoom) sc = clampS(zoom); const [x, y] = pos(n); const panelOpen = !$('#panel').classList.contains('hidden'); const fy = isMobile() && panelOpen ? Math.max(60, (r.height - $('#panel').offsetHeight) / 2 + 20) : r.height / 2; const fx = !isMobile() && panelOpen ? (r.width - 540) / 2 : r.width / 2; tx = fx - x * sc; ty = fy - y * sc; world.style.transition = 'transform .35s ease-out'; apply(); setTimeout(() => world.style.transition = '', 360); }
const ptrs = new Map(); let pan = null, pinch = null, moved = false;
vp.addEventListener('pointerdown', e => {
  if (e.target.closest('#legend,#next')) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { vp.setPointerCapture(e.pointerId); } catch (_) {}
  if (ptrs.size === 1) { pan = { x: e.clientX - tx, y: e.clientY - ty, sx: e.clientX, sy: e.clientY, target: e.target }; moved = false; }
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: sc, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx, ty }; moved = true; }
});
vp.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect(); const ns = clampS(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d); const mx = pinch.mx - r.left, my = pinch.my - r.top; tx = mx - (mx - pinch.tx) * ns / pinch.s; ty = my - (my - pinch.ty) * ns / pinch.s; sc = ns; apply(); return; }
  if (!pan) return;
  if (Math.abs(e.clientX - pan.sx) + Math.abs(e.clientY - pan.sy) > 8) { moved = true; vp.classList.add('drag'); $('#tip').classList.add('hidden'); }
  if (moved) { tx = e.clientX - pan.x; ty = e.clientY - pan.y; apply(); }
});
function ptrEnd(e) {
  if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 1) { const [p] = [...ptrs.values()]; pan = { x: p.x - tx, y: p.y - ty, sx: p.x, sy: p.y }; return; }
  if (pan && !moved) { const el = pan.target && pan.target.closest && pan.target.closest('.node'); if (el) { beep(SFX.tap); openNode(el.dataset.id); focusNode(byId[el.dataset.id]); } }
  pan = null; vp.classList.remove('drag');
}
vp.addEventListener('pointerup', ptrEnd); vp.addEventListener('pointercancel', ptrEnd);
vp.addEventListener('wheel', e => { e.preventDefault(); const r = vp.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; const ns = clampS(sc * (e.deltaY < 0 ? 1.12 : .89)); tx = mx - (mx - tx) * ns / sc; ty = my - (my - ty) * ns / sc; sc = ns; apply(); }, { passive: false });
$('#btn-fit').onclick = fit;
function setTop() { document.documentElement.style.setProperty('--toph', $('#top').offsetHeight + 'px'); }
window.addEventListener('resize', setTop); if (window.ResizeObserver) new ResizeObserver(setTop).observe($('#top')); if (document.fonts) document.fonts.ready.then(setTop);

// ---------- juice ----------
const layer = $('#fxlayer');
function toast(t) { const el = $('#toast'); el.innerHTML = t; el.classList.toggle('low', isMobile() && $('#panel').classList.contains('hidden')); el.style.left = !isMobile() && !$('#panel').classList.contains('hidden') ? Math.max(200, (innerWidth - 540) / 2) + 'px' : ''; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2200); }
function shake() { vp.classList.remove('shake'); void vp.offsetWidth; vp.classList.add('shake'); if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {} }
function bumpNode(n) { const el = nodesEl.querySelector(`[data-id="${n.id}"]`); if (el) { el.classList.add('cutnow'); setTimeout(() => el.classList.remove('cutnow'), 500); } }
function spawn(cls, x, y, txt) { const b = document.createElement('div'); b.className = cls; b.style.left = x + 'px'; b.style.top = y + 'px'; if (txt) b.innerHTML = txt; layer.appendChild(b); return b; }
function cutFx(x, y) {
  for (let i = 0, nb = reduceMotion() ? 0 : 28; i < nb; i++) { const b = spawn('blade', x, y); const a = -Math.PI * Math.random(), d = 50 + Math.random() * 90;
    b.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 1, offset: .6 }, { transform: `translate(${Math.cos(a) * d * 1.2}px,${Math.sin(a) * d + 80}px) rotate(${(Math.random() - .5) * 900}deg)`, opacity: 0 }], { duration: 800 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.4,1)' }).onfinish = () => b.remove(); }
  const s = spawn('plus', x - 24, y - 24, iconSVG('scythe', 48)); if (reduceMotion()) { s.remove(); return; } s.animate([{ transform: 'rotate(-80deg) scale(.8)', opacity: 1 }, { transform: 'rotate(60deg) scale(1.3)', opacity: 1, offset: .6 }, { transform: 'rotate(80deg) scale(1.3)', opacity: 0 }], { duration: 480, easing: 'ease-in' }).onfinish = () => s.remove();
}
// Coins: explode outward (spin, upward bias) -> drag makes them hang -> attraction pulls them into the meter, accelerating.
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COINSVG = '<svg viewBox="0 0 8 8" shape-rendering="crispEdges"><path fill="#000" d="M2 0h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z"/><path fill="#c48a00" d="M2 1h4v1h1v4h-1v1h-4v-1h-1v-4h1z"/><path fill="#ffd23a" d="M2 1h3v1h1v3h-1v1h-3v-1h-1v-3h1z"/><path fill="#fff3a0" d="M2 2h1v2h-1z"/><path fill="#c48a00" d="M4 2h1v3h-1z"/></svg>';
function finishCoinRun() { if (!coinRun) return; if (coinRun.msg) toast(coinRun.msg); shownGold = coinRun.to; coinRun = null; $('#gold').textContent = S.gold; }
function coinTarget() { const g = $('#coinpill').getBoundingClientRect(), c = $('#coinpill .pc').getBoundingClientRect(); return [c.width ? c.left + c.width / 2 : g.left + 20, (c.height ? c.top + c.height / 2 : g.top + g.height / 2)]; }
function coinLand(run) {
  if (run !== coinRun) return; run.landed++;
  const v = run.landed >= run.n ? run.to : Math.round(run.from + (run.to - run.from) * run.landed / run.n);
  $('#gold').textContent = v;
  const pill = $('#coinpill'); pill.classList.remove('hit'); void pill.offsetWidth; pill.classList.add('hit');
  clinkSfx();
  if (run.landed >= run.n) { kachingSfx(); if (run.msg) setTimeout(() => toast(run.msg), 250); shownGold = run.to; coinRun = null; pill.classList.remove('pop'); void pill.offsetWidth; pill.classList.add('pop'); renderHud(); }
}
function coinFx(x, y, amt, big) {
  const run = coinRun || { from: S.gold - amt, to: S.gold, n: 0, landed: 0 }; coinRun = run;
  const N = reduceMotion() ? 5 : Math.round(Math.min(big ? 20 : 14, (big ? 12 : 8) + amt / 25));
  run.n = N; clinkSfx(true); burstSfx(big);
  const p = spawn('plus', x - 30, y - 50, `+${amt}`); p.animate([{ transform: 'translateY(0) scale(.6)', opacity: 1 }, { transform: 'translateY(-50px) scale(1.5)', opacity: 1, offset: .5 }, { transform: 'translateY(-80px) scale(1.2)', opacity: 0 }], { duration: 1100 }).onfinish = () => p.remove();
  setTimeout(() => { if (coinRun === run) { finishCoinRun(); renderHud(); } }, 4000); // safety net (e.g. tab hidden, rAF paused)
  if (reduceMotion()) { // simple version: no explosion, coins glide straight to the meter
    const [gx, gy] = coinTarget();
    for (let i = 0; i < N; i++) { const c = spawn('coinfx', x - 9, y - 9, COINSVG);
      c.animate([{ transform: 'translate(0,0)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translate(${gx - x}px,${gy - y}px)`, opacity: 1 }], { duration: 520, delay: i * 90, easing: 'ease-in', fill: 'backwards' }).onfinish = () => { c.remove(); coinLand(run); }; }
    return;
  }
  const coins = [];
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.7, sp = (big ? 700 : 540) + Math.random() * (big ? 600 : 420); // mostly upward, any direction
    const el = spawn('coinfx', 0, 0, COINSVG);
    coins.push({ el, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, spin: Math.random() * 6, sv: (Math.random() < .5 ? -1 : 1) * (10 + Math.random() * 10), sc: .7 + Math.random() * .5, hold: .42 + i * .035 + Math.random() * .08, t: 0, done: false });
  }
  let last = performance.now();
  const step = now => {
    const dt = Math.min(.033, (now - last) / 1000); last = now; const [gx, gy] = coinTarget(); let alive = 0;
    for (const c of coins) { if (c.done) continue; alive++; c.t += dt;
      if (c.t < c.hold) { // burst + drag: fast out, then decelerate and hang in the air with a little float down
        const k = Math.exp(-5.8 * dt); c.vx *= k; c.vy = c.vy * k + 260 * dt;
      } else { // homing: attraction grows over time; steer velocity toward the meter so coins don't orbit
        const dx = gx - c.x, dy = gy - c.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, ht = c.t - c.hold;
        const A = 2600 + 16000 * ht * ht; c.vx += ux * A * dt; c.vy += uy * A * dt;
        const spd = Math.hypot(c.vx, c.vy), st = Math.min(1, 7 * dt); c.vx += (ux * spd - c.vx) * st; c.vy += (uy * spd - c.vy) * st;
        if (d < 18 || (c.vx * dx + c.vy * dy < 0 && d < 60) || ht > 1.6) { c.done = true; c.el.remove(); coinLand(run); continue; }
        c.sc = Math.max(.55, c.sc - dt * .5);
      }
      c.x += c.vx * dt; c.y += c.vy * dt; c.spin += c.sv * dt;
      c.el.style.transform = `translate3d(${(c.x - 10).toFixed(1)}px,${(c.y - 10).toFixed(1)}px,0) scale(${(Math.cos(c.spin) * c.sc).toFixed(3)},${c.sc.toFixed(3)})`;
    }
    if (alive) requestAnimationFrame(step);
  };
  coins.forEach(c => c.el.style.transform = `translate3d(${x - 9}px,${y - 9}px,0) scale(.3)`);
  requestAnimationFrame(step);
}
function ringFx(x, y) { const r = spawn('ring', x, y); r.animate([{ transform: 'rotate(45deg) scale(.5)', opacity: 1 }, { transform: 'rotate(45deg) scale(4)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => r.remove(); }
function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="card">${html}</div>`; m.classList.remove('hidden'); }
function closeModal() { clearTimeout(intro._t); $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; const v = b.dataset.m;
  if (v === 'close') { S.onboarded = true; save(); closeModal(); }
  else if (v.startsWith('ob')) intro(+v.slice(2));
  else if (v.startsWith('go:')) { closeModal(); openNode(v.slice(3)); focusNode(byId[v.slice(3)]); } });
function bossModal(n, rw, fresh) {
  modal(`<div class="boss"><div class="big">${iconSVG(n.ic, 64)}</div><h2>${n.id === LAUNCH_GATE ? 'GATE OPEN!' : 'ROOT DESTROYED!'}</h2><p><b>${n.name.replace(/^(ROOT|GATE): /, '')}</b></p><p>+${COIN}${rw} gold${fresh.length ? `<br>${fresh.length} new chapter${fresh.length > 1 ? 's' : ''} ready` : ''}</p>${(n.mods || []).map(m => `<div class="buff fx">${m}</div>`).join('')}
   <div class="actions" style="justify-content:center">${fresh[0] ? `<button class="gold" data-m="go:${fresh[0].id}">▶ ${fresh[0].name}</button>` : ''}<button data-m="close">KEEP GOING</button></div></div>`);
}
// ---------- animated intro (3 steps, ~3s each, skippable) ----------
const D = (x, y, s, fill, stroke) => `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" transform="rotate(45 ${x} ${y})" fill="${fill}" stroke="${stroke}" stroke-width="5" class="border"/>`;
const ic = (k, x, y, s) => `<g transform="translate(${x - s / 2},${y - s / 2})">${iconSVG(k, s).replace('<svg', `<svg x="0" y="0"`)}</g>`;
function stage(i) {
  if (i === 0) { let g = ''; for (let k = 0; k < 14; k++) { const x = 128 + k * 3.4, h = 14 + (k * 7 % 9); g += `<rect class="gb" x="${x}" y="${118 - h}" width="4" height="${h + 6}" fill="${k % 2 ? '#6cd043' : '#3fa535'}" style="--dx:${(k - 7) * 9}px;--dy:${-40 - k * 4}px;--r:${(k - 7) * 40}deg"/>`; }
    return `<div class="stage s1"><svg viewBox="0 0 300 190">${D(150, 100, 52, '#5f9a3a', '#d8443a')}${ic('magnifier', 150, 100, 30)}${g}<g class="scy">${ic('scythe', 196, 70, 64)}</g></svg></div>`; }
  if (i === 1) { let c = ''; for (let k = 0; k < 7; k++) c += `<circle class="cn" cx="150" cy="105" r="8" fill="#ffd23a" stroke="#000" stroke-width="2" style="--ox:${(k - 3) * 22}px;--tx:-18px;--ty:-85px;animation-delay:${.5 + k * .12}s"/>`;
    return `<div class="stage s2"><div class="counter" id="ctr">0</div><svg viewBox="0 0 300 190">${D(150, 105, 52, '#9ad86a', '#ffd23a')}${ic('magnifier', 150, 105, 30)}<g class="tick" style="transform-origin:186px 135px"><rect x="172" y="122" width="34" height="22" fill="#3f8f2c" stroke="#000" stroke-width="3"/><text x="189" y="139" font-family="Press Start 2P" font-size="12" fill="#fff" text-anchor="middle">✔</text></g>${c}</svg></div>`; }
  return `<div class="stage s3"><svg viewBox="0 0 300 190"><path class="grow" d="M150,140 C120,110 90,100 70,60" fill="none" stroke="#101410" stroke-width="11"/><path class="grow" d="M150,140 C120,110 90,100 70,60" fill="none" stroke="#6fae45" stroke-width="6"/><path class="grow b" d="M150,140 C180,110 210,100 230,60" fill="none" stroke="#101410" stroke-width="11"/><path class="grow b" d="M150,140 C180,110 210,100 230,60" fill="none" stroke="#6fae45" stroke-width="6"/>${D(150, 145, 40, '#b6f070', '#ffd23a')}${ic('magnifier', 150, 145, 22)}<g class="newn a" style="transform-origin:70px 55px">${D(70, 55, 40, '#5f9a3a', '#ffd23a')}${ic('speech', 70, 55, 22)}</g><g class="newn b" style="transform-origin:230px 55px">${D(230, 55, 40, '#5f9a3a', '#ffd23a')}${ic('barchart', 230, 55, 22)}</g></svg></div>`;
}
const INTRO = [
  ['CUT THE GRASS', 'Each tile is a chapter of the playbook. Spend gold to unlock one and cut the grass away.'],
  ['DO IT, GET GOLD', 'Do the chapter\'s real-world goal, then tap <b>I DID IT</b>. You earn gold by doing the work, not by reading.'],
  ['NEW VINES GROW', 'Each chapter you clear opens new ones. A gold border means you can unlock it now. Not sure where to go? Tap <b>▶ NEXT</b>.'],
];
function intro(i) {
  clearTimeout(intro._t);
  if (i >= INTRO.length) { S.onboarded = true; save(); closeModal(); const nb = nextBest(); if (nb) { openNode(nb.n.id); focusNode(nb.n); } return; }
  const [t, p] = INTRO[i];
  modal(`${stage(i)}<h2>${t}</h2><p>${p}</p><div class="steps">${INTRO.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="actions" style="justify-content:center"><button class="ghost" data-m="close">SKIP</button><button class="gold" data-m="ob${i + 1}">${i === INTRO.length - 1 ? "LET'S GO ▶" : 'NEXT ▶'}</button></div>`);
  if (i === 1) { let v = 0; const el = $('#ctr'); const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); v = Math.min(20, v + 3); el.textContent = v; if (v >= 20) clearInterval(iv); }, 160); setTimeout(() => {}, 0); }
  if (i < INTRO.length - 1) intro._t = setTimeout(() => { if (!$('#modal').classList.contains('hidden')) intro(i + 1); }, 3300);
}

$('.title').innerHTML = iconSVG('scythe', 26) + '<span>OVERGROWTH<small>the solo founder skill tree</small></span>';
setTop(); renderFilters(); renderTree(); home();
if (!S.onboarded) intro(0);
window.__og = { get audio() { return ac ? ac.state : 'none'; }, get music() { return !!musicSrc; }, get bufs() { return Object.fromEntries(Object.entries(BUF).map(([k, v]) => [k, v ? +v.duration.toFixed(3) : null])); }, get coinRun() { return coinRun; }, get state() { return S; }, status: id => status(byId[id]), open: id => { openNode(id); focusNode(byId[id]); } };
})();
