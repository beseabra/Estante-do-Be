# por onde andei

Um globo que gira, com um alfinete em cada lugar onde eu já estive. Cada alfinete abre uma galeria com as fotos, os vídeos e as anotações daquela viagem. Usa o mesmo visual da estante do bê: fundo quase preto, granulado, verde-limão, Syne + Inter + Mono.

Abra o `index.html`. Funciona direto do computador, sem servidor, mas precisa de internet para baixar o mapa e buscar cidades.

## Como usa

- **Girar:** arraste o globo. A rodinha do mouse (ou a pinça no celular) aproxima e afasta. Parado, ele gira devagar sozinho. O botão ⏸ desliga isso.
- **Fincar um alfinete:** busque uma cidade lá em cima, ou clique em qualquer ponto do globo. Aparece um balão com o nome do lugar e o botão **fincar alfinete**.
- **Galeria:** clique num alfinete (ou num item de "meus lugares"). No painel dá para:
  - trocar o nome e escrever **quando fui**;
  - adicionar **fotos e vídeos** pelo botão ou arrastando os arquivos para o painel;
  - abrir cada foto grande, escrever legenda, escolher a **capa**, baixar ou apagar (← → passam, Esc fecha);
  - escrever **anotações** (Ctrl+Enter guarda).
- Os países onde tem alfinete ficam tingidos de limão.

## Onde ficam as coisas

Tudo fica guardado **dentro do navegador** (IndexedDB), no próprio computador. Nada é enviado para lugar nenhum. Por isso:

- Use sempre o **mesmo navegador** para abrir. Chrome e Edge guardam separado.
- Limpar os "dados de navegação / cookies" do navegador **apaga tudo**.
- Faça cópias: o botão ⤓ (canto de baixo) salva um arquivo `.json` com tudo, fotos e vídeos inclusos. O ⤒ abre uma cópia salva, e serve também para levar tudo para outro computador.

## Estrutura

```
Por-Onde-Andei/
├── index.html       a página (abra esta)
├── css/estilo.css   visual
└── js/
    ├── banco.js     guarda lugares, fotos e vídeos (IndexedDB)
    ├── globo.js     o globo: desenho, girar, zoom, voar, alfinetes
    └── app.js       busca, lista, galeria, visor, anotações, cópia
```

Serviços usados (gratuitos, sem cadastro): o mapa vem do [world-atlas](https://github.com/topojson/world-atlas), a busca de cidades do [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api) e o nome do lugar clicado do [OpenStreetMap / Nominatim](https://nominatim.org/).
