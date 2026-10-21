// Gewinnt übersetzbare Texte aus dem Katalog und der Oberfläche. Keine zweite Quelle für Tipps.
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let parse;
try { ({ parse } = require('acorn')); }
catch { ({ parse } = require('internal/deps/acorn/acorn/dist/acorn')); }
export const norm = s => String(s).replace(/\s+/gu, ' ').trim();
export function katalog() {
  const texte = new Set();
  function aufnehmen(s) {
    s = norm(s);
    if (!s || !/[\p{L}]/u.test(s) || /^__OJ_\d+__$/.test(s)) return;
    if (/^(?:[.#/]|data-|aria-|https?:|assets\/|bilder\/|oj_|--)/.test(s) || /[{}]/.test(s)) return;
    texte.add(s);
  }
  function html(s) {
    s = s.replace(/<!--[^]*?-->/g, '').replace(/<(script|style)\b[^]*?<\/\1>/gi, '');
    for (const m of s.matchAll(/(?:^|>)([^<>]+)(?=<|$)/g)) aufnehmen(m[1]);
    for (const m of s.matchAll(/(?:title|aria-label|placeholder|alt)="([^"]*)"/g)) aufnehmen(m[1]);
  }
  function text(s) { if (s.includes('<') && s.includes('>')) html(s); else aufnehmen(s); }
  function js(name) {
    if (!fs.existsSync(name)) return;
    const ast = parse(fs.readFileSync(name, 'utf8'), { ecmaVersion: 'latest', sourceType: 'script' });
    function besuch(n) {
      if (!n || typeof n !== 'object') return;
      if (n.type === 'Literal' && typeof n.value === 'string') text(n.value);
      if (n.type === 'TemplateLiteral') text(n.quasis.map((q, i) => (q.value.cooked || q.value.raw) + (i < n.expressions.length ? `__OJ_${i}__` : '')).join(''));
      for (const [k, v] of Object.entries(n)) if (k !== 'parent') { if (Array.isArray(v)) v.forEach(besuch); else if (v && typeof v === 'object') besuch(v); }
    }
    besuch(ast);
  }
  const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync('assets/inhalt.js', 'utf8'), ctx);
  function inhalt(v, key = '') {
    if (['id', 'nr', 'kanji', 'lesung', 'bilder'].includes(key)) return;
    if (typeof v === 'string') {
      aufnehmen(v);
      // fmt() zieht Zeitangaben und Warnungen in eigene Spans; deren Text bleibt übersetzbar.
      const markiert = v.replace(/([⌛⏱])\s*((?:ca\.\s*)?[\d,–\-]+\s*(?:Min\.?|Std\.?|Sek\.?)|eine Nacht|über Nacht)/g, '<span>$1 $2</span>').replace(/⚠\s*(.*)$/s, '<span>⚠ $1</span>');
      if (markiert !== v) html(markiert);
    } else if (Array.isArray(v)) v.forEach(x => inhalt(x));
    else if (v) Object.entries(v).forEach(([k, x]) => inhalt(x, k));
  }
  inhalt(ctx.window.OJ_INHALT);
  const jap = { window: {} }; vm.runInNewContext(fs.readFileSync('assets/japanisch.js', 'utf8'), jap);
  jap.window.OJ.Japanisch.WOERTER.forEach(w => aufnehmen(w.de));
  js('assets/app.js'); js('assets/thema.js');
  html(fs.readFileSync('index.html', 'utf8'));
  // Stoffnamen werden nach Übersetzung als ganze Begriffe hervorgehoben.
  ['angesetzte Sauerstoffbleiche','saurer WC-Reiniger','Wasserstoffperoxid','Zitronensäure','Zwei Reinigungsmittel','Chlorreiniger','Schmierseife','Rohrreiniger','Glasreiniger','Ammoniak','Salmiak','alter Urin','Spiritus','Sauerstoffbleiche','Natron','Essig','Seife','Säure','Chlor','irgendetwas'].forEach(aufnehmen);
  return [...texte].sort();
}
if (process.argv[1]?.endsWith('sprachkatalog.mjs')) {
  const liste = katalog();
  fs.writeFileSync('docs/uebersetzungen/quellen.json', JSON.stringify(liste, null, 2) + '\n');
  console.log(`${liste.length} übersetzbare Texte, ${liste.join('').length} Zeichen`);
}
