# Sitzungsbrief: nächste Bilder

Stand: 2026-10-24 · Repo `lausiklauskn-png/Ordnung-auf-japanisch`.

## Auftrag und tatsächlicher Stand

Fortlaufender Auftrag bis zu allen 148 Bildern. Standard ist eine Zehnerserie pro Sitzung,
Veröffentlichung und erneuerter Brief. Klaus hat für diese Sitzung ausdrücklich weitere **20**
auf dieselbe Weise einschließlich automatischem Upload, Merge und Veröffentlichung verlangt.
Diese Anzahl ersetzt die Zehnergrenze für diese Sitzung; keine weiteren Bilder auf Vorrat.
Keine erneute Bestätigung erforderlich. Bei 148/148 Abschlussbericht.

**88 von 148** eingebaut, **60 fehlen**. Neue20: s5.6–s5.10, st6, s6.1–s6.11, st7, s7.1–s7.2.
Schlafzimmer und Wohn-/Arbeitszimmer vollständig, Böden bis Linoleum/Vinyl. Import über
`tools/bilder-einfuegen.py`, keine abgewiesene Kennung. Nummerierung69–88, Thema, Datei und
Ansicht in [BILDER-ZUORDNUNG-SERIE-88.md](BILDER-ZUORDNUNG-SERIE-88.md); Gesamtbestand automatisch
in BILDER-STAND.md. Originale `/workspace/work/bilder60/originale/<Kennung>.png`, außerhalb des Repos;
Generatorausgaben zusätzlich `/workspace/generated_images/`. Nie aus WebP neu komprimieren.

