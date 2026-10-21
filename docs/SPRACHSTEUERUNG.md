# Sprachsteuerung und Kopfhörer · Stand 21.10.2026

## Bedienung

In einer Sitzung „Zuhören einschalten“ antippen. Erst danach beginnt die Mikrofonanforderung.
Ein Fenster nimmt genau einen endgültig erkannten Befehl an und endet spätestens nach 15 Sekunden.
Für den nächsten Befehl erneut einschalten. Kein Dauer-Zuhören, keine gespeicherte Aktivierung.
Während einer Ansage wird die Erkennung abgebrochen, damit die App sich nicht selbst steuert.
App-Wechsel, Seitenausgang, Offline-Wechsel, Fehler und Neuladen beenden das Zuhören.
Nach Rückkehr muss es ausdrücklich neu aktiviert werden. WakeLock bleibt eine optionale Bildschirmhilfe.

| Gesprochen | Wirkung |
|---|---|
| fertig, abgehakt | Aktuellen Schritt genau einmal speichern und vorgehen |
| weiter, nächster Schritt | Ohne Abhaken vorgehen; am Abschluss nächste Runde/Station; in Pause: Pause beenden |
| nochmal, noch mal, wiederholen | Aktuelle Ansage wiederholen |
| langsamer | Aktuelle und folgende deutsche Ansagen mit Tempo 0,72 statt 0,92 (bis Neuladen) |
| zurück | Bestehende Zurück-Bedienung |
| Pause, Musik | Arbeitspause beginnen; eine laufende Pause bleibt bestehen |
| wie lange noch | Restzeit des Arbeits-/Pausentakts und aller Einwirk-Uhren, auf volle Minuten aufgerundet |
| warum | Vorhandene Begründungen für kleine Arbeitsblöcke vorlesen |
| Fleck Rotwein, Rotweinfleck | Rotwein-Fleckenkarte öffnen; Sitzung verlassen |
| stopp, stop | Zuhören und Ansage beenden; Uhren laufen weiter |

Großschreibung, Satzzeichen und ein „bitte“ am Anfang oder Ende sind egal. Keine unscharfen
Teilworttreffer: „nicht fertig“ oder „weiterarbeiten“ lösen nichts aus. Unbekanntes wird nicht ausgeführt.
Warnkarten werden ausschließlich durch „Verstanden · Los geht’s“ am Bildschirm bestätigt.
Während der Pause werden keine Schritte abgehakt und keine Schritte im Hintergrund gewechselt.
Alle bisherigen Bildschirmtasten bleiben bestehen; „Wie lange noch?“ und „Warum?“ gibt es zusätzlich als Tasten.
Das Pausenfenster bietet eigenes Zuhören an/aus, Restzeit und „Pause beenden“.

## Grenzen und Datenschutz

`SpeechRecognition` oder `webkitSpeechRecognition`, sicherer Kontext (HTTPS/localhost), sichtbare App
und Online-Status werden geprüft. Ein positives Merkmal ist keine Zusage, dass der Dienst verfügbar ist.
Mikrofonverweigerung, fehlendes Mikrofon, Netzfehler, keine Sprache, Startfehler und Browser-Ende führen
zur verständlichen Tastenbedienung zurück; keine automatischen Wiederholschleifen oder Berechtigungsdialoge.
Die App speichert keine Aufnahmen/Transkripte und verwendet keine zusätzliche KI oder Sprachbibliothek.
**Der Browser kann Audio jedoch an einen externen Erkennungsdienst senden.** Deshalb steht der Hinweis vor
Aktivierung sowohl an der Sitzungssteuerung als auch an der schon vorhandenen Raum-Spracheingabe.
Die lokale Stichwortauswertung sendet nichts selbst ins Netz. „Keine Daten ins Netz“ ist für die
optionale Browser-Spracherkennung keine zutreffende Zusicherung.

Offline bleibt die App mit Tasten, Verlauf, Arbeits-/Einwirk-Uhren und dem vorhandenen Pausenklang nutzbar.
Offline-Spracherkennung wird bewusst nicht zugesichert oder automatisch nachinstalliert. Auch verfügbare
Offline-Sprachausgabe hängt von installierten Geräte-Stimmen ab. Android kann Hintergrundseiten anhalten;
Zeitstempel bleiben richtig, Gong/Ansage können aber erst bei Rückkehr kommen. WakeLock überwindet diese
Betriebssystemgrenze nicht und kann selbst verweigert oder freigegeben werden.

## MediaSession: ausdrücklich ein Versuch

Unter „Befehle und Kopfhörer“ → „Kopfhörertasten testen“ werden einzeln unterstützte Handler registriert:
Play → fertig, Nexttrack → weiter, Previoustrack → nochmal, Pause → Arbeitspause, Stop → stopp.
Nicht unterstützte Einzelaktionen werden abgefangen; ganz fehlende Unterstützung zeigt die Tastenalternative.
„Kopfhörertasten ausschalten“, Navigation aus der Sitzung und App-Wechsel entfernen die Handler.

