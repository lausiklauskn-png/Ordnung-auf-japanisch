# Sitzungsbrief: nächste zehn Bilder

Stand: 2026-10-22 · Repo `lausiklauskn-png/Ordnung-auf-japanisch` · Serie 3 importiert, Veröffentlichung noch offen.

## Auftrag und Übergabe an jede Folgesitzung

Klaus hat die Fortsetzung in Zehnerserien bis zu allen 148 Bildern beauftragt. Pro Sitzung eine Serie,
veröffentlichen, die App zur Gegenprüfung geben, diesen Brief für die darauffolgenden zehn erneuern.
Bei knappem Kontext den Brief frühzeitig mit Teilfortschritt sichern. Nicht alle restlichen Bilder auf einmal
erzeugen. Nach jeder Serie auch die Größenkontrolle fortschreiben. Bei 148/148 Abschlussbericht erstellen.

Zuerst **AGENTS.md und CLAUDE.md vollständig lesen**, dann den Brief gegen den aktuellen
`docs/BILDER-STAND.md` abgleichen. Dieser Brief ist eine Momentaufnahme; vorhandene Kennungen nie doppelt
erzeugen. Texte/Motive ausschließlich aus `docs/INHALT.md`, `docs/BILD-MOTIVE.md` und dem daraus gebauten
`docs/CHATGPT-BRIEF.md` beziehen. Keine Tipps umschreiben.

## Tatsächlicher Stand dieser Sitzung

- **28 von 148 importiert**, 120 fehlen. Vor Veröffentlichung weiterhin nur 18 auf main.
- Serie 3: s1.2–s1.8, st2, s2.1, s2.2. Zehn Originale erzeugt und über das Importwerkzeug eingebaut;
  keine abgewiesene Kennung. s1.3 vor Import auf drei vollständige Pantoffelpaare korrigiert.
