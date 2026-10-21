// Baut assets/inhalt.js aus docs/INHALT.md — der Katalog ist die EINZIGE Quelle der Tipps.
// Wer INHALT.md ändert, ruft `node tools/inhalt-bauen.mjs` auf; tests/inhalt.mjs merkt, wenn es vergessen wurde.
// Aufruf mit --pruefen: schreibt nichts, sagt nur, ob assets/inhalt.js zum Katalog passt (Rückgabe 1, wenn nicht).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUELLE = path.join(WURZEL, 'docs/INHALT.md');
const ZIEL = path.join(WURZEL, 'assets/inhalt.js');

// Kanji und Lesung je Station (eigene Wahl, nicht aus den Heften)
const KANJI = {
  0: ['道具', 'dōgu', 'Werkzeug'], 1: ['玄関', 'genkan', 'Eingang'], 2: ['台所', 'daidokoro', 'Küche'],
  3: ['風呂', 'furo', 'Bad'], 4: ['洗濯', 'sentaku', 'Wäsche'], 5: ['寝室', 'shinshitsu', 'Schlafzimmer'],
  6: ['居間', 'ima', 'Wohnzimmer'], 7: ['床', 'yuka', 'Boden'], 8: ['倉庫', 'sōko', 'Lager'], 9: ['庭', 'niwa', 'Garten'],
};
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export function zerlegen(md) {
  // in Abschnitte: jede Überschrift ## oder ### beginnt einen neuen
  const abschnitte = [];
  let a = null;
  for (const zeile of md.split('\n')) {
    const h = zeile.match(/^(#{2,3})\s+(.*)$/);
    if (h) { a = { ebene: h[1].length, titel: h[2].trim(), tabellen: [], listen: [], text: [] }; abschnitte.push(a); continue; }
    if (!a) continue;
    if (/^\|/.test(zeile)) {
      const zellen = zeile.replace(/^\||\|\s*$/g, '').split('|').map(z => z.trim());
      if (zellen.every(z => /^:?-+:?$/.test(z))) continue;                 // Trennzeile
      let t = a.tabellen[a.tabellen.length - 1];
      if (!t || t.ende) { t = { kopf: zellen, zeilen: [] }; a.tabellen.push(t); } else t.zeilen.push(zellen);
    } else {
      const t = a.tabellen[a.tabellen.length - 1]; if (t) t.ende = true;
      const l = zeile.match(/^- (.*)$/);
      if (l) a.listen.push(l[1].trim());
      else if (zeile.trim() && !/^---$/.test(zeile.trim())) a.text.push(zeile.trim());
    }
  }
  return abschnitte;
}

const ohneMd = s => s.replace(/\*\*/g, '').replace(/`/g, '');

// Einwirkzeit aus „⌛ 20 Min.“ / „⌛ 2 Std.“ / „⌛ eine Nacht“ / „⌛ über Nacht“ → Minuten
export function einwirkMinuten(text) {
  const m = text.match(/⌛\s*(?:ca\.\s*)?(\d+(?:[,–-]\d+)?|eine|über)\s*(Min|Std|Nacht)/);
  if (!m) return null;
  if (m[2] === 'Nacht') return 8 * 60;
  const zahl = parseFloat(m[1].split(/[–-]/)[0].replace(',', '.'));
  return m[2] === 'Std' ? zahl * 60 : zahl;
}
// Arbeitszeit aus „⏱ 3 Min.“ / „⏱ 30 Sek.“ → Minuten
export function arbeitMinuten(text) {
  const m = text.match(/⏱\s*(\d+(?:,\d+)?)\s*(Min|Sek|Std)/);
  if (!m) return null;
  const z = parseFloat(m[1].replace(',', '.'));
  return m[2] === 'Sek' ? Math.round(z / 6) / 10 : m[2] === 'Std' ? z * 60 : z;
}

export function bauen(md) {
  const ab = zerlegen(md);
  const finde = re => ab.find(a => re.test(a.titel));
  const stationen = [];
  for (const a of ab) {
    const m = a.titel.match(/^(\d+)\s*·\s*(.+?)(?:\s+—\s+(.+))?$/);
    if (!m || a.ebene !== 2) continue;
    const nr = +m[1];
    if (!(nr in KANJI)) continue;                                          // § 10 ist der Kalender
    const st = { nr, titel: m[2].replace(/\s*\(.*\)$/, ''), zusatz: m[3] || '', kanji: KANJI[nr][0], lesung: KANJI[nr][1], schritte: [] };
    const t = a.tabellen[0];
    if (t && /Schritt/.test(t.kopf[0])) {
      for (const [kopf, ansage] of t.zeilen) {
        const k = kopf.match(/^(\d+\.\d+)\s+(.*)$/);
        if (!k) continue;
        const text = ohneMd(ansage);
        st.schritte.push({ id: 's' + k[1], nr: k[1], titel: k[2], text, einwirk: einwirkMinuten(text), arbeit: arbeitMinuten(text) });
      }
    } else if (t && /Boden/.test(t.kopf[0])) {                              // Böden: jede Zeile ein Schritt
      st.schritte = t.zeilen.map((z, i) => ({
        id: 's' + nr + '.' + (i + 1), nr: nr + '.' + (i + 1), titel: z[0],
        text: `Erst trocken: ${z[1]}. Dann feucht: ${z[2]}.` + (z[3] ? ` ⚠ Nie: ${z[3]}.` : ''),
        einwirk: null, arbeit: null,
      }));
      st.einleitung = a.text.map(ohneMd).join(' ');
    }
    stationen.push(st);
  }

  const leitRoh = (md.split(/\*\*Leitsätze[^*]*\*\*/)[1] || '').split(/\n\|/)[0];
  const leitsaetze = (leitRoh.match(/^- .*$/gm) || []).map(l => ohneMd(l.slice(2)));
  // die Abschnitte „Was man nie mischt“ und „Was man nie worauf gibt“ stehen als fette Zeile im Text vor ihrer Liste
  const roh = md.split(/\*\*Was man nie mischt[^*]*\*\*/)[1] || '';
  const nieMischen = (roh.split(/\*\*Was man nie worauf gibt[^*]*\*\*/)[0].match(/^- .*$/gm) || []).map(l => ohneMd(l.slice(2)));
  const nieWorauf = ((roh.split(/\*\*Was man nie worauf gibt[^*]*\*\*/)[1] || '').split(/\n---|\n## /)[0].match(/^- .*$/gm) || []).map(l => ohneMd(l.slice(2)));

  const fl = finde(/Fleckenkarten/);
  const fleckenRegeln = ohneMd(fl.text.join(' '));
  const flecken = fl.tabellen[0].zeilen.map(([name, mittel, griff]) => ({ name, mittel, griff }));

  const gg = finde(/^Gute Gewohnheiten/);
  const gewohnheiten = gg.tabellen[0].zeilen.map(([titel, wann, takt, handgriff, warum], i) => {
    if (!['täglich', 'Woche', 'Gelegenheit'].includes(takt)) throw new Error('Takt unbekannt: ' + takt);
    return { id: 'g' + (i + 1), titel, wann, takt, handgriff, warum };
  });
  const wk = finde(/^Warum in kleinen Schritten/);
  const warumKurz = wk.listen.map(l => { const m = l.match(/^\*\*(.+?)\*\*\s*(.*)$/); return m ? { satz: m[1], grund: m[2].replace(/^—\s*/, '') } : { satz: ohneMd(l), grund: '' }; });
  const takt = finde(/^Gewohnheits-Takt/).tabellen[0].zeilen.map(([wann, was]) => ({ wann: ohneMd(wann), was: was.split(' · ') }));
  const pausen = finde(/^Pausen-Brücke/).tabellen[0].zeilen.map(([was, dauer, inDerZeit]) => ({ was, dauer, inDerZeit }));

  const kal = finde(/^10 ·/);
  const kalender = kal.tabellen[0].zeilen.map(([kopf, inhalt], i) => {
    const m = ohneMd(kopf).match(/^(\S+)\s*—\s*(.*)$/);
    return { monat: i + 1, name: MONATE[i], motto: m ? m[2] : '', aufgaben: ohneMd(inhalt).split(' · ').map((t, j) => ({ id: `k${String(i + 1).padStart(2, '0')}.${j + 1}`, text: t.trim() })) };
  });
  kalender.forEach((k, i) => { if (!k.name.startsWith(MONATE[i].slice(0, 3))) throw new Error('Monat ' + (i + 1) + ' passt nicht'); });
  kalender.einleitung = ohneMd(kal.text.join(' '));
  const vergessen = finde(/drei vergessenen Stellen/).tabellen[0].zeilen.map(([stelle, was]) => ({ stelle: ohneMd(stelle), was: ohneMd(was) }));

  return { stationen, gewohnheiten, warumKurz, leitsaetze, nieMischen, nieWorauf, flecken, fleckenRegeln, takt, pausen, kalender, kalenderEinleitung: kalender.einleitung, vergessen };
}

export function alsSkript(daten) {
  return '// GEBAUT aus docs/INHALT.md mit `node tools/inhalt-bauen.mjs` — nicht von Hand ändern.\n' +
    'window.OJ_INHALT = ' + JSON.stringify(daten, null, 1) + ';\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const skript = alsSkript(bauen(fs.readFileSync(QUELLE, 'utf8')));
  if (process.argv.includes('--pruefen')) {
    const ist = fs.existsSync(ZIEL) ? fs.readFileSync(ZIEL, 'utf8') : '';
    if (ist !== skript) { console.log('✗ assets/inhalt.js passt nicht zu docs/INHALT.md — node tools/inhalt-bauen.mjs'); process.exitCode = 1; }
    else console.log('✓ assets/inhalt.js passt zu docs/INHALT.md');
  } else {
    fs.mkdirSync(path.dirname(ZIEL), { recursive: true });
    fs.writeFileSync(ZIEL, skript);
    const d = bauen(fs.readFileSync(QUELLE, 'utf8'));
    console.log(`assets/inhalt.js: ${d.stationen.length} Stationen, ${d.stationen.reduce((n, s) => n + s.schritte.length, 0)} Schritte, ${d.flecken.length} Flecken, ${d.kalender.length} Monate, ${d.leitsaetze.length} Leitsätze, ${d.nieMischen.length} Mischverbote`);
  }
}
