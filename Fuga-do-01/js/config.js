// ============================================================
//  ★ CONTEÚDO DO JOGO: falas, fases, missões e sons ★
//  Quase tudo que é texto mora aqui. Dá para editar à vontade.
//
//  É uma PARÓDIA. As falas são piadas inventadas; os casos
//  citados (rachadinha, Queiroz, loja de chocolate, mansão) são
//  os que foram noticiados e investigados. O caso da rachadinha
//  foi anulado pelo STJ em 2021, e o jogo faz piada disso também.
// ============================================================
window.G = window.G || {};

// ------------------------------------------------------------
//  SONS DE VERDADE
//  Coloque os arquivos na pasta "sons/" com estes nomes e o jogo
//  usa eles no lugar dos sons gerados por computador. Se o arquivo
//  não existir, o jogo inventa um som parecido sozinho (e as vozes
//  saem pela voz do navegador).
// ------------------------------------------------------------
G.ARQUIVOS = {
  // vozes e bordões
  'pessoal-urgente': 'sons/pessoal-urgente.mp3',   // áudio do Janones: "Pessoal, urgente!"
  'missao-cumprida': 'sons/missao-cumprida.mp3',   // Janones comemorando a missão
  'missao-falhou':   'sons/missao-falhou.mp3',     // Janones decepcionado
  'faz-o-l':         'sons/faz-o-l.mp3',           // "Faz o L!" (especial do Lula)
  'exercito':        'sons/exercito.mp3',          // especial do Janones (Exército do Lula)
  'taokey':          'sons/taokey.mp3',            // "Tá ok?"
  'perseguicao':     'sons/perseguicao.mp3',       // Flávio: "É perseguição!"
  'queiroz':         'sons/queiroz.mp3',           // quando acha o Queiroz
  'japones':         'sons/japones-da-federal.mp3',// a marchinha do Japonês da Federal
  'urna':            'sons/urna.mp3',              // o "piriri" da urna ao confirmar
  'buzina':          'sons/buzina.mp3',            // buzina de carreata
  'trombone':        'sons/trombone-triste.mp3',   // derrota
  'zap':             'sons/zap.mp3',               // notificação de mensagem

  // músicas (tocam em loop)
  'musica-titulo':   'sons/lula-la.mp3',           // tela de título
  'musica-fase1':    'sons/fase1.mp3',
  'musica-fase2':    'sons/fase2.mp3',
  'musica-fase3':    'sons/fase3.mp3',
  'musica-fase4':    'sons/fase4.mp3',
  'musica-fase5':    'sons/fase5.mp3',
  'musica-urna':     'sons/urna-fundo.mp3',
  'musica-vitoria':  'sons/vitoria.mp3',           // final com o 13
  'musica-derrota':  'sons/derrota.mp3',
};

// ------------------------------------------------------------
//  PERSONAGENS JOGÁVEIS
// ------------------------------------------------------------
G.HEROIS = {
  lula: {
    nome: 'LULA',
    vida: 5,
    tiroNome: 'picanha',
    tiroCada: 0.42,
    especial: 'FAZ O L!',
    descricao: [
      'Vida: 5 (o homem é duro na queda)',
      'Arremessa PICANHA (a promessa cumprida)',
      'Especial: FAZ O L! limpa a tela',
    ],
    falas: [
      'Companheiro, volta aqui!',
      'Picanha e cervejinha pra todo mundo!',
      'Ô Flávio, devolve o dinheiro do povo!',
      'Tenho 81 anos e corro mais que você!',
      'Sem anistia, companheiro!',
      'Janja, segura meu celular!',
      'O amor vai vencer de novo!',
      'Esse menino não aprende!',
    ],
    dano: ['Ai, meu joelho!', 'Isso é golpe!', 'Companheiro, assim não!'],
  },
  janones: {
    nome: 'JANONES',
    vida: 4,
    tiroNome: 'áudio urgente',
    tiroCada: 0.28,
    especial: 'MISSÃO DADA!',
    descricao: [
      'Vida: 4 (mas o coração aguenta)',
      'Dispara ÁUDIOS URGENTES (rápidos)',
      'Especial: chama o EXÉRCITO DO LULA',
    ],
    falas: [
      'PESSOAL, URGENTE!',
      'Compartilhem antes que apaguem!',
      'Exército, ATENÇÃO!',
      'Meta de hoje: 100 posts!',
      'Coração a mil, mas a missão continua!',
      'O TSE não me segura!',
      'Áudio de 7 minutos chegando!',
      'Encaminhem pros indecisos!',
    ],
    dano: ['Isso é censura!', 'Vou fazer um áudio sobre isso!', 'Ai, o coração!'],
  },
};

