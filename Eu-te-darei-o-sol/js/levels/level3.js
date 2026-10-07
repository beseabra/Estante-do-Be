// ============================================================
//  CAPÍTULO III — CASTOR E PÓLUX
//  Noah, 13 anos. Telhados à noite e uma chuva de meteoros.
//  O menino novo da casa ao lado coleciona pedras do céu.
//  Novidades: elevador de nuvem (pinte-a e suba), meteoros com
//  aviso no chão. Pedaço do mundo recuperado: AS ESTRELAS.
// ============================================================
F.Levels.push({
  id: 3,
  numeral: 'III',
  title: 'Castor e Pólux',
  subtitle: 'Noah, 13 anos e meio',
  quote: { lines: ['"Nunca me ocorreu que as estrelas estão lá no alto, brilhando até mesmo', 'durante o dia, mesmo que não possamos vê-las."'], who: 'NOAH' },
  who: 'noah',
  piece: 'estrelas',
  pieceName: 'AS ESTRELAS',
  collectibleArt: 'estrela',
  collectibleName: 'estrelas',
  width: 3600,
  height: 540,
  spawn: { x: 60, y: 400 },

  music: { dur: 3.6, arp: 'bell', chords: [[45, 57, 60, 64], [41, 53, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]] },

  theme: {
    sky: [[0, '#070620'], [0.55, '#1a1648'], [1, '#3b2a68']],
    stars: 160,
    celestial: { type: 'moon', x: 820, y: 90, r: 24, color: '#f6f1ff', glow: '200,190,255' },
    hills: [{ y: 470, amp: 14, freq: 0.006, color: '#120f30', parallax: 0.1 }],
    city: { y: 470, color: '#171338' },
    weather: { fireflies: 8, sparkles: 10 },
    roofTiles: true,
    platform: { top: '#8a5a7a', body: '#4a2a4a', deep: '#22142a' },
    accent: '200,180,255',
    text: '#f1efff',
  },

  platforms: [
    [0, 400, 500, 140],         // telhado A
    [600, 360, 400, 180],       // telhado B
    [860, 300, 40, 60],         // chaminé
    [1200, 420, 300, 120],      // telhado C
    [1700, 300, 300, 240],      // telhado D
    [2300, 380, 400, 160],      // telhado E
    [2420, 330, 30, 50],
    [2600, 320, 30, 60],
    [2850, 300, 300, 240],      // telhado F
    [3250, 300, 350, 240],      // telhado G (o do Brian)
  ],

  // Nuvem-elevador: sobe e desce entre o telhado C e o D
  clouds: [{ x: 1560, y: 420, dy: -120, period: 5 }],

  meteors: { startX: 1000, interval: 2.2 },

  pots: [[1420, 420], [2520, 380]],

  checkpoints: [[60, 400], [1260, 420], [1720, 300], [2320, 380], [2870, 300]],

  collectibles: [
    [300, 330, 'o Brian dizendo "meteorito" como quem diz um segredo'],
    [880, 250, 'a mala dele, cheia de pedras que caíram do céu'],
    [1350, 375, 'nós dois deitados no telhado contando estrelas cadentes'],
    [1850, 240, 'o mapa das constelações que ele desenhou na minha mão'],
    [2500, 300, 'a primeira vez que alguém olhou para os meus desenhos e entendeu'],
  ],

  triggers: [
    { x: 80, lines: [['noah', 'O menino novo da casa ao lado coleciona pedras que caíram do céu. Ele disse que hoje vai chover estrela.']] },
    { x: 560, hint: 'Pule de telhado em telhado. Planar ajuda nos vãos.' },
    { x: 1040, lines: [['noah', 'Estão caindo de verdade!']], hint: 'Meteoros! Saia de cima das marcas laranja.' },
    { x: 1430, lines: [['noah', 'Se eu pintar a nuvem, ela me leva lá para cima.']], hint: 'Cores na nuvem = elevador. Fique perto e aperte X.' },
    { x: 2620, hint: 'Alto demais para pular. Uma ponte de tinta e depois um pulo.' },
    { x: 3300, lines: [['brian', 'Aquela estrela é Castor, aquela outra é Pólux. Elas são as cabeças dos Gêmeos.'], ['brian', 'Quando Castor morreu, Pólux sentiu tanto a falta dele que fez um acordo para compartilhar sua imortalidade com ele, e foi assim que os dois acabaram no céu.'], ['noah', 'Eu faria isso. Totalmente.']] },
  ],

  goal: { x: 3460, y: 300, style: 'brian' },

  interlude: {
    retrato: '(Retrato, autorretrato: Dois Meninos Saltam e Permanecem no Ar.)',
    poem: [
      'Ele me deu uma pedra que veio de longe,',
      'mais velha do que o planeta.',
      'Eu dei a ele um desenho',
      'que eu nunca tinha mostrado a ninguém.',
      'Acho que foi uma troca justa.',
    ],
  },
});
