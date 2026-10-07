// ============================================================
//  ARTE: extras dos capítulos novos
//    Oscar, mulheres de areia, molduras-portal da escola de artes,
//    o quadro da mamãe, pássaros, pedras e os novos pedaços do mundo.
// ============================================================

// ---------- OSCAR: cabelo escuro bagunçado, jaqueta de couro, câmera ----------
F.Art.LOOKS.oscar = {
  skin: '#ecc9ae', skinShade: '#d6aa8e', hair: '#2a1d16', hairShine: '#5a4232',
  eye: '#4a3020', shirt: '#24222a', shirtShade: '#18171d', pants: '#3a3f52', pantsDark: '#2c3040', shoe: '#1e1a18',
};

F.Art.drawOscar = function (ctx, x, y, o = {}) {
  const C = F.Art.LOOKS.oscar;
  F.Art.kid(ctx, x, y, o, C, (ctx, C, hy) => {
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.arc(0.5, hy - 1.5, 9.6, Math.PI * 0.9, Math.PI * 2.05);
    ctx.fill();
    // mechas caindo na testa
    ctx.beginPath();
    ctx.moveTo(-2, hy - 8);
    ctx.quadraticCurveTo(6, hy - 6, 9, hy + 1);
    ctx.lineTo(5, hy - 3);
    ctx.lineTo(3, hy + 0.5);
    ctx.lineTo(1, hy - 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, hy);
    ctx.lineTo(-10, hy + 6);
    ctx.lineTo(-6, hy + 2);
    ctx.fill();
  }, {
    blink: 0.9,
    longTorso: true,
    torso(ctx) {
      // gola da jaqueta e câmera pendurada
      ctx.strokeStyle = '#3a3640';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -29); ctx.lineTo(0, -22); ctx.lineTo(5, -29);
      ctx.stroke();
      ctx.fillStyle = '#8a8f99';
      ctx.fillRect(-2, -20, 7, 5);
      ctx.fillStyle = '#2a2a30';
      ctx.beginPath();
      ctx.arc(1.5, -17.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
    },
  });
};

