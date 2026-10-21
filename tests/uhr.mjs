// Takt-Uhr und Einwirk-Uhren im echten Browser, mit vorgespulter Zeit (Playwright clock):
// Arbeit läuft ab → Gong, Pause mit Klang und Ansage → Pause läuft ab → Arbeit geht weiter; Einwirk-Uhr meldet sich;
// Uhren überstehen das Neuladen. Die Sprachausgabe ist gestellt (window.__gesagt), der Klang zählt in window.__klang.
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
const bereit = () => page.waitForFunction(() => window.OJ_BEREIT === true);
const gesagt = () => page.evaluate(() => window.__gesagt.map(g => g.text).join(' | '));
const klang = () => page.evaluate(() => (window.__klang || []).join(','));
const lauf = async ms => { await page.clock.runFor(ms); };

try {
  await page.goto(URL0); await bereit();
  await page.evaluate(() => window.OJ.DB.einst('profil', { raeume: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 0, 9: 0 }, wahl: [2], takt: { arbeit: 10, pause: 5 } }));
  await page.evaluate(() => { sessionStorage.setItem('oj_warn_' + new Date().toDateString(), '[2]'); });
  await page.reload(); await bereit();
  ok('ohne Sitzung läuft keine Uhr', await page.isHidden('#uhren'));

  await page.evaluate(() => { location.hash = '#/sitzung/2'; });
  await page.waitForSelector('[data-sitzung][data-ref="s2.1"]');
  ok('Sitzung startet die Arbeitsuhr: 10:00', (await page.textContent('[data-taktleiste] [data-rest]')).trim() === '10:00', await page.textContent('[data-taktleiste]'));
  ok('Kopf zeigt „⏱ Arbeit“', (await page.textContent('#uhren')).includes('⏱ Arbeit'));
  await page.evaluate(() => scrollTo(0, 450));
  ok('Uhr beim Scrollen: nur deckender Chip, keine breite transparente Fläche', await page.evaluate(() => {
    const box = document.querySelector('#uhren'), chip = box.querySelector('[data-chip="takt"]');
    const s = getComputedStyle(box), c = getComputedStyle(chip), r = chip.getBoundingClientRect(), kopf = document.querySelector('.kopf').getBoundingClientRect();
    return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.backgroundImage === 'none' && s.borderBottomWidth === '0px'
      && s.pointerEvents === 'none' && c.pointerEvents === 'auto' && c.backgroundColor !== 'rgba(0, 0, 0, 0)'
      && r.top >= kopf.bottom - 1 && r.bottom < innerHeight && box.getBoundingClientRect().width < innerWidth;
  }));

  await lauf(61_000);
  ok('nach einer Minute: 9:00 (±1 s, die Anzeige läuft im Sekundentakt)', /^(9:00|8:59)$/.test((await page.textContent('[data-taktleiste] [data-rest]')).trim()), await page.textContent('[data-taktleiste] [data-rest]'));
  ok('Schwebender Arbeits-Chip zählt weiter', /^(9:00|8:59)$/.test((await page.textContent('#uhren [data-rest]')).trim()));
  ok('Balken wächst (> 10 %)', parseFloat((await page.getAttribute('.taktbalken i', 'style')).match(/[\d.]+/)[0]) > 10);

  // Einwirk-Uhr: Kochfeld 5 Min. — erst zum Schritt 2.6
  for (let i = 0; i < 5; i++) await page.click('[data-aktion="s-weiter"]');
  await page.waitForSelector('[data-sitzung][data-ref="s2.6"]');
  await page.click('[data-aktion="uhr"][data-ref="s2.6"]');
  ok('Einwirk-Uhr: Chip „⌛ Kochfeld 5:00“', /⌛ Kochfeld\s*5:00/.test(await page.textContent('#uhren')), await page.textContent('#uhren'));
  ok('Einwirk-Uhr wird angesagt', (await gesagt()).includes('Uhr läuft: 5 Minuten für Kochfeld'));
  await page.reload(); await bereit();
  ok('Uhren überstehen das Neuladen', (await page.textContent('#uhren')).includes('Kochfeld') && (await page.textContent('#uhren')).includes('⏱ Arbeit'));
  await page.evaluate(() => { location.hash = '#/sitzung/2/s2.6'; });
  await page.waitForSelector('[data-sitzung][data-ref="s2.6"]');
  await lauf(5 * 60_000);
  ok('nach 5 Min.: „Einwirkzeit vorbei: Kochfeld“ gesagt und Gong', (await gesagt()).includes('Einwirkzeit vorbei: Kochfeld') && (await klang()).includes('gong'));
  ok('Chip der Einwirk-Uhr ist weg', !(await page.textContent('#uhren')).includes('Kochfeld'));
  ok('Meldung zeigt es auch', (await page.textContent('#meldung')).includes('Einwirkzeit vorbei'));

  // Arbeit läuft ab → Pause
  await page.evaluate(() => { window.__gesagt = []; window.__klang = []; });
  await lauf(4 * 60_000 + 2000);
  ok('Arbeit vorbei: Pausenfenster 休憩 ist offen', await page.isVisible('[data-pausefenster]') && (await page.textContent('.pause-kanji')) === '休憩');
  ok('Pausen-Chip: passende Salbeifarbe, kein Bildschirmfenster', await page.evaluate(() => {
    const chip = document.querySelector('[data-chip="takt"]'), ring = document.querySelector('#pause .strich');
    return getComputedStyle(chip).position !== 'fixed' && getComputedStyle(chip).color === getComputedStyle(ring).stroke;
  }));
  ok('Pause: Gong und Klang an', /gong.*musik-an|musik-an.*gong/.test(await klang()), await klang());
  const p = await gesagt();
  ok('Pause: „Zeit für eine Pause. 5 Minuten“, 休憩 auf Japanisch, ein Grund für kurze Blöcke', p.includes('Zeit für eine Pause. 5 Minuten. Auf Japanisch:') && p.includes('きゅうけい'), p);
  const ring0 = +(await page.getAttribute('#pause .strich', 'stroke-dashoffset'));
  ok('Pausenring startet voll (Versatz unter 15 von 201)', ring0 < 15, ring0);
  ok('Pause zeigt Aussprache kjuu-kee', (await page.textContent('#pause')).includes('kjuu-kee'));
  await lauf(60_000);
  const rest = (await page.textContent('#pause [data-rest]')).trim();
  const sek = +rest.split(':')[0] * 60 + +rest.split(':')[1];
  ok('Pausenring läuft ab (Versatz wächst)', +(await page.getAttribute('#pause .strich', 'stroke-dashoffset')) > ring0 + 30);
  ok('Pause zählt herunter: nach gut einer Minute zwischen 3:20 und 4:00', sek >= 200 && sek <= 240, rest);
  await page.click('[data-aktion="musik"]');
  ok('Klang lässt sich ausschalten', (await klang()).includes('musik-aus') && (await page.textContent('[data-aktion="musik"]')).includes('Klang an'));
  await page.click('[data-aktion="musik"]');
  await page.evaluate(() => { window.__gesagt = []; window.__klang = []; });
  await lauf(4 * 60_000 + 2000);
  ok('Pause vorbei: Fenster zu, Klang aus, Gong', await page.isHidden('#pause') && (await klang()).includes('musik-aus') && (await klang()).includes('gong'), await klang());
  ok('Pause vorbei: „Weiter mit Kochfeld“', (await gesagt()).includes('Pause vorbei. | Weiter mit Kochfeld.'), await gesagt());
  ok('neue Arbeitsrunde läuft: 10:00 → 9:5x', /^9:5\d$/.test((await page.textContent('[data-taktleiste] [data-rest]')).trim()));

  // Pause jetzt / Pause beenden / Uhr anhalten
  await page.click('[data-aktion="pause-jetzt"]');
  ok('„Pause jetzt“ öffnet die Pause sofort', await page.isVisible('[data-pausefenster]'));
  await page.click('[data-aktion="pause-ende"]');
  ok('„Pause beenden“ schließt sie und startet die Arbeit', await page.isHidden('#pause') && (await page.textContent('#uhren')).includes('⏱ Arbeit'));
  await page.click('[data-chip="takt"] [data-aktion="takt-stopp"]');
  ok('✕ hält die Uhr an', await page.isHidden('#uhren'));

  // Station: Einwirk-Knopf an der Karte
  await page.goto(URL0 + '#/station/3'); await page.waitForSelector('[data-schritt="s3.4"]');
  ok('Station Bad: Armatur hat ⌛ 20′, WC über Nacht hat keinen', await page.isVisible('[data-schritt="s3.4"] [data-aktion="uhr"]') && (await page.locator('[data-schritt="s3.6"] [data-aktion="uhr"]').count()) === 0);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.click('[data-schritt="s3.4"] [data-aktion="uhr"]');
  const b = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: innerWidth }));
  ok('320 px mit Uhr-Chip: kein Querlaufen', b.s <= b.w, b);
  ok('keine Fehler in der Konsole', fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log('  ✗ ROT: Probe abgebrochen → ' + e.message.split('\n')[0]);
  if (fehler.length) console.log('    Konsole: ' + fehler.join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
