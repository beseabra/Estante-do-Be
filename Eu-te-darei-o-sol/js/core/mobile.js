// ============================================================
//  CELULAR (só liga em aparelhos com tela de toque; no PC nada muda)
//    - botões de toque que seguem o dedo: dá para deslizar o polegar
//      de um botão para o outro sem levantar, e apertar dois juntos
//    - vibração curtinha a cada toque (quando o aparelho deixa)
//    - botão de pausa com: continuar, recomeçar, música, tela cheia
//    - pausa sozinho quando você sai do app
//    - aviso de "gire o celular" quando ele está em pé
// ============================================================
F.Mobile = {
  on: false,

  // Celular ou tablet: o "ponteiro" principal é o dedo. Notebooks com
  // tela de toque contam como PC (o ponteiro principal é o mouse).
  device() {
    const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
    return mq('(pointer: coarse)') || (('ontouchstart' in window) && !mq('(pointer: fine)'));
  },

  // Liga os botões de toque. "input" é o F.Input.
  initTouch(input, canvas) {
    this.on = true;
    this.input = input;
    document.documentElement.classList.add('toque');
    document.getElementById('touch').classList.add('visible');

    // tocar na tela do jogo = "clique" (avança textos, começa o jogo)
    canvas.addEventListener('touchstart', () => {
      input.pressed.Tap = true;
      input.pressed.TouchTap = true;
      F.Audio.init();
    }, { passive: true });
    // a tela cheia só pode ser pedida no fim de um toque
    document.addEventListener('touchend', () => this.firstTouch(), { passive: true });

    // cada dedo fica "preso" ao botão mais perto dele
    const zone = document.getElementById('touch');
    const btns = [...zone.querySelectorAll('[data-btn]')];
    const fingers = new Map();
    const nearest = (x, y, folga) => {
      let best = null, bestD = Infinity;
      for (const b of btns) {
        const r = b.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (d < r.width / 2 + folga && d < bestD) { best = b; bestD = d; }
      }
      return best;
    };
    const refresh = () => {
      const held = new Set(fingers.values());
      for (const b of btns) {
        const n = b.dataset.btn, isOn = held.has(n);
        if (isOn && !input.touch[n]) { input.pressed['Touch_' + n] = true; this.buzz(); }
        input.touch[n] = isOn;
        b.classList.toggle('on', isOn);
      }
    };
    const handle = (e) => {
      e.preventDefault();
      F.Audio.init();
      for (const t of e.changedTouches) {
        if (e.type === 'touchend' || e.type === 'touchcancel') { fingers.delete(t.identifier); continue; }
        // ao começar o toque, a área é um pouco maior que o botão;
        // ao arrastar, maior ainda (o polegar escorrega)
        const b = nearest(t.clientX, t.clientY, e.type === 'touchstart' ? 18 : 34);
        if (b) fingers.set(t.identifier, b.dataset.btn);
        else fingers.delete(t.identifier);
      }
      refresh();
    };
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((ev) => zone.addEventListener(ev, handle, { passive: false }));
    this.releaseAll = () => { fingers.clear(); refresh(); };

    // sem menu de "copiar/salvar imagem" ao segurar o dedo
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    this.buildUI();
  },

  buzz() {
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { /* tudo bem */ } }
  },

  // ---------- tela cheia ----------
  canFullscreen() {
    const d = document.documentElement;
    return !!(d.requestFullscreen || d.webkitRequestFullscreen);
  },
  isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  enterFullscreen() {
    const d = document.documentElement;
    const req = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!req) return;
    try {
      const p = req.call(d, { navigationUI: 'hide' });
      const lock = () => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); };
      if (p && p.then) p.then(lock, () => {}); else lock();
    } catch (e) { /* o navegador não deixou */ }
  },
  exitFullscreen() {
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) { try { const p = ex.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) { /* tudo bem */ } }
  },
  // no primeiro toque, tenta abrir em tela cheia (deitado)
  firstTouch() {
    if (this.touched) return;
    this.touched = true;
    if (this.canFullscreen() && !this.isFullscreen()) this.enterFullscreen();
  },

  // ---------- pausa e aviso de girar ----------
  buildUI() {
    const stage = document.getElementById('stage');
    const canReset = typeof this.input.resetPressed === 'function';
    stage.insertAdjacentHTML('beforeend', `
      <button id="m-pausa" aria-label="pausar"><i></i><i></i></button>
      <div id="m-menu" hidden>
        <div class="m-caixa">
          <p class="m-titulo">pausa</p>
          <button data-m="continuar" class="m-principal">continuar</button>
          ${canReset ? '<button data-m="recomecar">voltar ao último ponto</button>' : ''}
          <button data-m="musica">música: <b></b></button>
          ${this.canFullscreen() ? '<button data-m="tela">tela cheia: <b></b></button>' : ''}
          <a data-m="sair" href="../index.html">voltar para a estante</a>
        </div>
      </div>
      <div id="m-girar">
        <div class="m-celular"><i></i></div>
        <p>gire o celular</p>
        <small>o jogo fica bem melhor deitado</small>
        <button data-m="empe">jogar em pé mesmo</button>
      </div>`);

    this.menu = document.getElementById('m-menu');
    document.getElementById('m-pausa').addEventListener('click', () => this.pause());
    const stop = (e) => e.stopPropagation();
    ['touchstart', 'mousedown'].forEach((ev) => {
      document.getElementById('m-pausa').addEventListener(ev, stop, { passive: true });
      this.menu.addEventListener(ev, stop, { passive: true });
    });

    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      const m = b.dataset.m;
      if (m === 'continuar') this.resume();
      if (m === 'recomecar') { this.resume(); this.input.pressed.KeyR = true; }
      if (m === 'musica') { F.Audio.toggle(); this.syncMenu(); }
      if (m === 'tela') { if (this.isFullscreen()) this.exitFullscreen(); else this.enterFullscreen(); setTimeout(() => this.syncMenu(), 300); }
      if (m === 'empe') document.documentElement.classList.add('em-pe-ok');
    });

    // saiu do app ou bloqueou a tela? pausa.
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); });
  },

  syncMenu() {
    const mus = this.menu.querySelector('[data-m="musica"] b');
    if (mus) mus.textContent = F.Audio.enabled === false ? 'desligada' : 'ligada';
    const tela = this.menu.querySelector('[data-m="tela"] b');
    if (tela) tela.textContent = this.isFullscreen() ? 'sim' : 'não';
    const rec = this.menu.querySelector('[data-m="recomecar"]');
    if (rec) rec.hidden = !(F.PlayScene && F.Game.scene instanceof F.PlayScene);
  },

  pause() {
    if (!this.on || F.Game.paused) return;
    F.Game.paused = true;
    if (this.releaseAll) this.releaseAll();
    this.syncMenu();
    this.menu.hidden = false;
  },
  resume() {
    F.Game.paused = false;
    F.Game.last = performance.now();
    this.menu.hidden = true;
  },

  // Troca as teclas citadas nas dicas pelos botões da tela.
  label(text) {
    if (!this.on || !text) return text;
    return text
      .replace(/aperte X/g, 'toque ✦')
      .replace(/\(X\)/g, '(✦)')
      .replace(/\bTAB\b/g, '⇄');
  },
};
