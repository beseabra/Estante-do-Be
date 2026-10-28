// ============================================================
//  DERROTA (o 01 fugiu) e FINAIS (depende do voto na urna)
// ============================================================
G.CenaDerrota = class {
  constructor(n, heroi, motivo, inicio) {
    this.n = n;
    this.heroi = heroi;
    this.motivo = motivo;
    this.inicio = inicio;
    this.t = 0;
    this.piada = G.U.pick([
      'O irmão já foi buscar ele no aeroporto.',
      'Ele já abriu uma loja de chocolate em Orlando.',
      'Chegou um ofício: "fuga anulada por vício processual".',
      'O Queiroz mandou um vídeo dançando de lá.',
      'Ele postou uma live: "estou sendo perseguido no free shop".',
    ]);
  }
  enter() {
    G.Audio.musica('derrota');
    G.Voz.falar(this.heroi === 'lula' ? 'Companheiro, a gente levanta e tenta de novo.' : 'Pessoal... missão dada é missão cumprida. De novo!', this.heroi, true);
  }
  update(dt) {
    this.t += dt;
    if (this.t < 0.8) return;
    if (G.Input.hit('back')) { G.Game.trocar(() => new G.CenaTitulo()); return; }
    if (G.Input.avancar()) {
      G.Campanha = { ...this.inicio };
      G.Game.trocar(() => new G.CenaCorrida(this.n, this.heroi));
    }
  }
  draw(ctx) {
    const t = this.t;
    G.degrade(ctx, ['#1a1030', '#3a1a40', '#7a2a3a']);
    // o avião indo embora, com o 01 dando tchau na janela
    const ax = ((300 + t * 140) % (G.W + 400)) - 200, ay = 250 - ax * 0.08;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#c8ccd4';
    ctx.beginPath(); ctx.moveTo(-30, 8); ctx.lineTo(30, 8); ctx.lineTo(-10, 64); ctx.lineTo(-50, 64); ctx.fill();   // asa
    ctx.beginPath(); ctx.moveTo(-118, -14); ctx.lineTo(-140, -66); ctx.lineTo(-108, -66); ctx.lineTo(-80, -14); ctx.fill(); // cauda
    ctx.fillStyle = '#eee';
    G.retRedondo(ctx, -140, -24, 280, 48, 24); ctx.fill();
    ctx.fillStyle = '#1d4fa8'; ctx.fillRect(-130, 6, 250, 5);
    ctx.fillStyle = '#7fd4ff';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-80 + i * 34, -6, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.arc(56, -6, 12, 0, Math.PI * 2); ctx.clip();
    ctx.translate(56, 4); ctx.scale(0.5, 0.5); G.Arte.cabeca(ctx, 'flavio', G.Arte.TIPOS.flavio, 'parado', t, {});
    ctx.restore();
    G.texto(ctx, 'VOO 01 · MIAMI', 0, 20, { size: 11, align: 'center', color: '#1d4fa8', weight: 900 });
    ctx.restore();

    G.texto(ctx, this.motivo === 'fugiu' ? 'O 01 FUGIU!' : 'SEM CREDIBILIDADE!', G.W / 2, 110, { size: 80, font: G.FONTE_TITULO, align: 'center', color: '#ff4040', stroke: '#111', lw: 10 });
    G.texto(ctx, this.motivo === 'fugiu' ? 'Ele abriu muita distância e embarcou.' : 'Você levou tanta pancada que ninguém mais acredita em você.', G.W / 2, 150, { size: 18, align: 'center', color: '#fff' });
    G.texto(ctx, this.piada, G.W / 2, 400, { size: 20, align: 'center', color: '#ffd400', weight: 900 });

    G.Arte.boneco(ctx, this.heroi, 110, 520, { t, pose: 'fala', celular: this.heroi === 'janones', esc: 1.2 });
    G.Arte.balao(ctx, this.heroi === 'lula' ? 'Companheiro, a gente levanta e tenta de novo!' : 'Pessoal... MISSÃO DADA É MISSÃO CUMPRIDA. De novo!', 150, 405, { size: 14, largura: 200 });
    if (this.t > 0.8 && Math.sin(t * 5) > -0.3) {
      G.texto(ctx, G.Mobile.on ? 'TOQUE PARA TENTAR DE NOVO' : 'ENTER: TENTAR DE NOVO  ·  ESC: TÍTULO', 620, 480, { size: 26, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 5 });
    }
  }
};

