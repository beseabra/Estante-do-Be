// ============================================================
//  ★ REUNIÕES
//  Em cada rodada alguém fala, e você escolhe:
//    falar · quieto · pergunta · alinhado ("conforme alinhado")
//    sair (da reunião) · conexao (fingir que a conexão caiu)
//  bom / ruim: quais ações funcionam ou dão errado nesta rodada.
//  txt: textos especiais para alguma ação nesta rodada.
//  sala: 'reunioes' (Sala Sinergia), 'conselho' ou 'online'.
// ============================================================
F.ACOES_REUNIAO = [
  ['falar', '🗣 Falar'], ['quieto', '🤐 Ficar em silêncio'], ['pergunta', '❓ Fazer uma pergunta'],
  ['alinhado', '🤝 "Conforme alinhado"'], ['sair', '🚪 Sair da reunião'], ['conexao', '📶 Fingir que a conexão caiu'],
];

F.RESPOSTAS_REUNIAO = {
  falar: {
    bom: ['Você fala com clareza. Duas pessoas anotam. Uma delas desenha uma estrelinha do lado.', 'Sua fala muda o rumo da reunião. Para melhor, inclusive.'],
    neutro: ['Você fala. Alguém concorda. Outra pessoa repete a mesma coisa com outras palavras e leva o crédito.', 'Você fala e todo mundo balança a cabeça. Não dá para saber se é sim ou sono.'],
    ruim: ['Você fala por cima de alguém. Silêncio constrangedor de quatro segundos.', 'Você fala, e de algum jeito agora a tarefa é sua.'],
  },
  quieto: {
    bom: ['Ficar em silêncio foi a decisão certa. A discussão se resolve sozinha.', 'Você observa em silêncio. Parece sabedoria. Talvez seja.'],
    neutro: ['Você fica em silêncio. Ninguém percebe que você está ali.', 'Você fica em silêncio e pensa no almoço.'],
    ruim: ['Alguém pergunta: "E você, o que acha?" Você não estava ouvindo.', 'Seu silêncio foi interpretado como concordância. Agora você concorda com uma coisa que não sabe o que é.'],
  },
  pergunta: {
    bom: ['"Qual é o objetivo desta reunião?" Silêncio. Depois, gratidão silenciosa de todos.', 'Sua pergunta é tão boa que alguém fala "ótima pergunta" de verdade.'],
    neutro: ['Você pergunta. A resposta é: "Vamos levar isso para outra reunião."', 'Você pergunta e recebe uma resposta de sete minutos que não responde nada.'],
    ruim: ['Você faz uma pergunta que foi respondida há três minutos.', 'Sua pergunta abre uma discussão de 40 minutos. Todo mundo olha para você.'],
  },
  alinhado: {
    bom: ['"Conforme alinhado..." Todos concordam com a cabeça. Ninguém sabe com o quê.', '"Conforme alinhado." A discussão termina. Poder absoluto.'],
    neutro: ['"Conforme alinhado." Alguém anota. Não muda nada, mas soou bem.'],
    ruim: ['"Conforme alinhado com quem?", pergunta alguém. Você não sabe.', '"Não foi isso que alinhamos", diz alguém. Agora vocês vão alinhar o que foi alinhado.'],
  },
};

