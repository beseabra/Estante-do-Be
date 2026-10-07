// ============================================================
//  ARTE: os personagens
//
//  Todos são desenhados com (x, y) nos PÉS.
//  facing: 1 = olhando para a direita, -1 = esquerda.
//  Dentro das funções, a "frente" é sempre o x positivo.
// ============================================================
F.Art = F.Art || {};

F.Art.LOOKS = {
  noah: {
    skin: '#f1d3bd', skinShade: '#ddb49c', hair: '#19130f', hairShine: '#4a3a30',
    eye: '#3a2618', shirt: '#f2efe8', shirtShade: '#d6d0c4', pants: '#34446a', pantsDark: '#28365a', shoe: '#2c2424',
    splats: ['#e8433b', '#3f7be0', '#f3c632', '#3fbf7a'],
  },
  jude: {
    skin: '#f7ddca', skinShade: '#e7bfa8', hair: '#f3d36b', hairShine: '#fff0b0',
    eye: '#6fb9f2', shirt: '#80838c', shirtShade: '#66696f', pants: '#46557a', pantsDark: '#38466a', shoe: '#ece8e2',
    beanie: '#1c1b21', beanieCuff: '#2b2a31',
  },
  brian: {
    skin: '#f5dcc4', skinShade: '#e2bea4', hair: '#f6efcf', hairShine: '#ffffff',
    eye: '#c38a2c', shirt: '#2f5f63', shirtShade: '#244a4d', pants: '#3a3a44', pantsDark: '#2c2c35', shoe: '#2a2020',
    hat: '#3e6b46', hatBand: '#2a4a30', feather: '#d9c25a',
  },
};

// ---------- Corpo genérico (pernas, tronco, braços) ----------
F.Art.body = function (ctx, C, o, swing, extraTorso = 0) {
  const leg = (hx, fx, fy, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hx, -14);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.fillStyle = C.shoe;
    ctx.beginPath();
    ctx.ellipse(fx + 1.3, fy + 0.5, 3.8, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  if (o.air) {
    leg(-2, -5, -4, C.pantsDark);
    leg(2, 6, -7, C.pants);
  } else {
    leg(-2, -2 - swing * 4, -1.5, C.pantsDark);
    leg(2, 2 + swing * 4, -1.5, C.pants);
  }
};

F.Art.arm = function (ctx, C, hand, color, from = [0, -26]) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(hand[0], hand[1]);
  ctx.stroke();
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(hand[0], hand[1], 2, 0, Math.PI * 2);
  ctx.fill();
};

