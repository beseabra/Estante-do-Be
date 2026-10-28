// ============================================================
//  A CORRIDA: você corre atrás do 01, que foge jogando coisas
//
//  A "distância" (gap) diminui sozinha enquanto você corre bem.
//  Levar dano, cair em buraco e as arrancadas dele aumentam.
//  gap chega a 0  -> você pega o 01
//  gap passa do máximo -> ele fugiu
// ============================================================
G.novaCampanha = () => ({ pontos: 0, votos: 0, missoes: 0, fakes: 0, queiroz: 0, acertos: 0, fantasmas: 0, picanhas: 0 });

G.CenaCorrida = class {
  constructor(n, heroi) {
    this.n = n;
    this.F = G.FASES[n];
    this.cen = G.Cenarios[this.F.id];
    this.heroi = heroi;
    this.H = G.HEROIS[heroi];
    this.pausavel = true;
    if (!G.Campanha) G.Campanha = G.novaCampanha();
    this.inicio = { ...G.Campanha }; // para recomeçar a fase do mesmo jeito
    this.C = G.Campanha;

    this.t = 0;
    this.scroll = 0;
    this.v = this.F.vel;
    this.p = { x: 210, y: G.CHAO, vy: 0, chao: true, pulos: 0, abaixado: false, vida: this.H.vida, inv: 0, tonto: 0, tiroCd: 0, boost: 0, fala: null };
    this.gap = 80;
    this.GAP_MAX = 132;
    this.fl = { x: 700, y: G.CHAO, vy: 0, chao: true, abaixa: 0, dor: 0, imune: 0, fala: null, falaT: 2.5, tiroT: 3, arrancT: G.U.rand(...this.F.arrancada) };
    this.obst = [];
    this.buracos = [];
    this.itens = [];
    this.tiros = [];      // seus
    this.jogados = [];    // o que o 01 joga
    this.queirozes = [];
    this.part = [];
    this.flut = [];       // textos flutuantes
    this.spawnT = 1.6;
    this.itemT = 0.6;
    this.especial = 0;
    this.efeito = null;   // especial acontecendo
    this.missao = null;
    this.missaoT = 7;
    this.estado = 'inicio'; // inicio | jogo | captura | japones | perdeu
    this.estadoT = 0;
    this.cena = 0;          // linha atual da fuga/cutscene
    this.alerta = 0;
  }

  enter() {
    G.Audio.musica('fase' + (this.n + 1));
    G.Mobile.rotuloEspecial(this.heroi === 'lula' ? 'L' : '★');
  }

  // ---------- ajudantes ----------
  flutua(txt, x, y, cor = '#fff', size = 18) { this.flut.push({ txt, x, y, cor, size, t: 0 }); }
  poeira(x, y, n, cor = 'rgba(255,255,255,0.8)', forca = 200) {
    for (let i = 0; i < n; i++) this.part.push({ x, y, vx: G.U.rand(-forca, forca), vy: G.U.rand(-forca * 1.5, -20), vida: G.U.rand(0.4, 0.9), cor, tam: G.U.rand(3, 7) });
  }
  falaHeroi(txt, voz) {
    this.p.fala = { txt, t: 0 };
    if (voz) G.Voz.falar(txt, this.heroi, false);
  }
  falaFlavio(txt, voz) {
    this.fl.fala = { txt, t: 0 };
    if (voz) G.Voz.falar(txt, 'flavio', false);
  }
  retPlayer() {
    const p = this.p;
    const h = p.abaixado ? 32 : 70;
    return { x: p.x - 14, y: p.y - h, w: 28, h };
  }
  sobreBuraco(x, folga = 8) {
    return this.buracos.find((b) => x - folga > b.x && x + folga < b.x + b.w);
  }

  // ---------- missões do Janones ----------
  novaMissao() {
    const validas = G.MISSOES.filter((m) => !m.fases || m.fases.includes(this.F.id));
    const m = G.U.pick(validas);
    const txt = m.txt.replace('{n}', m.n).replace('{t}', m.t);
    this.missao = { ...m, txt, prog: 0, tempo: m.t, fim: null, fimT: 0 };
    G.Audio.dizer('pessoal-urgente', 'Pessoal, urgente! ' + txt.replace(/\d+s/, ''), 'janones', true);
    G.Audio.tocar('zap');
  }
  evento(tipo, qtd = 1) {
    const m = this.missao;
    if (!m || m.fim) return;
    if (m.tipo === 'limpo') {
      if (tipo === 'dano') this.fimMissao(false);
      return;
    }
    if (m.tipo === tipo) {
      m.prog += qtd;
      if (m.prog >= m.n) this.fimMissao(true);
    }
  }
  fimMissao(ok) {
    const m = this.missao;
    m.fim = ok ? 'ok' : 'falhou';
    m.fimT = 0;
    m.frase = G.U.pick(ok ? G.MISSAO_OK : G.MISSAO_FALHOU);
    if (ok) {
      this.C.missoes++;
      this.C.pontos += 1000;
      this.especial = Math.min(100, this.especial + 30);
      this.gap = Math.max(0.5, this.gap - 4);
      G.Audio.dizer('missao-cumprida', 'Missão cumprida!', 'janones', true);
      this.flutua('+1000  MISSÃO CUMPRIDA!', 480, 200, '#7dff8a', 26);
    } else {
      G.Audio.dizer('missao-falhou', m.frase, 'janones', true);
    }
    this.missaoT = G.U.rand(7, 11);
  }

  // ---------- criar coisas ----------
  criaObstaculo() {
    const tipo = G.U.peso(this.F.obst);
    const def = G.OBST[tipo];
    const x = G.W + 40;
    if (def.tipo === 'buraco') {
      this.buracos.push({ x, w: def.w + G.U.rand(-15, 25), agua: !!def.agua });
      return def.w + 60;
    }
    const o = { tipo, def, x, w: def.w, h: def.h, vida: def.vida || 0, semente: Math.random() * 10 };
    if (def.tipo === 'chao' || def.tipo === 'anda') o.y = G.CHAO - def.h;
    else if (def.tipo === 'alto') o.y = G.CHAO - 50 - def.h;
    else if (def.tipo === 'voa') o.y = G.CHAO - def.alt;
    if (tipo === 'arbusto' && Math.random() < 0.55) o.queiroz = 'escondido';
    this.obst.push(o);
    // às vezes uma fileira de votos em cima do obstáculo (recompensa para quem pula)
    if (def.tipo === 'chao' && Math.random() < 0.5) {
      for (let i = 0; i < 3; i++) this.itens.push({ tipo: 'voto', x: x + def.w / 2 - 30 + i * 30, y: o.y - 50 - Math.sin((i / 2) * Math.PI) * 30 });
    }
    return def.w;
  }

  criaItens() {
    const r = Math.random();
    const x = G.W + 30;
    if (r < 0.1) this.itens.push({ tipo: 'picanha', x, y: G.CHAO - G.U.pick([40, 120]) });
    else if (r < 0.15 && this.p.vida < this.H.vida) this.itens.push({ tipo: 'cerveja', x, y: G.CHAO - 120 });
    else if (r < 0.22 && (this.F.id === 'chocolate' || this.F.id === 'mansao')) this.itens.push({ tipo: 'dinheiro', x, y: G.CHAO - 70 });
    else if (r < 0.6) { // fileira reta
      const alto = Math.random() < 0.35;
      for (let i = 0; i < 5; i++) this.itens.push({ tipo: 'voto', x: x + i * 34, y: G.CHAO - (alto ? 150 : 36) });
    } else { // arco
      for (let i = 0; i < 6; i++) this.itens.push({ tipo: 'voto', x: x + i * 32, y: G.CHAO - 40 - Math.sin((i / 5) * Math.PI) * 110 });
    }
  }

  // o 01 joga alguma coisa em você
  flavioJoga() {
    const tipo = G.U.pick(this.F.tiros);
    const fora = this.fl.x > G.W - 20;
    const x = fora ? G.W + 20 : this.fl.x - 20;
    const vx = -(this.v * 0.35 + 230);
    const j = { tipo, x, vx, t: 0, w: 30, h: 22 };
    if (tipo === 'bombom' || tipo === 'mala') {
      j.y = G.CHAO - 90; j.vy = -420; j.arco = true; j.w = 28; j.h = 26;
    } else if (tipo === 'fake') {
      j.y0 = G.CHAO - G.U.rand(50, 80); j.y = j.y0; j.vx = vx * 0.8; j.zigue = true; j.w = 44; j.h = 26;
    } else {
      j.y = G.CHAO - (Math.random() < 0.5 ? 26 : 60);
      if (tipo === 'boleto') { j.w = 26; j.h = 30; }
    }
    this.jogados.push(j);
    if (!fora) this.fl.joga = 0.3;
    if (Math.random() < 0.3) this.falaFlavio(G.U.pick(['Toma!', 'Pega isso!', 'Presente pra você!', 'Fica com o troco!']));
  }

  // ---------- especiais ----------
  usaEspecial() {
    this.especial = 0;
    this.p.inv = Math.max(this.p.inv, 1.8);
    this.efeito = { tipo: this.heroi === 'lula' ? 'L' : 'exercito', t: 0, limpou: false };
    G.Game.sacudir(8);
    if (this.heroi === 'lula') {
      G.Audio.tocar('buzina');
      G.Audio.dizer('faz-o-l', 'Faz o L!', 'lula', true);
    } else {
      G.Audio.dizer('exercito', 'Exército, ataque!', 'janones', true);
      G.Audio.tocar('zap');
      this.efeito.soldados = [];
      for (let i = 0; i < 16; i++) this.efeito.soldados.push({ x: -60 - i * 45 - Math.random() * 30, y: G.CHAO - (i % 3) * 6, t: Math.random() * 3, cabelo: G.U.pick(['#2a1a10', '#111', '#6b3b1f', '#c9a14a']), pele: G.U.pick(['#c68b62', '#8a5a3a', '#e8b894', '#5a3a22']) });
    }
  }
  limpaTela() {
    for (const o of this.obst) if (o.x < G.W + 40 && o.def.tipo !== 'buraco') { this.poeira(o.x + o.w / 2, o.y + o.h / 2, 10, '#ffd400', 260); o.morto = true; this.C.pontos += 50; }
    for (const j of this.jogados) { this.poeira(j.x, j.y, 6, '#fff', 200); j.morto = true; if (j.tipo === 'fake') { this.C.fakes++; this.evento('fake'); } }
    this.gap = Math.max(0.5, this.gap - 10);
    this.fl.dor = 1;
    this.falaFlavio(this.heroi === 'lula' ? 'O L NÃO! O L NÃO!' : 'É muito áudio! SOCORRO!');
  }

  // ============================================================
  update(dt) {
    this.t += dt;
    this.estadoT += dt;
    const p = this.p;

    // partículas e textos sempre andam
    for (const q of this.part) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 900 * dt; q.vida -= dt; }
    this.part = this.part.filter((q) => q.vida > 0);
    for (const f of this.flut) { f.t += dt; f.y -= 40 * dt; }
    this.flut = this.flut.filter((f) => f.t < 1.4);
    if (p.fala) { p.fala.t += dt; if (p.fala.t > 2.2) p.fala = null; }
    if (this.fl.fala) { this.fl.fala.t += dt; if (this.fl.fala.t > 2.4) this.fl.fala = null; }

    if (this.estado === 'inicio') {
      this.correFlavio(dt);
      if (this.estadoT > 2.2 || (this.estadoT > 0.6 && G.Input.avancar())) {
        this.estado = 'jogo';
        G.Audio.tocar('buzina');
        this.falaHeroi(G.U.pick(this.H.falas), true);
      }
      return;
    }
    if (this.estado === 'captura' || this.estado === 'japones') return this.updateCena(dt);
    if (this.estado === 'perdeu') {
      this.scroll += this.v * 0.3 * dt;
      this.fl.x += 400 * dt;
      if (this.estadoT > 1.6) G.Game.trocar(() => new G.CenaDerrota(this.n, this.heroi, this.motivo, this.inicio));
      return;
    }

    // ---------- velocidade ----------
    if (p.tonto > 0) p.tonto -= dt;
    if (p.inv > 0) p.inv -= dt;
    if (p.boost > 0) p.boost -= dt;
    const acel = 1 + Math.min(0.22, this.t / 150);
    this.v = this.F.vel * acel * (p.tonto > 0 ? 0.5 : 1) * (p.boost > 0 ? 1.15 : 1);
    const dx = this.v * dt;
    this.scroll += dx;

    // ---------- distância até o 01 ----------
    let fecha = this.F.fecha * (p.boost > 0 ? 2.6 : 1);
    if (p.tonto > 0) fecha = -3;
    this.gap -= fecha * dt;
    this.fl.arrancT -= dt;
    if (this.fl.arrancT <= 0) {
      this.fl.arrancT = G.U.rand(...this.F.arrancada);
      this.gap += G.U.rand(4, 7) * (1 + this.n * 0.08);
      G.Audio.tocar('arrancada');
      this.poeira(Math.min(this.fl.x, G.W - 10), G.CHAO, 8, 'rgba(255,255,255,0.7)', 120);
      this.falaFlavio(G.U.pick([...this.F.falas, ...G.FALAS_FLAVIO]), Math.random() < 0.35);
    }
    if (this.gap <= 0) return this.pegou();
    if (this.gap >= this.GAP_MAX) return this.perde('fugiu');
    this.alerta = this.gap > this.GAP_MAX - 18 ? this.alerta + dt : 0;

    // ---------- você ----------
    const inp = G.Input;
    const suportado = (p.y >= G.CHAO - 0.5 && !this.sobreBuraco(p.x)) || this.plataformaSob();
    if (p.chao && !suportado) { p.chao = false; p.pulos = Math.max(p.pulos, 1); }
    if (inp.hit('jump')) {
      if (p.chao) { p.vy = -840; p.chao = false; p.pulos = 1; G.Audio.tocar('pulo'); this.poeira(p.x, p.y, 5); }
      else if (p.pulos < 2) { p.vy = -720; p.pulos = 2; G.Audio.tocar('pulo'); this.poeira(p.x, p.y, 6, '#ffd400'); }
    }
    if (!inp.is('jump') && p.vy < -380) p.vy = -380; // soltar cedo = pulo baixo
    p.abaixado = inp.is('slide') && p.chao;
    if (!p.chao) {
      p.vy += (inp.is('slide') ? 4200 : 2300) * dt;
      const pesAntes = p.y;
      p.y += p.vy * dt;
      // pousou numa plataforma?
      if (p.vy > 0) {
        for (const o of this.obst) {
          if (o.tipo !== 'plat') continue;
          if (pesAntes <= o.y && p.y >= o.y && p.x > o.x - 8 && p.x < o.x + o.w + 8) { p.y = o.y; p.vy = 0; p.chao = true; p.pulos = 0; }
        }
      }
      if (p.y >= G.CHAO && !p.chao) {
        const buraco = this.sobreBuraco(p.x);
        if (!buraco && pesAntes <= G.CHAO + 4) { p.y = G.CHAO; p.vy = 0; p.chao = true; p.pulos = 0; }
        else if (p.y > G.H + 80) this.caiuNoBuraco(buraco);
      }
    }

    // tiro
    p.tiroCd -= dt;
    if ((inp.is('shoot') || inp.hit('shoot')) && p.tiroCd <= 0) {
      p.tiroCd = this.H.tiroCada;
      this.tiros.push({ x: p.x + 20, y: p.y - (p.abaixado ? 18 : 48), vx: this.heroi === 'lula' ? 720 : 860, t: 0, tipo: this.heroi === 'lula' ? 'picanha' : 'audio' });
      G.Audio.tocar(this.heroi === 'lula' ? 'tiro' : 'tiro-audio');
    }
    if (inp.hit('special')) {
      if (this.especial >= 100) this.usaEspecial();
      else this.flutua(`${this.H.especial} ainda carregando (${Math.floor(this.especial)}%)`, p.x + 60, p.y - 110, '#ffd400', 14);
    }

    // ---------- especial acontecendo ----------
    if (this.efeito) {
      const e = this.efeito;
      e.t += dt;
      if (!e.limpou && e.t > 0.35) { e.limpou = true; this.limpaTela(); }
      if (e.soldados) for (const s of e.soldados) { s.x += 900 * dt; s.t += dt; }
      if (e.t > 2.2) this.efeito = null;
    }

    // ---------- o mundo andando ----------
    for (const b of this.buracos) b.x -= dx;
    this.buracos = this.buracos.filter((b) => b.x + b.w > -20);
    for (const o of this.obst) {
      o.x += -dx + (o.def.vx || 0) * dt;
      if (o.queiroz === 'escondido' && o.x < p.x + 300) {
        o.queiroz = 'saiu';
        this.queirozes.push({ x: o.x + o.w / 2, y: o.y + 20, vy: -520, t: 0, dono: o, frase: G.U.pick(['Tô de férias!', 'Que Queiroz?', 'Só passando!', 'Ninguém me viu!']) });
        G.Audio.tocar('queiroz');
      }
    }
    this.obst = this.obst.filter((o) => !o.morto && o.x + o.w > -60);
    for (const it of this.itens) it.x -= dx;
    this.itens = this.itens.filter((it) => !it.pego && it.x > -40);

    this.spawnT -= dx;
    if (this.spawnT <= 0) {
      const largura = this.criaObstaculo();
      this.spawnT = largura + G.U.rand(300, 560) - Math.min(120, this.n * 25);
      // de vez em quando uma plataforma com votos em cima
      if (Math.random() < 0.18) this.criaPlataforma();
    }
    this.itemT -= dt;
    if (this.itemT <= 0) { this.criaItens(); this.itemT = G.U.rand(1.3, 2.4); }

    // ---------- o 01 ----------
    this.correFlavio(dt);

    // ---------- o que ele joga ----------
    for (const j of this.jogados) {
      j.t += dt;
      j.x += j.vx * dt;
      if (j.arco) {
        j.vy += 1100 * dt; j.y += j.vy * dt;
        if (j.y > G.CHAO - j.h / 2) { j.y = G.CHAO - j.h / 2; j.vy = -Math.abs(j.vy) * 0.45; if (Math.abs(j.vy) < 80) j.vy = 0; }
      }
      if (j.zigue) j.y = j.y0 + Math.sin(j.t * 5) * 22;
    }
    this.jogados = this.jogados.filter((j) => !j.morto && j.x > -60);
    this.fl.tiroT -= dt;
    if (this.fl.tiroT <= 0) { this.fl.tiroT = G.U.rand(...this.F.tiroCada); this.flavioJoga(); }

    // ---------- Queiroz pulando das moitas ----------
    for (const q of this.queirozes) {
      q.t += dt;
      q.x -= dx;
      if (q.t < 0.5) { q.vy += 1400 * dt; q.y += q.vy * dt; if (q.y > q.dono.y - 10) q.y = q.dono.y - 10; }
    }
    this.queirozes = this.queirozes.filter((q) => !q.achado && q.x > -40 && q.t < 3.2);

    // ---------- seus tiros ----------
    for (const s of this.tiros) {
      s.t += dt;
      s.x += s.vx * dt;
      const r = { x: s.x - 14, y: s.y - 10, w: 28, h: 20 };
      for (const j of this.jogados) {
        if (j.morto || !G.U.bate(r, { x: j.x - j.w / 2, y: j.y - j.h / 2, w: j.w, h: j.h })) continue;
        j.morto = true; s.morto = true;
        this.C.pontos += 25;
        this.especial = Math.min(100, this.especial + (j.tipo === 'fake' ? 5 : 2));
        this.poeira(j.x, j.y, 8, j.tipo === 'fake' ? '#25d366' : '#fff');
        if (j.tipo === 'fake') { this.C.fakes++; this.evento('fake'); this.flutua('DESMENTIDO!', j.x, j.y - 20, '#7dff8a', 16); }
        G.Audio.tocar('acerto');
        break;
      }
      if (s.morto) continue;
      for (const o of this.obst) {
        if (o.morto || o.tipo === 'plat' || o.def.tipo === 'alto') continue;
        if (!G.U.bate(r, o)) continue;
        s.morto = true;
        if (o.vida > 0) {
          o.vida--;
          o.pisca = 0.15;
          G.Audio.tocar('acerto');
          if (o.vida <= 0) {
            o.morto = true;
            this.C.pontos += 100;
            this.especial = Math.min(100, this.especial + 5);
            this.poeira(o.x + o.w / 2, o.y + o.h / 2, 14, o.tipo === 'fantasma' ? '#e8ecff' : '#ffd400', 250);
            if (o.tipo === 'fantasma') { this.C.fantasmas++; this.evento('fantasma'); this.flutua(G.U.pick(['EXORCIZADO!', 'DEMITIDO!', 'NUNCA EXISTIU!']), o.x, o.y - 10, '#e8ecff', 16); }
            else if (o.tipo === 'drone') this.flutua('DERRUBADO!', o.x, o.y - 10, '#ffd400', 16);
            else if (o.tipo === 'mordomo') this.flutua('O MORDOMO NÃO VIU NADA', o.x, o.y - 10, '#fff', 14);
          }
        } else this.poeira(s.x, s.y, 4, '#ccc', 100);
        break;
      }
      if (s.morto) continue;
      for (const q of this.queirozes) {
        if (G.U.bate(r, { x: q.x - 18, y: q.y - 80, w: 36, h: 80 })) { s.morto = true; this.achaQueiroz(q); break; }
      }
      if (s.morto) continue;
      // acertou o 01?
      if (this.fl.x < G.W && this.fl.imune <= 0 && G.U.bate(r, { x: this.fl.x - 18, y: this.fl.y - 90, w: 36, h: 90 })) {
        s.morto = true;
        this.gap = Math.max(0.3, this.gap - 0.7);
        this.fl.dor = 0.4;
        this.fl.imune = 1.1;
        this.C.acertos++;
        this.C.pontos += 50;
        this.evento('acertar');
        this.poeira(this.fl.x, this.fl.y - 60, 8, s.tipo === 'picanha' ? '#b8483a' : '#dcf8c6');
        G.Audio.tocar('acerto');
        if (Math.random() < 0.5) this.falaFlavio(G.U.pick(G.FALAS_FLAVIO_DOR));
      }
    }
    this.tiros = this.tiros.filter((s) => !s.morto && s.x < G.W + 40);

    // ---------- pegar itens ----------
    const rp = this.retPlayer();
    for (const it of this.itens) {
      if (!G.U.bate(rp, { x: it.x - 15, y: it.y - 15, w: 30, h: 30 })) continue;
      it.pego = true;
      if (it.tipo === 'voto') {
        this.C.votos++; this.C.pontos += 13; this.especial = Math.min(100, this.especial + 1.5);
        this.evento('votos');
        G.Audio.tocar('voto');
      } else if (it.tipo === 'picanha') {
        p.boost = 3.5; this.C.picanhas++; this.C.pontos += 100; this.especial = Math.min(100, this.especial + 10);
        this.evento('picanha');
        G.Audio.tocar('picanha');
        this.flutua('PICANHA! TURBO!', it.x, it.y - 20, '#ffb08a', 20);
        if (this.heroi === 'lula') this.falaHeroi('Picanha, companheiro!', Math.random() < 0.5);
        else this.falaHeroi('PICANHA! Vou fazer um áudio!', false);
      } else if (it.tipo === 'cerveja') {
        p.vida = Math.min(this.H.vida, p.vida + 1);
        G.Audio.tocar('cerveja');
        this.flutua('CERVEJINHA! +1 CREDIBILIDADE', it.x, it.y - 20, '#ffd400', 16);
      } else if (it.tipo === 'dinheiro') {
        this.C.pontos += 200;
        G.Audio.tocar('voto');
        this.flutua('DEVOLVIDO AO POVO! +200', it.x, it.y - 20, '#7dff8a', 16);
      }
    }
    for (const q of this.queirozes) if (!q.achado && G.U.bate(rp, { x: q.x - 18, y: q.y - 80, w: 36, h: 80 })) this.achaQueiroz(q);

    // ---------- levar dano ----------
    if (p.inv <= 0) {
      let bateu = null;
      for (const o of this.obst) {
        if (o.morto || o.tipo === 'plat') continue;
        const enc = { x: o.x + 6, y: o.y + 6, w: o.w - 12, h: o.h - 8 };
        if (G.U.bate(rp, enc)) { bateu = o; break; }
      }
      if (!bateu) for (const j of this.jogados) {
        if (!j.morto && G.U.bate(rp, { x: j.x - j.w / 2 + 5, y: j.y - j.h / 2 + 5, w: j.w - 10, h: j.h - 10 })) { bateu = j; j.morto = true; break; }
      }
      if (bateu) this.levaDano();
    }

    // ---------- missões ----------
    if (this.missao) {
      const m = this.missao;
      if (m.fim) { m.fimT += dt; if (m.fimT > 2.6) this.missao = null; }
      else {
        m.tempo -= dt;
        if (m.tipo === 'limpo') { m.prog += dt; if (m.prog >= m.n) this.fimMissao(true); }
        else if (m.tempo <= 0) this.fimMissao(false);
      }
    } else {
      this.missaoT -= dt;
      if (this.missaoT <= 0) this.novaMissao();
    }
  }

  plataformaSob() {
    const p = this.p;
    return this.obst.some((o) => o.tipo === 'plat' && Math.abs(p.y - o.y) < 1 && p.x > o.x - 8 && p.x < o.x + o.w + 8);
  }

  criaPlataforma() {
    const w = G.U.rand(130, 200);
    const o = { tipo: 'plat', def: { tipo: 'plat' }, x: G.W + 160, y: G.CHAO - G.U.rand(105, 135), w, h: 16, semente: 0 };
    this.obst.push(o);
    for (let i = 0; i < Math.floor(w / 34); i++) this.itens.push({ tipo: Math.random() < 0.08 ? 'picanha' : 'voto', x: o.x + 18 + i * 34, y: o.y - 26 });
  }

  achaQueiroz(q) {
    if (q.achado) return;
    q.achado = true;
    this.C.queiroz++;
    this.C.pontos += 500;
    this.especial = Math.min(100, this.especial + 15);
    this.evento('queiroz');
    this.flutua(G.U.pick(['ACHOU O QUEIROZ! +500', 'TAVA AQUI O TEMPO TODO! +500', 'QUEIROZ LOCALIZADO! +500']), q.x, q.y - 100, '#ffd400', 18);
    this.poeira(q.x, q.y - 40, 12, '#ff7a3d');
    G.Audio.dizer('queiroz', 'Achei o Queiroz!', this.heroi, false);
  }

  levaDano() {
    const p = this.p;
    p.vida--;
    p.inv = 1.4;
    p.tonto = 0.55;
    this.gap += 6;
    G.Game.sacudir(7);
    G.Audio.tocar('dano');
    this.evento('dano');
    this.poeira(p.x, p.y - 40, 10, '#ff5555');
    this.falaHeroi(G.U.pick(this.H.dano), Math.random() < 0.4);
    if (Math.random() < 0.5) this.falaFlavio(G.U.pick(['HAHAHA!', 'Bem feito!', 'Tá ok?', 'Mito!']));
    if (p.vida <= 0) this.perde('credibilidade');
  }

  caiuNoBuraco(b) {
    const p = this.p;
    if (b) this.buracos = this.buracos.filter((x) => x !== b); // o buraco "fecha" para você voltar
    p.y = G.CHAO - 220; p.vy = 0; p.chao = false; p.pulos = 1;
    if (b && b.agua) { G.Audio.tocar('splash'); this.flutua('TCHIBUM! Piscina financiada!', p.x + 40, 300, '#7fd4ff', 18); }
    // cair não tira credibilidade, só deixa o 01 abrir distância
    this.gap += 9;
    p.inv = Math.max(p.inv, 1);
    G.Game.sacudir(5);
    if (!(b && b.agua)) { G.Audio.tocar('dano'); this.flutua('CAIU NO BURACO DO ORÇAMENTO!', p.x + 60, 300, '#ff8a8a', 16); }
  }

  // o 01 corre, pula os obstáculos sozinho e abaixa nas faixas
  correFlavio(dt) {
    const fl = this.fl;
    const alvo = this.p.x + 30 + this.gap * 5.6;
    fl.x += (alvo - fl.x) * Math.min(1, dt * 4);
    if (fl.dor > 0) fl.dor -= dt;
    if (fl.imune > 0) fl.imune -= dt;
    if (fl.joga > 0) fl.joga -= dt;
    fl.abaixa = 0;
    if (fl.chao) {
      const perto = (x, w) => x < fl.x + 70 && x + w > fl.x - 10;
      for (const o of this.obst) {
        if (o.tipo === 'plat' || o.morto) continue;
        if (o.def.tipo === 'alto') { if (perto(o.x, o.w)) fl.abaixa = 1; continue; }
        if (o.def.tipo === 'voa') continue;
        if (perto(o.x, o.w)) { fl.vy = -760; fl.chao = false; break; }
      }
      if (fl.chao) for (const b of this.buracos) if (perto(b.x, b.w)) { fl.vy = -760; fl.chao = false; break; }
    } else {
      fl.vy += 2300 * dt;
      fl.y += fl.vy * dt;
      if (fl.y >= G.CHAO) { fl.y = G.CHAO; fl.vy = 0; fl.chao = true; }
    }
    fl.falaT -= dt;
    if (fl.falaT <= 0 && this.estado === 'jogo') {
      fl.falaT = G.U.rand(3.5, 6);
      if (!fl.fala) this.falaFlavio(G.U.pick([...this.F.falas, ...this.F.falas, ...G.FALAS_FLAVIO]), Math.random() < 0.2);
    }
  }

  // ---------- fim da fase ----------
  pegou() {
    this.gap = 0;
    this.estadoT = 0;
    this.cena = 0;
    this.jogados = [];
    this.missao = null;
    this.efeito = null;
    this.C.pontos += 2000;
    G.Audio.tocar('captura');
    G.Game.sacudir(10);
    this.poeira(this.p.x + 40, this.p.y - 50, 30, '#ffd400', 350);
    if (this.n === G.FASES.length - 1) {
      this.estado = 'japones';
      this.jap = { x: G.W + 80 };
      G.Audio.pararMusica();
      G.Audio.tocar('japones');
      G.Audio.musica('titulo');
    } else {
      this.estado = 'captura';
      G.Audio.dizer('perseguicao', 'Isso é perseguição política!', 'flavio', true);
      G.Save.gravar('fase', this.n + 1);
    }
  }

  perde(motivo) {
    if (this.estado === 'perdeu') return;
    this.estado = 'perdeu';
    this.estadoT = 0;
    this.motivo = motivo;
    this.missao = null;
    G.Audio.pararMusica();
    G.Audio.tocar('trombone');
    this.falaFlavio(motivo === 'fugiu' ? 'TCHAU, QUERIDA! Vou pra Miami!' : 'Perdeu a credibilidade, hein? HAHAHA!', true);
  }

  // as cenas depois de pegar o 01 (texto que avança com Enter/toque)
  updateCena(dt) {
    const p = this.p;
    p.abaixado = false;
    if (!p.chao) { p.vy += 2300 * dt; p.y += p.vy * dt; if (p.y >= G.CHAO) { p.y = G.CHAO; p.vy = 0; p.chao = true; } }
    const fl = this.fl;
    if (!fl.chao) { fl.vy += 2300 * dt; fl.y += fl.vy * dt; if (fl.y >= G.CHAO) { fl.y = G.CHAO; fl.vy = 0; fl.chao = true; } }
    const linhas = this.linhasCena();
    const ultima = this.cena >= linhas.length - 1;
    if (this.estado === 'captura') {
      if (ultima) fl.x += 520 * dt; // e lá vai ele de novo
      else fl.x += (p.x + 44 - fl.x) * Math.min(1, dt * 8);
    } else {
      fl.x += (p.x + 44 - fl.x) * Math.min(1, dt * 8);
      this.jap.x += (fl.x + 70 - this.jap.x) * Math.min(1, dt * 2.5);
    }
    if (this.estadoT > 0.8 && G.Input.avancar()) {
      if (ultima) {
        if (window.speechSynthesis) speechSynthesis.cancel();
        if (this.estado === 'captura') G.Game.trocar(() => new G.CenaZap(this.n + 1, this.heroi));
        else G.Game.trocar(() => new G.CenaUrna(this.heroi), '#fff');
        return;
      }
      this.cena++;
      this.estadoT = 0.4;
      const l = this.linhasCena()[this.cena];
      if (l.quem) G.Voz.falar(l.txt, l.quem, true);
      if (l.som) G.Audio.tocar(l.som);
    }
  }

  linhasCena() {
    if (this.estado === 'captura') {
      return this.F.fuga.map((txt, i) => ({ txt, som: i === 1 ? 'boom' : i === this.F.fuga.length - 1 ? 'arrancada' : null }));
    }
    const h = this.heroi === 'lula' ? 'lula' : 'janones';
    return [
      { txt: 'Você agarrou o 01 bem no portão de embarque!' },
      { txt: 'Uma sirene. Passos firmes. Óculos escuros...', som: 'sirene' },
      { txt: 'É ELE. O JAPONÊS DA FEDERAL!', som: 'japones' },
      { quem: 'japones', txt: 'Bom dia, senador. Polícia Federal. O senhor vai ter que me acompanhar.' },
      { quem: 'flavio', txt: 'Isso é perseguição política! Eu só vendia chocolate!' },
      { quem: h, txt: h === 'lula' ? 'Companheiro, agora é com a Justiça. Eu vou é votar.' : 'PESSOAL, URGENTE! PEGARAM O 01! COMPARTILHEM!' },
      { txt: 'Mas a missão mais importante ainda não acabou: VOTAR!' },
    ];
  }

  // ============================================================
  draw(ctx) {
    const t = this.t;
    const p = this.p;
    this.cen.fundo(ctx, this.scroll, t);

    // chão com buracos
    const bs = [...this.buracos].sort((a, b) => a.x - b.x);
    let x0 = 0;
    for (const b of bs) {
      if (b.x > x0) G.desenhaChao(ctx, this.cen, x0, b.x, this.scroll);
      if (b.agua) G.desenhaChao(ctx, this.cen, b.x, b.x + b.w, this.scroll, true);
      else { ctx.fillStyle = '#120a08'; ctx.fillRect(b.x, G.CHAO, b.w, G.H - G.CHAO); }
      x0 = Math.max(x0, b.x + b.w);
    }
    if (x0 < G.W) G.desenhaChao(ctx, this.cen, x0, G.W, this.scroll);

    // plataformas e obstáculos
    for (const o of this.obst) {
      if (o.tipo === 'plat') { this.desenhaPlataforma(ctx, o); continue; }
      ctx.save();
      if (o.pisca > 0) { o.pisca -= 1 / 60; ctx.globalAlpha = 0.5; }
      o.def.draw(ctx, o, t, this.F.id);
      ctx.restore();
    }
    // itens
    for (const it of this.itens) G.Arte.item(ctx, it.tipo, it.x, it.y + Math.sin(t * 4 + it.x * 0.05) * 3, t);
    // Queiroz dançando
    for (const q of this.queirozes) {
      G.Arte.boneco(ctx, 'queiroz', q.x, q.y, { t: q.t, pose: q.t < 0.5 ? 'pula' : 'danca', dir: -1, esc: 0.9 });
      if (q.t > 0.4 && q.t < 2.2) G.Arte.balao(ctx, q.frase, q.x, q.y - 92, { size: 12, largura: 110 });
    }

    // o 01
    this.desenhaFlavio(ctx);
    // Japonês da Federal
    if (this.estado === 'japones') G.Arte.boneco(ctx, 'japones', this.jap.x, G.CHAO, { t, pose: this.estadoT < 1 && this.cena < 3 ? 'corre' : 'parado', dir: -1, esc: 1.08 });

    // você
    if (this.estado !== 'perdeu' || this.estadoT < 1.6) {
      const pisca = p.inv > 0 && Math.floor(t * 16) % 2 === 0 && this.estado === 'jogo';
      if (!pisca) {
        let pose = 'corre';
        if (p.abaixado) pose = 'abaixa';
        else if (!p.chao) pose = 'pula';
        if (p.tonto > 0) pose = 'dano';
        if (this.estado === 'captura' || this.estado === 'japones') pose = this.cena >= 5 ? 'comemora' : 'parado';
        if (this.estado === 'perdeu') pose = 'dano';
        if (this.estado === 'inicio') pose = 'parado';
        if (p.boost > 0 && pose === 'corre') { ctx.globalAlpha = 0.3; G.Arte.boneco(ctx, this.heroi, p.x - 18, p.y, { t: t - 0.05, pose, celular: this.heroi === 'janones' }); ctx.globalAlpha = 1; }
        G.Arte.boneco(ctx, this.heroi, p.x, p.y, { t, pose, celular: this.heroi === 'janones' && pose === 'corre' });
      }
    }

    // tiros e o que ele joga
    for (const s of this.tiros) G.Arte.item(ctx, s.tipo, s.x, s.y, s.t, 0.8);
    for (const j of this.jogados) G.Arte.item(ctx, j.tipo, j.x, j.y, j.t);

    // especial
    if (this.efeito) this.desenhaEfeito(ctx, this.efeito);

    // partículas
    for (const q of this.part) { ctx.globalAlpha = Math.min(1, q.vida * 2); ctx.fillStyle = q.cor; ctx.fillRect(q.x - q.tam / 2, q.y - q.tam / 2, q.tam, q.tam); }
    ctx.globalAlpha = 1;

    // balões
    if (p.fala && this.estado === 'jogo') G.Arte.balao(ctx, p.fala.txt, p.x + 10, p.y - (p.abaixado ? 50 : 100), { size: 14, largura: 180 });
    if (this.fl.fala && this.fl.x < G.W - 30 && this.estado !== 'captura' && this.estado !== 'japones') G.Arte.balao(ctx, this.fl.fala.txt, this.fl.x, this.fl.y - 108, { size: 14, largura: 190, fundo: '#fff8c8' });

    for (const f of this.flut) G.texto(ctx, f.txt, f.x, f.y, { size: f.size, align: 'center', color: f.cor, stroke: '#111', lw: 4, weight: 900 });

    this.desenhaHUD(ctx);

    if (this.estado === 'inicio') this.desenhaInicio(ctx);
    if (this.estado === 'captura' || this.estado === 'japones') this.desenhaCena(ctx);
    if (this.estado === 'perdeu') {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.5, this.estadoT * 0.4)})`; ctx.fillRect(0, 0, G.W, G.H);
      G.texto(ctx, this.motivo === 'fugiu' ? 'O 01 FUGIU!' : 'SEM CREDIBILIDADE!', G.W / 2, 260, { size: 80, font: G.FONTE_TITULO, align: 'center', color: '#ff4040', stroke: '#111', lw: 10 });
    }
  }

  desenhaPlataforma(ctx, o) {
    const cores = { alerj: ['#8a5a2a', '#6a4018'], chocolate: ['#5a2e1a', '#e8b923'], atibaia: ['#6b4a2a', '#3e8a3e'], mansao: ['#fff', '#c8c8c8'], aeroporto: ['#555', '#ffd400'] }[this.F.id];
    ctx.fillStyle = cores[0]; G.retRedondo(ctx, o.x, o.y, o.w, o.h, 5); ctx.fill();
    ctx.fillStyle = cores[1]; ctx.fillRect(o.x + 4, o.y + 2, o.w - 8, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(o.x + 10, o.y + o.h, o.w - 20, 6);
  }

  desenhaFlavio(ctx) {
    const fl = this.fl;
    const t = this.t;
    if (fl.x > G.W + 30) {
      // seta na beirada mostrando que ele está fora da tela
      const pis = Math.sin(t * 10) > 0;
      ctx.fillStyle = pis ? '#ffd400' : '#ff4040';
      ctx.beginPath(); ctx.moveTo(G.W - 8, G.CHAO - 60); ctx.lineTo(G.W - 36, G.CHAO - 80); ctx.lineTo(G.W - 36, G.CHAO - 40); ctx.fill();
      G.texto(ctx, '01', G.W - 52, G.CHAO - 54, { size: 20, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 4 });
      return;
    }
    let pose = 'corre';
    if (!fl.chao) pose = 'pula';
    if (fl.abaixa) pose = 'abaixa';
    if (fl.dor > 0) pose = 'dano';
    if (this.estado === 'inicio') pose = 'parado';
    if (this.estado === 'captura') pose = this.cena >= this.F.fuga.length - 1 ? 'corre' : 'dano';
    if (this.estado === 'japones') pose = this.cena >= 3 ? 'algemado' : 'dano';
    if (fl.imune > 0 && this.estado === 'jogo' && Math.floor(t * 20) % 2) ctx.globalAlpha = 0.45;
    G.Arte.boneco(ctx, 'flavio', fl.x, fl.y, { t: t * 1.1, pose, segura: fl.joga > 0 ? null : 'dinheiro', medo: true });
    ctx.globalAlpha = 1;
    // nome em cima
    if (this.estado === 'jogo') G.texto(ctx, '01', fl.x, fl.y - 112 - (fl.fala ? 60 : 0), { size: 16, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 4 });
  }

  desenhaEfeito(ctx, e) {
    const t = e.t;
    if (e.tipo === 'L') {
      const a = t < 0.35 ? t / 0.35 : Math.max(0, 1 - (t - 0.35) / 1.6);
      ctx.fillStyle = `rgba(255,40,40,${a * 0.45})`; ctx.fillRect(0, 0, G.W, G.H);
      ctx.save();
      ctx.translate(G.W / 2, G.H / 2 - 20);
      const s = 0.4 + G.U.ease(t * 2) * 1.2;
      ctx.scale(s, s);
      ctx.rotate(-0.1);
      ctx.globalAlpha = Math.min(1, a * 1.5);
      // a mão fazendo o L: indicador pra cima, polegar pro lado
      ctx.fillStyle = '#e3a676'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
      G.retRedondo(ctx, 0, 6, 120, 34, 17); ctx.fill(); ctx.stroke();        // polegar
      G.retRedondo(ctx, -48, -10, 96, 96, 26); ctx.fill(); ctx.stroke();     // punho
      G.retRedondo(ctx, -48, -130, 34, 136, 17); ctx.fill(); ctx.stroke();   // indicador
      ctx.beginPath();                                                       // dedos dobrados
      for (const yy of [22, 46, 70]) { ctx.moveTo(-6, yy); ctx.lineTo(40, yy); }
      ctx.stroke();
      ctx.fillStyle = '#d11f2b'; G.retRedondo(ctx, -54, 80, 108, 30, 6); ctx.fill(); ctx.stroke(); // manga
      ctx.restore();
      ctx.globalAlpha = Math.min(1, a * 1.5);
      G.texto(ctx, 'FAZ O L!', G.W / 2, G.H / 2 + 150, { size: 90, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#d11f2b', lw: 14 });
      ctx.globalAlpha = 1;
    } else {
      const a = Math.max(0, 1 - Math.max(0, t - 1.5) / 0.7);
      ctx.fillStyle = `rgba(37,211,102,${a * 0.25})`; ctx.fillRect(0, 0, G.W, G.H);
      for (const s of e.soldados) G.Arte.boneco(ctx, 'soldado', s.x, s.y, { t: s.t, pose: 'corre', celular: true, esc: 0.75, cor: { pele: s.pele }, cabelo: s.cabelo });
      ctx.globalAlpha = a;
      G.texto(ctx, 'EXÉRCITO DO LULA!', G.W / 2, 160, { size: 70, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#128c7e', lw: 12 });
      G.texto(ctx, 'MISSÃO DADA É MISSÃO CUMPRIDA', G.W / 2, 200, { size: 26, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 6 });
      ctx.globalAlpha = 1;
    }
  }

  desenhaHUD(ctx) {
    const p = this.p;
    const t = this.t;
    // credibilidade
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; G.retRedondo(ctx, 12, 10, 190, 52, 12); ctx.fill();
    G.texto(ctx, 'CREDIBILIDADE', 24, 28, { size: 11, color: '#ffd400', weight: 900 });
    for (let i = 0; i < this.H.vida; i++) {
      const cheio = i < p.vida;
      ctx.save(); ctx.translate(34 + i * 32, 44);
      ctx.fillStyle = cheio ? '#ff3b4a' : 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-14, -2, -8, -14, 0, -6); ctx.bezierCurveTo(8, -14, 14, -2, 0, 8); ctx.fill();
      ctx.restore();
    }

    // barra de distância
    const bx = 290, bw = 380, by = 22;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; G.retRedondo(ctx, bx - 30, 10, bw + 60, 52, 12); ctx.fill();
    const perigo = this.gap > this.GAP_MAX - 18;
    G.texto(ctx, `DISTÂNCIA DO 01: ${Math.ceil(this.gap)} m`, bx + bw / 2, by + 6, { size: 12, align: 'center', color: perigo && Math.sin(t * 12) > 0 ? '#ff4040' : '#fff', weight: 900 });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; G.retRedondo(ctx, bx, by + 14, bw, 12, 6); ctx.fill();
    const frac = G.U.clamp(this.gap / this.GAP_MAX, 0, 1);
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    g.addColorStop(0, '#2ad46a'); g.addColorStop(0.6, '#ffd400'); g.addColorStop(1, '#ff3b3b');
    ctx.fillStyle = g; G.retRedondo(ctx, bx, by + 14, Math.max(12, bw * frac), 12, 6); ctx.fill();
    // carinhas nas pontas
    for (const [quem, x] of [[this.heroi, bx - 4], ['flavio', bx + bw * frac]]) {
      ctx.save(); ctx.translate(x, by + 20); ctx.scale(0.55, 0.55);
      G.Arte.cabeca(ctx, quem, G.Arte.TIPOS[quem], 'parado', t, {});
      ctx.restore();
    }

    // votos e pontos
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; G.retRedondo(ctx, G.W - 222, 10, 210, 52, 12); ctx.fill();
    G.Arte.item(ctx, 'voto', G.W - 196, 36, 0, 0.9);
    G.texto(ctx, String(this.C.votos), G.W - 174, 44, { size: 22, color: '#fff', weight: 900 });
    G.texto(ctx, 'PONTOS', G.W - 24, 28, { size: 11, align: 'right', color: '#ffd400', weight: 900 });
    G.texto(ctx, this.C.pontos.toLocaleString('pt-BR'), G.W - 24, 50, { size: 18, align: 'right', color: '#fff', weight: 900 });

    // especial
    const cheio = this.especial >= 100;
    const ex = 14, ey = G.H - 46;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; G.retRedondo(ctx, ex, ey, 220, 34, 10); ctx.fill();
    ctx.fillStyle = cheio ? (Math.sin(t * 10) > 0 ? '#ffd400' : '#ff3b3b') : this.heroi === 'lula' ? '#d11f2b' : '#25d366';
    G.retRedondo(ctx, ex + 4, ey + 4, 212 * (this.especial / 100), 26, 8); ctx.fill();
    const tecla = G.Mobile.on ? '' : ' [C]';
    G.texto(ctx, cheio ? `${this.H.especial}${tecla} PRONTO!` : this.H.especial, ex + 110, ey + 23, { size: 15, align: 'center', color: '#fff', stroke: '#111', lw: 3, weight: 900 });

    // fase
    G.texto(ctx, `${this.n + 1}. ${this.F.titulo.toUpperCase()}`, G.W - 14, G.H - 14, { size: 13, align: 'right', color: 'rgba(255,255,255,0.85)', stroke: 'rgba(0,0,0,0.6)', lw: 3, weight: 900 });

    // missão do Janones
    if (this.missao) this.desenhaMissao(ctx, this.missao);

    // alerta de fuga
    if (this.alerta > 0 && this.estado === 'jogo' && Math.sin(t * 10) > 0) {
      G.texto(ctx, 'ELE TÁ FUGINDO! CORRE!', G.W / 2, 110, { size: 34, font: G.FONTE_TITULO, align: 'center', color: '#ff4040', stroke: '#fff', lw: 6 });
    }
  }

  desenhaMissao(ctx, m) {
    const w = 300, x = G.W - w - 12, y = 72;
    const entra = G.U.ease(Math.min(1, (m.t || 0)));
    m.t = (m.t || 0) + 1 / 60;
    ctx.save();
    ctx.translate((1 - entra) * 340, 0);
    ctx.fillStyle = '#dcf8c6';
    G.retRedondo(ctx, x, y, w, 92, 12); ctx.fill();
    ctx.strokeStyle = '#128c7e'; ctx.lineWidth = 3; ctx.stroke();
    // carinha do Janones
    ctx.save(); ctx.translate(x + 30, y + 40); ctx.scale(0.8, 0.8);
    G.Arte.cabeca(ctx, 'janones', G.Arte.TIPOS.janones, 'fala', this.t, { celular: true });
    ctx.restore();
    G.texto(ctx, this.heroi === 'janones' ? 'Janones (você mesmo) 🔊' : 'Janones 🔊', x + 60, y + 20, { size: 12, color: '#128c7e', weight: 900 });
    if (m.fim) {
      G.texto(ctx, m.fim === 'ok' ? 'MISSÃO CUMPRIDA!' : 'MISSÃO FALHOU', x + 60, y + 48, { size: 22, font: G.FONTE_TITULO, color: m.fim === 'ok' ? '#0b9b3c' : '#d11f2b' });
      G.texto(ctx, m.frase, x + 60, y + 72, { size: 13, color: '#333' });
    } else {
      const linhas = G.quebra(ctx, 'PESSOAL, URGENTE! ' + m.txt, w - 72, 13);
      linhas.slice(0, 3).forEach((l, i) => G.texto(ctx, l, x + 60, y + 38 + i * 16, { size: 13, color: '#222' }));
      const prog = m.tipo === 'limpo' ? m.prog / m.n : m.prog / m.n;
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 60, y + 78, w - 72, 6);
      ctx.fillStyle = '#25d366'; ctx.fillRect(x + 60, y + 78, (w - 72) * Math.min(1, prog), 6);
      if (m.tipo !== 'limpo') G.texto(ctx, `${Math.max(0, Math.ceil(m.tempo))}s`, x + w - 12, y + 20, { size: 12, align: 'right', color: m.tempo < 5 ? '#d11f2b' : '#555', weight: 900 });
    }
    ctx.restore();
  }

  desenhaInicio(ctx) {
    const a = Math.min(1, this.estadoT * 3);
    ctx.fillStyle = `rgba(0,0,0,${0.35 * a})`; ctx.fillRect(0, 170, G.W, 150);
    G.texto(ctx, `FASE ${this.n + 1}`, G.W / 2, 220, { size: 26, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 5 });
    G.texto(ctx, this.F.titulo.toUpperCase(), G.W / 2, 280, { size: 60, font: G.FONTE_TITULO, align: 'center', color: '#fff', stroke: '#111', lw: 10 });
    G.texto(ctx, this.F.lugar, G.W / 2, 308, { size: 16, align: 'center', color: '#fff', stroke: '#111', lw: 4 });
  }

  desenhaCena(ctx) {
    const linhas = this.linhasCena();
    const l = linhas[this.cena];
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, G.W, G.H);
    if (this.estado === 'captura' && this.cena === 0) G.texto(ctx, 'PEGOU!', G.W / 2, 270, { size: 110, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 14 });
    if (this.estado === 'captura' && this.cena === 1) { // carimbo do STJ & cia.
      ctx.save(); ctx.translate(G.W / 2, 245); ctx.rotate(-0.15);
      ctx.strokeStyle = '#d11f2b'; ctx.lineWidth = 8; ctx.strokeRect(-230, -55, 460, 100);
      const carimbo = { alerj: 'ANULADO', chocolate: 'DISFARÇADO', atibaia: 'DISTRAÍDO', mansao: 'TCHIBUM' }[this.F.id];
      G.texto(ctx, carimbo, 0, 25, { size: 80, font: G.FONTE_TITULO, align: 'center', color: '#d11f2b' });
      ctx.restore();
    }
    if (this.estado === 'japones' && this.cena >= 2) G.texto(ctx, 'O JAPONÊS DA FEDERAL', G.W / 2, 262, { size: 54, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 10 });
    // a caixa de texto
    const x = 120, y = 74, w = G.W - 240;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    G.retRedondo(ctx, x, y, w, 96, 16); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.stroke();
    const nome = { japones: 'JAPONÊS DA FEDERAL', flavio: 'O 01', lula: 'LULA', janones: 'JANONES' }[l.quem];
    if (nome) G.texto(ctx, nome, x + 20, y + 26, { size: 16, color: '#d11f2b', weight: 900 });
    G.quebra(ctx, l.txt, w - 40, 20).forEach((li, i) => G.texto(ctx, li, x + 20, y + (nome ? 54 : 42) + i * 24, { size: 20, color: '#111' }));
    if (Math.sin(this.t * 6) > 0) G.texto(ctx, '▶', x + w - 22, y + 84, { size: 16, color: '#111' });
  }
};
