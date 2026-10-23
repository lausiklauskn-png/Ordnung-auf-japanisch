# 整理 Ordnung auf Japanisch — Sitzungs-Anker

Sprechende PWA: führt Raum für Raum durch die Wohnung, liest jeden Schritt vor, zählt mit, bis aus dem
Handgriff eine Gewohnheit wird. Kein Build-Schritt. Plan: `docs/PLAN.md`. Tipps: `docs/INHALT.md`.

## Prüfen

```bash
npm install && npm test     # Syntax · Inhalt · Manifest/Schale · App im echten Browser
```

## Was hier leicht kaputtgeht

- **Der Katalog ist die einzige Quelle.** `assets/inhalt.js` wird aus `docs/INHALT.md` GEBAUT
  (`node tools/inhalt-bauen.mjs`), nie von Hand. `tests/inhalt.mjs` merkt, wenn es vergessen wurde.
  Schritt-Kennungen (`s2.8`) kommen aus der Nummer im Katalog — wer umnummeriert, verwaist den Verlauf.
- **Nichts Persönliches aus den Heften** (Erzählfigur, Familie, Orte, Anekdoten). Die Probe sucht danach.
- **Vorlesen:** `assets/sprechtext.js` schreibt Abkürzungen aus (EL, °C, ⌛ …). Die Probe verlangt, dass
  in KEINER Ansage eine Abkürzung übrig bleibt.
- **DB-Name `OrdnungJP1` nie ändern** — github.io ist eine geteilte Adresse.
- **Manifest-`id` ist `/Ordnung-auf-japanisch/`, nie `./`** (Befund Workflow PDF 2026-10-18).
- **Cache-Bump:** ändert sich eine Datei der Schale, `CACHE_VERSION` in `sw.js` UND ihr `?v=` in
  `index.html` und `sw.js` erhöhen. `tests/manifest-id.mjs` vergleicht beide Listen.
- **Icon ist RUND** (Klaus 2026-10-21: „nicht runde Ecken, sondern richtig rundes Icon“). Quelle `icons/quelle.png`
  (sein ChatGPT-Teller), gebaut mit `npm run icons` (`tools/icon-bauen.py`, Pillow). Zwei Plattform-Fassungen
  (Klaus: „eine zweite Variante … für iOS und Android“): Android/PWA rund und durchsichtig, `maskable` deckend auf
  Washi (Launcher schneidet selbst), `icons/android/` für Play Store und Adaptive Icon; iOS deckend, Teller auf WEISS
  wie geliefert (`apple-touch-icon.png`, `icons/ios/AppIcon-1024.png` — iOS erlaubt kein Alpha und rundet selbst
  zu einem Squircle, rund geht dort nicht). In der App der freigestellte Teller (`seiri-480.webp`).
  `tests/manifest-id.mjs` prüft Alpha in Ecke und Mitte jeder Datei. Nach einem neuen Bild `?v=` der Icons erhöhen.
- **📲 Installieren-Knopf ist PFLICHT — Regel für jede App von Klaus** (Klaus 2026-10-21: „Dasselbe
  Chrome-Browser-Installationsproblem wie immer … in jede App mit einbauen, die dann verschwindet“). Chrome bietet die
  Installation nicht verlässlich von selbst an. Darum: `#btnInstall` steht **ohne `hidden` im HTML** (die Kopfzeile
  springt nicht), `beforeinstallprompt` wird abgefangen und auf Tipp gezeigt; ohne Angebot öffnet der Knopf eine
  Anleitung (Chrome ⋮, Samsung Internet, iPhone Safari, Computer). In der installierten App ist er weg
  (`@media (display-mode: standalone)` + `navigator.standalone`, `appinstalled`) — dann bleibt nur **⟳ Aktualisieren**.
  Zusätzlich ein großer Knopf in den Einstellungen. Nach jedem Merge prüfen, dass er da ist (`tests/speicher.mjs` 6b).
