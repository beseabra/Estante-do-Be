// ============================================================
//  CENA: ENTRE OS CAPÍTULOS
//  O muro de concreto ganha mais um painel, pintado pincelada
//  por pincelada. Depois aparecem o pedaço do mundo recuperado,
//  um "retrato" (Noah) ou uma página da bíblia da vovó (Jude),
//  e um poema curto.
// ============================================================
F.InterludeScene = class {
  constructor(index) {
    this.index = index;
    this.level = F.Levels[index];
    this.t = 0;
    this.typer = new F.Typewriter(this.level.interlude.poem, 26, 4.2);
    this.played = false;

    const R = F.utils.rand;
    this.dust = Array.from({ length: 40 }, () => ({
      x: R(0, F.W), y: R(0, F.H), vy: R(-12, -4), s: R(0.6, 1.8), p: R(0, 6),
    }));
  }

  enter() { F.Audio.setMusic(F.Music.interlude); }

  update(dt) {
    this.t += dt;
    this.typer.update(dt);
    if (!this.played && this.t > 0.8) {
      this.played = true;
      F.Audio.paint();
    }
    if (this.t > 3.1 && !this.played2) {
      this.played2 = true;
      F.Audio.sparkle();
    }
    for (const d of this.dust) {
      d.y += d.vy * dt;
      if (d.y < -5) { d.y = F.H + 5; d.x = F.utils.rand(0, F.W); }
    }

    if (this.t > 1 && F.Input.confirm()) {
      if (!this.typer.done) { this.typer.finish(); this.t = Math.max(this.t, 4); }
      else this.next();
    }
  }

  next() {
    const last = this.index >= F.Levels.length - 1;
    F.Game.changeScene(() => (last ? new F.EndingScene() : new F.PlayScene(this.index + 1)), '#000', 0.8);
  }

  draw(ctx) {
    const t = this.t, L = this.level;

    const bg = ctx.createLinearGradient(0, 0, 0, F.H);
    bg.addColorStop(0, '#2a1a22');
    bg.addColorStop(1, '#120a10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, F.W, F.H);

    for (const d of this.dust) {
      ctx.fillStyle = `rgba(255,220,170,${0.2 + 0.2 * Math.sin(t * 2 + d.p)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
      ctx.fill();
    }

    F.draw.text(ctx, `CAPÍTULO ${L.numeral}  ·  ${L.title.toUpperCase()}`, F.W / 2, 30, { size: 13, spacing: 5, color: '#ffcf8a', alpha: 0.85 });

    // o muro com os painéis
    const done = Math.max(F.Progress.pieces.length, this.index + 1);
    F.draw.glow(ctx, F.W / 2, 170, 440, '255,200,140', 0.12);
    F.Mural.draw(ctx, 60, 52, 840, 244, done, { index: this.index, t: t - 0.6 }, t);

    // o pedaço recuperado
    const a = F.utils.clamp((t - 2.8) / 1, 0, 1);
    if (a > 0) {
      F.draw.glow(ctx, F.W / 2 - 150, 326, 40, '255,220,150', 0.4 * a);
      F.Art.piece(ctx, L.piece, F.W / 2 - 150, 326, L.piece === 'sol' ? 2.6 : 2.2, t, a);
      F.draw.text(ctx, 'Você recuperou:', F.W / 2 + 10, 318, { size: 20, style: 'italic', color: '#f3dcc8', alpha: a * 0.8, align: 'right' });
      F.draw.text(ctx, L.pieceName, F.W / 2 + 22, 322, { size: 40, font: F.HAND, color: '#ffe2a8', alpha: a, align: 'left', glow: 12, glowColor: 'rgba(255,170,90,0.7)' });
    }
    const b = F.utils.clamp((t - 3.6) / 1, 0, 1);
    F.draw.text(ctx, L.interlude.retrato, F.W / 2, 360, { size: 17, style: 'italic', color: '#e8cfc0', alpha: b * 0.8 });

    this.typer.draw(ctx, F.W / 2, 396, 25, { size: 21, style: 'italic', color: '#fbeee2' });

    if (this.typer.done) {
      const p = 0.5 + 0.5 * Math.sin(t * 2.5);
      F.draw.text(ctx, F.Input.hint(), F.W / 2, 518, { size: 14, spacing: 2, color: '#ffcf8a', alpha: p * 0.75 });
    }

    F.draw.vignette(ctx, 0.5);
  }
};
