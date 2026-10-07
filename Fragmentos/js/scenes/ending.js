// ============================================================
//  CENA: O FINAL
//  No alto, ao amanhecer, ele caminha até ela. Ela estende a mão.
//  O fio vermelho finalmente amarra os dois.
// ============================================================
F.EndingScene = class {
  constructor() {
    this.t = 0;
    const base = F.Levels[F.Levels.length - 1].theme;
    this.theme = Object.assign({}, base, {
      celestial: Object.assign({}, base.celestial, { x: 560, y: 360, rise: 0 }),
    });
    this.bg = new F.Background(this.theme, { id: 77, width: F.W, height: F.H });
    this.particles = new F.Particles();
    this.groundY = 440;
    this.ground = new F.Platform(-20, this.groundY, F.W + 40, 140, { oneWay: false });

    // Os dois são desenhados em tamanho dobrado (S) a partir de um ponto
    // central no chão; himX/herX são medidos a partir desse ponto.
    this.S = 2;
    this.pivotX = 480;
    this.himX = -125;
    this.herX = 60;
    this.walk = 0;
    this.arrivedAt = null;

    this.lines = [
      'Cinco pedaços. Cinco versões de você.',
      'A que eu vi primeiro. A que lê em silêncio.',
      'A que mora longe. A que tem medo.',
      'E esta — a inteira — que me olha de volta.',
      'Eu amei cada uma. Eu amo todas.',
    ];
    this.lineGap = 3.2;
    this.finalAt = null; // quando começa a parte final (citação + dedicatória)
  }

  enter() { F.Audio.setMusic(F.Music.ending); }

  get linesStart() { return this.arrivedAt + 1.5; }

  update(dt) {
    this.t += dt;
    this.bg.update(dt, { x: 0, y: 0 });
    this.particles.update(dt);

    // Ele caminha até ela
    const stop = this.herX - 30;
    if (this.himX < stop) {
      this.himX = Math.min(stop, this.himX + 36 * dt);
      this.walk += 36 * dt * 0.075;
    } else if (this.arrivedAt === null) {
      this.arrivedAt = this.t;
      F.Audio.sparkle();
      this.particles.burst(this.herX - 18, -40, 20, 'heart', '230,60,100', 60);
    }

    if (this.arrivedAt !== null) {
      if (Math.random() < 0.12) {
        this.particles.emit({
          x: this.herX - 15 + F.utils.rand(-6, 6), y: -28,
          vy: -18, vx: F.utils.rand(-8, 8), life: 2.8, size: F.utils.rand(2, 3.5), kind: 'heart', color: '230,60,100',
        });
      }
      const linesEnd = this.linesStart + this.lines.length * this.lineGap + 2.5;
      if (this.finalAt === null && this.t > linesEnd) this.finalAt = this.t;
    }

    // ENTER: pula os versos, ou recomeça se já estiver tudo na tela
    if (F.Input.confirm() && this.arrivedAt !== null) {
      if (this.finalAt === null) this.finalAt = this.t;
      else if (this.t - this.finalAt > 4) F.Game.changeScene(() => new F.TitleScene(true), '#000', 0.5);
    }
  }

  draw(ctx) {
    const t = this.t;
    this.bg.draw(ctx, { x: 0, y: 0 }, t);
    this.ground.draw(ctx, this.theme);

    const arrived = this.arrivedAt !== null;
    const since = arrived ? t - this.arrivedAt : 0;

    ctx.save();
    ctx.translate(this.pivotX, this.groundY);
    ctx.scale(this.S, this.S);

    F.Art.drawHer(ctx, this.herX, 0, {
      facing: -1, t, pose: arrived && since > 0.4 ? 'reach' : 'stand', headTilt: arrived ? 0.16 : 0,
    });
    F.Art.drawHim(ctx, this.himX, 0, {
      facing: 1, t, walk: this.walk, moving: !arrived, reach: arrived && since > 0.6, headTilt: arrived ? -0.2 : -0.05,
    });

    // O fio vermelho
    const hx = this.himX + (arrived && since > 0.6 ? 9 : 4);
    const hy = -(arrived && since > 0.6 ? 23 : 16);
    if (!arrived) {
      F.Art.thread(ctx, hx, hy, this.herX - 11, -24, t, 90);
    } else {
      const sx = this.herX - 11, sy = -24;
      const k = F.utils.clamp((since - 0.6) / 1, 0, 1);
      ctx.strokeStyle = 'rgba(225,30,72,0.95)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo((hx + sx) / 2, Math.max(hy, sy) + 8, F.utils.lerp(hx, sx, k), F.utils.lerp(hy, sy, k));
      ctx.stroke();
      if (k >= 1) {
        const beat = 1 + Math.max(0, Math.sin(t * 5)) * 0.2;
        F.draw.glow(ctx, (hx + sx) / 2, Math.max(hy, sy) + 4, 18, '255,80,120', 0.45);
        F.draw.heart(ctx, (hx + sx) / 2, Math.max(hy, sy) + 4, 3 * beat, '#e01e48');
      }
    }

    this.particles.draw(ctx);
    ctx.restore();

    this.bg.drawWeather(ctx);
    F.draw.vignette(ctx, 0.35, '40,5,25');

    if (arrived) this.drawWords(ctx);
  }

  drawWords(ctx) {
    const t = this.t;
    const style = { size: 26, style: 'italic', color: '#fff8f2', glow: 10, glowColor: 'rgba(120,20,60,0.6)' };

    if (this.finalAt === null) {
      this.lines.forEach((line, i) => {
        const a = F.utils.clamp((t - this.linesStart - i * this.lineGap) / 1.2, 0, 1);
        F.draw.text(ctx, line, F.W / 2, 70 + i * 40, Object.assign({}, style, { alpha: a }));
      });
      return;
    }

    const f = t - this.finalAt;
    const fadeIn = (delay, dur = 1.5) => F.utils.clamp((f - delay) / dur, 0, 1);

    F.draw.text(ctx, '“Me diga em quantos pedaços você foi partida antes que eu te encontrasse;', F.W / 2, 78, Object.assign({}, style, { size: 22, alpha: fadeIn(0.3) }));
    F.draw.text(ctx, 'quero saber quantas versões suas eu terei para amar.”', F.W / 2, 108, Object.assign({}, style, { size: 22, alpha: fadeIn(0.3) }));

    F.draw.text(ctx, 'Fragmentados', F.W / 2, 178, {
      size: 60, style: 'italic', weight: 300, color: '#fff', alpha: fadeIn(2), glow: 18, glowColor: 'rgba(255,120,160,0.8)',
    });

    const nome = F.CONFIG.nomeDela;
    if (nome) F.draw.text(ctx, `${nome},`, F.W / 2, 236, Object.assign({}, style, { size: 24, alpha: fadeIn(3.2) }));
    F.draw.text(ctx, F.CONFIG.dedicatoria, F.W / 2, nome ? 268 : 244, Object.assign({}, style, { size: 21, alpha: fadeIn(nome ? 4 : 3.2) }));

    if (f > 4) {
      const a = (0.5 + 0.5 * Math.sin(t * 2.5)) * fadeIn(4, 1);
      F.draw.text(ctx, F.Input.isTouch ? 'toque para recomeçar' : 'pressione ENTER para recomeçar', F.W / 2, 515, { size: 14, spacing: 2, color: '#fff', alpha: a * 0.7 });
    }
  }
};
