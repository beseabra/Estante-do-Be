// ============================================================
//  O PRÉDIO DA VOLTAGEM S.A.
//  4 andares de 48 x 28 quadradinhos, ligados pelo elevador.
//    terreo  Fábrica: Montagem, Testes, Expedição, Recepção
//    n1      Negócios: Logística, Compras, Comercial, Copa, RH
//    n2      Escritórios: Qualidade, Engenharia, Projetos (PM),
//            Operações Integradas (a sua mesa), Sala de reuniões
//    n3      Diretoria (bloqueada no começo)
//
//  Coordenadas sempre em quadradinhos: (x, y, largura, altura).
//  Móveis com "acao" podem ser usados (ver dados/eventos.js).
// ============================================================
F.Mapa = class {
  constructor(id, nome, curto, w = 48, h = 28) {
    Object.assign(this, { id, nome, curto, w, h });
    this.g = new Array(w * h).fill('#');     // '#' parede, 'v' vidro, '.' chão
    this.p = new Array(w * h).fill(null);    // tipo de piso
    this.zonas = [];
    this.moveis = [];
    this.rotulos = [];
  }
  i(x, y) { return y * this.w + x; }
  area(x, y, w, h, fn) { for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) if (k >= 0 && j >= 0 && k < this.w && j < this.h) fn(this.i(k, j)); }
  piso(x, y, w, h, tipo) { this.area(x, y, w, h, (i) => { this.g[i] = '.'; this.p[i] = tipo; }); return this; }
  parede(x, y, w, h) { this.area(x, y, w, h, (i) => { this.g[i] = '#'; }); return this; }
  vidro(x, y, w, h) { this.area(x, y, w, h, (i) => { this.g[i] = 'v'; }); return this; }
  porta(x, y, w, h, tipo) { this.area(x, y, w, h, (i) => { this.g[i] = '.'; this.p[i] = tipo || this.p[i] || 'claro'; }); return this; }
  zona(id, nome, x, y, w, h, dep) { this.zonas.push({ id, nome, x, y, w, h, dep }); return this; }
  m(tipo, x, y, w = 1, h = 1, extra = {}) { this.moveis.push({ tipo, x, y, w, h, solido: true, ...extra }); return this; }
  rotulo(texto, x, y, cor = 'rgba(255,255,255,0.18)', tam = 22) { this.rotulos.push({ texto, x, y, cor, tam }); return this; }
};

F.MAPAS = {};

