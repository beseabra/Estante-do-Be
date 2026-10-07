// ============================================================
//  ARTE: o retrato dela, partido em pedaços
//
//  Entre as fases aparece o rosto dela dentro de um círculo
//  quebrado em 5 cacos. A cada fase vencida, um caco volta
//  para o lugar — colado com ouro, como no kintsugi japonês
//  (a arte de consertar o que quebrou deixando a cicatriz bonita).
// ============================================================
F.Portrait = {
  R: 170, // o retrato é desenhado num círculo de raio 170 e depois escalado

  COLORS: {
    hair: '#120e16', hairShine: 'rgba(170,150,210,0.16)',
    skin: '#fbeee8', skinShade: '#ecd0c6',
    lips: '#c4566f', dress: '#8e1e43', dressDark: '#4f0f28',
    frame: '#1b171f', iris: '#3a2621', gold: '#e9c37b',
  },

  // Cria os 5 cacos (polígonos) uma única vez.
  shards(n = 5) {
    if (this._shards) return this._shards;
    const rnd = F.utils.seeded(4242);
    const R = this.R * 1.04;
    const cx = (rnd() - 0.5) * 24;
    const cy = (rnd() - 0.5) * 24;

    const angles = [];
    for (let i = 0; i < n; i++) angles.push(-Math.PI / 2 + (i * Math.PI * 2) / n + (rnd() - 0.5) * 0.45);

    // Cada "raio" de rachadura é uma linha em zigue-zague do centro até a borda.
    const rays = angles.map((a) => [
      [cx + Math.cos(a + (rnd() - 0.5) * 0.5) * R * 0.33, cy + Math.sin(a + (rnd() - 0.5) * 0.5) * R * 0.33],
      [cx + Math.cos(a + (rnd() - 0.5) * 0.3) * R * 0.68, cy + Math.sin(a + (rnd() - 0.5) * 0.3) * R * 0.68],
      [Math.cos(a) * R, Math.sin(a) * R],
    ]);

    this._shards = angles.map((a, i) => {
      const j = (i + 1) % n;
      let a2 = angles[j];
      if (a2 <= a) a2 += Math.PI * 2;
      const pts = [[cx, cy], ...rays[i]];
      for (let s = 1; s < 12; s++) {
        const aa = a + ((a2 - a) * s) / 12;
        pts.push([Math.cos(aa) * R, Math.sin(aa) * R]);
      }
      pts.push(...rays[j].slice().reverse());
      const mid = (a + a2) / 2;
      return { pts, dir: [Math.cos(mid), Math.sin(mid)] };
    });
    return this._shards;
  },

  path(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  },

  // Desenha o retrato com "done" cacos no lugar.
  // anim = { index, t } faz o caco "index" voar até o lugar.
  drawShattered(ctx, cx, cy, radius, done, anim, t) {
    const k = radius / this.R;
    const shards = this.shards();
    const blink = (t % 4.6) < 0.14;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(k, k);

    F.draw.glow(ctx, 0, 0, this.R * 1.6, '200,60,110', 0.22 + 0.05 * Math.sin(t * 1.5));

    shards.forEach((sh, i) => {
      if (i >= done) {
        // caco que ainda falta: só um vidro escuro
        this.path(ctx, sh.pts);
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,190,215,0.16)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        return;
      }

      let alpha = 1, off = 0;
      if (anim && i === anim.index) {
        const p = F.utils.clamp(anim.t / 1.6, 0, 1);
        const e = F.utils.easeOut(p);
        alpha = e;
        off = (1 - e) * 70;
      }
      if (alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(sh.dir[0] * off, sh.dir[1] * off);
      this.path(ctx, sh.pts);
      ctx.save();
      ctx.clip();
      this.drawBust(ctx, t, blink);
      ctx.restore();
      // bordas de ouro
      this.path(ctx, sh.pts);
      ctx.shadowColor = 'rgba(255,210,140,0.9)';
      ctx.shadowBlur = 8 * F.SCALE * k;
      ctx.strokeStyle = this.COLORS.gold;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  },

  // O busto dela (em coordenadas de um círculo de raio 170).
  drawBust(ctx, t, blink) {
    const C = this.COLORS;
    const sway = Math.sin(t * 0.8) * 2;

    // Fundo rosado
    const bg = ctx.createRadialGradient(0, -30, 10, 0, 0, 190);
    bg.addColorStop(0, '#f7cfd8');
    bg.addColorStop(0.55, '#c45c7c');
    bg.addColorStop(1, '#5a1a37');
    ctx.fillStyle = bg;
    ctx.fillRect(-200, -200, 400, 400);

    // Cabelo de trás (longo, preto)
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.moveTo(-72, -60);
    ctx.bezierCurveTo(-112, 0, -102 + sway, 110, -118 + sway, 195);
    ctx.lineTo(118 + sway, 195);
    ctx.bezierCurveTo(102 + sway, 110, 112, 0, 72, -60);
    ctx.closePath();
    ctx.fill();

    // Ombros e vestido vinho
    const dg = ctx.createLinearGradient(0, 95, 0, 195);
    dg.addColorStop(0, C.dress);
    dg.addColorStop(1, C.dressDark);
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.moveTo(-165, 200);
    ctx.bezierCurveTo(-150, 132, -100, 112, -46, 104);
    ctx.lineTo(46, 104);
    ctx.bezierCurveTo(100, 112, 150, 132, 165, 200);
    ctx.closePath();
    ctx.fill();

    // Pescoço e decote
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(-19, 40);
    ctx.lineTo(-22, 106);
    ctx.quadraticCurveTo(0, 138, 22, 106);
    ctx.lineTo(19, 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.skinShade;
    ctx.beginPath();
    ctx.ellipse(0, 64, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rosto
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(0, -88);
    ctx.bezierCurveTo(44, -88, 60, -50, 58, -10);
    ctx.bezierCurveTo(56, 30, 30, 66, 0, 72);
    ctx.bezierCurveTo(-30, 66, -56, 30, -58, -10);
    ctx.bezierCurveTo(-60, -50, -44, -88, 0, -88);
    ctx.fill();

    // Bochechas coradas
    ctx.fillStyle = 'rgba(235,110,140,0.22)';
    ctx.beginPath();
    ctx.ellipse(-33, 25, 15, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(33, 25, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos
    const eye = (x, side) => {
      if (blink) {
        ctx.strokeStyle = C.frame;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x - 11, 3);
        ctx.quadraticCurveTo(x, 9, x + 11, 3);
        ctx.stroke();
        return;
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x - 12, 2);
      ctx.quadraticCurveTo(x, -8, x + 12, 2);
      ctx.quadraticCurveTo(x, 9, x - 12, 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = C.iris;
      ctx.beginPath();
      ctx.arc(x + 1, 2, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#120c0c';
      ctx.beginPath();
      ctx.arc(x + 1, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 3, -0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // cílios
      ctx.strokeStyle = C.frame;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(x - 13, 2.5);
      ctx.quadraticCurveTo(x, -9, x + 13, 1.5);
      ctx.lineTo(x + side * 16, -1.5);
      ctx.stroke();
    };
    eye(-25, -1);
    eye(25, 1);

    // Sobrancelhas
    ctx.strokeStyle = C.hair;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-38, -21);
    ctx.quadraticCurveTo(-25, -28, -12, -22);
    ctx.moveTo(38, -21);
    ctx.quadraticCurveTo(25, -28, 12, -22);
    ctx.stroke();

    // Nariz
    ctx.strokeStyle = C.skinShade;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 8);
    ctx.quadraticCurveTo(6, 24, -1, 28);
    ctx.stroke();

    // Lábios (um sorriso pequeno)
    ctx.fillStyle = C.lips;
    ctx.beginPath();
    ctx.moveTo(-13, 44);
    ctx.quadraticCurveTo(-6, 38.5, 0, 41);
    ctx.quadraticCurveTo(6, 38.5, 13, 44);
    ctx.quadraticCurveTo(0, 52, -13, 44);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,30,50,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, 44);
    ctx.quadraticCurveTo(0, 46.5, 12, 44);
    ctx.stroke();

    // Óculos
    ctx.strokeStyle = C.frame;
    ctx.lineWidth = 3.4;
    [-25, 25].forEach((x) => {
      ctx.beginPath();
      ctx.ellipse(x, 2, 21, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,0.32)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 16, -4);
      ctx.lineTo(x - 4, -16);
      ctx.moveTo(x - 10, 4);
      ctx.lineTo(x + 2, -8);
      ctx.stroke();
      ctx.restore();
    });
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(0, -7, 4, -2);
    ctx.moveTo(-46, -2);
    ctx.lineTo(-58, -6);
    ctx.moveTo(46, -2);
    ctx.lineTo(58, -6);
    ctx.stroke();

    // Franja e mechas que emolduram o rosto
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.moveTo(-62, 40);
    ctx.bezierCurveTo(-74, -40, -50, -102, 0, -104);
    ctx.bezierCurveTo(50, -102, 74, -40, 62, 40);
    ctx.bezierCurveTo(58, 0, 57, -28, 50, -38);
    // franja em ondinhas suaves
    for (let x = 50; x > -50; x -= 20) ctx.quadraticCurveTo(x - 10, -29, x - 20, -40);
    ctx.bezierCurveTo(-57, -28, -58, 0, -62, 40);
    ctx.closePath();
    ctx.fill();

    // Mechas longas caindo pelos ombros
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(s * 58, 20);
      ctx.bezierCurveTo(s * 70, 70, s * 66 + sway, 120, s * 80 + sway, 175);
      ctx.lineTo(s * 96 + sway, 175);
      ctx.bezierCurveTo(s * 86, 110, s * 80, 50, s * 64, 0);
      ctx.closePath();
      ctx.fill();
    });

    // Brilho no cabelo
    ctx.strokeStyle = C.hairShine;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, -36, 58, Math.PI * 1.22, Math.PI * 1.5);
    ctx.stroke();
  },
};
