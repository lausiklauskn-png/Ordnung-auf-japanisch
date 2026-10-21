// Sechs Offline-Sprachen: echte Sprachwahl, Inhalt, Hervorhebungen, Vorlesen und bestehende Daten.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright-core';
const WURZEL = path.resolve(import.meta.dirname, '..');
let gruen = 0, rot = 0;
const ok = (n, b, info) => { if (b) { gruen++; console.log('  ✓ ' + n); } else { rot++; console.log('  ✗ ROT: ' + n + ' → ' + JSON.stringify(info)); } };
const ctxDaten = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(WURZEL, 'assets/inhalt.js'), 'utf8'), ctxDaten);
vm.runInNewContext(fs.readFileSync(path.join(WURZEL, 'assets/sprachen.js'), 'utf8'), ctxDaten);
const quelle = ctxDaten.window.OJ_INHALT, sprachen = ctxDaten.window.OJ_SPRACHEN;
const LANG = ['de', 'en', 'ru', 'ja', 'es', 'pl'];
for (const code of LANG.slice(1)) {
  const d = Object.fromEntries(sprachen.quellen.map((q, i) => [q, sprachen.sprachen[code]?.[i]]));
  const uebertragung = Object.entries(d).filter(([q, v]) => /\n|[\[【]\s*[A-ZА-Я]{1,3}\s*\d{3,4}[\]】]|98765\d{4}/iu.test(v));
  ok('Sprachdatei ' + code + ': keine vermischten Zeilen oder Paketmarken', !uebertragung.length, uebertragung.slice(0, 2));
  const kleiderbuegel = { en: /hanger/i, ru: /плечик/i, ja: /ハンガー/u, es: /percha/i, pl: /wieszaki/i };
  ok('Sprachdatei ' + code + ': Bügel im Kleidungskontext übersetzt', kleiderbuegel[code].test(d['Gleiche Bügel']));
  const fehlt = [], zahlenfehler = [];
  function besuch(v, key = '') {
    if (['id', 'nr', 'kanji', 'lesung', 'bilder'].includes(key) || (key === 'takt' && typeof v === 'string')) return;
    if (typeof v === 'string' && v.trim()) {
      const t = d[v.replace(/\s+/gu, ' ').trim()];
      if (!t) fehlt.push(v);
      const zahlen = s => [...s.replace(/,/g, '.').matchAll(/\d+(?:\.\d+)?/g)].map(m => m[0]);
      const z = zahlen(t || '');
      for (const n of zahlen(v)) { const i = z.indexOf(n); if (i < 0) zahlenfehler.push({ quelle: v, ziel: t, n }); else z.splice(i, 1); }
    } else if (Array.isArray(v)) v.forEach(x => besuch(x));
    else if (v) Object.entries(v).forEach(([k, x]) => besuch(x, k));
  }
  besuch(quelle);
  ok('Sprachdatei ' + code + ': alle Katalogtexte vollständig', !fehlt.length, fehlt.slice(0, 4));
  ok('Sprachdatei ' + code + ': Mengen, Temperaturen und Zeiten erhalten', !zahlenfehler.length, zahlenfehler.slice(0, 5));
}
if (process.env.OJ_NUR_SPRACHDATEN) { console.log(`${gruen} grün · ${rot} ROT`); process.exit(rot ? 1 : 0); }
const server = http.createServer((q, r) => {
  let name = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (name.endsWith('/')) name += 'index.html';
  const f = path.resolve(WURZEL, '.' + name);
  if (!f.startsWith(WURZEL + path.sep) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
  r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const basis = `http://127.0.0.1:${server.address().port}/`;
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(fs.existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 380, height: 800 } });
await ctx.addInitScript(() => {
  window.__ansagen = [];
  class U { constructor(text) { this.text = text; } }
  window.SpeechSynthesisUtterance = U;
  Object.defineProperty(window, 'speechSynthesis', { value: {
    getVoices: () => ['de-DE', 'en-GB', 'ru-RU', 'ja-JP', 'es-ES', 'pl-PL'].map(lang => ({ name: 'Natural ' + lang, lang })),
    speak(u) { window.__ansagen.push({ text: u.text, lang: u.lang, voice: u.voice?.lang }); setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); }, cancel() {},
  } });
});
const page = await ctx.newPage(), fehler = [], extern = [];
page.on('pageerror', e => fehler.push(String(e)));
page.on('request', r => { if (/^https?:/.test(r.url()) && new URL(r.url()).hostname !== '127.0.0.1') extern.push(r.url()); });
const bereit = code => page.waitForFunction(c => window.OJ_BEREIT === true && (!c || document.documentElement.lang === c), code);
const geh = async hash => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForFunction(h => location.hash === h, hash); await page.waitForTimeout(60); };
try {
  await page.goto(basis); await bereit('de');
  ok('Sprachwahl: sechs native Sprachnamen', await page.locator('[data-sprache]').count() === 6);
  await page.focus('#btnSprache'); await page.keyboard.press('Enter'); await page.waitForSelector('#spracheAuswahl:not([hidden])'); await page.keyboard.press('Escape');
  ok('Sprachwahl: Tastatur, Escape und Fokus', await page.evaluate(() => document.getElementById('spracheAuswahl').hidden && document.activeElement.id === 'btnSprache'));
  await page.evaluate(async () => {
    await window.OJ.DB.einst('profil', { raeume: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1 }, wahl: [2], takt: { arbeit: 10, pause: 5 } });
    await window.OJ.DB.eintragen('schritt', 's2.1');
    localStorage.setItem('oj_thema', 'sand');
    localStorage.setItem('oj_takt', JSON.stringify({ phase: 'arbeit', ende: Date.now() + 600000, dauer: 600000 }));
    await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready;
  });
  await page.reload(); await bereit('de');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  ok('Offline-Vorrat: Sprachdaten und Sprachwahl liegen im Cache', await page.evaluate(async () => {
    const urls = (await (await caches.open('ordnung-jp-v18')).keys()).map(r => r.url);
    return urls.some(u => u.endsWith('assets/sprachen.js?v=1')) && urls.some(u => u.endsWith('assets/sprache.js?v=1'));
  }));
  await ctx.setOffline(true);
  for (const code of LANG) {
    if (code !== 'de') {
      await page.click('#btnSprache'); await page.click(`[data-sprache="${code}"]`); await bereit(code);
    }
    ok('Sprache ' + code + ': offline gewählt und nach Neuladen erhalten', await page.evaluate(c => document.documentElement.lang === c && document.querySelector(`[data-sprache="${c}"]`).getAttribute('aria-pressed') === 'true', code));
    ok('Sprache ' + code + ': Fortschritt, Räume, Thema und Arbeitsuhr erhalten', await page.evaluate(async () => (await window.OJ.DB.alle()).some(e => e.ref === 's2.1') && (await window.OJ.DB.einst('profil')).wahl[0] === 2 && localStorage.getItem('oj_thema') === 'sand' && JSON.parse(localStorage.getItem('oj_takt')).phase === 'arbeit' && document.querySelector('#uhren [data-rest]')));
    await geh('#/station/2');
    const stoffe = await page.evaluate(() => [...document.querySelectorAll('[data-warnkarte] li')].slice(0, 6).map(li => li.querySelectorAll('strong').length));
    ok('Sprache ' + code + ': Mischbestandteile weiter fett hervorgehoben', stoffe.length === 6 && stoffe.every(n => n >= 2), stoffe);
    await page.evaluate(() => { window.__ansagen = []; });
    await page.click('[data-aktion="vorlesen"][data-ref="s2.1"]');
    const ansage = await page.evaluate(() => window.__ansagen);
    ok('Sprache ' + code + ': Anleitung mit passender Stimme vorgelesen', ansage.length > 0 && ansage.every(a => a.lang.startsWith(code) && a.voice?.startsWith(code)), ansage);
    if (code !== 'de') ok('Sprache ' + code + ': Anleitung tatsächlich übersetzt', await page.evaluate(() => window.OJ_INHALT.stationen[2].schritte[0].text !== window.OJ.Sprache.original.stationen[2].schritte[0].text));
    const raum = await page.evaluate(() => window.OJ_INHALT.stationen[2].titel);
    ok('Sprache ' + code + ': Raumsuche in der gewählten Sprache', await page.evaluate(r => window.OJ.Absicht.verstehen(r, window.OJ_INHALT).stationen.includes(2), raum));
    const routen = ['#/', '#/einrichten/1', '#/einrichten/2', '#/einrichten/3', '#/gewohnheiten', '#/kalender', '#/flecken', '#/regeln', '#/verlauf', '#/info', '#/installieren', '#/mittel', '#/woerter', ...Array.from({ length: 10 }, (_, i) => '#/station/' + i)];
    const reste = [];
    for (const route of routen) {
      await geh(route);
      if (code !== 'de') {
        const r = await page.evaluate(() => {
          const w = document.createTreeWalker(document.getElementById('ansicht'), NodeFilter.SHOW_TEXT), fehlt = [];
          while (w.nextNode()) {
            const n = w.currentNode;
            if (n.parentElement?.getAttribute('lang')?.startsWith('ja')) continue;
            if (/\b(?:Einrichten|erledigt|Gewohnheit(?:en)?|Reinigungsmittel|Schritte?|Zurück|Vorlesen|Warum|Deine|deine|heute|Gerät|Wohnung|Fenster|Abhaken|Minuten|Willkommen|Pausenzeit)\b/u.test(n.data)) fehlt.push(n.data.trim());
          }
          return fehlt;
        });
        reste.push(...r.map(text => ({ route, text })));
      }
    }
    ok('Sprache ' + code + ': zentrale Ansichten ohne deutsche Resttexte', reste.length === 0, reste.slice(0, 15));
    for (const breite of [320, 380]) {
      await page.setViewportSize({ width: breite, height: 800 }); await geh('#/');
      ok('Sprache ' + code + ': Kopf und Navigation passen bei ' + breite + ' px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('.kopf').scrollWidth <= document.querySelector('.kopf').clientWidth));
    }
  }
  await page.evaluate(() => localStorage.setItem('oj_sprache', 'ungueltig')); await page.reload(); await bereit('de');
  ok('Ungültige Sprachwahl fällt sicher auf Deutsch zurück', await page.evaluate(() => window.OJ.Sprache.code === 'de'));
  ok('Kein externer Übersetzungsdienst angefragt', extern.length === 0, extern);
  ok('Keine JavaScript-Fehler', fehler.length === 0, fehler);
} catch (e) { rot++; console.log('  ✗ ROT: Sprachprobe abgebrochen → ' + e.message.split('\n')[0]); }
finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`\n${gruen} grün · ${rot} ROT`); process.exitCode = rot ? 1 : 0;
