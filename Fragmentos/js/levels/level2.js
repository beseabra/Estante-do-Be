// ============================================================
//  FRAGMENTO II — O SILÊNCIO
//  Noite escura, só vaga-lumes. "dark: true" faz a tela ficar
//  no breu, e só a luz em volta dele (e dos pedaços) ilumina.
// ============================================================
F.Levels.push({
  id: 2,
  numeral: 'II',
  title: 'O Silêncio',
  subtitle: 'a versão que lê em silêncio',
  width: 3000,
  height: 540,
  spawn: { x: 80, y: 460 },

  music: { dur: 5, chords: [[45, 52, 60, 67], [41, 53, 57, 64], [48, 55, 64, 71], [40, 55, 59, 62]] },

  theme: {
    sky: [[0, '#05040f'], [0.6, '#141236'], [1, '#2a1f4f']],
    stars: 140,
    celestial: { type: 'moon', x: 780, y: 110, r: 30, color: '#f4f0ff', glow: '190,190,255' },
    hills: [
      { y: 400, amp: 40, freq: 0.004, color: '#1b1840', parallax: 0.12 },
      { y: 450, amp: 25, freq: 0.008, color: '#120f2c', parallax: 0.3 },
    ],
    weather: { fireflies: 26 },
    dark: true,
    platform: { top: '#b9b3ff', body: '#272255', deep: '#110e2a' },
    flowers: ['#cfc8ff', '#ffffff'],
    shard: { light: '#ffffff', mid: '#d8d0ff', dark: '#7a62ff', glow: '200,180,255' },
    accent: '210,200,255',
    text: '#f1efff',
  },

  platforms: [
    [0, 460, 500, 80],
    [560, 400, 120, 18],
    [740, 340, 120, 18],
    [920, 280, 120, 18],
    [1120, 330, 160, 18],
    [1340, 460, 400, 80],
    [1400, 360, 100, 18],
    [1820, 420, 100, 18],
    [1990, 360, 100, 18],
    [2160, 300, 100, 18],
    [2340, 460, 660, 80],
    [2500, 370, 120, 18],
  ],

  fragments: [
    [980, 230, 'o barulho de página virando'],
    [1200, 280, 'seus olhos correndo pelas linhas'],
    [1450, 310, 'o livro que você me emprestou'],
    [2210, 250, 'a luz da tela no seu rosto, de madrugada'],
    [2560, 320, 'o silêncio bom do seu lado'],
  ],

  amada: { x: 2850, y: 460, pose: 'read' },

  poem: [
    'Você lê como quem atravessa um rio:',
    'devagar, inteira, sem pressa.',
    'Eu fico do lado de cá da página',
    'aprendendo o seu silêncio',
    'como quem aprende uma língua nova',
    'só pra poder te dizer: fica.',
  ],
});
