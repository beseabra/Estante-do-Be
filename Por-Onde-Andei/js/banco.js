// ============================================================
//  O banco: guarda lugares, fotos e vídeos dentro do navegador
//  (IndexedDB). Nada sai do computador.
//
//  lugares  { id, nome, regiao, pais, codigo, lat, lon, quando,
//             notas: [{ id, texto, data }], capaId, qtdFotos,
//             qtdVideos, criado }
//  midias   { id, lugarId, tipo: 'foto'|'video', blob, mini,
//             nome, legenda, data, duracao, criado }
// ============================================================
window.Banco = (() => {
  let conexao = null;

  function abrir() {
    conexao ??= new Promise((ok, erro) => {
      const req = indexedDB.open('por-onde-andei', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('lugares', { keyPath: 'id' });
        db.createObjectStore('midias', { keyPath: 'id' }).createIndex('lugar', 'lugarId');
      };
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
    return conexao;
  }

  const pedido = (req) => new Promise((ok, erro) => {
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });

  const fim = (tx) => new Promise((ok, erro) => {
    tx.oncomplete = () => ok();
    tx.onerror = tx.onabort = () => erro(tx.error);
  });

  async function loja(nome, modo = 'readonly') {
    const db = await abrir();
    return db.transaction(nome, modo).objectStore(nome);
  }

  async function gravar(nome, obj) {
    const db = await abrir();
    const tx = db.transaction(nome, 'readwrite');
    tx.objectStore(nome).put(obj);
    return fim(tx);
  }

  return {
    lugares: async () => pedido((await loja('lugares')).getAll()),
    salvarLugar: (l) => gravar('lugares', l),

    // apaga o lugar e todas as mídias dele
    async apagarLugar(id) {
      const db = await abrir();
      const tx = db.transaction(['lugares', 'midias'], 'readwrite');
      tx.objectStore('lugares').delete(id);
      const midias = tx.objectStore('midias');
      const cursor = midias.index('lugar').openKeyCursor(IDBKeyRange.only(id));
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) { midias.delete(c.primaryKey); c.continue(); }
      };
      return fim(tx);
    },

    midia: async (id) => pedido((await loja('midias')).get(id)),
    midias: async (lugarId) => pedido((await loja('midias')).index('lugar').getAll(lugarId)),
    todasMidias: async () => pedido((await loja('midias')).getAll()),
    salvarMidia: (m) => gravar('midias', m),
    async apagarMidia(id) {
      const db = await abrir();
      const tx = db.transaction('midias', 'readwrite');
      tx.objectStore('midias').delete(id);
      return fim(tx);
    },
  };
})();
