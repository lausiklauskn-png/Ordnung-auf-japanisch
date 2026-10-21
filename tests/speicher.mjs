// Klaus' Wünsche vom 2026-10-21 (Nachmittag): Zurück überall · Sitzung setzt nach Neuladen fort · ⟳ Aktualisieren
// behält den Verlauf · Verlauf mit Entwicklung und Monatskalender · Alles löschen und neu anfangen · Seite der
// 5 Reinigungsmittel · Bild hinter dem Text (gestellt) · bei 320 px überlagert sich nichts.
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
const ctx = await browser.newContext({ viewport: { width: 380, height: 800 }, hasTouch: true, isMobile: true });
await ctx.addInitScript(STIMME);
// zwei Bilder stellen: inhalt.js bekommt sie in die Liste, die Dateien kommen vom runden Teller
await ctx.route('**/assets/inhalt.js*', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()) + "\nwindow.OJ_INHALT.bilder.push('s2.1', 'st2', 'm1');\n" }); });
await ctx.route('**/bilder/*.webp*', r => r.fulfill({ path: path.join(WURZEL, 'icons/seiri-480.webp'), contentType: 'image/webp' }));
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
const bereit = () => page.waitForFunction(() => window.OJ_BEREIT === true);
const geh = async (h, sel) => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForSelector(sel); };
const text = sel => page.textContent(sel);
const ohneUeberlagerung = async (name) => {
  const b = await page.evaluate(() => {
    const zuBreit = [...document.querySelectorAll('#ansicht .karte, #ansicht .knopf, .kopf')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 2).map(e => (e.dataset.wort || e.className).slice(0, 40));
    const schneiden = (a, c) => { const x = a.getBoundingClientRect(), y = c.getBoundingClientRect(); return x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1; };
    const ueber = [...document.querySelectorAll('.wort')].filter(w => schneiden(w.querySelector('.wort-ja'), w.querySelector('.knopf')) || schneiden(w.querySelector('.wort-text'), w.querySelector('.knopf'))).map(w => w.dataset.wort);
    return { zuBreit, ueber, s: document.documentElement.scrollWidth, w: innerWidth };
  });
  ok(name + ': nichts läuft über oder überlagert sich', !b.zuBreit.length && !b.ueber.length && b.s <= b.w, b);
};

