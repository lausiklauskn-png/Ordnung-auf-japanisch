# Bilder komprimieren

Festgelegt mit Klaus am 2026-10-21: stark komprimieren, die Bildqualität möglichst erhalten.
Dieses Profil gilt für jede Bildserie; `tools/bilder-einfuegen.py` wendet es automatisch an.

- Format: WebP, verlustbehaftet, RGB, ohne Metadaten.
- Größe: 1200 × 800 Pixel, Seitenverhältnis 3:2, Zuschnitt wie im Importwerkzeug.
- Verkleinerung: Lanczos.
- WebP-Qualität: **80** (`WEBP_QUALITAET`).
- WebP-Methode: **6** (`WEBP_METHODE`, höchste Suchstufe des Encoders).
- Immer von der Originaldatei importieren; bereits komprimierte WebP-Dateien nicht erneut komprimieren.
- Originaldateien außerhalb des App-Repos aufbewahren. App-Dateien: `bilder/<Kennung>.webp`.

## Messung der ersten Serie

2026-10-21, acht freigegebene Sonderseiten-Bilder, Pillow 12.3.0 / libwebp 1.6.0. Alle Stufen wurden direkt aus denselben PNGs
erzeugt. Ausgangsgröße der acht PNGs: **15.254.079 Bytes**. Die Ersparnis enthält Verkleinerung und Komprimierung.

| Qualität, Methode 6 | Größe aller acht Bilder | Ersparnis gegenüber PNG | PSNR je Bild |
|---|---:|---:|---:|
| 76 | 284,1 KiB | 98,09 % | 37,43–40,90 dB |
| 78 | 313,4 KiB | 97,90 % | 37,89–41,33 dB |
| **80** | **345,3 KiB** | **97,68 %** | **38,36–41,69 dB** |
| 82 | 381,5 KiB | 97,44 % | 38,73–42,11 dB |

Qualität 80 spart gegenüber dem bisherigen Profil 82 weitere 9,5 % Dateigröße bei geringem zusätzlichen
Pixelfehler. PSNR vergleicht das dekodierte WebP mit dem unkomprimierten, bereits zugeschnittenen Bild in
1200 × 800; es beweist keine unsichtbaren Verluste. Eine Sichtprobe von `x-regeln` war unauffällig.
Die Gegenprüfung aller Bilder auf dem echten Handy steht aus.

| Kennung | Bytes bei Qualität 80 |
|---|---:|
| x-willkommen | 38.716 |
| x-warum | 46.404 |
| x-pause | 47.320 |
| x-gewohnheiten | 25.286 |
| x-kalender | 52.748 |
| x-flecken | 51.120 |
| x-regeln | 43.872 |
| x-verlauf | 48.128 |
| **Summe** | **353.594** |

## Messung der zweiten Serie

2026-10-22, zehn neu erzeugte Original-PNGs: st0, s0.1–s0.7, st1, s1.1.
Gleiches Profil (Qualität 80, Methode 6, Lanczos, 1200 × 800, RGB ohne EXIF/ICC/XMP).
**18.517.061 Bytes PNG → 363.702 Bytes WebP**, insgesamt **98,04 % kleiner** einschließlich Verkleinerung.
PSNR je Bild gegenüber dem unkomprimierten Zuschnitt: **38,39–40,95 dB**.
Alle Originale außerhalb des App-Repos aufbewahrt. Sichtkontrolle der Motive in der Sitzung;
Qualitätsvergleich auf dem echten Handy steht aus. PSNR beweist keine unsichtbaren Verluste.

| Kennung | WebP Bytes | PSNR dB |
|---|---:|---:|
| st0 | 30.136 | 40,51 |
| s0.1 | 41.070 | 39,64 |
| s0.2 | 34.966 | 40,30 |
| s0.3 | 33.898 | 40,77 |
| s0.4 | 30.656 | 40,57 |
| s0.5 | 27.832 | 40,46 |
| s0.6 | 33.082 | 40,95 |
| s0.7 | 34.016 | 40,29 |
| st1 | 39.212 | 38,87 |
| s1.1 | 58.834 | 38,39 |
| **Summe** | **363.702** | |

