# Text für eine neue Codex-Sitzung (zum Kopieren)

> Repo: lausiklauskn-png/Ordnung-auf-japanisch · Arbeitszweig frisch von `main`

```
Du arbeitest am Repo lausiklauskn-png/Ordnung-auf-japanisch (PWA „整理 · Ordnung auf Japanisch“).
Lies zuerst AGENTS.md und CLAUDE.md vollständig — dort stehen alle Regeln. Dann:

1. git fetch origin && git checkout -B codex/bilder origin/main
2. npm install && npm test  (muss grün sein)
3. Lies docs/BILDER-STAND.md: welche Kennungen schon ein Bild haben, welche fehlen.
4. Ich gebe dir Bilder (aus ChatGPT, nach docs/CHATGPT-BRIEF.md). Jede Datei beginnt mit ihrer Kennung,
   z. B. „s2.1 Spüle am Abend.png“. Lege sie in einen Ordner und führe aus:
     python3 tools/bilder-einfuegen.py <ordner>
   Abgewiesene Dateien: Kennung prüfen und mir nennen, nicht raten.
5. CACHE_VERSION in sw.js um eins erhöhen, npm test, Pull Request nach main mit der Liste der eingefügten
   Kennungen und dem neuen Stand („x von 148“). Nach dem Merge den Lauf „pages build and deployment“ ansehen.
6. Am Ende in CLAUDE.md unter „Stand“ eine Zeile: welche Bilder, wann, was nicht gemessen ist.

Grundsatz für die Bilder: 間 ma — wenige Dinge, viel Leere, nie überladen, nie reißerisch.
Keine Schlüssel, Passwörter oder Tokens in Commits oder Chats.
```

**Was „Schlüssel“ hier heißt:** Die Kennung jedes Bildes (`s2.1`, `st3`, `g7` …) ist der Schlüssel, unter dem es
abgelegt wird. Gemerkt wird alles im Repo selbst (`docs/BILDER-STAND.md`, `assets/inhalt.js`) — jede neue Sitzung
sieht sofort, was fertig ist. Ein Zugangsschlüssel (Token) wird nicht weitergegeben: Codex arbeitet mit seiner
eigenen GitHub-Verbindung, die du in Codex einmal mit dem Repo verknüpfst.
