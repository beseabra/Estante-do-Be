// ============================================================
//  UTILIDADES
//  Pequenas funções matemáticas usadas no jogo inteiro.
// ============================================================
window.F = window.F || {};

// Resolução "lógica" do jogo. Tudo é desenhado como se a tela
// tivesse 960x540; o canvas real tem o dobro (SCALE) para ficar nítido.
F.W = 960;
F.H = 540;
F.SCALE = 2;

// Fonte usada em todos os textos.
F.FONT = "'Cormorant Garamond', Georgia, serif";
// Fonte manuscrita (como a letra da capa do livro).
F.HAND = "'Caveat', 'Segoe Print', cursive";

// Progresso do jogo: quais pedaços do mundo já foram recuperados.
F.Progress = { pieces: [] };

// Lista de fases — cada arquivo em js/levels/ adiciona uma aqui.
F.Levels = [];

F.utils = {
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  lerp(a, b, t) { return a + (b - a) * t; },
  rand(a, b) { return a + Math.random() * (b - a); },
  dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); },

  // Move "v" na direção de "target" no máximo "step" por vez.
  approach(v, target, step) {
    return v < target ? Math.min(v + step, target) : Math.max(v - step, target);
  },

  easeOut(t) { return 1 - Math.pow(1 - t, 3); },
  easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },

  // Gerador de números "aleatórios" que sempre repete a mesma sequência
  // para a mesma semente. Assim estrelas e colinas não mudam a cada partida.
  seeded(seed) {
    let s = Math.abs(Math.floor(seed)) % 2147483647 || 1;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  },
};
