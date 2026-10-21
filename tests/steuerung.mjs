// Browser-Funktionstest mit gestelltem Mikrofon/Medientasten, niemals Hardware-Nachweis.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const srv = http.createServer((q, r) => {
  const p = path.join(process.cwd(), new URL(q.url, 'http://x').pathname.replace(/\/$/, '/index.html'));
  if (!fs.existsSync(p)) { r.writeHead(404).end(); return; }
  r.setHeader('Content-Type', p.endsWith('.js') ? 'text/javascript' : p.endsWith('.css') ? 'text/css' : 'text/html');
  fs.createReadStream(p).pipe(r);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let browser;
let n = 0;
const ok = (name, b) => { assert.ok(b, name); n++; console.log('  ✓ ' + name); };
try {
  browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const ctx = await browser.newContext({ viewport: { width: 320, height: 740 } });
  await ctx.addInitScript(() => {
    window.__starts = 0; window.__rs = []; window.__gesagt = [];
    window.SpeechRecognition = class {
      constructor() { window.__rs.push(this); }
      start() { window.__starts++; this.onstart?.(); }
      abort() { this.abgebrochen = true; }
    };
    window.__result = (text, final = true) => {
      const r = window.__rs.at(-1), x = [{ transcript: text }]; x.isFinal = final;
      r.onresult?.({ resultIndex: 0, results: [x] });
    };
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [], cancel() {}, speak(u) { window.__gesagt.push(u.text); setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); } } });
    window.__media = {};
    Object.defineProperty(navigator, 'mediaSession', { value: { setActionHandler(a, f) { window.__media[a] = f; } } });
  });
  const p = await ctx.newPage(), errors = []; p.on('pageerror', e => errors.push(e.message));
  const base = `http://127.0.0.1:${srv.address().port}/`;
  await p.goto(base + '#/sitzung/0'); await p.waitForFunction(() => window.OJ_BEREIT);
  ok('ohne Knopfdruck kein Mikrofon', await p.evaluate(() => __starts === 0));
  const aliases = { fertig: ['fertig', 'Abgehakt!'], weiter: ['weiter', 'nächster Schritt'], nochmal: ['nochmal', 'wiederholen'], langsamer: ['langsamer'], zurück: ['zurück'], pause: ['Pause', 'Musik'], zeit: ['wie lange noch?'], warum: ['warum'], fleck: ['Fleck Rotwein'], stopp: ['stopp'] };
  for (const [k, texte] of Object.entries(aliases)) for (const t of texte) ok('Befehl ' + t, await p.evaluate(([t, k]) => OJ.Steuerung.befehl(t) === k, [t, k]));
  ok('keine Teilwort-Treffer oder verneinten Befehle', await p.evaluate(() => ['nicht fertig', 'weiterarbeiten', 'bitte nicht weiter', ''].every(t => OJ.Steuerung.befehl(t) === null)));
  const hoeren = async () => { await p.click('#zuhoeren'); };
  const sag = t => p.evaluate(t => __result(t), t);
  await hoeren(); await sag('fertig');
  ok('Sprache überspringt keine Warnkarte', await p.locator('[data-phase="warn"]').count() === 1);
  await p.click('[data-aktion="s-warn-ok"]');
  const ref = () => p.getAttribute('[data-sitzung]', 'data-ref');
  const vorher = await ref();
  await hoeren(); await p.evaluate(() => __result('fertig', false));
  ok('Zwischenergebnis ignoriert', await ref() === vorher);
  await sag('fertig'); await p.waitForFunction(r => document.querySelector('[data-sitzung]').dataset.ref !== r, vorher);
  ok('fertig hakt genau einen Schritt ab', await p.evaluate(() => OJ.App.zustand.log.length === 1));
  await p.evaluate(() => __result('fertig'));
  ok('spätes Ergebnis ignoriert', await p.evaluate(() => OJ.App.zustand.log.length === 1));
  await hoeren(); await sag('weiter');
  ok('weiter ohne zusätzlichen Verlaufseintrag', await p.evaluate(() => OJ.App.zustand.log.length === 1));
  await hoeren(); await sag('nochmal');
  ok('nochmal liest aktuelle Anleitung', (await p.evaluate(() => __gesagt.at(-1))).length > 20);
  await hoeren(); await sag('langsamer');
  ok('langsamer setzt Sprechtempo', await p.evaluate(() => OJ.App.zustand.langsam === true));
  await hoeren(); await sag('wie lange noch');
  ok('Restzeit wird angesagt', (await p.evaluate(() => __gesagt.at(-1))).includes('Arbeit: noch'));
  await hoeren(); await sag('warum');
  ok('warum liest vorhandene Begründungen', (await p.evaluate(() => __gesagt.at(-1))).startsWith('Warum in kleinen Schritten?'));
  const vorZurueck = await ref(); await hoeren(); await sag('zurück');
  ok('zurück wechselt zum vorigen Schritt', await ref() !== vorZurueck);
  await hoeren(); await sag('weiter');
  ok('weiter kommt ohne Abhaken zurück', await ref() === vorZurueck);
  await hoeren(); await sag('stopp');
  ok('stopp schaltet Zuhören aus', await p.getAttribute('#zuhoeren', 'aria-pressed') === 'false');
  await hoeren(); await sag('Pause'); await p.waitForSelector('[data-pausefenster]');
  await p.click('#pause [data-aktion="sprach-an"]'); await sag('fertig');
  ok('Pause schützt vor Abhaken', await p.evaluate(() => OJ.App.zustand.log.length === 1));
  await p.click('#pause [data-aktion="sprach-an"]'); await sag('weiter');
  ok('weiter beendet Pause', await p.evaluate(() => OJ.App.zustand.takt.phase === 'arbeit'));
  await hoeren(); await p.evaluate(() => __rs.at(-1).onerror({ error: 'not-allowed' }));
  ok('Mikrofonfehler verständlich, Zuhören aus', (await p.textContent('#sprachStatus')).includes('Mikrofon nicht erlaubt') && await p.getAttribute('#zuhoeren', 'aria-pressed') === 'false');
  await hoeren(); await p.evaluate(() => window.dispatchEvent(new Event('offline')));
  ok('Offline beendet Aufnahme', await p.evaluate(() => __rs.at(-1).abgebrochen));
  await hoeren(); await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  ok('App-Wechsel beendet Aufnahme', await p.evaluate(() => __rs.at(-1).abgebrochen));
  await p.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }));
  await p.locator('details').last().evaluate(el => el.open = true);
  await p.click('[data-aktion="medien-an"]');
  await p.evaluate(() => __media.nexttrack());
  ok('Medientaste weiter bleibt ohne Abhaken', await p.evaluate(() => OJ.App.zustand.log.length === 1));
  await p.evaluate(() => __media.play()); await p.waitForFunction(() => OJ.App.zustand.log.length === 2);
  ok('Medientaste Play erledigt Schritt', true);
  await p.locator('details').last().evaluate(el => el.open = true);
  await p.click('[data-aktion="medien-aus"]');
  ok('Abmelden entfernt alle Handler', await p.evaluate(() => Object.values(__media).every(v => v === null)));
  await hoeren(); await p.evaluate(() => location.hash = '#/'); await p.waitForSelector('[data-willkommen]');
  ok('Navigation beendet Mikrofon', await p.evaluate(() => __rs.at(-1).abgebrochen));
  await p.reload(); await p.waitForFunction(() => window.OJ_BEREIT);
  ok('Neuladen aktiviert Mikrofon nicht', await p.evaluate(() => __starts === 0));
  await p.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; });
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  await p.evaluate(async () => { if (!await caches.match('./assets/steuerung.js?v=1')) throw Error('Steuerung fehlt im Offline-Vorrat'); });
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.OJ_BEREIT);
  await p.evaluate(() => location.hash = '#/sitzung/1'); await p.waitForSelector('[data-aktion="s-fertig"]');
  await hoeren();
  ok('offline verständliche Rückfallbedienung', (await p.textContent('#sprachStatus')).includes('Nutze die Tasten'));
  await p.click('[data-aktion="s-fertig"]'); await p.waitForFunction(() => OJ.App.zustand.log.length === 3);
  ok('Service Worker: neue Steuerung und Abhaken offline', true);
  await ctx.setOffline(false);
  await hoeren(); await sag('Fleck Rotwein'); await p.waitForSelector('#fleckSuche');
  ok('Fleck Rotwein öffnet passende Karte', await p.inputValue('#fleckSuche') === 'Rotwein' && (await p.textContent('#fleckListe')).includes('Rotwein'));
  const c2 = await browser.newContext(); await c2.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; Object.defineProperty(navigator, 'mediaSession', { value: undefined }); });
  const q = await c2.newPage(); await q.goto(base + '#/sitzung/1'); await q.waitForFunction(() => window.OJ_BEREIT);
  ok('ohne API verständlicher Rückfall', await q.isDisabled('#zuhoeren') && (await q.textContent('#sprachStatus')).includes('Nutze die Tasten'));
  ok('ohne API Fertig weiter verfügbar', await q.isVisible('[data-aktion="s-fertig"]'));
  await q.locator('details').last().evaluate(el => el.open = true); await q.click('[data-aktion="medien-an"]');
  ok('ohne MediaSession Rückfall', (await q.textContent('#medienStatus')).includes('nicht unterstützt'));
  ok('320 px ohne Querlaufen', await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  ok('keine Browserfehler', errors.length === 0);
} catch (e) { console.error('  ✗ ROT: ' + e.stack); process.exitCode = 1; }
finally { if (browser) await browser.close(); srv.close(); }
console.log(`${n} grün`);
