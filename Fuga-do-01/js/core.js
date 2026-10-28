// ============================================================
//  NÚCLEO: utilidades, controles, texto e o laço do jogo
//
//  Uma "cena" é qualquer objeto com:
//    enter()      -> quando a cena começa (opcional)
//    update(dt)   -> lógica; dt = segundos desde o último quadro
//    draw(ctx)    -> desenho
// ============================================================
G.W = 960;
G.H = 540;
G.SCALE = 2;
G.CHAO = 452; // altura do chão nas corridas

// ---------- utilidades ----------
G.U = {
  rand: (a, b) => a + Math.random() * (b - a),
  randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  // retângulos {x, y, w, h} se encostando?
  bate: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  // sorteia uma chave de {a: 3, b: 1} respeitando os pesos
  peso(obj) {
    const lista = Object.entries(obj);
    let total = 0;
    for (const [, p] of lista) total += p;
    let r = Math.random() * total;
    for (const [k, p] of lista) { r -= p; if (r <= 0) return k; }
    return lista[0][0];
  },
  ease: (t) => 1 - Math.pow(1 - G.U.clamp(t, 0, 1), 3),
};

// ---------- guardar progresso (pode falhar em aba anônima) ----------
G.Save = {
  ler(k, padrao) {
    try { const v = localStorage.getItem('fuga01-' + k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
  },
  gravar(k, v) {
    try { localStorage.setItem('fuga01-' + k, JSON.stringify(v)); } catch (e) { /* tudo bem */ }
  },
};

// ---------- texto ----------
G.FONTE_TITULO = "'Bangers', Impact, 'Arial Black', sans-serif";
G.FONTE = "'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif";

// Escreve um texto. o: { size, color, align, base, font, weight, stroke, lw, shadow }
G.texto = function (ctx, str, x, y, o = {}) {
  ctx.save();
  const font = o.font || G.FONTE;
  ctx.font = `${o.weight || (font === G.FONTE ? 800 : 400)} ${o.size || 18}px ${font}`;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  // desenho espelhado (personagem virado para a esquerda): o texto continua legível
  if (ctx.getTransform().a < 0) { ctx.translate(x, y); ctx.scale(-1, 1); x = 0; y = 0; }
  if (o.shadow) {
    ctx.fillStyle = o.shadow;
    ctx.fillText(str, x + 3, y + 4);
  }
  if (o.stroke) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = o.lw || 6;
    ctx.strokeStyle = o.stroke;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(str, x, y);
  ctx.restore();
};

// Quebra um texto em linhas que cabem em "largura"
G.quebra = function (ctx, str, largura, size, font) {
  ctx.save();
  ctx.font = `800 ${size}px ${font || G.FONTE}`;
  const palavras = str.split(' ');
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? atual + ' ' + p : p;
    if (ctx.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; } else atual = teste;
  }
  if (atual) linhas.push(atual);
  ctx.restore();
  return linhas;
};

G.retRedondo = function (ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ---------- controles ----------
//  Ações: jump, slide, shoot, special, ok, back, pause, mute, voice, left, right
G.Input = {
  down: {},
  pressed: {},
  digitos: [],        // números digitados (para a urna)
  toque: null,        // último toque/clique na tela, em coordenadas do jogo
  MAPA: {
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump',
    ArrowDown: 'slide', KeyS: 'slide',
    KeyX: 'shoot', KeyJ: 'shoot', KeyF: 'shoot',
    KeyC: 'special', KeyK: 'special', KeyE: 'special',
    Enter: 'ok', NumpadEnter: 'ok',
    Escape: 'back', Backspace: 'corrige',
    KeyP: 'pause', KeyM: 'mute', KeyV: 'voice',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  },

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      G.Audio.init();
      const m = e.code.match(/^(Digit|Numpad)(\d)$/);
      if (m && !e.repeat) this.digitos.push(m[2]);
      const a = this.MAPA[e.code];
      if (!a) return;
      e.preventDefault();
      if (!this.down[a]) this.pressed[a] = true;
      this.down[a] = true;
    });
    window.addEventListener('keyup', (e) => {
      const a = this.MAPA[e.code];
      if (a) this.down[a] = false;
    });
    window.addEventListener('blur', () => { this.down = {}; });

    // clique/toque na tela: guarda a posição em coordenadas do jogo
    canvas.addEventListener('pointerdown', (e) => {
      G.Audio.init();
      const r = canvas.getBoundingClientRect();
      this.toque = { x: (e.clientX - r.left) / r.width * G.W, y: (e.clientY - r.top) / r.height * G.H };
      this.pressed.tap = true;
    });
  },

  // apertou agora? (só vale uma vez por aperto)
  hit(a) { if (this.pressed[a]) { this.pressed[a] = false; return true; } return false; },
  is(a) { return !!this.down[a]; },
  // "continuar": Enter, Espaço ou toque
  avancar() { return this.hit('ok') || this.hit('jump') || this.hit('tap'); },

  fimDoQuadro() { this.pressed = {}; this.digitos = []; this.toque = null; },
};

