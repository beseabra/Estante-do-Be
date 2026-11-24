// ============================================================
//  ★ CONTEÚDO DO JOGO: sons, falas e textos ★
//  Quase tudo que é texto mora aqui. Dá para editar à vontade.
//
//  É uma PARÓDIA. As falas são piadas inventadas; os casos
//  citados (rachadinha, Queiroz, loja de chocolate, mansão) são
//  os que foram noticiados e investigados. O caso da rachadinha
//  foi anulado pelo STJ em 2021, e o jogo faz piada disso também.
// ============================================================
window.G = window.G || {};

// ------------------------------------------------------------
//  SONS (pasta "sons/"). Se um arquivo faltar, o jogo gera um
//  som parecido sozinho. Os áudios vieram do myinstants.
// ------------------------------------------------------------
G.ARQUIVOS = {
  // os áudios do Janones (um diferente a cada missão)
  'urgente1':        'sons/pessoal-urgente.mp3',
  'urgente2':        'sons/pessoal-urgente-explode.mp3',
  'urgente3':        'sons/janones-avisa.mp3',
  'urgente4':        'sons/janones-voltamos.mp3',
  'urgente5':        'sons/janones-explode.mp3',
  'missao-cumprida': 'sons/missao-cumprida.mp3',

  // acertos e erros
  'acertou':         'sons/acertou.mp3',          // Faustão: "Acertou!"
  'errou':           'sons/errou.mp3',            // Faustão: "Errou!"
  'vine-boom':       'sons/vine-boom.mp3',
  'buzina':          'sons/buzina.mp3',
  'zap':             'sons/zap.mp3',

  // bordões
  'faz-o-l':         'sons/faz-o-l.mp3',
  'faz-o-l-vinheta': 'sons/faz-o-l-vinheta.mp3',
  'picanha':         'sons/picanha.mp3',          // Lula: picanha e cerveja
  'companheiro':     'sons/companheiro.mp3',      // Lula: "chora não, companheiro"
  'taokey':          'sons/taokey.mp3',
  'queiroz':         'sons/queiroz.mp3',          // "Ô Queiroz"
  'risada':          'sons/risada-bolsonaro.mp3',
  'perseguicao':     'sons/perseguicao.mp3',
  'policia-federal': 'sons/policia-federal.mp3',  // "Alô, Polícia Federal!"
  'sirene':          'sons/sirene-pf.mp3',
  'urna':            'sons/urna.mp3',             // o "confirma" da urna
  'trombone':        'sons/trombone.mp3',

  // músicas (tocam em loop)
  'musica-titulo':   'sons/lula-la.mp3',          // Lula lá, brilha uma estrela
  'musica-chefao':   'sons/jingle-flavio.mp3',    // o jingle do 01, no chefão
};

// ------------------------------------------------------------
//  PERSONAGENS JOGÁVEIS (aparecem nos microgames)
// ------------------------------------------------------------
G.HEROIS = {
  lula: {
    nome: 'LULA',
    descricao: ['Duro na queda', 'Especialista em picanha', 'Faz o L com as duas mãos'],
    vitoria: ['Companheiro!', 'É isso aí!', 'Picanha pra todo mundo!', 'O amor venceu!', 'Faz o L!'],
    derrota: ['Ô, companheiro...', 'Assim não dá!', 'Isso é golpe!', 'Ai, meu joelho!'],
  },
  janones: {
    nome: 'JANONES',
    descricao: ['Áudio de 7 minutos', 'Meta: 100 posts por dia', '8 milhões no zap'],
    vitoria: ['COMPARTILHA!', 'MISSÃO CUMPRIDA!', 'EXPLODE ESSE VÍDEO!', 'ORGULHO, EXÉRCITO!'],
    derrota: ['Isso é censura!', 'Vou fazer um áudio sobre isso!', 'Pessoal... decepcionante.'],
  },
};

// O que o 01 diz no chefão
G.FALAS_FLAVIO = [
  'Isso é perseguição política!',
  'Eu não sei de nada!',
  'Pergunta pro Queiroz!',
  'Tudo dentro da lei, tá ok?',
  'Só vendi chocolate!',
  'Meu advogado vai falar!',
  'O STJ anula isso!',
  'Vou pra Miami!',
  'Pai, me ajuda!',
  'Rachadinha? Nunca ouvi falar!',
];

// Manchetes das fake news (microgame DESMENTE)
G.FAKES = [
  'URNA VEM COM CHIP DO PARAGUAI',
  'LULA VAI TAXAR O PIX DO SEU CACHORRO',
  'PICANHA AGORA É CRIME',
  'VACINA DÁ SINAL DE 5G',
  'GOVERNO VAI CONFISCAR SEU CHURRASCO',
  'O PT VAI PROIBIR A COXINHA',
  'QUEIROZ VIU UM DISCO VOADOR',
  'TERRA É PLANA, CONFIRMA TIO',
];

G.CREDITOS = [
  'PESSOAL, URGENTE! A FUGA DO 01',
  'Uma paródia da eleição de 2026',
  '',
  'Ideia: Bernardo',
  'Elenco: Lula · Janones · Flávio · Queiroz',
  'Participação especial: o Japonês da Federal',
  'Sons: myinstants.com',
  '',
  'Todas as falas são piadas. Os casos citados foram noticiados',
  'e investigados; o da rachadinha foi anulado pelo STJ em 2021.',
  'Nenhum chocolate foi lavado durante a produção deste jogo.',
];

// O que aparece na tela da urna para cada número
G.URNA = {
  '13': { nome: 'LULA', partido: 'PT', quem: 'lula' },
  '22': { nome: 'FLÁVIO BOLSONARO', partido: 'PL', vice: 'QUEIROZ (brincadeira)', quem: 'flavio' },
};
