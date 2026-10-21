// Ganze Bildmotive, lesbare Naturthemen, Glas-Buttons und hervorgehobene Mischverbote im Browser.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let gruen = 0, rot = 0;
const ok = (name, wert, info) => { if (wert) { gruen++; console.log('  ✓ ' + name); } else { rot++; console.log('  ✗ ROT: ' + name + ' → ' + JSON.stringify(info)); } };
const server = http.createServer((req, res) => {
  let name = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (name.endsWith('/')) name += 'index.html';
  const file = path.resolve(WURZEL, '.' + name);
  if (!file.startsWith(WURZEL + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const basis = `http://127.0.0.1:${server.address().port}/`;
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(fs.existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, colorScheme: 'dark' });
const fehler = [];
await ctx.addInitScript(() => {
  class U { constructor(text) { this.text = text; } }
  window.SpeechSynthesisUtterance = U;
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], cancel() {}, speak(u) { setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); } } });
});
const page = await ctx.newPage(); page.on('pageerror', e => fehler.push(String(e)));
const bereit = () => page.waitForFunction(() => window.OJ_BEREIT === true);
const geh = async hash => { await page.goto(basis + hash); await bereit(); };
const thema = async name => { await page.click('#btnThema'); await page.waitForSelector('#themaAuswahl:not([hidden])'); await page.click(`[data-thema-wahl="${name}"]`); await page.waitForSelector('#themaAuswahl[hidden]', { state: 'attached' }); };
const foto = async name => {
  if (!process.env.OJ_GESTALTUNGSBILDER) return;
  fs.mkdirSync(process.env.OJ_GESTALTUNGSBILDER, { recursive: true });
  await page.screenshot({ path: path.join(process.env.OJ_GESTALTUNGSBILDER, name + '.png'), fullPage: true });
};
try {
  await geh('#/');
  ok('Thema: auch bei dunklem System helles Washi als Start', await page.evaluate(() => document.documentElement.dataset.thema === 'washi' && getComputedStyle(document.documentElement).colorScheme === 'light'));
  const bild = await page.evaluate(() => {
    const k = document.querySelector('[data-warum] .kbild'), h = document.querySelector('[data-warum] h2');
    const b = k.getBoundingClientRect(), t = h.getBoundingClientRect(), s = getComputedStyle(k);
    return { ganz: s.backgroundSize === 'contain', format: b.width / b.height, textDarunter: t.top >= b.bottom, ruhig: s.animationName === 'none' };
  });
  ok('Pinselbild: ganzes Motiv in 3:2 sichtbar, Text darunter', bild.ganz && Math.abs(bild.format - 1.5) < .02 && bild.textDarunter && bild.ruhig, bild);
  const dateien = await page.evaluate(async () => Promise.all(window.OJ_INHALT.bilder.map(id => new Promise(resolve => {
    const i = new Image(); i.onload = () => resolve(i.naturalWidth === 1200 && i.naturalHeight === 800); i.onerror = () => resolve(false); i.src = 'bilder/' + id + '.webp';
  }))));
  ok('Alle acht echten Bilddateien lassen sich im Browser dekodieren', dateien.length === 8 && dateien.every(Boolean), dateien);
  const farben = [];
  for (const name of ['washi', 'sand', 'salbei']) {
    await thema(name);
    const stand = await page.evaluate(() => {
      const b = document.querySelector('[data-willkommen] .haupt'), s = getComputedStyle(b);
      const c = document.createElement('canvas').getContext('2d');
      function rgb(css, grund) { c.clearRect(0, 0, 1, 1); if (grund) { c.fillStyle = grund; c.fillRect(0, 0, 1, 1); } c.fillStyle = css; c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); }
      const lum = a => a.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((v, x, i) => v + x * [.2126, .7152, .0722][i], 0);
      const kontrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const karte = getComputedStyle(document.querySelector('[data-willkommen]')).backgroundColor;
      const text = rgb(s.color), oben = rgb(s.getPropertyValue('--glas-oben'), karte), unten = rgb(s.getPropertyValue('--glas-unten'), karte);
      return { thema: document.documentElement.dataset.thema, grund: getComputedStyle(document.body).backgroundColor,
        glas: s.backgroundImage, kante: s.boxShadow, text: s.color, meta: document.querySelector('meta[name="theme-color"]').content,
        kontrast: Math.min(kontrast(text, oben), kontrast(text, unten), kontrast(rgb(getComputedStyle(document.body).color), rgb(karte))) };
    });
    farben.push(stand);
    ok('Thema ' + name + ': dunkle Schrift mit mindestens 4,5:1 Kontrast', stand.thema === name && stand.kontrast >= 4.5, stand);
    await foto(name + '-desktop');
    await page.reload(); await bereit();
    ok('Thema ' + name + ': nach Neuladen und in der Auswahl erhalten', await page.evaluate(n => document.documentElement.dataset.thema === n && document.querySelector(`[data-thema-wahl="${n}"]`).getAttribute('aria-pressed') === 'true', name));
  }
  ok('Buttons: Glasfläche, Text und 3D-Kante passen sich jedem Thema an', new Set(farben.map(f => f.glas)).size === 3 && new Set(farben.map(f => f.kante)).size === 3 && new Set(farben.map(f => f.text)).size === 3, farben);
  await page.locator('#btnThema').focus(); await page.keyboard.press('Enter'); await page.waitForSelector('#themaAuswahl:not([hidden])');
  await page.keyboard.press('Escape');
  ok('Themenwahl: Tastatur, Escape und Fokus zurück zum Knopf', await page.evaluate(() => document.getElementById('themaAuswahl').hidden && document.activeElement.id === 'btnThema' && document.getElementById('btnThema').getAttribute('aria-expanded') === 'false'));
  await page.click('#btnThema'); await page.click('.held-sub');
  ok('Themenwahl schließt beim Klick außerhalb', await page.isHidden('#themaAuswahl'));
  await page.evaluate(() => localStorage.setItem('oj_thema', 'ungueltig')); await page.reload(); await bereit();
  ok('Thema: ungültiger Speicherwert fällt sicher auf Washi zurück', await page.evaluate(() => document.documentElement.dataset.thema === 'washi'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const knopf = page.locator('[data-willkommen] .haupt'); await knopf.hover();
  const hover = await knopf.evaluate(b => ({ wackeln: getComputedStyle(b).animationName, licht: getComputedStyle(b, '::before').animationName }));
  ok('Glas-Button: kurzes Wackeln und Lichtreflex bei Mausberührung', hover.wackeln === 'glas-wackeln' && hover.licht === 'glas-licht', hover);
  await page.mouse.down();
  await page.waitForFunction(() => { const b = document.querySelector('[data-willkommen] .haupt'); return new DOMMatrixReadOnly(getComputedStyle(b).transform).m42 > 2; });
  ok('Glas-Button: beim Drücken sichtbar eingedrückt', true);
  await page.mouse.up(); await page.waitForSelector('[data-einrichten="1"]');
  ok('Glas-Button: Einrichten-Aktion funktioniert weiterhin', true);
  const deaktiviert = page.locator('[data-aktion="e-minus"][data-nr="8"]'); await deaktiviert.hover();
  ok('Deaktivierte Buttons bleiben ruhig und ohne 3D-Kante', await deaktiviert.evaluate(b => b.disabled && getComputedStyle(b).animationName === 'none' && getComputedStyle(b).boxShadow === 'none'));
  await geh('#/'); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('[data-willkommen] .haupt').hover();
  ok('Reduzierte Bewegung: kein Wackeln und kein Lichtlauf', await page.locator('[data-willkommen] .haupt').evaluate(b => getComputedStyle(b).animationName === 'none' && getComputedStyle(b, '::before').display === 'none'));
  for (const breite of [320, 380]) {
    await page.setViewportSize({ width: breite, height: 800 });
    for (const name of ['washi', 'sand', 'salbei']) {
      await thema(name); await geh('#/');
      ok(breite + ' px ' + name + ': Kopf und vollständige Bilder passen', await page.evaluate(() => {
        const k = document.querySelector('[data-warum] .kbild'), r = k.getBoundingClientRect(), kopf = document.querySelector('.kopf');
        return document.documentElement.scrollWidth <= innerWidth && kopf.scrollWidth <= kopf.clientWidth && Math.abs(r.width / r.height - 1.5) < .02;
      }));
    }
    await foto('handy-' + breite);
  }
  await geh('#/station/0');
  const warnung = await page.evaluate(() => [...document.querySelectorAll('[data-warnkarte] li')].map(li => ({ text: li.textContent, namen: [...li.querySelectorAll('strong')].map(e => e.textContent), fett: [...li.querySelectorAll('strong')].every(e => +getComputedStyle(e).fontWeight >= 700) })));
  ok('Nie mischen: Chlorreiniger, Säure, Essig und Zitronensäure fett', ['Chlorreiniger', 'Säure', 'Essig', 'Zitronensäure'].every(n => warnung[0].namen.includes(n)) && warnung[0].fett, warnung[0]);
  ok('Nie mischen: bei allen sechs gefährlichen Kombinationen die Stoffnamen fett', warnung.slice(0, 6).every(w => w.namen.length >= 2 && w.fett), warnung);
  ok('Nie mischen: Warntexte vollständig und unverändert', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-warnkarte] li')].map(e => e.textContent)) === JSON.stringify(window.OJ_INHALT.nieMischen)));
  await foto('warnung');
  await geh('#/sitzung/3'); await page.waitForSelector('[data-sitzung][data-phase="warn"]');
  ok('Nie mischen: auch die Pflichtkarte der Sitzung hebt Stoffnamen hervor', await page.evaluate(() => [...document.querySelectorAll('[data-buehne] li')].every(li => li.querySelectorAll('strong').length >= 2)));
  ok('Keine JavaScript-Fehler', fehler.length === 0, fehler);
} catch (e) { rot++; console.log('  ✗ ROT: Gestaltungsprobe abgebrochen → ' + e.message.split('\n')[0]); }
finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`\n${gruen} grün · ${rot} ROT`); process.exitCode = rot ? 1 : 0;
