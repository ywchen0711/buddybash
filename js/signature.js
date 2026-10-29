// 招牌特效 Every tool's own mark: on top of what its kind does (a hit, a throw, a drop...), each tool leaves a signature no
// other tool has — the bits that fly off it, what it does to him for a while, and something extra.
//   SIG[id] = [bits, what it does to him, extras]
//   bits: emoji that burst from where it lands
//   does: wet, soot, sticky:#c (a splat), tint:#c (he turns that colour), paint:#c (his shirt does), stuck:🪠 (it stays on him),
//         flat (squashed), tiny (shrunk), puff (puffed up), spin, dizzy, birds (circling his head), zzz (asleep), stink,
//         notes (music rising), bubbles, glitter, fire, steam, hearts, float (he drifts up), bouncy (he bounces), cold
//         (blue and shivering), shiver, blush, tears, ghost (his ghost floats up), rainbow (a rainbow trail)
//   extras: ring:#c (a shock ring), flash:#c (the room flashes), shatter (the tool breaks to bits), boomerang (it comes back
//         and hits again), double, triple (more hits), quake, smoke:#c, confetti, coins (a shower of bonus coins)
// tools/check-sig.mjs checks every tool has one and that no two are alike.
export const SIG = {
  // the first twenty
  hand: ['✋💨', 'dizzy', ''], punch: ['⭐💥', 'dizzy', 'ring:#ff4a4a'], tomato: ['🍅', 'sticky:#e0342a tears', ''], slap: ['💢', 'stuck:🖐️ blush', ''],
  egg: ['🥚🐣', 'sticky:#ffd23a', ''], bat: ['⚾💫', 'spin', 'ring:#c89a5a'], duck: ['🦆', 'bouncy', ''], hammer: ['🔩⭐', 'flat', 'quake'],
  water: ['🎈💧', 'wet shiver', ''], pie: ['🥧', 'stuck:🥧 sticky:#fff6e0', ''], bowl: ['🎳', 'flat', 'ring:#2a3a8a'], feather: ['🪶', 'hearts', ''],
  cracker: ['🧨', 'soot shiver', ''], anvil: ['💫', 'flat birds', 'quake ring:#4a4f5a'], zap: ['⚡', 'shiver', ''], ice: ['❄️', 'cold', 'flash:#bfe8ff'],
  bomb: ['💣', 'soot birds', 'quake'], rocket: ['🚀', 'float', 'smoke:#cccccc'], moon: ['🌙', 'float glitter', ''], hole: ['🕳️', 'tiny', ''],
  // hits
  pan: ['🔔🍳', 'flat birds', 'ring:#c8ccd4'], baguette: ['🍞🥖', '', 'shatter'], fish: ['💧🐟', 'wet stink', ''], boomerang: ['🍃', 'dizzy', 'boomerang'],
  paddle: ['🏓', 'bouncy', 'double'], shuttle: ['🪶🏸', 'float', ''], hockey: ['🧊', 'spin cold', ''], log: ['🪵🍂', 'birds', 'quake'],
  broom: ['🍂', 'spin', 'smoke:#c8b08a'], plunger: ['💦', 'stuck:🪠', ''], spoon: ['✨🥄', '', 'triple'], ruler: ['✏️📐', 'tint:#ff9a9a', 'double'],
  books: ['📄📖', 'zzz', ''], chair: ['🪵🔩', 'birds', 'shatter'], skate: ['💨🛹', 'spin bouncy', ''], guitar: ['🎵🎸', 'notes', 'shatter'],
  drum: ['🥁', 'notes', 'quake'], trumpet: ['🎺', 'shiver', 'ring:#ffd23a'], bone: ['🐾🦴', 'stuck:🦴', ''], umbrella: ['💧☔', 'wet float', ''],
  sock: ['🧦', 'stink dizzy', ''], sneaker: ['💨', 'spin', 'double'], boot: ['🟫', 'sticky:#6a4a2a', ''], heel: ['💅✨', 'stuck:👠', ''],
  slipper: ['💢🩴', 'birds', 'triple'], teddy: ['💕☁️', 'hearts', ''], yoyo: ['🌀', 'spin dizzy', 'boomerang'], wrench: ['🔩⚙️', 'shiver', 'ring:#9aa0aa'],
  clamp: ['⚙️', 'tiny', ''], extinguisher: ['☁️❄️', 'cold', 'smoke:#ffffff'], bucket: ['💧🪣', 'wet stuck:🪣', ''], coconut: ['🥛🥥', 'wet dizzy', 'shatter'],
  pineapple: ['🍍💛', 'sticky:#ffd23a', 'double'], eggplant: ['🍆', 'tint:#8a4fd0', ''], lobster: ['🦞', 'stuck:🦞', ''], crab: ['🦀', 'shiver', 'triple'],
  octopus: ['💜', 'stuck:🐙', ''], shark: ['🌊💧', 'wet', 'ring:#3a8ad8'], croc: ['🌿💧', 'wet birds', 'double'], trex: ['🌋🦴', 'flat', 'quake ring:#6a8a3a'],
  elephant: ['💦🐘', 'flat wet', 'quake'], kangaroo: ['🥊', 'bouncy', 'triple'], goat: ['🌾🐐', 'birds spin', ''], ox: ['🚩', 'spin dizzy', 'smoke:#c8a878'],
  flamingo: ['🪶💗', 'tint:#ff8ad8', ''], robot: ['🔩⚡', 'shiver', 'flash:#5ad8ff'], fist: ['💥', 'dizzy', 'triple'], foot: ['👣', 'flat', 'ring:#d8b08a'],
  leg: ['🌀💨', 'spin', 'ring:#ffffff'], flex: ['💪✨', 'flat glitter', ''], rock: ['🪨', 'tiny birds', ''], cactus: ['📍', 'stuck:🌵 tint:#ff6a6a', ''],
  lolly: ['🍬🍭', 'sticky:#ff8ad8 hearts', ''], violin: ['🎻🎶', 'notes zzz', 'shatter'], tv: ['📺⚡', 'shiver', 'shatter flash:#ffffff'], laptop: ['💾⌨️', 'shiver', 'shatter'],
  phone: ['📳🔔', 'shiver notes', ''],
  // throws
  melon: ['🍉⚫', 'sticky:#ff5a6a', 'shatter'], orange: ['🍊💦', 'sticky:#ffa02a', ''], lemon: ['🍋💛', 'shiver', ''], banana: ['🍌⭐', 'spin', ''],
  grapes: ['🍇', 'tint:#8a4fd0', 'triple'], berry: ['🍓', 'sticky:#e0342a hearts', ''], peach: ['🍑', 'blush', ''], cherry: ['🍒', 'sticky:#c0102a', 'double'],
  apple: ['🍎', 'stuck:🍎', ''], avocado: ['🥑', 'sticky:#6aa83a', 'shatter'], burger: ['🍔🥬🧀', 'puff', ''], hotdog: ['🌭', 'sticky:#ffd23a', 'triple'],
  pizza: ['🍕🧀', 'sticky:#e0482a', ''], spaghetti: ['🍝', 'stuck:🍝', ''], ramen: ['🍜♨️', 'steam wet', ''], icecream: ['🍦❄️', 'cold sticky:#fff0d8', ''],
  cake: ['🍰', 'sticky:#fff6e0 puff', ''], bday: ['🎂🎉', 'sticky:#ffd8e8', 'confetti'], cupcake: ['🧁✨', 'glitter', ''], donut: ['🍩', 'stuck:🍩', ''],
  pudding: ['🍮', 'sticky:#d8a040 shiver', ''], honey: ['🍯🐝', 'sticky:#f2a922', ''], beans: ['🫘', 'stink', ''], milk: ['🥛', 'wet tint:#ffffff', ''],
  coffee: ['☕', 'steam shiver', ''], soda: ['🫧🥤', 'bubbles wet', ''], salad: ['🥬🥕', 'sticky:#6ac04a', 'shatter'], stew: ['🍲', 'steam sticky:#a8602a', ''],
  pancake: ['🥞', 'flat sticky:#f2b830', ''], onigiri: ['🍚', 'sticky:#ffffff', 'shatter'], dumpling: ['🥟', 'steam', 'triple'], paint: ['🎨🖌️', 'paint:#e04a8a', ''],
  soap: ['🫧🧼', 'bubbles', ''], squid: ['🦑⚫', 'sticky:#1a1a2a tint:#2a2a3a', ''], snail: ['🐌', 'stuck:🐌 sticky:#c8e8a0', ''], basket: ['🍎🍊🍌', '', 'triple'],
  soccer: ['⚽', 'bouncy', 'double'], rugby: ['🏉', 'spin', 'ring:#8a5a2a'], baseball: ['⚾', 'birds', 'ring:#ffffff'], volley: ['🏐', 'bouncy float', ''],
  eight: ['🎱', 'dizzy', 'triple'], frisbee: ['🥏', 'spin', 'boomerang'], yarn: ['🧶', 'stuck:🧶 spin', ''], dice: ['🎲', 'birds', 'double'],
  brick: ['🧱🟫', 'flat', 'shatter'], shoe: ['👞', 'stink', 'double'], boxes: ['📦', 'stuck:📦', ''], potato: ['🥔', 'zzz', ''],
  cookie: ['🍪', 'hearts', 'shatter'], bell: ['🔔🎵', 'shiver notes', 'ring:#ffd23a'], trophy: ['🏆✨', 'glitter', 'confetti'], gem: ['💎', 'glitter tint:#7ad8ff', 'flash:#c8f0ff'],
  gift: ['🎁🎀', 'hearts', 'confetti'],
  // from above
  piano: ['🎹🎵', 'flat notes', 'quake'], bathtub: ['🛁💧', 'wet bubbles', 'quake'], car: ['🚗💨', 'flat', 'smoke:#555555'], moai: ['🗿', 'flat tiny', 'quake'],
  toilet: ['🚽💧', 'wet stink', ''], vase: ['🏺', 'dizzy', 'shatter'], pumpkin: ['🎃', 'stuck:🎃', 'shatter'], suitcase: ['👕🧦', 'birds', ''],
  couch: ['🛋️', 'zzz', 'quake'], cabinet: ['📄📁', 'flat', 'shatter'], toolbox: ['🔧🔩🔨', 'birds', 'shatter'], anchor: ['⚓🌊', 'flat wet', 'quake'],
  cow: ['🐄🥛', 'flat', 'smoke:#ffffff'], pig: ['🐷', 'sticky:#6a4a2a stink', ''], turtle: ['🐢', 'stuck:🐢', ''], globe: ['🌍', 'spin dizzy', 'ring:#3a8ad8'],
  bus: ['🚌', 'flat', 'quake smoke:#888888'], safe: ['💰🪙', 'flat', 'coins'], candy: ['🍬', 'hearts glitter', ''], popcorn: ['🍿', 'shiver', 'triple'],
  hearts: ['💗', 'hearts blush', ''], stars: ['⭐', 'dizzy glitter', ''], frogs: ['🐸', 'bouncy stuck:🐸', ''], tropical: ['🐠🌊', 'wet', ''],
  leaves: ['🍂🍁', 'float', ''], petals: ['🌸', 'hearts float', ''], snow: ['❄️⛄', 'cold', ''], chicks: ['🐤', 'birds', ''],
  drops: ['💧', 'wet', 'ring:#5ab4f0'], tennis: ['🎾', 'bouncy', 'triple'], money: ['💵🪙', 'glitter', 'coins'], bricks: ['🧱', 'tiny', 'quake'],
  // things that go off
  fireworks: ['🎆✨', 'glitter', 'confetti flash:#ff5a7a'], sparkler: ['✨', 'glitter shiver', ''], popper: ['🎉', 'hearts', 'confetti'], kaboom: ['💥🔥', 'soot fire', 'quake'],
  gas: ['🔥', 'fire soot', 'smoke:#444444'], battery: ['⚡🔋', 'shiver', 'flash:#7aff8a'], bulb: ['💡❗', 'puff', 'flash:#fff6a0'], chili: ['🌶️🔥', 'fire tint:#ff3a1a steam', ''],
  bubbly: ['🫧🍾', 'bubbles wet', 'confetti'], tube: ['🧪', 'tiny tint:#7aff8a', ''], flask: ['⚗️', 'puff tint:#b06aff', ''], puffer: ['🐡', 'puff shiver', ''],
  alarm: ['🚨', 'shiver', 'flash:#ff3a3a'], clock: ['⏰', 'dizzy', 'ring:#ffffff'], hourglass: ['⌛', 'zzz float', ''], comet: ['☄️', 'soot', 'quake flash:#ffb02e'],
  nuke: ['☢️', 'soot ghost', 'quake flash:#ffffff'], candle: ['🕯️🔥', 'steam', 'smoke:#888888'],
  // carried off
  ufo: ['👽', 'float glitter', 'ring:#7aff8a'], heli: ['🚁', 'spin dizzy', ''], kite: ['🪁', 'float rainbow', ''], eagle: ['🪶', 'birds', ''], dragon: ['🔥🐉', 'fire', ''], plane: ['☁️', 'float', 'smoke:#ffffff'],
  // lightning
  storm: ['🌧️', 'wet shiver', ''], plug: ['🔌', 'shiver puff', ''], dish: ['📡', 'shiver ghost', ''], laser: ['🔴', 'soot', 'flash:#ff2a2a'], crystal: ['💎🔮', 'glitter', 'flash:#b06aff'], rainbow: ['🌈', 'rainbow', ''],
  // cold
  snowman: ['⛄', 'cold stuck:🥕', ''], shiver: ['🥶', 'cold shiver', ''], shaved: ['🍧', 'sticky:#ff8ad8 cold', ''], glacier: ['🧊', 'tiny cold', ''],
  // tickling
  paw: ['🐾', 'blush', ''], peacock: ['🦚', 'glitter', ''], grass: ['🌱', 'tears', ''], brush: ['🖌️', 'paint:#ff8ad8', ''], bug: ['🐛', 'shiver', ''],
  // pulls
  cyclone: ['🌀', 'dizzy spin', ''], magnet: ['🧲', 'stuck:🔩', ''], tornado: ['🌪️', 'spin birds', ''], galaxy: ['🌌', 'glitter float', ''],
  // winds
  gust: ['💨', 'float', ''], gale: ['🌬️', 'cold', ''], breath: ['🐲', 'steam', ''], yell: ['🗣️', 'shiver', 'ring:#ffe14a'], skunk: ['🦨', 'stink tint:#9ad040', ''],
  // up from the floor
  fountain: ['⛲', 'wet', ''], whale: ['🐳', 'wet float', ''], shroom: ['🍄', 'bouncy puff', ''], sprout: ['🌱', 'stuck:🌼', ''], volcano: ['🌋', 'fire soot', 'quake'],
  // swarms
  bees: ['🍯', 'puff', ''], mozzie: ['🦟', 'tint:#ff9a9a', ''], ants: ['🐜', 'shiver', ''], bats: ['🦇', 'ghost', ''], butterfly: ['🦋', 'hearts float', ''],
};

