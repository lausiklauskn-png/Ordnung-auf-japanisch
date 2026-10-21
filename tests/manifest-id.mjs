// Die Kennung (`id`) der App, gerechnet wie Chrome: `id` wird gegen den URSPRUNG aufgelöst.
// "./" wäre für jede App auf lausiklauskn-png.github.io dieselbe Kennung (Befund Workflow PDF, 2026-10-18).
import fs from 'node:fs';
const BASIS = 'https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/';
let gruen = 0, rot = 0;
const ok = (n, b, mehr) => { if (b) { gruen++; console.log('  ✓ ' + n); } else { rot++; console.log('  ✗ ROT: ' + n + (mehr !== undefined ? '  → ' + mehr : '')); } };
const kennung = (m, u) => { const s = new URL(m.start_url || '.', u); return new URL(m.id !== undefined ? m.id : s.href, s.origin).href; };
const bereich = (m, u) => new URL(m.scope || '.', new URL(m.start_url || '.', u)).href;
const m = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
const u = BASIS + 'manifest.webmanifest';
ok('Rechnung: "./" wird zur Wurzel des Ursprungs', kennung({ id: './' }, u) === 'https://lausiklauskn-png.github.io/');
ok('manifest: eigene id im Bereich der App', kennung(m, u).startsWith(bereich(m, u)) && kennung(m, u) !== 'https://lausiklauskn-png.github.io/', kennung(m, u));
ok('manifest: id ist genau der App-Ordner', kennung(m, u) === BASIS, kennung(m, u));
for (const i of m.icons) ok('Icon vorhanden: ' + i.src, fs.existsSync(i.src.split('?')[0]));
ok('Icons 192 und 512 und maskable', ['192x192', '512x512'].every(g => m.icons.some(i => i.sizes === g)) && m.icons.some(i => i.purpose === 'maskable'));
// Icons: rund und durchsichtig („any“), Android-maskable deckend, iOS deckend auf Weiß (Klaus 2026-10-21)
import { execFileSync } from 'node:child_process';
const pruef = execFileSync('python3', ['-c', `
from PIL import Image
def info(n):
    im = Image.open('icons/' + n).convert('RGBA'); w, h = im.size; px = im.load()
    return [w, h, px[0, 0][3], px[w // 2, h // 2][3], px[0, 0][:3]]
import json
print(json.dumps({n: info(n) for n in ['icon-512.png', 'icon-192.png', 'favicon-64.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'ios/AppIcon-1024.png', 'android/play-store-512.png', 'android/adaptive-foreground-432.png', 'seiri-480.webp']}))
`]).toString();
const ic = JSON.parse(pruef);
for (const n of ['icon-512.png', 'icon-192.png', 'favicon-64.png', 'android/play-store-512.png', 'seiri-480.webp']) ok(`${n}: rund — Ecke durchsichtig, Mitte deckend`, ic[n][2] === 0 && ic[n][3] === 255, ic[n]);
ok('icon-512-maskable.png: deckend (Android schneidet selbst zu)', ic['icon-512-maskable.png'][2] === 255);
ok('apple-touch-icon.png: 180 px, deckend auf Weiß (iOS)', ic['apple-touch-icon.png'][0] === 180 && ic['apple-touch-icon.png'][2] === 255 && ic['apple-touch-icon.png'][4].every(c => c === 255), ic['apple-touch-icon.png']);
ok('ios/AppIcon-1024.png: 1024, deckend auf Weiß', ic['ios/AppIcon-1024.png'][0] === 1024 && ic['ios/AppIcon-1024.png'][2] === 255 && ic['ios/AppIcon-1024.png'][4].every(c => c === 255));
ok('android/adaptive-foreground-432.png: durchsichtig um den Teller', ic['android/adaptive-foreground-432.png'][2] === 0 && ic['android/adaptive-foreground-432.png'][3] === 255);
// Service-Worker: jede Datei der Schale gibt es, und die ?v= passen zu index.html
const sw = fs.readFileSync('sw.js', 'utf8'), html = fs.readFileSync('index.html', 'utf8');
const schale = [...sw.matchAll(/'\.\/([^']+)'/g)].map(x => x[1]).filter(Boolean);
for (const d of schale) ok('Schale: ' + d + ' gibt es', fs.existsSync(d.split('?')[0] || 'index.html'));
for (const [, src] of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) ok('index.html ' + src + ' steht so in der Schale', schale.includes(src), 'Cache-Bump vergessen?');
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
