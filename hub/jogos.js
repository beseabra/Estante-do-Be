// ============================================================
//  ★ A ESTANTE: tudo que aparece no site sai daqui ★
//
//  Para adicionar um jogo novo:
//    1. Coloque a pasta do jogo dentro de "Estante-do-Be/" (com um
//       index.html dentro). Nome da pasta sem espaços nem acentos.
//    2. Copie um bloco { ... } de JOGOS e troque os dados.
//    3. Capa (16:9) em hub/capas/ e capturas de tela em hub/capturas/.
//
//  Campos de cada jogo:
//    id          identificador curto, sem espaços (vira o link da página)
//    titulo      nome do jogo
//    pasta       pasta do jogo, terminando em "/"
//    capa        imagem principal 16:9
//    capturas    lista de capturas de tela (a galeria da página)
//    cor         cor do jogo, "#rrggbb" (detalhes e transição)
//    status      'lancado' | 'teste' (em teste com os amigos) | 'embreve'
//    destaque    true = aparece na vitrine do topo
//    versao, data ('AAAA-MM-DD'), duracao, jogadores, controles
//    resumo      uma ou duas frases
//    descricao   parágrafos da página do jogo
//    tags        etiquetas
//    notas       o que mudou na última versão
// ============================================================
window.SITE = {
  nome: "estante do bê",
  dono: "Bernardo",
  slogan: "",
  // link para receber comentários (WhatsApp, Instagram, formulário...).
  // Deixe '' para esconder o botão.
  feedback: "",
};

window.JOGOS = [
  {
    id: "energy-exe",
    titulo: "Energy.exe",
    pasta: "Energy-exe/",
    capa: "hub/capas/energy-exe.png",
    capturas: [
      "hub/capturas/energy-1.png",
      "hub/capturas/energy-2.png",
      "hub/capturas/energy-3.png",
      "hub/capturas/energy-4.png",
      "hub/capturas/energy-5.png",
      "hub/capturas/energy-6.png",
    ],
    cor: "#1a5fd0",
    status: "teste",
    destaque: true,
    versao: "0.1 beta",
    data: "2026-10-07",
    duracao: "~2 horas (3 meses corporativos)",
    jogadores: "1",
    controles: "Teclado, mouse ou toque",
    resumo:
      "Simulador de vida corporativa com humor absurdo. Sobreviva ao primeiro mês numa grande empresa de energia, tome decisões e tente subir na carreira.",
    descricao: [
      "Você é a pessoa mais nova da Voltagem S.A. Ande livremente pelos quatro andares do prédio, da fábrica à Diretoria, converse com 34 colegas, receba missões, entre em reuniões e responda e-mails às 17h58.",
      "Quase tudo tem consequência: pedir aumento, fingir que está trabalhando, jogar a culpa em alguém, criar uma automação que economiza horas (ou que manda 4 mil e-mails para um cliente) e, claro, decidir o destino do último pão de queijo.",
      'Descubra as regras do "Manual não oficial" conversando com as pessoas, escolha entre as trilhas de gestão, técnica ou alternativa e encontre os dez finais.',
    ],
    tags: ["Simulação", "Humor", "Escolhas", "RPG"],
    notas: [
      "Primeira versão de teste: 4 andares, 34 pessoas, 35 situações com 111 escolhas, 8 investigações, 7 tipos de reunião e 10 finais.",
      "Funciona no celular: toque no chão para andar.",
    ],
  },
  {
    id: "eu-te-darei-o-sol",
    titulo: "Eu te darei o sol",
    pasta: "Eu-te-darei-o-sol/",
    capa: "hub/capas/eu-te-darei-o-sol.png",
    capturas: [
      "hub/capturas/sol-1.png",
      "hub/capturas/sol-5.png",
      "hub/capturas/sol-3.png",
      "hub/capturas/sol-4.png",
      "hub/capturas/sol-2.png",
    ],
    cor: "#ffb020",
    status: "teste",
    destaque: true,
    versao: "0.9 beta",
    data: "2026-10-05",
    duracao: "~1 hora",
    jogadores: "1 (com troca de personagem)",
    controles: "Teclado ou toque",
    resumo:
      "Plataforma narrativa em dez capítulos. Alterne entre dois irmãos gêmeos, cada um com habilidades próprias.",
    descricao: [
      "Noah plana e pinta pontes e nuvens. Jude pula mais alto, esculpe pedra e enxerga degraus que mais ninguém vê. Os capítulos alternam entre os dois até que eles precisem atravessar juntos, trocando de personagem a qualquer momento.",
      "Maré que sobe e desce, quadros que viram portais, fases verticais no escuro e quebra-cabeças com placas, portões e blocos.",
      'Inspirado no livro "Eu te darei o sol", de Jandy Nelson.',
    ],
    tags: ["Plataforma", "Narrativo", "Quebra-cabeça", "Dois personagens"],
    notas: [
      "Cinco capítulos novos (IV, V, VII, VIII e X).",
      "O pulo do Noah ficou um pouco mais alto.",
      "Empurrar blocos ficou bem mais rápido.",
    ],
  },
  {
    id: "fragmentados",
    titulo: "Fragmentados",
    pasta: "Fragmentos/",
    capa: "hub/capas/fragmentados.png",
    capturas: [
      "hub/capturas/frag-1.png",
      "hub/capturas/frag-2.png",
      "hub/capturas/frag-3.png",
      "hub/capturas/frag-4.png",
    ],
    cor: "#ff5c8a",
    status: "lancado",
    destaque: true,
    versao: "1.0",
    data: "2026-10-03",
    duracao: "~15 minutos",
    jogadores: "1",
    controles: "Teclado ou toque",
    resumo:
      "Plataforma curto e atmosférico em cinco fases. Junte os fragmentos escondidos em cada cenário para seguir em frente.",
    descricao: [
      "Cinco fases, cada uma com um clima diferente: um pôr do sol, uma noite iluminada só por vaga-lumes, chuva, neve e um amanhecer.",
      "Em cada fase há cinco fragmentos escondidos. Junte todos para chegar ao fim.",
      "Inspirado na obra de Fernando Machado.",
    ],
    tags: ["Plataforma", "Atmosférico", "Curto", "Relaxante"],
    notas: ["Versão 1.0: as cinco fases completas."],
  },
  {
    id: "projeto-secreto",
    titulo: "Projeto secreto",
    cor: "#7c8cff",
    status: "embreve",
    resumo: "Ainda no caderno de rascunhos.",
    descricao: ["Ainda não posso falar muito. Volte mais tarde."],
    tags: ["???"],
  },
];
