/* Befehle und Browseradapter. Keine Aufnahme wird von der App gespeichert.
   Ein Fenster pro Aktivierung; kein endloses Neustarten nach Browserfehlern. */
(function (g) {
  'use strict';
  const normal = t => String(t).toLowerCase().replace(/[.!?,;:]/g, '').replace(/ß/g, 'ss').trim().replace(/\s+/g, ' ');
  const gruppen = {
    fertig: ['fertig', 'abgehakt'], weiter: ['weiter', 'nächster schritt', 'naechster schritt'],
    nochmal: ['nochmal', 'noch mal', 'wiederholen'], langsamer: ['langsamer'],
    zurück: ['zurück', 'zurueck'], pause: ['pause', 'musik'], zeit: ['wie lange noch'],
    warum: ['warum'], fleck: ['fleck rotwein', 'rotweinfleck'], stopp: ['stopp', 'stop'],
  };
  function befehl(t) {
    const s = normal(t).replace(/^bitte /, '').replace(/ bitte$/, '');
    return Object.keys(gruppen).find(k => gruppen[k].includes(s)) || null;
  }
  function zuhoeren({ API, erlaubt, ausfuehren, status, spaeter = setTimeout, abbrechen = clearTimeout }) {
    let aktiv = false, h = null, uhr = null;
    function halt(text = 'Zuhören aus. Die Tasten bleiben bedienbar.') {
      aktiv = false; abbrechen(uhr); uhr = null;
      const alt = h; h = null;
      if (alt) { alt.onresult = alt.onend = alt.onerror = null; try { alt.abort(); } catch (_) {} }
      status(text, false);
    }
    function fenster() {
      if (!aktiv || h || !erlaubt()) return;
      try {
        const r = h = new API(); r.lang = 'de-DE'; r.continuous = false; r.interimResults = false;
        r.onstart = () => { if (h === r) status('Zuhören … sage einen Befehl.', true); };
        r.onresult = e => {
          if (h !== r || !aktiv || !erlaubt()) return;
          for (let i = e.resultIndex || 0; i < e.results.length; i++) {
            if (!e.results[i].isFinal) continue;
            const k = befehl(e.results[i][0].transcript);
            halt(k ? 'Befehl erkannt.' : 'Nicht verstanden. Tippe erneut auf Zuhören oder nutze die Tasten.');
            if (k) ausfuehren(k);
            return;
          }
        };
        r.onerror = e => halt(({ 'not-allowed': 'Mikrofon nicht erlaubt. Erlaube es im Browser oder nutze die Tasten.',
          'audio-capture': 'Kein Mikrofon verfügbar. Nutze die Tasten.', network: 'Spracherkennung braucht hier eine Verbindung. Nutze offline die Tasten.',
          'no-speech': 'Nichts gehört. Tippe erneut auf Zuhören.' })[e.error] || 'Spracherkennung beendet. Nutze die Tasten oder versuche es erneut.');
        r.onend = () => { if (h === r) halt('Zuhören beendet. Für den nächsten Befehl erneut einschalten.'); };
        r.start(); uhr = spaeter(() => halt('Zuhörfenster beendet. Erneut einschalten oder Tasten nutzen.'), 15000);
      } catch (_) { halt('Spracherkennung konnte nicht starten. Nutze die Tasten.'); }
    }
    return { start() { halt(); if (!API || !erlaubt()) { status('Zuhören hier nicht verfügbar. Nutze die Tasten.', false); return; } aktiv = true; fenster(); }, halt,
      get aktiv() { return aktiv; } };
  }
  function medien(session, ausfuehren) {
    const gesetzt = [];
    if (session && typeof session.setActionHandler === 'function') {
      for (const [aktion, k] of Object.entries({ play: 'fertig', nexttrack: 'weiter', previoustrack: 'nochmal', pause: 'pause', stop: 'stopp' })) {
        try { session.setActionHandler(aktion, () => ausfuehren(k)); gesetzt.push(aktion); } catch (_) {} // einzeln: Browser unterstützen Teilmengen
      }
    }
    return { gesetzt, stopp() { for (const a of gesetzt) try { session.setActionHandler(a, null); } catch (_) {} } };
  }
  (g.OJ = g.OJ || {}).Steuerung = { befehl, zuhoeren, medien };
})(typeof window === 'undefined' ? globalThis : window);
