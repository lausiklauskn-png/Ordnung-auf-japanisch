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

Nachmessung des veröffentlichten Merge-Baums `29d71808443abc29dbaf2c83fed47b54b6210098`:
**7.829.566 Bytes**, 102 Dateien, API nicht abgeschnitten, temporärer Prüfworkflow entfernt.
28 WebP unverändert 1.234.278 Bytes. Repoanzeige nach Merge weiterhin 6.379 KiB (zeitversetzt).
Gesamtprojekt-Prognose bei 148 Bildern und unverändertem sonstigem Baum: 13.119.329 Bytes
mit dem Bildmittel, 18.916.288 Bytes mit dem bisherigen Maximum.

## 20 weitere Bilder für Küche und Bad · 2026-10-23

Klaus hat für diese Sitzung ausdrücklich **20** Bilder samt automatischem Upload, Merge und
Veröffentlichung beauftragt; dies ist eine Ausnahme vom bisherigen Zehnerablauf.
Referenz: Bildcommit `0228cd6badcb5fd610a68ddc9cc233bc5d4dea3e`, PR #21.
Import mit tools/bilder-einfuegen.py: s2.3–s2.13, st3, s3.1–s3.8; keine abgewiesene Kennung.
20 Original-PNGs zu 1536 × 1024 außerhalb des Repos unter
`/workspace/work/bilder20/originale/<Kennung>.png` erhalten; Generatorausgaben zusätzlich
in /workspace/generated_images/. Profil unverändert: WebP 80/Methode 6, Lanczos,
1200 × 800, RGB ohne EXIF/ICC/XMP. Pillow 12.3.0.
**39.518.177 Bytes PNG → 937.134 Bytes WebP (97,63 % kleiner)**,
einschließlich Verkleinerung. PSNR 37,43–41,52 dB gegen den unkomprimierten Zuschnitt.
PSNR beweist keine unsichtbaren Verluste. Motive in der Sitzung angesehen; echte Handydarstellung,
Ladezeiten und persönliche Gegenprüfung durch Klaus nicht gemessen.

| Kennung | WebP Bytes | PSNR dB |
|---|---:|---:|
| s2.10 | 52.826 | 39,33 |
| s2.11 | 36.452 | 39,96 |
| s2.12 | 37.298 | 40,38 |
| s2.13 | 45.464 | 39,51 |
| s2.3 | 38.092 | 40,65 |
| s2.4 | 49.988 | 39,30 |
| s2.5 | 62.742 | 38,78 |
| s2.6 | 40.750 | 40,48 |
| s2.7 | 77.402 | 38,03 |
| s2.8 | 51.310 | 39,23 |
| s2.9 | 42.480 | 40,38 |
| s3.1 | 59.972 | 38,87 |
| s3.2 | 52.310 | 38,76 |
| s3.3 | 39.876 | 40,59 |
| s3.4 | 39.998 | 40,56 |
| s3.5 | 29.590 | 41,52 |
| s3.6 | 39.404 | 40,16 |
| s3.7 | 29.468 | 41,35 |
| s3.8 | 42.724 | 40,01 |
| st3 | 68.988 | 37,43 |
| **Summe** | **937.134** | |

Die ersten zehn (s2.3–s2.12) zusammen 489.340 Bytes; die zweiten zehn
(s2.13, st3, s3.1–s3.8) 447.794 Bytes. Bisherige WebP nicht neu komprimiert.

| Datum / Referenz | Bilder | WebP gesamt | Größtes Bild | Prognose 148, Mittelwert | Dateibaum | GitHub Repoanzeige |
|---|---:|---:|---:|---:|---:|---:|
| 2026-10-23 / 0228cd6 | 48/148 | 2.171.412 Bytes | 83.250 Bytes (s1.2) | 6.695.187 Bytes | 8.768.600 Bytes | 7.066 KiB* |

Vollständiger GitHub-Dateibaum: 123 Dateien, nicht abgeschnitten, einschließlich temporärem
Prüfworkflow, vor dieser Dokumentation. Ohne .git/node_modules/Originale.
*GitHub-Anzeige während des Imports abgefragt; zeitversetzter Näherungswert mit Historie/Kompression,
keine exakte Historienmessung und nicht mit dem Dateibaum gleichzusetzen.
Mittel 45.237,75 Bytes/Bild. Prognose 148 mit Maximum: 12.321.000 Bytes Motivbilder.
Mit unverändertem sonstigem Baum: 13.292.375 Bytes Gesamtprojekt nach Mittel,
18.918.188 Bytes nach Maximum. Künftiger Code/Doku/Historie nicht vorhergesagt.
Kein Bild über 150 kB, Gesamtprognose unter 100 MB. **Keine Profiländerung nötig.**


## 2026-10-23 · nächste 20: Wäsche und Schlafzimmer (68 von 148)

