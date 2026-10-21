"""Bilder von ChatGPT einsortieren — für Claude Code und Codex gleich.

    python3 tools/bilder-einfuegen.py <ordner-oder-dateien …>

Jede Datei muss mit ihrer KENNUNG beginnen (der Schlüssel aus docs/CHATGPT-BRIEF.md):
    s2.1.png · s2.1 Spüle am Abend.png · st3.webp · g7-spuele.jpg · m1.png · k10.png · x-pause.png
Das Werkzeug
  - prüft die Kennung gegen docs/BILD-MOTIVE.md (unbekannte Kennungen werden abgewiesen und genannt),
  - schneidet auf 3:2 zu, verkleinert auf 1200 × 800 und speichert bilder/<Kennung>.webp (Qualität 80, Methode 6),
  - baut assets/inhalt.js neu (die App zeigt nur Bilder, die dort unter „bilder“ stehen),
  - schreibt docs/BILDER-STAND.md: welche Kennungen ein Bild haben und welche noch fehlen.
Danach: CACHE_VERSION in sw.js erhöhen, npm test, PR. Ein vorhandenes Bild derselben Kennung wird ersetzt.
Braucht Pillow (pip install pillow).
"""
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image

W = Path(__file__).resolve().parent.parent
ZIEL = W / 'bilder'
BREITE, HOEHE = 1200, 800
# Festes Profil für jede Serie; Messwerte und Begründung: docs/BILDER-KOMPRIMIERUNG.md.
WEBP_QUALITAET, WEBP_METHODE = 80, 6

def kennungen():
    md = (W / 'docs' / 'BILD-MOTIVE.md').read_text(encoding='utf-8')
    return [m.group(1) for m in re.finditer(r'^- \*\*Bild (\S+) – ', md, re.M)]

def kennung_aus(name, bekannt):
    stamm = Path(name).stem
    # längste bekannte Kennung, mit der der Dateiname beginnt (s2.1 vor s2.10 richtig unterscheiden)
    for k in sorted(bekannt, key=len, reverse=True):
        if stamm == k or re.match(re.escape(k) + r'([ _\-.]|$)', stamm):
            return k
    return None

def einpassen(bild):
    bild = bild.convert('RGB')
    b, h = bild.size
    if b / h > BREITE / HOEHE:                       # zu breit: links/rechts kappen
        nb = int(h * BREITE / HOEHE); x = (b - nb) // 2; bild = bild.crop((x, 0, x + nb, h))
    else:                                            # zu hoch: oben/unten kappen (oben bleibt mehr)
        nh = int(b * HOEHE / BREITE); y = (h - nh) // 3; bild = bild.crop((0, y, b, y + nh))
    bild = bild.resize((BREITE, HOEHE), Image.LANCZOS)
    bild.info.clear()                                # keine EXIF-, ICC- oder Text-Metadaten weitergeben
    return bild

def stand(bekannt):
    da = {p.stem for p in ZIEL.glob('*.webp')}
    fehlt = [k for k in bekannt if k not in da]
    zeilen = ['# Bilder-Stand', '', '> GEBAUT von `tools/bilder-einfuegen.py` — nicht von Hand ändern.', '',
              f'**{len(bekannt) - len(fehlt)} von {len(bekannt)}** Bildern sind eingebaut. Schlüssel = Kennung aus '
              '`docs/CHATGPT-BRIEF.md`, Datei `bilder/<Kennung>.webp`.', '', '| Kennung | Bild |', '|---|---|']
    zeilen += [f'| `{k}` | {"✅" if k in da else "—"} |' for k in bekannt]
    (W / 'docs' / 'BILDER-STAND.md').write_text('\n'.join(zeilen) + '\n', encoding='utf-8')
    return len(bekannt) - len(fehlt), fehlt

def main(argv):
    bekannt = kennungen()
    dateien = []
    for a in argv:
        p = Path(a)
        dateien += sorted(x for x in p.iterdir() if x.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')) if p.is_dir() else [p]
    ZIEL.mkdir(exist_ok=True)
    ok, abgewiesen = [], []
    for d in dateien:
        k = kennung_aus(d.name, bekannt)
        if not k:
            abgewiesen.append(d.name); continue
        einpassen(Image.open(d)).save(ZIEL / f'{k}.webp', 'WEBP', quality=WEBP_QUALITAET, method=WEBP_METHODE)
        ok.append(k)
    subprocess.run(['node', str(W / 'tools' / 'inhalt-bauen.mjs')], check=True, cwd=W)
    fertig, fehlt = stand(bekannt)
    print(f'eingefügt: {len(ok)} ({", ".join(ok)})' if ok else 'eingefügt: 0')
    if abgewiesen:
        print('ABGEWIESEN (Dateiname beginnt mit keiner bekannten Kennung): ' + ', '.join(abgewiesen))
    print(f'Stand: {fertig} von {len(bekannt)} — es fehlen noch {len(fehlt)} (siehe docs/BILDER-STAND.md)')
    return 1 if abgewiesen else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]) if len(sys.argv) > 1 else (print(__doc__) or 0))
