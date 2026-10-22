// Seitwischen nach Mixarium: echte Karten, Touch-Gesten auf Handy/Tablet und störungsfreie Bedienung.
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
const ctx = await browser.newContext({ viewport: { width: 380, height: 800 }, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => {
  localStorage.setItem('oj_takt', JSON.stringify({ phase: 'arbeit', ende: Date.now() + 1200000, dauer: 1200000 }));
});
const page = await ctx.newPage(), fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
const cdp = await ctx.newCDPSession(page);
const zweiBilder = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const arena = () => page.evaluate(() => {
  document.getElementById('wischprobe')?.remove();
  const d = document.createElement('div'); d.id = 'wischprobe';
  d.style.cssText = 'position:fixed;left:0;top:200px;width:100%;height:180px;z-index:100';
  document.getElementById('ansicht').append(d);
});
const geh = async hash => { await page.evaluate(h => { location.hash = h; }, hash); await zweiBilder(); await arena(); };
const echt = async (x1, y1, x2, y2, halte = 0) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
  for (let n = 1; n <= 8; n++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2-x1)*n/8, y: y1 + (y2-y1)*n/8 }] });
    if (halte) await page.waitForTimeout(halte / 8);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await zweiBilder();
};
const gestellt = async (art = 'touch', extra = '') => {
  await page.evaluate(({art, extra}) => {
    const d = document.querySelector('#wischprobe button') || document.getElementById('wischprobe');
    if (art === 'mouse') {
      for (const [type, x] of [['pointerdown',300],['pointermove',150],['pointerup',80]]) {
        d.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'mouse', pointerId: 1, isPrimary: true, clientX: x, clientY: 260 }));
      }
      return;
    }
    const punkt = (id, x, y) => new Touch({identifier:id,target:d,clientX:x,clientY:y});
    const senden = (type, touches, changed) => d.dispatchEvent(new TouchEvent(type, {bubbles:true,cancelable:true,touches,targetTouches:touches,changedTouches:changed}));
    const a = punkt(1,300,260);
    senden('touchstart',[a],[a]);
    if (extra === 'mehr') {
      const b = punkt(2,280,280); senden('touchstart',[a,b],[b]);
    }
    if (extra === 'abbruch') senden('touchcancel',[],[a]);
    const b = punkt(1,150,265), c = punkt(1,80,270);
    senden('touchmove',[b],[b]); senden('touchend',[],[c]);
  }, {art, extra}); await zweiBilder();
};
const echteKarte = async (halte = 0) => {
  await page.locator('a.station-kachel').first().scrollIntoViewIfNeeded();
  const b = await page.locator('a.station-kachel').first().boundingBox();
  await echt(b.x + b.width * .82, b.y + b.height * .5, b.x + b.width * .18, b.y + b.height * .5, halte);
};

