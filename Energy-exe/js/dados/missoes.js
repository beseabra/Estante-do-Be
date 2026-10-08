// ============================================================
//  ★ MISSÕES (a lista do menu Iniciar)
//  objetivos: [{ t: texto, v: (S) => valor atual, n: meta }]
//  quando: (S) => a missão já apareceu?
//  recompensa: efeitos ao concluir
// ============================================================
(function () {
  const conhecidosDe = (S, dep) => S.conhecidos.some((id) => { const n = F.NPCS.find((x) => x.id === id); return n && n.dep === dep; });
  F.MISSOES = [
    { id: 'mes1', tipo: 'principal', titulo: 'Sobreviva ao seu primeiro mês.', ate: 10,
      objetivos: [
        { t: 'Concluir 5 tarefas', v: (S) => S.cont.tarefas, n: 5 },
        { t: 'Participar de 2 reuniões', v: (S) => S.cont.reunioes, n: 2 },
        { t: 'Conhecer 10 funcionários', v: (S) => S.conhecidos.length, n: 10 },
        { t: 'Não ser demitido(a)', v: () => 1, n: 1 },
      ],
      recompensa: { rep: 10, inf: 5, extra: ['Primeiro mês concluído'] } },
    { id: 'mes2', tipo: 'principal', titulo: 'Mostre serviço.', quando: (S) => S.dia > 10, ate: 20,
      objetivos: [
        { t: 'Chegar a 14 tarefas concluídas', v: (S) => S.cont.tarefas, n: 14 },
        { t: 'Ter 50 de reputação', v: (S) => Math.round(S.rep), n: 50 },
        { t: 'Resolver 3 investigações pelo prédio', v: (S) => S.cont.investigacoes, n: 3 },
      ],
      recompensa: { rep: 8, inf: 8, extra: ['Segundo mês concluído'] } },
    { id: 'mes3', tipo: 'principal', titulo: 'Escolha o seu caminho.', quando: (S) => S.dia > 20, ate: 30,
      objetivos: [
        { t: 'Chegar à avaliação final (dia 30)', v: (S) => (S.dia >= 30 ? 1 : 0), n: 1 },
      ],
      recompensa: {} },
    { id: 'aumento', tipo: 'secundaria', titulo: 'Consiga um aumento.', quando: (S) => S.dia >= 2,
      objetivos: [
        { t: 'Falar com o seu gestor', v: (S) => (S.flags.pediuAumento ? 1 : 0), n: 1 },
        { t: 'Entregar uma tarefa importante (uma investigação)', v: (S) => S.cont.investigacoes, n: 1 },
        { t: 'Ter 55 de reputação', v: (S) => Math.round(S.rep), n: 55 },
        { t: 'Escolher o momento certo', v: (S) => (S.flags.aumento ? 1 : 0), n: 1 },
      ],
      recompensa: {} },
    { id: 'automatize', tipo: 'secundaria', titulo: 'Automatize alguma coisa.', quando: (S) => S.dia >= 2,
      objetivos: [{ t: 'Criar 3 automações que funcionam', v: (S) => S.cont.automacoes, n: 3 }],
      recompensa: { prod: 8, fama: 1 } },
    { id: 'deptos', tipo: 'secundaria', titulo: 'Conheça todos os departamentos.',
      objetivos: Object.keys(F.DEPS).map((d) => ({ t: 'Alguém de ' + F.DEPS[d], v: (S) => (conhecidosDe(S, d) ? 1 : 0), n: 1 })),
      recompensa: { inf: 10, rep: 5 } },
    { id: 'manual', tipo: 'secundaria', titulo: 'Complete o Manual não oficial.',
      objetivos: [{ t: 'Descobrir 15 regras corporativas', v: (S) => S.regras.length, n: 15 }],
      recompensa: { inf: 8, extra: ['Agora você entende a empresa. Isso é preocupante.'] } },
    { id: 'diretoria', tipo: 'secundaria', titulo: 'Chegue à Diretoria.', quando: (S) => S.dia >= 5,
      objetivos: [
        { t: 'Conseguir acesso ao 3º andar', v: (S) => (S.flags.acessoDiretoria ? 1 : 0), n: 1 },
        { t: 'Sobreviver à Reunião Estratégica', v: (S) => (S.flags.diretoriaFeita ? 1 : 0), n: 1 },
      ],
      recompensa: { inf: 6 } },
    { id: 'famoso', tipo: 'secundaria', titulo: 'Vire assunto na copa.', quando: (S) => S.fama >= 3,
      objetivos: [{ t: 'Ser comentado(a) pelos corredores (fama 10)', v: (S) => S.fama, n: 10 }],
      recompensa: { inf: 5, extra: ['Celebridade corporativa'] } },
    { id: 'explique', tipo: 'secundaria', titulo: '"Explique suas escolhas."', quando: (S) => S.flags.agressao,
      objetivos: [{ t: 'Conversar com o RH', v: (S) => (S.flags.explicou ? 1 : 0), n: 1 }],
      recompensa: {} },
  ];
})();
