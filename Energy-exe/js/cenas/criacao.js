// ============================================================
//  CADASTRO DE NOVO(A) COLABORADOR(A) (criação de personagem)
// ============================================================
F.Criacao = {
  abrir() {
    const P = F.PALETA;
    const L = {
      pele: P.peles[1], cabelo: 'curto', corCabelo: P.cabelos[1], roupa: 'polo', corRoupa: P.roupas[0],
      calca: P.calcas[0], oculos: 'nenhum', acessorio: 'nenhum', cracha: P.crachas[0],
    };
    const st = { nome: '', cargo: 'junior', perfil: null, dir: 0, secreto: false };
    const dirs = ['baixo', 'esq', 'cima', 'dir'];

    const corpo = F.u.el('div', 'cad');
    const prev = F.u.el('div', 'cad-preview');
    const cv = document.createElement('canvas');
    const af = F.u.el('div', 'afundado'); af.style.padding = '2px'; af.appendChild(cv);
    prev.appendChild(af);
    const giro = F.u.el('div', 'giro');
    const bE = F.u.el('button', 'btn', '⟲'), bD = F.u.el('button', 'btn', '⟳');
    bE.addEventListener('click', () => { st.dir = (st.dir + 3) % 4; desenhar(); });
    bD.addEventListener('click', () => { st.dir = (st.dir + 1) % 4; desenhar(); });
    giro.appendChild(bE); giro.appendChild(bD);
    prev.appendChild(giro);
    const crachaTxt = F.u.el('div', '', '');
    crachaTxt.style.cssText = 'font-size:12px;text-align:center';
    prev.appendChild(crachaTxt);
    corpo.appendChild(prev);

    const campos = F.u.el('div', 'cad-campos');
    corpo.appendChild(campos);
    const desenhar = () => {
      cv.width = 56; cv.height = 56;
      const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
      const g = c.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, '#9fc3e8'); g.addColorStop(1, '#d9e6f2');
      c.fillStyle = g; c.fillRect(0, 0, 56, 56);
      c.fillStyle = '#c7b89a'; c.fillRect(0, 46, 56, 10);
      F.Arte.pessoa(c, 28, 50, L, dirs[st.dir], 0, { parado: true });
      crachaTxt.innerHTML = `<b>${F.u.esc(st.nome || 'Seu nome')}</b><br>${F.CARGOS[st.cargo].nome}`;
    };

    // campos
    const campo = (rot, el) => { const c = F.u.el('div', 'campo'); c.appendChild(F.u.el('span', '', rot)); c.appendChild(el); campos.appendChild(c); return el; };
    const inp = F.u.el('input'); inp.type = 'text'; inp.maxLength = 18; inp.placeholder = 'Como te chamam?';
    inp.addEventListener('input', () => { st.nome = inp.value.trim(); desenhar(); });
    campo('Nome', inp);

    const grupo = (rot, itens, sel, fn, amostra) => {
      const g = F.u.el('div', 'escolhas');
      itens.forEach(([v, nome]) => {
        const b = F.u.el('button', 'btn' + (amostra ? ' amostra' : '') + (v === sel ? ' sel' : ''), amostra ? '' : F.u.esc(nome));
        if (amostra) { b.style.background = v; b.title = nome || v; }
        b.addEventListener('click', () => { F.Som.clique(); g.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); fn(v); desenhar(); });
        g.appendChild(b);
      });
      campo(rot, g);
    };
    grupo('Cargo inicial', [['estagiario', 'Estágio'], ['junior', 'Analista Júnior']], st.cargo, (v) => { st.cargo = v; });
    grupo('Pele', P.peles.map((c) => [c, '']), L.pele, (v) => { L.pele = v; }, true);
    grupo('Cabelo', F.ESTILOS.cabelo, L.cabelo, (v) => { L.cabelo = v; });
    grupo('Cor do cabelo', P.cabelos.map((c) => [c, '']), L.corCabelo, (v) => { L.corCabelo = v; }, true);
    grupo('Roupa', F.ESTILOS.roupa, L.roupa, (v) => { L.roupa = v; });
    grupo('Cor da roupa', P.roupas.map((c) => [c, '']), L.corRoupa, (v) => { L.corRoupa = v; }, true);
    grupo('Calça', P.calcas.map((c) => [c, '']), L.calca, (v) => { L.calca = v; }, true);
    grupo('Óculos', F.ESTILOS.oculos, L.oculos, (v) => { L.oculos = v; });
    grupo('Acessório', F.ESTILOS.acessorio, L.acessorio, (v) => { L.acessorio = v; });
    grupo('Crachá', P.crachas.map((c) => [c, '']), L.cracha, (v) => { L.cracha = v; }, true);

    // perfil
    const fs = F.u.el('fieldset', 'cad-fieldset');
    fs.appendChild(F.u.el('legend', '', 'Perfil (o seu ponto forte)'));
    const perfis = F.u.el('div', 'perfis');
    const desenharPerfis = () => {
      perfis.innerHTML = '';
      Object.entries(F.PERFIS).forEach(([id, p]) => {
        const escondido = p.secreto && !st.secreto;
        const b = F.u.el('button', 'btn perfil' + (st.perfil === id ? ' sel' : '') + (p.secreto ? ' secreto' : ''), escondido ? '<b>❓ ???</b><small>Perfil confidencial. Clique para tentar descobrir.</small>' : `<b>${F.u.esc(p.nome)}</b><small>${F.u.esc(p.desc)}</small>`);
        b.addEventListener('click', () => {
          F.Som.clique();
          if (escondido) { st.secreto = true; F.UI.toast('☕ PERFIL SECRETO', 'Você descobriu o Sobrevivente. Ele não é bom em nada, mas nunca morre.'); }
          st.perfil = id; desenharPerfis(); atualizar();
        });
        perfis.appendChild(b);
      });
    };
    fs.appendChild(perfis);
    campos.appendChild(fs);

    const w = F.UI.janela({
      titulo: 'Cadastro de novo(a) colaborador(a) · RH', icone: '🪪', classe: 'larga', corpo,
      botoes: [
        { t: 'Cancelar', fn: () => F.Titulo.mostrar() },
        { t: 'Próximo: contrato', primario: true, fecha: false, fn: () => {
          if (!st.nome) { F.Som.erro(); inp.focus(); F.UI.toast('⚠ CAMPO OBRIGATÓRIO', 'O RH precisa do seu nome. Para os 14 formulários.'); return; }
          if (!st.perfil) { F.Som.erro(); F.UI.toast('⚠ CAMPO OBRIGATÓRIO', 'Escolha um perfil.'); return; }
          this.contrato(st, L, w);
        } },
      ],
    });
    const atualizar = () => {};
    desenharPerfis();
    desenhar();
    setTimeout(() => { if (!F.Input.celular) inp.focus(); }, 100);
  },

  contrato(st, L, wCad) {
    const corpo = F.u.el('div', '');
    corpo.innerHTML = `<div class="afundado contrato">
      <b>CONTRATO DE TRABALHO · VOLTAGEM S.A.</b><br><br>
      Colaborador(a): ${F.u.esc(st.nome)}<br>Cargo: ${F.CARGOS[st.cargo].nome}<br>Setor: Operações Integradas<br>Perfil: ${F.PERFIS[st.perfil].nome}<br><br>
      <ol>
        <li>O(A) colaborador(a) concorda em participar de reuniões.</li>
        <li>O(A) colaborador(a) concorda em participar de reuniões sobre as reuniões.</li>
        <li>"Cinco minutinhos" não têm duração definida em contrato.</li>
        <li>O pão de queijo não é um benefício garantido.</li>
        <li>Este contrato pode ser alterado conforme alinhado.</li>
        <li>O(A) colaborador(a) declara saber o que faz Operações Integradas.</li>
      </ol>
      <div class="assinatura" id="assinatura"></div>
    </div>`;
    F.UI.janela({ titulo: 'Contrato.pdf', icone: '📄', corpo, botoes: [
      { t: 'Voltar', fn: () => {} },
      { t: 'Assinar', primario: true, fecha: false, fn: (w) => {
        const a = corpo.querySelector('#assinatura');
        if (a.textContent) return;
        let i = 0;
        const t = setInterval(() => { a.textContent = st.nome.slice(0, ++i); F.Som.digita(); if (i >= st.nome.length) { clearInterval(t); setTimeout(() => { F.UI.fecharTudo(); F.Titulo.esconder(); this.comecar(st, L); }, 600); } }, 60);
      } },
    ] });
  },

  comecar(st, L) {
    const S = F.Estado.novo({ nome: st.nome, look: { ...L }, perfil: st.perfil, cargo: st.cargo });
    F.Dia.comecar(S, false);
  },
};
