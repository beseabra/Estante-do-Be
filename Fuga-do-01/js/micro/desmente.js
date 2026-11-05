// ============================================================
//  DESMENTE! (mouse) Fake news pipocam na tela: clique em todas.
// ============================================================
G.Micro.registra({
  id: 'desmente', verbo: 'DESMENTE!', dica: 'clique em todas as fake news', controle: 'mouse', dur: 5, cor: '#0b8f6e',
  criar({ nivel }) {
    const vagas = [];
    for (const x of [200, 480, 760]) for (const y of [160, 300, 440]) vagas.push({ x, y });
    vagas.sort(() => Math.random() - 0.5);
    const manchetes = [...G.FAKES].sort(() => Math.random() - 0.5);
    const n = 3 + nivel;
    const bolhas = [];
    for (let i = 0; i < n; i++) bolhas.push({ ...vagas[i], txt: manchetes[i % manchetes.length], t: -i * 0.4, estourou: 0 });
    return {
      t: 0, venceu: null, part: [],
      update(dt, inp) {
        this.t += dt;
        for (const b of bolhas) {
          b.t += dt;
          if (b.estourou) b.estourou += dt;
          if (b.t > 0 && !b.estourou && G.clicou(inp, { x: b.x - 130, y: b.y - 42, w: 260, h: 84 })) {
            b.estourou = 0.001;
            G.Audio.tocar('acerto');
            for (let k = 0; k < 12; k++) this.part.push({ x: b.x, y: b.y, vx: G.U.rand(-300, 300), vy: G.U.rand(-300, 100), v: 0.6 });
          }
        }
        for (const p of this.part) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 800 * dt; p.v -= dt; }
        this.part = this.part.filter((p) => p.v > 0);
        if (bolhas.every((b) => b.estourou)) this.venceu = true;
      },
      draw(ctx) {
        G.fundoLiso(ctx, '#0b8f6e');
        for (const b of bolhas) {
          if (b.t <= 0) continue;
          const s = Math.min(1, G.U.ease(b.t * 4)) * (b.estourou ? Math.max(0, 1 - b.estourou * 2) : 1);
          if (s <= 0) continue;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.scale(s, s);
          ctx.fillStyle = '#dcf8c6';
          G.retRedondo(ctx, -130, -42, 260, 84, 14); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-110, 40); ctx.lineTo(-124, 56); ctx.lineTo(-92, 40); ctx.fill();
          G.texto(ctx, '↪ Encaminhada com frequência', -116, -22, { size: 11, color: '#6a8a7a' });
          G.quebra(ctx, b.txt, 230, 16).slice(0, 2).forEach((l, i) => G.texto(ctx, l, -116, 2 + i * 20, { size: 16, color: '#111', weight: 900 }));
          if (b.estourou) {
            ctx.rotate(-0.2);
            ctx.strokeStyle = '#d11f2b'; ctx.lineWidth = 5; ctx.strokeRect(-100, -24, 200, 44);
            G.texto(ctx, 'DESMENTIDO', 0, 12, { size: 30, font: G.FONTE_TITULO, align: 'center', color: '#d11f2b' });
          }
          ctx.restore();
        }
        for (const p of this.part) { ctx.fillStyle = '#dcf8c6'; ctx.fillRect(p.x, p.y, 6, 6); }
      },
    };
  },
});
