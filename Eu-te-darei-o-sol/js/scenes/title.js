// ============================================================
//  CENA: TÍTULO
//  Primeiro uma tela pedindo um clique (o navegador só deixa
//  tocar som depois de uma interação). Depois, o título:
//  os gêmeos de costas num penhasco, olhando o sol, os cabelos
//  virando um rio escuro e dourado.
// ============================================================
F.TitleScene = class {
  constructor(skipGate = false) {
    this.t = 0;
    this.state = skipGate ? 'title' : 'gate';
    this.titleT = skipGate ? 2 : 0;
    this.theme = {
      sky: [[0, '#2a2060'], [0.4, '#b0507a'], [0.75, '#f39a6a'], [1, '#ffd88a']],
      clouds: 5,
      cloudColor: 'rgba(255,200,180,0.25)',
      hills: [
        { y: 430, amp: 18, freq: 0.006, color: 'rgba(90,60,110,0.55)', parallax: 0 },
      ],
      weather: { sparkles: 24, petals: 8 },
      petalColor: '255,200,90',
    };
    this.bg = new F.Background(this.theme, { id: 99, width: F.W, height: F.H });
  }

  enter() { F.Audio.setMusic(F.Music.title); }

  update(dt) {
    this.t += dt;
    this.bg.update(dt, { x: 0, y: 0 });

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
      F.Progress.pieces = [];
      F.Game.changeScene(() => new F.PlayScene(0), '#fff6e8', 0.7);
    }
  }

  draw(ctx) {
    if (this.state === 'gate') return this.drawGate(ctx);
    const t = this.t;
    this.bg.draw(ctx, { x: 0, y: 0 }, t);


    // mar
    const sea = ctx.createLinearGradient(0, 410, 0, F.H);
    sea.addColorStop(0, '#d0708a');
    sea.addColorStop(1, '#3a2a6a');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 410, F.W, F.H - 410);
    ctx.fillStyle = 'rgba(255,220,160,0.5)';
    for (let i = 0; i < 9; i++) {
      const w = 140 - i * 12;
      ctx.fillRect(480 - w / 2 + Math.sin(t * 1.4 + i) * 6, 418 + i * 11, w, 2);
    }

    // rio de cabelo subindo até o sol (escuro do Noah, dourado da Jude)
    F.Mural.hairRiver(ctx, 480, 440, 420, 280, t, 0.45);

    // o sol, baixo no horizonte
    F.draw.glow(ctx, 480, 320, 300, '255,190,110', 0.5);
    F.Art.sun(ctx, 480, 320, 50, t);

    // o penhasco onde os dois estão sentados
    ctx.fillStyle = '#24182e';
    ctx.beginPath();
    ctx.moveTo(250, F.H);
    ctx.quadraticCurveTo(330, 480, 480, 474);
    ctx.quadraticCurveTo(630, 480, 710, F.H);
    ctx.fill();
    F.Art.drawTwinsBack(ctx, 480, 478, 2.2, t, false);

    // textos
    const a = F.utils.clamp(this.titleT / 2, 0, 1);
    F.draw.text(ctx, 'Eu te darei o sol', F.W / 2, 112, {
      size: 104, font: F.HAND, color: '#fff6e6', alpha: a, glow: 22, glowColor: 'rgba(255,160,90,0.8)',
    });
    F.draw.text(ctx, 'um jogo sobre dois irmãos que dividiram o mundo ao meio', F.W / 2, 178, { size: 20, style: 'italic', color: '#fff0e0', alpha: a * 0.85 });

    const b = F.utils.clamp((this.titleT - 1) / 2, 0, 1);
    F.draw.text(ctx, 'INSPIRADO EM "EU TE DAREI O SOL", DE JANDY NELSON  ·  JOGO DE FÃ, SEM FINS COMERCIAIS', F.W / 2, 208, { size: 10, spacing: 3, color: '#fff0e0', alpha: b * 0.6 });
    F.draw.text(ctx, 'TRECHOS DA EDIÇÃO BRASILEIRA, TRADUÇÃO DE PAULO POLZONOFF JUNIOR (NOVO CONCEITO)', F.W / 2, 224, { size: 9, spacing: 3, color: '#fff0e0', alpha: b * 0.45 });

    const c = F.utils.clamp((this.titleT - 2) / 1.5, 0, 1) * (0.55 + 0.45 * Math.sin(t * 2.5));
    F.draw.text(ctx, F.Input.isTouch ? 'toque para começar' : 'pressione ENTER para começar', F.W / 2, 252, { size: 18, spacing: 2, color: '#fff', alpha: c });

    if (!F.Input.isTouch) {
      F.draw.text(ctx, '← → andar  ·  espaço pular / planar  ·  X pintar / esculpir  ·  TAB trocar  ·  R recomeçar  ·  M música', F.W / 2, 526, { size: 13, spacing: 1, color: '#fff0e0', alpha: a * 0.6 });
    } else {
      F.draw.text(ctx, '◀ ▶ andar  ·  ☀ pular (segure para planar)  ·  ✦ pintar / esculpir  ·  ⇄ trocar', F.W / 2, 300, { size: 16, spacing: 1, color: '#fff0e0', alpha: a * 0.7 });
    }

    F.draw.vignette(ctx, 0.45, '30,10,30');
  }

  drawGate(ctx) {
    const t = this.t;
    ctx.fillStyle = '#120a14';
    ctx.fillRect(0, 0, F.W, F.H);
    const a = F.utils.clamp(t / 1.5, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    F.draw.glow(ctx, F.W / 2, F.H / 2 - 24, 90, '255,190,90', 0.35);
    F.Art.sun(ctx, F.W / 2, F.H / 2 - 24, 16 + Math.sin(t * 3) * 1.5, t);
    ctx.restore();
    F.draw.text(ctx, F.Input.isTouch ? 'toque na tela' : 'clique ou pressione qualquer tecla', F.W / 2, F.H / 2 + 36, { size: 18, style: 'italic', color: '#ffdcb0', alpha: a * 0.8 });
    F.draw.text(ctx, '(com som, de preferência)', F.W / 2, F.H / 2 + 62, { size: 14, style: 'italic', color: '#ffdcb0', alpha: a * 0.45 });
  }
};
