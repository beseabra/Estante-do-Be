// ============================================================
//  DISPOSITIVOS: coisas que fazem o mundo mudar
//    Placa de pressão, portão, bloco empurrável, pedra rachada,
//    girassol (checkpoint), gatilho de diálogo e a meta da fase.
// ============================================================

// Cores que ligam placas aos portões (mesma cor = ligados)
F.LINK_COLORS = { a: '255,196,60', b: '120,200,255', c: '255,120,170', d: '150,230,140' };

// ---------- PLACA DE PRESSÃO ----------
// [x, y, id]  — y é o topo do chão onde ela está
F.Plate = class {
  constructor(x, y, id) {
    this.x = x; this.y = y; this.w = 40; this.id = id;
    this.pressed = false;
    this.was = false;
  }
  check(actors) {
    this.pressed = actors.some((a) => {
      const bottom = a.bottom ?? a.y;
      const cx = a.cx ?? a.x;
      return a.onGround !== false && Math.abs(bottom - this.y) < 5 && cx > this.x - 4 && cx < this.x + this.w + 4;
    });
    if (this.pressed !== this.was) F.Audio.click();
    this.was = this.pressed;
  }
  draw(ctx) {
    const c = F.LINK_COLORS[this.id] || '255,255,255';
    const sink = this.pressed ? 3 : 0;
    if (this.pressed) F.draw.glow(ctx, this.x + this.w / 2, this.y - 2, 40, c, 0.5);
    ctx.fillStyle = '#4a4038';
    ctx.fillRect(this.x - 2, this.y - 3, this.w + 4, 3);
    ctx.fillStyle = `rgba(${c},${this.pressed ? 1 : 0.7})`;
    F.draw.roundRect(ctx, this.x, this.y - 7 + sink, this.w, 5, 2);
    ctx.fill();
  }
};

// ---------- PORTÃO ----------
// [x, y, w, h, [ids das placas]] — abre enquanto qualquer placa ligada estiver pressionada
F.Gate = class {
  constructor(x, y, w, h, links) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.links = links;
    this.open = 0;
    this.oneWay = false;
    this.prevY = y; this.dx = 0; this.dy = 0;
    this.wasOpen = false;
  }
  get solid() { return this.open < 0.85; }
  solidFor() { return this.solid; }
  step() {}
  update(dt, plates) {
    const want = plates.some((p) => this.links.includes(p.id) && p.pressed);
    this.open = F.utils.approach(this.open, want ? 1 : 0, dt * 2.5);
    if (want !== this.wasOpen) F.Audio.gate();
    this.wasOpen = want;
  }
  draw(ctx, t) {
    const c = F.LINK_COLORS[this.links[0]] || '255,255,255';
    const off = this.open * (this.h - 6);
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x - 4, this.y - this.h, this.w + 8, this.h * 2);
    ctx.clip();
    ctx.translate(0, -off);
    const g = ctx.createLinearGradient(this.x, 0, this.x + this.w, 0);
    g.addColorStop(0, '#5a4a3c');
    g.addColorStop(1, '#3a3028');
    ctx.fillStyle = g;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (let yy = this.y + 14; yy < this.y + this.h; yy += 14) {
      ctx.beginPath();
      ctx.moveTo(this.x, yy); ctx.lineTo(this.x + this.w, yy);
      ctx.stroke();
    }
    // símbolo de sol com a cor da placa ligada
    ctx.strokeStyle = `rgba(${c},0.9)`;
    ctx.lineWidth = 2;
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + t * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
      ctx.lineTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10);
      ctx.stroke();
    }
    ctx.restore();
  }
};

