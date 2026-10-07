// ============================================================
//  PARTÍCULAS: corações, faíscas e poeirinha
// ============================================================
F.Particles = class {
  constructor() {
    this.list = [];
  }

  emit(o) {
    this.list.push(Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1,
      size: 4, kind: 'spark', color: '255,255,255', grav: 0, drag: 0,
    }, o));
  }

  // Várias partículas saindo de um ponto em todas as direções.
  burst(x, y, n, kind, color, speed = 120) {
    const R = F.utils.rand;
    for (let i = 0; i < n; i++) {
      const a = R(0, Math.PI * 2);
      const s = R(speed * 0.3, speed);
      this.emit({
        x, y, kind, color,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (kind === 'heart' ? 40 : 0),
        life: R(0.6, 1.4),
        size: kind === 'heart' ? R(4, 7) : R(1.5, 3.5),
        drag: 2.5,
        grav: kind === 'heart' ? -30 : kind === 'dust' ? 60 : 0,
      });
    }
  }

  update(dt) {
    for (const p of this.list) {
      p.age += dt;
      p.vy += p.grav * dt;
      const k = 1 / (1 + p.drag * dt);
      p.vx *= k;
      p.vy *= k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.list = this.list.filter((p) => p.age < p.life);
  }

  draw(ctx) {
    for (const p of this.list) {
      const a = 1 - p.age / p.life;
      if (p.kind === 'heart') {
        F.draw.heart(ctx, p.x, p.y, p.size, `rgba(${p.color},${a})`);
      } else if (p.kind === 'dust') {
        ctx.fillStyle = `rgba(${p.color},${a * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        F.draw.glow(ctx, p.x, p.y, p.size * 4, p.color, a * 0.6);
        F.draw.sparkle(ctx, p.x, p.y, p.size * 1.4, a);
      }
    }
  }
};
