// ============================================================
//  CENA: JOGANDO UMA FASE
//  Monta a fase a partir dos dados em js/levels/, cuida da câmera,
//  da coleta dos pedaços, de quando ele cai e do encontro com ela.
// ============================================================
F.PlayScene = class {
  static FALL_LINES = [
    'levanta. ela vale cada queda.',
    'cair também é caminho até ela.',
    'de novo. por ela, sempre de novo.',
  ];

  constructor(index) {
    const L = (this.level = F.Levels[index]);
    this.index = index;
    this.theme = L.theme;
    this.t = 0;

    this.platforms = L.platforms.map((p) => new F.Platform(p[0], p[1], p[2], p[3], p[4] || {}));
    this.fragments = L.fragments.map((f) => new F.Fragment(f[0], f[1], f[2]));
    this.total = this.fragments.length;
    this.collected = 0;

    this.player = new F.Player(L.spawn.x, L.spawn.y);
    this.checkpoint = { x: L.spawn.x, y: L.spawn.y };
    this.amada = new F.Amada(L.amada.x, L.amada.y, L.amada.pose);
    this.bg = new F.Background(L.theme, L);
    this.particles = new F.Particles();
    this.hud = new F.HUD(L);

    this.cam = { x: 0, y: 0 };
    this.state = 'play';  // 'play' | 'meeting'
    this.stateT = 0;
    this.blackout = 0;    // tela preta rápida ao cair
    this.hintCooldown = 0;
    this.moteTimer = 0;
    this.falls = 0;

    if (L.theme.dark) {
      this.darkCanvas = document.createElement('canvas');
      this.darkCanvas.width = F.W * F.SCALE;
      this.darkCanvas.height = F.H * F.SCALE;
    }
    this.updateCamera(0, true);
  }

  enter() { F.Audio.setMusic(this.level.music); }

  // ---------------- LÓGICA ----------------
  update(dt) {
    this.t += dt;
    this.stateT += dt;
    this.hintCooldown -= dt;
    const P = this.player;

    this.platforms.forEach((p) => p.update(dt, this.t));
    P.update(dt, this);
    this.fragments.forEach((f) => f.update(dt));
    this.amada.update(dt);
    this.particles.update(dt);
    this.hud.update(dt);

    if (this.state === 'play') this.updatePlaying();
    else this.updateMeeting();

    // brilhinhos em volta dela
    this.moteTimer -= dt;
    if (this.moteTimer <= 0 && this.amada.dissolve < 1) {
      this.moteTimer = 0.25;
      this.particles.emit({
        x: this.amada.x + F.utils.rand(-14, 14), y: this.amada.y - F.utils.rand(10, 70),
        vy: -20, life: 1.6, size: 1.6, kind: 'spark', color: this.theme.accent,
      });
    }

    this.bg.update(dt, this.cam);
    this.updateCamera(dt);
    this.blackout = Math.max(0, this.blackout - dt * 1.4);
  }

  updatePlaying() {
    const P = this.player;
    const U = F.utils;

    // Pegar pedaços
    for (const f of this.fragments) {
      if (!f.collected && U.dist(P.x, P.y - P.h / 2, f.x, f.y) < 30) this.collect(f);
    }

    // Lembrar o último lugar seguro
    if (P.onGround && P.ground && P.ground.safe) {
      this.checkpoint = { x: U.clamp(P.x, P.ground.x + 12, P.ground.x + P.ground.w - 12), y: P.ground.y };
    }

    // Caiu
    if (P.y > this.level.height + 120) this.respawn();

    // Chegou nela
    this.amada.targetAlpha = 0.28 + 0.55 * (this.collected / this.total);
    const near = Math.abs(P.x - this.amada.x) < 46 && Math.abs(P.y - this.amada.y) < 60;
    if (near) {
      if (this.collected >= this.total) this.beginMeeting();
      else if (this.hintCooldown <= 0) {
        const left = this.total - this.collected;
        this.hud.showHint(left === 1 ? 'ainda falta um pedaço dela…' : `ainda faltam ${left} pedaços dela…`);
        this.hintCooldown = 5;
      }
    }
  }

  collect(f) {
    f.collected = true;
    this.collected++;
    F.Audio.chime(this.collected - 1);
    this.particles.burst(f.x, f.y, 18, 'spark', this.theme.accent, 140);
    this.particles.burst(f.x, f.y, 5, 'heart', '230,60,100', 70);
    this.hud.showMemory(f.memory);
    if (this.collected === this.total) {
      this.hintCooldown = 6;
      setTimeout(() => this.hud.showHint('todos os pedaços. agora, vá até ela.'), 600);
    }
  }

  respawn() {
    const P = this.player;
    P.x = this.checkpoint.x;
    P.y = this.checkpoint.y;
    P.vx = P.vy = 0;
    P.ground = null;
    this.platforms.forEach((p) => { if (p.fragile) p.reset(); });
    this.blackout = 1;
    F.Audio.fall();
    this.hud.showHint(F.PlayScene.FALL_LINES[this.falls++ % F.PlayScene.FALL_LINES.length]);
    this.hintCooldown = 3;
    this.updateCamera(0, true);
  }

  beginMeeting() {
    const P = this.player, A = this.amada;
    this.state = 'meeting';
    this.stateT = 0;
    P.locked = true;
    P.facing = Math.sign(A.x - P.x) || 1;
    P.lookUp = true;
    A.facing = -P.facing;
    A.targetAlpha = 1;
    F.Audio.sparkle();
    this.particles.burst((P.x + A.x) / 2, P.y - 40, 14, 'heart', '230,60,100', 90);
  }

  updateMeeting() {
    const P = this.player, A = this.amada;
    if (Math.random() < 0.15) {
      this.particles.emit({
        x: (P.x + A.x) / 2 + F.utils.rand(-10, 10), y: P.y - 30,
        vy: -40, vx: F.utils.rand(-15, 15), life: 1.8, size: F.utils.rand(4, 6), kind: 'heart', color: '230,60,100',
      });
    }
    // Esta versão dela vira luz (menos na última fase: lá ela fica)
    if (this.stateT > 1.6 && !A.dissolving && !this.level.final) A.dissolving = true;
    if (A.dissolving && A.dissolve < 1 && Math.random() < 0.6) {
      this.particles.emit({
        x: A.x + F.utils.rand(-10, 10), y: A.y - F.utils.rand(0, 70),
        vy: F.utils.rand(-90, -40), life: 1.4, size: 2.2, kind: 'spark', color: this.theme.accent,
      });
    }
    if (this.stateT > 3.6 && !this.leaving) {
      this.leaving = true;
      F.Game.changeScene(() => new F.InterludeScene(this.index), '#fff4f7', 0.7);
    }
  }

  updateCamera(dt, snap = false) {
    const P = this.player, L = this.level;
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
    const cam = this.cam;
    const P = this.player;
    this.bg.draw(ctx, cam, this.t);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);
    this.platforms.forEach((p) => p.draw(ctx, this.theme));
    this.amada.draw(ctx);
    this.fragments.forEach((f) => f.draw(ctx, this.theme));

    // O fio vermelho aponta para o próximo pedaço (ou para ela)
    if (this.state === 'play') {
      const target = this.nearestFragment() || this.amada.hand();
      const h = P.hand();
      F.Art.thread(ctx, h.x, h.y, target.x, target.y, this.t, 170);
    }

    P.draw(ctx);
    this.particles.draw(ctx);
    ctx.restore();

    if (this.theme.dark) this.drawDarkness(ctx);
    this.bg.drawWeather(ctx);
    F.draw.vignette(ctx, 0.4);
    this.hud.draw(ctx, this.collected, this.total);

    if (this.blackout > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.blackout})`;
      ctx.fillRect(0, 0, F.W, F.H);
    }
  }

  nearestFragment() {
    let best = null, bestD = Infinity;
    for (const f of this.fragments) {
      if (f.collected) continue;
      const d = F.utils.dist(this.player.x, this.player.y, f.x, f.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }

  // Fase escura: cobre tudo de breu e "fura" buracos de luz.
  drawDarkness(ctx) {
    const d = this.darkCanvas;
    const dc = d.getContext('2d');
    dc.setTransform(F.SCALE, 0, 0, F.SCALE, 0, 0);
    dc.globalCompositeOperation = 'source-over';
    dc.clearRect(0, 0, F.W, F.H);
    dc.fillStyle = 'rgba(4,3,14,0.94)';
    dc.fillRect(0, 0, F.W, F.H);
    dc.globalCompositeOperation = 'destination-out';

    const hole = (x, y, r, a = 1) => {
      const g = dc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.55, `rgba(0,0,0,${a * 0.65})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      dc.fillStyle = g;
      dc.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const cx = this.cam.x, cy = this.cam.y, P = this.player;
    hole(P.x - cx, P.y - 20 - cy, 150 + Math.sin(this.t * 2) * 6);
    for (const f of this.fragments) if (!f.collected) hole(f.x - cx, f.y - cy, 70, 0.85);
    hole(this.amada.x - cx, this.amada.y - 36 - cy, 80 + 50 * (this.collected / this.total), 0.75);
    for (const w of this.bg.weather) if (w.type === 'fireflies') hole(w.x, w.y, 36, 0.5);

    ctx.drawImage(d, 0, 0, F.W, F.H);
  }
};
