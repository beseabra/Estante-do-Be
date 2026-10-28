// ============================================================
//  TÍTULO e ESCOLHA DE PERSONAGEM
// ============================================================

// fundo listrado verde/amarelo x vermelho que gira devagar
G.fundoComicio = function (ctx, t, cores = ['#d11f2b', '#b3121d']) {
  ctx.fillStyle = cores[0];
  ctx.fillRect(0, 0, G.W, G.H);
  ctx.save();
  ctx.translate(G.W / 2, G.H * 0.62);
  ctx.rotate(t * 0.08);
  ctx.fillStyle = cores[1];
  for (let i = 0; i < 16; i++) {
    ctx.rotate(Math.PI / 8);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1200, -120); ctx.lineTo(1200, 120); ctx.fill();
  }
  ctx.restore();
};

G.CenaTitulo = class {
  constructor() {
    this.t = 0;
    this.fase = G.Save.ler('fase', 0);
    this.opcao = 0; // 0 = nova campanha, 1 = continuar
    this.opcoes = this.fase > 0 ? ['NOVA CAMPANHA', `CONTINUAR (FASE ${this.fase + 1})`] : ['COMEÇAR A CAMPANHA'];
    this.opcao = this.fase > 0 ? 1 : 0;
    this.falaT = 0;
    this.fala = null;
  }
  enter() {
    G.Audio.musica('titulo');
  }
  update(dt) {
    this.t += dt;
    const inp = G.Input;
    if (inp.hit('left') || inp.hit('slide')) { this.opcao = (this.opcao + this.opcoes.length - 1) % this.opcoes.length; G.Audio.tocar('seleciona'); }
    if (inp.hit('right') || inp.hit('jump')) { this.opcao = (this.opcao + 1) % this.opcoes.length; G.Audio.tocar('seleciona'); }
    if (inp.hit('ok') || inp.hit('tap')) {
      G.Audio.tocar('buzina');
      const fase = this.opcao === 1 ? this.fase : 0;
      if (fase === 0) G.Save.gravar('fase', 0);
      G.Campanha = G.novaCampanha();
      G.Game.trocar(() => new G.CenaEscolha(fase));
    }
    // falas soltas dos personagens correndo
    this.falaT -= dt;
    if (this.falaT <= 0) {
      this.falaT = 2.6;
      const quem = G.U.pick(['flavio', 'lula', 'janones']);
      const txt = quem === 'flavio' ? G.U.pick(G.FALAS_FLAVIO) : G.U.pick(G.HEROIS[quem].falas);
      this.fala = { quem, txt, t: 0 };
    }
    if (this.fala) this.fala.t += dt;
  }
  draw(ctx) {
    const t = this.t;
    G.fundoComicio(ctx, t);

    // a perseguição passando no meio
    const ciclo = (t * 170) % (G.W + 700) - 250;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 430, G.W, 110);
    const pos = { flavio: ciclo + 260, janones: ciclo + 60, lula: ciclo - 60 };
    G.Arte.boneco(ctx, 'flavio', pos.flavio, 460, { t, pose: 'corre', segura: 'dinheiro', medo: true });
    G.Arte.boneco(ctx, 'janones', pos.janones, 460, { t: t + 0.3, pose: 'corre', celular: true });
    G.Arte.boneco(ctx, 'lula', pos.lula, 460, { t: t + 0.6, pose: 'corre' });
    if (this.fala && this.fala.t < 2.2) G.Arte.balao(ctx, this.fala.txt, pos[this.fala.quem], 372, { size: 14, largura: 220 });

    // logotipo
    const b = Math.sin(t * 3) * 4;
    ctx.save();
    ctx.translate(G.W / 2, 120 + b);
    ctx.rotate(-0.04);
    G.texto(ctx, 'PESSOAL,', 0, -10, { size: 64, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 12, shadow: 'rgba(0,0,0,0.4)' });
    G.texto(ctx, 'URGENTE!', 0, 70, { size: 104, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 14, shadow: 'rgba(0,0,0,0.4)' });
    ctx.restore();
    // selo "A FUGA DO 01"
    ctx.save();
    ctx.translate(G.W / 2 + 270, 210);
    ctx.rotate(0.18 + Math.sin(t * 5) * 0.03);
    ctx.fillStyle = '#0b9b3c';
    G.retRedondo(ctx, -90, -24, 180, 48, 8); ctx.fill();
    ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 4; ctx.stroke();
    G.texto(ctx, 'A FUGA DO 01', 0, 12, { size: 32, font: G.FONTE_TITULO, align: 'center', color: '#ffd400' });
    ctx.restore();

    // menu
    this.opcoes.forEach((op, i) => {
      const sel = i === this.opcao;
      const x = G.W / 2 + (i - (this.opcoes.length - 1) / 2) * 300;
      const y = 266;
      ctx.fillStyle = sel ? '#ffd400' : 'rgba(0,0,0,0.35)';
      G.retRedondo(ctx, x - 135, y - 26, 270, 46, 23); ctx.fill();
      if (sel) { ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke(); }
      G.texto(ctx, op, x, y + 7, { size: 20, align: 'center', color: sel ? '#111' : '#fff', weight: 900 });
    });
    const pisca = Math.sin(t * 5) > -0.3;
    if (pisca) G.texto(ctx, G.Mobile.on ? 'toque para começar' : 'ENTER para começar  ·  ← → para escolher', G.W / 2, 314, { size: 16, align: 'center', color: '#fff', stroke: '#111', lw: 4 });

    G.texto(ctx, 'Uma paródia das eleições de 2026  ·  M: som  ·  V: vozes', G.W / 2, 530, { size: 12, align: 'center', color: 'rgba(255,255,255,0.75)' });
  }
};

