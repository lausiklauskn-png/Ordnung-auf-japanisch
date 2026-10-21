/* Ordnung auf Japanisch — Speicher (IndexedDB „OrdnungJP1“, NIE umbenennen: github.io ist eine geteilte Adresse).
   Ein Fach „log“: jeder erledigte Schritt ist ein Eintrag {id, art, ref, zeit}. Daraus rechnet die App alles
   (Anzahl, zuletzt, Verlauf). Ohne IndexedDB (privates Fenster) läuft es im Speicher weiter und sagt das. */
(function () {
  const NAME = 'OrdnungJP1', VERSION = 1;
  let db = null, imSpeicher = null;
  function oeffnen() {
    return new Promise(res => {
      try {
        const r = indexedDB.open(NAME, VERSION);
        r.onupgradeneeded = () => {
          const d = r.result;
          if (!d.objectStoreNames.contains('log')) d.createObjectStore('log', { keyPath: 'id', autoIncrement: true });
          if (!d.objectStoreNames.contains('einst')) d.createObjectStore('einst');
        };
        r.onsuccess = () => { db = r.result; res(true); };
        r.onerror = () => { imSpeicher = { log: [], einst: {} }; res(false); };
      } catch (e) { imSpeicher = { log: [], einst: {} }; res(false); }
    });
  }
  const tx = (fach, art, fn) => new Promise((res, rej) => {
    const t = db.transaction(fach, art); const s = t.objectStore(fach); const r = fn(s);
    t.oncomplete = () => res(r && 'result' in r ? r.result : undefined); t.onerror = () => rej(t.error);
  });
  const DB = {
    bereit: null,
    dauerhaft: () => !!db,
    async alle() {
      await DB.bereit;
      if (!db) return imSpeicher.log.slice();
      return tx('log', 'readonly', s => s.getAll());
    },
    async eintragen(art, ref) {
      await DB.bereit;
      const e = { art, ref, zeit: Date.now() };
      if (!db) { e.id = imSpeicher.log.length + 1; imSpeicher.log.push(e); return e; }
      e.id = await tx('log', 'readwrite', s => s.add(e));
      return e;
    },
    async loeschen(id) {
      await DB.bereit;
      if (!db) { imSpeicher.log = imSpeicher.log.filter(e => e.id !== id); return; }
      await tx('log', 'readwrite', s => s.delete(id));
    },
    async einst(k, v) {
      await DB.bereit;
      if (v === undefined) return db ? tx('einst', 'readonly', s => s.get(k)) : imSpeicher.einst[k];
      if (!db) { imSpeicher.einst[k] = v; return; }
      await tx('einst', 'readwrite', s => s.put(v, k));
    },
  };
  DB.bereit = oeffnen();
  (window.OJ = window.OJ || {}).DB = DB;
})();
