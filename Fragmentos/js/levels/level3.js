// ============================================================
//  FRAGMENTO III — A DISTÂNCIA
//  Chuva. As plataformas vão e voltam, como a saudade.
//  move: { dx, dy, period } = quanto anda e em quantos segundos.
// ============================================================
F.Levels.push({
  id: 3,
  numeral: 'III',
  title: 'A Distância',
  subtitle: 'a versão que mora longe',
  width: 3200,
  height: 540,
  spawn: { x: 80, y: 460 },

  music: { dur: 4.5, chords: [[38, 53, 57, 64], [46, 53, 57, 62], [41, 53, 57, 64], [48, 55, 60, 64]] },

  theme: {
    sky: [[0, '#1e2a44'], [0.6, '#4a5d80'], [1, '#8ea2c0']],
    clouds: 9, cloudColor: 'rgba(200,215,235,0.25)',
    hills: [
      { y: 390, amp: 45, freq: 0.003, color: '#56688a', parallax: 0.1 },
      { y: 440, amp: 30, freq: 0.006, color: '#3a4a6a', parallax: 0.3 },
      { y: 490, amp: 20, freq: 0.01, color: '#25314b', parallax: 0.55 },
    ],
    weather: { rain: 120 },
    platform: { top: '#c9d8f0', body: '#344566', deep: '#1a2338' },
    shard: { light: '#ffffff', mid: '#cfe2ff', dark: '#5b8fe0', glow: '170,200,255' },
    accent: '190,215,255',
    text: '#eef4ff',
  },

  platforms: [
    [0, 460, 400, 80],
    [480, 420, 120, 18, { move: { dx: 200, dy: 0, period: 4 } }],
    [880, 420, 140, 18],
    [1080, 420, 110, 18, { move: { dx: 0, dy: -160, period: 5 } }],
    [1250, 260, 200, 18],
    [1520, 300, 110, 18, { move: { dx: 240, dy: 0, period: 5 } }],
    [1900, 360, 160, 18],
    [2120, 460, 300, 80],
    [2480, 400, 110, 18, { move: { dx: 0, dy: -150, period: 4.5 } }],
    [2650, 250, 140, 18],
    [2860, 460, 340, 80],
  ],

  fragments: [
    [590, 360, 'a mensagem que chegou de madrugada'],
    [1135, 215, 'o mesmo céu, cidades diferentes'],
    [1350, 215, 'contar os dias até te ver'],
    [1700, 250, 'sua voz cansada dizendo boa noite'],
    [2720, 200, 'a chuva que eu queria dividir com você'],
  ],

  amada: { x: 3080, y: 460, pose: 'sky' },

  poem: [
    'Existe uma distância entre nós',
    'que nenhum mapa sabe medir.',
    'Mas a chuva que cai aqui',
    'é a nuvem que passou por você',
    'e isso, por hoje, me basta',
    'pra não desistir do caminho.',
  ],
});
