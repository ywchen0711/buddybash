// 出氣布偶 / Buddy Bash: a rag doll in a room and a box of things to do to him. Verlet physics (points and sticks),
// a little spring that keeps him standing until he is knocked over, and coins for every bump that buy more tools.
import { TOOLS, HATS, SHIRTS, WORDS, SHELF } from './items.js?v=6';
import { heroEngine } from './heroes.js?v=3';
import { sigEngine } from './signature.js?v=3';
import { sfx, setMute, muted } from './sfx.js?v=3';

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
const objs = [], fx = [], texts = [], rockets = [], holes = [], bolts = [], acts = [], winds = [], swarms = [];
// how long each blow takes, and when it lands (seconds)
const ACT = { punch: [0.36, 0.11], slap: [0.34, 0.14], bat: [0.42, 0.17], hammer: [0.55, 0.36] };
// and the same for the rest, by the way they are swung
const STYLE = { jab: [0.36, 0.12], poke: [0.3, 0.1], swing: [0.42, 0.17], smash: [0.55, 0.36], slap: [0.34, 0.14] };
const FIRE = ['#ffb02e', '#ff6a2a', '#ffe14a', '#ff3a1a'];
let GRAV = 0.55, lowGrav = false, shake = 0, grab = null, pointer = null, tool = 'hand', idle = 0, tickleT = 0, coinPile = 0, coinT = 0;
const grav = () => GRAV * (lowGrav ? 0.18 : 1);
// round prices so large they are better in words: 10 億 / 1 billion (other amounts exactly)
const money = (n) => (n % 1e4 ? n.toLocaleString() : n >= 1e12 ? (S.lang === 'en' ? `${n / 1e12} trillion` : `${n / 1e12} 兆`) : n >= 1e9 && S.lang === 'en' ? `${n / 1e9} billion` : n >= 1e8 && S.lang !== 'en' ? `${n / 1e8} 億` : n >= 1e6 && S.lang === 'en' ? `${n / 1e6} million` : n >= 1e4 && S.lang !== 'en' ? `${n / 1e4} 萬` : n.toLocaleString());
// the superheroes (js/heroes.js), given what they need of the room and the buddy
const HERO = heroEngine({ doll: () => doll, dims: () => ({ W, H, FLOOR }), get g() { return g; }, fx, bolts, winds, holes, rockets, swarms, objs, boom: (...a) => boom(...a), hurt: (...a) => hurt(...a), addText: (...a) => addText(...a),
  sfx: (...a) => sfx(...a), setFace: (...a) => setFace(...a), say: (...a) => say(...a), emoji: (...a) => emoji(...a), limb: (...a) => limb(...a), bubble: (...a) => bubble(...a), boltPath: (...a) => boltPath(...a),
  tool: (id) => TOOLS.find((k) => k.id === id), lang: () => S.lang, shake: (n) => { shake = Math.max(shake, n); }, HEAD: 0, NECK: 1 });
