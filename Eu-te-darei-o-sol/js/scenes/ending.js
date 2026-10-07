// ============================================================
//  CENA: O FINAL
//  Na praia, ao pôr do sol. Noah e Jude caminham um até o outro.
//  A Jude ergue a mão, tira o sol do céu e o entrega ao irmão.
// ============================================================
F.EndingScene = class {
  constructor() {
    this.t = 0;
    this.particles = new F.Particles();
    this.groundY = 450;

    // Os dois são desenhados em tamanho dobrado (S) a partir de um
    // ponto central no chão; noahX/judeX são medidos a partir dele.
    this.S = 2;
    this.pivotX = 480;
    this.noahX = -150;
    this.judeX = 150;
    this.walk = 0;
    this.arrivedAt = null;

    // o diálogo do livro em que os dois dividem o mundo
    this.lines = [
      'Quando éramos pequenos, a gente dividiu o mundo.',
      '"— Árvores, estrelas, oceanos. Tudo bem.',
      '— E o sol, Jude.',
      '— Ah, claro. Eu te darei o sol."',
      '"Quando as pessoas se apaixonam, elas pegam fogo."',
      '"Você tem de ver milagres para que haja milagres."',
    ];
    this.lineGap = 2.8;
    this.finalAt = null;
  }

  enter() { F.Audio.setMusic(F.Music.ending); }

  // onde está a mão erguida da Jude, em coordenadas de tela
  judeHand() { return { x: this.pivotX + this.S * (this.judeX - 11), y: this.groundY - this.S * 27 }; }
  meetPoint() { return { x: this.pivotX + this.S * ((this.noahX + this.judeX) / 2), y: this.groundY - this.S * 26 }; }

  update(dt) {
    this.t += dt;
    this.particles.update(dt);

    // os dois caminham um até o outro
    if (this.noahX < -26) {
      this.noahX = Math.min(-26, this.noahX + 34 * dt);
      this.judeX = Math.max(26, this.judeX - 34 * dt);
      this.walk += 34 * dt * 0.075;
    } else if (this.arrivedAt === null) {
      this.arrivedAt = this.t;
    }

    if (this.arrivedAt !== null) {
      const s = this.t - this.arrivedAt;
      if (s > 2 && !this.grabbed) { this.grabbed = true; F.Audio.color(); }
      if (s > 5 && !this.given) {
        this.given = true;
        F.Audio.bloom();
        const m = this.meetPoint();
        this.particles.burst(m.x, m.y, 40, 'spark', '255,210,120', 200);
      }
      if (this.given && Math.random() < 0.3) {
        const m = this.meetPoint();
        this.particles.emit({ x: m.x + F.utils.rand(-10, 10), y: m.y, vy: -50, vx: F.utils.rand(-30, 30), life: 2, size: 2.4, kind: 'spark', color: '255,220,140' });
      }
      const linesStart = this.arrivedAt + 6.5;
      if (this.finalAt === null && this.t > linesStart + this.lines.length * this.lineGap + 2) this.finalAt = this.t;
    }

    if (F.Input.confirm() && this.arrivedAt !== null) {
      if (this.finalAt === null) this.finalAt = this.t;
      else if (this.t - this.finalAt > 4) F.Game.changeScene(() => new F.TitleScene(true), '#000', 0.5);
    }
  }

  // posição e tamanho do sol: no céu, depois na mão dela, depois entre os dois
  sunState() {
    const sky = { x: 480, y: 300, r: 56 };
    if (this.arrivedAt === null) return sky;
    const s = this.t - this.arrivedAt;
    const E = F.utils.easeInOut;
    const hand = this.judeHand();
    const hold = { x: hand.x + 10, y: hand.y - 12, r: 12 };
    const m = this.meetPoint();
    const meet = { x: m.x, y: m.y - 10, r: 14 };
    const mix = (a, b, k) => ({ x: F.utils.lerp(a.x, b.x, k), y: F.utils.lerp(a.y, b.y, k), r: F.utils.lerp(a.r, b.r, k) });
    if (s < 1.5) return sky;
    if (s < 4) return mix(sky, hold, E((s - 1.5) / 2.5));
    if (s < 5) return mix(hold, meet, E(s - 4));
    return meet;
  }

  draw(ctx) {
    const t = this.t;
    const sun = this.sunState();
    const lit = F.utils.clamp((sun.y - 300) / 80, 0, 1); // o céu esfria quando o sol desce até eles

    // céu
    const g = ctx.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, lit > 0.5 ? '#2a2a6a' : '#4a3a8a');
    g.addColorStop(0.5, '#d0688a');
    g.addColorStop(1, '#ffc27a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, F.W, F.H);
    ctx.fillStyle = `rgba(20,10,50,${lit * 0.35})`;
    ctx.fillRect(0, 0, F.W, F.H);

    // estrelas aparecem quando o sol sai do céu
    if (lit > 0) {
      const rnd = F.utils.seeded(5);
      for (let i = 0; i < 70; i++) {
        const a = lit * (0.4 + 0.6 * Math.abs(Math.sin(t + i)));
        ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`;
        ctx.fillRect(rnd() * F.W, rnd() * 260, 1.5, 1.5);
      }
    }

    // mar
    const sea = ctx.createLinearGradient(0, 380, 0, this.groundY);
    sea.addColorStop(0, '#c0607a');
    sea.addColorStop(1, '#4a3a7a');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 380, F.W, this.groundY - 380);
    ctx.fillStyle = `rgba(255,220,170,${0.45 * (1 - lit)})`;
    for (let i = 0; i < 7; i++) {
      const w = 160 - i * 16;
      ctx.fillRect(sun.x - w / 2 + Math.sin(t * 1.3 + i) * 6, 388 + i * 9, w, 2);
    }

    // areia
    const sand = ctx.createLinearGradient(0, this.groundY - 8, 0, F.H);
    sand.addColorStop(0, '#f0c896');
    sand.addColorStop(1, '#b07a5a');
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY - 4);
    for (let x = 0; x <= F.W; x += 20) ctx.lineTo(x, this.groundY - 4 + Math.sin(x * 0.02) * 3);
    ctx.lineTo(F.W, F.H);
    ctx.lineTo(0, F.H);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= F.W; x += 10) ctx.lineTo(x, this.groundY - 6 + Math.sin(x * 0.03 + t * 1.5) * 2);
    ctx.stroke();

    // o sol
    F.draw.glow(ctx, sun.x, sun.y, sun.r * 5, '255,190,110', 0.5);
    F.Art.sun(ctx, sun.x, sun.y, sun.r, t);

    // os gêmeos
    const arrived = this.arrivedAt !== null;
    const s = arrived ? this.t - this.arrivedAt : 0;
    ctx.save();
    ctx.translate(this.pivotX, this.groundY);
    ctx.scale(this.S, this.S);
    F.Art.drawJude(ctx, this.judeX, 0, {
      facing: -1, t, walk: this.walk, moving: !arrived, noBeanie: true,
      reach: arrived && s > 1.2, headTilt: arrived && s < 4.5 ? -0.25 : 0.1,
    });
    F.Art.drawNoah(ctx, this.noahX, 0, {
      facing: 1, t, walk: this.walk, moving: !arrived,
      reach: arrived && s > 4.2, headTilt: arrived && s < 4.5 ? -0.2 : 0,
    });
    ctx.restore();
    this.particles.draw(ctx);

    F.draw.vignette(ctx, 0.35, '30,8,30');
    if (arrived) this.drawWords(ctx, s);
  }

  drawWords(ctx, s) {
    const t = this.t;
    const style = { size: 26, style: 'italic', color: '#fff8f0', glow: 10, glowColor: 'rgba(80,20,60,0.7)' };

    if (this.finalAt === null) {
      this.lines.forEach((line, i) => {
        const a = F.utils.clamp((s - 6.5 - i * this.lineGap) / 1.2, 0, 1);
        F.draw.text(ctx, line, F.W / 2, 50 + i * 38, Object.assign({}, style, { alpha: a }));
      });
      return;
    }

    const f = t - this.finalAt;
    const fadeIn = (delay, dur = 1.5) => F.utils.clamp((f - delay) / dur, 0, 1);

    F.draw.text(ctx, 'Eu te darei o sol.', F.W / 2, 104, {
      size: 84, font: F.HAND, color: '#fff', alpha: fadeIn(0.4), glow: 20, glowColor: 'rgba(255,160,90,0.9)',
    });
    F.draw.text(ctx, F.CONFIG.saudacao, F.W / 2, 172, Object.assign({}, style, { size: 24, alpha: fadeIn(2) }));
    F.draw.text(ctx, F.CONFIG.dedicatoria, F.W / 2, 204, Object.assign({}, style, { size: 21, alpha: fadeIn(2.8) }));
    F.draw.text(ctx, 'com trechos de "Eu te darei o sol", de Jandy Nelson (trad. Paulo Polzonoff Junior)', F.W / 2, 240, Object.assign({}, style, { size: 15, alpha: fadeIn(3.6) * 0.7, glow: 0 }));

    if (f > 4) {
      const a = (0.5 + 0.5 * Math.sin(t * 2.5)) * fadeIn(4, 1);
      F.draw.text(ctx, F.Input.isTouch ? 'toque para recomeçar' : 'pressione ENTER para recomeçar', F.W / 2, 520, { size: 14, spacing: 2, color: '#fff', alpha: a * 0.7 });
    }
  }
};
