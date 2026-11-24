// ============================================================
//  DESVIA! (setas) O 01 joga boletos e bombons. Não leve nenhum
//  até o tempo acabar.
// ============================================================
G.Micro.registra({
  id: 'boletos', verbo: 'DESVIA!', dica: 'não deixe nada te acertar', controle: 'setas', dur: 5, cor: '#5a3a8a', sobrevive: true,
  somDerrota: 'risada',
  criar({ nivel, heroi }) {
    const queda = 280 + nivel * 60;
    return {
      t: 0, venceu: null, x: 480, coisas: [], prox: 0.25, fx: 480, fdir: 1,
      update(dt, inp) {
        this.t += dt;
        if (this.venceu === false) return;
        let dx = (inp.is('right') ? 1 : 0) - (inp.is('left') ? 1 : 0);
        if (inp.ponteiro.down) dx = G.U.clamp((inp.ponteiro.x - this.x) / 30, -1, 1);
        this.x = G.U.clamp(this.x + dx * 600 * dt, 50, 910);
        this.anda = dx !== 0;
        this.fx += this.fdir * 380 * dt;
        if (this.fx < 100 || this.fx > 860) this.fdir *= -1;
        this.prox -= dt;
        if (this.prox <= 0) {
          this.prox = 0.5 - nivel * 0.05;
          // um terço cai mirando em você, o resto em lugar qualquer
          const alvo = Math.random() < 0.35 ? this.x : G.U.rand(60, 900);
          this.coisas.push({ x: alvo, y: 140, tipo: G.U.pick(['boleto', 'bombom', 'mala', 'boleto']), giro: 0 });
        }
        for (const c of this.coisas) {
          c.y += queda * dt;
          c.giro += dt;
          if (Math.abs(c.x - this.x) < 30 && c.y > 410 && c.y < 480) { this.venceu = false; c.bateu = true; G.Audio.tocar('dano'); }
        }
        this.coisas = this.coisas.filter((c) => c.y < 580);
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#5a3a8a');
        G.Arte.boneco(ctx, 'flavio', this.fx, 150, { t, pose: 'fala', esc: 0.8, dir: this.fdir });
        for (const c of this.coisas) G.Arte.item(ctx, c.tipo, c.x, c.y, c.giro, 1.4);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 480, G.W, 60);
        G.Arte.boneco(ctx, heroi, this.x, 480, { t, pose: this.venceu === false ? 'dano' : this.anda ? 'corre' : 'parado', esc: 1.2, dir: this.anda && G.Input.is('left') ? -1 : 1 });
      },
    };
  },
});