F.Art.face = function (ctx, C, hy, t, blinkOffset, closed) {
  const blink = closed || ((t + blinkOffset) % 3.8) < 0.12;
  const eye = (ex, w) => {
    if (blink) {
      ctx.strokeStyle = '#5a3d30';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(ex - w, hy + 1.4);
      ctx.lineTo(ex + w, hy + 1.4);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, hy + 1.2, w, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.arc(ex + 0.5, hy + 1.3, Math.min(1.6, w), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#120c0a';
    ctx.beginPath();
    ctx.arc(ex + 0.6, hy + 1.4, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex + 1, hy + 0.6, 0.45, 0, Math.PI * 2);
    ctx.fill();
  };
  eye(3.6, 2);
  eye(8, 1.4);
  ctx.fillStyle = 'rgba(255,130,120,0.28)';
  ctx.beginPath();
  ctx.ellipse(3.6, hy + 4.4, 2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a65a4c';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(7.6, hy + 4.4, 1.2, 0.35, Math.PI - 0.35);
  ctx.stroke();
};

// Monta um personagem completo. hairFn desenha o cabelo/chapéu.
F.Art.kid = function (ctx, x, y, o, C, hairFn, extras) {
  const f = o.facing || 1;
  const t = o.t || 0;
  const swing = o.moving ? Math.sin(o.walk || 0) : 0;
  const bob = o.moving ? Math.abs(Math.sin(o.walk || 0)) * 1.4 : Math.sin(t * 2.2) * 0.5;
  const sq = o.squash || 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  if (!o.air && !o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.scale(f * (1 + sq * 0.12), 1 - sq * 0.12);

  F.Art.body(ctx, C, o, swing);
  ctx.translate(0, -bob);

  // posição das mãos
  let back = [-1 + swing * 4, -15];
  let front = [1 - swing * 4, -15];
  if (o.air) { back = [-6, -24]; front = [7, -27]; }
  if (o.glide) { back = [-13, -30]; front = [14, -30]; }
  if (o.act > 0) front = extras.actHand ? extras.actHand(o.act) : [10, -26];
  if (o.reach) front = [11, -27];

  F.Art.arm(ctx, C, back, C.shirtShade);

  // tronco
  ctx.fillStyle = C.shirt;
  F.draw.roundRect(ctx, -7, -29, 14, extras.longTorso ? 18 : 16, 5);
  ctx.fill();
  if (extras.torso) extras.torso(ctx, C);

  F.Art.arm(ctx, C, front, C.shirt);
  if (o.act > 0 && extras.tool) extras.tool(ctx, front, o.act);

  ctx.fillStyle = C.skinShade;
  ctx.fillRect(-1, -32, 4, 4);

  // cabeça
  ctx.save();
  ctx.translate(1, -31);
  ctx.rotate(o.headTilt || 0);
  ctx.translate(-1, 31);
  const hy = -39;
  ctx.fillStyle = C.skin;
  ctx.beginPath();
  ctx.arc(1, hy, 9, 0, Math.PI * 2);
  ctx.fill();
  F.Art.face(ctx, C, hy, t, extras.blink || 0, o.closedEyes);
  hairFn(ctx, C, hy, t);
  ctx.restore();

  ctx.restore();
};

// ---------- NOAH: cachos pretos, camiseta com manchas de tinta ----------
F.Art.drawNoah = function (ctx, x, y, o = {}) {
  const C = F.Art.LOOKS.noah;
  F.Art.kid(ctx, x, y, o, C, (ctx, C, hy) => {
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.arc(0, hy - 2, 9.2, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    // cachos
    const curls = [[-8, hy + 2], [-8.5, hy - 3], [-6, hy - 8], [-2, hy - 10.5], [3, hy - 10.5], [7, hy - 8], [9.5, hy - 4.5], [5.5, hy - 5], [-4.5, hy + 5]];
    curls.forEach(([cx, cy], i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 3.4 - (i === 8 ? 1 : 0), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = C.hairShine;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(-2, hy - 9, 2, Math.PI, Math.PI * 1.8);
    ctx.arc(4, hy - 9.5, 2, Math.PI, Math.PI * 1.8);
    ctx.stroke();
  }, {
    blink: 0.4,
    torso(ctx, C) {
      C.splats.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(-3 + (i % 2) * 6, -25 + Math.floor(i / 2) * 6, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    actHand: (a) => [12, -24 - Math.sin(a * Math.PI) * 6],
    tool(ctx, hand, a) {
      // pincel
      ctx.strokeStyle = '#8a5a34';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hand[0], hand[1]);
      ctx.lineTo(hand[0] + 6, hand[1] - 5);
      ctx.stroke();
      ctx.fillStyle = `hsl(${(a * 360) | 0},80%,60%)`;
      ctx.beginPath();
      ctx.arc(hand[0] + 7, hand[1] - 6, 2, 0, Math.PI * 2);
      ctx.fill();
    },
  });
};

// ---------- JUDE: touca preta, moletom cinza enorme, cabelo loiro curto ----------
F.Art.drawJude = function (ctx, x, y, o = {}) {
  const C = F.Art.LOOKS.jude;
  F.Art.kid(ctx, x, y, o, C, (ctx, C, hy) => {
    // cabelo loiro saindo da touca (ou solto, no final)
    ctx.fillStyle = C.hair;
    if (o.noBeanie) {
      ctx.beginPath();
      ctx.arc(0.5, hy - 1.5, 9.6, Math.PI * 0.9, Math.PI * 2.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-9, hy);
      ctx.quadraticCurveTo(-10, hy + 7, -6, hy + 9);
      ctx.lineTo(-4, hy + 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, hy - 3);
      ctx.lineTo(8.5, hy + 1);
      ctx.lineTo(6.5, hy - 3);
      ctx.lineTo(4, hy - 1);
      ctx.lineTo(3, hy - 5);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(-9, hy - 1);
    ctx.quadraticCurveTo(-10.5, hy + 6, -6.5, hy + 8);
    ctx.lineTo(-4.5, hy + 1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9.6, hy - 3);
    ctx.lineTo(9, hy + 0.5);
    ctx.lineTo(7, hy - 3);
    ctx.fill();
    // touca
    ctx.fillStyle = C.beanie;
    ctx.beginPath();
    ctx.arc(0.5, hy - 2.5, 10, Math.PI, Math.PI * 2);
    ctx.lineTo(10.5, hy - 1.5);
    ctx.lineTo(-9.5, hy - 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.beanieCuff;
    F.draw.roundRect(ctx, -10, hy - 5, 21, 4.5, 2);
    ctx.fill();
  }, {
    blink: 1.7,
    longTorso: true,
    torso(ctx, C) {
      // capuz e bolso do moletom
      ctx.fillStyle = C.shirtShade;
      F.draw.roundRect(ctx, -8, -30, 9, 5, 2.5);
      ctx.fill();
      ctx.fillRect(-3, -19, 8, 4);
      // laço vermelho no pulso fica na mão de trás
    },
    actHand: (a) => [11, -30 + Math.sin(a * Math.PI) * 12],
    tool(ctx, hand) {
      // cinzel
      ctx.strokeStyle = '#b8bcc4';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hand[0], hand[1]);
      ctx.lineTo(hand[0] + 7, hand[1] + 2);
      ctx.stroke();
      ctx.fillStyle = '#7a5130';
      ctx.fillRect(hand[0] - 2, hand[1] - 2, 3, 4);
    },
  });
  // laço vermelho no pulso (pequeno detalhe)
  const f = o.facing || 1;
  ctx.fillStyle = '#d8283a';
  ctx.beginPath();
  ctx.arc(x - f * 1.5, y - 16, 1.2, 0, Math.PI * 2);
  ctx.fill();
};

// ---------- BRIAN: cabelo quase branco, chapéu verde com pena ----------
F.Art.drawBrian = function (ctx, x, y, o = {}) {
  const C = F.Art.LOOKS.brian;
  F.Art.kid(ctx, x, y, o, C, (ctx, C, hy) => {
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.arc(0.5, hy - 1, 9.3, Math.PI * 0.9, Math.PI * 2.05);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, hy + 3);
    ctx.lineTo(-10, hy - 2);
    ctx.lineTo(-7, hy + 6);
    ctx.fill();
    // chapéu
    ctx.fillStyle = C.hat;
    ctx.beginPath();
    ctx.ellipse(1, hy - 7, 13, 2.6, -0.05, 0, Math.PI * 2);
    ctx.fill();
    F.draw.roundRect(ctx, -6, hy - 15, 14, 9, 3);
    ctx.fill();
    ctx.fillStyle = C.hatBand;
    ctx.fillRect(-6, hy - 9.5, 14, 2);
    ctx.strokeStyle = C.feather;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, hy - 10);
    ctx.quadraticCurveTo(-10, hy - 17, -6, hy - 21);
    ctx.stroke();
  }, { blink: 2.6 });
};

// ---------- VOVÓ SWEETWINE: fantasma flutuante, sombrinha vermelha ----------
F.Art.drawVovo = function (ctx, x, y, o = {}) {
  const t = o.t || 0;
  const f = o.facing || -1;
  const float = Math.sin(t * 1.5) * 3;
  ctx.save();
  ctx.translate(x, y - 14 + float);
  ctx.globalAlpha *= o.alpha ?? 0.85;
  F.draw.glow(ctx, 0, -26, 50, '255,190,150', 0.35);
  ctx.scale(f, 1);
  ctx.lineCap = 'round';

  // pés descalços (os pés dos espíritos não tocam o chão)
  ctx.fillStyle = '#f2d2bd';
  ctx.beginPath();
  ctx.ellipse(-2.5, 0, 2.6, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(3.5, 0, 2.6, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // vestido flutuante com cores de pôr do sol
  const sway = Math.sin(t * 2) * 2;
  const g = ctx.createLinearGradient(0, -34, 0, -2);
  g.addColorStop(0, '#f6a23a');
  g.addColorStop(0.5, '#e8507a');
  g.addColorStop(1, '#7b4bc4');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(6, -34);
  ctx.quadraticCurveTo(12 + sway, -14, 13 + sway, -3);
  for (let i = 0; i <= 5; i++) ctx.quadraticCurveTo(9 - i * 4.4 + sway, -6 + (i % 2) * 4, 13 - (i + 1) * 4.4 + sway, -3);
  ctx.quadraticCurveTo(-12 + sway, -14, -6, -34);
  ctx.fill();

  // braços: um segura a sombrinha
  ctx.strokeStyle = '#f2d2bd';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(4, -32);
  ctx.lineTo(9, -42);
  ctx.moveTo(-4, -32);
  ctx.lineTo(-7, -22);
  ctx.stroke();
  // sombrinha vermelha
  ctx.strokeStyle = '#5a3a2a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, -42);
  ctx.lineTo(9, -62);
  ctx.stroke();
  ctx.fillStyle = '#d8283a';
  ctx.beginPath();
  ctx.moveTo(-8, -58);
  ctx.quadraticCurveTo(9, -78, 26, -58);
  for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(21.5 - i * 8.5, -61, 17.5 - i * 8.5, -58);
  ctx.fill();

  // cabeça
  const hy = -42;
  ctx.fillStyle = '#f5d9c6';
  ctx.beginPath();
  ctx.arc(1, hy, 8, 0, Math.PI * 2);
  ctx.fill();
  // cabelo branco em coque
  ctx.fillStyle = '#f4f1ec';
  ctx.beginPath();
  ctx.arc(0, hy - 4, 8.4, Math.PI, Math.PI * 2);
  ctx.arc(-6, hy - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  // óculos de sol enormes de tartaruga
  ctx.fillStyle = '#5a3418';
  ctx.beginPath();
  ctx.ellipse(3.5, hy, 3, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(8.6, hy, 2.2, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,180,0.45)';
  ctx.fillRect(2.5, hy - 1.6, 1.5, 1);
  // batom
  ctx.fillStyle = '#d23a52';
  ctx.beginPath();
  ctx.ellipse(6.6, hy + 4.6, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// ---------- Os gêmeos vistos de costas, sentados lado a lado ----------
// hairFree: Jude sem touca (cabelos soltos ao vento)
F.Art.drawTwinsBack = function (ctx, x, y, s, t, hairFree) {
  const N = F.Art.LOOKS.noah, J = F.Art.LOOKS.jude;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const sway = Math.sin(t * 1.2);

  // Noah (esquerda)
  ctx.fillStyle = N.shirt;
  ctx.beginPath();
  ctx.ellipse(-12, -10, 12, 13, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-24, -10, 24, 10);
  ctx.fillStyle = N.skinShade;
  ctx.fillRect(-14, -26, 5, 5);
  ctx.fillStyle = N.hair;
  ctx.beginPath();
  ctx.arc(-11.5, -33, 9, 0, Math.PI * 2);
  ctx.fill();
  [[-19, -36], [-15, -41], [-9, -42], [-4, -37], [-18, -29], [-5, -30], [-12, -26]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jude (direita)
  ctx.fillStyle = J.shirt;
  ctx.beginPath();
  ctx.ellipse(12, -10, 13, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-1, -10, 26, 10);
  ctx.fillStyle = J.shirtShade;
  ctx.beginPath();
  ctx.ellipse(12, -21, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = J.hair;
  ctx.beginPath();
  ctx.arc(11.5, -33, 9, 0, Math.PI * 2);
  ctx.fill();
  if (hairFree) {
    // mechas ao vento
    ctx.beginPath();
    ctx.moveTo(18, -36);
    ctx.quadraticCurveTo(28 + sway * 3, -34, 30 + sway * 4, -28);
    ctx.quadraticCurveTo(24, -30, 19, -28);
    ctx.fill();
  } else {
    ctx.fillStyle = J.beanie;
    ctx.beginPath();
    ctx.arc(11.5, -35, 9.6, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = J.beanieCuff;
    ctx.fillRect(1.8, -37, 19.4, 4);
  }

  ctx.restore();
};