- **⟳ Aktualisieren** wie in Workflow PDF: Caches leeren, Service-Worker abmelden, mit `?neu=…` neu laden, die Marke
  danach aus der Adresse nehmen. IndexedDB und localStorage (Verlauf, Räume, Gewohnheiten) bleiben.
- **`.meldung[hidden]`** braucht eigenes `display:none` — sonst steht ein leerer schwarzer Balken da.
- Die Warnkarte „Nie mischen“ kommt vor Putzschrank, Küche, Bad, Wäsche — einmal je Station und Tag
  (sessionStorage).

## Bildserien und Übergabe (Auftrag von Klaus, 2026-10-22)

Die Fortsetzung in Zehnerserien bis zu allen 148 Bildern ist beauftragt. Pro Sitzung eine Serie mit
höchstens zehn bisher fehlenden Kennungen, danach veröffentlichen, Klaus die App zur Gegenprüfung geben
und den Sitzungsbrief erneuern. Der letzte Rest darf kleiner sein. Keine weiteren Serien auf Vorrat.
Dieser Ablauf ersetzt die frühere Beschränkung auf ausschließlich hochgeladene Bilder; neue Motive dürfen
im freigegebenen Stil erzeugt werden. Zusätzliche Bestätigung für jede einzelne Kennung ist nicht nötig.

- Zuerst `docs/SITZUNGSBRIEF-BILDER.md` und den tatsächlich aktuellen `docs/BILDER-STAND.md` lesen.
  Schon vorhandene Kennungen überspringen, nie wegen eines veralteten Briefs doppelt erzeugen.
- Reihenfolge: je Raum das Kopfbild `stN`, dann seine Schritte `sN.1…`; Räume 0 bis 9. Danach Mittel m1–m5,
  Gewohnheiten g1–g24, Monate k01–k12, noch fehlende Sonderseiten. Vorhandene Bilder zählen mit.
- Bildsprache und Container beibehalten: fotorealistisch, warmes Elfenbein/Naturholz, 間 ma, wenige Dinge,
  viel freie Fläche unten, weiche Ränder und Schrift im Verlauf. Stilreferenzen direkt ansehen.
- Profil bleibt WebP 80/Methode 6, 1200 × 800, Lanczos, RGB ohne Metadaten. Originale außerhalb des Repos.
  Nach jeder Serie Größen nachmessen und Hochrechnung, größte Datei sowie Repo-/Seitengröße dokumentieren.
  Komprimierung erst bei begründetem Bedarf anhand von Vergleichsbildern aus Originalen ändern;
  keine pauschale Qualitätsabsenkung und keine erneute verlustbehaftete Komprimierung aus WebP.
- `docs/SITZUNGSBRIEF-BILDER.md` spätestens vor Sitzungsende aktualisieren, bei knappem Kontext sofort:
  fertig/teilfertig, offene Punkte, nächste zehn fehlende Kennungen samt Motiven, Prüfungen, Merge/Pages,
  Komprimierungsprofil und Größenmessung. Diesen Auftrag im nächsten Brief wiederholen.
  Die nächste Sitzung führt denselben Ablauf fort. Bei 148/148 Abschlussbericht statt weiterer Bildaufträge.

## Stand