## Fortlaufende Größenkontrolle für alle 148 Bilder

Auftrag von Klaus vom 2026-10-22: nach jeder Zehnerserie Größen erneut prüfen, protokollieren und
in `docs/SITZUNGSBRIEF-BILDER.md` übernehmen. MB/kB hier dezimal (1 MB = 1.000.000 Bytes);
MiB/KiB binär. Bilder sind einzelne WebP-Dateien, keine zusammengefasste große Bilddatei.

### Messung am 2026-10-22

Quelle: vollständiger GitHub-Git-Dateibaum von main `b4fb784c892530f5050d8c3dad33e4f0cb242439`,
91 Dateien, keine abgeschnittene API-Antwort; Repository-Metadaten separat abgefragt.
Der Dateibaum umfasst vorsichtshalber auch Doku, Tests und Quellbilder der Icons, nicht nur Laufzeitdateien.
Er enthält keine .git-Datenbank, node_modules oder außerhalb des Repos aufbewahrten Motiv-PNGs.

| Datum / Referenz | Bilder | WebP gesamt | Größtes Bild | Prognose 148, Mittelwert | Aktueller Dateibaum | GitHub Repoanzeige |
|---|---:|---:|---:|---:|---:|---:|
| 2026-10-22 / b4fb784 | 18/148 | 717.296 Bytes | 58.834 Bytes | 5.897.767 Bytes | 7.291.033 Bytes | 5.958 KiB |

- Mittelwert: 39.849,78 Bytes/Bild. Prognose: `717296 / 18 × 148` = rund **5,90 MB** Motivbilder.
- Vorsichtige Vergleichsrechnung, jedes Bild so groß wie das derzeit größte: `58834 × 148` = **8,71 MB**.
  Das ist keine garantierte Obergrenze für noch unbekannte Motive.
- Mit unverändertem übrigen Dateibaum ergeben sich rund **12,47 MB** für das gesamte Projekt bei 148 Bildern;
  mit dem bisherigen Maximum je Bild rund **15,28 MB**. Künftiger Code/Doku und Git-Historie sind darin
  nicht vorhergesagt. Der gemessene Dateibaum ist keine Messung der Ladezeit oder einer einzelnen Sitzung.
- GitHubs Repoanzeige entspricht ungefähr 6,10 MB auf dem Server, einschließlich Historie/Kompression.
  Sie ist ein separater Näherungswert und nicht mit der Summe unkomprimierter Git-Dateigrößen gleichzusetzen.

**Ergebnis: Das aktuelle Profil hat sehr viel Reserve. Keine weitere Qualitätsabsenkung nötig.**

### GitHub-Grenzen und Quellen

Offizielle Dokumentation am 2026-10-22 geprüft:

- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits):
  veröffentlichte Seite höchstens **1 GB**, für das Quell-Repository werden ebenfalls höchstens 1 GB empfohlen.
- [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github):
  Upload im Browser höchstens **25 MiB je Datei**; Git warnt über 50 MiB und blockiert über **100 MiB je Datei**.
  Die größte jetzige Motivdatei ist nur rund 59 kB groß. Auch die Gesamtprognose liegt weit unter Pages' Grenze.

Bei künftigen Kontrollen sowohl einzelne Dateien als auch Seite und Repository/Historie betrachten.
Original-PNGs weiter außerhalb des Repos halten. Alte Binärfassungen bleiben in Git erhalten; spätere
Verkleinerung aktueller Bilder entfernt diese nicht. Keine Historie ohne gesonderten Auftrag umschreiben.

### Vorgehen nach jeder Serie

1. Alle `bilder/*.webp`: Anzahl, exakte Bytesumme, Mittelwert, Maximum; neue Serie zusätzlich separat erfassen.
2. Ersparnis gegenüber den zugehörigen Originalen und gegebenenfalls PSNR dokumentieren; Sichtprobe behalten.
3. Aktuellen vollständigen Git-Dateibaum und die GitHub-Repoanzeige getrennt erfassen. Mit aktuellem Mittel
   und bisherigem Maximum auf 148 Bilder hochrechnen; Annahmen und Referenz-Commit nennen.