// ---------------------------------------------------------------- TÉRREO
(function () {
  const A = new F.Mapa('terreo', 'Térreo · Fábrica', 'Térreo');
  A.piso(1, 1, 46, 26, 'concreto');
  A.piso(19, 20, 10, 7, 'granito');
  A.piso(19, 1, 10, 19, 'claro');
  // divisória entre Testes e Expedição, com porta
  A.parede(29, 13, 18, 1).porta(34, 13, 3, 1, 'concreto');
  // meias-paredes da Montagem (com passagem no meio)
  A.parede(18, 1, 1, 8).parede(18, 12, 1, 15);
  // parede entre o corredor e Testes/Expedição
  A.parede(29, 1, 1, 8).parede(29, 12, 1, 4).parede(29, 20, 1, 7);
  // porta da rua e doca do caminhão
  A.porta(23, 27, 2, 1, 'granito');
  A.porta(47, 17, 1, 5, 'concreto');

  A.zona('montagem', 'Montagem', 1, 1, 17, 26, 'fabrica');
  A.zona('testes', 'Testes / Produção', 30, 1, 17, 12, 'fabrica');
  A.zona('expedicao', 'Expedição', 30, 14, 17, 13, 'fabrica');
  A.zona('corredor0', 'Corredor da fábrica', 19, 1, 10, 19, 'fabrica');
  A.zona('recepcao', 'Recepção', 19, 20, 10, 7, 'fabrica');

  A.rotulo('MONTAGEM', 9, 10, 'rgba(242,194,48,0.35)', 26);
  A.rotulo('TESTES', 38, 11, 'rgba(242,194,48,0.35)', 22);
  A.rotulo('EXPEDIÇÃO', 38, 25, 'rgba(242,194,48,0.35)', 22);

  A.m('elevador', 23, 0, 2, 1, { acao: 'elevador', solido: true });
  // Montagem
  A.m('esteira', 2, 5, 14, 2, { acao: 'esteira', id: 'linha1' });
  A.m('esteira', 2, 13, 14, 2, { id: 'linha2' });
  A.m('bancada', 2, 18, 4, 2);
  A.m('bancada', 8, 18, 4, 2);
  A.m('painel', 13, 21, 4, 2);
  A.m('palete', 2, 23, 3, 2);
  A.m('palete', 6, 23, 2, 2);
  A.m('avisos', 8, 1, 3, 1, { acao: 'avisos' });
  A.m('arquivo', 14, 1, 2, 1);
  // corredor
  A.m('cafe', 19, 2, 1, 1, { acao: 'cafe', id: 'cafe-fabrica' });
  A.m('bebedouro', 20, 2, 1, 1, { acao: 'bebedouro' });
  A.m('sofa', 25, 9, 3, 1, { cor: '#5d6b7a' });
  A.m('planta', 28, 2);
  A.m('planta', 19, 18);
  A.m('planta', 28, 18);
  // Testes
  A.m('bancada', 31, 2, 4, 2);
  A.m('bancada', 31, 7, 4, 2);
  A.m('painel', 38, 2, 2, 2);
  A.m('painel', 41, 2, 2, 2, { acao: 'painel472', id: 'painel-472', numero: '#472' });
  A.m('rack', 45, 2, 2, 2);
  A.m('arquivo', 38, 9, 3, 1);
  A.m('maquete', 43, 8, 3, 2);
  // Expedição
  A.m('prateleira', 31, 15, 6, 1, { acao: 'estoque', rotulo: true });
  A.m('prateleira', 31, 18, 6, 1, { acao: 'estoque' });
  A.m('prateleira', 31, 21, 6, 1, { acao: 'estoque' });
  A.m('palete', 38, 15, 2, 2);
  A.m('palete', 38, 22, 2, 2);
  A.m('empilhadeira', 38, 19, 2, 1);
  A.m('caminhao', 42, 17, 6, 5, { acao: 'caminhao' });
  A.m('etiquetadora', 44, 24, 2, 1, { acao: 'etiquetadora' });
  // Recepção
  A.m('balcao', 20, 21, 4, 1);
  A.m('catraca', 21, 24, 2, 1);
  A.m('catraca', 25, 24, 2, 1);
  A.m('tapete', 23, 26, 2, 1, { acao: 'saida', solido: false, texto: 'SAÍDA', cor: '#2f3c5c' });
  A.m('planta', 19, 26);
  A.m('planta', 28, 26);
  A.m('sofa', 26, 21, 3, 1, { cor: '#7c2f3c' });

  A.chegada = { x: 24, y: 1.9 };          // na frente do elevador
  A.entrada = { x: 24, y: 23.2 };         // logo depois da catraca
  F.MAPAS.terreo = A;
})();

