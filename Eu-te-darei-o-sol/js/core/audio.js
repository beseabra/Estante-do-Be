// ============================================================
//  SOM
//  Tudo é gerado na hora com a Web Audio API — não há arquivos.
//  Uma "trilha" é uma lista de acordes (números MIDI: 60 = Dó central)
//  e um estilo de arpejo. Cada fase tem a sua (veja js/levels/).
// ============================================================
F.Music = {
  // Tom solar: Ré maior com um Si menor saudoso no meio
  title:     { dur: 4,   arp: 'pluck', chords: [[50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]] },
  interlude: { dur: 4.5, arp: 'bell',  chords: [[43, 55, 59, 62], [50, 57, 62, 66], [47, 54, 59, 62], [45, 52, 57, 61]] },
  ending:    { dur: 4,   arp: 'pluck', chords: [[50, 57, 62, 66], [45, 57, 61, 64], [47, 54, 59, 62], [43, 55, 59, 62],
                                                 [40, 55, 59, 64], [45, 57, 61, 64], [50, 57, 62, 66], [50, 57, 62, 69]] },
};

F.Audio = {
  ctx: null,
  enabled: true,
  track: null,
  nextTime: 0,
  chordIndex: 0,

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
    soft.frequency.value = 2000;
    this.music.connect(soft);
    soft.connect(this.master);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.7;
    this.sfx.connect(this.master);

    // Eco suave
    this.echoIn = ctx.createGain();
    this.echoIn.gain.value = 0.4;
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.36;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.value = 2400;
    this.echoIn.connect(delay);
    delay.connect(echoFilter);
    echoFilter.connect(feedback);
    feedback.connect(delay);
    echoFilter.connect(this.master);
  },

  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },

  // Uma nota com envelope. o.slide = semitons para deslizar (efeitos).
  note(n, time, dur, o = {}) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(this.midi(n), time);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(this.midi(n + o.slide), time + dur + (o.release ?? 1));
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

  // Ruído curto (para pedra, ondas, impacto).
  noise(time, dur, o = {}) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter || 'lowpass';
    filter.frequency.value = o.freq || 1200;
    const g = ctx.createGain();
    g.gain.value = o.gain ?? 0.2;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfx);
    src.start(time);
  },

  setMusic(track) {
    this.track = track;
    this.chordIndex = 0;
    if (this.ctx) this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.05);
  },

  update() {
    if (!this.ctx || !this.track || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (this.nextTime < now) this.nextTime = now + 0.05;
    while (this.nextTime < now + 0.3) {
      const chords = this.track.chords;
      this.playChord(chords[this.chordIndex % chords.length], this.nextTime, this.track.dur, this.track.arp);
      this.nextTime += this.track.dur;
      this.chordIndex++;
    }
  },

  // Um acorde = colchão suave + arpejo ("pluck" parece violão, "bell" parece sininho)
  playChord(chord, t, dur, arp = 'pluck') {
    chord.forEach((n) => {
      this.note(n, t, dur * 0.8, { type: 'triangle', gain: 0.028, attack: 1.0, release: 2.0, dest: this.music });
    });
    const steps = 8;
    for (let k = 0; k < steps; k++) {
      if (arp === 'bell' && Math.random() < 0.5) continue;
      if (arp === 'pluck' && k % 2 === 1 && Math.random() < 0.4) continue;
      const base = chord[(k % (chord.length - 1)) + 1];
      const n = base + (arp === 'bell' ? 24 : 12) * (Math.random() < 0.25 ? 1 : 0) + (arp === 'bell' ? 0 : 12);
      const time = t + (k * dur) / steps;
      if (arp === 'pluck') {
        this.note(n, time, 0.02, { type: 'triangle', gain: 0.045, release: 0.6, dest: this.music });
      } else {
        this.note(n, time, 0.03, { type: 'sine', gain: 0.03, release: 1.6, dest: this.music, echo: true });
      }
    }
  },

  // ---------- Efeitos ----------
  now() { return this.ctx ? this.ctx.currentTime : 0; },

  chime(i = 0) {
    if (!this.ctx) return;
    const scale = [74, 76, 78, 81, 83, 86, 88, 90];
    const n = scale[i % scale.length];
    this.note(n, this.now(), 0.05, { gain: 0.11, release: 2, echo: true });
    this.note(n + 12, this.now(), 0.03, { gain: 0.035, release: 1 });
  },
  sparkle() {
    if (!this.ctx) return;
    [74, 78, 81, 86, 90, 93].forEach((n, i) => this.note(n, this.now() + i * 0.08, 0.05, { gain: 0.07, release: 1.6, echo: true }));
  },
  jump()   { if (this.ctx) this.note(69, this.now(), 0.02, { gain: 0.025, release: 0.15, slide: 5 }); },
  glide()  { if (this.ctx) this.note(81, this.now(), 0.05, { gain: 0.015, release: 0.4, echo: true }); },
  paint()  { if (!this.ctx) return; [78, 83, 86].forEach((n, i) => this.note(n, this.now() + i * 0.05, 0.03, { type: 'triangle', gain: 0.05, release: 0.5, echo: true })); },
  color()  { if (!this.ctx) return; [74, 78, 81, 85, 88].forEach((n, i) => this.note(n, this.now() + i * 0.06, 0.03, { gain: 0.06, release: 0.8, echo: true })); },
  chisel() { if (!this.ctx) return; this.noise(this.now(), 0.08, { freq: 3500, filter: 'highpass', gain: 0.18 }); this.note(91, this.now(), 0.01, { type: 'square', gain: 0.02, release: 0.08 }); },
  rubble() { if (!this.ctx) return; this.noise(this.now(), 0.5, { freq: 600, gain: 0.3 }); },
  crack()  { if (this.ctx) this.note(93, this.now(), 0.01, { type: 'triangle', gain: 0.02, release: 0.25 }); },
  splash() { if (!this.ctx) return; this.noise(this.now(), 0.6, { freq: 900, gain: 0.25 }); },
  boom()   { if (!this.ctx) return; this.noise(this.now(), 0.7, { freq: 300, gain: 0.35 }); this.note(40, this.now(), 0.05, { gain: 0.08, release: 0.6, slide: -12 }); },
  whoosh() { if (this.ctx) this.noise(this.now(), 0.4, { freq: 2000, filter: 'bandpass', gain: 0.06 }); },
  click()  { if (this.ctx) this.note(64, this.now(), 0.01, { type: 'square', gain: 0.03, release: 0.1 }); },
  gate()   { if (!this.ctx) return; this.noise(this.now(), 0.5, { freq: 400, gain: 0.12 }); },
  hurt()   { if (!this.ctx) return; const t = this.now(); this.note(64, t, 0.05, { type: 'triangle', gain: 0.05, release: 0.6, echo: true }); this.note(59, t + 0.15, 0.05, { type: 'triangle', gain: 0.05, release: 1, echo: true }); },
  shield() { if (!this.ctx) return; this.note(86, this.now(), 0.05, { gain: 0.06, release: 0.8, echo: true, slide: -7 }); },
  bloom()  { if (!this.ctx) return; [62, 66, 69, 74].forEach((n, i) => this.note(n, this.now() + i * 0.07, 0.04, { type: 'triangle', gain: 0.05, release: 1, echo: true })); },
  swap()   { if (this.ctx) this.note(76, this.now(), 0.02, { gain: 0.04, release: 0.3, slide: 7 }); },

  toggle() {
    this.init();
    if (!this.ctx) return;
    this.enabled = !this.enabled;
    this.music.gain.setTargetAtTime(this.enabled ? 0.5 : 0, this.ctx.currentTime, 0.3);
  },
};
