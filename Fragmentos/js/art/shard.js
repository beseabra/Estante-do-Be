// ============================================================
//  ARTE: o cristal (um "fragmento" dela)
// ============================================================
F.Art = F.Art || {};

// Desenha um caco de cristal brilhante centrado em (x, y).
// colors = { light, mid, dark, glow }  (glow no formato '255,200,220')
F.Art.shard = function (ctx, x, y, s, rot, colors, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;

  F.draw.glow(ctx, 0, 0, s * 2.8, colors.glow, 0.55);

  const pts = [[0, -1.15], [0.6, -0.25], [0.38, 0.9], [-0.42, 0.65], [-0.62, -0.3]];
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s)));
  ctx.closePath();
  const g = ctx.createLinearGradient(-s, -s, s, s);
  g.addColorStop(0, colors.light);
  g.addColorStop(0.5, colors.mid);
  g.addColorStop(1, colors.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Facetas (linhas internas que dão a ideia de cristal)
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(0, -1.15 * s);
  ctx.lineTo(0.05 * s, 0.15 * s);
  ctx.lineTo(0.38 * s, 0.9 * s);
  ctx.moveTo(0.05 * s, 0.15 * s);
  ctx.lineTo(-0.62 * s, -0.3 * s);
  ctx.stroke();

  ctx.restore();
};

// Um fio vermelho — o "fio do destino" — que sai da mão dele.
// Se o alvo estiver longe, o fio vai sumindo, só apontando o caminho.
F.Art.thread = function (ctx, x1, y1, x2, y2, t, maxLen = 170, alpha = 1) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy) || 1;
  const L = Math.min(d, maxLen);
  const ux = dx / d, uy = dy / d;
  const nx = -uy, ny = ux;
  const reaches = d <= maxLen;
  const seg = 26;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4;
  let px = x1, py = y1;
  for (let i = 1; i <= seg; i++) {
    const k = i / seg;
    const s = k * L;
    const wave = Math.sin(k * 8 - t * 3) * 5 * k * (reaches ? 1 - k : 1);
    const sag = reaches ? Math.sin(k * Math.PI) * Math.min(18, d * 0.12) : 0;
    const x = x1 + ux * s + nx * wave;
    const y = y1 + uy * s + ny * wave + sag;
    const a = (reaches ? 0.9 : 0.9 * (1 - k)) * alpha;
    ctx.strokeStyle = `rgba(225,30,72,${a})`;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.stroke();
    px = x;
    py = y;
  }
  ctx.restore();
};
