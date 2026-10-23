# Sitzungsbrief: nächste zehn Bilder

Stand: 2026-10-23 · Repo `lausiklauskn-png/Ordnung-auf-japanisch` · 20 Bilder für Küche und Bad in PR #21.

## Auftrag und Übergabe

Klaus hat die Fortsetzung bis zu allen 148 Bildern beauftragt. Standard bleibt eine Zehnerserie pro
Sitzung mit Veröffentlichung, Gegenprüfung und erneuertem Brief. **Für diese Sitzung hat Klaus am
2026-10-23 ausdrücklich 20 Bilder sowie automatischen Upload, Merge und Veröffentlichung verlangt.**
Genau diese 20 wurden erzeugt und importiert; keine weiteren Bilder auf Vorrat. Die nächste Sitzung
beginnt wieder mit den zehn unten, sofern Klaus nichts anderes beauftragt. Bei 148/148 Abschlussbericht.

Zuerst AGENTS.md und CLAUDE.md vollständig lesen. Brief gegen docs/BILDER-STAND.md prüfen; vorhandene
Kennungen nie doppelt erzeugen. Tipps und Motive ausschließlich aus docs/INHALT.md, docs/BILD-MOTIVE.md
und dem gebauten docs/CHATGPT-BRIEF.md. Anleitungstexte nicht umschreiben.

## Tatsächlicher Bildstand

- Importwerkzeug: **48 von 148** eingebaut, **100 fehlen**.
- Neue 20: s2.3–s2.13, st3, s3.1–s3.8. Küche vollständig, Bad bis einschließlich Abfluss bebildert.
- Keine abgewiesene Kennung. Originale 1536 × 1024 außerhalb des Repos erhalten unter
  `/workspace/work/bilder20/originale/<Kennung>.png`, Generatorausgaben zusätzlich in
  `/workspace/generated_images/`. Nicht aus WebP neu komprimieren.
