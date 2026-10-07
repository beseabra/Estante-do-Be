// ============================================================
//  CAPÍTULO IV — MULHERES DE AREIA
//  Jude, 16 anos. A praia no fim da tarde.
//  Novidade: montes de areia. A Jude esculpe (X) uma mulher de
//  areia e sobe pelos braços dela. Mas a maré sobe e desce:
//  na maré alta a areia baixa alaga e o mar leva as esculturas.
//  Pedaço do mundo recuperado: AS CONCHAS.
//
//  mounds: [x, y, altura]   montes de areia esculpíveis
// ============================================================
F.Levels.push({
  id: 4,
  numeral: 'IV',
  title: 'Mulheres de Areia',
  subtitle: 'Jude, 16 anos',
  quote: { lines: ['"— Não suporto o oceano as destruindo.', '— Mas essa é a melhor parte."'], who: 'NOAH E JUDE' },
  who: 'jude',
  piece: 'conchas',
  pieceName: 'AS CONCHAS',
  collectibleArt: 'pagina',
  collectibleName: 'páginas',
  width: 3600,
  height: 540,
  spawn: { x: 60, y: 400 },

  music: { dur: 4.2, arp: 'bell', chords: [[45, 52, 57, 64], [43, 50, 55, 62], [41, 48, 57, 60], [43, 50, 55, 59]] },

  theme: {
    sky: [[0, '#7a8ac8'], [0.5, '#f0b0a0'], [1, '#ffe0b0']],
    celestial: { type: 'sun', x: 760, y: 300, r: 40, color: '#ffe3a0', glow: '255,190,120' },
    clouds: 6,
    cloudColor: 'rgba(255,230,220,0.45)',
    hills: [{ y: 452, amp: 4, freq: 0.01, color: 'rgba(90,120,180,0.6)', parallax: 0.05 }],
    weather: { sparkles: 14 },
    water: { y: 480, amp: 45, period: 10 },
    platform: { top: '#f4dcae', body: '#d9b07a', deep: '#a8804e' },
    thorns: '#6a4a3a',
    accent: '255,200,150',
    text: '#3a2a20',
  },

  platforms: [
    [0, 400, 420, 140],          // duna A (segura)
    [420, 460, 450, 80],         // areia baixa: alaga na maré alta
    [870, 290, 210, 250],        // rochedo 1
    [1080, 460, 540, 80],
    [1620, 300, 240, 240],       // rochedo 2
    [1860, 460, 700, 80],
    [2500, 270, 200, 18],        // saliência alta
    [2760, 300, 260, 240],       // rochedo 3
    [3020, 460, 280, 80],
    [3300, 380, 300, 160],       // duna final
  ],

  mounds: [[790, 460, 80], [1540, 460, 80], [2440, 460, 80]],
  thorns: [[1200, 460, 80]],
  cracked: [[2100, 300, 50, 160, 3]],
  amulets: [[300, 370, 'trevo'], [1960, 430, 'cebola']],

  npcs: [{ kind: 'vovo', x: 1000, y: 270, facing: -1 }, { kind: 'vovo', x: 3420, y: 360, facing: -1 }],

  checkpoints: [[60, 400], [960, 290], [1700, 300], [2840, 300], [3340, 380]],

  collectibles: [
    [600, 410, 'Quem esculpe na areia aprende a dizer adeus antes de terminar.'],
    [980, 240, 'As ondas não destroem: elas só levam a obra para outro lugar.'],
    [1760, 250, 'Concha no bolso: o mar sempre vai saber o caminho de casa.'],
    [2600, 220, 'Nunca assine uma obra que o mar ainda não viu.'],
    [3150, 410, 'Toda mulher de areia guarda um segredo que só o mar escuta.'],
  ],

  triggers: [
    { x: 80, lines: [['jude', 'Eu esculpo mulheres de areia aqui, três prainhas depois da nossa casa.'], ['jude', 'Ninguém vê. O mar leva todas antes.']] },
    { x: 440, hint: 'Monte de areia: chegue perto e aperte X para esculpir. Suba pelos braços dela.' },
    { x: 640, hint: 'Na maré alta a areia baixa alaga e o mar desfaz as esculturas. Esculpa na maré baixa.' },
    { x: 1000, lines: [['vovo', 'Elas são lindas, querida. Mais lindas porque não duram.']] },
    { x: 2040, hint: 'Pedra no caminho: cinzel (X).' },
    { x: 2300, lines: [['jude', 'Uma mais alta. Essa precisa me levar até a saliência.']] },
    { x: 3320, lines: [['jude', 'Conchas. Eu usava conchas como olhos para todas elas.']] },
  ],

  goal: { x: 3500, y: 380, style: 'piece' },

  interlude: {
    retrato: '(Da bíblia da vovó: "Se um menino dá uma laranja para uma menina, o amor dela por ele se multiplicará.")',
    poem: [
      'Eu faço mulheres que o mar desmancha',
      'e volto no dia seguinte',
      'para fazer outras.',
      'Talvez seja isso a coragem:',
      'construir sabendo da maré.',
    ],
  },
});
