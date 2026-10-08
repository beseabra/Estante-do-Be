// ============================================================
//  CONVERSAS (F.Interacao), ELEVADOR e o SEU COMPUTADOR (F.Mesa)
// ============================================================
F.FALAS_BRAVAS = ['Ah. É você.', 'Estou ocupado(a). Para sempre.', 'Meu setor mandou dizer que não está.', 'Pode falar. Rápido.'];
F.FOFOCAS = [
  { t: 'Dizem que o Gustavo tem uma reunião marcada consigo mesmo toda sexta. Para alinhar.' },
  { t: 'O Carlos, de Compras, está de férias. Tudo que depende dele parou. Tudo.', aprende: 'carlos-ferias', se: (S) => S.regras.includes('carlos-aprova') },
  { t: 'Quem aprova as compras é o Carlos. Ninguém sabe por que é sempre ele.', aprende: 'carlos-aprova' },
  { t: 'O Wagner dorme aqui. Eu já vi o travesseiro dele na gaveta.' },
  { t: 'O Davi ganha menos que a máquina de café e sabe mais que todos nós juntos.', aprende: 'estagiario' },
  { t: 'A Diretoria quer cortar o pão de queijo. Ou não. Mas vai.' },
  { t: 'O Rodrigo prometeu um painel para ontem. De novo. Prometer para sexta é prometer para segunda.', aprende: 'sexta' },
  { t: 'Decisão importante aqui sai no happy hour. Ata, nunca.', aprende: 'happy-hour' },
  { t: 'A Patrícia, do RH, está sempre sorrindo. Sempre. Inclusive nas demissões.', aprende: 'rh-educado' },
  { t: 'Tem gente que diz que o Fiscal é um mito. Que ninguém nunca viu.', aprende: 'fiscal' },
  { t: 'Você sabia que o Marcos ganhou "Melhor Gestor" em 2017? Ele fala disso toda semana.' },
  { t: 'A Sandra resolve qualquer coisa. Mas tem que ser por e-mail. Pelo sistema, não.', aprende: 'sandra' },
  { t: 'Estão falando de você na copa. Coisa boa, eu acho.', se: (S) => S.fama >= 4 },
  { t: 'Dizem que a Diretoria leu um relatório inteiro uma vez. Em 2019.', aprende: '2019' },
];

