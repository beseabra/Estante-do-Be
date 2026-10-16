// ============================================================
//  O globo: um mapa 3D de verdade (MapLibre) com imagem de
//  satélite, relevo em 3D, divisas de países e estados, os
//  alfinetes e a área de cada cidade pintada de vermelho.
//
//  Arrastar gira, rodinha/pinça dá zoom, botão direito (ou dois
//  dedos) inclina para ver as montanhas. Parado e de longe, ele
//  gira devagarzinho sozinho.
//
//  Fontes (gratuitas, sem cadastro):
//    satélite e divisas: Esri (World Imagery / World Boundaries and Places)
//    relevo: Terrain Tiles da AWS (Mapzen, formato terrarium)
// ============================================================
window.Globo = (() => {
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const RELEVO = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  const VAZIO = { type: 'FeatureCollection', features: [] };
  // o relevo 3D só liga de perto: de longe as montanhas nem aparecem
  // e calcular a altitude do planeta inteiro deixa o giro pesado
  const RELEVO_3D = { source: 'relevo', exaggeration: 1.4 };
  const ZOOM_RELEVO = 5;
  const zoomInicial = () => (innerWidth > 760 ? 2.2 : 1.4);

  let mapa, pronto = false;
  let cb = {};
  let pinos = [];                 // { id, lon, lat, forma, marcador, el }
  let folgaAlvo = { direita: 0, baixo: 0 };
  let selId = null, hoverId = null, segurado = false;
  let girando = true, interagindo = false, mexidoEm = 0;

  // ---------- montagem ----------
  function iniciar(el, callbacks) {
    cb = callbacks || {};
    try {
      mapa = new maplibregl.Map({
        container: el,
        style: estilo(),
        center: [-50, -12],
        zoom: zoomInicial(),
        minZoom: 0.6,
        maxZoom: 17,
        maxPitch: 75,
        attributionControl: false,
        renderWorldCopies: false,
        // em telas de alta resolução, desenha um pouco menos de pixels: fica mais leve
        pixelRatio: Math.min(devicePixelRatio || 1, 1.5),
        fadeDuration: 150,
      });
    } catch (e) {
      cb.aoErroMapa?.(e);
      return;
    }
    mapa.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    mapa.on('load', () => {
      pronto = true;
      atualizarAreas();
    });

    // quem mexe no mapa para o giro e fecha o balão
    const comecou = (ev) => {
      if (!ev.originalEvent) return;
      interagindo = true;
      cb.aoMexer?.();
    };
    const terminou = () => { interagindo = false; mexidoEm = performance.now(); };
    mapa.on('dragstart', comecou);
    mapa.on('zoomstart', comecou);
    mapa.on('rotatestart', comecou);
    mapa.on('pitchstart', comecou);
    mapa.on('dragend', terminou);
    mapa.on('zoomend', terminou);
    mapa.on('rotateend', terminou);
    mapa.on('pitchend', terminou);
    mapa.on('movestart', (ev) => { if (!ev.giro) cb.aoPassar?.(null); });
    mapa.on('moveend', (ev) => { if (!ev.giro) ajustarRelevo(); });
    mapa.getCanvas().addEventListener('pointerdown', () => { mexidoEm = performance.now(); });

    mapa.on('click', (ev) => {
      const { lng, lat } = ev.lngLat;
      if (!isFinite(lng) || !isFinite(lat)) return cb.aoClicarFora?.();
      cb.aoClicarTerra?.({ lon: ((lng + 540) % 360) - 180, lat, x: ev.point.x, y: ev.point.y });
    });

    requestAnimationFrame(girar);
  }

  function ajustarRelevo() {
    const quer = mapa.getZoom() >= ZOOM_RELEVO;
    if (quer !== Boolean(mapa.getTerrain())) mapa.setTerrain(quer ? RELEVO_3D : null);
  }

  function estilo() {
    return {
      version: 8,
      projection: { type: 'globe' },
      sky: {
        'sky-color': '#0c0b10',
        'horizon-color': '#7fb6ff',
        'fog-color': '#a9cfff',
        'sky-horizon-blend': 0.6,
        'horizon-fog-blend': 0.6,
        'fog-ground-blend': 0.85,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
      },
      sources: {
        satelite: {
          type: 'raster',
          tiles: [ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Satélite © Esri, Maxar, Earthstar Geographics',
        },
        divisas: {
          type: 'raster',
          tiles: [ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Divisas © Esri',
        },
        // o mesmo relevo duas vezes: um para as sombras, outro para o 3D
        sombras: { type: 'raster-dem', tiles: [RELEVO], tileSize: 256, encoding: 'terrarium', maxzoom: 15 },
        relevo: {
          type: 'raster-dem',
          tiles: [RELEVO],
          tileSize: 256,
          encoding: 'terrarium',
          maxzoom: 15,
          attribution: 'Relevo © Mapzen / AWS Terrain Tiles',
        },
        cidades: { type: 'geojson', data: VAZIO, promoteId: 'id' },
      },
      layers: [
        { id: 'fundo', type: 'background', paint: { 'background-color': '#0a1f3a' } },
        { id: 'satelite', type: 'raster', source: 'satelite', paint: { 'raster-saturation': 0.15, 'raster-contrast': 0.08 } },
        {
          id: 'sombras',
          type: 'hillshade',
          source: 'sombras',
          minzoom: ZOOM_RELEVO - 1,
          paint: {
            'hillshade-exaggeration': 0.4,
            'hillshade-shadow-color': 'rgba(0,0,0,0.55)',
            'hillshade-highlight-color': 'rgba(255,255,255,0.18)',
          },
        },
        { id: 'divisas', type: 'raster', source: 'divisas' },
        {
          id: 'cidades-area',
          type: 'fill',
          source: 'cidades',
          paint: {
            'fill-color': '#ff2a2a',
            'fill-opacity': ['case', ['boolean', ['feature-state', 'sel'], false], 0.26, 0.2],
          },
        },
        {
          id: 'cidades-linha',
          type: 'line',
          source: 'cidades',
          paint: { 'line-color': '#ff3b3b', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 12, 3] },
        },
      ],
    };
  }

  // ---------- giro sozinho ----------
  // um pouquinho a cada quadro da tela, proporcional ao tempo que passou:
  // contínuo, sem os trancos de animações curtas uma atrás da outra
  let antes = 0;
  function girar(t) {
    requestAnimationFrame(girar);
    const dt = Math.min(50, t - antes);
    antes = t;
    if (!pronto || !girando || interagindo || segurado || selId || hoverId) return;
    if (mapa.isMoving() || mapa.getZoom() > 3.2) return;
    if (performance.now() - mexidoEm < 2500) return;
    const c = mapa.getCenter();
    mapa.jumpTo({ center: [c.lng - dt * 0.004, c.lat] }, { giro: true });
  }

  // ---------- câmera ----------
  function padding(f = folgaAlvo) {
    return { top: 0, left: 0, right: f.direita, bottom: f.baixo };
  }

  function quandoParar() {
    return new Promise((ok) => mapa.once('moveend', () => ok()));
  }

  function voarPara(lon, lat, zoom, inclinar = 0) {
    if (!mapa) return Promise.resolve();
    mexidoEm = performance.now();
    // (o "moveend" do giro que o voo interrompe acontece aqui dentro,
    // por isso só começa a esperar depois)
    mapa.flyTo({
      center: [lon, lat],
      zoom: zoom ?? Math.max(mapa.getZoom(), 4),
      pitch: inclinar,
      bearing: 0,
      padding: padding(),
      speed: 1.1,
      curve: 1.5,
      essential: true,
    });
    return quandoParar();
  }

  // zoom que faz a área da cidade caber no espaço livre da tela
  function zoomDaForma(forma) {
    const [[x0, y0], [x1, y1]] = d3.geoBounds(forma);
    const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI);
    const largura = (((x1 - x0) + 360) % 360 || 0.01) / 360 * 512;
    const altura = Math.abs(merc(y1) - merc(y0)) * 512 || 0.01;
    const el = mapa.getContainer();
    const livreX = el.clientWidth - folgaAlvo.direita - 160;
    const livreY = el.clientHeight - folgaAlvo.baixo - 200;
    const z = Math.log2(Math.min(livreX / largura, livreY / altura));
    return Math.max(3, Math.min(14, z));
  }

  function definirFolga(nova) {
    folgaAlvo = nova;
    if (mapa) mapa.easeTo({ padding: padding(), duration: 450 });
  }

  // ---------- alfinetes e áreas ----------
  function criarAlfinete(p) {
    const el = document.createElement('button');
    el.className = 'alfinete';
    el.setAttribute('aria-label', 'Abrir lugar');
    el.innerHTML = '<svg viewBox="0 0 24 34" aria-hidden="true"><ellipse cx="12" cy="32" rx="4" ry="1.6" class="sombra"/><path d="M12 31V14" class="agulha"/><circle cx="12" cy="9" r="7.5" class="cabeca"/><circle cx="9.5" cy="6.5" r="2.4" class="brilho"/></svg>';
    el.addEventListener('click', (ev) => { ev.stopPropagation(); cb.aoClicarPino?.(p.id); });
    el.addEventListener('mouseenter', () => {
      hoverId = p.id;
      const [x, y] = mapa.project([p.lon, p.lat]).toArray();
      cb.aoPassar?.(p.id, x, y - 34);
    });
    el.addEventListener('mouseleave', () => { hoverId = null; cb.aoPassar?.(null); });
    p.el = el;
    // opacityWhenCovered: o próprio mapa some com o alfinete quando ele
    // fica atrás do planeta ou de uma montanha
    p.marcador = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, 2], opacityWhenCovered: '0' })
      .setLngLat([p.lon, p.lat])
      .addTo(mapa);
  }

  function atualizarAreas() {
    if (!pronto) return;
    mapa.getSource('cidades').setData({
      type: 'FeatureCollection',
      features: pinos.map((p) => ({ type: 'Feature', properties: { id: p.id }, geometry: p.forma })),
    });
    if (selId) mapa.setFeatureState({ source: 'cidades', id: selId }, { sel: true });
  }

  return {
    iniciar,
    voarPara,
    definirFolga,
    // lista: [{ id, lon, lat, area }]; sem área, desenha um círculo pequeno
    definirPinos(lista) {
      if (!mapa) return;
      const antigos = new Map(pinos.map((p) => [p.id, p]));
      pinos = lista.map((l) => {
        const forma = l.area || d3.geoCircle().center([l.lon, l.lat]).radius(0.06)();
        let p = antigos.get(l.id);
        antigos.delete(l.id);
        if (p && (p.lon !== l.lon || p.lat !== l.lat)) { p.marcador.remove(); p = null; }
        if (!p) { p = { id: l.id, lon: l.lon, lat: l.lat }; criarAlfinete(p); }
        p.forma = forma;
        p.el.classList.toggle('ativo', p.id === selId);
        return p;
      });
      for (const p of antigos.values()) p.marcador.remove();
      atualizarAreas();
    },
    voarParaPino(id) {
      const p = pinos.find((x) => x.id === id);
      if (!p) return Promise.resolve();
      const [lon, lat] = d3.geoCentroid(p.forma);
      return voarPara(lon, lat, zoomDaForma(p.forma), 30);
    },
    selecionar(id) {
      if (pronto && selId) mapa.setFeatureState({ source: 'cidades', id: selId }, { sel: false });
      selId = id;
      if (pronto && selId) mapa.setFeatureState({ source: 'cidades', id: selId }, { sel: true });
      for (const p of pinos) p.el.classList.toggle('ativo', p.id === selId);
    },
    segurar(sim) { segurado = sim; },
    projetar(lon, lat) {
      if (!mapa) return null;
      return mapa.project([lon, lat]).toArray();
    },
    zoomPor(f) { mapa?.zoomTo(mapa.getZoom() + Math.log2(f), { duration: 350 }); },
    // de longe, sem inclinação
    visaoGeral() {
      const c = mapa.getCenter();
      return voarPara(c.lng, Math.max(-40, Math.min(40, c.lat)), zoomInicial(), 0);
    },
    // alterna entre olhar de cima e inclinado (para ver as montanhas)
    alternarInclinacao() {
      const inclinado = mapa.getPitch() < 50;
      mapa.easeTo({ pitch: inclinado ? 60 : 0, duration: 700 });
      return inclinado;
    },
    alternarGiro() { girando = !girando; mexidoEm = 0; return girando; },
  };
})();