const LEN = { flat: 1.6, tiny: 3, puff: 2.5, birds: 3.5, zzz: 3, stink: 4, notes: 3, bubbles: 4, glitter: 3, fire: 2.5, steam: 3, hearts: 3, float: 2.2, bouncy: 4, cold: 3, shiver: 1.4, blush: 3, tears: 2.5, ghost: 2.5, rainbow: 3.5, tint: 4, paint: 8, stuck: 4 };
export function sigEngine(C) {
  // C: doll(), dims(), g, fx, objs, addText, sfx, hurt, setFace, say, emoji, shake(n), coins(n), redo(id, n) (more hits), splat(i, c, r)
  const st = {}, stuck = [], cool = {}, rnd = (a, b) => a + Math.random() * (b - a), pickOf = (a) => a[Math.floor(Math.random() * a.length)];
  const on = (k) => (st[k]?.t || 0) > 0;
  function apply(id, x, y, i = 2, o = {}) {
    const R = SIG[id]; if (!R) return; const now = performance.now() / 1000; if (cool[id] > now) return; cool[id] = now + (o.cool ?? 0.6);
    const b = C.doll(), [bits, does, extra] = R, emo = [...new Intl.Segmenter().segment(bits)].map((s) => s.segment).filter((s) => s.trim());
    for (let k = 0; k < 12; k++) { const a = rnd(0, 6.28), sp = rnd(3, 9); C.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, life: rnd(0.7, 1.2), max: 1.2, emo: pickOf(emo), size: rnd(18, 30), rot: rnd(-3, 3), fall: true }); }
    for (const w of does.split(' ').filter(Boolean)) {
      const [k, v] = w.split(':');
      if (k === 'wet') b.wet = 1; else if (k === 'soot') b.soot = Math.min(1, b.soot + 0.5);
      else if (k === 'sticky') C.splat(i, v, rnd(16, 24));
      else if (k === 'stuck') { stuck.push({ e: v, i: v === '🪣' || v === '🎃' || v === '📦' || v === '🍝' || v === '🍎' ? 0 : i, ox: rnd(-8, 8), oy: v === '🪣' || v === '🎃' || v === '📦' ? -14 : v === '🍝' || v === '🍎' ? -30 : rnd(-6, 6), a: rnd(-0.6, 0.6), t: LEN.stuck, head: [ '🪣', '🎃', '📦', '🍝', '🍎', '🥧'].includes(v) }); if (stuck.length > 8) stuck.shift(); }
      else if (k === 'spin') { const c = mid(b); for (const p of b.p) { const dx = p.x - c.x, dy = p.y - c.y; p.px += dy * 0.18; p.py -= dx * 0.18; } b.stand = 0; }
      else if (k === 'dizzy') { b.dizzy = 300; C.setFace('dizzy', 2.6); }
      else st[k] = { t: LEN[k] || 3, c: v };
      if (k === 'zzz') C.setFace('sleep', LEN.zzz); if (k === 'hearts' || k === 'blush') C.setFace('laugh', 1.5); if (k === 'cold' || k === 'shiver') b.shockLite = LEN[k];
      if (k === 'tears') C.setFace('ouch', 2); if (k === 'flat' || k === 'tiny' || k === 'puff') C.sfx(k === 'puff' ? 'boing' : 'squeak');
    }
    for (const w of extra.split(' ').filter(Boolean)) {
      const [k, v] = w.split(':');
      if (k === 'ring') C.fx.push({ x, y, life: 0.55, max: 0.55, ring: v, r0: 10 });
      if (k === 'flash') C.fx.push({ x: 0, y: 0, life: 0.3, max: 0.3, screen: v });
      if (k === 'quake') { C.shake(20); for (let n = 0; n < 24; n++) C.fx.push({ x: x + rnd(-160, 160), y: C.dims().FLOOR - 8, vx: rnd(-2, 2), vy: rnd(-7, -2), life: 0.8, max: 0.8, c: pickOf(['#b8946a', '#8a6a4a', '#d8c0a0']), s: rnd(4, 9), fall: true }); C.sfx('thump', 1.2); }
      if (k === 'smoke') for (let n = 0; n < 14; n++) C.fx.push({ x: x + rnd(-40, 40), y: y + rnd(-30, 30), vx: rnd(-1.5, 1.5), vy: rnd(-2, -0.4), life: rnd(1, 1.6), max: 1.6, c: v + 'aa', s: rnd(14, 26), smoke: true });
      if (k === 'confetti') for (let n = 0; n < 50; n++) C.fx.push({ x: x + rnd(-30, 30), y: y - 20, vx: rnd(-7, 7), vy: rnd(-12, -3), life: rnd(1.2, 2), max: 2, c: pickOf(['#ff5a7a', '#5ad8ff', '#ffe14a', '#7aff8a', '#c87aff']), s: rnd(3, 6), conf: true, fall: true });
      if (k === 'shatter') { const T = C.tool(id); for (let n = 0; n < 6; n++) C.fx.push({ x, y, vx: rnd(-7, 7), vy: rnd(-9, -2), life: 1.2, max: 1.2, emo: T?.icon || '💥', size: rnd(14, 24), rot: rnd(-6, 6), fall: true, shard: true }); C.sfx('crunch'); }
      if (k === 'coins') { const n = 40 + Math.floor(rnd(0, 40)); C.coins(n); for (let m = 0; m < 16; m++) C.fx.push({ x, y, vx: rnd(-6, 6), vy: rnd(-11, -4), life: 1.3, max: 1.3, emo: '🪙', size: 22, rot: rnd(-4, 4), fall: true }); C.addText(x, y - 50, `+${n}!`, '#ffd23a', true); }
      if (k === 'double' || k === 'triple' || k === 'boomerang') C.redo(id, k === 'triple' ? 2 : 1, k === 'boomerang', x, y, i);
    }
  }
  const mid = (b) => ({ x: (b.p[8].x + b.p[9].x + b.p[2].x + b.p[3].x) / 4, y: (b.p[8].y + b.p[9].y + b.p[2].y + b.p[3].y) / 4 });
  function tick(dt) {
    for (const k in st) st[k].t -= dt; for (const s of stuck) s.t -= dt; for (let n = stuck.length - 1; n >= 0; n--) if (stuck[n].t <= 0) stuck.splice(n, 1);
    const b = C.doll(), H = b.p[0], t = performance.now() / 1000;
    const puff = (e, x, y, vx, vy, size = 22) => C.fx.push({ x, y, vx, vy, life: 1.1, max: 1.1, emo: e, size, rot: rnd(-0.3, 0.3) });
    if (on('zzz') && Math.random() < dt * 2) puff('💤', H.x + 20, H.y - 30, rnd(0.2, 0.8), -1.2, 24);
    if (on('notes') && Math.random() < dt * 4) puff(pickOf(['🎵', '🎶']), H.x + rnd(-30, 30), H.y - 20, rnd(-0.8, 0.8), -1.4);
    if (on('hearts') && Math.random() < dt * 4) puff(pickOf(['💕', '💗', '💖']), H.x + rnd(-30, 30), H.y - 10, rnd(-0.6, 0.6), -1.3);
    if (on('bubbles') && Math.random() < dt * 6) { const p = pickOf(b.p); C.fx.push({ x: p.x, y: p.y, vx: rnd(-0.6, 0.6), vy: rnd(-1.6, -0.6), life: 1.4, max: 1.4, bubble: true, s: rnd(5, 12) }); }
    if (on('glitter') && Math.random() < dt * 10) { const p = pickOf(b.p); C.fx.push({ x: p.x + rnd(-14, 14), y: p.y + rnd(-14, 14), vx: 0, vy: -0.2, life: 0.5, max: 0.5, c: pickOf(['#fff6a0', '#ffffff', '#ffd8f0']), s: rnd(4, 7), star: true }); }
    if (on('fire') && Math.random() < dt * 14) { const p = pickOf(b.p); puff('🔥', p.x + rnd(-8, 8), p.y, rnd(-0.4, 0.4), -1.6, rnd(18, 28)); b.soot = Math.min(1, b.soot + dt * 0.15); }
    if (on('steam') && Math.random() < dt * 8) C.fx.push({ x: H.x + rnd(-20, 20), y: H.y - 26, vx: rnd(-0.5, 0.5), vy: rnd(-2, -1), life: 1.2, max: 1.2, c: '#ffffffaa', s: rnd(8, 14), smoke: true });
    if (on('stink') && Math.random() < dt * 6) { const p = pickOf(b.p); C.fx.push({ x: p.x, y: p.y, vx: rnd(-0.3, 0.3), vy: -1, life: 1.2, max: 1.2, stinky: true, s: 14 }); }
    if (on('tears') && Math.random() < dt * 10) for (const s of [-1, 1]) C.fx.push({ x: H.x + s * 12, y: H.y, vx: s * rnd(1, 2.5), vy: rnd(-2, 0), life: 0.6, max: 0.6, c: '#7ac8ff', s: 4, fall: true });
    if (on('rainbow') && Math.random() < dt * 30) { const p = b.p[8]; C.fx.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 1, max: 1, c: ['#ff4a4a', '#ffb02e', '#ffe14a', '#5ad04a', '#3a9aff', '#b06aff'][Math.floor(t * 20) % 6], s: 9 }); }
    if (on('ghost') && st.ghost.t > LEN.ghost - dt * 1.5) C.fx.push({ x: H.x, y: H.y, vx: 0.3, vy: -1.4, life: 2.4, max: 2.4, emo: '👻', size: 46, rot: 0 });
    if (on('cold') || on('shiver')) for (const p of b.p) { p.x += rnd(-1.4, 1.4); }
  }
  // the doll drawn squashed, shrunk or puffed (scaled about his feet), then what is on him
  function shape(b) {
    const fy = Math.max(...b.p.map((p) => p.y)), cx = (b.p[12].x + b.p[13].x) / 2; let sx = 1, sy = 1;
    if (on('flat')) { const k = Math.min(1, st.flat.t / 0.3); sx *= 1 + 0.45 * k; sy *= 1 - 0.55 * k; }
    if (on('tiny')) { const k = Math.min(1, st.tiny.t / 0.4, (LEN.tiny - st.tiny.t) / 0.3); sx *= 1 - 0.4 * k; sy *= 1 - 0.4 * k; }
    if (on('puff')) { const k = Math.min(1, st.puff.t / 0.4, (LEN.puff - st.puff.t) / 0.3) * (1 + Math.sin(performance.now() / 90) * 0.04); sx *= 1 + 0.6 * k; sy *= 1 + 0.28 * k; }
    if (sx === 1 && sy === 1) return false; const g = C.g; g.save(); g.translate(cx, fy); g.scale(sx, sy); g.translate(-cx, -fy); return true;
  }
  function over(b) {
    const g = C.g, t = performance.now() / 1000;
    for (const k of ['tint', 'cold']) if (on(k)) { g.save(); g.globalAlpha = 0.35 * Math.min(1, st[k].t); g.fillStyle = k === 'cold' ? '#7ac8ff' : st[k].c; for (const p of b.p) { g.beginPath(); g.arc(p.x, p.y, p.r + 8, 0, 7); g.fill(); } g.beginPath(); g.arc(b.p[0].x, b.p[0].y, 32, 0, 7); g.fill(); g.restore(); }
    if (on('blush')) { g.fillStyle = '#ff5a7a88'; for (const s of [-1, 1]) { g.beginPath(); g.arc(b.p[0].x + s * 18, b.p[0].y + 6, 8, 0, 7); g.fill(); } }
    for (const s of stuck) { const p = b.p[s.i]; g.globalAlpha = Math.min(1, s.t * 2); C.emoji(s.e, p.x + s.ox, p.y + s.oy, s.head ? 54 : 38, s.a); g.globalAlpha = 1; }
    if (on('birds')) for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.09, H = b.p[0]; C.emoji('🐤', H.x + Math.cos(a) * 42, H.y - 40 + Math.sin(a) * 10, 22, 0, Math.sin(a) > 0 ? 1 : -1); }
  }
  return { _st: st, _stuck: stuck, apply, tick, shape, over, paint: () => (on('paint') ? st.paint.c : null), float: () => on('float'), bouncy: () => on('bouncy') };
}
