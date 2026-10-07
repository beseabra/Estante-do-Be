// ============================================================
//  OS GÊMEOS (Noah e Jude)
//  (x, y) = posição dos PÉS.
//
//  Os dois usam a mesma física. O que muda é o "dom" de cada um:
//    NOAH  pula menos, mas PLANA (segure pular no ar)
//          e PINTA (X): pontes de tinta ou colorir nuvens cinzentas.
//    JUDE  pula mais alto, ESCULPE (X) pedras rachadas,
//          EMPURRA blocos e enxerga os degraus da vovó.
//          Amuletos a protegem de um golpe cada.
// ============================================================
F.Twin = class {
  static MAX_SPEED = 230;
  static ACCEL = 1900;
  static AIR_ACCEL = 1300;
  static FRICTION = 2400;
  static AIR_FRICTION = 500;
  static GRAVITY = 1900;
  static MAX_FALL = 900;
  static GLIDE_FALL = 100;    // "mamãe é o paraquedas"
  static COYOTE = 0.1;
  static BUFFER = 0.12;
  static PAINT_MAX = 3;
  static PUSH_SPEED = 120;   // velocidade empurrando um bloco

  constructor(kind, x, y) {
    this.kind = kind;                       // 'noah' | 'jude'
    this.jumpSpeed = kind === 'noah' ? 650 : 700;
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.w = 18; this.h = 42;
    this.facing = 1;
    this.onGround = false;
    this.ground = null;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.walk = 0;
    this.squash = 0;
    this.t = Math.random() * 5;
    this.act = 0;            // animação da ferramenta (pincel/cinzel)
    this.cool = 0;
    this.gliding = false;
    this.glideSound = 0;
    this.invuln = 0;
    this.locked = false;
    this.paint = F.Twin.PAINT_MAX;
    this.amulets = 0;
    this.checkpoint = { x, y };
  }

  get name() { return this.kind === 'noah' ? 'Noah' : 'Jude'; }

  update(dt, scene, controlled) {
    const T = F.Twin, I = F.Input, U = F.utils;
    const input = controlled && !this.locked;
    this.t += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.cool = Math.max(0, this.cool - dt);
    this.act = Math.max(0, this.act - dt * 3);
    const wasGround = this.onGround;
    const prevVy = this.vy;

    // ---- Andar ----
    let dir = 0;
    if (input) {
      if (I.left()) dir -= 1;
      if (I.right()) dir += 1;
    }
    if (dir) {
      this.vx += dir * (this.onGround ? T.ACCEL : T.AIR_ACCEL) * dt;
      this.facing = dir;
    } else {
      this.vx = U.approach(this.vx, 0, (this.onGround ? T.FRICTION : T.AIR_FRICTION) * dt);
    }
    this.vx = U.clamp(this.vx, -T.MAX_SPEED, T.MAX_SPEED);

    // ---- Pular ----
    this.coyote = this.onGround ? T.COYOTE : this.coyote - dt;
    this.jumpBuffer = input && I.jumpPressed() ? T.BUFFER : this.jumpBuffer - dt;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = -this.jumpSpeed;
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.onGround = false;
      this.ground = null;
      F.Audio.jump();
      scene.particles.burst(this.x, this.y, 5, 'dust', '255,255,255', 40);
    }

    const holding = input && I.jumpHeld();
    let g = T.GRAVITY;
    if (this.vy < 0 && !holding) g *= 2.2;
    this.vy = Math.min(this.vy + g * dt, T.MAX_FALL);

    // ---- Planar (só o Noah) ----
    this.gliding = this.kind === 'noah' && !this.onGround && holding && this.vy > 0;
    if (this.gliding) {
      this.vy = Math.min(this.vy, T.GLIDE_FALL);
      this.glideSound -= dt;
      if (this.glideSound <= 0) { F.Audio.glide(); this.glideSound = 0.5; }
      if (Math.random() < dt * 20) scene.particles.burst(this.x + U.rand(-14, 14), this.y - 28, 1, 'spark', '255,230,160', 20);
    } else this.glideSound = 0;

    // ---- Ação (X) ----
    if (input && I.actionPressed() && this.cool <= 0) {
      if (scene.usePortal(this)) this.cool = 0.4;
      else if (this.kind === 'noah') this.doPaint(scene);
      else this.doChisel(scene);
    }

    // ---- Ser carregado pela plataforma ----
    if (this.ground) {
      this.x += this.ground.dx;
      this.y += this.ground.dy;
    }

    // ---- Horizontal + paredes (e empurrar blocos) ----
    const solids = scene.solids;
    const prevX = this.x;
    const moveX = this.vx * dt;
    this.x += moveX;
    for (const p of solids) {
      if (!p.solidFor(this) || p.oneWay || !this.overlaps(p)) continue;
      if (p instanceof F.Block && this.kind === 'jude' && this.onGround && moveX) {
        // empurra o bloco num passo firme; se ele travar, ela trava também
        const push = U.clamp(moveX, -T.PUSH_SPEED * dt, T.PUSH_SPEED * dt);
        const pushed = p.tryMove(push, solids);
        if (pushed) {
          this.x = prevX + pushed;
          this.vx = U.clamp(this.vx, -T.PUSH_SPEED, T.PUSH_SPEED);
          if (this.overlaps(p)) this.x = moveX > 0 ? p.x - this.w / 2 - 0.01 : p.x + p.w + this.w / 2 + 0.01;
          this.pushing = 0.15;
          continue;
        }
      }
      this.x = prevX <= p.x + p.w / 2 ? p.x - this.w / 2 - 0.01 : p.x + p.w + this.w / 2 + 0.01;
      this.vx = 0;
    }
    this.x = U.clamp(this.x, this.w / 2, scene.level.width - this.w / 2);
    this.pushing = Math.max(0, (this.pushing || 0) - dt);

    // ---- Vertical + chão e teto ----
    const prevY = this.y;
    if (!this.onGround && !this.gliding) this.airTop = Math.min(this.airTop ?? prevY, prevY);
    this.y += this.vy * dt;
    this.onGround = false;
    this.ground = null;
    for (const p of solids) {
      if (!p.solidFor(this)) continue;
      if (this.x + this.w / 2 <= p.x || this.x - this.w / 2 >= p.x + p.w) continue;
      const wasAbove = prevY <= Math.max(p.y, p.prevY ?? p.y) + 1;
      if (this.vy >= 0 && wasAbove && this.y >= p.y) {
        this.y = p.y;
        this.vy = 0;
        this.onGround = true;
        this.ground = p;
        p.step(this);
      } else if (!p.oneWay && this.vy < 0 && prevY - this.h >= p.y + p.h - 1 && this.y - this.h < p.y + p.h) {
        this.y = p.y + p.h + this.h;
        this.vy = 0;
      }
    }

    // ---- Detalhes visuais ----
    // fases verticais: uma queda muito longa volta ao girassol
    if (!wasGround && this.onGround && scene.level.fallLimit && this.y - this.airTop > scene.level.fallLimit) {
      scene.hurt(this, 'Foi uma queda e tanto. De volta ao girassol.', true);
      return;
    }
    if (this.onGround || this.gliding) this.airTop = this.y;

    if (!wasGround && this.onGround && prevVy > 350) {
      this.squash = 1;
      scene.particles.burst(this.x, this.y, 6, 'dust', '255,255,255', 50);
    }
    this.squash = Math.max(0, this.squash - dt * 5);
    if (this.onGround && Math.abs(this.vx) > 15) this.walk += Math.abs(this.vx) * dt * 0.075;
  }

  // NOAH: colore uma nuvem próxima ou pinta uma ponte nos pés
  doPaint(scene) {
    if (this.paint <= 0) {
      scene.say('Noah', 'Acabou a tinta. Preciso de um pote.', true);
      this.cool = 0.6;
      return;
    }
    this.act = 1;
    this.cool = 0.4;
    const cloud = scene.clouds.find((c) => !c.colored && F.utils.dist(c.cx, c.cy, this.x, this.y - 20) < 110);
    this.paint--;
    if (cloud) {
      cloud.color(scene);
      scene.onColorCloud && scene.onColorCloud(cloud);
      return;
    }
    const w = 96;
    const x = this.facing > 0 ? this.x + 6 : this.x - 6 - w;
    const ttl = scene.level.paintTtl || 5;
    scene.addPaintBridge(new F.Platform(x, this.y, w, 10, { paint: true, ttl, oneWay: true }));
    F.Audio.paint();
    scene.particles.burst(x + w / 2, this.y, 14, 'spark', '255,200,140', 120);
  }

  // JUDE: golpe de cinzel na pedra à frente
  doChisel(scene) {
    this.act = 1;
    this.cool = 0.28;
    const reachX = this.x + this.facing * (this.w / 2 + 16);
    const mound = scene.mounds.find((m) => Math.abs(m.x - this.x) < 44 && Math.abs(m.y - this.y) < 12);
    if (mound) { mound.sculpt(scene); return; }
    const stone = scene.cracked.find((s) => !s.dead &&
      reachX > s.x - 14 && reachX < s.x + s.w + 14 && this.y > s.y && this.y - this.h < s.y + s.h);
    if (stone) stone.hit(scene);
    else F.Audio.whoosh();
  }

  overlaps(p) {
    return this.x - this.w / 2 < p.x + p.w && this.x + this.w / 2 > p.x &&
           this.y - this.h < p.y + p.h && this.y > p.y;
  }

  respawn() {
    this.x = this.checkpoint.x;
    this.y = this.checkpoint.y;
    this.vx = 0; this.vy = 0;
    this.ground = null;
    this.airTop = this.y;
    this.paint = F.Twin.PAINT_MAX;
    this.invuln = 1;
  }

  draw(ctx, active) {
    if (this.invuln > 0 && Math.floor(this.invuln * 14) % 2) return;
    const o = {
      facing: this.facing,
      t: this.t,
      walk: this.walk,
      moving: this.onGround && Math.abs(this.vx) > 15,
      air: !this.onGround,
      glide: this.gliding,
      squash: this.squash,
      act: this.act,
      reach: this.pushing > 0,
    };
    if (!active) {
      ctx.save();
      ctx.globalAlpha *= 0.82;
    }
    if (this.kind === 'noah') F.Art.drawNoah(ctx, this.x, this.y, o);
    else F.Art.drawJude(ctx, this.x, this.y, o);
    if (!active) ctx.restore();
    // escudo dos amuletos
    if (this.kind === 'jude' && this.amulets > 0) {
      const a = 0.12 + Math.sin(this.t * 3) * 0.05;
      ctx.strokeStyle = `rgba(255,220,140,${a + 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 22, 18, 28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};
