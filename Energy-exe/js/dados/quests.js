// ============================================================
//  ★ MISSÕES DE INVESTIGAÇÃO E TAREFAS
//  Uma missão tem passos. Cada passo acontece num lugar:
//    alvo: 'npc:id'  conversar com alguém
//          'obj:acao' usar um objeto (ex.: 'obj:estoque')
//          'mesa'    no seu computador
//  O passo mostra "texto" e, se tiver "escolhas", cada escolha pode
//  levar a outro passo: prox: número do passo | 'fim' | 'falha'.
//  Sem prox, vai para o próximo passo da lista.
//
//  oferta: quem oferece a missão (a pessoa fica com "!")
//  tarefa: true  = é uma tarefa do dia, mandada pelo chefe
//  prazo: minutos para terminar depois de aceitar
// ============================================================
F.QUESTS = {
  // ---------------------------------------------------- INVESTIGAÇÕES
  'painel-472': {
    titulo: 'O painel #472', dep: 'fabrica',
    oferta: { npc: 'priscila', cond: (S) => S.dia >= 2, texto: 'Priscila: "O painel #472 está apresentando uma falha. A luz vermelha não para de piscar e ninguém descobriu por quê. Você pode investigar?"', aceitar: 'Vou descobrir o que é.', recusar: 'Agora não dá.' },
    passos: [
      { alvo: 'obj:painel472', dica: 'Examine o painel #472 (Testes, térreo).',
        texto: 'A luz vermelha pisca num ritmo estranho: três... pausa... dois... pausa.',
        escolhas: [
          { t: 'Investigar a fundo.', hab: 'tecnico',
            ok: { fx: { t: 60, prod: 4 }, r: 'Você abre o painel e encontra um cabo ligado num lugar estranho. O cabo sobe pela parede... até o 1º andar?', prox: 3 },
            falha: { fx: { t: 60, est: 8 }, r: 'Você abre o painel e fecha de novo, com cuidado. Melhor perguntar para alguém.', prox: 1 } },
          { t: '"Já tentou desligar e ligar?"', regra: 'desligar-ligar', fx: { t: 5 }, r: 'Você desliga e liga. A luz para... e volta. Agora pisca em outra ordem. Progresso?', prox: 1 },
          { t: 'Perguntar para o Renan.', fx: { t: 2 }, prox: 1 },
        ] },
      { alvo: 'npc:renan', dica: 'Pergunte para o Renan (Testes, térreo).',
        texto: 'Renan: "Três, depois dois? Esse é um código de erro de 2019. Pergunta para o Fausto, da Engenharia. Ele lembra de tudo que aconteceu em 2019."', fx: { t: 10, aprende: '2019' } },
      { alvo: 'npc:fausto', dica: 'Fale com o Fausto (Engenharia, 2º andar).',
        texto: 'Fausto nem levanta os olhos: "Três, dois? Já aconteceu em 2019. Interferência. Alguém ligou o painel na mesma tomada de outra coisa. Siga o cabo."', fx: { t: 15 } },
      { alvo: 'obj:microondas', dica: 'Siga o cabo misterioso até a copa (1º andar).',
        texto: 'Atrás do micro-ondas, você encontra o cabo do painel #472 numa extensão... junto com o micro-ondas. Toda vez que alguém esquenta a marmita, o painel falha.',
        escolhas: [
          { t: 'Religar o painel no lugar certo.', fx: { rep: 8, prod: 4, dep: { fabrica: 10 }, t: 30, fama: 1 }, r: 'Mistério resolvido. O painel #472 nunca mais falha. A copa perde uma tomada.', prox: 'fim' },
          { t: 'Proibir o micro-ondas das 12h às 13h.', perigo: true, fx: { fama: 3, dep: { comercial: -10, logistica: -8, fabrica: 8 }, t: 10 }, r: 'O painel funciona. A copa declara guerra.', prox: 'fim' },
        ] },
    ],
    fim: { texto: 'Priscila: "Você resolveu o #472?! Vou colocar no laudo. Com o seu nome. Em letra normal."', fx: { rep: 6, tarefa: 1, inf: 3, dep: { fabrica: 6 } } },
  },

  'material-sumido': {
    titulo: 'O material que precisava chegar ontem', dep: 'compras',
    passos: [
      { alvo: 'npc:kleber', dica: 'Pergunte na Logística (1º andar) onde está o material.',
        texto: 'Kléber: "O sistema diz que o material existe. Está no estoque, prateleira B. O estoque diz que não. Eu acredito nos dois."',
        escolhas: [
          { t: 'Ir conferir no estoque.', fx: { t: 5 }, prox: 1 },
          { t: 'Mandar um e-mail para a Sandra.', regra: 'sandra', fx: { t: 5, dep: { logistica: 4 } }, r: 'Sandra responde em 3 minutos: "Está na Expedição, sem etiqueta. Pede para o Marquinhos."', prox: 2 },
        ] },
      { alvo: 'obj:estoque', dica: 'Confira as prateleiras da Expedição (térreo).',
        texto: 'Prateleira B: vazia. Mas na prateleira C tem uma caixa com a etiqueta "BANANA". Você abre: é o material.',
        escolhas: [
          { t: 'Etiquetar direito e levar para o Marquinhos.', fx: { t: 20, dep: { fabrica: 6 } }, prox: 2 },
          { t: 'Deixar como "BANANA" e avisar a Márcia.', fx: { fama: 1, t: 5 }, r: 'Agora a Márcia pede "banana" para o fornecedor. Funciona.', prox: 'fim' },
        ] },
      { alvo: 'npc:marquinhos', dica: 'Leve o material para o Marquinhos (Expedição, térreo).',
        texto: 'Marquinhos: "Sem etiqueta não sai." Você mostra a etiqueta nova. "Ah. Então sai."', fx: { t: 15, aprende: 'etiqueta' } },
    ],
    fim: { texto: 'Márcia: "CHEGOU?! Você é a melhor pessoa desta empresa." (Ela diz isso para todo mundo, mas hoje é verdade.)', fx: { rep: 10, tarefa: 1, dep: { compras: 12, logistica: 6 } } },
  },

  'pedido-8812': {
    titulo: 'Onde está o pedido 8812?', dep: 'comercial',
    oferta: { npc: 'bianca', cond: (S) => S.dia >= 3, texto: 'Bianca: "O cliente diz que o pedido 8812 não chegou. Você descobre onde está o pedido? O cliente quer uma resposta em 15 minutos. Brincadeira. Mas rápido."', aceitar: 'Deixa comigo.', recusar: 'Isso é com a Logística.' },
    passos: [
      { alvo: 'npc:kleber', dica: 'Pergunte na Logística (1º andar).', texto: 'Kléber: "8812? O sistema diz que saiu há três dias." Ele aponta para a tela com orgulho.', fx: { t: 10 } },
      { alvo: 'npc:marquinhos', dica: 'Confirme na Expedição (térreo).',
        texto: 'Marquinhos: "Saiu? Está bem ali, ó. Sem nota fiscal não sai. O Seu Zé está esperando."',
        escolhas: [
          { t: 'Falar com o Seu Zé.', fx: { t: 2 }, prox: 2 },
          { t: 'Mandar um e-mail para a Sandra.', regra: 'sandra', fx: { t: 5, dep: { logistica: 8 } }, r: 'Sandra: "A nota está no meu e-mail. Já mandei para o Zé." Pronto. Simples assim.', prox: 'fim' },
        ] },
      { alvo: 'npc:ze', dica: 'Fale com o Seu Zé, ao lado do caminhão (Expedição).',
        texto: 'Seu Zé: "Estou esperando há 40 minutos. Falta a nota. A nota é com o Fiscal. E ninguém sabe onde fica o Fiscal."',
        escolhas: [
          { t: 'Procurar o Fiscal pelo prédio.', fx: { t: 60, est: 10, aprende: 'fiscal' }, r: 'Você procura em todos os andares. O Fiscal não existe. Ou existe e não quer ser encontrado. Na volta, a Sandra já tinha resolvido.', prox: 'fim' },
          { t: 'Pedir ajuda para a Sandra.', fx: { aprende: 'fiscal' }, prox: 3 },
          { t: 'Liberar o caminhão sem nota.', perigo: true, fx: { rep: -10, est: 10, dep: { fabrica: 4, qualidade: -10 } }, r: 'O caminhão sai. Duas horas depois, ele volta. Pararam ele na estrada.', prox: 'falha' },
        ] },
      { alvo: 'npc:sandra', dica: 'Peça ajuda para a Sandra (Logística, 1º andar).', texto: 'Sandra: "Ah, a nota? Está aqui." Ela imprime. A impressora não ousa travar.', fx: { t: 10, dep: { logistica: 6 }, aprende: 'sandra' } },
    ],
    fim: { texto: 'Bianca: "Chegou! O cliente mandou um emoji de joinha. É o maior elogio que ele já fez."', fx: { rep: 10, tarefa: 1, inf: 3, dep: { comercial: 10 } } },
    falha: { texto: 'Bianca: "O cliente cancelou o pedido." Ninguém te culpa. Todo mundo te culpa.', fx: { rep: -5, dep: { comercial: -6 } } },
  },

  'caminhao-40': {
    titulo: 'O caminhão está esperando há 40 minutos', dep: 'fabrica',
    oferta: { npc: 'ze', cond: (S) => S.dia >= 4 && (!S.quests['pedido-8812'] || S.quests['pedido-8812'].estado !== 'ativa'), texto: 'Seu Zé: "Trouxe material para vocês. Tô esperando há 40 minutos para descarregar. Ninguém recebe. Você recebe?"', aceitar: 'Vou ver quem recebe.', recusar: 'Não sou daqui.' },
    passos: [
      { alvo: 'npc:osvaldo', dica: 'Fale com o Seu Osvaldo, do almoxarifado (Expedição).', texto: 'Seu Osvaldo: "Eu recebo. Mas preciso do pedido de compra aprovado. Quem aprova é o Carlos."', fx: { t: 10, aprende: 'carlos-aprova' } },
      { alvo: 'npc:fabiano', dica: 'Peça a aprovação em Compras (1º andar).',
        texto: (S) => (S.dia >= 16 ? 'Fabiano: "O Carlos voltou! Fala direto com ele, na mesa do fundo."' : 'Fabiano: "O Carlos está de férias até o dia 16. Nada dele anda."'),
        escolhas: [
          { t: 'Falar com o Carlos.', se: (S) => S.dia >= 16, prox: 2 },
          { t: 'Pedir para a Sandra dar um jeito.', regra: 'sandra', fx: { t: 10, dep: { logistica: 5 } }, r: 'A Sandra tem um carimbo escrito "p/ Carlos". Você decide não perguntar.', prox: 'fim' },
          { t: 'Aprovar você mesmo.', perigo: true, fx: { rep: -6, inf: 4, docs: 3, flag: 'aprovouSozinho' }, r: 'Você assina "Carlos" com uma letra suspeita. Funciona. A Qualidade vai descobrir um dia.', prox: 'fim' },
          { t: 'Dizer para o Seu Zé esperar o Carlos.', fx: { est: -3, aprende: 'carlos-ferias' }, r: 'Nada acontece quando o Carlos está de férias.', prox: 'falha' },
        ] },
      { alvo: 'npc:carlos', dica: 'Fale com o Carlos (Compras, 1º andar).', texto: 'Carlos: "Aprovado!" Ele nem olhou.', fx: { t: 5 } },
    ],
    fim: { texto: 'Seu Zé finalmente descarrega. "Foram só 3 horas e 40 minutos. Recorde!"', fx: { rep: 8, tarefa: 1, dep: { fabrica: 8, compras: 4 } } },
    falha: { texto: 'O Seu Zé foi embora com o material. Volta semana que vem. Talvez.', fx: { rep: -4, dep: { fabrica: -6 } } },
  },

  'proposta-15': {
    titulo: 'O cliente quer uma resposta em 15 minutos', dep: 'comercial', prazo: 150,
    oferta: { npc: 'rodrigo', cond: (S) => S.dia >= 5 && S.minuto < 15 * 60, texto: 'Rodrigo: "Socorro. O cliente quer uma resposta em 15 minutos sobre o prazo de entrega. Alguém prometeu 10 dias. Descobre quem prometeu esse prazo?"', aceitar: 'Vou descobrir.', recusar: 'Não fui eu.' },
    passos: [
      { alvo: 'npc:lia', dica: 'Pergunte para a Engenharia se dá para fazer (2º andar).', texto: 'Lia: "Dez dias? Quem prometeu isso? Não estava no escopo. Dá em 15, se ninguém mudar nada. Alguém sempre muda."', fx: { t: 10 } },
      { alvo: 'npc:gustavo', dica: 'Descubra com o PM quem prometeu o prazo (2º andar).', texto: 'Gustavo: "Não fui eu. Vamos marcar uma reunião para descobrir quem foi?" Você recusa a reunião. Ele parece magoado.', fx: { t: 10 } },
      { alvo: 'npc:rodrigo', dica: 'Volte ao Comercial e confronte o Rodrigo (1º andar).',
        texto: 'Rodrigo, depois de uma longa pausa: "Fui eu. Mas o cliente parecia tão feliz!"',
        escolhas: [
          { t: 'Negociar 15 dias e defender a Engenharia.', hab: 'comunicador',
            ok: { fx: { rep: 10, dep: { engenharia: 10, comercial: 4 } }, r: 'O cliente aceita 15 dias. A Lia te manda um "obrigada!!" com dois pontos de exclamação.' },
            falha: { fx: { rep: 2, dep: { comercial: -4 } }, r: 'O cliente aceita 15 dias, mas pede desconto. O Rodrigo dá. O Rodrigo sempre dá.' } },
          { t: 'Deixar os 10 dias.', fx: { dep: { engenharia: -10 }, est: 5 }, r: 'Dez dias. A Engenharia vai virar a noite. A Lia te olha diferente agora.' },
          { t: 'Contar para a Diretoria quem prometeu.', perigo: true, fx: { inf: 6, dep: { comercial: -15 }, conta: { culpas: 1 } }, r: 'O Rodrigo leva uma bronca. Ele nunca mais te convida para o happy hour.' },
        ] },
    ],
    fim: { texto: 'Resposta enviada ao cliente. Foram 15 minutos? Não. Mas foi hoje.', fx: { tarefa: 1, rep: 4, inf: 2 } },
    falha: { texto: 'O cliente cansou de esperar e ligou direto para o diretor. Seu nome foi citado. Não de um jeito bom.', fx: { rep: -6, dep: { comercial: -6 } } },
  },

  'ncc': {
    titulo: 'Existe uma não conformidade', dep: 'qualidade',
    oferta: { npc: 'ivo', cond: (S) => S.dia >= 4, texto: 'Ivo: "Existe uma não conformidade. Um painel saiu sem o segundo teste. Descubra quem deveria ter feito isso?"', aceitar: 'Vou investigar.', recusar: 'Não é comigo.' },
    passos: [
      { alvo: 'npc:helena', dica: 'Fale com a Helena sobre o procedimento (Qualidade, 2º andar).', texto: 'Helena: "O procedimento PQ-042 diz que os painéis são testados duas vezes. Deveria ter alguém conferindo." Três documentos novos nascem só por você ter perguntado.', fx: { docs: 2, t: 15 } },
      { alvo: 'npc:valdir', dica: 'Veja como é feito de verdade na Montagem (térreo).',
        texto: 'Seu Valdir: "Duas vezes? A gente testa uma. A segunda é o cliente." O procedimento diz uma coisa. A realidade diz outra.',
        escolhas: [
          { t: 'Atualizar o procedimento para a realidade.', fx: { docs: 5, dep: { fabrica: 8, qualidade: -4 }, t: 60 }, r: 'Agora o procedimento diz "uma vez". A Helena precisa de quatro dias para aceitar.' },
          { t: 'Ajustar a realidade ao procedimento.', fx: { dep: { fabrica: -8, qualidade: 10 }, rep: 4, t: 30 }, r: 'A fábrica passa a testar duas vezes. A produção cai 30%. A Qualidade está radiante.' },
          { t: 'Abrir uma NCC sobre a NCC.', perigo: true, fx: { docs: 12, fama: 2, dep: { qualidade: 12 }, est: 8 }, r: 'O Ivo fica tão feliz que precisa sentar. A burocracia te abraça.' },
        ] },
    ],
    fim: { texto: 'Ivo: "NCC encerrada! Vou abrir outra para registrar o encerramento."', fx: { tarefa: 1, rep: 5, dep: { qualidade: 4 } } },
  },

  'alteracao': {
    titulo: 'A alteração realmente necessária?', dep: 'engenharia',
    oferta: { npc: 'lia', cond: (S) => S.dia >= 6, texto: 'Lia: "Chegou um pedido: o projeto precisa de uma alteração. São 3 semanas de trabalho. Descubra se a alteração é realmente necessária? Por favor?"', aceitar: 'Vou descobrir.', recusar: 'Faz a alteração e pronto.' },
    passos: [
      { alvo: 'npc:gustavo', dica: 'Pergunte ao PM de onde veio o pedido (2º andar).', texto: 'Gustavo: "O cliente pediu. Acho. Foi numa reunião. Ou num corredor."', fx: { t: 10 } },
      { alvo: 'npc:rodrigo', dica: 'Pergunte no Comercial se o cliente pediu mesmo (1º andar).', texto: 'Rodrigo: "O cliente não pediu. Eu sugeri. Ele disse \'pode ser\'."', fx: { t: 10 } },
      { alvo: 'npc:fausto', dica: 'Peça a opinião do especialista (Engenharia, 2º andar).',
        texto: 'Fausto: "Essa alteração? Foi feita em 2019. E desfeita em 2020."',
        escolhas: [
          { t: 'Cancelar a alteração.', fx: { rep: 8, prod: 4, dep: { engenharia: 12, comercial: -4 } }, r: 'Você economizou três semanas de trabalho. A Lia te dá um chocolate.' },
          { t: 'Fazer mesmo assim.', fx: { est: 8, dep: { comercial: 6, engenharia: -8 } }, r: 'A alteração é feita. Em 2027, alguém vai desfazer.' },
          { t: '"Conforme alinhado."', regra: 'conforme-alinhado', fx: { inf: 5 }, r: 'Ninguém sabe mais quem pediu o quê. O assunto morre em paz.' },
        ] },
    ],
    fim: { texto: 'Mistério da alteração resolvido. A Engenharia te olha com outros olhos.', fx: { tarefa: 1, rep: 3 } },
  },

  'status-report': {
    titulo: 'O status report (e o cronograma que mudou)', dep: 'pm',
    passos: [
      { alvo: 'npc:wagner', dica: 'Colete informações com a Engenharia (2º andar).', texto: 'Wagner: "A Engenharia está em dia. Eu estou aqui desde 6h." Ele mostra 40 abas abertas como prova.', fx: { t: 10 } },
      { alvo: 'npc:kleber', dica: 'Colete informações com a Logística (1º andar).', texto: 'Kléber: "Atrasou porque o material não chegou. O material não chegou porque precisava da aprovação do Carlos."', fx: { t: 10, aprende: 'carlos-aprova' } },
      { alvo: 'mesa', dica: 'Escreva o status report no seu computador (2º andar).',
        texto: 'Hora de escrever. O projeto está três semanas atrasado. Como você vai reportar?',
        escolhas: [
          { t: 'A verdade: vermelho, por causa da aprovação.', fx: { rep: 6, inf: 4, est: 6, dep: { pm: 4 }, reuniao: 'posmortem' }, r: 'A Renata lê, respira fundo e diz: "Finalmente alguém com coragem." O Gustavo marca uma reunião de crise.' },
          { t: 'Verde. Melancia, mas verde.', regra: 'verde-melancia', fx: { rep: 2, est: -4, flag: 'melancia' }, r: 'O relatório está lindo. Verde por fora. Daqui a duas semanas, alguém corta a melancia.' },
          { t: 'Culpar o Carlos, que está de férias.', regra: 'carlos-ferias', fx: { rep: 4, dep: { compras: -8 } }, r: 'Funciona perfeitamente. O Carlos nunca vai saber. Até voltar.' },
          { t: 'Usar o script do Davi.', se: (S) => S.flags.scriptDavi, fx: { prod: 4, fama: 1 }, r: 'O script gera um relatório perfeito em 5 segundos. Com um gráfico que você não entende.' },
        ] },
    ],
    fim: { texto: 'Renata: "Status report entregue! Agora vem o status report do status report."', fx: { tarefa: 1, rep: 4 } },
  },

  // ---------------------------------------------------- TAREFAS DO DIA (mandadas pelo Marcos)
  't-planilha': {
    titulo: 'Atualizar a planilha de indicadores', tarefa: true,
    passos: [{ alvo: 'mesa', dica: 'No seu computador (2º andar).', texto: 'A planilha de indicadores tem 47 abas. Uma delas se chama "NÃO APAGAR (2)".',
      escolhas: [
        { t: 'Atualizar com cuidado.', fx: { t: 60, prod: 3, est: 4, rep: 3 }, r: 'Planilha atualizada. Ninguém vai abrir, mas está atualizada.' },
        { t: 'Inventar números bonitos.', perigo: true, fx: { t: 10, rep: 2, flag: 'numerosInventados' }, r: 'Os indicadores nunca estiveram tão bons. Ninguém pergunta como.' },
        { t: 'Automatizar a atualização.', hab: 'tecnico',
          ok: { fx: { t: 45, automacao: 1, prod: 6, rep: 4 }, r: 'Agora a planilha se atualiza sozinha. Você ganhou uma hora por semana. Para sempre.' },
          falha: { fx: { t: 60, est: 8, docs: 2 }, r: 'A automação apagou a aba "NÃO APAGAR (2)". Agora você entende o nome.' } },
      ] }],
    fim: { texto: '', fx: {} },
  },
  't-relatorio': {
    titulo: 'Levar o relatório mensal para a Qualidade', tarefa: true,
    passos: [{ alvo: 'npc:helena', dica: 'Entregue para a Helena (Qualidade, 2º andar).', texto: 'Helena: "Recebido. Falta a assinatura, o carimbo e a evidência do carimbo." Mesmo assim, ela aceita.', fx: { docs: 2, t: 15, dep: { qualidade: 3 } } }],
    fim: { texto: '', fx: { rep: 2 } },
  },
  't-sala': {
    titulo: 'Reservar uma sala para o Marcos', tarefa: true,
    passos: [{ alvo: 'npc:renata', dica: 'Peça para a Renata, do PMO (2º andar).', texto: 'Renata: "Todas as salas estão reservadas pelo Gustavo até dezembro."',
      escolhas: [
        { t: 'Pedir para o Gustavo liberar.', fx: { t: 20, dep: { pm: 3 }, reuniao: 'alinhamento' }, r: 'Ele libera a sala. E marca uma reunião para alinhar a liberação.' },
        { t: 'Usar a copa como sala de reunião.', perigo: true, fx: { t: 5, fama: 1, dep: { comercial: -3 } }, r: 'Reunião na copa. A Kátia participa sem ser convidada e traz informações valiosas.' },
        { t: 'Reservar no nome do Gustavo.', perfil: 'politico', fx: { t: 5, inf: 3 }, r: 'O sistema aceita. O Gustavo nem percebe. Ele tem tantas reservas que esqueceu quais são dele.' },
      ] }],
    fim: { texto: '', fx: { rep: 2 } },
  },
  't-orcamento': {
    titulo: 'Pedir três orçamentos para Compras', tarefa: true,
    passos: [{ alvo: 'npc:fabiano', dica: 'Fale com o Fabiano (Compras, 1º andar).', texto: 'Fabiano: "Três orçamentos? Te dou dois e uma promessa."', fx: { t: 20, dep: { compras: 3 } } }],
    fim: { texto: '', fx: { rep: 2 } },
  },
  't-apresentacao': {
    titulo: 'Fazer uma apresentação de 40 slides para uma reunião de 15 minutos', tarefa: true,
    passos: [{ alvo: 'mesa', dica: 'No seu computador (2º andar).', texto: 'Quarenta slides. Quinze minutos. O Marcos pediu "algo simples".',
      escolhas: [
        { t: 'Fazer os 40 slides.', fx: { t: 120, est: 8, rep: 5 }, r: 'Quarenta slides. Na reunião, o Marcos passa direto para o último.' },
        { t: 'Fazer 4 slides muito bons.', hab: 'comunicador',
          ok: { fx: { t: 50, rep: 8, inf: 3 }, r: 'Quatro slides. A reunião acaba em 10 minutos. Pela primeira vez, todos saem felizes.' },
          falha: { fx: { t: 50, rep: -2 }, r: 'Marcos: "Só isso?" Ele queria os 40.' } },
        { t: 'Reaproveitar a apresentação de 2019.', regra: '2019', fx: { t: 10, rep: 3, fama: 1 }, r: 'Ninguém percebe. Tudo aconteceu em 2019, inclusive esta apresentação.' },
      ] }],
    fim: { texto: '', fx: {} },
  },
  't-foto': {
    titulo: 'Tirar uma foto da linha de montagem para a apresentação', tarefa: true,
    passos: [{ alvo: 'obj:esteira', dica: 'Vá até a linha de montagem (térreo).', texto: 'Você tira a foto. Na foto, o Jefferson está bocejando. Na segunda, também.', fx: { t: 10, dep: { fabrica: 2 } } }],
    fim: { texto: '', fx: { rep: 1 } },
  },
  't-imprimir': {
    titulo: 'Imprimir o contrato da Bianca', tarefa: true, aoComecar: (S) => { S.flags.impressoraTravada = true; },
    passos: [
      { alvo: 'obj:impressora', dica: 'Use a impressora (hall do 1º andar).', evento: 'impressora-travou', ate: (S) => !S.flags.impressoraTravada },
      { alvo: 'npc:bianca', dica: 'Entregue o contrato para a Bianca (Comercial, 1º andar).', texto: 'Bianca: "Ah, obrigada! Na verdade, o cliente quer digital. Mas obrigada!"', fx: { t: 5, dep: { comercial: 3 } } },
    ],
    fim: { texto: '', fx: { rep: 2 } },
  },
  't-ata': {
    titulo: 'Escrever a ata da última reunião', tarefa: true,
    passos: [{ alvo: 'mesa', dica: 'No seu computador (2º andar).', texto: 'A última reunião durou uma hora. Você lembra de três frases e de um café.',
      escolhas: [
        { t: 'Escrever tudo que lembra.', fx: { t: 30, rep: 3 }, r: 'Ata enviada. Duas pessoas respondem corrigindo coisas que elas mesmas falaram.' },
        { t: '"Ficou tudo conforme alinhado."', regra: 'conforme-alinhado', fx: { t: 2, inf: 3 }, r: 'Uma linha. Ninguém contesta. Ninguém lê.' },
        { t: 'Inventar decisões.', perigo: true, fx: { t: 10, inf: 4, rep: -2, fama: 1 }, r: 'Segundo a sua ata, ficou decidido que sexta é dia de pizza. Ninguém lembra de ter decidido isso, mas ninguém quer contestar.' },
      ] }],
    fim: { texto: '', fx: {} },
  },
  't-cracha': {
    titulo: 'Buscar o crachá do estagiário novo', tarefa: true,
    passos: [
      { alvo: 'npc:lucia', dica: 'Pegue o crachá na Recepção (térreo).', texto: 'Dona Lúcia: "Crachá do estagiário? Está aqui. A foto ficou ótima. Ele estava piscando."', fx: { t: 10 } },
      { alvo: 'npc:davi', dica: 'Entregue o crachá para o Davi (Engenharia, 2º andar).', texto: 'Davi: "Valeu! Faz três meses que eu entro pulando a catraca."', fx: { t: 5, dep: { engenharia: 3 } } },
    ],
    fim: { texto: '', fx: { rep: 2 } },
  },
  't-estoque': {
    titulo: 'Conferir o estoque de painéis', tarefa: true,
    passos: [{ alvo: 'obj:estoque', dica: 'Confira as prateleiras da Expedição (térreo).', texto: 'O sistema diz 40 painéis. Você conta 38 e uma caixa escrita "BANANA".',
      escolhas: [
        { t: 'Reportar 38.', fx: { t: 30, rep: 3, dep: { logistica: -2 } }, r: 'A Logística não gostou da verdade. A Qualidade adorou.' },
        { t: 'Reportar 40, como o sistema.', fx: { t: 20, est: -2 }, r: 'Se o sistema diz, quem é você para discordar?' },
        { t: 'Abrir a caixa "BANANA".', fx: { t: 25, rep: 4, aprende: 'atalho-estoque' }, r: 'Dentro dela: os 2 painéis que faltavam. Mistério resolvido.' },
      ] }],
    fim: { texto: '', fx: {} },
  },
};

// sorteio das tarefas do dia
F.TAREFAS_POOL = ['t-planilha', 't-relatorio', 't-sala', 't-orcamento', 't-apresentacao', 't-foto', 't-imprimir', 't-ata', 't-cracha', 't-estoque'];
