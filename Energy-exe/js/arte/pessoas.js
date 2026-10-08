// ============================================================
//  PESSOAS em pixel art (desenhadas com retângulos)
//  F.Arte.pessoa(ctx, x, y, look, dir, passo)
//    x, y  = os pés da pessoa (centro)
//    look  = { pele, cabelo, corCabelo, roupa, corRoupa, calca,
//              oculos, acessorio, cracha }
//    dir   = 'baixo' | 'cima' | 'esq' | 'dir'
//    passo = número que avança enquanto anda (animação)
// ============================================================
F.Arte = F.Arte || {};

F.PALETA = {
  peles: ['#f7d7bb', '#eabf98', '#cf9668', '#a96d47', '#7d4b2e', '#53301c'],
  cabelos: ['#1d1512', '#4a2e1a', '#8a5a2b', '#d6ae58', '#b4472b', '#9aa0a6', '#ece6dc', '#3d62b0', '#c24e8e', '#2f8a6a'],
  roupas: ['#2f5fa7', '#e9e5da', '#34343c', '#7c2f3c', '#2f7a4f', '#d68b28', '#6b4c9b', '#cf5170', '#5d7f99', '#c9b48a'],
  calcas: ['#2a2f3d', '#3b4a63', '#54473a', '#1f1f24', '#6b6458'],
  crachas: ['#2f6fd0', '#2f9a52', '#e2731c', '#c22f4a', '#7b4cc2'],
};
F.ESTILOS = {
  cabelo: [['curto', 'Curto'], ['longo', 'Longo'], ['cacheado', 'Cacheado'], ['crespo', 'Crespo'], ['coque', 'Coque'], ['rabo', 'Rabo de cavalo'], ['moicano', 'Moicano'], ['careca', 'Careca']],
  roupa: [['social', 'Camisa social'], ['polo', 'Polo'], ['blazer', 'Blazer'], ['moletom', 'Moletom'], ['camiseta', 'Camiseta da empresa'], ['macacao', 'Uniforme da fábrica']],
  oculos: [['nenhum', 'Sem óculos'], ['redondo', 'Redondo'], ['quadrado', 'Quadrado'], ['escuro', 'Escuro']],
  acessorio: [['nenhum', 'Nenhum'], ['fone', 'Fone'], ['caneca', 'Caneca'], ['bone', 'Boné'], ['cachecol', 'Cachecol'], ['capacete', 'Capacete']],
};

// cor um pouco mais clara/escura
F.Arte.tom = function (hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
};

