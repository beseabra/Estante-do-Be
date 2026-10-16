// ============================================================
//  O aplicativo: busca de cidades, lista de lugares, a galeria
//  de cada lugar (fotos, vídeos, anotações) e a cópia de
//  segurança. O globo fica em globo.js e o banco em banco.js.
// ============================================================
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const normalizar = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const km = (a, b) => d3.geoDistance([a.lon, a.lat], [b.lon, b.lat]) * 6371;

  const ICONE = {
    pino: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    mais: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    play: '<svg viewBox="0 0 24 24" class="cheio"><path d="M8 5.5l10.5 6.5L8 18.5z"/></svg>',
    seta: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };

  let lugares = [];
  let aberto = null;          // lugar com a galeria aberta
  let midias = [];            // mídias do lugar aberto
  let urlsGrade = [];         // miniaturas criadas para a grade (soltas ao trocar)
  const capas = new Map();    // lugarId -> url da miniatura de capa
  let aba = 'midias';
  let visorI = -1, visorUrl = null;
  let candidato = null, pedidoBalao = 0;

  // ============================================================
  //  Início
  // ============================================================
  async function iniciar() {
    Globo.iniciar($('#globo'), {
      aoClicarPino: (id) => abrirLugar(lugares.find((l) => l.id === id)),
      aoClicarTerra,
      aoClicarFora: esconderBalao,
      aoMexer: esconderBalao,
      aoPassar: mostrarEtiqueta,
      aoErroMapa: () => aviso('Não consegui baixar o mapa. Confira a internet e recarregue a página.', 'erro'),
    });

    try {
      lugares = await Banco.lugares();
    } catch {
      aviso('Este navegador não deixou guardar nada aqui. Tente abrir no Chrome ou no Edge.', 'erro');
    }
    await Promise.all(lugares.map(carregarCapa));
    atualizar();
    navigator.storage?.persist?.().catch(() => {});

    ligarBusca();
    ligarPainel();
    ligarVisor();
    ligarControles();
    ligarTeclado();
    completarAreas();
  }

  function atualizar() {
    Globo.definirPinos(lugares);
    desenharLista();
    const n = lugares.length;
    const p = new Set(lugares.map((l) => l.pais).filter(Boolean)).size;
    $('#contagem').textContent = n
      ? `${n} ${n === 1 ? 'lugar' : 'lugares'} · ${p} ${p === 1 ? 'país' : 'países'}`
      : 'nenhum alfinete ainda';
  }

  async function carregarCapa(l) {
    if (capas.has(l.id)) { URL.revokeObjectURL(capas.get(l.id)); capas.delete(l.id); }
    if (!l.capaId) return;
    const m = await Banco.midia(l.capaId).catch(() => null);
    const img = m?.mini || (m?.tipo === 'foto' ? m.blob : null);
    if (img) capas.set(l.id, URL.createObjectURL(img));
  }

  // ============================================================
  //  Lista de lugares
  // ============================================================
  function iniciais(nome) {
    return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  function resumo(l) {
    const partes = [l.pais || 'sem país'];
    if (l.qtdFotos) partes.push(`${l.qtdFotos} ${l.qtdFotos === 1 ? 'foto' : 'fotos'}`);
    if (l.qtdVideos) partes.push(`${l.qtdVideos} ${l.qtdVideos === 1 ? 'vídeo' : 'vídeos'}`);
    return partes.join(' · ');
  }

  function desenharLista() {
    const ordem = [...lugares].sort((a, b) => b.criado - a.criado);
    $('#lista').classList.toggle('vazia', !ordem.length);
    $('#lista-itens').innerHTML = ordem.map((l) => `
      <li>
        <button class="item${aberto?.id === l.id ? ' ativo' : ''}" data-id="${l.id}">
          <span class="item-capa">${capas.has(l.id) ? `<img src="${capas.get(l.id)}" alt="">` : esc(iniciais(l.nome))}</span>
          <span class="item-texto"><strong>${esc(l.nome)}</strong><small>${esc(resumo(l))}</small></span>
          ${l.codigo ? `<span class="item-codigo">${esc(l.codigo)}</span>` : ''}
        </button>
      </li>`).join('');
  }

  $('#lista-itens').addEventListener('click', (ev) => {
    const b = ev.target.closest('.item');
    if (!b) return;
    document.body.classList.remove('com-lista');
    abrirLugar(lugares.find((l) => l.id === b.dataset.id));
  });

  // ============================================================
  //  Clicar no globo: balão para fincar um alfinete
  // ============================================================
  async function aoClicarTerra({ lon, lat, x, y }) {
    const meu = ++pedidoBalao;
    mostrarBalao({ lon, lat, x, y, carregando: true });
    const nome = await nomeDoLugar(lon, lat);
    if (meu !== pedidoBalao) return;
    mostrarBalao({ ...nome, lon, lat, x, y });
  }

  function coordenadas(lat, lon) {
    const f = (v) => Math.abs(v).toFixed(2).replace('.', ',');
    return `${f(lat)}° ${lat >= 0 ? 'N' : 'S'} · ${f(lon)}° ${lon >= 0 ? 'L' : 'O'}`;
  }

  function lugarPerto(c, raioKm) {
    let melhor = null, menor = raioKm;
    for (const l of lugares) {
      const d = km(l, c);
      if (d < menor) { menor = d; melhor = l; }
    }
    return melhor;
  }

  function mostrarBalao(c) {
    candidato = c.carregando ? null : c;
    const b = $('#balao');
    const perto = !c.carregando && lugarPerto(c, 25);
    const sub = [c.regiao, c.pais].filter(Boolean).join(', ');

    b.innerHTML = c.carregando
      ? `<span class="rotulo">${coordenadas(c.lat, c.lon)}</span><strong class="balao-nome carregando">procurando…</strong>`
      : `<span class="rotulo">${coordenadas(c.lat, c.lon)}</span>
         <strong class="balao-nome">${esc(c.nome)}</strong>
         ${sub ? `<span class="balao-sub">${esc(sub)}</span>` : ''}
         ${perto
           ? `<button class="botao" data-acao="abrir" data-id="${perto.id}">abrir ${esc(perto.nome)} ${ICONE.seta}</button>
              <button class="botao-fino" data-acao="fincar">fincar outro alfinete aqui</button>`
           : `<button class="botao" data-acao="fincar">${ICONE.pino} fincar alfinete</button>`}`;

    b.hidden = false;
    // posiciona acima do ponto, sem sair da tela
    const r = b.getBoundingClientRect();
    const x = Math.max(r.width / 2 + 12, Math.min(innerWidth - r.width / 2 - 12, c.x));
    const emCima = c.y - r.height - 22 > 70;
    b.classList.toggle('embaixo', !emCima);
    b.style.left = x + 'px';
    b.style.top = c.y + 'px';
    b.style.setProperty('--ponta', `${c.x - x}px`);
    Globo.segurar(true);
  }

  function esconderBalao() {
    pedidoBalao++;
    candidato = null;
    $('#balao').hidden = true;
    Globo.segurar(false);
  }

  $('#balao').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.acao === 'abrir') abrirLugar(lugares.find((l) => l.id === b.dataset.id));
    if (b.dataset.acao === 'fincar' && candidato) criarLugar(candidato);
  });

  // pergunta ao OpenStreetMap o nome e o contorno da cidade naquele ponto
  async function consultarPonto(lon, lat) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`
      + '&polygon_geojson=1&polygon_threshold=0.0003&accept-language=pt-BR';
    return (await fetch(url)).json();
  }

  async function nomeDoLugar(lon, lat) {
    try {
      const j = await consultarPonto(lon, lat);
      if (j.error) return { nome: 'Algum lugar no mar', regiao: '', pais: '', codigo: '', area: false };
      const a = j.address || {};
      return {
        nome: a.city || a.town || a.village || a.municipality || a.county || a.state_district || a.state || j.name || 'Lugar sem nome',
        regiao: a.state || a.region || '',
        pais: a.country || '',
        codigo: (a.country_code || '').toUpperCase(),
      };
    } catch {
      return { nome: 'Lugar sem nome', regiao: '', pais: '', codigo: '' };
    }
  }

  // o contorno vem no sentido anti-horário (padrão GeoJSON) e o d3 quer
  // horário; sem virar, ele pintaria o mundo inteiro menos a cidade.
  // false = não tem contorno (o globo desenha um círculo pequeno)
  function arrumarArea(g) {
    const polys = g?.type === 'Polygon' ? [g.coordinates] : g?.type === 'MultiPolygon' ? g.coordinates : null;
    if (!polys) return false;
    const certos = polys.map((p) => {
      const virar = d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI;
      return p.map((anel) => (virar ? anel.slice().reverse() : anel).map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]));
    });
    const area = { type: 'MultiPolygon', coordinates: certos };
    // se o "município" for gigante (um estado inteiro, por exemplo), melhor não pintar
    return d3.geoArea(area) < 0.003 ? area : false;
  }

  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const VERSAO_AREA = 3; // subir quando mudar o jeito de achar o contorno

  const KM2 = 1 / (6371 * 6371); // 1 km² em esferorradianos (a unidade do d3.geoArea)

  // acha o contorno da cidade em duas tentativas:
  //  1. busca pelo nome e, entre as divisões que contêm o ponto, fica com a
  //     menor (Lisboa → o município, e não o distrito);
  //  2. se a busca só achou algo enorme (Cusco → só o estado), pergunta pelo
  //     ponto, que dá o distrito da cidade. Não é a primeira opção porque, em
  //     Lisboa, o ponto devolve só o bairro.
  // Sem internet nas duas, dá erro, para tentar de novo outra vez.
  async function areaDaCidade(l) {
    let daBusca = null, tamanho = Infinity, falhas = 0;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(l.nome)}`
        + (l.codigo ? `&countrycodes=${l.codigo.toLowerCase()}` : '')
        + '&polygon_geojson=1&polygon_threshold=0.0003&limit=10&accept-language=pt-BR';
      for (const r of await (await fetch(url)).json()) {
        const tipo = r.category ?? r.class; // no formato jsonv2 o campo se chama category
        if (tipo !== 'boundary' && tipo !== 'place') continue;
        const area = arrumarArea(r.geojson);
        if (!area || !d3.geoContains(area, [l.lon, l.lat])) continue;
        const t = d3.geoArea(area);
        if (t < tamanho) { tamanho = t; daBusca = area; }
      }
      if (daBusca && tamanho < KM2 * 2000) return daBusca;
    } catch {
      falhas++;
    }

    try {
      await esperar(1100);
      const j = await consultarPonto(l.lon, l.lat);
      const doPonto = j.error ? false : arrumarArea(j.geojson);
      if (doPonto && d3.geoArea(doPonto) > KM2 * 5 && d3.geoArea(doPonto) < tamanho) return doPonto;
    } catch {
      falhas++;
    }
    if (falhas === 2) throw new Error('sem internet');
    return daBusca || false;
  }

  async function buscarArea(l) {
    try {
      l.area = await areaDaCidade(l);
      l.areaV = VERSAO_AREA;
      await Banco.salvarLugar(l);
      Globo.definirPinos(lugares);
      if (aberto?.id === l.id) Globo.voarParaPino(l.id); // enquadra a cidade de verdade
    } catch {
      // sem internet agora: tenta na próxima vez que abrir
    }
  }

  // lugares antigos (ou criados pela busca) ainda sem contorno;
  // um por vez, com calma, que o OpenStreetMap pede no máximo 1 por segundo
  async function completarAreas() {
    for (const l of lugares.filter((x) => x.areaV !== VERSAO_AREA)) {
      await buscarArea(l);
      await esperar(1100);
    }
  }

  async function criarLugar(c) {
    const l = {
      id: novoId(),
      nome: c.nome,
      regiao: c.regiao || '',
      pais: c.pais || '',
      codigo: c.codigo || '',
      lat: c.lat,
      lon: c.lon,
      area: c.area,
      quando: '',
      notas: [],
      capaId: null,
      qtdFotos: 0,
      qtdVideos: 0,
      criado: Date.now(),
    };
    try {
      await Banco.salvarLugar(l);
    } catch {
      return aviso('Não consegui guardar o lugar.', 'erro');
    }
    lugares.push(l);
    atualizar();
    aviso(`Alfinete fincado em ${l.nome}`);
    await buscarArea(l); // o contorno da cidade, para pintar no globo
    abrirLugar(l);
  }

  // ============================================================
  //  Busca de cidades
  // ============================================================
  async function buscarCidades(q) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=pt&format=json`;
      const j = await (await fetch(url)).json();
      return (j.results || []).map((c) => ({
        nome: c.name,
        regiao: c.admin1 || '',
        pais: c.country || '',
        codigo: (c.country_code || '').toUpperCase(),
        lat: c.latitude,
        lon: c.longitude,
        populacao: c.population || 0,
      }));
    } catch {
      return null;
    }
  }

  function ligarBusca() {
    const campo = $('#busca'), caixa = $('#busca-resultados');
    let espera, pedido = 0, itens = [], marcado = -1;

    const fechar = () => { caixa.hidden = true; itens = []; marcado = -1; };

    function mostrar(lista, estado) {
      itens = lista;
      marcado = lista.length ? 0 : -1;
      const linhas = lista.map((c, i) => `
        <li role="option" data-i="${i}" class="${i === marcado ? 'marcado' : ''}">
          <span class="res-icone${c.meu ? ' meu' : ''}">${ICONE.pino}</span>
          <span class="res-texto"><strong>${esc(c.nome)}</strong><small>${esc([c.regiao, c.pais].filter(Boolean).join(', '))}</small></span>
          <span class="res-extra">${c.meu ? 'já fui' : esc(c.codigo)}</span>
        </li>`).join('');
      const rodape = estado === 'buscando' ? '<li class="res-aviso">procurando…</li>'
        : estado === 'erro' ? '<li class="res-aviso">sem internet para buscar agora</li>'
        : !lista.length ? '<li class="res-aviso">nenhuma cidade com esse nome</li>' : '';
      caixa.innerHTML = linhas + rodape;
      caixa.hidden = false;
    }

    function marcar(i) {
      if (!itens.length) return;
      marcado = (i + itens.length) % itens.length;
      caixa.querySelectorAll('[data-i]').forEach((li) => li.classList.toggle('marcado', +li.dataset.i === marcado));
    }

    function escolher(c) {
      fechar();
      campo.value = '';
      campo.blur();
      if (c.meu) return abrirLugar(lugares.find((l) => l.id === c.id));
      const perto = lugarPerto(c, 15);
      if (perto) return abrirLugar(perto);
      fecharPainel();
      esconderBalao();
      Globo.voarPara(c.lon, c.lat, 10, 40).then(() => {
        const p = Globo.projetar(c.lon, c.lat);
        if (p) mostrarBalao({ ...c, x: p[0], y: p[1] - 20 });
      });
    }

    campo.addEventListener('input', () => {
      clearTimeout(espera);
      const q = campo.value.trim();
      if (q.length < 2) return fechar();
      espera = setTimeout(async () => {
        const meu = ++pedido;
        const nq = normalizar(q);
        const meus = lugares.filter((l) => normalizar(l.nome).includes(nq)).slice(0, 3).map((l) => ({ ...l, meu: true }));
        mostrar(meus, 'buscando');
        const fora = await buscarCidades(q);
        if (meu !== pedido) return;
        const novos = (fora || []).filter((c) => !meus.some((l) => km(l, c) < 15));
        mostrar([...meus, ...novos], fora ? '' : 'erro');
      }, 280);
    });

    campo.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); marcar(marcado + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); marcar(marcado - 1); }
      else if (ev.key === 'Enter' && itens[marcado]) { ev.preventDefault(); escolher(itens[marcado]); }
      else if (ev.key === 'Escape') { fechar(); campo.blur(); }
    });

    // mousedown para ganhar do blur do campo
    caixa.addEventListener('mousedown', (ev) => {
      const li = ev.target.closest('[data-i]');
      if (!li) return;
      ev.preventDefault();
      escolher(itens[+li.dataset.i]);
    });
    campo.addEventListener('blur', () => setTimeout(fechar, 120));
    campo.addEventListener('focus', () => { if (campo.value.trim().length >= 2) campo.dispatchEvent(new Event('input')); });
  }

  // ============================================================
  //  A galeria de um lugar
  // ============================================================
  function folgaDoPainel() {
    return innerWidth > 760
      ? { direita: Math.min(460, innerWidth), baixo: 0 }
      : { direita: 0, baixo: Math.round(innerHeight * 0.62) };
  }

  async function abrirLugar(l) {
    if (!l) return;
    esconderBalao();
    mostrarEtiqueta(null);
    const outro = aberto?.id !== l.id;
    aberto = l;

    document.body.classList.add('com-painel');
    $('#painel').setAttribute('aria-hidden', 'false');
    Globo.selecionar(l.id);
    Globo.definirFolga(folgaDoPainel());
    Globo.voarParaPino(l.id);
    desenharCabeca();
    desenharNotas();
    trocarAba(aba);
    desenharLista();

    if (!outro) return;
    midias = [];
    desenharGrade();
    $('.painel-corpo').scrollTop = 0;
    const lista = await Banco.midias(l.id).catch(() => []);
    if (aberto?.id !== l.id) return;
    midias = lista.sort((a, b) => (a.data || 0) - (b.data || 0));
    desenharGrade();
  }

  function fecharPainel() {
    if (!aberto) return;
    aberto = null;
    midias = [];
    soltarGrade();
    document.body.classList.remove('com-painel');
    $('#painel').setAttribute('aria-hidden', 'true');
    Globo.selecionar(null);
    Globo.definirFolga({ direita: 0, baixo: 0 });
    desenharLista();
  }

  function desenharCabeca() {
    const l = aberto;
    $('#painel-coord').textContent = [l.codigo, coordenadas(l.lat, l.lon)].filter(Boolean).join(' · ');
    $('#painel-nome').value = l.nome;
    $('#painel-sub').textContent = [l.regiao, l.pais].filter(Boolean).join(', ') || ' ';
    $('#painel-quando').value = l.quando || '';
    const capa = capas.get(l.id);
    $('#painel-capa').style.backgroundImage = capa ? `url("${capa}")` : '';
    $('#painel-capa').classList.toggle('sem-capa', !capa);
  }

  function trocarAba(nova) {
    aba = nova;
    document.querySelectorAll('.abas [data-aba]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === aba));
    $('#aba-midias').hidden = aba !== 'midias';
    $('#aba-notas').hidden = aba !== 'notas';
  }

  // ---------- fotos e vídeos ----------
  function soltarGrade() {
    urlsGrade.forEach((u) => URL.revokeObjectURL(u));
    urlsGrade = [];
  }

  function tempo(s) {
    s = Math.round(s);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function desenharGrade() {
    soltarGrade();
    const url = (b) => { const u = URL.createObjectURL(b); urlsGrade.push(u); return u; };
    $('#grade').innerHTML = midias.map((m, i) => {
      const fonte = m.mini || (m.tipo === 'foto' ? m.blob : null);
      return `
        <button class="midia${m.tipo === 'video' ? ' video' : ''}${aberto?.capaId === m.id ? ' capa' : ''}" data-i="${i}" title="${esc(m.legenda || m.nome)}">
          ${fonte ? `<img src="${url(fonte)}" alt="${esc(m.legenda)}" loading="lazy">` : '<span class="midia-sem"></span>'}
          ${m.tipo === 'video' ? `<span class="midia-selo">${ICONE.play}${m.duracao ? tempo(m.duracao) : ''}</span>` : ''}
        </button>`;
    }).join('') + `
      <button class="midia midia-mais" id="mais-midia">${ICONE.mais}<span>fotos e vídeos</span></button>`;
    $('#qtd-midias').textContent = midias.length || '';
  }

  // miniatura pequena para a grade e a lista (a original fica guardada inteira)
  async function miniDaFoto(arquivo) {
    try {
      const bmp = await createImageBitmap(arquivo);
      const s = Math.min(1, 520 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * s);
      c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      bmp.close?.();
      return await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.82));
    } catch {
      return null;
    }
  }

  function miniDoVideo(arquivo) {
    return new Promise((ok) => {
      const v = document.createElement('video');
      const u = URL.createObjectURL(arquivo);
      let feito = false;
      const terminar = (r) => { if (feito) return; feito = true; URL.revokeObjectURL(u); ok(r); };
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.onloadeddata = () => { v.currentTime = Math.min(1, (v.duration || 0) / 3); };
      v.onseeked = () => {
        const s = Math.min(1, 520 / Math.max(v.videoWidth, v.videoHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(v.videoWidth * s) || 1;
        c.height = Math.round(v.videoHeight * s) || 1;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob((mini) => terminar({ mini, duracao: v.duration }), 'image/jpeg', 0.8);
      };
      v.onerror = () => terminar({ mini: null, duracao: 0 });
      setTimeout(() => terminar({ mini: null, duracao: 0 }), 10000);
      v.src = u;
    });
  }

  function contar(l, tipo, d) {
    const campo = tipo === 'video' ? 'qtdVideos' : 'qtdFotos';
    l[campo] = Math.max(0, (l[campo] || 0) + d);
  }

  async function adicionarArquivos(arquivos) {
    const l = aberto;
    if (!l) return;
    const lista = [...arquivos].filter((f) => /^(image|video)\//.test(f.type));
    if (!lista.length) return aviso('Só dá para guardar fotos e vídeos.');

    const av = aviso(`guardando 0 de ${lista.length}…`, 'fixo');
    let feitos = 0;
    for (const f of lista) {
      const tipo = f.type.startsWith('video') ? 'video' : 'foto';
      const extra = tipo === 'foto' ? { mini: await miniDaFoto(f), duracao: 0 } : await miniDoVideo(f);
      const m = {
        id: novoId(), lugarId: l.id, tipo, blob: f, nome: f.name, legenda: '',
        data: f.lastModified || Date.now(), criado: Date.now(), ...extra,
      };
      try {
        await Banco.salvarMidia(m);
      } catch {
        aviso(`Não coube no navegador: ${f.name}`, 'erro');
        continue;
      }
      contar(l, tipo, +1);
      if (!l.capaId && tipo === 'foto') l.capaId = m.id;
      if (aberto?.id === l.id) midias.push(m);
      feitos++;
      av.texto(`guardando ${feitos} de ${lista.length}…`);
    }
    av.fechar();

    await Banco.salvarLugar(l);
    await carregarCapa(l);
    if (feitos) aviso(`${feitos} ${feitos === 1 ? 'item guardado' : 'itens guardados'} em ${l.nome}`);
    if (aberto?.id === l.id) {
      midias.sort((a, b) => (a.data || 0) - (b.data || 0));
      desenharGrade();
      desenharCabeca();
    }
    desenharLista();
  }

  // ---------- anotações ----------
  function dataBonita(t) {
    if (!t) return '';
    return new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function desenharNotas() {
    const ns = aberto?.notas || [];
    $('#qtd-notas').textContent = ns.length || '';
    $('#notas').innerHTML = ns.length
      ? ns.map((n) => `
        <li class="nota" data-id="${n.id}">
          <span class="rotulo">${dataBonita(n.data)}</span>
          <p>${esc(n.texto)}</p>
          <div class="nota-acoes">
            <button class="botao-fino" data-acao="editar">editar</button>
            <button class="botao-fino perigo" data-acao="apagar">apagar</button>
          </div>
        </li>`).join('')
      : '<li class="vazio">Nada escrito ainda.</li>';
  }

  async function salvarAberto() {
    try { await Banco.salvarLugar(aberto); } catch { aviso('Não consegui guardar a mudança.', 'erro'); }
  }

  // ---------- eventos do painel ----------
  function ligarPainel() {
    $('#fechar-painel').addEventListener('click', fecharPainel);
    document.querySelectorAll('.abas [data-aba]').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

    $('#painel-nome').addEventListener('change', async (ev) => {
      const v = ev.target.value.trim();
      if (!v) { ev.target.value = aberto.nome; return; }
      aberto.nome = v;
      await salvarAberto();
      atualizar();
    });
    $('#painel-nome').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ev.target.blur(); });
    $('#painel-quando').addEventListener('change', async (ev) => {
      aberto.quando = ev.target.value.trim();
      await salvarAberto();
    });
    $('#painel-quando').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ev.target.blur(); });

    // fotos e vídeos
    $('#grade').addEventListener('click', (ev) => {
      const b = ev.target.closest('.midia');
      if (!b) return;
      if (b.id === 'mais-midia') return $('#arquivo-midia').click();
      abrirVisor(+b.dataset.i);
    });
    $('#arquivo-midia').addEventListener('change', (ev) => {
      adicionarArquivos(ev.target.files);
      ev.target.value = '';
    });

    // arrastar arquivos para o painel
    const painel = $('#painel');
    let profundidade = 0;
    const temArquivos = (ev) => [...(ev.dataTransfer?.types || [])].includes('Files');
    painel.addEventListener('dragenter', (ev) => { if (!temArquivos(ev)) return; profundidade++; painel.classList.add('soltando'); });
    painel.addEventListener('dragleave', () => { if (--profundidade <= 0) { profundidade = 0; painel.classList.remove('soltando'); } });
    painel.addEventListener('dragover', (ev) => { if (temArquivos(ev)) ev.preventDefault(); });
    painel.addEventListener('drop', (ev) => {
      ev.preventDefault();
      profundidade = 0;
      painel.classList.remove('soltando');
      trocarAba('midias');
      adicionarArquivos(ev.dataTransfer.files);
    });
    // soltar fora do painel não deve abrir o arquivo no navegador
    addEventListener('dragover', (ev) => ev.preventDefault());
    addEventListener('drop', (ev) => ev.preventDefault());

    // anotações
    $('#form-nota').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const campo = $('#texto-nota');
      const texto = campo.value.trim();
      if (!texto || !aberto) return;
      aberto.notas = [{ id: novoId(), texto, data: Date.now() }, ...(aberto.notas || [])];
      campo.value = '';
      await salvarAberto();
      desenharNotas();
    });
    $('#texto-nota').addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) $('#form-nota').requestSubmit();
    });

    $('#notas').addEventListener('click', async (ev) => {
      const b = ev.target.closest('[data-acao]');
      if (!b) return;
      const li = b.closest('.nota');
      const nota = aberto.notas.find((n) => n.id === li.dataset.id);
      if (!nota) return;

      if (b.dataset.acao === 'apagar') {
        if (!confirm('Apagar esta anotação?')) return;
        aberto.notas = aberto.notas.filter((n) => n !== nota);
        await salvarAberto();
        desenharNotas();
      } else if (b.dataset.acao === 'editar') {
        li.classList.add('editando');
        li.querySelector('p').outerHTML = `<textarea rows="4">${esc(nota.texto)}</textarea>`;
        li.querySelector('.nota-acoes').innerHTML = `
          <button class="botao-fino" data-acao="guardar">guardar</button>
          <button class="botao-fino" data-acao="cancelar">cancelar</button>`;
        li.querySelector('textarea').focus();
      } else if (b.dataset.acao === 'guardar') {
        const texto = li.querySelector('textarea').value.trim();
        if (texto) { nota.texto = texto; await salvarAberto(); }
        desenharNotas();
      } else if (b.dataset.acao === 'cancelar') {
        desenharNotas();
      }
    });

    $('#apagar-lugar').addEventListener('click', async () => {
      const l = aberto;
      if (!l || !confirm(`Apagar ${l.nome} com todas as fotos, vídeos e anotações?\nIsso não dá para desfazer.`)) return;
      try {
        await Banco.apagarLugar(l.id);
      } catch {
        return aviso('Não consegui apagar.', 'erro');
      }
      fecharPainel();
      lugares = lugares.filter((x) => x.id !== l.id);
      if (capas.has(l.id)) { URL.revokeObjectURL(capas.get(l.id)); capas.delete(l.id); }
      atualizar();
      aviso(`${l.nome} saiu do mapa`);
    });
  }

  // ============================================================
  //  Visor (foto ou vídeo grande)
  // ============================================================
  function abrirVisor(i) {
    visorI = i;
    $('#visor').hidden = false;
    document.body.classList.add('com-visor');
    desenharVisor();
  }

  function fecharVisor() {
    $('#visor').hidden = true;
    document.body.classList.remove('com-visor');
    $('#visor-palco').innerHTML = '';
    if (visorUrl) URL.revokeObjectURL(visorUrl);
    visorUrl = null;
    visorI = -1;
  }

  function desenharVisor() {
    const m = midias[visorI];
    if (!m) return fecharVisor();
    if (visorUrl) URL.revokeObjectURL(visorUrl);
    visorUrl = URL.createObjectURL(m.blob);
    $('#visor-palco').innerHTML = m.tipo === 'video'
      ? `<video src="${visorUrl}" controls autoplay playsinline></video>`
      : `<img src="${visorUrl}" alt="${esc(m.legenda)}">`;
    $('#visor-contagem').textContent = `${visorI + 1} / ${midias.length} · ${dataBonita(m.data)}`;
    $('#visor-legenda').value = m.legenda || '';
    const capa = $('#visor-capa');
    capa.hidden = m.tipo !== 'foto' && !m.mini;
    capa.textContent = aberto.capaId === m.id ? '★ é a capa' : 'usar como capa';
    capa.disabled = aberto.capaId === m.id;
    $('#visor-baixar').href = visorUrl;
    $('#visor-baixar').download = m.nome || 'lembranca';
    $('#visor-ant').hidden = $('#visor-prox').hidden = midias.length < 2;
  }

  function passarVisor(d) {
    if (midias.length < 2) return;
    visorI = (visorI + d + midias.length) % midias.length;
    desenharVisor();
  }

  function ligarVisor() {
    $('#visor-fechar').addEventListener('click', fecharVisor);
    $('#visor-ant').addEventListener('click', () => passarVisor(-1));
    $('#visor-prox').addEventListener('click', () => passarVisor(+1));
    $('#visor').addEventListener('click', (ev) => { if (ev.target.id === 'visor' || ev.target.id === 'visor-palco') fecharVisor(); });

    $('#visor-legenda').addEventListener('change', async (ev) => {
      const m = midias[visorI];
      if (!m) return;
      m.legenda = ev.target.value.trim();
      await Banco.salvarMidia(m).catch(() => aviso('Não consegui guardar a legenda.', 'erro'));
      desenharGrade();
    });
    $('#visor-legenda').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ev.target.blur(); });

    $('#visor-capa').addEventListener('click', async () => {
      const m = midias[visorI];
      if (!m) return;
      aberto.capaId = m.id;
      await salvarAberto();
      await carregarCapa(aberto);
      desenharCabeca();
      desenharGrade();
      desenharLista();
      desenharVisor();
    });

    $('#visor-apagar').addEventListener('click', async () => {
      const m = midias[visorI];
      if (!m || !confirm(`Apagar ${m.tipo === 'video' ? 'este vídeo' : 'esta foto'}?`)) return;
      try {
        await Banco.apagarMidia(m.id);
      } catch {
        return aviso('Não consegui apagar.', 'erro');
      }
      midias.splice(visorI, 1);
      contar(aberto, m.tipo, -1);
      if (aberto.capaId === m.id) aberto.capaId = midias.find((x) => x.tipo === 'foto')?.id || null;
      await salvarAberto();
      await carregarCapa(aberto);
      desenharCabeca();
      desenharGrade();
      desenharLista();
      if (!midias.length) return fecharVisor();
      visorI = Math.min(visorI, midias.length - 1);
      desenharVisor();
    });
  }

  // ============================================================
  //  Etiqueta ao passar o mouse num alfinete
  // ============================================================
  function mostrarEtiqueta(id, x, y) {
    const e = $('#etiqueta');
    const l = id && lugares.find((l) => l.id === id);
    if (!l || l.id === aberto?.id) { e.hidden = true; return; }
    e.innerHTML = `${capas.has(l.id) ? `<img src="${capas.get(l.id)}" alt="">` : ''}<span><strong>${esc(l.nome)}</strong><small>${esc(resumo(l))}</small></span>`;
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    e.hidden = false;
  }

  // ============================================================
  //  Controles e cópia de segurança
  // ============================================================
  function baixar(blob, nome) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  const paraTexto = (b) => b ? new Promise((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = () => erro(r.error);
    r.readAsDataURL(b);
  }) : null;

  function deTexto(d) {
    if (!d) return null;
    const [cab, b64] = d.split(',');
    const tipo = cab.match(/^data:([^;,]*)/)?.[1] || '';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: tipo });
  }

  async function exportar() {
    if (!lugares.length) return aviso('Ainda não tem nada para salvar.');
    const av = aviso('preparando a cópia…', 'fixo');
    try {
      const ms = await Banco.todasMidias();
      // monta em pedaços para não criar um texto gigante de uma vez
      const partes = [`{"app":"por-onde-andei","versao":1,"data":"${new Date().toISOString()}","lugares":${JSON.stringify(lugares)},"midias":[`];
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        av.texto(`preparando a cópia… ${i + 1} de ${ms.length}`);
        partes.push((i ? ',' : '') + JSON.stringify({ ...m, blob: await paraTexto(m.blob), mini: await paraTexto(m.mini) }));
      }
      partes.push(']}');
      const hoje = new Date().toISOString().slice(0, 10);
      baixar(new Blob(partes, { type: 'application/json' }), `por-onde-andei-${hoje}.json`);
      aviso('Cópia salva. Guarde o arquivo em um lugar seguro.');
    } catch {
      aviso('Não consegui montar a cópia.', 'erro');
    }
    av.fechar();
  }

  async function importar(arquivo) {
    const av = aviso('abrindo a cópia…', 'fixo');
    try {
      const dados = JSON.parse(await arquivo.text());
      if (dados.app !== 'por-onde-andei') throw new Error('arquivo errado');
      for (const l of dados.lugares) await Banco.salvarLugar(l);
      for (let i = 0; i < dados.midias.length; i++) {
        const m = dados.midias[i];
        av.texto(`abrindo a cópia… ${i + 1} de ${dados.midias.length}`);
        await Banco.salvarMidia({ ...m, blob: deTexto(m.blob), mini: deTexto(m.mini) });
      }
      fecharPainel();
      lugares = await Banco.lugares();
      await Promise.all(lugares.map(carregarCapa));
      atualizar();
      aviso(`${dados.lugares.length} lugares de volta no mapa`);
    } catch {
      aviso('Esse arquivo não parece uma cópia do por onde andei.', 'erro');
    }
    av.fechar();
  }

  function ligarControles() {
    $('#girar').addEventListener('click', (ev) => {
      ev.currentTarget.setAttribute('aria-pressed', Globo.alternarGiro());
    });
    $('#mais-zoom').addEventListener('click', () => Globo.zoomPor(1.6));
    $('#menos-zoom').addEventListener('click', () => Globo.zoomPor(1 / 1.6));
    $('#relevo').addEventListener('click', (ev) => {
      ev.currentTarget.setAttribute('aria-pressed', Globo.alternarInclinacao());
    });
    $('#visao-geral').addEventListener('click', () => { fecharPainel(); esconderBalao(); Globo.visaoGeral(); });
    $('#exportar').addEventListener('click', exportar);
    $('#importar').addEventListener('click', () => $('#arquivo-copia').click());
    $('#arquivo-copia').addEventListener('change', (ev) => {
      if (ev.target.files[0]) importar(ev.target.files[0]);
      ev.target.value = '';
    });
    $('#botao-lista').addEventListener('click', (ev) => {
      const aberta = document.body.classList.toggle('com-lista');
      ev.currentTarget.setAttribute('aria-expanded', aberta);
    });
    addEventListener('resize', () => { if (aberto) Globo.definirFolga(folgaDoPainel()); });
  }

  function ligarTeclado() {
    addEventListener('keydown', (ev) => {
      const digitando = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
      if (!$('#visor').hidden) {
        if (ev.key === 'Escape') fecharVisor();
        else if (!digitando && ev.key === 'ArrowLeft') passarVisor(-1);
        else if (!digitando && ev.key === 'ArrowRight') passarVisor(+1);
        return;
      }
      if (ev.key !== 'Escape') return;
      if (digitando) document.activeElement.blur();
      else if (!$('#balao').hidden) esconderBalao();
      else if (aberto) fecharPainel();
      else document.body.classList.remove('com-lista');
    });
  }

  // ============================================================
  //  Avisos
  // ============================================================
  function aviso(texto, tipo) {
    const el = document.createElement('div');
    el.className = 'aviso' + (tipo ? ' ' + tipo : '');
    el.textContent = texto;
    $('#avisos').append(el);
    const fechar = () => { el.classList.add('saindo'); setTimeout(() => el.remove(), 300); };
    if (tipo !== 'fixo') setTimeout(fechar, tipo === 'erro' ? 6000 : 3200);
    return { texto: (t) => { el.textContent = t; }, fechar };
  }

  iniciar();
})();
