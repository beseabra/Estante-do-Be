# Eu te darei o sol

Um jogo de plataforma sobre dois irmãos gêmeos que dividiram o mundo ao meio.

> Inspirado em *"Eu te darei o sol"*, de Jandy Nelson. Jogo de fã, sem fins comerciais.
> Contém trechos curtos da edição brasileira (tradução de Paulo Polzonoff Junior, Novo Conceito):
> uma epígrafe por capítulo, títulos de "retratos" do Noah, passagens da bíblia da vovó e o
> diálogo do sol no final. Falas, memórias e poemas são textos originais.

## Como jogar

Abra o `index.html` no navegador (Chrome, Edge ou Firefox). Não precisa instalar nada.

| Tecla | O que faz |
|---|---|
| ← → (ou A D) | andar |
| Espaço / ↑ / W | pular. **Noah**: segure no ar para **planar** |
| X (ou K / E) | **Noah**: pintar (ponte de tinta ou colorir nuvem). **Jude**: esculpir pedra rachada |
| TAB (ou C / Q) | trocar de gêmeo (capítulo V) |
| R | voltar ao último girassol |
| Enter | pular falas / continuar |
| M | liga e desliga a música |

No celular aparecem botões na tela.

## Os capítulos

| # | Capítulo | Quem | O que se aprende | Pedaço do mundo |
|---|---|---|---|---|
| I | O Museu Invisível | Noah | planar, pontes de tinta, colorir nuvens | as árvores |
| II | A História da Sorte | Jude | esculpir, degraus da vovó, amuletos, neblina | as flores |
| III | Castor e Pólux | Noah | elevador de nuvem, chuva de meteoros | as estrelas |
| IV | Mulheres de Areia | Jude | esculpir degraus de areia que a maré desfaz | as conchas |
| V | A Escola de Artes | Noah | entrar num quadro e sair em outro, degrau de tinta no ar | as cores |
| VI | A Queda do Diabo | Jude | maré, pedras que desmoronam | os oceanos |
| VII | A Mãe | Noah | fase vertical no escuro: a tinta ilumina | os pássaros |
| VIII | Coisas Quebradas | Jude | dois blocos, três portões, pedras caindo, o Oscar | as pedras |
| IX | Gêmeos | os dois | cooperativo: placas, portões, pontes para os dois | as metades |
| X | O Sol | os dois | subida cooperativa vertical com tudo junto | o sol |

Cada capítulo abre com uma epígrafe do livro. Entre um capítulo e outro, o Noah pinta um painel num muro de concreto; no fim são dez painéis.

## Como o código está organizado

```
index.html            página + ordem dos scripts
css/style.css         visual da página e botões de toque
js/config.js          ★ saudação e dedicatória do final (edite aqui)
js/core/              base: utilidades, desenho, teclado, som, laço do jogo
js/art/               desenhos (personagens, objetos, o mural, extras dos capítulos novos)
js/entities/          coisas do mundo
  platform.js           plataformas: normal, móvel, frágil, da vovó, de tinta
  devices.js            placa, portão, bloco, pedra rachada, girassol, gatilho, meta
  hazards.js            nuvem cinzenta, espinhos, mar com maré, meteoros
  pickups.js            coletáveis, potes de tinta, amuletos
  (devices.js também tem os montes de areia e as molduras-portal)
  twin.js               Noah e Jude (física e poderes)
js/world/background.js céu, colinas, árvores, cidade, gigantes, clima
js/levels/level1..10.js ★ cada capítulo é só uma lista de dados
js/ui/                máquina de escrever + HUD (falas, dicas, tinta)
js/scenes/            título, jogo, intervalo (mural), final
js/main.js            liga tudo
```

Tudo vive dentro de um objeto global `F` (por exemplo `F.Twin`, `F.PlayScene`). Os arquivos são scripts comuns, sem módulos, então o jogo funciona abrindo o arquivo direto, sem servidor.

## Personalizar

- **Final:** edite `js/config.js` (`saudacao` e `dedicatoria`).
- **Fases:** cada `js/levels/levelN.js` explica o formato no topo. Plataformas são `[x, y, largura, altura, opções]`. O chão fica em `y = 460` e a tela tem 960×540.
- **Trechos do livro:** `quote` no topo de cada fase (epígrafe) e `interlude.retrato`.
- **Falas:** em `triggers` de cada fase: `{ x, lines: [['noah', 'texto']], hint: 'dica' }`. Quem fala pode ser `noah`, `jude`, `vovo`, `brian` ou `oscar`.
- **Memórias e poemas:** `collectibles` (memória de cada coletável) e `interlude` (retrato e poema do intervalo).
- **Música:** `music` de cada fase usa acordes em números MIDI (60 = dó central).
- **Física:** constantes no topo de `js/entities/twin.js` (velocidade, gravidade, queda ao planar, máximo de tinta).
