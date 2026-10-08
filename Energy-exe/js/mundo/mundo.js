// ============================================================
//  O MUNDO: desenho, câmera, colisão, caminhos e interação
//  Tudo no canvas é desenhado em resolução baixa e ampliado
//  sem suavização (pixel art). Texto fica no HTML.
// ============================================================
F.Mundo = {
  andar: 'terreo',
  cam: { x: 0, y: 0 },
  zoom: 2,
  t: 0,
  jogador: null,
  npcs: [],
  alvo: null,          // com o que dá para interagir agora
  pendente: null,      // interação que vai acontecer quando chegar lá
  fade: 0,
  zonaAtual: null,
  marcaToque: null,

  init() {
    this.cv = document.getElementById('mundo');
    this.ctx = this.cv.getContext('2d');
    window.addEventListener('resize', () => this.redimensionar());
    this.redimensionar();
    F.ANDARES.forEach((id) => this.preparar(F.MAPAS[id]));
  },

  redimensionar() {
    const w = window.innerWidth, h = window.innerHeight;
    const paisagem = w >= h;
    let z = paisagem ? h / (15 * F.T) : w / (12 * F.T);
    z = F.u.clamp(z, 1, 4);
    this.zoom = z;
    this.cv.width = Math.round(w / z);
    this.cv.height = Math.round(h / z);
    this.ctx.imageSmoothingEnabled = false;
    // redimensionar apaga o canvas: redesenha na hora (ex.: ao girar o celular)
    if (this.jogador && F.S && F.Jogo.cena === 'jogo') { this.centrar(true); this.draw(); }
  },

  // ---------- preparação de cada andar ----------
  preparar(M) {
    const T = F.T;
    M.solido = new Uint8Array(M.w * M.h);
    for (let i = 0; i < M.g.length; i++) M.solido[i] = M.g[i] === '.' ? 0 : 1;
    M.moveis.forEach((m) => {
      if (!m.solido) return;
      for (let y = m.y; y < m.y + m.h; y++) for (let x = m.x; x < m.x + m.w; x++) if (x >= 0 && y >= 0 && x < M.w && y < M.h) M.solido[M.i(x, y)] = 1;
    });
    this.desenharChao(M);
    M.moveis.forEach((m) => this.spriteMovel(m));
  },
  redesenhar(id) { this.preparar(F.MAPAS[id]); },

  desenharChao(M) {
    const T = F.T;
    const cv = M.chao || document.createElement('canvas');
    cv.width = M.w * T; cv.height = M.h * T;
    const c = cv.getContext('2d');
    const rnd = F.u.semente(M.id.length * 999 + 7);
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
      const i = M.i(x, y), px = x * T, py = y * T;
      if (M.g[i] === '.') (F.Pisos[M.p[i]] || F.Pisos.claro)(c, px, py, rnd);
    }
    // faixas de segurança da fábrica
    if (M.id === 'terreo') {
      c.fillStyle = '#e3b52c';
      M.zonas.filter((z) => z.dep === 'fabrica' && z.id !== 'recepcao' && z.id !== 'corredor0').forEach((z) => {
        for (let k = 0; k < z.w * T; k += 16) { c.fillRect(z.x * T + k, z.y * T + 2, 8, 3); c.fillRect(z.x * T + k, (z.y + z.h) * T - 5, 8, 3); }
      });
    }
    // paredes (com a "frente" visível quando há chão embaixo)
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
      const i = M.i(x, y), px = x * T, py = y * T, g = M.g[i];
      if (g === '.') continue;
      const embaixo = y + 1 < M.h ? M.g[M.i(x, y + 1)] : '#';
      if (g === 'v') {
        c.fillStyle = 'rgba(160,210,240,0.55)'; c.fillRect(px, py, T, T);
        c.fillStyle = '#7d8a99'; c.fillRect(px, py, T, 2); c.fillRect(px, py + T - 3, T, 3);
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(px + 6, py + 6, 2, T - 14); c.fillRect(px + 10, py + 6, 1, T - 20);
        continue;
      }
      c.fillStyle = '#3a404d'; c.fillRect(px, py, T, T);
      c.fillStyle = '#454c5b'; c.fillRect(px, py, T, 2);
      if (embaixo === '.') {
        c.fillStyle = '#d8d1c1'; c.fillRect(px, py + 12, T, T - 12);
        c.fillStyle = '#c4bcaa'; c.fillRect(px, py + 12, T, 2);
        c.fillStyle = '#7a7466'; c.fillRect(px, py + T - 4, T, 4);
      }
    }
    // nomes pintados no chão
    M.rotulos.forEach((r) => {
      c.font = `bold ${r.tam}px monospace`; c.textAlign = 'center'; c.fillStyle = r.cor;
      c.fillText(r.texto, r.x * T, r.y * T);
    });
    c.textAlign = 'left';
    M.chao = cv;
  },

  // cada móvel vira uma imagem pronta (com espaço em cima para a "altura")
  spriteMovel(m) {
    const T = F.T, folga = 24;
    const cv = document.createElement('canvas');
    cv.width = m.w * T + 8; cv.height = m.h * T + folga + 8;
    const c = cv.getContext('2d');
    (F.Moveis[m.tipo] || F.Moveis.vazio)(c, 4, folga, m.w * T, m.h * T, m);
    m.sprite = cv; m.folga = folga;
  },

  mapa() { return F.MAPAS[this.andar]; },

  // ---------- colisão ----------
  solidoEm(px, py) {
    const M = this.mapa(), T = F.T;
    const x = Math.floor(px / T), y = Math.floor(py / T);
    if (x < 0 || y < 0 || x >= M.w || y >= M.h) return true;
    return M.solido[M.i(x, y)] === 1;
  },
  livre(x, y, quem) {
    const hw = 7;
    if (this.solidoEm(x - hw, y - 1) || this.solidoEm(x + hw, y - 1) || this.solidoEm(x - hw, y - 9) || this.solidoEm(x + hw, y - 9)) return false;
    for (const n of this.npcs) {
      if (n === quem) continue;
      if (Math.abs(n.x - x) < 14 && Math.abs(n.y - y) < 10) return false;
    }
    if (quem && quem !== this.jogador && this.jogador && Math.abs(this.jogador.x - x) < 14 && Math.abs(this.jogador.y - y) < 10) return false;
    return true;
  },
  mover(e, dx, dy) {
    if (dx && this.livre(e.x + dx, e.y, e)) e.x += dx;
    else if (dx && !dy) { // escorrega nos cantos
      if (this.livre(e.x + dx, e.y - 4, e)) e.y -= 1; else if (this.livre(e.x + dx, e.y + 4, e)) e.y += 1;
    }
    if (dy && this.livre(e.x, e.y + dy, e)) e.y += dy;
    else if (dy && !dx) {
      if (this.livre(e.x - 4, e.y + dy, e)) e.x -= 1; else if (this.livre(e.x + 4, e.y + dy, e)) e.x += 1;
    }
  },

  // ---------- caminhos (busca em largura no grid) ----------
  caminho(de, para, perto = false) {
    const M = this.mapa(), T = F.T;
    const sx = Math.floor(de.x / T), sy = Math.floor((de.y - 4) / T);
    let tx = Math.floor(para.x / T), ty = Math.floor(para.y / T);
    const ok = (x, y) => x >= 0 && y >= 0 && x < M.w && y < M.h && !M.solido[M.i(x, y)];
    const W = M.w;
    const veio = new Int32Array(M.w * M.h).fill(-1);
    const fila = [sy * W + sx];
    veio[sy * W + sx] = sy * W + sx;
    let achou = -1, melhor = -1, melhorD = 1e9;
    while (fila.length) {
      const c = fila.shift();
      const cx = c % W, cy = (c / W) | 0;
      const d = Math.abs(cx - tx) + Math.abs(cy - ty);
      if (cx === tx && cy === ty) { achou = c; break; }
      if (perto && d <= 1) { achou = c; break; }
      if (d < melhorD) { melhorD = d; melhor = c; }
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + ax, ny = cy + ay;
        if (!ok(nx, ny)) continue;
        const ni = ny * W + nx;
        if (veio[ni] !== -1) continue;
        veio[ni] = c; fila.push(ni);
      }
    }
    if (achou < 0) achou = perto ? melhor : -1;
    if (achou < 0) return null;
    const pts = [];
    for (let c = achou; c !== sy * W + sx; c = veio[c]) pts.push({ x: (c % W) * T + T / 2, y: ((c / W) | 0) * T + T - 6 });
    pts.reverse();
    return pts;
  },

  // ---------- entrar num andar ----------
  irPara(andar, ponto) {
    this.andar = andar;
    const M = this.mapa(), T = F.T;
    const p = ponto || M.chegada;
    this.jogador.x = p.x * T; this.jogador.y = p.y * T + 10;
    this.jogador.dir = 'baixo';
    this.jogador.caminho = null;
    this.pendente = null;
    this.npcs = F.Pessoas.doAndar(andar);
    this.fade = 1;
    this.zonaAtual = null;
    this.centrar(true);
  },

  centrar(instantaneo) {
    const M = this.mapa(), T = F.T, j = this.jogador;
    const vw = this.cv.width, vh = this.cv.height - 40 / this.zoom;
    let cx = j.x - vw / 2, cy = j.y - 20 - vh / 2;
    cx = F.u.clamp(cx, -16, Math.max(-16, M.w * T - vw + 16));
    cy = F.u.clamp(cy, -40, Math.max(-40, M.h * T - vh + 16));
    if (M.w * T < vw) cx = (M.w * T - vw) / 2;
    if (instantaneo) { this.cam.x = cx; this.cam.y = cy; }
    else { this.cam.x += (cx - this.cam.x) * 0.15; this.cam.y += (cy - this.cam.y) * 0.15; }
  },

  zonaEm(x, y) {
    const T = F.T, tx = x / T, ty = (y - 4) / T;
    const zs = this.mapa().zonas;
    // as zonas menores (salas) têm prioridade
    let melhor = null;
    for (const z of zs) if (tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h) { if (!melhor || z.w * z.h < melhor.w * melhor.h) melhor = z; }
    return melhor;
  },

  // ---------- quadro a quadro ----------
  update(dt, ativo) {
    this.t += dt;
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt * 3);
    const j = this.jogador;
    this.npcs.forEach((n) => F.Pessoas.update(n, dt, ativo));
    if (!ativo) { j.andando = false; F.UI.prompt(null); this.centrar(); return; }

    // toque / clique no mundo
    const tq = F.Input.toque;
    if (tq) this.tocou(tq);

    // teclado
    const e = F.Input.eixo();
    const vel = 120;
    let dx = 0, dy = 0;
    if (e.x || e.y) {
      j.caminho = null; this.pendente = null; this.marcaToque = null;
      const len = Math.hypot(e.x, e.y);
      dx = (e.x / len) * vel * dt; dy = (e.y / len) * vel * dt;
    } else if (j.caminho && j.caminho.length) {
      const p = j.caminho[0];
      const ax = p.x - j.x, ay = p.y - j.y, d = Math.hypot(ax, ay);
      if (d < 3) { j.caminho.shift(); }
      else { dx = (ax / d) * Math.min(vel * dt, d); dy = (ay / d) * Math.min(vel * dt, d); }
      if (!j.caminho.length) { j.caminho = null; this.marcaToque = null; }
    }
    if (dx || dy) {
      const antes = { x: j.x, y: j.y };
      this.mover(j, dx, dy);
      j.andando = Math.abs(j.x - antes.x) + Math.abs(j.y - antes.y) > 0.01;
      if (j.andando) j.passo += dt * 8;
      if (Math.abs(dx) > Math.abs(dy)) j.dir = dx < 0 ? 'esq' : 'dir'; else j.dir = dy < 0 ? 'cima' : 'baixo';
      if (!j.andando && j.caminho) { j.travado = (j.travado || 0) + dt; if (j.travado > 0.6) { j.caminho = null; j.travado = 0; } }
      else j.travado = 0;
    } else j.andando = false;

    // em que sala estou?
    const z = this.zonaEm(j.x, j.y);
    if (z !== this.zonaAtual) { const antes = this.zonaAtual; this.zonaAtual = z; if (z) F.Dia.entrouZona(z, antes); F.UI.local(); }

    // com quem / com o que dá para interagir
    this.alvo = this.procurarAlvo();
    if (this.pendente && !j.caminho) {
      const p = this.pendente; this.pendente = null;
      if (this.alcanca(p)) { this.olharPara(p); F.Interacao.com(p); }
    }
    F.UI.prompt(this.alvo);
    if (F.Input.interagir() && this.alvo && performance.now() - (F.UI.fechouEm || 0) > 250) { this.olharPara(this.alvo); F.Interacao.com(this.alvo); }

    this.centrar();
  },

  alcanca(a) {
    const j = this.jogador;
    if (a.npc) return Math.hypot(a.npc.x - j.x, a.npc.y - j.y) < 70;
    return this.distMovel(a.movel) < 26;
  },
  distMovel(m) {
    const T = F.T, j = this.jogador;
    const x0 = m.x * T, y0 = m.y * T, x1 = (m.x + m.w) * T, y1 = (m.y + m.h) * T;
    const px = F.u.clamp(j.x, x0, x1), py = F.u.clamp(j.y - 6, y0, y1);
    return Math.hypot(px - j.x, py - (j.y - 6));
  },
  procurarAlvo() {
    const j = this.jogador;
    let melhor = null, md = 1e9;
    for (const n of this.npcs) {
      const d = Math.hypot(n.x - j.x, n.y - j.y);
      if (d < 70 && d < md) { md = d; melhor = { npc: n }; }
    }
    for (const m of this.mapa().moveis) {
      if (!m.acao) continue;
      const d = this.distMovel(m);
      if (d < 26 && d + 20 < md) { md = d + 20; melhor = { movel: m }; }
    }
    return melhor;
  },
  olharPara(a) {
    const j = this.jogador, T = F.T;
    const tx = a.npc ? a.npc.x : (a.movel.x + a.movel.w / 2) * T;
    const ty = a.npc ? a.npc.y : (a.movel.y + a.movel.h / 2) * T;
    const dx = tx - j.x, dy = ty - j.y;
    j.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esq' : 'dir') : (dy < 0 ? 'cima' : 'baixo');
    if (a.npc) {
      const n = a.npc;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'dir' : 'esq') : (dy < 0 ? 'baixo' : 'cima');
      n.caminho = null; n.espera = 3;
    }
  },

  // tocou/clicou na tela
  tocou(tq) {
    const T = F.T;
    const wx = tq.x / this.zoom + this.cam.x, wy = tq.y / this.zoom + this.cam.y;
    const j = this.jogador;
    // numa pessoa?
    let alvo = null;
    for (const n of this.npcs) if (Math.abs(wx - n.x) < 12 && wy < n.y + 4 && wy > n.y - 42) alvo = { npc: n };
    if (!alvo) for (const m of this.mapa().moveis) {
      if (!m.acao) continue;
      if (wx >= m.x * T && wx < (m.x + m.w) * T && wy >= m.y * T - 16 && wy < (m.y + m.h) * T) alvo = { movel: m };
    }
    if (alvo) {
      if (this.alcanca(alvo)) { this.olharPara(alvo); F.Interacao.com(alvo); return; }
      const dest = alvo.npc ? { x: alvo.npc.x, y: alvo.npc.y - 4 } : { x: (alvo.movel.x + alvo.movel.w / 2) * T, y: (alvo.movel.y + alvo.movel.h / 2) * T };
      j.caminho = this.caminho(j, dest, true);
      this.pendente = alvo;
      this.marcaToque = { x: dest.x, y: dest.y, t: 0 };
      return;
    }
    j.caminho = this.caminho(j, { x: wx, y: wy }, true);
    this.pendente = null;
    this.marcaToque = { x: wx, y: wy, t: 0 };
  },

  // ---------- desenho ----------
  draw() {
    const ctx = this.ctx, M = this.mapa(), T = F.T;
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    ctx.fillStyle = '#16181e'; ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    ctx.drawImage(M.chao, -cx, -cy);

    // móveis e pessoas, ordenados pela linha do chão (quem está mais embaixo fica na frente)
    const lista = [];
    for (const m of M.moveis) lista.push({ y: (m.y + m.h) * T - 1, m });
    for (const n of this.npcs) lista.push({ y: n.y, n });
    lista.push({ y: this.jogador.y, j: this.jogador });
    lista.sort((a, b) => a.y - b.y);

    for (const it of lista) {
      if (it.m) {
        const m = it.m, x = m.x * T - cx, y = m.y * T - cy;
        if (x > this.cv.width + 40 || y > this.cv.height + 40 || x + m.w * T < -40 || y + m.h * T < -40) continue;
        ctx.drawImage(m.sprite, x - 4, y - m.folga);
        const anim = F.MoveisAnim[m.tipo];
        if (anim) anim(ctx, x, y, m.w * T, m.h * T, m, this.t);
      } else if (it.n) {
        F.Pessoas.draw(ctx, it.n, cx, cy, this.t);
      } else {
        const j = it.j;
        F.Arte.pessoa(ctx, j.x - cx, j.y - cy, j.look, j.dir, j.andando ? j.passo : 0, { parado: !j.andando });
      }
    }

    // marcadores sobre as cabeças
    for (const n of this.npcs) F.Pessoas.marcador(ctx, n, cx, cy, this.t);

    // destino do toque
    if (this.marcaToque) {
      const mt = this.marcaToque; mt.t += 1 / 60;
      const r = 4 + Math.sin(mt.t * 8) * 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(mt.x - cx - r) + 0.5, Math.round(mt.y - cy - r / 2) + 0.5, Math.round(r * 2), Math.round(r));
    }
    // brilho sobre o que dá para usar
    if (this.alvo && this.alvo.movel) {
      const m = this.alvo.movel;
      ctx.strokeStyle = `rgba(255,232,120,${0.5 + Math.sin(this.t * 6) * 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(m.x * T - cx + 0.5, m.y * T - cy - 10 + 0.5, m.w * T - 1, m.h * T + 9);
    }

    // escurece um pouco depois das 18h
    const S = F.S;
    if (S && S.minuto > 18 * 60) {
      const a = F.u.clamp((S.minuto - 18 * 60) / 120, 0, 1) * 0.35;
      ctx.fillStyle = `rgba(20,20,60,${a})`; ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    }
    if (this.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${this.fade})`; ctx.fillRect(0, 0, this.cv.width, this.cv.height); }
  },
};
