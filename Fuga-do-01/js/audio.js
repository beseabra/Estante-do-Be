// ============================================================
//  SOM
//  Três camadas, nesta ordem de preferência:
//    1. arquivos de verdade em "sons/" (veja G.ARQUIVOS no config.js)
//    2. sons e músicas gerados na hora com a Web Audio API
//    3. vozes: a voz do próprio navegador lê os bordões
// ============================================================

// ---------- trilhas geradas (marchinhas originais, nada copiado) ----------
//  mel: uma nota por colcheia. "." = pausa, "-" = segura a nota anterior
//  baixo: uma nota por compasso (o baixo faz o "pum-pá" sozinho)
G.TRILHAS = {
  titulo: {
    bpm: 138, onda: 'square', bateria: 'marcha',
    mel: 'E5 . G5 . C6 - B5 A5 G5 . E5 . C5 - D5 E5 F5 . A5 . D6 - C6 B5 A5 . G5 . - - . . ' +
         'E5 . G5 . C6 - B5 A5 G5 . E5 . C5 - E5 G5 A5 . F5 . D5 . B4 . C5 - - - . . G4 . ',
    baixo: 'C3 C3 D3 G2 C3 A2 G2 C3',
  },
  fase1: {
    bpm: 150, onda: 'square', bateria: 'marcha',
    mel: 'C5 C5 F5 . A5 . F5 . G5 G5 E5 . C5 . . . A4 C5 F5 . A5 . C6 . A5 G5 F5 E5 F5 - . . ' +
         'D5 D5 G5 . Bb5 . G5 . F5 F5 A5 . C6 . . . Bb5 A5 G5 F5 E5 . G5 . F5 - - - . . C5 . ',
    baixo: 'F2 C3 F2 F2 G2 F2 C3 F2',
  },
  fase2: {
    bpm: 156, onda: 'triangle', bateria: 'samba',
    mel: 'G5 . B5 D6 . B5 G5 . A5 . C6 E6 . C6 A5 . B5 D6 G6 - F#6 E6 D6 . C6 B5 A5 B5 G5 - - . ' +
         'E5 . G5 B5 . G5 E5 . F#5 . A5 C6 . A5 F#5 . G5 B5 D6 . C6 A5 F#5 . G5 - - - . . D5 . ',
    baixo: 'G2 A2 G2 D3 E2 D2 G2 G2',
  },
  fase3: {
    bpm: 124, onda: 'triangle', bateria: 'noite',
    mel: 'A4 . C5 . E5 . D#5 E5 . . B4 . . . . . A4 . C5 . F5 . E5 D5 C5 . B4 . A4 - - . ' +
         'E5 . G5 . B5 . A#5 B5 . . F#5 . . . . . E5 D5 C5 B4 A4 . G#4 . A4 - - - . . . . ',
    baixo: 'A2 E2 F2 E2 A2 E2 D2 A2',
  },
  fase4: {
    bpm: 128, onda: 'sine', bateria: 'bossa',
    mel: 'F#5 . A5 . D6 . C#6 . B5 . A5 . F#5 - . . G5 . B5 . E6 . D6 . C#6 . A5 . . . . . ' +
         'F#5 . A5 . D6 . F#6 . E6 . D6 . B5 - . . G5 A5 B5 C#6 D6 . A5 . D6 - - - . . . . ',
    baixo: 'D3 B2 G2 A2 D3 B2 E2 D3',
  },
  fase5: {
    bpm: 168, onda: 'sawtooth', bateria: 'tenso',
    mel: 'E5 E5 . E5 G5 . E5 . D5 D5 . D5 F#5 . D5 . C5 C5 . C5 E5 . G5 . F#5 . D#5 . B4 . . . ' +
         'E5 E5 . E5 G5 . B5 . A5 A5 . A5 C6 . A5 . G5 . F#5 . E5 . D#5 . E5 - - - B4 . E4 . ',
    baixo: 'E2 D2 C2 B1 E2 A1 B1 E2',
  },
  urna: {
    bpm: 92, onda: 'sine', bateria: 'nada',
    mel: 'C5 . E5 . G5 . E5 . D5 . F5 . A5 . F5 . E5 . G5 . C6 . G5 . D5 - - - . . . . ',
    baixo: 'C3 D3 C3 G2',
  },
  vitoria: {
    bpm: 150, onda: 'square', bateria: 'samba',
    mel: 'C5 E5 G5 C6 - . G5 C6 E6 - D6 C6 D6 . G5 . A5 C6 F6 - E6 D6 C6 . G5 A5 B5 C6 - - . . ' +
         'C6 . A5 . F5 . A5 C6 B5 . G5 . D5 . G5 B5 C6 . E6 . G6 - - . F6 E6 D6 . C6 - - . ',
    baixo: 'C3 G2 F2 C3 A2 G2 C3 C3',
  },
  derrota: {
    bpm: 80, onda: 'triangle', bateria: 'nada',
    mel: 'A4 . . C5 B4 . . G4 A4 - - . . . . . F4 . . A4 G4 . . E4 A4 - - - . . . . ',
    baixo: 'A2 E2 F2 A2',
  },
};

