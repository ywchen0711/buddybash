// 出氣布偶 / Buddy Bash: a rag doll in a room and a box of things to do to him. Verlet physics (points and sticks),
// a little spring that keeps him standing until he is knocked over, and coins for every bump that buy more tools.
import { TOOLS, HATS, SHIRTS, WORDS } from './items.js';
import { sfx, setMute, muted } from './sfx.js';

const $ = (s) => document.querySelector(s);
const cv = $('#cv'), g = cv.getContext('2d');
const KEY = 'buddy.save', GAME = 'buddybash';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const S = Object.assign({ coins: 60, own: ['hand', 'punch', 'tomato'], hats: ['none'], hat: 'none', shirt: 0, lang: /^zh/i.test(navigator.language || '') ? 'zh' : 'en', total: 0 }, load());
let cloud = null;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); cloud?.touch(GAME, KEY); } catch (e) { /* ignore */ } };
const T = () => WORDS[S.lang];
const tn = (x) => (S.lang === 'en' ? x.en : x.zh);
const rnd = (a, b) => a + Math.random() * (b - a), pickOf = (a) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------- the room
let W = 1000, H = 700, FLOOR = 640, scale = 1, room = null;
function resize() {
  const box = $('#stage').getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  H = 700; W = Math.round(Math.max(520, Math.min(1500, H * box.width / Math.max(1, box.height)))); FLOOR = H - 70;
  scale = box.width / W; cv.width = Math.round(box.width * dpr); cv.height = Math.round(box.height * dpr);
  cv.style.width = box.width + 'px'; cv.style.height = box.height + 'px';
  g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  room = paintRoom();
  if (doll) for (const p of doll.p) { p.x = Math.min(W - 30, p.x); p.px = Math.min(W - 30, p.px); }
}
function paintRoom() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const r = c.getContext('2d');
  const wall = r.createLinearGradient(0, 0, 0, FLOOR); wall.addColorStop(0, '#fbe7c6'); wall.addColorStop(1, '#f4d3a2'); r.fillStyle = wall; r.fillRect(0, 0, W, FLOOR);
  r.fillStyle = '#f7ddb4'; for (let x = 0; x < W; x += 56) r.fillRect(x, 0, 26, FLOOR);
  r.fillStyle = '#e9c48c'; for (let x = 13; x < W; x += 56) for (let y = 30; y < FLOOR; y += 70) { r.beginPath(); r.arc(x, y, 3, 0, 7); r.fill(); }
  // a window and a picture
  const wx = W * 0.14, wy = 110;
  r.fillStyle = '#8a5a34'; r.fillRect(wx - 10, wy - 10, 200, 170); const sky = r.createLinearGradient(0, wy, 0, wy + 150); sky.addColorStop(0, '#7cc7f5'); sky.addColorStop(1, '#cdeeff'); r.fillStyle = sky; r.fillRect(wx, wy, 180, 150);
  r.fillStyle = '#fff'; [[40, 40], [120, 70]].forEach(([x, y]) => { r.beginPath(); r.arc(wx + x, wy + y, 16, 0, 7); r.arc(wx + x + 18, wy + y + 4, 13, 0, 7); r.arc(wx + x - 16, wy + y + 5, 11, 0, 7); r.fill(); });
  r.fillStyle = '#8a5a34'; r.fillRect(wx + 86, wy, 8, 150); r.fillRect(wx, wy + 71, 180, 8);
  const px = W * 0.72; r.fillStyle = '#5a3a22'; r.fillRect(px, 140, 130, 100); r.fillStyle = '#9ed07a'; r.fillRect(px + 10, 150, 110, 80); r.fillStyle = '#5aa04a'; r.beginPath(); r.moveTo(px + 10, 230); r.lineTo(px + 50, 175); r.lineTo(px + 80, 210); r.lineTo(px + 100, 190); r.lineTo(px + 120, 230); r.fill(); r.fillStyle = '#ffd24a'; r.beginPath(); r.arc(px + 95, 170, 9, 0, 7); r.fill();
  // the floor
  r.fillStyle = '#b07a48'; r.fillRect(0, FLOOR, W, H - FLOOR);
  r.strokeStyle = '#8f5f35'; r.lineWidth = 2; for (let y = FLOOR + 22; y < H; y += 22) { r.beginPath(); r.moveTo(0, y); r.lineTo(W, y); r.stroke(); }
  for (let y = FLOOR, k = 0; y < H; y += 22, k++) for (let x = (k % 2) * 60; x < W; x += 120) { r.beginPath(); r.moveTo(x, y); r.lineTo(x, y + 22); r.stroke(); }
  r.fillStyle = '#7a4c28'; r.fillRect(0, FLOOR - 14, W, 14); r.fillStyle = '#00000018'; r.fillRect(0, FLOOR, W, 8);
  return c;
}

// ---------------------------------------------------------------- the doll
// points of the standing pose: x, y above the floor between the feet, radius, mass
const POSE = [[0, -178, 30, 2], [0, -140, 9, 1.5], [-24, -132, 10, 2], [24, -132, 10, 2], [-34, -98, 9, 1], [34, -98, 9, 1], [-38, -64, 10, 1], [38, -64, 10, 1],
  [-15, -76, 10, 2.5], [15, -76, 10, 2.5], [-17, -40, 10, 1.2], [17, -40, 10, 1.2], [-19, -8, 11, 1.3], [19, -8, 11, 1.3]];
const HEAD = 0, NECK = 1;
const STICKS = [[0, 1], [1, 2], [1, 3], [2, 3], [2, 8], [3, 9], [8, 9], [2, 9], [3, 8], [2, 4], [4, 6], [3, 5], [5, 7], [8, 10], [10, 12], [9, 11], [11, 13]];
const SOFT = [[0, 2, 0.25], [0, 3, 0.25]]; // keep the head roughly on top
const APART = [[2, 6], [3, 7], [8, 12], [9, 13], [0, 8], [0, 9], [6, 7], [12, 13]]; // limbs never fold flat
let doll = null;
function makeDoll(x) {
  const p = POSE.map(([dx, dy, r, m]) => ({ x: x + dx, y: FLOOR + dy, px: x + dx, py: FLOOR + dy, r, inv: 1 / m }));
  const d = (a, b) => Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y);
  return { p, sticks: STICKS.map(([a, b]) => [a, b, d(a, b)]), soft: SOFT.map(([a, b, k]) => [a, b, d(a, b), k]), apart: APART.map(([a, b]) => [a, b, d(a, b) * 0.55]),
    stand: 1, anchor: x, still: 0, face: 'calm', faceT: 0, dizzy: 0, soot: 0, frozen: 0, frozenD: null, shock: 0, say: '', sayT: 0, sayCool: 0, blink: 0, decals: [], wet: 0 };
}
function standUp(instant) {
  const b = doll, cx = Math.max(80, Math.min(W - 80, (b.p[8].x + b.p[9].x) / 2));
  b.anchor = cx; b.frozen = 0;
  if (instant) { b.p.forEach((p, i) => { p.x = p.px = cx + POSE[i][0]; p.y = p.py = FLOOR + POSE[i][1]; }); b.stand = 1; }
  else b.rise = 0.001;
}

