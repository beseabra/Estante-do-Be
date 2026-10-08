// ============================================================
//  TELA DE TÍTULO: uma área de trabalho dos anos 90
// ============================================================
F.Titulo = {
  mostrar() {
    F.Jogo.cena = 'titulo';
    F.UI.fecharTudo();
    F.UI.mostrarBarra(false);
    document.getElementById('rastreio').innerHTML = '';
    document.getElementById('prompt').hidden = true;
    document.body.classList.add('desktop');
    const fimEl = document.getElementById('fim'); if (fimEl) fimEl.hidden = true;
    let d = document.getElementById('desktop');
    if (!d) { d = F.u.el('div', ''); d.id = 'desktop'; document.body.appendChild(d); }
    d.hidden = false;
    d.innerHTML = '';
    const save = F.Estado.carregar();
    const icones = [
      ['exe', 'Energy.exe', () => this.abrirJogo()],
      save ? ['sav', 'Continuar.sav', () => this.continuar()] : null,
      ['txt', 'Leia-me.txt', () => this.leiaMe()],
      ['txt', 'Finais.txt', () => this.finais()],
      ['xls', 'Planilha_final_v3_AGORA_VAI.xlsx', () => F.UI.resultado({ titulo: 'Excel Corporativo', icone: '📊', texto: 'Este arquivo está sendo usado por outra pessoa: Marcos.\n\nDeseja abrir uma cópia somente leitura? (Não.)', botao: 'OK' })],
      ['lixo', 'Lixeira', () => F.UI.resultado({ titulo: 'Lixeira', icone: '🗑', texto: 'Itens na lixeira:\n• motivacao.doc\n• plano_de_carreira_2019.pdf\n• ferias_aprovadas.png (corrompido)', botao: 'Fechar' })],
    ].filter(Boolean);
    icones.forEach(([tipo, nome, fn]) => {
      const b = F.u.el('button', 'icone');
      b.appendChild(this.icone(tipo));
      b.appendChild(F.u.el('span', '', F.u.esc(nome)));
      let ult = 0;
      b.addEventListener('click', () => {
        F.Som.init();
        d.querySelectorAll('.icone').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        const agora = performance.now();
        if (F.Input.celular || agora - ult < 450) { F.Som.clique(); fn(); }
        ult = agora;
      });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter') fn(); });
      d.appendChild(b);
    });
    d.appendChild(F.u.el('div', 'marca', `Energy<span class="raio">.exe</span><small>Simulador de vida corporativa · Voltagem S.A.<br>${F.Input.celular ? 'toque' : 'clique duas vezes'} em Energy.exe para começar</small>`));
    // barra de tarefas da área de trabalho
    const barra = F.u.el('div', '', `<button class="btn iniciar"><span class="raio">⚡</span><span class="txt">Iniciar</span></button><div class="afundado barra-local"><span>Energy.exe</span></div><div class="afundado bandeja"><div class="relogio" id="relogio-real"></div></div>`);
    barra.id = 'barra-desktop';
    barra.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:var(--barra);display:flex;align-items:center;gap:6px;padding:3px 4px;background:var(--cinza);border-top:2px solid #fff;z-index:2';
    barra.querySelector('.iniciar').addEventListener('click', () => this.abrirJogo());
    d.appendChild(barra);
    const rel = () => { const el = document.getElementById('relogio-real'); if (!el) return; const t = new Date(); el.textContent = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'); };
    rel(); clearInterval(this._rel); this._rel = setInterval(rel, 10000);
  },

  esconder() { const d = document.getElementById('desktop'); if (d) d.hidden = true; clearInterval(this._rel); },

  icone(tipo) {
    const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
    const c = cv.getContext('2d');
    const R = (x, y, w, h, cor) => { c.fillStyle = cor; c.fillRect(x, y, w, h); };
    if (tipo === 'exe') {
      R(1, 2, 18, 15, '#000'); R(2, 3, 16, 13, '#000080'); R(2, 3, 16, 2, '#1a5fd0');
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(11, 5); c.lineTo(6, 11); c.lineTo(9, 11); c.lineTo(8, 15); c.lineTo(13, 9); c.lineTo(10, 9); c.fill();
    } else if (tipo === 'sav') {
      R(3, 2, 14, 16, '#000'); R(4, 3, 12, 14, '#3a5fa8'); R(6, 3, 8, 5, '#ddd'); R(11, 4, 2, 3, '#3a5fa8'); R(6, 11, 8, 5, '#fff');
    } else if (tipo === 'txt') {
      R(4, 1, 12, 18, '#000'); R(5, 2, 10, 16, '#fff'); for (let i = 0; i < 5; i++) R(6, 5 + i * 2.5, 8, 1, '#555');
    } else if (tipo === 'xls') {
      R(4, 1, 12, 18, '#000'); R(5, 2, 10, 16, '#fff'); R(5, 2, 10, 4, '#1f7a3b'); for (let i = 0; i < 4; i++) R(6, 8 + i * 2.5, 8, 1, '#1f7a3b'); R(10, 7, 1, 10, '#1f7a3b');
    } else {
      R(5, 4, 10, 2, '#555'); R(8, 2, 4, 2, '#555'); R(6, 6, 8, 12, '#888'); R(7, 7, 6, 10, '#bbb'); R(8, 8, 1, 8, '#888'); R(11, 8, 1, 8, '#888');
    }
    return cv;
  },

  abrirJogo() {
    if (F.UI.aberta()) return;
    const corpo = F.u.el('div', 'carregando');
    corpo.innerHTML = '<p>Carregando Energy.exe...</p><div class="afundado barra-progresso"></div><p class="msg" style="margin-top:8px;font-size:13px"></p>';
    const w = F.UI.janela({ titulo: 'Energy.exe', icone: '⚡', classe: 'estreita', corpo, fechar: false });
    const msgs = ['Carregando motivação... 3%', 'Instalando cultura organizacional...', 'Alinhando expectativas...', 'Agendando reuniões sobre as reuniões...', 'Esquentando o pão de queijo...', 'Pronto. Mais ou menos.'];
    const bar = corpo.querySelector('.barra-progresso'), msg = corpo.querySelector('.msg');
    let i = 0;
    const t = setInterval(() => {
      bar.appendChild(document.createElement('i'));
      msg.textContent = msgs[Math.min(msgs.length - 1, Math.floor(i / 3))];
      i++;
      if (i >= 18) { clearInterval(t); F.UI.fechar(w); this.menu(); }
    }, 90);
  },

  menu() {
    const save = F.Estado.carregar();
    const opcoes = [{ t: 'Novo jogo (começar como colaborador(a) novo(a))', cls: 'missao', fn: (w) => {
      if (save) {
        F.UI.dialogo({ titulo: 'Atenção', icone: '⚠', texto: `Já existe um jogo salvo (${F.u.esc(save.nome)}, dia ${save.dia}). Começar de novo apaga esse jogo.`, opcoes: [
          { t: 'Apagar e começar de novo.', cls: 'perigo', fn: (w2) => { F.UI.fechar(w2); F.UI.fechar(w); F.Estado.apagar(); F.Criacao.abrir(); } },
          { t: 'Cancelar.', fn: (w2) => F.UI.fechar(w2) },
        ] });
        return;
      }
      F.UI.fechar(w); F.Criacao.abrir();
    } }];
    if (save) opcoes.push({ t: `Continuar: ${save.nome}, ${F.CARGOS[save.cargo].nome}, dia ${save.dia}`, fn: (w) => { F.UI.fechar(w); this.continuar(); } });
    opcoes.push({ t: 'Como jogar', fn: () => this.leiaMe() });
    opcoes.push({ t: 'Finais desbloqueados', fn: () => this.finais() });
    F.UI.dialogo({ titulo: 'Energy.exe', icone: '⚡', cabecalho: 'Voltagem S.A. <small>energia que move o Brasil (às vezes)</small>', texto: 'Você é a pessoa mais nova da Voltagem S.A., uma grande empresa de energia. Sobreviva à vida corporativa, cumpra missões, ganhe reputação e tente subir na carreira. Quase tudo que você faz tem consequências.', opcoes });
  },

  continuar() {
    const S = F.Estado.carregar();
    if (!S) return;
    F.UI.fecharTudo();
    this.esconder();
    F.Dia.comecar(S, true);
  },

  leiaMe() {
    const cel = F.Input.celular;
    const corpo = `<div class="leia">
      <h3>O objetivo</h3><p>Sobreviver à vida corporativa por 3 meses (30 dias úteis). No fim de cada mês tem avaliação de desempenho e, quem sabe, promoção. Existem vários finais.</p>
      <h3>Controles</h3><ul>${cel
        ? '<li>Toque no chão para andar. Toque numa pessoa ou objeto para ir até lá e interagir.</li><li>O balão amarelo embaixo da tela também interage.</li><li>⚡ Iniciar (canto esquerdo) abre missões, e-mails, agenda e mais.</li>'
        : '<li><kbd>Setas</kbd> ou <kbd>WASD</kbd>: andar. Ou clique no chão.</li><li><kbd>E</kbd>, <kbd>Espaço</kbd> ou <kbd>Enter</kbd>: conversar e usar coisas.</li><li><kbd>1</kbd>–<kbd>9</kbd>: escolher opções. <kbd>Tab</kbd>: menu Iniciar.</li>'}</ul>
      <h3>Atributos</h3><ul><li>💰 Dinheiro · ⭐ Reputação · ⚡ Produtividade · 😵 Estresse (quanto mais alto, pior) · 🏢 Influência.</li><li>Reputação zero = demissão. Estresse 100 = modo avião.</li></ul>
      <h3>Dicas</h3><ul><li>Quem tem ❗ na cabeça tem algo para você. 🔷 é um passo de missão.</li><li>Conversando, você descobre regras corporativas (📘). Elas destravam escolhas novas.</li><li>🎲 mostra a chance de dar certo. O seu perfil ajuda.</li><li>Seu computador (2º andar, Operações Integradas) tem e-mails, trabalho e automações.</li><li>Café e pão de queijo baixam o estresse. O último pão de queijo é um teste de caráter.</li></ul>
      <p style="margin-top:10px;font-size:12px;color:#555">A Voltagem S.A. e todas as pessoas daqui são fictícias. Qualquer semelhança com a sua empresa é coincidência. Provavelmente.</p></div>`;
    F.UI.janela({ titulo: 'Leia-me.txt · Bloco de notas', icone: '📝', corpo, botoes: [{ t: 'Fechar' }] });
  },

  finais() {
    const vistos = F.Estado.finaisVistos();
    const ids = Object.keys(F.FINAIS);
    const corpo = `<p style="margin-bottom:8px">${vistos.length} de ${ids.length} finais desbloqueados.</p><div class="finais-grade">${ids.map((id) => (vistos.includes(id)
      ? `<div class="afundado final-card"><b>${F.u.esc(F.FINAIS[id].titulo)}</b>${F.u.esc(F.FINAIS[id].sub)}</div>`
      : `<div class="afundado final-card bloq"><b>???</b>Final ainda não descoberto.</div>`)).join('')}</div>`;
    F.UI.janela({ titulo: 'Finais.txt', icone: '🏁', corpo, botoes: [{ t: 'Fechar' }] });
  },
};
