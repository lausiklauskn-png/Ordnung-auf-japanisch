"""Baut alle Icons aus icons/quelle.png (Klaus' runder 整理-Teller aus ChatGPT, 2026-10-21).

Die App ist RUND (Klaus: „nicht runde Ecken, sondern richtig rundes Icon“): außerhalb des Tellers durchsichtig.
Zwei Plattformen bekommen je eine eigene Fassung, weil sie Icons verschieden behandeln:

  icons/icon-192.png, icon-512.png   rund, durchsichtig ("any") — PWA-Installation, Desktop, Android-Chrome
  icons/icon-512-maskable.png        Android-Launcher schneiden selbst zu (Kreis, Squircle …): Teller auf 72 %
                                     auf Washi-Grund, damit nie ein Rand oder eine Ecke entsteht
  icons/favicon-64.png               rund, Browser-Reiter
  icons/seiri-480.webp               rund, für die Startseite der App
  icons/apple-touch-icon.png (180)   iOS: kein Alpha erlaubt, iOS rundet selbst — Klaus' gelieferte Fassung:
                                     Teller auf Weiß (Klaus 2026-10-21)
  icons/ios/AppIcon-1024.png         iOS App Store (später, z. B. Capacitor): 1024, deckend, Teller auf Weiß
  icons/android/play-store-512.png   Google Play: 512, rund mit Alpha
  icons/android/adaptive-foreground-432.png + adaptive-background-432.png
                                     Android-Adaptive-Icon für eine native Hülle (TWA/Capacitor), Teller im
                                     sicheren Bereich (66 %)

Aufruf: python3 tools/icon-bauen.py   (braucht Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

W = Path(__file__).resolve().parent.parent / 'icons'
WASHI = (239, 226, 203, 255)
GROSS = 4  # Kantenglättung: Maske vierfach rechnen

quelle = Image.open(W / 'quelle.png').convert('RGBA')
b, h = quelle.size
# Der Teller: Mittelpunkt und Radius gemessen (links 0, rechts 1251, oben 0, unten 1240); 0,8 % nach innen,
# damit der weiße Saum der Vorlage nicht mitkommt.
cx, cy, r = 626, 621, 620 * 0.992
teller = quelle.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r)))
s = teller.size[0]
maske = Image.new('L', (s * GROSS, s * GROSS), 0)
ImageDraw.Draw(maske).ellipse((0, 0, s * GROSS - 1, s * GROSS - 1), fill=255)
teller.putalpha(maske.resize((s, s), Image.LANCZOS))

def rund(groesse):
    return teller.resize((groesse, groesse), Image.LANCZOS)

WEISS = (255, 255, 255, 255)

def auf_grund(groesse, anteil, alpha=True, grund=WASHI):
    bild = Image.new('RGBA', (groesse, groesse), grund)
    t = int(round(groesse * anteil))
    bild.alpha_composite(rund(t), ((groesse - t) // 2, (groesse - t) // 2))
    return bild if alpha else bild.convert('RGB')

(W / 'ios').mkdir(exist_ok=True)
(W / 'android').mkdir(exist_ok=True)
ausgaben = {
    'icon-512.png': rund(512),
    'icon-192.png': rund(192),
    'favicon-64.png': rund(64),
    'icon-512-maskable.png': auf_grund(512, .72, alpha=False),
    'apple-touch-icon.png': auf_grund(180, .99, alpha=False, grund=WEISS),
    'ios/AppIcon-1024.png': auf_grund(1024, .99, alpha=False, grund=WEISS),
    'android/play-store-512.png': rund(512),
    'android/adaptive-foreground-432.png': (lambda g: (lambda bild: (bild.alpha_composite(rund(int(g * .66)), (int(g * .17), int(g * .17))), bild)[1])(Image.new('RGBA', (g, g), (0, 0, 0, 0))))(432),
    'android/adaptive-background-432.png': Image.new('RGB', (432, 432), WASHI[:3]),
}
for name, bild in ausgaben.items():
    bild.save(W / name, optimize=True)
    print('icons/' + name, bild.size, bild.mode)
rund(480).save(W / 'seiri-480.webp', quality=86, method=6)
print('icons/seiri-480.webp (480, 480) RGBA')