// ---------------------------------------------------------------- the world
const objs = [], fx = [], texts = [], rockets = [], holes = [], bolts = [];
let GRAV = 0.55, lowGrav = false, shake = 0, grab = null, pointer = null, tool = 'hand', idle = 0, tickleT = 0, coinPile = 0, coinT = 0;
const grav = () => GRAV * (lowGrav ? 0.18 : 1);

function say(kind, force) {
  const b = doll; if (!force && (b.sayCool > 0 || Math.random() < 0.45)) return;
  b.say = pickOf(T().say[kind]); b.sayT = 2.2; b.sayCool = 2.6;
}
function setFace(f, t) { if (doll.frozen > 0 && f !== 'frozen') return; doll.face = f; doll.faceT = t; }
// he was hit: coins, a face, maybe something to say
function hurt(i, mag, why) {
  if (mag < 2.5) return;
  const b = doll;
  if (b.frozen > 0 && mag > 9) return shatter();
  if (mag > 7) { b.stand = 0; b.rise = 0; b.still = 0; }
  b.dizzy = Math.min(300, b.dizzy + mag);
  const coins = Math.min(30, Math.round(mag * 0.45));
  coinPile += coins; S.coins += coins; S.total += coins;
  if (b.dizzy > 160) { setFace('dizzy', 2.6); if (b.dizzy > 200) say('dizzy'); } else setFace('ouch', 0.7);
  if (why) say(why); else if (mag > 6) say('hit');
  if (mag > 5) sfx('ouch', mag / 20);
  shake = Math.max(shake, Math.min(14, mag * 0.5));
  for (let k = 0; k < Math.min(6, mag / 4); k++) fx.push({ x: b.p[i].x, y: b.p[i].y, vx: rnd(-4, 4), vy: rnd(-5, 1), life: 0.6, max: 0.6, c: '#ffe14a', s: rnd(4, 7), star: true });
}
function addText(x, y, s, c, big) { texts.push({ x, y, s, c, life: big ? 0.9 : 1.1, big }); }

