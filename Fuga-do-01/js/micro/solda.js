// ============================================================
//  TIRA O FERRO DE SOLDA! (mouse) O ferro vai chegando perto da
//  tornozeleira. Clique nele para afastar.
// ============================================================
G.Micro.registra({
  id: 'solda', verbo: 'TIRA O FERRO DE SOLDA!', dica: 'clique no ferro antes que ele chegue na tornozeleira', controle: 'mouse', dur: 5.5, cor: '#3a4a3a',
  somVitoria: 'taokey',
  criar({ nivel }) {
    const alvo = { x: 330, y: 438 }; // a tornozeleira
    const precisa = 3 + Math.min(1, nivel);
    const vel = 150 + nivel * 50;
    const longe = () => ({ x: G.U.rand(620, 880), y: G.U.rand(130, 400) });
    return {
      t: 0, venceu: null, tirou: 0, ferro: longe(), faisca: 0,
      update(dt, inp) {
        this.t += dt;
        if (this.venceu !== null) return;
        const f = this.ferro;
        const dx = alvo.x - f.x, dy = alvo.y - f.y, d = Math.hypot(dx, dy);
        const v = vel + this.tirou * 30;
        f.x += dx / d * v * dt + Math.sin(this.t * 7) * 40 * dt;
        f.y += dy / d * v * dt + Math.cos(this.t * 5) * 60 * dt;
        if (G.clicou(inp, { x: f.x - 50, y: f.y - 40, w: 120, h: 80 })) {
          this.tirou++;
          this.ferro = longe();
          G.Audio.tocar('acerto');
          if (this.tirou >= precisa) this.venceu = true;
        } else if (d < 26) { this.venceu = false; this.faisca = 1; G.Audio.tocar('explode'); }
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#3a4a3a');
        G.texto(ctx, `AFASTOU: ${this.tirou}/${precisa}`, G.W / 2, 80, { size: 28, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 6 });
        // o Pai sentado no sofá, com a perna esticada
        ctx.fillStyle = '#6b3b1f'; G.retRedondo(ctx, 60, 300, 230, 140, 20); ctx.fill();
        G.Arte.boneco(ctx, 'jair', 170, 400, { t, pose: 'fala', semSombra: true, esc: 1.4 });
        ctx.strokeStyle = '#2b3a2b'; ctx.lineWidth = 18; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(190, 400); ctx.lineTo(330, 430); ctx.stroke();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(350, 432, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
        // a tornozeleira, com a luzinha piscando
        ctx.fillStyle = '#222'; G.retRedondo(ctx, alvo.x - 22, alvo.y - 16, 30, 26, 5); ctx.fill();
        ctx.fillStyle = Math.sin(t * 10) > 0 ? '#3cff6a' : '#145a24';
        ctx.beginPath(); ctx.arc(alvo.x - 7, alvo.y - 3, 4, 0, Math.PI * 2); ctx.fill();
        G.Arte.balao(ctx, this.venceu === true ? 'Tá ok...' : 'Só tô curioso!', 190, 250, { size: 15 });
        // o ferro de solda
        const f = this.ferro;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.rotate(Math.atan2(alvo.y - f.y, alvo.x - f.x));
        ctx.fillStyle = '#d11f2b'; G.retRedondo(ctx, -70, -10, 60, 20, 8); ctx.fill();
        ctx.fillStyle = '#aaa'; ctx.fillRect(-12, -4, 32, 8);
        ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.moveTo(20, -4); ctx.lineTo(32, 0); ctx.lineTo(20, 4); ctx.fill();
        ctx.restore();
        for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(220,220,220,0.4)'; ctx.beginPath(); ctx.arc(f.x + 10, f.y - 20 - ((t * 50 + i * 20) % 50), 6, 0, Math.PI * 2); ctx.fill(); }
        if (this.faisca) for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#ffd400' : '#fff'; ctx.fillRect(alvo.x + G.U.rand(-40, 40), alvo.y + G.U.rand(-40, 20), 5, 5); }
      },
    };
  },
});