// ---------- MULHER DE AREIA (escultura da Jude, vira degrau) ----------
// build: 0..1 (sendo esculpida)  crumble: 0..1 (o mar levando)
F.Art.sandWoman = function (ctx, x, y, h, build, crumble, t) {
  if (build <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  const k = build * (1 - crumble);
  ctx.beginPath();
  ctx.rect(-40, -h * k - 6, 80, h * k + 8);
  ctx.clip();
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, '#f6dcae');
  g.addColorStop(1, '#c99a66');
  ctx.fillStyle = g;
  // corpo deitado de lado, braços abertos formando o topo
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.quadraticCurveTo(-34, -h * 0.5, -22, -h * 0.9);
  ctx.lineTo(-30, -h);
  ctx.lineTo(30, -h);
  ctx.lineTo(22, -h * 0.9);
  ctx.quadraticCurveTo(34, -h * 0.5, 30, 0);
  ctx.closePath();
  ctx.fill();
  // cabeça e cabelos ao vento
  ctx.beginPath();
  ctx.arc(0, -h * 0.72, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,40,0.45)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 4, -h * 0.72 - 6);
    ctx.quadraticCurveTo(-14 + i * 4, -h * 0.85, -20 + i * 6 + Math.sin(t * 2 + i) * 2, -h * 0.95);
    ctx.stroke();
  }
  // seios/barriga em relevo, conchas como olhos
  ctx.beginPath();
  ctx.arc(-6, -h * 0.45, 5, 0, Math.PI);
  ctx.arc(6, -h * 0.45, 5, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#fff4ea';
  ctx.beginPath();
  ctx.arc(-3, -h * 0.73, 1.2, 0, Math.PI * 2);
  ctx.arc(3, -h * 0.73, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Monte de areia ainda sem escultura
F.Art.sandMound = function (ctx, x, y, t, ready) {
  ctx.fillStyle = '#d9b07a';
  ctx.beginPath();
  ctx.ellipse(x, y, 32, 12, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  if (ready) F.draw.sparkle(ctx, x, y - 22 + Math.sin(t * 3) * 3, 5, 0.6 + 0.4 * Math.sin(t * 4), '255,230,170');
};

// ---------- MOLDURA-PORTAL (escola de artes) ----------
F.FRAME_ART = {
  a: (ctx, w, h, t) => { // girassóis
    ctx.fillStyle = '#3a6ab0'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) F.Art.sunflower(ctx, 8 + i * 12, h - 2, 1, t + i);
  },
  b: (ctx, w, h, t) => { // mar
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f4a07a'); g.addColorStop(1, '#2b5f9a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) ctx.lineTo(x, h * 0.55 + i * 7 + Math.sin(x * 0.3 + t * 3 + i) * 1.5);
      ctx.stroke();
    }
  },
  c: (ctx, w, h, t) => { // estrelas
    ctx.fillStyle = '#141040'; ctx.fillRect(0, 0, w, h);
    F.Art.star(ctx, w * 0.3, h * 0.35, 4, '#fff3b0', t);
    F.Art.star(ctx, w * 0.65, h * 0.55, 3, '#fff', -t);
  },
  d: (ctx, w, h, t) => { // árvore em chamas (a alma que os gêmeos dividem)
    ctx.fillStyle = '#2a2018'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5b3a20'; ctx.fillRect(w / 2 - 2, h * 0.5, 4, h * 0.5);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = `hsl(${10 + i * 6},90%,${50 + (i % 3) * 8}%)`;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.sin(i * 2) * 8, h * 0.42 - (i % 3) * 5 + Math.sin(t * 5 + i) * 1.5, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

F.Art.frame = function (ctx, x, y, kind, t, glow) {
  const w = 40, h = 52;
  const fx = x - w / 2, fy = y - h - 22;
  if (glow) F.draw.glow(ctx, x, fy + h / 2, 50, '255,220,150', 0.35 + 0.15 * Math.sin(t * 3));
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, w, h);
  ctx.clip();
  ctx.translate(fx, fy);
  (F.FRAME_ART[kind] || F.FRAME_ART.a)(ctx, w, h, t);
  ctx.restore();
  ctx.strokeStyle = '#d8a83a';
  ctx.lineWidth = 4;
  ctx.strokeRect(fx - 2, fy - 2, w + 4, h + 4);
  ctx.strokeStyle = '#8a6020';
  ctx.lineWidth = 1;
  ctx.strokeRect(fx - 4, fy - 4, w + 8, h + 8);
  // cavalete
  ctx.strokeStyle = '#6b4a30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, fy + h + 2); ctx.lineTo(x - 18, y);
  ctx.moveTo(x + 12, fy + h + 2); ctx.lineTo(x + 18, y);
  ctx.stroke();
};

// ---------- O QUADRO DA MAMÃE (fim do capítulo "A Mãe") ----------
// reveal 0..1: da "cor cega" (cinza) até cheia de cor
F.Art.maePainting = function (ctx, x, y, t, reveal) {
  const w = 110, h = 140;
  const fx = x - w / 2, fy = y - h - 30;
  F.draw.glow(ctx, x, fy + h / 2, 140, '255,200,110', 0.15 + 0.45 * reveal);
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, w, h);
  ctx.clip();
  ctx.fillStyle = '#5a5a62';
  ctx.fillRect(fx, fy, w, h);
  ctx.globalAlpha = reveal;
  const g = ctx.createLinearGradient(0, fy, 0, fy + h);
  g.addColorStop(0, '#7ab8e8'); g.addColorStop(1, '#f4c27a');
  ctx.fillStyle = g;
  ctx.fillRect(fx, fy, w, h);
  ctx.globalAlpha = 1;
  // a mamãe: cabelos escuros soltos, vestido, e um girassol enorme no peito
  const cx = x, cy = fy + h * 0.55;
  ctx.fillStyle = reveal > 0.5 ? '#2a1a22' : '#2e2e34';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 36, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = reveal > 0.5 ? '#f1d3bd' : '#9a9aa0';
  ctx.beginPath();
  ctx.arc(cx, cy - 34, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = reveal > 0.5 ? '#c8406a' : '#6a6a72';
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 20);
  ctx.quadraticCurveTo(cx - 30, cy + 40, cx - 26, cy + 60);
  ctx.lineTo(cx + 26, cy + 60);
  ctx.quadraticCurveTo(cx + 30, cy + 40, cx + 14, cy - 20);
  ctx.fill();
  ctx.save();
  ctx.translate(cx, cy + 6);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 + t * 0.2;
    ctx.fillStyle = reveal > 0.3 ? '#ffc423' : '#8a8a8a';
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 11, Math.sin(a) * 11, 7, 3.4, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5a3412';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = '#d8a83a';
  ctx.lineWidth = 5;
  ctx.strokeRect(fx - 2, fy - 2, w + 4, h + 4);
  ctx.strokeStyle = '#6b4a30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 30, fy + h + 2); ctx.lineTo(x - 40, y);
  ctx.moveTo(x + 30, fy + h + 2); ctx.lineTo(x + 40, y);
  ctx.moveTo(x, fy + h + 2); ctx.lineTo(x, y);
  ctx.stroke();
};

// ---------- pássaro (silhueta em "v" batendo asas) ----------
F.Art.bird = function (ctx, x, y, s, t, color = '#2a2430') {
  const f = Math.sin(t * 9) * 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 2 * s + f * 4 * s);
  ctx.quadraticCurveTo(x - 3 * s, y - 3 * s, x, y);
  ctx.quadraticCurveTo(x + 3 * s, y - 3 * s, x + 6 * s, y - 2 * s + f * 4 * s);
  ctx.stroke();
};

// ---------- novos pedaços do mundo ----------
(function () {
  const base = F.Art.piece;
  const extra = {
    conchas(ctx, t) {
      ctx.fillStyle = '#ffd2b8';
      ctx.beginPath();
      ctx.moveTo(0, 6);
      for (let i = 0; i <= 6; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8 + 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d8805a';
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 6; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8 + 2); ctx.stroke();
      }
    },
    cores(ctx, t) {
      ctx.fillStyle = '#c89a62';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ['#e8433b', '#3f7be0', '#f3c632', '#3fbf7a'].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(-5 + i * 3.4, -2 + (i % 2) * 3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    passaros(ctx, t) {
      F.Art.bird(ctx, -3, 0, 1.1, t, '#3a3a50');
      F.Art.bird(ctx, 5, -4, 0.8, t + 1, '#3a3a50');
    },
    pedras(ctx) {
      ctx.fillStyle = '#9a9488';
      ctx.beginPath();
      ctx.ellipse(-2, 2, 7, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6e6a62';
      ctx.beginPath();
      ctx.ellipse(5, -2, 4, 3.4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    },
    metades(ctx, t) {
      const gap = 1.5 + Math.sin(t * 2) * 0.8;
      ctx.fillStyle = '#ffd36b';
      ctx.beginPath(); ctx.arc(-gap, 0, 7, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      ctx.fillStyle = '#2a1e2a';
      ctx.beginPath(); ctx.arc(gap, 0, 7, -Math.PI / 2, Math.PI / 2); ctx.fill();
    },
  };
  F.Art.piece = function (ctx, kind, x, y, s, t, alpha = 1) {
    if (!extra[kind]) return base(ctx, kind, x, y, s, t, alpha);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    extra[kind](ctx, t);
    ctx.restore();
  };
})();
