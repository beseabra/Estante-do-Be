// ============================================================
//  PLATAFORMA
//
//  Nas fases: [x, y, largura, altura, opções]
//    move:    { dx, dy, period }  vai e volta
//    fragile: true                desmorona depois de pisada
//    ghost:   true                degrau da vovó: só a Jude pisa
//    oneWay:  true/false          (padrão: finas são atravessáveis por baixo)
//
//  Toda coisa sólida do jogo segue esta mesma "interface":
//    x, y, w, h, oneWay, solid, prevY, dx, dy, step(quem)
//  Assim os gêmeos colidem com plataformas, portões e blocos do mesmo jeito.
// ============================================================
F.Platform = class {
  constructor(x, y, w, h, o = {}) {
    this.bx = x; this.by = y;
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.move = o.move || null;
    this.phase = o.phase || 0;
    this.fragile = !!o.fragile;
    this.ghost = !!o.ghost;
    this.paint = !!o.paint;
    this.ttl = o.ttl || 0;
    this.life = this.ttl;
    this.hue = o.hue ?? Math.random() * 360;
    this.oneWay = o.oneWay ?? h <= 24;
    this.dx = 0; this.dy = 0;
    this.prevY = y;
    this.solid = true;
    this.alpha = this.paint ? 0 : 1;
    this.state = 'idle';
    this.timer = 0;
    this.vy = 0;
    this.dead = false;

    const rnd = F.utils.seeded(x * 7 + y * 13 + 1);
    this.deco = [];
    for (let i = 0; i < Math.floor(w / 24); i++) this.deco.push({ x: 6 + rnd() * (w - 12), c: rnd(), s: 0.7 + rnd() * 0.8 });
  }

  // Só a Jude enxerga e pisa nos degraus da vovó.
  solidFor(twin) { return this.solid && (!this.ghost || (twin && twin.kind === 'jude')); }
  get safe() { return !this.move && !this.fragile && !this.paint; }

  update(dt, t) {
    const px = this.x, py = this.y;
    this.prevY = py;
    if (this.move) {
      const p = this.move.period || 4;
      const k = (1 - Math.cos((t / p) * Math.PI * 2 + this.phase)) / 2;
      this.x = this.bx + (this.move.dx || 0) * k;
      this.y = this.by + (this.move.dy || 0) * k;
    }
    if (this.fragile) this.updateFragile(dt);
    if (this.paint) {
      this.life -= dt;
      this.alpha = Math.min(1, this.alpha + dt * 6, this.life / 0.8);
      if (this.life <= 0) this.dead = true;
    }
    this.dx = this.x - px;
    this.dy = this.y - py;
  }

  step() {
    if (this.fragile && this.state === 'idle') {
      this.state = 'shaking';
      this.timer = 0;
      F.Audio.crack();
    }
  }

  updateFragile(dt) {
    this.timer += dt;
    if (this.state === 'idle') this.alpha = Math.min(1, this.alpha + dt * 2);
    else if (this.state === 'shaking' && this.timer > 0.55) {
      this.state = 'falling';
      this.timer = 0;
      this.solid = false;
      this.vy = 0;
    } else if (this.state === 'falling') {
      this.vy += 1400 * dt;
      this.y += this.vy * dt;
      this.alpha = Math.max(0, 1 - this.timer / 0.8);
      if (this.timer > 3) this.reset();
    }
  }

  reset() {
    if (!this.fragile) return;
    this.x = this.bx; this.y = this.by;
    this.state = 'idle';
    this.solid = true;
    this.timer = 0;
    this.alpha = 0;
  }

  draw(ctx, theme, t, activeKind) {
    if (this.alpha <= 0) return;
    const { w, h } = this;
    ctx.save();
    ctx.globalAlpha *= this.alpha;
    const ox = this.state === 'shaking' ? Math.sin(this.timer * 80) * 1.5 : 0;
    ctx.translate(this.x + ox, this.y);

    if (this.paint) {
      // ponte de tinta: pinceladas coloridas
      F.draw.glow(ctx, w / 2, 4, w * 0.6, '255,230,180', 0.25);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `hsl(${(this.hue + i * 50) % 360},80%,${60 + i * 6}%)`;
        ctx.lineWidth = 5 - i;
        ctx.beginPath();
        ctx.moveTo(3, 2 + i * 3);
        for (let k = 1; k <= 8; k++) ctx.lineTo((k * w) / 8 - 3 * (k === 8), 2 + i * 3 + Math.sin(k * 1.7 + t * 4 + i) * 1.2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if (this.ghost) {
      // degrau espiritual: brilhante para a Jude, quase invisível para o Noah
      const vis = activeKind === 'jude' ? 0.85 : 0.18;
      ctx.globalAlpha *= vis;
      F.draw.glow(ctx, w / 2, h / 2, w * 0.7, '255,170,210', 0.4);
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(246,162,58,0.8)');
      g.addColorStop(0.5, 'rgba(232,80,122,0.8)');
      g.addColorStop(1, 'rgba(123,75,196,0.8)');
      ctx.fillStyle = g;
      F.draw.roundRect(ctx, 0, 0, w, h, h / 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }

    const pal = this.fragile ? (theme.fragile || theme.platform) : theme.platform;
    if (this.move) F.draw.glow(ctx, w / 2, h, w * 0.6, theme.accent, 0.2);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, pal.body);
    g.addColorStop(1, pal.deep);
    ctx.fillStyle = g;
    F.draw.roundRect(ctx, 0, 0, w, h, this.oneWay && h <= 24 ? 5 : 6);
    ctx.fill();
    ctx.fillStyle = pal.top;
    F.draw.roundRect(ctx, 0, -2, w, 6, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(4, -1, w - 8, 1.2);

    if (theme.roofTiles && h > 24) {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      for (let yy = 10; yy < h; yy += 10) {
        ctx.beginPath();
        ctx.moveTo(0, yy); ctx.lineTo(w, yy);
        ctx.stroke();
        for (let xx = (yy / 10) % 2 ? 0 : 10; xx < w; xx += 20) {
          ctx.beginPath();
          ctx.moveTo(xx, yy - 10); ctx.lineTo(xx, yy);
          ctx.stroke();
        }
      }
    }
    if (this.fragile) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 2); ctx.lineTo(w * 0.36, 8); ctx.lineTo(w * 0.3, h - 2);
      ctx.moveTo(w * 0.7, 3); ctx.lineTo(w * 0.62, 10); ctx.lineTo(w * 0.68, h - 3);
      ctx.stroke();
    } else if (theme.flowers) {
      for (const d of this.deco) {
        const c = theme.flowers[Math.floor(d.c * theme.flowers.length)];
        ctx.strokeStyle = 'rgba(90,150,80,0.7)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(d.x, -1);
        ctx.lineTo(d.x, -3.5 * d.s);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(d.x, -4 * d.s, 1.5 * d.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
};
