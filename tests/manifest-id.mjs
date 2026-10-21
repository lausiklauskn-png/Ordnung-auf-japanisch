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
// Service-Worker: jede Datei der Schale gibt es, und die ?v= passen zu index.html
const sw = fs.readFileSync('sw.js', 'utf8'), html = fs.readFileSync('index.html', 'utf8');
const schale = [...sw.matchAll(/'\.\/([^']+)'/g)].map(x => x[1]).filter(Boolean);
for (const d of schale) ok('Schale: ' + d + ' gibt es', fs.existsSync(d.split('?')[0] || 'index.html'));
for (const [, src] of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) ok('index.html ' + src + ' steht so in der Schale', schale.includes(src), 'Cache-Bump vergessen?');
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
