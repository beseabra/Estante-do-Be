// ============================================================
//  CENA: JOGANDO UM CAPÍTULO
//  Monta a fase a partir dos dados em js/levels/ e cuida de:
//    câmera, troca de gêmeo, golpes e girassóis, coletáveis,
//    falas, neblina e a chegada ao fim do capítulo.
// ============================================================
F.PlayScene = class {
  static HURT_LINES = [
    'Respira. De novo.',
    'A mamãe diria: levanta, meu bem.',
    'Ainda dá. Sempre dá.',
    'Cair também faz parte do mapa.',
  ];

  constructor(index) {
    const L = (this.level = F.Levels[index]);
    const list = (a) => a || [];
    this.index = index;
    this.theme = L.theme;
    this.t = 0;

    // ---- Mundo ----
    this.platforms = L.platforms.map((p) => new F.Platform(p[0], p[1], p[2], p[3], p[4] || {}));
    this.bridges = [];
    this.clouds = list(L.clouds).map((c) => new F.GrayCloud(c));
    this.gates = list(L.gates).map((g) => new F.Gate(...g));
    this.plates = list(L.plates).map((p) => new F.Plate(...p));
    this.blocks = list(L.blocks).map((b) => new F.Block(...b));
    this.cracked = list(L.cracked).map((c) => new F.Cracked(...c));
    this.thorns = list(L.thorns).map((t) => new F.Thorns(...t));
    this.water = L.theme.water ? new F.Water(L.theme.water) : null;
    this.meteors = L.meteors ? new F.MeteorShower(L.meteors) : null;
    this.mounds = list(L.mounds).map((m) => new F.SandMound(...m));
    this.frames = list(L.frames).map((f) => new F.Frame(...f));
    this.frames.forEach((f) => { f.pair = this.frames.find((o) => o !== f && o.id === f.id); });

    // ---- Coisas para pegar ----
    this.collectibles = L.collectibles.map((c) => new F.Collectible(c[0], c[1], c[2], L.collectibleArt));
    this.collected = 0;
    this.pots = list(L.pots).map((p) => new F.PaintPot(...p));
    this.amulets = list(L.amulets).map((a) => new F.Amulet(...a));
    this.checkpoints = list(L.checkpoints).map((c) => new F.Checkpoint(...c));
    this.triggers = list(L.triggers).map((t) => new F.Trigger(t));
    this.npcs = list(L.npcs).map((n) => ({ ...n, t: Math.random() * 5, walk: 0 }));
    this.goal = new F.Goal(L.goal);

    // ---- Gêmeos ----
    this.twins = [];
    if (L.who === 'noah' || L.who === 'both') this.twins.push(new F.Twin('noah', L.spawn.x, L.spawn.y));
    if (L.who === 'jude') this.twins.push(new F.Twin('jude', L.spawn.x, L.spawn.y));
    if (L.who === 'both') this.twins.push(new F.Twin('jude', L.spawn2.x, L.spawn2.y));
    this.activeIndex = L.who === 'both' ? 1 : 0;   // no cooperativo começa pela Jude (ela empurra o bloco)

    this.bg = new F.Background(L.theme, L);
    this.particles = new F.Particles();
    this.hud = new F.HUD(L);

    this.cam = { x: 0, y: 0 };
    this.state = 'play';  // 'play' | 'win'
    this.stateT = 0;
    this.blackout = 0;
    this.shake = 0;
    this.hintCooldown = 0;
    this.hurts = 0;

    if (L.theme.fog || L.theme.dark) {
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = F.W * F.SCALE;
      this.fogCanvas.height = F.H * F.SCALE;
    }
    this.collectSolids();
    this.updateCamera(0, true);
  }

  get active() { return this.twins[this.activeIndex]; }

  enter() { F.Audio.setMusic(this.level.music); }

  // Tudo em que os gêmeos podem colidir, numa lista só
  collectSolids() {
    this.solids = [
      ...this.platforms, ...this.bridges, ...this.clouds,
      ...this.gates, ...this.blocks, ...this.cracked.filter((c) => !c.dead),
      ...this.mounds.map((m) => m.plat),
    ];
  }

  // Usados pelos gêmeos
  say(who, text, urgent) { this.hud.say(who.toLowerCase(), text, urgent); }
  addPaintBridge(p) { this.bridges.push(p); }

  // X na frente de uma moldura: entra no quadro e sai pelo outro
  usePortal(tw) {
    const f = this.frames.find((fr) => fr.pair && tw.onGround && Math.abs(fr.x - tw.x) < 26 && Math.abs(fr.y - tw.y) < 12);
    if (!f) return false;
    const d = f.pair;
    this.particles.burst(f.x, f.y - 46, 20, 'spark', '255,220,150', 140);
    tw.x = d.x; tw.y = d.y; tw.vx = 0; tw.vy = 0; tw.ground = null; tw.airTop = d.y;
    tw.invuln = Math.max(tw.invuln, 0.3);
    this.particles.burst(d.x, d.y - 46, 20, 'spark', '255,220,150', 140);
    F.Audio.whoosh();
    F.Audio.paint();
    this.flash = 0.7;
    if (tw === this.active) this.updateCamera(0, true);
    return true;
  }

  // ---------------- LÓGICA ----------------
  update(dt) {
    const I = F.Input;
    this.t += dt;
    this.stateT += dt;
    this.hintCooldown -= dt;
    this.shake = Math.max(0, this.shake - dt);

    // trocar de gêmeo
    if (this.twins.length > 1 && this.state === 'play' && I.swapPressed()) {
      this.activeIndex = 1 - this.activeIndex;
      F.Audio.swap();
      const A = this.active;
      this.particles.burst(A.x, A.y - 30, 12, 'spark', '255,220,150', 90);
    }
    if (I.resetPressed() && this.state === 'play') this.manualReset();

    // mundo
    this.platforms.forEach((p) => p.update(dt, this.t));
    this.bridges.forEach((p) => p.update(dt, this.t));
    this.bridges = this.bridges.filter((p) => !p.dead);
    this.clouds.forEach((c) => c.update(dt, this.t));
    this.cracked.forEach((c) => c.update(dt));
    this.mounds.forEach((m) => m.update(dt, this));
    this.frames.forEach((f) => f.update(dt));
    this.updateNpcs(dt);
    if (this.water) this.water.update(this.t);
    this.collectSolids();
    this.blocks.forEach((b) => b.update(dt, this.solids, this.level));

    // gêmeos (só o ativo recebe os comandos)
    this.twins.forEach((tw) => tw.update(dt, this, tw === this.active && this.state === 'play'));

    // placas e portões
    const holders = this.npcs.filter((n) => n.holds && !n.moving).map((n) => ({ x: n.x, y: n.y, onGround: true }));
    this.plates.forEach((p) => p.check([...this.twins, ...this.blocks, ...holders]));
    this.gates.forEach((g) => g.update(dt, this.plates));

    this.collectibles.forEach((c) => c.update(dt));
    this.pots.forEach((p) => p.update(dt));
    this.amulets.forEach((a) => a.update(dt));
    this.checkpoints.forEach((c) => c.update(dt));
    this.goal.update(dt);
    if (this.meteors) this.meteors.update(dt, this);
    this.particles.update(dt);
    this.hud.update(dt);

    if (this.state === 'play') this.updatePlaying();
    else this.updateWin(dt);

    this.bg.update(dt, this.cam);
    this.updateCamera(dt);
    this.blackout = Math.max(0, this.blackout - dt * 1.4);
    this.flash = Math.max(0, (this.flash || 0) - dt * 1.6);
  }

  // Personagens que andam até um lugar (ex.: o Oscar indo segurar a placa)
  updateNpcs(dt) {
    for (const n of this.npcs) {
      n.t += dt;
      n.moving = n.to !== undefined && Math.abs(n.to - n.x) > 1;
      if (n.moving) {
        n.facing = Math.sign(n.to - n.x);
        n.x = F.utils.approach(n.x, n.to, 90 * dt);
        n.walk += 90 * dt * 0.075;
      }
    }
  }

  updatePlaying() {
    const U = F.utils, L = this.level;

    for (const tw of this.twins) {
      // perigos
      if (tw.y > L.height + 60) this.hurt(tw, null, true);
      else if (this.water && this.water.hurts(tw)) { F.Audio.splash(); this.hurt(tw, null, true); }
      else if (this.clouds.some((c) => c.hurts(tw))) this.hurt(tw, 'A nuvem cinzenta passou por você.');
      else if (this.thorns.some((th) => th.hurts(tw))) this.hurt(tw, 'Espinhos.');

      // girassóis: cada gêmeo tem o seu ponto de volta
      for (const cp of this.checkpoints) {
        if (Math.abs(tw.x - cp.x) < 60 && Math.abs(tw.y - cp.y) < 40 && tw.onGround &&
            (tw.checkpoint.x !== cp.x || tw.checkpoint.y !== cp.y)) {
          tw.checkpoint = { x: cp.x, y: cp.y };
          if (!cp.active) {
            cp.active = true;
            F.Audio.bloom();
            this.particles.burst(cp.x, cp.y - 40, 16, 'spark', '255,210,90', 110);
          }
        }
      }

      // coletáveis
      for (const c of this.collectibles) {
        if (!c.collected && U.dist(tw.x, tw.y - tw.h / 2, c.x, c.y) < 28) this.collect(c);
      }

      // tinta
      if (tw.kind === 'noah') {
        for (const p of this.pots) {
          if (p.available && tw.paint < F.Twin.PAINT_MAX && U.dist(tw.x, tw.y - 14, p.x, p.y - 12) < 30) {
            tw.paint = F.Twin.PAINT_MAX;
            p.cool = 3;
            F.Audio.sparkle();
            this.particles.burst(p.x, p.y - 14, 16, 'spark', '255,170,200', 110);
          }
        }
      }

      // amuletos
      if (tw.kind === 'jude') {
        for (const a of this.amulets) {
          if (!a.taken && U.dist(tw.x, tw.y - 20, a.x, a.y) < 28) {
            a.taken = true;
            tw.amulets++;
            F.Audio.shield();
            this.particles.burst(a.x, a.y, 14, 'spark', '255,230,140', 100);
          }
        }
      }
    }

    // gatilhos de fala (só quem está sendo controlado dispara)
    const A = this.active;
    for (const tr of this.triggers) {
      if (tr.fired || (tr.only && tr.only !== A.kind)) continue;
      if (A.x >= tr.x && A.x <= tr.x + Math.max(tr.w, 400)) {
        tr.fired = true;
        (tr.lines || []).forEach(([who, text]) => this.hud.say(who, text));
        if (tr.hint) this.hud.showHint(tr.hint);
        if (tr.move) this.npcs[tr.move[0]].to = tr.move[1];
      }
    }

    // fim do capítulo
    const G = this.goal;
    const near = (tw) => Math.abs(tw.x - G.x) < (G.r || 46) && Math.abs(tw.y - G.y) < 80;
    const arrived = G.both ? this.twins.every(near) : near(A);
    const unlocked = this.collected >= this.collectibles.length;
    if (arrived && unlocked) this.beginWin();
    else if ((arrived || (G.both && this.twins.some(near))) && this.hintCooldown <= 0) {
      const left = this.collectibles.length - this.collected;
      if (left > 0) this.hud.showHint(`Ainda faltam ${left} ${left === 1 ? this.level.collectibleName.replace(/s$/, '') : this.level.collectibleName}.`);
      else this.hud.showHint(`Falta ${this.twins.find((tw) => !near(tw)).name} chegar aqui.`);
      this.hintCooldown = 5;
    }
  }

  collect(c) {
    c.collected = true;
    this.collected++;
    F.Audio.chime(this.collected - 1);
    this.particles.burst(c.x, c.y, 18, 'spark', this.theme.accent, 140);
    this.hud.showMemory(c.memory);
    if (this.collected === this.collectibles.length) {
      setTimeout(() => this.hud.showHint(`Todos os ${this.level.collectibleName}. Agora, siga em frente.`), 900);
    }
  }

  // Golpe: um amuleto absorve (se não for fatal); senão, volta ao girassol.
  hurt(tw, msg, fatal = false) {
    if (tw.invuln > 0 || this.state !== 'play') return;
    if (!fatal && tw.amulets > 0) {
      tw.amulets--;
      tw.invuln = 1.5;
      tw.vy = -420;
      F.Audio.shield();
      this.particles.burst(tw.x, tw.y - 22, 20, 'spark', '255,230,150', 160);
      this.hud.showHint('O amuleto se quebrou no seu lugar.');
      return;
    }
    F.Audio.hurt();
    this.particles.burst(tw.x, Math.min(tw.y, this.level.height) - 20, 14, 'dust', '255,255,255', 90);
    tw.respawn();
    this.platforms.forEach((p) => { if (p.fragile && p.state !== 'idle') p.reset(); });
    if (tw === this.active) {
      this.blackout = 0.9;
      this.updateCamera(0, true);
    }
    this.hud.showHint(msg || F.PlayScene.HURT_LINES[this.hurts++ % F.PlayScene.HURT_LINES.length]);
  }

  // R: volta o gêmeo ativo ao girassol. Blocos fora de placas voltam ao lugar.
  manualReset() {
    const A = this.active;
    A.respawn();
    this.blocks.forEach((b) => {
      const onPlate = this.plates.some((p) => p.pressed && Math.abs(b.cx - (p.x + p.w / 2)) < 30);
      if (!onPlate) { b.x = b.hx; b.y = b.hy; b.vy = 0; }
    });
    this.blackout = 0.6;
    this.updateCamera(0, true);
  }

  beginWin() {
    this.state = 'win';
    this.stateT = 0;
    this.twins.forEach((tw) => { tw.locked = true; tw.facing = Math.sign(this.goal.x - tw.x) || 1; });
    F.Audio.color();
    this.particles.burst(this.goal.x, this.goal.y - 60, 30, 'spark', this.theme.accent, 180);
    const lines = {
      arvores: [['noah', 'Eu pintei as árvores de volta.']],
      flores: [['vovo', 'Viu só? A sorte estava no amarelo o tempo todo.']],
      estrelas: [['brian', 'Fica com essa. É um pedaço de estrela. Agora é seu.']],
      oceanos: [['jude', 'Peguei você. Eu sempre vou pegar você.']],
      conchas: [['jude', 'O mar vai levar todas elas. Tudo bem. Eu faço outras.']],
      cores: [['noah', 'As cores voltaram. Todas de uma vez.']],
      passaros: [['noah', 'Mamãe. Eu pintei você de novo. Com todas as cores.']],
      pedras: [['oscar', 'Você não está quebrada, sabia? Está só no meio da escultura.'], ['jude', 'Então eu continuo esculpindo.']],
      metades: [['jude', 'Ela precisa ser partida ao meio. Pra cada um ter o próprio pedaço inteiro.'], ['noah', 'Então parte, Jude. Eu seguro.']],
      sol: [['noah', 'Chegamos, Jude. Olha o tamanho dele.'], ['jude', 'Ele é seu. Sempre foi.']],
    }[this.level.piece];
    this.hud.queue = [];
    this.hud.line = null;
    lines.forEach(([w, s]) => this.hud.say(w, s));
  }

  updateWin(dt) {
    const G = this.goal;
    if (G.style === 'mae') G.reveal = Math.min(1, (G.reveal || 0) + dt * 0.35);
    if (G.style === 'sculpture' && this.stateT > 3.2) {
      const before = G.split;
      G.split = Math.min(1, G.split + dt * 0.5);
      if (Math.floor(before * 6) !== Math.floor(G.split * 6)) {
        F.Audio.chisel();
        this.particles.burst(G.x, G.y - 60, 10, 'dust', '230,220,200', 140);
        this.shake = 0.12;
      }
    }
    if (Math.random() < 0.3) {
      this.particles.emit({
        x: G.x + F.utils.rand(-40, 40), y: G.y - F.utils.rand(20, 120),
        vy: -40, life: 1.6, size: 2, kind: 'spark', color: this.theme.accent,
      });
    }
    const wait = G.style === 'sculpture' ? 8 : 5.5;
    if (this.stateT > wait && !this.leaving && !this.hud.talking) {
      this.leaving = true;
      if (!F.Progress.pieces.includes(this.level.piece)) F.Progress.pieces.push(this.level.piece);
      F.Game.changeScene(() => new F.InterludeScene(this.index), '#fff6e8', 0.6);
    }
  }

  updateCamera(dt, snap = false) {
    const P = this.active, L = this.level;
    const tx = F.utils.clamp(P.x - F.W / 2 + P.facing * 60, 0, L.width - F.W);
    const ty = F.utils.clamp(P.y - F.H * 0.6, 0, L.height - F.H);
    if (snap) {
      this.cam.x = tx;
      this.cam.y = ty;
    } else {
      this.cam.x += (tx - this.cam.x) * (1 - Math.exp(-dt * 4));
      this.cam.y += (ty - this.cam.y) * (1 - Math.exp(-dt * 3.5));
    }
  }

  // ---------------- DESENHO ----------------
  draw(ctx) {
    const cam = this.cam, t = this.t, th = this.theme;
    const kind = this.active.kind;
    this.bg.draw(ctx, cam, t);

    ctx.save();
    const sx = this.shake > 0 ? F.utils.rand(-3, 3) : 0;
    const sy = this.shake > 0 ? F.utils.rand(-3, 3) : 0;
    ctx.translate(-cam.x + sx, -cam.y + sy);

    const visible = (x, w = 0) => x + w > cam.x - 80 && x < cam.x + F.W + 80;

    this.checkpoints.forEach((c) => visible(c.x) && c.draw(ctx, t));
    this.platforms.forEach((p) => visible(p.x, p.w) && p.draw(ctx, th, t, kind));
    this.cracked.forEach((c) => !c.dead && c.draw(ctx));
    this.gates.forEach((g) => g.draw(ctx, t));
    this.plates.forEach((p) => p.draw(ctx));
    this.blocks.forEach((b) => b.draw(ctx));
    this.thorns.forEach((tt) => tt.draw(ctx, th));
    this.mounds.forEach((m) => visible(m.x) && m.draw(ctx, t));
    this.frames.forEach((f) => visible(f.x) && f.draw(ctx, Math.abs(f.x - this.active.x) < 60 && Math.abs(f.y - this.active.y) < 20));
    this.drawWorldNpcs(ctx);
    this.bridges.forEach((p) => p.draw(ctx, th, t, kind));
    this.goal.draw(ctx, this.collected >= this.collectibles.length, th, this);
    this.pots.forEach((p) => visible(p.x) && p.draw(ctx));
    this.amulets.forEach((a) => visible(a.x) && a.draw(ctx));
    this.collectibles.forEach((c) => visible(c.x) && c.draw(ctx));

    // o gêmeo inativo atrás, o ativo na frente
    this.twins.forEach((tw) => tw !== this.active && tw.draw(ctx, false));
    this.active.draw(ctx, true);
    if (this.twins.length > 1 && this.state === 'play') {
      const A = this.active;
      F.draw.text(ctx, '▾', A.x, A.y - 62 + Math.sin(t * 4) * 2, { size: 14, color: 'rgba(255,220,140,0.9)' });
    }

    this.clouds.forEach((c) => c.draw(ctx, t));
    if (this.meteors) this.meteors.draw(ctx, t);
    if (this.water) this.water.draw(ctx, cam, t, this.level.width, this.level.height);
    this.particles.draw(ctx);
    ctx.restore();

    if (th.fog) this.drawFog(ctx);
    if (th.dark) this.drawDark(ctx);
    this.drawNpcs(ctx);
    this.bg.drawWeather(ctx);
    F.draw.vignette(ctx, 0.35, '20,8,10');
    this.hud.draw(ctx, this);

    if (this.blackout > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.blackout})`;
      ctx.fillRect(0, 0, F.W, F.H);
    }
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,246,225,${this.flash})`;
      ctx.fillRect(0, 0, F.W, F.H);
    }
  }

  // Personagens "de carne e osso" (o fantasma da vovó é desenhado depois da neblina)
  drawWorldNpcs(ctx) {
    const art = { oscar: F.Art.drawOscar, brian: F.Art.drawBrian, jude: F.Art.drawJude, noah: F.Art.drawNoah };
    for (const n of this.npcs) {
      if (!art[n.kind]) continue;
      art[n.kind](ctx, n.x, n.y, { t: n.t, facing: n.facing || -1, walk: n.walk, moving: n.moving });
    }
  }

  // Escuridão (capítulo da mãe): só a tinta, os girassóis e o Noah iluminam
  drawDark(ctx) {
    const d = this.fogCanvas;
    const dc = d.getContext('2d');
    dc.setTransform(F.SCALE, 0, 0, F.SCALE, 0, 0);
    dc.globalCompositeOperation = 'source-over';
    dc.clearRect(0, 0, F.W, F.H);
    dc.fillStyle = 'rgba(6,6,12,0.93)';
    dc.fillRect(0, 0, F.W, F.H);
    dc.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => {
      const g = dc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.55, `rgba(0,0,0,${a * 0.7})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      dc.fillStyle = g;
      dc.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const cx = this.cam.x, cy = this.cam.y;
    for (const tw of this.twins) hole(tw.x - cx, tw.y - 24 - cy, tw === this.active ? 150 + Math.sin(this.t * 2) * 6 : 90);
    for (const b of this.bridges) hole(b.x + b.w / 2 - cx, b.y - cy, 110, b.alpha);
    for (const c of this.clouds) if (c.colored) hole(c.cx - cx, c.cy - cy, 110, 0.9);
    for (const c of this.checkpoints) hole(c.x - cx, c.y - 40 - cy, c.active ? 110 : 45, c.active ? 0.9 : 0.5);
    for (const p of this.pots) if (p.available) hole(p.x - cx, p.y - 14 - cy, 60, 0.7);
    for (const c of this.collectibles) if (!c.collected) hole(c.x - cx, c.y - cy, 55, 0.7);
    hole(this.goal.x - cx, this.goal.y - 100 - cy, 120 + (this.goal.reveal || 0) * 500, 0.8);
    for (const w of this.bg.weather) if (w.type === 'fireflies') hole(w.x, w.y, 30, 0.5);
    ctx.drawImage(d, 0, 0, F.W, F.H);
  }

  // A vovó aparece por cima da neblina: fantasma não se esconde
  drawNpcs(ctx) {
    const A = this.active;
    ctx.save();
    ctx.translate(-this.cam.x, -this.cam.y);
    for (const n of this.npcs) {
      const d = Math.abs(A.x - n.x);
      const alpha = F.utils.clamp(1 - (d - 120) / 300, 0, 0.9);
      if (alpha <= 0 || n.kind !== 'vovo') continue;
      F.draw.glow(ctx, n.x, n.y - 30, 60, '255,170,200', 0.3 * alpha);
      F.Art.drawVovo(ctx, n.x, n.y, { t: this.t, facing: n.x > A.x ? -1 : 1, alpha });
    }
    ctx.restore();
  }

  // Neblina: um véu branco com um buraco em volta da Jude
  drawFog(ctx) {
    const fog = this.theme.fog;
    const d = this.fogCanvas;
    const dc = d.getContext('2d');
    dc.setTransform(F.SCALE, 0, 0, F.SCALE, 0, 0);
    dc.globalCompositeOperation = 'source-over';
    dc.clearRect(0, 0, F.W, F.H);
    dc.fillStyle = `rgba(${fog.color},0.94)`;
    dc.fillRect(0, 0, F.W, F.H);
    // fiapos de neblina mais densos
    for (let i = 0; i < 7; i++) {
      const x = ((i * 190 - this.cam.x * 0.4 + this.t * 12) % (F.W + 300) + F.W + 300) % (F.W + 300) - 150;
      dc.fillStyle = 'rgba(255,255,255,0.35)';
      dc.beginPath();
      dc.ellipse(x, 120 + (i % 3) * 140, 160, 30, 0, 0, Math.PI * 2);
      dc.fill();
    }
    dc.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => {
      const g = dc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.6, `rgba(0,0,0,${a * 0.75})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      dc.fillStyle = g;
      dc.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const cx = this.cam.x, cy = this.cam.y, A = this.active;
    hole(A.x - cx, A.y - 26 - cy, fog.radius + Math.sin(this.t * 1.5) * 8);
    for (const c of this.checkpoints) if (c.active) hole(c.x - cx, c.y - 40 - cy, 70, 0.7);
    for (const c of this.collectibles) if (!c.collected) hole(c.x - cx, c.y - cy, 40, 0.5);
    for (const p of this.platforms) if (p.ghost) hole(p.x + p.w / 2 - cx, p.y - cy, 60, 0.45);
    for (const n of this.npcs) hole(n.x - cx, n.y - 30 - cy, 90, 0.6);
    ctx.drawImage(d, 0, 0, F.W, F.H);
  }
};