F.Arte.pessoa = function (ctx, x, y, L, dir = 'baixo', passo = 0, op = {}) {
  x = Math.round(x); y = Math.round(y);
  const R = (cx, cy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + cx, y + cy, w, h); };
  const pele = L.pele || F.PALETA.peles[1];
  const peleE = F.Arte.tom(pele, -0.18);
  const cab = L.corCabelo || '#2b1d14';
  const roupa = L.corRoupa || '#2f5fa7';
  const roupaE = F.Arte.tom(roupa, -0.22), roupaC = F.Arte.tom(roupa, 0.25);
  const calca = L.calca || '#2a2f3d';
  const lado = dir === 'esq' || dir === 'dir';
  const fl = dir === 'esq' ? -1 : 1;
  const anda = Math.floor(passo) % 4;            // 0..3
  const perna = anda === 1 ? 1 : anda === 3 ? -1 : 0;
  const quica = op.parado ? 0 : (anda % 2 ? -1 : 0);

  // sombra
  if (!op.semSombra) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x - 8, y - 2, 16, 4); ctx.fillRect(x - 6, y - 3, 12, 6); }

  // pernas
  if (L.roupa === 'macacao') { R(-6, -10, 12, 9, roupa); }
  if (lado) {
    R(-3 + perna * 2, -10, 5, 9, L.roupa === 'macacao' ? roupaE : calca);
    R(-3 - perna * 2, -10, 5, 9, L.roupa === 'macacao' ? roupa : F.Arte.tom(calca, 0.1));
    R(-3 + perna * 2, -2, 6, 2, '#1a1a1e'); R(-3 - perna * 2, -2, 6, 2, '#26262c');
  } else {
    const c = L.roupa === 'macacao' ? roupaE : calca;
    R(-6, -10 + (perna > 0 ? -1 : 0), 5, 9, c);
    R(1, -10 + (perna < 0 ? -1 : 0), 5, 9, c);
    R(-6, -2 + (perna > 0 ? -1 : 0), 5, 2, '#1a1a1e');
    R(1, -2 + (perna < 0 ? -1 : 0), 5, 2, '#1a1a1e');
  }

  const by = quica; // corpo sobe e desce enquanto anda
  // tronco
  const tw = lado ? 12 : 16, tx = -tw / 2;
  R(tx, -23 + by, tw, 14, roupa);
  R(tx, -10 + by, tw, 1, roupaE);
  // detalhes da roupa
  if (!lado && dir !== 'cima') {
    if (L.roupa === 'social') { R(-1, -22 + by, 2, 9, F.Arte.tom(roupa, -0.45)); R(-3, -23 + by, 6, 1, roupaC); }
    if (L.roupa === 'polo') { R(-4, -23 + by, 8, 2, roupaC); R(0, -21 + by, 1, 4, roupaE); }
    if (L.roupa === 'blazer') { R(-2, -23 + by, 4, 13, '#efece4'); R(-1, -22 + by, 2, 7, '#8a2d34'); R(-8, -23 + by, 2, 13, roupaE); R(6, -23 + by, 2, 13, roupaE); }
    if (L.roupa === 'moletom') { R(-6, -23 + by, 12, 2, roupaE); R(-4, -15 + by, 8, 4, roupaE); R(-2, -21 + by, 1, 4, '#ddd'); R(1, -21 + by, 1, 4, '#ddd'); }
    if (L.roupa === 'camiseta') { R(-2, -19 + by, 3, 2, '#ffd23f'); R(0, -18 + by, 2, 3, '#ffd23f'); }
    if (L.roupa === 'macacao') { R(-6, -23 + by, 2, 14, roupaE); R(4, -23 + by, 2, 14, roupaE); R(-5, -14 + by, 10, 1, '#e8d03a'); }
  }
  if (lado && L.roupa === 'moletom') R(-fl * 6 - 1, -24 + by, 3, 4, roupaE);

  // braços (balançam ao andar)
  const ba = op.parado ? 0 : perna;
  if (lado) {
    R(-2 - ba * 2, -22 + by, 4, 10, roupaE);
    R(-2 - ba * 2, -12 + by, 4, 3, pele);
  } else {
    R(-10, -22 + by + (ba > 0 ? 1 : 0), 3, 10, roupaE);
    R(7, -22 + by + (ba < 0 ? 1 : 0), 3, 10, roupaE);
    R(-10, -12 + by + (ba > 0 ? 1 : 0), 3, 3, pele);
    R(7, -12 + by + (ba < 0 ? 1 : 0), 3, 3, pele);
  }

  // crachá (todo mundo tem)
  const cr = L.cracha || '#2f6fd0';
  if (!lado && dir !== 'cima') {
    R(-4, -23 + by, 1, 6, cr); R(3, -23 + by, 1, 6, cr);
    R(-3, -17 + by, 6, 6, '#ffffff'); R(-3, -17 + by, 6, 2, cr); R(-2, -14 + by, 4, 1, '#999');
  } else if (lado) {
    R(fl * 3 - 1, -22 + by, 1, 5, cr); R(fl * 3 - 1, -17 + by, 3 * fl, 4, '#fff');
  } else {
    R(-4, -23 + by, 8, 1, cr);
  }

  // cabeça
  const hy = -36 + by;
  R(-7, hy + 1, 14, 12, pele);
  R(-6, hy, 12, 1, pele);
  R(-6, hy + 13, 12, 1, peleE);
  R(-2, hy + 13, 4, 2, peleE); // pescoço
  // rosto
  if (dir === 'baixo') {
    R(-4, hy + 6, 2, 2, '#1d1512'); R(2, hy + 6, 2, 2, '#1d1512');
    R(-1, hy + 10, 3, 1, F.Arte.tom(pele, -0.35));
    if (op.feliz) { R(-2, hy + 10, 5, 1, '#7a2a2a'); R(-2, hy + 9, 1, 1, '#7a2a2a'); R(2, hy + 9, 1, 1, '#7a2a2a'); }
    R(-6, hy + 8, 2, 1, F.Arte.tom(pele, -0.08)); R(4, hy + 8, 2, 1, F.Arte.tom(pele, -0.08));
  } else if (lado) {
    R(fl > 0 ? 2 : -4, hy + 6, 2, 2, '#1d1512');
    R(fl > 0 ? 6 : -7, hy + 7, 1, 2, peleE);
    R(fl > 0 ? 2 : -4, hy + 10, 2, 1, F.Arte.tom(pele, -0.35));
  }
  if (L.acessorio === 'bigode' && dir !== 'cima') R(lado ? (fl > 0 ? 1 : -5) : -3, hy + 9, lado ? 4 : 7, 1, cab);
  if (L.acessorio === 'barba' && dir !== 'cima') { R(-7, hy + 8, 2, 5, cab); R(5, hy + 8, 2, 5, cab); R(-5, hy + 11, 10, 3, cab); }

  F.Arte.cabelo(ctx, x, y + hy, L.cabelo || 'curto', cab, dir);

  // óculos
  if (L.oculos && L.oculos !== 'nenhum' && dir !== 'cima') {
    const oc = L.oculos === 'escuro' ? '#111' : '#2a2a2a';
    if (lado) {
      R(fl > 0 ? 1 : -5, hy + 5, 4, 4, L.oculos === 'escuro' ? '#111' : 'rgba(200,230,255,.5)');
      ctx.strokeStyle = oc; ctx.lineWidth = 1; ctx.strokeRect(x + (fl > 0 ? 1 : -5) + 0.5, y + hy + 5.5, 3, 3);
      R(fl > 0 ? -5 : 1, hy + 6, 6, 1, oc);
    } else {
      if (L.oculos === 'escuro') { R(-6, hy + 5, 5, 3, '#111'); R(1, hy + 5, 5, 3, '#111'); R(-1, hy + 6, 2, 1, '#111'); }
      else {
        ctx.strokeStyle = oc; ctx.lineWidth = 1;
        if (L.oculos === 'redondo') { ctx.beginPath(); ctx.arc(x - 3, y + hy + 7, 2.6, 0, 7); ctx.moveTo(x + 5.6, y + hy + 7); ctx.arc(x + 3, y + hy + 7, 2.6, 0, 7); ctx.stroke(); }
        else { ctx.strokeRect(x - 6.5, y + hy + 4.5, 5, 4); ctx.strokeRect(x + 1.5, y + hy + 4.5, 5, 4); }
        R(-1, hy + 6, 2, 1, oc);
      }
    }
  }

  // acessórios
  const ac = L.acessorio;
  if (ac === 'fone') {
    R(-8, hy - 2, 16, 2, '#222'); R(-9, hy, 2, 4, '#222');
    R(7, hy, 2, 4, '#222');
    if (!lado || fl < 0) R(-10, hy + 4, 3, 5, '#333');
    if (!lado || fl > 0) R(7, hy + 4, 3, 5, '#333');
  }
  if (ac === 'bone') {
    const bc = L.corBone || '#c22f3a';
    R(-8, hy - 3, 16, 5, bc); R(-7, hy - 4, 14, 1, bc);
    if (dir === 'baixo') R(-8, hy + 2, 16, 2, F.Arte.tom(bc, -0.25));
    else if (lado) R(fl > 0 ? 4 : -12, hy + 2, 8, 2, F.Arte.tom(bc, -0.25));
  }
  if (ac === 'capacete') {
    R(-8, hy - 4, 16, 6, '#f2c230'); R(-7, hy - 5, 14, 1, '#f2c230'); R(-9, hy + 1, 18, 2, '#d9a91d'); R(-1, hy - 5, 2, 6, '#ffe27a');
  }
  if (ac === 'cachecol') { R(-7, -24 + by, 14, 3, '#c94f4f'); if (!lado) R(2, -22 + by, 3, 7, '#b04040'); }
  if (ac === 'caneca') {
    const mx = lado ? -2 - ba * 2 : 7;
    R(mx, -14 + by, 5, 5, '#f4f1ea'); R(mx + 5, -13 + by, 1, 3, '#f4f1ea'); R(mx + 1, -14 + by, 3, 1, '#6b3d1e');
  }
};

