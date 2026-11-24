// ============================================================
//  ALGEMA! (botão) O 01 corre de um lado pro outro. Solte a
//  algema na hora em que ele passar embaixo dela.
// ============================================================
G.Micro.registra({
  id: 'algema', verbo: 'ALGEMA!', dica: 'solte a algema quando ele passar embaixo', controle: 'botao', dur: 5, cor: '#2b4a7a',
  somDerrota: 'risada',
  criar({ nivel }) {
    const vel = 380 + nivel * 90;
    return {
      t: 0, venceu: null,
      x: G.U.pick([90, 870]), dir: 1, caindo: 0, preso: false,
      update(dt, inp) {
        this.t += dt;
        if (this.x < 90) this.dir = 1;
        if (this.x > 870) this.dir = -1;
        if (!this.preso) this.x += this.dir * vel * dt;
        // vale onde ele está na hora que você aperta (a queda é só o desenho)
        if (!this.caindo && this.venceu === null && G.acao(inp)) {
          this.caindo = 0.001;
          this.acertou = Math.abs(this.x - 480) < 60;
          if (this.acertou) this.preso = true;
          G.Audio.tocar('pulo');
        }
        if (this.caindo) {
          this.caindo += dt;
          if (this.caindo >= 0.18 && this.venceu === null) {
            this.venceu = this.acertou;
            G.Audio.tocar(this.acertou ? 'captura' : 'dano');
          }
        }
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#2b4a7a');
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 440, G.W, 100);
        // a mira no chão
        ctx.strokeStyle = 'rgba(255,212,0,0.8)'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
        ctx.strokeRect(425, 330, 110, 115);
        ctx.setLineDash([]);
        // a algema descendo pela corda
        const yA = this.caindo ? Math.min(330, 90 + this.caindo / 0.18 * 240) : 90 + Math.sin(t * 4) * 4;
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(480, 0); ctx.lineTo(480, yA - 20); ctx.stroke();
        ctx.strokeStyle = '#c8ccd4'; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(466, yA, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(494, yA, 14, 0, Math.PI * 2); ctx.stroke();
        G.Arte.boneco(ctx, 'flavio', this.x, 440, { t, pose: this.preso ? 'algemado' : 'corre', dir: this.dir, medo: true, esc: 1.25, segura: this.preso ? null : 'dinheiro' });
        if (this.preso) G.Arte.balao(ctx, 'Isso é perseguição!', 480, 300, { size: 16 });
      },
    };
  },
});
