// ============================================================
//  EFEITOS E ANIMAÇÕES
//    aviso()        mensagenzinha que sobe no canto da tela
//    inclinar()     cartões que inclinam em 3D com um reflexo de luz
//    revelar()      coisas que aparecem suavemente ao rolar a página
//    abrirJogo()    a transição até a página do jogo
//    confete()      chuva de confete (usada no segredo)
// ============================================================
window.E = {};

// ---------- aviso ----------
E.aviso = function (texto) {
  const el = document.createElement('div');
  el.className = 'aviso';
  el.textContent = texto;
  document.getElementById('avisos').appendChild(el);
  requestAnimationFrame(() => el.classList.add('entra'));
  setTimeout(() => { el.classList.remove('entra'); setTimeout(() => el.remove(), 400); }, 2600);
};

// ---------- inclinar ----------
// Qualquer elemento com [data-inclinar] inclina seguindo o mouse.
// As variáveis --rx, --ry, --mx, --my são usadas no CSS.
E.inclinar = function () {
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('[data-inclinar]');
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const forca = parseFloat(el.dataset.inclinar) || 8;
    el.style.setProperty('--ry', ((px - 0.5) * forca).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((0.5 - py) * forca).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest && e.target.closest('[data-inclinar]');
    if (el && !el.contains(e.relatedTarget)) {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
  });
};

// ---------- luz que segue o mouse (no fundo da página) ----------
E.luz = function () {
  let px = 0, py = 0, pedido = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX; py = e.clientY;
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--px', px + 'px');
      document.documentElement.style.setProperty('--py', py + 'px');
      pedido = false;
    });
  });
};

// ---------- revelar ao rolar ----------
E.observador = 'IntersectionObserver' in window
  ? new IntersectionObserver((itens) => {
    itens.forEach((it) => {
      if (it.isIntersecting) {
        it.target.classList.add('visivel');
        E.observador.unobserve(it.target);
      }
    });
  }, { threshold: 0.12 })
  : null;
E.revelar = function (raiz = document) {
  raiz.querySelectorAll('.revelar:not(.visivel)').forEach((el, i) => {
    el.style.setProperty('--atraso', Math.min(i, 8) * 60 + 'ms');
    if (E.observador) E.observador.observe(el);
    else el.classList.add('visivel');
  });
};

// ---------- abrir o jogo ----------
E.abrirJogo = function (jogo) {
  const c = document.getElementById('cortina');
  if (c.classList.contains('ativa')) return;
  c.style.setProperty('--cor', jogo.cor);
  c.querySelector('.cortina-titulo').textContent = jogo.titulo;
  const dicas = ['carregando…', 'aquecendo os pixels…', 'apertando start…', 'tirando a poeira do cartucho…'];
  c.querySelector('.cortina-dica').textContent = dicas[(Math.random() * dicas.length) | 0];
  c.classList.add('ativa');
  try { localStorage.setItem('bê:jogou:' + jogo.id, '1'); } catch (e) { /* tudo bem */ }
  setTimeout(() => { window.location.href = jogo.pasta + 'index.html'; }, 950);
};
// voltando pelo botão do navegador, a cortina some
window.addEventListener('pageshow', () => document.getElementById('cortina').classList.remove('ativa'));

// ---------- confete ----------
E.confete = function () {
  const cv = document.createElement('canvas');
  cv.className = 'confete';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const cores = ['#d4ff3f', '#ff6b4a', '#8b7bff', '#ffb020', '#ff5c8a', '#ffffff'];
  const ps = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.6,
    vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 18 - 6,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, c: cores[(Math.random() * cores.length) | 0],
  }));
  let t = 0;
  (function quadro() {
    t++;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach((p) => {
      p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t < 200) requestAnimationFrame(quadro); else cv.remove();
  })();
};

// ---------- segredo: ↑ ↑ ↓ ↓ ← → ← → B A ----------
(function () {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    i = e.code === seq[i] ? i + 1 : (e.code === seq[0] ? 1 : 0);
    if (i === seq.length) {
      i = 0;
      E.confete();
      E.aviso('Código secreto ativado. Nada mudou, mas foi bonito.');
    }
  });
})();
