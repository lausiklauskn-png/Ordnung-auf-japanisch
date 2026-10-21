// Bilder: jede Datei in bilder/ hat eine bekannte Kennung, steht in assets/inhalt.js, und docs/BILDER-STAND.md
// stimmt mit dem Ordner überein. Dazu das Einsortier-Werkzeug an Probedateien (Wegwerf-Kopie).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
let gruen = 0, rot = 0;
const ok = (n, b, mehr) => { if (b) { gruen++; console.log('  ✓ ' + n); } else { rot++; console.log('  ✗ ROT: ' + n + (mehr !== undefined ? '  → ' + JSON.stringify(mehr) : '')); } };
const motive = [...fs.readFileSync('docs/BILD-MOTIVE.md', 'utf8').matchAll(/^- \*\*Bild (\S+) – /gm)].map(m => m[1]);
const da = fs.readdirSync('bilder').filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5));
globalThis.window = {}; await import('../assets/inhalt.js'); const I = globalThis.window.OJ_INHALT;
ok('148 Kennungen, eindeutig', motive.length === 148 && new Set(motive).size === 148, motive.length);
ok('jedes Bild in bilder/ hat eine bekannte Kennung', da.every(k => motive.includes(k)), da.filter(k => !motive.includes(k)));
ok('assets/inhalt.js kennt genau die Bilder im Ordner', JSON.stringify([...I.bilder].sort()) === JSON.stringify([...da].sort()), { inhalt: I.bilder, ordner: da });
const stand = fs.readFileSync('docs/BILDER-STAND.md', 'utf8');
ok('docs/BILDER-STAND.md: Zahl stimmt', stand.includes(`**${da.length} von ${motive.length}**`));
ok('docs/BILDER-STAND.md: jede Kennung steht drin', motive.every(k => stand.includes('`' + k + '`')));

// Werkzeug in einer Wegwerf-Kopie
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oj-bilder-'));
for (const d of ['tools', 'docs', 'assets', 'bilder']) fs.cpSync(d, path.join(tmp, d), { recursive: true });
fs.mkdirSync(path.join(tmp, 'neu'));
execFileSync('python3', ['-c', `from PIL import Image
Image.new('RGB',(1536,1024),(200,180,150)).save('${tmp}/neu/s2.1 Spüle am Abend.png')
Image.new('RGB',(1024,1024),(100,120,90)).save('${tmp}/neu/s2.10.png')
Image.new('RGB',(800,600),(1,2,3)).save('${tmp}/neu/quatsch.png')`]);
let aus = '', rc = 0;
try { aus = execFileSync('python3', [path.join(tmp, 'tools/bilder-einfuegen.py'), path.join(tmp, 'neu')], { cwd: tmp }).toString(); } catch (e) { aus = e.stdout.toString(); rc = e.status; }
const neu = fs.readdirSync(path.join(tmp, 'bilder')).filter(f => f.endsWith('.webp')).sort();
ok('Werkzeug: s2.1 und s2.10 auseinandergehalten', neu.includes('s2.1.webp') && neu.includes('s2.10.webp'), neu);
ok('Werkzeug: unbekannter Name abgewiesen und genannt, Rückgabe 1', aus.includes('ABGEWIESEN') && aus.includes('quatsch.png') && rc === 1, aus);
const groesse = execFileSync('python3', ['-c', `from PIL import Image; print(Image.open('${tmp}/bilder/s2.10.webp').size)`]).toString().trim();
ok('Werkzeug: quadratisches Bild auf 1200 × 800 zugeschnitten', groesse === '(1200, 800)', groesse);
ok('Werkzeug: inhalt.js und BILDER-STAND nachgezogen', fs.readFileSync(path.join(tmp, 'assets/inhalt.js'), 'utf8').includes('"s2.10"') && fs.readFileSync(path.join(tmp, 'docs/BILDER-STAND.md'), 'utf8').includes('| `s2.10` | ✅ |'));
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