Klaus hat ausdrücklich weitere 20 auf dieselbe Art einschließlich Upload, Merge und Veröffentlichung
beauftragt; Ausnahme zum Standard von zehn. Zuordnung und laufende Nummern 49–68:
[BILDER-ZUORDNUNG-SERIE-68.md](BILDER-ZUORDNUNG-SERIE-68.md).
Originale `/workspace/work/bilder40/originale/<Kennung>.png`, außerhalb des Repos; Pillow12.3.0.
Sichtkontrolle aller Motive erfolgt, ungünstige Kompositionen vor Import verbessert;
Bügel-Probe mit sichtbar umgedrehtem rechten Hakenpaar und zusammenhängender Raumperspektive.
Echte Handydarstellung, reale Ladezeiten und persönliche Gegenprüfung bleiben ungemessen.

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

| Kennung | Original PNG Bytes | WebP Bytes | PSNR dB |
|---|---:|---:|---:|
| s3.9 | 1.961.876 | 40.474 | 39,85 |
| st4 | 2.237.154 | 102.110 | 35,58 |
| s4.1 | 2.112.544 | 81.024 | 37,28 |
| s4.2 | 1.878.349 | 41.808 | 40,1 |
| s4.3 | 1.665.655 | 30.944 | 41,3 |
| s4.4 | 2.047.652 | 82.972 | 36,91 |
| s4.5 | 2.116.644 | 97.198 | 36,16 |
| s4.6 | 2.213.102 | 79.630 | 38,24 |
| s4.7 | 2.155.430 | 64.744 | 37,82 |
| s4.8 | 2.029.911 | 54.706 | 38,89 |
| s4.9 | 2.033.042 | 58.944 | 38,92 |
| s4.10 | 2.181.027 | 73.712 | 38,24 |
| s4.11 | 2.127.624 | 71.812 | 37,48 |
| s4.12 | 1.900.994 | 54.988 | 38,35 |
| st5 | 1.908.149 | 50.622 | 38,74 |
| s5.1 | 2.414.126 | 56.432 | 38,05 |
| s5.2 | 1.907.970 | 59.492 | 38,63 |
| s5.3 | 2.227.242 | 63.820 | 38,09 |
| s5.4 | 2.184.817 | 66.730 | 37,84 |
| s5.5 | 1.982.183 | 51.700 | 38,83 |
| **Summe** | **41.285.491** | **1.283.862** | |

Erste zehn (s3.9, st4, s4.1–s4.8): 675.610 Bytes; zweite zehn
(s4.9–s4.12, st5, s5.1–s5.5): 608.252 Bytes. Keine vorhandenen WebP neu komprimiert.
Endgültiger Dateibaum und Merge-/Pages-Nachweis nach Veröffentlichung in PR #22.


## 2026-10-24 · weitere20: Schlafzimmer, Wohnbereich und Böden (88 von148)

Klaus hat ausdrücklich weitere20 auf dieselbe Weise mit automatischem Upload, Merge und Veröffentlichung
beauftragt; Ausnahme vom Standard zehn. Nummern69–88, Thema, Datei und App-Ansicht in
[BILDER-ZUORDNUNG-SERIE-88.md](BILDER-ZUORDNUNG-SERIE-88.md).
Originale `/workspace/work/bilder60/originale/<Kennung>.png` außerhalb des Repos.
Alle Motive angesehen; Erinnerungsbox vor Import weiter nach oben gesetzt und Boden-Kopfbild
auf zusammenhängenden Holzboden laut Motivquelle korrigiert. Echte Handys, reale Ladezeiten
und Klaus' persönliche Gegenprüfung nicht gemessen.

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

| Kennung | Original PNG Bytes | WebP Bytes | PSNR dB |
|---|---:|---:|---:|
| s5.6 | 2.001.749 | 58.870 | 38,56 |
| s5.7 | 1.888.809 | 43.812 | 39,81 |
| s5.8 | 1.897.528 | 52.362 | 38,81 |
| s5.9 | 2.057.520 | 58.534 | 37,8 |
| s5.10 | 1.934.870 | 57.368 | 39,24 |
| st6 | 2.309.575 | 74.510 | 37,83 |
| s6.1 | 1.870.508 | 45.158 | 39,5 |
| s6.2 | 2.053.970 | 62.006 | 38,55 |
| s6.3 | 1.838.126 | 40.134 | 40,09 |
| s6.4 | 1.857.591 | 44.016 | 39,7 |
| s6.5 | 2.006.627 | 49.816 | 38,86 |
| s6.6 | 1.883.710 | 53.480 | 39,31 |
| s6.7 | 1.963.611 | 50.666 | 39,03 |
| s6.8 | 1.946.681 | 65.448 | 38,26 |
| s6.9 | 1.815.474 | 41.290 | 39,93 |
| s6.10 | 1.968.824 | 55.278 | 38,99 |
| s6.11 | 2.140.388 | 66.144 | 38,09 |
| st7 | 2.367.676 | 63.676 | 37,88 |
| s7.1 | 1.921.960 | 49.810 | 39,36 |
| s7.2 | 1.869.013 | 40.742 | 39,68 |
| **Summe** | **39.594.210** | **1.073.120** | |

Erste zehn (s5.6–s5.10, st6, s6.1–s6.4): 536.770 Bytes; zweite zehn
(s6.5–s6.11, st7, s7.1–s7.2): 536.350 Bytes. Vorhandene WebP unverändert.
Endgültiger Dateibaum und Merge-/Pages-Nachweis nach Veröffentlichung in PR #23.