F.Arte.cabelo = function (ctx, x, y, estilo, c, dir) {
  const R = (cx, cy, w, h, cor = c) => { ctx.fillStyle = cor; ctx.fillRect(x + cx, y + cy, w, h); };
  const lado = dir === 'esq' || dir === 'dir', fl = dir === 'esq' ? -1 : 1;
  const cima = dir === 'cima';
  const brilho = F.Arte.tom(c, 0.25);
  if (estilo === 'careca') { R(-3, 1, 4, 1, 'rgba(255,255,255,0.35)'); return; }
  if (estilo === 'moicano') {
    R(-2, -4, 4, 6); R(-1, -5, 2, 1);
    if (cima) R(-2, 2, 4, 8);
    return;
  }
  if (estilo === 'crespo') {
    R(-10, -6, 20, 10); R(-9, -8, 18, 2); R(-11, -3, 22, 8); R(-7, -9, 14, 1);
    if (cima) R(-10, 4, 20, 8);
    else if (lado) R(-fl * 10 - (fl > 0 ? 0 : 0), 2, 6 * 1, 7);
    R(-5, -7, 4, 1, brilho);
    return;
  }
  if (estilo === 'cacheado') {
    [[-9, -3], [-6, -5], [-2, -6], [2, -6], [5, -5], [8, -3], [-9, 1], [8, 1]].forEach(([a, b]) => R(a, b, 5, 5));
    R(-8, -2, 16, 5);
    if (cima) { R(-9, 2, 18, 9); }
    else if (lado) R(fl > 0 ? -9 : 4, 2, 5, 8);
    else { R(-9, 4, 3, 5); R(6, 4, 3, 5); }
    R(-3, -5, 3, 1, brilho);
    return;
  }
  // base comum (curto/longo/coque/rabo)
  R(-7, -2, 14, 4); R(-6, -3, 12, 1);
  if (cima) R(-7, 1, 14, estilo === 'longo' ? 14 : 9);
  else if (lado) { R(fl > 0 ? -7 : 2, 1, 5, estilo === 'longo' ? 12 : 5); R(fl > 0 ? -7 : 3, 1, 4, 3); }
  else { R(-7, 1, 2, 4); R(5, 1, 2, 4); R(-5, 2, 4, 1); }
  if (estilo === 'longo') {
    if (!cima && !lado) { R(-8, 1, 3, 13); R(5, 1, 3, 13); }
    if (lado) R(fl > 0 ? -8 : 4, 1, 4, 14);
  }
  if (estilo === 'coque') { R(-3, -7, 6, 5); R(-2, -8, 4, 1); }
  if (estilo === 'rabo') {
    if (lado) { R(fl > 0 ? -10 : 7, 2, 3, 9); }
    else if (cima) R(-2, 9, 4, 8);
  }
  R(-4, -2, 4, 1, brilho);
};