// O que o Flávio grita enquanto foge (vale para todas as fases)
G.FALAS_FLAVIO = [
  'Isso é perseguição política!',
  'Eu não sei de nada!',
  'Pergunta pro Queiroz!',
  'Tudo dentro da lei, tá ok?',
  'É narrativa da esquerda!',
  'FAKE NEWS!',
  'Meu advogado vai falar por mim!',
  'Sou o 01, sou inocente!',
  'Só vendi chocolate!',
  'Pai, me ajuda!',
];

// Quando o Flávio é acertado
G.FALAS_FLAVIO_DOR = ['Ai!', 'Isso é abuso!', 'Vou no STF!', 'Meu terno!', 'Covardia!', 'Respeita o senador!'];

// ------------------------------------------------------------
//  AS FASES
//    vel       velocidade da corrida (px/s)
//    fecha     quanto você se aproxima do Flávio por segundo
//    arrancada de quanto em quanto tempo o Flávio dá um pique
//    tiroCada  de quanto em quanto tempo o Flávio joga algo
//    tiros     o que ele joga
//    obst      obstáculos (o número é o peso: mais = aparece mais)
//    zap       mensagens do Janones antes da fase
//    falas     falas extras do Flávio nessa fase
//    fuga      o que acontece quando você pega ele
// ------------------------------------------------------------
G.FASES = [
  {
    id: 'alerj',
    titulo: 'O Gabinete Fantasma',
    lugar: 'ALERJ · Rio de Janeiro',
    vel: 320, fecha: 1.6, arrancada: [9, 13], tiroCada: [2.2, 3.2],
    tiros: ['envelope', 'envelope', 'fake'],
    obst: { mesa: 3, processos: 3, fantasma: 4, faixa: 2, buraco: 1 },
    zap: [
      { de: 'janones', audio: '0:47', txt: 'PESSOAL, URGENTE! O 01 tá fugindo pelos corredores da ALERJ!' },
      { de: 'janones', audio: '1:12', txt: 'Lá dentro tem um monte de ASSESSOR FANTASMA. Ninguém nunca viu eles trabalhando, mas o salário cai todo mês. Atira neles!' },
      { de: 'janones', audio: '0:23', txt: 'Missão: pega o Flávio antes que ele raxe mais algum salário. VAI, EXÉRCITO!' },
    ],
    falas: [
      'Rachadinha? Nunca ouvi falar!',
      'O salário é deles, eu só guardo!',
      'Meus assessores existem, só são tímidos!',
      'Devolver 90% do salário é voluntário!',
    ],
    fuga: [
      'Você agarrou o 01 pelo paletó!',
      'Mas aí chegou um papel do STJ: "CAPTURA ANULADA".',
      'O 01 sai andando de boa, assobiando...',
      'Ele correu pra uma loja de chocolate. Atrás dele!',
    ],
  },
  {
    id: 'chocolate',
    titulo: 'A Loja de Chocolate',
    lugar: 'Shopping · Barra da Tijuca',
    vel: 345, fecha: 1.5, arrancada: [8, 12], tiroCada: [1.8, 2.8],
    tiros: ['bombom', 'bombom', 'dinheiro', 'fake'],
    obst: { coelho: 3, caixa: 3, vitrine: 2, faixa: 2, buraco: 1, carrinho: 2 },
    zap: [
      { de: 'janones', audio: '0:58', txt: 'PESSOAL, URGENTE! O 01 se enfiou numa LOJA DE CHOCOLATE!' },
      { de: 'janones', audio: '2:03', txt: 'Uma loja que vendia tanto, mas TANTO bombom que até o Ministério Público ficou curioso. Cuidado com os caixas eletrônicos: 48 depósitos de 2 mil saindo de uma vez!' },
      { de: 'lula', audio: '0:11', txt: 'Companheiro Janones, chocolate é bom, mas eu prefiro picanha.' },
    ],
    falas: [
      'É Páscoa o ano inteiro, ué!',
      '48 depósitos de 2 mil? Coincidência!',
      'Dinheiro vivo é mais higiênico!',
      'Quer um bombom? É de graça... pra mim!',
    ],
    fuga: [
      'Você encurralou o 01 atrás do balcão!',
      'Ele se fantasiou de COELHO DA PÁSCOA...',
      '...e saiu pulando pela porta dos fundos.',
      'Destino: uma casa em Atibaia. Quem será que mora lá?',
    ],
  },
  {
    id: 'atibaia',
    titulo: 'Cadê o Queiroz?',
    lugar: 'Atibaia · São Paulo',
    vel: 365, fecha: 1.45, arrancada: [7, 11], tiroCada: [1.7, 2.5],
    tiros: ['fake', 'envelope', 'cheque'],
    obst: { arbusto: 5, cerca: 3, faixa: 2, buraco: 2, gnomo: 2 },
    zap: [
      { de: 'janones', audio: '1:40', txt: 'PESSOAL, URGENTE! O 01 foi pra ATIBAIA, na casa do advogado. Adivinha quem tava escondido lá?' },
      { de: 'janones', audio: '0:34', txt: 'ELE MESMO. O QUEIROZ! Ele tá pulando de moita em moita. Pega ele que vale ponto!' },
      { de: 'janones', audio: '0:09', txt: 'E se ele começar a dançar, NÃO OLHA. É distração.' },
    ],
    falas: [
      'Queiroz? Que Queiroz?',
      'Ele tá só de férias na casa do advogado!',
      'Nunca vi esse homem na vida!',
      'Atibaia? Nem sei onde fica!',
    ],
    fuga: [
      'Você pegou o 01 no meio do quintal!',
      'Mas o Queiroz saiu da moita e começou a DANÇAR.',
      'Todo mundo parou pra filmar. Viralizou.',
      'No meio da dancinha, o 01 fugiu pra Brasília. Pra uma MANSÃO.',
    ],
  },
  {
    id: 'mansao',
    titulo: 'A Mansão de 6 Milhões',
    lugar: 'Lago Sul · Brasília',
    vel: 385, fecha: 1.4, arrancada: [6, 10], tiroCada: [1.6, 2.5],
    tiros: ['boleto', 'dinheiro', 'fake', 'boleto'],
    obst: { piscina: 3, lancha: 2, estatua: 3, faixa: 2, mordomo: 2, buraco: 1 },
    zap: [
      { de: 'janones', audio: '3:12', txt: 'PESSOAL, URGENTE! O 01 tá numa MANSÃO de quase SEIS MILHÕES no Lago Sul!' },
      { de: 'janones', audio: '0:51', txt: 'Comprada com salário de senador e um financiamento camarada. Cuidado com os BOLETOS que ele joga, ele não paga nenhum!' },
      { de: 'lula', audio: '0:20', txt: 'Com 6 milhões dava pra fazer um churrasco pro Brasil inteiro, companheiro.' },
    ],
    falas: [
      'Economizei o salário, ué!',
      'Financiamento facilitado, quem nunca?',
      '6 milhões aqui é casa popular!',
      'A piscina é pra hidroginástica do Pai!',
    ],
    fuga: [
      'Você alcançou o 01 na beira da piscina!',
      'SPLASH! Ele pulou na água de terno e tudo.',
      'Saiu do outro lado, pegou um táxi aéreo...',
      '...e foi direto pro aeroporto. Ele quer ir pros ESTADOS UNIDOS encontrar o irmão!',
    ],
  },
  {
    id: 'aeroporto',
    titulo: 'Fuga pra Miami',
    lugar: 'Aeroporto de Brasília',
    vel: 410, fecha: 1.35, arrancada: [6, 9], tiroCada: [1.5, 2.4],
    tiros: ['fake', 'fake', 'mala', 'boleto', 'dinheiro'],
    obst: { mala: 3, esteira: 2, cone: 3, faixa: 2, drone: 3, buraco: 1 },
    zap: [
      { de: 'janones', audio: '4:44', txt: 'PESSOAL, URGENTEEEE! ÚLTIMA MISSÃO! O 01 tá no AEROPORTO tentando embarcar pra Miami!' },
      { de: 'janones', audio: '0:30', txt: 'O GABINETE DO ÓDIO tá soltando drone e fake news por todo lado. Desmente tudo!' },
      { de: 'janones', audio: '0:15', txt: 'Já liguei pra PF. Tão mandando um reforço especial... 🕶️' },
      { de: 'lula', audio: '0:08', txt: 'Faz o L, companheiro. FAZ O L.' },
    ],
    falas: [
      'Vou visitar o meu irmão!',
      'Anistia! ANISTIA!',
      'Despacha a mala, eu levo o dinheiro na mão!',
      'Lá em Miami ninguém me acha!',
      'Cadê meu passaporte?!',
    ],
    fuga: [], // o final é diferente: aparece o Japonês da Federal
  },
];

