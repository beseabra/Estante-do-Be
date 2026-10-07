// ============================================================
//  PLATAFORMA
//
//  Nas fases, cada plataforma é escrita como:
//    [x, y, largura, altura, opções]
//
//  Opções:
//    move:    { dx, dy, period }  -> vai e volta (dx/dy = distância, period = segundos)
//    fragile: true                -> quebra pouco depois que ele pisa
//    oneWay:  true/false          -> dá pra atravessar por baixo
//                                    (padrão: plataformas finas são oneWay)
// ============================================================
F.Platform = class {
  constructor(x, y, w, h, o = {}) {
    this.bx = x; this.by = y;   // posição original
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.move = o.move || null;
    this.phase = o.phase || 0;
    this.fragile = !!o.fragile;
    this.oneWay = o.oneWay ?? h <= 24;
    this.dx = 0; this.dy = 0;   // quanto andou neste quadro (para carregar o jogador)
    this.prevY = y;
    this.solid = true;
    this.alpha = 1;
    this.state = 'idle';        // plataformas frágeis: idle -> shaking -> falling
    this.timer = 0;
    this.vy = 0;

    // Florzinhas decorativas, sempre nos mesmos lugares
    const rnd = F.utils.seeded(x * 7 + y * 13 + 1);
    this.deco = [];
    for (let i = 0; i < Math.floor(w / 26); i++) {
      this.deco.push({ x: 6 + rnd() * (w - 12), c: rnd(), s: 0.7 + rnd() * 0.8 });
    }
  }

  // Lugar seguro para renascer? (não se mexe e não quebra)
  get safe() { return !this.move && !this.fragile; }

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

    this.dx = this.x - px;
    this.dy = this.y - py;
  }

  // O jogador pisou aqui.
  step() {
    if (this.fragile && this.state === 'idle') {
      this.state = 'shaking';
      this.timer = 0;
      F.Audio.crack();
    }
  }

  updateFragile(dt) {
    this.timer += dt;
    if (this.state === 'idle') {
      this.alpha = Math.min(1, this.alpha + dt * 2);
    } else if (this.state === 'shaking' && this.timer > 0.6) {
      this.state = 'falling';
      this.timer = 0;
      this.solid = false;
      this.vy = 0;
    } else if (this.state === 'falling') {
      this.vy += 1400 * dt;
      this.y += this.vy * dt;
      this.alpha = Math.max(0, 1 - this.timer / 0.8);
      if (this.timer > 2.6) this.reset();
    }
  }

  reset() {
    this.x = this.bx;
    this.y = this.by;
    this.state = 'idle';
    this.solid = true;
    this.timer = 0;
    this.alpha = 0;
  }

  draw(ctx, theme) {
    if (this.alpha <= 0) return;
    const pal = this.fragile ? (theme.fragile || theme.platform) : theme.platform;
    const ox = this.state === 'shaking' ? Math.sin(this.timer * 80) * 1.5 : 0;
    const { w, h } = this;

    ctx.save();
    ctx.globalAlpha *= this.alpha;
    ctx.translate(this.x + ox, this.y);

    if (this.move) F.draw.glow(ctx, w / 2, h, w * 0.6, theme.accent, 0.25);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, pal.body);
    g.addColorStop(1, pal.deep);
    ctx.fillStyle = g;
    F.draw.roundRect(ctx, 0, 0, w, h, this.oneWay && h <= 24 ? 6 : 8);
    ctx.fill();

    ctx.fillStyle = pal.top;
    F.draw.roundRect(ctx, 0, -2, w, 6, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(4, -1, w - 8, 1.2);

    if (this.fragile) {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 2); ctx.lineTo(w * 0.36, 8); ctx.lineTo(w * 0.3, h - 2);
      ctx.moveTo(w * 0.7, 3); ctx.lineTo(w * 0.62, 10); ctx.lineTo(w * 0.68, h - 3);
      ctx.stroke();
    } else if (theme.flowers) {
      for (const d of this.deco) {
        const c = theme.flowers[Math.floor(d.c * theme.flowers.length)];
        ctx.strokeStyle = 'rgba(120,170,110,0.6)';
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
