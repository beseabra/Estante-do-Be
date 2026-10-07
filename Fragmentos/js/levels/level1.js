// ============================================================
//  FRAGMENTO I — O PRIMEIRO OLHAR
//  Fim de tarde rosado, pétalas no ar. Fase de aprender a andar.
//
//  COMO UMA FASE FUNCIONA (vale para todas):
//    platforms: [x, y, largura, altura, opções?]   (y = topo)
//    fragments: [x, y, 'memória']                  (os pedaços dela)
//    amada:     onde ela espera e em que pose
//    poem:      o poema que aparece depois da fase
//    O chão da tela fica em y = 460. O pulo alcança ~100px de altura.
// ============================================================
F.Levels.push({
  id: 1,
  numeral: 'I',
  title: 'O Primeiro Olhar',
  subtitle: 'a versão que eu vi primeiro',
  width: 2600,
  height: 540,
  spawn: { x: 80, y: 460 },

  music: { dur: 4, chords: [[48, 55, 64, 71], [45, 52, 60, 67], [41, 53, 57, 64], [43, 55, 59, 64]] },

  theme: {
    sky: [[0, '#2a1340'], [0.45, '#8a3a6e'], [0.75, '#e0708a'], [1, '#ffc29a']],
    stars: 30,
    celestial: { type: 'sun', x: 720, y: 390, r: 46, color: '#ffe3b8', glow: '255,170,140' },
    clouds: 5, cloudColor: 'rgba(255,200,215,0.28)',
    hills: [
      { y: 395, amp: 35, freq: 0.0035, color: '#a24a73', parallax: 0.12 },
      { y: 440, amp: 28, freq: 0.006, color: '#6e2b5c', parallax: 0.3 },
      { y: 490, amp: 18, freq: 0.011, color: '#43173f', parallax: 0.55 },
    ],
    weather: { petals: 45 },
    platform: { top: '#ffd0dc', body: '#5a2350', deep: '#2c0f2b' },
    flowers: ['#ffe0ea', '#ffffff', '#ff9fb8'],
    shard: { light: '#ffffff', mid: '#ffc7d6', dark: '#e0507a', glow: '255,170,200' },
    accent: '255,190,210',
    text: '#fff1f5',
  },

  platforms: [
    [0, 460, 700, 80],
    [400, 370, 140, 18],
    [600, 300, 120, 18],
    [780, 460, 500, 80],
    [1360, 420, 300, 120],
    [1740, 460, 860, 80],
    [1900, 360, 140, 18],
    [2100, 280, 140, 18],
  ],

  fragments: [
    [470, 330, 'o jeito que você ajeita os óculos'],
    [660, 250, 'seu cabelo preto contra o fim de tarde'],
    [1030, 410, 'aquela risada que você tenta esconder'],
    [1510, 370, 'você é mais alta, e eu adoro olhar pra cima'],
    [2170, 230, 'o primeiro "oi", que eu ensaiei mil vezes'],
  ],

  amada: { x: 2450, y: 460, pose: 'stand' },

  poem: [
    'Foi num instante sem importância',
    'que o mundo resolveu mudar de cor.',
    'Você ajeitou os óculos',
    'e eu esqueci como se respira.',
    'Esse foi o primeiro pedaço seu',
    'que eu guardei comigo.',
  ],
});
