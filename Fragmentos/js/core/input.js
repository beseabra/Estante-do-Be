// ============================================================
//  ENTRADA (teclado, mouse e toque)
//  "down"    = tecla está apertada agora
//  "pressed" = tecla foi apertada NESTE quadro (só uma vez)
// ============================================================
F.Input = {
  down: {},
  pressed: {},
  touch: { left: false, right: false, jump: false },
  isTouch: false,

  init() {
    const blocked = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

    window.addEventListener('keydown', (e) => {
      if (blocked.includes(e.code)) e.preventDefault();
      if (!this.down[e.code]) this.pressed[e.code] = true;
      this.down[e.code] = true;
      F.Audio.init(); // o navegador só libera som depois de uma interação
    });
    window.addEventListener('keyup', (e) => { this.down[e.code] = false; });
    window.addEventListener('blur', () => { this.down = {}; });

    const canvas = document.getElementById('game');
    canvas.addEventListener('mousedown', () => { this.pressed.Tap = true; F.Audio.init(); });

    this.initTouch(canvas);
  },

  // Celular: os botões de toque e a pausa ficam em core/mobile.js
  initTouch(canvas) {
    if (!F.Mobile.device()) return;
    this.isTouch = true;
    F.Mobile.initTouch(this, canvas);
  },

  // Chamado no fim de cada quadro: "pressed" vale só um quadro.
  endFrame() { this.pressed = {}; },

  any(codes, map) { return codes.some((c) => map[c]); },

  left()        { return this.any(['ArrowLeft', 'KeyA'], this.down) || this.touch.left; },
  right()       { return this.any(['ArrowRight', 'KeyD'], this.down) || this.touch.right; },
  jumpPressed() { return this.any(['Space', 'ArrowUp', 'KeyW', 'KeyZ', 'Touch_jump'], this.pressed); },
  jumpHeld()    { return this.any(['Space', 'ArrowUp', 'KeyW', 'KeyZ'], this.down) || this.touch.jump; },
  confirm()     { return this.any(['Enter', 'NumpadEnter', 'Space', 'Tap', 'Touch_jump'], this.pressed); },
  anyPressed()  { return Object.keys(this.pressed).length > 0; },
  musicToggle() { return !!this.pressed.KeyM; },

  // Texto de "aperte para continuar" que combina com o aparelho.
  hint() { return this.isTouch ? 'toque para continuar' : 'pressione ENTER'; },
};
