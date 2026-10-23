// Bildserien ab Serie 2: richtige Zuordnungen, weiche Container und Schrittansicht.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';
const WURZEL = path.resolve(import.meta.dirname, '..');
let gruen = 0, rot = 0;
const ok = (n, b, info) => { if (b) { gruen++; console.log('  ✓ ' + n); } else { rot++; console.log('  ✗ ROT: ' + n + ' → ' + JSON.stringify(info)); } };
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
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], cancel() {}, speak(u) { setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); } } });
});
const page = await ctx.newPage(), fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
const schritte = ['s0.1','s0.2','s0.3','s0.4','s0.5','s0.6','s0.7','s1.1','s1.2','s1.3','s1.4','s1.5','s1.6','s1.7','s1.8','s2.1','s2.2','s2.3','s2.4','s2.5','s2.6','s2.7','s2.8','s2.9','s2.10','s2.11','s2.12','s2.13','s3.1','s3.2','s3.3','s3.4','s3.5','s3.6','s3.7','s3.8','s3.9','s4.1','s4.2','s4.3','s4.4','s4.5','s4.6','s4.7','s4.8','s4.9','s4.10','s4.11','s4.12','s5.1','s5.2','s5.3','s5.4','s5.5','s5.6','s5.7','s5.8','s5.9','s5.10','s6.1','s6.2','s6.3','s6.4','s6.5','s6.6','s6.7','s6.8','s6.9','s6.10','s6.11','s7.1','s7.2'];
const geh = async h => { await page.goto(basis + h); await page.waitForFunction(() => window.OJ_BEREIT === true); };
async function karte(sel, id) {
  return page.locator(sel).evaluate((k, id) => {
    const b = k.querySelector('.kbild'), h = k.querySelector('h1,h2,h3');
    if (!b || !h) return false;
    const r = b.getBoundingClientRect(), t = h.getBoundingClientRect(), s = getComputedStyle(b);
    return k.classList.contains('mit-bild') && s.backgroundImage.includes('/' + id + '.webp') &&
      s.backgroundSize === 'contain' && Math.abs(r.width / r.height - 1.5) < .02 &&
      getComputedStyle(b, '::after').backgroundImage.includes('linear-gradient') &&
      getComputedStyle(b, '::before').maskImage.includes('linear-gradient') &&
      t.top < r.bottom - 4 && t.top > r.top;
  }, id);
}
try {
  await geh('#/station/0');
  const alle = await page.evaluate(async ids => Promise.all(ids.map(id => new Promise(resolve => {
    const i = new Image(); i.onload = () => resolve(i.naturalWidth === 1200 && i.naturalHeight === 800); i.onerror = () => resolve(false); i.src = 'bilder/' + id + '.webp';
  }))), ['st0','st1','st2','st3','st4','st5','st6','st7',...schritte]);
  ok('Bildserie: alle achtzig WebP-Dateien mit 1200 × 800 dekodierbar', alle.length === 80 && alle.every(Boolean), alle);
  for (const nr of [0,1,2,3,4,5,6,7]) {
    await geh('#/station/' + nr);
    ok('Bildserie: st' + nr + ' im zugehörigen Raumkopf mit weichem Übergang und überlappender Schrift', await karte('.station-kopf', 'st' + nr));
    for (const id of schritte.filter(s => s.startsWith('s' + nr + '.'))) {
      const sel = '[data-schritt="' + id + '"]';
      ok('Bildserie: ' + id + ' bei seinem Text mit weichem Container', await karte(sel, id));
      const passt = await page.locator(sel).evaluate((e, id) => {
        const s = window.OJ_INHALT.stationen.flatMap(s => s.schritte).find(s => s.id === id);
        return e.querySelector('h3').textContent.includes(s.titel) && e.querySelector('p').textContent.includes(s.text.slice(0,35));
      }, id);
      ok('Bildserie: ' + id + ' behält seinen Anleitungstext', passt);
    }
    for (const width of [320,380,1100]) {
      await page.setViewportSize({ width, height: 800 });
      ok('Bildserie: Raum ' + nr + ' ohne Überbreite bei ' + width + ' px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 380, height: 800 });
  }
  for (const id of schritte) {
    const nr = id[1]; await geh('#/sitzung/' + nr + '/' + id);
    if (await page.locator('[data-aktion="s-warn-ok"]').count()) await page.click('[data-aktion="s-warn-ok"]');
    await page.waitForSelector('[data-sitzung][data-ref="' + id + '"]');
    ok('Bildserie: ' + id + ' auch in der Schrittansicht mit gleichem Bildcontainer', await karte('[data-buehne]', id));
  }
  ok('Keine JavaScript-Fehler', fehler.length === 0, fehler);
} catch (e) { rot++; console.log('  ✗ ROT: Bildserieprobe abgebrochen → ' + e.message.split('\n')[0]); }
finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`\n${gruen} grün · ${rot} ROT`); process.exitCode = rot ? 1 : 0;

