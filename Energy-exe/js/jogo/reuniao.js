// ============================================================
//  AGENDA, REUNIÕES e o OUTLOUCO (e-mails)
// ============================================================
F.Agenda = {
  // convida para uma reunião; devolve o texto "amanhã 10:00"
  convidar(id, dia, min) {
    const S = F.S, R = F.REUNIOES[id];
    if (!R) return null;
    if (S.agenda.some((a) => a.id === id && !a.feito && a.dia >= S.dia)) return null;
    if (dia === undefined) {
      if (id === 'diretoria') { dia = S.dia + 1; min = 14 * 60; }
      else if (id === 'remuneracao') { dia = S.dia + 1; min = 9 * 60 + 30; }
      else if (S.minuto < 13 * 60) { dia = S.dia; min = (Math.floor(S.minuto / 60) + 2) * 60; }
      else { dia = S.dia + 1; min = 10 * 60; }
    }
    S.agenda.push({ id, dia, min, feito: false });
    const quando = (dia === S.dia ? 'hoje ' : dia === S.dia + 1 ? 'amanhã ' : 'dia ' + dia + ' ') + F.u.hora(min);
    F.Emails.receber('convite', { assunto: 'Convite: ' + R.titulo + ' (' + quando + ')', de: 'Calendário', corpo: `Você foi incluído(a) na reunião "${R.titulo}".\n\nQuando: ${quando}\nOnde: ${F.Reuniao.nomeSala(R.sala)}\nParticipantes: ${R.quem.map((q) => F.npc(q).nome).join(', ')}\n\nPauta: a definir.` });
    F.UI.rastreio();
    return quando;
  },
  // reunião que começa agora?
  agora() {
    const S = F.S;
    return S.agenda.find((a) => !a.feito && !a.avisado && a.dia === S.dia && S.minuto >= a.min);
  },
  perdidas() {
    const S = F.S;
    S.agenda.filter((a) => !a.feito && (a.dia < S.dia)).forEach((a) => { a.feito = true; a.perdida = true; });
  },
};

