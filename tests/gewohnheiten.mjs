// Gute Gewohnheiten im echten Browser: Vorschlag mit drei, Abhaken und Zurücknehmen, „jedes Mal“-Zähler,
// Serie über vorgespulte Tage (Lücke bricht sie), Woche, 習 ab 21, eigene Liste ändern, Startkarte, Verlauf, 320 px.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let gruen = 0, rot = 0;
const ok = (n, b, mehr) => { if (b) { gruen++; console.log('  ✓ ' + n); } else { rot++; console.log('  ✗ ROT: ' + n + (mehr !== undefined ? '  → ' + JSON.stringify(mehr) : '')); } };

function server() {
  const typ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  const s = http.createServer((q, r) => {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(WURZEL, p); if (!f.startsWith(WURZEL) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': typ[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  });
  return new Promise(res => s.listen(0, '127.0.0.1', () => res(s)));
}
const STIMME = () => {
  window.__gesagt = [];
  class U { constructor(t) { this.text = t; this.lang = ''; } }
  window.SpeechSynthesisUtterance = U;
  const synth = {
    getVoices: () => [{ name: 'Google Deutsch', lang: 'de-DE' }, { name: 'Google 日本語', lang: 'ja-JP' }],
    speak(u) { window.__gesagt.push({ text: u.text, lang: u.lang }); setTimeout(() => { u.onstart && u.onstart(); u.onend && u.onend(); }, 5); },
    cancel() { window.__gestoppt = (window.__gestoppt || 0) + 1; }, onvoiceschanged: null,
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
};

const srv = await server();
const URL0 = `http://127.0.0.1:${srv.address().port}/`;
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(fs.existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 380, height: 800 } });
await ctx.addInitScript(STIMME);
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
await page.clock.install({ time: new Date('2026-10-21T09:00:00') });
const tag = async n => { await page.clock.fastForward(n * 864e5); await page.reload(); await bereit(); await page.evaluate(() => { location.hash = '#/x'; location.hash = '#/gewohnheiten'; }); await page.waitForSelector('[data-gewohnheit]'); };
const text = sel => page.textContent(sel);
const bereit = () => page.waitForFunction(() => window.OJ_BEREIT === true);
const gesagt = () => page.evaluate(() => window.__gesagt.map(g => g.text).join(' | '));
const klang = () => page.evaluate(() => (window.__klang || []).join(','));
const lauf = async ms => { await page.clock.runFor(ms); };

try {
  await page.goto(URL0); await bereit();
  await page.evaluate(() => window.OJ.DB.einst('profil', { raeume: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 0, 9: 0 }, wahl: [], takt: { arbeit: 20, pause: 10 } }));
  await page.reload(); await bereit();
  ok('Start: Karte „Gute Gewohnheiten · heute 0 von 3“', (await text('[data-g-start]')).includes('heute 0 von 3'), await text('[data-g-start]'));
  ok('Leiste hat „Gewohnheit“', await page.isVisible('[data-nav="gewohnheiten"]'));
  await page.click('[data-nav="gewohnheiten"]'); await page.waitForSelector('[data-gewohnheit]');
  ok('Kopf: 習慣 mit Aussprache schuu-kan', (await text('#ansicht')).includes('schuu-kan'));
  const meine = await page.$$eval('[data-aktion="g-weg"]', l => l.map(b => b.dataset.ref));
  ok('Vorschlag: drei Gewohnheiten, nach Tageszeit geordnet (Bett lüften, Dusche abziehen, Spüle am Abend)', meine.join() === 'g1,g4,g7', meine);
  ok('Weitere: 21 Gewohnheiten aus allen Räumen', (await page.locator('[data-aktion="g-dazu"]').count()) === 21);
  ok('Heute-Ring 0/3', (await text('[data-g-heute] .g-ring')).includes('0/3'));

  await page.click('[data-gewohnheit="g7"] [data-aktion="g-haken"]');
  await page.waitForSelector('[data-gewohnheit="g7"].fertig');
  ok('Spüle am Abend abgehakt: 済 und „1 Tag in Folge“', (await text('[data-gewohnheit="g7"] .g-haken')) === '済' && (await text('[data-gewohnheit="g7"] [data-serie]')) === '1 Tag in Folge');
  ok('Heute-Ring 1/3', (await text('[data-g-heute] .g-ring')).includes('1/3'));
  ok('Kette: letzter Punkt rot', (await page.locator('[data-gewohnheit="g7"] .kette i').last().getAttribute('class')) === 'an');
  await page.click('[data-gewohnheit="g7"] [data-aktion="g-haken"]');
  await page.waitForSelector('[data-gewohnheit="g7"]:not(.fertig)');
  ok('zweiter Tipp nimmt den Haken für heute zurück', (await text('[data-gewohnheit="g7"] [data-serie]')) === 'noch nie');
  await page.click('[data-gewohnheit="g7"] [data-aktion="g-haken"]');
  await page.waitForSelector('[data-gewohnheit="g7"].fertig');

  await page.click('[data-gewohnheit="g11"] [data-aktion="g-dazu"]');
  await page.waitForSelector('[data-gewohnheit="g11"] [data-aktion="g-weg"]');
  ok('„＋ In meine Liste“: Schuhe an der Tür ist jetzt meine', (await page.$$eval('[data-aktion="g-weg"]', l => l.length)) === 4);
  await page.click('[data-gewohnheit="g11"] [data-aktion="g-mal"]');
  await page.click('[data-gewohnheit="g11"] [data-aktion="g-mal"]');
  await page.waitForFunction(() => document.querySelector('[data-gewohnheit="g11"] .g-haken').textContent.trim() === '2×');
  ok('„jedes Mal“: zweimal getippt → 2×', true);
  ok('„jedes Mal“ zählt nicht im Heute-Ring (bleibt 1/3)', (await text('[data-g-heute] .g-ring')).includes('1/3'));
  await page.click('[data-gewohnheit="g7"] [data-aktion="g-vorlesen"]');
  ok('Vorlesen: Handgriff und „Warum:“', /Spüle am Abend\..*2 Minuten.*Warum: Was abends nass/.test(await page.evaluate(() => window.__gesagt.at(-1).text)), await page.evaluate(() => window.__gesagt.at(-1).text));

  // Serie über Tage
  await tag(1);
  ok('nächster Tag, noch nicht abgehakt: Serie zählt gestern weiter (1 Tag)', (await text('[data-gewohnheit="g7"] [data-serie]')) === '1 Tag in Folge');
  await page.click('[data-gewohnheit="g7"] [data-aktion="g-haken"]'); await page.waitForSelector('[data-gewohnheit="g7"].fertig');
  ok('zweiter Tag abgehakt: 2 Tage in Folge', (await text('[data-gewohnheit="g7"] [data-serie]')) === '2 Tage in Folge');
  await tag(2);
  ok('ein Tag ausgelassen: Serie ist weg, „2× bisher“', (await text('[data-gewohnheit="g7"] [data-serie]')) === '2× bisher');
  await page.click('[data-gewohnheit="g7"] [data-aktion="g-haken"]'); await page.waitForSelector('[data-gewohnheit="g7"].fertig');
  ok('neu angefangen: 1 Tag in Folge', (await text('[data-gewohnheit="g7"] [data-serie]')) === '1 Tag in Folge');
  ok('Kette zeigt drei rote Punkte mit Lücke', (await page.$$eval('[data-gewohnheit="g7"] .kette i', l => l.slice(-4).map(i => i.className === 'an' ? 1 : 0).join(''))) === '1101');

  // Woche
  await page.click('[data-gewohnheit="g21"] [data-aktion="g-dazu"]');
  await page.waitForSelector('[data-gewohnheit="g21"] [data-aktion="g-haken"]');
  await page.click('[data-gewohnheit="g21"] [data-aktion="g-haken"]'); await page.waitForSelector('[data-gewohnheit="g21"].fertig');
  ok('Woche: Kühlschrank-Reste „1 Woche in Folge“', (await text('[data-gewohnheit="g21"] [data-serie]')) === '1 Woche in Folge');
  await tag(1);
  ok('Woche: am nächsten Tag noch erledigt (gleiche Woche)', await page.locator('[data-gewohnheit="g21"].fertig').count() === 1);

  // 習 ab 21: zwanzig frühere Tage direkt in den Speicher
  await page.evaluate(async () => {
    const db = await new Promise(r => { const q = indexedDB.open('OrdnungJP1'); q.onsuccess = () => r(q.result); });
    await new Promise(r => { const t = db.transaction('log', 'readwrite'); for (let i = 5; i < 25; i++) t.objectStore('log').add({ art: 'gewohnheit', ref: 'g4', zeit: Date.now() - i * 864e5 }); t.oncomplete = r; });
  });
  await page.reload(); await bereit(); await page.evaluate(() => { location.hash = '#/x'; location.hash = '#/gewohnheiten'; }); await page.waitForSelector('[data-gewohnheit]');
  await page.evaluate(() => { window.__gesagt = []; });
  await page.click('[data-gewohnheit="g4"] [data-aktion="g-haken"]'); await page.waitForSelector('[data-gewohnheit="g4"].fertig');
  ok('21. Mal: 習 erscheint an „Dusche abziehen“', (await text('[data-gewohnheit="g4"] h3')).includes('習'));
  ok('21. Mal: „Gewohnheit sitzt“ wird gesagt, mit しゅうかん', (await page.evaluate(() => window.__gesagt.map(g => g.text).join('|'))).includes('しゅうかん|Dusche abziehen: Gewohnheit sitzt.'));
  ok('Meldung „習 Gewohnheit sitzt — 21×“', (await text('#meldung')).includes('Gewohnheit sitzt'));

  // Liste ändern bleibt
  await page.click('[data-gewohnheit="g1"] [data-aktion="g-weg"]');
  await page.waitForSelector('[data-gewohnheit="g1"] [data-aktion="g-dazu"]');
  await page.reload(); await bereit(); await page.evaluate(() => { location.hash = '#/x'; location.hash = '#/gewohnheiten'; }); await page.waitForSelector('[data-gewohnheit]');
  ok('„Aus meiner Liste“ bleibt nach dem Neuladen', (await page.locator('[data-gewohnheit="g1"] [data-aktion="g-dazu"]').count()) === 1);

  // Verlauf, Start, Breite
  await page.evaluate(() => { location.hash = '#/verlauf'; }); await page.waitForSelector('[data-eintrag]');
  ok('Verlauf nennt „習慣 Spüle am Abend“', (await text('#ansicht')).includes('習慣 Spüle am Abend'));
  await page.evaluate(() => { location.hash = '#/'; }); await page.waitForSelector('[data-g-start]');
  ok('Startkarte zählt mit', /heute \d von 3/.test(await text('[data-g-start]')), await text('[data-g-start]'));
  await page.setViewportSize({ width: 320, height: 640 });
  for (const h of ['#/gewohnheiten', '#/']) {
    await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(300);
    const b = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: innerWidth, nav: [...document.querySelectorAll('.leiste a')].every(a => a.scrollWidth <= a.clientWidth + 1) }));
    ok(`320 px ${h}: kein Querlaufen, Leiste mit 6 Einträgen passt`, b.s <= b.w && b.nav, b);
  }
  ok('keine Fehler in der Konsole', fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log('  ✗ ROT: Probe abgebrochen → ' + e.message.split('\n')[0]);
  if (fehler.length) console.log('    Konsole: ' + fehler.join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
