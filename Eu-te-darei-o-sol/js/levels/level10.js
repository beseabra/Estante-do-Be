// ============================================================
//  CAPÍTULO X — O SOL
//  Noah e Jude, 16 anos. A última subida: um penhasco que vai
//  até o céu. COOPERATIVO e VERTICAL, com tudo o que eles
//  aprenderam: degraus da vovó, pontes de tinta, nuvens-elevador,
//  placas, portões e pedra rachada.
//  Os dois precisam chegar ao topo com todos os raios.
//  Pedaço do mundo recuperado: O SOL.
// ============================================================
F.Levels.push({
  id: 10,
  numeral: 'X',
  title: 'O Sol',
  subtitle: 'Noah e Jude, 16 anos',
  quote: { lines: ['"Somos, cada um de nós para o outro, uma chave para uma porta', 'que de outra forma teria permanecido trancada para sempre."'], who: 'JUDE' },
  who: 'both',
  piece: 'sol',
  pieceName: 'O SOL',
  collectibleArt: 'raio',
  collectibleName: 'raios',
  width: 1600,
  height: 2000,
  fallLimit: 460,
  paintTtl: 6,
  spawn: { x: 90, y: 1960 },     // Noah
  spawn2: { x: 150, y: 1960 },   // Jude

  music: { dur: 3.2, arp: 'pluck', chords: [[50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64], [50, 57, 62, 69], [52, 59, 62, 67], [43, 55, 59, 64], [45, 57, 61, 66]] },

  theme: {
    sky: [[0, '#ffd27a'], [0.45, '#ff9a6a'], [1, '#6a4a9a']],
    clouds: 8,
    cloudColor: 'rgba(255,230,210,0.4)',
    hills: [
      { y: 470, amp: 30, freq: 0.004, color: 'rgba(120,70,120,0.55)', parallax: 0.1 },
      { y: 500, amp: 18, freq: 0.008, color: 'rgba(80,50,90,0.7)', parallax: 0.2 },
    ],
    weather: { sparkles: 30, petals: 10 },
    petalColor: '255,210,100',
    platform: { top: '#f0c890', body: '#8a5a50', deep: '#4a2a34' },
    accent: '255,210,130',
    text: '#2a1424',
  },

  platforms: [
    // base: dois lados separados pelo portão A
    [0, 1960, 1600, 80],
    [300, 1880, 90, 14, { ghost: true }],
    [450, 1800, 90, 14, { ghost: true }],
    [600, 1720, 90, 14, { ghost: true }],
    [720, 1660, 220, 18],                  // saliência com a placa A (só a Jude chega)
    // T2: a saliência da direita (no alto do primeiro elevador)
    [1250, 1480, 350, 18],
    // T3: depois das pontes de tinta
    [700, 1420, 200, 18],
    [880, 1340, 90, 14, { ghost: true }],
    [1000, 1260, 90, 14, { ghost: true }],
    [880, 1180, 90, 14, { ghost: true }],
    [1000, 1110, 90, 14, { ghost: true }],
    // T4: a plataforma larga com a pedra rachada
    [600, 1060, 700, 18],
    // escada até o céu
    [1180, 980, 160, 18],
    [1400, 900, 160, 18],
    [1180, 820, 160, 18],
    [1400, 740, 160, 18],
    [1180, 660, 160, 18],
    [600, 580, 1000, 18],                  // o topo
  ],

  plates: [[820, 1660, 'a'], [1100, 1960, 'a']],
  gates: [[1000, 1600, 30, 360, ['a']]],
  cracked: [[1100, 900, 40, 160, 4]],
  clouds: [
    { x: 1300, y: 1940, dy: -460, period: 7 },     // elevador 1 (base -> T2)
    { x: 650, y: 1400, dy: -340, period: 6 },      // elevador 2 (T3 -> T4)
    { x: 1200, y: 860, dx: 320, period: 4 },       // nuvens cinzentas no caminho da escada
    { x: 1200, y: 700, dx: 320, period: 5, phase: 2 },
  ],
  pots: [[1500, 1480], [850, 1060]],

  checkpoints: [[60, 1960], [840, 1660], [1180, 1960], [1500, 1480], [800, 1420], [700, 1060], [700, 580]],

  collectibles: [
    [495, 1760, 'o primeiro desenho que fizemos juntos, um em cada metade da folha'],
    [1400, 1420, 'a mamãe rindo na cozinha, as duas mãos sujas de tinta'],
    [1000, 1380, 'a ponte que só existe enquanto os dois atravessam'],
    [1260, 930, 'o dia em que paramos de dividir o mundo e começamos a dividir tudo'],
    [1480, 690, 'o sol, finalmente, do tamanho de nós dois'],
  ],

  triggers: [
    { x: 0, w: 1600, lines: [['jude', 'Lá em cima, Noah. O sol está logo ali.'], ['noah', 'Então vamos. Do jeito que a gente sabe: juntos.']], hint: 'TAB troca de gêmeo. A Jude sobe os degraus da vovó até a placa que abre o portão.' },
    { x: 1030, w: 600, hint: 'Do lado de lá também tem uma placa. Quem passar segura o portão para o outro.' },
    { x: 1250, w: 400, hint: 'Pinte a nuvem: ela leva os dois para cima. Depois, pontes de tinta para a esquerda.' },
    { x: 600, w: 300, hint: 'Outra nuvem para o Noah; degraus da vovó para a Jude. E uma pedra para esculpir lá em cima.' },
  ],

  goal: { x: 1000, y: 580, style: 'sun', both: true, r: 160 },

  interlude: {
    retrato: '(Retrato, autorretrato: Dois Meninos Correndo para o Esplendor.)',
    poem: [
      'Eu te dei as árvores, as estrelas, o mar.',
      'Você me deu de volta tudo isso',
      'e mais uma coisa que eu não sabia que faltava:',
      'alguém do meu lado',
      'na hora de olhar para o sol.',
    ],
  },
});
