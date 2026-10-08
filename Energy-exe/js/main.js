// ============================================================
//  PONTO DE PARTIDA e o laço principal
// ============================================================
F.Jogo = {
  cena: 'titulo',
  ultimo: 0,
  loop(agora) {
    const dt = Math.min(0.05, (agora - this.ultimo) / 1000 || 0);
    this.ultimo = agora;
    if (this.cena === 'jogo' && F.S) {
      const livre = !F.UI.aberta() && F.UI.menuEl.hidden;
      F.Mundo.update(dt, livre);
      if (livre && this.cena === 'jogo') F.Dia.update(dt);
      if (this.cena === 'jogo') F.Mundo.draw();
      if (F.Input.menu() && !F.UI.aberta()) F.UI.alternarMenu();
    }
    F.Input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  },
};

window.addEventListener('load', () => {
  F.Input.init();
  F.UI.init();
  F.Mundo.init();
  F.Titulo.mostrar();
  requestAnimationFrame((t) => { F.Jogo.ultimo = t; F.Jogo.loop(t); });
});
