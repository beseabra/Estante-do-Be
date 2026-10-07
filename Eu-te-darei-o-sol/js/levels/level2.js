// ============================================================
//  CAPÍTULO II — A HISTÓRIA DA SORTE
//  Jude, 16 anos. A neblina, a vovó fantasma e a bíblia de
//  superstições que ela deixou.
//  Aprende: ESCULPIR (X) pedras rachadas, pisar nos degraus da vovó
//  (só a Jude os vê) e usar AMULETOS como escudo.
//  Pedaço do mundo recuperado: AS FLORES.
// ============================================================
F.Levels.push({
  id: 2,
  numeral: 'II',
  title: 'A História da Sorte',
  subtitle: 'Jude, 16 anos',
  quote: { lines: ['"Uma pessoa detentora de um trevo-de-quatro-folhas', 'é capaz de repelir quaisquer influências sinistras."'], who: 'DA BÍBLIA DA VOVÓ' },
  who: 'jude',
  piece: 'flores',
  pieceName: 'AS FLORES',
  collectibleArt: 'pagina',
  collectibleName: 'páginas',
  width: 3600,
  height: 540,
  spawn: { x: 60, y: 460 },

  music: { dur: 4.5, arp: 'bell', chords: [[45, 52, 57, 64], [41, 53, 57, 60], [43, 50, 55, 62], [40, 52, 55, 59]] },

  theme: {
    sky: [[0, '#b8bfcc'], [0.6, '#d8dbe2'], [1, '#eceae4']],
    celestial: { type: 'sun', x: 600, y: 120, r: 28, color: 'rgba(255,250,235,0.8)', glow: '255,255,240' },
    clouds: 8,
    cloudColor: 'rgba(255,255,255,0.4)',
    hills: [
      { y: 390, amp: 34, freq: 0.004, color: '#a7adb8', parallax: 0.08 },
      { y: 440, amp: 22, freq: 0.008, color: '#8c93a0', parallax: 0.2 },
    ],
    weather: { petals: 10 },
    petalColor: '255,220,120',
    fog: { color: '228,230,236', radius: 175 },
    platform: { top: '#9aa894', body: '#5a5e66', deep: '#34373e' },
    flowers: ['#ffd84a', '#ffb347'],
    thorns: '#3a3540',
    accent: '255,210,120',
    text: '#2c2a33',
  },

  platforms: [
    [0, 460, 1100, 80],
    // degraus da vovó (só a Jude enxerga)
    [1180, 400, 100, 14, { ghost: true }],
    [1360, 340, 100, 14, { ghost: true }],
    [1540, 280, 100, 14, { ghost: true }],
    [1720, 300, 220, 18],
    [2020, 460, 880, 80],
    [2980, 380, 90, 14, { ghost: true }],
    [3140, 320, 100, 14, { ghost: true }],
    [3300, 460, 300, 80],
  ],

  cracked: [[600, 280, 40, 180, 3], [2580, 280, 44, 180, 4]],
  thorns: [[760, 460, 100]],
  clouds: [{ x: 2100, y: 432, dx: 400, period: 6 }],
  amulets: [[350, 430, 'trevo'], [2060, 430, 'vidro']],

  npcs: [
    { kind: 'vovo', x: 250, y: 440, facing: -1 },
    { kind: 'vovo', x: 1060, y: 440, facing: 1 },
    { kind: 'vovo', x: 3420, y: 440, facing: -1 },
  ],

  checkpoints: [[80, 460], [1760, 300], [2060, 460], [3320, 460]],

  collectibles: [
    [700, 410, 'Para evitar uma doença séria, tenha sempre uma cebola no seu bolso.'],
    [1410, 290, 'Quem sonha com peixe vai ganhar uma notícia.'],
    [2300, 340, 'Nunca entregue uma faca na mão de quem você ama.'],
    [2680, 410, 'Um pássaro dentro de casa traz recado dos mortos.'],
    [3190, 270, 'Plante girassóis onde alguém foi feliz.'],
  ],

  triggers: [
    { x: 160, lines: [['vovo', 'Querida, a neblina não é inimiga. Ela só esconde o que você ainda não está pronta para ver.'], ['jude', 'Vovó... você de novo. Eu sei que você morreu, tá? Eu sei.']] },
    { x: 330, lines: [['vovo', 'Um trevo no bolso. Pegue, você vai precisar.']], hint: 'Amuletos protegem a Jude de um golpe cada.' },
    { x: 520, hint: 'Pedra rachada: chegue perto e aperte X para esculpir.' },
    { x: 1020, lines: [['vovo', 'Pise onde eu piso. Os mortos também deixam degraus.']], hint: 'Só a Jude enxerga os degraus da vovó.' },
    { x: 2040, lines: [['jude', 'Eu fazia mulheres de areia que o mar levava. Agora eu quero uma que fique.']] },
    { x: 2900, lines: [['vovo', 'Mais dois degraus. Depois, as flores.']] },
    { x: 3340, lines: [['jude', 'Girassóis. Ela plantava girassóis por toda a casa.']] },
  ],

  goal: { x: 3500, y: 460, style: 'piece' },

  interlude: {
    retrato: '(Da bíblia da vovó: "Os pés dos espíritos nunca tocam o chão.")',
    poem: [
      'Eu coleciono superstições',
      'como quem junta pedrinhas no bolso:',
      'nenhuma pesa muito,',
      'mas todas juntas',
      'me impedem de sair voando.',
    ],
  },
});
