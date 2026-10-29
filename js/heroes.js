// 超級英雄 Superheroes: four tools at a trillion coins each. Each brings a hero of the family flying in — 疾速喬許 Speed
// Josh, 火箭賈斯柏 Rocket Jasper, 程式傑夫 Code Jeff, 星光艾琳 Star Erin — who does ten of his or her moves on the buddy,
// picked at random (never the same twice in a row), then strikes a pose and flies off.
// A move is a kind and its numbers; the kinds:
//   punch (f; n for a flurry; up for an uppercut; boom), kick (f), slam (lift him and smash him down), spin (whirl him
//   round and throw him), beam (c; fx: fire, ice, shock, laser, heart), bolt (n; c), ball (an energy ball: pal; n;
//   R), quake (dive into the floor: he is thrown up), tornado (a tool's whirl), wind (a tool's blast), meteor (things
//   rain down: icon, n), swarm (icon, n), rocket (strapped to a rocket), freeze
export const HERO_TOOLS = [
  { id: 'josh', icon: '⚡', kind: 'hero', price: 1e12, zh: '喬許', en: 'Josh', hero: 'josh' },
  { id: 'jasper', icon: '🚀', kind: 'hero', price: 1e12, zh: '賈斯柏', en: 'Jasper', hero: 'jasper' },
  { id: 'jeff', icon: '💻', kind: 'hero', price: 1e12, zh: '傑夫', en: 'Jeff', hero: 'jeff' },
  { id: 'erin', icon: '⭐', kind: 'hero', price: 1e12, zh: '艾琳', en: 'Erin', hero: 'erin' },
];
const HEROES = {
  josh: { zh: '疾速喬許', en: 'Speed Josh', suit: '#1f5fd6', suit2: '#16409a', acc: '#ffd23a', cape: '#ffd23a', mark: '⚡', hair: '#1a1210', style: 'spiky', size: 0.95,
    hi: { zh: '我是最快的！', en: 'Fastest kid alive!' }, bye: { zh: '太慢了啦！', en: 'Too slow!' },
    moves: [
      { zh: '音速連打', en: 'Sonic Flurry', k: 'punch', f: 9, n: 9, word: 'PAPAPAPA!' }, { zh: '閃電直拳', en: 'Lightning Jab', k: 'punch', f: 30, shock: true, word: 'ZAP!' },
      { zh: '旋風踢', en: 'Cyclone Kick', k: 'kick', f: 34, word: 'WHOOSH!' }, { zh: '雷霆萬鈞', en: 'Thunderstorm', k: 'bolt', n: 5, c: '#fff36a' },
      { zh: '超音速衝撞', en: 'Sonic Boom Tackle', k: 'punch', f: 44, boom: 140, word: 'SONIC BOOM!' }, { zh: '疾速龍捲風', en: 'Speed Tornado', k: 'tornado', tool: 'tornado' },
      { zh: '閃電光束', en: 'Lightning Beam', k: 'beam', c: '#fff36a', fx: 'shock' }, { zh: '上勾拳', en: 'Uppercut', k: 'punch', f: 42, up: true, word: 'UPPERCUT!' },
      { zh: '殘影包圍', en: 'Afterimage Barrage', k: 'punch', f: 12, n: 6, both: true, word: 'BAM!' }, { zh: '雷電球', en: 'Ball Lightning', k: 'ball', pal: ['#fff36a', '#7ad0ff', '#ffffff'], R: 200 },
      { zh: '疾風', en: 'Gale', k: 'wind', tool: 'gale' },
    ] },
  jasper: { zh: '火箭賈斯柏', en: 'Rocket Jasper', suit: '#e0342a', suit2: '#a8201a', acc: '#ffb02e', cape: '#ffb02e', mark: '🚀', hair: '#2a1a12', style: 'messy', size: 0.85,
    hi: { zh: '火箭出發！', en: 'Rocket, go!' }, bye: { zh: '再見啦～', en: 'See ya!' },
    moves: [
      { zh: '火球', en: 'Fireball', k: 'ball', pal: ['#ffe14a', '#ff8a2a', '#ff3a1a'], R: 220 }, { zh: '火箭飛踢', en: 'Rocket Kick', k: 'kick', f: 42, fire: true, word: 'ROCKET KICK!' },
      { zh: '噴射頭槌', en: 'Jet Headbutt', k: 'punch', f: 36, word: 'BONK!' }, { zh: '烈焰光束', en: 'Flame Beam', k: 'beam', c: '#ff7a1a', fx: 'fire' },
      { zh: '流星雨', en: 'Meteor Shower', k: 'meteor', icon: '☄️', n: 6 }, { zh: '綁上火箭', en: 'Rocket Ride', k: 'rocket', tool: 'rocket' },
      { zh: '爆炸拳', en: 'Blast Punch', k: 'punch', f: 30, boom: 200, word: 'KABOOM!' }, { zh: '彈跳大地震', en: 'Bounce Quake', k: 'quake', word: 'BOING!' },
      { zh: '火焰龍息', en: 'Fire Breath', k: 'wind', tool: 'breath' }, { zh: '煙火秀', en: 'Firework Show', k: 'ball', pal: ['#ff5a7a', '#5ad8ff', '#ffe14a', '#7aff8a'], n: 3, R: 150 },
      { zh: '大迴旋', en: 'Giant Swing', k: 'spin' },
    ] },
  jeff: { zh: '程式傑夫', en: 'Code Jeff', suit: '#1f9a5a', suit2: '#14683c', acc: '#9af0c8', cape: '#14683c', mark: '</>', hair: '#141012', style: 'short', size: 1.1, visor: true,
    hi: { zh: '讓我來 debug！', en: 'Let me debug this!' }, bye: { zh: 'Bug 修好了。', en: 'Bug fixed.' },
    moves: [
      { zh: '雷射眼', en: 'Laser Eyes', k: 'beam', c: '#ff2a3a', fx: 'laser', eyes: true }, { zh: '機器鐵拳', en: 'Robo Fist', k: 'punch', f: 38, word: 'BEEP BOOP!' },
      { zh: '臭蟲大軍', en: 'Bug Swarm', k: 'swarm', icon: '🐛', n: 8 }, { zh: 'Ctrl+Z 時光倒轉', en: 'Ctrl+Z', k: 'slam', word: 'CTRL+Z!' },
      { zh: '防火牆', en: 'Firewall', k: 'wind', tool: 'breath' }, { zh: '二進位風暴', en: 'Binary Storm', k: 'bolt', n: 4, c: '#5aff9a', binary: true },
      { zh: '除錯光束', en: 'Debug Beam', k: 'beam', c: '#7ad8ff', fx: 'ice' }, { zh: '伺服器墜落', en: 'Server Drop', k: 'meteor', icon: '🖥️', n: 4 },
      { zh: 'Wi-Fi 電磁砲', en: 'Wi-Fi Cannon', k: 'ball', pal: ['#5ab4ff', '#ffffff', '#9af0c8'], R: 210 }, { zh: '重新開機', en: 'Reboot Quake', k: 'quake', word: 'REBOOT!' },
      { zh: '無限迴圈', en: 'Infinite Loop', k: 'spin' }, { zh: '一鍵部署', en: 'Deploy!', k: 'rocket', tool: 'rocket' },
    ] },
  erin: { zh: '星光艾琳', en: 'Star Erin', suit: '#8a4fd0', suit2: '#5e2fa0', acc: '#ff8ad8', cape: '#ff8ad8', mark: '⭐', hair: '#3a2014', style: 'long', size: 1.05,
    hi: { zh: '乖乖站好喔！', en: 'Stand still, sweetie!' }, bye: { zh: '下次要聽話喔！', en: 'Behave next time!' },
    moves: [
      { zh: '星星飛彈', en: 'Star Missiles', k: 'ball', pal: ['#ffe14a', '#ffffff', '#ff8ad8'], n: 3, R: 140, star: true }, { zh: '冰晶光束', en: 'Crystal Beam', k: 'beam', c: '#bfe8ff', fx: 'ice' },
      { zh: '彩虹閃電', en: 'Rainbow Bolt', k: 'bolt', n: 3, c: 'rainbow' }, { zh: '愛心衝擊波', en: 'Heart Wave', k: 'beam', c: '#ff6aa8', fx: 'heart' },
      { zh: '超新星', en: 'Supernova', k: 'ball', pal: ['#b48aff', '#ff8ad8', '#ffffff'], R: 300 }, { zh: '魔法飄浮', en: 'Levitate & Drop', k: 'slam', word: 'TA-DA!' },
      { zh: '流星雨', en: 'Shooting Stars', k: 'meteor', icon: '🌟', n: 7 }, { zh: '優雅迴旋踢', en: 'Pirouette Kick', k: 'kick', f: 36, word: 'TWIRL!' },
      { zh: '銀河漩渦', en: 'Galaxy Swirl', k: 'tornado', tool: 'galaxy' }, { zh: '仙女棒連擊', en: 'Wand Flurry', k: 'punch', f: 10, n: 7, word: 'TING!' },
      { zh: '媽媽的彈額頭', en: 'Mom’s Forehead Flick', k: 'punch', f: 52, flick: true, word: 'FLICK!' },
    ] },
};