// ---------------------------------------------------------------- physics
function step() {
  const b = doll, gr = grav();
  b.wet = Math.max(0, b.wet - 1 / 60 / 6);
  // the doll
  for (const p of b.p) {
    const vx = (p.x - p.px) * 0.99, vy = (p.y - p.py) * 0.99;
    p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + gr;
  }
  if (b.shock > 0) for (const p of b.p) { p.x += rnd(-2.5, 2.5); p.y += rnd(-2.5, 2.5); }
  // standing up, and staying up
  if (b.rise > 0) { b.rise = Math.min(1, b.rise + 1 / 60 / 1.1); b.stand = b.rise; if (b.rise >= 1) b.rise = 0; }
  if (b.stand > 0 && b.frozen <= 0 && grab?.doll == null) {
    const k = 0.09 * b.stand * b.stand;
    b.p.forEach((p, i) => { const tx = b.anchor + POSE[i][0], ty = FLOOR + POSE[i][1] + Math.sin(performance.now() / 600 + i) * 0.6; p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; p.px += (p.x - p.px) * k * 0.6; p.py += (p.y - p.py) * k * 0.6; });
  }
  for (const r of rockets) { const p = b.p[r.i]; p.y -= 1.35 + gr; p.x += Math.sin(r.t * 9) * 0.9 + r.side * 0.25; b.stand = 0; r.t -= 1 / 60; for (let k = 0; k < 2; k++) fx.push({ x: p.x - r.side * 4, y: p.y + 16, vx: rnd(-1, 1), vy: rnd(2, 5), life: 0.5, max: 0.5, c: pickOf(['#ffb02e', '#ff6a2a', '#ffe14a', '#999']), s: rnd(6, 12) }); }
  for (const h of holes) for (const p of [...b.p, ...objs]) { const dx = h.x - p.x, dy = h.y - p.y, d = Math.hypot(dx, dy); if (d < 420 && d > 4) { const f = 1.1 * (1 - d / 420); p.x += dx / d * f; p.y += dy / d * f - (p.inv ? gr * 0.9 : 0); b.stand = 0; } }
  if (grab?.doll != null) { const p = b.p[grab.doll]; p.x = pointer.x; p.y = pointer.y; b.stand = 0; b.rise = 0; }
  // the sticks, several times over
  for (let it = 0; it < 8; it++) {
    for (const [a, c, len] of b.sticks) stick(b.p[a], b.p[c], len, 1);
    for (const [a, c, len, k] of b.soft) stick(b.p[a], b.p[c], len, k);
    for (const [a, c, min] of b.apart) { const P = b.p[a], Q = b.p[c], dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 1; if (d < min) { const f = (d - min) / d * 0.5; P.x += dx * f; P.y += dy * f; Q.x -= dx * f; Q.y -= dy * f; } }
    if (b.frozen > 0 && b.frozenD) for (let i = 0; i < 14; i++) for (let j = i + 1; j < 14; j++) stick(b.p[i], b.p[j], b.frozenD[i][j], 0.5);
    if (grab?.doll != null) { const p = b.p[grab.doll]; p.x = pointer.x; p.y = pointer.y; }
  }
  // walls, with a thump if he hits them hard
  for (let i = 0; i < b.p.length; i++) {
    const p = b.p[i], vx = p.x - p.px, vy = p.y - p.py;
    let hit = 0;
    if (p.y > FLOOR - p.r) { p.y = FLOOR - p.r; hit = Math.max(hit, vy); p.py = p.y + vy * 0.35; p.px = p.x - vx * 0.82; }
    if (p.y < p.r + 10) { p.y = p.r + 10; hit = Math.max(hit, -vy); p.py = p.y + vy * 0.4; }
    if (p.x < p.r + 10) { p.x = p.r + 10; hit = Math.max(hit, -vx); p.px = p.x + vx * 0.4; }
    if (p.x > W - p.r - 10) { p.x = W - p.r - 10; hit = Math.max(hit, vx); p.px = p.x + vx * 0.4; }
    if (hit > 7 && grab?.doll !== i) { hurt(i, hit * 1.1); sfx('thump', hit / 18); }
  }
  // the things in the room
  for (const o of objs) {
    const vx = (o.x - o.px) * 0.995, vy = (o.y - o.py) * 0.995;
    o.px = o.x; o.py = o.y; o.x += vx; o.y += vy + gr * (o.light ? 0.6 : 1);
    if (grab?.obj === o) { o.x = pointer.x; o.y = pointer.y; }
    if (o.y > FLOOR - o.r) { const hit = vy; o.y = FLOOR - o.r; o.py = o.y + vy * 0.35; o.px = o.x - vx * 0.85; if (hit > 5 && o.T.splat) splatFloor(o); else if (hit > 6 && o.T.snd) sfx(o.T.snd, hit / 20); }
    if (o.x < o.r + 10) { o.x = o.r + 10; o.px = o.x + vx * 0.5; } if (o.x > W - o.r - 10) { o.x = W - o.r - 10; o.px = o.x + vx * 0.5; }
    if (o.y < o.r) { o.y = o.r; o.py = o.y + vy * 0.5; }
    if (o.fuse != null) { o.fuse -= 1 / 60; if (Math.random() < 0.5) fx.push({ x: o.x + o.r * 0.6, y: o.y - o.r, vx: rnd(-1.5, 1.5), vy: rnd(-3, -1), life: 0.3, max: 0.3, c: '#ffd24a', s: 3 }); if (o.fuse <= 0) { o.dead = true; boom(o.x, o.y, o.T.blast, o.T.force); } }
  }
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) bump(objs[i], objs[j], false);
  for (const o of objs) if (!o.dead) for (let i = 0; i < b.p.length; i++) { if (bump(o, b.p[i], true, i)) break; }
  for (let i = objs.length - 1; i >= 0; i--) if (objs[i].dead) objs.splice(i, 1);
  // has he been lying still long enough to get back up?
  const motion = b.p.reduce((s, p) => s + Math.abs(p.x - p.px) + Math.abs(p.y - p.py), 0);
  if (b.stand < 1 && !b.rise && !grab && b.frozen <= 0 && !rockets.length && !holes.length) { b.still = motion < 6 ? b.still + 1 / 60 : 0; if (b.still > 1.6) { standUp(false); b.still = 0; } }
}
function stick(P, Q, len, k) {
  const dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 0.001, f = (d - len) / d * k, w = P.inv + Q.inv;
  P.x += dx * f * P.inv / w; P.y += dy * f * P.inv / w; Q.x -= dx * f * Q.inv / w; Q.y -= dy * f * Q.inv / w;
}
// two round things meet; if one is the doll, maybe it hurts (or splats)
function bump(a, p, isDoll, i) {
  const dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), min = a.r + p.r;
  if (d >= min || d === 0) return false;
  const nx = dx / d, ny = dy / d, ma = a.m, mb = isDoll ? 1 / p.inv : p.m;
  const rv = ((a.x - a.px) - (p.x - p.px)) * nx + ((a.y - a.py) - (p.y - p.py)) * ny; // closing speed
  if (isDoll && a.T.splat && rv > 3) { splat(a, i); return true; }
  const over = min - d, wa = mb / (ma + mb), wb = ma / (ma + mb);
  a.x -= nx * over * wa; a.y -= ny * over * wa; p.x += nx * over * wb; p.y += ny * over * wb;
  if (rv > 0) {
    const j = rv * 1.4;
    a.px += nx * j * wa; a.py += ny * j * wa; p.px -= nx * j * wb; p.py -= ny * j * wb;
    if (isDoll && rv > 3 && grab?.obj !== a) { hurt(i, rv * Math.min(4, Math.sqrt(ma)) * 1.1); if (a.T.snd) sfx(a.T.snd, rv / 12); if (a.T.id === 'duck' && rv > 3) addText(a.x, a.y - 20, 'SQUEAK!', '#ffcf2a'); }
    else if (!isDoll && rv > 4 && a.T.id === 'duck') sfx('squeak');
  }
  return false;
}
function splat(o, i) {
  o.dead = true; const b = doll, p = b.p[i];
  b.decals.push({ i, ox: o.x - p.x + rnd(-4, 4), oy: o.y - p.y + rnd(-4, 4), r: o.r * rnd(0.9, 1.3), c: o.T.splat, wet: o.T.wet, pts: blob() });
  if (b.decals.length > 50) b.decals.shift();
  if (o.T.wet) b.wet = 1;
  for (let k = 0; k < 10; k++) fx.push({ x: o.x, y: o.y, vx: rnd(-5, 5), vy: rnd(-6, 2), life: 0.7, max: 0.7, c: o.T.splat, s: rnd(3, 7), fall: true });
  sfx('splat', 1); hurt(i, 6, 'splat'); addText(o.x, o.y - 24, 'SPLAT!', o.T.splat === '#fff6e0' ? '#f5c97a' : o.T.splat);
}
function splatFloor(o) { o.dead = true; for (let k = 0; k < 8; k++) fx.push({ x: o.x, y: o.y, vx: rnd(-4, 4), vy: rnd(-4, -1), life: 0.6, max: 0.6, c: o.T.splat, s: rnd(3, 6), fall: true }); fx.push({ x: o.x, y: FLOOR + 3, vx: 0, vy: 0, life: 4, max: 4, c: o.T.splat, s: o.r * 1.4, puddle: true }); sfx('splat', 0.6); }
const blob = () => Array.from({ length: 9 }, () => rnd(0.7, 1.25));
function boom(x, y, R, F) {
  const b = doll;
  sfx('boom', R / 250); shake = Math.min(26, R / 10);
  for (const p of b.p) { const dx = p.x - x, dy = p.y - y - 20, d = Math.hypot(dx, dy) || 1; if (d < R) { const f = F * (1 - d / R); p.px -= dx / d * f; p.py -= dy / d * f + f * 0.3; } }
  let near = Math.min(...b.p.map((p) => Math.hypot(p.x - x, p.y - y)));
  if (near < R) { hurt(HEAD, F * (1 - near / R) * 1.6, 'boom'); b.soot = Math.min(1, b.soot + (1 - near / R) * 0.9); b.stand = 0; }
  for (const o of objs) { const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1; if (d < R && o.fuse == null) { const f = F * 0.8 * (1 - d / R) / Math.sqrt(o.m); o.px -= dx / d * f; o.py -= dy / d * f; } }
  for (let k = 0; k < R / 6; k++) { const a = rnd(0, 7), s = rnd(2, 10) * R / 200; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, c: pickOf(['#ffe14a', '#ff8a2a', '#ff4a2a']), s: rnd(5, 12) }); }
  for (let k = 0; k < R / 12; k++) fx.push({ x: x + rnd(-R / 4, R / 4), y: y + rnd(-R / 4, R / 6), vx: rnd(-1, 1), vy: rnd(-2, -0.5), life: rnd(1, 1.8), max: 1.8, c: '#6a6a6a', s: rnd(14, 30), smoke: true });
  fx.push({ x, y, life: 0.25, max: 0.25, flash: R });
  addText(x, y - 30, 'BOOM!', '#ff6a2a', true);
}
function shatter() {
  const b = doll; b.frozen = 0; sfx('shatter');
  for (const p of b.p) for (let k = 0; k < 3; k++) fx.push({ x: p.x, y: p.y, vx: rnd(-5, 5), vy: rnd(-7, 1), life: 1, max: 1, c: pickOf(['#c8ecff', '#9ad8ff', '#ffffff']), s: rnd(4, 8), shard: true, fall: true });
  addText(b.p[HEAD].x, b.p[HEAD].y - 50, 'CRACK!', '#7cc8f0', true); setFace('ouch', 1);
}

