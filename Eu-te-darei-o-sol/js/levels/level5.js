// ============================================================
//  CAPÍTULO V — A ESCOLA DE ARTES
//  Noah, 13 a 14 anos. Os corredores da escola de belas-artes,
//  a vaga que os dois gêmeos disputam.
//  Novidade: MOLDURAS-PORTAL. Paredes separam as salas; o único
//  jeito de atravessar é entrar num quadro (X na frente dele) e
//  sair pelo quadro com a mesma pintura.
//  Pedaço do mundo recuperado: AS CORES.
//
//  frames: [x, y, id, pintura]  molduras com o mesmo id são ligadas
// ============================================================
F.Levels.push({
  id: 5,
  numeral: 'V',
  title: 'A Escola de Artes',
  subtitle: 'Noah, 13 a 14 anos',
  quote: { lines: ['"Durante o dia, todo mundo conversa usando cores em vez de sons."'], who: 'JUDE, IMAGINANDO O PARAÍSO' },
  who: 'noah',
  piece: 'cores',
  pieceName: 'AS CORES',
  collectibleArt: 'retrato',
  collectibleName: 'retratos',
  width: 3400,
  height: 540,
  spawn: { x: 60, y: 460 },

  music: { dur: 3, arp: 'pluck', chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]] },

  theme: {
    sky: [[0, '#d8cdb8'], [0.7, '#ece4d4'], [1, '#c8b89c']],
    gallery: { color: 'rgba(120,96,70,0.18)' },
    hills: [],
    weather: { dust: 26 },
    platform: { top: '#a8865a', body: '#7a5a3e', deep: '#4a3626' },
    fragile: { top: '#d8c8a0', body: '#a89070', deep: '#6a5640' },
    accent: '255,190,110',
    text: '#2a1e14',
  },

  platforms: [
    // sala 1: os cavaletes sobem até o quadro de girassóis
    [0, 460, 900, 80],
    [300, 380, 120, 18],
    [500, 300, 120, 18],
    [700, 220, 160, 18],
    [900, -300, 40, 760],        // parede
    // sala 2: o vão do ateliê (planar) com um crítico cinzento por cima
    [940, 460, 360, 80],
    [1050, 280, 120, 18],
    [1500, 460, 500, 80],
    [2000, -300, 40, 760],       // parede
    // sala 3: cavalete que sobe, pontes até a galeria lá no alto
    [2040, 460, 1360, 80],
    [2300, 440, 100, 18, { move: { dy: -150, period: 5 } }],
    [2450, 280, 160, 18],
    [2780, 280, 140, 18, { fragile: true }],
    [3000, 200, 400, 18],        // a galeria
  ],

  frames: [
    [780, 220, 'A', 'a'], [1000, 460, 'A', 'a'],     // sala 1 -> sala 2
    [1110, 280, 'C', 'd'], [140, 460, 'C', 'd'],     // atalho de volta (sala 2 -> sala 1)
    [1940, 460, 'B', 'b'], [2100, 460, 'B', 'b'],    // sala 2 -> sala 3
  ],

  clouds: [{ x: 1320, y: 380, dx: 160, period: 3.5 }],
  pots: [[200, 460], [1600, 460], [2500, 280]],

  npcs: [{ kind: 'jude', x: 3330, y: 200, facing: -1 }],

  checkpoints: [[60, 460], [1010, 460], [1560, 460], [2160, 460], [3040, 200]],

  collectibles: [
    [600, 240, 'a mamãe dizendo que a escola seria perfeita para nós dois'],
    [1110, 220, 'o menino com cara de lua e boca de Renoir'],
    [1400, 330, 'meu nome na lista de aprovados'],
    [2530, 230, 'a Jude fingindo que não ligava'],
    [3100, 150, 'o primeiro quadro que eu pendurei de verdade'],
  ],

  triggers: [
    { x: 80, lines: [['noah', 'A escola de belas-artes. A mamãe quer que a gente entre. Os dois.'], ['noah', 'Mas só cabe um de nós. Pelo menos é o que parece.']] },
    { x: 240, hint: 'Paredes separam as salas. Entre num quadro: fique na frente dele e aperte X.' },
    { x: 960, lines: [['noah', 'Eu atravessei a pintura. Eu ATRAVESSEI a pintura.']] },
    { x: 1030, hint: 'Um quadro lá no alto? Pule e aperte X no ar: a tinta vira um degrau.' },
    { x: 1250, hint: 'O vão é largo demais para pular. Segure ESPAÇO para planar, e cuidado com o crítico cinzento.' },
    { x: 1520, lines: [['noah', 'Do outro lado do mar fica a próxima sala.']] },
    { x: 2160, hint: 'O cavalete sobe e desce. Lá em cima, uma ponte de tinta leva à galeria.' },
    { x: 3040, lines: [['jude', 'Você entrou, Noah.'], ['noah', 'Você também devia ter entrado.'], ['jude', 'Eu sei. A gente vai dar um jeito.']] },
  ],

  goal: { x: 3250, y: 200, style: 'piece' },

  interlude: {
    retrato: '(Retrato, autorretrato: O Menino que Via o Menino Hipnotizar o Mundo.)',
    poem: [
      'Eu atravessei uma moldura',
      'e do outro lado tinha mais mundo.',
      'Ninguém me avisou que a arte',
      'era uma porta,',
      'e não uma parede.',
    ],
  },
});
