// Synthesized sounds: tones and bursts of noise, nothing to load.
let ac = null, noiseBuf = null, mute = (() => { try { return localStorage.getItem('buddy.mute') === '1'; } catch (e) { return false; } })();
export const muted = () => mute;
export function setMute(m) { mute = m; try { localStorage.setItem('buddy.mute', m ? '1' : '0'); } catch (e) { /* ignore */ } }
function ctx() {
  if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(f, t0, d, type = 'sine', v = 0.2, f2) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + 0.05);
}
function noise(t0, d, v = 0.3, freq = 1200, q = 0.8, type = 'lowpass') {
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + t0;
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
}
const S = {
  thump: (k) => { tone(140, 0, 0.12, 'sine', 0.25 * k, 60); noise(0, 0.08, 0.15 * k, 600); },
  pow: (k) => { tone(220, 0, 0.1, 'square', 0.12 * k, 90); noise(0, 0.12, 0.3 * k, 1800); },
  slap: (k) => { noise(0, 0.09, 0.45 * k, 3500, 0.7, 'highpass'); },
  bonk: (k) => { tone(700, 0, 0.08, 'triangle', 0.25 * k, 300); tone(180, 0, 0.18, 'sine', 0.2 * k, 80); },
  splat: (k) => { noise(0, 0.18, 0.35 * k, 900); tone(300, 0, 0.1, 'sine', 0.1 * k, 80); },
  squeak: () => { tone(900, 0, 0.12, 'square', 0.08, 1500); tone(1400, 0.06, 0.1, 'square', 0.06, 900); },
  boom: (k) => { noise(0, 0.9 * k, 0.6, 500); tone(90, 0, 0.6, 'sine', 0.4 * k, 30); },
  pop: () => { noise(0, 0.15, 0.4, 2500); tone(500, 0, 0.08, 'square', 0.1, 150); },
  zap: () => { for (let i = 0; i < 6; i++) tone(200 + Math.random() * 900, i * 0.05, 0.06, 'sawtooth', 0.1); noise(0, 0.4, 0.2, 4000, 1, 'highpass'); },
  freeze: () => { [1800, 2200, 2600, 3100].forEach((f, i) => tone(f, i * 0.05, 0.25, 'sine', 0.07)); },
  shatter: () => { noise(0, 0.35, 0.4, 5000, 1, 'highpass'); [2500, 3200, 2800].forEach((f, i) => tone(f, i * 0.03, 0.12, 'triangle', 0.06)); },
  whoosh: () => { noise(0, 0.3, 0.2, 800, 2, 'bandpass'); },
  rocket: () => { noise(0, 1.6, 0.18, 700, 1, 'bandpass'); },
  hiss: () => { noise(0, 1.2, 0.08, 6000, 1, 'highpass'); },
  laugh: () => { [520, 470, 520, 470, 560].forEach((f, i) => tone(f, i * 0.09, 0.08, 'triangle', 0.12)); },
  ouch: (k) => { tone(600, 0, 0.2, 'triangle', 0.1 * k, 350); },
  coin: () => { tone(1300, 0, 0.06, 'square', 0.04); tone(1750, 0.05, 0.1, 'square', 0.04); },
  buy: () => { [660, 880, 1100].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.12)); },
  hole: () => { tone(300, 0, 1.5, 'sine', 0.15, 40); noise(0, 1.5, 0.1, 300); },
  tick: () => tone(1500, 0, 0.03, 'square', 0.03),
  clang: (k) => { tone(1200, 0, 0.45, 'triangle', 0.12 * k, 1080); tone(1830, 0, 0.3, 'sine', 0.07 * k); noise(0, 0.05, 0.25 * k, 3000); },
  honk: () => { tone(330, 0, 0.25, 'sawtooth', 0.1, 300); tone(415, 0, 0.25, 'square', 0.05, 400); },
  boing: (k) => { tone(160, 0, 0.4, 'sine', 0.25 * k, 620); tone(320, 0.02, 0.3, 'triangle', 0.06 * k, 900); },
  crunch: (k) => { noise(0, 0.12, 0.4 * k, 2200, 1.5, 'bandpass'); noise(0.05, 0.1, 0.3 * k, 1400); },
  buzz: () => { tone(210, 0, 0.35, 'sawtooth', 0.035, 240); tone(213, 0, 0.35, 'sawtooth', 0.03, 236); },
  wind: () => { noise(0, 1.3, 0.28, 520, 0.7, 'bandpass'); },
  // more voices, so different tools sound different
  bong: (k) => { tone(520, 0, 1.1, 'sine', 0.2 * k, 505); tone(1310, 0, 0.7, 'sine', 0.08 * k); tone(2090, 0, 0.4, 'triangle', 0.04 * k); },
  ding: () => { tone(1760, 0, 0.9, 'sine', 0.12); tone(2640, 0, 0.5, 'sine', 0.05); },
  twang: () => { tone(196, 0, 0.6, 'sawtooth', 0.08, 180); tone(294, 0, 0.5, 'triangle', 0.06, 280); },
  chord: () => { [131, 156, 185, 262, 311].forEach((f, i) => tone(f, i * 0.01, 1.2, 'triangle', 0.07)); noise(0, 0.3, 0.2, 900); },
  flush: () => { noise(0, 1.4, 0.25, 700, 1.2, 'bandpass'); tone(260, 0.2, 1, 'sine', 0.06, 90); },
  moo: () => { tone(150, 0, 0.9, 'sawtooth', 0.09, 120); tone(152, 0.05, 0.85, 'square', 0.03, 118); },
  oink: () => { tone(420, 0, 0.12, 'square', 0.08, 300); tone(400, 0.16, 0.14, 'square', 0.08, 280); },
  ribbit: () => { for (let i = 0; i < 3; i++) tone(260, i * 0.06, 0.05, 'square', 0.06, 180); },
  cuckoo: () => { tone(880, 0, 0.18, 'sine', 0.12); tone(700, 0.22, 0.25, 'sine', 0.12); },
  ring: () => { for (let i = 0; i < 8; i++) tone(i % 2 ? 1320 : 1560, i * 0.07, 0.06, 'square', 0.04); },
  alarm: () => { for (let i = 0; i < 10; i++) tone(2400, i * 0.06, 0.04, 'square', 0.05); },
  fart: () => { tone(90, 0, 0.45, 'sawtooth', 0.12, 60); noise(0, 0.4, 0.15, 300); },
  burp: () => { tone(120, 0, 0.35, 'sawtooth', 0.1, 80); tone(95, 0.1, 0.25, 'square', 0.04, 70); },
  cheer: () => { noise(0, 1.2, 0.18, 1500, 0.5, 'bandpass'); [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.06)); },
  whistle: () => { tone(1800, 0, 0.18, 'sine', 0.1); tone(1800, 0.24, 0.35, 'sine', 0.1, 1700); },
  roar: () => { noise(0, 1, 0.4, 350, 0.8); tone(80, 0, 0.9, 'sawtooth', 0.15, 55); },
  sizzle: () => { noise(0, 0.9, 0.12, 5000, 0.7, 'highpass'); },
  chime: () => { [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, i * 0.06, 0.5, 'sine', 0.06)); },
  sad: () => { [392, 370, 349, 330].forEach((f, i) => tone(f, i * 0.28, 0.35, 'triangle', 0.08, f * 0.98)); },
  horn: () => { tone(330, 0, 0.35, 'square', 0.08); tone(392, 0, 0.35, 'square', 0.06); },
  siren: () => { tone(700, 0, 0.4, 'square', 0.05, 1100); tone(1100, 0.4, 0.4, 'square', 0.05, 700); },
  bark: () => { tone(500, 0, 0.08, 'sawtooth', 0.12, 260); tone(480, 0.14, 0.08, 'sawtooth', 0.12, 240); },
  meow: () => { tone(700, 0, 0.35, 'triangle', 0.1, 1000); },
  peep: () => { tone(2600, 0, 0.06, 'sine', 0.06, 3200); tone(2800, 0.09, 0.06, 'sine', 0.06, 3400); },
  bloop: () => { tone(300, 0, 0.15, 'sine', 0.15, 900); },
  slurp: () => { noise(0, 0.4, 0.15, 1200, 3, 'bandpass'); tone(300, 0, 0.4, 'sine', 0.05, 600); },
  crackle: () => { for (let i = 0; i < 9; i++) noise(i * 0.05 + Math.random() * 0.03, 0.03, 0.4, 3000, 1, 'highpass'); },
  glitch: () => { for (let i = 0; i < 6; i++) tone(100 + Math.random() * 2000, i * 0.04, 0.035, 'square', 0.05); },
  chomp: () => { noise(0, 0.08, 0.4, 1200); tone(160, 0, 0.1, 'square', 0.1, 90); },
  magic: () => { [880, 1175, 1480, 1760, 2350].forEach((f, i) => tone(f, i * 0.05, 0.3, 'sine', 0.05)); },
  power: () => { tone(200, 0, 0.6, 'sawtooth', 0.05, 1200); },
  tick2: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 900 : 1300, i * 0.25, 0.03, 'square', 0.05); },
  swish: () => { noise(0, 0.2, 0.25, 2500, 1.5, 'bandpass'); },
  crowd: () => { noise(0, 1.5, 0.15, 900, 0.4, 'bandpass'); },
};
let last = {};
export function sfx(name, k = 1) {
  if (mute) return;
  const now = performance.now(); if (now - (last[name] || 0) < 45) return; last[name] = now; // no machine-gun repeats
  try { ctx(); S[name]?.(Math.max(0.2, Math.min(1.4, k))); } catch (e) { /* no sound */ }
}