// ---------- escolha de personagem ----------
G.CenaEscolha = class {
  constructor(fase) {
    this.fase = fase;
    this.t = 0;
    this.sel = 0;
    this.lista = ['lula', 'janones'];
  }
  enter() { G.Audio.musica('titulo'); }
  update(dt) {
    this.t += dt;
    const inp = G.Input;
    if (inp.hit('left') || inp.hit('right')) {
      this.sel = 1 - this.sel;
      G.Audio.tocar('seleciona');
      const h = this.lista[this.sel];
      G.Voz.falar(h === 'lula' ? 'Companheiro!' : 'Pessoal, urgente!', h, true);
    }
    // no celular, tocar num dos lados escolhe
    if (inp.toque) {
      const lado = inp.toque.x < G.W / 2 ? 0 : 1;
      if (lado !== this.sel) { this.sel = lado; G.Audio.tocar('seleciona'); inp.pressed.tap = false; }
    }
    if (inp.hit('back')) G.Game.trocar(() => new G.CenaTitulo());
    if (inp.hit('ok') || inp.hit('jump') || inp.hit('tap')) {
      const heroi = this.lista[this.sel];
      G.Save.gravar('heroi', heroi);
      G.Audio.dizer(heroi === 'lula' ? 'faz-o-l' : 'pessoal-urgente', heroi === 'lula' ? 'Faz o L!' : 'Pessoal, urgente!', heroi, true);
      G.Game.trocar(() => new G.CenaZap(this.fase, heroi));
    }
  }
  draw(ctx) {
    const t = this.t;
    G.fundoComicio(ctx, t, ['#0b6b2c', '#0a5a25']);
    G.texto(ctx, 'ESCOLHA SEU CANDIDATO A CAÇADOR', G.W / 2, 62, { size: 40, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 8 });

    this.lista.forEach((h, i) => {
      const H = G.HEROIS[h];
      const sel = i === this.sel;
      const cx = 260 + i * 440;
      ctx.save();
      ctx.translate(cx, 290);
      const s = sel ? 1.04 + Math.sin(t * 5) * 0.01 : 0.94;
      ctx.scale(s, s);
      ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.55)';
      G.retRedondo(ctx, -190, -200, 380, 400, 18); ctx.fill();
      if (sel) { ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 8; ctx.stroke(); }
      ctx.fillStyle = h === 'lula' ? '#d11f2b' : '#128c7e';
      G.retRedondo(ctx, -190, -200, 380, 70, 18); ctx.fill();
      ctx.fillRect(-190, -150, 380, 20);
      G.texto(ctx, H.nome, 0, -148, { size: 46, font: G.FONTE_TITULO, align: 'center', color: '#fff' });
      G.Arte.boneco(ctx, h, -90, 80, { t, pose: sel ? (h === 'lula' ? 'comemora' : 'fala') : 'parado', esc: 1.55, celular: h === 'janones' });
      H.descricao.forEach((d, k) => {
        const linhas = G.quebra(ctx, d, 190, 14);
        linhas.forEach((l, j) => G.texto(ctx, l, -10, -90 + k * 66 + j * 18, { size: 14, color: '#222' }));
      });
      G.texto(ctx, `"${H.falas[Math.floor(t / 2.2 + i) % H.falas.length]}"`, 0, 175, { size: 15, align: 'center', color: '#555', weight: 800 });
      ctx.restore();
    });
    G.texto(ctx, G.Mobile.on ? 'toque num candidato e depois toque de novo' : '← → escolhe  ·  ENTER confirma', G.W / 2, 525, { size: 16, align: 'center', color: '#fff' });
  }
};
