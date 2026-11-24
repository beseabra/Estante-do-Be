// ============================================================
//  ARTE: personagens, itens e obstáculos, tudo desenhado por código
//  (caricaturas cabeçudas; nenhuma imagem de fora)
//
//  G.Arte.boneco(ctx, quem, x, y, o)
//    quem: lula | janones | flavio | queiroz | japones | jair | soldado
//    x, y: posição dos PÉS
//    o: { t, pose, dir, esc, cor }
//       pose: corre | pula | abaixa | parado | dano | danca | comemora | algemado | fala
// ============================================================
G.Arte = {};

// Roupa e pele de cada um
G.Arte.TIPOS = {
  lula:    { pele: '#e3a676', terno: '#1f2c52', calca: '#1a2444', gravata: '#d11f2b', camisa: '#fff', sapato: '#2a1a12' },
  janones: { pele: '#d89e78', terno: '#f4f4f4', calca: '#2a2f3a', gravata: null, camisa: '#fff', sapato: '#111', semPaleto: true },
  flavio:  { pele: '#f1c4a2', terno: '#1d4fa8', calca: '#173f88', gravata: '#0b9b3c', camisa: '#fff', sapato: '#111' },
  queiroz: { pele: '#c98a60', terno: '#ff7a3d', calca: '#e8d6a8', gravata: null, camisa: '#ff7a3d', sapato: '#6b3b1f', havaiana: true },
  japones: { pele: '#eabf95', terno: '#16181d', calca: '#16181d', gravata: null, camisa: '#16181d', sapato: '#000', colete: true },
  jair:    { pele: '#eab894', terno: '#2b3a2b', calca: '#2b3a2b', gravata: '#1d1d1d', camisa: '#fff', sapato: '#111', faixa: true },
  soldado: { pele: '#c68b62', terno: '#d11f2b', calca: '#30343f', gravata: null, camisa: '#d11f2b', sapato: '#111', semPaleto: true },
};

