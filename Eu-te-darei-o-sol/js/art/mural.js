// ============================================================
//  ARTE: o mural
//  Entre as fases aparece um muro de concreto. A cada capítulo
//  vencido, o Noah pinta um painel nele — pincelada por pincelada.
//  Os dez painéis juntos contam a história dos gêmeos.
// ============================================================
F.Mural = {
  // Cada painel é desenhado em coordenadas locais (0..w, 0..h).
  panels: [
    // 0 — As árvores: Noah correndo de braços abertos no bosque
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#bfe6a8'); g.addColorStop(1, '#3f8a46');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(255,240,170,${0.18 + (i % 2) * 0.1})`;
        ctx.beginPath(); ctx.moveTo(w * 0.7, -10); ctx.lineTo(w * (0.05 + i * 0.16), h); ctx.lineTo(w * (0.12 + i * 0.16), h); ctx.fill();
      }
      [[0.12, 0.55, '#2f6a35'], [0.85, 0.5, '#2a5f30'], [0.5, 0.35, '#3d7f3e']].forEach(([px, py, c]) => {
        ctx.fillStyle = '#5b3a20'; ctx.fillRect(w * px - 4, h * py, 8, h);
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(w * px, h * py, w * 0.18, 0, Math.PI * 2); ctx.fill();
      });
      F.Art.drawNoah(ctx, w * 0.5, h * 0.92, { facing: 1, t, glide: true, air: true, noShadow: true, scale: 1 });
    },
    // 1 — As flores: Jude e a vovó na neblina, com girassóis
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#d9dde6'); g.addColorStop(1, '#8e97a8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 7; i++) F.Art.sunflower(ctx, w * (0.08 + i * 0.14), h * (0.98 - (i % 2) * 0.04), 1, t + i);
      F.Art.drawJude(ctx, w * 0.35, h * 0.86, { facing: 1, t });
      F.Art.drawVovo(ctx, w * 0.7, h * 0.78, { facing: -1, t, alpha: 0.9 });
    },
    // 2 — As estrelas: dois meninos no telhado e uma mala derramando estrelas
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0b0a26'); g.addColorStop(1, '#3a2a6a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const rnd = F.utils.seeded(7);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.4 + rnd() * 0.6})`;
        ctx.fillRect(rnd() * w, rnd() * h * 0.7, 1.5, 1.5);
      }
      F.Art.star(ctx, w * 0.3, h * 0.2, 5, '#fff3b0');
      F.Art.star(ctx, w * 0.42, h * 0.16, 5, '#fff3b0');
      ctx.fillStyle = '#1c1830';
      ctx.beginPath(); ctx.moveTo(0, h * 0.82); ctx.lineTo(w * 0.5, h * 0.7); ctx.lineTo(w, h * 0.82); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
      F.Art.drawNoah(ctx, w * 0.36, h * 0.8, { facing: 1, t, headTilt: -0.3 });
      F.Art.drawBrian(ctx, w * 0.6, h * 0.79, { facing: -1, t, headTilt: -0.15 });
      F.Art.telescope(ctx, w * 0.75, h * 0.81);
    },
    // 3 — As conchas: Jude esculpindo mulheres de areia antes da maré
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#f7c6a0'); g.addColorStop(0.55, '#9ab8d8'); g.addColorStop(1, '#e8c890');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5a8ac0'; ctx.fillRect(0, h * 0.5, w, h * 0.18);
      ctx.fillStyle = '#e8c890'; ctx.fillRect(0, h * 0.68, w, h);
      F.Art.sandWoman(ctx, w * 0.62, h * 0.95, 34, 1, 0, t);
      F.Art.drawJude(ctx, w * 0.3, h * 0.92, { facing: 1, t, act: 0.6 });
    },
    // 4 — As cores: Noah na galeria da escola, entre quadros
    (ctx, w, h, t) => {
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b8a890'; ctx.fillRect(0, h * 0.8, w, h);
      F.Art.frame(ctx, w * 0.2, h * 0.8, 'a', t, false);
      F.Art.frame(ctx, w * 0.8, h * 0.8, 'd', t, true);
      F.Art.drawNoah(ctx, w * 0.5, h * 0.92, { facing: 1, t, act: 0.5 });
    },
    // 5 — Os oceanos: Jude tirando Noah das ondas
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#f4a07a'); g.addColorStop(0.5, '#7a5a9a'); g.addColorStop(1, '#1e3a6a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2b5f9a';
      ctx.beginPath(); ctx.moveTo(0, h * 0.6);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h * 0.6 + Math.sin(x * 0.08 + t * 2) * 5);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
      F.Art.noahFloating(ctx, w * 0.52, h * 0.66, t);
      F.Art.drawJude(ctx, w * 0.3, h * 0.72, { facing: 1, t, reach: true, air: true, noShadow: true });
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let x = 0; x < w; x += 14) ctx.fillRect(x, h * 0.6 + Math.sin(x * 0.08 + t * 2) * 5 - 1, 7, 2);
    },
    // 6 — Os pássaros: o retrato da mamãe, a alma de girassol
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#9ac8f0'); g.addColorStop(1, '#ffe0a0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(w * 0.5, h * 0.96); ctx.scale(0.55, 0.55);
      F.Art.maePainting(ctx, 0, 0, t, 1);
      ctx.restore();
      for (let i = 0; i < 5; i++) F.Art.bird(ctx, w * (0.15 + i * 0.17), h * (0.18 + (i % 2) * 0.1), 1, t + i);
    },
    // 7 — As pedras: Jude e o anjo de pedra no ateliê
    (ctx, w, h, t) => {
      ctx.fillStyle = '#3a2e28'; ctx.fillRect(0, 0, w, h);
      F.draw.glow(ctx, w * 0.6, h * 0.4, w * 0.5, '255,200,140', 0.3);
      ctx.fillStyle = '#b8b0a4';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h); ctx.lineTo(w * 0.55, h * 0.4); ctx.lineTo(w * 0.7, h * 0.4); ctx.lineTo(w * 0.75, h); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.62, h * 0.32, w * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.45); ctx.quadraticCurveTo(w * 0.35, h * 0.2, w * 0.45, h * 0.6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.69, h * 0.45); ctx.quadraticCurveTo(w * 0.9, h * 0.2, w * 0.8, h * 0.6); ctx.fill();
      F.Art.drawJude(ctx, w * 0.3, h * 0.94, { facing: 1, t, act: 0.7 });
      F.Art.drawOscar(ctx, w * 0.9, h * 0.94, { facing: -1, t });
    },
    // 8 — As metades: a escultura dos gêmeos, finalmente partida
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#8a6a4e'); g.addColorStop(1, '#c09a6e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      F.Art.sculptureTwins(ctx, w * 0.5, h * 0.95, 0.9, 1, t);
    },
    // 9 — O sol: os gêmeos de costas, os cabelos virando um rio de luz e escuridão
    (ctx, w, h, t) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#ffd27a'); g.addColorStop(0.6, '#ff8a5a'); g.addColorStop(1, '#a8406a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      F.Art.sun(ctx, w * 0.5, h * 0.4, w * 0.12, t);
      F.Mural.hairRiver(ctx, w * 0.5, h * 0.62, w, h, t, 0.8);
      F.Art.drawTwinsBack(ctx, w * 0.5, h * 0.98, 1.6, t, true);
    },
  ],

  // Dois rios de cabelo (escuro e dourado) que se entrelaçam até o céu
  hairRiver(ctx, x, y, w, h, t, a = 1) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.lineCap = 'round';
    [['rgba(30,22,40,0.85)', 0], ['rgba(255,214,110,0.9)', Math.PI]].forEach(([c, ph]) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = Math.max(4, w * 0.035);
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) {
        const p = k / 30;
        const px = x + Math.sin(p * 9 + t + ph) * w * 0.14 * p;
        const py = y - p * h * 0.6;
        k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    });
    ctx.restore();
  },

  // Desenha o muro com "done" painéis pintados; anim = { index, t } revela um painel
  draw(ctx, x, y, w, h, done, anim, t) {
    const n = this.panels.length;
    const cols = Math.ceil(n / 2), pad = 8;   // duas fileiras de painéis
    const pw = (w - pad * (cols + 1)) / cols;
    const ph = (h - pad * 3) / 2;

    // concreto
    ctx.fillStyle = '#8a8478';
    ctx.fillRect(x, y, w, h);
    const rnd = F.utils.seeded(99);
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,255,255'},${rnd() * 0.08})`;
      ctx.fillRect(x + rnd() * w, y + rnd() * h, 2 + rnd() * 4, 2 + rnd() * 3);
    }

    for (let i = 0; i < n; i++) {
      const px = x + pad + (i % cols) * (pw + pad), py = y + pad + Math.floor(i / cols) * (ph + pad);
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      if (i < done) {
        let reveal = 1;
        if (anim && anim.index === i) reveal = F.utils.clamp(anim.t / 2.2, 0, 1);
        if (reveal < 1) {
          // máscara de pinceladas: círculos que vão aparecendo
          ctx.beginPath();
          const r2 = F.utils.seeded(i * 31 + 5);
          const count = Math.floor(reveal * 90);
          for (let k = 0; k < count; k++) {
            const cx = px + r2() * pw, cy = py + r2() * ph, rr = 10 + r2() * 26;
            ctx.moveTo(cx + rr, cy);
            ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          }
          ctx.clip();
        }
        ctx.translate(px, py);
        this.panels[i](ctx, pw, ph, t);
      } else {
        // painel ainda vazio: rascunho a giz
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.setLineDash([4, 5]);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
        ctx.setLineDash([]);
        F.draw.text(ctx, '?', px + pw / 2, py + ph / 2, { size: 30, font: F.HAND, color: 'rgba(255,255,255,0.3)' });
      }
      ctx.restore();
    }
  },
};
