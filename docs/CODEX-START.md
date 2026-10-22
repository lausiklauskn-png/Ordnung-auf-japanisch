# Text für die nächste Bilder-Sitzung (zum Kopieren)

> Repo: lausiklauskn-png/Ordnung-auf-japanisch · Arbeitszweig frisch von `main`

```
Du arbeitest am Repo lausiklauskn-png/Ordnung-auf-japanisch (PWA „整理 · Ordnung auf Japanisch“).
Lies zuerst AGENTS.md und CLAUDE.md vollständig. Lies danach docs/SITZUNGSBRIEF-BILDER.md,
docs/BILDER-STAND.md und die betreffenden Motive in docs/CHATGPT-BRIEF.md. Dann:

1. git fetch origin && git checkout -B codex/bilder origin/main
2. npm install && npm test  (muss grün sein)
3. Prüfe den Brief gegen den aktuellen Stand: vorhandene Bilder nicht erneut erzeugen.
4. Erzeuge die nächsten zehn fehlenden Bilder aus dem Sitzungsbrief im selben freigegebenen Stil.
   Sieh dir vorhandene Bilder als Referenz an. Behalte die weichen Bild-/Containerübergänge bei.
   Originale außerhalb des Repos mit ihrer exakten Kennung ablegen und importieren:
     python3 tools/bilder-einfuegen.py <ordner>
   Abgewiesene Dateien: Kennung prüfen und mir nennen, nicht raten.
5. CACHE_VERSION in sw.js um eins erhöhen, npm test, Pull Request nach main mit der Liste der eingefügten
   Kennungen und dem neuen Stand („x von 148“). Nach dem Merge den Lauf „pages build and deployment“ ansehen.
6. Komprimierung wie festgelegt: WebP 80/Methode 6, 1200 × 800, Lanczos, RGB ohne Metadaten.
   Größen aller Bilder und der neuen Serie, größte Datei, Hochrechnung auf 148 und Repo-/Seitengröße
   messen. docs/BILDER-KOMPRIMIERUNG.md fortschreiben; Qualität nur bei begründetem Bedarf ändern.
7. CLAUDE.md unter „Stand“ aktualisieren: welche Bilder, wann, was gemessen/nicht gemessen ist.
8. Vor Sitzungsende docs/SITZUNGSBRIEF-BILDER.md mit echtem Stand und den NÄCHSTEN zehn fehlenden
   Kennungen erneuern. Bei knappem Kontext vorher sichern, auch Teilfortschritt nennen.
   Nach einer Serie aufhören und mir die aktualisierte App geben. Jede Folgesitzung macht wieder
   einen Brief für die darauffolgende Zehnerserie, bis alle 148 fertig sind.

Grundsatz für die Bilder: 間 ma — wenige Dinge, viel Leere, nie überladen, nie reißerisch.
Keine Schlüssel, Passwörter oder Tokens in Commits oder Chats.
```

**Was „Schlüssel“ hier heißt:** Die Kennung jedes Bildes (`s2.1`, `st3`, `g7` …) ist der Schlüssel, unter dem es
abgelegt wird. Gemerkt wird alles im Repo selbst (`docs/BILDER-STAND.md`, `assets/inhalt.js`) — jede neue Sitzung
sieht sofort, was fertig ist. Ein Zugangsschlüssel (Token) wird nicht weitergegeben: Codex arbeitet mit seiner
eigenen GitHub-Verbindung, die du in Codex einmal mit dem Repo verknüpfst.
