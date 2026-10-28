// ============================================================
//  O CANAL DO ZAP: os áudios do Janones antes de cada fase
//  (a "missão do dia" chegando no celular)
// ============================================================
G.CenaZap = class {
  constructor(fase, heroi) {
    this.fase = fase;
    this.heroi = heroi;
    this.F = G.FASES[fase];
    this.t = 0;
    this.msgs = [];      // mensagens já na tela
    this.prox = 0;       // índice da próxima
    this.gravando = 0.9; // "gravando áudio..." antes da próxima
    this.seguidores = 8.4 + fase * 0.3;
  }
  enter() {
    G.Audio.musica('fase' + (this.fase + 1));
    G.Save.gravar('fase', this.fase);
  }
  chega() {
    const m = this.F.zap[this.prox++];
    this.msgs.push({ ...m, t: 0 });
    G.Audio.tocar('zap');
    if (this.prox === 1) G.Audio.dizer('pessoal-urgente', m.txt, m.de, true);
    else G.Voz.falar(m.txt, m.de, true);
    this.gravando = this.prox < this.F.zap.length ? 2.4 : 0;
  }
  update(dt) {
    this.t += dt;
    for (const m of this.msgs) m.t += dt;
    if (this.prox < this.F.zap.length) {
      this.gravando -= dt;
      if (this.gravando <= 0) this.chega();
    }
    if (G.Input.avancar()) {
      if (this.prox < this.F.zap.length) this.chega();
      else {
        if (window.speechSynthesis) speechSynthesis.cancel();
        G.Game.trocar(() => new G.CenaCorrida(this.fase, this.heroi));
      }
    }
    if (G.Input.hit('back')) G.Game.trocar(() => new G.CenaTitulo());
  }
  draw(ctx) {
    const t = this.t;
    const F = this.F;
    G.fundoComicio(ctx, t, ['#128c7e', '#0f7a6d']);

    // à esquerda: número e nome da fase
    G.texto(ctx, `FASE ${this.fase + 1} DE ${G.FASES.length}`, 40, 90, { size: 24, font: G.FONTE_TITULO, color: '#ffd400', stroke: '#111', lw: 5 });
    const linhas = G.quebra(ctx, F.titulo.toUpperCase(), 260, 50, G.FONTE_TITULO);
    linhas.forEach((l, i) => G.texto(ctx, l, 40, 145 + i * 52, { size: 50, font: G.FONTE_TITULO, color: '#fff', stroke: '#111', lw: 8 }));
    G.texto(ctx, F.lugar, 40, 160 + linhas.length * 52, { size: 18, color: '#dcf8c6' });
    G.Arte.boneco(ctx, 'janones', 140, 500, { t, pose: 'fala', celular: true, esc: 1.5 });

    // o celular
    const px = 360, py = 22, pw = 420, ph = 500;
    ctx.fillStyle = '#111';
    G.retRedondo(ctx, px - 12, py - 12, pw + 24, ph + 24, 34); ctx.fill();
    ctx.save();
    G.retRedondo(ctx, px, py, pw, ph, 24); ctx.clip();
    ctx.fillStyle = '#ece5dd'; ctx.fillRect(px, py, pw, ph);
    // padrãozinho de fundo do zap
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc(px + G.semente(i) * pw, py + G.semente(i + 50) * ph, 6, 0, Math.PI * 2); ctx.fill(); }
    // cabeçalho do canal
    ctx.fillStyle = '#075e54'; ctx.fillRect(px, py, pw, 70);
    ctx.fillStyle = '#d11f2b'; ctx.beginPath(); ctx.arc(px + 40, py + 38, 22, 0, Math.PI * 2); ctx.fill();
    G.Arte.estrela(ctx, px + 40, py + 38, 15, '#fff');
    G.texto(ctx, 'Exército do Lula ✔', px + 74, py + 34, { size: 18, color: '#fff', weight: 900 });
    G.texto(ctx, `canal · ${this.seguidores.toFixed(1).replace('.', ',')} mi de seguidores`, px + 74, py + 55, { size: 13, color: '#bfe8df' });

    // mensagens (as mais novas embaixo)
    // só as que cabem: as mais antigas vão sumindo por cima
    const altura = (m) => 64 + G.quebra(ctx, m.txt, pw - 110, 15).length * 19 + 10;
    const visiveis = [];
    let total = 0;
    for (let i = this.msgs.length - 1; i >= 0; i--) {
      total += altura(this.msgs[i]);
      if (total > ph - 130 && visiveis.length) break;
      visiveis.unshift(this.msgs[i]);
    }
    let y = py + 92;
    for (const m of visiveis) {
      const doJanones = m.de === 'janones';
      const txtL = G.quebra(ctx, m.txt, pw - 110, 15);
      const h = 64 + txtL.length * 19;
      const bx = px + 14, bw = pw - 60;
      const entra = G.U.ease(m.t * 4);
      ctx.save();
      ctx.globalAlpha = entra;
      ctx.translate(0, (1 - entra) * 20);
      ctx.fillStyle = '#fff';
      G.retRedondo(ctx, bx, y, bw, h, 10); ctx.fill();
      G.texto(ctx, doJanones ? 'Janones' : 'Lula', bx + 12, y + 20, { size: 13, color: doJanones ? '#128c7e' : '#d11f2b', weight: 900 });
      G.texto(ctx, 'Encaminhada com frequência', bx + bw - 10, y + 20, { size: 10, align: 'right', color: '#999' });
      // o áudio com a ondinha
      ctx.fillStyle = '#128c7e';
      ctx.beginPath(); ctx.moveTo(bx + 16, y + 30); ctx.lineTo(bx + 30, y + 38); ctx.lineTo(bx + 16, y + 46); ctx.fill();
      const tocando = m === this.msgs[this.msgs.length - 1];
      for (let i = 0; i < 34; i++) {
        const hh = 4 + Math.abs(Math.sin(i * 1.7 + (tocando ? t * 9 : 0))) * 12;
        ctx.fillStyle = tocando && i < (m.t * 10) % 34 ? '#128c7e' : '#b5c9c6';
        ctx.fillRect(bx + 40 + i * 6, y + 38 - hh / 2, 3, hh);
      }
      G.texto(ctx, m.audio, bx + bw - 12, y + 43, { size: 12, align: 'right', color: '#777' });
      txtL.forEach((l, i) => G.texto(ctx, l, bx + 14, y + 72 + i * 19, { size: 15, color: '#222', weight: 800 }));
      ctx.restore();
      y += h + 10;
    }
    if (this.prox < F.zap.length) {
      G.texto(ctx, (this.F.zap[this.prox].de === 'lula' ? 'Lula' : 'Janones') + ' está gravando áudio' + '...'.slice(0, Math.floor(t * 3) % 4), px + 20, py + ph - 20, { size: 14, color: '#128c7e', weight: 900 });
    }
    ctx.restore();

    // dica de controles e do que fazer
    const pronto = this.prox >= F.zap.length;
    const pisca = Math.sin(t * 6) > -0.2;
    if (pronto && pisca) G.texto(ctx, G.Mobile.on ? 'TOQUE: MISSÃO ACEITA!' : 'ENTER: MISSÃO ACEITA!', 870, 470, { size: 26, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 6 });
    if (!pronto) G.texto(ctx, 'Enter: pular áudio', 870, 470, { size: 14, align: 'center', color: '#dcf8c6' });
    if (this.fase === 0) {
      const dicas = G.Mobile.on
        ? ['▲ pula (2x no ar)', '▼ abaixa', '📢 atira', 'L especial']
        : ['ESPAÇO / ↑  pula (2x)', '↓  abaixa', 'X  atira', 'C  especial', 'P  pausa'];
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; G.retRedondo(ctx, 800, 160, 150, 30 + dicas.length * 24, 12); ctx.fill();
      G.texto(ctx, 'CONTROLES', 875, 184, { size: 14, align: 'center', color: '#ffd400', weight: 900 });
      dicas.forEach((d, i) => G.texto(ctx, d, 812, 210 + i * 24, { size: 13, color: '#fff' }));
    }
  }
};
