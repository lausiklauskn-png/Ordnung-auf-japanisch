// Baut docs/CHATGPT-BRIEF.md: der Übergabebrief an ChatGPT für die Bilder hinter den Texten.
// Quellen: docs/BILD-MOTIVE.md (Motiv je Kennung) + docs/INHALT.md (der Text, der in der App auf dem Bild steht).
// Aufruf: node tools/brief-bauen.mjs  ·  --pruefen: nur vergleichen (tests/brief.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bauen } from './inhalt-bauen.mjs';

const W = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = path.join(W, 'docs/CHATGPT-BRIEF.md');

export function motive(md) {
  const m = new Map();
  for (const z of md.split('\n')) {
    const t = z.match(/^- \*\*Bild (\S+) – (.+?):\*\* (.+)$/);
    if (t) m.set(t[1], { titel: t[2], motiv: t[3] });
  }
  return m;
}

// alle Bereiche der App, die ein Bild bekommen: Kennung, Gruppe, Titel, Text (wie in der App)
export function bereiche(d) {
  const kurz = t => t.replace(/\s+/g, ' ').trim();
  const l = [];
  const sonder = [
    ['x-willkommen', 'Willkommen', 'Drei kurze Fragen, dann geht es los: Welche Räume hast du? Wo möchtest du anfangen? Wie lange am Stück?'],
    ['x-warum', 'Warum in kleinen Schritten?', d.warumKurz.map(w => w.satz).join(' ')],
    ['x-pause', 'Pause (休憩)', 'Großer Hintergrund der Pause: Uhr und Kanji liegen in der Mitte darüber.'],
    ['x-gewohnheiten', 'Gute Gewohnheiten (習慣)', 'Kopf der Seite mit den kleinen Handgriffen, die man immer macht.'],
    ['x-kalender', 'Jahreskalender (暦)', d.kalenderEinleitung],
    ['x-flecken', 'Fleckenkarten (染)', d.fleckenRegeln],
    ['x-regeln', 'Regeln (規)', d.leitsaetze.join(' ')],
    ['x-verlauf', 'Verlauf (歴)', 'Was wann erledigt wurde, Tag für Tag, mit Monatskalender.'],
  ];
  for (const [id, titel, text] of sonder) l.push({ id, gruppe: 'Sonderseiten', titel, text: kurz(text) });
  for (const s of d.stationen) l.push({ id: 'st' + s.nr, gruppe: 'Räume', titel: `${s.titel} (${s.kanji})`, text: `Kopfbild des Raums. ${s.schritte.length} Schritte: ${s.schritte.map(x => x.titel).join(', ')}.` });
  d.mittel.forEach((m, i) => l.push({ id: 'm' + (i + 1), gruppe: 'Die 5 Reinigungsmittel', titel: m.name, text: kurz(`${m.was} Löst: ${m.loest}. Nie auf: ${m.nie}.`) }));
  for (const s of d.stationen) for (const x of s.schritte) l.push({ id: x.id, gruppe: `Schritte · ${s.nr} ${s.titel}`, titel: `${x.nr} ${x.titel}`, text: kurz(x.text) });
  for (const g of d.gewohnheiten) l.push({ id: g.id, gruppe: 'Gute Gewohnheiten', titel: g.titel, text: kurz(`${g.wann}: ${g.handgriff} Warum: ${g.warum}`) });
  for (const k of d.kalender) l.push({ id: 'k' + String(k.monat).padStart(2, '0'), gruppe: 'Jahreskalender', titel: `${k.name} — ${k.motto}`, text: kurz(k.aufgaben.map(a => a.text).join(' · ')).slice(0, 600) });
  return l;
}