20 weitere Bilder für Wäsche und Schlafzimmer (Klaus, 2026-10-23): ausdrücklich nächste 20
auf dieselbe Art einschließlich automatischem Upload, Merge und Veröffentlichung beauftragt.
s3.9, st4, s4.1–s4.12, st5, s5.1–s5.5 über das Importwerkzeug eingefügt, keine abgewiesene Kennung.
**68 von 148**, 80 fehlen; Cache v23, Inhalt v9 synchron. Nummern 49–68 samt Thema, Datei und
App-Ansicht in docs/BILDER-ZUORDNUNG-SERIE-68.md; Gesamtbestand automatisch in BILDER-STAND.md.
Texte und weiche Container erhalten. Originale /workspace/work/bilder40/originale/ außerhalb des Repos.
41.285.491 Bytes PNG → 1.283.862 Bytes WebP (96,89 % kleiner); PSNR35,58–41,30dB.
Alle68: 3.455.274 Bytes, Maximum102.110Bytes(st4), Prognose148: 7.520.302 Bytes.
Profil unverändert WebP80/Methode6, Lanczos,1200×800,RGB ohne Metadaten; Größenmessung fortgeschrieben.
Ausgangsstand vollständig grün: Lauf 39998638015. Vollständiges npm test und 188 Bildproben
grün in Lauf 39999887648 (Bildcommit160c4bb). Gegenprobe ohne Bildliste erfolgreich: alle20
neuen Kennungen reagieren mit eigenen roten Zeilen. Raum-/Schrittansichten, Anleitungstexte,
320/380/1100px und weiche Übergänge geprüft. Temporären Prüfworkflow vor Merge entfernt.
Lokale Browser-/Kindprozessbeschränkungen durch vollständige GitHub-Actions-Prüfung abgedeckt.
PR #22 enthält verbindlichen Merge-/Pages-Nachweis nach Veröffentlichung. Echte Handys und reale
Ladezeit ungemessen. Nächste zehn: s5.6–s5.10, st6, s6.1–s6.4. Fortlaufenden Auftrag bis148/148
mit erneuertem Brief weiterführen, ohne abweichende neue Anzahl wieder zehn pro Sitzung.

20 Bilder für Küche und Bad (Klaus, 2026-10-23): ausdrücklich 20 neue Bilder sowie automatischer
Upload, Merge und Veröffentlichung beauftragt, als Ausnahme vom bisherigen Zehnerablauf.
s2.3–s2.13, st3 und s3.1–s3.8 über tools/bilder-einfuegen.py importiert, keine abgewiesene Kennung.
**48 von 148**, 100 fehlen. Cache v22, Inhalt v8 synchron. Texte und weiche Bildcontainer erhalten.
Originale unter /workspace/work/bilder20/originale/ außerhalb des Repos; 39.518.177 Bytes PNG
→ 937.134 Bytes WebP (97,63 % kleiner), PSNR 37,43–41,52 dB. Profil unverändert WebP 80/Methode 6,
Lanczos, 1200 × 800, RGB ohne EXIF/ICC/XMP. Alle 48 Bilder 2.171.412 Bytes, größtes s1.2 mit
83.250 Bytes. Prognose 148: 6.695.187 Bytes. Einzelwerte und Dateibaum in Komprimierungsdokumentation.
Ausgangsstand vollständig grün (39989290838); vollständiges npm test, 126 Bildproben und
Gegenprobe ohne Bildliste grün in Lauf 39992674165. Frühere Durchläufe trafen die enge Sekundenannahme
der vorhandenen Uhrprobe; sie prüft nun Zehn-Minuten-Start und eigenes Weiterzählen statt „9:5x“.
Die App-Uhrlogik wurde nicht geändert. PR #21 führt Merge-/Pages-Nachweis nach Veröffentlichung.
Echte Handydarstellung, reale Ladezeiten und persönliche Gegenprüfung noch offen.
Nächste zehn: s3.9, st4, s4.1–s4.8; siehe erneuerten Sitzungsbrief.