// ---------- celular: botões na tela ----------
G.Mobile = {
  on: false,
  device() {
    const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
    return mq('(pointer: coarse)') || (('ontouchstart' in window) && !mq('(pointer: fine)'));
  },
  init() {
    if (!this.device()) return;
    this.on = true;
    document.documentElement.classList.add('toque');
    const zona = document.getElementById('touch');
    zona.classList.add('visible');
    const inp = G.Input;
    for (const b of zona.querySelectorAll('[data-act]')) {
      const a = b.dataset.act;
      const liga = (e) => {
        e.preventDefault();
        G.Audio.init();
        if (!inp.down[a]) inp.pressed[a] = true;
        inp.down[a] = true;
        b.classList.add('on');
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) { /* ok */ }
      };
      const desliga = (e) => { e.preventDefault(); inp.down[a] = false; b.classList.remove('on'); };
      b.addEventListener('touchstart', liga, { passive: false });
      b.addEventListener('touchend', desliga, { passive: false });
      b.addEventListener('touchcancel', desliga, { passive: false });
    }
    document.getElementById('m-pausa').addEventListener('click', () => { inp.pressed.pause = true; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.Game.pausar(true); });
  },
  // o botão do especial mostra a letra certa (L do Lula, ★ do Janones)
  rotuloEspecial(txt) {
    const b = document.querySelector('#touch .esp');
    if (b) b.textContent = txt;
  },
};

// ---------- o laço ----------
G.Game = {
  scene: null,
  paused: false,
  fade: { a: 1, dir: -1, next: null, color: '#000', speed: 2 },
  tremor: 0,

  start() {
    this.canvas = document.getElementById('game');
    G.Mobile.init();
    if (G.Mobile.on) G.SCALE = 1.5;
    this.canvas.width = G.W * G.SCALE;
    this.canvas.height = G.H * G.SCALE;
    this.ctx = this.canvas.getContext('2d');
    G.Input.init(this.canvas);
    G.Audio.carregarArquivos();

    this.setScene(new G.CenaTitulo());
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  },

  setScene(scene) {
    this.scene = scene;
    if (scene.enter) scene.enter();
  },

  // troca de cena com esmaecer. "factory" cria a próxima cena com a tela já coberta.
  trocar(factory, color = '#000', speed = 2.4) {
    if (this.fade.next) return;
    Object.assign(this.fade, { next: factory, dir: 1, color, speed });
  },

  pausar(sim) {
    if (!this.scene || !this.scene.pausavel) return;
    this.paused = sim === undefined ? !this.paused : sim;
    G.Audio.pausarMusica(this.paused);
  },

  sacudir(forca) { this.tremor = Math.max(this.tremor, forca); },

  loop(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    const inp = G.Input;

    if (inp.hit('mute')) G.Audio.alternar();
    if (inp.hit('voice')) G.Voz.alternar();
    if (inp.hit('pause') || (this.scene.pausavel && !this.paused && inp.hit('back'))) this.pausar();
    else if (this.paused && (inp.hit('back') || inp.hit('ok') || inp.hit('tap'))) this.pausar(false);

    if (!this.paused) {
      this.scene.update(dt);
      this.atualizaFade(dt);
      this.tremor = Math.max(0, this.tremor - dt * 30);
    }
    G.Audio.update();

    const ctx = this.ctx;
    ctx.setTransform(G.SCALE, 0, 0, G.SCALE, 0, 0);
    if (this.tremor > 0) ctx.translate(G.U.rand(-1, 1) * this.tremor, G.U.rand(-1, 1) * this.tremor);
    this.scene.draw(ctx);
    ctx.setTransform(G.SCALE, 0, 0, G.SCALE, 0, 0);

    if (this.paused) this.desenhaPausa(ctx);
    if (this.fade.a > 0) {
      ctx.globalAlpha = this.fade.a;
      ctx.fillStyle = this.fade.color;
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.globalAlpha = 1;
    }

    inp.fimDoQuadro();
    requestAnimationFrame(this.loop);
  },

  atualizaFade(dt) {
    const f = this.fade;
    if (f.dir === 0) return;
    f.a += f.dir * dt * f.speed;
    if (f.dir > 0 && f.a >= 1) {
      f.a = 1;
      const nova = f.next();
      f.next = null;
      this.setScene(nova);
      f.dir = -1;
    } else if (f.dir < 0 && f.a <= 0) {
      f.a = 0;
      f.dir = 0;
    }
  },

  desenhaPausa(ctx) {
    ctx.fillStyle = 'rgba(0, 20, 8, 0.75)';
    ctx.fillRect(0, 0, G.W, G.H);
    G.texto(ctx, 'PAUSA', G.W / 2, 220, { size: 90, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#000', lw: 10 });
    G.texto(ctx, 'O 01 também parou pra tomar um ar. Ele tá suando.', G.W / 2, 270, { size: 20, align: 'center' });
    const linhas = [
      'Enter / P: continuar',
      `M: música e sons (${G.Audio.ligado ? 'ligados' : 'desligados'})`,
      `V: vozes do navegador (${G.Voz.ligada ? 'ligadas' : 'desligadas'})`,
    ];
    linhas.forEach((l, i) => G.texto(ctx, l, G.W / 2, 330 + i * 30, { size: 18, align: 'center', color: '#bdf5c8' }));
  },
};
