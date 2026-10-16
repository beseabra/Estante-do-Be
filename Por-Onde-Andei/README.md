# por onde andei

Um globo 3D de satélite, com relevo de verdade e as divisas de países e estados, e um alfinete vermelho em cada lugar onde eu já estive. Cada alfinete abre uma galeria com as fotos, os vídeos e as anotações daquela viagem. Usa o mesmo visual da estante do bê: fundo quase preto, granulado, verde-limão, Syne + Inter + Mono.

Abra o `index.html`. Funciona direto do computador, sem servidor, mas precisa de internet para baixar as imagens do mapa e buscar cidades.

## Como usa

- **Girar:** arraste o globo. A rodinha do mouse (ou a pinça no celular) aproxima e afasta. Parado e de longe, ele gira devagar sozinho. O botão ⏸ desliga isso.
- **Ver o relevo:** o botão da montanha inclina a câmera e as montanhas aparecem em 3D. Também dá para inclinar arrastando com o botão direito do mouse (ou com dois dedos no celular).
- **Fincar um alfinete:** busque uma cidade lá em cima, ou clique em qualquer ponto do globo. Aparece um balão com o nome do lugar e o botão **fincar alfinete**.
- **Galeria:** clique num alfinete (ou num item de "meus lugares"). No painel dá para:
  - trocar o nome e escrever **quando fui**;
  - adicionar **fotos e vídeos** pelo botão ou arrastando os arquivos para o painel;
  - abrir cada foto grande, escrever legenda, escolher a **capa**, baixar ou apagar (← → passam, Esc fecha);
  - escrever **anotações** (Ctrl+Enter guarda).
- A área de cada cidade visitada (o contorno do município, vindo do OpenStreetMap) fica pintada de vermelho. De longe ela é pequena: aproxime para ver. Ao abrir um lugar, o globo já voa até enquadrar a cidade.

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
    ├── globo.js     o globo 3D: satélite, relevo, divisas, voar, alfinetes
    └── app.js       busca, lista, galeria, visor, anotações, cópia
```

Serviços usados (gratuitos, sem cadastro): o globo 3D é feito com [MapLibre](https://maplibre.org/); a imagem de satélite e as divisas vêm da [Esri](https://www.esri.com/) (uso pessoal, com os créditos no canto do mapa); o relevo dos [Terrain Tiles da AWS](https://registry.opendata.aws/terrain-tiles/); a busca de cidades do [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api); e o nome e o contorno das cidades do [OpenStreetMap / Nominatim](https://nominatim.org/).