// ---------------------------------------------------------------- 1º ANDAR
(function () {
  const A = new F.Mapa('n1', '1º andar · Negócios', '1º andar');
  A.piso(1, 1, 46, 26, 'claro');
  A.piso(1, 1, 19, 9, 'carpeteLaranja');      // Logística
  A.piso(28, 1, 19, 9, 'carpeteBege');        // Compras
  A.piso(1, 16, 9, 11, 'carpeteVinho');       // RH
  A.piso(11, 16, 9, 11, 'ceramica');          // Copa
  A.piso(28, 16, 19, 11, 'carpeteAzul');      // Comercial
  // paredes das salas
  A.parede(1, 10, 20, 1).parede(20, 1, 1, 10).porta(8, 10, 3, 1);
  A.parede(27, 10, 20, 1).parede(27, 1, 1, 10).porta(36, 10, 3, 1);
  A.parede(1, 15, 10, 1).parede(10, 15, 1, 12);
  A.parede(10, 15, 11, 1).parede(20, 15, 1, 12).porta(14, 15, 3, 1);
  A.parede(27, 15, 20, 1).parede(27, 15, 1, 12).porta(31, 15, 3, 1);
  A.porta(4, 15, 2, 1, 'carpeteVinho');     // porta do RH (fechada por um móvel)

  A.zona('logistica', 'Logística', 1, 1, 19, 9, 'logistica');
  A.zona('compras', 'Compras', 28, 1, 19, 9, 'compras');
  A.zona('rh', 'RH', 1, 16, 9, 11, 'rh');
  A.zona('copa', 'Copa', 11, 16, 9, 11, 'copa');
  A.zona('comercial', 'Vendas / Comercial', 28, 16, 19, 11, 'comercial');
  A.zona('corredor1', 'Corredor', 1, 11, 46, 4, null);
  A.zona('hall1', 'Hall do 1º andar', 21, 1, 6, 26, null);

  A.m('elevador', 23, 0, 2, 1, { acao: 'elevador' });
  // Logística
  A.m('mesa', 2, 3, 4, 1); A.m('mesa', 2, 6, 4, 1);
  A.m('mesa', 9, 3, 4, 1); A.m('mesa', 9, 6, 4, 1);
  A.m('quadro', 14, 1, 5, 1, { acao: 'quadroLogistica', notas: ['#ff8a8a', '#ff8a8a', '#fff38a', '#ff8a8a'] });
  A.m('pastas', 15, 6, 3, 1);
  A.m('planta', 1, 9);
  // Compras
  A.m('mesa', 29, 3, 4, 1); A.m('mesa', 29, 6, 4, 1);
  A.m('mesa', 36, 3, 4, 1); A.m('mesa', 36, 6, 4, 1);
  A.m('mesa', 43, 3, 3, 1, { acao: 'mesaCarlos', id: 'mesa-carlos', placa: true, tela: '#1b2030' });
  A.m('arquivo', 43, 7, 2, 1);
  A.m('planta', 46, 9);
  // RH
  A.m('portaRH', 4, 15, 2, 1, { acao: 'portaRH', id: 'porta-rh' });
  A.m('mesa', 2, 18, 3, 1, { cor: '#d6c3a5' });
  A.m('sofa', 2, 24, 3, 1, { cor: '#c9a0a8' });
  A.m('planta', 8, 16); A.m('planta', 8, 25);
  A.m('quadro', 6, 21, 3, 1, { notas: ['#ffb3c7', '#fff'] });
  // Copa
  A.m('balcaoCopa', 11, 16, 3, 1, { acao: 'microondas' });
  A.m('cafe', 17, 16, 1, 1, { acao: 'cafe', id: 'cafe-copa' });
  A.m('geladeira', 19, 16, 1, 1, { acao: 'geladeira' });
  A.m('bandeja', 11, 19, 2, 1, { acao: 'pao', id: 'pao' });
  A.m('mesaCopa', 14, 20, 3, 2, { acao: 'mesaCopa' });
  A.m('lixeira', 19, 25);
  A.m('bebedouro', 11, 25, 1, 1, { acao: 'bebedouro' });
  // Hall
  A.m('impressora', 21, 17, 2, 1, { acao: 'impressora' });
  A.m('avisos', 24, 17, 3, 1, { acao: 'avisos' });
  A.m('planta', 21, 26); A.m('planta', 26, 26);
  A.m('sofa', 22, 22, 3, 1, { cor: '#4b6b5a' });
  // Comercial
  A.m('mesa', 29, 18, 4, 1); A.m('mesa', 29, 21, 4, 1);
  A.m('mesa', 36, 18, 4, 1); A.m('mesa', 36, 21, 4, 1);
  A.m('trofeus', 42, 16, 4, 1, { acao: 'trofeusComercial' });
  A.m('tela', 29, 16, 3, 1, { fundo: '#7a1f2a' });
  A.m('sofa', 42, 24, 4, 1, { cor: '#2a2f3d' });
  A.m('planta', 46, 20);

  A.chegada = { x: 24, y: 1.9 };
  F.MAPAS.n1 = A;
})();

