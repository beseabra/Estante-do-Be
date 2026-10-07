// ============================================================
//  FRAGMENTO IV — O MEDO
//  Neve. Algumas plataformas são de gelo e quebram depois
//  que ele pisa (fragile: true). Não dá pra ficar parado.
// ============================================================
F.Levels.push({
  id: 4,
  numeral: 'IV',
  title: 'O Medo',
  subtitle: 'a versão que tem medo',
  width: 3000,
  height: 540,
  spawn: { x: 80, y: 460 },

  music: { dur: 5, chords: [[40, 55, 59, 62], [48, 55, 59, 64], [45, 55, 60, 64], [47, 54, 59, 63]] },

  theme: {
    sky: [[0, '#1c2236'], [0.5, '#46506e'], [1, '#c9c4d6']],
    stars: 50,
    celestial: { type: 'moon', x: 200, y: 120, r: 38, color: '#fffaf4', glow: '230,230,255' },
    hills: [
      { y: 400, amp: 40, freq: 0.004, color: '#8d93ab', parallax: 0.12 },
      { y: 450, amp: 25, freq: 0.007, color: '#5f6684', parallax: 0.3 },
      { y: 495, amp: 15, freq: 0.012, color: '#e9ecf5', parallax: 0.55 },
    ],
    weather: { snow: 90 },
    platform: { top: '#ffffff', body: '#5d6688', deep: '#2d3350' },
    fragile: { top: '#e8f6ff', body: '#9fc4e0', deep: '#5d86a8' },
    shard: { light: '#ffffff', mid: '#e3f1ff', dark: '#8fb3e0', glow: '200,225,255' },
    accent: '210,230,255',
    text: '#f4f7ff',
  },

  platforms: [
    [0, 460, 420, 80],
    [500, 420, 100, 18, { fragile: true }],
    [680, 380, 100, 18, { fragile: true }],
    [860, 340, 100, 18, { fragile: true }],
    [1040, 340, 180, 18],
    [1300, 300, 90, 18, { fragile: true }],
    [1470, 260, 90, 18, { fragile: true }],
    [1640, 300, 200, 18],
    [1920, 340, 90, 18, { fragile: true }],
    [2090, 380, 90, 18, { fragile: true }],
    [2260, 420, 90, 18, { fragile: true }],
    [2430, 460, 570, 80],
  ],

  fragments: [
    [730, 330, 'o casaco que você nunca tira'],
    [1130, 290, 'o "tá tudo bem" que não estava'],
    [1515, 210, 'suas mãos sempre frias'],
    [2135, 330, 'a coragem que você não sabe que tem'],
    [2600, 400, 'o dia em que você confiou em mim'],
  ],

  amada: { x: 2850, y: 460, pose: 'shy' },

  poem: [
    'Você pisa no mundo com cuidado,',
    'como quem já viu o chão ceder.',
    'Não vou te pedir que não tenha medo.',
    'Vou só ficar aqui embaixo,',
    'pra que toda queda sua',
    'tenha onde chegar.',
  ],
});
