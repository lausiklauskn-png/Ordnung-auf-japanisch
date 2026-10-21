// Die App im echten Browser: Start, Station, Abhaken (bleibt nach Neuladen), Sitzung mit Warnkarte und Vorlesen,
// Kalender-Haken, Flecken-Suche, Verlauf (Löschen), Rückgängig, Handy-Breite ohne Querlaufen, keine Fehler.
// Die Sprachausgabe ist gestellt: jede Ansage landet in window.__gesagt.
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
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', e => fehler.push(String(e)));
page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
const nav = async (n, sel) => { await page.click(`[data-nav="${n}"]`); await page.waitForSelector(sel); };
const bereit = () => page.waitForFunction(() => window.OJ_BEREIT === true);
const breiteOk = async name => {
  const b = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: innerWidth }));
  ok(name + ': kein Querlaufen (' + b.s + ' ≤ ' + b.w + ')', b.s <= b.w, b);
};

try {
  /* 1 Start */
  await page.goto(URL0); await bereit();
  ok('Start: Titel 整理', (await page.textContent('.held-kanji')) === '整理');
  ok('Start: 10 Stationen', (await page.locator('[data-station]').count()) === 10);
  ok('Start: Leitsatz steht da', ((await page.textContent('[data-leitsatz]')) || '').length > 10);
  ok('Start: „Weiter mit“ beginnt beim Putzschrank', /Grundlagen · Die fünf Mittel/.test(await page.textContent('[data-weiter] h2')), await page.textContent('[data-weiter] h2'));
  const monat = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][new Date().getMonth()];
  ok('Start: Karte „Dieser Monat“ nennt ' + monat, (await page.textContent('[data-monat-karte]')).includes(monat));
  await breiteOk('Start 380 px');

  /* 2 Station Küche, Abhaken, Neuladen */
  await page.click('[data-station="2"]');
  await page.waitForSelector('.station-kopf');
  ok('Küche: Kanji 台所', (await page.textContent('.station-kopf .kanji')) === '台所');
  ok('Küche: Warnkarte „Nie mischen“', await page.isVisible('[data-warnkarte]'));
  ok('Küche: 13 Schritte', (await page.locator('[data-schritt]').count()) === 13);
  ok('Einwirkzeit ist hervorgehoben (Backofen)', (await page.textContent('[data-schritt="s2.8"] .zeit')).includes('eine Nacht'));
  ok('Warnung ist rot markiert (Backofen)', (await page.textContent('[data-schritt="s2.8"] .warn')).includes('katalytische'));
  await page.click('[data-schritt="s2.1"] [data-aktion="erledigt"]');
  await page.waitForSelector('[data-schritt="s2.1"].erledigt-heute');
  ok('Abhaken: Karte trägt 済 und „1×“', (await page.textContent('[data-schritt="s2.1"] .zaehler')).startsWith('1×'));
  ok('Abhaken: Meldung mit Rückgängig', await page.isVisible('#meldung [data-aktion="rueckgaengig"]'));
  await page.click('[data-schritt="s2.1"] [data-aktion="vorlesen"]');
  const gesagt1 = await page.evaluate(() => window.__gesagt.at(-1));
  ok('Vorlesen: Spüle am Abend, ausgeschrieben', /^Spüle am Abend\. .*Arbeitszeit 2 Minuten/.test(gesagt1.text) && gesagt1.lang === 'de-DE', gesagt1);
  await page.reload(); await bereit();
  ok('Nach Neuladen: Haken ist noch da', (await page.textContent('[data-schritt="s2.1"] .zaehler')).startsWith('1×'));
  await page.goto(URL0 + '#/'); await bereit();
  ok('Start: Küche zeigt „1 von 13“ und ✓ 1 heute', /1 von 13/.test(await page.textContent('[data-station="2"]')) && /✓ 1/.test(await page.textContent('[data-station="2"]')));
  await breiteOk('Station');

  /* 3 Rückgängig */
  await page.goto(URL0 + '#/station/1'); await page.waitForSelector('[data-schritt="s1.1"]');
  await page.click('[data-schritt="s1.1"] [data-aktion="erledigt"]');
  await page.click('#meldung [data-aktion="rueckgaengig"]');
  await page.waitForFunction(() => document.querySelector('[data-schritt="s1.1"] .zaehler').textContent === 'noch nie');
  ok('Rückgängig nimmt den Haken wieder weg', true);

  /* 4 Sitzung Bad: Warnkarte, Vorlesen mit japanischem Gruß, Fertig, Zurück, Ende */
  await page.evaluate(() => { window.__gesagt = []; location.hash = '#/sitzung/3'; });
  await page.waitForSelector('[data-sitzung][data-phase="warn"]');
  ok('Sitzung Bad beginnt mit der Warnkarte', true);
  await page.waitForFunction(() => window.__gesagt.length > 0);
  ok('Warnkarte wird vorgelesen', /Beachte bitte vorher: Chlorreiniger/.test((await page.evaluate(() => window.__gesagt.at(-1))).text));
  await page.click('[data-aktion="s-warn-ok"]');
  await page.waitForSelector('[data-sitzung][data-phase="schritt"][data-ref="s3.1"]');
  const g2 = await page.evaluate(() => window.__gesagt.slice(-2));
  ok('Erster Schritt: japanischer Gruß, dann deutsche Ansage', g2[0].lang === 'ja-JP' && g2[1].lang === 'de-DE' && g2[1].text.startsWith('Station Bad. Nach jedem Duschen.'), g2);
  await page.click('[data-aktion="s-wiederholen"]');
  ok('„Nochmal“ liest denselben Schritt noch einmal', (await page.evaluate(() => window.__gesagt.at(-1).text)).includes('Nach jedem Duschen'));
  await page.click('[data-aktion="s-fertig"]');
  await page.waitForSelector('[data-sitzung][data-ref="s3.2"]');
  ok('Fertig → nächster Schritt, ohne Stationsansage', (await page.evaluate(() => window.__gesagt.at(-1).text)).startsWith('Duschvorhang.'));
  ok('Fortschritt wächst', (await page.getAttribute('.fortschritt i', 'style')).includes('11.1'));
  await page.click('[data-aktion="s-zurueck"]');
  await page.waitForSelector('[data-sitzung][data-ref="s3.1"]');
  ok('Zurück geht einen Schritt zurück', true);
  ok('Zurück zeigt „1× gemacht“', (await page.textContent('[data-buehne]')).includes('1× gemacht'));
  await breiteOk('Sitzung');
  for (let i = 0; i < 9; i++) await page.click('[data-aktion="s-weiter"]');
  await page.waitForSelector('[data-sitzung][data-phase="ende"]');
  ok('Ende: Stempel 済 und „Bad geschafft“', (await page.textContent('.hanko')) === '済' && (await page.textContent('[data-sitzung] h2')).includes('Bad geschafft'));
  ok('Ende: Weiter zur nächsten Station (Wäsche)', (await page.textContent('[data-sitzung]')).includes('Weiter: Wäsche'));
  await page.goto(URL0 + '#/'); await page.reload(); await bereit();
  await page.evaluate(() => { location.hash = '#/sitzung/3'; }); await page.waitForSelector('[data-sitzung]');
  ok('Warnkarte nur einmal je Besuch', (await page.getAttribute('[data-sitzung]', 'data-phase')) === 'schritt');
  ok('Sitzung springt zum ersten heute offenen Schritt', (await page.getAttribute('[data-sitzung]', 'data-ref')) === 's3.2');
  await page.click('[data-nav="kalender"]');
  ok('Sitzung verlassen stoppt die Stimme', (await page.evaluate(() => window.__gestoppt)) > 0);

  /* 5 Kalender */
  await page.waitForSelector('details.monat.jetzt[open]');
  ok('Kalender: aktueller Monat ist offen', (await page.textContent('details.monat.jetzt .titel')) === monat);
  const erster = page.locator('details.monat.jetzt .haken').first();
  await erster.click();
  await page.waitForSelector('details.monat.jetzt .haken[aria-pressed="true"]');
  ok('Kalender: Haken setzt 済', true);
  ok('Kalender: Zähler 1/…', /^1\//.test(await page.textContent('details.monat.jetzt summary .leise')));
  await page.locator('details.monat.jetzt .haken').first().click();
  await page.waitForFunction(() => document.querySelector('details.monat.jetzt .haken').getAttribute('aria-pressed') === 'false');
  ok('Kalender: zweiter Tipp nimmt den Haken weg', true);
  await page.locator('details.monat.jetzt .haken').first().click();
  await page.waitForSelector('details.monat.jetzt .haken[aria-pressed="true"]');
  ok('Kalender: drei vergessene Stellen stehen da', (await page.textContent('#ansicht')).includes('Siphon'));
  await breiteOk('Kalender');

  /* 6 Flecken */
  await nav('flecken', '#fleckSuche');
  await page.waitForSelector('#fleckSuche');
  ok('Flecken: 35 Karten', (await page.locator('[data-fleck]').count()) === 35);
  await page.fill('#fleckSuche', 'rotwein');
  ok('Flecken: Suche „rotwein“ → 1 Karte', (await page.locator('[data-fleck]').count()) === 1 && (await page.getAttribute('[data-fleck]', 'data-fleck')) === 'Rotwein');
  await page.click('[data-fleck] [data-aktion="fleck-vorlesen"]');
  ok('Flecken: Vorlesen', (await page.evaluate(() => window.__gesagt.at(-1).text)).startsWith('Rotwein.'));
  await page.fill('#fleckSuche', 'xyzzy');
  ok('Flecken: nichts gefunden wird gesagt', (await page.textContent('#fleckListe')).includes('Kein Fleck'));
  await breiteOk('Flecken');

  /* 7 Regeln, Verlauf, Info */
  await nav('regeln', '[data-warnkarte]');
  ok('Regeln: Leitsätze, Nie mischen, Nie worauf, Notruf', await page.evaluate(() => ['Leitsätze', 'Nie mischen', 'Nie worauf', '112'].every(t => document.querySelector('#ansicht').textContent.includes(t))));
  await breiteOk('Regeln');
  await nav('verlauf', '[data-eintrag]');
  const anzahl = await page.locator('[data-eintrag]').count();
  ok('Verlauf: 3 Einträge (Spüle, Bad, Kalender)', anzahl === 3, anzahl);
  ok('Verlauf nennt Station und Schritt', (await page.textContent('#ansicht')).includes('Küche · Spüle am Abend'));
  await page.locator('[data-eintrag] [data-aktion="loeschen"]').first().click();
  await page.waitForFunction(n => document.querySelectorAll('[data-eintrag]').length === n - 1, anzahl);
  ok('Verlauf: Löschen nimmt einen Eintrag weg', true);
  await page.goto(URL0 + '#/info'); await page.waitForSelector('[data-rechte]');
  ok('Info: Copyright und Quellenhinweis', /© 2026/.test(await page.textContent('[data-rechte]')) && /Hauskalender/.test(await page.textContent('[data-rechte]')));
  await breiteOk('Info');

  /* 8 Stumm */
  await page.goto(URL0 + '#/station/0'); await page.waitForSelector('[data-schritt]');
  await page.click('#btnStumm');
  await page.evaluate(() => { window.__gesagt = []; });
  await page.click('[data-schritt="s0.1"] [data-aktion="vorlesen"]');
  ok('Stumm: nichts wird gesprochen', (await page.evaluate(() => window.__gesagt.length)) === 0);
  await page.reload(); await bereit();
  ok('Stumm bleibt nach Neuladen', (await page.getAttribute('#btnStumm', 'aria-pressed')) === 'true');

  /* 9 kleinste Breite, Dunkel */
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(URL0 + '#/'); await bereit();
  await breiteOk('Start 320 px');
  await page.emulateMedia({ colorScheme: 'dark' });
  const farben = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.body).color]);
  ok('Dunkel: dunkler Grund, heller Text', farben[0] !== farben[1] && /rgb\(2[0-9], 1[0-9]/.test(farben[0]), farben);

  ok('keine Fehler in der Konsole', fehler.length === 0, fehler);
} catch (e) {
  rot++; console.log('  ✗ ROT: Probe abgebrochen → ' + e.message.split('\n')[0]);
  if (fehler.length) console.log('    Konsole: ' + fehler.join(' | '));
} finally {
  await browser.close(); srv.close();
}
console.log(`\n${gruen} grün · ${rot} ROT`);
process.exitCode = rot ? 1 : 0;