Bildserie 3 (2026-10-22): s1.2–s1.8, st2, s2.1 und s2.2 erzeugt und über das Werkzeug
importiert, keine abgewiesene Kennung; **28 von 148**. Cache v21, Inhalt v7.
Originale außerhalb des Repos unter `/workspace/bilder-eingang/serie3/`; Pantoffelkorb vor Import
auf sechs Schuhe korrigiert. Profil unverändert: WebP 80/Methode 6, Lanczos, 1200 × 800, RGB.
Zehn PNGs 20.263.394 Bytes → 516.982 Bytes WebP (97,45 % kleiner), PSNR 37,18–40,59 dB.
Alle 28 Bilder 1.234.278 Bytes, Maximum s1.2 mit 83.250 Bytes, Hochrechnung 148: 6,52 MB.
Größenmessung samt Dateibaum in docs/BILDER-KOMPRIMIERUNG.md. Kein Anlass zur Profiländerung.
Vollständiges npm test grün in Lauf 39792885767; Bildprobe auf beide Serien erweitert,
65 Bildproben: Raum-/Schrittansichten, Texte, weiche Übergänge, 320/380/1100 px.
Gegenprobe ohne Bildliste liefert 37 eigene rote Zeilen, darunter alle zehn neuen Kennungen. Speicherprobe stellt den
bildlosen Fall jetzt unabhängig vom wachsenden Bestand. PR #17 gemergt: `29d71808443abc29dbaf2c83fed47b54b6210098`; Pages-Lauf 39793574847 erfolgreich abgeschlossen.
Echte Handydarstellung, reale Ladezeiten und persönliche Gegenprüfung durch Klaus noch offen.
Nächste Sitzung: s2.3–s2.12, siehe erneuerten Sitzungsbrief. Keine weitere Serie dieser Sitzung.

Fortlaufende Übergabe (Klaus, 2026-10-22): Zehnerserien und erneuerter Sitzungsbrief verbindlich festgehalten.
`docs/SITZUNGSBRIEF-BILDER.md` führt mit s1.2–s1.8, st2, s2.1 und s2.2 fort (danach voraussichtlich 28/148).
Größenkontrolle von main b4fb784: 18 WebP zusammen 717.296 Bytes; größte Datei 58.834 Bytes.
Hochrechnung bei aktuellem Mittel: 5,90 MB für alle 148 Bilder, aktueller Dateibaum insgesamt 7,29 MB.
GitHub meldet 5.958 KiB Repo-Größe; getrennte Messarten, siehe Komprimierungsdokumentation.
Aktuell kein Anlass zur Qualitätsabsenkung. Künftige Größen, echte mobile Ladezeit und subjektiver
Qualitätsvergleich aller Bilder sind nicht gemessen. In dieser Übergabe keine neue Bildserie erzeugt.
Prüfung: vollständiges `npm test` grün (Lauf 39788359712); nächste zehn Kennungen gegen den Bestand
geprüft, Inhalts-/Motivbrief-Generatoren aktuell. Größen anhand vollständigen GitHub-Dateibaums ermittelt.

Bildserie 2 (Klaus, 2026-10-22): ausdrücklich zehn weitere Bilder beauftragt, in logischer Reihenfolge
Grundlagen und Beginn Eingang: st0, s0.1–s0.7, st1, s1.1. Fotorealistische helle Naturpalette, wenige Dinge,
viel Leere; vorhandene weiche Bild-/Rahmenverläufe und Schriftüberlappung werden unverändert verwendet.
Über `tools/bilder-einfuegen.py` importiert, keine abgewiesene Kennung. Neuer Stand: 18 von 148.
Gleiches Komprimierungsprofil: WebP 80/Methode 6, 1200 × 800, Lanczos, RGB ohne EXIF/ICC/XMP.
Zehn Original-PNGs 18.517.061 Bytes → 363.702 Bytes WebP (98,04 % kleiner), PSNR 38,39–40,95 dB
gegen den unkomprimierten 1200-×-800-Zuschnitt. Originale außerhalb des Repos erhalten.
Prüfung: vollständiges `npm test` grün (Prüfschritt im Lauf 39771964799), darunter 34 Bildproben:
alle zehn Zuordnungen und Raumköpfe, Anleitungstexte, 320/380/1100 px und Schrittansichten.
Gezielter Nachlauf 39772601293 grün; Gegenprobe mit fehlender Bildliste liefert 18 eigene rote Zeilen.
⚠ Echte Handydarstellung, subjektiver Qualitätsvergleich und persönliche Gegenprüfung nicht gemessen.