4. Tabelle ergänzen und Sitzungsbrief erneuern. GitHub-Grenzen bei Bedarf erneut anhand offizieller Quellen prüfen.
5. Eigene frühe Prüfmarken: ein Motiv über **150 kB** oder prognostizierte Gesamtseite über **100 MB**.
   Das sind Arbeitsbudgets, keine GitHub-Grenzen und kein Grund zum automatischen Verwerfen eines Bilds.
   Erst Ausreißer untersuchen, dann bei tatsächlichem Bedarf Vergleichsproben direkt aus Originalen erstellen.
   Qualität/Format/Größe nur mit begründetem Qualitätsvergleich ändern und das neue Profil ausdrücklich merken.
   Keine pauschale Umkomprimierung aller vorhandenen WebP und kein vorsorglicher Wechsel auf schlechtere Qualität.


## Messung der dritten Serie · 2026-10-22

Bildstand `6e9324496f04f1ef94e3687c7d52c0c95a8014cd` (PR #17): s1.2–s1.8, st2, s2.1 und s2.2.
Zehn Original-PNGs, jeweils 1536 × 1024, außerhalb des Repos unter
`/workspace/bilder-eingang/serie3/` erhalten; ursprüngliche Generatorausgaben zusätzlich in
`/workspace/generated_images/`. s1.3 vor Import auf sechs Pantoffeln korrigiert.
Profil unverändert: WebP Qualität 80, Methode 6, Lanczos, 1200 × 800, RGB ohne EXIF/ICC/XMP.
Pillow 12.3.0. **20.263.394 Bytes PNG → 516.982 Bytes WebP: 97,45 % kleiner**,
einschließlich Verkleinerung. PSNR 37,18–40,59 dB gegen den unkomprimierten Zuschnitt.
Sichtkontrolle der zehn Motive in der Sitzung; PSNR beweist keine unsichtbaren Verluste.
Echte Handydarstellung, Ladezeiten und persönliche Gegenprüfung von Klaus noch nicht gemessen.

| Kennung | WebP Bytes | PSNR dB |
|---|---:|---:|
| s1.2 | 83.250 | 37,18 |
| s1.3 | 56.462 | 38,74 |
| s1.4 | 52.540 | 39,27 |
| s1.5 | 50.310 | 40,00 |
| s1.6 | 43.892 | 40,59 |
| s1.7 | 40.428 | 39,44 |
| s1.8 | 60.476 | 37,90 |
| s2.1 | 46.806 | 39,30 |
| s2.2 | 34.642 | 39,73 |
| st2 | 48.176 | 39,04 |
| **Summe** | **516.982** | |

| Datum / Referenz | Bilder | WebP gesamt | Größtes Bild | Prognose 148, Mittelwert | Aktueller Dateibaum | GitHub Repoanzeige |
|---|---:|---:|---:|---:|---:|---:|
| 2026-10-22 / 8491b5b | 28/148 | 1.234.278 Bytes | 83.250 Bytes (s1.2) | 6.524.041 Bytes | 7.827.054 Bytes | 6.379 KiB* |

Dateibaum: vollständiger rekursiver GitHub-Baum von `8491b5be2fd6cc09c510d3a823849ca2bc6bb1c7`,
103 Dateien, nicht abgeschnitten; einschließlich temporärem Prüfworkflow, vor dieser Messdokumentation.
Ohne .git, node_modules und Originale. *Repoanzeige separat während des Imports abgefragt;
GitHub aktualisiert diesen Näherungswert zeitversetzt, er ist keine exakte Historienmessung.
Mittelwert 44.081,36 Bytes/Bild. Vergleichsrechnung mit dem Maximum für alle 148: **12.321.000 Bytes**.
Mit unverändertem sonstigem Dateibaum: rund **13,12 MB** Gesamtprojekt bei 148 Bildern,
mit dem Maximum je Bild rund **18,91 MB**. Künftige Änderungen und Historie nicht vorhergesagt.
Kein Bild über 150 kB, Gesamtprognose unter 100 MB: kein Anlass zur Profiländerung.
