// ============================================================
//  CAPÍTULO IX — GÊMEOS
//  Noah e Jude, 16 anos. O ateliê de pedra do escultor.
//  COOPERATIVO: TAB troca de gêmeo. Quem fica parado continua
//  onde está (e continua pesando nas placas!).
//    - Placas de pressão abrem portões da mesma cor.
//    - A Jude empurra blocos, esculpe pedras e sobe degraus da vovó.
//    - O Noah pinta pontes que os DOIS podem usar e colore nuvens.
//  Os dois precisam chegar à escultura com todos os raios.
//  Pedaço do mundo recuperado: AS METADES.
// ============================================================
F.Levels.push({
  id: 9,
  numeral: 'IX',
  title: 'Gêmeos',
  subtitle: 'Noah e Jude, 16 anos',
  quote: { lines: ['"É sempre assim: duas pedras, dois papéis, duas tesouras.', 'Quando não nos desenho assim, eu nos desenho como pessoas pela metade."'], who: 'NOAH' },
  who: 'both',
  piece: 'metades',
  pieceName: 'AS METADES',
  collectibleArt: 'raio',
  collectibleName: 'raios',
  width: 3200,
  height: 540,
  spawn: { x: 70, y: 460 },     // Noah
  spawn2: { x: 120, y: 460 },   // Jude
  paintTtl: 6,

  music: { dur: 3.4, arp: 'pluck', chords: [[50, 57, 62, 66], [45, 57, 61, 64], [47, 54, 59, 62], [43, 55, 59, 62], [50, 57, 62, 66], [45, 57, 61, 64], [43, 55, 59, 64], [45, 57, 61, 66]] },

  theme: {
    sky: [[0, '#5a4636'], [0.5, '#8a6a4e'], [1, '#c09a6e']],
    celestial: { type: 'sun', x: 640, y: 80, r: 22, color: 'rgba(255,230,170,0.7)', glow: '255,210,140' },
    hills: [],
    giants: { y: 470, color: 'rgba(60,44,34,0.55)' },
    weather: { dust: 40 },
    platform: { top: '#d8c4a0', body: '#7a634a', deep: '#40332a' },
    accent: '255,200,120',
    text: '#2a1e14',
  },

  platforms: [
    [0, 460, 1200, 80],
    // vão 1200..1400: precisa da ponte do Noah
    [1400, 460, 900, 80],
    [1450, 380, 80, 14, { ghost: true }],
    [1560, 310, 80, 14, { ghost: true }],
    [1650, 250, 200, 18],
    // vão 2300..2600: precisa da nuvem colorida
    [2600, 460, 600, 80],
  ],

  blocks: [[400, 460]],
  plates: [[640, 460, 'a'], [1760, 250, 'b'], [2000, 460, 'b']],
  gates: [[700, 100, 30, 360, ['a']], [1900, 100, 30, 360, ['b']]],
  cracked: [[1000, 260, 40, 200, 3]],
  clouds: [{ x: 2330, y: 438, dx: 240, period: 5 }],
  pots: [[1100, 460], [2200, 460]],

  checkpoints: [[40, 460], [770, 460], [1420, 460], [1960, 460], [2640, 460]],

  collectibles: [
    [450, 380, 'nós dois dividindo o mundo: eu fico com as árvores, você com o resto'],
    [1100, 400, 'a mamãe dizendo que nós éramos uma alma só, cortada em dois'],
    [1600, 260, 'a escultura que a Jude fez de nós, ainda grudados'],
    [2150, 400, 'o dia em que paramos de nos falar'],
    [2450, 400, 'o dia em que voltamos'],
  ],

  triggers: [
    { x: 40, lines: [['jude', 'O ateliê. O escultor faz gigantes de pedra que parecem prestes a acordar.'], ['noah', 'Jude... a gente passou três anos sem se olhar direito.'], ['jude', 'Eu sei. Mas hoje a gente atravessa junto.']], hint: 'TAB troca entre Noah e Jude. Quem fica parado continua onde está.' },
    { x: 300, hint: 'Placas seguram portões abertos. A Jude empurra blocos, e um bloco também pesa.' },
    { x: 900, hint: 'Pedra rachada: é com a Jude (X).' },
    { x: 1110, lines: [['jude', 'Noah, uma ponte. Eu passo logo atrás de você.']], hint: 'As pontes de tinta servem para os dois. Seja rápido na troca!' },
    { x: 1420, lines: [['jude', 'A vovó deixou degraus. Só pra mim.']], hint: 'Um segura a placa lá em cima, o outro passa. Depois há outra placa do lado de lá.' },
    { x: 2220, lines: [['noah', 'Aquela nuvem cinzenta... se eu pintar, ela leva nós dois.']] },
    { x: 2700, lines: [['jude', 'É a escultura de nós dois. Grudados, como a mamãe dizia.']], hint: 'Os dois gêmeos precisam chegar à escultura.' },
  ],

  goal: { x: 2950, y: 460, style: 'sculpture', both: true },

  interlude: {
    retrato: '(Retrato, autorretrato: Gêmeos: Noah Olhando num Espelho, Jude Afastando Seu Olhar do Dele.)',
    poem: [
      'A pedra precisava ser partida',
      'para que cada um tivesse o próprio pedaço inteiro.',
      'Não é perder a metade.',
      'É finalmente ter espaço',
      'para segurar a mão do outro.',
    ],
  },
});