// ---------------------------------------------------------------- 2º ANDAR
(function () {
  const A = new F.Mapa('n2', '2º andar · Escritórios', '2º andar');
  A.piso(1, 1, 46, 26, 'carpeteCinza');
  A.piso(1, 1, 14, 15, 'carpeteVerde');        // Qualidade
  A.piso(16, 4, 16, 12, 'carpeteRoxo');        // PM
  A.piso(33, 1, 14, 15, 'carpeteAzul');        // Engenharia
  A.piso(16, 1, 16, 3, 'claro');               // hall do elevador
  A.piso(1, 16, 46, 2, 'claro');               // corredor
  A.piso(1, 18, 17, 9, 'carpeteCinza2');       // Operações Integradas
  // Sala de reuniões (paredes de verdade)
  A.parede(19, 18, 10, 1).parede(19, 18, 1, 9).parede(28, 18, 1, 9).porta(23, 18, 2, 1, 'madeiraClara');
  A.piso(20, 19, 8, 8, 'madeiraClara');
  // Sala do chefe (vidro)
  A.vidro(30, 18, 17, 1).vidro(30, 18, 1, 9).porta(33, 18, 2, 1, 'carpeteCinza');
  A.piso(31, 19, 16, 8, 'carpeteCinza');

  A.zona('qualidade', 'Qualidade', 1, 1, 14, 15, 'qualidade');
  A.zona('pm', 'Projetos (PM)', 16, 4, 16, 12, 'pm');
  A.zona('engenharia', 'Engenharia', 33, 1, 14, 15, 'engenharia');
  A.zona('operacoes', 'Operações Integradas', 1, 18, 17, 9, 'operacoes');
  A.zona('reunioes', 'Sala de reuniões "Sinergia"', 20, 19, 8, 8, 'pm');
  A.zona('chefe', 'Sala do Marcos', 31, 19, 16, 8, 'operacoes');
  A.zona('corredor2', 'Corredor', 1, 16, 46, 2, null);
  A.zona('hall2', 'Hall do 2º andar', 16, 1, 16, 3, null);

  A.rotulo('QUALIDADE', 7, 14, 'rgba(255,255,255,0.14)', 20);
  A.rotulo('ENGENHARIA', 40, 14, 'rgba(255,255,255,0.14)', 20);
  A.rotulo('PROJETOS', 24, 14, 'rgba(255,255,255,0.14)', 20);

  A.m('elevador', 23, 0, 2, 1, { acao: 'elevador' });
  // Qualidade
  A.m('mesa', 2, 3, 4, 1); A.m('mesa', 2, 7, 4, 1); A.m('mesa', 8, 3, 4, 1);
  A.m('pastas', 1, 12, 6, 1, { acao: 'arquivosQualidade' });
  A.m('arquivo', 9, 7, 3, 1);
  A.m('quadro', 8, 10, 4, 1, { grafico: true, acao: 'indicadores' });
  A.m('planta', 14, 1);
  // PM
  A.m('quadro', 17, 4, 6, 1, { acao: 'kanban', notas: ['#fff38a', '#fff38a', '#ffb3c7', '#a7e3ff', '#ff8a8a'] });
  A.m('tela', 26, 4, 4, 1, { acao: 'telaStatus', status: true });
  A.m('mesa', 18, 8, 4, 1); A.m('mesa', 18, 11, 4, 1);
  A.m('mesa', 25, 8, 4, 1); A.m('mesa', 25, 11, 4, 1);
  // Engenharia
  A.m('mesa', 34, 3, 4, 1, { duplo: true }); A.m('mesa', 34, 7, 4, 1, { duplo: true });
  A.m('mesa', 40, 3, 4, 1, { duplo: true }); A.m('mesa', 40, 7, 4, 1, { duplo: true });
  A.m('rack', 45, 11, 2, 2, { acao: 'rack' });
  A.m('plotter', 34, 12, 3, 1);
  A.m('maquete', 40, 11, 3, 2, { acao: 'maquete' });
  // Operações Integradas (a sua mesa)
  A.m('mesa', 3, 20, 2, 1, { acao: 'mesa', id: 'mesa-jogador' });
  A.m('mesa', 5, 20, 2, 1);
  A.m('mesa', 10, 20, 4, 1);
  A.m('mesa', 3, 23, 4, 1);
  A.m('mesa', 10, 23, 4, 1, { tela: '#1b2030' });
  A.m('quadro', 7, 18, 3, 1, { acao: 'quadroOperacoes', notas: ['#fff'] });
  A.m('arquivo', 15, 25, 2, 1);
  A.m('planta', 16, 19);
  A.m('bebedouro', 1, 18, 1, 1, { acao: 'bebedouro' });
  // Sala de reuniões
  A.m('mesaReuniao', 21, 21, 6, 3, { acao: 'salaReuniao' });
  A.m('tela', 21, 26, 6, 1, { fundo: '#2a5a9a' });
  A.m('planta', 27, 19);
  // Sala do chefe
  A.m('mesaChefe', 40, 21, 3, 1);
  A.m('sofa', 32, 25, 3, 1, { cor: '#3a3f4a' });
  A.m('trofeus', 44, 19, 2, 1, { acao: 'trofeuChefe' });
  A.m('planta', 46, 26); A.m('planta', 31, 19);
  A.m('avisos', 26, 16, 3, 1, { acao: 'avisos' });

  A.chegada = { x: 24, y: 1.9 };
  F.MAPAS.n2 = A;
})();

