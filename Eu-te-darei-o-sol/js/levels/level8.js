// ============================================================
//  CAPÍTULO VIII — COISAS QUEBRADAS
//  Jude, 16 anos. O ateliê de pedra do escultor, à noite.
//  Quebra-cabeça para uma pessoa só: dois blocos, três portões,
//  degraus da vovó, pedras caindo do teto. No fim, o Oscar
//  segura a última placa para ela passar.
//  Pedaço do mundo recuperado: AS PEDRAS.
// ============================================================
F.Levels.push({
  id: 8,
  numeral: 'VIII',
  title: 'Coisas Quebradas',
  subtitle: 'Jude, 16 anos',
  quote: { lines: ['"Porque todos nós estamos quebrados.', 'Quero dizer, não estamos? Eu estou."'], who: 'NA AULA DE ARGILA' },
  who: 'jude',
  piece: 'pedras',
  pieceName: 'AS PEDRAS',
  collectibleArt: 'pagina',
  collectibleName: 'páginas',
  width: 3400,
  height: 540,
  spawn: { x: 60, y: 460 },

  music: { dur: 4, arp: 'pluck', chords: [[40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 53], [35, 42, 47, 50]] },

  theme: {
    sky: [[0, '#1e1612'], [0.6, '#3a2a20'], [1, '#5a4030']],
    celestial: { type: 'moon', x: 300, y: 90, r: 18, color: 'rgba(255,240,220,0.6)', glow: '255,220,180' },
    hills: [],
    giants: { y: 470, color: 'rgba(110,90,74,0.4)' },
    weather: { dust: 50 },
    platform: { top: '#c8b498', body: '#6a5644', deep: '#36291e' },
    accent: '255,200,140',
    text: '#f4e6d4',
  },

  platforms: [
    [0, 460, 930, 80],
    [930, 460, 1170, 80],
    [1300, 380, 90, 14, { ghost: true }],
    [1420, 320, 90, 14, { ghost: true }],
    [1520, 260, 240, 18],
    [2120, 420, 90, 18, { move: { dx: 180, period: 4 } }],
    [2400, 460, 1000, 80],
  ],

  blocks: [[300, 460], [1560, 260]],
  plates: [[600, 460, 'a'], [1680, 260, 'b'], [2950, 460, 'c']],
  gates: [[900, 100, 30, 360, ['a']], [1800, 100, 30, 360, ['b']], [3050, 100, 30, 360, ['c']]],
  cracked: [[1200, 260, 40, 200, 4]],
  meteors: { startX: 1850, endX: 2650, interval: 1.7, rocks: true },
  amulets: [[1900, 430, 'passaro'], [2480, 430, 'trevo']],

  npcs: [
    { kind: 'vovo', x: 1260, y: 440, facing: 1 },
    { kind: 'oscar', x: 2720, y: 460, facing: -1, holds: true },
  ],

  checkpoints: [[60, 460], [960, 460], [1860, 460], [2440, 460], [3110, 460]],

  collectibles: [
    [450, 400, 'Pedra rachada guarda o formato do que vai virar.'],
    [1465, 270, 'Quem esculpe um anjo precisa primeiro aceitar a poeira.'],
    [1640, 210, 'Um menino com uma câmera sempre vê demais.'],
    [2250, 360, 'Toda escultura quebrada estava, antes, inteira demais.'],
    [2800, 410, 'Nunca esculpa sozinha o que precisa de duas mãos.'],
  ],

  triggers: [
    { x: 60, lines: [['jude', 'O ateliê do Guillermo. Esculturas quebradas por todo lado.'], ['jude', 'Eu vim aprender a esculpir em pedra. Pedra não volta atrás.']] },
    { x: 200, hint: 'Empurre o bloco até a placa para abrir o portão. Se travar, R devolve o bloco.' },
    { x: 1000, hint: 'Esculpa a parede. Depois, os degraus da vovó levam ao segundo bloco.' },
    { x: 1150, lines: [['vovo', 'Pedra é paciente, querida. Seja também.']] },
    { x: 1860, lines: [['jude', 'O teto está caindo aos pedaços!']], hint: 'Pedras caem do teto: fuja das marcas laranja.' },
    { x: 2640, lines: [['oscar', 'Ei. Você é a aprendiz nova? Eu sou o Oscar.'], ['oscar', 'Deixa que eu seguro essa placa pra você.']], move: [1, 2970] },
    { x: 3120, lines: [['jude', 'Ele segurou o portão. Assim, sem pedir nada.']] },
  ],

  goal: { x: 3260, y: 460, style: 'piece' },

  interlude: {
    retrato: '(Da bíblia da vovó: "Se o azar souber onde você está, transforme-se em outra pessoa.")',
    poem: [
      'Eu bati na pedra até ela ceder',
      'e descobri que dentro dela',
      'tinha uma forma esperando por mim.',
      'Talvez dentro de mim também',
      'tenha alguém esperando para sair.',
    ],
  },
});
