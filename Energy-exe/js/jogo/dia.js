// ============================================================
//  O DIA: manhã, relógio, fim do expediente, noite, avaliação
//  e os painéis do menu Iniciar
// ============================================================
F.Dia = {
  fimPendente: false,
  finalPendente: null,
  _hud: 0, _miss: 0,

  // ---------- começar ----------
  comecar(S, carregado) {
    F.S = S;
    F.Pessoas.vivos = {};
    F.Interacao.limparMarcas();
    if (S.flags.rhAberto) F.Estado.abrirRH();
    F.Mundo.jogador = { x: 0, y: 0, dir: 'baixo', passo: 0, look: S.look, caminho: null };
    document.body.classList.remove('desktop');
    F.Titulo.esconder();
    F.UI.mostrarBarra(true);
    this.finalPendente = null; this.fimPendente = false;
    if (carregado && S.dia > 0) {
      F.Mundo.irPara(S.andar || 'terreo', S.pos || null);
      F.UI.hud(); F.UI.local(); F.UI.rastreio();
      F.UI.toast('💾 JOGO CARREGADO', F.u.nomeDia(S.dia) + ', ' + F.u.hora(S.minuto));
    } else this.novoDia();
    F.Jogo.cena = 'jogo';
  },

  novoDia() {
    const S = F.S;
    S.dia++;
    S.minuto = 8 * 60;
    S.hoje = { inicio: { din: S.din, rep: S.rep, prod: S.prod, est: S.est, inf: S.inf, tarefas: S.cont.tarefas, reunioes: S.cont.reunioes, regras: S.regras.length }, humorChefe: F.u.int(-1, 1), zonas: {}, eventos: 0, paesComidos: {} };
    S.paes = 8;
    delete S.flags.almocou;
    F.Agenda.perdidas();
    F.Pessoas.vivos = {};
    F.Mundo.irPara('terreo', F.MAPAS.terreo.entrada);
    F.Mundo.jogador.dir = 'cima';
    this.agendarEmails();
    // reuniões fixas e convites
    if (S.dia > 1 && S.dia % 5 === 1) F.Agenda.convidar('status', S.dia, 9 * 60 + 30);
    else if (S.dia >= 2 && Math.random() < 0.35) {
      const id = F.u.pick(['kickoff', 'posmortem', 'brainstorm', 'alinhamento']);
      F.Agenda.convidar(id, S.dia, F.u.pick([11 * 60, 15 * 60]));
    }
    F.UI.hud(); F.UI.local(); F.UI.rastreio();
    if (S.flags.automacaoTotal && !S.flags.finalAuto) { S.flags.finalAuto = true; this.manhaAutomacao(); return; }
    this.cartaoDoDia();
  },

  cartaoDoDia() {
    const S = F.S, mes = F.u.mesDe(S.dia);
    const frases = ['O elevador está funcionando. Por enquanto.', 'Previsão do tempo: 40% de chance de reunião.', 'O café acabou às 8h01.', 'Hoje é um ótimo dia para alinhar.', 'A catraca acordou de bom humor.', 'Três pessoas já perguntaram se você viu o e-mail.', 'Nenhum caminhão esperando. Ainda.'];
    const dias = S.dia % 10 === 0 ? '\n\n📊 Hoje é o último dia do mês: avaliação de desempenho no fim do expediente.' : '';
    const reun = S.agenda.filter((a) => a.dia === S.dia && !a.feito).map((a) => `📅 ${F.u.hora(a.min)} ${F.REUNIOES[a.id].titulo}`).join('\n');
    const texto = `Mês ${mes} de ${F.MESES} · ${F.CARGOS[S.cargo].nome}\n\n${F.u.pick(frases)}${reun ? '\n\n' + reun : ''}${dias}`;
    const ir = () => {
      // tarefas do dia chegam por e-mail
      const n = S.dia === 1 ? 1 : (Math.random() < 0.5 ? 2 : 1);
      const novas = [];
      for (let i = 0; i < n && S.tarefasHoje.length < 3; i++) { const id = this.novaTarefa(true); if (id) novas.push(id); }
      if (novas.length) F.Emails.receber('tarefas', { de: 'Marcos (Operações Integradas)', assunto: 'Tarefas de hoje', corpo: 'Bom dia! Precisamos entregar:\n\n' + novas.map((id) => '• ' + F.QUESTS[id].titulo + '\n   (' + F.QUESTS[id].passos[0].dica + ')').join('\n') + '\n\nVamos alinhar.\nMarcos' });
      if (S.dia === 1) F.UI.toast('💡 DICA', F.Input.celular ? 'Toque no chão para andar e numa pessoa para conversar. O ⚡ Iniciar abre o menu.' : 'Setas/WASD para andar, E para conversar e usar coisas, Tab abre o menu Iniciar.', 9000);
    };
    const opcoes = [{ t: 'Bater o ponto.', cls: 'missao', fn: (w) => { F.UI.fechar(w); ir(); } }];
    if (S.flags.homeoffice && S.dia > 1) opcoes.push({ t: 'Trabalhar de casa hoje.', fn: (w) => { F.UI.fechar(w); this.homeOffice(); } });
    F.UI.dialogo({ titulo: F.u.nomeDia(S.dia), icone: '☀', fechar: false, cabecalho: `${F.u.esc(F.u.nomeDia(S.dia))} <small>08:00</small>`, texto, opcoes });
  },

  homeOffice() {
    const S = F.S;
    const reun = S.agenda.filter((a) => a.dia === S.dia && !a.feito);
    reun.forEach((a) => { a.feito = true; });
    const fx = { est: -12, rep: -2, prod: 3, conta: { reunioes: reun.length }, t: 9 * 60 };
    if (S.tarefasHoje.length === 0) fx.tarefa = 1;
    const chips = F.Estado.aplicar(fx);
    F.UI.resultado({ titulo: 'Home office', icone: '🏠', texto: F.u.pick(['Você trabalha de pijama da cintura para baixo. Ninguém sabe. Produtividade alta, estresse baixo.', 'O gato senta no teclado durante a call. Foi o ponto alto da reunião.', 'Você descobre que dá para trabalhar sem ouvir "cinco minutinhos". Uma revelação.']) + (reun.length ? `\n\nVocê participou de ${reun.length} reunião(ões) com a câmera desligada.` : ''), chips, depois: () => this.fimDoDia() });
  },

  manhaAutomacao() {
    F.UI.resultado({ titulo: F.u.nomeDia(F.S.dia), icone: '🤖', texto: 'Você chega e encontra todas as suas tarefas feitas. Por você. Quer dizer, pelas suas automações. O Marcos para na sua mesa: "Sabe que eu não sei mais o que você faz? Mas os números estão ótimos."\n\nO RH te chama para conversar sobre um cargo novo.', depois: () => this.agendarFim('automacao') });
  },

  agendarEmails() {
    const S = F.S;
    const lista = [];
    let sorteados = 0;
    for (const e of F.EMAILS) {
      const c = e.chega;
      if (!c || (c.dia === undefined && c.chance === undefined)) continue;
      if (c.dia !== undefined) { if (c.dia === S.dia) lista.push({ id: e.id, min: c.min || 9 * 60 }); continue; }
      const chave = 'email-' + e.id;
      if (S.vistos[chave] !== undefined && (c.cd === undefined || S.dia - S.vistos[chave] < c.cd)) continue;
      if (c.cond && !c.cond(S)) continue;
      if (c.chance < 1 && (sorteados >= 2 || Math.random() > c.chance)) continue;
      if (c.chance < 1) sorteados++;
      lista.push({ id: e.id, min: c.min || F.u.int(9 * 60, 16 * 60 + 30) });
    }
    S.hoje.emails = lista;
  },

  novaTarefa(silencioso) {
    const S = F.S;
    const livres = F.TAREFAS_POOL.filter((id) => !(S.quests[id] && S.quests[id].estado === 'ativa') && (!S.quests[id] || S.dia - S.quests[id].dia >= 3));
    if (!livres.length) return null;
    const id = F.u.pick(livres);
    if (!F.Quests.iniciar(id)) return null;
    S.tarefasHoje.push(id);
    if (!silencioso) F.UI.toast('📌 TAREFA NOVA', F.QUESTS[id].titulo);
    return id;
  },

  agendarFim(id) { if (!this.finalPendente || id === 'demissao') this.finalPendente = id; },

  // ---------- quadro a quadro (só quando nenhuma janela está aberta) ----------
  update(dt) {
    const S = F.S;
    if (this.finalPendente) { const id = this.finalPendente; this.finalPendente = null; F.Fim.mostrar(id); return; }
    if (this.fimPendente) { this.fimPendente = false; this.fimDoDia(); return; }

    F.Estado.tempo(dt / F.RITMO);
    this._hud += dt;
    if (this._hud > 0.3) { this._hud = 0; F.UI.hud(); }

    // limites
    if (S.rep <= 0) {
      if (S.perfil === 'sobrevivente') { S.rep = 3; F.UI.toast('☕ SOBREVIVENTE', 'Sua reputação chegou a zero. Ninguém percebeu.'); }
      else { this.agendarFim('demissao'); return; }
    }
    if (S.est >= 100) {
      if (S.perfil === 'sobrevivente') { S.est = 97; F.UI.toast('☕ SOBREVIVENTE', 'Você não sabe como, mas continua de pé.'); }
      else { this.agendarFim('modo-aviao'); return; }
    }

    // e-mails do dia
    const em = S.hoje.emails && S.hoje.emails.find((e) => !e.ok && S.minuto >= e.min);
    if (em) { em.ok = true; S.vistos['email-' + em.id] = S.dia; F.Emails.receber(em.id); }

    // reuniões
    const a = F.Agenda.agora();
    if (a) { F.Reuniao.avisar(a); return; }
    if (F.Quests.checarPrazos()) return;

    // o pão de queijo vai sumindo (mas o último fica para você decidir)
    const h = Math.floor(S.minuto / 30);
    if (!S.hoje.paesComidos[h] && S.minuto > 9 * 60 + 30 && S.minuto < 16 * 60) {
      S.hoje.paesComidos[h] = true;
      if (S.paes > 1 && Math.random() < 0.6) S.paes = Math.max(1, S.paes - F.u.int(1, 2));
    }
    // almoço
    if (!S.flags.almocou && !S.hoje.fome && S.minuto >= 14 * 60) { S.hoje.fome = true; F.Estado.aplicar({ est: 8 }); F.UI.toast('🍽 FOME', 'Você esqueceu de almoçar. A copa fica no 1º andar.'); }
    if (!S.hoje.avisoAlmoco && S.minuto >= 12 * 60) { S.hoje.avisoAlmoco = true; F.UI.toast('🍱 12:00', 'Hora do almoço. Opcional, como tudo aqui.'); }

    // fim do expediente
    if (!S.hoje.aviso18 && S.minuto >= 18 * 60) { S.hoje.aviso18 = true; this.perguntar18(); return; }
    if (S.minuto >= 20 * 60) {
      F.UI.resultado({ titulo: '20:00', icone: '🌙', texto: 'O segurança apaga as luzes do andar. "Vai pra casa!", ele grita, carinhosamente.', depois: () => this.fimDoDia() });
      return;
    }

    this._miss += dt;
    if (this._miss > 1.5) { this._miss = 0; if (F.Missoes.checar()) F.UI.rastreio(); }
  },

  perguntar18() {
    F.UI.dialogo({
      titulo: '18:00', icone: '🌇', fechar: false, cabecalho: 'Fim do expediente. <small>18:00</small>',
      texto: 'O expediente acabou. Metade do andar já foi embora. O Wagner, não.',
      opcoes: [
        { t: 'Ir para casa.', cls: 'missao', fn: (w) => { F.UI.fechar(w); this.fimDoDia(); } },
        { t: 'Fazer hora extra (até as 20h, mais estresse).', fn: (w) => { F.UI.fechar(w); F.Estado.aplicar({ rep: 2 }); F.UI.toast('🌙 HORA EXTRA', 'O estresse sobe mais rápido depois das 18h. Às 20h, o segurança apaga a luz.'); } },
      ],
    });
  },

  entrouZona(z) {
    const S = F.S;
    if (!S || F.UI.aberta() || F.Jogo.cena !== 'jogo') return;
    if (z.id === 'operacoes' && !S.flags.viuMesa) { S.flags.viuMesa = true; F.UI.toast('🖥 OPERAÇÕES INTEGRADAS', 'Sua mesa é a primeira, no canto esquerdo. O computador abre e-mails, trabalho e automações.'); }
    if (S.hoje.zonas[z.id] || S.hoje.eventos >= 4) return;
    S.hoje.zonas[z.id] = true;
    const cands = F.EVENTOS.filter((e) => e.g === 'zona' && e.alvo === z.id && F.Escolhas.disponivel(e));
    for (const ev of F.u.shuffle(cands)) {
      if (Math.random() < (ev.chance || 0.4)) { S.hoje.eventos++; F.Escolhas.mostrar(ev); return; }
    }
  },

  sair() {
    const S = F.S;
    const cedo = S.minuto < 17 * 60;
    F.UI.dialogo({
      titulo: 'Saída', icone: '🚪', cabecalho: (cedo ? 'Ir embora agora?' : 'Encerrar o dia?') + ` <small>${F.u.hora(S.minuto)}</small>`,
      texto: cedo ? `Ainda são ${F.u.hora(S.minuto)}. Sair cedo pega mal. Mas pega bem para a sua saúde mental.` : 'Mais um dia sobrevivido na Voltagem S.A.',
      opcoes: [
        { t: cedo ? 'Ir mesmo assim.' : 'Ir para casa.', cls: 'missao', fn: (w) => { F.UI.fechar(w); if (cedo) F.Estado.aplicar({ rep: -5, est: -6 }); this.fimDoDia(); } },
        { t: 'Ainda não.', fn: (w) => F.UI.fechar(w) },
      ],
    });
  },

  // ---------- fim do dia ----------
  fimDoDia() {
    const S = F.S;
    F.UI.fecharTudo();
    const pend = S.tarefasHoje.filter((id) => S.quests[id] && S.quests[id].estado === 'ativa');
    if (pend.length) F.Estado.aplicar({ rep: -2 * pend.length });
    const i = S.hoje.inicio;
    const linha = (k) => {
      const d = Math.round(S[k] - i[k]);
      const info = F.ATRIB[k];
      const cor = d === 0 ? '' : ((info.inverso ? d < 0 : d > 0) ? 'color:var(--verde)' : 'color:var(--vermelho)');
      return `<tr><td>${info.ico} ${info.nome}</td><td>${k === 'din' ? F.u.dinheiro(S.din) : Math.round(S[k])}</td><td style="${cor}">${d > 0 ? '+' : ''}${d === 0 ? '·' : (k === 'din' ? F.u.dinheiro(d) : d)}</td></tr>`;
    };
    const fez = S.cont.tarefas - i.tarefas, reu = S.cont.reunioes - i.reunioes, reg = S.regras.length - i.regras;
    const corpo = `<table class="tabela resumo-dia">${['din', 'rep', 'prod', 'est', 'inf'].map(linha).join('')}</table>
      <h3 style="font-size:14px;margin:12px 0 4px">Hoje</h3>
      <p>✔ ${fez} tarefa(s) concluída(s) · 📅 ${reu} reunião(ões) · 📘 ${reg} regra(s) nova(s)</p>
      ${pend.length ? `<p style="color:var(--vermelho);margin-top:6px">O Marcos perguntou de ${pend.length} tarefa(s) que ficaram para amanhã.</p>` : ''}
      ${S.hoje.cafes ? `<p style="margin-top:6px">☕ ${S.hoje.cafes} café(s).</p>` : ''}`;
    F.UI.janela({ titulo: 'Relatório do dia · ' + F.u.nomeDia(S.dia), icone: '📋', corpo, fechar: false, botoes: [{ t: 'Ir para casa', primario: true, fn: () => this.noite() }] });
  },

  noite() {
    const S = F.S;
    const casa = F.EVENTOS.filter((e) => e.g === 'casa' && F.Escolhas.disponivel(e));
    let ev = casa.find((e) => e.id === 'fim-de-semana' && S.dia % 5 === 0);
    if (!ev) for (const e of F.u.shuffle(casa.filter((x) => x.id !== 'fim-de-semana'))) { if (Math.random() < (e.chance || 0.3)) { ev = e; break; } }
    const dormir = () => {
      F.Estado.aplicar({ est: -12 });
      if (this.finalPendente) { const id = this.finalPendente; this.finalPendente = null; F.Fim.mostrar(id); return; }
      if (S.dia % F.DIAS_POR_MES === 0) this.avaliacao(() => this.proximo());
      else this.proximo();
    };
    if (ev) F.Escolhas.mostrar(ev, { depois: dormir }); else dormir();
  },

  proximo() {
    const S = F.S;
    if (this.finalPendente) { const id = this.finalPendente; this.finalPendente = null; F.Fim.mostrar(id); return; }
    if (S.dia >= F.DIAS_POR_MES * F.MESES) { this.final(); return; }
    this.novoDia();
    F.Estado.salvar();
  },

  // ---------- avaliação de desempenho (fim do mês) ----------
  avaliacao(depois) {
    const S = F.S, mes = F.u.mesDe(S.dia);
    const pago = F.Estado.aplicar({ din: S.salario });
    const principal = F.MISSOES.find((m) => m.tipo === 'principal' && m.ate === S.dia);
    let aviso = '';
    if (principal && principal.id !== 'mes3' && !S.missoesFeitas[principal.id]) {
      if (F.Missoes.completa(principal)) { S.missoesFeitas[principal.id] = S.dia; F.Estado.aplicar(principal.recompensa || {}); }
      else { F.Estado.aplicar({ rep: -8 }); aviso = `<p style="color:var(--vermelho)">Missão do mês não concluída: "${F.u.esc(principal.titulo)}" (−8 ⭐)</p>`; }
    }
    const nota = Math.round(F.Carreira.nota(S));
    const nivel = F.Carreira.nivel(S);
    const corte = F.Carreira.corte[nivel + 1];
    const opcoes = F.Carreira.opcoes(S);
    const sobe = corte !== undefined && nota >= corte && opcoes.length;
    const coment = nota >= 70 ? 'Excelente. Precisamos de mais gente assim. Vamos alinhar o seu futuro.' : nota >= 50 ? 'Bom trabalho. Precisamos entregar mais, mas bom trabalho.' : nota >= 35 ? 'Ok. Vamos alinhar algumas expectativas.' : 'Você tem cinco minutinhos? Precisamos conversar sobre o seu desempenho.';
    const faltam = !sobe && corte !== undefined ? (nota < corte ? `Faltaram ${corte - nota} pontos para a próxima promoção.` : 'A nota dava, mas falta um requisito: ' + F.CARGOS[S.cargo].prox.map((id) => F.CARGOS[id].nome + (F.CARGOS[id].reqTxt ? ' (' + F.CARGOS[id].reqTxt + ')' : '')).join(' ou ') + '.') : '';
    S.cont.tarefasMes = 0;
    const corpo = `<p><b>Mês ${mes}</b> · ${F.u.esc(F.CARGOS[S.cargo].nome)}</p>
      <div class="atrib"><span>📊</span><span>Nota</span><span class="afundado"><i style="width:${F.u.clamp(nota, 0, 100)}%"></i></span><span>${nota}</span></div>
      <p style="font-size:13px;color:#333">Cálculo: reputação, produtividade, influência e tarefas do mês. Estresse acima de 70 desconta.</p>
      <p style="margin-top:10px"><b>Marcos:</b> "${coment}"</p>
      ${aviso}
      <p style="margin-top:10px">💰 Salário do mês depositado: ${F.u.dinheiro(S.salario)}</p>
      ${sobe ? '<p class="conquista">🎉 Você vai ser promovido(a)!</p>' : faltam ? `<p style="margin-top:8px">${faltam}</p>` : ''}`;
    F.UI.janela({ titulo: 'Avaliação de desempenho · Mês ' + mes, icone: '📊', corpo, fechar: false,
      botoes: [{ t: sobe ? 'Ver a promoção' : 'Continuar', primario: true, fn: () => { if (sobe) this.promover('Marcos: "Parabéns. Merecido. Agora precisamos entregar ainda mais."', depois); else depois(); } }] });
  },

  promover(texto, depois) {
    const S = F.S;
    const ops = F.Carreira.opcoes(S);
    const aplicar = (id) => {
      const c = F.CARGOS[id];
      S.cargo = id;
      S.salario = c.salario + (S.flags.aumento ? 500 : 0);
      const chips = F.Estado.aplicar({ rep: 5, inf: 6, est: -5, extra: ['🎉 Novo cargo: ' + c.nome, '💰 Novo salário: ' + F.u.dinheiro(S.salario)] });
      F.Som.conquista();
      F.UI.resultado({ titulo: 'Promoção', icone: '🎉', texto: texto + '\n\nSeu novo cargo: ' + c.nome + '.', chips, depois });
    };
    if (ops.length === 1) return aplicar(ops[0]);
    const desc = { gestao: 'Trilha de gestão: mais reuniões, mais influência.', tecnica: 'Trilha técnica: mais problemas difíceis, menos reuniões.', alternativa: 'Caminho alternativo: ninguém entende, mas funciona.' };
    F.UI.dialogo({
      titulo: 'Promoção', icone: '🎉', fechar: false, cabecalho: 'Escolha o seu caminho <small>carreira</small>',
      texto: 'O Marcos e a Patrícia apresentam as opções. A Patrícia está sorrindo, mas é um sorriso bom desta vez.',
      opcoes: ops.map((id) => ({ t: F.CARGOS[id].nome, tags: `<span class="tag custo">${desc[F.CARGOS[id].trilha] || ''}</span>`, cls: 'missao', fn: (w) => { F.UI.fechar(w); aplicar(id); } })),
    });
  },

  // ---------- o fim do trimestre ----------
  final() {
    const S = F.S;
    const c = F.CARGOS[S.cargo];
    const todos = Object.keys(F.DEPS).every((d) => S.dep[d] >= 15);
    let id = 'sobrevivente';
    if (c.nivel >= 3 && S.flags.aumento && S.est <= 40 && S.rep >= 80 && todos) id = 'secreto';
    else if (c.trilha === 'gestao' && c.nivel >= 4) id = 'promocao';
    else if (S.cargo === 'especialistaSr') id = 'tecnico';
    else if (S.cargo === 'excel') id = 'excel';
    else if (S.flags.aumento) id = 'aumento';
    F.Fim.mostrar(id);
  },
};

