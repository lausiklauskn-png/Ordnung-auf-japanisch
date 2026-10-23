# Sitzungsbrief: nächste Bilder

Stand: 2026-10-23 · Repo `lausiklauskn-png/Ordnung-auf-japanisch`.

## Auftrag und tatsächlicher Stand

Klaus hat die Fortsetzung bis zu allen 148 Bildern beauftragt. Standard bleibt eine Zehnerserie pro
Sitzung mit Veröffentlichung und erneuertem Brief. Für diese Sitzung hat er ausdrücklich die nächsten
20 auf dieselbe Weise mit automatischem Upload, Merge und Veröffentlichung beauftragt; keine weiteren
auf Vorrat. Keine erneute Bestätigung erforderlich. Bei 148/148 Abschlussbericht.

**68 von 148** eingebaut, **80 fehlen**. Neue 20: s3.9, st4, s4.1–s4.12, st5, s5.1–s5.5.
Bad und Wäsche vollständig, Schlafzimmer bis Drei Fragen. Über tools/bilder-einfuegen.py importiert,
keine abgewiesene Kennung. Nummerierung, Thema, Dateiname und App-Ansicht für Bilder 49–68 in
[der Zuordnungstabelle](BILDER-ZUORDNUNG-SERIE-68.md); automatisch erzeugter Gesamtbestand in BILDER-STAND.md.
Originale außerhalb des Repos unter `/workspace/work/bilder40/originale/<Kennung>.png`,
Generatorausgaben zusätzlich unter `/workspace/generated_images/`. Niemals aus WebP neu komprimieren.

