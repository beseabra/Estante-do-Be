// ============================================================
//  O globo: desenha a Terra num <canvas> e cuida de girar,
//  dar zoom, voar até um lugar e dos alfinetes.
//
//  Arrastar gira, rodinha/pinça dá zoom. Quando ninguém mexe,
//  ele gira devagarzinho sozinho.
// ============================================================
window.Globo = (() => {
  const MAPA = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
  const ESFERA = { type: 'Sphere' };
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.5);
  const caminho = d3.geoPath(proj);
  const grade = d3.geoGraticule10();

  let canvas, ctx, w = 0, h = 0, dpr = 1;
  let terra = null, fronteiras = null, paises = [];
  let rot = [50, 12, 0]; // começa mostrando o Brasil
  let zoom = 1;
  let folga = { direita: 0, baixo: 0 }; // espaço tomado pelo painel
  let pinos = [], naTela = [];
  const visitados = new Set(); // índices dos países com alfinete
  let hoverId = null, selId = null, segurado = false;
  let girando = true, interagindo = false, voando = false, mexidoEm = 0;
  let sujo = true, antes = 0;
  let cb = {};
  let comportamento, ultimoT = d3.zoomIdentity;

  // ---------- montagem ----------
  function iniciar(el, callbacks) {
    canvas = el;
    ctx = canvas.getContext('2d');
    cb = callbacks || {};
    medir();
    addEventListener('resize', medir);

    comportamento = d3.zoom()
      .scaleExtent([0.7, 30])
      .clickDistance(6)
      .on('start', (ev) => {
        if (!ev.sourceEvent) return;
        interagindo = true;
        d3.select(canvas).interrupt('voo');
        canvas.classList.add('arrastando');
        cb.aoMexer?.();
      })
      .on('zoom', aoZoom)
      .on('end', () => {
        interagindo = false;
        mexidoEm = performance.now();
        canvas.classList.remove('arrastando');
      });

    d3.select(canvas).call(comportamento).on('dblclick.zoom', null);
    canvas.addEventListener('click', aoClicar);
    canvas.addEventListener('pointermove', aoPassar);
    canvas.addEventListener('pointerleave', () => definirHover(null));

    d3.timer(quadro);
    carregarMapa();
  }

  async function carregarMapa() {
    try {
      const mundo = await d3.json(MAPA);
      paises = topojson.feature(mundo, mundo.objects.countries).features;
      terra = topojson.feature(mundo, mundo.objects.land);
      fronteiras = topojson.mesh(mundo, mundo.objects.countries, (a, b) => a !== b);
      recalcularPaises();
      sujo = true;
    } catch (e) {
      cb.aoErroMapa?.(e);
    }
  }

  function medir() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    aplicar();
    sujo = true;
  }

  function aplicar() {
    const lw = w - folga.direita, lh = h - folga.baixo;
    proj.scale(Math.max(60, Math.min(lw, lh) * 0.42) * zoom)
      .translate([lw / 2, lh / 2])
      .rotate(rot);
  }

  // ---------- girar e dar zoom ----------
  function aoZoom(ev) {
    const t = ev.transform, se = ev.sourceEvent;
    // arrastar (mouse ou dedo) vira rotação; a rodinha só mexe no zoom
    if (se && se.type !== 'wheel') {
      const k = 57.3 / proj.scale();
      rot[0] += (t.x - ultimoT.x) * k;
      rot[1] = Math.max(-88, Math.min(88, rot[1] - (t.y - ultimoT.y) * k));
    }
    ultimoT = t;
    zoom = t.k;
    aplicar();
    sujo = true;
  }

  function sincronizarZoom() {
    d3.select(canvas).call(comportamento.transform, d3.zoomIdentity.scale(zoom));
  }

  function quadro(t) {
    const dt = Math.min(64, t - antes);
    antes = t;
    const parado = interagindo || voando || segurado || selId || hoverId;
    if (girando && !parado && performance.now() - mexidoEm > 2500) {
      rot[0] += dt * 0.004;
      aplicar();
      sujo = true;
    }
    if (sujo) { desenhar(); sujo = false; }
  }

  function voarPara(lon, lat, zoomAlvo) {
    return new Promise((ok) => {
      const de = rot.slice();
      const para = [-lon, -lat, 0];
      para[0] = de[0] + ((((para[0] - de[0]) % 360) + 540) % 360 - 180); // caminho mais curto
      const ir = d3.interpolate(de, para);
      const iz = d3.interpolate(zoom, zoomAlvo ?? Math.max(zoom, 2.4));
      const dist = d3.geoDistance([-de[0], -de[1]], [lon, lat]);
      voando = true;
      d3.select(canvas).transition('voo')
        .duration(800 + dist * 450)
        .ease(d3.easeCubicInOut)
        .tween('voo', () => (k) => { rot = ir(k).slice(); zoom = iz(k); aplicar(); sujo = true; })
        .on('end interrupt', () => {
          voando = false;
          mexidoEm = performance.now();
          sincronizarZoom();
          ok();
        });
    });
  }

  function definirFolga(nova) {
    const i = d3.interpolate({ ...folga }, nova);
    d3.select(canvas).transition('folga')
      .duration(450)
      .ease(d3.easeCubicOut)
      .tween('folga', () => (k) => { folga = { ...i(k) }; aplicar(); sujo = true; });
  }

  // ---------- desenho ----------
  function desenhar() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    caminho.context(ctx);
    const [cx, cy] = proj.translate(), r = proj.scale();

    // brilho em volta (a atmosfera)
    let g = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.25);
    g.addColorStop(0, 'rgba(212,255,63,0.20)');
    g.addColorStop(0.3, 'rgba(120,160,255,0.08)');
    g.addColorStop(1, 'rgba(120,160,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, 2 * Math.PI);
    ctx.fill();

    // mar
    g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.05, cx, cy, r);
    g.addColorStop(0, '#1e2442');
    g.addColorStop(1, '#090b17');
    ctx.fillStyle = g;
    ctx.beginPath(); caminho(ESFERA); ctx.fill();

    ctx.beginPath(); caminho(grade);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    if (terra) {
      ctx.beginPath(); caminho(terra);
      ctx.fillStyle = '#34333f';
      ctx.fill();

      // países onde já tem alfinete ficam tingidos de limão
      if (visitados.size) {
        ctx.beginPath();
        for (const i of visitados) caminho(paises[i]);
        ctx.fillStyle = 'rgba(212,255,63,0.28)';
        ctx.fill();
      }

      ctx.beginPath(); caminho(fronteiras);
      ctx.strokeStyle = 'rgba(255,255,255,0.13)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // luz e sombra por cima, para parecer uma bola
    g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,0.07)');
    g.addColorStop(0.6, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g;
    ctx.beginPath(); caminho(ESFERA); ctx.fill();
    ctx.strokeStyle = 'rgba(212,255,63,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    desenharPinos();
  }

  function desenharPinos() {
    const centro = [-rot[0], -rot[1]];
    naTela = [];
    for (const p of pinos) {
      const d = d3.geoDistance([p.lon, p.lat], centro);
      if (d > Math.PI / 2 - 0.03) continue; // está do outro lado
      const [x, y] = proj([p.lon, p.lat]);
      naTela.push({ p, x, y, a: Math.min(1, Math.cos(d) * 4) });
    }
    naTela.sort((a, b) => a.y - b.y);

    for (const v of naTela) {
      const ativo = v.p.id === hoverId || v.p.id === selId;
      const s = ativo ? 1.3 : 1;
      const hx = v.x + 3 * s, hy = v.y - 20 * s, r = 6 * s;
      v.hx = hx; v.hy = hy;
      ctx.globalAlpha = v.a;

      // sombrinha no chão
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(v.x + 2, v.y + 1, 4 * s, 1.6 * s, 0, 0, 2 * Math.PI);
      ctx.fill();

      // agulha
      ctx.strokeStyle = '#d9d5cc';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // anel do selecionado
      if (v.p.id === selId) {
        ctx.strokeStyle = 'rgba(212,255,63,0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx, hy, r + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // cabeça do alfinete
      const g = ctx.createRadialGradient(hx - r * 0.35, hy - r * 0.4, r * 0.1, hx, hy, r);
      g.addColorStop(0, '#f6ffd0');
      g.addColorStop(0.45, '#d4ff3f');
      g.addColorStop(1, '#6f8a12');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(hx, hy, r, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- mouse ----------
  function pos(ev) {
    const r = canvas.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  }

  function pinoEm(x, y) {
    for (let i = naTela.length - 1; i >= 0; i--) {
      const v = naTela[i];
      if (Math.hypot(x - v.hx, y - v.hy) < 13 || Math.hypot(x - v.x, y - v.y) < 7) return v;
    }
    return null;
  }

  function definirHover(v) {
    const id = v ? v.p.id : null;
    if (id !== hoverId) { hoverId = id; sujo = true; }
    canvas.style.cursor = v ? 'pointer' : '';
    cb.aoPassar?.(id, v?.hx, v?.hy);
  }

  function aoPassar(ev) {
    if (interagindo) return;
    const [x, y] = pos(ev);
    definirHover(pinoEm(x, y));
  }

  function aoClicar(ev) {
    const [x, y] = pos(ev);
    const v = pinoEm(x, y);
    if (v) return cb.aoClicarPino?.(v.p.id);

    const [cx, cy] = proj.translate();
    if (Math.hypot(x - cx, y - cy) > proj.scale()) return cb.aoClicarFora?.();
    const ll = proj.invert([x, y]);
    if (!ll) return;
    const lon = ((ll[0] + 540) % 360) - 180;
    cb.aoClicarTerra?.({ lon, lat: ll[1], x, y });
  }

  // ---------- alfinetes ----------
  function recalcularPaises() {
    visitados.clear();
    if (!paises.length) return;
    for (const p of pinos) {
      const i = paisDoPonto(p.lon, p.lat);
      if (i >= 0) visitados.add(i);
    }
  }

  // cidades na beira do mar às vezes caem fora do contorno do mapa;
  // então, se não achar no ponto exato, olha um pouquinho em volta
  function paisDoPonto(lon, lat) {
    const achar = (x, y) => paises.findIndex((f) => d3.geoContains(f, [x, y]));
    let i = achar(lon, lat);
    for (const r of [0.15, 0.35, 0.7]) {
      for (let a = 0; a < 8 && i < 0; a++) {
        i = achar(lon + r * Math.cos(a * Math.PI / 4), lat + r * Math.sin(a * Math.PI / 4));
      }
    }
    return i;
  }

  return {
    iniciar,
    voarPara,
    definirFolga,
    definirPinos(lista) {
      pinos = lista.map((l) => ({ id: l.id, lon: l.lon, lat: l.lat }));
      recalcularPaises();
      sujo = true;
    },
    selecionar(id) { selId = id; sujo = true; },
    segurar(sim) { segurado = sim; },
    projetar(lon, lat) {
      if (d3.geoDistance([lon, lat], [-rot[0], -rot[1]]) > Math.PI / 2) return null;
      return proj([lon, lat]);
    },
    zoomPor(f) {
      d3.select(canvas).transition().duration(350).call(comportamento.scaleBy, f);
    },
    visaoGeral() { return voarPara(-rot[0], -rot[1] * 0.3, 1); },
    alternarGiro() { girando = !girando; mexidoEm = 0; return girando; },
  };
})();
