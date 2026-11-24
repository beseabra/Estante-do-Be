// ============================================================
//  COMPARTILHA! (botão, rápido) Aperte sem parar para espalhar
//  o áudio do Janones em todos os grupos.
// ============================================================
G.Micro.registra({
  id: 'compartilha', verbo: 'COMPARTILHA!', dica: 'aperte sem parar!', controle: 'botao', dur: 4.5, cor: '#128c7e',
  criar({ nivel }) {
    const meta = 12 + nivel * 2;
    return {
      t: 0, venceu: null, n: 0, setas: [], treme: 0,
      update(dt, inp) {
        this.t += dt;
        if (this.venceu === null && G.acao(inp)) {
          this.n++;
          this.treme = 0.1;
          G.Audio.tocar('tecla');
          this.setas.push({ x: 480, y: 280, vx: G.U.rand(-420, 420), vy: G.U.rand(-420, -120), v: 1 });
          if (this.n >= meta) this.venceu = true;
        }
        this.treme = Math.max(0, this.treme - dt);
        for (const s of this.setas) { s.x += s.vx * dt; s.y += s.vy * dt; s.v -= dt * 1.3; }
        this.setas = this.setas.filter((s) => s.v > 0);
      },
      draw(ctx, t) {
        G.fundoLiso(ctx, '#128c7e');
        for (const s of this.setas) {
          ctx.globalAlpha = Math.max(0, s.v);
          ctx.fillStyle = '#dcf8c6';
          G.retRedondo(ctx, s.x - 40, s.y - 14, 80, 28, 14); ctx.fill();
          G.texto(ctx, '▶ ıllıll', s.x, s.y + 6, { size: 14, align: 'center', color: '#128c7e', weight: 900 });
        }
        ctx.globalAlpha = 1;
        // o celular
        const tr = this.treme > 0 ? G.U.rand(-6, 6) : 0;
        ctx.save(); ctx.translate(480 + tr, 290);
        ctx.fillStyle = '#111'; G.retRedondo(ctx, -90, -160, 180, 320, 24); ctx.fill();
        ctx.fillStyle = '#ece5dd'; G.retRedondo(ctx, -78, -140, 156, 280, 12); ctx.fill();
        ctx.fillStyle = '#075e54'; ctx.fillRect(-78, -140, 156, 40);
        G.texto(ctx, 'Exército do Lula', 0, -114, { size: 13, align: 'center', color: '#fff', weight: 900 });
        G.texto(ctx, String(this.n * 137 + 4000).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 0, 10, { size: 26, align: 'center', color: '#111', weight: 900 });
        G.texto(ctx, 'grupos', 0, 34, { size: 14, align: 'center', color: '#555' });
        ctx.restore();
        // barra da meta
        const frac = Math.min(1, this.n / meta);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; G.retRedondo(ctx, 230, 470, 500, 22, 11); ctx.fill();
        ctx.fillStyle = '#ffd400'; G.retRedondo(ctx, 230, 470, Math.max(22, 500 * frac), 22, 11); ctx.fill();
        G.texto(ctx, 'ALCANCE', 230, 462, { size: 14, color: '#fff', weight: 900 });
        G.Arte.boneco(ctx, 'janones', 150, 460, { t, pose: 'fala', celular: true, esc: 1.3 });
      },
    };
  },
});