// ---------------------------------------------------------------- using the tools
function nearest(x, y, max) { let best = -1, bd = max; doll.p.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y) - p.r; if (d < bd) { bd = d; best = i; } }); return best; }
function use(x, y) {
  const t = TOOLS.find((k) => k.id === tool), b = doll; idle = 0;
  if (t.kind === 'grab') {
    const i = nearest(x, y, 40);
    if (i >= 0) { grab = { doll: i }; say('fly'); setFace('scared', 0.6); sfx('whoosh'); return; }
    const o = objs.find((o) => Math.hypot(o.x - x, o.y - y) < o.r + 14); if (o) grab = { obj: o };
    return;
  }
  if (t.kind === 'hit') {
    const i = nearest(x, y, 70);
    fx.push({ x, y, life: 0.3, max: 0.3, tool: t.icon, rot: rnd(-0.5, 0.5) });
    if (i < 0) { sfx('whoosh'); return; }
    const p = b.p[i]; let dx = p.x - x, dy = p.y - y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (d < 4) { dx = rnd(-0.5, 0.5); dy = -1; }
    if (t.down) { dx *= 0.4; dy = Math.abs(dy) * 0.3 + 0.9; }
    const f = t.power * (lowGrav ? 1.3 : 1);
    p.px -= dx * f; p.py -= dy * f;
    for (const [a, c] of b.sticks) { const o = a === i ? c : c === i ? a : -1; if (o >= 0) { b.p[o].px -= dx * f * 0.4; b.p[o].py -= dy * f * 0.4; } }
    sfx(t.snd, t.power / 20); hurt(i, t.power * 0.9); addText(x, y - 30, t.word, pickOf(['#ff4a4a', '#ff9a1a', '#3a7bd5']), true);
    if (t.down) for (let k = 0; k < 5; k++) fx.push({ x: p.x, y: p.y - p.r, vx: rnd(-3, 3), vy: rnd(-4, -1), life: 0.8, max: 0.8, c: '#ffe14a', s: 7, star: true });
    return;
  }
  if (t.kind === 'throw') {
    const sx = W / 2 + rnd(-40, 40), sy = H + 30, n = 24, gr = grav();
    const vx = (x - sx) / n, vy = (y - sy) / n - 0.5 * gr * n;
    objs.push({ x: sx, y: sy, px: sx - vx, py: sy - vy, r: t.r, m: t.m, T: t, spin: rnd(-0.2, 0.2), a: 0 }); sfx('whoosh');
  } else if (t.kind === 'drop') {
    const n = t.many || 1;
    for (let k = 0; k < n; k++) { const ox = n > 1 ? rnd(-160, 160) : 0, oy = n > 1 ? -k * 40 : 0; objs.push({ x: x + ox, y: 30 + oy, px: x + ox, py: 30 + oy - (t.anvil ? 4 : 1), r: t.r, m: t.m, T: t, a: t.anvil ? 0 : rnd(-0.3, 0.3), spin: n > 1 ? rnd(-0.1, 0.1) : 0, light: t.id === 'duck' }); }
    if (t.anvil) addText(x, 80, '!!!', '#e0342a', true);
  } else if (t.kind === 'bomb') {
    objs.push({ x, y: Math.min(y, FLOOR - 40), px: x, py: Math.min(y, FLOOR - 40), r: t.r, m: t.m, T: t, fuse: t.fuse, a: 0, spin: 0 }); sfx('hiss');
    if (Math.min(...b.p.map((p) => Math.hypot(p.x - x, p.y - y))) < 250) { setFace('scared', t.fuse); say('boom'); }
  } else if (t.kind === 'rocket') {
    const i = nearest(x, y, 60); if (i < 0) return;
    rockets.push({ i, t: 2.4, side: Math.random() < 0.5 ? -1 : 1 }); sfx('rocket'); say('fly', true); setFace('scared', 2.4);
  } else if (t.kind === 'zap') {
    bolts.push({ x, y, life: 0.35, pts: boltPath(x, y) }); sfx('zap');
    const i = nearest(x, y, 90);
    if (i >= 0) { b.shock = 1.3; b.stand = 0; setFace('shock', 1.4); say('zap', true); hurt(i, 14); b.soot = Math.min(1, b.soot + 0.25); }
  } else if (t.kind === 'freeze') {
    const i = nearest(x, y, 80);
    for (let k = 0; k < 12; k++) fx.push({ x: rnd(x - 30, x + 30), y: rnd(y - 30, y + 30), vx: rnd(-1, 1), vy: rnd(-1, 1), life: 0.6, max: 0.6, c: '#bfe8ff', s: rnd(3, 6) });
    if (i >= 0 && b.frozen <= 0) { b.frozen = 5; b.stand = 0; b.rise = 0; b.frozenD = b.p.map((p) => b.p.map((q) => Math.hypot(p.x - q.x, p.y - q.y))); setFace('frozen', 5); say('ice', true); sfx('freeze'); }
  } else if (t.kind === 'hole') {
    if (holes.length) return; holes.push({ x, y: Math.min(y, FLOOR - 60), t: 4 }); sfx('hole'); setFace('scared', 4); say('fly', true);
  } else if (t.kind === 'gravity') {
    lowGrav = !lowGrav; toast(lowGrav ? T().low : T().lowOff); sfx('whoosh');
  }
  if (objs.length > 45) objs.splice(0, objs.length - 45);
}
function boltPath(x, y) { const pts = [[x + rnd(-60, 60), 0]]; for (let k = 1; k <= 8; k++) pts.push([x + rnd(-24, 24) * (1 - k / 9), y * k / 8]); pts[8] = [x, y]; return pts; }

