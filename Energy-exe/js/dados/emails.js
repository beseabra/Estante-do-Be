// ============================================================
//  ★ E-MAILS (o Outlouco)
//  Cada e-mail:
//    id, de, assunto, corpo
//    chega: { dia, min (minuto do dia: 8h = 480), chance, cd, cond(S) }
//           sem "dia" = pode chegar em qualquer dia (sorteado)
//    escolhas (opcional, mesmo formato das situações)
//    aoLer (opcional): efeitos ao abrir
// ============================================================
(function () {
  const sabe = (S, r) => S.regras.includes(r);
  F.EMAILS = [
    { id: 'boas-vindas', de: 'Patrícia (RH)', assunto: 'Boas-vindas à Voltagem S.A.! ⚡',
      chega: { dia: 1, min: 8 * 60 + 15 },
      corpo: 'Que alegria ter você com a gente!\n\nAlgumas informações importantes:\n• Seu chefe é o Marcos (2º andar, sala de vidro).\n• Sua mesa fica em Operações Integradas, também no 2º andar.\n• O café é grátis. O pão de queijo acaba às 10h.\n• Sua missão: sobreviver ao primeiro mês. (Brincadeira!) (Não é brincadeira.)\n\nQualquer coisa, estamos sempre aqui. Sempre.\n\nCom carinho,\nPatrícia — RH' },

    { id: 'treinamento', de: 'Universidade Corporativa', assunto: '[OBRIGATÓRIO] Treinamento "Excelência em Excelência" (8h)',
      chega: { dia: 2, min: 8 * 60 + 40 },
      corpo: 'Prezado(a) colaborador(a),\n\nVocê tem até sexta para concluir o treinamento obrigatório "Excelência em Excelência", com 8 horas de duração e 1 pergunta no final.\n\nAtenciosamente,\nUniversidade Corporativa Voltagem',
      escolhas: [
        { t: 'Fazer o treinamento inteiro agora.', fx: { t: 180, prod: 4, est: 12, rep: 4, flag: 'treinou' }, r: 'Três horas depois (você acelerou o vídeo), você responde à única pergunta: "A excelência é importante?" Sim. Aprovado.' },
        { t: 'Deixar o vídeo rodando no mudo.', hab: 'sobrevivente',
          ok: { fx: { t: 10, est: -4, flag: 'treinou' }, r: 'O vídeo roda sozinho. O sistema registra 100% de presença. Ninguém nunca vai saber.' },
          falha: { fx: { t: 10, rep: -4, est: 4 }, r: 'O vídeo pausa a cada 5 minutos com "Você ainda está aí?". Você não estava. O sistema registrou.' } },
        { t: 'Pedir para o Davi o atalho.', regra: 'estagiario', fx: { t: 15, flag: 'treinou', dep: { engenharia: 3 } }, r: 'Davi: "É só abrir com ?concluido=true no fim do link." Certificado em 15 segundos.' },
        { t: 'Deixar para sexta.', fx: { est: 4 }, r: 'Sexta você vai deixar para segunda. Assim são as coisas.' },
      ] },

    { id: 'e17h58', de: 'Marcos (Operações Integradas)', assunto: 'Rapidinho',
      chega: { min: 17 * 60 + 58, chance: 0.35, cd: 3, cond: (S) => S.dia >= 2 },
      corpo: 'Consegue me mandar isso hoje?\n\nEnviado do meu celular',
      escolhas: [
        { t: '"Claro!"', fx: { rep: 10, est: 20, t: 60, extra: ['-30 minutos de vida'] }, r: 'Você fica até 19h fazendo "isso". Marcos responde: "Valeu! Era para semana que vem, mas ótimo."' },
        { t: '"Consigo amanhã."', fx: { rep: 3, extra: ['+5 respeito'] }, r: 'Marcos: "Perfeito." Foi simples assim. Você não acredita.' },
        { t: 'Ignorar.', fx: { est: -8, rep: -5, extra: ['+10 felicidade'] }, r: 'Você fecha o notebook. O e-mail fica lá, brilhando, sem resposta. Que paz.' },
        { t: '"Conforme alinhado..."', fx: { inf: 5, aprende: 'conforme-alinhado', extra: ['+5 política corporativa'] }, r: 'Você nem sabe o que foi alinhado. Marcos também não. Ele responde com um joinha.' },
      ] },

    { id: 'reply-all', de: 'Lista: TODOS-VOLTAGEM', assunto: 'RE: RE: RE: RE: RE: Confraternização de fim de ano',
      chega: { chance: 0.25, cd: 6, cond: (S) => S.dia >= 3 },
      corpo: 'De: Alguém do Comercial\n"Eu levo farofa!"\n\nDe: Alguém da Fábrica\n"Por favor, me tirem dessa lista."\n\nDe: Alguém da Engenharia\n"Também quero sair da lista."\n\nDe: Alguém da Qualidade\n"Parem de responder a todos!!!"\n\n(+ 214 mensagens)',
      escolhas: [
        { t: 'Responder a todos: "Por favor, parem de responder a todos."', perigo: true, se: (S) => !sabe(S, 'reply-all'), fx: { rep: -6, est: 8, fama: 2, aprende: 'reply-all' }, r: 'Você vira a mensagem nº 216. A 217 diz: "Isso, parem!" A 218 é a farofa de novo.' },
        { t: 'Não fazer absolutamente nada.', fx: { est: -1 }, r: 'Sabedoria. A conversa morre sozinha três dias depois.' },
        { t: 'Criar uma regra para mandar tudo para a lixeira.', hab: 'tecnico',
          ok: { fx: { prod: 3, est: -4 }, r: 'A regra funciona. O resto da empresa sofre. Você, não.' },
          falha: { fx: { est: 5, rep: -2 }, r: 'A regra também apagou os e-mails do Marcos. Ops.' } },
        { t: 'Responder: "Eu levo o refrigerante."', fx: { fama: 1, dep: { comercial: 4 }, rep: 1 }, r: 'Comercial te adora. A Qualidade, menos.' },
      ] },

    { id: 'phishing', de: 'RH Voltagem <rh@voltagem-premios.com.br.biz>', assunto: '⚠ Seu salário foi DUPLICADO! Clique aqui para confirmar',
      chega: { chance: 0.3, cd: 99, cond: (S) => S.dia >= 4 },
      corpo: 'PARABÉNS!!!\n\nVocê foi selecionado(a) para receber salário em DOBRO. Para confirmar, clique no link e digite sua senha, seu CPF e o nome do seu primeiro bicho de estimação.\n\nAtt, RH (de verdade)',
      escolhas: [
        { t: 'Clicar no link.', perigo: true, fx: { rep: -5, est: 6, t: 120, extra: ['Treinamento de segurança obrigatório'] }, r: 'Era um teste da TI. Você ganhou duas horas de treinamento sobre "não clicar em links". Gilmar manda um emoji de decepção.' },
        { t: 'Reportar para a TI.', fx: { rep: 5, dep: { operacoes: 4 } }, r: 'Gilmar: "Parabéns! Você é uma das 3 pessoas que reportaram." A empresa tem 800 funcionários.' },
        { t: 'Responder perguntando se dá para triplicar.', fx: { fama: 1, est: -2 }, r: 'Ninguém responde. Mas o print do seu e-mail circula no grupo.' },
      ] },

    { id: 'vaquinha', de: 'Kátia (Faturamento)', assunto: '🎂 Vaquinha para o bolo da Márcia',
      chega: { chance: 0.3, cd: 8, cond: (S) => S.dia >= 3 },
      corpo: 'Gente, sexta é aniversário da Márcia (Compras)! Vamos fazer uma vaquinha para o bolo. Quem puder contribuir, me procura na copa. Sugestão: R$ 20.\n\nObs.: quem não contribuir também come, mas eu vou saber.',
      escolhas: [
        { t: 'Contribuir com R$ 20.', fx: { din: -20, dep: { compras: 5, comercial: 3 } }, r: 'Kátia anota seu nome numa lista que ela guarda com muito cuidado.' },
        { t: 'Contribuir com R$ 50.', fx: { din: -50, dep: { compras: 10, comercial: 5 }, rep: 3 }, r: 'Agora você é a pessoa que deu 50. Isso entra para a história da copa.' },
        { t: 'Fingir que não viu.', fx: { dep: { comercial: -4 } }, r: 'Na sexta, você come o bolo. Kátia olha para você. Ela sabe.' },
      ] },

    { id: 'comunicado-cafe', de: 'Comunicação Interna', assunto: 'Comunicado: novidade na copa!',
      chega: { chance: 0.25, cd: 99, cond: (S) => S.dia >= 2 },
      corpo: 'É com alegria que anunciamos que o café da copa agora é "café de origem sustentável selecionada".\n\nÉ o mesmo café. Só que a embalagem é verde.\n\nComunicação Interna — Voltagem S.A.',
      aoLer: { est: -1 } },

    { id: 'cliente-cc', de: 'Bianca (Comercial)', assunto: 'FW: URGENTE!!! Atraso inaceitável',
      chega: { chance: 0.35, cd: 5, cond: (S) => S.dia >= 4 },
      corpo: 'Te coloquei em cópia porque o cliente perguntou "quem é responsável por Operações Integradas". Ninguém sabia, então coloquei você.\n\n----- Mensagem encaminhada -----\nDe: Cliente\n"Esse é o terceiro atraso. Quero uma explicação HOJE."',
      escolhas: [
        { t: 'Responder o cliente com calma, explicando tudo.', hab: 'comunicador',
          ok: { fx: { rep: 10, inf: 4, dep: { comercial: 10 }, t: 40 }, r: 'O cliente responde: "Obrigado pela transparência." A Bianca te manda um coração. A Diretoria ficou sabendo.' },
          falha: { fx: { rep: -6, est: 10, dep: { comercial: -6 }, t: 40 }, r: 'Você explica tanto que o cliente fica sabendo de dois atrasos que ele nem conhecia.' } },
        { t: 'Responder só "Ciente."', fx: { est: -2, t: 2 }, r: '"Ciente." Uma palavra. Nenhuma responsabilidade. Perfeito.' },
        { t: 'Encaminhar para a Engenharia.', fx: { dep: { engenharia: -6, comercial: 3 }, t: 5 }, r: 'Lia responde em 30 segundos: "Isso não estava no escopo."' },
        { t: 'Responder a todos.', perigo: true, fx: { rep: -8, est: 8, fama: 2, dep: { comercial: -8 } }, r: 'O cliente agora sabe que a Bianca te chamou de "a pessoa de Operações que ninguém sabe o que faz". Clima.' },
      ] },

    { id: 'pesquisa-clima', de: 'Patrícia (RH)', assunto: 'Pesquisa de Clima 100% anônima 😊',
      chega: { dia: 6, min: 9 * 60 + 30 },
      corpo: 'Queremos ouvir você! Responda nossa pesquisa de clima totalmente anônima.\n\nPergunta 1: De 0 a 10, quanto você recomendaria a Voltagem para um amigo?\n\nCampo obrigatório: Nome completo e matrícula.',
      escolhas: [
        { t: 'Responder com total sinceridade.', fx: { rep: -3, est: -8, inf: 2, desbloqueia: 'rh', dep: { rh: 4 } }, r: 'Você escreve três parágrafos. Patrícia te chama para "conversar" (a porta do RH agora abre para você).' },
        { t: 'Dar 10 para tudo.', fx: { rep: 2, est: 3, dep: { rh: 6 } }, r: 'Você é exatamente o tipo de colaborador(a) que a empresa quer. Um pouco triste, mas eficiente.' },
        { t: 'Dar 7. Nem tanto ao céu, nem tanto à terra.', perfil: 'politico', fx: { inf: 4, dep: { rh: 4 } }, r: 'Uma nota perfeitamente política. Patrícia anota: "perfil equilibrado".' },
        { t: 'Ignorar.', fx: { dep: { rh: -4 } }, r: 'Você vai receber três lembretes. O último em letras vermelhas.' },
      ] },

    { id: 'aviso-rep', de: 'Patrícia (RH)', assunto: 'Podemos conversar? 😊',
      chega: { chance: 1, cd: 99, cond: (S) => S.rep <= 15 && S.dia >= 3 },
      corpo: 'Oi! Tudo bem? Que alegria!\n\nNada grave, tá? Só queria entender como você está se sentindo. E como os outros estão se sentindo em relação a você.\n\nUm abraço enorme,\nPatrícia',
      aoLer: { est: 10, aprende: 'rh-educado', extra: ['Sua reputação está perigosamente baixa'] } },

    { id: 'convite-diretoria', de: 'Dona Vera (Diretoria)', assunto: 'Convite: Reunião Estratégica com a Diretoria',
      chega: { chance: 1, cd: 99, cond: (S) => !S.flags.acessoDiretoria && (S.inf >= 45 || F.Carreira.nivel(S) >= 3) },
      corpo: 'Prezado(a),\n\nO Dr. Augusto gostaria de contar com a sua presença na Reunião Estratégica de amanhã, às 14h, na Sala do Conselho (3º andar).\n\nSeu crachá agora tem acesso ao 3º andar.\n\nDona Vera\nSecretaria da Diretoria',
      aoLer: { flag: 'acessoDiretoria', inf: 5, reuniao: 'diretoria', extra: ['🔓 Acesso ao 3º andar liberado', '"Finalmente."'] } },

    { id: 'automacao-quebrou', de: 'Gilmar (TI)', assunto: 'URGENTE: sua automação',
      chega: {},
      corpo: 'Oi. Então.\n\nSua automação mandou 4.012 e-mails para um cliente com o assunto "teste teste teste". Ele respondeu todos. Com o assunto "PARE".\n\nDesliguei. Por favor, não ligue de novo.\n\nGilmar',
      aoLer: { est: 8, extra: ['Agora todo mundo sabe quem é você'] } },
  ];
  F.EMAIL = {};
  F.EMAILS.forEach((e) => { F.EMAIL[e.id] = e; });
})();
