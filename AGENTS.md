# AGENTS.md — für ChatGPT/Codex und jede andere Sitzung

Dieses Repo wird abwechselnd von **Claude Code** und **ChatGPT/Codex** bearbeitet. Beide arbeiten nach denselben
Regeln — die stehen **in `CLAUDE.md`** (Sitzungs-Anker: Prüfen, was leicht kaputtgeht, Stand). Lies sie zuerst und
vollständig; diese Datei wiederholt nur das Nötigste und verweist.

## Zuerst

```bash
git fetch origin && git checkout -B <dein-zweig> origin/main   # immer frisch von main
npm install && npm test                                         # alles muss grün sein, vorher und nachher
```

## Die Regeln in Kürze (Einzelheiten in CLAUDE.md)

- Sprache im Repo und in der App: **Deutsch**, einfach und kurz. Namen: App „整理 · Ordnung auf Japanisch“.
- **Einzige Quelle der Tipps ist `docs/INHALT.md`.** `assets/inhalt.js` wird gebaut: `node tools/inhalt-bauen.mjs`.
  Nichts Persönliches aus den Begleitheften (Erzählfigur, Familie, Orte).
- Bilder: `bilder/<Kennung>.webp`; Motive `docs/BILD-MOTIVE.md` → Brief `node tools/brief-bauen.mjs`.
  Grundsatz 間 ma: wenig Dinge, viel Leere, nie überladen.
- Ändert sich eine Datei der App-Schale: `CACHE_VERSION` in `sw.js` und das `?v=` in `index.html` und `sw.js` erhöhen.
- Nie umbenennen: IndexedDB `OrdnungJP1`, Manifest-`id` `/Ordnung-auf-japanisch/`.
- **📲 Installieren-Knopf bleibt immer drin** (Regel für alle Apps von Klaus): im Browser sichtbar, in der installierten
  App weg, dann nur ⟳ Aktualisieren. Einzelheiten in CLAUDE.md. Nie entfernen.
- Jede neue Funktion bekommt eine Probe in `tests/` (Browser über `playwright-core`, Chromium unter
  `/opt/pw-browsers/…` oder das System-Chromium). Gegenprobe: die Funktion absichtlich kaputt machen, die Probe
  muss mit einer eigenen roten Zeile reagieren.
- Arbeit geht über einen Zweig und einen Pull Request nach `main`. `main` wird von GitHub Pages ausgeliefert.

## Bilder einfügen — die Schlüssel sind die Kennungen

Jedes Bild gehört zu genau einer **Kennung** (`s2.1` = Schritt 2.1, `st3` = Raum Bad, `m1` = Essig, `g7` =
Gewohnheit, `k10` = Oktober, `x-pause` = Pausenfenster). Die vollständige Liste mit Text und Motiv steht in
`docs/CHATGPT-BRIEF.md`; **was schon eingebaut ist und was fehlt, steht in `docs/BILDER-STAND.md`** — das ist das
Gedächtnis zwischen den Sitzungen, nicht von Hand ändern.

```bash
python3 tools/bilder-einfuegen.py <ordner-mit-bildern>     # Dateiname beginnt mit der Kennung: "s2.1 Spüle.png"
#  → bilder/<Kennung>.webp (1200 × 800), assets/inhalt.js und docs/BILDER-STAND.md werden nachgezogen
#  → unbekannte Namen werden abgewiesen und genannt (Rückgabe 1): Kennung im Dateinamen korrigieren
```

Danach `CACHE_VERSION` in `sw.js` um eins erhöhen, `npm test`, PR nach `main`, mergen. Bilder nie über den Grundsatz
間 ma hinwegsetzen: wenige Dinge, viel Leere, nichts Reißerisches — passt ein Bild nicht, lieber weglassen und in
der PR-Beschreibung nennen.

## Veröffentlichen und Schlüssel

Siehe **`docs/VEROEFFENTLICHEN.md`**. Kurz: Die PWA braucht keinen Schlüssel (Merge nach `main` genügt). Für eine
spätere Android-App liegt der Signierschlüssel **nur verschlüsselt** im Repo und wird **nur in GitHub Actions**
geöffnet — jede Sitzung (Claude oder Codex) braucht dafür nur Push-Recht, nie das Passwort. Keine Schlüssel,
Passwörter oder Tokens in Commits, Chats oder Logs.

## Am Ende jeder Sitzung

`CLAUDE.md` → Abschnitt „Stand“ nachziehen (was gebaut, was gemessen, was nicht gemessen), PR beschreiben,
nach dem Merge den Lauf „pages build and deployment“ ansehen.
