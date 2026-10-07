// ============================================================
//  CENA: ENTRE AS FASES
//  O retrato dela ganha mais um pedaço (colado com ouro)
//  e o poema daquela versão dela é escrito na tela.
// ============================================================
F.InterludeScene = class {
  constructor(index) {
    this.index = index;
    this.level = F.Levels[index];
    this.t = 0;
    this.typer = new F.Typewriter(this.level.poem, 26, 2.6);
    this.played = false;

    const R = F.utils.rand;
    this.dust = Array.from({ length: 45 }, () => ({
      x: R(0, F.W), y: R(0, F.H), vy: R(-12, -4), s: R(0.6, 1.8), p: R(0, 6),
    }));
  }

  enter() { F.Audio.setMusic(F.Music.interlude); }

  update(dt) {
    this.t += dt;
    this.typer.update(dt);
    if (!this.played && this.t > 2.2) {
      this.played = true;
      F.Audio.sparkle();
    }
    for (const d of this.dust) {
      d.y += d.vy * dt;
      if (d.y < -5) { d.y = F.H + 5; d.x = F.utils.rand(0, F.W); }
    }

    if (this.t > 1 && F.Input.confirm()) {
      if (!this.typer.done) this.typer.finish();
      else this.next();
    }
  }

  next() {
    const last = this.index >= F.Levels.length - 1;
    F.Game.changeScene(() => (last ? new F.EndingScene() : new F.PlayScene(this.index + 1)), '#000', 0.8);
  }

  draw(ctx) {
    const t = this.t;
    const total = F.Levels.length;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    const bg = ctx.createRadialGradient(250, 270, 20, 250, 270, 700);
    bg.addColorStop(0, '#3d1029');
    bg.addColorStop(1, '#0e040a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, F.W, F.H);

    for (const d of this.dust) {
      ctx.fillStyle = `rgba(255,210,225,${0.25 + 0.25 * Math.sin(t * 2 + d.p)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
      ctx.fill();
    }

    F.Portrait.drawShattered(ctx, 250, 270, 165, this.index + 1, { index: this.index, t: t - 0.6 }, t);

    const x = 480;
    F.draw.text(ctx, `FRAGMENTO ${this.level.numeral} DE ${roman[total - 1]}`, x, 120, { size: 13, spacing: 5, color: '#e9c37b', align: 'left', alpha: 0.9 });
    F.draw.text(ctx, this.level.title, x, 162, { size: 42, style: 'italic', weight: 300, color: '#fbe8ef', align: 'left', glow: 12 });
    ctx.fillStyle = 'rgba(233,195,123,0.7)';
    ctx.fillRect(x, 192, 60, 1);

    this.typer.draw(ctx, x, 236, 34, { size: 23, style: 'italic', color: '#f8e6ec', align: 'left' });

    if (this.typer.done) {
      const a = 0.5 + 0.5 * Math.sin(t * 2.5);
      F.draw.text(ctx, F.Input.hint(), x, 470, { size: 15, spacing: 2, color: '#f2c9d6', align: 'left', alpha: a * 0.8 });
    }

    F.draw.vignette(ctx, 0.5);
  }
};
