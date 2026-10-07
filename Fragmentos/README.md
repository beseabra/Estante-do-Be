# Fragmentados

> *"Me diga em quantos pedaços você foi partida antes que eu te encontrasse;
> quero saber quantas versões suas eu terei para amar."*

Um jogo de plataforma sobre amar alguém em pedaços. Inspirado na obra de Fernando Machado.

Ele — baixinho, loiro, de olhos azuis — atravessa cinco fragmentos. Cada fragmento é
uma versão dela: alta, magra, cabelo preto, óculos. Em cada fase ele junta os pedaços
de uma memória, um fio vermelho mostra o caminho, e quando chega até ela, aquela versão
vira luz e um caco volta para o retrato, colado com ouro.

## Como jogar

**Dê dois cliques no `index.html`.** Só isso. Não precisa instalar nada.

| Tecla | Ação |
|---|---|
| ← → (ou A D) | andar |
| Espaço (ou ↑ W Z) | pular — segurar pula mais alto |
| Enter | continuar |
| M | liga/desliga a música |

No celular aparecem botões na tela.

## As cinco versões dela

| | Fase | Clima | O que muda |
|---|---|---|---|
| I | O Primeiro Olhar | fim de tarde, pétalas | aprender a andar |
| II | O Silêncio | noite, vaga-lumes | escuridão: só a luz em volta dele ilumina |
| III | A Distância | chuva | plataformas que vão e voltam |
| IV | O Medo | neve | plataformas de gelo que quebram |
| V | A Inteira | amanhecer | uma subida até o alto, onde ela espera |

## Como o código está organizado

Tudo é HTML + CSS + JavaScript puro, desenhado num `<canvas>`. Não há imagens nem
arquivos de som: os personagens são desenhados com formas e a música é gerada na hora.

```
index.html            a página; carrega os scripts NA ORDEM certa
css/style.css         centraliza o jogo na tela
js/
  config.js           ← NOME DELA e DEDICATÓRIA (comece por aqui)
  main.js             liga o jogo depois que a fonte carrega

  core/               o "motor"
    utils.js          matemática pequena (clamp, lerp, aleatório...)
    draw.js           desenhos reutilizáveis: coração, brilho, texto
    input.js          teclado, mouse e toque
    audio.js          música e efeitos gerados com Web Audio
    game.js           laço principal e troca de cenas com fade

  art/                como cada coisa é desenhada
    characters.js     ELE e ELA (cores no topo do arquivo)
    portrait.js       o retrato dela partido em 5 cacos (kintsugi)
    shard.js          o cristal e o fio vermelho

  entities/           coisas que vivem dentro de uma fase
    player.js         física dele: andar, pular, colidir
    amada.js          ela, como "eco" que fica mais nítido
    platform.js       plataformas (normais, móveis, frágeis)
    fragment.js       os pedaços que ele coleta
    particles.js      corações, faíscas, poeira

  world/background.js céu, estrelas, sol/lua, colinas, clima

  levels/level1..5.js  OS DADOS de cada fase (posições, cores, poema)

  ui/
    hud.js            título da fase, contador, memórias
    typewriter.js     o poema aparecendo letra por letra

  scenes/             as "telas" do jogo
    title.js          título
    play.js           jogando uma fase
    interlude.js      o retrato + poema entre fases
    ending.js         o final
```

### O caminho do jogo

```
TitleScene → PlayScene(0) → InterludeScene(0) → PlayScene(1) → ... → InterludeScene(4) → EndingScene
```

Cada cena tem três funções: `enter()` (começa), `update(dt)` (lógica) e `draw(ctx)` (desenho).
O `game.js` chama essas funções 60 vezes por segundo.

## Como personalizar

**Nome e dedicatória** — em `js/config.js`.

**Memórias e poemas** — em cada `js/levels/levelN.js`:
```js
fragments: [
  [470, 330, 'o jeito que você ajeita os óculos'],   // x, y, memória
],
poem: [
  'Foi num instante sem importância',
  ...
],
```
Escreva as memórias de vocês. É aqui que o jogo vira de verdade de vocês dois.

**Plataformas** — `[x, y, largura, altura, opções]`. O chão fica em `y = 460`.
O pulo alcança uns 100px de altura; vãos de até ~80px com subida de até ~80px
funcionam bem. Opções: `{ move: { dx: 200, dy: 0, period: 4 } }` ou `{ fragile: true }`.

**Cores dela e dele** — no topo de `js/art/characters.js` (`F.Art.HIM` e `F.Art.HER`).

**Uma fase nova** — copie um `levelN.js`, mude o `id` e adicione o `<script>` dela no
`index.html`, antes de `js/ui/`. O jogo conta as fases sozinho — só os versos do
final (em `js/scenes/ending.js`) falam em "cinco", então ajuste lá também.