// Um retrato (para as conversas): desenha a pessoa grande num canvas pequeno
F.Arte.retrato = function (cv, L, op = {}) {
  const tam = op.tam || 40;
  cv.width = tam; cv.height = tam;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const g = ctx.createLinearGradient(0, 0, 0, tam);
  g.addColorStop(0, op.fundo1 || '#9fc3e8'); g.addColorStop(1, op.fundo2 || '#d9e6f2');
  ctx.fillStyle = g; ctx.fillRect(0, 0, tam, tam);
  ctx.save();
  const k = tam / 40;
  ctx.scale(k, k);
  F.Arte.pessoa(ctx, 20, op.y || 52, L, op.dir || 'baixo', 0, { parado: true, semSombra: true, feliz: op.feliz });
  ctx.restore();
  return cv;
};

// Aparência aleatória (para figurantes)
F.Arte.lookAleatorio = function (rnd = Math.random) {
  const p = (a) => a[Math.floor(rnd() * a.length)];
  return {
    pele: p(F.PALETA.peles),
    cabelo: p(['curto', 'curto', 'longo', 'cacheado', 'crespo', 'coque', 'rabo', 'careca']),
    corCabelo: p(F.PALETA.cabelos.slice(0, 7)),
    roupa: p(['social', 'polo', 'blazer', 'moletom', 'camiseta']),
    corRoupa: p(F.PALETA.roupas),
    calca: p(F.PALETA.calcas),
    oculos: rnd() < 0.3 ? p(['redondo', 'quadrado']) : 'nenhum',
    acessorio: rnd() < 0.15 ? p(['fone', 'caneca']) : 'nenhum',
    cracha: p(F.PALETA.crachas),
  };
};
