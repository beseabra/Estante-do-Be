// ============================================================
//  CENÁRIOS (fundos com camadas em paralaxe) e OBSTÁCULOS
//    G.Cenarios[id].fundo(ctx, scroll, t)   o céu e as camadas
//    G.Cenarios[id].chao                    cores do chão
//    G.OBST[tipo]                           tamanho e desenho de cada obstáculo
// ============================================================
G.Cenarios = {};

// repete um desenho na horizontal, andando em paralaxe
G.repete = function (scroll, fator, largura, fn) {
  const off = -((scroll * fator) % largura);
  for (let x = off - largura; x < G.W + largura; x += largura) {
    const i = Math.floor((x - off) / largura + (scroll * fator) / largura);
    fn(x, i);
  }
};

// um número "aleatório" fixo por índice (para os prédios não mudarem)
G.semente = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

G.degrade = function (ctx, cores, y0 = 0, y1 = G.H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  cores.forEach((c, i) => g.addColorStop(i / (cores.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, G.W, y1 - y0);
};

// placas com piadas que passam no meio do cenário
G.placa = function (ctx, txt, x, y, cor = '#fff', fundo = '#123') {
  ctx.save();
  ctx.font = `900 13px ${G.FONTE}`;
  const w = ctx.measureText(txt).width + 20;
  ctx.fillStyle = '#555'; ctx.fillRect(x + w / 2 - 3, y + 24, 6, G.CHAO - y - 24);
  ctx.fillStyle = fundo; G.retRedondo(ctx, x, y, w, 26, 4); ctx.fill();
  ctx.strokeStyle = cor; ctx.lineWidth = 2; G.retRedondo(ctx, x + 3, y + 3, w - 6, 20, 3); ctx.stroke();
  ctx.restore();
  G.texto(ctx, txt, x + w / 2, y + 18, { size: 13, align: 'center', color: cor, weight: 900 });
};

// ---------------- 1. ALERJ / RIO ----------------
G.Cenarios.alerj = {
  chao: { topo: '#e9e2d0', base: '#cfc4a8', linha: '#2b2b2b', calcadao: true },
  fundo(ctx, scroll, t) {
    G.degrade(ctx, ['#ff9a5a', '#ffc070', '#ffe0a0']);
    // sol se pondo
    ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.beginPath(); ctx.arc(760, 250, 60, 0, Math.PI * 2); ctx.fill();
    // morros com o Cristo e o Pão de Açúcar
    G.repete(scroll, 0.05, 1400, (x) => {
      ctx.fillStyle = '#6a5a7a';
      ctx.beginPath(); ctx.moveTo(x, 360); ctx.quadraticCurveTo(x + 150, 120, x + 260, 150); ctx.quadraticCurveTo(x + 400, 200, x + 520, 360); ctx.fill();
      // Cristo
      ctx.fillStyle = '#4a3f5a';
      ctx.fillRect(x + 256, 104, 8, 46); ctx.fillRect(x + 236, 114, 48, 6);
      ctx.beginPath(); ctx.arc(x + 260, 100, 5, 0, Math.PI * 2); ctx.fill();
      // Pão de Açúcar
      ctx.fillStyle = '#7a6a88';
      ctx.beginPath(); ctx.moveTo(x + 820, 360); ctx.quadraticCurveTo(x + 860, 160, x + 930, 170); ctx.quadraticCurveTo(x + 980, 200, x + 1000, 360); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 980, 360); ctx.quadraticCurveTo(x + 1030, 250, x + 1080, 260); ctx.quadraticCurveTo(x + 1120, 290, x + 1130, 360); ctx.fill();
      ctx.strokeStyle = '#4a3f5a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 930, 172); ctx.lineTo(x + 1060, 262); ctx.stroke();
    });
    // o palácio da ALERJ (colunas!)
    G.repete(scroll, 0.3, 700, (x, i) => {
      ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x, 230, 520, 230);
      ctx.fillStyle = '#d6c7a2';
      ctx.beginPath(); ctx.moveTo(x - 10, 232); ctx.lineTo(x + 260, 170); ctx.lineTo(x + 530, 232); ctx.fill();
      ctx.fillStyle = '#c8b68c'; ctx.fillRect(x - 10, 228, 540, 10);
      ctx.fillStyle = '#f5eedd';
      for (let c = 0; c < 9; c++) ctx.fillRect(x + 20 + c * 58, 250, 18, 200);
      ctx.fillStyle = '#7a6040';
      ctx.font = `900 14px ${G.FONTE}`;
      G.texto(ctx, i % 2 ? 'ASSEMBLEIA LEGISLATIVA' : 'GABINETES 1 AO 70', x + 260, 214, { size: 14, align: 'center', color: '#7a6040', weight: 900 });
      // palmeira
      ctx.fillStyle = '#5a4a2a'; ctx.fillRect(x + 600, 300, 8, 160);
      ctx.fillStyle = '#2f7a3a';
      for (let f = 0; f < 6; f++) { ctx.save(); ctx.translate(x + 604, 300); ctx.rotate(f * 1.05 + Math.sin(t + f) * 0.05); ctx.beginPath(); ctx.ellipse(28, 0, 30, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    });
    G.repete(scroll, 0.6, 1100, (x, i) => G.placa(ctx, G.PLACAS.alerj[Math.abs(i) % G.PLACAS.alerj.length], x + 200, 330, '#fff', '#1b4f8a'));
  },
};

// ---------------- 2. LOJA DE CHOCOLATE ----------------
G.Cenarios.chocolate = {
  chao: { topo: '#f4d8e4', base: '#e3b8c9', linha: '#c995ab', ladrilho: true },
  fundo(ctx, scroll, t) {
    G.degrade(ctx, ['#ffe8f0', '#ffd0e0', '#f8c0d4']);
    // luzes penduradas
    G.repete(scroll, 0.15, 120, (x, i) => {
      ctx.strokeStyle = '#d9a0b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 60, 0); ctx.lineTo(x + 60, 60 + (i % 3) * 20); ctx.stroke();
      ctx.fillStyle = `hsla(${(i * 40) % 360}, 90%, 70%, ${0.6 + Math.sin(t * 3 + i) * 0.3})`;
      ctx.beginPath(); ctx.arc(x + 60, 66 + (i % 3) * 20, 8, 0, Math.PI * 2); ctx.fill();
    });
    // as lojas do shopping
    G.repete(scroll, 0.35, 420, (x, i) => {
      const lojas = ['CHOCOLATES 01', 'CÂMBIO', 'IMOBILIÁRIA', 'CHOCOLATES 01', 'LOTÉRICA'];
      const nome = lojas[Math.abs(i) % lojas.length];
      const choc = nome.startsWith('CHOC');
      ctx.fillStyle = choc ? '#5a2e1a' : '#8a8aa8';
      ctx.fillRect(x + 20, 150, 380, 300);
      ctx.fillStyle = choc ? '#e8b923' : '#fff';
      ctx.fillRect(x + 20, 150, 380, 44);
      G.texto(ctx, nome, x + 210, 182, { size: 26, align: 'center', color: choc ? '#5a2e1a' : '#333', font: G.FONTE_TITULO });
      ctx.fillStyle = 'rgba(220,240,255,0.55)';
      ctx.fillRect(x + 40, 210, 340, 190);
      if (choc) {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
          ctx.fillStyle = (r + c) % 2 ? '#4a2512' : '#7a4424';
          ctx.beginPath(); ctx.arc(x + 70 + c * 40, 250 + r * 50, 12, 0, Math.PI * 2); ctx.fill();
        }
        G.texto(ctx, 'R$ 2.000 cada', x + 210, 390, { size: 14, align: 'center', color: '#a11', weight: 900 });
      } else {
        G.texto(ctx, nome === 'CÂMBIO' ? 'DÓLAR? A GENTE TEM' : nome === 'LOTÉRICA' ? 'GANHE 48x SEGUIDAS' : 'MANSÕES EM DINHEIRO VIVO', x + 210, 310, { size: 15, align: 'center', color: '#223', weight: 900 });
      }
    });
    G.repete(scroll, 0.6, 1000, (x, i) => G.placa(ctx, G.PLACAS.chocolate[Math.abs(i) % G.PLACAS.chocolate.length], x + 300, 340, '#5a2e1a', '#ffe14d'));
  },
};

// ---------------- 3. ATIBAIA À NOITE ----------------
G.Cenarios.atibaia = {
  chao: { topo: '#2f6a2f', base: '#1f4a22', linha: '#3e8a3e', grama: true },
  fundo(ctx, scroll, t) {
    G.degrade(ctx, ['#0a1030', '#1a2450', '#2c3a6a']);
    // estrelas e lua
    for (let i = 0; i < 70; i++) {
      const sx = (G.semente(i) * 1200 - scroll * 0.02) % G.W;
      ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(t * 2 + i) * 0.3})`;
      ctx.fillRect((sx + G.W) % G.W, G.semente(i + 99) * 280, 2, 2);
    }
    ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(780, 100, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a2450'; ctx.beginPath(); ctx.arc(800, 90, 36, 0, Math.PI * 2); ctx.fill();
    // morros
    G.repete(scroll, 0.08, 900, (x) => {
      ctx.fillStyle = '#16203e';
      ctx.beginPath(); ctx.moveTo(x, 400); ctx.quadraticCurveTo(x + 220, 200, x + 450, 330); ctx.quadraticCurveTo(x + 650, 240, x + 900, 400); ctx.fill();
    });
    // casas com luz acesa (e alguém escondido na janela)
    G.repete(scroll, 0.32, 520, (x, i) => {
      ctx.fillStyle = '#3a2a2a'; ctx.fillRect(x + 60, 290, 220, 170);
      ctx.fillStyle = '#5a2020'; ctx.beginPath(); ctx.moveTo(x + 40, 292); ctx.lineTo(x + 170, 220); ctx.lineTo(x + 300, 292); ctx.fill();
      ctx.fillStyle = '#ffd86a';
      ctx.fillRect(x + 90, 320, 40, 40); ctx.fillRect(x + 210, 320, 40, 40);
      if (i % 2 === 0) { // silhueta do Queiroz na janela
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 230, 345, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x + 214, 334, 32, 4);
      }
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + 150, 380, 40, 80);
      G.texto(ctx, i % 2 ? 'CASA DO ADVOGADO' : 'NÃO TEM NINGUÉM AQUI', x + 170, 282, { size: 11, align: 'center', color: '#ffd86a', weight: 900 });
      // árvore
      ctx.fillStyle = '#1f2f1f'; ctx.fillRect(x + 380, 340, 14, 120);
      ctx.fillStyle = '#183a20'; ctx.beginPath(); ctx.arc(x + 387, 320, 50, 0, Math.PI * 2); ctx.fill();
    });
    // vaga-lumes
    for (let i = 0; i < 14; i++) {
      const fx = (G.semente(i) * G.W + Math.sin(t * 0.7 + i) * 40 - scroll * 0.4 % G.W + G.W * 2) % G.W;
      const fy = 300 + G.semente(i + 7) * 140 + Math.sin(t * 1.3 + i) * 15;
      ctx.fillStyle = `rgba(220,255,120,${0.5 + Math.sin(t * 4 + i) * 0.5})`;
      ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    G.repete(scroll, 0.6, 1100, (x, i) => G.placa(ctx, G.PLACAS.atibaia[Math.abs(i) % G.PLACAS.atibaia.length], x + 300, 350, '#ffd86a', '#2a1a10'));
  },
};

// ---------------- 4. MANSÃO EM BRASÍLIA ----------------
G.Cenarios.mansao = {
  chao: { topo: '#f2f0ea', base: '#d8d4c8', linha: '#c0bba8', marmore: true },
  fundo(ctx, scroll, t) {
    G.degrade(ctx, ['#4aa8ff', '#9fd4ff', '#e0f2ff']);
    // nuvens
    G.repete(scroll, 0.04, 500, (x, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const y = 60 + (Math.abs(i) % 3) * 30;
      ctx.beginPath(); ctx.arc(x + 80, y, 24, 0, Math.PI * 2); ctx.arc(x + 110, y - 10, 30, 0, Math.PI * 2); ctx.arc(x + 145, y, 22, 0, Math.PI * 2); ctx.fill();
    });
    // o Congresso: duas torres e as duas cúpulas
    G.repete(scroll, 0.07, 1300, (x) => {
      ctx.fillStyle = '#b8c4d4';
      ctx.fillRect(x + 300, 200, 22, 170); ctx.fillRect(x + 330, 200, 22, 170);
      ctx.fillRect(x + 160, 360, 340, 14);
      ctx.beginPath(); ctx.arc(x + 210, 360, 34, Math.PI, 0); ctx.fill(); // cúpula do Senado (para baixo no real, mas cabe)
      ctx.beginPath(); ctx.moveTo(x + 410, 360); ctx.quadraticCurveTo(x + 450, 400, x + 490, 360); ctx.fill();
    });
    // muro da mansão e piscina ao fundo
    G.repete(scroll, 0.33, 760, (x, i) => {
      ctx.fillStyle = '#fafafa'; ctx.fillRect(x + 40, 250, 520, 210);
      ctx.fillStyle = '#d9d9d9'; ctx.fillRect(x + 40, 250, 520, 14);
      ctx.fillStyle = '#7fd0ff';
      for (let w = 0; w < 4; w++) ctx.fillRect(x + 70 + w * 125, 290, 90, 90);
      ctx.fillStyle = '#111';
      G.texto(ctx, i % 2 ? 'MANSÃO R$ 5.970.000' : 'VALOR VENAL: SEGREDO', x + 300, 244, { size: 15, align: 'center', color: '#3a3a3a', weight: 900 });
      // o Pai na janela, de tornozeleira
      if (Math.abs(i) % 3 === 1) {
        ctx.save(); ctx.beginPath(); ctx.rect(x + 445, 290, 90, 90); ctx.clip();
        G.Arte.boneco(ctx, 'jair', x + 490, 410, { t, pose: 'fala', semSombra: true, esc: 0.9 });
        ctx.restore();
        if (x > 0 && x < G.W - 560) G.Arte.balao(ctx, 'Tá ok? Cadê meu ferro de solda?', x + 490, 292, { size: 12, largura: 150 });
      }
      // palmeiras imperiais
      ctx.fillStyle = '#9a8a6a'; ctx.fillRect(x + 640, 260, 10, 200);
      ctx.fillStyle = '#2f8a3a';
      for (let f = 0; f < 7; f++) { ctx.save(); ctx.translate(x + 645, 260); ctx.rotate(f * 0.9 + Math.sin(t + f) * 0.05); ctx.beginPath(); ctx.ellipse(30, 0, 32, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    });
    G.repete(scroll, 0.6, 1050, (x, i) => G.placa(ctx, G.PLACAS.mansao[Math.abs(i) % G.PLACAS.mansao.length], x + 250, 345, '#0b6b2c', '#ffd400'));
  },
};

// ---------------- 5. AEROPORTO ----------------
G.Cenarios.aeroporto = {
  chao: { topo: '#cfd6de', base: '#aeb8c4', linha: '#97a3b2', brilho: true },
  fundo(ctx, scroll, t) {
    G.degrade(ctx, ['#ff7a59', '#ffb36b', '#7a4a8a']);
    // aviões passando lá fora
    const ax = (t * 90) % (G.W + 400) - 200;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.save(); ctx.translate(ax, 120 - ax * 0.08);
    ctx.fillRect(-60, -6, 120, 12); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-30, -40); ctx.lineTo(0, 0); ctx.moveTo(-10, 0); ctx.lineTo(-30, 40); ctx.lineTo(0, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-60, -6); ctx.lineTo(-72, -24); ctx.lineTo(-50, -6); ctx.fill();
    ctx.restore();
    // vidraça do terminal
    G.repete(scroll, 0.2, 160, (x) => {
      ctx.fillStyle = 'rgba(40,40,60,0.85)'; ctx.fillRect(x, 0, 10, 330);
    });
    ctx.fillStyle = 'rgba(40,40,60,0.9)'; ctx.fillRect(0, 320, G.W, 14);
    // painel de embarque
    G.repete(scroll, 0.35, 900, (x, i) => {
      ctx.fillStyle = '#111'; ctx.fillRect(x + 100, 160, 380, 140);
      ctx.fillStyle = '#ffcf33';
      G.texto(ctx, 'PARTIDAS', x + 120, 186, { size: 16, color: '#ffcf33', weight: 900 });
      const voos = [['MIAMI', 'ÚLTIMA CHAMADA'], ['ORLANDO', 'ESCALA EM ATIBAIA'], ['TEXAS', 'CANCELADO'], ['MIAMI', 'EMBARQUE 01']];
      voos.forEach(([d, s], k) => {
        const pisca = k === 0 && Math.sin(t * 8) > 0;
        G.texto(ctx, d, x + 120, 214 + k * 22, { size: 14, color: '#fff', weight: 900 });
        G.texto(ctx, s, x + 460, 214 + k * 22, { size: 14, align: 'right', color: pisca ? '#ff4444' : '#7dff8a', weight: 900 });
      });
      G.placa(ctx, G.PLACAS.aeroporto[Math.abs(i) % G.PLACAS.aeroporto.length], x + 600, 360, '#fff', '#2b3a8a');
    });
  },
};

// ---------------- o chão ----------------
// desenha o chão de x0 até x1 (os buracos ficam de fora)
G.desenhaChao = function (ctx, cen, x0, x1, scroll, agua) {
  const c = cen.chao;
  const y = G.CHAO;
  if (agua) { // piscina: água azul com brilho
    ctx.fillStyle = '#2aa8e8'; ctx.fillRect(x0, y + 10, x1 - x0, G.H - y);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let k = x0 + 10; k < x1 - 10; k += 24) ctx.fillRect(k, y + 18 + Math.sin(k * 0.1 + scroll * 0.02) * 3, 12, 2);
    return;
  }
  ctx.fillStyle = c.base; ctx.fillRect(x0, y, x1 - x0, G.H - y);
  ctx.fillStyle = c.topo; ctx.fillRect(x0, y, x1 - x0, 14);
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y, x1 - x0, G.H - y); ctx.clip();
  ctx.strokeStyle = c.linha;
  ctx.fillStyle = c.linha;
  const off = -(scroll % 80);
  if (c.calcadao) { // ondas do calçadão de Copacabana
    ctx.lineWidth = 7;
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      for (let k = x0 - 80; k < x1 + 80; k += 4) {
        const yy = y + 30 + row * 28 + Math.sin((k + scroll) * 0.06) * 8;
        if (k === x0 - 80) ctx.moveTo(k, yy); else ctx.lineTo(k, yy);
      }
      ctx.stroke();
    }
  } else if (c.ladrilho) {
    for (let k = x0 + off - 80; k < x1 + 80; k += 40) for (let r = 0; r < 3; r++) if (((k - off) / 40 + r) % 2 === 0) ctx.fillRect(k, y + 14 + r * 30, 40, 30);
  } else if (c.grama) {
    ctx.lineWidth = 2;
    for (let k = x0 + (off % 12) - 12; k < x1 + 12; k += 12) { ctx.beginPath(); ctx.moveTo(k, y + 2); ctx.lineTo(k + 4, y - 7); ctx.stroke(); }
  } else if (c.marmore) {
    ctx.lineWidth = 1.5;
    for (let k = x0 + off - 80; k < x1 + 80; k += 80) { ctx.beginPath(); ctx.moveTo(k, y + 14); ctx.lineTo(k, G.H); ctx.stroke(); }
  } else if (c.brilho) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let k = x0 + off * 2 - 160; k < x1 + 160; k += 160) ctx.fillRect(k, y + 30, 60, 4);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x0, y + 12, x1 - x0, 3);
};

// ============================================================
//  OBSTÁCULOS
//    w, h      tamanho
//    tipo      chao (no chão) | alto (pendurado: abaixe) | voa (inimigo voador)
//              | anda (inimigo que anda) | buraco | piscina
//    vida      quantos tiros aguenta (0 = indestrutível)
//    vx        velocidade própria (além da corrida)
// ============================================================
G.OBST = {
  mesa: { w: 72, h: 44, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(o.x, o.y, o.w, 10);
    ctx.fillRect(o.x + 4, o.y, 8, o.h); ctx.fillRect(o.x + o.w - 12, o.y, 8, o.h);
    ctx.fillStyle = '#fff'; ctx.fillRect(o.x + 14, o.y - 8, 22, 8); ctx.fillRect(o.x + 40, o.y - 5, 18, 5);
    G.texto(ctx, 'PONTO', o.x + 25, o.y - 1, { size: 6, align: 'center', color: '#a11', weight: 900 });
  } },
  processos: { w: 46, h: 72, tipo: 'chao', draw(ctx, o) {
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#e8d48a' : '#d9b85a'; ctx.fillRect(o.x + (i % 2) * 3, o.y + i * 12, o.w - 3, 12); }
    ctx.save(); ctx.translate(o.x + o.w / 2, o.y + 36); ctx.rotate(-0.3);
    ctx.strokeStyle = '#d11'; ctx.lineWidth = 2; ctx.strokeRect(-26, -9, 52, 16);
    G.texto(ctx, 'ANULADO', 0, 4, { size: 10, align: 'center', color: '#d11', weight: 900 });
    ctx.restore();
  } },
  faixa: { w: 130, h: 150, tipo: 'alto', draw(ctx, o, t, fase) {
    const txt = { alerj: 'CPI DA RACHADINHA', chocolate: 'AUDITORIA DA PÁSCOA', atibaia: 'PROCURA-SE: QUEIROZ', mansao: 'RECEITA FEDERAL', aeroporto: 'PASSAPORTE APREENDIDO' }[fase] || 'CPI';
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(o.x + 6, 0); ctx.lineTo(o.x + 6, o.y + o.h); ctx.moveTo(o.x + o.w - 6, 0); ctx.lineTo(o.x + o.w - 6, o.y + o.h); ctx.stroke();
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(o.x, o.y + o.h - 60, o.w, 60);
    ctx.fillStyle = '#111';
    for (let k = 0; k < o.w; k += 20) { ctx.beginPath(); ctx.moveTo(o.x + k, o.y + o.h - 60); ctx.lineTo(o.x + k + 10, o.y + o.h - 60); ctx.lineTo(o.x + k, o.y + o.h - 50); ctx.fill(); }
    const linhas = G.quebra(ctx, txt, o.w - 10, 13);
    linhas.forEach((l, i) => G.texto(ctx, l, o.x + o.w / 2, o.y + o.h - 30 + i * 15 - (linhas.length - 1) * 6, { size: 13, align: 'center', color: '#111', weight: 900 }));
    G.texto(ctx, '▼ ABAIXE ▼', o.x + o.w / 2, o.y + o.h + 14, { size: 10, align: 'center', color: '#fff', stroke: '#000', lw: 3, weight: 900 });
  } },
  fantasma: { w: 40, h: 46, tipo: 'voa', vida: 1, vx: -60, alt: 95, draw(ctx, o, t) { G.Arte.fantasma(ctx, o.x + 20, o.y + 36, t + o.semente); } },
  caixa: { w: 52, h: 88, tipo: 'chao', draw(ctx, o, t) {
    ctx.fillStyle = '#8a95a5'; G.retRedondo(ctx, o.x, o.y, o.w, o.h, 5); ctx.fill();
    ctx.fillStyle = '#1b3a5a'; ctx.fillRect(o.x + 8, o.y + 10, o.w - 16, 24);
    G.texto(ctx, `${(Math.floor(t * 6 + o.semente * 48) % 48) + 1}/48`, o.x + o.w / 2, o.y + 27, { size: 12, align: 'center', color: '#7dff8a', weight: 900 });
    ctx.fillStyle = '#333'; ctx.fillRect(o.x + 10, o.y + 46, o.w - 20, 5);
    G.texto(ctx, 'R$ 2 MIL', o.x + o.w / 2, o.y + 70, { size: 9, align: 'center', color: '#fff', weight: 900 });
  } },
  coelho: { w: 44, h: 64, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#5a2e1a';
    ctx.beginPath(); ctx.ellipse(o.x + 22, o.y + 44, 20, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(o.x + 22, o.y + 18, 13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(o.x + 16, o.y + 2, 4, 13, -0.2, 0, Math.PI * 2); ctx.ellipse(o.x + 28, o.y + 2, 4, 13, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o.x + 18, o.y + 16, 2, 0, Math.PI * 2); ctx.arc(o.x + 27, o.y + 16, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b923'; ctx.fillRect(o.x + 6, o.y + 40, 32, 8);
    G.texto(ctx, '01', o.x + 22, o.y + 47, { size: 8, align: 'center', color: '#5a2e1a', weight: 900 });
  } },
  vitrine: { w: 96, h: 56, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#e8d0dc'; ctx.fillRect(o.x, o.y + 30, o.w, 26);
    ctx.fillStyle = 'rgba(200,235,255,0.7)'; ctx.fillRect(o.x + 4, o.y, o.w - 8, 32);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#4a2512'; ctx.beginPath(); ctx.arc(o.x + 18 + i * 20, o.y + 22, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(o.x + 4, o.y, o.w - 8, 32);
  } },
  carrinho: { w: 62, h: 50, tipo: 'chao', vx: -40, draw(ctx, o, t) {
    ctx.strokeStyle = '#999'; ctx.lineWidth = 3;
    ctx.strokeRect(o.x + 6, o.y + 4, 50, 30);
    for (let k = 14; k < 56; k += 10) { ctx.beginPath(); ctx.moveTo(o.x + k, o.y + 4); ctx.lineTo(o.x + k, o.y + 34); ctx.stroke(); }
    ctx.fillStyle = '#58b865'; ctx.fillRect(o.x + 10, o.y - 6, 40, 12);
    G.texto(ctx, 'R$', o.x + 30, o.y + 4, { size: 10, align: 'center', color: '#fff', weight: 900 });
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(o.x + 14, o.y + 44, 6, 0, Math.PI * 2); ctx.arc(o.x + 48, o.y + 44, 6, 0, Math.PI * 2); ctx.fill();
  } },
  arbusto: { w: 74, h: 42, tipo: 'chao', draw(ctx, o, t) {
    ctx.fillStyle = '#1f5a28';
    ctx.beginPath(); ctx.arc(o.x + 18, o.y + 26, 18, 0, Math.PI * 2); ctx.arc(o.x + 38, o.y + 18, 22, 0, Math.PI * 2); ctx.arc(o.x + 58, o.y + 26, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(o.x + 2, o.y + 26, o.w - 4, 16);
    if (o.queiroz === 'escondido') { // olhinhos espiando
      ctx.fillStyle = '#111'; G.retRedondo(ctx, o.x + 28, o.y + 14, 22, 7, 3); ctx.fill();
    }
  } },
  cerca: { w: 26, h: 56, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#d9c39a';
    ctx.beginPath(); ctx.moveTo(o.x, o.y + 8); ctx.lineTo(o.x + o.w / 2, o.y); ctx.lineTo(o.x + o.w, o.y + 8); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.lineTo(o.x, o.y + o.h); ctx.fill();
    ctx.strokeStyle = '#a88a5a'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y + 8, o.w, o.h - 8);
  } },
  gnomo: { w: 34, h: 46, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#2b5fd0'; ctx.fillRect(o.x + 6, o.y + 22, 22, 24);
    ctx.fillStyle = '#f1c4a2'; ctx.beginPath(); ctx.arc(o.x + 17, o.y + 18, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(o.x + 9, o.y + 20); ctx.lineTo(o.x + 17, o.y + 36); ctx.lineTo(o.x + 25, o.y + 20); ctx.fill();
    ctx.fillStyle = '#d11f2b'; ctx.beginPath(); ctx.moveTo(o.x + 7, o.y + 14); ctx.lineTo(o.x + 17, o.y - 6); ctx.lineTo(o.x + 27, o.y + 14); ctx.fill();
    // óculos escuros: até o gnomo tá disfarçado
    ctx.fillStyle = '#111'; ctx.fillRect(o.x + 10, o.y + 15, 14, 4);
  } },
  lancha: { w: 124, h: 56, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(o.x + 28, o.y + 48, 8, 0, Math.PI * 2); ctx.arc(o.x + 96, o.y + 48, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(o.x, o.y + 14); ctx.lineTo(o.x + o.w, o.y + 14); ctx.lineTo(o.x + o.w - 16, o.y + 42); ctx.lineTo(o.x + 10, o.y + 42); ctx.fill();
    ctx.fillStyle = '#1d4fa8'; ctx.fillRect(o.x + 8, o.y + 26, o.w - 20, 5);
    ctx.fillStyle = 'rgba(150,220,255,0.8)'; ctx.beginPath(); ctx.moveTo(o.x + 60, o.y + 14); ctx.lineTo(o.x + 74, o.y); ctx.lineTo(o.x + 90, o.y + 14); ctx.fill();
    G.texto(ctx, 'FINANCIADA', o.x + 60, o.y + 40, { size: 8, align: 'center', color: '#1d4fa8', weight: 900 });
  } },
  estatua: { w: 46, h: 92, tipo: 'chao', draw(ctx, o, t) {
    ctx.fillStyle = '#9a8a6a'; ctx.fillRect(o.x, o.y + 62, o.w, 30);
    G.texto(ctx, 'O PAI', o.x + o.w / 2, o.y + 82, { size: 10, align: 'center', color: '#fff', weight: 900 });
    ctx.save(); ctx.beginPath(); ctx.rect(o.x - 20, o.y - 30, o.w + 40, 92); ctx.clip();
    G.Arte.boneco(ctx, 'jair', o.x + o.w / 2, o.y + 82, { t: 0, esc: 0.75, semSombra: true, cor: { pele: '#e2b43a', terno: '#c99a1e', calca: '#c99a1e', camisa: '#e2b43a', gravata: '#b0861a' } });
    ctx.restore();
  } },
  mordomo: { w: 34, h: 84, tipo: 'anda', vida: 2, vx: -70, draw(ctx, o, t) {
    G.Arte.boneco(ctx, 'mordomo', o.x + 17, o.y + o.h, { t: t * 0.7, pose: 'corre', dir: -1, segura: 'boleto' });
  } },
  mala: { w: 46, h: 38, tipo: 'chao', draw(ctx, o, t) { G.Arte.item(ctx, 'mala', o.x + 23, o.y + 22, 0, 1.25); } },
  esteira: { w: 170, h: 28, tipo: 'chao', draw(ctx, o, t) {
    ctx.fillStyle = '#555'; ctx.fillRect(o.x, o.y + 8, o.w, 20);
    ctx.fillStyle = '#222'; ctx.fillRect(o.x, o.y, o.w, 10);
    ctx.fillStyle = '#888';
    for (let k = (t * 60) % 20; k < o.w; k += 20) ctx.fillRect(o.x + k, o.y + 2, 3, 6);
    G.Arte.item(ctx, 'mala', o.x + 40 + ((t * 30) % 100), o.y - 10, 0, 0.8);
  } },
  cone: { w: 32, h: 38, tipo: 'chao', draw(ctx, o) {
    ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.moveTo(o.x + 16, o.y); ctx.lineTo(o.x + 30, o.y + 34); ctx.lineTo(o.x + 2, o.y + 34); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(o.x + 9, o.y + 14, 14, 5);
    ctx.fillStyle = '#d9581a'; ctx.fillRect(o.x - 2, o.y + 32, 36, 6);
  } },
  drone: { w: 60, h: 30, tipo: 'voa', vida: 2, vx: -90, alt: 85, draw(ctx, o, t) { G.Arte.drone(ctx, o.x + 30, o.y + 10, t + o.semente); } },
  buraco: { w: 110, h: 0, tipo: 'buraco' },
  piscina: { w: 150, h: 0, tipo: 'buraco', agua: true },
};

// o mordomo da mansão (um boneco a mais)
G.Arte.TIPOS.mordomo = { pele: '#e0b090', terno: '#111', calca: '#111', gravata: '#fff', camisa: '#fff', sapato: '#000' };
