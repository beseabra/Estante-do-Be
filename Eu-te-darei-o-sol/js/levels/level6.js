// ============================================================
//  CAPÍTULO VI — A QUEDA DO DIABO
//  Jude. Falésias sobre o mar, pôr do sol de inverno.
//  Novidades: a MARÉ sobe e desce (as pedras baixas somem na
//  maré alta) e pedras soltas que desmoronam.
//  No fim, a Jude tira o Noah das ondas.
//  Pedaço do mundo recuperado: OS OCEANOS.
// ============================================================
F.Levels.push({
  id: 6,
  numeral: 'VI',
  title: 'A Queda do Diabo',
  subtitle: 'Jude, 16 anos',
  quote: { lines: ['"Nunca me senti tão assustada assim,', 'nem mesmo quando a mamãe morreu."'], who: 'JUDE' },
  who: 'jude',
  piece: 'oceanos',
  pieceName: 'OS OCEANOS',
  collectibleArt: 'pagina',
  collectibleName: 'páginas',
  width: 3600,
  height: 540,
  spawn: { x: 60, y: 300 },

  music: { dur: 4, arp: 'pluck', chords: [[43, 50, 58, 62], [46, 53, 58, 65], [41, 48, 57, 60], [45, 52, 57, 61]] },

  theme: {
    sky: [[0, '#3a3a7a'], [0.45, '#c86a8a'], [0.8, '#f4a86a'], [1, '#ffd68a']],
    celestial: { type: 'sun', x: 700, y: 330, r: 46, color: '#ffcf7a', glow: '255,160,90' },
    clouds: 5,
    cloudColor: 'rgba(255,190,170,0.35)',
    hills: [{ y: 455, amp: 6, freq: 0.01, color: 'rgba(60,70,130,0.7)', parallax: 0.05 }],
    weather: { snow: 40 },
    water: { y: 470, amp: 50, period: 8 },
    platform: { top: '#c9c2b8', body: '#5a4e58', deep: '#2a2430' },
    fragile: { top: '#e6d4b8', body: '#8a7464', deep: '#4a3c36' },
    accent: '255,190,140',
    text: '#2a1e2a',
  },

  platforms: [
    [0, 300, 500, 300],                         // falésia
    [560, 340, 110, 18, { fragile: true }],
    [670, 380, 120, 18],
    [840, 450, 120, 20],                        // pedras da maré
    [1040, 450, 120, 20],
    [1250, 440, 120, 20],
    [1430, 340, 270, 300],                      // falésia do meio
    [1780, 300, 90, 18, { fragile: true }],
    [1940, 270, 90, 18, { fragile: true }],
    [2100, 300, 100, 18],                       // pedra firme: espere a maré aqui
    [2280, 450, 120, 20],
    [2460, 440, 120, 20],
    [2640, 450, 120, 20],
    [2820, 380, 280, 300],                      // última falésia
    [3200, 400, 150, 18],                       // píer
  ],

  cracked: [[1600, 180, 40, 160, 3], [2980, 238, 50, 142, 4]],
  amulets: [[300, 270, 'vidro'], [1500, 310, 'cebola'], [2880, 350, 'passaro']],

  npcs: [
    { kind: 'vovo', x: 1490, y: 320, facing: 1 },
    { kind: 'vovo', x: 3150, y: 380, facing: 1 },
  ],

  checkpoints: [[60, 300], [1460, 340], [2840, 380]],

  collectibles: [
    [620, 290, 'Água salgada cura qualquer coisa: suor, lágrima ou mar.'],
    [1100, 400, 'Quem nada contra a maré precisa de alguém na areia.'],
    [1680, 300, 'Nunca dê as costas ao mar no inverno.'],
    [1985, 220, 'Para trazer alguém de volta, chame o nome dele três vezes.'],
    [2520, 390, 'O amor de irmão é a única corda que não arrebenta.'],
  ],

  triggers: [
    { x: 80, lines: [['jude', 'A Queda do Diabo. Todo mundo pula daqui no verão. O Noah nunca pulou.'], ['jude', 'Até hoje. Ele pulou no inverno, e o mar não está devolvendo.']] },
    { x: 520, hint: 'Pedras soltas desmoronam pouco depois de pisadas.' },
    { x: 760, hint: 'A maré sobe e desce. As pedras baixas somem na maré alta: espere a sua hora.' },
    { x: 1460, lines: [['vovo', 'O mar devolve o que a gente tem coragem de buscar.']] },
    { x: 2200, lines: [['jude', 'Noah! Eu estou indo!']] },
    { x: 2840, lines: [['jude', 'Ele não está voltando. Noah! NOAH!']] },
    { x: 3200, lines: [['vovo', 'Agora, querida. Ele precisa da sua mão.']] },
  ],

  goal: { x: 3330, y: 400, style: 'noahSea' },

  interlude: {
    retrato: '(Da bíblia da vovó: "Para evitar uma doença séria, tenha sempre uma cebola no seu bolso.")',
    poem: [
      'Eu entrei na água sem pensar',
      'e o frio me arrancou o nome.',
      'Mas a sua mão ainda era a sua mão,',
      'e eu puxei, e puxei,',
      'até o oceano desistir de você.',
    ],
  },
});
