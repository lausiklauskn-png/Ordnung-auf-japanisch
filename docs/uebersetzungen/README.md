# Offline-Sprachfassungen

Deutsch bleibt die Quelle: Tipps in `docs/INHALT.md`, Oberfläche in `assets/app.js` und `index.html`.
Kennungen, Zeitwerte und gespeicherte Taktwerte werden nicht übersetzt.

Sprachen: Deutsch, Englisch, Russisch, Japanisch, Spanisch und Polnisch. Auswahl oben über 文, gespeichert
in `oj_sprache`. Ein Sprachwechsel lädt die aktuelle Ansicht neu; Verlauf, Räume, Gewohnheiten und Uhren bleiben.
Japanische Schriftzeichen, Kana und Umschrift behalten ihre Bedeutung und ihre japanische Aussprache.
Die Silbenhilfe ist weiterhin für deutsche Aussprache geschrieben; andere Sprachfassungen erklären dies.

`quellen.json` wird durch `tools/sprachkatalog.mjs` gewonnen. Die fünf Sprachdateien enthalten feste
Erstübersetzungen mit Google Übersetzer (2026-10-21). Fachbegriffe, die vollständigen neun Mischwarnungen je
Sprache und kurze Navigationsnamen wurden in `korrekturen.json` gesondert formuliert. Diese Korrekturen haben
beim Bauen Vorrang. Sprachliche Gegenprüfung durch Muttersprachler steht aus; technische Proben messen
Vollständigkeit, Platzhalter, Zahlen, Hervorhebungen und Funktion, keine allgemeine Übersetzungsqualität.

```bash
npm install
npm run sprachen
npm test
```

Der Bau verlangt jeden Text in jeder Zielsprache. Platzhalter `__OJ_0__` usw. müssen erhalten bleiben;
ihre Reihenfolge darf sich an die Zielsprache anpassen. Änderungen an deutschen Tipps werden zuerst im
Katalog gemacht und mit `npm run inhalt` gebaut. Danach Sprachdateien ergänzen und neu bauen.
`assets/sprachen.js` ist erzeugt und wird nicht von Hand bearbeitet.

`tools/uebersetzungen-holen.py` ist nur ein Werkzeug für eine neue maschinelle Erstübersetzung. Es nutzt
Netzzugriff auf den öffentlichen Übersetzungsendpunkt, keine Schlüssel, keine persönlichen Daten.
Bereits gespeicherte Texte werden wiederverwendet. Es läuft weder beim Start noch beim normalen Bauen der App.

Die App lädt die kompakte Sprachdatei aus dem eigenen Offline-Vorrat. Keine fremden Skripte, keine API,
kein Übersetzungsabruf zur Laufzeit. Für das Vorlesen wird eine installierte Stimme der gewählten Sprache
bevorzugt; japanische Begriffe behalten `ja-JP`. Ob eine Stimme ohne Netz verfügbar ist, bestimmt das Gerät.
