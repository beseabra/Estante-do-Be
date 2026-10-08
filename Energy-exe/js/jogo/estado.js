// ============================================================
//  ESTADO DO JOGO (F.S) e a aplicação dos efeitos
// ============================================================
F.ATRIB = {
  din:  { ico: '💰', nome: 'Dinheiro' },
  rep:  { ico: '⭐', nome: 'Reputação' },
  prod: { ico: '⚡', nome: 'Produtividade' },
  est:  { ico: '😵', nome: 'Estresse', inverso: true },
  inf:  { ico: '🏢', nome: 'Influência' },
};

F.PERFIS = {
  tecnico:     { nome: '💻 Técnico', desc: 'Melhor em tarefas técnicas e automações.', ini: { prod: 15 } },
  comunicador: { nome: '🗣️ Comunicador', desc: 'Melhor em reuniões e negociação.', ini: { rep: 10 } },
  analitico:   { nome: '📊 Analítico', desc: 'Melhor com dados e problemas.', ini: { prod: 6, inf: 4 } },
  politico:    { nome: '🤝 Político', desc: 'Melhor no relacionamento com as pessoas.', ini: { inf: 10, rep: 4 } },
  sobrevivente: { nome: '☕ Sobrevivente', desc: 'Não é bom em nada, mas nunca morre.', ini: { est: -10 }, secreto: true },
};

