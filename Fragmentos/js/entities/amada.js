// ============================================================
//  ELA (a amada)
//  Em cada fase ela aparece como um "eco" — uma versão dela,
//  meio transparente. Quanto mais fragmentos ele junta, mais
//  nítida ela fica. Quando ele chega, essa versão vira luz.
// ============================================================
F.Amada = class {
  constructor(x, y, pose = 'stand') {
    this.x = x;
    this.y = y;
    this.pose = pose;
    this.facing = -1;
    this.t = Math.random() * 10;
    this.alpha = 0.25;
    this.targetAlpha = 0.25;
    this.dissolving = false;
    this.dissolve = 0; // 0 = inteira, 1 = virou luz
  }

  // Onde fica a mão dela (para o fio vermelho)
  hand() { return { x: this.x + this.facing * 5, y: this.y - 30 }; }

  update(dt) {
    this.t += dt;
    this.alpha = F.utils.approach(this.alpha, this.targetAlpha, dt * 0.8);
    if (this.dissolving) this.dissolve = Math.min(1, this.dissolve + dt * 0.55);
  }

  draw(ctx) {
    const a = this.alpha * (1 - this.dissolve);
    if (a <= 0.01) return;
    F.draw.glow(ctx, this.x, this.y - 36, 70, '255,185,215', 0.25 + 0.25 * a + Math.sin(this.t * 2) * 0.05);
    ctx.save();
    ctx.globalAlpha *= a;
    F.Art.drawHer(ctx, this.x, this.y, { facing: this.facing, pose: this.pose, t: this.t });
    ctx.restore();
  }
};
