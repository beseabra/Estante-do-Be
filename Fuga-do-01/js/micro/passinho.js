// ============================================================
//  PASSINHO DO QUEIROZ! (setas + botão) Aperte os comandos na
//  ordem e o Queiroz dança.
// ============================================================
G.Micro.registra({
  id: 'passinho', verbo: 'PASSINHO DO QUEIROZ!', dica: 'aperte os comandos na ordem', controle: 'teclas', dur: 5, cor: '#d14a8a',
  criar({ nivel }) {
    const seq = [];
    for (let i = 0; i < 3 + nivel; i++) seq.push(G.U.pick(['left', 'right', 'jump']));
    const icone = { left: '◀', right: '▶', jump: '●' };
    return {
      t: 0, venceu: null, i: 0, pulo: 0,
      update(dt, inp) {
        this.t += dt;
        this.pulo = Math.max(0, this.pulo - dt);
        if (this.venceu !== null) return;
        const apertou = ['left', 'right', 'jump'].find((a) => inp.hit(a)) || (inp.hit('ok') && 'jump');
        if (!apertou) return;
        if (apertou === seq[this.i]) {
          this.i++;
          this.pulo = 0.25;
          G.Audio.tocar('seleciona');
          if (this.i >= seq.length) this.venceu = true;
        } else { this.venceu = false; G.Audio.tocar('dano'); }
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#d14a8a');
        // os comandos
        const w = 90, x0 = G.W / 2 - (seq.length * w) / 2;
        seq.forEach((s, k) => {
          const feito = k < this.i, atual = k === this.i && this.venceu === null;
          ctx.fillStyle = feito ? '#2ad46a' : atual ? '#fff' : 'rgba(255,255,255,0.35)';
          G.retRedondo(ctx, x0 + k * w + 8, 100 + (atual ? Math.sin(t * 10) * 4 : 0), w - 16, 74, 14); ctx.fill();
          G.texto(ctx, icone[s], x0 + k * w + w / 2, 152 + (atual ? Math.sin(t * 10) * 4 : 0), { size: 40, align: 'center', color: feito ? '#fff' : '#d14a8a', weight: 900 });
        });
        // o Queiroz dançando (e o globo de discoteca)
        ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(820, 230, 34, 0, Math.PI * 2); ctx.fill();
        for (let k = 0; k < 8; k++) { ctx.fillStyle = `hsla(${(t * 200 + k * 45) % 360}, 90%, 70%, 0.25)`; ctx.beginPath(); ctx.moveTo(820, 230); ctx.arc(820, 230, 600, k * 0.8 + t, k * 0.8 + t + 0.15); ctx.fill(); }
        const pulo = Math.sin((this.pulo / 0.25) * Math.PI) * 40;
        G.Arte.boneco(ctx, 'queiroz', 480, 470 - pulo, { t: t * (this.venceu === false ? 0.2 : 1), pose: this.venceu === false ? 'dano' : 'danca', esc: 1.8 });
      },
    };
  },
});
