// ============================================================
//  FRAGMENTO: um pedacinho dela, com uma memória dentro.
//  Nas fases: [x, y, 'a memória que aparece ao pegar']
// ============================================================
F.Fragment = class {
  constructor(x, y, memory) {
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.memory = memory;
    this.t = Math.random() * 6;
    this.collected = false;
    this.ct = 0; // tempo desde que foi coletado
  }

  update(dt) {
    this.t += dt;
    this.y = this.baseY + Math.sin(this.t * 2) * 5;
    if (this.collected) this.ct += dt;
  }

  draw(ctx, theme) {
    if (this.collected && this.ct > 0.5) return;
    const k = this.collected ? 1 + this.ct * 3 : 1 + Math.sin(this.t * 3) * 0.06;
    const a = this.collected ? 1 - this.ct / 0.5 : 1;
    F.Art.shard(ctx, this.x, this.y, 11 * k, Math.sin(this.t * 1.3) * 0.4, theme.shard, a);
    F.draw.sparkle(ctx, this.x + 9, this.y - 11, 3.5 * (0.5 + 0.5 * Math.sin(this.t * 4)), a);
  }
};
