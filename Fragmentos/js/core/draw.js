// ============================================================
//  AJUDANTES DE DESENHO
//  Formas que aparecem em vários lugares: coração, brilho, texto...
// ============================================================
F.draw = {
  // Coração centralizado em (x, y). "s" é o tamanho aproximado.
  heart(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.5);
    ctx.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.5, y - s * 0.9, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.9, x + s, y - s * 0.1, x, y + s * 0.5);
    ctx.fill();
  },

  // Halo de luz suave. "rgb" é uma string tipo '255,200,220'.
  glow(ctx, x, y, r, rgb, alpha = 1) {
    if (alpha <= 0 || r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(0.4, `rgba(${rgb},${alpha * 0.35})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  },

  // Retângulo com cantos arredondados (só cria o caminho).
  roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  // Estrelinha de quatro pontas (brilho).
  sparkle(ctx, x, y, s, alpha = 1, rgb = '255,255,255') {
    if (alpha <= 0) return;
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
  },

  // Texto com a fonte do jogo.
  // Opções: size, style ('italic'), weight, color, align, alpha, spacing, glow
  text(ctx, str, x, y, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0) return;
    ctx.save();
    ctx.font = `${o.style || 'normal'} ${o.weight || 400} ${o.size || 20}px ${F.FONT}`;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    ctx.globalAlpha *= alpha;
    if ('letterSpacing' in ctx) ctx.letterSpacing = (o.spacing || 0) + 'px';
    if (o.glow) {
      ctx.shadowColor = o.glowColor || 'rgba(255,170,200,0.8)';
      ctx.shadowBlur = o.glow * F.SCALE;
    }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
    ctx.restore();
  },

  // Escurece as bordas da tela (deixa tudo mais íntimo).
  vignette(ctx, strength = 0.45, rgb = '15,0,12') {
    const g = ctx.createRadialGradient(F.W / 2, F.H / 2, F.H * 0.3, F.W / 2, F.H / 2, F.H * 0.95);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(1, `rgba(${rgb},${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, F.W, F.H);
  },
};
