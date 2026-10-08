// ============================================================
//  INTERFACE: janelas, conversas, barra de tarefas, post-it,
//  notificações e o menu Iniciar.
// ============================================================
F.UI = {
  init() {
    this.jan = document.getElementById('janelas');
    this.promptEl = document.getElementById('prompt');
    this.toastsEl = document.getElementById('toasts');
    this.rastreioEl = document.getElementById('rastreio');

    // barra de tarefas
    const barra = F.u.el('div', '', '');
    barra.id = 'barra'; barra.hidden = true;
    barra.innerHTML = `
      <button class="btn iniciar" id="btn-iniciar"><span class="raio">⚡</span><span class="txt">Iniciar</span></button>
      <div class="afundado barra-local" id="barra-local"></div>
      <div class="afundado bandeja" id="bandeja">
        ${['din', 'rep', 'prod', 'est', 'inf'].map((k) => `<div class="stat ${k}" id="st-${k}" title="${F.ATRIB[k].nome}"><span class="v">${F.ATRIB[k].ico}<b></b></span><span class="b"><i></i></span></div>`).join('')}
        <button class="email" id="btn-email" title="Outlouco (e-mails)">📧<b></b></button>
        <div class="relogio" id="relogio"></div>
      </div>`;
    document.getElementById('ui').appendChild(barra);
    this.barra = barra;
    const menu = F.u.el('div', 'bisel', '');
    menu.id = 'menu-iniciar'; menu.hidden = true;
    document.getElementById('ui').appendChild(menu);
    this.menuEl = menu;

    document.getElementById('btn-iniciar').addEventListener('click', (e) => { e.stopPropagation(); this.alternarMenu(); });
    document.getElementById('btn-email').addEventListener('click', () => { this.fecharMenu(); F.Emails.abrir(); });
    document.addEventListener('pointerdown', (e) => { if (!this.menuEl.hidden && !this.menuEl.contains(e.target) && e.target.id !== 'btn-iniciar') this.fecharMenu(); });
    this.promptEl.addEventListener('click', () => { const a = F.Mundo.alvo; if (a && !this.aberta()) { F.Mundo.olharPara(a); F.Interacao.com(a); } });
    this.rastreioEl.addEventListener('click', () => { this.rastreioEl.classList.toggle('fechado'); this.rastreioEl.classList.toggle('aberto'); });

    // teclado dentro das janelas
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      const w = this.topo();
      if (!w) {
        if (e.code === 'Escape' && !this.menuEl.hidden) this.fecharMenu();
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        const ops = [...w.querySelectorAll('.opcao:not([disabled]), .acoes-reuniao .btn:not([disabled])')];
        if (ops[n - 1]) { e.preventDefault(); ops[n - 1].click(); }
      } else if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
        const p = w.querySelector('.btn.primario');
        if (p && !p.disabled) { e.preventDefault(); p.click(); }
        else { const tw = w.querySelector('.dlg-texto'); if (tw && tw._pular) tw._pular(); }
      } else if (e.code === 'Escape') {
        const x = w.querySelector('.win-x');
        if (x) x.click();
      }
    });
  },

  // ---------- janelas ----------
  aberta() { return this.jan.children.length > 0; },
  topo() { return this.jan.lastElementChild; },
  janela({ titulo, icone = '🗔', classe = '', corpo, botoes = [], fechar = true, aoFechar } = {}) {
    [...this.jan.children].forEach((w) => w.classList.add('atras'));
    const w = F.u.el('div', 'win ' + classe);
    w.innerHTML = `<div class="win-barra"><span class="ico">${icone}</span><span class="tit">${F.u.esc(titulo)}</span>${fechar ? '<button class="win-x" aria-label="fechar">✕</button>' : ''}</div><div class="win-corpo"></div><div class="win-botoes"></div>`;
    const c = w.querySelector('.win-corpo');
    if (typeof corpo === 'string') c.innerHTML = corpo; else if (corpo) c.appendChild(corpo);
    const bb = w.querySelector('.win-botoes');
    botoes.forEach((b, i) => {
      const el = F.u.el('button', 'btn' + (b.primario || (i === botoes.length - 1 && !botoes.some((x) => x.primario)) ? ' primario' : ''), F.u.esc(b.t));
      el.addEventListener('click', () => { F.Som.clique(); if (b.fn) b.fn(w); if (b.fecha !== false) this.fechar(w); });
      bb.appendChild(el);
    });
    if (!botoes.length) bb.remove();
    w._aoFechar = aoFechar;
    if (fechar) w.querySelector('.win-x').addEventListener('click', () => { F.Som.clique(); this.fechar(w); });
    this.jan.appendChild(w);
    this.jan.classList.add('tem');
    this.fecharMenu();
    F.Som.abre();
    return w;
  },
  fechar(w) {
    if (!w || !w.parentNode) return;
    this.fechouEm = performance.now();
    w.remove();
    const t = this.topo();
    if (t) t.classList.remove('atras'); else this.jan.classList.remove('tem');
    if (w._aoFechar) w._aoFechar();
  },
  fecharTudo() { [...this.jan.children].forEach((w) => w.remove()); this.jan.classList.remove('tem'); },

  // retrato de uma pessoa (canvas pequeno)
  retrato(look, tam = 40, op) { const cv = document.createElement('canvas'); F.Arte.retrato(cv, look, { tam, ...op }); return cv; },

  // ---------- conversa / situação ----------
  // quem: { nome, cargo, look } | null ; opcoes: [{ t, tags, cls, fn }]
  dialogo({ titulo, icone = '💬', quem, cabecalho, texto, opcoes = [], fechar = true, classe = '', aoFechar }) {
    const corpo = F.u.el('div', '');
    const dlg = F.u.el('div', quem ? 'dlg' : '');
    if (quem) {
      const foto = F.u.el('div', 'dlg-foto');
      const af = F.u.el('div', 'afundado');
      af.appendChild(this.retrato(quem.look, 40));
      foto.appendChild(af);
      foto.appendChild(F.u.el('div', 'dlg-nome', F.u.esc(quem.nome)));
      foto.appendChild(F.u.el('div', 'dlg-cargo', F.u.esc(quem.cargo || '')));
      dlg.appendChild(foto);
    }
    const dir = F.u.el('div', '');
    if (cabecalho) dir.appendChild(F.u.el('div', 'situacao-tit', cabecalho));
    const tx = F.u.el('div', 'afundado dlg-texto');
    dir.appendChild(tx);
    this.digitar(tx, texto || '');
    const ops = F.u.el('div', 'opcoes');
    opcoes.forEach((o, i) => {
      const b = F.u.el('button', 'opcao ' + (o.cls || ''));
      b.innerHTML = `<span class="num">${i + 1}</span><span class="txt">${F.u.esc(o.t)}${o.tags || ''}</span>`;
      if (o.desab) b.disabled = true;
      b.addEventListener('click', () => { F.Som.clique(); o.fn(w); });
      ops.appendChild(b);
    });
    dir.appendChild(ops);
    dlg.appendChild(dir);
    corpo.appendChild(dlg);
    const w = this.janela({ titulo, icone, corpo, fechar, classe, aoFechar });
    return w;
  },

  // texto que aparece aos poucos (clique para mostrar tudo)
  digitar(el, texto) {
    const html = F.u.fmt(texto);
    if (!texto || texto.length < 8) { el.innerHTML = html; return; }
    let i = 0;
    const plain = texto;
    el.textContent = '';
    const passo = () => {
      i += 3;
      if (i >= plain.length) { el.innerHTML = html; el._pular = null; return; }
      el.textContent = plain.slice(0, i);
      if (i % 9 === 0) F.Som.digita();
      el._t = setTimeout(passo, 16);
    };
    el._pular = () => { clearTimeout(el._t); el.innerHTML = html; el._pular = null; };
    el.addEventListener('click', () => el._pular && el._pular());
    passo();
  },

  // resultado de uma escolha, com as fichas de mudança
  resultado({ titulo = 'Resultado', icone = '📋', quem, texto, chips = [], rolagem, depois, botao = 'Continuar' }) {
    const corpo = F.u.el('div', '');
    if (rolagem) corpo.appendChild(F.u.el('div', 'rolagem ' + (rolagem.ok ? 'ok' : 'falha'), F.u.esc(rolagem.txt)));
    const wrap = F.u.el('div', quem ? 'dlg' : '');
    if (quem) {
      const foto = F.u.el('div', 'dlg-foto'); const af = F.u.el('div', 'afundado');
      af.appendChild(this.retrato(quem.look, 40, { feliz: rolagem ? rolagem.ok : undefined })); foto.appendChild(af);
      foto.appendChild(F.u.el('div', 'dlg-nome', F.u.esc(quem.nome)));
      wrap.appendChild(foto);
    }
    const dir = F.u.el('div', '');
    if (texto) { const t = F.u.el('div', 'afundado dlg-texto'); t.innerHTML = F.u.fmt(texto); dir.appendChild(t); }
    if (chips.length) {
      const c = F.u.el('div', 'chips');
      chips.forEach((ch) => c.appendChild(F.u.el('span', 'chip ' + ch.cls, F.u.esc(ch.txt))));
      dir.appendChild(c);
      if (chips.some((ch) => ch.cls === 'bom')) F.Som.bom(); else if (chips.some((ch) => ch.cls === 'ruim')) F.Som.ruim();
    }
    wrap.appendChild(dir);
    corpo.appendChild(wrap);
    return this.janela({ titulo, icone, corpo, botoes: [{ t: botao, primario: true, fn: () => {} }], aoFechar: depois });
  },

  // ---------- barra de tarefas ----------
  mostrarBarra(v) { this.barra.hidden = !v; if (!v) this.fecharMenu(); },
  hud() {
    const S = F.S;
    if (!S || this.barra.hidden) return;
    for (const k of ['din', 'rep', 'prod', 'est', 'inf']) {
      const el = document.getElementById('st-' + k);
      el.querySelector('b').textContent = k === 'din' ? (Math.abs(S.din) >= 10000 ? (S.din / 1000).toFixed(0) + 'k' : Math.round(S.din)) : Math.round(S[k]);
      el.querySelector('i').style.width = (k === 'din' ? F.u.clamp(S.din / 150, 0, 100) : S[k]) + '%';
      el.title = F.ATRIB[k].nome + ': ' + (k === 'din' ? F.u.dinheiro(S.din) : Math.round(S[k]));
    }
    document.getElementById('relogio').innerHTML = `${F.u.hora(S.minuto)}<br><small>Dia ${S.dia}${window.innerWidth > 760 ? ' · ' + F.SEMANA[(S.dia - 1) % 5].slice(0, 3) : ''}</small>`;
    const nl = S.emails.filter((e) => !e.lido).length;
    document.querySelector('#btn-email b').textContent = nl || '';
  },
  piscarStat(k) {
    const el = document.getElementById('st-' + k);
    if (!el) return;
    el.classList.remove('mudou'); void el.offsetWidth; el.classList.add('mudou');
  },
  local() {
    const M = F.Mundo.mapa(), z = F.Mundo.zonaAtual;
    const el = document.getElementById('barra-local');
    if (el) el.innerHTML = `<span>🏢 ${F.u.esc(z ? M.curto + ' · ' + z.nome : M.nome)}</span>`;
  },

  prompt(alvo) {
    const el = this.promptEl;
    if (!alvo || this.aberta()) { el.hidden = true; this._ultimoPrompt = null; return; }
    let txt;
    if (alvo.npc) {
      const d = alvo.npc.def;
      const m = F.Interacao.marca(alvo.npc);
      txt = (m === 'missao' ? '▶ ' : m ? '❗ ' : '💬 ') + 'Falar com ' + (d.figurante ? 'colega' : d.nome);
    } else {
      const o = F.OBJETOS[alvo.movel.acao];
      const m = F.Quests.passoNoObjeto(alvo.movel.acao);
      txt = (m ? '▶ ' : '') + (o ? o.nome : 'Usar');
    }
    const chave = txt;
    if (this._ultimoPrompt === chave && !el.hidden) return;
    this._ultimoPrompt = chave;
    el.innerHTML = `<span>${F.u.esc(txt)}</span>${F.Input.celular ? '' : '<kbd>E</kbd>'}`;
    el.hidden = false;
  },

  toast(titulo, texto, ms = 4200) {
    const t = F.u.el('div', 'toast', `<b>${F.u.esc(titulo)}</b>${F.u.esc(texto || '')}`);
    this.toastsEl.appendChild(t);
    while (this.toastsEl.children.length > (window.innerHeight < 500 || window.innerWidth < 760 ? 2 : 4)) this.toastsEl.firstChild.remove();
    setTimeout(() => { t.classList.add('sai'); setTimeout(() => t.remove(), 400); }, ms);
  },

  // ---------- post-it com o que fazer ----------
  rastreio() {
    const S = F.S, el = this.rastreioEl;
    if (!S || this.barra.hidden) { el.innerHTML = ''; return; }
    const itens = [];
    const principal = F.Missoes.principalAtual();
    if (principal) {
      const falta = principal.objetivos.find((o) => o.v(S) < o.n);
      if (falta) itens.push(`<li>${F.u.esc(principal.titulo)}<small>${F.u.esc(falta.t)} (${Math.min(falta.v(S), falta.n)}/${falta.n})</small></li>`);
    }
    Object.entries(S.quests).filter(([, q]) => q.estado === 'ativa').forEach(([id, q]) => {
      const Q = F.QUESTS[id], p = Q.passos[q.passo];
      if (!p) return;
      itens.push(`<li>${Q.tarefa ? '✔ ' : ''}${F.u.esc(Q.titulo)}<small>${F.u.esc(p.dica || '')}</small></li>`);
    });
    const prox = S.agenda.filter((a) => a.dia === S.dia && !a.feito).sort((a, b) => a.min - b.min)[0];
    if (prox) itens.push(`<li>📅 ${F.u.hora(prox.min)} ${F.u.esc(F.REUNIOES[prox.id].titulo)}<small>${F.Reuniao.nomeSala(F.REUNIOES[prox.id].sala)}</small></li>`);
    el.innerHTML = itens.length ? `<h4><span>📌 Pendências</span><span>${itens.length}</span></h4><ul>${itens.slice(0, 6).join('')}</ul>` : '';
  },

  // ---------- menu Iniciar ----------
  alternarMenu() { if (this.menuEl.hidden) this.abrirMenu(); else this.fecharMenu(); },
  fecharMenu() { if (this.menuEl) this.menuEl.hidden = true; document.getElementById('btn-iniciar') && document.getElementById('btn-iniciar').classList.remove('apertado'); },
  abrirMenu() {
    if (this.aberta()) return;
    const S = F.S;
    const itens = [
      ['📋', 'Missões', () => F.Paineis.missoes()],
      ['📧', 'Outlouco (e-mails)', () => F.Emails.abrir()],
      ['📅', 'Agenda', () => F.Paineis.agenda()],
      ['📘', 'Manual não oficial', () => F.Paineis.manual()],
      ['👥', 'Contatos', () => F.Paineis.contatos()],
      ['📈', 'Carreira e atributos', () => F.Paineis.carreira()],
      null,
      ['💾', 'Salvar', () => F.Paineis.salvar()],
      ['🔊', 'Música: ' + (F.Som.musicaLigada ? 'ligada' : 'desligada'), () => { F.Som.alternarMusica(); }],
      ['❓', 'Como jogar', () => F.Titulo.leiaMe()],
      ['⏻', 'Sair para a área de trabalho', () => F.Paineis.sair()],
    ];
    const cab = F.u.el('div', 'menu-quem');
    cab.appendChild(this.retrato(S.look, 40));
    cab.appendChild(F.u.el('div', '', `<b>${F.u.esc(S.nome)}</b><small>${F.u.esc(F.CARGOS[S.cargo].nome)}<br>${F.PERFIS[S.perfil].nome}</small>`));
    const lista = F.u.el('div', 'menu-itens');
    lista.appendChild(cab);
    itens.forEach((it) => {
      if (!it) { lista.appendChild(F.u.el('div', 'menu-sep')); return; }
      const b = F.u.el('button', 'menu-item', `<span class="ico">${it[0]}</span>${F.u.esc(it[1])}`);
      b.addEventListener('click', () => { F.Som.clique(); this.fecharMenu(); it[2](); });
      lista.appendChild(b);
    });
    this.menuEl.innerHTML = '<div class="menu-faixa">Energy<b>.exe</b></div>';
    this.menuEl.appendChild(lista);
    this.menuEl.hidden = false;
    document.getElementById('btn-iniciar').classList.add('apertado');
  },
};