G.Audio = {
  ctx: null,
  ligado: true,
  arquivos: {},     // nome -> { ok, el }
  trilha: null,     // nome da música atual
  seq: null,        // estado do sequenciador
  elMusica: null,   // <audio> da música vinda de arquivo

  // tenta carregar cada arquivo da pasta sons/ (os que não existem são ignorados)
  carregarArquivos() {
    for (const [nome, caminho] of Object.entries(G.ARQUIVOS)) {
      const el = new Audio();
      const item = { ok: false, el };
      el.preload = 'auto';
      el.addEventListener('canplaythrough', () => { item.ok = true; }, { once: true });
      el.addEventListener('error', () => { item.ok = false; }, { once: true });
      el.src = caminho;
      this.arquivos[nome] = item;
    }
  },
  tem(nome) { return !!(this.arquivos[nome] && this.arquivos[nome].ok); },

  // cria o "estúdio" no primeiro toque/tecla (os navegadores exigem)
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.ligado ? 0.8 : 0;
    this.master.connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.6;
    this.sfx.connect(this.master);
    this.mus = ctx.createGain();
    this.mus.gain.value = 0.22;
    this.mus.connect(this.master);
    // ruído branco (explosões, caixa da bateria, chiado do zap)
    const len = ctx.sampleRate;
    this.ruido = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.ruido.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    G.Voz.init();
    // se uma música foi pedida antes do primeiro toque, começa agora
    if (this.trilha) { const t = this.trilha; this.trilha = null; this.musica(t); }
  },

  alternar() {
    this.ligado = !this.ligado;
    if (this.master) this.master.gain.value = this.ligado ? 0.8 : 0;
    if (this.elMusica) this.elMusica.muted = !this.ligado;
    if (!this.ligado && window.speechSynthesis) speechSynthesis.cancel();
  },

  // ---------- efeitos ----------
  // toca o arquivo se existir; senão o som gerado
  tocar(nome) {
    if (!this.ligado) return;
    if (this.tem(nome)) {
      const el = this.arquivos[nome].el;
      try { el.currentTime = 0; el.play().catch(() => {}); } catch (e) { /* ok */ }
      return true;
    }
    if (this.ctx && this.SFX[nome]) this.SFX[nome].call(this, this.ctx.currentTime);
    return false;
  },

  // um bordão: arquivo de verdade OU um som + a voz do navegador lendo o texto
  dizer(nome, texto, quem, forca) {
    if (this.tocar(nome)) return;
    if (texto) G.Voz.falar(texto, quem, forca);
  },

  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },

  tom(freq, t, dur, o = {}) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.tipo || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, t + dur);
    if (o.detune) osc.detune.value = o.detune;
    const v = o.vol ?? 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.ataque ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(o.saida || this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  },

  chiado(t, dur, o = {}) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.ruido;
    const f = ctx.createBiquadFilter();
    f.type = o.filtro || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.ate) f.frequency.exponentialRampToValueAtTime(o.ate, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.saida || this.sfx);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  },

  SFX: {
    pulo(t) { this.tom(300, t, 0.15, { ate: 700, vol: 0.12 }); },
    voto(t) { this.tom(988, t, 0.07, { vol: 0.1 }); this.tom(1319, t + 0.06, 0.15, { vol: 0.1 }); },
    tiro(t) { this.tom(520, t, 0.12, { tipo: 'sawtooth', ate: 180, vol: 0.08 }); },
    'tiro-audio'(t) { for (let i = 0; i < 3; i++) this.tom(700 + i * 150, t + i * 0.03, 0.06, { vol: 0.06 }); },
    dano(t) { this.tom(200, t, 0.3, { tipo: 'sawtooth', ate: 60, vol: 0.2 }); this.chiado(t, 0.2, { vol: 0.2 }); },
    explode(t) { this.chiado(t, 0.4, { freq: 2000, ate: 100, vol: 0.35 }); this.tom(120, t, 0.3, { tipo: 'sine', ate: 40, vol: 0.3 }); },
    acerto(t) { this.tom(880, t, 0.08, { vol: 0.12 }); this.chiado(t, 0.1, { filtro: 'highpass', freq: 3000, vol: 0.15 }); },
    picanha(t) { [523, 659, 784, 1047].forEach((f, i) => this.tom(f, t + i * 0.06, 0.18, { vol: 0.12 })); this.chiado(t, 0.5, { filtro: 'highpass', freq: 4000, vol: 0.08 }); },
    cerveja(t) { for (let i = 0; i < 6; i++) this.tom(400 + Math.random() * 600, t + i * 0.04, 0.05, { tipo: 'sine', vol: 0.1 }); this.tom(600, t + 0.3, 0.2, { tipo: 'sine', ate: 900, vol: 0.12 }); },
    seleciona(t) { this.tom(660, t, 0.06, { vol: 0.1 }); this.tom(990, t + 0.05, 0.08, { vol: 0.1 }); },
    zap(t) { this.tom(1175, t, 0.09, { tipo: 'sine', vol: 0.2 }); this.tom(1568, t + 0.1, 0.14, { tipo: 'sine', vol: 0.2 }); },
    'pessoal-urgente'(t) { for (let i = 0; i < 4; i++) { this.tom(1400, t + i * 0.16, 0.08, { vol: 0.15 }); this.tom(1000, t + i * 0.16 + 0.08, 0.08, { vol: 0.15 }); } },
    'missao-cumprida'(t) { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tom(f, t + i * 0.09, i === 5 ? 0.5 : 0.12, { vol: 0.14 })); },
    'missao-falhou'(t) { [392, 370, 349].forEach((f, i) => this.tom(f, t + i * 0.18, 0.2, { tipo: 'triangle', vol: 0.15 })); },
    // "piriri" da urna: uma trinca rapidinha que sobe e para
    urna(t) {
      const seq = [1760, 2093, 1760, 2093, 1760, 2093, 1760, 2349];
      seq.forEach((f, i) => this.tom(f, t + i * 0.055, i === 7 ? 0.35 : 0.05, { vol: 0.12 }));
    },
    tecla(t) { this.tom(1400, t, 0.05, { vol: 0.1 }); },
    // buzina de carreata: dois tons desafinados e brutos
    buzina(t) {
      for (const f of [415, 523, 622]) this.tom(f, t, 0.7, { tipo: 'sawtooth', vol: 0.09, ataque: 0.02 });
      for (const f of [415, 523, 622]) this.tom(f, t + 0.8, 0.9, { tipo: 'sawtooth', vol: 0.09, ataque: 0.02 });
    },
    // trombone triste: uón, uón, uón, uóóóón
    trombone(t) {
      [[311, 294], [294, 277], [277, 262], [262, 220]].forEach(([a, b], i) =>
        this.tom(a, t + i * 0.45, i === 3 ? 1.2 : 0.4, { tipo: 'sawtooth', ate: b, vol: 0.12, ataque: 0.04 }));
    },
    boom(t) { this.tom(90, t, 0.9, { tipo: 'sine', ate: 30, vol: 0.5 }); this.chiado(t, 0.3, { freq: 400, vol: 0.3 }); },
    sirene(t) { for (let i = 0; i < 4; i++) { this.tom(650, t + i * 0.5, 0.25, { tipo: 'triangle', ate: 950, vol: 0.1 }); this.tom(950, t + i * 0.5 + 0.25, 0.25, { tipo: 'triangle', ate: 650, vol: 0.1 }); } },
    japones(t) { this.SFX.sirene.call(this, t); [392, 392, 523, 523, 659, 784].forEach((f, i) => this.tom(f, t + 0.3 + i * 0.14, 0.12, { vol: 0.1 })); },
    'faz-o-l'(t) { this.SFX.boom.call(this, t); [262, 330, 392, 523].forEach((f) => this.tom(f, t, 1.0, { tipo: 'sawtooth', vol: 0.07 })); },
    exercito(t) { for (let i = 0; i < 14; i++) this.SFX.zap.call(this, t + i * 0.08 + Math.random() * 0.04); },
    queiroz(t) { for (let i = 0; i < 6; i++) this.tom(600 + (i % 2) * 300, t + i * 0.1, 0.09, { tipo: 'triangle', vol: 0.12 }); },
    perseguicao(t) { this.tom(500, t, 0.25, { tipo: 'square', ate: 800, vol: 0.08 }); },
    taokey(t) { this.tom(330, t, 0.12, { vol: 0.1 }); this.tom(440, t + 0.14, 0.2, { vol: 0.1 }); },
    captura(t) { this.SFX['missao-cumprida'].call(this, t); this.chiado(t, 0.3, { filtro: 'highpass', freq: 2500, vol: 0.2 }); },
    arrancada(t) { this.chiado(t, 0.35, { filtro: 'bandpass', freq: 800, ate: 3000, vol: 0.2 }); },
    splash(t) { this.chiado(t, 0.6, { freq: 3000, ate: 300, vol: 0.35 }); },
  },

  // ---------- música ----------
  musica(nome) {
    if (this.trilha === nome) return;
    this.pararMusica();
    this.trilha = nome;
    const arq = 'musica-' + nome;
    if (this.tem(arq)) {
      const el = this.arquivos[arq].el;
      el.loop = true;
      el.volume = 0.6;
      el.muted = !this.ligado;
      el.currentTime = 0;
      el.play().catch(() => {});
      this.elMusica = el;
      return;
    }
    if (!this.ctx || !G.TRILHAS[nome]) return;
    const tr = G.TRILHAS[nome];
    this.seq = {
      tr,
      mel: this.ler(tr.mel),
      baixo: tr.baixo.trim().split(/\s+/).map((n) => this.nota(n)),
      passo: 0,
      prox: this.ctx.currentTime + 0.1,
      col: 60 / tr.bpm / 2, // uma colcheia em segundos
    };
  },

  pararMusica() {
    this.trilha = null;
    this.seq = null;
    if (this.elMusica) { this.elMusica.pause(); this.elMusica = null; }
  },

  pausarMusica(sim) {
    if (this.elMusica) { if (sim) this.elMusica.pause(); else this.elMusica.play().catch(() => {}); }
    if (this.ctx) { if (sim) this.ctx.suspend(); else this.ctx.resume(); }
  },

  nota(n) {
    const m = n.match(/^([A-G])(#|b)?(\d)$/);
    if (!m) return null;
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
    const ac = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    return 12 * (parseInt(m[3], 10) + 1) + base + ac;
  },

  // transforma "C5 . - E5" em [{n, dur}] (dur em colcheias)
  ler(str) {
    const out = [];
    let ult = null;
    for (const t of str.trim().split(/\s+/)) {
      if (t === '-') { if (ult) ult.dur++; out.push(null); continue; }
      if (t === '.') { ult = null; out.push(null); continue; }
      ult = { n: this.nota(t), dur: 1 };
      out.push(ult);
    }
    return out;
  },

  // agenda as próximas notas um pouquinho antes da hora
  update() {
    const s = this.seq;
    if (!s || !this.ctx || this.ctx.state !== 'running') return;
    const agora = this.ctx.currentTime;
    if (s.prox < agora - 0.5) s.prox = agora + 0.05;
    while (s.prox < agora + 0.15) {
      this.passo(s, s.prox);
      s.prox += s.col;
      s.passo++;
    }
  },

  passo(s, t) {
    const i = s.passo % s.mel.length;
    const tr = s.tr;
    const saida = this.mus;
    // melodia
    const n = s.mel[i];
    if (n && n.n) {
      this.tom(this.midi(n.n), t, s.col * n.dur * 0.95, { tipo: tr.onda, vol: 0.16, saida });
      if (tr.onda === 'square') this.tom(this.midi(n.n - 12), t, s.col * n.dur * 0.9, { tipo: 'triangle', vol: 0.06, saida });
    }
    // baixo pum-pá: tônica no tempo, quinta no contratempo
    const compasso = Math.floor(i / 8) % s.baixo.length;
    const raiz = s.baixo[compasso];
    const pos = i % 8;
    const toca = tr.bateria === 'nada' ? pos % 4 === 0 : pos % 2 === 0;
    if (raiz && toca) {
      const nota = pos % 4 === 0 ? raiz : raiz + 7;
      this.tom(this.midi(nota), t, s.col * 0.9, { tipo: 'triangle', vol: 0.22, saida });
    }
    // bateria
    const b = tr.bateria;
    if (b === 'nada') return;
    const bumbo = () => this.tom(110, t, 0.15, { tipo: 'sine', ate: 40, vol: 0.4, saida });
    const caixa = (v = 0.18) => this.chiado(t, 0.1, { filtro: 'highpass', freq: 1800, vol: v, saida });
    const chimbal = (v = 0.06) => this.chiado(t, 0.03, { filtro: 'highpass', freq: 7000, vol: v, saida });
    if (b === 'marcha') { if (pos % 4 === 0) bumbo(); if (pos % 4 === 2) caixa(); chimbal(); }
    if (b === 'samba') { if (pos === 0 || pos === 3 || pos === 4) bumbo(); if (pos % 2 === 1) caixa(0.08); chimbal(0.08); if (pos === 6) caixa(0.16); }
    if (b === 'noite') { if (pos === 0) bumbo(); if (pos === 4) caixa(0.08); if (pos % 2 === 0) chimbal(0.03); }
    if (b === 'bossa') { if (pos === 0 || pos === 5) bumbo(); if (pos === 2 || pos === 6) caixa(0.06); chimbal(0.04); }
    if (b === 'tenso') { if (pos % 2 === 0) bumbo(); if (pos % 4 === 2) caixa(0.2); chimbal(0.07); }
  },
};

// ---------- vozes do navegador ----------
G.Voz = {
  ligada: true,
  voz: null,
  // jeito de falar de cada um (tom e velocidade)
  JEITO: {
    lula: { pitch: 0.55, rate: 0.95 },
    janones: { pitch: 1.15, rate: 1.3 },
    flavio: { pitch: 1.5, rate: 1.25 },
    queiroz: { pitch: 0.8, rate: 1.0 },
    japones: { pitch: 0.4, rate: 0.85 },
    jair: { pitch: 0.9, rate: 1.1 },
    narrador: { pitch: 1.0, rate: 1.1 },
  },
  init() {
    if (!window.speechSynthesis) return;
    const escolhe = () => {
      const vs = speechSynthesis.getVoices();
      this.voz = vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
    };
    escolhe();
    speechSynthesis.onvoiceschanged = escolhe;
  },
  alternar() {
    this.ligada = !this.ligada;
    if (!this.ligada && window.speechSynthesis) speechSynthesis.cancel();
  },
  // forca = true interrompe quem estiver falando
  falar(txt, quem = 'narrador', forca = false) {
    if (!this.ligada || !G.Audio.ligado || !window.speechSynthesis) return;
    if (speechSynthesis.speaking) { if (!forca) return; speechSynthesis.cancel(); }
    const u = new SpeechSynthesisUtterance(txt.replace(/[^\p{L}\p{N}\s,.!?]/gu, ''));
    u.lang = 'pt-BR';
    if (this.voz) u.voice = this.voz;
    const j = this.JEITO[quem] || this.JEITO.narrador;
    u.pitch = j.pitch;
    u.rate = j.rate;
    u.volume = 1;
    speechSynthesis.speak(u);
  },
};
