// ============================================================
//  O universo atrás do globo: estrelas em três camadas (as de perto
//  andam mais que as do fundo), a faixa da Via Láctea, estrelas que
//  piscam e, de vez em quando, uma estrela cadente.
//
//  Ele deriva devagar sozinho e acompanha o globo: girar a Terra
//  faz o céu girar junto, como se a câmera orbitasse o planeta.
//  As camadas são desenhadas uma vez só (em "azulejos" que se
//  repetem) e a cada quadro só são carimbadas no lugar: fica leve.
// ============================================================
window.Universo = (() => {
  let canvas, ctx, w = 0, h = 0, dpr = 1;
  let camadas = [];            // { img, tam, prof }
  let brilhantes = [];         // estrelas que piscam
  const halos = new Map();     // cor -> brilho já desenhado (reaproveitado a cada quadro)
  let ox = 0, oy = 0, giro = 0;
  let ultimo = null;
  let coberto = false;         // o mapa tomou a tela toda: nem desenha
  let meteoro = null, proximoMeteoro = 5000;
  let antes = 0;

  // números "aleatórios" que saem sempre iguais: o céu não muda a cada visita
  function sorteio(semente) {
    let s = semente;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function novaTela(lw, lh) {
    const c = document.createElement('canvas');
    c.width = Math.round(lw * dpr);
    c.height = Math.round(lh * dpr);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    return [c, x];
  }

  // desenha algo nas 9 posições vizinhas, para o azulejo emendar sem costura
  function emendado(tw, th, desenho) {
    for (const dx of [-tw, 0, tw]) for (const dy of [-th, 0, th]) desenho(dx, dy);
  }

  function camadaEstrelas(tam, qtd, rMax, cores, rnd) {
    const [c, x] = novaTela(tam, tam);
    for (let i = 0; i < qtd; i++) {
      const px = rnd() * tam, py = rnd() * tam;
      const r = rnd() ** 3 * rMax + 0.35;
      x.globalAlpha = 0.3 + rnd() * 0.7;
      x.fillStyle = cores[Math.floor(rnd() * cores.length)];
      emendado(tam, tam, (dx, dy) => { x.beginPath(); x.arc(px + dx, py + dy, r, 0, 2 * Math.PI); x.fill(); });
    }
    return { img: c, tw: tam, th: tam };
  }

  function viaLactea(rnd) {
    const tw = 2400, th = 1400;
    const [c, x] = novaTela(tw, th);
    // a faixa atravessa o azulejo na diagonal; nuvens coloridas e muita poeira de estrela
    const naFaixa = () => {
      const t = rnd();
      const desvio = (rnd() + rnd() + rnd() - 1.5) * 0.22;
      return [t * tw, (0.5 + desvio) * th + (t - 0.5) * th * 0.35];
    };
    const nuvens = [
      'rgba(110,80,200,', 'rgba(60,110,220,', 'rgba(200,100,170,', 'rgba(80,160,210,', 'rgba(150,120,230,',
    ];
    for (let i = 0; i < 70; i++) {
      const [px, py] = naFaixa();
      const r = 80 + rnd() * 260;
      const cor = nuvens[Math.floor(rnd() * nuvens.length)];
      const a = 0.025 + rnd() * 0.05;
      emendado(tw, th, (dx, dy) => {
        const g = x.createRadialGradient(px + dx, py + dy, 0, px + dx, py + dy, r);
        g.addColorStop(0, cor + a + ')');
        g.addColorStop(1, cor + '0)');
        x.fillStyle = g;
        x.fillRect(px + dx - r, py + dy - r, r * 2, r * 2);
      });
    }
    // poeira de estrelas concentrada na faixa
    x.fillStyle = '#fff';
    for (let i = 0; i < 2600; i++) {
      const [px, py] = naFaixa();
      x.globalAlpha = 0.15 + rnd() * 0.45;
      const r = rnd() * 0.7 + 0.2;
      emendado(tw, th, (dx, dy) => { x.beginPath(); x.arc(px + dx, py + dy, r, 0, 2 * Math.PI); x.fill(); });
    }
    return { img: c, tw, th };
  }

  function montar() {
    const rnd = sorteio(20241016);
    const brancas = ['#ffffff', '#fff6e8', '#e8f0ff', '#ffe9d6', '#d9e6ff'];
    camadas = [
      { ...viaLactea(rnd), prof: 0.2 },
      { ...camadaEstrelas(520, 300, 0.7, brancas, rnd), prof: 0.35 },
      { ...camadaEstrelas(760, 120, 1.2, brancas, rnd), prof: 0.6 },
      { ...camadaEstrelas(980, 45, 1.7, [...brancas, '#ffd2a8', '#bcd4ff'], rnd), prof: 1 },
    ];
    brilhantes = Array.from({ length: 46 }, () => ({
      x: rnd() * 1200,
      y: rnd() * 1200,
      r: 0.9 + rnd() * 1.3,
      vel: 0.6 + rnd() * 2.2,
      fase: rnd() * 6.3,
      cor: brancas[Math.floor(rnd() * brancas.length)],
      cruz: rnd() < 0.25,
    }));
  }

  // o brilho de uma estrela, desenhado uma vez por cor
  function halo(cor) {
    if (!halos.has(cor)) {
      const [c, x] = novaTela(32, 32);
      const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, cor);
      g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 32, 32);
      halos.set(cor, c);
    }
    return halos.get(cor);
  }

  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  // carimba um azulejo cobrindo a tela inteira (já girada em volta do centro)
  function azulejar(c, px, py, alcance) {
    const x0 = (((px % c.tw) + c.tw) % c.tw) - c.tw - alcance;
    const y0 = (((py % c.th) + c.th) % c.th) - c.th - alcance;
    for (let x = x0; x < alcance; x += c.tw) {
      for (let y = y0; y < alcance; y += c.th) ctx.drawImage(c.img, x, y, c.tw, c.th);
    }
  }

  function quadro(t) {
    requestAnimationFrame(quadro);
    const dt = Math.min(50, t - antes);
    antes = t;
    ox += dt * 0.006; // deriva sozinho, bem devagar
    if (coberto) return;

    // (o fundo azul-escuro é o próprio CSS do canvas; aqui só limpa)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // gira o céu junto com a bússola do mapa
    const alcance = Math.hypot(w, h) / 2 + 4;
    ctx.translate(w / 2, h / 2);
    ctx.rotate((-giro * Math.PI) / 180);

    for (const c of camadas) azulejar(c, ox * c.prof, oy * c.prof, alcance);

    // estrelas que piscam (andam junto com a camada do meio)
    const bx = ox * 0.6, by = oy * 0.6, tam = 1200, s = t / 1000;
    for (const b of brilhantes) {
      let x = ((b.x + bx) % tam + tam) % tam - tam / 2;
      let y = ((b.y + by) % tam + tam) % tam - tam / 2;
      x *= (2 * alcance) / tam;
      y *= (2 * alcance) / tam;
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s * b.vel + b.fase));
      ctx.globalAlpha = a;
      ctx.drawImage(halo(b.cor), x - b.r * 4, y - b.r * 4, b.r * 8, b.r * 8);
      if (b.cruz) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - b.r * 7, y); ctx.lineTo(x + b.r * 7, y);
        ctx.moveTo(x, y - b.r * 7); ctx.lineTo(x, y + b.r * 7);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    desenharMeteoro(dt);
  }

  // de vez em quando, uma estrela cadente
  function desenharMeteoro(dt) {
    proximoMeteoro -= dt;
    if (!meteoro && proximoMeteoro <= 0) {
      const ang = Math.PI * (0.15 + Math.random() * 0.2) * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
      meteoro = {
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        dx: Math.cos(ang),
        dy: Math.sin(ang),
        vel: 0.9 + Math.random() * 0.6,
        vida: 0,
        dura: 700 + Math.random() * 500,
        rastro: 120 + Math.random() * 120,
      };
      proximoMeteoro = 7000 + Math.random() * 9000;
    }
    if (!meteoro) return;
    const m = meteoro;
    m.vida += dt;
    const k = m.vida / m.dura;
    if (k >= 1) { meteoro = null; return; }
    const andou = m.vida * m.vel;
    const hx = m.x + m.dx * andou, hy = m.y + m.dy * andou;
    const tx = hx - m.dx * m.rastro, ty = hy - m.dy * m.rastro;
    const a = Math.sin(k * Math.PI); // acende e apaga
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, `rgba(255,255,255,${0.85 * a})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }

  return {
    iniciar(el) {
      canvas = el;
      ctx = canvas.getContext('2d');
      medir();
      montar();
      addEventListener('resize', medir);
      requestAnimationFrame(quadro);
    },
    // chamado a cada movimento do mapa
    seguir(lng, lat, zoom, inclinacao, bussola) {
      if (ultimo) {
        const dl = ((lng - ultimo.lng + 540) % 360) - 180;
        ox -= dl * 7;
        oy += (lat - ultimo.lat) * 7;
      }
      ultimo = { lng, lat };
      giro = bussola;
      // bem de perto e olhando para baixo, o mapa cobre a tela inteira
      coberto = zoom > 7 && inclinacao < 30;
    },
  };
})();
