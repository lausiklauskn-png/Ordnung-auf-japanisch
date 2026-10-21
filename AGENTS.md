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
- Jede neue Funktion bekommt eine Probe in `tests/` (Browser über `playwright-core`, Chromium unter
  `/opt/pw-browsers/…` oder das System-Chromium). Gegenprobe: die Funktion absichtlich kaputt machen, die Probe
  muss mit einer eigenen roten Zeile reagieren.
- Arbeit geht über einen Zweig und einen Pull Request nach `main`. `main` wird von GitHub Pages ausgeliefert.

## Veröffentlichen und Schlüssel

Siehe **`docs/VEROEFFENTLICHEN.md`**. Kurz: Die PWA braucht keinen Schlüssel (Merge nach `main` genügt). Für eine
spätere Android-App liegt der Signierschlüssel **nur verschlüsselt** im Repo und wird **nur in GitHub Actions**
geöffnet — jede Sitzung (Claude oder Codex) braucht dafür nur Push-Recht, nie das Passwort. Keine Schlüssel,
Passwörter oder Tokens in Commits, Chats oder Logs.

## Am Ende jeder Sitzung

`CLAUDE.md` → Abschnitt „Stand“ nachziehen (was gebaut, was gemessen, was nicht gemessen), PR beschreiben,
nach dem Merge den Lauf „pages build and deployment“ ansehen.
