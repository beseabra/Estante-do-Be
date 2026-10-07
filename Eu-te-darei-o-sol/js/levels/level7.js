// ============================================================
//  CAPÍTULO VII — A MÃE
//  Noah, 14 anos. Depois do acidente, o mundo ficou sem cor.
//  Fase VERTICAL e ESCURA: só o Noah, a tinta dele, as nuvens
//  coloridas e os girassóis iluminam. Sobe-se de baixo para cima.
//  fallLimit: uma queda maior que isso volta ao girassol.
//  Pedaço do mundo recuperado: OS PÁSSAROS.
// ============================================================
F.Levels.push({
  id: 7,
  numeral: 'VII',
  title: 'A Mãe',
  subtitle: 'Noah, 14 anos',
  quote: { lines: ['"A mamãe tem uma enorme alma de girassol,', 'tão grande que mal sobra lugar para os órgãos."'], who: 'NOAH' },
  who: 'noah',
  piece: 'passaros',
  pieceName: 'OS PÁSSAROS',
  collectibleArt: 'retrato',
  collectibleName: 'retratos',
  width: 1400,
  height: 1800,
  fallLimit: 330,
  spawn: { x: 100, y: 1760 },

  music: { dur: 5, arp: 'bell', chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 55]] },

  theme: {
    sky: [[0, '#1a1a22'], [0.6, '#2a2a34'], [1, '#3a3a44']],
    stars: 40,
    celestial: { type: 'moon', x: 760, y: 200, r: 22, color: '#d8d8e0', glow: '200,200,220', rise: 120 },
    hills: [{ y: 520, amp: 20, freq: 0.006, color: '#22222a', parallax: 0.1 }],
    weather: { fireflies: 12, rain: 60 },
    dark: true,
    platform: { top: '#9a9aa4', body: '#4a4a54', deep: '#24242c' },
    fragile: { top: '#c8c8d0', body: '#6a6a74', deep: '#3a3a44' },
    accent: '255,210,120',
    text: '#eeeef4',
  },

  platforms: [
    [0, 1760, 1400, 80],
    [300, 1680, 140, 18],
    [520, 1600, 140, 18],
    [740, 1520, 140, 18],
    [960, 1440, 140, 18],
    [1180, 1360, 200, 18],
    [880, 1120, 160, 18],
    [640, 1040, 140, 18],
    [400, 960, 140, 18],
    [840, 900, 160, 18],          // depois do vão das pontes
    [1100, 820, 140, 18],
    [1250, 740, 140, 18],
    [560, 640, 160, 18],          // depois da nuvem-barco
    [300, 560, 160, 18],
    [520, 480, 140, 18, { fragile: true }],
    [760, 400, 140, 18],
    [1000, 320, 140, 18, { fragile: true }],
    [1180, 240, 220, 18],         // o topo: o quadro da mamãe
  ],

  clouds: [
    { x: 1100, y: 1340, dy: -200, period: 6 },     // elevador
    { x: 1170, y: 720, dx: -420, period: 7 },       // barco para a esquerda
  ],

  pots: [[1300, 1360], [450, 960], [1300, 740]],

  checkpoints: [[100, 1760], [1240, 1360], [940, 1120], [900, 900], [1300, 740], [620, 640], [1220, 240]],

  collectibles: [
    [810, 1460, 'o cheiro de tinta no cabelo dela'],
    [470, 900, 'a voz rouca dela, como uma caverna falando com a gente'],
    [1170, 760, 'ela nos levando ao museu num sábado qualquer'],
    [380, 500, 'a última vez que ela olhou um desenho meu'],
    [1070, 270, 'o que eu nunca cheguei a dizer'],
  ],

  triggers: [
    { x: 0, w: 1400, lines: [['noah', 'Desde que a mamãe morreu, o mundo perdeu a cor. Eu parei de pintar.'], ['noah', 'Mas lá em cima tem uma tela em branco. Eu sei que tem.']] },
    { x: 200, w: 1200, hint: 'Está escuro. A tinta ilumina: as pontes, as nuvens pintadas, os girassóis.' },
  ],

  goal: { x: 1300, y: 240, style: 'mae' },

  interlude: {
    retrato: '(Retrato: Mamãe numa Cor Cega.)',
    poem: [
      'Eu subi a noite inteira',
      'carregando um pincel e uma saudade.',
      'Lá em cima, pintei você de girassol',
      'e os pássaros voltaram',
      'como quem volta para casa.',
    ],
  },
});
