// ============================================================
//  MÁQUINA DE ESCREVER
//  Mostra um poema letra por letra, com uma pausa entre versos.
// ============================================================
F.Typewriter = class {
  constructor(lines, cps = 28, delay = 0) {
    this.lines = lines;
    this.cps = cps;                 // caracteres por segundo
    this.pause = 12;                // pausa entre versos (em "caracteres")
    this.chars = -delay * cps;      // começa negativo = espera "delay" segundos
    this.total = lines.reduce((sum, l) => sum + l.length + this.pause, 0);
  }

  update(dt) { this.chars += dt * this.cps; }
  finish() { this.chars = this.total; }
  get done() { return this.chars >= this.total; }

  draw(ctx, x, y, lineHeight, style) {
    let acc = 0;
    this.lines.forEach((line, i) => {
      const n = Math.floor(F.utils.clamp(this.chars - acc, 0, line.length));
      if (n > 0) F.draw.text(ctx, line.slice(0, n), x, y + i * lineHeight, style);
      acc += line.length + this.pause;
    });
  }
};
