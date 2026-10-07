// ============================================================
//  SOM
//  Toda a música é gerada na hora com a Web Audio API —
//  não existe nenhum arquivo de áudio. Cada "trilha" é só
//  uma lista de acordes (em números MIDI: 60 = Dó central).
// ============================================================
F.Music = {
  // Cmaj7 · Em7 · Fmaj7 · Fm6  (o acorde menor no fim é o "suspiro")
  title:     { dur: 4.5, chords: [[48, 55, 64, 71], [52, 59, 62, 67], [41, 53, 57, 64], [41, 53, 56, 62]] },
  interlude: { dur: 5,   chords: [[41, 57, 60, 64], [40, 55, 59, 62], [38, 53, 57, 60], [36, 55, 59, 64]] },
  ending:    { dur: 4,   chords: [[41, 57, 60, 64], [43, 55, 59, 62], [40, 55, 59, 64], [45, 57, 60, 64],
                                  [38, 57, 60, 65], [43, 55, 59, 65], [36, 55, 60, 64], [36, 55, 59, 64]] },
};

F.Audio = {
  ctx: null,
  enabled: true,
  track: null,
  nextTime: 0,
  chordIndex: 0,

  // Cria o "estúdio": volume geral, filtro e um eco suave.
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);

    this.music = ctx.createGain();
    this.music.gain.value = 0.5;
    const soft = ctx.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = 1800;
    this.music.connect(soft);
    soft.connect(this.master);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.7;
    this.sfx.connect(this.master);

    // Eco: o som volta várias vezes, cada vez mais baixo.
    this.echoIn = ctx.createGain();
    this.echoIn.gain.value = 0.45;
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.value = 2200;
    this.echoIn.connect(delay);
    delay.connect(echoFilter);
    echoFilter.connect(feedback);
    feedback.connect(delay);
    echoFilter.connect(this.master);
  },

  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },

  // Toca UMA nota com envelope (sobe suave, sustenta, some suave).
  note(n, time, dur, o = {}) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.value = this.midi(n);
    if (o.detune) osc.detune.value = o.detune;

    const peak = o.gain ?? 0.1;
    const attack = o.attack ?? 0.01;
    const release = o.release ?? 1;
    const hold = Math.max(attack, dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + attack);
    g.gain.setValueAtTime(peak, time + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, time + hold + release);

    osc.connect(g);
    g.connect(o.dest || this.sfx);
    if (o.echo) g.connect(this.echoIn);
    osc.start(time);
    osc.stop(time + hold + release + 0.1);
  },

  // Troca a música. As notas que já estavam soando terminam sozinhas.
  setMusic(track) {
    this.track = track;
    this.chordIndex = 0;
    if (this.ctx) this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.05);
  },

  // Chamado todo quadro: agenda os próximos acordes.
  update() {
    if (!this.ctx || !this.track || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + 0.05;
    while (this.nextTime < now + 0.3) {
      const chords = this.track.chords;
      this.playChord(chords[this.chordIndex % chords.length], this.nextTime, this.track.dur);
      this.nextTime += this.track.dur;
      this.chordIndex++;
    }
  },

  // Um acorde = um "colchão" de notas longas + um arpejo aleatório por cima.
  playChord(chord, t, dur) {
    chord.forEach((n) => {
      this.note(n, t, dur * 0.8, { type: 'triangle', gain: 0.035, attack: 1.2, release: 2.2, dest: this.music });
      this.note(n + 12, t, dur * 0.7, { type: 'sine', gain: 0.012, attack: 1.6, release: 2.4, dest: this.music, detune: 6 });
    });
    for (let k = 0; k < 6; k++) {
      if (Math.random() < 0.4) continue;
      const base = chord[1 + Math.floor(Math.random() * (chord.length - 1))];
      const n = base + 12 * (Math.random() < 0.4 ? 2 : 1);
      this.note(n, t + (k * dur) / 6 + Math.random() * 0.05, 0.05,
        { type: 'sine', gain: 0.03, release: 1.4, dest: this.music, echo: true });
    }
  },

  // ---------- Efeitos ----------
  chime(i = 0) {
    if (!this.ctx) return;
    const scale = [76, 79, 81, 84, 86, 88, 91, 93];
    const n = scale[i % scale.length];
    const t = this.ctx.currentTime;
    this.note(n, t, 0.05, { gain: 0.12, release: 2.2, echo: true });
    this.note(n + 12, t, 0.03, { gain: 0.04, release: 1.2 });
  },

  sparkle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [72, 76, 79, 83, 84, 88].forEach((n, i) => {
      this.note(n, t + i * 0.09, 0.05, { gain: 0.07, release: 1.8, echo: true });
    });
  },

  jump() {
    if (!this.ctx) return;
    this.note(67, this.ctx.currentTime, 0.02, { type: 'sine', gain: 0.025, release: 0.18 });
  },

  fall() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.note(64, t, 0.05, { type: 'triangle', gain: 0.05, release: 0.8, echo: true });
    this.note(60, t + 0.18, 0.05, { type: 'triangle', gain: 0.05, release: 1.2, echo: true });
  },

  crack() {
    if (!this.ctx) return;
    this.note(93, this.ctx.currentTime, 0.01, { type: 'triangle', gain: 0.02, release: 0.25 });
  },

  toggle() {
    this.init();
    if (!this.ctx) return;
    this.enabled = !this.enabled;
    this.music.gain.setTargetAtTime(this.enabled ? 0.5 : 0, this.ctx.currentTime, 0.3);
  },
};