- PR [#21](https://github.com/lausiklauskn-png/Ordnung-auf-japanisch/pull/21), Bildcommit
  `0228cd6badcb5fd610a68ddc9cc233bc5d4dea3e`. Verbindlicher Merge-/Pages-Nachweis wird nach Veröffentlichung
  in der PR-Beschreibung nachgeführt; vor Fortsetzung dort gegenprüfen.
- Ausgangsstand vollständig grün: Lauf 39989290838. Vollständiges npm test und 126 Bildproben grün in Lauf 39992674165.
  Gegenprobe ohne Bildliste erfolgreich: alle 20 neuen Kennungen reagieren mit eigenen roten Zeilen.
  Die vorhandene Uhrprobe prüft jetzt den Start der Zehn-Minuten-Runde und ihr Weiterzählen,
  statt die vom vorigen Klick-/Ladezeitverlauf abhängige Sekundenfolge „9:5x“ vorauszusetzen.
  App-Uhrlogik unverändert. Temporären Prüfworkflow vor Merge entfernt.
- Cache v22, Inhalt v8 synchron in index.html und sw.js. Versionsstände vor weiteren Änderungen an main prüfen.
- App: <https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/>; nach erfolgreichem Pages-Lauf
  ⟳ Aktualisieren verwenden. Verlauf und Installieren-Knopf erhalten.
- Keine Änderung an Bildcontainern, Verläufen oder Anleitungstexten. x-regeln.webp bleibt vorhanden,
  auf der Regeln-Seite weiterhin nur das Pinselbild ohne zweite Flaschenkarte.

## Nächste zehn fehlende Kennungen

Aktuelle Originaltexte und Motive im Bildbrief erneut lesen. Nach aktuellem Bestand:

| Reihenfolge | Kennung | Thema | Motiv |
|---|---|---|---|
| 1 | s3.9 | Flaschen und Kleines | Hängender Duschkorb mit genau drei Flaschen, Zahnbürsten getrennt mit Köpfen oben im trockenen Becher. |
| 2 | st4 | Wäsche | Luftige Wäscheleine in der Sonne, Weidenkorb darunter. |
| 3 | s4.1 | Nach Faser sortieren | Vier luftige Körbe: Handtücher/Laken, Alltag, Wolle/Seide, Sport. |
| 4 | s4.2 | Weichspüler weg | Geöffnete Waschmittelschublade, Hand gießt klaren Essig aus kleinem Messbecher ins Fach; kein Chlor. |
| 5 | s4.3 | Dosieren nach Wasserhärte | Messbecher mit wenig Waschpulver, Teststreifen in einem Wasserglas. |
| 6 | s4.4 | In 20 Minuten aufhängen | Wecker auf Waschmaschine, Tür offen, frische Wäsche im Korb. |
| 7 | s4.5 | Richtig trocknen | Wäscheständer am offenen Fenster, Stücke mit Abstand, Hemden auf Bügeln. |
| 8 | s4.6 | Trockner | Hand leert Flusensieb, gefaltete Frotteehandtücher daneben. |
| 9 | s4.7 | Einweichen | Wanne mit warmem Wasser und weißer Wäsche unter einem Teller, Thermometer und Kreppstreifen am Rand. |
| 10 | s4.8 | Muffige Handtücher retten | Weiße Handtücher in Schüssel mit dampfendem Wasser, Glas weißes Pulver daneben. |

Erwarteter Endstand der nächsten Zehnerserie: **58 von 148**. Danach folgen s4.9–s4.12, st5
und s5.1–s5.5. Immer am tatsächlichen Sitzungsende gegen den Bestand prüfen und Brief erneuern.

## Stil und Container

Vor Erzeugen direkt ansehen: bilder/x-willkommen.webp, x-warum.webp, st1.webp und s1.1.webp.
Freigegebener fotorealistischer Stil: ruhiges japanisch inspiriertes Zuhause, warmes Elfenbein,
helles Naturholz, Leinen, Glas/Keramik, weiches Licht von links. 間 ma: wenige Dinge, viel Leere.
Keine Gesichter, Logos oder lesbare Buchstaben/Zahlen; Etiketten nur neutral, keine Gefahren erfinden.

Original 1536 × 1024 (3:2), Motiv oben etwas rechts, unten etwa halbe Fläche hell und ruhig für den
Text. Luft um alle Ränder; keine Rahmen oder Bedienoberfläche hineinmalen. App rendert Text und weiche
Verläufe selbst. .mit-bild, .kbild und deren Übergänge beibehalten. Schrift bleibt teilweise im Bild.
Kein Zoom; der alte Zoom-Hinweis in CHATGPT-BRIEF.md ist überholt.

## Import und Prüfung

1. Frisch von main auf eigenem Zweig arbeiten, AGENTS.md/CLAUDE.md lesen; npm install und npm test vorher/nachher.
2. Originale außerhalb des Repos mit exakter Kennung sichern. Import nur mit tools/bilder-einfuegen.py.
   assets/inhalt.js und docs/BILDER-STAND.md nur durch Werkzeuge aktualisieren; abgewiesene Namen nennen.
3. Festes Profil: WebP Qualität 80, Methode 6, 1200 × 800, Lanczos, RGB ohne EXIF/ICC/XMP.
4. Cache um eins erhöhen; ?v= geänderter Dateien in index.html und sw.js synchron. Sprach-Cache-Probe anpassen.
5. Raum- und Schrittansichten, Anleitungstexte, kleine Breiten, Verläufe und dekodierbare Bilder prüfen.
   Bestehende Proben erhalten. Neue Funktionen mit eigener Probe samt roter Gegenprobe.
6. PR nach main, Merge und Pages-Lauf bis zum Ergebnis kontrollieren. Tatsächlich veröffentlicht und
   nur erzeugt/importiert klar unterscheiden. Status/Run-Links in PR festhalten.
7. Größenkontrolle fortschreiben, CLAUDE.md-Stand und diesen Brief erneuern, nächste zehn festlegen.

Falls lokale Netz-/Browserstarts eingeschränkt sind: GitHub-Verbindung und GitHub Actions verwenden.
Bewährter Prüfserver ubuntu-latest, Node 22, Pillow, npm install, npx playwright-core install chromium,
danach npm test. Temporären Prüfworkflow vor Merge entfernen. Keine Schlüssel, Tokens, Passwörter
oder Umgebungs-Dumps in Chats, Logs, Brief oder Commits.

## Größenkontrolle der 20 Bilder

Neue 20: **39.518.177 Bytes PNG → 937.134 Bytes WebP**, **97,63 % kleiner** einschließlich Verkleinerung.
Erste zehn 489.340 Bytes, zweite zehn 447.794 Bytes. PSNR 37,43–41,52 dB gegen unkomprimierten Zuschnitt.
Alle 48: **2.171.412 Bytes**, Mittel **45.237,75 Bytes**, größtes **83.250 Bytes** (s1.2).
Hochrechnung 148 mit Mittel: **6.695.187 Bytes**, mit bisherigem Maximum: **12.321.000 Bytes**.
Vollständiger Git-Dateibaum des Bildcommits 0228cd6: **8.768.600 Bytes**, 123 Dateien,
API nicht abgeschnitten, einschließlich temporärem Prüfworkflow vor dieser Dokumentation.
Ohne .git/node_modules/Originale. GitHub-Repoanzeige während Import: **7.066 KiB**, zeitversetzter
Näherungswert mit Historie/Kompression. Keine exakte Historienmessung.
Gesamtprojekt-Prognose bei unverändertem sonstigem Baum: **13.292.375 Bytes** nach Mittel,
**18.918.188 Bytes** nach Maximum. Künftiger Code/Doku/Historie nicht vorhergesagt.
Einzelwerte und Messverfahren in docs/BILDER-KOMPRIMIERUNG.md; keine Profiländerung nötig.

Nach jeder Serie neu messen: Zahl/Summe/Mittel/Maximum, neue Serie separat, PNG-Ersparnis,
Dateibaum und Repoanzeige getrennt sowie Hochrechnung 148. Eigene Prüfmarken 150 kB je Bild oder
100 MB Gesamtprognose; erst bei begründetem Bedarf Original-A/B-Vergleich, keine pauschale Qualitätssenkung.
Keine verlustbehaftete Neukomprimierung aus WebP, keine History-Umschreibung ohne eigenen Auftrag.
Sichtkontrolle in dieser Sitzung erfolgt; echte Handydarstellung, Ladezeiten und Klaus' Gegenprüfung offen.

## Vor Sitzungsende

Brief mit tatsächlichem Stand und nächsten zehn erneuern, bei knappem Kontext sofort Teilstand sichern.
Kennungen/Zähler vom Werkzeug übernehmen, Quellen, Profil, Bytes, Prüfungen und PR/Merge/Pages nennen.
Den fortlaufenden Auftrag wieder aufnehmen, damit die nächste Sitzung denselben Ablauf fortsetzt.
