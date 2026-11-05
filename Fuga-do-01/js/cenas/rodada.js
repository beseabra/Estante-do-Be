// ============================================================
//  A RODADA: uma sequência de microgames de poucos segundos
//  (estilo WarioWare). A cada 4 missões o jogo acelera; depois
//  da 12ª vem o chefão. Errou 4 vezes, acabou a credibilidade.
//
//  Cada microgame se registra com G.Micro.registra({...}):
//    id, verbo, dica      o que aparece na tela de instrução
//    controle             'mouse' | 'setas' | 'botao' | 'teclas'
//    dur                  segundos (na velocidade normal)
//    cor                  cor de fundo
//    sobrevive            true = ganha se não errar até o tempo acabar
//    criar({ nivel, heroi }) -> { update(dt, inp), draw(ctx, t), venceu }
//      venceu: null enquanto joga, true ganhou, false perdeu
// ============================================================
G.Micro = {
  lista: [],
  registra(def) { this.lista.push(def); },
};

G.MISSOES_ATE_CHEFE = 12;
G.ACELERA_A_CADA = 4;
G.VIDAS = 4;

// fundo liso com um brilho no meio (sem nada para confundir a vista)
G.fundoLiso = function (ctx, cor) {
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, G.W, G.H);
  const g = ctx.createRadialGradient(G.W / 2, G.H / 2, 60, G.W / 2, G.H / 2, 620);
  g.addColorStop(0, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, G.W, G.H);
};

// atalhos de controle usados pelos microgames
G.acao = (inp) => inp.hit('jump') || inp.hit('ok') || inp.hit('tap');
G.clicou = (inp, r) => inp.toque && inp.toque.x >= r.x && inp.toque.x <= r.x + r.w && inp.toque.y >= r.y && inp.toque.y <= r.y + r.h;