Seitwischen (Klaus, 2026-10-22): Finger nach links zur nächsten Hauptseite, nach rechts zurück,
in der Reihenfolge der unteren Navigation. Anfang und Ende bleiben stehen. Keine Seitengeste während
Einrichten, Station oder laufender Sitzung; Arbeits-/Pausenuhren werden nicht angehalten.
Vertikales Scrollen, Vergrößern, Eingaben, Buttons, Mehrfingergesten und Browser-Randgesten bleiben frei.
Prüfung: vollständiges `npm test` grün (Lauf 39766293339); echte Browser-Touch-Gesten über alle sechs
Hauptseiten vor/zurück, native Scrollbewegung, Randgesten, Mehrfinger, Buttons, Eingaben und Uhrerhalt geprüft.
Gegenprobe ohne Wischsteuerung liefert eigene rote Zeilen.
⚠ Echte Touch-Geräte und persönliche Gegenprüfung noch nicht gemessen.

Sonnenlicht (Klaus, 2026-10-22): Morgenlicht/Sonnenschein mit durchgehendem Verlauf von links oben
nach rechts unten über den ganzen Bildschirm. Das begrenzte Fensterlicht-SVG mit sichtbarer rechter Kante
ist ersetzt. Breiter, weicher Lichtschein folgt dem Mauszeiger hinter den Karten; keine Überlagerung der
Texte oder Eingaben. Bildschirmkoordinaten bleiben beim Scrollen passend. Auf Touch-Geräten und bei
reduzierter Bewegung kein nachgeführter Lichtschein. Themenwechsel, Mausverlassen und Fensterwechsel
blenden ihn aus. Prüfung: vollständiges `npm test` grün (Lauf 39766293339); Hintergrundpixel bei
380/1440/2048 px, breiter Lichtschein, Mausnachführung, Scrollen, Themenwechsel und reduzierte Bewegung geprüft.
Gegenprobe mit hartem Rand und abgeschaltetem Schein reagiert rot.
⚠ Echte Geräte und subjektive Wirkung bei Klaus noch nicht gemessen.

Naturflächen und Orientierung (Klaus, 2026-10-21): aktive Navigation unten mit Schriftgewicht 800,
hinterlegter Fläche und oberer Markierung. Washi mit unregelmäßigen Papierfasern, Sand mit feinem Korn,
Leinen mit Webstruktur, Morgenlicht mit weichem Fensterlicht; Kirschblüte bleibt ohne Zusatzmotiv.
Alle Strukturen als kleine eingebettete SVGs, ohne Netzabruf oder neue Motivbilder.
Glas-Cabochon-Buttons nach `family-project` (`assets/style.css`, `wireHoloButtons`): geschliffene Kante,
gewölbte Fläche, Schimmer und Neigung folgen dem Mauszeiger. Größen bleiben passend zu dieser App,
Farben folgen dem Naturthema. Touch-Scrollen und reduzierte Bewegung ohne Neigung.
Dämmerung und Moos ergänzen die sechs hellen Themen; Start bleibt Washi, nur die eigene Wahl wird gespeichert.
Bildverläufe und Schrift passen sich auch den dunkleren Flächen an. Die breite transparente Uhrleiste entfällt;
nur deckende Zeit-Chips schweben beim Scrollen unter dem Kopf. Arbeits-/Pausenlogik unverändert.
Prüfung: vollständiges `npm test` grün (Lauf 39651628770). Gegenproben für aktive Navigation,
Materialstruktur, transparente Uhrfläche und ausgeschaltete Mausneigung reagieren jeweils rot.
⚠ Am echten Handy, mit echten Stimmen und beim Kaltstart der installierten PWA noch nicht gemessen.