**Handler registriert bedeutet nicht: Kopfhörer funktionieren.** MediaSession ist keine Bluetooth-Verbindung
und kann keine Kopfhörertasten erzwingen. Der Browser/das Betriebssystem entscheidet über Medienfokus und
Weiterleitung; TTS (`speechSynthesis`) und vorhandenes Web-Audio-Pausenmusik allein sichern diesen Fokus nicht.
Auch `playbackState` oder Metadaten würden keinen Medienfokus garantieren. Es wird kein stummer Dauerton und
kein versteckter Player gestartet, um Fokus künstlich zu beanspruchen. Andere Medien-Apps, Assistenten,
Sperrbildschirm, Anrufe und das Headset-Modell können das Ergebnis ändern. Das ist derzeit **kein zuverlässiger
Rückweg** für Sprache. Bei ausbleibender Reaktion die sichtbaren Tasten verwenden. Die App schaltet das
Mikrofon niemals durch eine Medientaste ein. Im Hintergrund führt sie keine Kopfhörerbefehle aus.

## Automatisierte Proben

`npm ci`, Chromium installieren (`node node_modules/playwright-core/cli.js install --with-deps chromium`),
`npm test`. GitHub Actions führt diese Proben bei Push und Pull Request aus.

- `tests/steuerung-adapter.mjs`: Befehle/Aliase, Verneinungen, endgültige vs. vorläufige Ergebnisse,
  doppelte/veraltete Ergebnisse, Erlaubnisprüfung, 15-Sekunden-Fenster, alle Fehler, Browser-Ende,
  Start-Ausnahme, MediaSession-Teilunterstützung, Aufräumen.
- `tests/steuerung.mjs`: echte App im Chromium mit gestellter Spracherkennung, Sprachausgabe und MediaSession;
  Warnkartenschutz, Abhaken vs. Überspringen, Ansage, Tempo, Restzeit, Pause, Mikrofonfehler,
  App-/Offline-Wechsel, Medientasten, Navigation, Neuladen, fehlende APIs, 320-Pixel-Breite;
  Service Worker inklusive neuem Skript, Offline-Neuladen und Offline-Abhaken.
- Bisherige Proben bleiben Teil von `npm test`. DB-Name und Manifest-ID sind unverändert.
- Gegenprobe: Befehlszuordnung absichtlich verändern; Adapter- und Browserprobe müssen ROT melden.

Diese Proben messen weder echte Spracherkennung noch Android/Bluetooth-Medienfokus.

## Noch offen: Samsung Galaxy S21 und Galaxy Tab S6

Alle folgenden Punkte sind **auf beiden Geräten noch ungemessen**. Jeweils Chrome, Samsung Internet sowie
installierte PWA prüfen, soweit Installation angeboten wird. Gerät, Android-/Browser-Version, PWA/Tab,
Kopfhörermodell, Ergebnisse und Auffälligkeiten protokollieren.

| Prüfung | Erwartung / zu protokollieren |
|---|---|
| Erster Start und Neuladen | Kein Mikrofon ohne bewusstes Einschalten, keine gespeicherte Aktivierung |
| Mikrofon erlauben/verweigern/widerrufen | Verständliche Meldung, Tasten bleiben nutzbar; erneut nur nach Antippen |
| Alle Befehle und Aliase, auch leise/mit Umgebungsgeräusch | Genau eine passende Aktion; keine Aktion bei „nicht fertig“; Fehlerrate notieren |
| Ansage läuft / nochmal / langsamer | Keine Selbstauslösung über Lautsprecher oder Headset; deutsche/japanische Stimmen weiter korrekt |
| Warnkarte und Pause | „fertig“ bestätigt keine Warnkarte und erledigt nichts hinter dem Pausenfenster |
| 15 Sekunden Stille, Browser beendet früh | Mikrofon aus, keine Neustartschleife; Status passt zum Mikrofonindikator |
| Home-Taste, andere App, Bildschirm aus, Rückkehr | Aufnahme endet, keine Hintergrundaktion; nach Rückkehr erneut einschalten |
| WakeLock, Energiesparen, längere Arbeit/Pause | Wachhalten nur soweit erlaubt; Uhren korrekt, mögliche verzögerte Ansage dokumentieren |
| Flugmodus nach Online-Erstbesuch, PWA schließen/neu öffnen | App startet offline, Tasten und Verlauf funktionieren, kein Versprechen der Offline-Erkennung |
| Kopfhörer Play/Pause/Next/Previous/Stop | Erst Testmodus einschalten, jede tatsächlich zugestellte Aktion protokollieren; kein Effekt = Rückfalltaste |
| Headset während Ansage, Stille und Pausenklang | Medienfokus und Zuordnung je Zustand separat messen; Play/Pause-Wechseltaste kann anders zugestellt werden |
| Spotify/anderer Player, Assistent, Anruf, Bluetooth trennen/neu verbinden | Keine Zusage für Fokus; keine unerwarteten Doppelaktionen; Tastenalternative benutzbar |
| App-Wechsel/Sperrbildschirm nach Kopfhörertest | Keine Aufgaben im Hintergrund abhaken; Rückkehr erfordert erneutes Aktivieren |
| Update der installierten PWA | Neuer Service-Worker-Vorrat, Räume/Verlauf bleiben; anschließender Offline-Start |

## Technische Quellen

Am 21.10.2026 geprüft:
- Web Speech API (Einwilligung, Lebenszyklus, Browser-/Serverimplementierung): https://webaudio.github.io/web-speech-api/
- Media Session (Aktionen, Routing durch den Browser): https://w3c.github.io/mediasession/
- Chrome MediaSession, tatsächliche Medienwiedergabe: https://developer.chrome.com/blog/media-session