G.CenaRodada = class {
  constructor(heroi) {
    this.heroi = heroi;
    this.pausavel = true;
    G.Campanha = { pontos: 0, missoes: 0, erros: 0 };
    this.C = G.Campanha;
    this.vidas = G.VIDAS;
    this.n = 0;           // missões jogadas
    this.vel = 1;
    this.nivel = 0;
    this.saco = [];
    this.estado = 'instrucao';
    this.et = 0;          // tempo no estado atual
    this.t = 0;
    this.proximo();
  }

  enter() { G.Audio.musica('rodada', this.vel); }

  // sorteia o próximo microgame sem repetir até passar por todos
  sorteia() {
    if (!this.saco.length) {
      this.saco = [...G.Micro.lista].sort(() => Math.random() - 0.5);
      if (this.def && this.saco[0] === this.def && this.saco.length > 1) this.saco.push(this.saco.shift());
    }
    return this.saco.shift();
  }

  proximo() {
    this.def = this.sorteia();
    this.jogo = null;
    this.estado = 'instrucao';
    this.et = 0;
    G.Audio.pararClipes();
    G.Audio.tocar('zap', 0.35);
    // um áudio do Janones diferente a cada missão
    if (this.n > 0) G.Audio.tocarUm(['urgente1', 'urgente2', 'urgente3', 'urgente4', 'urgente5'], 0.9);
    else G.Audio.tocar('urgente1', 0.9);
  }

  update(dt) {
    this.t += dt;
    this.et += dt;
    const inp = G.Input;

    if (this.estado === 'instrucao') {
      if (this.et > 1.5 / Math.min(this.vel, 1.3)) {
        this.jogo = this.def.criar({ nivel: this.nivel, heroi: this.heroi });
        this.tempo = this.def.dur;
        this.estado = 'jogo';
        this.et = 0;
        this.tique = 0;
      }
      return;
    }

    if (this.estado === 'jogo') {
      const gdt = dt * this.vel;
      this.jogo.update(gdt, inp);
      this.tempo -= gdt;
      // tique-taque no último segundo
      if (this.tempo < 1) { this.tique -= dt; if (this.tique <= 0) { this.tique = 0.25; G.Audio.tocar('tecla'); } }
      const j = this.jogo;
      if (j.venceu === false) return this.resultado(false);
      if (j.venceu === true && !this.def.sobrevive) { j.fimT = (j.fimT || 0) + dt; if (j.fimT > 0.35) return this.resultado(true); }
      if (this.tempo <= 0) return this.resultado(this.def.sobrevive ? j.venceu !== false : j.venceu === true);
      return;
    }

    if (this.estado === 'resultado') {
      if (this.et < 1.5) return;
      if (this.vidas <= 0) {
        G.Audio.pararMusica();
        G.Game.trocar(() => new G.CenaDerrota(this.heroi));
        this.estado = 'saindo';
        return;
      }
      this.n++;
      if (this.n >= G.MISSOES_ATE_CHEFE) {
        this.estado = 'chefe';
        this.et = 0;
        G.Audio.pararMusica();
        G.Audio.tocar('vine-boom');
        G.Audio.tocar('perseguicao', 0.7);
        return;
      }
      if (this.n % G.ACELERA_A_CADA === 0) {
        this.vel = Math.min(1.75, this.vel + 0.25);
        this.nivel++;
        this.estado = 'acelera';
        this.et = 0;
        G.Audio.tocar('buzina');
        G.Audio.tocar('faz-o-l-vinheta', 0.8);
        G.Audio.mudaRitmo(this.vel);
        return;
      }
      return this.proximo();
    }

    if (this.estado === 'acelera' && this.et > 2) return this.proximo();
    if (this.estado === 'chefe' && this.et > 2.4) {
      this.estado = 'saindo';
      G.Game.trocar(() => new G.CenaChefao(this.heroi, this.vidas), '#000');
    }
  }

  resultado(ok) {
    this.estado = 'resultado';
    this.et = 0;
    this.ok = ok;
    this.frase = G.U.pick(ok ? G.HEROIS[this.heroi].vitoria : G.HEROIS[this.heroi].derrota);
    G.Audio.pararClipes();
    if (ok) {
      this.C.missoes++;
      this.C.pontos += Math.round(100 * this.vel);
      G.Audio.tocarUm(['acertou', 'missao-cumprida']);
      if (this.def.somVitoria) G.Audio.tocar(this.def.somVitoria, 0.9);
    } else {
      this.C.erros++;
      this.vidas--;
      G.Audio.tocar('errou');
      if (this.def.somDerrota) G.Audio.tocar(this.def.somDerrota, 0.9);
      G.Game.sacudir(8);
    }
  }

  // ============================================================
  draw(ctx) {
    const t = this.t;
    if (this.estado === 'instrucao') return this.desenhaInstrucao(ctx);
    if (this.estado === 'acelera') return this.desenhaAviso(ctx, 'ACELERA!', `velocidade ${Math.round(this.vel * 100)}%`, '#ffd400', '#d11f2b');
    if (this.estado === 'chefe') return this.desenhaAviso(ctx, 'CHEFÃO!', 'O 01 ESTÁ FUGINDO PRA MIAMI', '#fff', '#111');

    // o microgame (também fica de fundo no resultado)
    this.jogo.draw(ctx, this.jogo.t || t);
    this.desenhaHUD(ctx);
    if (this.estado === 'jogo') this.desenhaPavio(ctx);
    if (this.estado === 'resultado') this.desenhaResultado(ctx);
  }

  desenhaHUD(ctx) {
    // credibilidade (vidas)
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    G.retRedondo(ctx, 12, 10, 40 + G.VIDAS * 30, 40, 20); ctx.fill();
    for (let i = 0; i < G.VIDAS; i++) G.coracao(ctx, 34 + i * 30, 30, i < this.vidas ? '#ff3b4a' : 'rgba(255,255,255,0.25)');
    // número da missão
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    G.retRedondo(ctx, G.W - 150, 10, 138, 40, 20); ctx.fill();
    G.texto(ctx, `MISSÃO ${this.n + 1}/${G.MISSOES_ATE_CHEFE}`, G.W - 81, 37, { size: 16, align: 'center', color: '#fff', weight: 900 });
  }

  // o tempo é um pavio queimando embaixo da tela
  desenhaPavio(ctx) {
    const frac = G.U.clamp(this.tempo / this.def.dur, 0, 1);
    const x0 = 60, w = G.W - 120, y = G.H - 22;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    G.retRedondo(ctx, x0, y - 6, w, 12, 6); ctx.fill();
    ctx.fillStyle = frac < 0.3 ? '#ff3b3b' : '#ffd400';
    G.retRedondo(ctx, x0, y - 6, Math.max(12, w * frac), 12, 6); ctx.fill();
    // faísca na ponta
    const fx = x0 + w * frac;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#fff' : '#ff9a1a';
      ctx.beginPath(); ctx.arc(fx + G.U.rand(-6, 6), y + G.U.rand(-6, 6), G.U.rand(2, 4), 0, Math.PI * 2); ctx.fill();
    }
  }

  desenhaInstrucao(ctx) {
    const d = this.def;
    const p = G.U.ease(this.et * 3);
    G.fundoLiso(ctx, d.cor);
    this.desenhaHUD(ctx);
    // o Janones mandando o áudio
    G.Arte.boneco(ctx, 'janones', 150, 470, { t: this.t, pose: 'fala', celular: true, esc: 1.5 });
    ctx.save();
    ctx.translate(150, 215);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#25d366';
    G.retRedondo(ctx, -95, -30, 190, 56, 14); ctx.fill();
    G.texto(ctx, 'PESSOAL, URGENTE!', 0, 6, { size: 18, align: 'center', color: '#fff', weight: 900 });
    ctx.restore();
    // o verbo gigante
    ctx.save();
    ctx.translate(590, 250);
    const s = 0.4 + p * 0.6 + Math.sin(this.et * 12) * 0.02;
    ctx.scale(s, s);
    ctx.rotate(-0.05);
    const size = d.verbo.length > 12 ? 72 : 96;
    G.texto(ctx, d.verbo, 0, 0, { size, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 14, shadow: 'rgba(0,0,0,0.35)' });
    ctx.restore();
    ctx.globalAlpha = p;
    G.texto(ctx, d.dica, 590, 320, { size: 22, align: 'center', color: '#fff', stroke: 'rgba(0,0,0,0.5)', lw: 5 });
    // ícone do controle
    const ctl = {
      mouse: G.Mobile.on ? '👆 TOQUE NA TELA' : '🖱️ MOUSE',
      setas: G.Mobile.on ? '◀ ▶  BOTÕES' : '← →  SETAS (ou segure o mouse)',
      botao: G.Mobile.on ? '●  BOTÃO' : '⎵  ESPAÇO (ou clique)',
      teclas: G.Mobile.on ? '◀ ▶ ●  BOTÕES' : '← → ESPAÇO',
    }[d.controle];
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = `900 16px ${G.FONTE}`;
    const w = ctx.measureText(ctl).width + 40;
    G.retRedondo(ctx, 590 - w / 2, 350, w, 36, 18); ctx.fill();
    G.texto(ctx, ctl, 590, 374, { size: 16, align: 'center', color: '#fff', weight: 900 });
    ctx.globalAlpha = 1;
  }

  desenhaResultado(ctx) {
    const p = G.U.ease(this.et * 4);
    ctx.fillStyle = this.ok ? `rgba(20,160,80,${0.55 * p})` : `rgba(200,20,30,${0.55 * p})`;
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.save();
    ctx.translate(G.W / 2 + 90, 230);
    const s = 0.5 + p * 0.5;
    ctx.scale(s, s);
    ctx.rotate(this.ok ? -0.06 : 0.06);
    G.texto(ctx, this.ok ? 'MISSÃO CUMPRIDA!' : 'ERROU!', 0, 0, { size: this.ok ? 70 : 110, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 12 });
    ctx.restore();
    ctx.globalAlpha = p;
    G.Arte.boneco(ctx, this.heroi, 200, 480, { t: this.t, pose: this.ok ? 'comemora' : 'dano', esc: 1.6, celular: this.heroi === 'janones' });
    G.Arte.balao(ctx, this.frase, 230, 300, { size: 18, largura: 220 });
    if (!this.ok) {
      // o coração que se foi
      const y = 300 - this.et * 40;
      G.coracao(ctx, G.W / 2 + 90, y + 60, '#ff3b4a', 2.2);
      G.texto(ctx, '-1 CREDIBILIDADE', G.W / 2 + 90, y + 120, { size: 22, align: 'center', color: '#fff', stroke: '#111', lw: 5, weight: 900 });
    }
    ctx.globalAlpha = 1;
  }

  desenhaAviso(ctx, titulo, sub, cor, fundo) {
    G.fundoLiso(ctx, fundo);
    const p = G.U.ease(this.et * 3);
    ctx.save();
    ctx.translate(G.W / 2, G.H / 2);
    ctx.scale(0.3 + p * 0.7, 0.3 + p * 0.7);
    ctx.rotate(Math.sin(this.et * 20) * 0.03);
    G.texto(ctx, titulo, 0, 10, { size: 150, font: G.FONTE_TITULO, align: 'center', color: cor, stroke: '#111', lw: 16 });
    ctx.restore();
    G.texto(ctx, sub, G.W / 2, G.H / 2 + 90, { size: 24, align: 'center', color: '#fff', weight: 900 });
    if (titulo === 'CHEFÃO!') G.Arte.boneco(ctx, 'flavio', (this.et * 500) % (G.W + 200) - 100, 500, { t: this.et, pose: 'corre', medo: true, segura: 'dinheiro' });
  }
};

// coração (vida)
G.coracao = function (ctx, x, y, cor, esc = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(esc, esc);
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.moveTo(0, 9); ctx.bezierCurveTo(-15, -2, -9, -15, 0, -6); ctx.bezierCurveTo(9, -15, 15, -2, 0, 9); ctx.fill();
  ctx.restore();
};
