// ============================================================
//  CENA: TÍTULO
//  Primeiro uma tela preta pedindo um clique (o navegador só
//  deixa tocar som depois de uma interação). Depois, o título:
//  os dois sob a lua, ligados por um fio vermelho.
// ============================================================
F.TitleScene = class {
  constructor(skipGate = false) {
    this.t = 0;
    this.state = skipGate ? 'title' : 'gate';
    this.titleT = skipGate ? 2 : 0;
    this.theme = {
      sky: [[0, '#0b0614'], [0.55, '#2a0f2e'], [1, '#5a1a3e']],
      stars: 120,
      celestial: { type: 'moon', x: 480, y: 420, r: 30, color: '#fff3f6', glow: '255,180,210' },
      hills: [{ y: 450, amp: 26, freq: 0.004, color: '#2b0d27', parallax: 0 }],
      weather: { sparkles: 30 },
    };
    this.bg = new F.Background(this.theme, { id: 99, width: F.W, height: F.H });

    const R = F.utils.rand;
    this.shards = Array.from({ length: 16 }, () => ({
      x: R(0, F.W), y: R(0, F.H), s: R(4, 9), rot: R(0, 6), vr: R(-0.5, 0.5), vy: R(-14, -5), a: R(0.25, 0.7),
    }));
    this.shardColors = { light: '#ffffff', mid: '#ffc7d6', dark: '#c23a66', glow: '255,150,190' };
  }

  enter() { F.Audio.setMusic(F.Music.title); }

  groundY(x) { return 482 + Math.pow((x - 480) / 480, 2) * 40; }

  update(dt) {
    this.t += dt;
    this.bg.update(dt, { x: 0, y: 0 });
    for (const s of this.shards) {
      s.y += s.vy * dt;
      s.rot += s.vr * dt;
      if (s.y < -20) { s.y = F.H + 20; s.x = F.utils.rand(0, F.W); }
    }

    if (this.state === 'gate') {
      if (F.Input.anyPressed()) {
        F.Audio.init();
        this.state = 'title';
        this.titleT = 0;
      }
      return;
    }

    this.titleT += dt;
    if (this.titleT > 1.2 && F.Input.confirm()) {
      F.Audio.sparkle();
      F.Game.changeScene(() => new F.PlayScene(0), '#000', 0.7);
    }
  }

  draw(ctx) {
    if (this.state === 'gate') return this.drawGate(ctx);

    const t = this.t;
    this.bg.draw(ctx, { x: 0, y: 0 }, t);

    for (const s of this.shards) F.Art.shard(ctx, s.x, s.y, s.s, s.rot, this.shardColors, s.a);

    // Chão
    ctx.fillStyle = '#12050f';
    ctx.beginPath();
    ctx.moveTo(0, F.H);
    for (let x = 0; x <= F.W; x += 10) ctx.lineTo(x, this.groundY(x));
    ctx.lineTo(F.W, F.H);
    ctx.closePath();
    ctx.fill();

    // Ele à esquerda, ela à direita, e o fio entre os dois
    const hx = 250, sx = 710;
    const hy = this.groundY(hx), sy = this.groundY(sx);
    F.Art.drawHim(ctx, hx, hy, { facing: 1, t, headTilt: -0.12 });
    F.Art.drawHer(ctx, sx, sy, { facing: -1, t, pose: 'stand' });

    const ax = hx + 4, ay = hy - 16, bx = sx - 5, by = sy - 30;
    const pulse = 0.65 + 0.35 * Math.sin(t * 2);
    ctx.strokeStyle = `rgba(225,30,72,${pulse})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.bezierCurveTo(ax + 140, ay + 40 + Math.sin(t) * 6, bx - 140, by + 40 - Math.sin(t) * 6, bx, by);
    ctx.stroke();
    F.draw.heart(ctx, 480, 452 + Math.sin(t * 2) * 2, 7, `rgba(225,30,72,${pulse})`);

    // Textos
    const a = F.utils.clamp(this.titleT / 2, 0, 1);
    F.draw.text(ctx, 'Fragmentados', F.W / 2, 150, {
      size: 96, style: 'italic', weight: 300, color: '#fbe8ef', alpha: a, glow: 22, glowColor: 'rgba(255,120,170,0.7)', spacing: 1,
    });
    F.draw.text(ctx, 'um jogo sobre amar alguém em pedaços', F.W / 2, 210, { size: 19, style: 'italic', color: '#f2c9d6', alpha: a * 0.8 });

    const b = F.utils.clamp((this.titleT - 1) / 2, 0, 1);
    F.draw.text(ctx, '“Me diga em quantos pedaços você foi partida antes que eu te encontrasse;', F.W / 2, 268, { size: 20, style: 'italic', color: '#fff', alpha: b * 0.85 });
    F.draw.text(ctx, 'quero saber quantas versões suas eu terei para amar.”', F.W / 2, 294, { size: 20, style: 'italic', color: '#fff', alpha: b * 0.85 });
    F.draw.text(ctx, 'INSPIRADO NA OBRA DE FERNANDO MACHADO', F.W / 2, 330, { size: 11, spacing: 4, color: '#f2c9d6', alpha: b * 0.55 });

    const c = F.utils.clamp((this.titleT - 2) / 1.5, 0, 1) * (0.55 + 0.45 * Math.sin(t * 2.5));
    F.draw.text(ctx, F.Input.isTouch ? 'toque para começar' : 'pressione ENTER para começar', F.W / 2, 366, { size: 18, spacing: 2, color: '#fff', alpha: c });

    if (!F.Input.isTouch) {
      F.draw.text(ctx, '← →  andar     ·     espaço  pular     ·     M  música', F.W / 2, 525, { size: 13, spacing: 1, color: '#f2c9d6', alpha: a * 0.45 });
    } else {
      F.draw.text(ctx, '◀ ▶  andar     ·     ♥  pular (segure para ir mais alto)', F.W / 2, 400, { size: 16, spacing: 1, color: '#f2c9d6', alpha: a * 0.6 });
    }

    F.draw.vignette(ctx, 0.5);
  }

  drawGate(ctx) {
    const t = this.t;
    ctx.fillStyle = '#07030a';
    ctx.fillRect(0, 0, F.W, F.H);
    const a = F.utils.clamp(t / 1.5, 0, 1);
    const beat = 1 + Math.max(0, Math.sin(t * 5)) * 0.12;
    ctx.save();
    ctx.globalAlpha = a;
    F.draw.glow(ctx, F.W / 2, F.H / 2 - 20, 70, '225,40,90', 0.35);
    F.draw.heart(ctx, F.W / 2, F.H / 2 - 20, 16 * beat, '#d8325a');
    ctx.restore();
    F.draw.text(ctx, F.Input.isTouch ? 'toque na tela' : 'clique ou pressione qualquer tecla', F.W / 2, F.H / 2 + 30, { size: 18, style: 'italic', color: '#f2c9d6', alpha: a * 0.8 });
    F.draw.text(ctx, '(com som, de preferência)', F.W / 2, F.H / 2 + 56, { size: 14, style: 'italic', color: '#f2c9d6', alpha: a * 0.45 });
  }
};
