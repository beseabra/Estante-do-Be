// ============================================================
//  O JOGO (laço principal + troca de cenas)
//
//  Uma "cena" é qualquer objeto com:
//    enter()      -> chamado quando a cena começa (opcional)
//    update(dt)   -> lógica; dt = segundos desde o último quadro
//    draw(ctx)    -> desenho
//
//  Cenas existentes: TitleScene, PlayScene, InterludeScene, EndingScene
// ============================================================
F.Game = {
  scene: null,
  paused: false,
  fade: { a: 1, dir: -1, next: null, color: '#000', speed: 1 },

  start() {
    this.canvas = document.getElementById('game');
    // no celular, uma resolução um pouco menor deixa o jogo mais fluido
    if (F.Mobile.device()) F.SCALE = 1.5;
    this.canvas.width = F.W * F.SCALE;
    this.canvas.height = F.H * F.SCALE;
    this.ctx = this.canvas.getContext('2d');

    F.Input.init();
    this.setScene(new F.TitleScene());

    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  },

  setScene(scene) {
    this.scene = scene;
    if (scene.enter) scene.enter();
  },

  // Troca de cena com um esmaecer (fade). "factory" é uma função
  // que cria a próxima cena só quando a tela já estiver coberta.
  changeScene(factory, color = '#000', speed = 1) {
    if (this.fade.next) return;
    Object.assign(this.fade, { next: factory, dir: 1, color, speed });
  },

  loop(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;

    if (F.Input.musicToggle()) F.Audio.toggle();

    if (!this.paused) {
      this.scene.update(dt);
      this.updateFade(dt);
    }
    F.Audio.update();

    const ctx = this.ctx;
    ctx.setTransform(F.SCALE, 0, 0, F.SCALE, 0, 0);
    this.scene.draw(ctx);
    if (this.fade.a > 0) {
      ctx.globalAlpha = this.fade.a;
      ctx.fillStyle = this.fade.color;
      ctx.fillRect(0, 0, F.W, F.H);
      ctx.globalAlpha = 1;
    }

    F.Input.endFrame();
    requestAnimationFrame(this.loop);
  },

  updateFade(dt) {
    const f = this.fade;
    if (f.dir === 0) return;
    f.a += f.dir * f.speed * dt;
    if (f.dir > 0 && f.a >= 1) {
      f.a = 1;
      const factory = f.next;
      f.next = null;
      f.dir = -1;
      this.setScene(factory());
    } else if (f.dir < 0 && f.a <= 0) {
      f.a = 0;
      f.dir = 0;
    }
  },
};
