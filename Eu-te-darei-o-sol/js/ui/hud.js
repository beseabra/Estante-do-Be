// ============================================================
//  HUD (informações por cima do jogo)
//    - Cartão do capítulo no começo
//    - Pedaços do mundo já recuperados (canto superior esquerdo)
//    - Coletáveis da fase (canto superior direito)
//    - Tinta do Noah / amuletos da Jude (canto inferior esquerdo)
//    - Quem você está controlando (no capítulo cooperativo)
//    - Caixa de fala (com máquina de escrever), dicas e memórias
// ============================================================
// Os dez pedaços do mundo, na ordem dos capítulos
F.PIECES = ['arvores', 'flores', 'estrelas', 'conchas', 'cores', 'oceanos', 'passaros', 'pedras', 'metades', 'sol'];

F.SPEAKERS = {
  oscar: { name: 'Oscar', color: '#c8a0ff' },
  noah:  { name: 'Noah',  color: '#ff9a5a' },
  jude:  { name: 'Jude',  color: '#7ac8ff' },
  vovo:  { name: 'Vovó',  color: '#ff7aa8' },
  brian: { name: 'Brian', color: '#7ae0b0' },
};

F.HUD = class {
  constructor(level) {
    this.level = level;
    this.t = 0;
    this.memory = null;
    this.memoryT = 0;
    this.hint = null;
    this.hintT = 0;
    this.queue = [];
    this.line = null;   // fala atual: { who, text, tw, t, life }
  }

  showMemory(text) { this.memory = text; this.memoryT = 0; }
  showHint(text) { this.hint = text; this.hintT = 0; }

  // Coloca uma fala na fila. "urgent" fura a fila (ex.: "acabou a tinta").
  say(who, text, urgent = false) {
    const item = { who, text };
    if (urgent) {
      if (this.line && this.line.text === text) return;
      this.queue.unshift(item);
      this.line = null;
    } else this.queue.push(item);
  }

  get talking() { return !!this.line || this.queue.length > 0; }

  update(dt) {
    this.t += dt;
    this.memoryT += dt;
    this.hintT += dt;

    // as falas esperam o cartão do capítulo sair da tela
    if (!this.line && this.queue.length && this.t > (this.level.quote ? 5.6 : 4.4)) {
      const n = this.queue.shift();
      this.line = { ...n, tw: new F.Typewriter([n.text], 45), t: 0, life: 2.4 + n.text.length * 0.045 };
    }
    if (this.line) {
      this.line.tw.update(dt);
      this.line.t += dt;
      if (F.Input.pressed.Enter || F.Input.pressed.NumpadEnter) {
        if (!this.line.tw.done) this.line.tw.finish();
        else this.line.t = this.line.life;
      }
      if (this.line.t >= this.line.life) this.line = null;
    }
  }

  // Curva de transparência: aparece, fica, some.
  static fade(t, fadeIn, hold, fadeOut) {
    if (t < 0) return 0;
    if (t < fadeIn) return t / fadeIn;
    if (t < fadeIn + hold) return 1;
    return Math.max(0, 1 - (t - fadeIn - hold) / fadeOut);
  }

  // Painel translúcido onde os ícones ficam legíveis em qualquer fundo
  static chip(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(20,14,24,0.38)';
    F.draw.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
  }

  draw(ctx, scene) {
    const L = this.level, th = L.theme;
    const t = this.t;

    // ---- Cartão do capítulo ----
    const a = F.HUD.fade(t - 0.3, 1.2, 3.6, 1.4);
    if (a > 0) {
      ctx.fillStyle = `rgba(20,12,20,${0.3 * a})`;
      ctx.fillRect(0, 120, F.W, L.quote ? 200 : 140);
      F.draw.text(ctx, `CAPÍTULO ${L.numeral}`, F.W / 2, 148, { size: 14, spacing: 6, color: '#fff', alpha: a * 0.85 });
      F.draw.text(ctx, L.title, F.W / 2, 192, { size: 58, font: F.HAND, color: '#fff', alpha: a, glow: 14, glowColor: `rgba(${th.accent},0.9)` });
      F.draw.text(ctx, L.subtitle, F.W / 2, 236, { size: 20, style: 'italic', color: '#fff', alpha: a * 0.8 });
      // epígrafe: um trecho do livro
      if (L.quote) {
        const qa = a * F.utils.clamp((t - 1.2) / 1, 0, 1);
        L.quote.lines.forEach((ln, i) => F.draw.text(ctx, ln, F.W / 2, 270 + i * 22, { size: 18, style: 'italic', color: '#ffeccc', alpha: qa * 0.95 }));
        F.draw.text(ctx, L.quote.who, F.W / 2, 274 + L.quote.lines.length * 22, { size: 12, spacing: 3, color: '#ffeccc', alpha: qa * 0.6 });
      }
    }

    // ---- Pedaços do mundo ----
    const kinds = F.PIECES;
    F.HUD.chip(ctx, 14, 14, 18 + kinds.length * 24, 32);
    kinds.forEach((k, i) => {
      const got = F.Progress.pieces.includes(k);
      const x = 32 + i * 24, y = 30;
      if (got) F.draw.glow(ctx, x, y, 14, '255,230,160', 0.35);
      F.Art.piece(ctx, k, x, y, k === 'sol' ? 1.3 : 1, t, got ? 1 : 0.22);
    });

    // ---- Coletáveis da fase ----
    const total = scene.collectibles.length, got = scene.collected;
    const cw = 40 + total * 22;
    F.HUD.chip(ctx, F.W - 14 - cw, 14, cw, 32);
    const fn = { retrato: F.Art.retrato, pagina: F.Art.pagina, estrela: F.Art.fallenStar, raio: F.Art.ray }[L.collectibleArt];
    for (let i = 0; i < total; i++) {
      const x = F.W - 14 - cw + 22 + i * 22;
      fn(ctx, x, 30, t + i, 0.55, i < got ? 1 : 0.22);
    }
    F.draw.text(ctx, `${got}/${total}`, F.W - 34, 30, { size: 18, font: F.HAND, color: '#fff', alpha: 0.9 });

    // ---- Tinta / amuletos ----
    let bx = 14;
    for (const tw of scene.twins) {
      const active = tw === scene.active;
      const w = tw.kind === 'noah' ? 128 : 40 + Math.max(1, tw.amulets) * 22;
      F.HUD.chip(ctx, bx, F.H - 50, w, 36);
      ctx.save();
      ctx.globalAlpha = active ? 1 : 0.55;
      // rostinho
      ctx.save();
      ctx.translate(bx + 18, F.H - 6);
      ctx.scale(0.66, 0.66);
      ctx.beginPath();
      ctx.arc(1, -38, 17, 0, Math.PI * 2);
      ctx.clip();
      if (tw.kind === 'noah') F.Art.drawNoah(ctx, 0, 0, { t, noShadow: true });
      else F.Art.drawJude(ctx, 0, 0, { t, noShadow: true });
      ctx.restore();
      if (tw.kind === 'noah') {
        for (let i = 0; i < F.Twin.PAINT_MAX; i++) {
          const x = bx + 44 + i * 26, y = F.H - 32;
          const full = i < tw.paint;
          ctx.fillStyle = full ? `hsl(${(i * 70 + t * 40) % 360},80%,62%)` : 'rgba(255,255,255,0.15)';
          ctx.beginPath();
          ctx.moveTo(x, y - 9);
          ctx.quadraticCurveTo(x + 8, y + 1, x, y + 7);
          ctx.quadraticCurveTo(x - 8, y + 1, x, y - 9);
          ctx.fill();
        }
      } else {
        if (tw.amulets === 0) F.draw.text(ctx, '·', bx + 46, F.H - 32, { size: 20, color: '#fff', alpha: 0.4 });
        for (let i = 0; i < tw.amulets; i++) F.Art.amulet(ctx, bx + 46 + i * 22, F.H - 32, 'trevo', t + i);
      }
      if (active && scene.twins.length > 1) {
        ctx.strokeStyle = 'rgba(255,220,140,0.9)';
        ctx.lineWidth = 1.5;
        F.draw.roundRect(ctx, bx, F.H - 50, w, 36, 18);
        ctx.stroke();
      }
      ctx.restore();
      bx += w + 10;
    }
    if (scene.twins.length > 1) {
      F.draw.text(ctx, F.Input.isTouch ? '⇄ trocar' : 'TAB trocar', bx + 6, F.H - 32, { size: 16, align: 'left', style: 'italic', color: '#fff', alpha: 0.7 });
    }

    // ---- Dica ----
    if (this.hint) {
      const ha = F.HUD.fade(this.hintT, 0.4, 4.2, 1);
      if (ha > 0) {
        ctx.font = `italic 400 19px ${F.FONT}`;
        const w = ctx.measureText(this.hint).width + 40;
        ctx.globalAlpha = ha;
        const hy = this.line ? 196 : 74;   // desce quando há alguém falando
        F.HUD.chip(ctx, F.W / 2 - w / 2, hy - 16, w, 30);
        ctx.globalAlpha = 1;
        F.draw.text(ctx, this.hint, F.W / 2, hy, { size: 19, style: 'italic', color: '#fff', alpha: ha });
      }
    }

    // ---- Memória (ao pegar um coletável) ----
    if (this.memory && !this.line) {
      const ma = F.HUD.fade(this.memoryT, 0.5, 3.2, 1);
      F.draw.text(ctx, `“${this.memory}”`, F.W / 2, 140, {
        size: 24, style: 'italic', color: '#fff', alpha: ma, glow: 10, glowColor: 'rgba(0,0,0,0.8)',
      });
    }

    // ---- Caixa de fala ----
    if (this.line) this.drawLine(ctx);
  }

  drawLine(ctx) {
    const l = this.line;
    const sp = F.SPEAKERS[l.who] || { name: l.who, color: '#fff' };
    const a = Math.min(1, l.t * 5, (l.life - l.t) * 3);
    const w = 640, h = 78, x = F.W / 2 - w / 2, y = 100;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(24,16,26,0.78)';
    F.draw.roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = sp.color;
    ctx.globalAlpha = a * 0.6;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = a;
    F.draw.text(ctx, sp.name, x + 22, y + 18, { size: 24, font: F.HAND, align: 'left', color: sp.color });
    // quebra de linha simples
    ctx.font = `italic 400 19px ${F.FONT}`;
    const words = l.text.split(' ');
    const rows = [''];
    for (const wd of words) {
      const test = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd;
      if (ctx.measureText(test).width > w - 44) rows.push(wd);
      else rows[rows.length - 1] = test;
    }
    const shown = Math.floor(Math.max(0, l.tw.chars));
    let left = shown;
    rows.forEach((r, i) => {
      const n = Math.min(r.length, left);
      left -= r.length + 1;
      if (n > 0) F.draw.text(ctx, r.slice(0, n), x + 22, y + 42 + i * 21, { size: 19, style: 'italic', align: 'left', color: '#fbf3ea' });
    });
    ctx.restore();
  }
};
