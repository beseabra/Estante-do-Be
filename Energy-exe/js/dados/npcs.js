// ============================================================
//  ★ AS PESSOAS DA VOLTAGEM S.A.
//  Cada pessoa:
//    id, nome, cargo, dep (departamento), andar, x, y (quadradinho
//    onde fica), dir, look (aparência), falas (frases soltas),
//    perguntas: [{ p: pergunta, r: resposta, regra: 'id' (ensina uma
//               regra corporativa), se: 'idDeRegra' (só aparece se
//               você já souber essa regra) }]
//    extras: ações especiais (ver jogo/conversa.js)
//    anda: raio em quadradinhos para passear (0 = fica parado)
//    aparece: (S) => true/false   (ex.: o Carlos só volta no dia 16)
// ============================================================
(function () {
  const P = F.PALETA;
  // L(pele, cabelo, corCabelo, roupa, corRoupa, óculos, acessório, crachá, calça)
  const L = (pe, ca, cc, ro, cr, oc = 'nenhum', ac = 'nenhum', cra = 0, ca2 = 0) => ({
    pele: P.peles[pe], cabelo: ca, corCabelo: P.cabelos[cc], roupa: ro, corRoupa: P.roupas[cr],
    oculos: oc, acessorio: ac, cracha: P.crachas[cra], calca: P.calcas[ca2],
  });

  F.DEPS = {
    fabrica: 'Fábrica', logistica: 'Logística', compras: 'Compras', comercial: 'Comercial',
    qualidade: 'Qualidade', engenharia: 'Engenharia', pm: 'Projetos (PM)', operacoes: 'Operações Integradas',
    rh: 'RH', diretoria: 'Diretoria',
  };

  F.NPCS = [
    // ------------------------------------------------ TÉRREO
    { id: 'lucia', nome: 'Dona Lúcia', cargo: 'Recepção, há 31 anos', dep: 'fabrica', andar: 'terreo', x: 21, y: 20, dir: 'baixo',
      look: L(3, 'coque', 5, 'blazer', 6, 'redondo', 'nenhum', 4),
      falas: ['Bom dia! Crachá no peito, sorriso no rosto. O sorriso é opcional.', 'Se a catraca apitar, não é com você. Ela apita para todo mundo.', 'O elevador é lento, mas é o único aqui que nunca pediu aumento.', 'Já vi muita gente entrar por essa porta cheia de energia. A empresa é de energia, então faz sentido.'],
      perguntas: [
        { p: 'Como funciona o prédio?', r: 'Fábrica aqui no térreo, Negócios no 1º, Escritórios no 2º. A Diretoria fica no 3º, mas o elevador só vai lá se eles quiserem.' },
        { p: 'Quem manda de verdade aqui?', r: 'Oficialmente, a Diretoria. Na prática, quem tem a chave do almoxarifado. E a Sandra.' },
      ] },
    { id: 'jefferson', nome: 'Jefferson', cargo: 'Operador de montagem', dep: 'fabrica', andar: 'terreo', x: 5, y: 7, dir: 'cima',
      look: L(4, 'curto', 0, 'macacao', 0, 'nenhum', 'capacete', 0, 1),
      falas: ['Mais um painel montado. Faltam só uns três mil.', 'A esteira tem humor. Hoje ela acordou bem.', 'Quando a linha para, todo mundo vira especialista.'],
      perguntas: [
        { p: 'O que vocês montam aqui?', r: 'Painéis elétricos. Grandes, pesados e sempre para ontem.' },
        { p: 'O café da fábrica é bom?', r: 'É mais forte que o do escritório. Ninguém sabe por quê. Tem gente que jura que é diesel.', regra: 'cafe-fabrica' },
      ] },
    { id: 'taina', nome: 'Tainá', cargo: 'Técnica de montagem', dep: 'fabrica', andar: 'terreo', x: 12, y: 7, dir: 'cima',
      look: L(2, 'rabo', 1, 'macacao', 0, 'quadrado', 'capacete', 0, 1),
      falas: ['Se você não sabe o que esse fio faz, não encosta nesse fio.', 'Eu documento tudo. Ninguém lê, mas eu documento.', 'Manual? Tem. Está desatualizado desde a versão 2.'],
      perguntas: [
        { p: 'Como você resolve uma falha?', r: 'Primeiro eu desligo e ligo. Funciona em 40% dos casos. Nos outros 60%, eu desligo e ligo com mais fé.', regra: 'desligar-ligar' },
      ] },
    { id: 'valdir', nome: 'Seu Valdir', cargo: 'Supervisor de produção', dep: 'fabrica', andar: 'terreo', x: 9, y: 10, dir: 'baixo', anda: 3,
      look: L(1, 'careca', 5, 'social', 1, 'nenhum', 'bigode', 0, 0),
      falas: ['Aqui a meta é produzir. A meta da meta é produzir mais.', 'Turno bom é turno sem surpresa.', 'Se for para trazer problema, traga junto um café.'],
      perguntas: [
        { p: 'Qual o maior problema da fábrica?', r: 'Material que chega errado. A Logística diz que é Compras. Compras diz que é o fornecedor. O fornecedor não atende.' },
        { p: 'O Carlos de Compras aprova rápido?', se: 'carlos-aprova', r: 'Aprova tudo. Quando está aqui.' },
      ] },
    { id: 'bigode', nome: 'Bigode', cargo: 'Manutenção (ninguém sabe o nome real)', dep: 'fabrica', andar: 'terreo', x: 6, y: 16, dir: 'baixo', anda: 4,
      look: L(2, 'curto', 0, 'macacao', 5, 'nenhum', 'bigode', 2, 3),
      falas: ['Já tentou desligar e ligar?', 'Tudo tem conserto. Menos reunião.', 'Fita isolante resolve 80% dos problemas. Os outros 20% precisam de duas fitas.'],
      perguntas: [
        { p: 'Pode me ajudar com uma coisa?', r: 'Abre chamado. Eu respondo o chamado. Aí eu venho. Ou eu venho agora, se você me trouxer um pão de queijo.' },
        { p: 'Qual o seu nome de verdade?', r: 'Bigode.' },
      ] },
    { id: 'priscila', nome: 'Priscila', cargo: 'Engenheira de testes', dep: 'fabrica', andar: 'terreo', x: 33, y: 4, dir: 'cima',
      look: L(0, 'longo', 4, 'polo', 4, 'quadrado', 'nenhum', 1),
      falas: ['O painel #472 está piscando vermelho desde segunda. Eu também.', 'Teste bom é o que falha aqui, e não no cliente.', 'Nada é aprovado sem laudo. Nem eu.'],
      perguntas: [{ p: 'O que acontece quando um teste falha?', r: 'A gente abre uma não conformidade. A Qualidade abre outra para saber por que a gente abriu a primeira.' }] },
    { id: 'renan', nome: 'Renan', cargo: 'Técnico de laboratório', dep: 'fabrica', andar: 'terreo', x: 39, y: 4, dir: 'cima',
      look: L(3, 'crespo', 0, 'camiseta', 2, 'redondo', 'fone', 1),
      falas: ['Medi três vezes e deu três resultados diferentes. Ciência!', 'Não encosta no osciloscópio. Ele é sensível. Emocionalmente.', 'Esse equipamento é de 2019. Igual a todos os problemas.'],
      perguntas: [{ p: 'Por que tudo aqui é de 2019?', r: 'Pergunta para o Fausto, da Engenharia. Para ele, tudo já aconteceu em 2019.', regra: '2019' }] },
    { id: 'marquinhos', nome: 'Marquinhos', cargo: 'Conferente da expedição', dep: 'fabrica', andar: 'terreo', x: 34, y: 16, dir: 'baixo',
      look: L(2, 'curto', 1, 'camiseta', 0, 'nenhum', 'bone', 2, 1),
      falas: ['Sem etiqueta não sai. Com etiqueta errada, sai para o lugar errado.', 'Esse material está esperando desde quarta. Ou desde a outra quarta.', 'O sistema diz que tem? O sistema também diz que eu tirei férias em 2021.'],
      perguntas: [{ p: 'Como funciona a expedição?', r: 'Material sem etiqueta não existe. Etiqueta sem material também não. É filosofia.', regra: 'etiqueta' }] },
    { id: 'ze', nome: 'Seu Zé', cargo: 'Motorista (terceirizado, esperando)', dep: 'fabrica', andar: 'terreo', x: 41, y: 22, dir: 'dir',
      look: L(4, 'curto', 5, 'polo', 7, 'nenhum', 'bone', 3, 4),
      falas: ['Tô esperando há 40 minutos. Não, 41.', 'Já fiz três palavras cruzadas e uma amizade com o porteiro.', 'Se eu sair sem a nota, me param na estrada. Se eu não sair, me param aqui.'],
      perguntas: [{ p: 'Por que você ainda está aqui?', r: 'Falta a nota fiscal. A nota depende do Fiscal. O Fiscal ninguém sabe onde fica.' }] },
    { id: 'osvaldo', nome: 'Seu Osvaldo', cargo: 'Almoxarifado, 32 anos de casa', dep: 'fabrica', andar: 'terreo', x: 41, y: 25, dir: 'cima',
      look: L(1, 'curto', 6, 'polo', 9, 'quadrado', 'cachecol', 4, 2),
      falas: ['Trinta e dois anos de casa. Já vi três sistemas, sete reestruturações e um único aumento.', 'Não faz pelo sistema. Manda um e-mail para a Sandra.', 'Antigamente era tudo no papel. Era ruim também, mas era mais rápido.'],
      perguntas: [
        { p: 'Qual o segredo para as coisas andarem?', r: 'Não faz pelo sistema. Manda um e-mail para a Sandra, da Logística. Ela resolve antes de o sistema carregar.', regra: 'sandra' },
        { p: 'Tem um jeito rápido de achar material?', r: 'O caminho mais curto até o estoque passa pela Expedição, não pelo sistema. Vai lá e olha a prateleira.', regra: 'atalho-estoque' },
      ] },

    // ------------------------------------------------ 1º ANDAR
    { id: 'sandra', nome: 'Sandra', cargo: 'Analista de Logística (a que resolve)', dep: 'logistica', andar: 'n1', x: 3, y: 4, dir: 'cima',
      look: L(2, 'rabo', 2, 'blazer', 3, 'redondo', 'caneca', 2),
      falas: ['Me manda por e-mail que eu vejo.', 'Não precisa abrir chamado. Precisa só me avisar.', 'Eu não sou o sistema. Eu sou mais rápida.'],
      perguntas: [
        { p: 'Você pode me ajudar com um pedido?', r: 'Posso. Me manda por e-mail. Se mandar pelo sistema, eu só vejo semana que vem.' },
        { p: 'Quem aprova as compras?', r: 'Normalmente é o Carlos. Sempre foi o Carlos.', regra: 'carlos-aprova' },
      ] },
    { id: 'kleber', nome: 'Kléber', cargo: 'Analista de Logística', dep: 'logistica', andar: 'n1', x: 10, y: 7, dir: 'cima',
      look: L(1, 'cacheado', 1, 'polo', 5, 'nenhum', 'fone', 2),
      falas: ['O sistema diz que o material existe. O estoque diz que não. Eu acredito nos dois.', 'Precisava ter chegado ontem. Ontem eu também precisava de férias.', 'Tem caminhão esperando? Sempre tem caminhão esperando.'],
      perguntas: [{ p: 'Onde fica o setor Fiscal?', r: 'Ninguém sabe. Tem gente que diz que é no 1º andar. Tem gente que diz que o Fiscal é uma pessoa só, que mora dentro do sistema.', regra: 'fiscal' }] },
    { id: 'fabiano', nome: 'Fabiano', cargo: 'Comprador', dep: 'compras', andar: 'n1', x: 30, y: 4, dir: 'cima',
      look: L(0, 'curto', 3, 'blazer', 2, 'nenhum', 'nenhum', 3),
      falas: ['Tudo é negociável. Menos o prazo do fornecedor.', 'Se o fornecedor diz "amanhã", ele quer dizer "um dia".', 'Me dá três orçamentos que eu te dou uma dor de cabeça.'],
      perguntas: [{ p: 'Quem aprova esse pedido?', se: 'carlos-aprova', r: 'O Carlos. Mas o Carlos está de férias até o dia 16. Tudo que é do Carlos fica parado. É tradição.', regra: 'carlos-ferias' }] },
    { id: 'marcia', nome: 'Márcia', cargo: 'Compradora (74 pedidos abertos)', dep: 'compras', andar: 'n1', x: 37, y: 7, dir: 'cima',
      look: L(3, 'crespo', 1, 'social', 7, 'quadrado', 'nenhum', 3),
      falas: ['Precisamos desse material até amanhã. Amanhã eu digo a mesma coisa.', 'Eu tenho 74 pedidos abertos e um pé de alface na geladeira.', 'Urgente, urgentíssimo ou "para ontem". Escolhe um.'],
      perguntas: [{ p: 'Como você decide o que é prioridade?', r: 'Se tudo é urgente, nada é urgente. Mas faça logo.', regra: 'urgente' }] },
    { id: 'carlos', nome: 'Carlos', cargo: 'Aprovador de Compras (voltou de férias)', dep: 'compras', andar: 'n1', x: 44, y: 4, dir: 'cima',
      aparece: (S) => S.dia >= 16,
      look: L(1, 'curto', 1, 'social', 0, 'escuro', 'nenhum', 3),
      falas: ['Voltei! O que eu perdi?', 'Quinze dias fora e 1.200 e-mails. Vou ler a partir do mais recente. E parar no terceiro.', 'Pode mandar que eu aprovo. Hoje eu aprovo qualquer coisa.'],
      perguntas: [{ p: 'Como foram as férias?', r: 'Ótimas. Fiquei sabendo que nada andou enquanto eu estava fora. Me senti importante.' }] },
    { id: 'katia', nome: 'Kátia', cargo: 'Faturamento (mora na copa)', dep: 'comercial', andar: 'n1', x: 17, y: 21, dir: 'esq',
      look: L(1, 'longo', 3, 'blazer', 7, 'nenhum', 'caneca', 2),
      falas: ['Você não ouviu isso de mim, mas...', 'Aqui na copa as notícias chegam antes do e-mail.', 'Eu não faço fofoca. Eu compartilho informações não oficiais.'],
      perguntas: [{ p: 'Qual a última da copa?', r: 'Dizem que vão trocar o café por um "café sustentável". É o mesmo café, só que mais caro.' }],
      extras: ['fofoca'] },
    { id: 'patricia', nome: 'Patrícia', cargo: 'Business Partner de RH', dep: 'rh', andar: 'n1', x: 3, y: 17, dir: 'baixo',
      look: L(0, 'longo', 1, 'blazer', 8, 'nenhum', 'nenhum', 4),
      falas: ['Que alegria te ver! Sente-se. Não, não é nada grave. Ainda.', 'Nossa cultura valoriza as pessoas. Por isso temos 14 formulários sobre elas.', 'Lembre-se: o RH está aqui por você. Literalmente aqui. Sempre.'],
      perguntas: [
        { p: 'Por que você é tão educada?', r: 'Porque eu me importo! E porque quanto mais educado o RH, pior a notícia. Brincadeira! (Não é brincadeira.)', regra: 'rh-educado' },
        { p: 'Onde está o Carlos?', se: 'carlos-aprova', r: 'De férias até o dia 16. Enquanto isso, nada dele anda. Nada mesmo.', regra: 'carlos-ferias' },
      ],
      extras: ['rh'] },
    { id: 'rodrigo', nome: 'Rodrigo', cargo: 'Executivo de Vendas', dep: 'comercial', andar: 'n1', x: 30, y: 19, dir: 'cima',
      look: L(1, 'curto', 0, 'blazer', 0, 'nenhum', 'nenhum', 3),
      falas: ['O cliente disse que precisa para amanhã. Eu disse que dava.', 'Vender é fácil. Difícil é entregar. Mas aí já não é comigo.', 'Fechei! Agora alguém descobre como fazer.'],
      perguntas: [{ p: 'Como você define os prazos?', r: 'Olho para o cliente, vejo o que ele quer ouvir e falo. Prometer para sexta é prometer para segunda, todo mundo sabe.', regra: 'sexta' }],
      extras: ['happyhour'] },
    { id: 'bianca', nome: 'Bianca', cargo: 'Key Account', dep: 'comercial', andar: 'n1', x: 37, y: 22, dir: 'cima',
      look: L(5, 'crespo', 0, 'social', 6, 'nenhum', 'fone', 3),
      falas: ['O cliente quer uma resposta em 15 minutos. Faz 20 que ele quer.', 'Contrato bom é contrato que ninguém leu até o fim.', 'Eu sorrio no telefone. A minha planilha não.'],
      perguntas: [{ p: 'Qual cliente dá mais trabalho?', r: 'O que paga mais. Sempre o que paga mais.' }] },
    { id: 'gilmar', nome: 'Gilmar', cargo: 'Suporte de TI', dep: 'operacoes', andar: 'n1', x: 24, y: 19, dir: 'baixo', anda: 2,
      look: L(3, 'curto', 0, 'moletom', 2, 'quadrado', 'fone', 1),
      falas: ['Você já tentou limpar o cache?', 'Eu não conserto impressora. Ninguém conserta impressora. A gente negocia com ela.', 'Sua senha precisa ter 14 caracteres, um símbolo, um hieróglifo e uma lágrima.'],
      perguntas: [
        { p: 'Como eu crio uma automação?', r: 'Com cuidado. A última pessoa que tentou mandou 4 mil e-mails para um cliente. Mas dá. O computador da sua mesa tem tudo que precisa.' },
        { p: 'O que fazer quando a impressora trava?', r: 'A impressora sente medo. Imprima com confiança.', regra: 'impressora' },
      ] },

    // ------------------------------------------------ 2º ANDAR
    { id: 'helena', nome: 'Helena', cargo: 'Auditora da Qualidade', dep: 'qualidade', andar: 'n2', x: 3, y: 4, dir: 'cima',
      look: L(1, 'coque', 1, 'blazer', 4, 'redondo', 'nenhum', 1),
      falas: ['O procedimento diz uma coisa. A realidade diz outra. Quem está errada é a realidade.', 'Toda evidência precisa de evidência.', 'Não é burocracia. É rastreabilidade com carinho.'],
      perguntas: [{ p: 'Por que tem tanto documento?', r: 'Cada vez que alguém mexe num processo, nasce um documento novo. É como cogumelo depois da chuva.' }] },
    { id: 'ivo', nome: 'Ivo', cargo: 'Analista de NCC', dep: 'qualidade', andar: 'n2', x: 9, y: 4, dir: 'cima',
      look: L(2, 'careca', 0, 'polo', 4, 'quadrado', 'nenhum', 1),
      falas: ['Existe uma não conformidade. Sempre existe.', 'Eu abro NCC até da cafeteira.', 'Indicador verde é indicador que ninguém olhou direito.'],
      perguntas: [{ p: 'O que é uma NCC?', r: 'Não conformidade. Quando algo não está conforme. Ou seja, quase sempre.' }] },
    { id: 'renata', nome: 'Renata', cargo: 'Analista de PMO', dep: 'pm', andar: 'n2', x: 19, y: 9, dir: 'cima',
      look: L(2, 'longo', 0, 'blazer', 6, 'nenhum', 'nenhum', 4),
      falas: ['Status report é sexta. Hoje é sexta? Então já atrasou.', 'Meu cronograma tem mais versões que o Windows.', 'Verde por fora, vermelho por dentro: melancia. Todo projeto é uma fruta.'],
      perguntas: [{ p: 'Como estão os projetos?', r: 'No relatório? Verdes. Na vida real? Melancia: verde por fora, vermelho por dentro.', regra: 'verde-melancia' }] },
    { id: 'gustavo', nome: 'Gustavo', cargo: 'Project Manager (sempre a caminho de uma reunião)', dep: 'pm', andar: 'n2', x: 27, y: 12, dir: 'cima', anda: 4,
      look: L(0, 'curto', 2, 'social', 8, 'nenhum', 'nenhum', 4),
      falas: ['Vamos marcar uma reunião para alinharmos.', 'Estou indo para uma reunião sobre a reunião de ontem.', 'Ótimo ponto. Vamos levar para o próximo alinhamento.'],
      perguntas: [{ p: 'O que você faz o dia todo?', r: 'Reuniões. E entre as reuniões, eu marco reuniões. Toda reunião gera, no mínimo, outra reunião.', regra: 'reuniao-reuniao' }],
      extras: ['convite'] },
    { id: 'fausto', nome: 'Fausto', cargo: 'Especialista de Engenharia', dep: 'engenharia', andar: 'n2', x: 35, y: 4, dir: 'cima',
      look: L(1, 'curto', 6, 'social', 9, 'redondo', 'barba', 1),
      falas: ['Isso já aconteceu em 2019.', 'Eu avisei em 2019. Tem ata.', 'Não existe problema novo. Existe gente nova.'],
      perguntas: [{ p: 'O que aconteceu em 2019?', r: 'Tudo. Tudo aconteceu em 2019.', regra: '2019' }] },
    { id: 'lia', nome: 'Lia', cargo: 'Projetista', dep: 'engenharia', andar: 'n2', x: 41, y: 4, dir: 'cima',
      look: L(4, 'crespo', 0, 'polo', 0, 'nenhum', 'fone', 1),
      falas: ['Isso não estava no escopo.', 'Pode pedir. Só não estava no escopo.', 'O escopo é um documento sagrado que ninguém leu.'],
      perguntas: [{ p: 'O que estava no escopo, afinal?', r: 'Ninguém sabe. Por isso nada estava. Se não estava no escopo, não existe.', regra: 'escopo' }] },
    { id: 'davi', nome: 'Davi', cargo: 'Estagiário (sabe mais do sistema que todo mundo)', dep: 'engenharia', andar: 'n2', x: 35, y: 8, dir: 'cima',
      look: L(2, 'moicano', 9, 'moletom', 6, 'quadrado', 'fone', 0),
      falas: ['É só apertar Ctrl+Shift+F9. Ninguém sabe disso, mas está no sistema desde 2019.', 'Eu sou estagiário. Eu sei onde fica o botão.', 'Fiz um script que faz o relatório sozinho. Não conta para ninguém.'],
      perguntas: [{ p: 'Tem algum atalho no sistema?', r: 'Vários. O melhor é o botão "Gerar relatório" escondido no menu Ajuda. O estagiário sabe onde fica o botão.', regra: 'estagiario' }],
      extras: ['ajudaSistema'] },
    { id: 'wagner', nome: 'Wagner', cargo: 'Engenheiro sênior (chega às 6h)', dep: 'engenharia', andar: 'n2', x: 42, y: 8, dir: 'cima',
      look: L(0, 'curto', 1, 'social', 1, 'quadrado', 'caneca', 1),
      falas: ['Eu já estou aqui desde 6h.', 'Almoço? Eu almocei ontem.', 'Final de semana é só uma segunda-feira mais comprida.'],
      perguntas: [{ p: 'Você não cansa?', r: 'Cansar é para quem tem tempo livre. Eu tenho planilhas.' }] },
    { id: 'marcos', nome: 'Marcos', cargo: 'Gerente de Operações Integradas (seu chefe)', dep: 'operacoes', andar: 'n2', x: 41, y: 20, dir: 'baixo',
      look: L(1, 'curto', 5, 'social', 0, 'nenhum', 'nenhum', 4, 0),
      falas: ['Precisamos entregar.', 'Vamos alinhar.', 'Você tem cinco minutinhos?'],
      perguntas: [
        { p: 'O que exatamente faz Operações Integradas?', r: 'Vamos alinhar.' },
        { p: 'Quanto duram "cinco minutinhos"?', r: 'Você tem cinco minutinhos? (Quarenta e sete minutos depois, você descobriu.)', regra: 'cinco-minutinhos', t: 47 },
      ],
      extras: ['chefe'] },
    { id: 'julia', nome: 'Júlia', cargo: 'Analista de Operações Integradas', dep: 'operacoes', andar: 'n2', x: 6, y: 21, dir: 'cima',
      look: L(3, 'cacheado', 1, 'polo', 3, 'nenhum', 'caneca', 4),
      falas: ['Boas-vindas ao Operações Integradas! Ninguém sabe o que a gente faz, então a gente faz de tudo.', 'Se o Marcos perguntar, eu estou numa call.', 'Responda e-mail rápido, mas não rápido demais. Senão vira mais e-mail.'],
      perguntas: [
        { p: 'Alguma dica para sobreviver em reunião?', r: '"Conforme alinhado" resolve 90% das reuniões. Ninguém lembra o que foi alinhado, então ninguém contesta.', regra: 'conforme-alinhado' },
        { p: 'Responder a todos é uma boa ideia?', r: 'Nunca. Nunca responda a todos. Teve um "Responder a todos" em 2022 que durou três dias.', regra: 'reply-all' },
      ] },
    { id: 'thiago', nome: 'Thiago', cargo: 'Analista de Operações Integradas', dep: 'operacoes', andar: 'n2', x: 11, y: 21, dir: 'cima',
      look: L(2, 'curto', 0, 'moletom', 4, 'nenhum', 'nenhum', 4),
      falas: ['Tô fingindo que estou trabalhando há duas horas. É exaustivo.', 'Se perguntarem, essa planilha é sua. Brincadeira. Ou não.', 'Você viu o último pão de queijo? Eu vi. Eu sei de tudo.'],
      perguntas: [{ p: 'O que você está fazendo?', r: 'Tecnicamente, um relatório. Na prática, abri o relatório e fiquei olhando para ele.' }] },

    // ------------------------------------------------ 3º ANDAR
    { id: 'vera', nome: 'Dona Vera', cargo: 'Secretária da Diretoria', dep: 'diretoria', andar: 'n3', x: 24, y: 6, dir: 'cima',
      look: L(1, 'coque', 0, 'blazer', 2, 'quadrado', 'nenhum', 4),
      falas: ['A agenda do diretor está cheia até 2031. Mas posso tentar 2032.', 'Pode sentar. Não, aí não. Nem aí.', 'Aqui as reuniões têm 3 horas. As de 1 hora também.'],
      perguntas: [{ p: 'Como eu consigo falar com o diretor?', r: 'Entregando resultados, ganhando influência e sendo convidado. Na Diretoria, toda reunião tem 3 horas. As de 1 hora também.', regra: 'diretoria' }] },
    { id: 'augusto', nome: 'Dr. Augusto', cargo: 'Diretor-geral', dep: 'diretoria', andar: 'n3', x: 39, y: 5, dir: 'baixo',
      look: L(0, 'curto', 6, 'blazer', 2, 'nenhum', 'nenhum', 4),
      falas: ['Precisamos ser mais ágeis. Vamos montar um comitê para isso.', 'Energia é o nosso negócio. Sinergia é o nosso propósito.', 'Eu leio todos os relatórios. O resumo. A primeira linha.'],
      perguntas: [{ p: 'Qual a estratégia da empresa?', r: 'Fazer mais com menos. E, se possível, com menos ainda.' }],
      extras: ['diretor'] },
    { id: 'cristina', nome: 'Cristina', cargo: 'Diretora Financeira', dep: 'diretoria', andar: 'n3', x: 8, y: 4, dir: 'baixo',
      look: L(3, 'longo', 0, 'blazer', 3, 'escuro', 'nenhum', 4),
      falas: ['Cortamos 12% dos custos. Agora o café é em pó.', 'Um centavo aqui, um centavo ali. É assim que se compra um iate.', 'Orçamento é como pão de queijo: sempre acaba antes do fim do mês.'],
      perguntas: [{ p: 'Tem orçamento para aumentos?', r: 'Tem. Ele está guardado num lugar seguro: o próximo ano.' }] },
  ];

  // Figurantes: gente de todos os setores, com falas soltas
  const FALAS_FIG = [
    'Agora não, estou numa call.', 'Bom dia! Ou boa tarde. Já perdi a noção.', 'Chegou agora? Força.',
    'Tem reunião às 14h? Sempre tem reunião às 14h.', 'Se você descobrir o que Operações Integradas faz, me conta.',
    'Estou esperando o sistema carregar desde as 9h.', 'Fui fazer um café e voltei com três tarefas.',
    'O ar-condicionado está no modo Polo Norte de novo.', 'Eu só vim pegar o carregador.', 'Shhh. Estou fingindo que estou em reunião.',
    'Você viu o e-mail? Não? Melhor assim.', 'Sexta-feira é um estado de espírito.', 'Meu crachá não abre a catraca desde março. Eu pulo.',
  ];
  const fig = (andar, x, y, dir, seed, extra = {}) => ({
    id: 'fig-' + andar + '-' + x + '-' + y, figurante: true, nome: 'Colega', cargo: 'Alguém da empresa', andar, x, y, dir,
    look: F.Arte.lookAleatorio(F.u.semente(seed)), falas: FALAS_FIG, perguntas: [], ...extra,
  });
  F.FIGURANTES = [
    fig('terreo', 3, 12, 'cima', 11, { look: Object.assign(F.Arte.lookAleatorio(F.u.semente(11)), { roupa: 'macacao', corRoupa: F.PALETA.roupas[0], acessorio: 'capacete' }), dep: 'fabrica' }),
    fig('terreo', 13, 12, 'cima', 12, { look: Object.assign(F.Arte.lookAleatorio(F.u.semente(12)), { roupa: 'macacao', corRoupa: F.PALETA.roupas[0], acessorio: 'capacete' }), dep: 'fabrica' }),
    fig('terreo', 32, 9, 'cima', 13, { dep: 'fabrica' }),
    fig('n1', 11, 4, 'cima', 21), fig('n1', 37, 4, 'cima', 22), fig('n1', 31, 22, 'cima', 23), fig('n1', 13, 23, 'dir', 24),
    fig('n2', 9, 8, 'cima', 31), fig('n2', 26, 9, 'cima', 32), fig('n2', 41, 8, 'cima', 33, { x: 36, y: 4 }),
    fig('n2', 4, 24, 'cima', 34), fig('n2', 12, 24, 'cima', 35), fig('n2', 22, 12, 'cima', 36),
  ];
})();