// ---------- BLOCO EMPURRÁVEL (só a Jude empurra) ----------
// [x, y] — y é o chão em que ele está
F.Block = class {
  constructor(x, y) {
    this.w = 36; this.h = 36;
    this.hx = x; this.hy = y - this.h;
    this.x = this.hx; this.y = this.hy;
    this.vy = 0;
    this.oneWay = false;
    this.solid = true;
    this.prevY = this.y; this.dx = 0; this.dy = 0;
    this.onGround = false;
  }
  get bottom() { return this.y + this.h; }
  get cx() { return this.x + this.w / 2; }
  solidFor() { return true; }
  step() {}

  overlaps(s, x = this.x, y = this.y) {
    return x < s.x + s.w && x + this.w > s.x && y < s.y + s.h && y + this.h > s.y;
  }

  // Tenta andar dx; para em paredes. Devolve quanto andou de fato.
  tryMove(dx, solids) {
    const nx = this.x + dx;
    for (const s of solids) {
      // portões seguram o bloco mesmo abertos: assim ele para em cima da placa
      if (s === this || s.oneWay || (!s.solid && !(s instanceof F.Gate))) continue;
      if (this.overlaps(s, nx, this.y)) return 0;
    }
    this.x = nx;
    return dx;
  }

  update(dt, solids, level) {
    const px = this.x, py = this.y;
    this.prevY = py;
    this.vy = Math.min(this.vy + 1900 * dt, 900);
    const prevBottom = this.y + this.h;
    this.y += this.vy * dt;
    this.onGround = false;
    for (const s of solids) {
      if (s === this || !s.solid || s.ghost) continue;
      if (this.x + this.w <= s.x || this.x >= s.x + s.w) continue;
      if (this.vy >= 0 && prevBottom <= Math.max(s.y, s.prevY ?? s.y) + 1 && this.y + this.h >= s.y) {
        this.y = s.y - this.h;
        this.vy = 0;
        this.onGround = true;
        if (s.dx) this.x += s.dx;
      }
    }
    if (this.y > level.height + 100) {
      this.x = this.hx; this.y = this.hy; this.vy = 0;
    }
    this.dx = this.x - px;
    this.dy = this.y - py;
  }

  draw(ctx) {
    const { x, y, w, h } = this;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#d8c8a8');
    g.addColorStop(1, '#a08a68');
    ctx.fillStyle = g;
    F.draw.roundRect(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,40,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + 14, y + 12);
    ctx.moveTo(x + 22, y + 24); ctx.lineTo(x + 30, y + 22);
    ctx.moveTo(x + 10, y + 28); ctx.lineTo(x + 16, y + 30);
    ctx.stroke();
  }
};

// ---------- PEDRA RACHADA (a Jude esculpe com o cinzel) ----------
// [x, y, w, h, golpes]
F.Cracked = class {
  constructor(x, y, w, h, hp = 3) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.hp = hp; this.maxHp = hp;
    this.oneWay = false;
    this.solid = true;
    this.prevY = y; this.dx = 0; this.dy = 0;
    this.shake = 0;
    this.dead = false;
  }
  solidFor() { return this.solid; }
  step() {}
  hit(scene) {
    this.hp--;
    this.shake = 0.25;
    F.Audio.chisel();
    scene.particles.burst(this.x + this.w / 2, this.y + this.h / 2, 8, 'dust', '220,210,190', 120);
    if (this.hp <= 0) {
      this.solid = false;
      this.dead = true;
      F.Audio.rubble();
      for (let i = 0; i < 4; i++) {
        scene.particles.burst(this.x + this.w / 2, this.y + (i + 0.5) * (this.h / 4), 10, 'dust', '200,190,170', 160);
      }
    }
  }
  update(dt) { this.shake = Math.max(0, this.shake - dt); }
  draw(ctx) {
    const ox = this.shake > 0 ? Math.sin(this.shake * 90) * 2 : 0;
    const { y, w, h } = this;
    const x = this.x + ox;
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, '#9a9488');
    g.addColorStop(1, '#6e6a62');
    ctx.fillStyle = g;
    F.draw.roundRect(ctx, x, y, w, h, 4);
    ctx.fill();
    // rachaduras: quanto mais golpes, mais rachada
    ctx.strokeStyle = 'rgba(30,25,20,0.7)';
    ctx.lineWidth = 1.2;
    const dmg = this.maxHp - this.hp;
    const rnd = F.utils.seeded(this.x + this.y);
    for (let i = 0; i < 2 + dmg * 2; i++) {
      let cx = x + w * (0.2 + rnd() * 0.6), cy = y + h * rnd();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let k = 0; k < 4; k++) {
        cx += (rnd() - 0.5) * 14;
        cy += 6 + rnd() * 8;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    F.draw.text(ctx, '✧', x + w / 2, y + 12, { size: 12, color: 'rgba(255,240,200,0.6)' });
  }
};

// ---------- GIRASSOL (ponto de controle) ----------
F.Checkpoint = class {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.bloom = 0;
    this.active = false;
  }
  update(dt) { this.bloom = F.utils.approach(this.bloom, this.active ? 1 : 0, dt * 1.5); }
  draw(ctx, t) { F.Art.sunflower(ctx, this.x, this.y, this.bloom, t); }
};

// ---------- GATILHO (falas e dicas) ----------
// { x, w, lines: [{ who, text }], hint, only: 'noah'|'jude' }
F.Trigger = class {
  constructor(o) {
    Object.assign(this, o);
    this.w = o.w || 40;
    this.fired = false;
  }
};

