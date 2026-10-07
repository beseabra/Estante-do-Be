// ============================================================
//  PERIGOS
//    Nuvem cinzenta: tira a cor do mundo. O Noah pode pintá-la —
//      aí ela vira uma nuvem colorida onde dá para pisar.
//    Espinhos, mar (com maré) e chuva de meteoros.
// ============================================================

// ---------- NUVEM CINZENTA ----------
// { x, y, dx, dy, period }  — vai e volta entre (x,y) e (x+dx, y+dy)
F.GrayCloud = class {
  constructor(o) {
    this.bx = o.x; this.by = o.y;
    this.mx = o.dx || 0; this.my = o.dy || 0;
    this.period = o.period || 4;
    this.phase = o.phase || 0;
    this.cx = o.x; this.cy = o.y;
    this.w = 58; this.h = 28;
    this.colored = !!o.colored;
    this.colorT = 0;
    // interface de plataforma (válida só quando colorida)
    this.oneWay = true;
    this.dx = 0; this.dy = 0;
    this.x = 0; this.y = 0; this.prevY = 0;
  }
  get solid() { return this.colored; }
  solidFor() { return this.colored; }
  step() {}

  update(dt, t) {
    const pcx = this.cx, pcy = this.cy;
    const k = (1 - Math.cos((t / this.period) * Math.PI * 2 + this.phase)) / 2;
    this.cx = this.bx + this.mx * k;
    this.cy = this.by + this.my * k;
    this.dx = this.cx - pcx;
    this.dy = this.cy - pcy;
    this.prevY = this.y;
    this.x = this.cx - this.w / 2;
    this.y = this.cy - this.h * 0.35;
    if (this.colored) this.colorT += dt;
  }

  // retângulo que machuca (menor que o desenho, para ser justo)
  hurts(tw) {
    if (this.colored) return false;
    return tw.x + tw.w / 2 > this.cx - this.w / 2 + 8 && tw.x - tw.w / 2 < this.cx + this.w / 2 - 8 &&
           tw.y > this.cy - this.h / 2 + 4 && tw.y - tw.h < this.cy + this.h / 2 - 4;
  }

  color(scene) {
    this.colored = true;
    F.Audio.color();
    scene.particles.burst(this.cx, this.cy, 24, 'spark', '255,220,150', 160);
  }

  draw(ctx, t) {
    F.Art.cloud(ctx, this.cx, this.cy, this.w, this.h, this.colored, t);
  }
};

// ---------- ESPINHOS ----------
// [x, y, w] — y é o chão onde estão
F.Thorns = class {
  constructor(x, y, w) { this.x = x; this.y = y; this.w = w; }
  hurts(tw) {
    return tw.x + tw.w / 2 > this.x + 3 && tw.x - tw.w / 2 < this.x + this.w - 3 && tw.y > this.y - 9 && tw.y - tw.h < this.y;
  }
  draw(ctx, theme) { F.Art.thorns(ctx, this.x, this.y, this.w, theme.thorns || '#2c2a33'); }
};

// ---------- MAR (com maré) ----------
// { y, amp, period }  — a superfície sobe e desce
F.Water = class {
  constructor(o) {
    this.base = o.y; this.amp = o.amp || 0; this.period = o.period || 8;
    this.level = this.base;
  }
  update(t) { this.level = this.base + Math.sin((t / this.period) * Math.PI * 2) * this.amp; }
  hurts(tw) { return tw.y > this.level + 6; }
  draw(ctx, cam, t, levelW, levelH) {
    const x0 = Math.max(0, cam.x - 20), x1 = Math.min(levelW, cam.x + F.W + 20);
    const g = ctx.createLinearGradient(0, this.level, 0, this.level + 160);
    g.addColorStop(0, 'rgba(60,140,200,0.78)');
    g.addColorStop(1, 'rgba(14,40,80,0.95)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, levelH + 200);
    for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, this.level + Math.sin(x * 0.03 + t * 2) * 3);
    ctx.lineTo(x1, levelH + 200);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let x = x0 - (x0 % 24); x <= x1; x += 24) {
      ctx.fillRect(x + Math.sin(t + x) * 4, this.level + Math.sin(x * 0.03 + t * 2) * 3 - 1, 10, 2);
    }
  }
};

// ---------- CHUVA DE METEOROS ----------
// { startX, interval } — os meteoros miram perto de quem está jogando
F.MeteorShower = class {
  constructor(o) {
    this.startX = o.startX || 0;
    this.interval = o.interval || 2.4;
    this.rocks = !!o.rocks;
    this.endX = o.endX ?? Infinity;
    this.timer = 1.5;
    this.list = [];
  }

  groundAt(x, scene) {
    let best = scene.level.height + 80;
    for (const p of scene.platforms) {
      if (p.ghost || !p.solid) continue;
      if (x >= p.x && x <= p.x + p.w && p.y < best && p.y > scene.cam.y - 40) best = p.y;
    }
    return best;
  }

  update(dt, scene) {
    const P = scene.active;
    if (P.x > this.startX && P.x < this.endX && scene.state === 'play') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.interval * F.utils.rand(0.7, 1.2);
        const tx = P.x + F.utils.rand(-160, 280) + P.vx * 0.6;
        const ty = this.groundAt(tx, scene);
        // rocks: pedras caindo reto do teto (ateliê); senão, meteoros na diagonal
        const sx = this.rocks ? tx : tx - 260;
        this.list.push({ tx, ty, sx, sy: scene.cam.y - 60, p: 0, dur: this.rocks ? 1.1 : 1.25 });
      }
    }
    for (const m of this.list) {
      m.p += dt / m.dur;
      if (m.p >= 1 && !m.hit) {
        m.hit = true;
        F.Audio.boom();
        scene.shake = 0.3;
        scene.particles.burst(m.tx, m.ty, 22, 'spark', '255,180,90', 220);
        scene.particles.burst(m.tx, m.ty, 10, 'dust', '120,100,90', 120);
        for (const tw of scene.twins) {
          if (F.utils.dist(tw.x, tw.y - 18, m.tx, m.ty) < 40) scene.hurt(tw, this.rocks ? 'Uma pedra caiu do teto.' : 'Um meteoro! Por pouco...');
        }
      }
    }
    this.list = this.list.filter((m) => m.p < 1.4);
  }

  draw(ctx, t) {
    for (const m of this.list) {
      if (m.p < 1) {
        // aviso no chão: onde ele vai cair
        const a = 0.3 + 0.4 * Math.abs(Math.sin(t * 10));
        ctx.strokeStyle = `rgba(255,140,80,${a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(m.tx, m.ty - 2, 30 * m.p + 8, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        const x = F.utils.lerp(m.sx, m.tx, m.p), y = F.utils.lerp(m.sy, m.ty, m.p);
        if (this.rocks) {
          ctx.fillStyle = '#8a8478';
          ctx.beginPath();
          ctx.moveTo(x - 7, y - 3); ctx.lineTo(x - 2, y - 8); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x + 6, y + 5); ctx.lineTo(x - 5, y + 6);
          ctx.fill();
        } else F.Art.meteor(ctx, x, y, 6, m.tx - m.sx, m.ty - m.sy);
      } else {
        F.draw.glow(ctx, m.tx, m.ty, 50 * (1.4 - m.p) * 2.5, '255,170,80', 0.6 * (1.4 - m.p) * 2.5);
      }
    }
  }
};
