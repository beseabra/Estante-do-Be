// ============================================================
//  CENÁRIO DE FUNDO
//  Céu em degradê, estrelas, sol/lua, nuvens, colinas em camadas
//  (parallax: as de trás andam mais devagar) e o clima da fase:
//  pétalas, folhas, poeira de pedra, vaga-lumes, chuva, neve ou brilhos.
//  Extras opcionais: silhuetas de árvores (trees), de casas (city)
//  e dos gigantes de pedra do ateliê (giants).
//
//  Tudo é configurado pelo "theme" de cada fase (veja js/levels/).
// ============================================================
F.Background = class {
  constructor(theme, level) {
    this.theme = theme;
    this.level = level;
    const rnd = F.utils.seeded((level.id || 1) * 977 + 13);

    this.stars = [];
    for (let i = 0; i < (theme.stars || 0); i++) {
      this.stars.push({ x: rnd() * F.W, y: rnd() * F.H * 0.72, r: 0.4 + rnd() * 1.2, p: rnd() * 6.28, s: 0.6 + rnd() * 2 });
    }

    this.clouds = [];
    for (let i = 0; i < (theme.clouds || 0); i++) {
      this.clouds.push({ x: rnd() * (F.W + 300) - 150, y: 40 + rnd() * 220, s: 0.6 + rnd() * 0.9, v: 3 + rnd() * 8 });
    }

    this.hills = (theme.hills || []).map((h) => Object.assign({ ph: [rnd() * 100, rnd() * 100, rnd() * 100] }, h));

    this.weather = [];
    const w = theme.weather || {};
    for (const type in w) {
      for (let i = 0; i < w[type]; i++) this.weather.push(this.spawn(type));
    }
    this.prevCam = null;
  }

  spawn(type) {
    const R = F.utils.rand;
    const p = { type, x: R(0, F.W), y: R(0, F.H), depth: R(0.3, 1), t: R(0, 10) };
    switch (type) {
      case 'petals':    Object.assign(p, { vx: R(-30, -10), vy: R(18, 40), s: R(2.5, 4.5), rot: R(0, 6), vr: R(-2, 2) }); break;
      case 'snow':      Object.assign(p, { vx: R(-8, 8), vy: R(18, 45), s: R(0.8, 2.4) }); break;
      case 'rain':      Object.assign(p, { vx: -90, vy: R(480, 620), s: R(10, 18) }); break;
      case 'fireflies': Object.assign(p, { vx: R(-12, 12), vy: R(-12, 12), s: R(1.2, 2.4) }); break;
      case 'sparkles':  Object.assign(p, { vx: R(-5, 5), vy: R(-25, -10), s: R(1, 2.5) }); break;
      case 'leaves':    Object.assign(p, { vx: R(-40, -15), vy: R(20, 45), s: R(3, 5), rot: R(0, 6), vr: R(-3, 3), hue: R(70, 130) }); break;
      case 'dust':      Object.assign(p, { vx: R(-6, 6), vy: R(-8, 8), s: R(0.6, 1.8) }); break;
    }
    return p;
  }

  update(dt, cam) {
    const dcx = this.prevCam ? cam.x - this.prevCam.x : 0;
    const dcy = this.prevCam ? cam.y - this.prevCam.y : 0;
    this.prevCam = { x: cam.x, y: cam.y };

    for (const c of this.clouds) {
      c.x += c.v * dt;
      if (c.x > F.W + 200) c.x = -200;
    }

    const R = F.utils.rand;
    for (const p of this.weather) {
      p.t += dt;
      if (p.type === 'fireflies') {
        p.vx = F.utils.clamp(p.vx + R(-40, 40) * dt, -20, 20);
        p.vy = F.utils.clamp(p.vy + R(-40, 40) * dt, -20, 20);
      }
      p.x += p.vx * dt - dcx * p.depth * 0.6;
      p.y += p.vy * dt - dcy * p.depth * 0.6;
      if (p.type === 'leaves') { p.x += Math.sin(p.t * 2) * 20 * dt; p.rot += p.vr * dt; }
      if (p.type === 'petals') { p.x += Math.sin(p.t * 1.5) * 14 * dt; p.rot += p.vr * dt; }
      if (p.type === 'snow') p.x += Math.sin(p.t) * 10 * dt;

      // Quem sai de um lado da tela volta pelo outro
      if (p.x < -30) p.x += F.W + 60;
      if (p.x > F.W + 30) p.x -= F.W + 60;
      if (p.y > F.H + 30) { p.y -= F.H + 60; p.x = R(0, F.W); }
      if (p.y < -30) { p.y += F.H + 60; p.x = R(0, F.W); }
    }
  }

  draw(ctx, cam, t) {
    const th = this.theme;
    const extraH = Math.max(0, this.level.height - F.H); // fases altas (verticais)

    // Céu
    const g = ctx.createLinearGradient(0, 0, 0, F.H);
    th.sky.forEach(([stop, color]) => g.addColorStop(stop, color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, F.W, F.H);

    // Estrelas piscando
    for (const s of this.stars) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.s * 0.5 + s.p));
      const x = ((s.x - cam.x * 0.02) % F.W + F.W) % F.W;
      ctx.fillStyle = `rgba(255,250,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sol ou lua
    const c = th.celestial;
    if (c) {
      const cy = c.y + (c.rise && extraH ? (cam.y / extraH) * c.rise : 0);
      const cx = c.x - cam.x * 0.03;
      F.draw.glow(ctx, cx, cy, c.r * 4.5, c.glow, 0.55);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
      ctx.fill();
      if (c.type === 'moon') {
        ctx.fillStyle = 'rgba(180,170,210,0.25)';
        ctx.beginPath();
        ctx.arc(cx - c.r * 0.3, cy - c.r * 0.2, c.r * 0.22, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 0.35, cy + c.r * 0.3, c.r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nuvens
    ctx.fillStyle = th.cloudColor || 'rgba(255,255,255,0.2)';
    for (const cl of this.clouds) {
      const x = cl.x - cam.x * 0.05;
      const wrapped = ((x + 200) % (F.W + 400) + (F.W + 400)) % (F.W + 400) - 200;
      ctx.beginPath();
      ctx.ellipse(wrapped, cl.y, 60 * cl.s, 16 * cl.s, 0, 0, Math.PI * 2);
      ctx.ellipse(wrapped + 30 * cl.s, cl.y - 10 * cl.s, 36 * cl.s, 16 * cl.s, 0, 0, Math.PI * 2);
      ctx.ellipse(wrapped - 34 * cl.s, cl.y - 4 * cl.s, 30 * cl.s, 12 * cl.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Colinas em camadas
    for (const h of this.hills) {
      const ox = cam.x * h.parallax;
      const base = h.y - (cam.y - extraH) * h.parallax;
      if (base - h.amp > F.H) continue;
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.moveTo(0, F.H);
      for (let x = 0; x <= F.W; x += 8) {
        const X = x + ox;
        const y = base +
          Math.sin(X * h.freq + h.ph[0]) * h.amp +
          Math.sin(X * h.freq * 2.3 + h.ph[1]) * h.amp * 0.4 +
          Math.sin(X * h.freq * 5.1 + h.ph[2]) * h.amp * 0.15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(F.W, F.H);
      ctx.closePath();
      ctx.fill();
    }

    if (th.gallery) this.drawGallery(ctx, cam, th.gallery);
    if (th.trees) this.drawTrees(ctx, cam, th.trees);
    if (th.city) this.drawCity(ctx, cam, th.city, t);
    if (th.giants) this.drawGiants(ctx, cam, th.giants);
  }

  // Paredes da escola de artes: rodapé e quadros pendurados ao longe
  drawGallery(ctx, cam, o) {
    const off = cam.x * 0.35;
    const span = 260;
    const first = Math.floor(off / span) - 1;
    for (let i = first; i < first + F.W / span + 3; i++) {
      const r = F.utils.seeded(i * 13 + 7);
      const x = i * span - off + r() * 60;
      const w = 90 + r() * 70, h = 70 + r() * 60, y = 120 + r() * 80;
      ctx.fillStyle = o.color;
      ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
      ctx.fillStyle = `hsla(${r() * 360},40%,60%,0.22)`;
      ctx.fillRect(x, y, w, h);
    }
    ctx.fillStyle = 'rgba(90,64,44,0.25)';
    ctx.fillRect(0, 400, F.W, 8);
  }

  // Silhuetas de árvores em duas camadas (o bosque do Noah)
  drawTrees(ctx, cam, o) {
    [[0.15, o.far, 0.75], [0.35, o.near, 1]].forEach(([par, color, s], layer) => {
      const rnd = F.utils.seeded(31 + layer);
      ctx.fillStyle = color;
      const span = 140 * s;
      const off = cam.x * par;
      const first = Math.floor(off / span) - 1;
      for (let i = first; i < first + F.W / span + 3; i++) {
        const r = F.utils.seeded(i * 17 + layer * 5);
        const x = i * span - off + r() * 40;
        const base = o.y + layer * 20;
        const hgt = (150 + r() * 120) * s;
        ctx.fillRect(x - 4 * s, base - hgt * 0.6, 8 * s, hgt * 0.6 + 200);
        ctx.beginPath();
        ctx.arc(x, base - hgt * 0.65, 34 * s + r() * 16, 0, Math.PI * 2);
        ctx.arc(x - 22 * s, base - hgt * 0.5, 26 * s, 0, Math.PI * 2);
        ctx.arc(x + 24 * s, base - hgt * 0.52, 28 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      rnd();
    });
  }

  // Casinhas ao longe com janelas acesas (a cidade à noite)
  drawCity(ctx, cam, o, t) {
    const off = cam.x * 0.2;
    const span = 90;
    const first = Math.floor(off / span) - 1;
    for (let i = first; i < first + F.W / span + 3; i++) {
      const r = F.utils.seeded(i * 29 + 3);
      const x = i * span - off;
      const w = 60 + r() * 25, h = 60 + r() * 70;
      const y = o.y - h;
      ctx.fillStyle = o.color;
      ctx.fillRect(x, y, w, h + 200);
      ctx.beginPath();
      ctx.moveTo(x - 6, y); ctx.lineTo(x + w / 2, y - 26 - r() * 10); ctx.lineTo(x + w + 6, y);
      ctx.fill();
      for (let k = 0; k < 3; k++) {
        if (r() < 0.45) {
          const wx = x + 10 + k * 18, wy = y + 16 + r() * 30;
          const a = 0.55 + 0.25 * Math.sin(t * 0.7 + i + k);
          ctx.fillStyle = `rgba(255,214,130,${a})`;
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
  }

  // Gigantes de pedra do ateliê: figuras enormes, inacabadas, de mãos dadas
  drawGiants(ctx, cam, o) {
    const off = cam.x * 0.25;
    const span = 420;
    const first = Math.floor(off / span) - 1;
    for (let i = first; i < first + F.W / span + 3; i++) {
      const r = F.utils.seeded(i * 41 + 9);
      const x = i * span - off + r() * 80;
      const base = o.y;
      const s = 0.9 + r() * 0.4;
      ctx.fillStyle = o.color;
      // dois corpos inclinados um para o outro
      [-1, 1].forEach((side) => {
        const cx = x + side * 46 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 34 * s, base);
        ctx.lineTo(cx - 24 * s, base - 200 * s);
        ctx.quadraticCurveTo(cx - side * 6 * s, base - 240 * s, cx + 24 * s, base - 200 * s);
        ctx.lineTo(cx + 34 * s, base);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - side * 6 * s, base - 252 * s, 26 * s, 0, Math.PI * 2);
        ctx.fill();
      });
      // mãos dadas no meio
      ctx.beginPath();
      ctx.arc(x, base - 120 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
      // marcas de cinzel
      ctx.strokeStyle = 'rgba(255,240,210,0.06)';
      ctx.lineWidth = 2;
      for (let k = 0; k < 6; k++) {
        const yy = base - r() * 220 * s;
        ctx.beginPath();
        ctx.moveTo(x - 70 * s + r() * 30, yy);
        ctx.lineTo(x - 50 * s + r() * 30, yy + 8);
        ctx.stroke();
      }
    }
  }

  // O clima é desenhado POR CIMA do mundo (fica mais imersivo).
  drawWeather(ctx) {
    const petal = this.theme.petalColor || '255,190,210';
    for (const p of this.weather) {
      switch (p.type) {
        case 'petals':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgba(${petal},0.85)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case 'snow':
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rain':
          ctx.strokeStyle = 'rgba(190,210,255,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (p.vx / p.vy) * p.s, p.y + p.s);
          ctx.stroke();
          break;
        case 'fireflies': {
          const a = 0.5 + 0.5 * Math.sin(p.t * 3);
          F.draw.glow(ctx, p.x, p.y, p.s * 8, '255,230,140', 0.5 * a);
          ctx.fillStyle = `rgba(255,250,200,${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sparkles':
          F.draw.sparkle(ctx, p.x, p.y, p.s * 2.2, 0.5 + 0.5 * Math.sin(p.t * 4), '255,230,180');
          break;
        case 'leaves':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `hsla(${p.hue},55%,45%,0.85)`;
          ctx.beginPath();
          ctx.moveTo(-p.s, 0);
          ctx.quadraticCurveTo(0, -p.s * 0.8, p.s, 0);
          ctx.quadraticCurveTo(0, p.s * 0.8, -p.s, 0);
          ctx.fill();
          ctx.restore();
          break;
        case 'dust':
          ctx.fillStyle = `rgba(255,240,210,${0.25 + 0.25 * Math.sin(p.t * 2)})`;
          ctx.fillRect(p.x, p.y, p.s, p.s);
          break;
      }
    }
  }
};
