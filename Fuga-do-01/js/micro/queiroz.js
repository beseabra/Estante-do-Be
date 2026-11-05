// ============================================================
//  CADÊ O QUEIROZ? (mouse) Ele pula das moitas. Clique nele
//  (no gnomo não adianta).
// ============================================================
G.Micro.registra({
  id: 'queiroz', verbo: 'CADÊ O QUEIROZ?', dica: 'clique no Queiroz quando ele aparecer', controle: 'mouse', dur: 5, cor: '#1a2a5a',
  somVitoria: 'queiroz',
  criar({ nivel }) {
    const moitas = [];
    for (let i = 0; i < 6; i++) moitas.push({ x: 200 + (i % 3) * 280, y: 290 + Math.floor(i / 3) * 170, quem: null, t: 0 });
    const precisa = 2 + Math.min(1, nivel);
    return {
      t: 0, venceu: null, achou: 0, prox: 0.3,
      update(dt, inp) {
        this.t += dt;
        this.prox -= dt;
        if (this.prox <= 0) {
          const livres = moitas.filter((m) => !m.quem);
          const m = G.U.pick(livres);
          m.quem = Math.random() < 0.65 ? 'queiroz' : 'gnomo';
          m.t = 0;
          m.dura = 0.85 - nivel * 0.12;
          this.prox = 0.55 - nivel * 0.08;
        }
        for (const m of moitas) {
          if (!m.quem) continue;
          m.t += dt;
          if (m.t > m.dura) m.quem = null;
          else if (m.quem === 'queiroz' && G.clicou(inp, { x: m.x - 50, y: m.y - 120, w: 100, h: 130 })) {
            m.quem = 'achado';
            m.t = 0;
            this.achou++;
            G.Audio.tocar('acerto');
            if (this.achou >= precisa) this.venceu = true;
          }
        }
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#1a2a5a');
        ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(840, 80, 34, 0, Math.PI * 2); ctx.fill();
        G.texto(ctx, `ACHOU: ${this.achou}/${precisa}`, G.W / 2, 90, { size: 28, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 6 });
        for (const m of moitas) {
          if (m.quem) {
            const sobe = m.quem === 'achado' ? 1 : Math.min(1, m.t * 6, (m.dura - m.t) * 6);
            ctx.save();
            ctx.beginPath(); ctx.rect(m.x - 80, m.y - 170, 160, 170); ctx.clip();
            if (m.quem === 'gnomo') G.OBST_GNOMO(ctx, m.x, m.y + 70 - sobe * 80);
            else G.Arte.boneco(ctx, 'queiroz', m.x, m.y + 110 - sobe * 150, { t, pose: m.quem === 'achado' ? 'comemora' : 'danca', semSombra: true });
            ctx.restore();
          }
          // a moita (na frente)
          ctx.fillStyle = '#1f6a2e';
          ctx.beginPath(); ctx.arc(m.x - 40, m.y - 4, 34, 0, Math.PI * 2); ctx.arc(m.x, m.y - 22, 42, 0, Math.PI * 2); ctx.arc(m.x + 40, m.y - 4, 34, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(m.x - 72, m.y - 6, 144, 30);
          if (m.quem === 'achado') G.texto(ctx, 'ACHEI!', m.x, m.y - 130, { size: 24, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 5 });
        }
      },
    };
  },
});

// gnomo de jardim (o "falso Queiroz")
G.OBST_GNOMO = function (ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.6, 1.6);
  ctx.fillStyle = '#2b5fd0'; ctx.fillRect(-11, -24, 22, 24);
  ctx.fillStyle = '#f1c4a2'; ctx.beginPath(); ctx.arc(0, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-8, -26); ctx.lineTo(0, -10); ctx.lineTo(8, -26); ctx.fill();
  ctx.fillStyle = '#d11f2b'; ctx.beginPath(); ctx.moveTo(-10, -32); ctx.lineTo(0, -54); ctx.lineTo(10, -32); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(-7, -31, 14, 4);
  ctx.restore();
};