// ------------------------------------------------------------
//  MISSÕES DO JANONES (aparecem no meio da corrida)
//    tipo   votos | fake | limpo | acertar | picanha | queiroz | fantasma
//    n      quanto precisa (para "limpo" são segundos)
//    t      tempo para cumprir
//    fases  em quais fases aparece (vazio = todas)
// ------------------------------------------------------------
G.MISSOES = [
  { tipo: 'votos',    n: 15, t: 15, txt: 'Junta {n} votos em {t}s! Meta é meta!' },
  { tipo: 'votos',    n: 25, t: 22, txt: 'Bora, {n} votos! O Datafolha tá olhando!' },
  { tipo: 'fake',     n: 3,  t: 18, txt: 'Desmente {n} fake news! Atira nos zaps!' },
  { tipo: 'limpo',    n: 10, t: 10, txt: 'Fica {n}s sem levar dano! Sem vacilo!' },
  { tipo: 'acertar',  n: 3,  t: 20, txt: 'Acerta o 01 {n} vezes! Vai na picanha!' },
  { tipo: 'picanha',  n: 2,  t: 25, txt: 'Pega {n} picanhas! Promessa é promessa!' },
  { tipo: 'fantasma', n: 4,  t: 20, txt: 'Exorciza {n} assessores fantasmas!', fases: ['alerj'] },
  { tipo: 'queiroz',  n: 2,  t: 25, txt: 'Acha o Queiroz {n} vezes! Olha nas moitas!', fases: ['atibaia'] },
  { tipo: 'fake',     n: 5,  t: 20, txt: 'Gabinete do ódio atacando! Desmente {n}!', fases: ['aeroporto'] },
];

