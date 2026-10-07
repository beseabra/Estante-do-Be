// ============================================================
//  ARTE: os dois personagens
//
//  Os dois são desenhados com o ponto (x, y) nos PÉS.
//  "facing" = 1 olha para a direita, -1 para a esquerda.
//  Dentro das funções, "frente" é sempre o x positivo.
// ============================================================
F.Art = F.Art || {};

// ---------- ELE: baixinho, loiro, olhos azuis ----------
F.Art.HIM = {
  hair: '#f2cf63', hairLight: '#fde9a8', hairDark: '#d3a53a',
  skin: '#f8d9c4', skinShade: '#eabfa6',
  eye: '#2f86e8',
  shirt: '#f5efe4', shirtShade: '#d9cfbf',
  pants: '#2c3d6b', pantsDark: '#222f55',
  shoe: '#3b2b2b',
};

F.Art.drawHim = function (ctx, x, y, o = {}) {
  const C = F.Art.HIM;
  const f = o.facing || 1;
  const t = o.t || 0;
  const swing = o.moving ? Math.sin(o.walk || 0) : 0;
  const bob = o.moving ? Math.abs(Math.sin(o.walk || 0)) * 1.4 : Math.sin(t * 2.2) * 0.5;
  const sq = o.squash || 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';

  // Sombra no chão
  if (!o.air) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.scale(f * (1 + sq * 0.12), 1 - sq * 0.12);

  // Pernas
  const leg = (hx, fx, fy, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hx, -14);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.fillStyle = C.shoe;
    ctx.beginPath();
    ctx.ellipse(fx + 1.3, fy + 0.5, 3.6, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  if (o.air) {
    leg(-2, -5, -4, C.pantsDark);
    leg(2, 6, -7, C.pants);
  } else {
    leg(-2, -2 - swing * 4, -1.5, C.pantsDark);
    leg(2, 2 + swing * 4, -1.5, C.pants);
  }

  ctx.translate(0, -bob);

  // Posição das mãos
  let back = [-1 + swing * 4, -15];
  let front = [1 - swing * 4, -15];
  if (o.air) { back = [-6, -24]; front = [7, -27]; }
  if (o.reach) front = [9, -23];

  const arm = (hand, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(hand[0], hand[1]);
    ctx.stroke();
    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.arc(hand[0], hand[1], 2, 0, Math.PI * 2);
    ctx.fill();
  };

  arm(back, C.shirtShade);

  // Tronco
  ctx.fillStyle = C.shirt;
  F.draw.roundRect(ctx, -7, -29, 14, 16, 5);
  ctx.fill();
  ctx.strokeStyle = C.shirtShade;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(1, -29);
  ctx.lineTo(3, -25);
  ctx.lineTo(5, -29);
  ctx.stroke();

  arm(front, C.shirt);

  // Pescoço
  ctx.fillStyle = C.skinShade;
  ctx.fillRect(-1, -32, 4, 4);

  // ---- Cabeça (gira em torno do pescoço) ----
  ctx.save();
  ctx.translate(1, -31);
  ctx.rotate(o.headTilt || 0);
  ctx.translate(-1, 31);
  const hy = -39;

  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(1, hy, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.skinShade;
  ctx.beginPath();
  ctx.arc(-3, hy + 1.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo loiro com franja bagunçada
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.moveTo(-8.5, hy + 3);
  ctx.quadraticCurveTo(-11, hy - 8, -2, hy - 11.5);
  ctx.quadraticCurveTo(8, hy - 13.5, 11, hy - 4);
  ctx.lineTo(9.5, hy - 1);
  ctx.lineTo(7.8, hy - 4);
  ctx.lineTo(5.8, hy - 0.8);
  ctx.lineTo(3.8, hy - 4.5);
  ctx.lineTo(1.2, hy - 2);
  ctx.lineTo(-0.8, hy - 5);
  ctx.lineTo(-4, hy - 3);
  ctx.lineTo(-5, hy + 3.5);
  ctx.closePath();
  ctx.fill();
  // Topete
  ctx.beginPath();
  ctx.moveTo(-1, hy - 11);
  ctx.quadraticCurveTo(1, hy - 16, 4.5, hy - 14);
  ctx.quadraticCurveTo(2, hy - 13, 2, hy - 11);
  ctx.fill();
  // Brilho no cabelo
  ctx.strokeStyle = C.hairLight;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(1, hy - 3, 7.5, Math.PI * 1.15, Math.PI * 1.55);
  ctx.stroke();

  // Olhos azuis
  const blink = ((t + 0.7) % 3.6) < 0.12;
  const eye = (ex, w) => {
    if (blink) {
      ctx.strokeStyle = '#6b4a3a';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(ex - w, hy + 1.4);
      ctx.lineTo(ex + w, hy + 1.4);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, hy + 1.2, w, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.arc(ex + 0.5, hy + 1.3, Math.min(1.7, w), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10223d';
    ctx.beginPath();
    ctx.arc(ex + 0.6, hy + 1.4, 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex + 1, hy + 0.6, 0.5, 0, Math.PI * 2);
    ctx.fill();
  };
  eye(3.6, 2);
  eye(8, 1.4);

  // Sobrancelhas
  ctx.strokeStyle = C.hairDark;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(2, hy - 2.2);
  ctx.lineTo(5, hy - 2.6);
  ctx.moveTo(7, hy - 2.5);
  ctx.lineTo(9, hy - 2.2);
  ctx.stroke();

  // Bochecha corada
  ctx.fillStyle = 'rgba(255,120,145,0.3)';
  ctx.beginPath();
  ctx.ellipse(3.4, hy + 4.4, 2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sorriso
  ctx.strokeStyle = '#a85450';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(7.6, hy + 4.4, 1.3, 0.35, Math.PI - 0.35);
  ctx.stroke();

  ctx.restore(); // cabeça
  ctx.restore();
};

// ---------- ELA: alta, magra, pele clara, cabelo preto, óculos ----------
F.Art.HER = {
  hair: '#15111a', hairShine: '#4a3d5c',
  skin: '#fdf1ec', skinShade: '#efd8cf',
  dress: '#8e1e43', dressDark: '#5a1230', dressLight: '#b83a62',
  lips: '#c45570', frame: '#1d1a22', iris: '#2a1c1c',
  book: '#efe3cf',
};

// pose: 'stand' | 'read' | 'sky' | 'shy' | 'reach'
F.Art.drawHer = function (ctx, x, y, o = {}) {
  const C = F.Art.HER;
  const f = o.facing || -1;
  const t = o.t || 0;
  const pose = o.pose || 'stand';
  const sway = Math.sin(t * 1.6);
  const breathe = Math.sin(t * 1.8) * 0.4;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';

  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.scale(f, 1);
  const hy = -63 + breathe;
  const headTilt = o.headTilt ?? (pose === 'sky' ? -0.28 : pose === 'read' ? 0.22 : 0);

  // Cabelo longo de trás
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.moveTo(-6, hy - 6);
  ctx.quadraticCurveTo(-13, hy + 10, -10.5 + sway * 1.5, hy + 32);
  ctx.quadraticCurveTo(-4, hy + 35, 1 + sway, hy + 29);
  ctx.quadraticCurveTo(0, hy + 14, 2, hy + 6);
  ctx.closePath();
  ctx.fill();

  // Pernas finas
  ctx.strokeStyle = C.skinShade;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-2, -12);
  ctx.lineTo(-2.5, -1.5);
  ctx.moveTo(2, -12);
  ctx.lineTo(2.5, -1.5);
  ctx.stroke();
  ctx.fillStyle = '#2a1a22';
  ctx.beginPath();
  ctx.ellipse(-1.8, -1, 2.8, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(3.3, -1, 2.8, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Braço de trás
  const arm = (sx, sy, hx, hy2, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx, hy2);
    ctx.stroke();
  };
  const sh = hy + 14; // altura dos ombros
  const backHand = pose === 'read' ? [7, sh + 10] : [-5, sh + 20];
  arm(-3, sh + 1, backHand[0], backHand[1], C.skinShade);

  // Vestido vinho, levemente balançando
  const dg = ctx.createLinearGradient(0, sh, 0, -6);
  dg.addColorStop(0, C.dressLight);
  dg.addColorStop(0.35, C.dress);
  dg.addColorStop(1, C.dressDark);
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.moveTo(-4.5, sh);
  ctx.lineTo(4.5, sh);
  ctx.lineTo(3.6, sh + 12);
  ctx.quadraticCurveTo(7 + sway, -18, 10 + sway * 1.5, -9);
  ctx.quadraticCurveTo(0, -6 + sway * 0.5, -9 + sway * 1.2, -9);
  ctx.quadraticCurveTo(-6 + sway, -18, -3.6, sh + 12);
  ctx.closePath();
  ctx.fill();

  // Braço da frente (depende da pose)
  let frontHand = [5, sh + 20];
  if (pose === 'read') frontHand = [8, sh + 9];
  if (pose === 'shy') frontHand = [3, sh + 6];
  if (pose === 'reach') frontHand = [11, sh + 25];
  arm(3, sh + 1, frontHand[0], frontHand[1], C.skin);

  // Livro (pose de leitura)
  if (pose === 'read') {
    ctx.save();
    ctx.translate(8.5, sh + 7);
    ctx.rotate(-0.25);
    ctx.fillStyle = C.dressDark;
    ctx.fillRect(-0.5, -5, 7, 9);
    ctx.fillStyle = C.book;
    ctx.fillRect(0.5, -4.5, 6, 8);
    ctx.strokeStyle = 'rgba(120,90,70,0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(1.5, -2.5 + i * 2.2);
      ctx.lineTo(5.5, -2.5 + i * 2.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pescoço
  ctx.fillStyle = C.skinShade;
  ctx.fillRect(-0.5, hy + 7, 3, 7);

  // ---- Cabeça ----
  ctx.save();
  ctx.translate(1, hy + 8);
  ctx.rotate(headTilt);
  ctx.translate(-1, -(hy + 8));

  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.ellipse(1.6, hy + 0.5, 7.4, 8.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Olhos (fechados quando lê ou quando está tímida, às vezes)
  const blink = ((t + 1.9) % 4.1) < 0.13;
  const closed = blink || pose === 'read';
  const eye = (ex) => {
    if (closed) {
      ctx.strokeStyle = C.iris;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(ex, hy + 0.4, 1.3, 0.2, Math.PI - 0.2);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = C.iris;
    ctx.beginPath();
    ctx.arc(ex + 0.3, hy + 0.9, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex + 0.7, hy + 0.4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.iris;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(ex - 1.5, hy - 0.4);
    ctx.lineTo(ex + 1.8, hy - 0.7);
    ctx.stroke();
  };
  eye(3.4);
  eye(7.8);

  // Bochecha e boca
  ctx.fillStyle = 'rgba(240,120,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(6.2, hy + 4, 2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.lips;
  ctx.beginPath();
  ctx.ellipse(7, hy + 5.6, 1.3, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Óculos redondos
  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(3.4, hy + 0.7, 2.2, 0, Math.PI * 2);
  ctx.moveTo(10, hy + 0.7);
  ctx.arc(7.8, hy + 0.7, 2.2, 0, Math.PI * 2);
  ctx.moveTo(5.6, hy + 0.4);
  ctx.lineTo(5.6, hy + 0.4);
  ctx.moveTo(1.2, hy + 0.5);
  ctx.lineTo(-3, hy - 0.4);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(3.4, hy + 0.7, 1.4, Math.PI * 1.1, Math.PI * 1.45);
  ctx.moveTo(7.8 + 1.4 * Math.cos(Math.PI * 1.1), hy + 0.7 + 1.4 * Math.sin(Math.PI * 1.1));
  ctx.arc(7.8, hy + 0.7, 1.4, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();

  // Cabelo da frente: franja reta e mecha escondendo a orelha
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.moveTo(-8, hy + 6);
  ctx.quadraticCurveTo(-10.5, hy - 9.5, 0.5, hy - 11);
  ctx.quadraticCurveTo(9, hy - 10.5, 9.8, hy - 2);
  ctx.lineTo(8.8, hy - 1.6);
  ctx.lineTo(7.4, hy - 3);
  ctx.lineTo(5.8, hy - 2);
  ctx.lineTo(4.2, hy - 3.4);
  ctx.lineTo(2.4, hy - 2.4);
  ctx.quadraticCurveTo(-1, hy - 2.5, -1.8, hy + 3);
  ctx.quadraticCurveTo(-2.6, hy + 11, -5 + sway * 0.6, hy + 16);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = C.hairShine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0.5, hy - 2, 7.5, Math.PI * 1.1, Math.PI * 1.5);
  ctx.stroke();

  ctx.restore(); // cabeça
  ctx.restore();
};