// every tool's own signature (js/signature.js): what flies off it, what it does to him for a while, something extra
const later = []; // little things to do in a moment: {t, fn}
const SIGN = sigEngine({ doll: () => doll, dims: () => ({ W, H, FLOOR }), get g() { return g; }, fx, objs, addText: (...a) => addText(...a), sfx: (...a) => sfx(...a), hurt: (...a) => hurt(...a),
  setFace: (...a) => setFace(...a), say: (...a) => say(...a), emoji: (...a) => emoji(...a), shake: (n) => { shake = Math.max(shake, n); }, tool: (id) => TOOLS.find((k) => k.id === id),
  coins: (n) => { S.coins += n; S.total += n; updateCoins(); save(); },
  splat: (i, c, r) => { doll.decals.push({ i, ox: rnd(-6, 6), oy: rnd(-6, 6), r, c, wet: false, pts: blob() }); if (doll.decals.length > 50) doll.decals.shift(); },
  // more hits: a hit tool swings again (a boomerang comes back); anything else lands again
  redo: (id, n, back, x, y, i) => { const T = TOOLS.find((k) => k.id === id); for (let k = 1; k <= n; k++) {
    if (T.kind === 'hit') { const b = doll, cx = (b.p[8].x + b.p[9].x) / 2, side = x < cx ? -1 : 1, [dur, at] = ACT[T.id] || STYLE[T.style] || STYLE.jab; acts.push({ k: T.id, T: back ? { ...T, word: S.lang === 'en' ? 'AGAIN!' : '又來了！' } : T, x, y, side: back ? -side : side, t: -0.38 * k, dur, at, hit: false, repeat: true }); }
    else later.push({ t: 0.32 * k, fn: () => { const p = doll.p[i] || doll.p[2]; p.px -= rnd(-6, 6); p.py += 6; hurt(i, 9); sfx(T.snd || 'thump', 0.6); for (let m = 0; m < 5; m++) fx.push({ x: p.x, y: p.y, vx: rnd(-5, 5), vy: rnd(-6, -1), life: 0.8, max: 0.8, emo: T.icon, size: 22, rot: rnd(-2, 2), fall: true }); addText(p.x, p.y - 30, '×' + (k + 1), '#ffe14a', true); } }); } } });

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
    if (SIGN.float()) p.y -= gr * 1.15;
  }
  if (b.shock > 0) for (const p of b.p) { p.x += rnd(-2.5, 2.5); p.y += rnd(-2.5, 2.5); }
  // standing up, and staying up
  if (b.rise > 0) { b.rise = Math.min(1, b.rise + 1 / 60 / 1.1); b.stand = b.rise; if (b.rise >= 1) b.rise = 0; }
  if (b.stand > 0 && b.frozen <= 0 && grab?.doll == null) {
    const k = 0.09 * b.stand * b.stand;
    b.p.forEach((p, i) => { const tx = b.anchor + POSE[i][0], ty = FLOOR + POSE[i][1] + Math.sin(performance.now() / 600 + i) * 0.6; p.x += (tx - p.x) * k; p.y += (ty - p.y) * k; p.px += (p.x - p.px) * k * 0.6; p.py += (p.y - p.py) * k * 0.6; });
  }
  for (const r of rockets) { const p = b.p[r.i]; p.y -= (r.T.lift ?? 1.35) + gr; p.x += Math.sin(r.t * 9) * 0.9 + r.side * 0.25; b.stand = 0; r.t -= 1 / 60; for (let k = 0; k < 2; k++) fx.push({ x: p.x - r.side * 4, y: p.y + 16, vx: rnd(-1, 1), vy: rnd(2, 5), life: 0.5, max: 0.5, c: pickOf(r.T.trail || ['#ffb02e', '#ff6a2a', '#ffe14a', '#999']), s: rnd(6, 12) }); }
  for (const h of holes) { const R = h.T.R || 420, pull = h.T.pull || 1.1, lift = h.T.lift || 0; for (const p of [...b.p, ...objs]) { const dx = h.x - p.x, dy = h.y - p.y, d = Math.hypot(dx, dy); if (d < R && d > 4) { const f = pull * (1 - d / R); p.x += dx / d * f - (lift ? dy / d * f * 0.8 : 0); p.y += dy / d * f - (p.inv ? gr * 0.9 : 0) - lift * f; b.stand = 0; } } }
  // the wind pushes him (and everything loose) across the room
  for (const w of winds) { const f = w.T.f * Math.min(1, w.age / 0.2, w.t / 0.3); for (const p of b.p) p.x += w.dir * f * (0.7 + 0.6 * (p.y < FLOOR - 100)); for (const o of objs) o.x += w.dir * f * 1.4 / Math.sqrt(o.m); if (w.T.f >= 1 && w.age > 0.15) b.stand = 0; else b.stand = Math.max(0.3, b.stand - 0.01); }
  if (grab?.doll != null && pointer) { const p = b.p[grab.doll]; p.x = pointer.x; p.y = pointer.y; b.stand = 0; b.rise = 0; }
  HERO.pin();
  // the sticks, several times over
  for (let it = 0; it < 8; it++) {
    for (const [a, c, len] of b.sticks) stick(b.p[a], b.p[c], len, 1);
    for (const [a, c, len, k] of b.soft) stick(b.p[a], b.p[c], len, k);
    for (const [a, c, min] of b.apart) { const P = b.p[a], Q = b.p[c], dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 1; if (d < min) { const f = (d - min) / d * 0.5; P.x += dx * f; P.y += dy * f; Q.x -= dx * f; Q.y -= dy * f; } }
    if (b.frozen > 0 && b.frozenD) for (let i = 0; i < 14; i++) for (let j = i + 1; j < 14; j++) stick(b.p[i], b.p[j], b.frozenD[i][j], 0.5);
    if (grab?.doll != null && pointer) { const p = b.p[grab.doll]; p.x = pointer.x; p.y = pointer.y; }
    HERO.pin();
  }
  // walls, with a thump if he hits them hard
  for (let i = 0; i < b.p.length; i++) {
    const p = b.p[i], vx = p.x - p.px, vy = p.y - p.py;
    let hit = 0;
    if (p.y > FLOOR - p.r) { p.y = FLOOR - p.r; hit = Math.max(hit, vy); p.py = p.y + vy * (SIGN.bouncy() ? 0.92 : 0.35); p.px = p.x - vx * 0.82; if (SIGN.bouncy()) b.stand = 0; }
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
    if (o.fuse != null) { o.fuse -= 1 / 60; if (Math.random() < 0.5) fx.push({ x: o.x + o.r * 0.6, y: o.y - o.r, vx: rnd(-1.5, 1.5), vy: rnd(-3, -1), life: 0.3, max: 0.3, c: '#ffd24a', s: 3 }); if (o.fuse <= 0) { o.dead = true; boom(o.x, o.y, o.T.blast, o.T.force, o.T.pal); const i = nearest(o.x, o.y, o.T.blast); if (i >= 0) SIGN.apply(o.T.id, o.x, o.y, i); } }
  }
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) bump(objs[i], objs[j], false);
  for (const o of objs) if (!o.dead) for (let i = 0; i < b.p.length; i++) { if (bump(o, b.p[i], true, i)) break; }
  for (let i = objs.length - 1; i >= 0; i--) if (objs[i].dead) objs.splice(i, 1);
  // has he been lying still long enough to get back up?
  const motion = b.p.reduce((s, p) => s + Math.abs(p.x - p.px) + Math.abs(p.y - p.py), 0);
  if (b.stand < 1 && !b.rise && !grab && b.frozen <= 0 && !rockets.length && !holes.length && !winds.length) { b.still = motion < 6 ? b.still + 1 / 60 : 0; if (b.still > 1.6) { standUp(false); b.still = 0; } }
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
  if (isDoll && rv > 0.5 && !a.signed && grab?.obj !== a) { a.signed = true; SIGN.apply(a.T.id, a.x, a.y, i); }
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
function boom(x, y, R, F, pal) {
  const b = doll;
  sfx('boom', R / 250); shake = Math.min(26, R / 10);
  for (const p of b.p) { const dx = p.x - x, dy = p.y - y - 20, d = Math.hypot(dx, dy) || 1; if (d < R) { const f = F * (1 - d / R); p.px -= dx / d * f; p.py -= dy / d * f + f * 0.3; } }
  let near = Math.min(...b.p.map((p) => Math.hypot(p.x - x, p.y - y)));
  if (near < R) { hurt(HEAD, F * (1 - near / R) * 1.6, 'boom'); b.soot = Math.min(1, b.soot + (1 - near / R) * 0.9); b.stand = 0; }
  for (const o of objs) { const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1; if (d < R && o.fuse == null) { const f = F * 0.8 * (1 - d / R) / Math.sqrt(o.m); o.px -= dx / d * f; o.py -= dy / d * f; } }
  for (let k = 0; k < R / 6; k++) { const a = rnd(0, 7), s = rnd(2, 10) * R / 200; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, c: pickOf(pal || ['#ffe14a', '#ff8a2a', '#ff4a2a']), s: rnd(5, 12) }); }
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
  if (['drop', 'bomb', 'hole', 'gravity'].includes(t.kind)) return use2(t, x, y);
  if (t.kind === 'hero') { if (HERO.active) toast(S.lang === 'en' ? 'A hero is already here!' : '英雄正在出招中！'); else HERO.start(t); return; }
  if (t.kind === 'hit') {
    // it comes in from the side away from him, so it pushes him the other way
    const cx = (b.p[8].x + b.p[9].x) / 2, side = x < cx ? -1 : 1;
    const [dur, at] = ACT[t.id] || STYLE[t.style] || STYLE.jab; acts.push({ k: t.id, T: t, x, y, side, t: 0, dur, at, hit: false }); sfx('whoosh');
    return;
  }
  if (t.kind === 'throw') {
    const sx = Math.max(60, Math.min(W - 60, x + rnd(-80, 80))), sy = FLOOR - 24, n = 24, gr = grav(); // from just above the floor (below it, the floor would stop it dead)
    acts.push({ k: 'toss', x: sx, y: H, t: 0, dur: 0.32, at: 0.1, hit: false, go: () => {
      const vx = (x - sx) / n, vy = (y - sy) / n - 0.5 * gr * n;
      objs.push({ x: sx, y: sy, px: sx - vx, py: sy - vy, r: t.r, m: t.m, T: t, spin: rnd(-0.2, 0.2), a: 0 }); sfx('whoosh');
      for (let k = 0; k < 6; k++) fx.push({ x: sx, y: H - 20, vx: rnd(-2, 2), vy: rnd(-3, -1), life: 0.4, max: 0.4, c: '#ffffffaa', s: rnd(4, 8) });
    } });
    return;
  }
  if (t.kind === 'rocket') {
    const i = nearest(x, y, 60); if (i < 0) return;
    const side = Math.random() < 0.5 ? -1 : 1;
    acts.push({ k: 'rocketIn', icon: t.icon, x: side < 0 ? -40 : W + 40, y: y - 140, side, i, t: 0, dur: 0.4, at: 0.4, hit: false, go: () => { rockets.push({ i, t: t.dur || 2.4, side, T: t }); SIGN.apply(t.id, b.p[i].x, b.p[i].y, i); sfx(t.id === 'heli' || t.id === 'ufo' ? 'wind' : 'rocket'); say('fly', true); setFace('scared', 2.4); } });
    setFace('scared', 0.6); sfx('whoosh');
    return;
  }
  if (t.kind === 'zap') {
    acts.push({ k: 'cloud', x, y, t: 0, dur: 0.7, at: 0.28, hit: false, go: () => {
      for (let n = 0; n < (t.n || 1); n++) bolts.push({ x, y, life: 0.35 + n * 0.06, c: t.c === 'rainbow' ? pickOf(['#ff4a4a', '#ffb02e', '#ffe14a', '#5ad04a', '#3a9aff', '#b06aff']) : t.c, pts: boltPath(x + (n ? rnd(-30, 30) : 0), y) }); sfx('zap'); fx.push({ x, y, life: 0.15, max: 0.15, flash: 120 });
      const i = nearest(x, y, 90);
      if (i >= 0) { b.shock = 1.3; b.stand = 0; setFace('shock', 1.4); say('zap', true); hurt(i, t.dmg ?? 14); b.soot = Math.min(1, b.soot + 0.25); SIGN.apply(t.id, x, y, i); }
    } });
    return;
  }
  if (t.kind === 'freeze') {
    const gx = Math.max(50, Math.min(W - 50, x + (x < W / 2 ? 160 : -160)));
    acts.push({ k: 'beam', c: t.c || '#bfe8ff', x, y, gx, gy: H - 26, t: 0, dur: 0.55, at: 0.25, hit: false, go: () => {
      const i = nearest(x, y, 80);
      for (let k = 0; k < 12; k++) fx.push({ x: rnd(x - 30, x + 30), y: rnd(y - 30, y + 30), vx: rnd(-1, 1), vy: rnd(-1, 1), life: 0.6, max: 0.6, c: '#bfe8ff', s: rnd(3, 6) });
      if (i >= 0 && b.frozen <= 0) { b.frozen = t.dur || 5; b.stand = 0; b.rise = 0; b.frozenD = b.p.map((p) => b.p.map((q) => Math.hypot(p.x - q.x, p.y - q.y))); setFace('frozen', t.dur || 5); say('ice', true); sfx('freeze'); }
      if (i >= 0) SIGN.apply(t.id, x, y, i);
    } });
    sfx('tick');
    return;
  }
  if (t.kind === 'wind') { // from the side you tap, across the room
    const cx = (b.p[8].x + b.p[9].x) / 2; winds.push({ T: t, dir: x < cx ? 1 : -1, y, t: t.dur, age: 0 }); sfx('wind'); setFace('scared', t.dur); SIGN.apply(t.id, cx, b.p[2].y, 2);
    if (t.word) addText(x, y - 30, t.word, '#ffe14a', true); say(t.stink ? 'stink' : 'wind', true);
    return;
  }
  if (t.kind === 'launch') { // it comes up out of the floor under him
    acts.push({ k: 'launch', L: t, x, t: 0, dur: 1.1, at: 0.35, hit: false, go: () => {
      let low = -1; b.p.forEach((p, i) => { const k = 1 - Math.abs(p.x - x) / 170; if (k > 0) { p.py = p.y + t.up * (0.6 + 0.4 * k); p.px = p.x + rnd(-1, 1); low = low < 0 || p.y > b.p[low].y ? i : low; } });
      sfx(t.snd || 'whoosh'); shake = 8;
      if (low >= 0) { SIGN.apply(t.id, x, b.p[low].y, low); b.stand = 0; b.rise = 0; hurt(low, t.up * 0.45); say('fly', true); setFace('scared', 1.5); if (t.wet) b.wet = 1; if (t.soot) b.soot = Math.min(1, b.soot + 0.5); }
      for (let k = 0; k < 30; k++) fx.push({ x: x + rnd(-24, 24), y: FLOOR - 10, vx: rnd(-1.5, 1.5), vy: rnd(-16, -6), life: rnd(0.6, 1.2), max: 1.2, c: t.c === 'fire' ? pickOf(FIRE) : t.c, s: rnd(5, 11), fall: true });
    } }); sfx('tick');
    return;
  }
  if (t.kind === 'swarm') { // little things that fly in and nip him (or tickle him)
    if (swarms.length > 2) swarms.shift();
    SIGN.apply(t.id, b.p[0].x, b.p[0].y, 0);
    const from = x < W / 2 ? -30 : W + 30;
    swarms.push({ T: t, t: t.dur, bugs: Array.from({ length: t.n }, () => ({ x: from, y: rnd(80, FLOOR - 80), vx: 0, vy: 0, ti: Math.floor(rnd(0, 14)), cd: rnd(0.6, 1.4) })) }); sfx(t.snd || 'buzz'); setFace('scared', 1);
    return;
  }
  return;
}
// the blow itself, when the glove (or the hand, the bat, the hammer) gets there
function strike(a) {
  const t = a.T, b = doll, x = a.x, y = a.y;
  const i = nearest(x, y, 75);
  if (i < 0) return;
  {
    const p = b.p[i]; let dx = p.x - x, dy = p.y - y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (d < 4) { dx = rnd(-0.5, 0.5); dy = -1; }
    if (t.down) { dx *= 0.4; dy = Math.abs(dy) * 0.3 + 0.9; }
    const f = t.power * (lowGrav ? 1.3 : 1);
    p.px -= dx * f; p.py -= dy * f;
    for (const [a, c] of b.sticks) { const o = a === i ? c : c === i ? a : -1; if (o >= 0) { b.p[o].px -= dx * f * 0.4; b.p[o].py -= dy * f * 0.4; } }
    sfx(t.snd, t.power / 20); hurt(i, t.power * 0.9); addText(x, y - 30, t.word, pickOf(['#ff4a4a', '#ff9a1a', '#3a7bd5']), true);
    if (!a.repeat) SIGN.apply(t.id, x, y, i);
    if (t.down) for (let k = 0; k < 5; k++) fx.push({ x: p.x, y: p.y - p.r, vx: rnd(-3, 3), vy: rnd(-4, -1), life: 0.8, max: 0.8, c: '#ffe14a', s: 7, star: true });
    for (let k = 0; k < 8; k++) { const an = rnd(0, 6.3); fx.push({ x, y, vx: Math.cos(an) * 4, vy: Math.sin(an) * 4, life: 0.25, max: 0.25, c: '#fff', s: 3 }); }
    a.hitPart = i;
  }
}
// the other tools still start straight away
function use2(t, x, y) {
  const b = doll;
  if (t.kind === 'drop') {
    const n = t.many || 1;
    for (let k = 0; k < n; k++) { const ox = n > 1 ? rnd(-160, 160) : 0, oy = n > 1 ? -k * 40 : 0; objs.push({ x: x + ox, y: 30 + oy, px: x + ox, py: 30 + oy - (t.anvil ? 4 : 1), r: t.r, m: t.m, T: t, a: t.anvil ? 0 : rnd(-0.3, 0.3), spin: n > 1 ? rnd(-0.1, 0.1) : 0, light: t.light || t.id === 'duck' }); }
    if (t.anvil || t.m >= 10) addText(x, 80, '!!!', '#e0342a', true);
  } else if (t.kind === 'bomb') {
    objs.push({ x, y: Math.min(y, FLOOR - 40), px: x, py: Math.min(y, FLOOR - 40), r: t.r, m: t.m, T: t, fuse: t.fuse, a: 0, spin: 0 }); sfx('hiss');
    if (Math.min(...b.p.map((p) => Math.hypot(p.x - x, p.y - y))) < 250) { setFace('scared', t.fuse); say('boom'); }
  } else if (t.kind === 'hole') {
    if (holes.length) return; holes.push({ x, y: Math.min(y, FLOOR - 60), t: t.dur || 4, age: 0, T: t }); SIGN.apply(t.id, x, y, 2); sfx(t.id === 'tornado' || t.id === 'cyclone' ? 'wind' : 'hole'); setFace('scared', 4); say('fly', true);
  } else if (t.kind === 'gravity') {
    lowGrav = !lowGrav; if (lowGrav) SIGN.apply('moon', b.p[0].x, b.p[0].y, 0); toast(lowGrav ? T().low : T().lowOff); sfx('whoosh');
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
  for (const h of holes) if (h.T.id !== 'hole') drawSwirl(h);
  for (const h of holes) if (h.T.id === 'hole') { const r = (46 + Math.sin(performance.now() / 90) * 4) * Math.min(1, h.age / 0.45, (h.t + 0.05) / 0.5); const gr = g.createRadialGradient(h.x, h.y, 4, h.x, h.y, r * 2.2); gr.addColorStop(0, '#000'); gr.addColorStop(0.45, '#1a0a3a'); gr.addColorStop(1, '#5a2aa000'); g.fillStyle = gr; g.beginPath(); g.arc(h.x, h.y, r * 2.2, 0, 7); g.fill(); g.strokeStyle = '#b48aff88'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(h.x, h.y, r * (0.6 + k * 0.35), performance.now() / 200 + k, performance.now() / 200 + k + 3.5); g.stroke(); } }
  // his shadow
  const cx = (b.p[8].x + b.p[9].x) / 2, low = Math.max(...b.p.map((p) => p.y));
  g.fillStyle = `rgba(0,0,0,${0.22 * Math.max(0.2, 1 - (FLOOR - low) / 300)})`; g.beginPath(); g.ellipse(cx, FLOOR + 4, 60, 10, 0, 0, 7); g.fill();
  const shaped = SIGN.shape(b); drawDoll(b); SIGN.over(b); if (shaped) g.restore();
  for (const o of objs) { const up = FLOOR - o.y - o.r; if (up > 6) { const k = Math.max(0, 1 - up / 600); g.fillStyle = `rgba(0,0,0,${0.08 + 0.25 * k})`; g.beginPath(); g.ellipse(o.x, FLOOR + 4, o.r * (0.6 + k), o.r * 0.25 * (0.6 + k), 0, 0, 7); g.fill(); } }
  for (const o of objs) drawObj(o);
  for (const r of rockets) { const p = doll.p[r.i], up = r.T.id === 'rocket' ? 0 : 38; emoji(r.T.icon, p.x + Math.sin(r.t * 9) * 3, p.y - up, r.T.id === 'rocket' ? 46 : 64, r.T.id === 'rocket' ? -Math.PI / 4 : Math.sin(r.t * 5) * 0.12, r.side < 0 ? 1 : -1); }
  for (const w of winds) { const ex = w.dir > 0 ? 54 : W - 54; g.globalAlpha = Math.max(0, Math.min(1, w.age / 0.15, w.t / 0.25)); emoji(w.T.icon, ex, w.y, 96, 0, w.dir > 0 ? -1 : 1); g.globalAlpha = 1; }
  for (const sw of swarms) for (const q of sw.bugs) emoji(sw.T.icon, q.x, q.y, 30, Math.max(-0.5, Math.min(0.5, q.vy * 0.05)), q.vx > 0 ? -1 : 1);
  for (const a of acts) if (a.t >= 0) drawAct(a);
  HERO.draw();
  for (const bo of bolts) { g.strokeStyle = bo.c || '#fff8a0'; g.lineWidth = 7; g.shadowColor = bo.c || '#ffe84a'; g.shadowBlur = 20; g.beginPath(); bo.pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); g.shadowBlur = 0; }
  for (const f of fx) {
    if (f.puddle) continue;
    const k = f.life / f.max; g.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
    if (f.flash) { g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(f.x, f.y, f.flash * (1.2 - k), 0, 7); g.fill(); }
    else if (f.tool) { g.font = '54px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.scale(1.3 - k * 0.5, 1.3 - k * 0.5); g.fillText(f.tool, 0, 0); g.restore(); }
    else if (f.star) { g.fillStyle = f.c; star(f.x, f.y, f.s); }
    else if (f.emo) emoji(f.emo, f.x, f.y, f.size, f.rot);
    else if (f.ring) { g.strokeStyle = f.ring; g.lineWidth = 8 * k; g.beginPath(); g.arc(f.x, f.y, f.r0 + (1 - k) * 150, 0, 7); g.stroke(); }
    else if (f.screen) { g.globalAlpha = k * 0.45; g.fillStyle = f.screen; g.fillRect(-20, -20, W + 40, H + 40); }
    else if (f.bubble) { g.strokeStyle = '#bfe8ff'; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, f.s, 0, 7); g.stroke(); g.fillStyle = '#ffffff99'; g.beginPath(); g.arc(f.x - f.s * 0.35, f.y - f.s * 0.35, f.s * 0.25, 0, 7); g.fill(); }
    else if (f.conf) { g.fillStyle = f.c; g.save(); g.translate(f.x, f.y); g.rotate(f.life * 9); g.fillRect(-f.s, -f.s / 2, f.s * 2, f.s); g.restore(); }
    else if (f.stinky) { g.strokeStyle = '#8ac83a'; g.lineWidth = 3; g.beginPath(); for (let j = 0; j < 8; j++) { const yy = f.y - j * 4; g.lineTo(f.x + Math.sin(j * 1.3 + f.life * 8) * 6, yy); } g.stroke(); }
    else { g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.smoke ? f.s * (1.6 - k * 0.6) : f.s * (f.shard ? 1 : k + 0.3), 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
  for (const t of texts) { const k = t.life; g.globalAlpha = Math.min(1, k * 2); g.font = `900 ${t.big ? 40 : 26}px "Arial Black", sans-serif`; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#2a1a0a'; g.strokeText(t.s, t.x, t.y); g.fillStyle = t.c; g.fillText(t.s, t.x, t.y); g.globalAlpha = 1; }
  if (b.sayT > 0) bubble(b.p[HEAD].x, b.p[HEAD].y - 46, b.say);
  cursor();
  g.restore();
}
function star(x, y, r) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
function limb(a, c, w, col, edge) { g.lineCap = 'round'; g.strokeStyle = edge; g.lineWidth = w + 5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
const SKIN = '#e8c48e', SKIN2 = '#a8804e';
function drawDoll(b) {
  const p = b.p, shirt = SIGN.paint() || SHIRTS[S.shirt] || SHIRTS[0], ice = b.frozen > 0, xray = b.shock > 0 && Math.floor(performance.now() / 70) % 2;
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
  const f = (b.blink > 0 && b.face === 'calm') || b.face === 'sleep' ? 'blink' : b.face;
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
  if (o.fuse != null) { const k = 1 + Math.max(0, 0.8 - o.fuse) * 0.4 + Math.sin(performance.now() / 50) * 0.04 * (o.fuse < 0.8); g.scale(k, k); }
  if (t.id === 'anvil') { g.fillStyle = '#4a4f5a'; g.strokeStyle = '#22252b'; g.lineWidth = 3; g.beginPath(); g.moveTo(-34, -16); g.lineTo(30, -16); g.quadraticCurveTo(44, -14, 46, -6); g.lineTo(14, -2); g.lineTo(10, 10); g.lineTo(22, 22); g.lineTo(-24, 22); g.lineTo(-12, 10); g.lineTo(-16, 0); g.quadraticCurveTo(-34, -4, -34, -16); g.fill(); g.stroke(); }
  else if (t.id === 'bowl') { g.fillStyle = '#2a3a8a'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); g.fillStyle = '#ffffff33'; g.beginPath(); g.arc(-8, -8, 8, 0, 7); g.fill(); g.fillStyle = '#111'; for (const [x, y] of [[4, -6], [10, -2], [6, 4]]) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } }
  else if (t.id === 'bomb') { g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); g.fillStyle = '#555'; g.fillRect(-6, -o.r - 6, 12, 8); g.strokeStyle = '#a87a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -o.r - 6); g.quadraticCurveTo(8, -o.r - 16, 14, -o.r - 12); g.stroke(); g.fillStyle = '#ffffff44'; g.beginPath(); g.arc(-6, -6, 5, 0, 7); g.fill(); if (o.fuse < 0.6 && Math.floor(o.fuse * 12) % 2) { g.fillStyle = '#ff3a2a88'; g.beginPath(); g.arc(0, 0, o.r, 0, 7); g.fill(); } }
  else if (t.id === 'cracker') { g.fillStyle = '#e0342a'; g.fillRect(-7, -14, 14, 28); g.fillStyle = '#ffd24a'; g.fillRect(-7, -6, 14, 4); g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.lineTo(5, -22); g.stroke(); }
  else if (t.id === 'duck') { // a yellow rubber duck
    g.fillStyle = '#ffd23a'; g.strokeStyle = '#d89a10'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 4, 16, 11, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.arc(-7, -8, 9, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ff8a1a'; g.beginPath(); g.moveTo(-15, -9); g.lineTo(-23, -6); g.lineTo(-15, -4); g.fill();
    g.fillStyle = '#2a1a0a'; g.beginPath(); g.arc(-9, -10, 1.8, 0, 7); g.fill(); g.fillStyle = '#ffe98a'; g.beginPath(); g.ellipse(5, 2, 7, 4, -0.4, 0, 7); g.fill(); }
  else { g.font = `${o.r * 2.2}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; if (o.fuse != null && o.fuse < 0.6 && Math.floor(o.fuse * 12) % 2) g.filter = 'brightness(1.8)'; g.fillText(t.icon, 0, 2); g.filter = 'none'; }
  g.restore();
  if (o.fuse != null) { const n = Math.ceil(o.fuse), k = o.fuse % 1; g.font = `900 ${22 + k * 10}px "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineWidth = 5; g.strokeStyle = '#2a1a0a'; g.fillStyle = n <= 1 ? '#ff4a2a' : '#fff'; g.strokeText(n, o.x, o.y - o.r - 26); g.fillText(n, o.x, o.y - o.r - 26); }
}
// the whirlpool, the magnet, the tornado, the galaxy: rings of their colour and the thing itself, turning
function drawSwirl(h) {
  const T0 = performance.now() / 1000, k = Math.max(0, Math.min(1, h.age / 0.45, (h.t + 0.05) / 0.5)), R = (h.T.R || 420) * 0.22 * k;
  g.save(); g.globalAlpha = 0.75 * k; g.strokeStyle = h.T.c; g.lineWidth = 4;
  for (let j = 0; j < 5; j++) { const a0 = T0 * (h.T.id === 'magnet' ? 0 : 4) + j * 1.25; g.beginPath(); if (h.T.id === 'magnet') g.arc(h.x, h.y, R * (0.3 + ((T0 * 0.9 + j / 5) % 1)), 0, 7); else g.arc(h.x, h.y, R * (0.35 + j * 0.16), a0, a0 + 2.6); g.stroke(); }
  g.restore(); emoji(h.T.icon, h.x, h.y, 70 * k + 10, h.T.id === 'magnet' ? Math.sin(T0 * 20) * 0.06 : T0 * (h.T.id === 'tornado' ? 0 : 3));
}
// the other blows, drawn from what they are and the way they are swung
function drawHit(a) {
  const t = a.T, st = t.style || 'jab', k = a.t / a.dur, ic = t.icon;
  g.save(); g.globalAlpha = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
  if (st === 'jab' || st === 'poke') { // straight in from the side, and back
    const x0 = st === 'jab' ? (a.side < 0 ? -40 : W + 40) : a.x + a.side * 150, out = a.t < a.at ? easeIn(a.t / a.at) : a.t < a.at + 0.06 ? 1 : 1 - ease((a.t - a.at - 0.06) / (a.dur - a.at - 0.06));
    const gx = x0 + (a.x - a.side * 22 - x0) * out, sq = a.hit && a.t < a.at + 0.08 ? 0.8 : 1;
    if (st === 'jab') { g.strokeStyle = '#ffffff99'; g.lineWidth = 5; for (const dy of [-16, 0, 16]) { g.beginPath(); g.moveTo(gx + a.side * 40, a.y + dy); g.lineTo(gx + a.side * (40 + 60 * out), a.y + dy); g.stroke(); } }
    g.translate(gx, a.y); g.scale(sq * (a.side < 0 ? -1 : 1), 2 - sq); g.font = `${st === 'jab' ? 62 : 52}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, 0, 0);
  } else if (st === 'swing') { // round from behind, like the bat
    const px = a.x + a.side * 110, py = a.y + 20, start = a.side < 0 ? -1.9 : -1.25, hitA = Math.atan2(a.y - py, a.x - px), end = hitA + (hitA - start) * 0.6;
    const an = a.t < a.at ? start + (hitA - start) * easeIn(a.t / a.at) : hitA + (end - hitA) * ease(clamp01((a.t - a.at) / 0.12));
    g.strokeStyle = '#ffffff88'; g.lineWidth = 16; g.beginPath(); g.arc(px, py, 104, Math.min(an, start + (an - start) * 0.4), Math.max(an, start + (an - start) * 0.4)); g.stroke();
    g.translate(px + Math.cos(an) * 104, py + Math.sin(an) * 104); g.rotate(an + Math.PI / 2); g.font = '64px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, 0, 0);
  } else if (st === 'smash') { // lifted up, held a moment, brought down
    const L = 92, px = a.x + a.side * L, py = a.y + 8, base = Math.atan2(a.y - py, a.x - px), lift = a.side * 1.5;
    const an = a.t < 0.2 ? base + lift * ease(a.t / 0.2) : a.t < a.at ? base + lift * (1 - easeIn((a.t - 0.2) / (a.at - 0.2))) : base - a.side * 0.05 * Math.sin((a.t - a.at) * 40) * (1 - k);
    const sq = a.hit && a.t < a.at + 0.08 ? 0.85 : 1; g.translate(px + Math.cos(an) * L, py + Math.sin(an) * L); g.rotate(an + Math.PI / 2); g.scale(1 / sq, sq); g.font = '72px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, 0, 0);
  } else { // slap: an arc across, with a blur behind
    const px = a.x + a.side * 40, py = a.y + 130, r = 130, s0 = a.side < 0 ? -2.3 : -0.84, s1 = a.side < 0 ? -0.84 : -2.3, an = s0 + (s1 - s0) * easeIn(clamp01(k / (a.at / a.dur) * 0.8)), al = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    for (let j = 1; j <= 3; j++) { const aj = an - (s1 - s0) * 0.08 * j; g.globalAlpha = al * 0.25 / j; emoji(ic, px + Math.cos(aj) * r, py + Math.sin(aj) * r, 56, aj + Math.PI / 2, -a.side); }
    g.globalAlpha = al; emoji(ic, px + Math.cos(an) * r, py + Math.sin(an) * r, 62, an + Math.PI / 2, -a.side);
  }
  g.restore();
  if (a.hit && a.t < a.at + 0.11) burst(a.x, a.y, 1 - (a.t - a.at) / 0.11);
}
const ease = (k) => 1 - (1 - k) * (1 - k), easeIn = (k) => k * k, clamp01 = (k) => Math.max(0, Math.min(1, k));
function emoji(ch, x, y, size, rot = 0, flip = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(flip, 1); g.font = `${size}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, 0); g.restore(); }
function drawAct(a) {
  const k = a.t / a.dur;
  if (a.k === 'punch') { // a glove on a spring, out from the side of the room
    const x0 = a.side < 0 ? -30 : W + 30, out = a.t < a.at ? ease(a.t / a.at) : a.t < a.at + 0.06 ? 1 : 1 - ease((a.t - a.at - 0.06) / (a.dur - a.at - 0.06));
    const gx = x0 + (a.x - a.side * 26 - x0) * out, gy = a.y;
    g.strokeStyle = '#8a8f9a'; g.lineWidth = 4; g.beginPath(); const n = 14; for (let j = 0; j <= n; j++) { const xx = x0 + (gx - x0) * j / n, yy = gy + (j % 2 ? -10 : 10) * (j && j < n); j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
    const sq = a.hit && a.t < a.at + 0.08 ? 0.8 : 1; g.save(); g.translate(gx, gy); g.scale(sq * (a.side < 0 ? -1 : 1), 2 - sq); g.font = '64px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🥊', 0, 0); g.restore();
    if (a.hit && a.t < a.at + 0.12) burst(a.x, a.y, 1 - (a.t - a.at) / 0.12);
  } else if (a.k === 'slap') { // a hand sweeps across in an arc
    const px = a.x + a.side * 40, py = a.y + 130, r = 130, s0 = a.side < 0 ? -2.3 : -0.84, s1 = a.side < 0 ? -0.84 : -2.3;
    const an = s0 + (s1 - s0) * easeIn(clamp01(k / (a.at / a.dur) * 0.8)) * (k < 0.9 ? 1 : 1);
    for (let j = 1; j <= 3; j++) { const aj = an - (s1 - s0) * 0.08 * j; g.globalAlpha = 0.25 / j; emoji('🖐️', px + Math.cos(aj) * r, py + Math.sin(aj) * r, 60, aj + Math.PI / 2, -a.side); }
    g.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1; emoji('🖐️', px + Math.cos(an) * r, py + Math.sin(an) * r, 64, an + Math.PI / 2, -a.side); g.globalAlpha = 1;
    if (a.hit && a.t < a.at + 0.1) burst(a.x, a.y, 1 - (a.t - a.at) / 0.1);
  } else if (a.k === 'bat') { // a bat swung round from behind
    const px = a.x + a.side * 110, py = a.y + 20, start = a.side < 0 ? -1.9 : -1.25, hitA = Math.atan2(a.y - py, a.x - px), end = hitA + (hitA - start) * 0.6;
    const an = a.t < a.at ? start + (hitA - start) * easeIn(a.t / a.at) : hitA + (end - hitA) * ease(clamp01((a.t - a.at) / 0.12));
    g.save(); g.globalAlpha = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
    g.strokeStyle = '#ffffff88'; g.lineWidth = 16; g.beginPath(); g.arc(px, py, 112, Math.min(an, start + (an - start) * 0.4), Math.max(an, start + (an - start) * 0.4)); g.stroke();
    g.translate(px, py); g.rotate(an); g.fillStyle = '#c8894a'; g.strokeStyle = '#7a4c28'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(10, -5); g.lineTo(80, -13); g.quadraticCurveTo(140, -14, 140, 0); g.quadraticCurveTo(140, 14, 80, 13); g.lineTo(10, 5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#3a2a1a'; g.fillRect(0, -6, 26, 12); g.restore();
    if (a.hit && a.t < a.at + 0.1) burst(a.x, a.y, 1 - (a.t - a.at) / 0.1);
  } else if (a.k === 'hammer') { // lifted up, held a moment, brought down
    const L = 95, px = a.x + a.side * L, py = a.y + 8, base = Math.atan2(a.y - py, a.x - px), lift = a.side * 1.5;
    const an = a.t < 0.2 ? base + lift * ease(a.t / 0.2) : a.t < a.at ? base + lift * (1 - easeIn((a.t - 0.2) / (a.at - 0.2))) : base - a.side * 0.05 * Math.sin((a.t - a.at) * 40) * (1 - k);
    g.save(); g.globalAlpha = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1; g.translate(px, py); g.rotate(an);
    g.fillStyle = '#b07a48'; g.strokeStyle = '#6a4424'; g.lineWidth = 3; g.fillRect(-8, -6, L - 10, 12); g.strokeRect(-8, -6, L - 10, 12);
    g.fillStyle = '#5a606c'; g.strokeStyle = '#2a2d33'; g.beginPath(); g.roundRect(L - 22, -26, 40, 52, 6); g.fill(); g.stroke(); g.fillStyle = '#ffffff33'; g.fillRect(L - 18, -22, 8, 44); g.restore();
    if (a.hit && a.t < a.at + 0.12) { burst(a.x, a.y, 1 - (a.t - a.at) / 0.12); }
  } else if (a.k === 'toss') { // a hand comes up from below and flicks
    const up = k < 0.35 ? ease(k / 0.35) : 1 - ease((k - 0.35) / 0.65), rot = (a.x < W / 2 ? 1 : -1) * (k < 0.35 ? -0.3 + k : 0.3);
    emoji('✋', a.x, H + 30 - up * 140, 80, rot);
  } else if (a.k === 'rocketIn') { // the rocket flies in and grabs on
    const p = doll.p[a.i], e = ease(clamp01(k)), x = a.x + (p.x - a.x) * e, y = a.y + (p.y - a.y) * e;
    emoji(a.icon, x, y, a.icon === '🚀' ? 46 : 64, a.icon === '🚀' ? Math.atan2(p.y - a.y, p.x - a.x) + Math.PI / 4 : 0, a.icon === '🚀' ? 1 : a.side < 0 ? -1 : 1);
    for (let j = 0; j < 2; j++) fx.push({ x: x - a.side * 18, y, vx: rnd(-1, 1), vy: rnd(-1, 1), life: 0.3, max: 0.3, c: pickOf(['#ffb02e', '#ff6a2a', '#bbb']), s: rnd(4, 8) });
  } else if (a.k === 'cloud') { // a storm cloud gathers, then strikes
    const grow = ease(clamp01(a.t / 0.22)), fade = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1, cx = a.x, cy = 70;
    g.save(); g.globalAlpha = fade; g.fillStyle = a.hit && a.t < a.at + 0.08 ? '#fff6a0' : '#4a4e5e';
    for (const [dx, dy, r] of [[-50, 8, 30], [-18, -8, 38], [22, -4, 34], [52, 10, 26], [0, 16, 32]]) { g.beginPath(); g.arc(cx + dx * grow, cy + dy * grow, r * grow, 0, 7); g.fill(); }
    if (!a.hit) { g.fillStyle = '#9aa0b8'; for (let j = 0; j < 5; j++) { g.fillRect(cx - 40 + j * 20 + Math.sin(a.t * 30 + j) * 3, cy + 30 + ((a.t * 400 + j * 37) % 60), 2, 10); } }
    g.restore();
  } else if (a.k === 'beam') { // a ray gun at the bottom fires a beam of cold
    const e = ease(clamp01(a.t / a.at)), fade = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1, ex = a.gx + (a.x - a.gx) * e, ey = a.gy + (a.y - a.gy) * e;
    const an = Math.atan2(a.y - a.gy, a.x - a.gx);
    g.save(); g.globalAlpha = fade; g.translate(a.gx, a.gy); g.rotate(an); g.fillStyle = '#5ab4f0'; g.strokeStyle = '#1a4a7a'; g.lineWidth = 3; g.beginPath(); g.roundRect(-30, -12, 50, 24, 8); g.fill(); g.stroke(); g.fillStyle = '#c8ecff'; g.fillRect(20, -6, 18, 12); g.fillStyle = '#1a4a7a'; g.fillRect(-18, 10, 12, 20); g.restore();
    g.save(); g.globalAlpha = fade; g.strokeStyle = a.c; g.lineWidth = 10; g.shadowColor = a.c; g.shadowBlur = 18; g.beginPath();
    for (let j = 0; j <= 20; j++) { const q = j / 20, xx = a.gx + (ex - a.gx) * q, yy = a.gy + (ey - a.gy) * q, w = Math.sin(q * 20 - a.t * 40) * 6; j ? g.lineTo(xx - Math.sin(an) * w, yy + Math.cos(an) * w) : g.moveTo(xx, yy); }
    g.stroke(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  } else if (a.k === 'launch') { // up out of the floor, then down again
    const up = a.t < a.at ? ease(a.t / a.at) : 1 - easeIn(clamp01((a.t - a.at - 0.3) / (a.dur - a.at - 0.3)));
    g.save(); g.beginPath(); g.rect(0, 0, W, FLOOR + 6); g.clip(); emoji(a.L.icon, a.x, FLOOR + 40 - up * 80, 84, Math.sin(a.t * 30) * 0.05 * (a.t < a.at)); g.restore();
    if (!a.hit) { g.fillStyle = '#5a3a2244'; g.beginPath(); g.ellipse(a.x, FLOOR + 4, 50 * up + 10, 8, 0, 0, 7); g.fill(); }
  } else if (a.T) drawHit(a);
}
// the comic flash where a blow lands
function burst(x, y, k) { g.save(); g.globalAlpha = k; g.fillStyle = '#fff6a0'; g.strokeStyle = '#ff9a1a'; g.lineWidth = 3; g.beginPath(); for (let j = 0; j < 16; j++) { const an = j * Math.PI / 8, r = j % 2 ? 18 : 40 * (1.2 - k * 0.4); g.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
// what follows the pointer: the hand (open, or holding), the feather, or the tool itself for a mouse
function cursor() {
  if (!pointer || (!pointer.down && (!pointer.mouse || performance.now() - (pointer.seen || 0) > 4000))) return;
  const x = pointer.x, y = pointer.y, t = TOOLS.find((k) => k.id === tool);
  if (tool === 'hand') { emoji(grab ? '✊' : '✋', x, y + 6, grab ? 44 : 40, grab ? 0 : -0.2); return; }
  if (t.kind === 'tickle') { emoji(t.icon, x + 10, y - 14, 44, -0.6 + Math.sin(performance.now() / 70) * (pointer.down ? 0.45 : 0.1)); return; }
  if (pointer.mouse && !pointer.down && !t.icon.startsWith('<')) { g.globalAlpha = 0.55; emoji(t.icon, x + 22, y - 22, 30); g.globalAlpha = 1; }
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
  for (const f of fx) { f.life -= dt; if (f.emo && f.vx) f.rot += f.vx * 0.01; if (f.vx != null) { f.x += f.vx; f.y += f.vy; if (f.fall) f.vy += 0.3; if (f.star || f.shard) f.vy += 0.15; } }
  for (let i = fx.length - 1; i >= 0; i--) if (fx[i].life <= 0) fx.splice(i, 1);
  if (fx.length > 400) fx.splice(0, fx.length - 400);
  for (const t of texts) { t.life -= dt; t.y -= dt * 40; } for (let i = texts.length - 1; i >= 0; i--) if (texts[i].life <= 0) texts.splice(i, 1);
  HERO.tick(dt); SIGN.tick(dt);
  for (const l of later) { l.t -= dt; if (l.t <= 0 && !l.done) { l.done = true; l.fn(); } } for (let i = later.length - 1; i >= 0; i--) if (later[i].done) later.splice(i, 1);
  for (const a of acts) { a.t += dt; if (!a.hit && a.t >= a.at) { a.hit = true; a.T ? strike(a) : a.go?.(); } }
  for (let i = acts.length - 1; i >= 0; i--) if (acts[i].t >= acts[i].dur) acts.splice(i, 1);
  for (const h of holes) h.age += dt;
  for (const w of winds) { w.age += dt; w.t -= dt; const ex = w.dir > 0 ? 80 : W - 80; for (let k = 0; k < 3; k++) fx.push({ x: ex, y: w.y + rnd(-60, 60), vx: w.dir * rnd(10, 18), vy: rnd(-0.5, 0.5), life: 0.9, max: 0.9, c: w.T.c === 'fire' ? pickOf(FIRE) : w.T.c, s: rnd(3, 7), smoke: !!w.T.stink });
    if (w.T.soot) b.soot = Math.min(1, b.soot + dt * 0.3); if (w.T.stink) setFace('ouch', 0.3); if (w.T.c === 'fire' && Math.random() < dt * 3) sfx('hiss'); }
  for (let i = winds.length - 1; i >= 0; i--) if (winds[i].t <= 0) winds.splice(i, 1);
  for (const sw of swarms) { sw.t -= dt; for (const q of sw.bugs) {
    const p = b.p[q.ti], gone = sw.t <= 0, tx = gone ? (q.x < W / 2 ? -80 : W + 80) : p.x, ty = gone ? q.y - 40 : p.y;
    q.vx += (tx - q.x) * 0.004 + rnd(-0.6, 0.6); q.vy += (ty - q.y) * 0.004 + rnd(-0.6, 0.6); q.vx *= 0.94; q.vy *= 0.94; q.x += q.vx; q.y += q.vy; q.cd -= dt;
    if (!gone && q.cd <= 0 && Math.hypot(q.x - p.x, q.y - p.y) < p.r + 14) { q.cd = rnd(0.5, 1.3); q.ti = Math.floor(rnd(0, 14)); q.vx = rnd(-6, 6); q.vy = rnd(-6, -2);
      if (sw.T.tickle) { S.coins += 1; coinPile += 1; setFace('laugh', 0.8); sfx('laugh'); say('tickle'); }
      else { p.px -= rnd(-1, 1) * sw.T.power; p.py += sw.T.power * 0.5; hurt(q.ti, sw.T.power + 1); say('bug'); if (sw.T.snd) sfx(sw.T.snd); fx.push({ x: q.x, y: q.y, vx: 0, vy: -1, life: 0.3, max: 0.3, c: '#ffe14a', s: 6, star: true }); } } } }
  for (let i = swarms.length - 1; i >= 0; i--) if (swarms[i].t < -2.5) swarms.splice(i, 1);
  for (const bo of bolts) bo.life -= dt; for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].life <= 0) bolts.splice(i, 1);
  for (let i = rockets.length - 1; i >= 0; i--) if (rockets[i].t <= 0) { const p = b.p[rockets[i].i], r = rockets.splice(i, 1)[0]; if ((r.T.blast ?? 170) > 0) boom(p.x, p.y, r.T.blast ?? 170, 26, r.T.trail); else { addText(p.x, p.y - 40, 'BYE!', '#ffffff', true); sfx('pop'); fx.push({ tool: r.T.icon, x: p.x, y: p.y - 38, vx: r.side * -6, vy: -5, life: 0.8, max: 0.8, rot: 0 }); } }
  for (let i = holes.length - 1; i >= 0; i--) { holes[i].t -= dt; if (holes[i].t <= 0) { const h = holes.splice(i, 1)[0]; if (h.T.boom !== false) boom(h.x, h.y, h.T.id === 'galaxy' ? 340 : 260, h.T.id === 'galaxy' ? 40 : 30, h.T.id === 'galaxy' ? ['#b48aff', '#ffffff', '#7ad0ff'] : null); else sfx('whoosh'); } else if (Math.min(...b.p.map((p) => Math.hypot(p.x - holes[i].x, p.y - holes[i].y))) < 60) { coinPile += 1; S.coins += 1; } }
  for (const o of objs) if (!['anvil', 'cracker', 'duck'].includes(o.T.id)) o.a = (o.a || 0) + (o.spin || 0) + (o.x - o.px) / o.r; // round things roll
  b.faceT -= dt; if (b.faceT <= 0 && b.face !== 'calm') b.face = 'calm';
  b.blink -= dt; if (b.blink < -3 - Math.random() * 3) b.blink = 0.12;
  b.dizzy = Math.max(0, b.dizzy - dt * 40); b.sayT -= dt; b.sayCool -= dt; b.shock -= dt;
  if (b.frozen > 0) { b.frozen -= dt; if (b.frozen <= 0) { b.frozenD = null; sfx('shatter'); } }
  // coins pop up in little bunches
  coinT -= dt; if (coinPile > 0 && coinT <= 0) { addText(b.p[HEAD].x + rnd(-30, 30), b.p[HEAD].y - 40, `+${coinPile}`, '#ffd23a'); sfx('coin'); coinPile = 0; coinT = 0.25; updateCoins(); save(); }
  // tickling
  const tk = TOOLS.find((k) => k.id === tool);
  if (tk.kind === 'tickle' && pointer?.down) {
    const near = nearest(pointer.x, pointer.y, 30) >= 0, moving = Math.hypot(pointer.x - (pointer.lx ?? pointer.x), pointer.y - (pointer.ly ?? pointer.y)) > 1;
    if (near && moving) { tickleT += dt; setFace('laugh', 0.5); if (tickleT > (tk.rate || 0.3)) { tickleT = 0; SIGN.apply(tk.id, pointer.x, pointer.y, Math.max(0, nearest(pointer.x, pointer.y, 60)), { cool: 1.6 }); S.coins += 1; coinPile += 1; sfx('laugh'); say('tickle'); fx.push({ x: pointer.x, y: pointer.y, vx: rnd(-1, 1), vy: rnd(-2, 0), life: 0.6, max: 0.6, c: '#ffffff', s: 4 }); } }
    pointer.lx = pointer.x; pointer.ly = pointer.y;
  }
  idle += dt; if (idle > 14) { idle = 0; say('idle', true); }
}

// ---------------------------------------------------------------- pointer
function toWorld(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); const w = toWorld(e); pointer = { ...w, down: true, mouse: e.pointerType === 'mouse', seen: performance.now() }; hideHint(); use(w.x, w.y); });
cv.addEventListener('pointermove', (e) => { const w = toWorld(e); if (pointer) { pointer.x = w.x; pointer.y = w.y; } else pointer = { ...w, down: false }; pointer.mouse = e.pointerType === 'mouse'; pointer.seen = performance.now(); });
cv.addEventListener('pointerleave', () => { if (pointer && !pointer.down) pointer.seen = 0; });
const up = () => { if (grab?.obj) { /* it keeps the speed it was moving at */ } if (grab?.doll != null) { const p = doll.p[grab.doll]; if (Math.hypot(p.x - p.px, p.y - p.py) > 8) SIGN.apply('hand', p.x, p.y, grab.doll); } grab = null; if (pointer) pointer.down = false; };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

// ---------------------------------------------------------------- the toolbar, the shop
// the toolbar: what you own, then the next few to buy, then the shop
function toolbar() {
  const next = TOOLS.filter((t) => !S.own.includes(t.id)).sort((a, b) => a.price - b.price).slice(0, 3);
  $('#tools').innerHTML = [...TOOLS.filter((t) => S.own.includes(t.id)), ...next].map((t) => { const own = S.own.includes(t.id); return `<button class="tool ${tool === t.id ? 'on' : ''} ${own ? '' : 'locked'}" data-tool="${t.id}" title="${tn(t)}"><span>${t.icon}</span><small>${own ? tn(t) : '🔒 ' + money(t.price)}</small></button>`; }).join('') + `<button class="tool more" id="moreBtn"><span>🛒</span><small>${T().more}</small></button>`;
  $('#tools .on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function updateCoins() { $('#coins').textContent = S.coins.toLocaleString(); }
function labels() {
  const t = T(); document.title = t.title; document.documentElement.lang = S.lang === 'en' ? 'en' : 'zh-Hant';
  $('#shopBtn').innerHTML = `🛒<span> ${t.shop}</span>`; $('#standBtn').innerHTML = `🧍<span> ${t.stand}</span>`; $('#cleanBtn').innerHTML = `🧽<span> ${t.clean}</span>`; $('#langBtn').innerHTML = `🌐<span> ${t.lang}</span>`;
  $('#muteBtn').textContent = muted() ? '🔇' : '🔊'; $('#hint').textContent = t.hint; $('#coinsLbl').title = t.coins;
}
function toast(s) { const el = $('#toast'); el.textContent = s; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800); }
function hideHint() { $('#hint').classList.add('gone'); }
const SHELVES = ['hit', 'throw', 'drop', 'bomb', 'magic', 'hero'];
function shop(tab = 'tools') {
  if (tab === 'tools') tab = SHELF(TOOLS.find((k) => k.id === tool));
  const t = T(), card = (x, own, on, price, kind) => `<div class="item ${own ? 'own' : ''}"><span class="ic">${x.icon}</span><b>${tn(x)}</b>${own
    ? `<button class="mini ${on ? 'on' : ''}" data-${kind}="${x.id}">${on ? (kind === 'wear' ? t.wearing : '✓') : kind === 'wear' ? t.wear : t.use}</button>`
    : `<button class="mini buy" data-buy="${kind}:${x.id}" ${S.coins < price ? 'disabled' : ''}>🪙 ${money(price)}</button>${S.coins < price ? `<small>${t.need(money(price - S.coins))}</small>` : ''}`}</div>`;
  $('#dlgBody').innerHTML = `<h2>🛒 ${t.shop} <span class="cn">🪙 ${S.coins.toLocaleString()}</span></h2>
    <div class="tabs">${SHELVES.map((k) => `<button class="tab ${tab === k ? 'on' : ''}" data-tab="${k}">${t.shelf[k]}</button>`).join('')}<button class="tab ${tab === 'hats' ? 'on' : ''}" data-tab="hats">${t.hats}</button></div>
    ${tab !== 'hats' ? `<p class="have">${t.have(TOOLS.filter((x) => S.own.includes(x.id)).length, TOOLS.length)}</p><div class="grid">${TOOLS.filter((x) => SHELF(x) === tab).sort((a, b) => a.price - b.price).map((x) => card(x, S.own.includes(x.id), tool === x.id, x.price, 'use')).join('')}</div>`
      : `<div class="grid">${HATS.map((x) => card(x, S.hats.includes(x.id), S.hat === x.id, x.price, 'wear')).join('')}</div>
         <h3>${t.shirt}</h3><div class="shirts">${SHIRTS.map((c, i) => `<button class="sw ${S.shirt === i ? 'on' : ''}" data-shirt="${i}" style="background:${c}"></button>`).join('')}</div>`}`;
  $('#dlg').dataset.tab = tab;
  if (!$('#dlg').open) $('#dlg').showModal();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tool) { const t = TOOLS.find((x) => x.id === b.dataset.tool); if (!S.own.includes(t.id)) return shop('tools'); if (t.kind === 'gravity') { lowGrav = !lowGrav; toast(lowGrav ? T().low : T().lowOff); } else tool = t.id; toolbar(); hideHint(); }
  else if (b.id === 'shopBtn' || b.id === 'moreBtn') shop('tools');
  else if (b.id === 'standBtn') { standUp(false); doll.frozen = 0; sfx('whoosh'); }
  else if (b.id === 'cleanBtn') { doll.decals = []; doll.soot = 0; sfx('splat', 0.4); for (let k = 0; k < 20; k++) fx.push({ x: doll.p[HEAD].x + rnd(-40, 40), y: doll.p[HEAD].y + rnd(-40, 120), vx: rnd(-1, 1), vy: rnd(-2, 0), life: 0.8, max: 0.8, c: '#e8f6ff', s: rnd(4, 9) }); }
  else if (b.id === 'muteBtn') { setMute(!muted()); labels(); }
  else if (b.id === 'langBtn') { S.lang = S.lang === 'en' ? 'zh' : 'en'; save(); labels(); toolbar(); }
  else if (b.dataset.tab) { shop(b.dataset.tab); $('#dlg').scrollTop = 0; }
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
window.BB = { S, HERO, SIGN, TOOLS, get doll() { return doll; }, use, objs, acts, winds, swarms, holes, rockets, setTool: (t) => { tool = t; toolbar(); }, step };