try {
  await page.goto(basis); await page.waitForFunction(() => window.OJ_BEREIT === true);
  await page.evaluate(() => window.OJ.DB.einst('profil', {raeume:{1:1,2:1,3:1},wahl:[],takt:{arbeit:20,pause:10}}));
  await page.reload(); await page.waitForFunction(() => window.OJ_BEREIT === true);
  await echteKarte();
  ok('Ganze Seite: Raumkarte auf Handy wischt zu Gewohnheit statt den Raum zu öffnen', await page.evaluate(() => location.hash === '#/gewohnheiten'));
  await geh('#/'); await page.locator('#wischprobe').evaluate(e => e.remove());
  await echteKarte(1100);
  ok('Ganze Seite: Finger auflegen und langsam wischen funktioniert', await page.evaluate(() => location.hash === '#/gewohnheiten'));
  await page.setViewportSize({width:1024,height:900});
  await geh('#/'); await page.locator('#wischprobe').evaluate(e => e.remove());
  await echteKarte();
  ok('Ganze Seite: reale Raumkarte auf Tablet wischt zur nächsten Hauptseite', await page.evaluate(() => location.hash === '#/gewohnheiten'));
  await geh('#/'); await page.locator('#wischprobe').evaluate(e => e.remove());
  await echt(110,440,30,440);
  ok('Ganze Seite: auch der freie Seitenrand auf Tablet nimmt die Geste an', await page.evaluate(() => location.hash === '#/gewohnheiten'));
  await page.setViewportSize({width:380,height:800});
  await geh('#/');
  const uhr = await page.evaluate(() => localStorage.getItem('oj_takt'));
  const folge = ['gewohnheiten', 'kalender', 'flecken', 'regeln', 'verlauf'];
  for (const n of folge) {
    await echt(300, 260, 80, 268);
    ok('Seitwischen links: ' + n, await page.evaluate(n => location.hash === '#/' + n && document.querySelector('.leiste [aria-current="page"]').dataset.nav === n, n));
    await arena();
  }
  await echt(300, 260, 80, 268);
  ok('Am Ende kein ungewollter Umlauf', await page.evaluate(() => location.hash === '#/verlauf'));
  for (const n of ['regeln', 'flecken', 'kalender', 'gewohnheiten', '']) {
    await echt(80, 260, 300, 268);
    ok('Seitwischen rechts: ' + (n || 'start'), await page.evaluate(n => location.hash === '#/' + n, n)); await arena();
  }
  await echt(80, 260, 300, 268);
  ok('Am Anfang kein ungewollter Umlauf', await page.evaluate(() => location.hash === '#/'));
  ok('Laufende Arbeitszeit bleibt erhalten', await page.evaluate(u => localStorage.getItem('oj_takt') === u && !!document.querySelector('[data-chip="takt"] [data-rest]'), uhr));
  await echt(300, 260, 260, 265);
  ok('Kurze Bewegung wechselt keine Seite', await page.evaluate(() => location.hash === '#/'));
  await page.evaluate(() => { document.getElementById('ansicht').style.minHeight = '2500px'; });
  await echt(200, 340, 180, 205);
  ok('Senkrechtes Scrollen bleibt nativ möglich', await page.evaluate(() => location.hash === '#/' && scrollY > 0));
  await page.evaluate(() => scrollTo(0,0));
  await echt(8, 260, 220, 265);
  ok('Browser-Randgeste bleibt frei', await page.evaluate(() => location.hash === '#/'));
  for (const [art, extra, name] of [['mouse','','Mausziehen'], ['touch','mehr','Zwei Finger'], ['touch','abbruch','Abgebrochene Geste']]) {
    await gestellt(art, extra); ok(name + ' wechselt keine Seite', await page.evaluate(() => location.hash === '#/'));
  }
  await page.evaluate(() => { const b = document.createElement('button'); document.getElementById('wischprobe').append(b); });
  await page.evaluate(() => { const b = document.querySelector('#wischprobe button'); b.style.cssText='width:100%;height:100%'; window.wischKlicks=0; b.onclick=() => window.wischKlicks++; });
  await echt(300,260,80,268);
  await page.waitForTimeout(100);
  ok('Ganze Seite: Button-Fläche wischt, ohne den Button versehentlich anzutippen', await page.evaluate(() => location.hash === '#/gewohnheiten' && window.wischKlicks === 0));
  await geh('#/');
  await page.locator('#wischprobe').evaluate(e => { const b=document.createElement('button'); b.style.cssText='width:100%;height:100%'; b.onclick=() => window.wischKlicks++; e.append(b); });
  await page.touchscreen.tap(200,260);
  ok('Normaler kurzer Tipp bleibt ein Button-Klick', await page.evaluate(() => location.hash === '#/' && window.wischKlicks === 1));
  await arena();
  await page.click('#btnThema'); await gestellt();
  ok('Offene Themenauswahl blockiert Seitengeste', await page.evaluate(() => location.hash === '#/'));
  await page.click('#btnThema');
  for (const h of ['#/station/0', '#/einrichten/1', '#/sitzung/0/0']) {
    await geh(h); await gestellt();
    ok('Keine Hauptseiten-Geste in ' + h, await page.evaluate(h => location.hash === h, h));
  }
  await geh('#/flecken');
  await page.fill('#fleckSuche', 'Kaffee'); await gestellt();
  ok('Eingabe bleibt fokussiert und Suche erhalten', await page.evaluate(() => location.hash === '#/flecken' && document.getElementById('fleckSuche').value === 'Kaffee'));
  await page.locator('#fleckSuche').blur();
  await page.click('[data-nav="regeln"]');
  ok('Navigation per Tippen weiterhin möglich', await page.evaluate(() => location.hash === '#/regeln'));
  ok('Keine JavaScript-Fehler', fehler.length === 0, fehler);
} catch (e) { rot++; console.log('  ✗ ROT: Wischprobe abgebrochen → ' + e.message.split('\n')[0]); }
finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`\n${gruen} grün · ${rot} ROT`); process.exitCode = rot ? 1 : 0;