// ---------------------------------------------------------------- drawing
function draw(dt) {
  const b = doll;
  g.save();
  if (shake > 0) g.translate(rnd(-shake, shake), rnd(-shake, shake));
  g.drawImage(room, 0, 0);
  for (const f of fx) if (f.puddle) { g.globalAlpha = Math.min(1, f.life); g.fillStyle = f.c; g.beginPath(); g.ellipse(f.x, f.y, f.s, f.s * 0.25, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  for (const h of holes) { const r = 46 + Math.sin(performance.now() / 90) * 4; const gr = g.createRadialGradient(h.x, h.y, 4, h.x, h.y, r * 2.2); gr.addColorStop(0, '#000'); gr.addColorStop(0.45, '#1a0a3a'); gr.addColorStop(1, '#5a2aa000'); g.fillStyle = gr; g.beginPath(); g.arc(h.x, h.y, r * 2.2, 0, 7); g.fill(); g.strokeStyle = '#b48aff88'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(h.x, h.y, r * (0.6 + k * 0.35), performance.now() / 200 + k, performance.now() / 200 + k + 3.5); g.stroke(); } }
  // his shadow
  const cx = (b.p[8].x + b.p[9].x) / 2, low = Math.max(...b.p.map((p) => p.y));
  g.fillStyle = `rgba(0,0,0,${0.22 * Math.max(0.2, 1 - (FLOOR - low) / 300)})`; g.beginPath(); g.ellipse(cx, FLOOR + 4, 60, 10, 0, 0, 7); g.fill();
  drawDoll(b);
  for (const o of objs) drawObj(o);
  for (const bo of bolts) { g.strokeStyle = '#fff8a0'; g.lineWidth = 7; g.shadowColor = '#ffe84a'; g.shadowBlur = 20; g.beginPath(); bo.pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); g.shadowBlur = 0; }
  for (const f of fx) {
    if (f.puddle) continue;
    const k = f.life / f.max; g.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
    if (f.flash) { g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(f.x, f.y, f.flash * (1.2 - k), 0, 7); g.fill(); }
    else if (f.tool) { g.font = '54px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.scale(1.3 - k * 0.5, 1.3 - k * 0.5); g.fillText(f.tool, 0, 0); g.restore(); }
    else if (f.star) { g.fillStyle = f.c; star(f.x, f.y, f.s); }
    else { g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.smoke ? f.s * (1.6 - k * 0.6) : f.s * (f.shard ? 1 : k + 0.3), 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
  for (const t of texts) { const k = t.life; g.globalAlpha = Math.min(1, k * 2); g.font = `900 ${t.big ? 40 : 26}px "Arial Black", sans-serif`; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#2a1a0a'; g.strokeText(t.s, t.x, t.y); g.fillStyle = t.c; g.fillText(t.s, t.x, t.y); g.globalAlpha = 1; }
  if (b.sayT > 0) bubble(b.p[HEAD].x, b.p[HEAD].y - 46, b.say);
  g.restore();
}
function star(x, y, r) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
function limb(a, c, w, col, edge) { g.lineCap = 'round'; g.strokeStyle = edge; g.lineWidth = w + 5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
const SKIN = '#e8c48e', SKIN2 = '#a8804e';
function drawDoll(b) {
  const p = b.p, shirt = SHIRTS[S.shirt] || SHIRTS[0], ice = b.frozen > 0, xray = b.shock > 0 && Math.floor(performance.now() / 70) % 2;
  if (xray) { // a cartoon x-ray flash
    g.fillStyle = '#10141c'; for (const q of p) { g.beginPath(); g.arc(q.x, q.y, q.r + 10, 0, 7); g.fill(); }
    for (const [a, c] of STICKS) limb(p[a], p[c], 5, '#f4f4f4', '#10141c');
    g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(p[HEAD].x, p[HEAD].y, 24, 0, 7); g.fill(); g.fillStyle = '#10141c'; const a = headAngle(); for (const s of [-1, 1]) { const [ex, ey] = rot(s * 9, -2, a); g.beginPath(); g.arc(p[HEAD].x + ex, p[HEAD].y + ey, 6, 0, 7); g.fill(); }
    return;
  }
  // legs and shoes, then the body, then the arms
  for (const [h, k, f] of [[8, 10, 12], [9, 11, 13]]) { limb(p[h], p[k], 17, '#2f4a7a', '#1c2c4a'); limb(p[k], p[f], 16, '#2f4a7a', '#1c2c4a'); g.fillStyle = '#5a3a22'; g.beginPath(); g.ellipse(p[f].x + (f === 12 ? -4 : 4), p[f].y + 3, 14, 9, 0, 0, 7); g.fill(); }
  g.fillStyle = shirt; g.strokeStyle = '#00000055'; g.lineWidth = 4; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(p[2].x, p[2].y - 6); g.lineTo(p[3].x, p[3].y - 6); g.lineTo(p[9].x + 6, p[9].y + 6); g.lineTo(p[8].x - 6, p[8].y + 6); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#ffffff55'; g.beginPath(); g.arc((p[2].x + p[3].x) / 2, (p[2].y + p[3].y) / 2 + 4, 7, 0, 7); g.fill(); // a button
  for (const [s, e, h] of [[2, 4, 6], [3, 5, 7]]) { limb(p[s], p[e], 14, shirt, '#00000055'); limb(p[e], p[h], 12, SKIN, SKIN2); g.fillStyle = SKIN; g.beginPath(); g.arc(p[h].x, p[h].y, 10, 0, 7); g.fill(); g.strokeStyle = SKIN2; g.lineWidth = 2.5; g.stroke(); }
  limb(p[NECK], p[HEAD], 10, SKIN, SKIN2);
  // the head: a sack-cloth face with stitches
  const H0 = p[HEAD], a = headAngle();
  g.fillStyle = SKIN; g.strokeStyle = SKIN2; g.lineWidth = 3; g.beginPath(); g.arc(H0.x, H0.y, 30, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#a8804e88'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.arc(H0.x, H0.y, 25, a - 2.4, a - 0.7); g.stroke(); g.setLineDash([]);
  if (b.soot > 0) { g.fillStyle = `rgba(30,25,20,${b.soot * 0.6})`; g.beginPath(); g.arc(H0.x, H0.y, 30, 0, 7); g.fill(); }
  face(b, H0, a);
  for (const d of b.decals) { const q = p[d.i]; g.fillStyle = d.c; g.globalAlpha = d.wet ? Math.max(0, b.wet) * 0.8 : 0.92; g.beginPath(); d.pts.forEach((k, j) => { const an = j / d.pts.length * 6.283; g.lineTo(q.x + d.ox + Math.cos(an) * d.r * k, q.y + d.oy + Math.sin(an) * d.r * k * 0.8); }); g.fill(); g.globalAlpha = 1; }
  hat(H0, a);
  if (ice) { g.fillStyle = '#bfe8ffaa'; g.strokeStyle = '#ffffffcc'; g.lineWidth = 2; for (const q of p) { g.beginPath(); g.arc(q.x, q.y, q.r + 9, 0, 7); g.fill(); } g.beginPath(); g.arc(H0.x, H0.y, 36, 0, 7); g.fill(); g.stroke(); }
  if (b.face === 'dizzy') for (let k = 0; k < 4; k++) { const an = performance.now() / 300 + k * 1.57; g.fillStyle = '#ffd23a'; star(H0.x + Math.cos(an) * 40, H0.y - 34 + Math.sin(an) * 9, 7); }
}
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
function headAngle() { const h = doll.p[HEAD], n = doll.p[NECK]; return Math.atan2(h.y - n.y, h.x - n.x) + Math.PI / 2; }
function face(b, H0, a) {
  const at = (x, y) => { const [dx, dy] = rot(x, y, a); return [H0.x + dx, H0.y + dy]; };
  const f = b.blink > 0 && b.face === 'calm' ? 'blink' : b.face;
  g.strokeStyle = '#2a1a0a'; g.fillStyle = '#2a1a0a'; g.lineWidth = 3; g.lineCap = 'round';
  const line = (pts) => { g.beginPath(); pts.forEach(([x, y], k) => { const [X, Y] = at(x, y); k ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); };
  for (const s of [-1, 1]) {
    const [ex, ey] = at(s * 10, -5);
    if (f === 'calm' || f === 'frozen') { g.beginPath(); g.arc(ex, ey, 4.5, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + 1.5, ey - 1.5, 1.5, 0, 7); g.fill(); g.fillStyle = '#2a1a0a'; }
    else if (f === 'blink') line([[s * 10 - 5, -5], [s * 10 + 5, -5]]);
    else if (f === 'ouch') line([[s * 15, -10], [s * 6, -5], [s * 15, 0]]); // > <
    else if (f === 'dizzy') { g.beginPath(); for (let t = 0; t < 12; t++) { const r = t * 0.5, an = t * 0.9 + performance.now() / 150; const [X, Y] = [ex + Math.cos(an) * r, ey + Math.sin(an) * r]; t ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke(); }
    else if (f === 'laugh') line([[s * 10 - 5, -3], [s * 10, -8], [s * 10 + 5, -3]]);
    else if (f === 'scared') { g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, 7, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2a1a0a'; g.beginPath(); g.arc(ex, ey, 2.5, 0, 7); g.fill(); }
    else if (f === 'shock') { line([[s * 10 - 4, -9], [s * 10 + 4, -1]]); line([[s * 10 + 4, -9], [s * 10 - 4, -1]]); }
  }
  // cheeks and mouth
  g.fillStyle = '#ff8a8a55'; for (const s of [-1, 1]) { const [cx, cy] = at(s * 18, 5); g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill(); }
  g.fillStyle = '#2a1a0a';
  const [mx, my] = at(0, 12);
  if (f === 'calm' || f === 'blink') line([[-7, 10], [0, 14], [7, 10]]);
  else if (f === 'frozen') line([[-7, 13], [7, 13]]);
  else if (f === 'dizzy') line([[-9, 13], [-4, 10], [0, 14], [4, 10], [9, 13]]);
  else if (f === 'laugh') { g.beginPath(); g.save(); g.translate(mx, my); g.rotate(a); g.arc(0, -2, 10, 0, Math.PI); g.closePath(); g.fill(); g.fillStyle = '#e05a6a'; g.beginPath(); g.arc(0, 3, 5, 0, Math.PI); g.fill(); g.restore(); }
  else { g.save(); g.translate(mx, my); g.rotate(a); g.beginPath(); g.ellipse(0, 1, f === 'scared' ? 5 : 8, f === 'scared' ? 6 : 7, 0, 0, 7); g.fill(); g.restore(); }
}
function hat(H0, a) {
  const h = S.hat; if (h === 'none') return;
  g.save(); g.translate(H0.x, H0.y); g.rotate(a);
  if (h === 'party') { g.fillStyle = '#f06aa8'; g.beginPath(); g.moveTo(-16, -24); g.lineTo(16, -24); g.lineTo(0, -66); g.closePath(); g.fill(); g.fillStyle = '#ffe14a'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(-6 + k * 6, -32 - k * 9, 3, 0, 7); g.fill(); } g.beginPath(); g.arc(0, -68, 6, 0, 7); g.fill(); }
  if (h === 'cap') { g.fillStyle = '#e0483a'; g.beginPath(); g.arc(0, -16, 27, Math.PI, 0); g.fill(); g.fillRect(0, -19, 40, 7); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -42, 4, 0, 7); g.fill(); }
  if (h === 'cowboy') { g.fillStyle = '#9a6a3a'; g.beginPath(); g.ellipse(0, -22, 46, 9, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-22, -22); g.quadraticCurveTo(-24, -56, 0, -52); g.quadraticCurveTo(24, -56, 22, -22); g.fill(); g.fillStyle = '#5a3a22'; g.fillRect(-22, -30, 44, 6); }
  if (h === 'crown') { g.fillStyle = '#ffcf2a'; g.strokeStyle = '#c8901a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-20, -22); g.lineTo(-22, -50); g.lineTo(-10, -36); g.lineTo(0, -56); g.lineTo(10, -36); g.lineTo(22, -50); g.lineTo(20, -22); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#e0342a'; g.beginPath(); g.arc(0, -30, 4, 0, 7); g.fill(); }
  if (h === 'wizard') { g.fillStyle = '#4a3aa8'; g.beginPath(); g.ellipse(0, -22, 38, 8, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-22, -22); g.lineTo(22, -22); g.lineTo(8, -80); g.closePath(); g.fill(); g.fillStyle = '#ffe14a'; star(-2, -44, 6); star(8, -62, 4); }
  if (h === 'bow') { g.fillStyle = '#f04a8a'; g.beginPath(); g.moveTo(10, -28); g.lineTo(-6, -40); g.lineTo(-6, -16); g.closePath(); g.fill(); g.beginPath(); g.moveTo(10, -28); g.lineTo(26, -40); g.lineTo(26, -16); g.closePath(); g.fill(); g.beginPath(); g.arc(10, -28, 5, 0, 7); g.fill(); }
  if (h === 'shades') { g.fillStyle = '#111'; g.fillRect(-20, -10, 16, 10); g.fillRect(4, -10, 16, 10); g.fillRect(-4, -8, 8, 3); g.fillStyle = '#ffffff66'; g.fillRect(-17, -9, 4, 3); g.fillRect(7, -9, 4, 3); }
  if (h === 'stache') { g.fillStyle = '#3a2210'; g.beginPath(); g.ellipse(-7, 7, 9, 4, -0.3, 0, 7); g.ellipse(7, 7, 9, 4, 0.3, 0, 7); g.fill(); }
  g.restore();
}
function drawObj(o) {
  const t = o.T; g.save(); g.translate(o.x, o.y); g.rotate(o.a || 0);
  if (t.id === 'anvil') { g.fillStyle = '#4a4f5a'; g.strokeStyle = '#22252b'; g.lineWidth = 3; g.beginPath(); g.moveTo(-34, -16); g.lineTo(30, -16); g.quadraticCurveTo(44, -14, 46, -6); g.lineTo(14, -2); g.lineTo(10, 10); g.lineTo(22, 22); g.lineTo(-24, 22); g.lineTo(-12, 10); g.lineTo(-16, 0); g.quadraticCurveTo(-34, -4, -34, -16); g.fill(); g.stroke(); }
  else if (t.id === 'bowl') { g.fillStyle = '#2a3a8a'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); g.fillStyle = '#ffffff33'; g.beginPath(); g.arc(-8, -8, 8, 0, 7); g.fill(); g.fillStyle = '#111'; for (const [x, y] of [[4, -6], [10, -2], [6, 4]]) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } }
  else if (t.id === 'bomb') { g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); g.fillStyle = '#555'; g.fillRect(-6, -o.r - 6, 12, 8); g.strokeStyle = '#a87a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -o.r - 6); g.quadraticCurveTo(8, -o.r - 16, 14, -o.r - 12); g.stroke(); g.fillStyle = '#ffffff44'; g.beginPath(); g.arc(-6, -6, 5, 0, 7); g.fill(); if (o.fuse < 0.6 && Math.floor(o.fuse * 12) % 2) { g.fillStyle = '#ff3a2a88'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); } }
  else if (t.id === 'cracker') { g.fillStyle = '#e0342a'; g.fillRect(-7, -14, 14, 28); g.fillStyle = '#ffd24a'; g.fillRect(-7, -6, 14, 4); g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.lineTo(5, -22); g.stroke(); }
  else if (t.id === 'duck') { // a yellow rubber duck
    g.fillStyle = '#ffd23a'; g.strokeStyle = '#d89a10'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 4, 16, 11, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.arc(-7, -8, 9, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ff8a1a'; g.beginPath(); g.moveTo(-15, -9); g.lineTo(-23, -6); g.lineTo(-15, -4); g.fill();
    g.fillStyle = '#2a1a0a'; g.beginPath(); g.arc(-9, -10, 1.8, 0, 7); g.fill(); g.fillStyle = '#ffe98a'; g.beginPath(); g.ellipse(5, 2, 7, 4, -0.4, 0, 7); g.fill(); }
  else { g.font = `${o.r * 2.2}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t.icon, 0, 2); }
  g.restore();
}
function bubble(x, y, s) {
  g.font = '700 20px "Noto Sans TC", sans-serif'; const w = Math.min(320, g.measureText(s).width + 26), bx = Math.max(10, Math.min(W - w - 10, x - w / 2)), by = Math.max(10, y - 54);
  g.fillStyle = '#fff'; g.strokeStyle = '#2a1a0a'; g.lineWidth = 3; g.beginPath(); g.roundRect(bx, by, w, 40, 14); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(Math.max(bx + 14, Math.min(bx + w - 14, x)) - 8, by + 39); g.lineTo(x, by + 54); g.lineTo(Math.max(bx + 14, Math.min(bx + w - 14, x)) + 8, by + 39); g.fill(); g.stroke();
  g.fillStyle = '#2a1a0a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, bx + w / 2, by + 21);
}

// ---------------------------------------------------------------- the clock
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt;
  let n = 0; while (acc >= 1 / 60 && n < 4) { step(); acc -= 1 / 60; n++; } if (n === 4) acc = 0;
  tickTimers(dt); draw(dt);
  requestAnimationFrame(frame);
}
function tickTimers(dt) {
  const b = doll;
  shake = Math.max(0, shake - dt * 40);
  for (const f of fx) { f.life -= dt; if (f.vx != null) { f.x += f.vx; f.y += f.vy; if (f.fall) f.vy += 0.3; if (f.star || f.shard) f.vy += 0.15; } }
  for (let i = fx.length - 1; i >= 0; i--) if (fx[i].life <= 0) fx.splice(i, 1);
  if (fx.length > 400) fx.splice(0, fx.length - 400);
  for (const t of texts) { t.life -= dt; t.y -= dt * 40; } for (let i = texts.length - 1; i >= 0; i--) if (texts[i].life <= 0) texts.splice(i, 1);
  for (const bo of bolts) bo.life -= dt; for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].life <= 0) bolts.splice(i, 1);
  for (let i = rockets.length - 1; i >= 0; i--) if (rockets[i].t <= 0) { const p = b.p[rockets[i].i]; rockets.splice(i, 1); boom(p.x, p.y, 170, 26); }
  for (let i = holes.length - 1; i >= 0; i--) { holes[i].t -= dt; if (holes[i].t <= 0) { const h = holes.splice(i, 1)[0]; boom(h.x, h.y, 260, 30); } else if (Math.min(...b.p.map((p) => Math.hypot(p.x - holes[i].x, p.y - holes[i].y))) < 60) { coinPile += 1; S.coins += 1; } }
  for (const o of objs) if (!['anvil', 'cracker', 'duck'].includes(o.T.id)) o.a = (o.a || 0) + (o.spin || 0) + (o.x - o.px) / o.r; // round things roll
  b.faceT -= dt; if (b.faceT <= 0 && b.face !== 'calm') b.face = 'calm';
  b.blink -= dt; if (b.blink < -3 - Math.random() * 3) b.blink = 0.12;
  b.dizzy = Math.max(0, b.dizzy - dt * 40); b.sayT -= dt; b.sayCool -= dt; b.shock -= dt;
  if (b.frozen > 0) { b.frozen -= dt; if (b.frozen <= 0) { b.frozenD = null; sfx('shatter'); } }
  // coins pop up in little bunches
  coinT -= dt; if (coinPile > 0 && coinT <= 0) { addText(b.p[HEAD].x + rnd(-30, 30), b.p[HEAD].y - 40, `+${coinPile}`, '#ffd23a'); sfx('coin'); coinPile = 0; coinT = 0.25; updateCoins(); save(); }
  // tickling
  if (tool === 'feather' && pointer?.down) {
    const near = nearest(pointer.x, pointer.y, 30) >= 0, moving = Math.hypot(pointer.x - (pointer.lx ?? pointer.x), pointer.y - (pointer.ly ?? pointer.y)) > 1;
    if (near && moving) { tickleT += dt; setFace('laugh', 0.5); if (tickleT > 0.3) { tickleT = 0; S.coins += 1; coinPile += 1; sfx('laugh'); say('tickle'); fx.push({ x: pointer.x, y: pointer.y, vx: rnd(-1, 1), vy: rnd(-2, 0), life: 0.6, max: 0.6, c: '#ffffff', s: 4 }); } }
    pointer.lx = pointer.x; pointer.ly = pointer.y;
  }
  idle += dt; if (idle > 14) { idle = 0; say('idle', true); }
}

// ---------------------------------------------------------------- pointer
function toWorld(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); const w = toWorld(e); pointer = { ...w, down: true }; hideHint(); use(w.x, w.y); });
cv.addEventListener('pointermove', (e) => { const w = toWorld(e); if (pointer) { pointer.x = w.x; pointer.y = w.y; } });
const up = () => { if (grab?.obj) { /* it keeps the speed it was moving at */ } grab = null; if (pointer) pointer.down = false; };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

// ---------------------------------------------------------------- the toolbar, the shop
function toolbar() {
  $('#tools').innerHTML = TOOLS.map((t) => { const own = S.own.includes(t.id); return `<button class="tool ${tool === t.id ? 'on' : ''} ${own ? '' : 'locked'}" data-tool="${t.id}" title="${tn(t)}"><span>${t.icon}</span><small>${own ? tn(t) : '🔒 ' + t.price}</small></button>`; }).join('');
}
function updateCoins() { $('#coins').textContent = S.coins.toLocaleString(); }
function labels() {
  const t = T(); document.title = t.title; document.documentElement.lang = S.lang === 'en' ? 'en' : 'zh-Hant';
  $('#shopBtn').innerHTML = `🛒<span> ${t.shop}</span>`; $('#standBtn').innerHTML = `🧍<span> ${t.stand}</span>`; $('#cleanBtn').innerHTML = `🧽<span> ${t.clean}</span>`; $('#langBtn').innerHTML = `🌐<span> ${t.lang}</span>`;
  $('#muteBtn').textContent = muted() ? '🔇' : '🔊'; $('#hint').textContent = t.hint; $('#coinsLbl').title = t.coins;
}
function toast(s) { const el = $('#toast'); el.textContent = s; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800); }
function hideHint() { $('#hint').classList.add('gone'); }
function shop(tab = 'tools') {
  const t = T(), card = (x, own, on, price, kind) => `<div class="item ${own ? 'own' : ''}"><span class="ic">${x.icon}</span><b>${tn(x)}</b>${own
    ? `<button class="mini ${on ? 'on' : ''}" data-${kind}="${x.id}">${on ? (kind === 'wear' ? t.wearing : '✓') : kind === 'wear' ? t.wear : t.use}</button>`
    : `<button class="mini buy" data-buy="${kind}:${x.id}" ${S.coins < price ? 'disabled' : ''}>🪙 ${price}</button>${S.coins < price ? `<small>${t.need(price - S.coins)}</small>` : ''}`}</div>`;
  $('#dlgBody').innerHTML = `<h2>🛒 ${t.shop} <span class="cn">🪙 ${S.coins.toLocaleString()}</span></h2>
    <div class="tabs"><button class="tab ${tab === 'tools' ? 'on' : ''}" data-tab="tools">${t.tools}</button><button class="tab ${tab === 'hats' ? 'on' : ''}" data-tab="hats">${t.hats}</button></div>
    ${tab === 'tools' ? `<div class="grid">${TOOLS.map((x) => card(x, S.own.includes(x.id), tool === x.id, x.price, 'use')).join('')}</div>`
      : `<div class="grid">${HATS.map((x) => card(x, S.hats.includes(x.id), S.hat === x.id, x.price, 'wear')).join('')}</div>
         <h3>${t.shirt}</h3><div class="shirts">${SHIRTS.map((c, i) => `<button class="sw ${S.shirt === i ? 'on' : ''}" data-shirt="${i}" style="background:${c}"></button>`).join('')}</div>`}`;
  $('#dlg').dataset.tab = tab;
  if (!$('#dlg').open) $('#dlg').showModal();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tool) { const t = TOOLS.find((x) => x.id === b.dataset.tool); if (!S.own.includes(t.id)) return shop('tools'); if (t.kind === 'gravity') { lowGrav = !lowGrav; toast(lowGrav ? T().low : T().lowOff); } else tool = t.id; toolbar(); hideHint(); }
  else if (b.id === 'shopBtn') shop('tools');
  else if (b.id === 'standBtn') { standUp(false); doll.frozen = 0; sfx('whoosh'); }
  else if (b.id === 'cleanBtn') { doll.decals = []; doll.soot = 0; sfx('splat', 0.4); for (let k = 0; k < 20; k++) fx.push({ x: doll.p[HEAD].x + rnd(-40, 40), y: doll.p[HEAD].y + rnd(-40, 120), vx: rnd(-1, 1), vy: rnd(-2, 0), life: 0.8, max: 0.8, c: '#e8f6ff', s: rnd(4, 9) }); }
  else if (b.id === 'muteBtn') { setMute(!muted()); labels(); }
  else if (b.id === 'langBtn') { S.lang = S.lang === 'en' ? 'zh' : 'en'; save(); labels(); toolbar(); }
  else if (b.dataset.tab) shop(b.dataset.tab);
  else if (b.dataset.buy) {
    const [kind, id] = b.dataset.buy.split(':'), x = (kind === 'use' ? TOOLS : HATS).find((k) => k.id === id);
    if (S.coins < x.price) return;
    S.coins -= x.price; (kind === 'use' ? S.own : S.hats).push(id); if (kind === 'use' && x.kind !== 'gravity') tool = id; else if (kind === 'wear') S.hat = id;
    save(); sfx('buy'); toast(T().unlocked(tn(x))); updateCoins(); toolbar(); shop($('#dlg').dataset.tab);
  }
  else if (b.dataset.use) { const x = TOOLS.find((k) => k.id === b.dataset.use); if (x.kind === 'gravity') { lowGrav = !lowGrav; toast(lowGrav ? T().low : T().lowOff); } else tool = x.id; toolbar(); $('#dlg').close(); }
  else if (b.dataset.wear) { S.hat = b.dataset.wear; save(); shop('hats'); }
  else if (b.dataset.shirt) { S.shirt = +b.dataset.shirt; save(); shop('hats'); }
  else if (b.id === 'dlgX') $('#dlg').close();
});

// ---------------------------------------------------------------- start
new ResizeObserver(() => resize()).observe($('#stage'));
resize();
doll = makeDoll(W / 2);
labels(); toolbar(); updateCoins();
requestAnimationFrame(frame);
(async () => { try { cloud = await import('/save.js'); if (await cloud.pull(GAME, KEY)) { Object.assign(S, load()); labels(); toolbar(); updateCoins(); } } catch (e) { cloud = null; } })();
window.BB = { S, get doll() { return doll; }, use, objs, setTool: (t) => { tool = t; toolbar(); }, step };