F.Interacao = {
  _marcas: {}, _t: 0,

  com(alvo) {
    if (F.UI.aberta()) return;
    if (alvo.npc) this.conversar(alvo.npc);
    else this.objeto(alvo.movel);
  },

  objeto(m) {
    const S = F.S;
    const qid = F.Quests.passoNoObjeto(m.acao);
    if (qid) { F.Quests.executar(qid); return; }
    const o = F.OBJETOS[m.acao];
    if (o) o.usar(S, m);
  },

  // a pessoa tem algo para você? ('evento' = "!", 'missao' = passo de missão aqui)
  marca(n) {
    if (n.def.figurante || !F.S) return null;
    const agora = F.Mundo.t;
    const c = this._marcas[n.id];
    if (c && agora - c.t < 0.5) return c.v;
    let v = null;
    if (F.Quests.naPessoa(n.id).length) v = 'missao';
    else if (this.eventoDe(n.id) || F.Quests.oferta(n.id)) v = 'evento';
    this._marcas[n.id] = { t: agora, v };
    return v;
  },
  limparMarcas() { this._marcas = {}; },
  eventoDe(id) { return F.EVENTOS.find((e) => e.g === 'npc' && e.alvo === id && F.Escolhas.disponivel(e)); },

  conversar(n) {
    const S = F.S, d = n.def;
    const quem = { nome: d.figurante ? 'Colega' : d.nome, cargo: d.cargo, look: d.look };
    const voltar = () => { this.limparMarcas(); F.UI.rastreio(); };
    if (d.figurante) {
      F.Estado.aplicar({ t: 2 });
      F.UI.dialogo({ titulo: 'Colega', quem, texto: F.u.pick(d.falas), opcoes: [{ t: 'Tchau.', fn: (w) => F.UI.fechar(w) }] });
      return;
    }
    // 1) uma missão com passo aqui
    const qs = F.Quests.naPessoa(d.id);
    // 2) uma situação marcada com "!"
    const ev = this.eventoDe(d.id);
    if (ev && !qs.length) { this.conhecer(d); F.Escolhas.mostrar(ev, { depois: voltar }); return; }
    // 3) uma missão para oferecer
    const of = F.Quests.oferta(d.id);
    if (of && !qs.length) { this.conhecer(d); F.Quests.oferecer(of, voltar); return; }

    const primeira = !S.conhecidos.includes(d.id);
    this.conhecer(d);
    const brava = S.dep[d.dep] <= -30;
    let fala;
    if (primeira) fala = `Prazer! Eu sou ${d.nome.replace(/^(Dona|Seu|Dr\.) /, '')}. ${d.cargo}. ${F.u.pick(d.falas)}`;
    else if (brava) fala = F.u.pick(F.FALAS_BRAVAS);
    else if (S.fama >= 6 && Math.random() < 0.3) fala = F.u.pick(['Ei! Você é aquela pessoa famosa da copa, né?', 'Todo mundo está falando de você. Eu não, claro.', 'Você é a pessoa da história do pão de queijo?']);
    else fala = F.u.pick(d.falas);

    const opcoes = [];
    qs.forEach((qid) => opcoes.push({ t: '▶ ' + F.QUESTS[qid].titulo, cls: 'missao', fn: (w) => { F.UI.fechar(w); F.Quests.executar(qid, voltar); } }));
    opcoes.push({ t: 'Puxar assunto.', fn: (w) => { F.UI.fechar(w); this.assunto(d, quem); } });
    const pergs = (d.perguntas || []).filter((p) => !p.se || S.regras.includes(p.se));
    if (pergs.length) opcoes.push({ t: 'Perguntar...', fn: (w) => { F.UI.fechar(w); this.perguntas(d, quem); } });
    (d.extras || []).forEach((x) => this.extras(x, d, quem, opcoes));
    opcoes.push({ t: 'Tchau.', fn: (w) => { F.UI.fechar(w); voltar(); } });
    F.Estado.aplicar({ t: 3 });
    F.UI.dialogo({ titulo: d.nome, quem, texto: fala, opcoes });
  },

  conhecer(d) {
    const S = F.S;
    if (S.conhecidos.includes(d.id)) return;
    S.conhecidos.push(d.id);
    F.UI.toast('👥 CONTATO NOVO', `${d.nome} · ${F.DEPS[d.dep]} (${S.conhecidos.length} pessoas)`);
  },

  assunto(d, quem) {
    const S = F.S;
    S.hoje.papos = S.hoje.papos || {};
    const ja = S.hoje.papos[d.id];
    S.hoje.papos[d.id] = true;
    const fx = { t: 10, est: -2 };
    if (!ja) fx.dep = { [d.dep]: 3 };
    let txt = F.u.pick(d.falas);
    if (ja) txt = F.u.pick(['De novo por aqui? Gostei. Ou não.', 'Já conversamos hoje, mas tudo bem. ' + F.u.pick(d.falas), 'Você está fugindo de alguma reunião?']);
    const chips = F.Estado.aplicar(fx);
    F.UI.resultado({ titulo: d.nome, quem, texto: txt, chips, depois: () => this.conversarDeNovo(d) });
  },

  perguntas(d, quem) {
    const S = F.S;
    const pergs = (d.perguntas || []).filter((p) => !p.se || S.regras.includes(p.se));
    F.UI.dialogo({
      titulo: d.nome, quem, texto: 'O que você quer saber?',
      opcoes: [
        ...pergs.map((p) => ({ t: p.p, tags: p.regra && !S.regras.includes(p.regra) ? '<span class="tag regra">📘 ?</span>' : '', fn: (w) => {
          F.UI.fechar(w);
          const chips = F.Estado.aplicar({ t: p.t || 5, aprende: p.regra });
          F.UI.resultado({ titulo: d.nome, quem, texto: p.r, chips, depois: () => this.perguntas(d, quem) });
        } })),
        { t: 'Era só isso.', fn: (w) => { F.UI.fechar(w); this.conversarDeNovo(d); } },
      ],
    });
  },
  conversarDeNovo(d) {
    const n = F.Mundo.npcs.find((x) => x.def === d);
    if (n) this.conversar(n);
  },

  // ações especiais de algumas pessoas
  extras(x, d, quem, opcoes) {
    const S = F.S;
    const mes = F.u.mesDe(S.dia);
    if (x === 'chefe') {
      opcoes.push({ t: '"Gostaria de conversar sobre minha remuneração."', fn: (w) => { F.UI.fechar(w); this.pedirAumento(d, quem); } });
      opcoes.push({ t: 'Tentar uma promoção.', fn: (w) => { F.UI.fechar(w); this.pedirPromocao(d, quem); } });
      if (!S.flags.homeoffice) opcoes.push({ t: 'Pedir para trabalhar de casa.', fn: (w) => { F.UI.fechar(w); this.pedirHomeOffice(d, quem); } });
      if (S.tarefasHoje.length < 3) opcoes.push({ t: 'Perguntar se tem alguma tarefa.', fn: (w) => {
        F.UI.fechar(w);
        const chips = F.Estado.aplicar({ t: 5, tarefaNova: 1, rep: 1 });
        F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos sorri: "Precisamos entregar."', chips });
      } });
    }
    if (x === 'fofoca') opcoes.push({ t: 'Fofocar.', fn: (w) => { F.UI.fechar(w); this.fofoca(false, quem); } });
    if (x === 'ajudaSistema') opcoes.push({ t: 'Pedir ajuda com o sistema.', fn: (w) => {
      F.UI.fechar(w);
      const ja = S.hoje.ajudaDavi;
      S.hoje.ajudaDavi = true;
      const chips = F.Estado.aplicar(ja ? { t: 5 } : { t: 20, prod: 4, dep: { engenharia: 2 }, aprende: 'estagiario' });
      F.UI.resultado({ titulo: d.nome, quem, texto: ja ? 'Davi: "Já te ensinei tudo que eu sei hoje. Amanhã eu descubro mais."' : 'Davi te mostra três atalhos secretos e um menu que ninguém sabia que existia. Sua produtividade agradece.', chips });
    } });
    if (x === 'rh') opcoes.push({ t: 'Pedir um feedback sincero.', fn: (w) => {
      F.UI.fechar(w);
      const r = S.rep >= 60 ? 'Que orgulho! Todo mundo fala bem de você. Bom, quase todo mundo.' : S.rep >= 35 ? 'Você está indo bem! Tem espaço para crescer. Muito espaço. Bastante.' : 'Que alegria você ter perguntado! Vamos trabalhar juntos na sua reputação. Ela precisa. Bastante.';
      const e = S.est >= 70 ? ' Ah, e você parece cansado(a). Já pensou em tomar um café? Ou dois meses de férias?' : '';
      const chips = F.Estado.aplicar({ t: 15, est: -3, dep: { rh: 3 } });
      F.UI.resultado({ titulo: d.nome, quem, texto: r + e, chips });
    } });
    if (x === 'diretor') {
      if (!S.hoje.ideiaDiretor) opcoes.push({ t: 'Apresentar uma ideia.', tags: `<span class="tag teste">🎲 Comunicador ${Math.round(F.Escolhas.chance('comunicador') * 100)}%</span>`, fn: (w) => {
        F.UI.fechar(w);
        S.hoje.ideiaDiretor = true;
        F.Escolhas.resolver({ hab: 'comunicador',
          ok: { fx: { t: 20, inf: 8, rep: 4, dep: { diretoria: 8 } }, r: 'Dr. Augusto: "Interessante! Vamos montar um comitê." Vindo dele, é o maior elogio possível.' },
          falha: { fx: { t: 20, rep: -3, dep: { diretoria: -3 } }, r: 'Dr. Augusto: "Hum." Ele anota algo. Você vê de relance: "almoço".' } }, { titulo: d.nome, quem });
      } });
      opcoes.push({ t: 'Pedir uma promoção direto ao diretor.', cls: 'perigo', fn: (w) => {
        F.UI.fechar(w);
        const ok = F.Carreira.nota(S) >= 70 && F.Carreira.opcoes(S).length;
        if (ok) { F.Dia.promover(d.nome + ': "Gostei da ousadia."'); return; }
        const chips = F.Estado.aplicar({ t: 10, rep: -8, dep: { operacoes: -10, diretoria: -4 } });
        F.UI.resultado({ titulo: d.nome, quem, texto: 'Dr. Augusto: "Fale com o seu gestor." Meia hora depois, o Marcos fica sabendo. Ele não gostou de ter ficado sabendo.', chips });
      } });
    }
  },

  pedirAumento(d, quem) {
    const S = F.S, mes = F.u.mesDe(S.dia);
    if (S.flags.aumento) return F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "Você já teve aumento esse trimestre. Precisamos entregar."', chips: F.Estado.aplicar({ t: 5 }) });
    if (S.flags['aumentoNegado' + mes]) return F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "Vamos ver isso no próximo ciclo."', chips: F.Estado.aplicar({ t: 5, est: 3 }) });
    if (S.agenda.some((a) => a.id === 'remuneracao' && !a.feito)) return F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "Já está marcado, não está? Vamos alinhar lá."', chips: F.Estado.aplicar({ t: 3 }) });
    S.flags.pediuAumento = true;
    const chips = F.Estado.aplicar({ t: 5, est: 5, reuniao: 'remuneracao' });
    F.UI.resultado({ titulo: d.nome, quem, texto: '"Gostaria de conversar sobre minha remuneração."\n\nMarcos: "Claro. Vamos marcar uma reunião."', chips });
  },

  pedirPromocao(d, quem) {
    const S = F.S, mes = F.u.mesDe(S.dia);
    if (S.dia % F.DIAS_POR_MES < 4 && S.dia % F.DIAS_POR_MES !== 0) return F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "Você acabou de passar por uma avaliação. Vamos alinhar daqui a uns dias."', chips: F.Estado.aplicar({ t: 3 }) });
    if (S.flags['pediuPromo' + mes]) return F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "A gente já conversou sobre isso esse mês. Precisamos entregar."', chips: F.Estado.aplicar({ t: 3, est: 2 }) });
    S.flags['pediuPromo' + mes] = true;
    const prox = F.Carreira.nivel(S) + 1;
    const ok = F.Carreira.opcoes(S).length && F.Carreira.nota(S) >= (F.Carreira.corte[prox] || 999) + 6;
    if (ok) { F.Estado.aplicar({ t: 30 }); F.Dia.promover('Marcos: "Sabe que eu estava pensando nisso? Merecido."'); return; }
    const chips = F.Estado.aplicar({ t: 30, rep: -2, est: 5 });
    F.UI.resultado({ titulo: d.nome, quem, texto: 'Marcos: "Ainda não é o momento. Precisamos entregar mais. Mas gostei da iniciativa. Vamos alinhar na avaliação."', chips });
  },

  pedirHomeOffice(d, quem) {
    const S = F.S;
    const ok = S.rep >= 45 && S.dia >= 5;
    const chips = F.Estado.aplicar(ok ? { t: 10, flag: 'homeoffice', est: -5 } : { t: 10, est: 3 });
    F.UI.resultado({ titulo: d.nome, quem, texto: ok ? 'Marcos pensa. "Pode. Mas câmera ligada nas reuniões." Agora você pode escolher trabalhar de casa de manhã.' : 'Marcos: "Vamos alinhar isso mais para frente. Precisamos de você aqui. Para... integrar as operações."', chips });
  },

  fofoca(naCopa, quem) {
    const S = F.S;
    const pool = F.FOFOCAS.filter((f) => !f.se || f.se(S));
    const novas = pool.filter((f) => !f.aprende || !S.regras.includes(f.aprende));
    const f = F.u.pick(novas.length && Math.random() < 0.7 ? novas : pool);
    const k = quem || F.Escolhas.quem('katia');
    const fx = { t: 15, est: -5, aprende: f.aprende, conta: { fofocas: 1 }, dep: { comercial: 2 } };
    if (Math.random() < 0.2) { fx.rep = -2; }
    const chips = F.Estado.aplicar(fx);
    F.UI.resultado({ titulo: naCopa ? 'Copa' : 'Kátia', quem: k, texto: (naCopa ? 'Você senta na copa. Em dois minutos, a Kátia aparece.\n\n' : '') + '"Você não ouviu isso de mim, mas... ' + f.t + '"' + (fx.rep ? '\n\n(Alguém da mesa ao lado ouviu tudo.)' : ''), chips });
  },

  elevador() {
    const S = F.S, atual = F.Mundo.andar;
    const nomes = { terreo: 'Térreo · Fábrica', n1: '1º · Negócios', n2: '2º · Escritórios', n3: '3º · Diretoria' };
    F.UI.dialogo({
      titulo: 'Elevador', icone: '🛗',
      texto: 'Música de elevador toca baixinho. Para onde?',
      opcoes: F.ANDARES.map((a) => ({
        t: (a === atual ? '● ' : '') + nomes[a] + (a === 'n3' && !S.flags.acessoDiretoria ? '  🔒' : ''),
        desab: a === atual,
        fn: (w) => {
          if (a === 'n3' && !S.flags.acessoDiretoria) {
            F.Som.erro();
            F.UI.fechar(w);
            F.UI.resultado({ titulo: 'Elevador', icone: '🔒', texto: '🔒 ACESSO NEGADO\n\nO painel pisca em vermelho. Uma voz gravada diz: "Seu crachá não tem permissão para este andar. Tenha um ótimo dia."', chips: [] });
            return;
          }
          F.UI.fechar(w);
          F.Som.ding();
          F.Estado.aplicar({ t: 2 });
          F.Mundo.irPara(a);
          this.limparMarcas();
          F.UI.local();
          if (a === 'n3' && !S.flags.visitouN3) { S.flags.visitouN3 = true; F.UI.toast('🏢 3º ANDAR', 'Carpete grosso, aquário e um silêncio caro.'); }
        },
      })),
    });
  },
};