// ---------------------------------------------------------------- 3º ANDAR
(function () {
  const A = new F.Mapa('n3', '3º andar · Diretoria', '3º andar');
  A.piso(1, 1, 46, 26, 'madeira');
  A.piso(18, 1, 12, 26, 'marmore');
  A.parede(17, 1, 1, 26).porta(17, 12, 1, 2, 'marmore');
  A.parede(30, 1, 1, 26).porta(30, 12, 1, 2, 'marmore');
  A.piso(1, 1, 16, 26, 'carpeteVinho');

  A.zona('conselho', 'Sala do Conselho', 1, 1, 16, 26, 'diretoria');
  A.zona('recepcao3', 'Recepção da Diretoria', 18, 1, 12, 26, 'diretoria');
  A.zona('diretor', 'Sala do Diretor', 31, 1, 16, 26, 'diretoria');

  A.m('elevador', 23, 0, 2, 1, { acao: 'elevador' });
  A.m('balcao', 21, 5, 6, 1);
  A.m('tapete', 21, 9, 6, 6, { solido: false, cor: '#7d2a32' });
  A.m('aquario', 26, 18, 3, 2, { acao: 'aquario' });
  A.m('planta', 18, 1); A.m('planta', 29, 1); A.m('planta', 18, 26); A.m('planta', 29, 26);
  A.m('sofa', 19, 20, 3, 1, { cor: '#2a2a33' });
  // Conselho
  A.m('mesaReuniao', 4, 6, 9, 14, { acao: 'salaConselho', cor: '#4a2a18' });
  A.m('tela', 5, 1, 7, 1, { fundo: '#1a2a4a' });
  A.m('planta', 1, 1); A.m('planta', 15, 1); A.m('planta', 1, 25); A.m('planta', 15, 25);
  // Diretor
  A.m('mesaChefe', 37, 6, 5, 1);
  A.m('trofeus', 36, 1, 6, 1, { acao: 'trofeusDiretoria' });
  A.m('sofa', 33, 20, 4, 1, { cor: '#4a2a18' });
  A.m('aquario', 43, 19, 3, 2, { acao: 'aquario' });
  A.m('planta', 46, 1); A.m('planta', 31, 26);

  A.chegada = { x: 24, y: 1.9 };
  F.MAPAS.n3 = A;
})();

F.ANDARES = ['terreo', 'n1', 'n2', 'n3'];