// ============================================================
//  PAINÉIS DO MENU INICIAR
// ============================================================
F.Paineis = {
  missoes() {
    const S = F.S;
    const bloco = (m) => {
      const feita = S.missoesFeitas[m.id];
      return `<div class="afundado missao-bloco ${feita ? 'concluida' : ''}"><b>${feita ? '✅ ' : ''}${F.u.esc(m.titulo)}</b><ul>${m.objetivos.map((o) => `<li class="${o.v(S) >= o.n ? 'feito' : ''}">${F.u.esc(o.t)} (${Math.min(o.v(S), o.n)}/${o.n})</li>`).join('')}</ul></div>`;
    };
    const vis = F.Missoes.visiveis();
    const quests = F.Quests.ativas().map((id) => { const Q = F.QUESTS[id]; return `<div class="afundado missao-bloco"><b>${Q.tarefa ? '✔ ' : '🔎 '}${F.u.esc(Q.titulo)}</b><ul><li>${F.u.esc(Q.passos[S.quests[id].passo].dica)}</li></ul></div>`; }).join('') || '<p class="vazio">Nada em andamento. Converse com as pessoas (quem tem "!" tem algo para você).</p>';
    const corpo = `<div class="lista-missoes"><h3>Missão principal</h3>${vis.filter((m) => m.tipo === 'principal').map(bloco).join('')}
      <h3>Em andamento (tarefas e investigações)</h3>${quests}
      <h3>Missões secundárias</h3>${vis.filter((m) => m.tipo === 'secundaria').map(bloco).join('')}</div>`;
    F.UI.janela({ titulo: 'Missões', icone: '📋', corpo, botoes: [{ t: 'Fechar' }] });
  },
  agenda() {
    const S = F.S;
    const prox = S.agenda.filter((a) => !a.feito).sort((a, b) => a.dia - b.dia || a.min - b.min);
    const corpo = prox.length ? `<table class="tabela"><tr><th>Quando</th><th>Reunião</th><th>Onde</th></tr>${prox.map((a) => `<tr><td>${a.dia === S.dia ? 'Hoje' : 'Dia ' + a.dia} ${F.u.hora(a.min)}</td><td>${F.u.esc(F.REUNIOES[a.id].titulo)}</td><td>${F.Reuniao.nomeSala(F.REUNIOES[a.id].sala)}</td></tr>`).join('')}</table>` : '<p class="vazio">Agenda livre. Isso nunca acontece. Aproveite.</p>';
    F.UI.janela({ titulo: 'Agenda', icone: '📅', corpo: corpo + `<p style="margin-top:10px;font-size:13px">Reuniões já feitas: ${S.cont.reunioes}. Dica: entre na sala da reunião e use a mesa para começar antes do aviso.</p>`, botoes: [{ t: 'Fechar' }] });
  },
  manual() {
    const S = F.S;
    const todas = Object.entries(F.REGRAS).sort((a, b) => a[1].n - b[1].n);
    const corpo = `<p style="margin-bottom:8px">${S.regras.length} de ${todas.length} regras descobertas. As regras destravam escolhas novas (📘).</p>` + todas.map(([id, r]) => (S.regras.includes(id)
      ? `<div class="afundado regra"><b>#${String(r.n).padStart(2, '0')}</b><span>${F.u.esc(r.t)}</span></div>`
      : `<div class="afundado regra oculta"><b>#${String(r.n).padStart(2, '0')}</b><span>??? (converse com as pessoas)</span></div>`)).join('');
    F.UI.janela({ titulo: 'Manual não oficial da Voltagem S.A.', icone: '📘', corpo, botoes: [{ t: 'Fechar' }] });
  },
  contatos() {
    const S = F.S;
    const rel = (v) => { const p = Math.abs(v) / 2; return `<span class="relacao"><i class="${v >= 0 ? 'pos' : 'neg'}" style="width:${p}%"></i></span> ${v > 0 ? '+' : ''}${Math.round(v)}`; };
    const deps = Object.keys(F.DEPS).map((d) => `<tr><td>${F.DEPS[d]}</td><td>${rel(S.dep[d] || 0)}</td><td>${S.flags['inimigo-' + d] ? '🔥' : S.flags['amigo-' + d] ? '💛' : ''}</td></tr>`).join('');
    const pessoas = S.conhecidos.map((id) => F.npc(id)).filter(Boolean).map((n) => `<tr><td>${F.u.esc(n.nome)}</td><td>${F.u.esc(n.cargo)}</td><td>${F.DEPS[n.dep]}</td></tr>`).join('');
    const corpo = `<div class="painel"><h3>Departamentos (como eles te veem)</h3><table class="tabela">${deps}</table>
      <h3>Pessoas que você conhece (${S.conhecidos.length} de ${F.NPCS.length})</h3>${pessoas ? `<table class="tabela">${pessoas}</table>` : '<p class="vazio">Ninguém ainda. Vá conversar!</p>'}</div>`;
    F.UI.janela({ titulo: 'Contatos', icone: '👥', corpo, botoes: [{ t: 'Fechar' }] });
  },
  carreira() {
    const S = F.S;
    const atual = S.cargo;
    const trilha = F.Carreira.trilha(S);
    const idx = trilha.indexOf(atual);
    const tr = trilha.map((id, i) => `<span class="${id === atual ? 'atual' : i < idx ? 'passado' : ''}">${F.u.esc(F.CARGOS[id].nome)}</span>`).join('<i>→</i>');
    const atr = ['rep', 'prod', 'est', 'inf'].map((k) => `<div class="atrib ${k}"><span>${F.ATRIB[k].ico}</span><span>${F.ATRIB[k].nome}</span><span class="afundado"><i style="width:${S[k]}%"></i></span><span>${Math.round(S[k])}</span></div>`).join('');
    const nota = Math.round(F.Carreira.nota(S)), corte = F.Carreira.corte[F.Carreira.nivel(S) + 1];
    const corpo = `<div class="painel"><h3>Cargo</h3><p><b>${F.u.esc(F.CARGOS[atual].nome)}</b> · salário ${F.u.dinheiro(S.salario)} · ${F.PERFIS[S.perfil].nome}</p>
      <div class="trilha">${tr}</div>
      <p>Nota atual da avaliação: <b>${nota}</b>${corte !== undefined ? ` (próxima promoção a partir de ${corte})` : ' (topo da trilha)'}. Próxima avaliação: dia ${Math.ceil(S.dia / 10) * 10}.</p>
      <h3>Atributos</h3>${atr}<p>💰 Dinheiro: ${F.u.dinheiro(S.din)}</p>
      <h3>Números</h3><p>✔ ${S.cont.tarefas} tarefas · 🔎 ${S.cont.investigacoes} investigações · 📅 ${S.cont.reunioes} reuniões · 🤖 ${S.cont.automacoes} automações (${S.cont.quebras} quebraram) · 📣 fama ${S.fama} · 📄 ${S.docs} documentos · ☕ ${S.cont.cafes} cafés</p></div>`;
    F.UI.janela({ titulo: 'Carreira e atributos', icone: '📈', corpo, botoes: [{ t: 'Fechar' }] });
  },
  salvar() {
    const ok = F.Estado.salvar();
    F.UI.toast(ok ? '💾 SALVO' : '⚠ NÃO DEU PARA SALVAR', ok ? 'O jogo também salva sozinho toda manhã.' : 'O navegador bloqueou o armazenamento.');
  },
  sair() {
    F.UI.dialogo({ titulo: 'Sair', icone: '⏻', texto: 'Voltar para a área de trabalho? O jogo será salvo.', opcoes: [
      { t: 'Salvar e sair.', fn: (w) => { F.UI.fechar(w); F.Estado.salvar(); F.Titulo.mostrar(); } },
      { t: 'Cancelar.', fn: (w) => F.UI.fechar(w) },
    ] });
  },
};
