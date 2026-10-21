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
const THEMEN = ['washi', 'sand', 'salbei', 'leinen', 'morgenlicht', 'kirschbluete', 'daemmerung', 'moos'];
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
  ok('Themenwahl: acht Naturthemen einschließlich dunkler Alternativen verfügbar', (await page.locator('[data-thema-wahl]').count()) === THEMEN.length);
  ok('Thema: auch bei dunklem System helles Washi als Start', await page.evaluate(() => document.documentElement.dataset.thema === 'washi' && getComputedStyle(document.documentElement).colorScheme === 'light'));
  const bild = await page.evaluate(() => {
    const k = document.querySelector('[data-warum] .kbild'), h = document.querySelector('[data-warum] h2');
    const b = k.getBoundingClientRect(), t = h.getBoundingClientRect(), s = getComputedStyle(k), g = getComputedStyle(k, '::after');
    return { ganz: s.backgroundSize === 'contain', format: b.width / b.height, textImBild: t.top < b.bottom - 4 && t.top > b.top, verlauf: g.backgroundImage.includes('linear-gradient') && g.content !== 'none', dunkel: getComputedStyle(h).color === 'rgb(36, 31, 26)', ruhig: s.animationName === 'none' };
  });
  ok('Pinselbild: dunkler Text im Bild mit weichem Verlauf', bild.ganz && Math.abs(bild.format - 1.5) < .02 && bild.textImBild && bild.verlauf && bild.dunkel && bild.ruhig, bild);
  const dateien = await page.evaluate(async () => Promise.all(window.OJ_INHALT.bilder.map(id => new Promise(resolve => {
    const i = new Image(); i.onload = () => resolve(i.naturalWidth === 1200 && i.naturalHeight === 800); i.onerror = () => resolve(false); i.src = 'bilder/' + id + '.webp';
  }))));
  ok('Alle acht echten Bilddateien lassen sich im Browser dekodieren', dateien.length === 8 && dateien.every(Boolean), dateien);
  const farben = [];
  for (const name of THEMEN) {
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
        glas: s.backgroundImage, kante: s.boxShadow, text: s.color, meta: document.querySelector('meta[name="theme-color"]').content, schema: getComputedStyle(document.documentElement).colorScheme,
        bildText: getComputedStyle(document.querySelector('[data-warum] h2')).color,
        bildSoll: getComputedStyle(document.documentElement).getPropertyValue('--bild-tusche').trim(),
        kontrast: Math.min(kontrast(text, oben), kontrast(text, unten), kontrast(rgb(getComputedStyle(document.body).color), rgb(karte))) };
    });
    const rand = await page.evaluate(() => {
      const karte = document.querySelector('[data-warum]'), bild = karte.querySelector('.kbild');
      const k = getComputedStyle(karte), r = getComputedStyle(bild, '::before');
      return { frei: k.borderTopColor === 'rgba(0, 0, 0, 0)' && k.boxShadow === 'none' && k.backgroundClip === 'padding-box',
        weich: r.backgroundImage.includes('linear-gradient') && r.backgroundImage.includes(getComputedStyle(document.body).backgroundColor)
          && r.maskImage.includes('linear-gradient') };
    });
    ok('Bildrahmen ' + name + ': oben und seitlich weich ins Hintergrundthema', rand.frei && rand.weich, rand);
    farben.push(stand);
    ok('Thema ' + name + ': Schrift mit mindestens 4,5:1 Kontrast', stand.thema === name && stand.kontrast >= 4.5, stand);
    ok('Thema ' + name + ': hell oder dunkel passend zur Auswahl', stand.schema === (['daemmerung', 'moos'].includes(name) ? 'dark' : 'light'), stand);
    ok('Thema ' + name + ': Bildtext passt zur hellen oder dunklen Verlaufsfläche', await page.evaluate(() => {
      const h = document.querySelector('[data-warum] h2'), c = document.createElement('span');
      c.style.color = 'var(--bild-tusche)'; document.body.append(c);
      const passt = getComputedStyle(h).color === getComputedStyle(c).color; c.remove(); return passt;
    }));
    const material = await page.evaluate(async n => {
      const s = getComputedStyle(document.documentElement), muster = s.getPropertyValue('--papier-muster').trim(), licht = s.getPropertyValue('--papier-licht').trim();
      if (n === 'kirschbluete') return { sichtbar: muster === 'none', muster, licht };
      const url = (n === 'morgenlicht' ? licht : muster).match(/^url\(["']?(.*?)["']?\)$/)?.[1];
      if (!url) return { sichtbar: false, muster, licht };
      const img = new Image(); img.src = url; await img.decode();
      const c = document.createElement('canvas'); c.width = 192; c.height = 192; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 192, 192);
      const px = ctx.getImageData(0, 0, 192, 192).data, werte = new Set(); for (let i = 0; i < px.length; i += 4) werte.add(px[i] + ',' + px[i + 3]);
      return { sichtbar: werte.size > 16, muster, licht };
    }, name);
    ok('Material ' + name + ': dezente Struktur oder Fensterlicht sichtbar', material.sichtbar, material);
    await foto(name + '-desktop');
    await page.reload(); await bereit();
    ok('Thema ' + name + ': nach Neuladen und in der Auswahl erhalten', await page.evaluate(n => document.documentElement.dataset.thema === n && document.querySelector(`[data-thema-wahl="${n}"]`).getAttribute('aria-pressed') === 'true', name));
  }
  ok('Buttons: Glasfläche, Text und 3D-Kante passen sich jedem Thema an', new Set(farben.map(f => f.glas)).size === THEMEN.length && new Set(farben.map(f => f.kante)).size === THEMEN.length && new Set(farben.map(f => f.text)).size === THEMEN.length, farben);
  await page.locator('#btnThema').focus(); await page.keyboard.press('Enter'); await page.waitForSelector('#themaAuswahl:not([hidden])');
  await page.keyboard.press('Escape');
  ok('Themenwahl: Tastatur, Escape und Fokus zurück zum Knopf', await page.evaluate(() => document.getElementById('themaAuswahl').hidden && document.activeElement.id === 'btnThema' && document.getElementById('btnThema').getAttribute('aria-expanded') === 'false'));
  await page.click('#btnThema'); await page.click('.held-sub');
  ok('Themenwahl schließt beim Klick außerhalb', await page.isHidden('#themaAuswahl'));
  await page.evaluate(() => localStorage.setItem('oj_thema', 'ungueltig')); await page.reload(); await bereit();
  ok('Thema: ungültiger Speicherwert fällt sicher auf Washi zurück', await page.evaluate(() => document.documentElement.dataset.thema === 'washi'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const knopf = page.locator('[data-willkommen] .haupt');
  await page.mouse.move(0, 0); const ruhigerSchatten = await knopf.evaluate(b => getComputedStyle(b).boxShadow); await knopf.hover();
  await page.waitForFunction(schatten => getComputedStyle(document.querySelector('[data-willkommen] .haupt')).boxShadow !== schatten, ruhigerSchatten);
  const r = await knopf.boundingBox();
  await page.mouse.move(r.x + r.width * .2, r.y + r.height * .3);
  await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('[data-willkommen] .haupt'), '::before').opacity) >= .8);
  const links = await knopf.evaluate(b => ({ x: b.style.getPropertyValue('--mx'), y: b.style.getPropertyValue('--my'), rx: b.style.getPropertyValue('--rx'), ry: b.style.getPropertyValue('--ry'), matrix: getComputedStyle(b).transform, licht: getComputedStyle(b, '::before').backgroundImage, kante: getComputedStyle(b, '::after').backgroundImage, schatten: getComputedStyle(b).boxShadow }));
  await page.mouse.move(r.x + r.width * .8, r.y + r.height * .7);
  const rechts = await knopf.evaluate(b => ({ x: b.style.getPropertyValue('--mx'), ry: b.style.getPropertyValue('--ry') }));
  ok('Family-Glas: Schimmer und 3D-Neigung folgen der Maus', parseFloat(links.x) < 40 && parseFloat(rechts.x) > 60 && parseFloat(links.ry) < 0 && parseFloat(rechts.ry) > 0 && links.matrix !== 'matrix(1, 0, 0, 1, 0, 0)', { links, rechts });
  ok('Family-Glas: gewölbter Reflex, Schliffkante und stärkerer Leuchtrand', links.licht.includes('radial-gradient') && links.kante.includes('radial-gradient') && links.schatten !== ruhigerSchatten, links);
  await page.mouse.move(0, 0);
  ok('Family-Glas: beim Verlassen kehren Schimmer und Neigung zurück', await knopf.evaluate(b => !b.style.getPropertyValue('--rx') && !b.style.getPropertyValue('--mx')));
  await knopf.hover();
  await page.mouse.down();
  await page.waitForFunction(() => { const b = document.querySelector('[data-willkommen] .haupt'); return new DOMMatrixReadOnly(getComputedStyle(b).transform).m42 > 2; });
  ok('Glas-Button: beim Drücken sichtbar eingedrückt', true);
  await page.mouse.up(); await page.waitForSelector('[data-einrichten="1"]');
  ok('Glas-Button: Einrichten-Aktion funktioniert weiterhin', true);
  const deaktiviert = page.locator('[data-aktion="e-minus"][data-nr="8"]'); await deaktiviert.hover();
  ok('Deaktivierte Buttons bleiben ruhig und ohne 3D-Kante', await deaktiviert.evaluate(b => b.disabled && getComputedStyle(b).animationName === 'none' && getComputedStyle(b).boxShadow === 'none'));
  await geh('#/'); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('[data-willkommen] .haupt').hover();
  ok('Reduzierte Bewegung: kein Wackeln und kein Lichtlauf', await page.locator('[data-willkommen] .haupt').evaluate(b => getComputedStyle(b).animationName === 'none' && getComputedStyle(b, '::before').display === 'none' && getComputedStyle(b).transform === 'none' && !b.style.getPropertyValue('--rx')));
  for (const breite of [320, 380]) {
    await page.setViewportSize({ width: breite, height: 800 });
    for (const name of THEMEN) {
      await thema(name); await geh('#/');
      ok(breite + ' px ' + name + ': Kopf und vollständige Bilder passen', await page.evaluate(() => {
        const k = document.querySelector('[data-warum] .kbild'), r = k.getBoundingClientRect(), kopf = document.querySelector('.kopf'), text = document.querySelector('[data-warum] h2').getBoundingClientRect();
        return document.documentElement.scrollWidth <= innerWidth && kopf.scrollWidth <= kopf.clientWidth && Math.abs(r.width / r.height - 1.5) < .02 && text.top < r.bottom - 4 && getComputedStyle(k, '::after').backgroundImage.includes('linear-gradient');
      }));
    }
    await foto('handy-' + breite);
  }
  for (const nav of ['start', 'gewohnheiten', 'kalender', 'flecken', 'regeln', 'verlauf']) {
    await page.click(`[data-nav="${nav}"]`);
    await page.waitForFunction(n => document.querySelector('[data-nav="' + n + '"]').getAttribute('aria-current') === 'page', nav);
    ok('Navigation ' + nav + ': aktive Seite fett, hinterlegt und markiert', await page.evaluate(n => {
      const a = document.querySelector(`[data-nav="${n}"]`), s = getComputedStyle(a), marke = getComputedStyle(a, '::before');
      return document.querySelectorAll('.leiste [aria-current="page"]').length === 1 && +s.fontWeight >= 750
        && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && marke.content !== 'none' && parseFloat(marke.height) >= 3;
    }, nav));
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
