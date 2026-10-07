// ============================================================
//  PONTO DE PARTIDA
//  Espera a fonte carregar (para os textos ficarem bonitos
//  desde o primeiro quadro) e liga o jogo.
// ============================================================
window.addEventListener('load', () => {
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    F.Game.start();
  };

  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load(`italic 300 40px ${F.FONT}`),
      document.fonts.load(`italic 400 20px ${F.FONT}`),
      document.fonts.load(`400 20px ${F.FONT}`),
    ]).then(go, go);
    setTimeout(go, 2500); // sem internet? começa assim mesmo
  } else {
    go();
  }
});