G.MISSAO_OK = ['MISSÃO CUMPRIDA, SOLDADO!', 'É ISSO, EXÉRCITO!', 'COMPARTILHA ESSA VITÓRIA!', 'ORGULHO!'];
G.MISSAO_FALHOU = ['Pessoal... decepcionante.', 'Vou ter que mandar outro áudio.', 'Assim o 01 foge!'];

// Placas e letreiros espalhados pelos cenários
G.PLACAS = {
  alerj: ['GABINETE 01', 'RH: 0 FUNCIONÁRIOS VISTOS', 'PONTO? QUE PONTO?', 'SALA DO QUEIROZ'],
  chocolate: ['PÁSCOA O ANO TODO', 'ACEITAMOS DINHEIRO VIVO', 'PROMOÇÃO: LAVE 2 PAGUE 1', 'BOMBOM R$ 2.000'],
  atibaia: ['PROPRIEDADE PARTICULAR', 'CUIDADO: QUEIROZ', 'SORRIA, VOCÊ ESTÁ SENDO PROCURADO'],
  mansao: ['LAGO SUL', 'FINANCIADO EM 360x', 'NÃO PERTURBE: SENADOR DESCANSANDO'],
  aeroporto: ['EMBARQUE: MIAMI', 'PORTÃO 22', 'ACHADOS E PERDIDOS: PASSAPORTES', 'PROIBIDO LEVAR TORNOZELEIRA'],
};

// O que aparece na tela da urna para cada número
G.URNA = {
  '13': { nome: 'LULA', partido: 'PT', quem: 'lula' },
  '22': { nome: 'FLÁVIO BOLSONARO', partido: 'PL', vice: 'QUEIROZ (brincadeira)', quem: 'flavio' },
};

G.CREDITOS = [
  'PESSOAL, URGENTE! A FUGA DO 01',
  'Uma paródia da eleição de 2026',
  '',
  'Ideia: Bernardo',
  'Elenco: Lula · Janones · Flávio · Queiroz',
  'Participação especial: o Japonês da Federal',
  'Assessores fantasmas: interpretados por ninguém',
  '',
  'Todas as falas são piadas. Os casos citados foram noticiados',
  'e investigados; o da rachadinha foi anulado pelo STJ em 2021.',
  'Nenhum chocolate foi lavado durante a produção deste jogo.',
];
