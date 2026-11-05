// ============================================================
//  DEVOLVE OS SALÁRIOS! (setas) O 01 joga os envelopes da
//  rachadinha. Pegue 3 antes que caiam no chão.
// ============================================================
G.Micro.registra({
  id: 'salarios', verbo: 'PEGA OS SALÁRIOS!', dica: 'pegue os envelopes antes do 01', controle: 'setas', dur: 5.5, cor: '#c98a2a',
  criar({ nivel, heroi }) {
    const precisa = 3 + Math.min(1, nivel);
    const queda = 230 + nivel * 70;
    return {
      t: 0, venceu: null, x: 480, pegou: 0, envs: [], prox: 0.2, fx: 480, fdir: 1,
      update(dt, inp) {
        this.t += dt;
        // você anda com as setas (ou segurando o mouse/dedo)
        let dx = (inp.is('right') ? 1 : 0) - (inp.is('left') ? 1 : 0);
        if (inp.ponteiro.down) dx = G.U.clamp((inp.ponteiro.x - this.x) / 30, -1, 1);
        this.x = G.U.clamp(this.x + dx * 560 * dt, 60, 900);
        this.anda = dx !== 0;
        // o 01 lá em cima soltando envelopes
        this.fx += this.fdir * 300 * dt;
        if (this.fx < 120 || this.fx > 840) this.fdir *= -1;
        this.prox -= dt;
        if (this.prox <= 0) { this.prox = 0.55; this.envs.push({ x: this.fx, y: 150, giro: Math.random() * 6 }); }
        for (const e of this.envs) {
          e.y += queda * dt;
          e.giro += dt;
          if (!e.fim && Math.abs(e.x - this.x) < 50 && e.y > 380 && e.y < 460) { e.fim = 'pego'; this.pegou++; G.Audio.tocar('voto'); }
          if (!e.fim && e.y > 500) e.fim = 'caiu';
        }
        this.envs = this.envs.filter((e) => !e.fim || (e.fim === 'caiu' && e.y < 560));
        if (this.pegou >= precisa) this.venceu = true;
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#c98a2a');
        G.texto(ctx, `SALÁRIOS DEVOLVIDOS: ${this.pegou}/${precisa}`, G.W / 2, 90, { size: 28, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 6 });
        G.Arte.boneco(ctx, 'flavio', this.fx, 175, { t, pose: 'fala', medo: true, esc: 0.8, dir: this.fdir });
        for (const e of this.envs) G.Arte.item(ctx, 'envelope', e.x, e.y, e.giro * 0.3, 1.4);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 480, G.W, 60);
        G.Arte.boneco(ctx, heroi, this.x, 480, { t, pose: this.anda ? 'corre' : 'comemora', esc: 1.2 });
      },
    };
  },
});
