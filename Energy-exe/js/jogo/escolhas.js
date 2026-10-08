// ============================================================
//  ESCOLHAS, MISSÕES DE INVESTIGAÇÃO e LISTA DE MISSÕES
// ============================================================
F.npc = (id) => F.NPCS.find((n) => n.id === id);
F.texto = (t) => (typeof t === 'function' ? t(F.S) : t);

F.HABS = {
  tecnico: 'Técnico', comunicador: 'Comunicador', analitico: 'Analítico', politico: 'Político', sobrevivente: 'Sobrevivente',
};

F.Escolhas = {
  // a situação pode acontecer agora?
  disponivel(ev) {
    const S = F.S;
    if (ev.uma && S.vistos[ev.id] !== undefined) return false;
    if (ev.cd && S.vistos[ev.id] !== undefined && S.dia - S.vistos[ev.id] < ev.cd) return false;
    if (ev.cond && !ev.cond(S)) return false;
    return true;
  },

  chance(hab) {
    const S = F.S;
    let c = hab === 'sobrevivente' ? 0.3 : 0.38;
    if (S.perfil === hab) c += 0.28;
    c += S.prod / 400;
    if (hab === 'tecnico') c += Math.min(S.cont.automacoes, 5) * 0.03 + (S.flags.daviEnsinou ? 0.1 : 0) + (S.flags.excel ? 0.05 : 0);
    if (hab === 'comunicador') c += S.rep / 500;
    if (hab === 'politico') c += S.inf / 400;
    if (S.est > 75) c -= 0.12;
    return F.u.clamp(c, 0.08, 0.92);
  },

  // monta a lista de opções visíveis (com etiquetas)
  opcoes(lista) {
    const S = F.S;
    return lista.filter((e) => {
      if (e.se && !e.se(S)) return false;
      if (e.regra && !S.regras.includes(e.regra)) return false;
      if (e.perfil && S.perfil !== e.perfil) return false;
      return true;
    }).map((e) => {
      let tags = '';
      if (e.regra) tags += `<span class="tag regra">📘 #${F.REGRAS[e.regra].n}</span>`;
      if (e.perfil) tags += `<span class="tag perfil">${F.PERFIS[e.perfil].nome}</span>`;
      if (e.hab) tags += `<span class="tag teste">🎲 ${F.HABS[e.hab]} ${Math.round(this.chance(e.hab) * 100)}%</span>`;
      return { e, tags, cls: e.perigo ? 'perigo' : '' };
    });
  },

  quem(id) {
    if (!id) return null;
    const d = F.npc(id);
    return d ? { nome: d.nome, cargo: d.cargo, look: d.look } : null;
  },

  // mostra uma situação (por id ou objeto)
  mostrar(evOuId, op = {}) {
    const ev = typeof evOuId === 'string' ? F.EVENTO[evOuId] : evOuId;
    if (!ev) return;
    const S = F.S;
    S.vistos[ev.id] = S.dia;
    if (ev.ao) ev.ao(S);
    const quem = this.quem(ev.quem);
    const rotulo = { zona: 'situação', npc: 'situação', casa: 'em casa', manual: 'situação' }[ev.g] || 'situação';
    const ops = this.opcoes(ev.escolhas);
    F.UI.dialogo({
      titulo: ev.g === 'casa' ? 'Em casa' : (quem ? quem.nome : 'Situação'),
      icone: ev.g === 'casa' ? '🏠' : '⚠',
      quem, fechar: false,
      cabecalho: `${F.u.esc(ev.titulo)} <small>${rotulo}</small>`,
      texto: F.texto(ev.texto),
      opcoes: ops.map((o) => ({ t: o.e.t, tags: o.tags, cls: o.cls, fn: (w) => { F.UI.fechar(w); this.resolver(o.e, { ev, quem, depois: op.depois }); } })),
    });
  },

  // aplica uma escolha e mostra o resultado
  resolver(esc, ctx = {}) {
    const S = F.S;
    let fx = esc.fx, r = esc.r, prox = esc.prox, rolagem = null;
    if (esc.hab) {
      const c = this.chance(esc.hab);
      const ok = Math.random() < c;
      const out = ok ? esc.ok : esc.falha;
      fx = out.fx; r = out.r; prox = out.prox !== undefined ? out.prox : esc.prox;
      rolagem = { ok, txt: `🎲 Teste de ${F.HABS[esc.hab]} (${Math.round(c * 100)}%): ${ok ? 'deu certo!' : 'não deu.'}` };
    }
    // uma escolha que só leva para outra situação
    if (esc.seguir && !fx) { this.mostrar(esc.seguir, { depois: ctx.depois }); return; }
    fx = Object.assign({ t: 10 }, fx || {});
    const chips = F.Estado.aplicar(fx);
    if (ctx.ev && ctx.ev.depois) ctx.ev.depois(S);
    const fim = () => {
      if (esc.seguir) this.mostrar(esc.seguir, { depois: ctx.depois });
      else if (ctx.depois) ctx.depois(prox);
    };
    if (!r && !chips.length) { fim(); return; }
    F.UI.resultado({ titulo: ctx.titulo || (ctx.ev ? ctx.ev.titulo : 'Resultado'), quem: ctx.quem, texto: r, chips, rolagem, depois: fim });
  },

  // uma janelinha de informação (objetos), com efeitos opcionais
  info(titulo, texto, fx) {
    const chips = fx ? F.Estado.aplicar(Object.assign({ t: 3 }, fx)) : [];
    const ico = titulo.match(/^\S+/)[0];
    F.UI.resultado({ titulo: titulo.replace(/^\S+\s/, ''), icone: ico.length <= 2 ? ico : '🗔', texto, chips, botao: 'OK' });
  },
};