F.Reuniao = {
  nomeSala(s) { return { reunioes: 'Sala "Sinergia" (2º andar)', conselho: 'Sala do Conselho (3º andar)', online: 'Online (pelo celular)' }[s] || s; },

  // chamada pelo aviso de "reunião começando"
  avisar(a) {
    const R = F.REUNIOES[a.id];
    a.avisado = true;
    const zona = F.Mundo.zonaAtual && F.Mundo.zonaAtual.id;
    const naSala = zona === R.sala;
    F.Som.email();
    F.UI.dialogo({
      titulo: 'Calendário', icone: '📅', fechar: false,
      cabecalho: `${F.u.esc(R.titulo)} <small>começando agora</small>`,
      texto: `Sua reunião começa agora: ${F.Reuniao.nomeSala(R.sala)}. Duração prevista: ${R.dur} minutos. (Prevista.)`,
      opcoes: [
        { t: R.sala === 'online' ? 'Entrar na chamada.' : naSala ? 'Sentar e começar.' : (R.sala === 'conselho' ? 'Subir correndo para o 3º andar.' : 'Entrar pelo celular, de onde estou.'), cls: 'missao', fn: (w) => {
          F.UI.fechar(w);
          if (R.sala === 'conselho' && zona !== 'conselho') { F.Mundo.irPara('n3', { x: 9, y: 22 }); F.UI.local(); }
          this.iniciar(a, R.sala === 'online' || (R.sala === 'reunioes' && !naSala) ? 'online' : 'presencial');
        } },
        { t: 'Recusar ("conflito de agenda").', fn: (w) => { F.UI.fechar(w); a.feito = true; F.UI.resultado({ titulo: 'Calendário', icone: '📅', texto: 'Você recusa. O organizador responde: "Sem problemas!" Tem problema.', chips: F.Estado.aplicar({ rep: -3, est: -4, t: 1 }) }); F.UI.rastreio(); } },
        { t: 'Fingir que não viu o lembrete.', perigo: true, cls: 'perigo', fn: (w) => { F.UI.fechar(w); a.feito = true; const pego = Math.random() < 0.5; F.UI.resultado({ titulo: 'Calendário', icone: '📅', texto: pego ? 'Alguém manda no chat: "Estamos te esperando!" Todo mundo viu que você estava online.' : 'Ninguém sente sua falta. Isso é bom ou ruim?', chips: F.Estado.aplicar(pego ? { rep: -6, t: 1 } : { est: -6, t: 1 }) }); F.UI.rastreio(); } },
      ],
    });
  },

  // usar a mesa da sala: começa uma reunião marcada para hoje (até 1h antes)
  naSala() {
    const S = F.S, zona = F.Mundo.zonaAtual && F.Mundo.zonaAtual.id;
    const a = S.agenda.find((x) => !x.feito && x.dia === S.dia && F.REUNIOES[x.id].sala === zona && x.min - S.minuto <= 60);
    if (!a) return false;
    a.avisado = true;
    S.minuto = Math.max(S.minuto, a.min);
    this.iniciar(a, 'presencial');
    return true;
  },

  iniciar(a, modo) {
    const S = F.S, R = F.REUNIOES[a.id];
    a.feito = true;
    const st = { r: 0, bons: 0, ruins: 0, fx: [], saiu: false };
    const corpo = F.u.el('div', '');
    const topo = F.u.el('div', 'reuniao-topo');
    const parts = F.u.el('div', 'participantes');
    const caras = {};
    R.quem.forEach((q) => { const cv = F.UI.retrato(F.npc(q).look, 40); cv.title = F.npc(q).nome; caras[q] = cv; parts.appendChild(cv); });
    const eu = F.UI.retrato(S.look, 40); eu.title = 'Você'; parts.appendChild(eu);
    topo.appendChild(parts);
    const med = F.u.el('div', 'medidor', `<span>${modo === 'online' ? '📶 online' : '🪑 presencial'}</span><span class="afundado"><i style="width:0%"></i></span><span class="rod">0/${R.rodadas.length}</span>`);
    topo.appendChild(med);
    corpo.appendChild(topo);
    const tr = F.u.el('div', 'afundado transcricao');
    corpo.appendChild(tr);
    const acoes = F.u.el('div', 'acoes-reuniao');
    corpo.appendChild(acoes);
    const w = F.UI.janela({ titulo: 'Reunião: ' + R.titulo + ' · ' + F.u.hora(S.minuto), icone: '📅', classe: 'larga', corpo, fechar: false });

    const linha = (html, cls = '') => { const p = F.u.el('p', cls, html); tr.appendChild(p); tr.scrollTop = tr.scrollHeight; };
    linha(`${F.u.hora(S.minuto)} · ${R.quem.length + 1} participantes ${modo === 'online' ? '(alguém está com o microfone aberto e um cachorro latindo)' : 'na sala. O ar-condicionado está no máximo.'}`, 'sis');

    const passo = R.dur / R.rodadas.length;
    const lista = (v) => (typeof v === 'function' ? v(S) : v) || [];
    const mostrarRodada = () => {
      const rd = R.rodadas[st.r];
      Object.values(caras).forEach((c) => c.classList.remove('falando'));
      if (caras[rd.quem]) caras[rd.quem].classList.add('falando');
      linha(`<b>${F.u.esc(F.npc(rd.quem).nome)}:</b> ${F.u.esc(rd.fala)}`);
      med.querySelector('.rod').textContent = (st.r + 1) + '/' + R.rodadas.length;
      med.querySelector('i').style.width = ((st.r) / R.rodadas.length * 100) + '%';
      acoes.innerHTML = '';
      F.ACOES_REUNIAO.forEach(([id, nome]) => {
        const b = F.u.el('button', 'btn', nome);
        b.addEventListener('click', () => { F.Som.clique(); agir(id); });
        acoes.appendChild(b);
      });
    };
    const agir = (acao) => {
      const rd = R.rodadas[st.r];
      acoes.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const nomeAcao = F.ACOES_REUNIAO.find((x) => x[0] === acao)[1];
      linha(`<b>Você</b> · ${nomeAcao}`, 'eu');
      if (acao === 'sair') {
        st.saiu = true;
        st.fx.push({ rep: -4, est: -8 });
        linha('Você sai no meio da reunião. Libertação. Algumas pessoas te olham com inveja.', 'sis');
        return setTimeout(terminar, 700);
      }
      if (acao === 'conexao') {
        if (modo === 'online') {
          st.saiu = true;
          st.fx.push({ est: -10, rep: -2 });
          linha('Você congela a câmera numa expressão de concentração e sai. Ninguém percebe. Ou todos perceberam e também queriam sair.', 'sis');
          return setTimeout(terminar, 700);
        }
        st.ruins++;
        st.fx.push({ rep: -8, fama: 1 });
        linha('Você está na mesma sala que todo mundo. Mesmo assim, trava o rosto. Todos viram. Alguém tira uma foto.', 'sis');
        return setTimeout(proxima, 900);
      }
      let res = 'neutro';
      if (lista(rd.bom).includes(acao)) res = 'bom';
      else if (lista(rd.ruim).includes(acao)) res = 'ruim';
      // o perfil ajuda
      const perf = S.perfil;
      if (res === 'neutro' && ((perf === 'comunicador' && acao === 'falar') || (perf === 'analitico' && acao === 'pergunta') || (perf === 'politico' && acao === 'alinhado')) && Math.random() < 0.6) res = 'bom';
      if (res === 'ruim' && perf === 'sobrevivente' && acao === 'quieto') res = 'neutro';
      if (acao === 'alinhado' && res === 'neutro' && !S.regras.includes('conforme-alinhado') && Math.random() < 0.4) res = 'ruim';
      if (acao === 'alinhado' && res === 'ruim' && S.regras.includes('conforme-alinhado') && Math.random() < 0.4) res = 'neutro';
      const txt = (rd.txt && rd.txt[acao]) || F.u.pick(F.RESPOSTAS_REUNIAO[acao][res]);
      linha(txt, 'sis');
      if (res === 'bom') { st.bons++; st.fx.push({ rep: 4, inf: 2 }); F.Som.bom(); }
      if (res === 'ruim') { st.ruins++; st.fx.push({ rep: -3, est: 4 }); F.Som.ruim(); }
      if (res === 'neutro' && acao === 'quieto') st.fx.push({ est: -1 });
      setTimeout(proxima, 900);
    };
    const proxima = () => {
      st.r++;
      if (st.r >= R.rodadas.length) terminar();
      else mostrarRodada();
    };
    const terminar = () => {
      F.UI.fechar(w);
      const tot = {};
      st.fx.forEach((f) => Object.entries(f).forEach(([k, v]) => { tot[k] = (tot[k] || 0) + v; }));
      const ficou = !st.saiu || st.r >= R.rodadas.length / 2;
      tot.t = Math.round(st.saiu ? passo * (st.r + 1) : R.dur);
      if (ficou) tot.conta = { reunioes: 1 };
      if (!st.saiu && R.fx) Object.entries(R.fx).forEach(([k, v]) => { if (typeof v === 'number') tot[k] = (tot[k] || 0) + v; else tot[k] = v; });
      let texto = st.saiu ? 'A reunião continuou sem você. Ninguém sabe se decidiu alguma coisa.' : (R.fim || 'Fim da reunião.');
      // reuniões especiais
      if (R.especial === 'aumento' && !st.saiu) {
        const mes = F.u.mesDe(S.dia);
        const ok = st.bons >= 2 && st.ruins <= 1 && S.rep >= 55 && S.cont.investigacoes >= 1 && (S.hoje.humorChefe >= 0 || S.flags.proposta);
        if (ok) { tot.salario = 500; tot.flag = 'aumento'; tot.extra = ['💰 Aumento aprovado!']; texto = 'Marcos vai até o RH e volta 20 minutos depois: "Aprovado. +R$ 500. Parabéns. Agora precisamos entregar ainda mais."' + (S.flags.proposta ? '\n\n(A tal "outra proposta" ajudou.)' : ''); }
        else {
          S.flags['aumentoNegado' + mes] = true;
          tot.est = (tot.est || 0) + 6;
          const motivo = S.rep < 55 ? 'Sua reputação ainda não convence.' : S.cont.investigacoes < 1 ? 'Faltou uma entrega importante para mostrar.' : st.bons < 2 ? 'A conversa não foi das melhores.' : 'O Marcos estava de mau humor hoje. Momento errado.';
          texto = 'Marcos: "Vamos ver isso no próximo ciclo."\n\n(' + motivo + ')';
        }
      }
      if (R.especial === 'diretoria' && !st.saiu && st.bons >= 4) { tot.rep = (tot.rep || 0) + 6; tot.inf = (tot.inf || 0) + 6; texto += '\n\nNa saída, o Dr. Augusto diz o seu nome. Certo, inclusive.'; }
      const chips = F.Estado.aplicar(tot);
      F.UI.resultado({ titulo: 'Fim da reunião', icone: '📅', texto: `${texto}\n\nVocê falou bem ${st.bons} vez(es) e se enrolou ${st.ruins}.`, chips, depois: () => F.UI.rastreio() });
    };
    setTimeout(mostrarRodada, 500);
  },
};

