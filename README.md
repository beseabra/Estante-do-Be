# estante do bê

O site que reúne os jogos. A disposição lembra a Steam, mas a identidade é própria: fundo quase preto com granulado de filme, uma luz que segue o mouse, cantos chanfrados, tipografia larga (Syne) com rótulos em mono, e um verde-limão de assinatura. Cada jogo tinge a sua parte com a própria cor.

- **Início:** destaques que passam sozinhos (passe o mouse numa captura para ela aparecer grande), um letreiro de etiquetas, uma lista com prévia ("Mais recentes", "Em teste", "Todos"), os jogos que ainda vão sair e um recado em forma de ingresso para quem recebeu o link.
- **Página de cada jogo:** galeria de capturas, ficha, botão **Jogar**, botão para copiar o link, descrição, o que mudou na versão e detalhes.
- **Animações:** cartões que inclinam em 3D com reflexo holográfico, transição em faixas na cor do jogo ao apertar Jogar, botão de jogar com listras que correm, a página tingida com a cor de cada jogo. Tem também um segredo no rodapé.

Abra o `index.html`. Funciona direto do computador, sem servidor.

## Estrutura

```
Fragmentos/
├── index.html              a página (abra esta)
├── hub/
│   ├── jogos.js            ★ OS JOGOS e os textos do site: edite aqui
│   ├── capas/              imagem principal de cada jogo (16:9)
│   ├── capturas/           capturas de tela (16:9) para a galeria
│   ├── css/site.css        visual e animações
│   └── js/
│       ├── efeitos.js      inclinação 3D, transição, avisos, confete
│       └── site.js         as páginas (início, listas, página do jogo) e a busca
├── Fragmentos/             jogo: Fragmentados
└── Eu-te-darei-o-sol/      jogo: Eu te darei o sol
```

## Textos do site

No topo de `hub/jogos.js`, em `window.SITE`:
- `nome`: o nome do site (no topo e no rodapé).
- `slogan`: a frase do rodapé.
- `feedback`: um link para receber comentários (WhatsApp, Instagram, formulário). Com ele preenchido, aparece o botão "Mandar um comentário" na página de cada jogo. Deixe `''` para esconder.

## Adicionar um jogo novo

1. Coloque a pasta do jogo dentro de `Fragmentos/` (ela precisa ter um `index.html`). Use nomes **sem espaços e sem acentos**, como `Meu-Jogo-Novo`.
2. Tire prints do jogo (16:9): um da tela de título para a capa, salvo em `hub/capas/`, e alguns de gameplay, salvos em `hub/capturas/`.
3. Em `hub/jogos.js`, copie um bloco e troque os dados:
   ```js
   {
     id: 'meu-jogo-novo',
     titulo: 'Meu Jogo Novo',
     pasta: 'Meu-Jogo-Novo/',
     capa: 'hub/capas/meu-jogo-novo.png',
     capturas: ['hub/capturas/novo-1.png', 'hub/capturas/novo-2.png'],
     cor: '#00a86b',
     status: 'teste',          // 'lancado', 'teste' ou 'embreve'
     destaque: true,           // aparece nos destaques do início
     versao: '0.1',
     data: '2026-11-20',
     duracao: '~10 minutos',
     jogadores: '1',
     controles: 'Teclado ou toque',
     resumo: 'Uma ou duas frases sobre o jogo.',
     descricao: ['Primeiro parágrafo.', 'Segundo parágrafo.'],
     tags: ['Plataforma', 'Curto'],
     notas: ['O que mudou nesta versão.'],
   },
   ```

O jogo aparece sozinho no início, nas listas, na busca e ganha a própria página (`index.html#/jogo/meu-jogo-novo`). Esse é o link para mandar para alguém testar. O botão "Copiar link" da página já copia ele.

## Colocar na internet

A pasta inteira é um site estático (só HTML, CSS e JS). Duas opções gratuitas:

- **Mais rápida: Netlify Drop.** Entre em <https://app.netlify.com/drop> e arraste a pasta `Fragmentos` para a página. Em segundos sai um link público. Criando uma conta, dá para trocar o nome do link e atualizar arrastando a pasta de novo.
- **Para durar: GitHub Pages.** Crie um repositório no GitHub, envie o conteúdo desta pasta e vá em *Settings → Pages → Branch: main → Save*. O site fica em `https://seu-usuario.github.io/nome-do-repositorio/`. Cada atualização é um novo envio.

Dica: nos servidores, letras maiúsculas e minúsculas fazem diferença. O nome em `pasta:` precisa ser exatamente igual ao da pasta.