export function heroEngine(C) {
  // C: the game's insides — doll(), dims() {W, H, FLOOR}, g, fx, bolts, winds, holes, rockets, swarms, objs, boom, hurt, addText,
  //    sfx, setFace, say, emoji, limb, bubble, boltPath, tool(id), lang(), shake(n), HEAD, NECK
  let hero = null; const rnd = (a, b) => a + Math.random() * (b - a), pickOf = (a) => a[Math.floor(Math.random() * a.length)];
  const chest = () => { const b = C.doll(); return { x: (b.p[2].x + b.p[3].x) / 2, y: (b.p[2].y + b.p[3].y) / 2 }; };
  const MOVE_LEN = { punch: 1.05, kick: 1.0, slam: 1.35, spin: 1.5, beam: 1.15, bolt: 1.0, ball: 1.1, quake: 1.25, tornado: 1.0, wind: 1.0, meteor: 1.1, swarm: 0.9, rocket: 1.0, freeze: 1.0 };
  function start(t) {
    if (hero) return; const H0 = HEROES[t.hero], { W } = C.dims(), c = chest(), side = c.x > W / 2 ? -1 : 1, list = [];
    for (let i = 0; i < 10; i++) { let m; do { m = pickOf(H0.moves); } while (m === list[i - 1]); list.push(m); }
    hero = { H: H0, side, x: side < 0 ? -120 : W + 120, y: 180, vx: 0, vy: 0, phase: 'in', t: 0, moves: list, mi: -1, mt: 0, done: false, hits: 0, say: H0.hi[C.lang()], sayT: 2.2, carry: null };
    C.sfx('rocket'); C.sfx('whoosh'); C.setFace('scared', 2);
    C.addText(W / 2, 120, `${H0.mark} ${H0[C.lang()]}`, H0.acc, true);
  }
  // a blow from the hero at the part of him nearest the hero's fist
  function blow(f, word, o = {}) {
    const b = C.doll(); let best = 0, bd = 1e9; b.p.forEach((p, i) => { const d = Math.hypot(p.x - hero.x, p.y - hero.y); if (d < bd) { bd = d; best = i; } });
    const p = b.p[best]; let dx = p.x - hero.x, dy = p.y - hero.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (o.up) { dx *= 0.35; dy = -1; } else dy = Math.min(dy, 0.2) - 0.25;
    p.px -= dx * f; p.py -= dy * f; for (const q of b.p) { q.px -= dx * f * 0.25; q.py -= dy * f * 0.25; }
    b.stand = 0; b.rise = 0; C.hurt(best, f * 0.9); C.sfx(f > 30 ? 'pow' : 'slap', Math.min(1.2, f / 25));
    if (word) C.addText(p.x, p.y - 40, word, pickOf([hero.H.acc, '#ff4a4a', '#ffffff']), true);
    for (let k = 0; k < 8; k++) { const a = rnd(0, 6.3); C.fx.push({ x: p.x, y: p.y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: 0.3, max: 0.3, c: hero.H.acc, s: 4, star: k % 2 === 0 }); }
    if (o.shock) { b.shock = 1; C.sfx('zap'); }
    if (o.fire) { b.soot = Math.min(1, b.soot + 0.3); for (let k = 0; k < 10; k++) C.fx.push({ x: hero.x, y: hero.y, vx: -hero.side * rnd(2, 6), vy: rnd(-2, 2), life: 0.5, max: 0.5, c: pickOf(['#ffb02e', '#ff6a2a', '#ffe14a']), s: rnd(5, 10) }); }
    if (o.boom) C.boom(p.x, p.y, o.boom, f * 0.8, [hero.H.acc, '#ffffff', hero.H.suit]);
    C.shake(Math.min(16, f * 0.4)); hero.hits++;
  }
  function ball(m) { // an energy ball from the hero's hands to him
    const c = chest(), n = m.n || 1;
    for (let k = 0; k < n; k++) hero.shots.push({ x: hero.x, y: hero.y - 10, tx: c.x + rnd(-30, 30), ty: c.y + rnd(-40, 30), t: -k * 0.18, dur: 0.4, m });
    C.sfx('whoosh');
  }
  // the moment a move lands
  function act(m, u) {
    const b = C.doll(), c = chest(), { W, FLOOR } = C.dims(), L = C.lang();
    if (m.k === 'punch') { if (m.n) { const step = 0.55 / m.n, i = Math.floor((u - 0.3) / step); if (u >= 0.3 && i < m.n && i > (hero.flurry ?? -1)) { hero.flurry = i; if (m.both && i % 2) hero.side = -hero.side; blow(m.f, i === m.n - 1 ? m.word : null, m); } return; } if (!hero.fired && u >= 0.45) { hero.fired = true; blow(m.f, m.word, m); } return; }
    if (hero.fired) return;
    if (m.k === 'kick' && u >= 0.45) { hero.fired = true; blow(m.f, m.word, m); }
    if (m.k === 'beam' && u >= 0.32) { hero.fired = true; hero.beam = { m, t: 0.55 }; C.sfx(m.fx === 'ice' ? 'freeze' : m.fx === 'shock' ? 'zap' : 'hiss');
      const i = 2; b.stand = 0; C.hurt(i, m.fx === 'laser' ? 16 : 11); const dir = Math.sign(c.x - hero.x) || 1; for (const p of b.p) { p.px -= dir * (m.fx === 'heart' ? 14 : 6); p.py += 2; }
      if (m.fx === 'fire') b.soot = Math.min(1, b.soot + 0.5); if (m.fx === 'shock') { b.shock = 1.2; C.setFace('shock', 1.2); C.say('zap', true); }
      if (m.fx === 'ice' && b.frozen <= 0) { b.frozen = 3.5; b.rise = 0; b.frozenD = b.p.map((p) => b.p.map((q) => Math.hypot(p.x - q.x, p.y - q.y))); C.setFace('frozen', 3.5); C.say('ice', true); }
      if (m.fx === 'heart') { C.setFace('laugh', 1.2); for (let k = 0; k < 14; k++) C.fx.push({ x: c.x + rnd(-40, 40), y: c.y + rnd(-60, 40), vx: rnd(-2, 2), vy: rnd(-3, -1), life: 1, max: 1, tool: '💖', rot: rnd(-0.4, 0.4) }); } }
    if (m.k === 'bolt' && u >= 0.35) { hero.fired = true; for (let n = 0; n < m.n; n++) { const x = c.x + (n ? rnd(-90, 90) : 0); C.bolts.push({ x, y: c.y, life: 0.35 + n * 0.07, c: m.c === 'rainbow' ? pickOf(['#ff4a4a', '#ffb02e', '#ffe14a', '#5ad04a', '#3a9aff', '#b06aff']) : m.c, pts: C.boltPath(x, c.y) }); }
      C.sfx('zap'); b.shock = 1.3; b.stand = 0; C.setFace('shock', 1.3); C.hurt(0, 10 + m.n * 2); b.soot = Math.min(1, b.soot + 0.2); C.fx.push({ x: c.x, y: c.y, life: 0.15, max: 0.15, flash: 140 });
      if (m.binary) for (let k = 0; k < 10; k++) C.addText(c.x + rnd(-120, 120), c.y + rnd(-120, 40), pickOf(['0101', '1011', '0010', '1110']), '#5aff9a'); }
    if (m.k === 'ball' && u >= 0.35) { hero.fired = true; ball(m); }
    if (m.k === 'quake' && u >= 0.55) { hero.fired = true; C.shake(22); C.sfx('boom', 0.8); C.sfx('thump', 1.2); C.addText(hero.x, FLOOR - 60, m.word, hero.H.acc, true);
      for (const p of b.p) { p.py = p.y + 20 + rnd(0, 6); p.px = p.x + rnd(-3, 3); } b.stand = 0; b.rise = 0; C.hurt(8, 22); C.say('fly', true);
      for (let k = 0; k < 40; k++) C.fx.push({ x: hero.x + rnd(-120, 120), y: FLOOR - 6, vx: rnd(-3, 3), vy: rnd(-10, -3), life: 0.9, max: 0.9, c: pickOf(['#8a6a4a', '#b8946a', '#d8c0a0']), s: rnd(4, 9), fall: true }); }
    if (m.k === 'tornado' && u >= 0.3) { hero.fired = true; if (!C.holes.length) { const T = C.tool(m.tool); C.holes.push({ x: c.x, y: Math.min(c.y, FLOOR - 80), t: T.dur * 0.7, age: 0, T }); C.sfx(T.id === 'galaxy' ? 'hole' : 'wind'); C.setFace('scared', 3); C.say('fly', true); } }
    if (m.k === 'wind' && u >= 0.3) { hero.fired = true; const T = C.tool(m.tool); C.winds.push({ T, dir: Math.sign(c.x - hero.x) || 1, y: c.y, t: T.dur, age: 0 }); C.sfx('wind'); C.setFace('scared', T.dur); }
    if (m.k === 'meteor' && u >= 0.3) { hero.fired = true; const T = { id: 'herometeor', icon: m.icon, r: 22, m: 4, snd: 'thump' }; for (let k = 0; k < m.n; k++) { const x = c.x + rnd(-170, 170); C.objs.push({ x, y: 20 - k * 50, px: x - rnd(-2, 2), py: 20 - k * 50 - 6, r: T.r, m: T.m, T, a: 0, spin: rnd(-0.2, 0.2) }); } C.addText(c.x, 90, '!!!', '#e0342a', true); }
    if (m.k === 'swarm' && u >= 0.3) { hero.fired = true; const T = { icon: m.icon, n: m.n, dur: 4, power: 5, snd: 'buzz' }; C.swarms.push({ T, t: T.dur, bugs: Array.from({ length: T.n }, () => ({ x: hero.x, y: hero.y, vx: rnd(-4, 4), vy: rnd(-4, 4), ti: Math.floor(rnd(0, 14)), cd: rnd(0.3, 1) })) }); C.sfx('buzz'); C.setFace('scared', 1); }
    if (m.k === 'rocket' && u >= 0.4) { hero.fired = true; const T = C.tool('rocket'); C.rockets.push({ i: 8, t: 1.8, side: hero.side, T }); C.sfx('rocket'); C.say('fly', true); C.setFace('scared', 2); }
    if ((m.k === 'slam' || m.k === 'spin') && u >= 0.2 && !hero.carry) { hero.carry = { i: C.NECK }; C.sfx('whoosh'); C.setFace('scared', 1.4); C.say('fly', true); }
    if (m.k === 'slam' && u >= 0.75) { hero.fired = true; hero.carry = null; for (const p of b.p) { p.py = p.y - 26; p.px = p.x; } C.addText(c.x, c.y - 60, m.word, hero.H.acc, true); C.sfx('whoosh'); hero.slamAt = 0.12; }
    if (m.k === 'spin' && u >= 1.05) { hero.fired = true; hero.carry = null; const dir = c.x < W / 2 ? 1 : -1; for (const p of b.p) { p.px = p.x - dir * 34; p.py = p.y + 10; } C.addText(c.x, c.y - 60, 'YEET!', hero.H.acc, true); C.sfx('whoosh'); C.hurt(0, 12); }
  }
  // where the hero wants to be for this move, at this point in it
  function goal(m, u) {
    const c = chest(), { FLOOR } = C.dims(), s = hero.side, near = { x: c.x - s * 70, y: c.y - 10 }, far = { x: c.x - s * 230, y: c.y - 90 };
    if (!m) return far;
    if (m.k === 'punch' || m.k === 'kick') { if (m.n) return { x: c.x - s * 55 + Math.sin(u * 40) * 14, y: c.y - 20 + Math.cos(u * 33) * 22 }; return u < 0.3 ? { x: c.x - s * 170, y: c.y - 40 } : u < 0.5 ? near : { x: c.x - s * 140, y: c.y - 60 }; }
    if (m.k === 'slam' || m.k === 'spin') { if (!hero.carry) return near; if (m.k === 'spin') { const a = u * 16; return { x: c.x + Math.cos(a) * 20, y: Math.min(FLOOR - 200, 240) + Math.sin(a) * 20 }; } return { x: hero.x, y: 140 }; }
    if (m.k === 'quake') return u < 0.4 ? { x: c.x - s * 60, y: 90 } : { x: c.x - s * 40, y: FLOOR - 70 };
    return far;
  }
  function tick(dt) {
    if (!hero) return; const h = hero, { W, FLOOR } = C.dims(); h.t += dt; h.sayT -= dt; h.shots ||= [];
    if (h.phase === 'in') { const gl = goal(null); h.x += (gl.x - h.x) * Math.min(1, dt * 5); h.y += (gl.y - h.y) * Math.min(1, dt * 5); if (h.t > 0.9) { h.phase = 'move'; next(); } }
    else if (h.phase === 'move') {
      const m = h.moves[h.mi]; h.mt += dt; const u = h.mt, gl = goal(m, u), k = m.k === 'spin' && h.carry ? 1 : Math.min(1, dt * (m.k === 'punch' || m.k === 'kick' ? 12 : 7));
      h.x += (gl.x - h.x) * k; h.y += (gl.y - h.y) * k; act(m, u);
      if (h.mt >= (MOVE_LEN[m.k] || 1.1)) next();
    } else if (h.phase === 'out') { h.y -= dt * 520; h.x += h.side * -dt * 120; if (h.y < -200) { hero = null; return; } }
    if (h.slamAt != null) { h.slamAt -= dt; if (h.slamAt <= 0) { h.slamAt = null; const b = C.doll(); for (const p of b.p) { p.py = p.y - 30; } C.shake(18); C.sfx('thump', 1.3); C.hurt(0, 26); } }
    if (h.beam) { h.beam.t -= dt; if (h.beam.t <= 0) h.beam = null; }
    for (const s of h.shots) { s.t += dt; if (s.t >= s.dur && !s.hit) { s.hit = true; C.boom(s.tx, s.ty, s.m.R || 180, (s.m.R || 180) / 7, s.m.pal); } }
    h.shots = h.shots.filter((s) => !s.hit);
  }
  function next() {
    const h = hero; h.mi++; h.mt = 0; h.fired = false; h.flurry = -1; h.carry = null;
    if (h.mi >= h.moves.length) { h.phase = 'out'; h.say = h.H.bye[C.lang()]; h.sayT = 2; C.sfx('rocket'); return; }
    const m = h.moves[h.mi], c = chest(); h.side = hero.x < c.x ? 1 : -1;
    C.addText(h.x, h.y - 120, m[C.lang()], h.H.acc, true); h.banner = { n: h.mi + 1, m, t: 1.6 };
  }
  // the hero holds him (called where the hand holds him, in the physics)
  function pin() { if (!hero?.carry) return; const b = C.doll(), p = b.p[hero.carry.i]; p.x = hero.x + hero.side * 30; p.y = hero.y + 30; b.stand = 0; b.rise = 0; }
  // ---------------------------------------------------------------- drawing
  function draw() {
    if (!hero) return; const h = hero, H0 = h.H, g = C.g, s = H0.size, t = performance.now() / 1000, m = h.moves[h.mi], u = h.mt;
    // energy balls in flight, the beam
    for (const sh of h.shots) { if (sh.t < 0) continue; const k = Math.min(1, sh.t / sh.dur), x = sh.x + (sh.tx - sh.x) * k, y = sh.y + (sh.ty - sh.y) * k - Math.sin(k * Math.PI) * 40;
      if (sh.m.star) C.emoji('⭐', x, y, 40, t * 10); else { const gr = g.createRadialGradient(x, y, 2, x, y, 28); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, sh.m.pal[0]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); } }
    if (h.beam) { const c = chest(), ex = h.x + h.side * 18 * s, ey = h.y - (h.beam.m.eyes ? 62 : 8) * s; g.save(); g.globalAlpha = Math.min(1, h.beam.t * 4); g.lineCap = 'round';
      for (const [w, col] of [[26, h.beam.m.c + '55'], [12, h.beam.m.c], [4, '#ffffff']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(ex, ey); g.lineTo(c.x, c.y); g.stroke(); if (h.beam.m.eyes) { g.beginPath(); g.moveTo(ex - h.side * 10, ey); g.lineTo(c.x - 6, c.y + 4); g.stroke(); } } g.restore(); }
    // the hero: cape, legs, body with the mark, arms in the pose of the move, head with hair and mask
    g.save(); g.translate(h.x, h.y); g.scale(h.side * s, s);
    const pose = h.phase !== 'move' ? 'fly' : m.k === 'punch' || m.k === 'kick' ? (u > 0.3 ? (m.k === 'kick' ? 'kick' : 'punch') : 'wind') : m.k === 'slam' || m.k === 'spin' ? 'lift' : ['beam', 'ball', 'bolt', 'tornado', 'wind', 'meteor', 'swarm', 'rocket'].includes(m.k) ? 'cast' : m.k === 'quake' ? (u < 0.45 ? 'fly' : 'pound') : 'fly';
    const wave = Math.sin(t * 9) * 8;
    g.fillStyle = H0.cape; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, -40); g.quadraticCurveTo(-60, -10 + wave, -78 + wave, 40); g.lineTo(-40, 46 + wave * 0.5); g.quadraticCurveTo(-20, 10, 12, -40); g.closePath(); g.fill(); g.stroke();
    const P = (x, y) => ({ x, y }), L = (a, c, w, col) => C.limb(a, c, w, col, 'rgba(0,0,0,0.45)');
    const legs = pose === 'kick' ? [[P(-8, 20), P(18, 44), P(52, 30)], [P(8, 20), P(-6, 52), P(-16, 76)]] : pose === 'pound' ? [[P(-8, 20), P(-20, 40), P(-12, 60)], [P(8, 20), P(22, 40), P(14, 60)]] : [[P(-8, 20), P(-22, 46), P(-40, 64)], [P(8, 20), P(-2, 48), P(-14, 70)]];
    for (const [a, b, c] of legs) { L(a, b, 13, H0.suit2); L(b, c, 12, H0.suit2); g.fillStyle = H0.acc; g.beginPath(); g.ellipse(c.x, c.y, 10, 7, 0, 0, 7); g.fill(); }
    g.fillStyle = H0.suit; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 3; g.beginPath(); g.roundRect(-20, -46, 40, 70, 14); g.fill(); g.stroke();
    g.fillStyle = H0.acc; g.fillRect(-20, 14, 40, 7); g.beginPath(); g.arc(0, -16, 15, 0, 7); g.fill(); g.font = `bold ${H0.mark.length > 2 ? 12 : 18}px "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = H0.suit2;
    if (H0.mark.length > 2) g.fillText(H0.mark, 0, -15); else { g.save(); g.scale(h.side, 1); g.font = '18px serif'; g.fillText(H0.mark, 0, -15); g.restore(); }
    const sh = [P(-14, -38), P(14, -38)], arms = pose === 'punch' ? [[P(30, -36), P(62, -32)], [P(-24, -20), P(-10, -6)]] : pose === 'cast' ? [[P(28, -40), P(54, -46)], [P(24, -30), P(52, -32)]] : pose === 'lift' ? [[P(18, -66), P(30, -84)], [P(-6, -66), P(6, -86)]] : pose === 'wind' ? [[P(-6, -24), P(-26, -30)], [P(-26, -24), P(-34, -6)]] : pose === 'pound' ? [[P(20, -10), P(28, 18)], [P(-20, -10), P(-26, 18)]] : [[P(30, -50), P(58, -60)], [P(-22, -22), P(-30, -2)]];
    arms.forEach(([el, hand], i) => { L(sh[i ? 0 : 1], el, 11, H0.suit); L(el, hand, 10, H0.suit); g.fillStyle = H0.acc; g.beginPath(); g.arc(hand.x, hand.y, 8, 0, 7); g.fill(); });
    if (pose === 'cast') { g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 20); g.fillStyle = H0.acc; g.beginPath(); g.arc(60, -40, 12, 0, 7); g.fill(); g.globalAlpha = 1; }
    // head
    g.fillStyle = '#f2c89a'; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 3; g.beginPath(); g.arc(4, -70, 22, 0, 7); g.fill(); g.stroke();
    g.fillStyle = H0.hair;
    if (H0.style === 'long') { g.beginPath(); g.moveTo(-18, -78); g.quadraticCurveTo(-34 + wave * 0.4, -40, -30 + wave, -18); g.lineTo(-8, -40); g.closePath(); g.fill(); }
    g.beginPath(); g.arc(4, -76, 22, Math.PI * 1.02, Math.PI * 1.98); g.fill();
    if (H0.style === 'spiky') for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-16 + k * 8, -90); g.lineTo(-12 + k * 9, -106 - (k % 2) * 4); g.lineTo(-6 + k * 8, -92); g.fill(); }
    if (H0.style === 'messy') for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-10 + k * 9, -95, 7, 0, 7); g.fill(); }
    if (H0.visor) { g.fillStyle = '#1a2a2a'; g.beginPath(); g.roundRect(-6, -78, 34, 12, 5); g.fill(); g.fillStyle = H0.acc; g.fillRect(-2, -75, 26, 3); }
    else { g.fillStyle = H0.acc; g.beginPath(); g.roundRect(-8, -78, 34, 11, 5); g.fill(); g.fillStyle = '#fff'; for (const ex of [6, 20]) { g.beginPath(); g.arc(ex, -72.5, 3, 0, 7); g.fill(); } }
    g.strokeStyle = '#4a2a1a'; g.lineWidth = 2.5; g.beginPath(); g.arc(14, -60, 7, 0.2, Math.PI - 0.6); g.stroke();
    g.restore();
    if (h.sayT > 0) C.bubble(h.x, h.y - 130 * s, h.say);
    // the move's name and its number, across the top
    const { W } = C.dims(); if (h.phase === 'move' && h.banner) { const bn = h.banner, txt = `${H0.mark} ${H0[C.lang()]}　${bn.n}/10　${bn.m[C.lang()]}`;
      g.save(); g.font = '900 30px "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = g.measureText(txt).width + 50;
      g.fillStyle = 'rgba(20,16,40,0.78)'; g.beginPath(); g.roundRect(W / 2 - tw / 2, 18, tw, 52, 26); g.fill(); g.strokeStyle = H0.acc; g.lineWidth = 3; g.stroke(); g.fillStyle = '#fff'; g.fillText(txt, W / 2, 45); g.restore(); }
  }
  return { start, tick, draw, pin, get active() { return !!hero; } };
}