Vorherige Serie PR #22 gemergt als ff69387c52a07feae56adb6fc8efefcf54c95d77,
Pages-Lauf40000618106 erfolgreich. Aktuelle Serie [PR #23](https://github.com/lausiklauskn-png/Ordnung-auf-japanisch/pull/23); Prüf-/Merge-/Pages-Nachweis
wird in der PR-Beschreibung nach Veröffentlichung nachgeführt. Vor Fortsetzung dort gegenprüfen.
Cachev24, Inhaltv10 synchron in index.html/sw.js. Texte, weiche Container und Verläufe,
Installieren/Aktualisieren und Verlauf erhalten. x-regeln.webp bleibt vorhanden; Regeln zeigt
weiterhin nur das Pinselbild ohne zweite Flaschenkarte.

Ausgangsstand vollständig grün: Lauf40033098725. Vollständiges npm test einschließlich250
Bildproben grün in Lauf40034000119 auf Bildcommit65460d9. Gegenprobe ohne Bildliste
erfolgreich: alle20 neuen Kennungen reagieren mit eigenen roten Zeilen. Raum-/Schrittansichten,
Texte,320/380/1100px, weiche Übergänge sowie bestehende App-Funktionen geprüft. Lokale Syntax-,
Inhalts- und Briefproben grün; Maße,RGB,Dekodierung,Metadaten und Tabellenzuordnung aller20 geprüft.
Temporären Prüfworkflow vor Merge entfernt.

## Nächste zehn fehlende Kennungen

Vor Erzeugen gegen tatsächlichen Bestand prüfen, vorhandene Kennungen überspringen.
Originaltexte und Motive im aktuellen docs/CHATGPT-BRIEF.md lesen. Nächste Sitzung diese zehn,
sofern Klaus keine andere Anzahl verlangt:

| Reihenfolge | Kennung | Thema | Motiv |
|---|---|---|---|
| 1 | `s7.3` | Versiegeltes Parkett, Laminat | Ein Parkettboden, ein nur nebelfeuchter Mikrofaserwischer, kein Wasser auf dem Boden. |
| 2 | `s7.4` | Geöltes Holz, Dielen | Breite geölte Holzdielen in warmem Licht, ein Eimer mit hellem Seifenwasser. |
| 3 | `s7.5` | Naturstein, Marmor, Terrazzo | Ein Marmorboden, daneben eine Essigflasche mit einem roten Kreuz-Symbol und ein Eimer mit klarem Wasser. |
| 4 | `s7.6` | Teppichboden | Ein Teppichboden mit sichtbaren Saugbahnen über Kreuz. |
| 5 | `st8` | Keller, Abstellraum, Gerüche | Ein trockener, heller Kellerraum mit Regal, gleichen Kisten und freiem Gang. |
| 6 | `s8.1` | Lager, kein Versteck | Ein Kellerraum mit Schwerlastregal, gleiche beschriftete Kisten (nur Striche), ein freier Gang. |
| 7 | `s8.2` | Feuchte | Ein Hygrometer an der Kellerwand, daneben eine flache Schale mit weißem Pulver. |
| 8 | `s8.3` | Gerüche | Ein offenes Fenster, davor ein Schälchen Natron und ein Blech mit trocknendem Kaffeesatz. |
| 9 | `s8.4` | Ungeziefer ohne Gift | Vorräte in Schraubgläsern, eine dünne Linie weißes Pulver an einer Ritze, ein Fliegengitter am Fenster. |
| 10 | `s8.5` | Großpackung | Große Papierbeutel mit Pulver neben kleinen Flaschen, ein Nachfüllbeutel neben einer Glasflasche. |

Erwarteter Stand danach:98/148. Danach st9, s9.1–s9.8, m1.

## Stil und Ablauf

AGENTS.md und CLAUDE.md vollständig lesen. Frisch von main auf eigenem Zweig arbeiten.
Einzige Textquelle docs/INHALT.md; Motive docs/BILD-MOTIVE.md und gebauter docs/CHATGPT-BRIEF.md.
Keine Anleitungstexte umschreiben. Stilreferenzen direkt ansehen: bilder/x-willkommen.webp,
x-warum.webp, st1.webp, s1.1.webp. Fotorealistisch, warmes Elfenbein, Naturholz, Leinen,
Glas/Keramik, weiches Tageslicht von links. Japanisch inspiriert, 間 ma: wenig Dinge, viel Leere.
Keine Gesichter, Logos, lesbaren Buchstaben/Ziffern; Etiketten nur neutral/Striche. Keine gefährlichen
Mischungen. Querformat1536×1024, Motiv oben etwas rechts, freie helle ruhige Fläche unten,
Luft an allen Rändern. Zusammenhängende Raumperspektive statt künstlicher Bildteilung.
Keine Rahmen/Bedienoberflächen ins Bild. App rendert weiche Verläufe und überlappende Schrift;
kein Zoom, alter Hinweis im Bildbrief überholt.

Import nur über python3 tools/bilder-einfuegen.py <Originalordner>; Kennung exakt im Namen.
assets/inhalt.js und docs/BILDER-STAND.md nur durch Werkzeuge erzeugen. Festes Profil:
WebP Qualität80/Methode6, 1200×800, Lanczos,RGB ohne EXIF/ICC/XMP. Cacheversion erhöhen,
?v= in index.html und sw.js synchron sowie Sprach-Cache-Probe anpassen.

npm install und vollständiges npm test vorher/nachher. Raum-/Schrittansichten, Textzuordnung,
320/380/1100px, weiche Verläufe und dekodierbare Bilder prüfen. Bestehende Proben erhalten.
Gegenprobe ohne Bildliste muss eigene rote Zeilen für alle neuen Kennungen liefern.
Bei lokalen Netz-/Browserbeschränkungen GitHub-Verbindung und GitHub Actions verwenden:
ubuntu-latest, Node22, python3 -m pip install Pillow, npm install,
npx playwright-core install --with-deps chromium, npm test. Temporären Workflow vor Merge entfernen.
Keine Schlüssel/Tokens/Umgebungs-Dumps in Logs oder Commits. PR nach main, mergen, Pages-Lauf
bis zum Ergebnis kontrollieren. App https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/.

## Größenkontrolle

Neue20: **39.594.210 Bytes PNG → 1.073.120 Bytes WebP**, **97,29 % kleiner** einschließlich Verkleinerung.
Alle88: **4.528.394 Bytes**, Mittel **51.459,02 Bytes**, größtes **102.110 Bytes (st4)**.
Prognose148 nach Mittel: **7.615.935 Bytes**, nach Maximum **15.112.280 Bytes**.
PSNR37,80–40,09dB gegen unkomprimierten 1200-×-800-Zuschnitt, kein Beweis unsichtbarer Verluste.
Profil unverändert WebP80/Methode6, Lanczos,1200×800,RGB ohne EXIF/ICC/XMP (Pillow12.3.0).
Vollständiger Bildcommit-Dateibaum 65460d9: **11.138.730 Bytes**, 165 Dateien,
API nicht abgeschnitten, mit temporärem Prüfworkflow, vor Abschlussdokumentation. Ohne .git/node_modules/Originale.
GitHub-Repoanzeige beim Import **9.364 KiB**, zeitversetzter Näherungswert mit Historie/Kompression,
keine exakte Historienmessung. Gesamtprojekt-Prognose bei unverändertem sonstigem Baum:
**14.226.271 Bytes** nach Mittel, **21.722.616 Bytes** nach Maximum.
Künftiger Code/Doku/Historie nicht vorhergesagt. Unter Prüfmarken; keine Profiländerung nötig.

Nach jeder Serie Zahl/Summe/Mittel/Maximum, neue Serie, PNG-Ersparnis, vollständigen Git-Dateibaum
und GitHub-Repoanzeige getrennt messen. Hochrechnung148 in BILDER-KOMPRIMIERUNG.md fortschreiben.
Prüfmarken150kB je Bild/100MB Gesamtprognose; Profil nur mit begründetem Original-A/B ändern,
keine pauschale Qualitätsabsenkung oder verlustbehaftete Neukomprimierung.
Echte Handydarstellung, reale Ladezeiten und persönliche Gegenprüfung durch Klaus ungemessen.

## Vor Sitzungsende

CLAUDE.md-Stand und diesen Brief mit tatsächlichem Bestand, nächsten zehn, Prüfungen, PR/Merge/Pages,
Profil und Bytes erneuern; bei knappem Kontext sofort Teilstand sichern. Auftrag bis148/148
weiterführen; ohne neue abweichende Anzahl bleibt der Zehnerablauf bestehen.
