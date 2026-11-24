// ============================================================
//  CHEFÃO: o 01 corre de um lado pro outro no aeroporto jogando
//  coisas. Você anda embaixo (← →) e arremessa algemas (espaço).
//  Seis algemas nele e chega o Japonês da Federal.
// ============================================================
G.CenaChefao = class {
  constructor(heroi, vidas) {
    this.heroi = heroi;
    this.vidas = vidas;
    this.pausavel = true;
    this.t = 0;
    this.x = 480;          // você
    this.inv = 0;          // invencível depois de levar um
    this.cd = 0;           // espera entre algemas
    this.fl = { x: 480, dir: 1, vel: 260, vida: 6, dor: 0, fala: null, falaT: 1, tiroT: 1.2 };
    this.algemas = [];
    this.coisas = [];
    this.part = [];
    this.estado = 'luta';  // luta | japones | perdeu
    this.et = 0;
    this.cena = 0;
    this.jap = G.W + 80;
  }

  enter() {
    G.Audio.musica('chefao');
    this.falaFlavio('Ninguém me pega! Vou pra Miami!');
  }

  falaFlavio(txt) { this.fl.fala = { txt, t: 0 }; }

  update(dt) {
    this.t += dt;
    this.et += dt;
    const inp = G.Input;
    const fl = this.fl;
    if (fl.fala) { fl.fala.t += dt; if (fl.fala.t > 2) fl.fala = null; }
    for (const p of this.part) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.v -= dt; }
    this.part = this.part.filter((p) => p.v > 0);

    if (this.estado === 'japones') return this.updateJapones(dt, inp);
    if (this.estado === 'perdeu') {
      fl.x += 500 * dt;
      if (this.et > 2) { this.estado = 'saindo'; G.Game.trocar(() => new G.CenaDerrota(this.heroi)); }
      return;
    }
    if (this.estado !== 'luta') return;

    // você
    let dx = (inp.is('right') ? 1 : 0) - (inp.is('left') ? 1 : 0);
    if (inp.ponteiro.down) dx = G.U.clamp((inp.ponteiro.x - this.x) / 30, -1, 1);
    this.x = G.U.clamp(this.x + dx * 520 * dt, 50, 910);
    this.anda = dx;
    this.inv = Math.max(0, this.inv - dt);
    this.cd -= dt;
    if ((inp.is('jump') || inp.hit('jump') || inp.hit('ok') || inp.hit('tap')) && this.cd <= 0) {
      this.cd = 0.4;
      this.algemas.push({ x: this.x, y: 400 });
      G.Audio.tocar('pulo');
    }

    // o 01
    fl.x += fl.dir * fl.vel * dt;
    if (fl.x < 90) fl.dir = 1;
    if (fl.x > 870) fl.dir = -1;
    if (Math.random() < dt * 0.3) fl.dir *= -1; // muda de ideia do nada
    fl.dor = Math.max(0, fl.dor - dt);
    fl.tiroT -= dt;
    if (fl.tiroT <= 0) {
      fl.tiroT = G.U.rand(0.7, 1.2) - (6 - fl.vida) * 0.06;
      this.coisas.push({ x: fl.x, y: 200, vx: (this.x - fl.x) * 0.5, tipo: G.U.pick(['boleto', 'bombom', 'mala', 'dinheiro']), giro: 0 });
    }
    fl.falaT -= dt;
    if (fl.falaT <= 0) { fl.falaT = G.U.rand(2.5, 4); this.falaFlavio(G.U.pick(G.FALAS_FLAVIO)); }

    // algemas subindo
    for (const a of this.algemas) {
      a.y -= 700 * dt;
      if (!a.fim && fl.dor <= 0 && Math.abs(a.x - fl.x) < 48 && a.y < 230 && a.y > 110) {
        a.fim = true;
        fl.vida--;
        fl.dor = 0.6;
        fl.vel += 55;
        G.Audio.tocar('acerto');
        G.Game.sacudir(5);
        for (let k = 0; k < 14; k++) this.part.push({ x: fl.x, y: 170, vx: G.U.rand(-300, 300), vy: G.U.rand(-300, 50), v: 0.7, cor: '#ffd400' });
        this.falaFlavio(G.U.pick(['Ai!', 'Isso é abuso!', 'Vou no STF!', 'Meu terno!', 'Respeita o senador!']));
        if (fl.vida <= 0) return this.venceu();
      }
    }
    this.algemas = this.algemas.filter((a) => !a.fim && a.y > -30);

    // o que ele joga caindo em você
    for (const c of this.coisas) {
      c.y += 330 * dt;
      c.x += c.vx * dt;
      c.giro += dt;
      if (!c.fim && this.inv <= 0 && Math.abs(c.x - this.x) < 34 && c.y > 400 && c.y < 480) {
        c.fim = true;
        this.vidas--;
        this.inv = 1.2;
        G.Audio.tocar('dano');
        G.Audio.tocar('risada', 0.6);
        G.Game.sacudir(8);
        if (this.vidas <= 0) {
          this.estado = 'perdeu';
          this.et = 0;
          G.Audio.pararMusica();
          G.Audio.tocar('trombone');
          this.falaFlavio('TCHAU, QUERIDA! Vou pra Miami!');
          return;
        }
      }
    }
    this.coisas = this.coisas.filter((c) => !c.fim && c.y < 580);
  }

  venceu() {
    this.estado = 'japones';
    this.et = 0;
    this.cena = 0;
    this.coisas = [];
    this.algemas = [];
    this.fl.fala = null;
    G.Audio.pararMusica();
    G.Audio.tocar('captura');
    G.Campanha.pontos += 1000 + this.vidas * 250;
    G.Audio.tocar('sirene', 0.7);
  }

  linhas() {
    const h = this.heroi;
    return [
      { txt: 'O 01 caiu no chão do aeroporto, cheio de algema.' },
      { txt: 'Uma sirene. Passos firmes. Óculos escuros...', som: 'policia-federal' },
      { quem: 'japones', txt: 'Bom dia, senador. Polícia Federal. O senhor vai ter que me acompanhar.' },
      { quem: 'flavio', txt: 'Isso é perseguição política! Eu só vendia chocolate!' },
      { quem: h, txt: h === 'lula' ? 'Companheiro, agora é com a Justiça. Eu vou é votar.' : 'PESSOAL, URGENTE! PEGARAM O 01! COMPARTILHEM!', som: h === 'lula' ? 'faz-o-l' : 'urgente2' },
      { txt: 'Mas a missão mais importante ainda não acabou: VOTAR!' },
    ];
  }

  updateJapones(dt, inp) {
    this.fl.x += (480 - this.fl.x) * Math.min(1, dt * 3);
    this.x += (390 - this.x) * Math.min(1, dt * 3);
    this.jap += (560 - this.jap) * Math.min(1, dt * (this.cena >= 1 ? 2 : 0));
    if (this.et > 0.8 && G.Input.avancar()) {
      const ls = this.linhas();
      if (this.cena >= ls.length - 1) {
        this.estado = 'saindo';
        G.Audio.pararClipes();
        G.Game.trocar(() => new G.CenaUrna(this.heroi), '#fff');
        return;
      }
      this.cena++;
      this.et = 0.3;
      G.Audio.pararClipes();
      if (ls[this.cena].som) G.Audio.tocar(ls[this.cena].som);
    }
  }

  // ============================================================
  draw(ctx) {
    const t = this.t;
    const fl = this.fl;
    // aeroporto bem simples: céu, vidraça, chão
    G.degrade(ctx, ['#ff9a6a', '#ffcf8a'], 0, 300);
    ctx.fillStyle = 'rgba(40,40,70,0.5)';
    for (let x = 0; x < G.W; x += 160) ctx.fillRect(x, 0, 8, 300);
    ctx.fillStyle = '#c9ced8'; ctx.fillRect(0, 240, G.W, 300);
    ctx.fillStyle = '#b4bbc8'; ctx.fillRect(0, 240, G.W, 10);
    // portão de embarque
    if (this.estado !== 'japones') {
      ctx.fillStyle = '#2b3a8a'; G.retRedondo(ctx, 760, 60, 180, 40, 8); ctx.fill();
      G.texto(ctx, 'PORTÃO 01 · MIAMI', 850, 86, { size: 15, align: 'center', color: '#fff', weight: 900 });
    }

    // barra de vida do 01
    if (this.estado === 'luta' || this.estado === 'perdeu') {
      G.texto(ctx, 'O 01', 300, 40, { size: 20, font: G.FONTE_TITULO, align: 'right', color: '#fff', stroke: '#111', lw: 5 });
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; G.retRedondo(ctx, 310, 24, 340, 20, 10); ctx.fill();
      ctx.fillStyle = '#ff3b3b'; G.retRedondo(ctx, 310, 24, Math.max(20, 340 * fl.vida / 6), 20, 10); ctx.fill();
      for (let i = 0; i < G.VIDAS; i++) G.coracao(ctx, 30 + i * 30, 34, i < this.vidas ? '#ff3b4a' : 'rgba(0,0,0,0.25)');
    }

    // o 01 lá atrás
    ctx.save();
    if (fl.dor > 0 && Math.floor(t * 20) % 2) ctx.globalAlpha = 0.5;
    const poseF = this.estado === 'japones' ? (this.cena >= 2 ? 'algemado' : 'dano') : fl.dor > 0 ? 'dano' : 'corre';
    G.Arte.boneco(ctx, 'flavio', fl.x, 250, { t, pose: poseF, dir: fl.dir, medo: true, segura: poseF === 'corre' ? 'dinheiro' : null });
    ctx.restore();
    if (fl.fala && this.estado !== 'japones') G.Arte.balao(ctx, fl.fala.txt, fl.x, 135, { size: 15, fundo: '#fff8c8' });

    // algemas e o que ele joga
    for (const a of this.algemas) {
      ctx.strokeStyle = '#d8dce4'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(a.x - 9, a.y, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(a.x + 9, a.y, 9, 0, Math.PI * 2); ctx.stroke();
    }
    for (const c of this.coisas) G.Arte.item(ctx, c.tipo, c.x, c.y, c.giro, 1.3);
    for (const p of this.part) { ctx.fillStyle = p.cor; ctx.fillRect(p.x, p.y, 6, 6); }

    // você, na frente
    const pisca = this.inv > 0 && Math.floor(t * 16) % 2;
    if (!pisca) {
      const pose = this.estado === 'japones' ? (this.cena >= 4 ? 'comemora' : 'parado') : this.estado === 'perdeu' ? 'dano' : this.anda ? 'corre' : 'parado';
      G.Arte.boneco(ctx, this.heroi, this.x, 490, { t, pose, esc: 1.3, dir: this.anda < 0 ? -1 : 1, celular: this.heroi === 'janones' && pose === 'parado' });
    }

    if (this.estado === 'luta' && this.t < 2.5) {
      ctx.globalAlpha = Math.min(1, 2.5 - this.t);
      G.texto(ctx, G.Mobile.on ? '◀ ▶ anda  ·  ● joga a algema' : '← → anda  ·  ESPAÇO joga a algema', G.W / 2, 340, { size: 22, align: 'center', color: '#fff', stroke: '#111', lw: 5, weight: 900 });
      ctx.globalAlpha = 1;
    }
    if (this.estado === 'japones') this.desenhaJapones(ctx);
    if (this.estado === 'perdeu') G.texto(ctx, 'O 01 FUGIU!', G.W / 2, 330, { size: 90, font: G.FONTE_TITULO, align: 'center', color: '#ff4040', stroke: '#111', lw: 10 });
  }

  desenhaJapones(ctx) {
    if (this.cena >= 1) G.Arte.boneco(ctx, 'japones', this.jap, 250, { t: this.t, pose: this.cena === 1 ? 'corre' : 'parado', dir: -1, esc: 1.05 });
    if (this.cena >= 1) G.texto(ctx, 'O JAPONÊS DA FEDERAL', G.W / 2, 330, { size: 52, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 9 });
    const l = this.linhas()[this.cena];
    const x = 120, y = 30, w = G.W - 240;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    G.retRedondo(ctx, x, y, w, 90, 16); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.stroke();
    const nome = { japones: 'JAPONÊS DA FEDERAL', flavio: 'O 01', lula: 'LULA', janones: 'JANONES' }[l.quem];
    if (nome) G.texto(ctx, nome, x + 20, y + 26, { size: 15, color: '#d11f2b', weight: 900 });
    G.quebra(ctx, l.txt, w - 40, 19).forEach((li, i) => G.texto(ctx, li, x + 20, y + (nome ? 52 : 42) + i * 23, { size: 19, color: '#111' }));
    if (Math.sin(this.t * 6) > 0) G.texto(ctx, '▶', x + w - 22, y + 80, { size: 15, color: '#111' });
  }
};