// ============================================================
//  OUTLOUCO
// ============================================================
F.Emails = {
  receber(id, dados) {
    const S = F.S;
    const base = F.EMAIL[id];
    if (!base && !dados) return;
    const m = { id, lido: false, respondido: false, dia: S.dia, min: Math.round(S.minuto), ...(dados || {}) };
    S.emails.unshift(m);
    if (S.emails.length > 60) S.emails.length = 60;
    F.Som.email();
    F.UI.toast('📧 OUTLOUCO: e-mail novo', (dados && dados.assunto) || base.assunto);
    F.UI.hud();
  },
  info(m) { const b = F.EMAIL[m.id] || {}; return { de: m.de || b.de, assunto: m.assunto || b.assunto, corpo: F.texto(m.corpo || b.corpo), escolhas: m.escolhas || b.escolhas, aoLer: b.aoLer }; },

  abrir(selId) {
    const S = F.S;
    const corpo = F.u.el('div', 'outlouco');
    const caixa = F.u.el('div', 'afundado caixa');
    const leitura = F.u.el('div', 'afundado leitura');
    corpo.appendChild(caixa); corpo.appendChild(leitura);
    const w = F.UI.janela({ titulo: 'Outlouco · Caixa de entrada (' + S.emails.filter((e) => !e.lido).length + ' não lidas)', icone: '📧', classe: 'larga', corpo, botoes: [{ t: 'Fechar', fn: () => {} }] });
    const lista = () => {
      caixa.innerHTML = '';
      if (!S.emails.length) caixa.appendChild(F.u.el('div', 'vazio', 'Nenhum e-mail. Aproveite enquanto dura.'));
      S.emails.forEach((m, i) => {
        const inf = this.info(m);
        const b = F.u.el('button', 'msg-item' + (m.lido ? '' : ' nova') + (i === sel ? ' sel' : ''), `${F.u.esc(inf.assunto)}<small>${F.u.esc(inf.de)} · dia ${m.dia}, ${F.u.hora(m.min)}</small>`);
        b.addEventListener('click', () => { sel = i; ler(); lista(); });
        caixa.appendChild(b);
      });
    };
    const ler = () => {
      const m = S.emails[sel];
      leitura.innerHTML = '';
      if (!m) { leitura.appendChild(F.u.el('div', 'vazio', 'Selecione um e-mail.')); return; }
      const inf = this.info(m);
      if (!m.lido) {
        m.lido = true;
        if (inf.aoLer) { const ch = F.Estado.aplicar(inf.aoLer); if (ch.length) { const c = F.u.el('div', 'chips'); ch.forEach((x) => c.appendChild(F.u.el('span', 'chip ' + x.cls, F.u.esc(x.txt)))); leitura.appendChild(c); } }
        F.UI.hud();
        w.querySelector('.tit').textContent = 'Outlouco · Caixa de entrada (' + S.emails.filter((e) => !e.lido).length + ' não lidas)';
      }
      leitura.insertAdjacentHTML('afterbegin', `<div class="cab"><b>${F.u.esc(inf.assunto)}</b>De: ${F.u.esc(inf.de)}<br>Para: você · dia ${m.dia}, ${F.u.hora(m.min)}</div><p>${F.u.esc(inf.corpo)}</p>`);
      if (inf.escolhas && !m.respondido) {
        const ops = F.u.el('div', 'opcoes');
        F.Escolhas.opcoes(inf.escolhas).forEach((o, i) => {
          const b = F.u.el('button', 'opcao ' + o.cls, `<span class="num">${i + 1}</span><span class="txt">${F.u.esc(o.e.t)}${o.tags}</span>`);
          b.addEventListener('click', () => {
            F.Som.clique();
            m.respondido = true; m.resposta = o.e.t;
            F.UI.fechar(w);
            F.Escolhas.resolver(o.e, { titulo: inf.assunto, depois: () => this.abrir(sel) });
          });
          ops.appendChild(b);
        });
        leitura.appendChild(ops);
      } else if (m.respondido) {
        leitura.appendChild(F.u.el('p', '', `<i>Você respondeu: ${F.u.esc(m.resposta)}</i>`));
      }
    };
    let sel = selId !== undefined ? selId : S.emails.findIndex((e) => !e.lido);
    if (sel < 0) sel = 0;
    lista(); ler();
  },
};
