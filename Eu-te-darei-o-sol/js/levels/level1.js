// ============================================================
//  CAPÍTULO I — O MUSEU INVISÍVEL
//  Noah, 13 anos. O bosque atrás de casa.
//  Aprende: pular, PLANAR (segurar pular no ar) e PINTAR (X).
//  Pedaço do mundo recuperado: AS ÁRVORES.
//
//  Formato das fases (vale para todas):
//    platforms:    [x, y, largura, altura, opções]
//    clouds:       { x, y, dx, dy, period }  nuvens cinzentas
//    pots:         [x, y]                    potes de tinta
//    checkpoints:  [x, y]                    girassóis
//    collectibles: [x, y, 'memória']
//    triggers:     { x, w, lines: [[quem, fala]], hint }
// ============================================================
F.Levels.push({
  id: 1,
  numeral: 'I',
  title: 'O Museu Invisível',
  subtitle: 'Noah, 13 anos',
  quote: { lines: ['"Jude e eu temos uma alma em comum que compartilhamos:', 'uma árvore com as folhas em chamas."'], who: 'NOAH' },
  who: 'noah',
  piece: 'arvores',
  pieceName: 'AS ÁRVORES',
  collectibleArt: 'retrato',
  collectibleName: 'retratos',
  width: 3400,
  height: 540,
  spawn: { x: 60, y: 460 },

  music: { dur: 3.2, arp: 'pluck', chords: [[50, 57, 62, 66], [52, 59, 62, 67], [47, 54, 59, 62], [43, 55, 59, 62]] },

  theme: {
    sky: [[0, '#9fd8f0'], [0.55, '#d9f2d2'], [1, '#f7f0c4']],
    celestial: { type: 'sun', x: 760, y: 90, r: 34, color: '#fff3b8', glow: '255,230,150' },
    clouds: 6,
    cloudColor: 'rgba(255,255,255,0.55)',
    hills: [
      { y: 380, amp: 40, freq: 0.004, color: '#9fcf8a', parallax: 0.08 },
      { y: 430, amp: 26, freq: 0.007, color: '#7ab56c', parallax: 0.18 },
    ],
    trees: { y: 470, far: 'rgba(70,130,80,0.55)', near: 'rgba(40,96,56,0.8)' },
    weather: { leaves: 22, sparkles: 14 },
    platform: { top: '#8fd36a', body: '#6b4a30', deep: '#3e2a1c' },
    flowers: ['#ffd84a', '#ff8fb0', '#ffffff', '#9ad0ff'],
    accent: '255,220,140',
    text: '#2a3a2a',
  },

  platforms: [
    [0, 460, 700, 80],
    [780, 460, 300, 80],
    [880, 380, 120, 18],
    [1100, 380, 100, 18],
    [1260, 300, 140, 18],
    // o vão do voo: só planando
    [1700, 420, 300, 120],
    // o vão das pontes: só pintando
    [2250, 340, 300, 200],
    [2900, 300, 160, 18],
    [3000, 460, 400, 80],
  ],

  clouds: [
    { x: 840, y: 436, dx: 200, period: 4.5 },
    { x: 2620, y: 330, dx: 200, period: 5 },
  ],

  pots: [[1900, 420], [2400, 340]],

  checkpoints: [[50, 460], [1720, 420], [2280, 340], [3020, 460]],

  collectibles: [
    [400, 410, 'a mamãe pintando ao meu lado, no chão da sala'],
    [930, 330, 'a Jude me ensinando a assobiar com folha de grama'],
    [1550, 250, 'eu caindo do pinheiro e achando que voava'],
    [2154, 370, 'o primeiro desenho que eu nunca mostrei a ninguém'],
    [2700, 280, 'as cores que só eu enxergo quando corro'],
  ],

  triggers: [
    { x: 80, lines: [['noah', 'Na minha cabeça existe um museu inteiro. Ninguém vê, mas cada quadro é de verdade.']] },
    { x: 260, hint: '← → andar  ·  ESPAÇO pular' },
    { x: 700, lines: [['noah', 'Nuvem cinzenta. Ela suga a cor de tudo que toca.']], hint: 'Desvie, ou chegue perto e aperte X para pintá-la.' },
    { x: 1260, lines: [['noah', 'A mamãe diz que ela é o meu paraquedas. Então eu posso pular.']], hint: 'Segure ESPAÇO no ar para PLANAR.' },
    { x: 1820, lines: [['noah', 'Tinta! Agora eu pinto o meu próprio caminho.']], hint: 'Na beirada, aperte X: uma ponte de tinta. Ela some depressa.' },
    { x: 2470, lines: [['noah', 'Se eu pintar aquela nuvem, ela vira um barco no céu.']] },
    { x: 3080, lines: [['noah', 'As árvores. Elas voltaram a ter cor.']] },
  ],

  goal: { x: 3250, y: 460, style: 'piece' },

  interlude: {
    retrato: '(Retrato, autorretrato: Gêmeos: O Raio de Luz e o Raio de Escuridão.)',
    poem: [
      'Eu guardo as coisas que vejo',
      'em molduras que ninguém pendura.',
      'Hoje eu pintei as árvores de volta:',
      'cada folha era um segredo',
      'que eu ainda não sabia contar.',
    ],
  },
});