G.Arte.boneco = function (ctx, quem, x, y, o = {}) {
  const tipo = { ...G.Arte.TIPOS[quem], ...(o.cor || {}) };
  const t = o.t || 0;
  const pose = o.pose || 'parado';
  const esc = o.esc || 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(esc * (o.dir || 1), esc);

  // sombra no chão
  if (!o.semSombra) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 2, pose === 'abaixa' ? 34 : 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ângulos de pernas e braços conforme a pose
  let pernaA = 0, pernaB = 0, bracoA = 0.3, bracoB = -0.3, sobe = 0, gira = 0, cabeca = 0;
  if (pose === 'corre') {
    const f = t * 15;
    pernaA = Math.sin(f) * 0.8; pernaB = -pernaA;
    bracoA = -Math.sin(f) * 0.9; bracoB = -bracoA;
    sobe = Math.abs(Math.cos(f)) * 3;
    gira = 0.12;
  } else if (pose === 'pula') {
    pernaA = -0.9; pernaB = 0.6; bracoA = -2.4; bracoB = -2.0; gira = 0.05;
  } else if (pose === 'abaixa') {
    gira = -1.25; pernaA = 0.2; pernaB = 0.4; bracoA = -2.6; bracoB = -2.9;
  } else if (pose === 'dano') {
    gira = -0.35; pernaA = 0.5; pernaB = -0.3; bracoA = -2.2; bracoB = 2.2;
  } else if (pose === 'danca') {
    const f = t * 8;
    gira = Math.sin(f) * 0.18;
    pernaA = Math.sin(f) * 0.4; pernaB = -Math.sin(f) * 0.4;
    bracoA = -2.6 + Math.sin(f * 2) * 0.5; bracoB = -2.6 - Math.sin(f * 2) * 0.5;
    sobe = Math.abs(Math.sin(f)) * 5;
  } else if (pose === 'comemora') {
    const f = t * 10;
    bracoA = -2.7 + Math.sin(f) * 0.25; bracoB = -2.7 - Math.sin(f) * 0.25;
    sobe = Math.abs(Math.sin(f * 0.5)) * 10;
    pernaA = 0.2; pernaB = -0.2;
  } else if (pose === 'algemado') {
    bracoA = 0.9; bracoB = 0.7; gira = -0.08;
  } else if (pose === 'fala') {
    bracoA = 0.25; bracoB = -1.2 + Math.sin(t * 6) * 0.4; cabeca = Math.sin(t * 7) * 0.06;
  } else {
    sobe = Math.sin(t * 3) * 1.2;
  }
  if (o.celular && pose !== 'abaixa' && pose !== 'pula') bracoB = -2.3; // segurando o celular na boca (gravando áudio)

  ctx.translate(0, -sobe);
  if (pose === 'abaixa') ctx.translate(-6, -4);
  ctx.rotate(gira);

  const perna = (ang, cor) => {
    ctx.save();
    ctx.translate(0, -28);
    ctx.rotate(ang);
    ctx.strokeStyle = cor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 24); ctx.stroke();
    ctx.fillStyle = tipo.sapato;
    ctx.beginPath(); ctx.ellipse(4, 27, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  const braco = (ang, cor, frente) => {
    ctx.save();
    ctx.translate(frente ? 4 : -4, -54);
    ctx.rotate(ang);
    ctx.strokeStyle = cor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.stroke();
    ctx.fillStyle = tipo.pele;
    ctx.beginPath(); ctx.arc(0, 23, 4.5, 0, Math.PI * 2); ctx.fill();
    if (frente && o.celular) { // o celular na mão
      ctx.fillStyle = '#111';
      G.retRedondo(ctx, -4, 18, 8, 13, 2); ctx.fill();
      ctx.fillStyle = '#4fd1ff'; ctx.fillRect(-2.5, 20, 5, 8);
    }
    if (frente && o.segura) G.Arte.item(ctx, o.segura, 0, 30, t, 0.7);
    ctx.restore();
  };

  // braço e perna de trás (mais escuros)
  perna(pernaB, G.Arte.escurece(tipo.calca));
  braco(bracoB, G.Arte.escurece(tipo.semPaleto ? tipo.camisa : tipo.terno), false);
  perna(pernaA, tipo.calca);

  // tronco
  ctx.fillStyle = tipo.terno;
  G.retRedondo(ctx, -15, -60, 30, 36, 9); ctx.fill();
  if (!tipo.semPaleto && !tipo.havaiana && !tipo.colete) {
    ctx.fillStyle = tipo.camisa;
    ctx.beginPath(); ctx.moveTo(-6, -60); ctx.lineTo(6, -60); ctx.lineTo(0, -44); ctx.closePath(); ctx.fill();
  }
  if (tipo.gravata) {
    ctx.fillStyle = tipo.gravata;
    ctx.beginPath(); ctx.moveTo(-2.5, -58); ctx.lineTo(2.5, -58); ctx.lineTo(4, -38); ctx.lineTo(0, -34); ctx.lineTo(-4, -38); ctx.closePath(); ctx.fill();
    if (quem === 'flavio') { ctx.fillStyle = '#ffd400'; ctx.fillRect(-2.5, -50, 5, 2.5); ctx.fillRect(-3, -43, 6, 2.5); }
  }
  if (quem === 'lula') { // estrelinha vermelha na lapela
    G.Arte.estrela(ctx, -8, -50, 4, '#ff2a2a');
  }
  if (quem === 'flavio') { // broche da bandeira
    ctx.fillStyle = '#0b9b3c'; ctx.fillRect(-11, -53, 7, 5);
    ctx.fillStyle = '#ffd400'; ctx.beginPath(); ctx.moveTo(-7.5, -52.5); ctx.lineTo(-4.5, -50.5); ctx.lineTo(-7.5, -48.5); ctx.lineTo(-10.5, -50.5); ctx.fill();
  }
  if (tipo.havaiana) { // camisa florida do Queiroz "de férias"
    ctx.fillStyle = '#ffe14d';
    for (const [fx, fy] of [[-8, -52], [6, -46], [-4, -34], [8, -56], [-10, -40]]) { ctx.beginPath(); ctx.arc(fx, fy, 2.6, 0, Math.PI * 2); ctx.fill(); }
  }
  if (tipo.colete) { // colete da PF
    ctx.fillStyle = '#23262e';
    G.retRedondo(ctx, -14, -58, 28, 30, 6); ctx.fill();
    G.texto(ctx, 'PF', 0, -38, { size: 12, align: 'center', color: '#ffd400', weight: 900 });
  }
  if (tipo.semPaleto && quem === 'janones') { // camisa social com a manga dobrada
    ctx.strokeStyle = '#d6d6d6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(0, -26); ctx.stroke();
  }
  if (quem === 'soldado') {
    G.texto(ctx, '13', 0, -36, { size: 13, align: 'center', color: '#fff', weight: 900 });
  }
  if (tipo.faixa) { // faixa verde e amarela
    ctx.strokeStyle = '#0b9b3c'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-12, -58); ctx.lineTo(13, -28); ctx.stroke();
    ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, -58); ctx.lineTo(13, -28); ctx.stroke();
  }

  braco(bracoA, tipo.semPaleto ? tipo.camisa : tipo.terno, true);

  // cabeça
  ctx.save();
  ctx.translate(2, -80);
  ctx.rotate(cabeca);
  G.Arte.cabeca(ctx, quem, tipo, pose, t, o);
  ctx.restore();

  ctx.restore();
};

