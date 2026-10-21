// Kompakte Offline-Datei aus den gespeicherten, nachprüfbaren Sprachfassungen bauen.
import fs from 'node:fs';
import { katalog } from './sprachkatalog.mjs';
const sprachen = ['en', 'ru', 'ja', 'es', 'pl'];
const quellen = katalog(), daten = {};
const korrekturen = JSON.parse(fs.readFileSync('docs/uebersetzungen/korrekturen.json', 'utf8'));
let fehler = 0;
for (const code of sprachen) {
  const pfad = `docs/uebersetzungen/${code}.json`;
  const texte = { ...(fs.existsSync(pfad) ? JSON.parse(fs.readFileSync(pfad, 'utf8')) : {}), ...korrekturen[code] };
  daten[code] = quellen.map(q => {
    if (typeof texte[q] !== 'string' || !texte[q].trim()) { console.error(`Fehlt (${code}): ${q}`); fehler++; return q; }
    if (/\n|[\[【]\s*[A-ZА-Я]{1,3}\s*\d{3,4}[\]】]|98765\d{4}/iu.test(texte[q])) { console.error(`Übertragungsfehler (${code}): ${q}`); fehler++; }
    const token = s => [...s.matchAll(/__OJ_\d+__/g)].map(m => m[0]).sort().join('|');
    if (token(q) !== token(texte[q])) { console.error(`Platzhalter verändert (${code}): ${q}`); fehler++; }
    return texte[q];
  });
}
if (fehler) { process.exitCode = 1; }
else {
  const inhalt = '// GEBAUT aus docs/uebersetzungen mit tools/sprachen-bauen.mjs — nicht von Hand ändern.\nwindow.OJ_SPRACHEN = ' + JSON.stringify({ quellen, sprachen: daten }) + ';\n';
  if (process.argv.includes('--pruefen')) {
    if (fs.readFileSync('assets/sprachen.js', 'utf8') !== inhalt) { console.error('✗ Sprachdatei nicht aktuell'); process.exitCode = 1; }
    else console.log('✓ Vollständige Offline-Sprachen und Platzhalter geprüft');
  } else { fs.writeFileSync('assets/sprachen.js', inhalt); console.log(`${quellen.length} Texte in fünf Zielsprachen, ${Buffer.byteLength(inhalt)} Bytes`); }
}