F.REUNIOES = {
  alinhamento: {
    titulo: 'Alinhamento', sala: 'reunioes', dur: 60, quem: ['gustavo', 'renata', 'lia'],
    rodadas: [
      { quem: 'gustavo', fala: 'Pessoal, o objetivo desta reunião é alinhar o alinhamento da semana passada.', bom: ['pergunta'], ruim: ['falar'] },
      { quem: 'lia', fala: 'A alteração que o cliente pediu não estava no escopo.', bom: ['quieto', 'alinhado'], ruim: ['falar'], txt: { falar: 'Você diz que dá para fazer. A Lia vira lentamente para você.' } },
      { quem: 'renata', fala: 'O cronograma está verde. Verde-melancia, mas verde.', bom: ['pergunta'], ruim: ['alinhado'] },
      { quem: 'gustavo', fala: 'Então, próximos passos: marcar outra reunião. Alguém se opõe?', bom: ['quieto', 'alinhado'], ruim: ['pergunta'], txt: { pergunta: '"Por que outra reunião?" Gustavo: "Ótimo ponto. Vamos marcar uma reunião para discutir isso."' } },
    ],
    fim: 'Ação definida: marcar outra reunião.', fx: { aprende: 'reuniao-reuniao' },
  },
  status: {
    titulo: 'Status semanal de Operações', sala: 'online', dur: 45, quem: ['marcos', 'julia', 'thiago'],
    rodadas: [
      { quem: 'marcos', fala: 'Precisamos entregar. Como estão as entregas?', bom: ['falar'], ruim: ['quieto'] },
      { quem: 'thiago', fala: 'Estou com um bloqueio. Dependo de uma aprovação do Carlos.', bom: ['pergunta'], ruim: ['falar'], txt: { pergunta: '"O Carlos não está de férias?" Silêncio. Todos percebem ao mesmo tempo. O bloqueio é eterno.' } },
      { quem: 'julia', fala: 'Sugiro criarmos um comitê para acompanhar os bloqueios.', bom: ['alinhado'], ruim: ['pergunta'] },
      { quem: 'marcos', fala: 'Vamos alinhar. Mais alguma coisa?', bom: ['quieto'], ruim: ['falar'], txt: { falar: 'Você fala "mais alguma coisa". A reunião dura mais 20 minutos.' } },
    ],
    fim: 'Ação definida: Marcos vai "alinhar".', fx: {},
  },
  kickoff: {
    titulo: 'Kickoff do Projeto Fênix', sala: 'reunioes', dur: 90, quem: ['rodrigo', 'lia', 'gustavo'],
    rodadas: [
      { quem: 'rodrigo', fala: 'O cliente precisa para sexta.', bom: ['pergunta'], ruim: ['alinhado'], txt: { pergunta: '"Qual sexta?" Rodrigo hesita. "A próxima. Ou a outra."' } },
      { quem: 'lia', fala: 'Isso não estava no escopo.', bom: ['falar'], ruim: ['quieto'], txt: { falar: 'Você propõe dividir em duas fases. Rodrigo e Lia concordam ao mesmo tempo, o que nunca aconteceu antes.' } },
      { quem: 'gustavo', fala: 'Sugiro um alinhamento semanal, diário e de hora em hora.', bom: ['pergunta'], ruim: ['alinhado'] },
      { quem: 'rodrigo', fala: 'Fechado, então! É sexta.', bom: ['falar'], ruim: ['quieto'], txt: { quieto: 'Você não disse nada e agora a sexta é sua.' } },
    ],
    fim: 'Ação definida: é sexta. (Qual sexta, ninguém sabe.)', fx: { aprende: 'sexta' },
  },
  posmortem: {
    titulo: 'Lições aprendidas (pós-morte do projeto)', sala: 'online', dur: 60, quem: ['renata', 'gustavo', 'fausto'],
    rodadas: [
      { quem: 'fausto', fala: 'Isso já aconteceu em 2019.', bom: ['pergunta', 'alinhado'], ruim: ['falar'] },
      { quem: 'renata', fala: 'Lição aprendida número 1: precisamos aprender as lições.', bom: ['quieto'], ruim: ['pergunta'] },
      { quem: 'gustavo', fala: 'Quem foi responsável pelo atraso?', bom: ['quieto', 'conexao'], ruim: ['falar'], txt: { falar: 'Você fala e, de algum jeito, a responsabilidade vira sua.' } },
    ],
    fim: 'Ação definida: registrar as lições numa pasta que ninguém vai abrir.', fx: { docs: 2 },
  },
  brainstorm: {
    titulo: 'Brainstorm: Inovação Disruptiva', sala: 'reunioes', dur: 60, quem: ['davi', 'lia', 'wagner'],
    rodadas: [
      { quem: 'wagner', fala: 'Proposta: começar a trabalhar aos sábados. Para inovar.', bom: ['falar'], ruim: ['quieto'], txt: { falar: 'Você sugere inovar de segunda a sexta. Aprovado por 3 votos a 1.' } },
      { quem: 'davi', fala: 'E se a gente automatizasse o relatório semanal?', bom: ['falar', 'alinhado'], ruim: ['pergunta'] },
      { quem: 'lia', fala: 'Isso não estava no escopo da inovação.', bom: ['alinhado'], ruim: ['falar'] },
    ],
    fim: 'Ação definida: criar um grupo de trabalho sobre inovação. Reunião semanal.', fx: { prod: 2 },
  },
  remuneracao: {
    titulo: 'Conversa sobre remuneração', sala: 'online', dur: 40, quem: ['marcos'], especial: 'aumento',
    rodadas: [
      { quem: 'marcos', fala: 'Então... você queria falar sobre remuneração?', bom: ['falar'], ruim: ['quieto', 'conexao'] },
      { quem: 'marcos', fala: 'Me conta: quais foram as suas principais entregas?', bom: (S) => (S.cont.tarefas >= 4 ? ['falar'] : ['pergunta']), ruim: (S) => (S.cont.tarefas >= 4 ? ['quieto'] : ['falar']),
        txt: { falar: 'Você lista as suas entregas. Marcos parece genuinamente surpreso com a lista.' } },
      { quem: 'marcos', fala: 'Entendo. Mas o momento da empresa é desafiador.', bom: ['pergunta'], ruim: ['alinhado'], txt: { pergunta: '"Qual momento não foi desafiador?" Marcos ri. Ele não tem resposta.' } },
      { quem: 'marcos', fala: 'Vamos ver o que é possível. Vou alinhar com o RH.', bom: ['quieto', 'alinhado'], ruim: ['sair'] },
    ],
    fim: '', fx: {},
  },
  diretoria: {
    titulo: 'Reunião Estratégica com a Diretoria', sala: 'conselho', dur: 180, quem: ['augusto', 'cristina', 'vera'], especial: 'diretoria',
    rodadas: [
      { quem: 'augusto', fala: 'Bem-vindos. Antes de começar, uma apresentação rápida de 94 slides.', bom: ['quieto'], ruim: ['pergunta'] },
      { quem: 'cristina', fala: 'Precisamos cortar custos em 12%. Sugestões?', bom: ['falar'], ruim: ['alinhado'], txt: { falar: 'Você sugere cancelar as reuniões que poderiam ser e-mails. A Diretoria acha a ideia "ousada".' } },
      { quem: 'augusto', fala: 'Alguma pergunta sobre a nossa sinergia?', bom: ['pergunta'], ruim: ['quieto'] },
      { quem: 'cristina', fala: 'E se a gente tirasse o pão de queijo da copa?', bom: ['falar'], ruim: ['quieto'], txt: { falar: 'Você defende o pão de queijo com uma paixão inesperada. A empresa inteira vai saber disso até amanhã.', quieto: 'O pão de queijo foi cortado. Você estava lá e não disse nada.' } },
      { quem: 'augusto', fala: 'Vamos fazer uma pausa de cinco minutinhos.', bom: ['quieto'], ruim: ['sair'], txt: { quieto: 'A pausa de cinco minutinhos dura 47 minutos, como era de se esperar.' } },
      { quem: 'augusto', fala: 'Excelente reunião. Vamos marcar outra para alinhar os próximos passos.', bom: ['alinhado'], ruim: ['pergunta'] },
    ],
    fim: 'Três horas depois: ficou decidido que haverá uma nova reunião estratégica.', fx: { inf: 8, aprende: 'diretoria', flag: 'diretoriaFeita' },
  },
};