G.Arte.escurece = function (hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 255) * 0.72), g = Math.floor(((n >> 8) & 255) * 0.72), b = Math.floor((n & 255) * 0.72);
  return `rgb(${r},${g},${b})`;
};

// ---------- as caras ----------
G.Arte.cabeca = function (ctx, quem, tipo, pose, t, o) {
  const R = 20;
  const assustado = pose === 'dano';
  const arregalado = o.medo && !assustado;
  // orelha
  ctx.fillStyle = G.Arte.escurece(tipo.pele);
  ctx.beginPath(); ctx.ellipse(-R + 2, 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  // rosto
  ctx.fillStyle = tipo.pele;
  ctx.beginPath(); ctx.ellipse(0, 0, R, R * 1.05, 0, 0, Math.PI * 2); ctx.fill();

  const olhos = (cor = '#1a1a1a', y = -3) => {
    if (assustado) {
      ctx.strokeStyle = cor; ctx.lineWidth = 2;
      for (const ex of [4, 13]) { ctx.beginPath(); ctx.moveTo(ex - 3, y - 3); ctx.lineTo(ex + 3, y + 3); ctx.moveTo(ex + 3, y - 3); ctx.lineTo(ex - 3, y + 3); ctx.stroke(); }
      return;
    }
    const g = arregalado ? 1.35 : 1; // olhão de quem está sendo procurado
    ctx.fillStyle = '#fff';
    for (const ex of [4, 13]) { ctx.beginPath(); ctx.ellipse(ex, y, 3.6 * g, 4.2 * g, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = cor;
    for (const ex of [5, 14]) { ctx.beginPath(); ctx.arc(ex + (arregalado ? 1 : 0), y + 0.5, arregalado ? 1.4 : 2, 0, Math.PI * 2); ctx.fill(); }
  };
  const nariz = (tam = 4) => {
    ctx.fillStyle = G.Arte.escurece(tipo.pele);
    ctx.beginPath(); ctx.ellipse(R - 1, 3, tam, tam * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  };
  const boca = (aberta) => {
    ctx.fillStyle = '#5a1a1a';
    if (aberta) { ctx.beginPath(); ctx.ellipse(9, 12, 4, 4 + Math.abs(Math.sin(t * 12)) * 2, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.strokeStyle = '#5a1a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(9, 8, 5, 0.3, Math.PI - 0.3); ctx.stroke(); }
  };

  if (quem === 'lula') {
    // cabelo grisalho dos lados e atrás
    ctx.fillStyle = '#d9d9d9';
    ctx.beginPath(); ctx.arc(-3, -6, R + 1, Math.PI * 0.95, Math.PI * 1.75); ctx.lineTo(-4, -10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, -14, 10, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    // barba branca cheia
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-16, 24, 4, 25);
    ctx.quadraticCurveTo(22, 24, 21, 4);
    ctx.quadraticCurveTo(14, 8, 9, 6);
    ctx.quadraticCurveTo(0, 10, -6, 2);
    ctx.closePath(); ctx.fill();
    // bigode
    ctx.beginPath(); ctx.ellipse(11, 7, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    olhos();
    // sobrancelhas grossas
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(0, -11, 8, 3); ctx.fillRect(10, -11, 7, 3);
    nariz(5);
    ctx.fillStyle = '#5a1a1a';
    ctx.beginPath(); ctx.ellipse(10, 12, 4, pose === 'fala' || pose === 'comemora' ? 3 + Math.abs(Math.sin(t * 10)) * 2 : 1.6, 0, 0, Math.PI * 2); ctx.fill();
  } else if (quem === 'janones') {
    // cabelo preto com topete
    ctx.fillStyle = '#1b1410';
    ctx.beginPath(); ctx.arc(0, -4, R + 1, Math.PI * 0.92, Math.PI * 2.02); ctx.quadraticCurveTo(10, -14, -2, -13); ctx.quadraticCurveTo(-12, -10, -18, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -20, 12, 6, -0.2, 0, Math.PI * 2); ctx.fill();
    // barba curta
    ctx.fillStyle = 'rgba(30,20,15,0.75)';
    ctx.beginPath(); ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-12, 22, 4, 22); ctx.quadraticCurveTo(20, 22, 20, 6); ctx.quadraticCurveTo(12, 12, 4, 9); ctx.quadraticCurveTo(-6, 9, -14, 2); ctx.fill();
    olhos();
    ctx.fillStyle = '#1b1410';
    ctx.fillRect(0, -11, 8, 2.5); ctx.fillRect(10, -12, 7, 2.5);
    nariz(4);
    boca(pose !== 'parado' || o.celular);
  } else if (quem === 'flavio') {
    // cabelo preto curtinho (testa grande)
    ctx.fillStyle = '#16110e';
    ctx.beginPath(); ctx.arc(-2, -3, R + 1, Math.PI * 0.95, Math.PI * 1.6); ctx.quadraticCurveTo(-4, -14, -10, -8); ctx.quadraticCurveTo(-16, -2, -18, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-6, -17, 10, 6, -0.3, 0, Math.PI * 2); ctx.fill();
    olhos('#1a1a1a', -2);
    // sobrancelhas de preocupado
    ctx.strokeStyle = '#16110e'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(7, -10); ctx.moveTo(11, -10); ctx.lineTo(17, -7); ctx.stroke();
    nariz(3.6);
    boca(pose === 'corre' || pose === 'dano' || pose === 'fala' || o.medo);
    // gotas de suor
    if (pose === 'corre' || o.medo || pose === 'algemado') {
      ctx.fillStyle = '#7fd4ff';
      const s = (t * 3) % 1;
      ctx.beginPath(); ctx.ellipse(-10, -6 + s * 10, 2.2, 3.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-16, 4 + ((s + 0.5) % 1) * 10, 1.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (quem === 'queiroz') {
    // careca com cabelo grisalho dos lados
    ctx.fillStyle = '#b8b8b8';
    ctx.beginPath(); ctx.ellipse(-14, -4, 7, 11, 0, 0, Math.PI * 2); ctx.fill();
    // óculos escuros de disfarce
    ctx.fillStyle = '#111';
    G.retRedondo(ctx, -1, -8, 10, 8, 3); ctx.fill();
    G.retRedondo(ctx, 11, -8, 9, 8, 3); ctx.fill();
    ctx.fillRect(8, -6, 4, 2);
    // bigodão
    ctx.fillStyle = '#7d7d7d';
    ctx.beginPath(); ctx.ellipse(11, 7, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    nariz(4.5);
    boca(pose === 'danca');
    // chapéu de praia
    ctx.fillStyle = '#e8d29a';
    ctx.beginPath(); ctx.ellipse(0, -16, 26, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -21, 15, 9, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#d11f2b'; ctx.fillRect(-15, -20, 30, 3);
  } else if (quem === 'japones') {
    olhos();
    // óculos escuros
    ctx.fillStyle = '#050505';
    G.retRedondo(ctx, -1, -8, 22, 8, 3); ctx.fill();
    nariz(3.5);
    // cavanhaque
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(10, 17, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(4, 9, 12, 2);
    ctx.strokeStyle = '#5a1a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(14, 12); ctx.stroke();
    // boné preto
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(0, -6, R + 1, Math.PI, 0); ctx.fill();
    ctx.fillRect(0, -9, 30, 5);
    G.texto(ctx, 'PF', -2, -13, { size: 11, align: 'center', color: '#ffd400', weight: 900 });
  } else if (quem === 'jair') {
    ctx.fillStyle = '#6d6d6d';
    ctx.beginPath(); ctx.arc(-2, -4, R + 1, Math.PI * 0.9, Math.PI * 1.95); ctx.quadraticCurveTo(4, -12, -14, 0); ctx.closePath(); ctx.fill();
    olhos();
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(0, -11, 8, 2.5); ctx.fillRect(10, -11, 7, 2.5);
    nariz(4);
    boca(pose === 'fala');
  } else { // soldado do Exército do Lula
    ctx.fillStyle = o.cabelo || '#2a1a10';
    ctx.beginPath(); ctx.arc(0, -4, R + 1, Math.PI * 0.95, Math.PI * 2.0); ctx.quadraticCurveTo(0, -12, -18, 2); ctx.closePath(); ctx.fill();
    olhos();
    nariz(3.5);
    if (quem === 'mordomo') { // bigodinho de mordomo, cara de quem não viu nada
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(4, 6, 12, 3);
    } else {
      boca(true);
      // bandana vermelha
      ctx.fillStyle = '#d11f2b'; ctx.fillRect(-20, -14, 40, 5);
    }
  }
};

// ---------- formas que se repetem ----------
G.Arte.estrela = function (ctx, x, y, r, cor, giro = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(giro);
  ctx.fillStyle = cor;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Balão de fala em cima de alguém
G.Arte.balao = function (ctx, txt, x, y, o = {}) {
  const size = o.size || 16;
  const linhas = G.quebra(ctx, txt, o.largura || 230, size);
  ctx.save();
  ctx.font = `800 ${size}px ${G.FONTE}`;
  const w = Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 22;
  const h = linhas.length * (size + 4) + 14;
  let bx = G.U.clamp(x - w / 2, 6, G.W - w - 6);
  const by = y - h - 14;
  ctx.globalAlpha = o.alfa ?? 1;
  ctx.fillStyle = o.fundo || '#fff';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  G.retRedondo(ctx, bx, by, w, h, 12);
  ctx.fill(); ctx.stroke();
  // biquinho
  const px = G.U.clamp(x, bx + 14, bx + w - 14);
  ctx.beginPath(); ctx.moveTo(px - 8, by + h - 1); ctx.lineTo(px, by + h + 12); ctx.lineTo(px + 8, by + h - 1); ctx.closePath();
  ctx.fill();
  ctx.beginPath(); ctx.moveTo(px - 8, by + h); ctx.lineTo(px, by + h + 12); ctx.lineTo(px + 8, by + h); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = o.alfa ?? 1;
  linhas.forEach((l, i) => G.texto(ctx, l, bx + w / 2, by + 10 + size + i * (size + 4) - 2, { size, align: 'center', color: o.cor || '#111' }));
  ctx.restore();
};

// ---------- itens (desenhados com o centro em x, y) ----------
G.Arte.item = function (ctx, tipo, x, y, t = 0, esc = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(esc, esc);
  switch (tipo) {
    case 'voto': {
      const s = Math.cos(t * 4); // gira como moeda
      ctx.scale(Math.max(0.25, Math.abs(s)), 1);
      G.Arte.estrela(ctx, 0, 0, 16, '#8a0f16');
      G.Arte.estrela(ctx, 0, -1, 14, '#e8222d');
      G.texto(ctx, '13', 0, 5, { size: 12, align: 'center', color: '#fff', weight: 900 });
      break;
    }
    case 'picanha': {
      ctx.rotate(Math.sin(t * 3) * 0.15);
      ctx.fillStyle = '#7a2a1c';
      ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b8483a';
      ctx.beginPath(); ctx.ellipse(-1, -1, 17, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3d6'; // a capa de gordura (a parte boa)
      ctx.beginPath(); ctx.ellipse(0, -9, 19, 5, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#4a170f'; ctx.lineWidth = 1.5;
      for (let i = -10; i <= 10; i += 7) { ctx.beginPath(); ctx.moveTo(i - 3, -3); ctx.lineTo(i + 3, 5); ctx.stroke(); }
      break;
    }
    case 'cerveja': {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      G.retRedondo(ctx, -11, -14, 22, 30, 4); ctx.fill();
      ctx.fillStyle = '#f2a91c';
      G.retRedondo(ctx, -9, -8, 18, 22, 3); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-6, -10, 6, 0, Math.PI * 2); ctx.arc(2, -12, 7, 0, Math.PI * 2); ctx.arc(8, -9, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(13, 1, 6, -1.2, 1.2); ctx.stroke();
      break;
    }
    case 'envelope': {
      ctx.rotate(t * 6);
      ctx.fillStyle = '#f5ecd2'; ctx.fillRect(-16, -10, 32, 20);
      ctx.strokeStyle = '#a89870'; ctx.lineWidth = 1.5; ctx.strokeRect(-16, -10, 32, 20);
      ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(0, 2); ctx.lineTo(16, -10); ctx.stroke();
      G.texto(ctx, 'SALÁRIO', 0, 8, { size: 7, align: 'center', color: '#a11', weight: 900 });
      break;
    }
    case 'bombom': {
      ctx.rotate(t * 5);
      ctx.fillStyle = '#e8b923';
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-20, -7); ctx.lineTo(-20, 7); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(20, -7); ctx.lineTo(20, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a2512'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a4424'; ctx.beginPath(); ctx.arc(-3, -3, 5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'dinheiro': {
      ctx.rotate(Math.sin(t * 5) * 0.4);
      for (let i = 2; i >= 0; i--) {
        ctx.fillStyle = i % 2 ? '#3d8f4a' : '#58b865';
        ctx.fillRect(-18 + i * 2, -9 - i * 3, 36, 18);
      }
      ctx.strokeStyle = '#1d5a28'; ctx.lineWidth = 1.5; ctx.strokeRect(-18, -9, 36, 18);
      G.texto(ctx, 'R$', 0, 5, { size: 12, align: 'center', color: '#e8ffe8', weight: 900 });
      break;
    }
    case 'fake': {
      ctx.translate(0, Math.sin(t * 8) * 2);
      ctx.fillStyle = '#25d366';
      G.retRedondo(ctx, -24, -15, 48, 28, 10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-14, 11); ctx.lineTo(-20, 20); ctx.lineTo(-6, 12); ctx.fill();
      ctx.save(); ctx.rotate(-0.18);
      ctx.strokeStyle = '#e8222d'; ctx.lineWidth = 2.5; ctx.strokeRect(-20, -9, 40, 16);
      G.texto(ctx, 'FAKE', 0, 5, { size: 13, align: 'center', color: '#e8222d', weight: 900 });
      ctx.restore();
      break;
    }
    case 'cheque': {
      ctx.rotate(t * 7);
      ctx.fillStyle = '#fff6c2'; ctx.fillRect(-20, -9, 40, 18);
      ctx.strokeStyle = '#b39a3a'; ctx.lineWidth = 1.5; ctx.strokeRect(-20, -9, 40, 18);
      G.texto(ctx, 'CHEQUE', 0, 0, { size: 7, align: 'center', color: '#6a5a1a', weight: 900 });
      G.texto(ctx, 'R$ 2.000', 0, 7, { size: 7, align: 'center', color: '#a11', weight: 900 });
      break;
    }
    case 'boleto': {
      ctx.rotate(t * 8);
      ctx.fillStyle = '#fff'; ctx.fillRect(-14, -18, 28, 36);
      ctx.fillStyle = '#111';
      for (let i = 0; i < 9; i++) ctx.fillRect(-11 + i * 2.6, 8, i % 3 ? 1.2 : 2, 7);
      G.texto(ctx, 'BOLETO', 0, -6, { size: 6, align: 'center', color: '#111', weight: 900 });
      G.texto(ctx, 'VENCIDO', 0, 2, { size: 6, align: 'center', color: '#d11', weight: 900 });
      break;
    }
    case 'mala': {
      ctx.rotate(Math.sin(t * 6) * 0.5);
      ctx.fillStyle = '#7a4a22'; G.retRedondo(ctx, -18, -13, 36, 26, 4); ctx.fill();
      ctx.strokeStyle = '#3a2210'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -15, 6, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#ffd400'; ctx.fillRect(-18, -2, 36, 3);
      G.texto(ctx, 'MIAMI', 0, 10, { size: 7, align: 'center', color: '#fff', weight: 900 });
      break;
    }
    case 'audio': { // o tiro do Janones: uma ondinha de áudio do zap
      ctx.fillStyle = '#dcf8c6';
      G.retRedondo(ctx, -22, -11, 44, 22, 11); ctx.fill();
      ctx.fillStyle = '#128c7e';
      ctx.beginPath(); ctx.moveTo(-15, -5); ctx.lineTo(-9, 0); ctx.lineTo(-15, 5); ctx.fill();
      for (let i = 0; i < 7; i++) { const h = 3 + Math.abs(Math.sin(t * 20 + i)) * 6; ctx.fillRect(-5 + i * 3.5, -h / 2, 2, h); }
      break;
    }
  }
  ctx.restore();
};

// ---------- fantasma (assessor que nunca foi trabalhar) ----------
G.Arte.fantasma = function (ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4) * 5);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#f2f4ff';
  ctx.beginPath();
  ctx.arc(0, -22, 20, Math.PI, 0);
  ctx.lineTo(20, 10);
  for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(16 - i * 8, 18 + (i % 2 ? -6 : 6) * Math.sin(t * 8), 12 - i * 8, 10);
  ctx.lineTo(-20, 10);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath(); ctx.ellipse(-7, -24, 3.5, 5, 0, 0, Math.PI * 2); ctx.ellipse(7, -24, 3.5, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -12, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  // gravata e crachá
  ctx.fillStyle = '#1d4fa8';
  ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(2, -4); ctx.lineTo(3, 8); ctx.lineTo(0, 11); ctx.lineTo(-3, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
  ctx.fillRect(6, -4, 16, 11); ctx.strokeRect(6, -4, 16, 11);
  G.texto(ctx, 'ASSESSOR', 14, 0, { size: 3.8, align: 'center', color: '#a11', weight: 900 });
  G.texto(ctx, 'R$ 8 mil', 14, 5, { size: 3.8, align: 'center', color: '#111', weight: 900 });
  ctx.restore();
};

// ---------- drone do gabinete do ódio ----------
G.Arte.drone = function (ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 6) * 3);
  ctx.fillStyle = '#333';
  G.retRedondo(ctx, -22, -8, 44, 16, 6); ctx.fill();
  ctx.fillStyle = '#e8222d'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(-30, -14); ctx.moveTo(22, -4); ctx.lineTo(30, -14); ctx.stroke();
  ctx.fillStyle = 'rgba(200,200,200,0.7)';
  const h = Math.abs(Math.sin(t * 40)) * 14 + 2;
  ctx.fillRect(-30 - h / 2, -16, h, 3); ctx.fillRect(30 - h / 2, -16, h, 3);
  ctx.fillStyle = '#111'; ctx.fillRect(-34, 12, 68, 12);
  G.texto(ctx, 'GABINETE DO ÓDIO', 0, 21, { size: 7.5, align: 'center', color: '#ff5555', weight: 900 });
  ctx.restore();
};
