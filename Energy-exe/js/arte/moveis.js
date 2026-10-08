// ============================================================
//  PISOS e MÓVEIS em pixel art
//  F.Pisos[tipo](ctx, x, y, rnd)        um quadradinho de chão
//  F.Moveis[tipo](ctx, x, y, w, h, m)   desenho fixo (feito uma vez)
//  F.MoveisAnim[tipo](ctx, x, y, w, h, m, t)  partes que se mexem
// ============================================================
(function () {
  const T = F.T;
  const tom = (c, k) => F.Arte.tom(c, k);
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  // ---------------- PISOS ----------------
  const carpete = (base) => (ctx, x, y, rnd) => {
    R(ctx, x, y, T, T, base);
    ctx.fillStyle = tom(base, -0.07);
    for (let i = 0; i < 6; i++) ctx.fillRect(x + Math.floor(rnd() * T), y + Math.floor(rnd() * T), 1, 1);
    ctx.fillStyle = tom(base, 0.06);
    for (let i = 0; i < 4; i++) ctx.fillRect(x + Math.floor(rnd() * T), y + Math.floor(rnd() * T), 1, 1);
    if ((x / T + y / T) % 2 === 0) { ctx.fillStyle = tom(base, -0.03); ctx.fillRect(x, y, T, T); }
  };
  F.Pisos = {
    concreto(ctx, x, y, rnd) {
      R(ctx, x, y, T, T, '#8d9299');
      R(ctx, x, y, T, 1, '#80858c'); R(ctx, x, y, 1, T, '#80858c');
      if (rnd() < 0.18) R(ctx, x + rnd() * 20, y + rnd() * 20, 6 + rnd() * 8, 3 + rnd() * 4, 'rgba(60,60,70,0.12)');
      for (let i = 0; i < 5; i++) R(ctx, x + rnd() * T, y + rnd() * T, 1, 1, '#9da2a9');
    },
    granito(ctx, x, y, rnd) {
      R(ctx, x, y, T, T, '#bdb7ab');
      for (let i = 0; i < 14; i++) R(ctx, x + rnd() * T, y + rnd() * T, 1, 1, rnd() < 0.5 ? '#a49d90' : '#d1ccc2');
      R(ctx, x, y, T, 1, '#aaa497'); R(ctx, x, y, 1, T, '#aaa497');
    },
    claro(ctx, x, y, rnd) {
      R(ctx, x, y, T, T, '#d9d5cb');
      R(ctx, x, y, T, 1, '#c9c4b8'); R(ctx, x, y, 1, T, '#c9c4b8');
      if (rnd() < 0.3) R(ctx, x + 4 + rnd() * 20, y + 4 + rnd() * 20, 2, 1, '#cfcabe');
    },
    ceramica(ctx, x, y) {
      const a = ((x / T + y / T) % 2) === 0;
      R(ctx, x, y, T, T, a ? '#e6e1d4' : '#cbd6d8');
      R(ctx, x, y, T, 1, '#b9b4a8'); R(ctx, x, y, 1, T, '#b9b4a8');
    },
    madeira(ctx, x, y, rnd) {
      for (let i = 0; i < 4; i++) {
        const c = ['#8a5a36', '#7f5232', '#94623c', '#865734'][Math.floor(rnd() * 4)];
        R(ctx, x, y + i * 8, T, 8, c);
        R(ctx, x, y + i * 8 + 7, T, 1, '#5e3b22');
        R(ctx, x + Math.floor(rnd() * T), y + i * 8, 1, 7, '#6d462a');
      }
    },
    madeiraClara(ctx, x, y, rnd) {
      for (let i = 0; i < 4; i++) {
        const c = ['#c79f72', '#bf966a', '#cfa87c'][Math.floor(rnd() * 3)];
        R(ctx, x, y + i * 8, T, 8, c);
        R(ctx, x, y + i * 8 + 7, T, 1, '#a07a50');
      }
    },
    marmore(ctx, x, y, rnd) {
      R(ctx, x, y, T, T, '#ecebe7');
      ctx.strokeStyle = 'rgba(150,150,160,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + rnd() * T, y); ctx.lineTo(x + rnd() * T, y + T); ctx.stroke();
      R(ctx, x, y, T, 1, '#d6d4ce'); R(ctx, x, y, 1, T, '#d6d4ce');
    },
    carpeteCinza: carpete('#6e7684'),
    carpeteCinza2: carpete('#7a7f8e'),
    carpeteVerde: carpete('#5f806b'),
    carpeteAzul: carpete('#56698c'),
    carpeteRoxo: carpete('#71638c'),
    carpeteLaranja: carpete('#9a7356'),
    carpeteBege: carpete('#a8987a'),
    carpeteVinho: carpete('#7d4a55'),
  };

  // ---------------- MÓVEIS ----------------
  const monitor = (ctx, x, y, cor = '#3b78d8') => {
    R(ctx, x, y, 12, 9, '#22252c'); R(ctx, x + 1, y + 1, 10, 7, cor);
    R(ctx, x + 2, y + 2, 5, 1, 'rgba(255,255,255,0.5)'); R(ctx, x + 2, y + 4, 7, 1, 'rgba(255,255,255,0.3)');
    R(ctx, x + 5, y + 9, 2, 2, '#22252c'); R(ctx, x + 3, y + 11, 6, 1, '#22252c');
  };
  const tampo = (ctx, x, y, w, h, c = '#b98d5f') => {
    R(ctx, x + 1, y + 4, w - 2, h - 6, c);
    R(ctx, x + 1, y + h - 4, w - 2, 3, tom(c, -0.3));
    R(ctx, x + 1, y + 4, w - 2, 1, tom(c, 0.2));
    R(ctx, x + 2, y + h - 1, w - 4, 1, 'rgba(0,0,0,0.25)');
  };
  const sombra = (ctx, x, y, w, h) => R(ctx, x + 2, y + h - 2, w - 2, 3, 'rgba(0,0,0,0.18)');

  F.Moveis = {
    mesa(ctx, x, y, w, h, m) {
      sombra(ctx, x, y, w, h);
      tampo(ctx, x, y, w, h, m.cor || '#b98d5f');
      const n = Math.max(1, Math.round(w / 64));
      for (let i = 0; i < n; i++) {
        const cx = x + (i + 0.5) * (w / n);
        if (m.duplo) { monitor(ctx, cx - 13, y - 4, m.tela); monitor(ctx, cx + 1, y - 4, '#2fa36b'); }
        else monitor(ctx, cx - 6, y - 4, m.tela || ['#3b78d8', '#2f8f9c', '#4a64c8'][i % 3]);
        R(ctx, cx - 8, y + 12, 16, 3, '#30343c'); R(ctx, cx - 7, y + 13, 14, 1, '#4a4f5a');
        if (i % 2 === 0) { R(ctx, cx + 11, y + 10, 5, 5, '#f2efe8'); R(ctx, cx + 12, y + 10, 3, 1, '#5a321a'); }
        else { R(ctx, cx - 16, y + 9, 7, 5, '#fff'); R(ctx, cx - 15, y + 10, 5, 1, '#aaa'); }
      }
      if (m.placa) { R(ctx, x + w - 22, y + 2, 20, 9, '#fff3a0'); R(ctx, x + w - 20, y + 5, 16, 1, '#a08a20'); R(ctx, x + w - 20, y + 7, 10, 1, '#a08a20'); }
    },
    mesaChefe(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      tampo(ctx, x, y, w, h, '#6d3f22');
      monitor(ctx, x + w / 2 - 6, y - 4, '#3b78d8');
      R(ctx, x + 8, y + 10, 10, 6, '#e9e2cf'); R(ctx, x + w - 18, y + 8, 6, 8, '#2a2a2a'); R(ctx, x + w - 17, y + 9, 4, 6, '#d9a11d');
    },
    mesaReuniao(ctx, x, y, w, h, m) {
      R(ctx, x + 2, y + 2, w - 4, h - 4, 'rgba(0,0,0,0.18)');
      const c = m.cor || '#7b4a2b';
      R(ctx, x + 6, y + 6, w - 12, h - 14, c);
      R(ctx, x + 6, y + h - 8, w - 12, 3, tom(c, -0.3));
      R(ctx, x + 8, y + 8, w - 16, 1, tom(c, 0.25));
      // cadeiras em volta
      for (let cx = x + 14; cx < x + w - 10; cx += 28) {
        R(ctx, cx - 6, y - 2, 12, 7, '#2d3038'); R(ctx, cx - 6, y + h - 6, 12, 7, '#2d3038');
        R(ctx, cx - 3, y + 10, 8, 6, '#fafafa'); R(ctx, cx - 2, y + 11, 6, 1, '#bbb');
      }
      R(ctx, x + w / 2 - 6, y + h / 2 - 6, 12, 8, '#2b2f3a'); R(ctx, x + w / 2 - 4, y + h / 2 - 4, 8, 3, '#60c9ff');
    },
    esteira(ctx, x, y, w, h) {
      R(ctx, x, y + h - 4, w, 4, 'rgba(0,0,0,0.2)');
      R(ctx, x, y + 4, w, h - 8, '#4b5059');
      R(ctx, x, y + 4, w, 3, '#e3b52c'); R(ctx, x, y + h - 7, w, 3, '#e3b52c');
      for (let i = 0; i < w; i += 8) { R(ctx, x + i, y + 4, 4, 3, '#2b2b2b'); R(ctx, x + i + 4, y + h - 7, 4, 3, '#2b2b2b'); }
      for (let i = 0; i < w; i += 64) { R(ctx, x + i + 2, y + h - 4, 4, 4, '#2c2f36'); }
    },
    bancada(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      tampo(ctx, x, y, w, h, '#8c96a3');
      R(ctx, x + 6, y + 8, 10, 4, '#d43c2f'); R(ctx, x + 18, y + 7, 3, 7, '#f2c230'); R(ctx, x + 24, y + 9, 12, 2, '#555');
      R(ctx, x + w - 26, y + 6, 18, 10, '#2c313a'); R(ctx, x + w - 24, y + 8, 14, 5, '#3fe08a');
      R(ctx, x + w - 23, y + 10, 12, 1, '#1d7a46');
    },
    painel(ctx, x, y, w, h, m) {
      sombra(ctx, x, y, w, h);
      const n = Math.max(1, Math.round(w / 32));
      for (let i = 0; i < n; i++) {
        const px = x + i * (w / n) + 1, pw = w / n - 2;
        R(ctx, px, y - 10, pw, h + 8, '#d4d8de');
        R(ctx, px, y - 10, pw, 2, '#eef0f3');
        R(ctx, px + pw - 3, y - 10, 3, h + 8, '#b5bac2');
        R(ctx, px + pw / 2 - 1, y - 6, 1, h, '#9aa0a8');
        R(ctx, px + pw / 2 - 5, y + h / 2 - 8, 3, 6, '#7d838c');
        // plaquinha de "perigo"
        ctx.fillStyle = '#f2c230'; ctx.beginPath(); ctx.moveTo(px + 6, y + 2); ctx.lineTo(px + 11, y - 6); ctx.lineTo(px + 16, y + 2); ctx.fill();
        R(ctx, px + 10, y - 3, 2, 3, '#222');
      }
      if (m.numero) { R(ctx, x + 4, y + h - 12, 24, 8, '#fff'); ctx.fillStyle = '#c22'; ctx.font = 'bold 7px monospace'; ctx.fillText(m.numero, x + 6, y + h - 6); }
    },
    prateleira(ctx, x, y, w, h, m) {
      sombra(ctx, x, y, w, h);
      R(ctx, x, y - 14, w, h + 12, '#3d5a8a');
      R(ctx, x + 2, y - 12, w - 4, h + 8, '#2a3c5c');
      const rnd = F.u.semente(x * 7 + y);
      for (let row = 0; row < 2; row++) {
        R(ctx, x + 2, y - 12 + row * 14 + 12, w - 4, 2, '#e07b2a');
        for (let bx = x + 4; bx < x + w - 10; bx += 10 + Math.floor(rnd() * 4)) {
          const bh = 7 + Math.floor(rnd() * 4);
          R(ctx, bx, y - 12 + row * 14 + 12 - bh, 9, bh, rnd() < 0.5 ? '#c49a63' : '#b38854');
          R(ctx, bx + 2, y - 12 + row * 14 + 12 - bh + 2, 4, 2, '#fff');
        }
      }
      if (m.rotulo) { R(ctx, x + w - 30, y - 18, 28, 7, '#fff'); R(ctx, x + w - 28, y - 16, 20, 1, '#333'); R(ctx, x + w - 28, y - 14, 12, 1, '#333'); }
    },
    palete(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 2, y + h - 8, w - 4, 6, '#a77b45');
      for (let i = x + 4; i < x + w - 4; i += 10) R(ctx, i, y + h - 8, 4, 6, '#8a6234');
      R(ctx, x + 4, y - 6, w - 8, h - 6, '#c49a63');
      R(ctx, x + 4, y - 6, w - 8, h - 6, 'rgba(220,235,255,0.35)');
      R(ctx, x + 4, y + 4, w - 8, 2, '#a07a48'); R(ctx, x + w / 2 - 1, y - 6, 2, h - 6, '#a07a48');
      R(ctx, x + 8, y - 2, 12, 6, '#fff'); R(ctx, x + 9, y, 8, 1, '#444');
    },
    caminhao(ctx, x, y, w, h) {
      R(ctx, x + 4, y + h - 6, w - 4, 8, 'rgba(0,0,0,0.25)');
      R(ctx, x + 4, y - 6, w - 4, h - 4, '#eef0f2');
      R(ctx, x + 4, y - 6, w - 4, 3, '#ffffff');
      R(ctx, x + 4, y + h - 12, w - 4, 4, '#b8bcc2');
      for (let i = x + 10; i < x + w; i += 14) R(ctx, i, y - 2, 1, h - 12, '#d6d9dd');
      // logo na lateral: um raio
      ctx.fillStyle = '#1a5fd0'; ctx.fillRect(x + 20, y + 18, 60, 22);
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x + 44, y + 20); ctx.lineTo(x + 34, y + 31); ctx.lineTo(x + 42, y + 31); ctx.lineTo(x + 38, y + 39); ctx.lineTo(x + 50, y + 27); ctx.lineTo(x + 42, y + 27); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.fillText('VOLTAGEM', x + 52, y + 32);
      R(ctx, x + 14, y + h - 6, 14, 8, '#1d1d1f'); R(ctx, x + w - 34, y + h - 6, 14, 8, '#1d1d1f');
      R(ctx, x + 18, y + h - 3, 6, 3, '#555'); R(ctx, x + w - 30, y + h - 3, 6, 3, '#555');
      R(ctx, x, y + 6, 6, h - 18, '#5b5f66');
    },
    empilhadeira(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 6, y - 6, w - 16, h, '#f2c230'); R(ctx, x + 6, y - 6, w - 16, 3, '#ffe27a');
      R(ctx, x + 10, y - 14, 3, 12, '#333'); R(ctx, x + w - 16, y - 14, 3, 12, '#333'); R(ctx, x + 10, y - 14, w - 23, 2, '#333');
      R(ctx, x + w - 10, y - 10, 3, h + 6, '#555'); R(ctx, x + w - 10, y + h - 6, 10, 3, '#888');
      R(ctx, x + 8, y + h - 6, 8, 6, '#1d1d1f'); R(ctx, x + w - 22, y + h - 6, 8, 6, '#1d1d1f');
    },
    etiquetadora(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h); tampo(ctx, x, y, w, h, '#9aa3ad');
      R(ctx, x + 10, y, 22, 14, '#e9ecef'); R(ctx, x + 12, y + 2, 10, 5, '#2b2f36'); R(ctx, x + 13, y + 3, 8, 3, '#8de0a6');
      R(ctx, x + 26, y + 10, 10, 6, '#fff'); R(ctx, x + 27, y + 12, 8, 1, '#444');
    },
    elevador(ctx, x, y, w, h) {
      R(ctx, x, y, w, h, '#9aa1aa');
      R(ctx, x + 4, y + 6, w / 2 - 5, h - 6, '#c3c9d1'); R(ctx, x + w / 2 + 1, y + 6, w / 2 - 5, h - 6, '#c3c9d1');
      R(ctx, x + w / 2 - 1, y + 6, 2, h - 6, '#6d737c');
      R(ctx, x + 4, y + 6, 2, h - 6, '#e6e9ed'); R(ctx, x + w / 2 + 1, y + 6, 2, h - 6, '#e6e9ed');
      R(ctx, x + w / 2 - 8, y + 1, 16, 4, '#1f2229');
    },
    catraca(ctx, x, y, w, h) {
      for (let i = 0; i < w; i += 32) {
        R(ctx, x + i + 8, y + 2, 16, h - 4, '#5b616b'); R(ctx, x + i + 8, y + 2, 16, 3, '#7c838e');
        R(ctx, x + i + 22, y + 10, 10, 2, '#c3c9d1');
      }
    },
    balcao(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x, y + 2, w, h - 2, '#7a5236'); R(ctx, x, y + 2, w, 4, '#c9a477');
      R(ctx, x, y + h - 4, w, 2, '#5a3a24');
      R(ctx, x + 10, y - 2, 10, 6, '#2a2f38'); R(ctx, x + 11, y - 1, 8, 3, '#62a8ff');
      R(ctx, x + w - 24, y + 3, 14, 2, '#ffd23f');
    },
    sofa(ctx, x, y, w, h, m) {
      const c = m.cor || '#3e5c8a';
      sombra(ctx, x, y, w, h);
      R(ctx, x + 2, y - 4, w - 4, 10, tom(c, -0.15));
      R(ctx, x + 2, y + 4, w - 4, h - 8, c);
      R(ctx, x, y, 6, h - 4, tom(c, -0.25)); R(ctx, x + w - 6, y, 6, h - 4, tom(c, -0.25));
      for (let i = x + w / 3; i < x + w - 8; i += w / 3) R(ctx, i, y + 5, 1, h - 10, tom(c, -0.3));
    },
    planta(ctx, x, y, w, h) {
      R(ctx, x + 9, y + 18, 14, 4, 'rgba(0,0,0,0.2)');
      R(ctx, x + 10, y + 12, 12, 9, '#b8643a'); R(ctx, x + 10, y + 12, 12, 2, '#d47e4f');
      const f = [[4, -6], [9, -12], [14, -14], [19, -11], [24, -6], [7, 1], [21, 1], [14, -4]];
      f.forEach(([a, b], i) => R(ctx, x + a, y + b + 6, 7, 7, i % 2 ? '#3d8f4f' : '#2f7a42'));
      R(ctx, x + 13, y - 6, 3, 3, '#5fb36d');
    },
    quadro(ctx, x, y, w, h, m) {
      R(ctx, x + 2, y - 12, w - 4, h + 6, '#8a8f97');
      R(ctx, x + 4, y - 10, w - 8, h + 2, '#f7f7f4');
      const rnd = F.u.semente(x + y * 3);
      const cores = m.notas || ['#fff38a', '#ffb3c7', '#a7e3ff', '#b7f0a5'];
      for (let i = 0; i < Math.floor(w / 12); i++) {
        R(ctx, x + 6 + i * 11, y - 7 + (i % 2) * 8, 8, 7, cores[Math.floor(rnd() * cores.length)]);
      }
      if (m.grafico) {
        ctx.strokeStyle = '#d33'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(x + w - 40, y - 2); ctx.lineTo(x + w - 30, y - 6); ctx.lineTo(x + w - 20, y + 2); ctx.lineTo(x + w - 10, y - 8); ctx.stroke();
      }
    },
    avisos(ctx, x, y, w, h) {
      R(ctx, x + 2, y - 12, w - 4, h + 6, '#a8743f'); R(ctx, x + 4, y - 10, w - 8, h + 2, '#c99a62');
      [['#fff', 6, -8], ['#fff38a', 18, -6], ['#fff', 30, -9], ['#ffb3c7', 42, -5]].forEach(([c, a, b]) => { if (a < w - 10) { R(ctx, x + a, y + b, 10, 12, c); R(ctx, x + a + 4, y + b, 2, 2, '#d22'); } });
    },
    cafe(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 5, y - 14, 22, h + 12, '#2b2d33'); R(ctx, x + 5, y - 14, 22, 3, '#444851');
      R(ctx, x + 9, y - 10, 14, 6, '#4c3b2f'); R(ctx, x + 10, y - 9, 6, 2, '#e8d8b8');
      R(ctx, x + 11, y + 2, 10, 8, '#16171b'); R(ctx, x + 13, y + 5, 6, 5, '#f4f1ea');
      R(ctx, x + 22, y - 2, 3, 3, '#e33');
    },
    bebedouro(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 9, y - 2, 14, h, '#e6e9ed'); R(ctx, x + 10, y - 14, 12, 13, 'rgba(120,190,255,0.75)'); R(ctx, x + 11, y - 13, 3, 10, 'rgba(255,255,255,0.6)');
      R(ctx, x + 12, y + 6, 8, 2, '#5aa0e6');
    },
    geladeira(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 3, y - 16, w - 6, h + 14, '#eef0f2'); R(ctx, x + 3, y - 4, w - 6, 1, '#b5bac2'); R(ctx, x + w - 8, y - 12, 2, 6, '#9aa0a8'); R(ctx, x + w - 8, y, 2, 8, '#9aa0a8');
      R(ctx, x + 7, y - 12, 6, 6, '#fff38a'); R(ctx, x + 8, y + 2, 7, 5, '#ffb3c7');
    },
    balcaoCopa(ctx, x, y, w, h) {
      R(ctx, x, y - 4, w, h + 2, '#d7d1c4'); R(ctx, x, y - 4, w, 3, '#efebe2'); R(ctx, x, y + h - 4, w, 2, '#b3ad9f');
      R(ctx, x + w - 46, y - 8, 22, 12, '#2d2f35'); R(ctx, x + w - 44, y - 6, 12, 7, '#555a64'); R(ctx, x + w - 30, y - 6, 4, 2, '#3f3');
    },
    mesaCopa(ctx, x, y, w, h) {
      R(ctx, x + 6, y + h - 8, w - 12, 6, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = '#e7e1d2'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 - 2, w / 2 - 6, h / 2 - 8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#c9c1ae'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + 2, w / 2 - 6, h / 2 - 8, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#e7e1d2'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 - 1, w / 2 - 6, h / 2 - 9, 0, 0, 7); ctx.fill();
      R(ctx, x + w / 2 - 10, y + h / 2 - 6, 6, 5, '#fff'); R(ctx, x + w / 2 + 4, y + h / 2 - 3, 6, 5, '#ffd8a0');
    },
    bandeja(ctx, x, y, w, h) {
      R(ctx, x, y - 2, w, h, '#d7d1c4'); R(ctx, x, y - 2, w, 3, '#efebe2');
      R(ctx, x + 6, y + 2, w - 12, 14, '#c8ccd2'); R(ctx, x + 7, y + 3, w - 14, 12, '#dfe2e6');
    },
    impressora(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h); tampo(ctx, x, y, w, h, '#a9b0b9');
      R(ctx, x + 10, y - 6, w - 20, 18, '#eceef1'); R(ctx, x + 10, y - 6, w - 20, 3, '#fff');
      R(ctx, x + 16, y + 6, w - 32, 4, '#2b2f36'); R(ctx, x + 18, y - 10, w - 36, 5, '#fff');
    },
    arquivo(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      for (let i = 0; i < w; i += 32) {
        R(ctx, x + i + 2, y - 12, 28, h + 10, '#8e959e'); R(ctx, x + i + 2, y - 12, 28, 2, '#aab1ba');
        for (let k = 0; k < 3; k++) { R(ctx, x + i + 4, y - 9 + k * 10, 24, 8, '#a1a8b1'); R(ctx, x + i + 13, y - 6 + k * 10, 6, 2, '#5d636b'); }
      }
    },
    pastas(ctx, x, y, w, h) {
      R(ctx, x, y - 14, w, h + 12, '#6b4a33');
      const cores = ['#c0392b', '#2f6fd0', '#2f9a52', '#e2a21c', '#7b4cc2', '#ececec'];
      for (let i = x + 3; i < x + w - 5; i += 6) { R(ctx, i, y - 12, 5, 11, cores[(i / 6 | 0) % cores.length]); R(ctx, i + 1, y - 9, 3, 2, '#fff'); }
      for (let i = x + 3; i < x + w - 5; i += 6) R(ctx, i, y + 1, 5, h - 4, cores[((i / 6 | 0) + 2) % cores.length]);
    },
    rack(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 2, y - 18, w - 4, h + 16, '#1d1f25'); R(ctx, x + 2, y - 18, w - 4, 2, '#3a3d46');
      for (let k = y - 14; k < y + h - 6; k += 6) R(ctx, x + 5, k, w - 10, 4, '#2c2f37');
    },
    plotter(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 2, y - 2, w - 4, 14, '#cfd3d8'); R(ctx, x + 2, y - 2, w - 4, 3, '#e9ebee');
      R(ctx, x + 8, y + 12, 4, h - 12, '#555'); R(ctx, x + w - 12, y + 12, 4, h - 12, '#555');
      R(ctx, x + 10, y + 8, w - 20, 10, '#fff'); R(ctx, x + 14, y + 11, w - 40, 1, '#3b78d8'); R(ctx, x + 14, y + 14, w - 60, 1, '#3b78d8');
    },
    maquete(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h); tampo(ctx, x, y, w, h, '#9aa3ad');
      R(ctx, x + 14, y - 10, 30, 22, '#dfe3e8'); R(ctx, x + 14, y - 10, 30, 3, '#f4f5f7');
      R(ctx, x + 18, y - 4, 4, 4, '#3f3'); R(ctx, x + 24, y - 4, 4, 4, '#f33'); R(ctx, x + 30, y - 4, 10, 2, '#555');
      R(ctx, x + 50, y + 4, 26, 3, '#e07b2a'); R(ctx, x + 50, y + 9, 20, 3, '#2f6fd0');
    },
    tela(ctx, x, y, w, h, m) {
      R(ctx, x + 2, y - 14, w - 4, h + 6, '#22252c');
      R(ctx, x + 4, y - 12, w - 8, h + 2, m.fundo || '#244a7a');
      if (m.status) {
        ctx.fillStyle = '#2fd16b'; ctx.fillRect(x + 8, y - 8, 14, 10);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace'; ctx.fillText('STATUS: VERDE', x + 26, y - 1);
      }
    },
    trofeus(ctx, x, y, w, h) {
      R(ctx, x, y - 12, w, h + 10, '#4a3626'); R(ctx, x + 2, y - 2, w - 4, 2, '#6b4e37');
      for (let i = x + 6; i < x + w - 8; i += 14) {
        R(ctx, i, y - 10, 8, 6, '#e0b23a'); R(ctx, i + 3, y - 4, 2, 2, '#c49522'); R(ctx, i + 1, y - 2, 6, 2, '#8a6a2a');
      }
    },
    aquario(ctx, x, y, w, h) {
      sombra(ctx, x, y, w, h);
      R(ctx, x + 2, y + h - 10, w - 4, 8, '#3a2a20');
      R(ctx, x + 2, y - 10, w - 4, h, 'rgba(70,160,220,0.75)'); R(ctx, x + 2, y - 10, w - 4, 3, 'rgba(255,255,255,0.5)');
      R(ctx, x + 6, y + h - 16, 8, 6, '#3d8f4f'); R(ctx, x + w - 16, y + h - 18, 6, 8, '#2f7a42');
    },
    lixeira(ctx, x, y) { R(ctx, x + 11, y + 6, 10, 14, '#4a7a4f'); R(ctx, x + 10, y + 5, 12, 2, '#5f9a65'); },
    tapete(ctx, x, y, w, h, m) {
      R(ctx, x + 2, y + 2, w - 4, h - 4, m.cor || '#8a2d34');
      ctx.strokeStyle = 'rgba(255,220,140,0.6)'; ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);
      if (m.texto) { ctx.fillStyle = '#ffe9b0'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillText(m.texto, x + w / 2, y + h / 2 + 3); ctx.textAlign = 'left'; }
    },
    portaRH(ctx, x, y, w, h) {
      R(ctx, x, y, w, h, '#8a5a36'); R(ctx, x + 2, y + 2, w - 4, h - 2, '#a0703f');
      R(ctx, x + w - 10, y + 12, 3, 3, '#e0b23a');
      R(ctx, x + 6, y + 4, w - 12, 8, '#fff'); ctx.fillStyle = '#333'; ctx.font = 'bold 7px monospace'; ctx.fillText('RH', x + w / 2 - 5, y + 10);
    },
    vazio() {},
  };

  // ---------------- PARTES ANIMADAS ----------------
  F.MoveisAnim = {
    esteira(ctx, x, y, w, h, m, t) {
      if (m.parada) {
        if (Math.floor(t * 2) % 2) { R(ctx, x + w - 10, y - 4, 6, 6, '#e33'); }
        return;
      }
      const off = Math.floor(t * 24) % 16;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y + 7, w, h - 14); ctx.clip();
      for (let i = -16; i < w + 16; i += 16) R(ctx, x + i + off, y + 7, 2, h - 14, '#5d636d');
      // painéis passando na esteira
      const pos = (t * 24) % 96;
      for (let i = -96; i < w; i += 96) { R(ctx, x + i + pos, y + 8, 22, h - 16, '#cfd4da'); R(ctx, x + i + pos + 2, y + 9, 4, 3, '#3f3'); }
      ctx.restore();
      R(ctx, x + w - 10, y - 4, 6, 6, '#3f3');
    },
    painel(ctx, x, y, w, h, m, t) {
      const n = Math.max(1, Math.round(w / 32));
      for (let i = 0; i < n; i++) {
        const px = x + i * (w / n) + 1;
        const falha = m.numero && Math.floor(t * 3) % 2;
        R(ctx, px + 4, y + 6, 3, 3, falha ? '#ff3b3b' : (Math.floor(t * 1.3 + i) % 3 ? '#3f3' : '#1a7a1a'));
        R(ctx, px + 9, y + 6, 3, 3, m.numero ? (falha ? '#400' : '#ff3b3b') : '#e8c020');
      }
    },
    rack(ctx, x, y, w, h, m, t) {
      for (let k = y - 14, i = 0; k < y + h - 6; k += 6, i++) {
        R(ctx, x + w - 10, k + 1, 2, 2, Math.floor(t * 6 + i * 1.7) % 3 ? '#3f3' : '#0a3');
        R(ctx, x + w - 14, k + 1, 2, 2, Math.floor(t * 4 + i) % 4 ? '#3af' : '#036');
      }
    },
    cafe(ctx, x, y, w, h, m, t) {
      const k = Math.floor(t * 3) % 3;
      R(ctx, x + 15 + k, y - 1 - k * 2, 1, 2, 'rgba(255,255,255,0.6)');
    },
    bandeja(ctx, x, y, w, h, m) {
      const n = F.S ? F.S.paes : 8;
      for (let i = 0; i < n; i++) {
        const px = x + 9 + (i % 4) * 11, py = y + 4 + Math.floor(i / 4) * 6;
        ctx.fillStyle = '#e8b04a'; ctx.beginPath(); ctx.arc(px + 3, py + 3, 3.2, 0, 7); ctx.fill();
        R(ctx, px + 1, py + 1, 2, 1, '#ffe08a');
      }
    },
    impressora(ctx, x, y, w, h, m, t) {
      const travada = F.S && F.S.flags && F.S.flags.impressoraTravada;
      R(ctx, x + w - 16, y - 3, 3, 3, travada ? (Math.floor(t * 4) % 2 ? '#f33' : '#600') : '#3f3');
    },
    mesa(ctx, x, y, w, h, m, t) {
      if (m.id !== 'mesa-jogador' || !F.S) return;
      // a pilha de documentos da burocracia cresce na sua mesa
      const docs = Math.min(F.S.docs || 0, 30);
      for (let i = 0; i < docs; i++) R(ctx, x + w - 20 + (i % 2), y + 10 - i * 1.4, 14, 2, i % 3 ? '#f7f7f4' : '#e8e4d8');
    },
    tela(ctx, x, y, w, h, m, t) {
      if (m.status) return;
      R(ctx, x + 8 + (Math.floor(t * 2) % 3) * 6, y - 6, 4, 4, '#ffd23f');
    },
  };
})();