try {
  await page.goto(URL0); await bereit();
  await page.evaluate(() => window.OJ.DB.einst('profil', { raeume: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 8: 0, 9: 0 }, wahl: [], takt: { arbeit: 20, pause: 10 } }));
  await page.evaluate(() => sessionStorage.setItem('oj_warn_' + new Date().toDateString(), '[0,1,2,3,4]'));
  await page.reload(); await bereit();

  /* 1 Zurück in der Kopfzeile */
  ok('Start: kein Zurück-Knopf', await page.isHidden('#btnZurueck'));
  await page.click('[data-station="2"]'); await page.waitForSelector('.station-kopf');
  ok('Raum: Zurück-Knopf sichtbar', await page.isVisible('#btnZurueck'));
  await page.click('#btnZurueck'); await page.waitForSelector('[data-weiter]');
  ok('Zurück führt zur Startseite', true);
  await geh('#/flecken', '#fleckSuche'); await geh('#/regeln', '[data-warnkarte]');
  await page.click('#btnZurueck'); await page.waitForSelector('#fleckSuche');
  ok('Zurück aus Regeln führt zu den Flecken (dem vorigen Ort)', true);

  /* 2 Sitzung: Zurück nie gesperrt, vom ersten Schritt in den vorigen Raum; Neuladen setzt fort */
  await geh('#/sitzung/2', '[data-sitzung][data-ref="s2.1"]');
  ok('erster Schritt: „Zurück“ ist nicht gesperrt', !(await page.isDisabled('[data-aktion="s-zurueck"]')));
  await page.click('[data-aktion="s-zurueck"]');
  await page.waitForSelector('[data-sitzung][data-ref="s1.8"]');
  ok('Zurück vom ersten Küchen-Schritt → letzter Schritt im Eingang (1.8)', true);
  ok('Adresse zeigt den Schritt (#/sitzung/1/s1.8)', (await page.evaluate(() => location.hash)) === '#/sitzung/1/s1.8');
  await page.click('[data-aktion="s-weiter"]'); await page.waitForSelector('[data-sitzung][data-phase="ende"]');
  await page.click('[data-sitzung] [data-aktion="s-zurueck"]'); await page.waitForSelector('[data-sitzung][data-ref="s1.8"]');
  ok('Zurück vom Abschluss → letzter Schritt', true);
  await geh('#/sitzung/2/s2.1', '[data-sitzung][data-ref="s2.1"]');
  await page.click('[data-aktion="s-fertig"]'); await page.waitForSelector('[data-sitzung][data-ref="s2.2"]');
  await page.click('#btnZurueck'); await page.waitForSelector('[data-sitzung][data-ref="s2.1"]');
  ok('Kopf-Zurück in der Sitzung = einen Schritt zurück', true);
  await page.click('[data-aktion="s-weiter"]'); await page.waitForSelector('[data-sitzung][data-ref="s2.2"]');
  await page.reload(); await bereit();
  ok('Neuladen mitten in der Sitzung: weiter bei Schritt 2.2', (await page.getAttribute('[data-sitzung]', 'data-ref')) === 's2.2');

  /* 3 Bild hinter dem Text (gestellt), Text bleibt lesbar */
  ok('Bühne 2.2 ohne Bild: keine Bildfläche', (await page.locator('[data-buehne] .kbild').count()) === 0);
  await page.click('[data-aktion="s-zurueck"]'); await page.waitForSelector('[data-sitzung][data-ref="s2.1"]');
  ok('Bühne 2.1 mit Bild: Bildfläche hinter dem Text', (await page.locator('[data-buehne].mit-bild .kbild').count()) === 1);
  const lesbar = await page.evaluate(() => { const h = document.querySelector('[data-buehne] h2'), k = document.querySelector('[data-buehne] .kbild'); return { textUeberBild: getComputedStyle(h).zIndex !== 'auto' || getComputedStyle(h).position === 'relative', grund: getComputedStyle(k, '::after').backgroundImage.includes('gradient') }; });
  ok('Text liegt über dem Bild auf heller Verlaufsfläche', lesbar.textUeberBild && lesbar.grund, lesbar);
  await geh('#/station/2', '.station-kopf');
  ok('Raum Küche: Kopfbild st2', (await page.locator('.station-kopf.mit-bild .kbild').count()) === 1);

  // Die fünf Sonderseiten verwenden ihr zugeordnetes Bild auch im Kopf.
  for (const name of ['gewohnheiten', 'kalender', 'flecken', 'regeln', 'verlauf']) {
    await geh('#/' + name, 'h1');
    const bild = await page.evaluate(id => {
      const kopf = document.querySelector(`[data-seitenbild="${id}"]`);
      const flaeche = kopf && kopf.querySelector('.kbild');
      return !!(kopf && kopf.querySelector('h1') && flaeche && getComputedStyle(flaeche).backgroundImage.includes(id + '.webp'));
    }, 'x-' + name);
    ok('Sonderseite ' + name + ': zugeordnetes Bild hinter der Überschrift', bild);
    await ohneUeberlagerung('Bildkopf ' + name);
  }

  /* 4 Die 5 Reinigungsmittel */
  await geh('#/station/0', '[data-schritt="s0.1"]');
  ok('Schritt heißt „Die 5 Reinigungsmittel“', (await text('[data-schritt="s0.1"] h3')).includes('Die 5 Reinigungsmittel'));
  await page.click('[data-schritt="s0.1"] [data-mittel-link]'); await page.waitForSelector('[data-mittel]');
  ok('Seite „Die 5 Reinigungsmittel“: fünf Karten', (await page.locator('[data-mittel]').count()) === 5);
  ok('Säure/Lauge richtig: Essig und Zitronensäure Säure, die anderen Lauge', (await page.$$eval('.mittel-art', l => l.map(x => x.textContent).join())) === 'Säure,Lauge,Lauge,Lauge,Säure');
  ok('Jede Karte nennt „Nie auf“', (await page.locator('.mittel-liste dt.warn').count()) === 5);
  ok('Essig-Karte mit Bild (gestellt)', (await page.locator('[data-mittel="1"].mit-bild').count()) === 1);
  await page.click('[data-mittel="2"] [data-aktion="mittel-vorlesen"]');
  ok('Vorlesen: Natron … Nie auf …', /^Natron\..*Nie auf: Aluminium/.test(await page.evaluate(() => window.__gesagt.at(-1).text)));
  await page.click('#btnZurueck'); await page.waitForSelector('[data-schritt="s0.1"]');
  ok('Zurück von den Mitteln zum Putzschrank', true);

  /* 5 Verlauf: Entwicklung und Monatskalender */
  await geh('#/station/1', '[data-schritt="s1.1"]');
  await page.click('[data-schritt="s1.1"] [data-aktion="erledigt"]'); await page.waitForSelector('[data-schritt="s1.1"].erledigt-heute');
  await geh('#/verlauf', '[data-fortschritt]');
  ok('Entwicklung: 1 Tag aktiv, 2 Haken, 2/89 Schritte', /1\s*Tage aktiv/.test(await text('[data-fortschritt]')) && /2\s*Haken/.test(await text('[data-fortschritt]')) && (await text('[data-fortschritt]')).includes('2/89'), await text('[data-fortschritt]'));
  const heute = await page.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  ok('Kalender: heute markiert mit 2', (await page.getAttribute(`.kal-tag[data-tag="${heute}"]`, 'class')).includes('an') && (await text(`.kal-tag[data-tag="${heute}"] i`)) === '2');
  await page.click('[data-aktion="v-monat"][aria-label="Voriger Monat"]'); await page.waitForTimeout(150);
  ok('Voriger Monat: keine Haken', (await page.locator('.kal-tag.an').count()) === 0);
  await page.click('[data-aktion="v-monat"][aria-label="Nächster Monat"]'); await page.waitForSelector(`.kal-tag[data-tag="${heute}"]`);
  await page.click(`.kal-tag[data-tag="${heute}"]`); await page.waitForSelector('.kal-tag.gewaehlt');
  ok('Tag angetippt: nur dieser Tag, mit Uhrzeit', (await page.locator('section.tag').count()) === 1 && (await text('section.tag')).includes('Uhr'));
  await ohneUeberlagerung('Verlauf 380 px');
  // Zahlen sind Knöpfe (Klaus: „direkt dahin klicken“)
  await page.click('[data-aktion="v-detail"][data-d="schritte"]'); await page.waitForSelector('[data-detail="schritte"]');
  ok('„Schritte schon gemacht“ öffnet die Liste: Spüle am Abend und Grenze bauen', (await text('[data-detail]')).includes('Spüle am Abend') && (await text('[data-detail]')).includes('Grenze bauen'));
  await page.click('[data-aktion="v-detail"][data-d="raeume"]'); await page.waitForSelector('[data-detail="raeume"]');
  ok('„Räume ganz durch“ zeigt jeden Raum mit Stand (Küche 1/13)', /Küche\s*1\/13/.test(await text('[data-detail]')), await text('[data-detail]'));
  await page.click('[data-detail] a[href="#/station/2"]'); await page.waitForSelector('.station-kopf');
  ok('… ein Tipp auf „Küche“ öffnet den Raum', (await page.evaluate(() => location.hash)) === '#/station/2');
  await page.click('#btnZurueck'); await page.waitForSelector('[data-fortschritt]');
  await page.click('[data-aktion="v-detail"][data-d="tage"]'); await page.waitForSelector('[data-detail="tage"] [data-aktion="v-tag"]');
  await page.click('[data-detail="tage"] [data-aktion="v-tag"]'); await page.waitForSelector('.kal-tag.gewaehlt');
  ok('„Tage aktiv“: ein Tag angetippt → nur dieser Tag im Verlauf', (await page.locator('section.tag').count()) === 1);
  await page.click('[data-aktion="v-detail"][data-d="gewohnheiten"]'); await page.waitForSelector('[data-detail="gewohnheiten"]');
  ok('„Gewohnheiten“ zeigt den Weg zu 習 (1/21)', (await text('[data-detail]')).includes('1/21'));
  await page.click('[data-aktion="v-detail"][data-d="gewohnheiten"]');
  ok('zweiter Tipp klappt die Liste wieder zu', (await page.locator('[data-detail]').count()) === 0);
  await ohneUeberlagerung('Verlauf mit Liste');

  /* 6 Aktualisieren: lädt neu, Verlauf und Stelle bleiben */
  await geh('#/sitzung/3/s3.4', '[data-sitzung][data-ref="s3.4"]');
  await page.evaluate(() => { window.__vorher = 1; });
  await Promise.all([page.waitForNavigation(), page.click('#btnNeu')]);
  await bereit();
  ok('Aktualisieren lädt die App neu (frische Seite)', (await page.evaluate(() => window.__vorher)) === undefined);
  ok('… und steht wieder bei Bad 3.4', (await page.getAttribute('[data-sitzung]', 'data-ref')) === 's3.4');
  ok('… Adresse ohne Hilfsmarke ?neu', !(await page.evaluate(() => location.search)).includes('neu'));
  ok('… Meldung: Aktualisiert, Verlauf ist da (2 Haken)', /Aktualisiert.*2 Haken/.test(await text('#meldung')), await text('#meldung'));

  /* 6b 📲 Installieren: im Browser sichtbar, ohne Angebot → Anleitung, mit Angebot → Dialog, danach weg */
  ok('📲 Installieren steht im Browser in der Kopfzeile', await page.isVisible('#btnInstall'));
  ok('… und schon im HTML (springt nicht nach dem Laden)', !(await (await fetch(URL0 + 'index.html')).text()).match(/id="btnInstall"[^>]*hidden/));
  await page.click('#btnInstall'); await page.waitForSelector('[data-install-anleitung]');
  ok('ohne Angebot des Browsers: Anleitung (Chrome, Samsung, iPhone, Computer)', /Chrome[\s\S]*Samsung[\s\S]*iPhone[\s\S]*Computer/.test(await text('[data-install-anleitung]')));
  await page.evaluate(() => { window.__prompt = 0; const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__prompt++; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
  await page.click('#btnInstall');
  ok('mit Angebot: der Installationsdialog des Browsers wird geöffnet', (await page.evaluate(() => window.__prompt)) === 1);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  ok('nach der Installation verschwindet 📲', await page.isHidden('#btnInstall'));
  await geh('#/info', '[data-speicher]');
  ok('Einstellungen: großer Knopf „Als App installieren“', await page.isVisible('[data-install-gross]'));
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => { const mm = window.matchMedia; window.matchMedia = q => q.includes('display-mode: standalone') ? { matches: true, addEventListener() {}, removeEventListener() {} } : mm.call(window, q); });
  await p2.goto(URL0 + '#/info'); await p2.waitForFunction(() => window.OJ_BEREIT === true);
  ok('als installierte App: kein 📲, nur ⟳', await p2.isHidden('#btnInstall') && await p2.isVisible('#btnNeu') && (await p2.locator('[data-install-gross]').count()) === 0);
  await p2.close();

  /* 7 Wörter: bei 320 px keine Überlagerung */
  await page.setViewportSize({ width: 320, height: 640 });
  for (const [h, sel] of [['#/woerter', '[data-wort]'], ['#/mittel', '[data-mittel]'], ['#/info', '[data-speicher]'], ['#/', '[data-weiter]'], ['#/sitzung/0/s0.1', '[data-sitzung]'], ['#/gewohnheiten', '[data-gewohnheit]']]) {
    await geh(h, sel); await ohneUeberlagerung('320 px ' + h);
    if (h === '#/woerter') ok('Wörter: お疲れ様でした kleiner gesetzt', (await page.getAttribute('[data-wort="otsukare"] .wort-ja', 'class')).includes('lang'));
  }

  /* 7b Was möchtest du heute tun? — tippen und sprechen (gestellte Erkennung) */
  await geh('#/', '[data-frage-form]');
  await page.fill('#frageFeld', 'Ich möchte heute das Bad reinigen');
  await page.click('[data-frage-form] button[type="submit"]');
  await page.waitForSelector('[data-treffer-raum="3"]');
  ok('Tippen: „Bad reinigen“ → Raum Bad mit „Jetzt starten“', (await text('[data-treffer-raum]')).includes('Bad') && await page.isVisible('[data-treffer-start]'));
  ok('… mit Warnkarte, Reinigungsmitteln und Gewohnheiten fürs Bad', await page.isVisible('details.warnkarte') && (await text('[data-treffer-mittel]')).includes('Zitronensäure') && (await text('[data-treffer-gewohnheiten]')).includes('Dusche abziehen'));
  ok('… und sagt es: „Verstanden: Bad …“', (await page.evaluate(() => window.__gesagt.at(-1).text)).startsWith('Verstanden: Bad.'));
  await page.click('[data-treffer-start]'); await page.waitForSelector('[data-sitzung]');
  ok('„Jetzt starten“ beginnt die Sitzung im Bad', (await page.getAttribute('[data-sitzung]', 'data-ref') || '').startsWith('s3.'));
  await geh('#/fragen/' + encodeURIComponent('Rotweinfleck auf der Bluse'), '[data-treffer-flecken]');
  ok('„Rotweinfleck“ → Fleckenkarte Rotwein', (await text('[data-treffer-flecken]')).includes('Rotwein'));
  await geh('#/fragen/' + encodeURIComponent('blabla'), '[data-nicht-verstanden]');
  ok('Unsinn: „nicht verstanden“ mit Beispielen', (await page.locator('[data-nicht-verstanden] a').count()) >= 5);
  await page.addInitScript(() => {
    window.webkitSpeechRecognition = window.SpeechRecognition = class { start() { setTimeout(() => { const r = [{ 0: { transcript: 'Küche putzen' }, isFinal: true, length: 1 }]; this.onresult({ results: r }); this.onend && this.onend(); }, 30); } stop() {} };
  });
  await page.reload(); await bereit(); await geh('#/', '[data-frage-form]');
  await page.click('[data-aktion="hoeren"]');
  await page.waitForSelector('[data-treffer-raum="2"]');
  ok('Sprechen: 🎤 „Küche putzen“ → Raum Küche', true);
  await ohneUeberlagerung('Ergebnis Küche 380 px');

  /* 8 Neu anfangen */
  await page.setViewportSize({ width: 380, height: 800 });
  await geh('#/info', '[data-neu-anfangen]');
  await page.click('[data-aktion="neu-frage"]'); await page.waitForSelector('[data-aktion="neu-ja"]');
  ok('Neu anfangen fragt nach', (await text('[data-neu-anfangen]')).includes('Wirklich alles löschen'));
  await page.click('[data-aktion="neu-nein"]'); await page.waitForSelector('[data-aktion="neu-frage"]');
  ok('„Nein, behalten“ lässt alles stehen', (await text('[data-speicher]')).includes('2 Haken'));
  await page.click('[data-aktion="neu-frage"]'); await page.click('[data-aktion="neu-ja"]');
  await page.waitForSelector('[data-willkommen]');
  ok('Danach: Willkommen mit drei Fragen', true);
  const leer = await page.evaluate(async () => ({ log: (await window.OJ.DB.alle()).length, profil: await window.OJ.DB.einst('profil'), ls: Object.keys(localStorage).filter(k => k.startsWith('oj_')) }));
  ok('Speicher leer: kein Verlauf, kein Profil, keine Uhren', leer.log === 0 && !leer.profil && leer.ls.length === 0, leer);
  await page.reload(); await bereit();
  ok('auch nach Neuladen leer (Willkommen)', await page.isVisible('[data-willkommen]'));

  ok('keine Fehler in der Konsole', fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log('  ✗ ROT: Probe abgebrochen → ' + e.message.split('\n')[0]);
  if (fehler.length) console.log('    Konsole: ' + fehler.join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