- PR [#17](https://github.com/lausiklauskn-png/Ordnung-auf-japanisch/pull/17), Zweig `codex/bilder-serie3`.
  Bildcommit `6e9324496f04f1ef94e3687c7d52c0c95a8014cd`. **Merge und Pages noch offen.**
- Ausgangsprüfung vollständig grün: Lauf 39790788328. Vollständiges npm test nach Import grün: Lauf 39792885767.
  Erster Nachlauf entdeckte eine veraltete Testannahme in tests/speicher.mjs (s2.2 ohne Bild);
  der bildlose Testfall wird jetzt unabhängig vom echten Bestand gestellt.
- 65 Bildproben grün; Gegenprobe ohne Bildliste liefert 37 eigene rote Zeilen, darunter alle neuen Kennungen.
  Vollständige Prüfung und Gegenprobe: Lauf 39792885767 erfolgreich. Temporärer Workflow vor Merge entfernt.
- Cache im Zweig v21, Inhalt v7, in index.html und sw.js synchron.
- Originale: `/workspace/bilder-eingang/serie3/<Kennung>.png`, zusätzlich Generatorausgaben unter
  `/workspace/generated_images/`. Nicht erneut erzeugen, solange diese Dateien verfügbar sind.
- App: <https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/>. Erst nach erfolgreichem Merge und Pages
  als aktualisiert melden. Installieren-Knopf und bestehende Gestaltung erhalten.

## Nächste Serie nach erfolgreicher Veröffentlichung

Erst die offenen Prüf-/Veröffentlichungsschritte von Serie 3 abschließen. Danach in der nächsten Sitzung
mit s2.3–s2.12 fortsetzen. Aktuelle Originaltexte in docs/CHATGPT-BRIEF.md lesen, keine Tipps umschreiben.

| Reihenfolge | Kennung | Thema | Motiv |
|---|---|---|---|
| 1 | s2.3 | Schwamm und Bürste | Holz-Spülbürste aufrecht zum Trocknen in einem Keramikbecher. |
| 2 | s2.4 | Abtropfgestell | Leeres trockenes Abtropfgestell aus Holz und Edelstahl, saubere Schale darunter. |
| 3 | s2.5 | Spülmaschine | Voll und ordentlich eingeräumte Spülmaschine; Teller abgekratzt, nicht vorgespült. |
| 4 | s2.6 | Kochfeld | Glasschaber auf schwarzem Glaskeramikfeld, Sprühflasche mit klarer Lösung daneben. |
| 5 | s2.7 | Dunstabzug | Metall-Fettfilter in einer Wanne mit warmem Wasser, Handschuhe daneben. |
| 6 | s2.8 | Backofen | Offene Backofentür; weiße Natronpaste auf dem Ofenboden, Spachtel daneben. |
| 7 | s2.9 | Mikrowelle | Glasschüssel mit Wasser in der Mikrowelle, Holzlöffel darin. |
| 8 | s2.10 | Kühlschrank | Geordneter offener Kühlschrank, flache Glasdosen mit Kreppstreifen, kleines Natron-Schälchen. |
| 9 | s2.11 | Töpfe und Bretter | Holzschneidebrett mit grobem Salz und halber Zitrone, danach hochkant zum Trocknen. |
| 10 | s2.12 | Müll | Ausgespülter Joghurtbecher, Aludeckel vollständig abgetrennt daneben; getrennte Behälter hinten. |

Erwarteter Endstand der nächsten Sitzung: **38 von 148**, sofern nichts anderweitig ergänzt wurde.
Danach beginnt die folgende Serie mit s2.13, st3 und s3.1–s3.8. Gegen den tatsächlichen Bestand prüfen.

## Stil und Container unbedingt erhalten

Vor dem Erzeugen direkt ansehen: `bilder/x-willkommen.webp`, `bilder/x-warum.webp`, `bilder/st1.webp`
und `bilder/s1.1.webp`. Klaus hat diese Bildsprache ausdrücklich freigegeben.

Fotorealistisches stilles Stillleben/japanischer Raum, warmes Elfenbein, helles Naturholz, Leinen,
Glas/Keramik, weiches Tageslicht von links; beim Küchen-Abendmotiv warmes ruhiges Abendlicht.
Wabi-sabi und **間 ma**: wenige Dinge, viel Leere, kein überladenes Arrangement. Keine Gesichter,
Logos, lesbaren Buchstaben oder Zahlen. Hände sind möglich. Etiketten nur neutrale Striche oder kleiner
roter Akzent. Keine Gefahren erfinden oder Reiniger mischen.

Originalformat 1536 × 1024 (3:2). Hauptmotiv oben, leicht rechts; unten mindestens etwa die halbe Fläche
hell und ruhig für den Text, rundum Luft. Die App rendert Schrift und weiche Übergänge selbst:
keine Rahmen oder Bedienoberfläche ins Bild malen. `.mit-bild`, `.kbild` und deren Verläufe beibehalten;
Text bleibt teilweise im Bild, obere/seitliche Ränder laufen ins gewählte Hintergrundthema aus.
Die aktuelle App zeigt die Motive ruhig ohne Zoom; der ältere Zoom-Hinweis im Bildbrief ist überholt.

## Import, Komprimierung und Prüfung

1. Frisch von main arbeiten, z. B. `git fetch origin && git checkout -B codex/bilder-serie4 origin/main`.
   `npm install && npm test` muss vor und nach der Arbeit grün sein.
2. Originale außerhalb des Repos ablegen, z. B. `../bilder-eingang/serie4/s1.2.png`.
   Exakte Kennungen verwenden; keine spekulativen Umbenennungen. Originale erhalten.
3. `python3 tools/bilder-einfuegen.py ../bilder-eingang/serie4` ausführen. Abgewiesene Namen Klaus nennen,
   Kennung prüfen. `assets/inhalt.js` und `docs/BILDER-STAND.md` nur durch die Werkzeuge aktualisieren.
4. Profil unverändert: **WebP Qualität 80, Methode 6, 1200 × 800, Lanczos, RGB ohne Metadaten**.
   Details und Messverfahren: `docs/BILDER-KOMPRIMIERUNG.md`. Nicht aus vorhandenen WebP neu komprimieren.
5. Cache um eins erhöhen, `?v=` des geänderten Inhalts in index.html UND sw.js synchron erhöhen.
   Der Cache-Test in `tests/sprachen.mjs` muss zum neuen Cache passen. Bestehende Tests erhalten.
6. Motive bei ihren Texten in Raum- und Schrittansicht prüfen, auch kleine Breiten und weiche Übergänge.
   Vorhandene Proben nutzen; neue Funktionen brauchen eine eigene Probe samt absichtlich roter Gegenprobe.
7. PR nach main mit eingefügten/abgewiesenen Kennungen und neuem Stand. Mergen, danach den Lauf
   „pages build and deployment“ für den Merge-Commit bis zum Ergebnis ansehen.

In der letzten Umgebung waren lokale Netzwerk-/Browserstarts eingeschränkt. Falls das wieder so ist,
GitHub-Verbindung und GitHub Actions verwenden, statt auf unbeantwortete Berechtigungsdialoge zu warten.
Bewährter Prüfserver: ubuntu-latest, Node 22, Pillow, npm install, `npx playwright-core install chromium`,
danach npm test. Browserbibliotheken waren dort vorhanden; eine zusätzliche Systempaket-Aktualisierung
hatte lange gedauert. Temporären Prüfworkflow vor Merge wieder entfernen, Prüfnachweis im PR festhalten.
Keine Schlüssel, Passwörter, Tokens oder Umgebungs-Dumps in Brief, Commit oder Chat.

## Größenkontrolle nach Serie 3

Alle 28 WebP **1.234.278 Bytes**, Mittel **44.081,36 Bytes/Bild**, Maximum **83.250 Bytes** (s1.2).
Neue zehn: **516.982 Bytes WebP** aus **20.263.394 Bytes PNG** (97,45 % kleiner).
Profil unverändert: WebP 80/Methode 6, 1200 × 800, Lanczos, RGB ohne EXIF/ICC/XMP.
PSNR gegen den unkomprimierten Zuschnitt 37,18–40,59 dB; Sichtkontrolle der Motive in der Sitzung.
Hochrechnung auf 148 mit Mittelwert: **6.524.041 Bytes**; mit Maximum für jedes Bild: **12.321.000 Bytes**.
Git-Dateibaum von `8491b5b`: **7.827.054 Bytes**, 103 Dateien, vollständige nicht abgeschnittene API-Antwort,
einschließlich temporärem Prüfworkflow, vor dieser Übergabedokumentation. Ohne .git/node_modules/Originale.
GitHub-Repoanzeige während des Imports: **6.379 KiB**, zeitversetzter Näherungswert einschließlich Historie.
Gesamtprojekt-Prognose bei unverändertem sonstigem Baum: ca. **13,12 MB**, mit Maximum ca. **18,91 MB**.
Keine stärkere Komprimierung nötig. Einzelwerte und Messgrenzen in docs/BILDER-KOMPRIMIERUNG.md.

Nach jeder weiteren Serie alle Größen neu messen und dokumentieren. Eigene Prüfmarken: einzelnes Bild
über 150 kB oder Gesamtprognose über 100 MB; erst dann Ausreißer und Originale vergleichen, keine pauschale
Qualitätssenkung. Keine verlustbehaftete Neukomprimierung aus WebP, keine History-Umschreibung.
Echte mobile Darstellung, reale Ladezeiten und persönliche Gegenprüfung durch Klaus sind noch offen.

## Vor Sitzungsende diesen Brief erneuern

Tatsächlich veröffentlicht, nur erzeugt/importiert oder offen klar unterscheiden. Kennungen und Zähler
aus dem Werkzeug übernehmen; Tests, PR/Merge/Pages, Profil, Bytes und ungemessene Punkte nennen.
Nächste zehn fehlende Kennungen mit Motiven festlegen und den fortlaufenden Auftrag wieder aufnehmen.
Bei knappem Kontext zuerst Teilstand und Dateipfade sichern; dieselben Bilder fortsetzen.
