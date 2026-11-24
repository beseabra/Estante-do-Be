// ============================================================
//  Começa tudo (espera as fontes para os títulos não piscarem)
// ============================================================
(function () {
  const vai = () => G.Game.start();
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('40px Bangers'), document.fonts.load('800 16px Nunito')]),
      new Promise((r) => setTimeout(r, 1500)),
    ]).then(vai, vai);
  } else vai();
})();