Vorherige Serie PR #21 gemergt als e6c7e17ebb8a13e8c71385521bd822f7643c5768,
Pages-Lauf 39993454643 erfolgreich. Aktuelle Serie: [PR #22](https://github.com/lausiklauskn-png/Ordnung-auf-japanisch/pull/22).
Prüf-/Merge-/Pages-Nachweise werden dort nachgeführt. Vor Fortsetzung dort gegenprüfen.
Cache v23 und Inhalt v9 synchron in index.html und sw.js. Anleitungstexte, Bildcontainer,
weiche Übergänge, Installieren-Knopf und Verlauf erhalten. x-regeln.webp bleibt vorhanden,
auf der Regeln-Seite weiterhin nur das Pinselbild ohne zweite Flaschenkarte.

Ausgangsstand vollständig grün: Lauf 39998638015. Vollständiges npm test und 188 Bildproben
grün in Lauf 39999887648 (Bildcommit160c4bb). Gegenprobe ohne Bildliste erfolgreich: alle20
neuen Kennungen reagieren mit eigenen roten Zeilen. Raum-/Schrittansichten, Anleitungstexte,
320/380/1100px und weiche Übergänge geprüft. Temporären Prüfworkflow vor Merge entfernt.
Lokale Browser-/Kindprozessbeschränkungen durch vollständige GitHub-Actions-Prüfung abgedeckt.

## Nächste zehn fehlende Kennungen

Originaltexte und Motive im aktuellen docs/CHATGPT-BRIEF.md erneut lesen. Vor Erzeugen am tatsächlichen
Bestand prüfen; vorhandene Kennungen überspringen. Die nächste Sitzung beginnt mit diesen zehn,
sofern Klaus keine andere Anzahl verlangt:

| Reihenfolge | Kennung | Thema | Motiv |
|---|---|---|---|
| 1 | `s5.6` | Fertig erkennen | Ein abgetragenes T-Shirt gegen das Licht eines Fensters gehalten, dünne Stellen sichtbar. |
| 2 | `s5.7` | Zweites Leben | Ein altes Baumwolllaken, mit einer Zackenschere in Quadrate geschnitten, gestapelt in einem Korb. |
| 3 | `s5.8` | Weggeben | Ein zugebundener Kleidersack und ein mit Schnur zusammengebundenes Paar Schuhe. |
| 4 | `s5.9` | Jahreszeiten | Beschriftete Aufbewahrungskisten (nur Striche) oben auf einem Schrank, darunter die aktuelle Kleidung. |
| 5 | `s5.10` | Motten | Ein Lavendelsäckchen aus Leinen in einem aufgeräumten Wollfach, daneben eine kleine Klebefalle. |
| 6 | `st6` | Wohnzimmer, Arbeitszimmer, Papiere | Ein ruhiges Wohnzimmer mit leerem niedrigem Tisch, ein Regal mit stehenden Ordnern und beschrifteten Kisten. |
| 7 | `s6.1` | Nicht stapeln, stellen | Topfdeckel und Bretter aufrecht in einem Metall-Stehsammler. |
| 8 | `s6.2` | Durchsichtig oder beschriftet | Ein Regal mit durchsichtigen Kisten, vorne je ein Kreppband-Etikett (nur Striche). |
| 9 | `s6.3` | Das Doppelte | Fünf Scheren auf einem Tisch, eine davon liegt abgesondert an einem festen Platz in einer Schale. |
| 10 | `s6.4` | Geräte für eine Sache | Ein Waffeleisen und ein Eierkocher in einem Karton zum Weitergeben, daneben ein Reiskocher im Gebrauch. |

Erwarteter Stand danach: 78 von 148. Danach s6.5–s6.11, st7, s7.1–s7.2.

## Stil und Ablauf

Zuerst AGENTS.md und CLAUDE.md vollständig lesen. Immer frisch von main auf eigenem Zweig.
Einzige Textquelle docs/INHALT.md; Motive docs/BILD-MOTIVE.md und gebauter docs/CHATGPT-BRIEF.md.
Texte nicht umschreiben. Stilreferenzen direkt ansehen: bilder/x-willkommen.webp, x-warum.webp,
st1.webp und s1.1.webp. Fotorealistisch, warmes Elfenbein, Naturholz, Leinen, Keramik und Glas,
weiches Licht von links, japanisch inspiriert, 間 ma: wenig Dinge, viel Leere. Keine Gesichter,
Logos, lesbaren Buchstaben oder Ziffern; Etiketten neutral. Keine gefährlichen Reinigermischungen.
Querformat 1536 × 1024, Hauptmotiv oben, etwas rechts; untere Hälfte möglichst ruhig und hell.
Luft an Rändern, keine Rahmen oder Bedienoberfläche hineinmalen. Kein Zoom; alter Zoom-Hinweis
im Bildbrief ist überholt. App rendert weiche Verläufe und teilweise überlappende Schrift selbst.

Import nur über python3 tools/bilder-einfuegen.py <Originalordner>; Kennung exakt im Dateinamen.
assets/inhalt.js und docs/BILDER-STAND.md nur mit Werkzeugen erzeugen. Profil unverändert:
WebP Qualität 80/Methode 6, 1200 × 800, Lanczos, RGB ohne EXIF/ICC/XMP. CACHE_VERSION erhöhen,
?v= in index.html/sw.js synchron sowie Sprach-Cache-Probe anpassen.

npm install und vollständiges npm test vorher/nachher. Raum- und Schrittansichten, Textzuordnungen,
320/380/1100 px, Verläufe und dekodierbare Bilder prüfen. Bestehende Proben erhalten;
Gegenprobe ohne Bildliste muss eigene rote Zeilen für die neuen Kennungen liefern.
Bei lokalen Netz-/Browserbeschränkungen GitHub-Verbindung und GitHub Actions verwenden:
ubuntu-latest, Node22, python3 -m pip install Pillow, npm install,
npx playwright-core install --with-deps chromium, npm test. Temporären Prüfworkflow vor Merge entfernen.
Keine Schlüssel, Tokens oder Umgebungs-Dumps in Logs/Commits. PR nach main, mergen,
Pages-Lauf bis Ergebnis kontrollieren. App: https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/.

## Größenkontrolle

Neue 20: **41.285.491 Bytes PNG → 1.283.862 Bytes WebP**, **96,89 % kleiner** einschließlich Verkleinerung.
Alle 68: **3.455.274 Bytes**, Mittel **50.812,85 Bytes**, größtes **102.110 Bytes (st4)**.
Prognose 148 nach Mittel: **7.520.302 Bytes**, nach Maximum **15.112.280 Bytes**.
PSNR 35,58–41,30 dB gegenüber unkomprimiertem 1200-×-800-Zuschnitt; kein Beweis unsichtbarer Verluste.
Profil unverändert WebP 80/Methode6, Lanczos, 1200 × 800, RGB ohne Metadaten.
Vollständiger Bildcommit-Dateibaum 160c4bb: **10.059.176 Bytes**, 144 Dateien,
API nicht abgeschnitten, mit temporärem Prüfworkflow, vor Abschlussdokumentation. Ohne .git/node_modules/Originale.
GitHub-Repoanzeige während Import: **8.047 KiB**, zeitversetzter Näherungswert mit Historie/Kompression.
Gesamtprojekt-Prognose bei unverändertem sonstigem Baum: **14.124.204 Bytes** nach Mittel,
**21.716.182 Bytes** nach Maximum. Künftiger Code/Doku/Historie nicht vorhergesagt.
Unter den Prüfmarken, kein Anlass zur Profiländerung. Einzelwerte in BILDER-KOMPRIMIERUNG.md.

Nach jeder Serie Zahl/Summe/Mittel/Maximum, neue Serie separat, PNG-Ersparnis, vollständigen
Git-Dateibaum und Repoanzeige getrennt messen; Hochrechnung auf 148 fortschreiben in
BILDER-KOMPRIMIERUNG.md. Prüfmarken 150 kB/Bild oder 100 MB Gesamtprognose. Profil nur bei begründetem
Bedarf mit Original-A/B ändern, keine pauschale Qualitätsabsenkung oder verlustbehaftete Neukomprimierung.
Echte Handydarstellung, reale Ladezeiten und persönliche Gegenprüfung durch Klaus bleiben ungemessen.

## Vor Sitzungsende

CLAUDE.md-Stand und diesen Brief mit tatsächlichem Bestand, nächsten zehn, Prüfungen, PR/Merge/Pages,
Profil und Bytes erneuern; bei knappem Kontext sofort Teilstand sichern. Fortlaufenden Auftrag bis
148/148 wieder aufnehmen. Ohne neue abweichende Anzahl bleibt der Zehnerablauf bestehen.
