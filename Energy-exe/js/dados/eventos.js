// ============================================================
//  ★ SITUAÇÕES (o coração do jogo: escolhas com consequência)
//
//  Cada situação:
//    g      quando aparece: 'zona' (ao entrar num setor), 'npc' (a
//           pessoa fica com "!" e a situação abre ao conversar),
//           'casa' (à noite), 'manual' (chamada por outra coisa)
//    alvo   id da zona ou da pessoa
//    chance, cd (dias até poder repetir), uma (só uma vez no jogo)
//    cond   (S) => pode acontecer agora?
//    titulo, quem (id da pessoa que fala), texto
//    escolhas: [{
//      t      texto da opção
//      fx     efeitos (ver abaixo)      r  texto do resultado
//      regra  só aparece se você souber essa regra corporativa (📘)
//      perfil só aparece para esse perfil
//      hab    teste de habilidade: usa ok:{fx,r} ou falha:{fx,r}
//      perigo marca a opção em vermelho (é engraçada, não é boa)
//      se     (S) => mostrar a opção?
//      seguir id de outra situação que abre logo depois
//    }]
//
//  Efeitos (fx): din, rep, prod, est, inf (somam), dep: {setor: n},
//    t: minutos que passam, aprende: 'regra', flag / flags: [...],
//    tarefa: n, automacao: n, docs: n, fama: n, extra: ['texto'],
//    quest: 'id' (começa uma missão), reuniao: 'id' (convite),
//    fim: 'id' (um final), salario: n, desbloqueia: 'rh'
// ============================================================
(function () {
  const sabe = (S, r) => S.regras.includes(r);
  const hora = (S) => S.minuto / 60;

  F.EVENTOS = [
    // ============================== FÁBRICA ==============================
    { id: 'linha-parou', g: 'zona', alvo: 'montagem', chance: 0.55, cd: 3,
      titulo: 'A linha parou.', quem: 'valdir',
      texto: 'Um alarme toca. A esteira 1 parou no meio de um painel. Seu Valdir olha para você como se você fosse da manutenção.',
      ao: (S) => { S.flags.linhaParada = true; },
      escolhas: [
        { t: 'Ajudar.', hab: 'tecnico',
          ok: { fx: { rep: 8, prod: 4, dep: { fabrica: 10 }, t: 40 }, r: 'Você encontra um parafuso solto travando o rolete. A linha volta. Aplausos discretos de quem estava olhando.' },
          falha: { fx: { rep: 2, est: 8, dep: { fabrica: 3 }, t: 50 }, r: 'Você mexe em três cabos e a linha continua parada. Seu Valdir valoriza o esforço. Mais ou menos.' } },
        { t: 'Fingir que não viu.', fx: { est: -3, rep: -4, dep: { fabrica: -6 }, t: 2 }, r: 'Você assobia e segue reto. Três pessoas viram você fingindo que não viu.' },
        { t: 'Chamar a manutenção.', fx: { rep: 3, dep: { fabrica: 4 }, t: 20, aprende: 'desligar-ligar' }, r: 'O Bigode chega em 15 minutos, olha, desliga e liga. A linha volta. Ele vai embora sem dizer nada.' },
        { t: 'Procurar o culpado.', fx: { rep: -6, inf: 3, dep: { fabrica: -10, logistica: -5, compras: -5 }, t: 30, conta: { culpas: 1 } }, r: 'A culpa é do fornecedor, que é culpa de Compras, que é culpa da Logística. Agora três setores estão bravos com você.' },
        { t: 'Tirar uma foto e mandar no grupo.', fx: { fama: 2, est: -4, rep: -3, dep: { fabrica: -4 }, t: 3 }, r: 'A foto tem 47 reações em dois minutos. Alguém transformou em figurinha. Agora o prédio inteiro sabe quem é você.' },
      ],
      depois: (S) => { S.flags.linhaParada = false; } },

    { id: 'falha-teste', g: 'zona', alvo: 'testes', chance: 0.35, cd: 3,
      titulo: 'Um estalo no laboratório.', quem: 'renan',
      texto: 'Um painel em teste solta um estalo e um cheirinho de queimado. Renan: "Calma! É normal. Eu acho. Você sabe ler um laudo?"',
      escolhas: [
        { t: 'Ler o laudo com atenção.', hab: 'analitico',
          ok: { fx: { rep: 6, prod: 5, dep: { fabrica: 6 }, t: 30 }, r: 'Você percebe que o laudo é de outro painel. Renan te olha com um respeito novo.' },
          falha: { fx: { est: 6, t: 30 }, r: 'Você lê o laudo três vezes e entende perfeitamente a palavra "laudo".' } },
        { t: '"Já tentou desligar e ligar?"', fx: { rep: 3, t: 5, extra: ['+1 confiança sem motivo'] }, r: 'Renan desliga e liga. Funciona. Vocês dois ficam em silêncio, sem entender.' },
        { t: 'Sair de fininho.', fx: { est: -2, rep: -2, t: 1 }, r: 'Você sai antes do segundo estalo. Decisão sábia, apesar de tudo.' },
      ] },

    { id: 'etiqueta-errada', g: 'zona', alvo: 'expedicao', chance: 0.4, cd: 3,
      titulo: 'Etiqueta errada.', quem: 'marquinhos',
      texto: 'Um palete com destino a Manaus está com etiqueta para Maceió. O caminhão sai em 10 minutos.',
      escolhas: [
        { t: 'Reimprimir a etiqueta.', fx: { rep: 5, dep: { fabrica: 6, logistica: 4 }, t: 25 }, r: 'Você reimprime. A etiquetadora reclama, mas obedece.' },
        { t: '"Maceió também é bonito."', perigo: true, fx: { est: -3, rep: -6, dep: { comercial: -8, logistica: -4 }, t: 1 }, r: 'O material faz uma linda viagem pelo litoral. O cliente de Manaus não achou graça.' },
        { t: 'Mandar um e-mail para a Sandra.', regra: 'sandra', fx: { rep: 7, dep: { logistica: 8 }, t: 8 }, r: 'Quatro minutos depois, a Sandra responde: "Resolvido." Você não sabe como. Ninguém sabe.' },
        { t: 'Abrir uma não conformidade.', fx: { docs: 3, dep: { qualidade: 6, fabrica: -3 }, t: 30 }, r: 'A Qualidade adora. O caminhão sai atrasado, mas com a papelada impecável.' },
      ] },

    { id: 'catraca', g: 'zona', alvo: 'recepcao', chance: 0.3, cd: 5, cond: (S) => S.dia > 1 && S.minuto < 9 * 60 + 30,
      titulo: 'A catraca apitou.', quem: 'lucia',
      texto: 'Seu crachá não funciona. A catraca apita como quem descobriu um crime. Dona Lúcia olha por cima dos óculos.',
      escolhas: [
        { t: 'Pedir ajuda para a Dona Lúcia.', fx: { t: 15, dep: { fabrica: 3 } }, r: 'Ela digita algo num computador de 2003. Funciona. "É sempre assim", diz ela, com paz.' },
        { t: 'Pular a catraca.', perigo: true, fx: { est: -4, rep: -3, fama: 1, t: 1 }, r: 'Você pula com uma elegância discutível. Dona Lúcia finge que não viu, mas anotou.' },
        { t: 'Esperar alguém passar e ir junto.', fx: { t: 8 }, r: 'Você entra "de carona" com o Bigode. Ele não pergunta nada.' },
      ] },

    // ============================== NEGÓCIOS ==============================
    { id: 'telefone', g: 'zona', alvo: 'logistica', chance: 0.4, cd: 2,
      titulo: 'O telefone não para de tocar.', quem: 'kleber',
      texto: 'Tem um telefone tocando numa mesa vazia da Logística há 20 minutos. Kléber finge que não ouve com muito talento.',
      escolhas: [
        { t: 'Atender.', fx: { rep: 4, est: 6, dep: { logistica: 6 }, t: 20 }, r: '"Cadê meu material?", pergunta a voz. Você promete verificar. Agora é você quem precisa verificar.' },
        { t: 'Tirar do gancho.', fx: { est: -5, rep: -2, t: 1 }, r: 'Silêncio. Lindo silêncio. Kléber faz um joinha discreto.' },
        { t: 'Perguntar para o Kléber de quem é.', fx: { t: 5, aprende: 'carlos-aprova' }, r: 'Kléber: "É do ramal do Carlos. Ele aprova as compras. Quando aparece." O telefone continua tocando.' },
      ] },

    { id: 'material-amanha', g: 'zona', alvo: 'compras', chance: 0.5, cd: 3, cond: (S) => !S.quests['material-sumido'],
      titulo: 'COMPRAS: "Precisamos desse material até amanhã."', quem: 'marcia',
      texto: 'Márcia corre até você com uma requisição amassada. "É para a obra do cliente. Precisamos até amanhã. Você pode ajudar?"',
      escolhas: [
        { t: '"Vou verificar."', fx: { rep: 2, t: 5 }, r: 'Márcia sorri. Ela sabe exatamente o que "vou verificar" significa.' },
        { t: '"Já estou cuidando disso."', fx: { rep: 6, est: 8, t: 5, quest: 'material-sumido' }, r: 'Você não estava cuidando. Agora está. Tem uma missão nova no seu post-it.' },
        { t: '"Isso é responsabilidade de vocês."', fx: { rep: -5, est: -4, dep: { compras: -10 }, t: 2 }, r: 'Tecnicamente correto. É a melhor forma de ter razão e perder amigos ao mesmo tempo.' },
        { t: '"Vou criar uma automação."', hab: 'tecnico',
          ok: { fx: { rep: 8, prod: 6, fama: 1, dep: { compras: 8 }, t: 60, automacao: 1 }, r: 'Você cria uma planilha que avisa quando o material chega. Márcia chora um pouquinho.' },
          falha: { fx: { rep: -4, est: 10, t: 60, dep: { compras: -4 } }, r: 'A automação avisa que o material chegou. Ele não chegou. Ela avisa de novo. A cada 30 segundos.' } },
      ] },

    { id: 'tecnicamente', g: 'zona', alvo: 'comercial', chance: 0.5, cd: 3,
      titulo: 'Vendedor: "Você consegue entregar isso até sexta?"', quem: 'rodrigo',
      texto: 'Rodrigo está no telefone com um cliente. Ele tapa o microfone: "Rapidinho: você consegue entregar isso até sexta?"',
      escolhas: [
        { t: '"Tecnicamente..."', fx: { aprende: 'sexta', est: 10, dep: { comercial: 6, engenharia: -6 }, t: 3 }, r: 'Rodrigo: "Ótimo, vou falar que sim." Ele já falou. A Engenharia vai adorar descobrir.' },
        { t: '"Não."', fx: { rep: 3, dep: { comercial: -5, engenharia: 5 }, t: 2 }, r: 'Rodrigo: "Entendi, vou falar que sim." Ele já tinha falado.' },
        { t: '"Pergunta para a Engenharia."', fx: { dep: { engenharia: 4 }, t: 3 }, r: 'Rodrigo: "A Engenharia sempre diz que não estava no escopo." Ele fala que sim.' },
        { t: '"Conforme alinhado."', regra: 'conforme-alinhado', fx: { inf: 4, rep: 3, t: 1 }, r: 'Rodrigo concorda com a cabeça e desliga satisfeito. Ninguém sabe o que foi alinhado, mas soou definitivo.' },
      ] },

    { id: 'fila-microondas', g: 'zona', alvo: 'copa', chance: 0.5, cd: 2, cond: (S) => hora(S) >= 11.5 && hora(S) <= 13.5,
      titulo: 'A fila do micro-ondas.', quem: 'katia',
      texto: 'Sete pessoas, um micro-ondas e uma marmita de peixe. Kátia guarda o seu lugar na fila, mas cobra em informação.',
      escolhas: [
        { t: 'Esperar na fila.', fx: { t: 35, est: -6, dep: { comercial: 3 }, flag: 'almocou' }, r: 'Você aprende sobre a vida de quatro colegas. Um deles faz pão em casa. Outro está saindo da empresa (segredo).' },
        { t: 'Furar a fila.', perigo: true, fx: { t: 5, est: -3, rep: -6, dep: { comercial: -6, logistica: -4 }, fama: 1, flag: 'almocou' }, r: 'Funciona. Mas a copa nunca esquece.' },
        { t: 'Comer frio mesmo.', fx: { t: 10, est: 3, flag: 'almocou' }, r: 'Lasanha fria. Uma experiência.' },
      ] },

    // ============================== ESCRITÓRIOS ==============================
    { id: 'auditoria', g: 'zona', alvo: 'qualidade', chance: 0.35, cd: 4,
      titulo: 'Auditoria surpresa.', quem: 'helena',
      texto: 'Helena aparece com uma prancheta: "Rapidinho. Pode me mostrar a evidência do treinamento que você fez?" Você não fez nenhum treinamento.',
      escolhas: [
        { t: 'Fazer o treinamento agora.', fx: { t: 120, prod: 3, est: 8, rep: 4, dep: { qualidade: 8 } }, r: 'Duas horas de vídeo sobre como lavar as mãos. Agora você tem um certificado.' },
        { t: 'Mostrar um certificado de 2019.', regra: '2019', fx: { rep: 5, dep: { qualidade: 4 }, t: 5 }, r: 'Helena olha bem. "2019... faz sentido." Aprovado.' },
        { t: '"Conforme alinhado, isso é com o RH."', regra: 'conforme-alinhado', fx: { inf: 3, dep: { qualidade: -3, rh: -2 }, t: 2 }, r: 'Helena anota. "Conforme alinhado com quem?" Mas você já foi.' },
        { t: 'Abrir uma não conformidade contra si mesmo.', fx: { docs: 5, dep: { qualidade: 10 }, est: 5, fama: 1, t: 30 }, r: 'Helena nunca viu tanta honestidade. Ela abre outra NCC só para estudar o caso.' },
      ] },

    { id: 'fora-escopo', g: 'zona', alvo: 'engenharia', chance: 0.35, cd: 3,
      titulo: '"Isso não estava no escopo."', quem: 'lia',
      texto: 'Lia: "Você trouxe o pedido de alteração do cliente?" Você não trouxe nada. Você só estava passando.',
      escolhas: [
        { t: '"Trouxe! É só uma alteraçãozinha."', fx: { dep: { engenharia: -6 }, est: 6, rep: 2, t: 5 }, r: 'Lia: "Isso não estava no escopo." Ela fala sem tirar os olhos da tela.' },
        { t: '"Não estava no escopo mesmo."', regra: 'escopo', fx: { dep: { engenharia: 10 }, rep: 3, t: 2 }, r: 'Lia te olha como quem encontrou uma alma gêmea.' },
        { t: 'Perguntar o que é o escopo.', fx: { t: 15, aprende: 'escopo' }, r: 'Lia abre um PDF de 300 páginas. "O escopo é um documento sagrado que ninguém leu."' },
      ] },

    { id: 'cronograma', g: 'zona', alvo: 'pm', chance: 0.35, cd: 3, cond: (S) => !S.quests['status-report'],
      titulo: 'O cronograma mudou.', quem: 'renata',
      texto: 'Renata: "Alguém mexeu no cronograma. O projeto que acabava em março agora acaba em... 2031?"',
      escolhas: [
        { t: 'Ajudar a investigar.', fx: { quest: 'status-report', rep: 3, t: 10 }, r: 'Agora o status report é responsabilidade sua. Parabéns? Missão nova.' },
        { t: '"Deve ser fuso horário."', fx: { fama: 1, t: 2, dep: { pm: -2 } }, r: 'Renata pensa por um segundo. "Faz sentido." Não faz.' },
        { t: 'Mudar para 2030, discretamente.', perigo: true, fx: { inf: 2, rep: -2, dep: { pm: -4 }, docs: 2, t: 5 }, r: 'Agora o projeto acaba em 2030. Ganhou um ano. Ninguém percebeu. Por enquanto.' },
      ] },

    { id: 'cinco-minutinhos', g: 'zona', alvo: 'operacoes', chance: 0.3, cd: 3, cond: (S) => S.dia >= 2,
      titulo: '"Você tem cinco minutinhos?"', quem: 'marcos',
      texto: 'Marcos aparece atrás da sua cadeira sem fazer barulho. "Você tem cinco minutinhos?"',
      escolhas: [
        { t: '"Claro!"', fx: { t: 47, rep: 5, est: 8, aprende: 'cinco-minutinhos', tarefaNova: 1 }, r: 'Quarenta e sete minutos depois, você sabe tudo sobre a reforma da cozinha do Marcos. E ganhou uma tarefa nova.' },
        { t: '"Agora estou numa call."', fx: { rep: -2, est: -3, t: 1 }, r: 'Marcos: "Vamos alinhar depois." Ele vai lembrar.' },
        { t: '"São cinco mesmo ou são 47?"', regra: 'cinco-minutinhos', fx: { fama: 1, rep: 2, t: 20 }, r: 'Marcos ri. "Sete, no máximo." Foram vinte. Ainda assim, um recorde.' },
      ] },

    { id: 'burocracia', g: 'manual',
      titulo: 'O arquivo da Qualidade.', quem: 'helena',
      texto: 'Você abre uma pasta para conferir um procedimento. Imediatamente, três documentos novos nascem: o registro de abertura, a justificativa e a evidência da justificativa.',
      escolhas: [
        { t: 'Organizar tudo.', fx: { docs: 4, t: 60, dep: { qualidade: 8 }, prod: 2, tarefa: 1 }, r: 'Organizado. Agora existem 4 documentos a mais sobre a organização.' },
        { t: 'Fechar a pasta devagar.', fx: { docs: 1, t: 2 }, r: 'Tarde demais. Um documento já te seguiu até a mesa.' },
        { t: 'Criar o "Procedimento de Abertura de Pastas".', perigo: true, fx: { docs: 10, dep: { qualidade: 15 }, est: 6, fama: 1, t: 90 }, r: 'Helena te abraça. A burocracia agora tem a sua assinatura. Você criou um monstro.' },
      ] },

    // ============================== PESSOAS (com "!") ==============================
    { id: 'primeiro-dia', g: 'npc', alvo: 'lucia', uma: true, cond: (S) => S.dia === 1,
      titulo: 'Primeiro dia!', quem: 'lucia',
      texto: 'Dona Lúcia: "Primeiro dia? Que bom! Seu chefe é o Marcos, no 2º andar, pelo elevador. Ele vai perguntar se você tem cinco minutinhos. Diga que sim e leve água."',
      escolhas: [
        { t: '"Valeu, Dona Lúcia!"', fx: { dep: { fabrica: 4 }, t: 2 }, r: '"Qualquer coisa, estou aqui. Faz 31 anos que estou aqui."' },
        { t: '"Quem é o Marcos?"', fx: { t: 3 }, r: '"O homem das três frases. Você vai entender."' },
      ] },

    { id: 'boas-vindas-chefe', g: 'npc', alvo: 'marcos', uma: true,
      titulo: 'Boas-vindas ao time!', quem: 'marcos',
      texto: 'Marcos aperta a sua mão com as duas mãos. "Que bom que chegou. Precisamos entregar. Vamos alinhar. Sua mesa é ali em Operações Integradas. Toda manhã eu mando as tarefas por e-mail."',
      escolhas: [
        { t: '"O que exatamente a gente faz?"', fx: { t: 10 }, r: '"Integramos as operações." Ele sorri. Você continua sem saber.' },
        { t: '"Bora entregar!"', perfil: 'comunicador', fx: { rep: 5, t: 5 }, r: 'Marcos fica emocionado. "Precisamos de gente assim."' },
        { t: '"Quem são as pessoas-chave aqui?"', perfil: 'politico', fx: { inf: 5, t: 10, aprende: 'sandra' }, r: 'Marcos pensa: "Para o que importa? A Sandra, da Logística. Não faz pelo sistema. Manda um e-mail para ela."' },
        { t: 'Sorrir e acenar.', fx: { t: 2 }, r: 'Funciona. Vai funcionar por muitos anos.' },
      ] },

    { id: 'planilha-3', g: 'npc', alvo: 'marcos', uma: true, cond: (S) => S.dia >= 3,
      titulo: 'A planilha, pela terceira vez.', quem: 'marcos',
      texto: 'Marcos: "Sabe aquela planilha? Precisamos refazer. Pela terceira vez. O formato mudou. Para o formato da primeira vez."',
      escolhas: [
        { t: 'Refazer.', fx: { t: 90, prod: 4, est: 10, rep: 5, tarefa: 1 }, r: 'Você refaz. Ficou idêntica à primeira versão. Marcos: "Agora sim!"' },
        { t: 'Perguntar por quê.', fx: { t: 15, inf: 2, rep: -1 }, r: 'Marcos: "Porque a Diretoria pediu." A Diretoria nunca viu essa planilha.' },
        { t: 'Automatizar.', hab: 'tecnico',
          ok: { fx: { automacao: 1, prod: 8, rep: 7, fama: 1, t: 60, tarefa: 1 }, r: 'Agora a planilha se refaz sozinha em qualquer formato. Você é a pessoa mais perigosa do andar.' },
          falha: { fx: { est: 12, rep: -5, t: 90 }, r: 'A automação gera 14 planilhas, todas no formato errado. Uma delas está em japonês.' } },
        { t: 'Mandar a planilha antiga.', fx: { rep: 6, est: -5, tarefa: 1, t: 3 }, r: 'Marcos abre, olha e diz: "Perfeito! Era isso." Era a mesma de antes.' },
        { t: 'Bater no chefe.', perigo: true, seguir: 'agressao' },
      ] },

    { id: 'agressao', g: 'manual',
      titulo: 'EVENTO', quem: 'marcos',
      texto: 'Você resolveu o problema de uma maneira extremamente definitiva.',
      escolhas: [
        { t: 'Encarar as consequências.', fx: { rep: -60, est: 45, flag: 'agressao', desbloqueia: 'rh', repMin: 1, extra: ['-100 reputação (na prática)', '+100 estresse (na prática)', 'RH desbloqueado'] },
          r: 'Silêncio total em Operações Integradas. Alguém derruba uma caneca. Seu celular vibra: "Patrícia (RH) quer conversar com você."' },
      ] },

    { id: 'ajudar-colega', g: 'npc', alvo: 'thiago', cd: 5, cond: (S) => S.dia >= 2,
      titulo: 'Thiago precisa de ajuda.', quem: 'thiago',
      texto: 'Thiago: "Tô travado nesse relatório há dois dias. Me ajuda? Prometo que coloco seu nome. Em letra pequena."',
      escolhas: [
        { t: 'Ajudar.', fx: { t: 60, rep: 6, est: 6, dep: { operacoes: 10 }, flag: 'ajudouThiago' }, r: 'Vocês terminam juntos. Thiago coloca o seu nome. Em letra pequena mesmo.' },
        { t: 'Ensinar o atalho do estagiário.', regra: 'estagiario', fx: { t: 10, rep: 8, dep: { operacoes: 12 }, fama: 1, flag: 'ajudouThiago' }, r: 'Ctrl+Shift+F9. O relatório se gera sozinho. Thiago te olha como quem acabou de ver mágica.' },
        { t: '"Agora não dá."', fx: { est: -2, dep: { operacoes: -4 } }, r: 'Thiago: "Tranquilo." Não foi tranquilo.' },
      ] },

    { id: 'culpa', g: 'npc', alvo: 'thiago', uma: true, cond: (S) => S.dia >= 5 && S.flags.ajudouThiago,
      titulo: 'Deu ruim no relatório.', quem: 'marcos',
      texto: 'O relatório que você ajudou o Thiago a fazer tinha um erro enorme. Marcos está na mesa do Thiago: "Quem fez essa parte?" Thiago olha para você em pânico.',
      escolhas: [
        { t: 'Assumir a culpa.', fx: { rep: -4, est: 8, dep: { operacoes: 15 }, flag: 'thiagoDeve' }, r: 'Marcos suspira. Thiago te deve uma para sempre. Isso vale alguma coisa. Talvez.' },
        { t: 'Jogar a culpa no Thiago.', perigo: true, fx: { rep: 4, est: 4, dep: { operacoes: -20 }, conta: { culpas: 1 }, flag: 'traiuThiago' }, r: 'Funciona. Thiago nunca mais divide pão de queijo com você.' },
        { t: 'Culpar o sistema.', fx: { rep: 1, dep: { operacoes: 3 }, t: 3 }, r: 'Marcos: "Sempre o sistema." Todos concordam. O sistema não se defende.' },
        { t: 'Culpar o Carlos.', regra: 'carlos-ferias', fx: { rep: 3, fama: 1 }, r: 'O Carlos está de férias e não pode se defender. Ele já tem tanta culpa acumulada que ninguém percebe mais uma.' },
      ] },

    { id: 'vamos-alinhar', g: 'npc', alvo: 'gustavo', cd: 3, cond: (S) => S.dia >= 2,
      titulo: '"Vamos alinhar."', quem: 'gustavo',
      texto: 'Gustavo, passando apressado: "Você tem um minuto? Melhor: vamos marcar uma reunião para alinharmos."',
      escolhas: [
        { t: 'Aceitar.', fx: { reuniao: 'alinhamento', rep: 2 }, r: 'O convite já chegou. Amanhã às 10h. Pauta: "Alinhamento".' },
        { t: '"Pode ser por e-mail?"', fx: { rep: -1, est: -2, dep: { pm: -3 }, reuniao: 'alinhamento' }, r: 'Gustavo ri como quem ouviu uma piada ótima. Marca a reunião mesmo assim.' },
        { t: '"Conforme alinhado."', regra: 'conforme-alinhado', fx: { inf: 3, dep: { pm: 5 } }, r: 'Gustavo: "Perfeito, então já está alinhado!" Você evitou uma reunião. Um feito raro.' },
      ] },

    { id: 'happy-hour', g: 'npc', alvo: 'rodrigo', cd: 5, cond: (S) => S.dia >= 3 && S.minuto >= 16 * 60,
      titulo: 'Happy hour?', quem: 'rodrigo',
      texto: 'Rodrigo: "Hoje tem happy hour no bar da esquina. Vem? Dizem que a Diretoria vai aparecer. Talvez."',
      escolhas: [
        { t: 'Ir (e encerrar o dia lá).', fx: { aprende: 'happy-hour', inf: 6, rep: 4, din: -80, est: -12, dep: { comercial: 8 }, fimDia: true }, r: 'O diretor não foi. Mas o Rodrigo te apresentou para metade do Comercial. Você gastou R$ 80 em batata frita.' },
        { t: 'Hoje não.', fx: { est: 2 }, r: 'Amanhã vai ter uma piada interna que você não vai entender.' },
      ] },

    { id: 'wagner-sabado', g: 'npc', alvo: 'wagner', uma: true, cond: (S) => S.dia >= 4,
      titulo: 'Wagner tem uma proposta.', quem: 'wagner',
      texto: 'Wagner: "Vou vir no sábado adiantar o projeto. Quer vir também? Vai ser divertido. Eu trago planilhas."',
      escolhas: [
        { t: 'Ir no sábado.', fx: { est: 18, prod: 10, rep: 8, dep: { engenharia: 12 } }, r: 'Você vai. O Wagner trouxe planilhas mesmo. Impressas.' },
        { t: '"Só se tiver pão de queijo."', fx: { fama: 1, est: 12, prod: 8, rep: 6, dep: { engenharia: 10 } }, r: 'Wagner anota. Ele traz. Agora não tem como fugir. E você vai.' },
        { t: 'Não.', fx: { est: -2, dep: { engenharia: -2 } }, r: '"Tudo bem. Eu vou sozinho. Como sempre."' },
      ] },

    { id: 'explique', g: 'npc', alvo: 'patricia', cond: (S) => S.flags.agressao && !S.flags.explicou,
      titulo: '"Explique suas escolhas."', quem: 'patricia',
      texto: 'Patrícia sorri. É o sorriso mais assustador que você já viu. "Fique à vontade. Conte, com as suas palavras, o que aconteceu com o Marcos."',
      escolhas: [
        { t: '"Foi um mal-entendido."', hab: 'comunicador',
          ok: { fx: { rep: 15, est: -10, flag: 'explicou', missaoFeita: 'explique' }, r: 'Você fala 20 minutos sobre comunicação não violenta. Patrícia anota tudo. Você ganha uma advertência e um folder.' },
          falha: { fx: { rep: -8, flag: 'explicou', missaoFeita: 'explique' }, r: 'Patrícia: "Entendo." Ela não entendeu. Advertência registrada.' } },
        { t: '"A planilha estava na terceira versão."', fx: { rep: 4, fama: 2, flag: 'explicou', missaoFeita: 'explique' }, r: 'Patrícia para de escrever. "...Entendo." Pela primeira vez, ela realmente entende. Advertência, mas com empatia.' },
        { t: '"Conforme alinhado."', regra: 'conforme-alinhado', fx: { rep: -6, flag: 'explicou', missaoFeita: 'explique', aprende: 'rh-educado' }, r: 'Isso não funciona no RH. Nada funciona no RH.' },
        { t: 'Pedir demissão.', perigo: true, fx: { fim: 'demissao' } },
      ] },

    { id: 'davi-script', g: 'npc', alvo: 'davi', uma: true, cond: (S) => S.dia >= 3,
      titulo: 'O segredo do estagiário.', quem: 'davi',
      texto: 'Davi olha para os lados: "Eu fiz um script que faz o status report sozinho. Quer uma cópia? Só não conta para o Gustavo, senão ele marca uma reunião sobre isso."',
      escolhas: [
        { t: 'Aceitar o script.', fx: { automacao: 1, prod: 6, flag: 'scriptDavi', dep: { engenharia: 4 }, aprende: 'estagiario' }, r: 'Agora você tem um script misterioso. Funciona. Ninguém sabe como. Nem o Davi.' },
        { t: 'Pedir para ele te ensinar.', fx: { t: 60, prod: 10, flag: 'daviEnsinou', aprende: 'estagiario', dep: { engenharia: 6 } }, r: 'Uma hora de aula com o estagiário. Você aprendeu mais do que no treinamento obrigatório.' },
        { t: 'Contar para o Gustavo.', perigo: true, fx: { reuniao: 'alinhamento', inf: 2, dep: { engenharia: -10 } }, r: 'Gustavo: "Interessante! Vamos marcar uma reunião sobre isso." Davi nunca mais fala com você.' },
      ] },

    { id: 'carlos-voltou', g: 'npc', alvo: 'carlos', uma: true,
      titulo: 'O Carlos voltou.', quem: 'carlos',
      texto: 'Carlos, bronzeado, olha para 37 aprovações pendentes. "Nossa. Nada andou mesmo enquanto eu estava fora?"',
      escolhas: [
        { t: '"Nada. Nada mesmo."', fx: { aprende: 'carlos-ferias', dep: { compras: 4 } }, r: 'Carlos sorri, emocionado. "Eu sou importante." Ele aprova tudo em 4 minutos sem ler.' },
        { t: 'Pedir para aprovar o seu pedido primeiro.', perfil: 'politico', fx: { inf: 6, dep: { compras: 6 }, tarefa: 1 }, r: 'Aprovado antes de todo mundo. A Márcia viu. A Márcia lembra.' },
        { t: '"Bem-vindo de volta!"', fx: { dep: { compras: 6 } }, r: 'Carlos: "Obrigado! Já estou planejando as próximas."' },
      ] },

    // ============================== CASA (à noite) ==============================
    { id: 'fim-de-semana', g: 'casa', chance: 1, cond: (S) => S.dia % 5 === 0,
      titulo: 'Fim de semana!', texto: 'Sexta acabou. Dois dias inteiros sem "cinco minutinhos". O que fazer?',
      escolhas: [
        { t: 'Descansar de verdade.', fx: { est: -25 }, r: 'Você dorme até tarde, vê o sol e lembra que existe vida fora da Voltagem.' },
        { t: 'Adiantar o trabalho.', fx: { prod: 6, rep: 4, est: 6 }, r: 'Segunda-feira você chega com tudo pronto. Ninguém percebe, mas você percebe.' },
        { t: 'Fazer um curso online de Excel.', fx: { prod: 5, flag: 'excel', est: -5 }, r: 'Agora você sabe PROCV. O mundo é seu.' },
      ] },
    { id: 'email-23h', g: 'casa', chance: 0.3, cd: 4, cond: (S) => S.dia >= 2,
      titulo: '23:04. Um e-mail do Marcos.', quem: 'marcos',
      texto: '"Consegue me mandar isso hoje?" (São 23h04. "Hoje" acaba em 56 minutos.)',
      escolhas: [
        { t: '"Claro!"', fx: { rep: 10, est: 20, extra: ['-30 minutos de vida'] }, r: 'Você manda às 23h58. Marcos responde às 7h: "Obrigado! Na verdade era para semana que vem."' },
        { t: '"Consigo amanhã."', fx: { rep: 2, est: 0, extra: ['+5 respeito próprio'] }, r: 'Marcos: "Perfeito!" Foi simples. Por que não é sempre assim?' },
        { t: 'Ignorar.', fx: { est: -10, rep: -5, extra: ['+10 felicidade'] }, r: 'Você dorme o sono dos justos.' },
        { t: '"Conforme alinhado..."', fx: { inf: 5, extra: ['+5 política corporativa'] }, r: 'Você nem sabe o que foi alinhado. Marcos também não. Funciona.' },
      ] },
    { id: 'grupo', g: 'casa', chance: 0.3, cd: 3,
      titulo: '87 mensagens novas.', texto: 'O grupo "Voltagem ⚡ Oficial 🔥" está pegando fogo às 22h. Alguém mandou "bom dia" atrasado e começou uma discussão.',
      escolhas: [
        { t: 'Ler tudo.', fx: { est: 8, inf: 2 }, r: 'Você descobre que o happy hour mudou de lugar três vezes e que alguém vai pedir demissão.' },
        { t: 'Silenciar por um ano.', fx: { est: -6 }, r: 'Paz. Uma paz anual.' },
        { t: 'Mandar uma figurinha.', fx: { fama: 1, rep: 1, est: -2 }, r: 'Era a figurinha da linha parada. Sucesso absoluto.' },
      ] },
    { id: 'recrutador', g: 'casa', chance: 0.6, uma: true, cond: (S) => S.flags.linkedin,
      titulo: 'Um recrutador mandou mensagem.', texto: '"Oportunidade incrível numa empresa jovem e dinâmica! Ambiente descontraído, frutas às sextas. Salário a combinar."',
      escolhas: [
        { t: 'Responder com interesse.', fx: { flag: 'proposta', est: -3 }, r: 'Agora você tem "outra proposta". É vaga, mas existe. Pode ser útil numa conversa sobre salário.' },
        { t: 'Ignorar.', fx: { est: 1 }, r: 'Frutas às sextas... tentador, mas não.' },
      ] },
    { id: 'empreender', g: 'casa', chance: 0.5, uma: true, cond: (S) => S.din >= 9000 && S.est >= 50 && S.dia >= 12,
      titulo: 'Uma ideia às 2h da manhã.',
      texto: 'E se você abrisse a sua própria empresa? Organizada, sem reuniões, sem "conforme alinhado". Você abre o bloco de notas e escreve: "Plano de negócios v1 (final) (agora vai)".',
      escolhas: [
        { t: 'Pedir demissão e empreender.', perigo: true, fx: { fim: 'empreendedor' } },
        { t: 'Dormir. Amanhã eu penso.', fx: { est: -4 }, r: 'Amanhã você não pensa. Mas a ideia fica guardada.' },
      ] },
    { id: 'insonia', g: 'casa', chance: 0.6, cd: 3, cond: (S) => S.est >= 70,
      titulo: 'Insônia corporativa.', texto: 'São 3h e você está pensando no status report. E no tom do "ok" que o Marcos mandou.',
      escolhas: [
        { t: 'Responder e-mails de madrugada.', fx: { prod: 4, est: 8, rep: 3 }, r: 'Às 3h17 você manda um e-mail. Às 3h18, o Wagner responde.' },
        { t: 'Respirar fundo e dormir.', fx: { est: -15 }, r: 'Inspira, expira. "Ok" era só "ok". Provavelmente.' },
        { t: 'Ver vídeos de gatos.', fx: { est: -10 }, r: 'Duas horas de gatos. Nenhum arrependimento.' },
      ] },
    { id: 'sonho', g: 'casa', chance: 0.2, cd: 4,
      titulo: 'Um sonho estranho.', texto: 'Você sonha com uma reunião sem pauta que dura para sempre. No sonho, todos dizem "conforme alinhado" e alguém pergunta se você tem cinco minutinhos.',
      escolhas: [{ t: 'Acordar.', fx: { est: 3 }, r: 'Você acorda com a sensação de que precisa alinhar alguma coisa.' }] },
  ];

  // ============================== OBJETOS DO PRÉDIO ==============================
  // nome: texto do botão de interação; usar(S): o que acontece
  const info = (titulo, texto, fx) => F.Escolhas.info(titulo, texto, fx);
  F.OBJETOS = {
    elevador: { nome: 'Chamar o elevador', usar: () => F.Interacao.elevador() },
    mesa: { nome: 'Usar o seu computador', usar: () => F.Mesa.abrir() },
    saida: { nome: 'Ir embora para casa', usar: () => F.Dia.sair() },
    cafe: {
      nome: 'Tomar um café',
      usar(S, m) {
        S.hoje.cafes = (S.hoje.cafes || 0) + 1;
        F.Som.cafe();
        const fabrica = m && m.id === 'cafe-fabrica';
        if (S.hoje.cafes > 3) return info('☕ Mais um café', 'É o seu ' + S.hoje.cafes + 'º café hoje. Você está vibrando. Literalmente. Dá para ouvir o seu coração do outro andar.', { est: 4, prod: -3, t: 10, conta: { cafes: 1 } });
        if (fabrica) return info('☕ Café da fábrica', 'Forte como um contrato sem cláusula de rescisão. Você enxerga sons por alguns segundos.', { est: -12, prod: 3, t: 10, aprende: 'cafe-fabrica', conta: { cafes: 1 } });
        return info('☕ Café da copa', F.u.pick(['Um café ralo, morno e corporativo. Mesmo assim, ajuda.', 'A máquina pergunta "Deseja açúcar?" e não espera a resposta.', 'Você toma o café ouvindo alguém explicar o que é "sinergia". Ninguém sabe.']), { est: -8, t: 10, conta: { cafes: 1 } });
      },
    },
    pao: {
      nome: 'Olhar a bandeja de pão de queijo',
      usar(S) {
        if (S.paes <= 0) return info('🧀 Bandeja vazia', 'Só restaram migalhas e um guardanapo com a palavra "PERDÃO" escrita à caneta.', { t: 1 });
        if (S.paes === 1) return F.Escolhas.mostrar('ultimo-pao');
        S.hoje.paes = (S.hoje.paes || 0) + 1;
        S.paes--;
        if (S.hoje.paes > 2) return info('🧀 Mais um pão de queijo', 'Terceiro pão de queijo. Você sente olhares vindos de todos os setores ao mesmo tempo.', { est: -3, rep: -2, t: 3 });
        return info('🧀 Pão de queijo', 'Quentinho. Por um momento, tudo faz sentido na Voltagem S.A.', { est: -6, t: 5 });
      },
    },
    bebedouro: { nome: 'Beber água', usar: () => info('💧 Bebedouro', F.u.pick(['Você bebe água e ouve dois engenheiros discutindo um problema de 2019.', 'Água gelada. O ar-condicionado também.', 'Alguém deixou um copo com o nome "NÃO É SEU".']), { est: -2, t: 5 }) },
    avisos: {
      nome: 'Ler o quadro de avisos',
      usar: () => info('📌 Quadro de avisos', F.u.shuffle([
        '• Proibido esquentar peixe no micro-ondas. (Assinado: todos)',
        '• Treinamento obrigatório de "Gestão do Tempo": 8 horas.',
        '• Achados e perdidos: 1 crachá, 3 guarda-chuvas e a motivação de alguém.',
        '• A pesquisa de clima é anônima. (Por favor, coloque seu nome.)',
        '• Dia da Pizza adiado para o próximo trimestre.',
        '• Vende-se: bicicleta ergométrica, usada uma vez em 2019.',
        '• Lembrete: a sala Sinergia está reservada pelo Gustavo até dezembro.',
        '• Campanha de redução de custos: tragam suas próprias canetas.',
      ]).slice(0, 4).join('\n'), { t: 5, est: -1 }),
    },
    esteira: { nome: 'Observar a linha de montagem', usar: (S) => info('⚙ Linha de montagem', S.flags.linhaParada ? 'A esteira está parada e todo mundo está olhando para ela, como se ela fosse se explicar.' : 'Painéis passam devagar na esteira. É estranhamente relaxante.', { est: -3, t: 5 }) },
    painel472: { nome: 'Examinar o painel #472', usar: () => info('⚡ Painel #472', 'Um painel elétrico com uma luz vermelha piscando. Alguém colou um post-it: "NÃO É PISCA-PISCA DE NATAL".', { t: 3 }) },
    estoque: { nome: 'Olhar as prateleiras', usar: () => info('📦 Estoque', 'Caixas, caixas e uma caixa com a etiqueta "BANANA". Não tem banana.', { t: 3 }) },
    caminhao: { nome: 'Olhar o caminhão', usar: () => info('🚚 Caminhão', 'O caminhão da Voltagem, de portas abertas e esperando. Parece triste. Caminhões ficam tristes?', { t: 2 }) },
    etiquetadora: { nome: 'Usar a etiquetadora', usar: () => info('🏷 Etiquetadora', 'Você imprime uma etiqueta escrita "TESTE". Agora existe um material chamado TESTE no sistema.', { t: 3, docs: 1 }) },
    portaRH: {
      nome: 'Bater na porta do RH',
      usar(S) {
        if (S.flags.rhAberto) return info('🚪 RH', 'A porta está aberta. Lá dentro, Patrícia sorri para você antes mesmo de você entrar.', {});
        return info('🚪 Porta do RH', 'Trancada. Uma placa: "RH — atendimento somente com agendamento ou com um problema grave."', { t: 1 });
      },
    },
    mesaCarlos: {
      nome: 'Olhar a mesa vazia',
      usar(S) {
        if (S.dia >= 16) return info('🗂 Mesa do Carlos', 'O Carlos voltou. A placa "De férias" agora diz "Voltei! (mas estou em adaptação)".', {});
        if (S.regras.includes('carlos-aprova')) return info('🗂 Mesa do Carlos', 'Uma mesa impecável com uma placa: "De férias. Volto dia 16." Ao lado, 37 aprovações esperando. Agora você entende.', { aprende: 'carlos-ferias', t: 2 });
        return info('🗂 Mesa vazia', 'Uma placa: "Carlos. De férias. Volto dia 16." Uma pilha de pastas espera. Quem será Carlos?', { t: 2 });
      },
    },
    quadroLogistica: { nome: 'Ler o quadro da Logística', usar: () => info('📋 Quadro da Logística', 'PEDIDOS ATRASADOS: 47\nPEDIDOS NO PRAZO: (em branco)\nCAMINHÕES ESPERANDO: sim', { t: 2 }) },
    microondas: { nome: 'Usar o micro-ondas', usar: (S) => info('🍱 Micro-ondas', S.minuto > 11.5 * 60 && S.minuto < 14 * 60 && !S.flags.almocou ? 'Você esquenta a marmita e almoça. Uma hora de paz.' : 'Tem uma marmita de peixe girando lá dentro há 6 minutos. Ninguém assume.', S.minuto > 11.5 * 60 && S.minuto < 14 * 60 && !S.flags.almocou ? { est: -10, t: 50, flag: 'almocou' } : { t: 2 }) },
    geladeira: { nome: 'Abrir a geladeira', usar: () => info('🧊 Geladeira', 'Um pote com o aviso "NÃO MEXA — WAGNER". Validade: 2019.', { t: 2 }) },
    mesaCopa: { nome: 'Sentar na copa um pouco', usar: () => F.Interacao.fofoca(true) },
    impressora: { nome: 'Usar a impressora', usar: (S) => (S.flags.impressoraTravada ? F.Escolhas.mostrar('impressora-travou') : info('🖨 Impressora', 'Nada para imprimir. A impressora parece aliviada.', { t: 1 })) },
    arquivosQualidade: { nome: 'Mexer no arquivo da Qualidade', usar: () => F.Escolhas.mostrar('burocracia') },
    indicadores: { nome: 'Ver os indicadores', usar: () => info('📈 Indicadores', 'Todos os indicadores estão verdes. O monitor está desligado.', { t: 2 }) },
    kanban: { nome: 'Olhar o kanban', usar: () => info('🗂 Kanban dos projetos', 'A FAZER: 112 cartões\nFAZENDO: 3 cartões\nFEITO: 1 cartão ("criar o kanban")', { t: 2 }) },
    telaStatus: { nome: 'Ver a tela de status', usar: (S) => info('🟩 Status dos projetos', S.regras.includes('verde-melancia') ? 'STATUS: VERDE. Mas você sabe a verdade: é melancia.' : 'STATUS: VERDE. Todos os projetos estão verdes. Todos.', { t: 2 }) },
    rack: { nome: 'Olhar os servidores', usar: () => info('🖧 Servidores', 'Luzes piscando e um post-it: "NÃO DESLIGAR. NUNCA. (2019)".', { t: 2 }) },
    maquete: { nome: 'Examinar o protótipo', usar: () => F.Escolhas.mostrar('botao-nao') },
    quadroOperacoes: { nome: 'Ler o quadro de Operações', usar: () => info('📋 Operações Integradas', 'MISSÃO: a definir.\nVISÃO: a definir.\nVALORES: a definir.\nÚltima atualização: 2019.', { t: 2 }) },
    trofeuChefe: { nome: 'Olhar o troféu do Marcos', usar: () => info('🏆 Troféu', '"Melhor Gestor 2017". O troféu é maior que a mesa.', { t: 1 }) },
    trofeusComercial: { nome: 'Olhar os troféus', usar: () => info('🏆 Troféus do Comercial', 'Muitos troféus de vendas. Nenhum de entrega.', { t: 1 }) },
    trofeusDiretoria: { nome: 'Olhar os prêmios', usar: () => info('🏆 Prêmios da Diretoria', '"Prêmio Excelência em Sinergia". Ninguém sabe quem dá esse prêmio.', { t: 1 }) },
    aquario: { nome: 'Olhar o aquário', usar: () => info('🐟 Aquário', 'Um peixe chamado KPI nada em círculos, como os indicadores. Ele parece em paz.', { est: -4, t: 5 }) },
    salaReuniao: { nome: 'Olhar a sala de reuniões', usar: (S) => F.Reuniao.naSala() || info('🪑 Sala "Sinergia"', 'Reservada pelo Gustavo até o fim do ano. Sempre vazia.', { t: 1 }) },
    salaConselho: { nome: 'Olhar a mesa do Conselho', usar: (S) => F.Reuniao.naSala() || info('🪑 Sala do Conselho', 'Cabe a empresa inteira. Só usam a ponta.', { t: 1 }) },
  };

  // situações chamadas por objetos
  F.EVENTOS.push(
    { id: 'ultimo-pao', g: 'manual',
      titulo: 'O último pão de queijo.',
      texto: 'Resta um. Um único pão de queijo, dourado, sozinho na bandeja. Do outro lado da copa, alguém está olhando. Você sente o peso da decisão.',
      escolhas: [
        { t: 'Pegar.', fx: { est: -10, rep: -5, fama: 2, dep: { operacoes: -6, comercial: -4 }, aprende: 'pao-de-queijo', paes: -1 }, r: 'Delicioso. Da copa, alguém sussurra: "Foi você?"' },
        { t: 'Dividir ao meio com a Kátia.', fx: { rep: 6, est: -4, dep: { operacoes: 5, comercial: 6 }, aprende: 'pao-de-queijo', paes: -1 }, r: 'A história se espalha antes do fim do expediente. Você agora é uma lenda da copa.' },
        { t: 'Deixar para a próxima pessoa.', fx: { rep: 3, est: 3, aprende: 'pao-de-queijo' }, r: 'Você deixa. Dez minutos depois, ele some. Ninguém sabe quem pegou. A investigação continua.' },
        { t: 'Deixar um bilhete: "É do Wagner".', perigo: true, fx: { fama: 1, dep: { engenharia: -2 }, aprende: 'pao-de-queijo' }, r: 'O Wagner come o pão de queijo às 21h, sozinho, feliz.' },
      ] },
    { id: 'impressora-travou', g: 'manual',
      titulo: 'A impressora travou.',
      texto: 'Uma luz vermelha pisca. Na tela: "ERRO 0x00F4: atolamento de papel na bandeja 7". A impressora só tem duas bandejas.',
      escolhas: [
        { t: 'Desligar e ligar.', regra: 'desligar-ligar', fx: { t: 5, rep: 3, flags: ['-impressoraTravada'], tarefa: 0 }, r: 'Funciona. Uma fila de 48 impressões de outras pessoas sai de uma vez.' },
        { t: 'Imprimir com confiança.', regra: 'impressora', fx: { t: 3, rep: 4, fama: 1, flags: ['-impressoraTravada'] }, r: 'Você aperta o botão olhando nos olhos da impressora. Ela obedece.' },
        { t: 'Chamar o Gilmar, da TI.', fx: { t: 40, flags: ['-impressoraTravada'], dep: { operacoes: 2 } }, r: 'Gilmar chega, olha, suspira e negocia com a impressora por 30 minutos. Acordo fechado.' },
        { t: 'Dar um tapinha nela.', perigo: true, fx: { est: -3, rep: -3, fama: 1, t: 2 }, r: 'Agora ela também está com o visor apagado. Você sai devagar.' },
      ] },
    { id: 'botao-nao', g: 'manual',
      titulo: 'O botão "NÃO".',
      texto: 'O protótipo do novo painel tem um botão vermelho grande escrito "NÃO".',
      escolhas: [
        { t: 'Não apertar.', fx: { t: 2 }, r: 'Maturidade. Seu eu do passado está orgulhoso.' },
        { t: 'Apertar.', perigo: true, fx: { fama: 2, est: -6, dep: { engenharia: -6 }, t: 2 }, r: 'As luzes do andar inteiro piscam. Ninguém sabe que foi você. A Lia sabe.' },
        { t: 'Perguntar para o Fausto o que o botão faz.', fx: { t: 15, aprende: '2019' }, r: 'Fausto: "Isso? Já aconteceu em 2019." Você não sabe se ele respondeu.' },
      ] },
  );

  F.EVENTO = {};
  F.EVENTOS.forEach((e) => { F.EVENTO[e.id] = e; });
})();
