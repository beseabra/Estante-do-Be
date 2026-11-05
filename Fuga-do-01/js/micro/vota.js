// ============================================================
//  VOTA 13! (mouse ou teclado) Digite 1, 3 e CONFIRMA na urna.
// ============================================================
G.Micro.registra({
  id: 'vota', verbo: 'VOTA 13!', dica: 'aperte 1, 3 e CONFIRMA', controle: 'mouse', dur: 5, cor: '#1b4f8a',
  somVitoria: 'urna',
  criar() {
    const teclas = [];
    const kx = 560, ky = 112;
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d, i) => teclas.push({ id: d, x: kx + (i % 3) * 86, y: ky + Math.floor(i / 3) * 66, w: 74, h: 54 }));
    teclas.push({ id: '0', x: kx + 86, y: ky + 198, w: 74, h: 54 });
    teclas.push({ id: 'ok', x: kx + 30, y: ky + 266, w: 200, h: 58, rot: 'CONFIRMA' });
    return {
      t: 0, venceu: null, num: '', aperto: null,
      aperta(id) {
        if (this.venceu !== null) return;
        this.aperto = { id, t: 0.12 };
        if (id === 'ok') {
          if (this.num.length < 2) return;
          this.venceu = this.num === '13';
          if (!this.venceu) G.Audio.tocar('dano');
          return;
        }
        G.Audio.tocar('tecla');
        this.num += id;
        if (!'13'.startsWith(this.num)) this.venceu = false; // apertou número errado: voto nulo
      },
      update(dt, inp) {
        this.t += dt;
        if (this.aperto) { this.aperto.t -= dt; if (this.aperto.t <= 0) this.aperto = null; }
        for (const d of inp.digitos) this.aperta(d);
        if (inp.hit('ok')) this.aperta('ok');
        if (inp.toque) { const k = teclas.find((k) => G.clicou(inp, k)); if (k) this.aperta(k.id); }
      },
      draw(ctx) {
        G.fundoLiso(ctx, '#1b4f8a');
        ctx.fillStyle = '#d9d2bd'; G.retRedondo(ctx, 120, 80, 760, 400, 20); ctx.fill();
        ctx.fillStyle = '#111'; G.retRedondo(ctx, 540, 100, 300, 360, 12); ctx.fill();
        // a tela
        ctx.fillStyle = '#f2f2ee'; ctx.fillRect(150, 110, 360, 340);
        G.texto(ctx, 'PRESIDENTE', 330, 160, { size: 28, align: 'center', color: '#111', weight: 900 });
        for (let i = 0; i < 2; i++) {
          ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(260 + i * 80, 200, 66, 80);
          if (this.num[i]) G.texto(ctx, this.num[i], 293 + i * 80, 262, { size: 54, align: 'center', color: '#111', weight: 900 });
        }
        if (this.num === '13') G.texto(ctx, 'LULA · PT', 330, 330, { size: 26, align: 'center', color: '#111', weight: 900 });
        if (this.venceu === false) G.texto(ctx, 'VOTO NULO', 330, 380, { size: 36, align: 'center', color: '#d11f2b', weight: 900 });
        if (this.venceu === true) G.texto(ctx, 'FIM', 330, 400, { size: 60, align: 'center', color: '#111', weight: 900 });
        for (const k of teclas) {
          const ap = this.aperto && this.aperto.id === k.id;
          ctx.fillStyle = k.rot ? '#2bb24c' : '#2a2a2a';
          G.retRedondo(ctx, k.x, k.y + (ap ? 3 : 0), k.w, k.h, 8); ctx.fill();
          G.texto(ctx, k.rot || k.id, k.x + k.w / 2, k.y + k.h / 2 + (k.rot ? 8 : 12) + (ap ? 3 : 0), { size: k.rot ? 22 : 32, align: 'center', color: k.rot ? '#111' : '#fff', weight: 900 });
        }
      },
    };
  },
});
