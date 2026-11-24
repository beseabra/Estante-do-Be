# Pessoal, Urgente! A Fuga do 01

Paródia da eleição de 2026, no estilo WarioWare: uma sequência de **microgames de poucos
segundos**, cada um diferente, que vão ficando mais rápidos. O Janones manda a missão
("PESSOAL, URGENTE!"), você tem poucos segundos para cumprir. Depois de 12 missões vem o
chefão: o 01 fugindo no aeroporto. No fim, a urna.

**Dê dois cliques no `index.html`.** Não precisa instalar nada.

## Controles

Cada missão mostra antes qual controle usa:

| Ícone | Teclado | Mouse / celular |
|---|---|---|
| 🖱️ mouse | | clique / toque nas coisas |
| ← → setas | setas (ou A D) | segure o mouse/dedo para onde quer ir · botões ◀ ▶ |
| ⎵ botão | Espaço, ↑ ou Enter | clique na tela · botão ● |

P ou Esc pausa, M liga/desliga o som.

## Os microgames

| Missão | O que fazer |
|---|---|
| DESMENTE! | clique em todas as fake news do zap antes que espalhem |
| ALGEMA! | solte a algema quando o 01 passar embaixo dela |
| CADÊ O QUEIROZ? | ele pula das moitas; clique nele (no gnomo não vale) |
| PEGA OS SALÁRIOS! | o 01 joga os envelopes da rachadinha; pegue antes de cair |
| PICANHA AO PONTO! | pare o ponteiro na faixa verde |
| COMPARTILHA! | aperte sem parar para espalhar o áudio |
| VOTA 13! | 1, 3 e CONFIRMA na urna |
| DESVIA! | não deixe boleto, bombom nem mala te acertar |
| TIRA O FERRO DE SOLDA! | afaste o ferro da tornozeleira do Pai |
| PASSINHO DO QUEIROZ! | aperte os comandos na ordem |

- Você tem **4 de credibilidade** (vidas). Errou uma missão, perde uma.
- A cada 4 missões o jogo **ACELERA** (e a música junto).
- **Chefão:** o 01 corre de um lado pro outro no aeroporto jogando coisas. Ande com ← →
  e jogue algemas com Espaço. Seis algemas e chega o Japonês da Federal.
- **Urna:** o final muda conforme o voto (13, 22, branco ou nulo).

## Sons

Os áudios de verdade estão na pasta `sons/` (vieram do myinstants.com): os áudios do
Janones ("Pessoal, urgente!", "Avisa pra todo mundo", "Explode esse vídeo"...), "Missão dada
é missão cumprida", o "Acertou!" e o "Errou!" do Faustão, "Faz o L", "Lula lá", "Ô Queiroz",
"Tá ok", "Alô, Polícia Federal", o confirma da urna, o jingle do Flávio no chefão e mais.
A lista completa está em `sons/LEIA-ME.txt`. Se algum arquivo faltar, o jogo gera um som
parecido sozinho.

## Onde mexer

```
index.html             a página; carrega os scripts na ordem certa
css/style.css          centraliza o jogo e os botões de toque
sons/                  os áudios (veja LEIA-ME.txt)
js/
  config.js            ★ TEXTOS e SONS: falas, fake news, créditos, nomes dos arquivos
  core.js              laço do jogo, controles, toque, texto
  audio.js             toca os áudios; gera a música e os sons que faltarem
  arte.js              os personagens e itens (tudo desenhado por código)
  main.js              começa tudo
  cenas/
    rodada.js          ★ o motor dos microgames (instrução, tempo, acelera, vidas)
    titulo.js          título e escolha de personagem
    chefao.js          o chefão e o Japonês da Federal
    urna.js            a urna eletrônica
    final.js           derrota e os finais
  micro/               ★ um arquivo por microgame
```

### Criar um microgame novo

Copie um arquivo de `js/micro/`, troque o `id`, o `verbo`, a `dica` e o jogo, e
acrescente o `<script>` dele no `index.html`. Ele entra sozinho no sorteio.

É uma paródia: as falas são piadas inventadas. Os casos citados (rachadinha, Queiroz,
loja de chocolate, mansão, tornozeleira) são os que foram noticiados; o da rachadinha
foi anulado pelo STJ em 2021, e o jogo faz piada disso também.