F.Estado = {
  CHAVE: 'energyexe:save',

  novo(cfg) {
    const S = {
      versao: 1,
      nome: cfg.nome || 'Fulano(a)', look: cfg.look, perfil: cfg.perfil || 'comunicador',
      cargo: cfg.cargo || 'junior',
      din: 300, rep: 30, prod: 30, est: 15, inf: 5,
      dep: Object.fromEntries(Object.keys(F.DEPS).map((d) => [d, 0])),
      flags: {}, regras: [], conhecidos: [],
      cont: { tarefas: 0, tarefasMes: 0, reunioes: 0, automacoes: 0, quebras: 0, culpas: 0, cafes: 0, investigacoes: 0, fofocas: 0 },
      docs: 0, fama: 0,
      quests: {}, tarefasHoje: [], emails: [], agenda: [], vistos: {}, missoesFeitas: {},
      dia: 0, minuto: 8 * 60, hoje: {}, paes: 8,
      andar: 'terreo', pos: null,
    };
    S.salario = F.CARGOS[S.cargo].salario;
    const ini = F.PERFIS[S.perfil].ini;
    Object.keys(ini).forEach((k) => { S[k] += ini[k]; });
    return S;
  },

  limite(k) { return k === 'din' ? [-1e9, 1e9] : [0, 100]; },

  // aplica um conjunto de efeitos e devolve as "fichas" para mostrar
  aplicar(fx = {}) {
    const S = F.S, chips = [];
    if (!fx) return chips;
    const perf = S.perfil;
    const mult = (k, v) => {
      if (perf === 'comunicador' && k === 'rep' && v > 0) return v * 1.2;
      if (perf === 'politico' && k === 'inf' && v > 0) return v * 1.3;
      if (perf === 'tecnico' && k === 'prod' && v > 0) return v * 1.25;
      if (perf === 'analitico' && k === 'prod' && v > 0) return v * 1.15;
      if (perf === 'sobrevivente' && k === 'est' && v > 0) return v * 0.8;
      return v;
    };
    for (const k of Object.keys(F.ATRIB)) {
      if (!fx[k]) continue;
      const antes = S[k];
      const [a, b] = this.limite(k);
      S[k] = F.u.clamp(S[k] + mult(k, fx[k]), a, b);
      const d = Math.round(S[k] - antes);
      if (!d) continue;
      const info = F.ATRIB[k];
      const bom = info.inverso ? d < 0 : d > 0;
      chips.push({ txt: (d > 0 ? '+' : '') + (k === 'din' ? F.u.dinheiro(d).replace('R$ -', '-R$ ') : d) + ' ' + info.ico + ' ' + info.nome, cls: bom ? 'bom' : 'ruim' });
      F.UI.piscarStat(k);
    }
    if (fx.repMin) S.rep = Math.max(S.rep, fx.repMin);
    if (fx.dep) {
      for (const [d, v] of Object.entries(fx.dep)) {
        const vv = perf === 'politico' && v > 0 ? v * 1.25 : v;
        S.dep[d] = F.u.clamp((S.dep[d] || 0) + vv, -100, 100);
        if (Math.abs(v) >= 5) chips.push({ txt: (v > 0 ? '▲ ' : '▼ ') + F.DEPS[d], cls: v > 0 ? 'bom' : 'ruim' });
        if (S.dep[d] <= -40 && !S.flags['inimigo-' + d]) {
          S.flags['inimigo-' + d] = true;
          chips.push({ txt: '🔥 ' + F.DEPS[d] + ' declarou guerra a você', cls: 'ruim' });
        }
        if (S.dep[d] >= 40 && !S.flags['amigo-' + d]) {
          S.flags['amigo-' + d] = true;
          chips.push({ txt: '💛 ' + F.DEPS[d] + ' adora você', cls: 'bom' });
        }
      }
    }
    if (fx.t) this.tempo(fx.t);
    if (fx.aprende) this.aprender(fx.aprende, chips);
    if (fx.flag) S.flags[fx.flag] = true;
    if (fx.flags) fx.flags.forEach((f) => { if (f[0] === '-') delete S.flags[f.slice(1)]; else S.flags[f] = true; });
    if (fx.conta) Object.entries(fx.conta).forEach(([k, v]) => { S.cont[k] = (S.cont[k] || 0) + v; });
    if (fx.tarefa) { S.cont.tarefas += fx.tarefa; S.cont.tarefasMes += fx.tarefa; chips.push({ txt: '✔ Tarefa concluída', cls: 'especial' }); }
    if (fx.automacao) { S.cont.automacoes += fx.automacao; chips.push({ txt: '🤖 Automação funcionando (' + S.cont.automacoes + ')', cls: 'especial' }); }
    if (fx.docs) { S.docs = Math.max(0, S.docs + fx.docs); if (fx.docs > 0) chips.push({ txt: '+' + fx.docs + ' 📄 documentos', cls: 'neutro' }); }
    if (fx.fama) { S.fama += fx.fama; chips.push({ txt: '+' + fx.fama + ' 📣 fama', cls: 'especial' }); }
    if (fx.salario) { S.salario += fx.salario; chips.push({ txt: '+' + F.u.dinheiro(fx.salario) + ' de salário', cls: 'bom' }); }
    if (fx.paes) S.paes = Math.max(0, S.paes + fx.paes);
    if (fx.extra) fx.extra.forEach((e) => chips.push({ txt: e, cls: 'especial' }));
    if (fx.desbloqueia === 'rh' && !S.flags.rhAberto) { this.abrirRH(); chips.push({ txt: '🚪 RH desbloqueado', cls: 'especial' }); }
    if (fx.quest) { if (F.Quests.iniciar(fx.quest)) chips.push({ txt: '📌 Missão nova: ' + F.QUESTS[fx.quest].titulo, cls: 'especial' }); }
    if (fx.tarefaNova) { const id = F.Dia.novaTarefa(); if (id) chips.push({ txt: '📌 Tarefa nova: ' + F.QUESTS[id].titulo, cls: 'especial' }); }
    if (fx.reuniao) { const r = F.Agenda.convidar(fx.reuniao); if (r) chips.push({ txt: '📅 ' + F.REUNIOES[fx.reuniao].titulo + ' · ' + r, cls: 'especial' }); }
    if (fx.email) F.Emails.receber(fx.email);
    if (fx.fim) F.Dia.agendarFim(fx.fim);
    if (fx.fimDia) F.Dia.fimPendente = true;
    F.UI.hud();
    F.UI.rastreio();
    return chips;
  },

  aprender(id, chips) {
    const S = F.S;
    if (!F.REGRAS[id] || S.regras.includes(id)) return false;
    S.regras.push(id);
    const r = F.REGRAS[id];
    if (chips) chips.push({ txt: '📘 Regra #' + r.n + ' descoberta', cls: 'especial' });
    F.UI.toast('📘 REGRA CORPORATIVA #' + r.n, r.t);
    return true;
  },

  abrirRH() {
    const S = F.S;
    S.flags.rhAberto = true;
    const m = F.MAPAS.n1.moveis.find((x) => x.id === 'porta-rh');
    if (m) { m.solido = false; m.tipo = 'tapete'; m.cor = '#7d4a55'; m.texto = 'RH'; m.acao = null; F.Mundo.redesenhar('n1'); }
  },

  tempo(min) {
    const S = F.S;
    S.minuto += min;
    S.hoje.trabalhado = (S.hoje.trabalhado || 0) + min;
    // estresse sobe devagar com o dia (mais ainda depois das 18h)
    S.hoje.acEst = (S.hoje.acEst || 0) + min * (S.minuto > 18 * 60 ? 0.06 : 0.025);
    if (S.hoje.acEst >= 1) { const v = Math.floor(S.hoje.acEst); S.hoje.acEst -= v; S.est = F.u.clamp(S.est + v, 0, 100); }
  },

  sabe(id) { return F.S.regras.includes(id); },

  // ---------- salvar ----------
  salvar() {
    try {
      const S = F.S;
      S.andar = F.Mundo.andar;
      S.pos = { x: F.Mundo.jogador.x / F.T, y: (F.Mundo.jogador.y - 10) / F.T };
      localStorage.setItem(this.CHAVE, JSON.stringify(S));
      return true;
    } catch (e) { return false; }
  },
  temSave() { try { return !!localStorage.getItem(this.CHAVE); } catch (e) { return false; } },
  carregar() {
    try { const s = JSON.parse(localStorage.getItem(this.CHAVE)); return s && s.versao === 1 ? s : null; } catch (e) { return null; }
  },
  apagar() { try { localStorage.removeItem(this.CHAVE); } catch (e) { /* tudo bem */ } },
  finaisVistos() { try { return JSON.parse(localStorage.getItem('energyexe:finais') || '[]'); } catch (e) { return []; } },
  marcarFinal(id) { try { const v = this.finaisVistos(); if (!v.includes(id)) v.push(id); localStorage.setItem('energyexe:finais', JSON.stringify(v)); } catch (e) { /* tudo bem */ } },
};
