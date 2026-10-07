// ============================================================
//  A ESTANTE
//  Um site de uma página só, com "rotas" no endereço:
//    #/              início (destaques, estante, abas, em breve)
//    #/teste         jogos em teste
//    #/todos         todos os jogos (com filtro por etiqueta)
//    #/tag/<nome>    jogos com uma etiqueta
//    #/jogo/<id>     a página de um jogo
//  O botão "Jogar" abre o jogo.
// ============================================================
(function () {
  const S = window.SITE || {};
  const JOGOS = (window.JOGOS || []).map((j) => ({ capturas: [], tags: [], descricao: [], notas: [], ...j }));
  const app = document.getElementById('app');
  const disponiveis = () => JOGOS.filter((j) => j.status !== 'embreve');
  const porId = (id) => JOGOS.find((j) => j.id === id);
  const todasTags = [...new Set(JOGOS.flatMap((j) => j.tags))].filter((t) => t !== '???');

  // ---------- pedacinhos de HTML ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const data = (d) => {
    if (!d) return 'em breve';
    const [a, m, dia] = d.split('-').map(Number);
    return `${dia} ${MESES[m - 1]} ${a}`;
  };
  const selo = (j) => ({ lancado: '<span class="selo selo-lancado">Lançado</span>', teste: '<span class="selo selo-teste">Em teste</span>', embreve: '<span class="selo selo-breve">Em breve</span>' }[j.status] || '');
  const plataformas = `<span class="plataformas" title="Computador e celular">
      <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/></svg>
      <svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></span>`;
  const tagsHTML = (j, max = 4) => j.tags.slice(0, max).map((t) => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`).join('');
  const etiquetas = () => todasTags.map((t, i) => `<a class="etiqueta" href="#/tag/${encodeURIComponent(t)}" style="--h:${(i * 47 + 200) % 360}">${esc(t)}</a>`).join('');
  const imagem = (src, cls = '', alt = '') => (src
    ? `<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy">`
    : `<span class="${cls} sem-imagem"><span>?</span></span>`);
  const jogou = (j) => { try { return localStorage.getItem('bê:jogou:' + j.id); } catch (e) { return null; } };
  const botaoJogar = (j, extra = '') => (j.status === 'embreve'
    ? `<span class="botao botao-breve ${extra}">Em breve</span>`
    : `<button class="botao botao-jogar ${extra}" data-jogar="${j.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>Jogar</button>`);

  // cartão (capa) usado nas grades
  const capsula = (j) => `
    <a class="capsula revelar" href="#/jogo/${j.id}" data-inclinar="12" style="--cor:${j.cor}">
      <span class="capsula-corpo">
        <span class="capsula-img">${imagem(j.capa, '', j.titulo)}<span class="holo"></span><span class="brilho"></span>${selo(j)}</span>
        <span class="capsula-info">
          <span class="capsula-titulo">${esc(j.titulo)}</span>
          <span class="capsula-baixo">${plataformas}<span class="capsula-meta">${j.duracao ? esc(j.duracao) : data(j.data)}</span></span>
        </span>
      </span>
    </a>`;

  // ========== INÍCIO ==========
  function inicio() {
    const destaques = JOGOS.filter((j) => j.destaque && j.status !== 'embreve');
    const breve = JOGOS.filter((j) => j.status === 'embreve');
    app.innerHTML = `
      <section class="faixa">
        <h2 class="titulo-secao">Em destaque</h2>
        <div class="vitrine" id="vitrine">
          ${destaques.map((j, i) => slide(j, i, destaques.length)).join('')}
          <button class="seta seta-esq" aria-label="anterior">‹</button>
          <button class="seta seta-dir" aria-label="próximo">›</button>
        </div>
        <div class="pontos" id="pontos">${destaques.map((_, i) => `<button aria-label="destaque ${i + 1}"><i></i></button>`).join('')}</div>
      </section>

      <section class="faixa">
        <h2 class="titulo-secao">Etiquetas</h2>
        <div class="letreiro revelar"><div class="letreiro-trilho">${etiquetas()}${etiquetas().replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')}</div></div>
      </section>

      <section class="faixa">
        <div class="abas" role="tablist">
          <button class="aba ativa" data-aba="novidades">Mais recentes</button>
          <button class="aba" data-aba="teste">Em teste</button>
          <button class="aba" data-aba="todos">Todos</button>
        </div>
        <div class="abas-corpo">
          <div class="lista" id="lista"></div>
          <aside class="previa" id="previa" aria-hidden="true"></aside>
        </div>
      </section>

      ${breve.length ? `
      <section class="faixa">
        <h2 class="titulo-secao">Na bancada</h2>
        <div class="grade">${breve.map(capsula).join('')}</div>
      </section>` : ''}

      <section class="faixa">
        <div class="recado revelar">
          <div class="recado-texto">
            <span class="rotulo">ingresso de testador</span>
            <h3>Recebeu um link meu?</h3>
            <p>Joga, repara no que travou ou ficou difícil demais, e me conta. Ajuda muito.</p>
          </div>
          <div class="recado-canhoto">
            <span class="rotulo">admite 1</span>
            <a class="botao botao-sec" href="#/teste">Ver o que está em teste →</a>
          </div>
        </div>
      </section>`;
    montarVitrine(destaques);
    montarAbas();
  }

  const dois = (n) => String(n).padStart(2, '0');
  function slide(j, i, total) {
    const caps = j.capturas.slice(0, 4);
    return `
      <article class="slide${i === 0 ? ' ativo' : ''}" style="--cor:${j.cor}">
        <a class="slide-midia" href="#/jogo/${j.id}">
          <img class="slide-principal" src="${j.capa}" alt="${esc(j.titulo)}">
        </a>
        <div class="slide-info">
          <span class="slide-num">${dois(i + 1)} <i>/ ${dois(total)}</i></span>
          <h3>${esc(j.titulo)}</h3>
          <p class="slide-resumo">${esc(j.resumo)}</p>
          <div class="slide-capturas">
            ${caps.map((c) => `<img src="${c}" alt="" data-captura="${c}" loading="lazy">`).join('')}
          </div>
          <div class="slide-tags">${tagsHTML(j)}</div>
          <div class="slide-jogar">
            <span class="slide-status">${selo(j)}<small>${j.versao ? 'versão ' + esc(j.versao) : ''}</small></span>
            ${botaoJogar(j)}
          </div>
        </div>
      </article>`;
  }

  function montarVitrine(destaques) {
    const v = document.getElementById('vitrine');
    if (!v || !destaques.length) return;
    const slides = [...v.querySelectorAll('.slide')];
    const pontos = [...document.querySelectorAll('#pontos button')];
    let atual = 0, timer = null;
    const ir = (n) => {
      const antes = atual;
      atual = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle('ativo', i === atual);
        s.classList.toggle('saindo', i === antes && i !== atual);
      });
      pontos.forEach((p, i) => p.classList.toggle('ativo', i === atual));
      reiniciar();
    };
    const reiniciar = () => {
      clearTimeout(timer);
      pontos.forEach((p) => { p.classList.remove('correndo'); void p.offsetWidth; });
      if (pontos[atual]) pontos[atual].classList.add('correndo');
      if (slides.length > 1) timer = setTimeout(() => ir(atual + 1), 7000);
    };
    v.querySelector('.seta-esq').onclick = () => ir(atual - 1);
    v.querySelector('.seta-dir').onclick = () => ir(atual + 1);
    pontos.forEach((p, i) => { p.onclick = () => ir(i); });
    // passar o mouse numa captura mostra ela grande (como na Steam)
    slides.forEach((s) => {
      const principal = s.querySelector('.slide-principal');
      const original = principal.src;
      s.querySelectorAll('[data-captura]').forEach((img) => {
        img.addEventListener('mouseenter', () => { principal.src = img.dataset.captura; });
        img.addEventListener('mouseleave', () => { principal.src = original; });
      });
    });
    v.addEventListener('mouseenter', () => { clearTimeout(timer); pontos.forEach((p) => p.classList.add('pausado')); });
    v.addEventListener('mouseleave', () => { pontos.forEach((p) => p.classList.remove('pausado')); reiniciar(); });
    if (slides.length < 2) v.classList.add('sozinho');
    ir(0);
  }

  function montarAbas() {
    const lista = document.getElementById('lista');
    const previa = document.getElementById('previa');
    const conjuntos = {
      novidades: [...disponiveis()].sort((a, b) => (b.data || '').localeCompare(a.data || '')),
      teste: JOGOS.filter((j) => j.status === 'teste'),
      todos: disponiveis(),
    };
    const mostrar = (nome) => {
      document.querySelectorAll('.aba').forEach((a) => a.classList.toggle('ativa', a.dataset.aba === nome));
      const js = conjuntos[nome];
      lista.innerHTML = js.length ? js.map(linha).join('') : '<p class="vazio">Nada por aqui ainda.</p>';
      lista.querySelectorAll('.linha').forEach((el) => {
        const j = porId(el.dataset.id);
        el.addEventListener('mouseenter', () => mostrarPrevia(j));
        el.addEventListener('focus', () => mostrarPrevia(j));
      });
      if (js[0]) mostrarPrevia(js[0]);
      lista.classList.remove('troca'); void lista.offsetWidth; lista.classList.add('troca');
    };
    function mostrarPrevia(j) {
      lista.querySelectorAll('.linha').forEach((el) => el.classList.toggle('foco', el.dataset.id === j.id));
      previa.style.setProperty('--cor', j.cor);
      previa.innerHTML = `
        <h4>${esc(j.titulo)}</h4>
        <p class="previa-resumo">${esc(j.resumo)}</p>
        <div class="previa-tags">${j.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        ${j.capturas.slice(0, 2).map((c) => `<img src="${c}" alt="">`).join('')}`;
      previa.classList.remove('troca'); void previa.offsetWidth; previa.classList.add('troca');
    }
    document.querySelectorAll('.aba').forEach((a) => { a.onclick = () => mostrar(a.dataset.aba); });
    mostrar('novidades');
  }

  const linha = (j, i) => `
    <a class="linha" href="#/jogo/${j.id}" data-id="${j.id}" style="--cor:${j.cor}">
      <span class="linha-num">${dois(i + 1)}</span>
      ${imagem(j.capa, 'linha-img', j.titulo)}
      <span class="linha-info">
        <span class="linha-titulo">${esc(j.titulo)} ${jogou(j) ? '<span class="ja-jogou">já jogou</span>' : ''}</span>
        <span class="linha-sub">${plataformas}<span>${j.tags.slice(0, 3).map(esc).join(', ')}</span></span>
      </span>
      <span class="linha-data">${data(j.data)}</span>
      ${selo(j)}
    </a>`;

  // ========== LISTAS (em teste, todos, etiqueta) ==========
  function listagem(titulo, texto, js, filtroTags) {
    app.innerHTML = `
      <section class="faixa">
        <h1 class="titulo-pagina">${esc(titulo)}</h1>
        ${texto ? `<p class="texto-pagina">${texto}</p>` : ''}
        ${filtroTags ? `<div class="etiquetas">${etiquetas()}</div>` : ''}
        <div class="grade">${js.length ? js.map(capsula).join('') : '<p class="vazio">Nada por aqui ainda. Volte depois!</p>'}</div>
      </section>`;
  }

  // ========== PÁGINA DO JOGO ==========
  function pagina(j) {
    const midias = [j.capa, ...j.capturas].filter(Boolean);
    const outros = JOGOS.filter((o) => o.id !== j.id);
    const breve = j.status === 'embreve';
    const info = [
      ['Lançamento', data(j.data)],
      ['Versão', j.versao],
      ['Duração', j.duracao],
      ['Jogadores', j.jogadores],
      ['Controles', j.controles],
    ].filter((x) => x[1]);
    app.innerHTML = `
      <section class="faixa jogo" style="--cor:${j.cor}">
        ${j.capa ? `<div class="jogo-fundo" style="background-image:url('${j.capa}')" aria-hidden="true"></div>` : ''}
        <nav class="migalhas"><a href="#/todos">Todos os jogos</a> › ${j.tags[0] && j.tags[0] !== '???' ? `<a href="#/tag/${encodeURIComponent(j.tags[0])}">${esc(j.tags[0])}</a> › ` : ''}<span>${esc(j.titulo)}</span></nav>
        <h1 class="titulo-jogo">${esc(j.titulo)} ${selo(j)}</h1>

        <div class="jogo-topo">
          <div class="galeria">
            <div class="galeria-palco">
              ${midias.length ? `<img id="galeria-img" src="${midias[0]}" alt="">` : '<span class="sem-imagem grande"><span>?</span></span>'}
              ${midias.length > 1 ? '<button class="seta seta-esq" data-gal="-1" aria-label="anterior">‹</button><button class="seta seta-dir" data-gal="1" aria-label="próxima">›</button>' : ''}
            </div>
            ${midias.length > 1 ? `<div class="galeria-tira">${midias.map((m, i) => `<button class="${i ? '' : 'ativa'}" data-i="${i}"><img src="${m}" alt=""></button>`).join('')}</div>` : ''}
          </div>
          <aside class="ficha">
            ${imagem(j.capa, 'ficha-capa', j.titulo)}
            <p class="ficha-resumo">${esc(j.resumo)}</p>
            <dl>${info.slice(0, 3).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
            <div class="ficha-tags">${tagsHTML(j, 6)}</div>
          </aside>
        </div>

        <div class="jogo-corpo">
          <div class="jogo-principal">
            <div class="jogar-caixa revelar">
              <div>
                <h3>${breve ? 'Ainda não dá pra jogar' : esc(j.titulo)}</h3>
                <p>${breve ? 'Está sendo feito. Volte daqui a um tempo.' : 'Roda aqui mesmo no navegador, no computador ou no celular.'}</p>
              </div>
              ${botaoJogar(j, 'grande')}
            </div>
            <div class="acoes-extra revelar">
              <button class="botao botao-sec" data-copiar><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>Copiar link pra mandar pra alguém</button>
              ${S.feedback ? `<a class="botao botao-sec" href="${esc(S.feedback)}" target="_blank" rel="noopener">Mandar um comentário</a>` : ''}
            </div>

            <h2 class="sub revelar">Sobre</h2>
            ${j.descricao.map((p) => `<p class="paragrafo revelar">${esc(p)}</p>`).join('')}

            ${j.notas.length ? `
            <h2 class="sub revelar">${j.status === 'teste' ? 'O que mudou nesta versão' : 'Notas da versão'}</h2>
            <ul class="notas revelar">${j.notas.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}

            ${j.status === 'teste' ? `
            <div class="testador revelar">
              <strong>Está testando?</strong>
              <p>Repara onde você travou, o que ficou difícil demais e qualquer coisa estranha. Um print já ajuda muito.</p>
            </div>` : ''}

            ${info.length && !breve ? `
            <h2 class="sub revelar">Detalhes</h2>
            <dl class="detalhes revelar">${info.map(([a, b]) => `<div><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : ''}
          </div>
          ${outros.length ? `
          <aside class="jogo-lado">
            <h3 class="titulo-secao">Mais jogos</h3>
            ${outros.map(capsula).join('')}
          </aside>` : ''}
        </div>
      </section>`;

    // galeria
    const img = document.getElementById('galeria-img');
    let gi = 0;
    const ver = (n) => {
      if (!img) return;
      gi = (n + midias.length) % midias.length;
      img.classList.remove('entra'); void img.offsetWidth;
      img.src = midias[gi];
      img.classList.add('entra');
      app.querySelectorAll('.galeria-tira button').forEach((b, i) => b.classList.toggle('ativa', i === gi));
      const tira = app.querySelector('.galeria-tira');
      const ativo = app.querySelector('.galeria-tira .ativa');
      if (tira && ativo) tira.scrollTo({ left: ativo.offsetLeft - tira.clientWidth / 2 + ativo.clientWidth / 2, behavior: 'smooth' });
    };
    app.querySelectorAll('.galeria-tira button').forEach((b) => { b.onclick = () => ver(+b.dataset.i); });
    app.querySelectorAll('[data-gal]').forEach((b) => { b.onclick = () => ver(gi + +b.dataset.gal); });
  }

  // ========== ROTAS ==========
  function rota() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [a, b] = h.split('/');
    let nome = 'inicio';
    if (a === 'jogo' && porId(b)) { pagina(porId(b)); nome = ''; document.title = `${porId(b).titulo} · ${S.nome}`; }
    else if (a === 'teste') { listagem('Em teste', 'Jogos que ainda estão sendo testados. Se você chegou aqui por um link meu: obrigado por testar!', JOGOS.filter((j) => j.status === 'teste')); nome = 'teste'; }
    else if (a === 'todos') { listagem('Todos os jogos', '', JOGOS, true); nome = 'todos'; }
    else if (a === 'tag' && b) { listagem(b, `Jogos com a etiqueta <b>${esc(b)}</b>.`, JOGOS.filter((j) => j.tags.includes(b)), true); nome = ''; }
    else inicio();
    if (nome !== '') document.title = S.nome;
    document.querySelectorAll('.menu a').forEach((m) => m.classList.toggle('ativo', m.dataset.rota === nome));
    app.classList.remove('entra'); void app.offsetWidth; app.classList.add('entra');
    window.scrollTo({ top: 0 });
    E.revelar(app);
  }
  window.addEventListener('hashchange', rota);

  // cliques globais: jogar e copiar link
  document.addEventListener('click', (e) => {
    const jogar = e.target.closest('[data-jogar]');
    if (jogar) { e.preventDefault(); E.abrirJogo(porId(jogar.dataset.jogar)); return; }
    if (e.target.closest('[data-copiar]')) {
      const url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(() => E.aviso('Link copiado. Agora é só mandar!'))
        .catch(() => { window.prompt('Copie o link:', url); });
    }
  });

  // ========== BUSCA ==========
  const busca = document.getElementById('busca');
  const res = document.getElementById('busca-resultados');
  const achados = (q) => JOGOS.filter((j) => (j.titulo + ' ' + j.tags.join(' ')).toLowerCase().includes(q));
  busca.addEventListener('input', () => {
    const q = busca.value.trim().toLowerCase();
    if (!q) { res.classList.remove('aberto'); return; }
    const r = achados(q);
    res.innerHTML = r.length
      ? r.map((j) => `<a href="#/jogo/${j.id}">${imagem(j.capa, 'res-img')}<span><b>${esc(j.titulo)}</b><small>${j.tags.slice(0, 3).map(esc).join(', ')}</small></span></a>`).join('')
      : '<p>Nenhum jogo com esse nome. Ainda.</p>';
    res.classList.add('aberto');
  });
  busca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const r = achados(busca.value.trim().toLowerCase()); if (r[0]) location.hash = '#/jogo/' + r[0].id; busca.blur(); }
    if (e.key === 'Escape') { busca.value = ''; res.classList.remove('aberto'); busca.blur(); }
  });
  res.addEventListener('click', () => { busca.value = ''; res.classList.remove('aberto'); });
  busca.addEventListener('blur', () => setTimeout(() => res.classList.remove('aberto'), 150));

  // ========== textos fixos e início ==========
  document.querySelectorAll('.logo-texto').forEach((el) => { el.textContent = S.nome; });
  document.getElementById('slogan').textContent = S.slogan || '';
  document.getElementById('dono').textContent = S.dono || '';
  const qtd = JOGOS.filter((j) => j.status === 'teste').length;
  document.getElementById('qtd-teste').textContent = qtd || '';
  E.inclinar();
  E.luz();
  rota();
})();
