// ============================================================
//  ARTE: objetos e ícones
// ============================================================
F.Art = F.Art || {};

// Estrela de cinco pontas
F.Art.star = function (ctx, x, y, r, color, rot = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

// Sol com raios ondulados (como na capa do livro, desenhado à mão)
F.Art.sun = function (ctx, x, y, r, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  F.draw.glow(ctx, x, y, r * 3.5, '255,200,80', 0.6);
  ctx.strokeStyle = '#ffc93c';
  ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.16;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 + t * 0.2;
    const len = r * (1.45 + 0.15 * Math.sin(t * 3 + i));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Girassol = ponto de controle. bloom: 0 fechado, 1 aberto.
F.Art.sunflower = function (ctx, x, y, bloom, t) {
  const sway = Math.sin(t * 1.5) * 1.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#4c8a3a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(2, -16, sway, -34);
  ctx.stroke();
  ctx.fillStyle = '#5ea446';
  ctx.beginPath();
  ctx.ellipse(-5, -14, 6, 2.5, 0.6, 0, Math.PI * 2);
  ctx.ellipse(6, -22, 6, 2.5, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(sway, -36);
  if (bloom > 0.05) F.draw.glow(ctx, 0, 0, 30 * bloom, '255,210,80', 0.5 * bloom);
  const petals = 12;
  const pr = 3 + bloom * 6;
  ctx.fillStyle = bloom > 0.05 ? '#ffc423' : '#7aa64c';
  for (let i = 0; i < petals; i++) {
    const a = (i * Math.PI * 2) / petals;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * (3 + pr * 0.6), Math.sin(a) * (3 + pr * 0.6), pr * 0.7, 2, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5a3412';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5 + bloom * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Pote de tinta (recarrega a tinta do Noah)
F.Art.paintPot = function (ctx, x, y, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y + Math.sin(t * 2) * 2);
  const hue = (t * 60) % 360;
  F.draw.glow(ctx, 0, -6, 22, '255,255,255', 0.25);
  ctx.fillStyle = '#d9d4ca';
  F.draw.roundRect(ctx, -6, -12, 12, 12, 2);
  ctx.fill();
  ctx.fillStyle = `hsl(${hue},80%,58%)`;
  ctx.fillRect(-6, -12, 12, 4);
  ctx.beginPath();
  ctx.ellipse(-2, -6, 1.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `hsl(${(hue + 120) % 360},80%,58%)`;
  ctx.beginPath();
  ctx.ellipse(3, -5, 1.3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Amuletos da bíblia da vovó (escudo da Jude)
F.Art.amulet = function (ctx, x, y, kind, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2.4) * 2);
  F.draw.glow(ctx, 0, 0, 22, '180,255,170', 0.35);
  if (kind === 'trevo') {
    ctx.fillStyle = '#3fae52';
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2b7a39';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(2, 6, 0, 9);
    ctx.stroke();
  } else if (kind === 'vidro') {
    ctx.fillStyle = 'rgba(220,40,60,0.85)';
    ctx.beginPath();
    ctx.moveTo(-5, -3); ctx.lineTo(1, -6); ctx.lineTo(6, -1); ctx.lineTo(3, 5); ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-2, -3, 2, 2);
  } else if (kind === 'passaro') {
    // pássaro de bolacha-do-mar
    ctx.fillStyle = '#f1e9d6';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b9ab8a';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 3.5, Math.sin(a) * 3.5);
      ctx.stroke();
    }
  } else {
    // cebola no bolso (contra doenças!)
    ctx.fillStyle = '#c99a5a';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.quadraticCurveTo(7, -1, 0, 6);
    ctx.quadraticCurveTo(-7, -1, 0, -7);
    ctx.fill();
    ctx.strokeStyle = '#8a6232';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(0, 5);
    ctx.stroke();
  }
  ctx.restore();
};

// Coletável do Noah: um "retrato" (telinha com pinceladas)
F.Art.retrato = function (ctx, x, y, t, k = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 1.4) * 0.15);
  ctx.scale(k, k);
  F.draw.glow(ctx, 0, 0, 30, '255,200,120', 0.45);
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(-10, -8, 20, 16);
  ctx.fillStyle = '#fbf6ea';
  ctx.fillRect(-8, -6, 16, 12);
  const cols = ['#e8433b', '#3f7be0', '#f3c632'];
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  cols.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(-6, -3 + i * 3);
    ctx.quadraticCurveTo(0, -6 + i * 3 + Math.sin(t * 3 + i) * 2, 6, -2 + i * 3);
    ctx.stroke();
  });
  ctx.restore();
};