// ---------- META DA FASE ----------
// { x, y, piece, style: 'piece'|'brian'|'noahSea'|'sculpture', both }
F.Goal = class {
  constructor(o) {
    Object.assign(this, o);
    this.t = 0;
    this.split = 0;
  }
  update(dt) { this.t += dt; }
  draw(ctx, unlocked, theme, scene) {
    const t = this.t, a = unlocked ? 1 : 0.35;
    if (this.style === 'brian') {
      F.Art.telescope(ctx, this.x + 26, this.y);
      F.Art.drawBrian(ctx, this.x, this.y, { facing: -1, t });
      F.Art.piece(ctx, 'estrelas', this.x - 4, this.y - 90 + Math.sin(t * 2) * 4, 3, t, a);
    } else if (this.style === 'noahSea') {
      // o Noah boiando um pouco além do píer, subindo e descendo com a maré
      const wl = scene && scene.water ? scene.water.level : this.y + 70;
      F.Art.noahFloating(ctx, this.x + 80, wl + 2, t);
      F.Art.piece(ctx, 'oceanos', this.x + 80, wl - 70 + Math.sin(t * 2) * 4, 3, t, a);
    } else if (this.style === 'mae') {
      F.Art.maePainting(ctx, this.x, this.y, t, this.reveal || 0);
      F.Art.piece(ctx, 'passaros', this.x, this.y - 210 + Math.sin(t * 2) * 4, 3, t, a);
    } else if (this.style === 'sun') {
      const r = 46 + Math.sin(t * 1.5) * 2;
      F.draw.glow(ctx, this.x, this.y - 150, r * 5, '255,200,110', 0.35 + 0.35 * a);
      F.Art.sun(ctx, this.x, this.y - 150, r, t, 0.5 + 0.5 * a);
    } else if (this.style === 'sculpture') {
      F.Art.sculptureTwins(ctx, this.x, this.y, 1.2, this.split, t);
      F.Art.piece(ctx, 'metades', this.x, this.y - 130 + Math.sin(t * 2) * 4, 3, t, a);
    } else {
      F.draw.glow(ctx, this.x, this.y - 40, 70, theme.accent, 0.3 * a + 0.1);
      F.Art.piece(ctx, this.piece, this.x, this.y - 40 + Math.sin(t * 2) * 5, 4, t, a);
    }
  }
};

// ---------- MONTE DE AREIA (capítulo das mulheres de areia) ----------
// [x, y, altura] — a Jude esculpe (X) uma mulher de areia; os braços
// dela viram um degrau. Quando a maré chega na base, o mar a leva.
F.SandMound = class {
  constructor(x, y, h = 80) {
    this.x = x; this.y = y; this.h = h;
    this.build = 0; this.crumble = 0;
    this.state = 'idle';   // 'idle' | 'building' | 'built' | 'crumbling'
    this.plat = new F.Platform(x - 30, y - h, 60, 12, { oneWay: true });
    this.plat.alpha = 0;   // invisível: quem aparece é a escultura
    this.plat.solid = false;
    this.t = 0;
  }
  dry(scene) { return !scene.water || scene.water.level > this.y - 2; }
  sculpt(scene) {
    if (this.state !== 'idle') return;
    if (!this.dry(scene)) { scene.hud.showHint('A maré está alta demais. Espere o mar recuar.'); return; }
    this.state = 'building';
    F.Audio.chisel();
    scene.particles.burst(this.x, this.y - 10, 14, 'dust', '230,200,150', 120);
  }
  update(dt, scene) {
    this.t += dt;
    if (this.state === 'building') {
      this.build = Math.min(1, this.build + dt * 2.2);
      if (Math.random() < 0.3) scene.particles.burst(this.x + F.utils.rand(-20, 20), this.y - this.h * this.build, 2, 'dust', '230,200,150', 60);
      if (this.build >= 1) { this.state = 'built'; this.plat.solid = true; F.Audio.bloom(); }
    } else if (this.state === 'built' && !this.dry(scene)) {
      this.state = 'crumbling';
      this.plat.solid = false;
      F.Audio.splash();
    } else if (this.state === 'crumbling') {
      this.crumble = Math.min(1, this.crumble + dt * 1.4);
      if (Math.random() < 0.4) scene.particles.burst(this.x + F.utils.rand(-20, 20), this.y - this.h * (1 - this.crumble), 2, 'dust', '230,200,150', 80);
      if (this.crumble >= 1) { this.state = 'idle'; this.build = 0; this.crumble = 0; }
    }
  }
  draw(ctx, t) {
    F.Art.sandMound(ctx, this.x, this.y, t, this.state === 'idle');
    F.Art.sandWoman(ctx, this.x, this.y, this.h, this.build, this.crumble, t);
  }
};

// ---------- MOLDURA-PORTAL (escola de artes) ----------
// [x, y, id, pintura] — duas molduras com o mesmo id são ligadas:
// aperte X na frente de uma e você sai pela outra.
F.Frame = class {
  constructor(x, y, id, art) {
    this.x = x; this.y = y; this.id = id; this.art = art || 'a';
    this.pair = null;
    this.t = Math.random() * 5;
  }
  update(dt) { this.t += dt; }
  draw(ctx, near) { F.Art.frame(ctx, this.x, this.y, this.art, this.t, near); }
};
