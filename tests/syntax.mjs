// node --check über alle eigenen Skripte. Die Liste wird GEFUNDEN, nicht gepflegt.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const dateien = ['sw.js']
  .concat(fs.readdirSync('assets').filter(f => f.endsWith('.js')).map(f => 'assets/' + f))
  .concat(fs.readdirSync('tests').filter(f => f.endsWith('.mjs')).map(f => 'tests/' + f))
  .concat(fs.readdirSync('tools').filter(f => f.endsWith('.mjs')).map(f => 'tools/' + f));
let rot = 0;
for (const d of dateien) { try { execFileSync(process.execPath, ['--check', d]); console.log('  ✓ Syntax ' + d); } catch (e) { rot++; console.log('  ✗ ROT: ' + d + '\n' + e.stderr); } }
if (!dateien.includes('assets/app.js') || dateien.length < 8) { rot++; console.log('  ✗ ROT: die Suche nach Skripten fand zu wenig (' + dateien.length + ')'); }
console.log(`\n${dateien.length - rot} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
