/* Ordnung auf Japanisch — „Was möchtest du heute tun?“ (Klaus 2026-10-21)
   Aus einem gesprochenen oder getippten Satz („Ich möchte heute das Bad reinigen“) wird: welcher Raum, welche
   Reinigungsmittel, welche Flecken, welche Gewohnheiten, welcher Monat. Ganz auf dem Gerät, ohne KI, ohne Netz:
   Stichwörter und Synonyme je Raum, dazu die Wörter aus den Schritt-Titeln. Ohne DOM, in Node geprüft. */
(function (wurzel) {
  // Stichwörter je Station (bereits „gefaltet“: klein, ä→ae, ö→oe, ü→ue, ß→ss)
  const RAUM = {
    0: ['putzschrank', 'reinigungsmittel', 'putzmittel', 'mittel', 'reiniger', 'essig', 'natron', 'sauerstoffbleiche', 'bleiche', 'schmierseife', 'zitronensaeure', 'saeure', 'lauge', 'etikett', 'etiketten', 'grundlagen', 'putzzeug', 'einkaufen', 'mischen'],
    1: ['eingang', 'flur', 'diele', 'genkan', 'haustuer', 'schuhe', 'schuh', 'garderobe', 'fussmatte', 'matte', 'hausschuhe', 'pantoffeln', 'treppenhaus', 'leergut', 'batterien', 'post', 'schluessel'],
    2: ['kueche', 'kochen', 'spuele', 'spuelen', 'abwasch', 'geschirr', 'herd', 'kochfeld', 'ceran', 'induktion', 'backofen', 'ofen', 'kuehlschrank', 'mikrowelle', 'dunstabzug', 'abzugshaube', 'haube', 'fettfilter', 'spuelmaschine', 'schneidebrett', 'brett', 'toepfe', 'topf', 'pfanne', 'muell', 'muelleimer', 'reste', 'geschirrtuch', 'schwamm'],
    3: ['bad', 'badezimmer', 'dusche', 'duschen', 'wc', 'toilette', 'klo', 'waschbecken', 'wanne', 'badewanne', 'armatur', 'wasserhahn', 'duschkopf', 'duschvorhang', 'spiegel', 'fugen', 'fuge', 'kalk', 'urinstein', 'abfluss', 'siphon', 'badvorleger', 'zahnbuerste'],
    4: ['waesche', 'waschen', 'waschmaschine', 'trockner', 'trocknen', 'waeschestaender', 'handtuch', 'handtuecher', 'buegeln', 'weichspueler', 'einweichen', 'bettwaesche', 'muffig', 'sortieren', 'flecken', 'fleck', 'kleidung waschen'],
    5: ['schlafzimmer', 'kleiderschrank', 'schrank', 'kleider', 'kleidung', 'anziehsachen', 'pullover', 'hemden', 'buegel', 'kleiderbuegel', 'bett', 'falten', 'motten', 'aussortieren', 'ausmisten', 'weggeben', 'altkleider', 'jahreszeiten'],
    6: ['wohnzimmer', 'arbeitszimmer', 'buero', 'schreibtisch', 'papiere', 'papierkram', 'ordner', 'akten', 'dokumente', 'regal', 'regale', 'kisten', 'kiste', 'boxen', 'stapel', 'erinnerungen', 'fotos', 'fenster', 'teppich', 'moebel', 'oberflaechen', 'geraete', 'doppelte'],
    7: ['boden', 'boeden', 'wischen', 'fussboden', 'parkett', 'laminat', 'linoleum', 'vinyl', 'dielen', 'marmor', 'naturstein', 'terrazzo', 'teppichboden', 'fegen', 'saugen', 'staubsaugen', 'mopp'],
    8: ['keller', 'abstellraum', 'abstellkammer', 'dachboden', 'speicher', 'lager', 'vorrat', 'vorraete', 'geruch', 'gerueche', 'riecht', 'stinkt', 'feucht', 'feuchtigkeit', 'schimmel', 'ameisen', 'ungeziefer', 'motten', 'fruchtfliegen', 'obstfliegen', 'muecken', 'grosspackung'],
    9: ['garten', 'balkon', 'terrasse', 'draussen', 'hof', 'einfahrt', 'pflaster', 'unkraut', 'grill', 'grillrost', 'gartenmoebel', 'blumentoepfe', 'tontoepfe', 'schnecken', 'wintergarten', 'glasdach'],
  };
  const MONATE = ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
  const FUELL = new Set(('ich du er sie es wir ihr mein meine meinen mir mich dich heute morgen jetzt gleich mal bitte gern gerne moechte moecht will wollen wuerde wuerden soll sollte kann koennte muss muessen ' +
    'das der die den dem des ein eine einen einem einer und oder auch noch mit von zu zum zur im in an am auf aus bei fuer ueber unter nach vor ' +
    'machen mache tun erledigen anfangen beginnen starten reinigen reinige sauber saubermachen putzen putze aufraeumen aufraeume ordnung schaffen ' +
    'wie was wo wann hilf hilfe helfen kannst mir zeige zeig tipps tipp regeln ganz ganze ganzen etwas bisschen richtig endlich mal wieder').split(' '));

  const falten = t => String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const woerter = t => falten(t).split(' ').filter(w => w.length > 1 && !FUELL.has(w));
  // ein Wort trifft ein Stichwort, wenn es gleich ist, es enthält (Rotweinfleck ⊃ fleck) oder als Mehrzahl/Beugung anfängt
  const trifft = (w, s) => w === s || ((s.length >= 4 || (s.length >= 2 && /[\u3040-\u30ff\u3400-\u9fff]/u.test(s))) && w.includes(s)) || (w.length >= 4 && s.startsWith(w));
  // strenger für Titel-Wörter (sonst findet „Reinigungsmittel“ das „rein“ aus „Eins rein, eins raus“)
  const trifftTitel = (w, t) => w === t || (t.length >= 5 && (w.startsWith(t) || w.endsWith(t))) || (w.length >= 5 && t.startsWith(w));

  function verstehen(text, I) {
    const ws = woerter(text);
    const erg = { woerter: ws, stationen: [], mittel: [], flecken: [], gewohnheiten: [], schritte: [], monat: null, verstanden: false };
    if (!ws.length) return erg;
    // Räume: Stichwörter (3 Punkte) + Wörter aus Schritt-Titeln dieses Raums (1 Punkt)
    const punkte = I.stationen.map(s => {
      let p = 0;
      for (const w of ws) {
        if ((RAUM[s.nr] || []).some(k => trifft(w, k))) p += 3;
        if (s.schritte.some(x => woerter(x.titel).some(t => trifft(w, t)))) p += 1;
      }
      return { nr: s.nr, p };
    }).filter(x => x.p > 0).sort((a, b) => b.p - a.p || a.nr - b.nr);
    erg.stationen = punkte.map(x => x.nr);
    // Schritte, deren Titel ein Wort trifft (z. B. „Backofen“ → 2.8)
    erg.schritte = I.stationen.flatMap(s => s.schritte).filter(x => ws.some(w => woerter(x.titel).some(t => trifftTitel(w, t)))).map(x => x.id);
    // Reinigungsmittel: beim Namen genannt, oder „Reinigungsmittel/Mittel“ allgemein → alle fünf
    const allgemein = ws.some(w => ['reinigungsmittel', 'putzmittel', 'mittel', 'reiniger', 'putzschrank'].includes(w));
    erg.mittel = I.mittel.map((m, i) => ({ i, n: woerter(m.name) })).filter(m => allgemein || ws.some(w => m.n.some(t => t.length > 3 && trifft(w, t)))).map(m => m.i);
    // Flecken beim Namen („Rotwein“, „Kaffee“)
    erg.flecken = I.flecken.map((f, i) => ({ i, n: woerter(f.name) })).filter(f => ws.some(w => f.n.some(t => t.length > 2 && trifft(w, t)))).map(f => f.i);
    // Gewohnheiten, deren Titel ein Wort trifft
    erg.gewohnheiten = I.gewohnheiten.filter(g => ws.some(w => woerter(g.titel).some(t => trifftTitel(w, t)))).map(g => g.id);
    const m = I.kalender.findIndex(k => woerter(k.name).some(x => ws.includes(x)));
    erg.monat = m >= 0 ? m + 1 : null;
    erg.verstanden = !!(erg.stationen.length || erg.mittel.length || erg.flecken.length || erg.monat || erg.gewohnheiten.length);
    return erg;
  }
  // Gewohnheiten, die zu einem Raum gehören (ihre Wörter treffen die Stichwörter des Raums)
  function gewohnheitenFuer(nr, I) {
    const k = RAUM[nr] || [];
    return I.gewohnheiten.filter(g => woerter(`${g.titel} ${g.wann} ${g.handgriff}`).some(w => k.some(s => w === s || (s.length >= 5 && w.includes(s))))).map(g => g.id);
  }
  // Reinigungsmittel, die in den Schritten eines Raums vorkommen
  function mittelFuer(nr, I) {
    const st = I.stationen.find(s => s.nr === nr); if (!st) return [];
    const t = falten(st.schritte.map(x => x.text).join(' '));
    const namen = [['essig'], ['natron'], ['sauerstoffbleiche'], ['schmierseife'], ['zitronensaeure']];
    return namen.map((n, i) => n.some(x => t.includes(x)) ? i : -1).filter(i => i >= 0);
  }
  const api = { verstehen, falten, woerter, RAUM, gewohnheitenFuer, mittelFuer };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (wurzel.OJ = wurzel.OJ || {}).Absicht = api;
})(typeof window !== 'undefined' ? window : globalThis);
