// ============================================================
//  SOM: bipes de sistema e uma música de elevador (sintetizados)
//  O navegador só libera som depois do primeiro clique/tecla.
// ============================================================
F.Som = {
  ctx: null,
  musicaLigada: true,
  efeitosLigados: true,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    this.mestre = this.ctx.createGain();
    this.mestre.gain.value = 0.5;
    this.mestre.connect(this.ctx.destination);
    this.musica = this.ctx.createGain();
    this.musica.gain.value = this.musicaLigada ? 0.22 : 0;
    this.musica.connect(this.mestre);
    this.tocarMusica();
  },

  nota(freq, quando, dur, { tipo = 'square', vol = 0.05, destino, desliza = 0 } = {}) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, quando);
    if (desliza) o.frequency.exponentialRampToValueAtTime(freq * desliza, quando + dur);
    g.gain.setValueAtTime(0, quando);
    g.gain.linearRampToValueAtTime(vol, quando + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
    o.connect(g); g.connect(destino || this.mestre);
    o.start(quando); o.stop(quando + dur + 0.05);
  },
  fx(lista) {
    if (!this.ctx || !this.efeitosLigados) return;
    const t = this.ctx.currentTime;
    lista.forEach(([f, d, dur, o]) => this.nota(f, t + d, dur, o));
  },

  clique()  { this.fx([[880, 0, 0.04, { vol: 0.03 }]]); },
  abre()    { this.fx([[520, 0, 0.05, { vol: 0.03 }], [780, 0.04, 0.06, { vol: 0.03 }]]); },
  email()   { this.fx([[988, 0, 0.12, { tipo: 'triangle', vol: 0.08 }], [1319, 0.1, 0.25, { tipo: 'triangle', vol: 0.08 }]]); },
  ding()    { this.fx([[1047, 0, 0.6, { tipo: 'sine', vol: 0.1 }], [784, 0.25, 0.8, { tipo: 'sine', vol: 0.08 }]]); },
  bom()     { this.fx([[660, 0, 0.08, { vol: 0.04 }], [880, 0.07, 0.08, { vol: 0.04 }], [1175, 0.14, 0.14, { vol: 0.04 }]]); },
  ruim()    { this.fx([[330, 0, 0.12, { vol: 0.05 }], [247, 0.1, 0.25, { vol: 0.05 }]]); },
  erro()    { this.fx([[196, 0, 0.3, { tipo: 'sawtooth', vol: 0.04 }]]); },
  cafe()    { this.fx([[300, 0, 0.3, { tipo: 'sine', vol: 0.05, desliza: 2 }], [450, 0.2, 0.3, { tipo: 'sine', vol: 0.04, desliza: 1.6 }]]); },
  digita()  { this.fx([[1400 + Math.random() * 400, 0, 0.015, { vol: 0.012 }]]); },
  conquista() { this.fx([[523, 0, 0.1, { vol: 0.05 }], [659, 0.1, 0.1, { vol: 0.05 }], [784, 0.2, 0.1, { vol: 0.05 }], [1047, 0.3, 0.4, { vol: 0.06 }]]); },

  // bossa de elevador: quatro acordes que nunca terminam
  tocarMusica() {
    const acordes = [[62, 66, 69, 73], [60, 64, 67, 71], [59, 62, 66, 69], [57, 61, 64, 67]];
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    let i = 0;
    const passo = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + 0.05;
      const a = acordes[i % acordes.length];
      a.forEach((n, k) => this.nota(mtof(n), t + k * 0.02, 1.9, { tipo: 'sine', vol: 0.035, destino: this.musica }));
      this.nota(mtof(a[0] - 24), t, 0.5, { tipo: 'triangle', vol: 0.06, destino: this.musica });
      this.nota(mtof(a[2] - 24), t + 1, 0.5, { tipo: 'triangle', vol: 0.05, destino: this.musica });
      if (i % 2 === 1) this.nota(mtof(a[3] + 12), t + 1.5, 0.4, { tipo: 'sine', vol: 0.025, destino: this.musica });
      i++;
    };
    passo();
    setInterval(passo, 2000);
  },
  alternarMusica() {
    this.musicaLigada = !this.musicaLigada;
    if (this.musica) this.musica.gain.setTargetAtTime(this.musicaLigada ? 0.22 : 0, this.ctx.currentTime, 0.2);
  },
};