G.CenaFinal = class {
  constructor(heroi, voto) {
    this.heroi = heroi;
    this.voto = voto; // '13' | '22' | 'branco' | 'nulo'
    this.t = 0;
    this.parte = 0; // 0 = cena, 1 = resultados e créditos
    this.confete = [];
    this.C = G.Campanha || G.novaCampanha();
    G.Save.gravar('fase', 0);
    const recorde = G.Save.ler('recorde', 0);
    this.recorde = this.C.pontos > recorde;
    if (this.recorde) G.Save.gravar('recorde', this.C.pontos);
    this.audios = [];
  }
  enter() {
    if (this.voto === '13') {
      G.Audio.musica('vitoria');
      G.Audio.tocar('buzina');
      G.Voz.falar('O amor venceu de novo! Picanha e cervejinha pra todo mundo!', 'lula', true);
    } else if (this.voto === '22') {
      G.Audio.musica('urna');
      G.Voz.falar('O voto foi registrado. Mas o candidato está ocupado prestando depoimento.', 'narrador', true);
    } else {
      G.Audio.musica('derrota');
      G.Audio.dizer('pessoal-urgente', 'Pessoal, urgente! Quem foi que votou ' + this.voto + '?', 'janones', true);
    }
  }
  update(dt) {
    this.t += dt;
    if (this.voto === '13' || this.parte === 1) {
      if (this.confete.length < 160) for (let i = 0; i < 3; i++) this.confete.push({ x: G.U.rand(0, G.W), y: -20, vy: G.U.rand(60, 160), vx: G.U.rand(-30, 30), r: G.U.rand(0, 6), tipo: G.U.pick(['estrela', 'papel', 'papel', 'voto']), cor: G.U.pick(['#d11f2b', '#ffd400', '#fff', '#ff6b6b']) });
    }
    for (const c of this.confete) { c.y += c.vy * dt; c.x += c.vx * dt + Math.sin(this.t * 2 + c.r) * 0.5; c.r += dt * 3; }
    this.confete = this.confete.filter((c) => c.y < G.H + 30);
    // voto nulo/branco: chuva de áudios do Janones
    if ((this.voto === 'nulo' || this.voto === 'branco') && this.parte === 0 && this.audios.length < 40 && Math.random() < dt * 8) {
      this.audios.push({ x: G.U.rand(600, 860), y: -30, alvo: 500 - this.audios.length * 11, vy: G.U.rand(180, 300), dur: `${G.U.randi(0, 9)}:${String(G.U.randi(0, 59)).padStart(2, '0')}` });
      G.Audio.tocar('zap');
    }
    for (const a of this.audios) { a.y += a.vy * dt; if (a.y > a.alvo) a.y = a.alvo; }
    if (this.t > 1 && G.Input.avancar()) {
      if (this.parte === 0) { this.parte = 1; this.t = 0.5; G.Audio.tocar('seleciona'); }
      else G.Game.trocar(() => new G.CenaTitulo());
    }
  }
  draw(ctx) {
    const t = this.t;
    if (this.parte === 0) { this.desenhaCena(ctx, t); this.desenhaConfete(ctx); }
    else this.desenhaResultados(ctx, t);
    if (t > 1 && Math.sin(this.t * 5) > -0.3) G.texto(ctx, G.Mobile.on ? 'toque para continuar' : 'ENTER para continuar', G.W - 20, G.H - 16, { size: 15, align: 'right', color: '#fff', stroke: '#111', lw: 4 });
  }

  desenhaConfete(ctx) {
    for (const c of this.confete) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r);
      if (c.tipo === 'estrela') G.Arte.estrela(ctx, 0, 0, 8, c.cor);
      else if (c.tipo === 'voto') G.Arte.item(ctx, 'voto', 0, 0, c.r, 0.6);
      else { ctx.fillStyle = c.cor; ctx.fillRect(-4, -2, 8, 4); }
      ctx.restore();
    }
  }

  desenhaCena(ctx, t) {
    if (this.voto === '13') {
      G.fundoComicio(ctx, t);
      // palanque
      ctx.fillStyle = '#7a1018'; ctx.fillRect(140, 430, 680, 110);
      ctx.fillStyle = '#ffd400'; ctx.fillRect(140, 430, 680, 8);
      G.texto(ctx, '13', 480, 520, { size: 70, font: G.FONTE_TITULO, align: 'center', color: '#ffd400' });
      G.Arte.boneco(ctx, 'lula', 400, 430, { t, pose: 'comemora', esc: 1.6 });
      G.Arte.boneco(ctx, 'janones', 560, 430, { t: t + 0.3, pose: 'comemora', esc: 1.45 });
      G.Arte.boneco(ctx, 'queiroz', 760, 430, { t, pose: 'danca', esc: 1.1, dir: -1 });
      G.Arte.balao(ctx, 'Eu só vim pela festa!', 760, 330, { size: 13, largura: 140 });
      // lá no canto: o 01 com o Japonês
      G.Arte.boneco(ctx, 'flavio', 70, 520, { t, pose: 'algemado', esc: 0.8 });
      G.Arte.boneco(ctx, 'japones', 115, 520, { t, esc: 0.85, dir: -1 });
      ctx.save(); ctx.translate(G.W / 2, 110 + Math.sin(t * 3) * 5); ctx.rotate(-0.03);
      G.texto(ctx, 'O AMOR VENCEU', 0, 0, { size: 84, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 12, shadow: 'rgba(0,0,0,0.4)' });
      G.texto(ctx, '(DE NOVO)', 0, 52, { size: 40, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 8 });
      ctx.restore();
      G.Arte.balao(ctx, 'Picanha e cervejinha pra todo mundo!', 400, 250, { size: 15, largura: 200 });
    } else if (this.voto === '22') {
      G.degrade(ctx, ['#1d2a3a', '#2c3e55']);
      G.texto(ctx, 'VOCÊ VOTOU NO 22...', G.W / 2, 90, { size: 64, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 10 });
      G.texto(ctx, 'O voto foi registrado. Mas o candidato está ocupado prestando depoimento.', G.W / 2, 130, { size: 18, align: 'center', color: '#fff' });
      // sala de depoimento
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(300, 380, 360, 20);
      G.Arte.boneco(ctx, 'flavio', 420, 470, { t, pose: 'algemado', esc: 1.5 });
      G.Arte.boneco(ctx, 'japones', 560, 470, { t, esc: 1.5, dir: -1, pose: 'fala' });
      G.Arte.balao(ctx, 'Obrigado pelo voto! Pode me emprestar pro advogado?', 420, 300, { size: 15, largura: 220 });
      G.Arte.balao(ctx, 'Pode continuar, senador. Desde 2018.', 590, 220, { size: 14, largura: 170 });
      G.Arte.boneco(ctx, this.heroi, 140, 520, { t, pose: 'dano', celular: this.heroi === 'janones', esc: 1.2 });
      G.Arte.balao(ctx, this.heroi === 'lula' ? 'Companheiro... sério?' : 'PESSOAL... URGENTE... 😐', 150, 400, { size: 15, largura: 170 });
    } else {
      G.degrade(ctx, ['#e8e8e8', '#cfcfcf']);
      G.texto(ctx, this.voto === 'branco' ? 'VOTO EM BRANCO' : 'VOTO NULO', 300, 100, { size: 64, font: G.FONTE_TITULO, align: 'center', color: '#333', stroke: '#fff', lw: 8 });
      G.texto(ctx, 'O Janones ficou sabendo.', 300, 140, { size: 20, align: 'center', color: '#333' });
      G.Arte.boneco(ctx, 'janones', 300, 470, { t, pose: 'fala', celular: true, esc: 1.7 });
      G.Arte.balao(ctx, 'PESSOAL, URGENTE! Vou explicar em 40 áudios!', 300, 320, { size: 16, largura: 240 });
      for (const a of this.audios) {
        ctx.fillStyle = '#dcf8c6'; G.retRedondo(ctx, a.x - 70, a.y - 14, 140, 28, 14); ctx.fill();
        ctx.fillStyle = '#128c7e'; ctx.beginPath(); ctx.moveTo(a.x - 58, a.y - 6); ctx.lineTo(a.x - 50, a.y); ctx.lineTo(a.x - 58, a.y + 6); ctx.fill();
        for (let i = 0; i < 12; i++) ctx.fillRect(a.x - 44 + i * 6, a.y - 2 - (i % 3) * 2, 3, 4 + (i % 3) * 4);
        G.texto(ctx, a.dur, a.x + 62, a.y + 5, { size: 11, align: 'right', color: '#555' });
      }
    }
  }

  desenhaResultados(ctx, t) {
    G.fundoComicio(ctx, t * 0.5, ['#0b6b2c', '#0a5a25']);
    this.desenhaConfete(ctx);
    const C = this.C;
    const rank = C.pontos > 40000 ? 'MINISTRO DAS MISSÕES' : C.pontos > 25000 ? 'GENERAL DA PICANHA' : C.pontos > 15000 ? 'SARGENTO DO ZAP' : C.pontos > 7000 ? 'CABO ELEITORAL' : 'SOLDADO RASO DO ZAP';
    ctx.fillStyle = 'rgba(0,30,10,0.85)'; G.retRedondo(ctx, 40, 30, 430, 480, 18); ctx.fill();
    G.texto(ctx, 'RESULTADO DA CAMPANHA', 255, 74, { size: 32, font: G.FONTE_TITULO, align: 'center', color: '#ffd400' });
    const linhas = [
      ['Pontos', C.pontos.toLocaleString('pt-BR') + (this.recorde ? '  ★ RECORDE!' : '')],
      ['Votos coletados', C.votos],
      ['Missões do Janones cumpridas', C.missoes],
      ['Fake news desmentidas', C.fakes],
      ['Vezes que achou o Queiroz', C.queiroz],
      ['Acertos no 01', C.acertos],
      ['Assessores fantasmas exorcizados', C.fantasmas],
      ['Picanhas comidas', C.picanhas],
      ['Seu voto', { '13': '13 (LULA)', '22': '22 (sério?)', branco: 'BRANCO', nulo: 'NULO' }[this.voto]],
    ];
    linhas.forEach(([k, v], i) => {
      G.texto(ctx, k, 64, 124 + i * 36, { size: 16, color: '#dcf8c6' });
      G.texto(ctx, String(v), 446, 124 + i * 36, { size: 18, align: 'right', color: '#fff', weight: 900 });
    });
    G.texto(ctx, 'SUA PATENTE:', 255, 460, { size: 14, align: 'center', color: '#dcf8c6' });
    G.texto(ctx, rank, 255, 492, { size: 30, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 5 });

    // créditos
    ctx.fillStyle = 'rgba(0,30,10,0.85)'; G.retRedondo(ctx, 500, 30, 420, 480, 18); ctx.fill();
    G.CREDITOS.forEach((l, i) => G.texto(ctx, l, 710, 76 + i * 30, { size: i === 0 ? 20 : 13, align: 'center', color: i === 0 ? '#ffd400' : '#fff', weight: i === 0 ? 900 : 800, font: i === 0 ? G.FONTE_TITULO : G.FONTE }));
    G.Arte.boneco(ctx, 'lula', 640, 500, { t, pose: 'comemora', esc: 0.8 });
    G.Arte.boneco(ctx, 'janones', 710, 500, { t: t + 0.4, pose: 'comemora', esc: 0.8 });
    G.Arte.boneco(ctx, 'queiroz', 780, 500, { t, pose: 'danca', esc: 0.7 });
  }
};
