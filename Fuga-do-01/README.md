# Pessoal, Urgente! A Fuga do 01

Paródia da eleição de 2026. O 01 está fugindo, e você (Lula ou Janones) corre atrás dele
por cinco fases, cumprindo as missões que o Janones manda pelo canal do zap.
No fim, a última missão é votar na urna.

**Dê dois cliques no `index.html`.** Não precisa instalar nada.

| Tecla | Ação |
|---|---|
| Espaço / ↑ / W | pular (aperte de novo no ar para o pulo duplo) |
| ↓ / S | abaixar (passa por baixo das faixas e dos fantasmas) |
| X / J | atirar (picanha do Lula ou áudio urgente do Janones) |
| C / K | especial, quando a barra encher |
| P / Esc | pausa |
| M | liga/desliga o som |
| V | liga/desliga as vozes do navegador |
| Na urna | números, Backspace corrige, B branco, Enter confirma |

No celular aparecem botões na tela, e a urna funciona tocando nas teclas.

## Como funciona

- A barra do alto mostra a **distância do 01**. Ela diminui sozinha enquanto você corre bem.
  Levar dano, cair em buraco e as arrancadas dele aumentam a distância. Chegou a 0, pegou.
  Passou do limite, ele fugiu pra Miami.
- **Credibilidade** são as suas vidas. **Cervejinha** devolve uma.
- **Picanha** dá um turbo de alguns segundos.
- **Votos** (as estrelinhas 13) dão pontos e enchem o especial.
- No meio da corrida o Janones manda **missões** ("PESSOAL, URGENTE!"). Cumprir dá
  pontos, enche o especial e aproxima você do 01.
- Especiais: **FAZ O L!** (Lula) e **EXÉRCITO DO LULA** (Janones) limpam a tela.

## As fases

| | Fase | Lugar | Novidade |
|---|---|---|---|
| 1 | O Gabinete Fantasma | ALERJ, Rio | assessores fantasmas, envelopes de salário, a CPI |
| 2 | A Loja de Chocolate | shopping | bombons, caixas eletrônicos (48 depósitos de 2 mil) |
| 3 | Cadê o Queiroz? | Atibaia | o Queiroz pula das moitas e dança |
| 4 | A Mansão de 6 Milhões | Lago Sul, Brasília | boletos, piscina, o Pai na janela com a tornozeleira |
| 5 | Fuga pra Miami | aeroporto | drones do gabinete do ódio e o Japonês da Federal |

Os finais mudam conforme o voto na urna: 13, 22, branco ou nulo.

## Sons de verdade

Todos os sons e músicas são gerados pelo próprio jogo, e as falas saem pela voz do
navegador. Para usar os áudios de verdade (o "Pessoal, urgente!" do Janones, o Lula Lá,
a marchinha do Japonês da Federal, o barulhinho da urna...), coloque os arquivos na pasta
`sons/` com os nomes listados em `sons/LEIA-ME.txt`. Os que existirem tomam o lugar dos
gerados; os que faltarem continuam sintetizados.

## Onde mexer

```
index.html             a página; carrega os scripts na ordem certa
css/style.css          centraliza o jogo e os botões de toque
sons/                  seus mp3 (veja LEIA-ME.txt)
js/
  config.js            ★ TEXTOS: falas, fases, missões, nomes dos arquivos de som
  core.js              laço do jogo, controles, toque, texto
  audio.js             efeitos, marchinhas geradas, vozes do navegador
  arte.js              os personagens e itens (tudo desenhado por código)
  cenarios.js          fundos de cada fase e os obstáculos
  main.js              começa tudo
  cenas/
    titulo.js          título e escolha de personagem
    zap.js             o canal do zap com os áudios antes de cada fase
    corrida.js         a perseguição (o jogo em si)
    urna.js            a urna eletrônica
    final.js           derrota e os finais
```

É uma paródia: as falas são piadas inventadas. Os casos citados (rachadinha, Queiroz,
loja de chocolate, mansão) são os que foram noticiados e investigados; o da rachadinha
foi anulado pelo STJ em 2021, e o jogo faz piada disso também.