export function brief(d, mot) {
  const l = bereiche(d);
  const fehlt = l.filter(b => !mot.has(b.id)).map(b => b.id);
  if (fehlt.length) throw new Error('Motiv fehlt für: ' + fehlt.join(', '));
  const gruppen = [...new Set(l.map(b => b.gruppe))];
  return `# Übergabebrief an ChatGPT — Bilder für „整理 Ordnung auf Japanisch“

> GEBAUT mit \`node tools/brief-bauen.mjs\` aus \`docs/BILD-MOTIVE.md\` und \`docs/INHALT.md\` — nicht von Hand ändern.
> ${l.length} Bilder. Klaus kopiert diesen Brief in ChatGPT (ganz oder gruppenweise).

---

## 1 · Worum es geht

„整理 Ordnung auf Japanisch“ ist eine sprechende App (PWA), die Schritt für Schritt durch die Wohnung führt,
jeden Schritt vorliest und mitzählt, bis aus einem Handgriff eine Gewohnheit wird. Gestaltung: japanisch,
ruhig — Washi-Papier, Tusche, Lackrot, Pinselkreis (Enso). Das App-Icon ist ein runder Teller mit den Zeichen
整理 in glänzendem schwarzem Lack.

**Deine Aufgabe:** Zu jedem Bereich unten **ein Bild**, das in Bildern zeigt, was der Text sagt. Die **Texte stehen
fest** (sie kommen aus der App) — bitte nicht umschreiben, nur die Bilder machen.

## 2 · Wie die App das Bild zeigt (wichtig für den Bildaufbau)

- Das Bild liegt **hinter dem Text** einer Karte. **Oben** ist es frei zu sehen (etwa das obere Drittel), nach
  unten blendet die App es in eine helle Papierfläche über; dort steht der Text.
- Deshalb: **Hauptmotiv in die obere Hälfte**, etwas nach rechts versetzt. Die **untere Hälfte ruhig, hell und
  einfach** (Holz, Papier, Leinen, viel Raum) — keine wichtigen Details dort.
- Die App lässt das Bild sehr langsam „atmen“ (leichter Zoom). Darum **an allen Rändern etwa 8 % Luft**, nichts
  Wichtiges am Rand.
- Die Bilder müssen auch klein auf dem Handy (ca. 360 px breit) erkennbar sein: **ein klares Motiv**, nicht
  viele kleine Dinge.

## 3 · Stil (für ALLE Bilder gleich)

**Der wichtigste Grundsatz — 間 (ma), die Leere:** Das Nichts hebt das Wertvolle hervor. Jedes Bild zeigt **wenig**:
ein Hauptgegenstand, höchstens zwei, drei Dinge — und **viel freien, ruhigen Raum** (mindestens die Hälfte des
Bildes ist leere Fläche: Papier, Holz, Wand, Licht). Nie überladen, nie reißerisch, keine dramatische
Inszenierung, keine grellen Farben, kein Effekt. Das Bild darf das Thema nicht überlagern; es schafft eine
angenehme, stille Atmosphäre wie in einem japanischen Zuhause, in dem nur steht, was gebraucht und geschätzt
wird. Wenn ein Motiv unten mehrere Dinge nennt, nimm das Wesentliche und lass den Rest weg.

Fotorealistisches, stilles Stillleben, japanische Ästhetik (wabi-sabi, ma, schlicht): helles Naturholz, warmes
elfenbeinfarbenes Washi-Papier, Leinen, Keramik, Glas. Weiches Tageslicht von links, sanfte Schatten, leichte
Tiefenunschärfe. Farben: Elfenbein, Naturholz, Tuschschwarz, ein kleiner Akzent in Lackrot. Menschen nur als
Hände, keine Gesichter. Keine Markenlogos. **Kein lesbarer Text, keine Buchstaben, keine Zahlen im Bild** —
Etiketten nur als schlichte Striche oder ein kleiner roter Stempel. Sicherheit zeigen, wo der Text warnt
(Handschuhe, offenes Fenster), nie Gefährliches (keine zwei Reiniger zusammen, keine Leiter auf Glas).

## 4 · Format und Abgabe

- **Querformat 3:2, 1536 × 1024 px**, PNG oder WebP.
- **Dateiname = Kennung**, genau wie unten: \`s2.1.png\`, \`st3.png\`, \`m1.png\`, \`g7.png\`, \`k10.png\`, \`x-pause.png\`.
- Gruppenweise arbeiten (eine Überschrift unten = eine Runde). Nach jeder Runde eine Liste:
  „Kennung – fertig“ oder „Kennung – nachbessern, weil …“.
- Klaus lädt die Bilder bei Claude Code hoch; dort werden sie verkleinert (WebP) und in \`bilder/\` abgelegt.

## 5 · Die Bereiche (${l.length})

${gruppen.map(g => `### ${g}\n\n${l.filter(b => b.gruppe === g).map(b => `**${b.id}** — ${b.titel}\n- Text in der App: ${b.text}\n- Bild: ${mot.get(b.id).motiv}\n`).join('\n')}`).join('\n')}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const d = bauen(fs.readFileSync(path.join(W, 'docs/INHALT.md'), 'utf8'));
  const text = brief(d, motive(fs.readFileSync(path.join(W, 'docs/BILD-MOTIVE.md'), 'utf8')));
  if (process.argv.includes('--pruefen')) {
    const ok = fs.existsSync(ZIEL) && fs.readFileSync(ZIEL, 'utf8') === text;
    console.log(ok ? '✓ docs/CHATGPT-BRIEF.md ist aktuell' : '✗ docs/CHATGPT-BRIEF.md veraltet — node tools/brief-bauen.mjs');
    process.exitCode = ok ? 0 : 1;
  } else { fs.writeFileSync(ZIEL, text); console.log('docs/CHATGPT-BRIEF.md: ' + bereiche(d).length + ' Bilder'); }
}