Sprachenwunsch (Klaus, 2026-10-21): Deutsch, Englisch, Russisch, Japanisch, Spanisch und Polnisch;
fest eingebaute Übersetzungen auch ohne Internet, einschließlich Oberfläche, Anleitungen und Vorlesen.
Offline-Sprachwahl über 文 eingebaut; eigenes `oj_sprache`, Sprachwechsel lädt dieselbe Ansicht neu.
Verlauf, Profil, Themenwahl und laufende Uhren bleiben. Sprachdaten aus dem eigenen Cache, kein Dienstabruf
in der App. Google Übersetzer als maschinelle Erstfassung; Fachbegriffe und neun Mischwarnungen je Sprache
in `docs/uebersetzungen/korrekturen.json` gesondert formuliert; mehrdeutige Überschriften zu
Kleiderbügeln, Vorratsboxen, Dusche, Hof, Flecken und ähnlichen Haushaltsbegriffen nachgeprüft. Vollständigkeit, Platzhalter und Zahlen geprüft.
`assets/sprachen.js` wird mit `npm run sprachen` gebaut; deutsche Quelle und alle Kennungen unverändert.
Vorlesen folgt der gewählten Sprache, japanische Begriffe bleiben japanisch. Passende Offline-Stimmen müssen
auf dem Gerät verfügbar sein. Prüfung: vollständiges `npm test` grün (Lauf 39656462259), darunter
79 Sprachproben: Cache/Offline-Neuladen, Sprachwechsel, Daten- und Uhrerhalt, Unicode-Suche, Stimmenwahl,
Mengen/Temperaturen/Zeiten, Haushaltskontext und 320/380 px. Gegenproben für fehlende Sprachtexte,
abgeschaltete Oberflächenübersetzung und falsche Vorlesesprache liefern eigene rote Prüfzeilen.
Sprachliche Gegenprüfung durch Muttersprachler und echte Geräte nicht gemessen.

Bildübergänge (Klaus, 2026-10-21, Korrektur nach Gestaltungsschritt): keine harte Trennung zwischen Bild
und Text. Das Bild läuft unten mit einem transparenten Verlauf in das Papier des gewählten Themas aus;
nahezu schwarze Schrift beginnt 48–88 px innerhalb des Bildbereichs. Motiv oben länger sichtbar, 3:2 und
Komprimierungsprofil unverändert. Auch das Pausenbild läuft weich aus, ohne getrennte Textkarte.
Die vorherige Darstellung mit Text ausschließlich unter dem Bild wurde auf Klaus' Wunsch ersetzt.
Alle Inhaltsbilder verwenden diesen Verlauf; keine hart abgegrenzten Bild/Text-Flächen.
Auch Bildrahmen oben und seitlich gehen weich in die Hintergrundfarbe des gewählten Themas über.
Die feine Kontur bleibt im Textbereich erhalten; Bildränder haben keinen separaten harten Rahmen.
Weitere helle Themen: Leinen, Morgenlicht und Kirschblüte (zusammen mit Washi, Sand, Salbei jetzt sechs).
Button-Lichtreflex breiter und heller (eine Sekunde), mit stärkerem Leuchtrand beim Darüberfahren;
auch externe Maus an Touch-Geräten wird über `any-hover`/`any-pointer` berücksichtigt.
Regeln-Seite: kein zusätzliches Flaschenbild und keine getrennte Überschrift im Kopf; „Regeln“ steht als
Hauptüberschrift im Pinselbild, darunter „Warum in kleinen Schritten?“ im selben Bereich.
`x-regeln.webp` bleibt als vorhandene Bilddatei erhalten, wird dort aber bewusst nicht angezeigt.
Prüfung: vollständiges `npm test` grün (GitHub-Lauf 39645083726), darunter 49 Gestaltungsproben.
Bildrahmen in allen sechs Themen, Textüberlappung, 320/380 px und Button-Lichteffekte geprüft.
Gegenprobe mit absichtlich hartem Bild/Text-Übergang liefert eigene rote Prüfzeilen.
⚠ Am echten Handy, mit echten Stimmen und beim Kaltstart der installierten PWA nicht gemessen.
Gegenprüfung der Darstellung durch Klaus steht aus.

