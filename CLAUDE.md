# 整理 Ordnung auf Japanisch — Sitzungs-Anker

Sprechende PWA: führt Raum für Raum durch die Wohnung, liest jeden Schritt vor, zählt mit, bis aus dem
Handgriff eine Gewohnheit wird. Kein Build-Schritt. Plan: `docs/PLAN.md`. Tipps: `docs/INHALT.md`.

## Prüfen

```bash
npm install && npm test     # Syntax · Inhalt · Manifest/Schale · App im echten Browser
```

## Was hier leicht kaputtgeht

- **Der Katalog ist die einzige Quelle.** `assets/inhalt.js` wird aus `docs/INHALT.md` GEBAUT
  (`node tools/inhalt-bauen.mjs`), nie von Hand. `tests/inhalt.mjs` merkt, wenn es vergessen wurde.
  Schritt-Kennungen (`s2.8`) kommen aus der Nummer im Katalog — wer umnummeriert, verwaist den Verlauf.
- **Nichts Persönliches aus den Heften** (Erzählfigur, Familie, Orte, Anekdoten). Die Probe sucht danach.
- **Vorlesen:** `assets/sprechtext.js` schreibt Abkürzungen aus (EL, °C, ⌛ …). Die Probe verlangt, dass
  in KEINER Ansage eine Abkürzung übrig bleibt.
- **DB-Name `OrdnungJP1` nie ändern** — github.io ist eine geteilte Adresse.
- **Manifest-`id` ist `/Ordnung-auf-japanisch/`, nie `./`** (Befund Workflow PDF 2026-10-18).
- **Cache-Bump:** ändert sich eine Datei der Schale, `CACHE_VERSION` in `sw.js` UND ihr `?v=` in
  `index.html` und `sw.js` erhöhen. `tests/manifest-id.mjs` vergleicht beide Listen.
- **Icon:** Platzhalter aus `tools/icon-bauen.mjs`. Klaus' ChatGPT-Bild als `icons/quelle.png` ablegen,
  dann `npm run icons` und `?v=` der Icons erhöhen.
- **`.meldung[hidden]`** braucht eigenes `display:none` — sonst steht ein leerer schwarzer Balken da.
- Die Warnkarte „Nie mischen“ kommt vor Putzschrank, Küche, Bad, Wäsche — einmal je Station und Tag
  (sessionStorage).

## Stand

Stufe 1 (Gerüst) gebaut 2026-10-21: Stationen, Schritte, Abhaken mit Zähler und 習 ab 21×, Sitzung
Schritt für Schritt mit Vorlesen (Gruß auf Japanisch), Jahreskalender mit Haken, Fleckenkarten mit Suche,
Regeln, Verlauf, Rückgängig, hell/dunkel. ⚠ Am Handy nicht gemessen; Stimmen sind in der Probe gestellt.
Einrichten (2026-10-21, Klaus' Wunsch): Räume zählen, Reihenfolge nach Wichtigkeit antippen, Takt wählen;
Profil in `einst/profil`. Ohne Profil zeigt der Start „Willkommen“ statt der Raumliste. „Warum in kleinen
Schritten“ steht als Abschnitt in INHALT.md (aus den Heften gesammelt: 30-Sekunden-Entscheidung, Kiste des
Zweifels, ein Schrank pro Tag …). Japanische Wörter mit Lautschrift in `assets/japanisch.js` — das Kanji je
Raum muss zu `KANJI` in `tools/inhalt-bauen.mjs` passen (`tests/inhalt.mjs` prüft es).
Takt-Uhr (2026-10-21): Arbeit/Pause nach dem Profil, gerechnet mit Endzeiten in localStorage (`oj_takt`),
Pausenfenster 休憩 mit Gong und eigenem Pausenklang (`assets/klang.js`, Web Audio, Hirajōshi, keine Dateien),
Einwirk-Uhren je Schritt bis 120 Min. (`oj_uhren`), Bildschirm wach (WakeLock) während der Sitzung.
`tests/uhr.mjs` spult die Zeit mit `page.clock` vor — die Zeit läuft dabei weiter, Toleranzen sind gewollt.
⚠ Bei ausgeschaltetem Bildschirm bremst Android die Uhr; Gong und Ansage kommen dann erst beim Zurückkommen.
Gute Gewohnheiten (Klaus 2026-10-21, 習慣): 24 Gewohnheiten aus allen Räumen als Tabelle in INHALT.md
(Takt täglich · Woche · Gelegenheit), eigener Bereich `#/gewohnheiten` in der Leiste. Eigene Liste in
`einst/gewohnheiten`, Vorschlag g1/g4/g7 — **wer die Tabelle umsortiert, ändert die Kennungen** (Verlauf und Liste
hängen daran; neue Zeilen nur unten anfügen). Serie = Tage/Wochen in Folge bis heute oder gestern; „jedes Mal“
zählt nicht im Heute-Ring. `tests/gewohnheiten.mjs` spult Tage vor.
Version 1.0 auf main. Noch nicht: Sprachbefehle, Medientasten der Ohrhörer, eigene Musik (Stufen 3–4).
