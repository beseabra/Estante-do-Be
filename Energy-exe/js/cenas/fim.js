// ============================================================
//  FINAIS: tela azul (demissão, modo avião) ou janela de parabéns
// ============================================================
F.Fim = {
  mostrar(id) {
    const S = F.S, Fi = F.FINAIS[id];
    if (!Fi) return;
    F.Jogo.cena = 'fim';
    F.UI.fecharTudo();
    F.UI.mostrarBarra(false);
    document.getElementById('prompt').hidden = true;
    document.getElementById('rastreio').innerHTML = '';
    F.Estado.marcarFinal(id);
    F.Estado.apagar();
    const vistos = F.Estado.finaisVistos().length, total = Object.keys(F.FINAIS).length;
    let el = document.getElementById('fim');
    if (!el) { el = F.u.el('div', ''); el.id = 'fim'; document.body.appendChild(el); }
    el.hidden = false;
    const resumo = `${F.u.esc(S.nome)} · ${F.u.esc(F.CARGOS[S.cargo].nome)} · ${S.dia} dia(s) · ${S.cont.tarefas} tarefas · ${S.cont.reunioes} reuniões · ${S.regras.length} regras · ${S.cont.automacoes} automações`;
    const voltar = () => { el.hidden = true; F.Titulo.mostrar(); };
    if (Fi.estilo === 'bsod') {
      el.className = 'bsod';
      el.innerHTML = `<div class="bsod-caixa">
        <span class="faixa">${F.u.esc(Fi.titulo === 'GAME OVER' ? 'ENERGY.EXE' : Fi.titulo)}</span>
        <p>${F.u.esc(Fi.sub)}</p>
        <p>* ${F.u.esc(Fi.texto(S))}</p>
        <p>* Seu crachá será desativado em 0 segundos.</p>
        <p>* ${resumo}</p>
        <p style="font-size:28px;margin:28px 0 10px">${F.u.esc(Fi.titulo === 'GAME OVER' ? 'GAME OVER' : '')}</p>
        <p>${F.u.esc(Fi.conquista)}</p>
        <p style="opacity:.75">Finais descobertos: ${vistos} de ${total}.</p>
        <p class="pisca">Pressione qualquer tecla para voltar à área de trabalho _</p>
      </div>`;
      F.Som.erro();
      const sair = () => { window.removeEventListener('keydown', sair); el.removeEventListener('click', sair); voltar(); };
      setTimeout(() => { window.addEventListener('keydown', sair); el.addEventListener('click', sair); }, 800);
      return;
    }
    el.className = 'festa';
    el.innerHTML = '';
    F.Som.conquista();
    const corpo = `<div class="fim-titulo">${F.u.esc(Fi.titulo)}</div>
      <p class="fim-sub">${F.u.esc(Fi.texto(S))}</p>
      <p>${F.u.esc(Fi.sub)}</p>
      <p style="margin-top:12px;font-size:13px;color:#333">${resumo}</p>
      <div class="conquista">🏅 ${F.u.esc(Fi.conquista)}</div>
      <p style="margin-top:10px;font-size:13px">Finais descobertos: ${vistos} de ${total}. Existem outros caminhos.</p>`;
    const w = F.u.el('div', 'win');
    w.innerHTML = `<div class="win-barra"><span class="ico">🏁</span><span class="tit">Parabens.exe</span></div><div class="win-corpo">${corpo}</div><div class="win-botoes"><button class="btn" data-a="finais">Ver finais</button><button class="btn primario" data-a="voltar">Voltar à área de trabalho</button></div>`;
    el.appendChild(w);
    w.querySelector('[data-a=voltar]').addEventListener('click', voltar);
    w.querySelector('[data-a=finais]').addEventListener('click', () => { voltar(); setTimeout(() => F.Titulo.finais(), 50); });
  },
};
