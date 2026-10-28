// ============================================================
//  A URNA: a última missão é votar
//  Teclado: números, Backspace = corrige, Enter = confirma, B = branco
//  Mouse/toque: clique nas teclas da urna
// ============================================================
G.Input.MAPA.KeyB = 'branco';

G.CenaUrna = class {
  constructor(heroi) {
    this.heroi = heroi;
    this.t = 0;
    this.num = '';
    this.branco = false;
    this.fim = 0;      // > 0 depois de confirmar
    this.dica = 0;
    this.urna = { x: 250, y: 70, w: 690, h: 410 };
    this.tela = { x: 275, y: 120, w: 420, h: 330 };
    // teclado numérico
    this.teclas = [];
    const kx = 725, ky = 140, kw = 56, kh = 42, gap = 10;
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d, i) => this.teclas.push({ id: d, x: kx + (i % 3) * (kw + gap), y: ky + Math.floor(i / 3) * (kh + gap), w: kw, h: kh }));
    this.teclas.push({ id: '0', x: kx + kw + gap, y: ky + 3 * (kh + gap), w: kw, h: kh });
    const by = ky + 4 * (kh + gap) + 8;
    this.teclas.push({ id: 'branco', x: kx - 4, y: by, w: 62, h: 40, rot: 'BRANCO', cor: '#fff', txt: '#111' });
    this.teclas.push({ id: 'corrige', x: kx + 62, y: by, w: 64, h: 40, rot: 'CORRIGE', cor: '#f08a24', txt: '#111' });
    this.teclas.push({ id: 'confirma', x: kx + 130, y: by - 6, w: 72, h: 46, rot: 'CONFIRMA', cor: '#2bb24c', txt: '#111' });
    this.apertada = null;
  }
  enter() { G.Audio.musica('urna'); G.Voz.falar(this.heroi === 'lula' ? 'Agora é com você, companheiro. Vota!' : 'Pessoal, urgente! Vai votar!', this.heroi, true); }

  candidato() { return G.URNA[this.num] || null; }

  aperta(id) {
    if (this.fim) return;
    this.apertada = { id, t: 0.15 };
    if (/^\d$/.test(id)) {
      if (this.branco || this.num.length >= 2) return;
      this.num += id;
      G.Audio.tocar('tecla');
      if (this.num.length === 2) this.comenta();
    } else if (id === 'corrige') {
      this.num = ''; this.branco = false; G.Audio.tocar('tecla');
    } else if (id === 'branco') {
      if (this.num) return;
      this.branco = true; G.Audio.tocar('tecla');
    } else if (id === 'confirma') {
      if (!this.branco && this.num.length < 2) { G.Audio.tocar('missao-falhou'); this.dica = 2; return; }
      this.fim = 0.001;
      G.Audio.pararMusica();
      G.Audio.tocar('urna');
    }
  }

  comenta() {
    const n = this.num;
    if (n === '13') G.Voz.falar(this.heroi === 'lula' ? 'É isso, companheiro!' : 'Isso! Compartilha o print!', this.heroi, true);
    else if (n === '22') G.Voz.falar('Tem certeza? Ele tá algemado ali do lado.', this.heroi, true);
    else if (n === '17') G.Voz.falar('Esse número é de 2018, acorda!', this.heroi, true);
  }

  update(dt) {
    this.t += dt;
    if (this.apertada) { this.apertada.t -= dt; if (this.apertada.t <= 0) this.apertada = null; }
    if (this.dica > 0) this.dica -= dt;
    const inp = G.Input;
    for (const d of inp.digitos) this.aperta(d);
    if (inp.hit('corrige')) this.aperta('corrige');
    if (inp.hit('branco')) this.aperta('branco');
    if (inp.hit('ok')) this.aperta('confirma');
    if (inp.toque) {
      const { x, y } = inp.toque;
      const k = this.teclas.find((k) => x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h);
      if (k) this.aperta(k.id);
    }
    if (this.fim) {
      this.fim += dt;
      if (this.fim > 3.2) {
        const voto = this.branco ? 'branco' : (this.candidato() ? this.num : 'nulo');
        G.Game.trocar(() => new G.CenaFinal(this.heroi, voto));
      }
    }
  }

  draw(ctx) {
    const t = this.t;
    G.fundoComicio(ctx, t, ['#1b4f8a', '#174478']);
    G.texto(ctx, 'ÚLTIMA MISSÃO: VOTAR!', 125, 54, { size: 34, font: G.FONTE_TITULO, align: 'center', color: '#ffd400', stroke: '#111', lw: 7 });

    // você e o 01 algemado com o Japonês, ali do lado
    G.Arte.boneco(ctx, this.heroi, 110, 500, { t, pose: 'fala', celular: this.heroi === 'janones', esc: 1.3 });
    const fala = this.dica > 0 ? 'Digita o número primeiro!' : this.num === '22' ? 'Tem certeza?? Ele tá algemado!' : this.num === '17' ? 'Esse é de 2018, acorda!' : this.num === '13' ? 'ISSO! Agora CONFIRMA!' : this.branco ? 'Branco?! Sério?!' : (this.heroi === 'lula' ? 'Vota, companheiro!' : 'O Brasil tá olhando!');
    G.Arte.balao(ctx, fala, 120, 360, { size: 15, largura: 190 });

    // a urna
    const u = this.urna;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; G.retRedondo(ctx, u.x + 8, u.y + 12, u.w, u.h, 18); ctx.fill();
    ctx.fillStyle = '#d9d2bd'; G.retRedondo(ctx, u.x, u.y, u.w, u.h, 18); ctx.fill();
    ctx.fillStyle = '#c4bca4'; ctx.fillRect(u.x, u.y + u.h - 26, u.w, 26);
    G.texto(ctx, 'JUSTIÇA ELEITORAL', u.x + 470, u.y + 34, { size: 16, align: 'center', color: '#333', weight: 900 });
    ctx.fillStyle = '#111'; G.retRedondo(ctx, u.x + 462, u.y + 50, 220, 330, 10); ctx.fill();

    // a tela
    const s = this.tela;
    ctx.fillStyle = '#f2f2ee'; ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 4; ctx.strokeRect(s.x, s.y, s.w, s.h);
    if (this.fim > 0.6) {
      G.texto(ctx, 'FIM', s.x + s.w / 2, s.y + s.h / 2 + 40, { size: 120, align: 'center', color: '#111', font: 'Arial Black, Arial', weight: 900 });
      G.texto(ctx, 'VOTOU', s.x + s.w - 14, s.y + s.h - 14, { size: 14, align: 'right', color: '#555', weight: 900 });
    } else this.desenhaTela(ctx, s);

    // teclas
    for (const k of this.teclas) {
      const ap = this.apertada && this.apertada.id === k.id;
      ctx.fillStyle = k.cor || '#2a2a2a';
      G.retRedondo(ctx, k.x, k.y + (ap ? 3 : 0), k.w, k.h, 6); ctx.fill();
      if (!ap) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(k.x + 4, k.y + k.h, k.w - 8, 3); }
      G.texto(ctx, k.rot || k.id, k.x + k.w / 2, k.y + k.h / 2 + (k.rot ? 5 : 9) + (ap ? 3 : 0), { size: k.rot ? 11 : 24, align: 'center', color: k.txt || '#fff', weight: 900 });
    }
    G.texto(ctx, G.Mobile.on ? 'toque nas teclas da urna' : 'números · Backspace corrige · B branco · Enter confirma', u.x + u.w / 2, u.y + u.h - 8, { size: 12, align: 'center', color: '#444', weight: 900 });

    if (this.fim > 0 && this.fim < 0.6) { ctx.fillStyle = `rgba(255,255,255,${0.6 - this.fim})`; ctx.fillRect(0, 0, G.W, G.H); }
  }

  desenhaTela(ctx, s) {
    G.texto(ctx, 'SEU VOTO PARA', s.x + 14, s.y + 26, { size: 13, color: '#111', weight: 900 });
    G.texto(ctx, 'PRESIDENTE', s.x + s.w / 2 - 40, s.y + 66, { size: 28, align: 'center', color: '#111', weight: 900 });
    if (this.branco) {
      G.texto(ctx, 'VOTO EM BRANCO', s.x + s.w / 2, s.y + 170, { size: 34, align: 'center', color: '#111', weight: 900 });
      G.texto(ctx, '(o Janones vai te mandar 40 áudios)', s.x + s.w / 2, s.y + 200, { size: 13, align: 'center', color: '#666' });
      this.rodape(ctx, s);
      return;
    }
    G.texto(ctx, 'Número:', s.x + 14, s.y + 120, { size: 16, color: '#111', weight: 900 });
    for (let i = 0; i < 2; i++) {
      const bx = s.x + 100 + i * 46, by = s.y + 92;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 38, 44);
      const d = this.num[i];
      if (d) G.texto(ctx, d, bx + 19, by + 36, { size: 32, align: 'center', color: '#111', weight: 900 });
      else if (i === this.num.length && Math.sin(this.t * 8) > 0) { ctx.fillStyle = '#111'; ctx.fillRect(bx + 6, by + 38, 26, 3); }
    }
    if (this.num.length < 2) return;
    const c = this.candidato();
    if (c) {
      G.texto(ctx, 'Nome:', s.x + 14, s.y + 170, { size: 15, color: '#111', weight: 900 });
      G.texto(ctx, c.nome, s.x + 72, s.y + 170, { size: 15, color: '#111', weight: 900 });
      G.texto(ctx, 'Partido:', s.x + 14, s.y + 196, { size: 15, color: '#111', weight: 900 });
      G.texto(ctx, c.partido, s.x + 86, s.y + 196, { size: 15, color: '#111', weight: 900 });
      if (c.vice) {
        G.texto(ctx, 'Vice:', s.x + 14, s.y + 222, { size: 15, color: '#111', weight: 900 });
        G.texto(ctx, c.vice, s.x + 62, s.y + 222, { size: 15, color: '#111', weight: 900 });
      }
      // a "foto" no canto
      const fx = s.x + s.w - 110, fy = s.y + 30;
      ctx.fillStyle = '#ddd'; ctx.fillRect(fx, fy, 96, 116);
      ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, 96, 116); ctx.clip();
      G.Arte.boneco(ctx, c.quem, fx + 46, fy + 190, { t: this.t, esc: 1.3, semSombra: true, medo: c.quem === 'flavio', pose: c.quem === 'flavio' ? 'algemado' : 'parado' });
      ctx.restore();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(fx, fy, 96, 116);
      if (c.quem === 'flavio') G.texto(ctx, '(prestando depoimento)', fx + 48, fy + 132, { size: 10, align: 'center', color: '#a11', weight: 900 });
    } else {
      G.texto(ctx, 'NÚMERO ERRADO', s.x + 14, s.y + 180, { size: 22, color: '#111', weight: 900 });
      G.texto(ctx, 'VOTO NULO', s.x + s.w / 2, s.y + 240, { size: 40, align: 'center', color: '#111', weight: 900 });
      if (this.num === '17') G.texto(ctx, '(esse número é de 2018)', s.x + s.w / 2, s.y + 266, { size: 13, align: 'center', color: '#a11', weight: 900 });
      if (this.num === '01') G.texto(ctx, '(01 é apelido, não é partido)', s.x + s.w / 2, s.y + 266, { size: 13, align: 'center', color: '#a11', weight: 900 });
    }
    this.rodape(ctx, s);
  }

  rodape(ctx, s) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(s.x + 8, s.y + s.h - 62); ctx.lineTo(s.x + s.w - 8, s.y + s.h - 62); ctx.stroke();
    G.texto(ctx, 'Aperte a tecla:', s.x + 14, s.y + s.h - 42, { size: 12, color: '#111', weight: 900 });
    G.texto(ctx, 'VERDE para CONFIRMAR este voto', s.x + 40, s.y + s.h - 24, { size: 12, color: '#111', weight: 900 });
    G.texto(ctx, 'LARANJA para REINICIAR este voto', s.x + 40, s.y + s.h - 8, { size: 12, color: '#111', weight: 900 });
  }
};