// ============================================================
//  PESSOAS NO MAPA (posição, passeio, desenho, marcadores)
// ============================================================
F.Pessoas = {
  vivos: {},  // id -> objeto no mapa (guarda a posição entre andares)

  doAndar(andar) {
    const T = F.T, S = F.S;
    const lista = [];
    [...F.NPCS, ...F.FIGURANTES].forEach((d) => {
      if (d.andar !== andar) return;
      if (d.aparece && !d.aparece(S)) return;
      if (S && S.flags['sumiu-' + d.id]) return;
      let n = this.vivos[d.id];
      if (!n) {
        n = { def: d, id: d.id, x: d.x * T + T / 2, y: d.y * T + T - 6, dir: d.dir || 'baixo', casa: { x: d.x, y: d.y }, passo: 0, espera: 2 + Math.random() * 4, caminho: null, bolha: null };
        this.vivos[d.id] = n;
      }
      lista.push(n);
    });
    return lista;
  },

  update(n, dt, ativo) {
    if (n.bolha) { n.bolha.t -= dt; if (n.bolha.t <= 0) n.bolha = null; }
    if (!ativo) return;
    // de vez em quando fala sozinho
    if (!n.bolha && Math.random() < dt * 0.012 && n.def.falas.length) n.bolha = { texto: F.u.pick(n.def.falas), t: 4 };
    const raio = n.def.anda || 0;
    if (!raio) return;
    if (n.caminho && n.caminho.length) {
      const p = n.caminho[0];
      const ax = p.x - n.x, ay = p.y - n.y, d = Math.hypot(ax, ay);
      if (d < 2) { n.caminho.shift(); return; }
      const v = 45 * dt;
      const dx = (ax / d) * Math.min(v, d), dy = (ay / d) * Math.min(v, d);
      const antes = n.x + n.y;
      F.Mundo.mover(n, dx, dy);
      if (Math.abs(n.x + n.y - antes) < 0.01) { n.caminho = null; n.espera = 1; }
      n.passo += dt * 7;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esq' : 'dir') : (dy < 0 ? 'cima' : 'baixo');
      return;
    }
    n.espera -= dt;
    if (n.espera > 0) return;
    n.espera = 2 + Math.random() * 5;
    const T = F.T;
    const tx = n.casa.x + F.u.int(-raio, raio), ty = n.casa.y + F.u.int(-raio, raio);
    const c = F.Mundo.caminho(n, { x: tx * T + T / 2, y: ty * T + T - 6 });
    if (c && c.length < raio * 3) n.caminho = c;
  },

  draw(ctx, n, cx, cy) {
    const andando = n.caminho && n.caminho.length;
    F.Arte.pessoa(ctx, n.x - cx, n.y - cy, n.def.look, n.dir, andando ? n.passo : 0, { parado: !andando });
  },

  marcador(ctx, n, cx, cy, t) {
    const x = Math.round(n.x - cx), y = Math.round(n.y - cy - 52 + Math.sin(t * 4 + n.x) * 1.5);
    const m = F.Interacao ? F.Interacao.marca(n) : null;
    if (m) {
      const cor = m === 'missao' ? '#3b8cff' : '#ffd23f';
      ctx.fillStyle = '#000'; ctx.fillRect(x - 5, y - 9, 10, 13);
      ctx.fillStyle = cor; ctx.fillRect(x - 4, y - 8, 8, 11);
      ctx.fillStyle = '#000';
      if (m === 'missao') { ctx.fillRect(x - 1, y - 6, 2, 2); ctx.fillRect(x - 2, y - 4, 4, 2); ctx.fillRect(x - 1, y - 2, 2, 2); }
      else { ctx.fillRect(x - 1, y - 6, 2, 5); ctx.fillRect(x - 1, y, 2, 2); }
    }
    if (n.bolha && !m) {
      ctx.font = '8px "Pixelify Sans", monospace';
      const txt = n.bolha.texto.length > 46 ? n.bolha.texto.slice(0, 44) + '…' : n.bolha.texto;
      const w = Math.ceil(ctx.measureText(txt).width) + 8;
      const bx = F.u.clamp(x - w / 2, 2, ctx.canvas.width - w - 2) | 0, by = y - 6;
      ctx.globalAlpha = Math.min(1, n.bolha.t);
      ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 11, w + 2, 14);
      ctx.fillStyle = '#ffffe1'; ctx.fillRect(bx, by - 10, w, 12);
      ctx.fillStyle = '#000'; ctx.fillText(txt, bx + 4, by - 1);
      ctx.globalAlpha = 1;
    }
  },
};