Gestaltung (Klaus, 2026-10-21, nach Gegenprüfung der ersten Serie): oben ◐ zur Auswahl der hellen Naturthemen
Washi, Sand und Salbei; Wahl in `oj_thema`, früh vor dem Stylesheet geladen. Kein dunkles Systemthema mehr.
Glas-Buttons übernehmen Flächen, Text und 3D-Kante aus dem gewählten Thema; kurze Wackelbewegung und Lichtreflex
bei Mausberührung, Einfedern beim Drücken; reduzierte Bewegung respektiert. Bilder vollständig in 3:2 ohne Zoom
oder weißen Schleier; dunkler Text darunter auf deckendem Papier. Das gilt auch für das Pinselmotiv und die Pause.
„Nie mischen“: Stoffnamen in allen Warnkarten mit `strong` hervorgehoben, Katalog und Vorlesetext unverändert.
Prüfung: vollständiges `npm test` grün (GitHub-Lauf 39640385636), einschließlich 29 Gestaltungsproben,
Kontrast mindestens 4,5:1, 320/380 px, gespeicherter Themenwahl, Button-Aktionen und Warnkarten.
Gegenprobe für Themenwahl, Bildformat und fette Stoffnamen liefert eigene rote Prüfzeilen.
Nach letzter Farbkorrektur am Pausen-Chip: Uhr- und Gestaltungsproben erneut grün (Lauf 39641068632).
⚠ Am echten Handy und mit echten Stimmen nicht gemessen; Gegenprüfung der Darstellung durch Klaus steht aus.

Bilder immer in kleinen Serien (Klaus, 2026-10-21): nur die vorhandene, freigegebene Serie einbauen,
veröffentlichen und Klaus die App zum Aktualisieren geben. Erst nach seiner Gegenprüfung und Freigabe die nächste
Serie bearbeiten. Keine Bilder auf Vorrat erzeugen. Gewünschte helle Naturpalette und braune Glas-Buttons mit
sanftem Wackeln, 3D-Druck und Lichtreflex bei Mausberührung: im Gestaltungsschritt umgesetzt (siehe unten).
Komprimierung (Klaus, 2026-10-21): WebP Qualität 80, Methode 6, 1200 × 800, Lanczos, RGB ohne Metadaten;
immer vom Original importieren. Profil im Werkzeug festgelegt, Messung in `docs/BILDER-KOMPRIMIERUNG.md`.
Erste Serie: 353.594 Bytes statt 15.254.079 Bytes PNG (97,68 % kleiner).
Bildserie 1 (2026-10-21): x-willkommen, x-warum, x-pause, x-gewohnheiten, x-kalender, x-flecken, x-regeln,
x-verlauf eingebaut (8 von 148), fünf fehlende Verbindungen zum Seitenkopf ergänzt. ⚠ Darstellung am echten
Handy, reale Stimmen und Kaltstart der installierten PWA nicht gemessen; Gegenprüfung durch Klaus steht aus.
Prüfung dieser Serie: vollständiges `npm test` auf GitHub grün (Lauf 39636985993); Ausgangsstand ebenfalls grün.
Gegenprobe mit absichtlich fehlenden Bildköpfen liefert eigene rote Prüfzeilen.

