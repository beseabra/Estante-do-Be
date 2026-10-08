// ============================================================
//  ENTRADA
//    teclado: setas/WASD andam, E/Espaço/Enter interagem,
//             Tab/Q abre o menu Iniciar, 1-9 escolhem opções
//    mouse/toque: clicar/tocar no chão anda até lá; numa pessoa,
//             anda até ela e conversa
// ============================================================
F.Input = {
  down: {},
  pressed: {},
  toque: null,           // último toque/clique no mundo: { x, y } (na tela)
  celular: false,

  init() {
    const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
    this.celular = mq('(pointer: coarse)') || (('ontouchstart' in window) && !mq('(pointer: fine)'));
    if (this.celular) document.documentElement.classList.add('toque');

    const bloqueadas = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Tab'];
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (bloqueadas.includes(e.code)) e.preventDefault();
      if (!this.down[e.code]) this.pressed[e.code] = true;
      this.down[e.code] = true;
      F.Som.init();
    });
    window.addEventListener('keyup', (e) => { this.down[e.code] = false; });
    window.addEventListener('blur', () => { this.down = {}; });

    const cv = document.getElementById('mundo');
    cv.addEventListener('pointerdown', (e) => {
      F.Som.init();
      this.toque = { x: e.clientX, y: e.clientY };
    });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  endFrame() { this.pressed = {}; this.toque = null; },
  any(codes, map) { return codes.some((c) => map[c]); },

  eixo() {
    const d = this.down;
    let x = 0, y = 0;
    if (d.ArrowLeft || d.KeyA) x -= 1;
    if (d.ArrowRight || d.KeyD) x += 1;
    if (d.ArrowUp || d.KeyW) y -= 1;
    if (d.ArrowDown || d.KeyS) y += 1;
    return { x, y };
  },
  interagir() { return this.any(['KeyE', 'Space', 'Enter', 'NumpadEnter'], this.pressed); },
  menu()      { return this.any(['Tab', 'KeyQ'], this.pressed); },
};
