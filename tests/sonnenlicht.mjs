// Sonnenlicht: echte Hintergrundpixel, Maus-Nachführung und störungsfreie Bedienung.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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
const ctx = await browser.newContext({ viewport: { width: 2048, height: 1152 }, reducedMotion: 'no-preference' });
await ctx.addInitScript(() => {
  localStorage.setItem('oj_thema', 'morgenlicht');
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], cancel() {} } });
});
const page = await ctx.newPage(), fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
const ruhig = () => page.evaluate(() => window.dispatchEvent(new Event('blur')));
const ohneSchein = () => page.waitForFunction(() => +getComputedStyle(document.body, '::before').opacity < .01);
const leuchtet = () => page.waitForFunction(() => document.documentElement.hasAttribute('data-sonnenlicht') && +getComputedStyle(document.body, '::before').opacity > .98);
// Pillow misst die tatsächlich gerenderte Fläche, einschließlich Papierstruktur und Verlauf.
function pixel(png) {
  return JSON.parse(execFileSync('python3', ['-c', `
import sys,io,json
from PIL import Image,ImageStat
im=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB'); w,h=im.size

def mittel(x,y,r=12):
    return ImageStat.Stat(im.crop((max(0,x-r),max(0,y-r),min(w,x+r),min(h,y+r)))).mean
band=im.crop((0,h//4,w,3*h//4)).resize((w,1),Image.Resampling.BOX)
naht=max(max(abs(band.getpixel((x,0))[c]-band.getpixel((x-1,0))[c]) for c in range(3)) for x in range(int(w*.55),w-2))
print(json.dumps({'obenLinks':mittel(int(w*.12),int(h*.12)), 'rechtsUnten':mittel(int(w*.88),int(h*.88)),
 'mitte':mittel(round(w*.72),round(h*.5)), 'breit':mittel(round(w*.72)-250,round(h*.5)), 'naht':naht}))
`], { input: png }));
}
const hell = rgb => rgb.reduce((s, v) => s + v, 0) / 3;
try {
  await page.goto(basis); await page.waitForFunction(() => window.OJ_BEREIT === true);
  for (const [width, height] of [[2048, 1152], [1440, 900], [380, 800]]) {
    await page.setViewportSize({ width, height }); await ruhig(); await ohneSchein();
    const struktur = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return { bild: s.backgroundImage, fest: s.backgroundAttachment, groesse: s.backgroundSize };
    });
    ok('Sonnenlicht ' + width + ' px: durchgehender diagonaler Verlauf', struktur.bild.includes('linear-gradient(135deg') && struktur.fest.startsWith('fixed') && struktur.groesse.startsWith('cover'), struktur);
    const ausblenden = await page.addStyleTag({ content: 'body > * { visibility: hidden !important; }' });
    const bild = pixel(await page.screenshot());
    ok('Sonnenlicht ' + width + ' px: keine harte rechte Kante im gerenderten Hintergrund', bild.naht <= 2, bild);
    ok('Sonnenlicht ' + width + ' px: oben links heller als rechts unten', hell(bild.obenLinks) - hell(bild.rechtsUnten) > 2, bild);
    await ausblenden.evaluate(el => el.remove());
  }
  await page.setViewportSize({ width: 2048, height: 1152 }); await ruhig(); await ohneSchein();
  const ausblenden = await page.addStyleTag({ content: 'body > * { visibility: hidden !important; }' });
  const vorher = pixel(await page.screenshot());
  await page.mouse.move(Math.round(2048 * .72), 576); await leuchtet();
  const nachher = pixel(await page.screenshot());
  ok('Mauslicht: unter dem Zeiger sichtbar heller', hell(nachher.mitte) - hell(vorher.mitte) > 4, { vorher: vorher.mitte, nachher: nachher.mitte });
  const breite = nachher.breit.reduce((sum, n, i) => sum + Math.abs(n - vorher.breit[i]), 0) / 3;
  ok('Mauslicht: großer weicher Schein bis über 250 px Abstand', breite > 2, { vorher: vorher.breit, nachher: nachher.breit });
  await page.mouse.move(330, 270);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  ok('Mauslicht: folgt dem Zeiger nach links und oben', await page.evaluate(() => document.documentElement.style.getPropertyValue('--sonne-x') === '330px' && document.documentElement.style.getPropertyValue('--sonne-y') === '270px'));
  await page.evaluate(() => scrollTo(0, 300));
  ok('Mauslicht: Bildschirmposition bleibt beim Scrollen richtig', await page.evaluate(() => scrollY > 0 && document.documentElement.style.getPropertyValue('--sonne-y') === '270px' && getComputedStyle(document.body, '::before').position === 'fixed'));
  await ausblenden.evaluate(el => el.remove());
  await page.evaluate(() => scrollTo(0, 0));
  ok('Mauslicht: liegt hinter dem Inhalt und fängt keine Eingaben ab', await page.evaluate(() => {
    const s = getComputedStyle(document.body, '::before'); return s.pointerEvents === 'none' && +s.zIndex < 0;
  }));
  await page.click('[data-willkommen] .haupt'); await page.waitForSelector('[data-einrichten="1"]');
  ok('Mauslicht: Einrichten-Button weiterhin bedienbar', true);
  await page.mouse.move(250, 250); await leuchtet(); await ruhig();
  ok('Mauslicht: bei Fensterwechsel ausgeschaltet', await page.evaluate(() => !document.documentElement.hasAttribute('data-sonnenlicht')));
  await page.mouse.move(270, 280); await leuchtet();
  await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointerout', { relatedTarget: null })));
  ok('Mauslicht: beim Verlassen des Fensters ausgeschaltet', await page.evaluate(() => !document.documentElement.hasAttribute('data-sonnenlicht')));
  await page.mouse.move(290, 300); await leuchtet();
  await page.click('#btnThema'); await page.click('[data-thema-wahl="sand"]');
  ok('Mauslicht: Themenwechsel blendet den Schein aus', await page.evaluate(() => document.documentElement.dataset.thema === 'sand' && !document.documentElement.hasAttribute('data-sonnenlicht') && getComputedStyle(document.body, '::before').content === 'none'));
  await page.click('#btnThema'); await page.click('[data-thema-wahl="morgenlicht"]');
  await page.mouse.move(330, 340); await leuchtet();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.mouse.move(350, 360);
  ok('Mauslicht: reduzierte Bewegung wird respektiert', await page.evaluate(() => !document.documentElement.hasAttribute('data-sonnenlicht') && +getComputedStyle(document.body, '::before').opacity === 0));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(370, 380); await leuchtet();
  await page.dispatchEvent('body', 'pointermove', { pointerType: 'touch', clientX: 200, clientY: 200 });
  ok('Mauslicht: Touch-Geste beendet die Maus-Nachführung', await page.evaluate(() => !document.documentElement.hasAttribute('data-sonnenlicht')));
  const touch = await browser.newContext({ viewport: { width: 380, height: 800 }, hasTouch: true, isMobile: true });
  await touch.addInitScript(() => localStorage.setItem('oj_thema', 'morgenlicht'));
  const handy = await touch.newPage(); await handy.goto(basis); await handy.waitForFunction(() => window.OJ_BEREIT === true);
  await handy.dispatchEvent('body', 'pointermove', { pointerType: 'mouse', clientX: 100, clientY: 100 });
  ok('Mauslicht: reines Touch-Gerät bleibt ruhig und ohne Überbreite', await handy.evaluate(() => !document.documentElement.hasAttribute('data-sonnenlicht') && +getComputedStyle(document.body, '::before').opacity === 0 && document.documentElement.scrollWidth <= innerWidth));
  await touch.close();
  ok('Keine JavaScript-Fehler', fehler.length === 0, fehler);
} catch (e) { rot++; console.log('  ✗ ROT: Sonnenlichtprobe abgebrochen → ' + e.message.split('\n')[0]); }
finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`\n${gruen} grün · ${rot} ROT`); process.exitCode = rot ? 1 : 0;
