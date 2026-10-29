// The tools, the hats and the words, in Chinese and English.
// kind: grab (pick him up and throw), hit (strike where you tap), throw (thrown from your side to where you tap),
// drop (falls from the ceiling), bomb (lands and goes off), rocket, zap, freeze, tickle, hole, gravity (a switch),
// wind, launch, swarm; and two hundred more of them in more.js
import { MORE } from './more.js?v=3';
import { HERO_TOOLS } from './heroes.js?v=1';
export const TOOLS = [
  { id: 'hand', icon: '✋', kind: 'grab', price: 0, zh: '手', en: 'Hand' },
  { id: 'punch', icon: '🥊', kind: 'hit', power: 16, price: 0, zh: '拳擊手套', en: 'Boxing glove', snd: 'pow', word: 'POW!' },
  { id: 'tomato', icon: '🍅', kind: 'throw', price: 0, zh: '番茄', en: 'Tomatoes', r: 13, m: 1, splat: '#e0342a', snd: 'splat' },
  { id: 'slap', icon: '🖐️', kind: 'hit', power: 11, price: 40, zh: '巴掌', en: 'Slap', snd: 'slap', word: 'SLAP!' },
  { id: 'egg', icon: '🥚', kind: 'throw', price: 80, zh: '雞蛋', en: 'Eggs', r: 11, m: 1, splat: '#ffd23a', snd: 'splat' },
  { id: 'bat', icon: '🏏', kind: 'hit', power: 28, price: 150, zh: '球棒', en: 'Bat', snd: 'bonk', word: 'BONK!' },
  { id: 'duck', icon: '🦆', kind: 'drop', price: 200, zh: '橡皮鴨雨', en: 'Rubber-duck rain', r: 16, m: 1.2, many: 9, snd: 'squeak' },
  { id: 'hammer', icon: '🔨', kind: 'hit', power: 34, down: true, price: 260, zh: '鎚子', en: 'Hammer', snd: 'bonk', word: 'BONK!' },
  { id: 'water', icon: '🎈', kind: 'throw', price: 320, zh: '水球', en: 'Water balloons', r: 17, m: 1.4, splat: '#5ab4f0', wet: true, snd: 'splat' },
  { id: 'pie', icon: '🥧', kind: 'throw', price: 380, zh: '奶油派', en: 'Cream pie', r: 19, m: 1.5, splat: '#fff6e0', snd: 'splat' },
  { id: 'bowl', icon: '🎳', kind: 'drop', price: 480, zh: '保齡球', en: 'Bowling ball', r: 24, m: 7, snd: 'thump' },
  { id: 'feather', icon: '🪶', kind: 'tickle', price: 520, zh: '羽毛搔癢', en: 'Tickle feather' },
  { id: 'cracker', icon: '🧨', kind: 'bomb', price: 650, zh: '鞭炮', en: 'Firecracker', r: 10, m: 0.8, fuse: 1.3, blast: 150, force: 22 },
  { id: 'anvil', icon: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M3 7h15c2 0 3 1 3 2-3 0-5 1-6 3v2h2v3H6v-3h2v-2C5 11 3 9 3 7z" fill="#4a4f5a" stroke="#22252b" stroke-width="1"/></svg>', kind: 'drop', price: 820, zh: '鐵砧', en: 'Anvil', r: 30, m: 14, anvil: true, snd: 'thump' },
  { id: 'zap', icon: '⚡', kind: 'zap', price: 1000, zh: '閃電', en: 'Lightning' },
  { id: 'ice', icon: '🧊', kind: 'freeze', price: 1250, zh: '冰凍光線', en: 'Freeze ray' },
  { id: 'bomb', icon: '💣', kind: 'bomb', price: 1500, zh: '炸彈', en: 'Bomb', r: 18, m: 2, fuse: 2, blast: 300, force: 48 },
  { id: 'rocket', icon: '🚀', kind: 'rocket', price: 2000, zh: '火箭', en: 'Rocket' },
  { id: 'moon', icon: '🌙', kind: 'gravity', price: 2500, zh: '低重力', en: 'Low gravity' },
  { id: 'hole', icon: '🕳️', kind: 'hole', price: 3500, zh: '黑洞', en: 'Black hole' },
];
TOOLS.push(...MORE, ...HERO_TOOLS);
// the shop's shelves
export const SHELF = (t) => ({ grab: 'hit', hit: 'hit', throw: 'throw', drop: 'drop', bomb: 'bomb', hero: 'hero' })[t.kind] || 'magic';
export const HATS = [
  { id: 'none', icon: '🚫', price: 0, zh: '不戴', en: 'None' },
  { id: 'party', icon: '🥳', price: 100, zh: '派對帽', en: 'Party hat' },
  { id: 'bow', icon: '🎀', price: 150, zh: '蝴蝶結', en: 'Bow' },
  { id: 'cap', icon: '🧢', price: 200, zh: '棒球帽', en: 'Cap' },
  { id: 'shades', icon: '🕶️', price: 300, zh: '墨鏡', en: 'Sunglasses' },
  { id: 'stache', icon: '👨', price: 250, zh: '八字鬍', en: 'Moustache' },
  { id: 'cowboy', icon: '🤠', price: 400, zh: '牛仔帽', en: 'Cowboy hat' },
  { id: 'wizard', icon: '🧙', price: 600, zh: '巫師帽', en: 'Wizard hat' },
  { id: 'crown', icon: '👑', price: 800, zh: '皇冠', en: 'Crown' },
];
export const SHIRTS = ['#3a7bd5', '#e0483a', '#2fa35a', '#f2a922', '#8a4fd0', '#1d1d1d', '#f06aa8', '#00a3a3'];

export const WORDS = {
  zh: { coins: '金幣', shop: '商店', tools: '道具', shelf: { hit: '打擊', throw: '投擲', drop: '從天而降', bomb: '爆炸', magic: '特殊', hero: '🦸 超級英雄' }, have: (a, b) => `已擁有 ${a} / ${b}`, more: '更多道具', hats: '裝扮', shirt: '衣服顏色', buy: '買', owned: '已擁有', use: '使用', wear: '戴上', wearing: '戴著',
    stand: '扶他起來', clean: '洗乾淨', close: '關閉', need: (n) => `還差 ${n} 金幣`, unlocked: (x) => `買到了：${x}！`, low: '低重力：開', lowOff: '低重力：關',
    hint: '點下面的道具，再點房間裡的布偶。用「手」可以把他抓起來丟！', title: '出氣布偶', lang: 'English',
    say: { hit: ['哎喲！', '好痛！', '別打了啦！', '喂！', '嗚嗚…', '你很閒耶！', '我要告訴媽媽！', '再來啊！', '好啦好啦！', '輕一點！'],
      dizzy: ['頭好暈…', '天花板在轉…', '我看到星星了…'], tickle: ['哈哈哈！', '好癢好癢！', '不要搔啦哈哈！', '嘻嘻嘻！'],
      splat: ['好黏…', '我的衣服！', '這是番茄嗎？', '噁～'], idle: ['怎麼不玩了？', '你在嗎？', '我好無聊喔', '嘿！看這裡！', '我才不怕你咧'],
      fly: ['哇啊啊啊！', '我會飛了！', '放我下來！'], boom: ['咳咳…', '我的頭髮！', '好大聲…'], ice: ['好…冷…', '凍…凍僵了…'], zap: ['嗶嗶嗶嗶！', '麻麻的！'], wind: ['風好大！', '我要被吹走了！', '頭髮亂了啦！'], stink: ['好臭！', '噁…什麼味道！'], bug: ['走開走開！', '好癢又好痛！', '牠們咬我！'] } },
  en: { coins: 'Coins', shop: 'Shop', tools: 'Tools', shelf: { hit: 'Hit', throw: 'Throw', drop: 'From above', bomb: 'Boom', magic: 'Special', hero: '🦸 Heroes' }, have: (a, b) => `Owned ${a} / ${b}`, more: 'More tools', hats: 'Looks', shirt: 'Shirt colour', buy: 'Buy', owned: 'Owned', use: 'Use', wear: 'Wear', wearing: 'Wearing',
    stand: 'Stand him up', clean: 'Wash him', close: 'Close', need: (n) => `${n} more coins`, unlocked: (x) => `Got it: ${x}!`, low: 'Low gravity: on', lowOff: 'Low gravity: off',
    hint: 'Pick a tool below, then tap the buddy in the room. With the hand you can pick him up and throw him!', title: 'Buddy Bash', lang: '中文',
    say: { hit: ['Ouch!', 'Ow ow ow!', 'Stop it!', 'Hey!', 'Boo hoo…', 'Got nothing better to do?', 'I’m telling Mum!', 'Is that all?', 'OK, OK!', 'Gently!'],
      dizzy: ['So dizzy…', 'The ceiling is spinning…', 'I see stars…'], tickle: ['Hahaha!', 'That tickles!', 'Stop, hahaha!', 'Hee hee hee!'],
      splat: ['Sticky…', 'My shirt!', 'Was that a tomato?', 'Eww!'], idle: ['Bored already?', 'Are you there?', 'I’m so bored', 'Hey! Over here!', 'I’m not scared of you'],
      fly: ['Waaaah!', 'I can fly!', 'Put me down!'], boom: ['*cough cough*', 'My hair!', 'So loud…'], ice: ['S-so… cold…', 'F-frozen…'], zap: ['Bzzzzt!', 'That tingles!'], wind: ['So windy!', 'I’m blowing away!', 'My hair!'], stink: ['Phew, the smell!', 'Eww, what is that?'], bug: ['Shoo! Shoo!', 'They’re biting me!', 'Go away!'] } },
};