Stufe 1 (Gerüst) gebaut 2026-10-21: Stationen, Schritte, Abhaken mit Zähler und 習 ab 21×, Sitzung
Schritt für Schritt mit Vorlesen (Gruß auf Japanisch), Jahreskalender mit Haken, Fleckenkarten mit Suche,
Regeln, Verlauf, Rückgängig, hell/dunkel. ⚠ Am Handy nicht gemessen; Stimmen sind in der Probe gestellt.
Einrichten (2026-10-21, Klaus' Wunsch): Räume zählen, Reihenfolge nach Wichtigkeit antippen, Takt wählen;
Profil in `einst/profil`. Ohne Profil zeigt der Start „Willkommen“ statt der Raumliste. „Warum in kleinen
Schritten“ steht als Abschnitt in INHALT.md (aus den Heften gesammelt: 30-Sekunden-Entscheidung, Kiste des
Zweifels, ein Schrank pro Tag …). Japanische Wörter mit Lautschrift in `assets/japanisch.js` — das Kanji je
Raum muss zu `KANJI` in `tools/inhalt-bauen.mjs` passen (`tests/inhalt.mjs` prüft es).
Takt-Uhr (2026-10-21): Arbeit/Pause nach dem Profil, gerechnet mit Endzeiten in localStorage (`oj_takt`),
Pausenfenster 休憩 mit Gong und eigenem Pausenklang (`assets/klang.js`, Web Audio, Hirajōshi, keine Dateien),
Einwirk-Uhren je Schritt bis 120 Min. (`oj_uhren`), Bildschirm wach (WakeLock) während der Sitzung.
`tests/uhr.mjs` spult die Zeit mit `page.clock` vor — die Zeit läuft dabei weiter, Toleranzen sind gewollt.
⚠ Bei ausgeschaltetem Bildschirm bremst Android die Uhr; Gong und Ansage kommen dann erst beim Zurückkommen.
Gute Gewohnheiten (Klaus 2026-10-21, 習慣): 24 Gewohnheiten aus allen Räumen als Tabelle in INHALT.md
(Takt täglich · Woche · Gelegenheit), eigener Bereich `#/gewohnheiten` in der Leiste. Eigene Liste in
`einst/gewohnheiten`, Vorschlag g1/g4/g7 — **wer die Tabelle umsortiert, ändert die Kennungen** (Verlauf und Liste
hängen daran; neue Zeilen nur unten anfügen). Serie = Tage/Wochen in Folge bis heute oder gestern; „jedes Mal“
zählt nicht im Heute-Ring. `tests/gewohnheiten.mjs` spult Tage vor.
Version 1.0 auf main.
1.1 (Klaus 2026-10-21 nachmittags): „Die 5 Reinigungsmittel“ (Schritt 0.1 und eigene Seite `#/mittel` aus der
Tabelle in INHALT.md; Texte nennen das Mittel beim Namen) · ← Zurück in der Kopfzeile überall, in der Sitzung
nie gesperrt (vom ersten Schritt in den letzten des vorigen Raums) · Sitzung schreibt den Schritt in die Adresse
(`history.replaceState`), Neuladen setzt fort · ⟳ Aktualisieren = neueste Fassung laden wie „Neu laden“, Daten
bleiben (`aktualisieren()`, Meldung danach) · „Alles löschen und neu anfangen“ mit Rückfrage (`DB.allesLoeschen`)
· Verlauf mit „Deine Entwicklung“ und Monatskalender · „Was möchtest du heute tun?“ (tippen oder 🎤,
`assets/absicht.js`: Stichwörter je Raum, ohne KI, ohne Netz) · Bildplätze hinter Texten (`bilder/`, nur
Kennungen aus `inhalt.js` → `bilder`), Text auf heller Verlaufsfläche · Wörterliste ohne Überlagerung bei 320 px.
Bilder kommen von ChatGPT über `docs/CHATGPT-BRIEF.md` (gebaut aus `docs/BILD-MOTIVE.md`; Grundsatz 間 ma).
Übergabe an andere Sitzungen: `AGENTS.md` (Codex/ChatGPT), Veröffentlichen und Schlüssel: `docs/VEROEFFENTLICHEN.md`.
Proben: `tests/speicher.mjs`, `tests/absicht.mjs`. ⚠ Spracheingabe nur gestellt gemessen; am Handy ungemessen.
1.2 (2026-10-21 abends): 📲 Installieren-Knopf (Regel oben), gründliches ⟳, Zahlen in „Deine Entwicklung“ sind Knöpfe mit
Liste darunter (Tage, Haken, Schritte nach Raum, Räume, Weg zu 習, Kalender je Monat), Bilder-Werkzeug für Codex.
⚠ Nach dem Merge von 1.2 (#7) startete GitHub **keinen** Lauf „pages build and deployment“ — die Seite blieb auf 1.1.
Wie bei Workflow PDF: nach jedem Merge den Lauf in Actions ansehen; fehlt er, stößt ein weiterer Commit auf `main` ihn an.
Noch nicht: Sprachbefehle während der Sitzung, Medientasten der Ohrhörer, eigene Musik, native Android-Hülle.