// ============================================================
//  O SEU COMPUTADOR (na mesa, em Operações Integradas)
// ============================================================
F.Mesa = {
  abrir() {
    const S = F.S;
    const qid = F.Quests.passoNoObjeto('mesa');
    const opcoes = [];
    if (qid) opcoes.push({ t: '▶ ' + F.QUESTS[qid].titulo, cls: 'missao', fn: (w) => { F.UI.fechar(w); F.Quests.executar(qid); } });
    opcoes.push({ t: 'Trabalhar de verdade (1h).', fn: (w) => { F.UI.fechar(w); this.trabalhar(); } });
    opcoes.push({ t: 'Fingir que está trabalhando (30 min).', fn: (w) => { F.UI.fechar(w); this.fingir(); } });
    opcoes.push({ t: 'Abrir o Outlouco (e-mails).', fn: (w) => { F.UI.fechar(w); F.Emails.abrir(); } });
    opcoes.push({ t: 'Criar uma automação (1h30).', tags: `<span class="tag teste">🎲 Técnico ${Math.round(this.chanceAuto() * 100)}%</span>`, fn: (w) => { F.UI.fechar(w); this.automacao(); } });
    opcoes.push({ t: 'Atualizar o LinkedIn (20 min).', fn: (w) => { F.UI.fechar(w); const ch = F.Estado.aplicar({ t: 20, est: -3, flag: 'linkedin' }); F.UI.resultado({ titulo: 'LinkedIn', icone: '💼', texto: F.u.pick(['Você escreve: "Apaixonado(a) por desafios e sinergia." Você odeia as duas coisas.', 'Seu novo título: "Integrador(a) de Operações | Visionário(a) | Café".', 'Três pessoas visualizaram seu perfil. Uma delas é o Marcos.']), chips: ch }); } });
    opcoes.push({ t: 'Desligar a tela.', fn: (w) => F.UI.fechar(w) });
    const docs = S.docs > 0 ? `\n\nNa sua mesa há ${S.docs} documento${S.docs > 1 ? 's' : ''} da burocracia.` : '';
    F.UI.dialogo({ titulo: 'Estação 2-0417 · Windows Corporativo 98', icone: '🖥', texto: `Área de trabalho. Papel de parede: um painel elétrico ao pôr do sol.${docs}`, opcoes });
  },

  trabalhar() {
    const S = F.S;
    S.hoje.sessoes = (S.hoje.sessoes || 0) + (S.prod >= 60 ? 2 : 1);
    const fx = { t: 60, prod: 3, est: 5, rep: 1 };
    let txt = F.u.pick(['Você trabalha de verdade. É estranho, mas bom.', 'Uma hora inteira sem reunião. Você quase chora.', 'Você responde 14 e-mails e cria 3 planilhas. A produtividade agradece.']);
    if (S.hoje.sessoes >= 2) { S.hoje.sessoes -= 2; fx.tarefa = 1; txt += '\n\nVocê conclui uma pendência antiga.'; }
    if (S.docs >= 8) { fx.docs = -3; txt += '\n\nTambém dá para despachar 3 documentos da pilha.'; }
    const chips = F.Estado.aplicar(fx);
    F.UI.resultado({ titulo: 'Trabalhando', icone: '⌨', texto: txt, chips });
  },

  fingir() {
    const S = F.S;
    const pego = Math.random() < (S.perfil === 'sobrevivente' ? 0.05 : 0.25);
    const chips = F.Estado.aplicar(pego ? { t: 30, est: -2, rep: -5 } : { t: 30, est: -7 });
    F.UI.resultado({ titulo: 'Trabalhando (mais ou menos)', icone: '🃏', texto: pego ? 'O Marcos passa atrás de você. Na tela: Paciência, a terceira partida. Ele não diz nada. Ele não precisa dizer.' : F.u.pick(['Você abre uma planilha e fica olhando para ela com cara de concentração. Funciona.', 'Você digita qualquer coisa com muita força. Parece produtividade.', 'Você move o mouse em círculos por 30 minutos. Ninguém percebe.']), chips });
  },

  chanceAuto() {
    const S = F.S;
    let c = 0.28 + (S.perfil === 'tecnico' ? 0.26 : S.perfil === 'analitico' ? 0.15 : 0) + S.prod / 400 + Math.min(S.cont.automacoes, 5) * 0.04;
    if (S.cargo === 'estagiario') c += 0.1;
    if (S.flags.daviEnsinou) c += 0.1;
    if (S.flags.excel) c += 0.06;
    return F.u.clamp(c, 0.1, 0.92);
  },
  automacao() {
    const S = F.S;
    const c = this.chanceAuto(), ok = Math.random() < c;
    const rol = { ok, txt: `🎲 Teste de Técnico (${Math.round(c * 100)}%): ${ok ? 'deu certo!' : 'não deu.'}` };
    if (ok) {
      const chips = F.Estado.aplicar({ t: 90, automacao: 1, prod: 6, rep: 3, fama: 1, aprende: S.cont.automacoes >= 1 ? 'automacao' : null });
      if (S.cont.automacoes >= 6) S.flags.automacaoTotal = true;
      F.UI.resultado({ titulo: 'Automação', icone: '🤖', rolagem: rol, texto: F.u.pick(['Sua automação junta três planilhas numa só e manda por e-mail às 8h. Ninguém sabe que é um robô.', 'Você cria uma macro que preenche o relatório semanal. Ela funciona. Você desconfia, mas funciona.', 'Um script que responde "recebido, obrigado(a)" sozinho. Revolucionário.']), chips });
    } else {
      S.cont.quebras++;
      const chips = F.Estado.aplicar({ t: 90, rep: -6, est: 10, fama: 2, dep: { comercial: -8 } });
      F.Emails.receber('automacao-quebrou');
      F.UI.resultado({ titulo: 'Automação', icone: '💥', rolagem: rol, texto: 'Você aperta "Executar". Alguma coisa começa a mandar e-mails. Muitos e-mails. Você aperta "Parar". Não existe botão "Parar".', chips });
    }
  },
};
