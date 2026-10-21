"""Einmalige Erstübersetzung des öffentlichen Katalogs. App selbst fragt keinen Dienst ab.
Vor Veröffentlichung Übersetzungen, Platzhalter und Warnungen prüfen.
"""
import collections
import concurrent.futures
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ORDNER = Path('docs/uebersetzungen')
QUELLEN = json.loads((ORDNER / 'quellen.json').read_text())
TOKEN = re.compile(r'__OJ_(\d+)__')

def google(text, sprache):
    url = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode({
        'client': 'gtx', 'sl': 'de', 'tl': sprache, 'dt': 't', 'q': text})
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=35) as antwort:
        daten = json.load(antwort)
    return ''.join(teil[0] for teil in daten[0] if teil and teil[0])

def reparieren(text):
    return re.sub(r'_{1,2}\s*OJ\s*_\s*(\d+)\s*_{1,2}', lambda m: '__OJ_' + m[1] + '__', text, flags=re.I).strip()

def gueltig(quelle, ziel):
    return bool(ziel) and sorted(TOKEN.findall(quelle)) == sorted(TOKEN.findall(ziel))

def einzel(quelle, sprache):
    for versuch in range(4):
        try:
            ziel = reparieren(google(quelle, sprache))
            if gueltig(quelle, ziel): return ziel
        except Exception:
            pass
        time.sleep(1 + versuch)
    raise RuntimeError('Einzelübersetzung fehlgeschlagen: ' + sprache + ' / ' + quelle[:70])

def bauen(sprache):
    datei = ORDNER / (sprache + '.json')
    gespeichert = json.loads(datei.read_text()) if datei.exists() else {}
    fehlen = [q for q in QUELLEN if not gueltig(q, gespeichert.get(q, ''))]
    batches = []; jetzt = []; zeichen = 0
    for quelle in fehlen:
        if jetzt and (zeichen + len(quelle) > 2600 or len(jetzt) >= 25):
            batches.append(jetzt); jetzt = []; zeichen = 0
        jetzt.append(quelle); zeichen += len(quelle) + 16
    if jetzt: batches.append(jetzt)
    for nr, batch in enumerate(batches):
        markiert = '\n'.join('[OJ%04d] %s' % (i, q) for i, q in enumerate(batch))
        ergebnis = {}
        try:
            antwort = google(markiert, sprache)
            teile = re.split(r'\[\s*OJ\s*(\d+)\s*\]', antwort, flags=re.I)
            for i in range(1, len(teile), 2): ergebnis[int(teile[i])] = reparieren(teile[i + 1])
        except Exception:
            pass
        for i, quelle in enumerate(batch):
            ziel = ergebnis.get(i, '')
            if not gueltig(quelle, ziel): ziel = einzel(quelle, sprache)
            gespeichert[quelle] = ziel
        datei.write_text(json.dumps({q: gespeichert[q] for q in QUELLEN if q in gespeichert}, ensure_ascii=False, indent=2) + '\n')
        print('%s: %s/%s Pakete, %s Texte gespeichert' % (sprache, nr + 1, len(batches), len(gespeichert)), flush=True)
        time.sleep(.25)
    if any(q not in gespeichert for q in QUELLEN): raise RuntimeError('Unvollständig: ' + sprache)
    return sprache, len(gespeichert)

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for fertig in pool.map(bauen, ['en', 'ru', 'ja', 'es', 'pl']): print('Fertig:', fertig, flush=True)
