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
