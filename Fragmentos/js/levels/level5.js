// ============================================================
//  FRAGMENTO V — A INTEIRA
//  Amanhecer. Uma subida até o alto, onde ela espera — inteira.
//  É uma fase vertical: height é maior que a tela, e o sol
//  vai nascendo conforme ele sobe (celestial.rise).
// ============================================================
F.Levels.push({
  id: 5,
  numeral: 'V',
  title: 'A Inteira',
  subtitle: 'a versão que me olha de volta',
  width: 960,
  height: 1800,
  spawn: { x: 120, y: 1720 },
  final: true, // ela não vira luz: ela fica

  music: { dur: 4, chords: [[41, 57, 60, 64], [43, 55, 59, 62], [40, 55, 59, 64], [45, 57, 60, 64]] },

  theme: {
    sky: [[0, '#3b2a6b'], [0.4, '#b4588a'], [0.75, '#f49a86'], [1, '#ffd9a0']],
    stars: 40,
    celestial: { type: 'sun', x: 480, y: 210, r: 70, color: '#fff0c8', glow: '255,200,150', rise: 330 },
    clouds: 6, cloudColor: 'rgba(255,215,220,0.3)',
    hills: [
      { y: 400, amp: 35, freq: 0.004, color: '#c0607e', parallax: 0.15 },
      { y: 450, amp: 25, freq: 0.007, color: '#8a3a62', parallax: 0.3 },
      { y: 495, amp: 16, freq: 0.012, color: '#5a1f48', parallax: 0.5 },
    ],
    weather: { petals: 30, sparkles: 30 },
    platform: { top: '#ffe1c7', body: '#7a3355', deep: '#3a1430' },
    fragile: { top: '#fff1e0', body: '#c98aa0', deep: '#7a4a60' },
    flowers: ['#fff3d6', '#ffc9d6', '#ffffff'],
    shard: { light: '#ffffff', mid: '#ffe0b8', dark: '#ff7a8a', glow: '255,200,170' },
    accent: '255,210,180',
    text: '#fff6ee',
  },

  platforms: [
    [0, 1720, 960, 80],
    [300, 1640, 140, 18],
    [520, 1570, 140, 18],
    [720, 1500, 140, 18],
    [500, 1420, 140, 18],
    [280, 1350, 140, 18],
    [60, 1280, 140, 18],
    [260, 1200, 140, 18],
    [480, 1130, 140, 18],
    [700, 1060, 120, 18, { move: { dx: 0, dy: -140, period: 5 } }],
    [480, 920, 140, 18],
    [260, 850, 140, 18],
    [60, 780, 120, 18, { fragile: true }],
    [240, 700, 140, 18],
    [460, 630, 140, 18],
    [680, 560, 140, 18],
    [440, 480, 160, 18],
    [200, 410, 160, 18],
    [380, 330, 580, 24],
  ],

  fragments: [
    [590, 1520, 'o seu nome, que virou oração'],
    [130, 1230, 'cada versão sua, guardada aqui'],
    [760, 880, 'o caminho todo valeu'],
    [120, 730, 'o sol nascendo no seu rosto'],
    [520, 440, 'você — finalmente — inteira'],
  ],

  amada: { x: 840, y: 330, pose: 'stand' },

  poem: [
    'Juntei seus pedaços, um por um,',
    'e descobri, no fim,',
    'que você nunca esteve quebrada:',
    'eu é que precisava de cada versão',
    'pra aprender o tamanho',
    'do que eu sinto por você.',
  ],
});
