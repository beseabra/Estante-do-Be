// ============================================================
//  BASE: o espaço de nomes F e utilidades pequenas
// ============================================================
window.F = window.F || {};

F.T = 32;                 // tamanho de um "quadradinho" do mapa, em pixels
F.RITMO = 0.6;            // segundos reais para passar 1 minuto no relógio do jogo
F.DIAS_POR_MES = 10;      // um "mês corporativo" tem 10 dias úteis
F.MESES = 3;              // o jogo vai até o fim do 3º mês (dia 30)
F.SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

F.u = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  rand: (a, b) => a + Math.random() * (b - a),
  int: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  chance: (p) => Math.random() < p,
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  // 545 -> "09:05"
  hora(min) {
    const h = Math.floor(min / 60), m = Math.floor(min % 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  },
  dinheiro: (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR'),
  esc: (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
  // texto com *itálico* simples
  fmt: (s) => F.u.esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>'),
  // aleatório com semente (para coisas que não podem mudar a cada quadro)
  semente(seed) {
    let s = seed >>> 0 || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  },
  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },
};

// Um "nome do dia": Dia 3 · Quarta
F.u.nomeDia = (d) => `Dia ${d} · ${F.SEMANA[(d - 1) % 5]}`;
F.u.mesDe = (d) => Math.ceil(d / F.DIAS_POR_MES);
