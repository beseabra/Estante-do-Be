// ============================================================
//  COLETÁVEIS
//    Coletável principal (retrato, página, estrela, raio) com uma memória.
//    Pote de tinta: enche a tinta do Noah.
//    Amuleto: um escudo para a Jude (a sorte da bíblia da vovó).
// ============================================================

F.Collectible = class {
  constructor(x, y, memory, art) {
    this.x = x; this.baseY = y; this.y = y;
    this.memory = memory;
    this.art = art;
    this.t = Math.random() * 6;
    this.collected = false;
    this.ct = 0;
  }
  update(dt) {
    this.t += dt;
    this.y = this.baseY + Math.sin(this.t * 2) * 5;
    if (this.collected) this.ct += dt;
  }
  draw(ctx) {
    if (this.collected && this.ct > 0.5) return;
    const k = this.collected ? 1 + this.ct * 3 : 1 + Math.sin(this.t * 3) * 0.05;
    const a = this.collected ? 1 - this.ct / 0.5 : 1;
    const fn = { retrato: F.Art.retrato, pagina: F.Art.pagina, estrela: F.Art.fallenStar, raio: F.Art.ray }[this.art];
    fn(ctx, this.x, this.y, this.t, k, a);
  }
};

F.PaintPot = class {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.t = Math.random() * 6;
    this.cool = 0; // tempo até reaparecer
  }
  update(dt) { this.t += dt; this.cool = Math.max(0, this.cool - dt); }
  get available() { return this.cool <= 0; }
  draw(ctx) { F.Art.paintPot(ctx, this.x, this.y, this.t, this.available ? 1 : 0.15); }
};

F.Amulet = class {
  constructor(x, y, kind) {
    this.x = x; this.y = y;
    this.kind = kind || 'trevo';
    this.t = Math.random() * 6;
    this.taken = false;
  }
  update(dt) { this.t += dt; }
  draw(ctx) { if (!this.taken) F.Art.amulet(ctx, this.x, this.y, this.kind, this.t); }
};
