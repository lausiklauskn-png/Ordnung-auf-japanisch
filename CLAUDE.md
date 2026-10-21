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
- **Icon ist RUND** (Klaus 2026-10-21: „nicht runde Ecken, sondern richtig rundes Icon“). Quelle `icons/quelle.png`
  (sein ChatGPT-Teller), gebaut mit `npm run icons` (`tools/icon-bauen.py`, Pillow). Zwei Plattform-Fassungen
  (Klaus: „eine zweite Variante … für iOS und Android“): Android/PWA rund und durchsichtig, `maskable` deckend auf
  Washi (Launcher schneidet selbst), `icons/android/` für Play Store und Adaptive Icon; iOS deckend, Teller auf WEISS
  wie geliefert (`apple-touch-icon.png`, `icons/ios/AppIcon-1024.png` — iOS erlaubt kein Alpha und rundet selbst
  zu einem Squircle, rund geht dort nicht). In der App der freigestellte Teller (`seiri-480.webp`).
  `tests/manifest-id.mjs` prüft Alpha in Ecke und Mitte jeder Datei. Nach einem neuen Bild `?v=` der Icons erhöhen.
- **📲 Installieren-Knopf ist PFLICHT — Regel für jede App von Klaus** (Klaus 2026-10-21: „Dasselbe
  Chrome-Browser-Installationsproblem wie immer … in jede App mit einbauen, die dann verschwindet“). Chrome bietet die
  Installation nicht verlässlich von selbst an. Darum: `#btnInstall` steht **ohne `hidden` im HTML** (die Kopfzeile
  springt nicht), `beforeinstallprompt` wird abgefangen und auf Tipp gezeigt; ohne Angebot öffnet der Knopf eine
  Anleitung (Chrome ⋮, Samsung Internet, iPhone Safari, Computer). In der installierten App ist er weg
  (`@media (display-mode: standalone)` + `navigator.standalone`, `appinstalled`) — dann bleibt nur **⟳ Aktualisieren**.
  Zusätzlich ein großer Knopf in den Einstellungen. Nach jedem Merge prüfen, dass er da ist (`tests/speicher.mjs` 6b).
- **⟳ Aktualisieren** wie in Workflow PDF: Caches leeren, Service-Worker abmelden, mit `?neu=…` neu laden, die Marke
  danach aus der Adresse nehmen. IndexedDB und localStorage (Verlauf, Räume, Gewohnheiten) bleiben.
- **`.meldung[hidden]`** braucht eigenes `display:none` — sonst steht ein leerer schwarzer Balken da.
- Die Warnkarte „Nie mischen“ kommt vor Putzschrank, Küche, Bad, Wäsche — einmal je Station und Tag
  (sessionStorage).

## Stand

Bilder immer in kleinen Serien (Klaus, 2026-10-21): nur die vorhandene, freigegebene Serie einbauen,
veröffentlichen und Klaus die App zum Aktualisieren geben. Erst nach seiner Gegenprüfung und Freigabe die nächste
Serie bearbeiten. Keine Bilder auf Vorrat erzeugen. Gewünschte helle Naturpalette und braune Glas-Buttons mit
sanftem Wackeln, 3D-Druck und Lichtreflex bei Mausberührung sind vorgemerkt; gesondert nach den Bildern umsetzen.
Komprimierung (Klaus, 2026-10-21): WebP Qualität 80, Methode 6, 1200 × 800, Lanczos, RGB ohne Metadaten;
immer vom Original importieren. Profil im Werkzeug festgelegt, Messung in `docs/BILDER-KOMPRIMIERUNG.md`.
Erste Serie: 353.594 Bytes statt 15.254.079 Bytes PNG (97,68 % kleiner).
Bildserie 1 (2026-10-21): x-willkommen, x-warum, x-pause, x-gewohnheiten, x-kalender, x-flecken, x-regeln,
x-verlauf eingebaut (8 von 148), fünf fehlende Verbindungen zum Seitenkopf ergänzt. ⚠ Darstellung am echten
Handy, reale Stimmen und Kaltstart der installierten PWA nicht gemessen; Gegenprüfung durch Klaus steht aus.
Prüfung dieser Serie: vollständiges `npm test` auf GitHub grün (Lauf 39636985993); Ausgangsstand ebenfalls grün.
Gegenprobe mit absichtlich fehlenden Bildköpfen liefert eigene rote Prüfzeilen.

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
Version 1.0 auf main.
1.1 (Klaus 2026-10-21 nachmittags): „Die 5 Reinigungsmittel“ (Schritt 0.1 und eigene Seite `#/mittel` aus der
Tabelle in INHALT.md; Texte nennen das Mittel beim Namen) · ← Zurück in der Kopfzeile überall, in der Sitzung
nie gesperrt (vom ersten Schritt in den letzten des vorigen Raums) · Sitzung schreibt den Schritt in die Adresse
(`history.replaceState`), Neuladen setzt fort · ⟳ Aktualisieren = neueste Fassung laden wie „Neu laden“, Daten
bleiben (`aktualisieren()`, Meldung danach) · „Alles löschen und neu anfangen“ mit Rückfrage (`DB.allesLoeschen`)
· Verlauf mit „Deine Entwicklung“ und Monatskalender · „Was möchtest du heute tun?“ (tippen oder 🎤,
`assets/absicht.js`: Stichwörter je Raum, ohne KI, ohne Netz) · Bildplätze hinter Texten (`bilder/`, nur
Kennungen aus `inhalt.js` → `bilder`), Text auf heller Verlaufsfläche · Wörterliste ohne Überlagerung bei 320 px.
Bilder kommen von ChatGPT über `docs/CHATGPT-BRIEF.md` (gebaut aus `docs/BILD-MOTIVE.md`; Grundsatz 間 ma).
Übergabe an andere Sitzungen: `AGENTS.md` (Codex/ChatGPT), Veröffentlichen und Schlüssel: `docs/VEROEFFENTLICHEN.md`.
Proben: `tests/speicher.mjs`, `tests/absicht.mjs`. ⚠ Spracheingabe nur gestellt gemessen; am Handy ungemessen.
1.2 (2026-10-21 abends): 📲 Installieren-Knopf (Regel oben), gründliches ⟳, Zahlen in „Deine Entwicklung“ sind Knöpfe mit
Liste darunter (Tage, Haken, Schritte nach Raum, Räume, Weg zu 習, Kalender je Monat), Bilder-Werkzeug für Codex.
⚠ Nach dem Merge von 1.2 (#7) startete GitHub **keinen** Lauf „pages build and deployment“ — die Seite blieb auf 1.1.
Wie bei Workflow PDF: nach jedem Merge den Lauf in Actions ansehen; fehlt er, stößt ein weiterer Commit auf `main` ihn an.
Noch nicht: Sprachbefehle während der Sitzung, Medientasten der Ohrhörer, eigene Musik, native Android-Hülle.
