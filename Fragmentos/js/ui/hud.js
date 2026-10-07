// ============================================================
//  HUD (informações por cima do jogo)
//  - Cartão com o nome da fase no começo
//  - Contador de pedaços no canto
//  - A memória que aparece quando ele pega um pedaço
//  - Dicas suaves ("ainda faltam pedaços dela...")
// ============================================================
F.HUD = class {
  constructor(level) {
    this.level = level;
    this.t = 0;
    this.memory = null;
    this.memoryT = 0;
    this.hint = null;
    this.hintT = 0;
  }

  showMemory(text) { this.memory = text; this.memoryT = 0; }
  showHint(text) { this.hint = text; this.hintT = 0; }

  update(dt) {
    this.t += dt;
    this.memoryT += dt;
    this.hintT += dt;
  }

  // Curva de transparência: aparece, fica, some.
  static fade(t, fadeIn, hold, fadeOut) {
    if (t < fadeIn) return t / fadeIn;
    if (t < fadeIn + hold) return 1;
    return Math.max(0, 1 - (t - fadeIn - hold) / fadeOut);
  }

  draw(ctx, collected, total) {
    const th = this.level.theme;
    const color = th.text || '#fff';

    // Cartão de título
    const a = F.HUD.fade(this.t - 0.4, 1.2, 2.8, 1.4);
    if (a > 0) {
      F.draw.text(ctx, `FRAGMENTO ${this.level.numeral}`, F.W / 2, 150, { size: 14, spacing: 6, color, alpha: a * 0.8 });
      F.draw.text(ctx, this.level.title, F.W / 2, 196, { size: 50, style: 'italic', weight: 300, color, alpha: a, glow: 14, glowColor: `rgba(${th.accent},0.8)` });
      F.draw.text(ctx, this.level.subtitle, F.W / 2, 238, { size: 20, style: 'italic', color, alpha: a * 0.75 });
    }

    // Contador de pedaços (losangos no canto)
    for (let i = 0; i < total; i++) {
      const x = F.W - 30 - (total - 1 - i) * 22;
      const y = 30;
      const got = i < collected;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      if (got) {
        F.draw.glow(ctx, 0, 0, 16, th.accent, 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-4.5, -4.5, 9, 9);
      } else {
        ctx.strokeStyle = `rgba(${th.accent},0.5)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-4.5, -4.5, 9, 9);
      }
      ctx.restore();
    }

    // Memória
    if (this.memory) {
      const ma = F.HUD.fade(this.memoryT, 0.5, 3, 1);
      F.draw.text(ctx, `“${this.memory}”`, F.W / 2, F.H - 48, {
        size: 24, style: 'italic', color, alpha: ma, glow: 10, glowColor: 'rgba(0,0,0,0.6)',
      });
    }

    // Dica
    if (this.hint) {
      const ha = F.HUD.fade(this.hintT, 0.5, 2.5, 1);
      F.draw.text(ctx, this.hint, F.W / 2, 70, { size: 18, style: 'italic', color, alpha: ha * 0.85 });
    }
  }
};
