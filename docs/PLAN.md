# 整理 Ordnung auf Japanisch — Plan (Plansitzung 2026-10-21)

Eine sprechende PWA, die durch die Wohnung führt: Station für Station, Schritt für Schritt,
mit Arbeits- und Pausentakt, Musik in der Pause und Sprachbefehlen über die Ohrhörer.
Ziel: jeder Handgriff wird zur **Gewohnheit**. Inhalt: `INHALT.md` (nur Tipps, nichts Persönliches).

## 1 · Icon und Titel

- Titel **整理** (seiri, „Ordnung schaffen“), darunter klein „Ordnung auf Japanisch“.
- Icon: 3D-Pinselschrift, Lack mit Spiegelung, Washi-Grund, roter Stempel. Den ChatGPT-Prompt hat Klaus
  in der Sitzung bekommen; das Bild kommt als `icons/seiri-1024.png`, daraus 512/192/120 + WebP.

## 2 · Ablauf einer Sitzung

1. **Start:** „Wo fangen wir an?“ — Vorschlag nach Reihenfolge und Fälligkeit (Gewohnheits-Takt).
   Reihenfolge durch die Wohnung: 0 Putzschrank → 1 Eingang → 2 Küche → 3 Bad → 4 Wäsche →
   5 Schlafzimmer/Schrank → 6 Wohnen/Papiere → 7 Böden → 8 Keller → 9 Draußen.
2. **Station:** Ansage „Station Bad. Beachte bitte folgende Hinweise …“ — Pflicht-Warnkarte
   (Mischverbote) vor Bad und Küche.
3. **Schritt:** Ansage vorlesen → arbeiten → „fertig“ / „abgehakt“ oder Tippen. Einwirkzeit = Uhr läuft,
   die App schlägt vor, was in der Zeit zu tun ist (Pausen-Brücke).
4. **Takt:** Arbeitsblock (Vorgabe 20 Min., einstellbar 10/15/20/25) → Pause (Vorgabe 10 Min.).
   In der Pause Musik, danach sanfter Gong und „Weiter mit …“.
5. **Ende:** kurze Rückschau (erledigt, Serie, nächster fälliger Schritt), Eintrag im Verlauf.

## 3 · Sprache

- **Ausgabe:** Web Speech `speechSynthesis`, deutsche Stimme, ruhiges Tempo (0,9). Japanische
  Färbung: Begrüßung/Abschied und Stationsnamen von einer `ja-JP`-Stimme („Hajimemashou“, „Otsukaresama“),
  Rest Deutsch. Ein echter „japanischer Akzent“ auf Deutsch gibt es in Browser-Stimmen nicht —
  später optional vorab erzeugte Audiodateien.
- **Befehle** (`SpeechRecognition`, de-DE, nur auf Knopfdruck „Zuhören“ einschalten):
  „wiederholen“ / „nochmal“ · „langsamer“ · „weiter“ / „nächster Schritt“ · „fertig“ / „abgehakt“ ·
  „zurück“ · „Pause“ / „Musik“ · „wie lange noch“ · „warum“ (liest den Grund) · „Fleck Rotwein“
  (Fleckenkarte) · „stopp“. Erkennung tolerant (Wortlisten, keine KI nötig).
- ⚠ **Grenze, früh messen:** Chrome/Android hört nur mit eingeschaltetem Bildschirm und App im
  Vordergrund; kein Dauer-Zuhören im Hintergrund. Plan: Bildschirm-wach (`WakeLock`), Zuhören
  in Fenstern nach jeder Ansage neu starten, Medientasten der Ohrhörer (`MediaSession`:
  Play = fertig, Weiter = nächster Schritt, Zurück = wiederholen) als zuverlässiger Rückweg.

## 4 · Musik in der Pause

- Eingebaut: eigener, lizenzfreier Klang aus Web Audio (pentatonisch, Koto-/Shakuhachi-ähnlich,
  Regen, Bambusbrunnen) — kein Download, offline.
- Eigene Wahl: Musikdateien vom Gerät (wird in IndexedDB gemerkt) oder eine Adresse (Spotify,
  YouTube) zum Öffnen. Lautstärke senkt sich unter jede Ansage.

## 5 · Gewohnheit

- Je Schritt: Häufigkeit (aus „Gewohnheits-Takt“), zuletzt erledigt, Serie, Anzahl.
- „Gewohnheit sitzt“, wenn ein Schritt 21× im Takt erledigt ist → Zeichen (Stempel 習 „gelernt“).
- Ab und zu passiert etwas: Jahreszeiten-Hintergrund, ein Kirschblütenblatt je erledigtem Schritt,
  Leitsätze als Zwischenruf, Bonsai/Zen-Garten wächst mit den Serien.
- Später: Kalender aus den nächsten PDFs, Erinnerungen (Notification), Export ins Workflow-Ökosystem.

## 6 · Gestaltung (Motion)

Washi-Papier, Tusche-Schwarz, Lackrot, Gold sparsam. Pinselstrich-Übergänge zwischen Stationen,
Tinte, die sich beim Abhaken ausbreitet, Enso-Kreis als Uhr für Arbeit/Pause/Einwirkzeit,
Hanko-Stempel beim Abschluss. `prefers-reduced-motion` respektieren. Große Ziele, eine Hand,
Handy hochkant zuerst.

## 7 · Technik

Wie Workflow PDF: PWA ohne Build-Schritt, `index.html` + `assets/*.js`, Service-Worker, Manifest-`id`
`/Ordnung-auf-japanisch/`, Speicher IndexedDB (`OrdnungJP1`, nie umbenennen). Inhalt als
`assets/inhalt.js` (aus `INHALT.md` erzeugt), Proben mit Playwright (`npm test`): Ablauf, Befehle
(gestellte Erkennung), Takt-Uhr, Speicher. Keine Daten ins Netz.

## 8 · Bau-Reihenfolge

1. Gerüst: Stationen, Schritte, Abhaken, Speicher, Icon.
2. Vorlesen + Takt-Uhr + Einwirkzeiten.
3. Sprachbefehle + Medientasten + WakeLock (am Tablet/Handy messen).
4. Pausen-Musik.
5. Gewohnheit, Serien, Motion.
6. Kalender (nächste PDFs).

## 9 · Rechte

- Quelle der Tipps: vier Begleithefte zu einem Haushaltsbuch (Erzählfigur ausdrücklich KI-generiert).
  Übernommen sind nur Fakten — Mengen, Zeiten, Reihenfolgen, Warnungen —, neu formuliert und neu
  geordnet. Kein Text, keine Gestaltung, keine Figur, keine Geschichte.
- In der App: „© 2026 Klaus — App und Gestaltung“ und ein Quellenhinweis auf die Hefte
  (Titel/Herausgeber trägt Klaus nach, sobald bekannt).
- Hinweis wie im Original sinngemäß: ersetzt keine fachliche, ärztliche oder rechtliche Beratung.

## Offene Fragen an Klaus

1. Der Takt „10 Min. Arbeit / 10 Min. Pause“ steht in keinem der vier Hefte — aus dem Hauptbuch?
   Bis dahin: einstellbar, Vorgabe 20/10.
2. Quellenangabe: Buchtitel und Verlag/Autor fürs Impressum.
