// ============================================================
//  PICANHA AO PONTO! (botão) Pare o ponteiro na parte verde.
// ============================================================
G.Micro.registra({
  id: 'picanha', verbo: 'PICANHA AO PONTO!', dica: 'aperte quando o ponteiro estiver no verde', controle: 'botao', dur: 4.5, cor: '#7a2a1c',
  somVitoria: 'picanha',
  criar({ nivel }) {
    const larg = 0.2 - nivel * 0.03; // tamanho da faixa "ao ponto" (de 0 a 1)
    const centro = G.U.rand(0.45, 0.7);
    const vel = 0.8 + nivel * 0.2;   // o ponteiro anda sempre na mesma velocidade, vai e volta
    return {
      t: 0, venceu: null, pos: 0, parou: false,
      update(dt, inp) {
        this.t += dt;
        if (!this.parou) { const f = (this.t * vel) % 2; this.pos = f < 1 ? f : 2 - f; }
        if (!this.parou && G.acao(inp)) {
          this.parou = true;
          this.venceu = Math.abs(this.pos - centro) <= larg / 2;
          G.Audio.tocar(this.venceu ? 'picanha' : 'dano');
        }
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#7a2a1c');
        // churrasqueira
        ctx.fillStyle = '#333'; G.retRedondo(ctx, 280, 250, 400, 40, 8); ctx.fill();
        ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
        for (let x = 300; x <= 660; x += 30) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 290); ctx.stroke(); }
        ctx.fillStyle = '#ff7a1a';
        for (let i = 0; i < 8; i++) { ctx.globalAlpha = 0.5 + Math.sin(t * 9 + i) * 0.3; ctx.beginPath(); ctx.arc(310 + i * 48, 300, 14, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
        // a picanha muda de cor: crua -> ao ponto -> queimada
        const cru = [200, 60, 60], ponto = [150, 70, 40], queimado = [40, 25, 20];
        const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
        const c = this.pos < centro ? mix(cru, ponto, this.pos / centro) : mix(ponto, queimado, (this.pos - centro) / (1 - centro));
        ctx.save(); ctx.translate(480, 236); ctx.scale(3.4, 3.4);
        ctx.fillStyle = `rgb(${c})`; ctx.beginPath(); ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.ellipse(0, -8, 19, 5, 0, Math.PI, 0); ctx.fill();
        ctx.restore();
        // fumaça
        for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + this.pos * 0.25})`; ctx.beginPath(); ctx.arc(440 + i * 30, 170 - ((t * 60 + i * 30) % 90), 16 + i * 2, 0, Math.PI * 2); ctx.fill(); }
        // o medidor
        const x0 = 180, w = 600, y = 400;
        const faixas = [[0, centro - larg / 2, '#e05050', 'CRU'], [centro - larg / 2, centro + larg / 2, '#2ad46a', 'AO PONTO'], [centro + larg / 2, 1, '#2a1a10', 'QUEIMOU']];
        for (const [a, b, cor, nome] of faixas) {
          ctx.fillStyle = cor; ctx.fillRect(x0 + a * w, y, (b - a) * w, 40);
          G.texto(ctx, nome, x0 + (a + b) / 2 * w, y + 68, { size: 15, align: 'center', color: '#fff', weight: 900 });
        }
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x0, y, w, 40);
        const px = x0 + this.pos * w;
        ctx.fillStyle = '#ffd400';
        ctx.beginPath(); ctx.moveTo(px, y - 4); ctx.lineTo(px - 14, y - 30); ctx.lineTo(px + 14, y - 30); ctx.fill();
        ctx.fillRect(px - 3, y - 4, 6, 48);
      },
    };
  },
});
