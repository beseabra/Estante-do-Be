// ============================================================
//  O JOGADOR (ele)
//  (x, y) = posição dos PÉS. A física é simples:
//  aceleração, atrito, gravidade e colisão com as plataformas.
// ============================================================
F.Player = class {
  // Ajuste fino da sensação de movimento
  static MAX_SPEED = 230;
  static ACCEL = 1900;
  static AIR_ACCEL = 1300;
  static FRICTION = 2400;
  static AIR_FRICTION = 500;
  static GRAVITY = 1900;
  static JUMP = 640;          // altura do pulo ≈ 108px
  static MAX_FALL = 900;
  static COYOTE = 0.1;        // ainda dá pra pular logo depois de sair da beirada
  static BUFFER = 0.12;       // apertar pular um pouco antes de cair também vale

  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.w = 18; this.h = 40;
    this.facing = 1;
    this.onGround = false;
    this.ground = null;     // plataforma em que está pisando
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.walk = 0;
    this.squash = 0;
    this.t = 0;
    this.locked = false;    // true = o jogador não controla (cutscene)
  }

  // Onde fica a mão da frente (de onde sai o fio vermelho)
  hand() { return { x: this.x + this.facing * 4, y: this.y - 16 }; }

  update(dt, scene) {
    const P = F.Player, I = F.Input, U = F.utils;
    this.t += dt;
    const wasGround = this.onGround;
    const prevVy = this.vy;

    // ---- Andar ----
    let dir = 0;
    if (!this.locked) {
      if (I.left()) dir -= 1;
      if (I.right()) dir += 1;
    }
    if (dir) {
      this.vx += dir * (this.onGround ? P.ACCEL : P.AIR_ACCEL) * dt;
      this.facing = dir;
    } else {
      this.vx = U.approach(this.vx, 0, (this.onGround ? P.FRICTION : P.AIR_FRICTION) * dt);
    }
    this.vx = U.clamp(this.vx, -P.MAX_SPEED, P.MAX_SPEED);

    // ---- Pular ----
    this.coyote = this.onGround ? P.COYOTE : this.coyote - dt;
    this.jumpBuffer = !this.locked && I.jumpPressed() ? P.BUFFER : this.jumpBuffer - dt;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = -P.JUMP;
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.onGround = false;
      this.ground = null;
      F.Audio.jump();
      scene.particles.burst(this.x, this.y, 5, 'dust', '255,255,255', 40);
    }

    // Soltar o botão cedo = pulo mais baixo
    let g = P.GRAVITY;
    if (this.vy < 0 && !I.jumpHeld()) g *= 2.2;
    this.vy = Math.min(this.vy + g * dt, P.MAX_FALL);

    // ---- Ser carregado pela plataforma que se move ----
    if (this.ground) {
      this.x += this.ground.dx;
      this.y += this.ground.dy;
    }

    // ---- Movimento horizontal + colisão com paredes ----
    const prevX = this.x;
    this.x += this.vx * dt;
    for (const p of scene.platforms) {
      if (!p.solid || p.oneWay || !this.overlaps(p)) continue;
      this.x = prevX <= p.x ? p.x - this.w / 2 - 0.01 : p.x + p.w + this.w / 2 + 0.01;
      this.vx = 0;
    }
    this.x = U.clamp(this.x, this.w / 2, scene.level.width - this.w / 2);

    // ---- Movimento vertical + colisão com chão e teto ----
    const prevY = this.y;
    this.y += this.vy * dt;
    this.onGround = false;
    this.ground = null;
    for (const p of scene.platforms) {
      if (!p.solid) continue;
      if (this.x + this.w / 2 <= p.x || this.x - this.w / 2 >= p.x + p.w) continue;

      const wasAbove = prevY <= Math.max(p.y, p.prevY) + 1;
      if (this.vy >= 0 && wasAbove && this.y >= p.y) {
        this.y = p.y;
        this.vy = 0;
        this.onGround = true;
        this.ground = p;
        p.step();
      } else if (!p.oneWay && this.vy < 0 && prevY - this.h >= p.y + p.h - 1 && this.y - this.h < p.y + p.h) {
        this.y = p.y + p.h + this.h;
        this.vy = 0;
      }
    }

    // ---- Detalhes visuais ----
    if (!wasGround && this.onGround && prevVy > 350) {
      this.squash = 1;
      scene.particles.burst(this.x, this.y, 6, 'dust', '255,255,255', 50);
    }
    this.squash = Math.max(0, this.squash - dt * 5);
    if (this.onGround && Math.abs(this.vx) > 15) this.walk += Math.abs(this.vx) * dt * 0.075;
  }

  overlaps(p) {
    return this.x - this.w / 2 < p.x + p.w && this.x + this.w / 2 > p.x &&
           this.y - this.h < p.y + p.h && this.y > p.y;
  }

  draw(ctx) {
    F.Art.drawHim(ctx, this.x, this.y, {
      facing: this.facing,
      t: this.t,
      walk: this.walk,
      moving: this.onGround && Math.abs(this.vx) > 15,
      air: !this.onGround,
      squash: this.squash,
      headTilt: this.lookUp ? -0.18 : 0,
    });
  }
};