// ============================================================
//  MISSÕES DE INVESTIGAÇÃO / TAREFAS
// ============================================================
F.Quests = {
  iniciar(id) {
    const S = F.S, Q = F.QUESTS[id];
    if (!Q) return false;
    const q = S.quests[id];
    if (q && q.estado === 'ativa') return false;
    if (q && !Q.tarefa) return false;  // investigações só uma vez
    S.quests[id] = { passo: 0, estado: 'ativa', dia: S.dia, inicio: S.minuto };
    if (Q.aoComecar) Q.aoComecar(S);
    F.UI.rastreio();
    return true;
  },
  ativas() { return Object.keys(F.S.quests).filter((id) => F.S.quests[id].estado === 'ativa'); },
  passo(id) { const q = F.S.quests[id]; return q && q.estado === 'ativa' ? F.QUESTS[id].passos[q.passo] : null; },

  // missões com o próximo passo nesta pessoa
  naPessoa(npcId) { return this.ativas().filter((id) => { const p = this.passo(id); return p && p.alvo === 'npc:' + npcId; }); },
  passoNoObjeto(acao) {
    return this.ativas().find((id) => { const p = this.passo(id); return p && (p.alvo === 'obj:' + acao || (acao === 'mesa' && p.alvo === 'mesa')); });
  },
  // missão que esta pessoa quer oferecer
  oferta(npcId) {
    const S = F.S;
    return Object.keys(F.QUESTS).find((id) => {
      const Q = F.QUESTS[id];
      return Q.oferta && Q.oferta.npc === npcId && !S.quests[id] && (!Q.oferta.cond || Q.oferta.cond(S)) && !(S.flags['recusou-' + id] === S.dia);
    });
  },

  oferecer(id, depois) {
    const Q = F.QUESTS[id], o = Q.oferta;
    const quem = F.Escolhas.quem(o.npc);
    F.UI.dialogo({
      titulo: quem.nome, icone: '❗', quem, fechar: false,
      cabecalho: `${F.u.esc(Q.titulo)} <small>missão</small>`,
      texto: o.texto,
      opcoes: [
        { t: o.aceitar, cls: 'missao', fn: (w) => { F.UI.fechar(w); this.iniciar(id); F.Estado.aplicar({ t: 5, dep: { [Q.dep]: 2 } }); F.UI.toast('📌 MISSÃO NOVA', Q.titulo + ': ' + Q.passos[0].dica); if (depois) depois(); } },
        { t: o.recusar, fn: (w) => { F.UI.fechar(w); F.S.flags['recusou-' + id] = F.S.dia; F.Estado.aplicar({ t: 2, dep: { [Q.dep]: -3 } }); if (depois) depois(); } },
      ],
    });
  },

  // executa o passo atual de uma missão
  executar(id, depois) {
    const S = F.S, Q = F.QUESTS[id], p = this.passo(id);
    if (!p) return;
    const quemId = p.alvo.startsWith('npc:') ? p.alvo.slice(4) : null;
    const quem = F.Escolhas.quem(quemId);
    if (p.evento) {
      F.Escolhas.mostrar(p.evento, { depois: () => { if (!p.ate || p.ate(S)) this.avancar(id, undefined, depois); else if (depois) depois(); } });
      return;
    }
    const ops = p.escolhas ? F.Escolhas.opcoes(p.escolhas) : [];
    const opcoes = ops.length
      ? ops.map((o) => ({ t: o.e.t, tags: o.tags, cls: o.cls, fn: (w) => { F.UI.fechar(w); F.Escolhas.resolver(o.e, { titulo: Q.titulo, quem, depois: (prox) => this.avancar(id, prox, depois) }); } }))
      : [{ t: 'Continuar', cls: 'missao', fn: (w) => { F.UI.fechar(w); const ch = F.Estado.aplicar(Object.assign({ t: 10 }, p.fx || {})); this.avancar(id, undefined, depois, ch); } }];
    F.UI.dialogo({
      titulo: Q.titulo, icone: '📌', quem, fechar: false,
      cabecalho: `${F.u.esc(Q.titulo)} <small>${Q.tarefa ? 'tarefa' : 'missão'}</small>`,
      texto: F.texto(p.texto), opcoes,
    });
  },

  avancar(id, prox, depois, chipsAntes) {
    const S = F.S, Q = F.QUESTS[id], q = S.quests[id];
    if (!q || q.estado !== 'ativa') { if (depois) depois(); return; }
    if (prox === 'fim') return this.concluir(id, depois);
    if (prox === 'falha') return this.falhar(id, depois);
    q.passo = typeof prox === 'number' ? prox : q.passo + 1;
    if (q.passo >= Q.passos.length) return this.concluir(id, depois);
    F.UI.rastreio();
    if (chipsAntes && chipsAntes.length) F.UI.resultado({ titulo: Q.titulo, texto: '', chips: chipsAntes, depois });
    else if (depois) depois();
    F.UI.toast('📌 ' + Q.titulo, Q.passos[q.passo].dica);
  },

  concluir(id, depois) {
    const S = F.S, Q = F.QUESTS[id];
    S.quests[id].estado = 'feita';
    S.tarefasHoje = S.tarefasHoje.filter((x) => x !== id);
    const fx = Object.assign({}, Q.fim.fx || {});
    if (Q.tarefa) fx.tarefa = (fx.tarefa || 0) + 1;
    else S.cont.investigacoes++;
    const chips = F.Estado.aplicar(fx);
    F.Som.conquista();
    F.UI.resultado({ titulo: Q.tarefa ? 'Tarefa concluída' : 'Missão concluída', icone: '✔', texto: Q.fim.texto || ('"' + Q.titulo + '": feito.'), chips, depois });
  },
  falhar(id, depois) {
    const S = F.S, Q = F.QUESTS[id];
    S.quests[id].estado = 'falhou';
    S.tarefasHoje = S.tarefasHoje.filter((x) => x !== id);
    const chips = F.Estado.aplicar((Q.falha && Q.falha.fx) || { rep: -3 });
    F.UI.resultado({ titulo: 'Missão perdida', icone: '✖', texto: (Q.falha && Q.falha.texto) || 'Não deu certo. Acontece. Muito, aliás.', chips, depois });
  },

  // missões com prazo (em minutos)
  checarPrazos() {
    const S = F.S;
    for (const id of this.ativas()) {
      const Q = F.QUESTS[id], q = S.quests[id];
      if (!Q.prazo) continue;
      const passou = (S.dia - q.dia) * 24 * 60 + (S.minuto - q.inicio);
      if (passou > Q.prazo) { this.falhar(id); return true; }
    }
    return false;
  },
};

// ============================================================
//  LISTA DE MISSÕES (principais e secundárias)
// ============================================================
F.Missoes = {
  visiveis() { const S = F.S; return F.MISSOES.filter((m) => !m.quando || m.quando(S) || S.missoesFeitas[m.id]); },
  principalAtual() { const S = F.S; return this.visiveis().find((m) => m.tipo === 'principal' && !S.missoesFeitas[m.id]); },
  completa(m) { return m.objetivos.every((o) => o.v(F.S) >= o.n); },
  checar() {
    const S = F.S;
    for (const m of this.visiveis()) {
      if (S.missoesFeitas[m.id] || m.id === 'mes3') continue;
      if (m.ate && S.dia > m.ate) continue;
      if (!this.completa(m)) continue;
      S.missoesFeitas[m.id] = S.dia;
      F.Estado.aplicar(m.recompensa || {});
      F.Som.conquista();
      F.UI.toast('✅ MISSÃO CONCLUÍDA', m.titulo, 6000);
      return true;
    }
    return false;
  },
};