// Coletável da Jude: uma página da bíblia da vovó
F.Art.pagina = function (ctx, x, y, t, k = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 1.3) * 0.25);
  ctx.scale(k, k);
  F.draw.glow(ctx, 0, 0, 32, '255,235,170', 0.5);
  ctx.fillStyle = '#f6eed8';
  ctx.beginPath();
  ctx.moveTo(-8, -10); ctx.lineTo(6, -10); ctx.lineTo(9, -7); ctx.lineTo(9, 10); ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,60,0.55)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-5, -6 + i * 3.5);
    ctx.lineTo(6, -6 + i * 3.5);
    ctx.stroke();
  }
  ctx.fillStyle = '#3fae52';
  ctx.beginPath();
  ctx.arc(5, 7, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Coletável estrela caída (fase 3)
F.Art.fallenStar = function (ctx, x, y, t, k = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  F.draw.glow(ctx, x, y, 34 * k, '200,220,255', 0.55);
  F.Art.star(ctx, x, y, 9 * k, '#fff6c8', t * 0.8);
  F.Art.star(ctx, x, y, 4.5 * k, '#ffffff', t * 0.8);
  ctx.restore();
};

// Coletável raio de sol (fase 5)
F.Art.ray = function (ctx, x, y, t, k = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(t);
  ctx.scale(k, k);
  F.draw.glow(ctx, 0, 0, 30, '255,200,80', 0.6);
  ctx.fillStyle = '#ffc93c';
  ctx.beginPath();
  ctx.moveTo(0, -11); ctx.lineTo(3, 0); ctx.lineTo(0, 11); ctx.lineTo(-3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(Math.PI / 2);
  ctx.fill();
  ctx.restore();
};

// Ícones dos pedaços do mundo (HUD e metas)
F.Art.piece = function (ctx, kind, x, y, s, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (kind === 'arvores') {
    ctx.fillStyle = '#6b4424';
    ctx.fillRect(-1.5, 0, 3, 8);
    ctx.fillStyle = '#4fa24a';
    ctx.beginPath();
    ctx.arc(0, -4, 6, 0, Math.PI * 2);
    ctx.arc(-5, 0, 4.5, 0, Math.PI * 2);
    ctx.arc(5, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'flores') {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + t * 0.3;
      ctx.fillStyle = '#ffc423';
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 3.5, 2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5a3412';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'estrelas') {
    F.Art.star(ctx, -3, -2, 6, '#fff3b0', 0);
    F.Art.star(ctx, 5, 4, 4, '#ffffff', 0.4);
  } else if (kind === 'oceanos') {
    ctx.strokeStyle = '#4fb4e8';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const px = -9 + k * 1.5, py = -4 + i * 4 + Math.sin(k * 0.9 + t * 3) * 1.6;
        k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  } else if (kind === 'sol') {
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= alpha;
    F.Art.sun(ctx, x, y, 6 * s, t);
  }
  ctx.restore();
};

// Nuvem: cinzenta (perigo) ou colorida (pintada pelo Noah — vira plataforma)
F.Art.cloud = function (ctx, x, y, w, h, colored, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  const puffs = [[-w * 0.3, 0, h * 0.55], [0, -h * 0.2, h * 0.7], [w * 0.3, 0, h * 0.55], [-w * 0.1, h * 0.15, h * 0.5], [w * 0.15, h * 0.18, h * 0.5]];
  if (colored) {
    F.draw.glow(ctx, 0, 0, w, '255,220,150', 0.35);
    puffs.forEach(([px, py, r], i) => {
      ctx.fillStyle = `hsl(${(i * 70 + t * 40) % 360},75%,72%)`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    ctx.fillStyle = 'rgba(80,80,92,0.92)';
    puffs.forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.arc(px, py + Math.sin(t * 3 + px) * 1, r, 0, Math.PI * 2);
      ctx.fill();
    });
    // olhinhos tristes
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(-6, -2, 2.4, 3);
    ctx.fillRect(4, -2, 2.4, 3);
    ctx.strokeStyle = '#2a2a30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 6, 3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // garoa cinza
    ctx.strokeStyle = 'rgba(150,150,165,0.5)';
    for (let i = 0; i < 3; i++) {
      const dx = -8 + i * 8, dy = ((t * 30 + i * 7) % 12);
      ctx.beginPath();
      ctx.moveTo(dx, h * 0.5 + dy);
      ctx.lineTo(dx - 1, h * 0.5 + dy + 4);
      ctx.stroke();
    }
  }
  ctx.restore();
};

// Espinhos / rochas pontiagudas
F.Art.thorns = function (ctx, x, y, w, color = '#2c2a33') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const n = Math.max(2, Math.round(w / 10));
  for (let i = 0; i < n; i++) {
    ctx.lineTo(x + (i + 0.5) * (w / n), y - 12);
    ctx.lineTo(x + (i + 1) * (w / n), y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
};

// Meteoro em chamas
F.Art.meteor = function (ctx, x, y, r, vx, vy) {
  const len = 40;
  const sp = Math.hypot(vx, vy) || 1;
  const g = ctx.createLinearGradient(x, y, x - (vx / sp) * len, y - (vy / sp) * len);
  g.addColorStop(0, 'rgba(255,220,140,0.9)');
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.strokeStyle = g;
  ctx.lineWidth = r * 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - (vx / sp) * len, y - (vy / sp) * len);
  ctx.stroke();
  F.draw.glow(ctx, x, y, r * 4, '255,170,80', 0.7);
  ctx.fillStyle = '#5a4a44';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb860';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
};

// Telescópio do Brian
F.Art.telescope = function (ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#3a3a44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(6, -22);
  ctx.moveTo(12, 0); ctx.lineTo(6, -22);
  ctx.moveTo(6, 0); ctx.lineTo(6, -22);
  ctx.stroke();
  ctx.translate(6, -24);
  ctx.rotate(-0.6);
  ctx.fillStyle = '#c9a24a';
  F.draw.roundRect(ctx, -12, -3.5, 28, 7, 2);
  ctx.fill();
  ctx.fillStyle = '#8a6a2a';
  ctx.fillRect(14, -4.5, 4, 9);
  ctx.restore();
};

// A escultura NoaheJude: duas figuras redondas ombro a ombro, olhando o céu.
// split: 0 = juntas, 1 = separadas pela serra (com um vão entre elas)
F.Art.sculptureTwins = function (ctx, x, y, s, split, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const gap = split * 14;
  const stone = (dx, flip) => {
    ctx.save();
    ctx.translate(dx, 0);
    ctx.scale(flip, 1);
    const g = ctx.createLinearGradient(-20, -70, 20, 0);
    g.addColorStop(0, '#f4d9a8');
    g.addColorStop(1, '#b88a52');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(10, -24, 17, 24, 0, 0, Math.PI * 2); // corpo
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -56, 11, 12, -0.3, 0, Math.PI * 2); // cabeça olhando para cima
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,30,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(10, -24, 12, Math.PI * 1.2, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
  };
  stone(-gap, -1);
  stone(gap, 1);
  // base
  ctx.fillStyle = '#6b5a4a';
  ctx.fillRect(-36 - gap, 0, 72 + gap * 2, 8);
  if (split > 0 && split < 1) F.draw.glow(ctx, 0, -30, 40, '255,240,200', 0.8 * (1 - split));
  ctx.restore();
};

// Noah boiando no mar (fim da fase 4)
F.Art.noahFloating = function (ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 1.5) * 2);
  ctx.rotate(-Math.PI / 2 + Math.sin(t) * 0.05);
  F.Art.drawNoah(ctx, 0, 0, { facing: 1, t, closedEyes: true, glide: true, noShadow: true });
  ctx.restore();
};
