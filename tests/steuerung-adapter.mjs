import assert from 'node:assert/strict';
await import('../assets/steuerung.js');
const S = globalThis.OJ.Steuerung;
let n = 0;
const ok = (name, b) => { assert.ok(b, name); n++; console.log('  ✓ ' + name); };
const gruppen = { fertig: ['fertig', 'abgehakt'], weiter: ['weiter', 'nächster Schritt'], nochmal: ['nochmal', 'wiederholen'], langsamer: ['langsamer'], zurück: ['zurück'], pause: ['Pause', 'Musik'], zeit: ['wie lange noch?'], warum: ['warum'], fleck: ['Fleck Rotwein'], stopp: ['stopp'] };
for (const [k, a] of Object.entries(gruppen)) for (const t of a) ok(t, S.befehl(t) === k);
for (const t of ['nicht fertig', 'weiterarbeiten', 'kein Stopp', '']) ok('ignoriert: ' + t, S.befehl(t) === null);
let r, text, an, timer, starts = 0, aborts = 0, erlaubt = true;
const befehle = [];
class R { constructor() { r = this; } start() { starts++; this.onstart(); } abort() { aborts++; } }
const h = S.zuhoeren({ API: R, erlaubt: () => erlaubt, ausfuehren: k => befehle.push(k), status: (t, a) => { text = t; an = a; }, spaeter: (f, ms) => { assert.equal(ms, 15000); timer = f; return 1; }, abbrechen() { timer = null; } });
const result = (t, final = true) => { const x = [{ transcript: t }]; x.isFinal = final; r.onresult?.({ results: [x], resultIndex: 0 }); };
ok('kein automatischer Start', starts === 0);
h.start(); ok('Start nur de-DE, ein Fenster', r.lang === 'de-DE' && !r.continuous && !r.interimResults && an);
result('fertig', false); ok('Zwischenergebnisse ignoriert', befehle.length === 0);
const alt = r.onresult; result('fertig'); ok('genau ein Befehl und Mikrofon aus', befehle.join() === 'fertig' && !h.aktiv && aborts === 1);
alt({ results: [Object.assign([{ transcript: 'fertig' }], { isFinal: true })] }); ok('veraltetes Ergebnis ignoriert', befehle.length === 1);
h.start(); result('nicht fertig'); ok('unbekannt beendet Fenster verständlich', !an && text.includes('Nicht verstanden') && befehle.length === 1);
for (const [error, wort] of [['not-allowed', 'Mikrofon nicht erlaubt'], ['audio-capture', 'Kein Mikrofon'], ['network', 'Verbindung'], ['no-speech', 'Nichts gehört'], ['service-not-allowed', 'beendet']]) {
 h.start(); r.onerror({ error }); ok('Fehler ' + error, !h.aktiv && text.includes(wort));
}
h.start(); timer(); ok('15-Sekunden-Begrenzung', !h.aktiv && text.includes('Zuhörfenster'));
h.start(); r.onend(); ok('Browser-Ende ohne Wiederholschleife', !h.aktiv);
h.start(); erlaubt = false; result('fertig'); ok('unsichtbar/offline keine Ausführung', befehle.length === 1); h.halt();
h.start(); ok('gesperrter Start ohne Mikrofon', !h.aktiv); erlaubt = true;
const kaputt = S.zuhoeren({ API: class { start() { throw Error(); } abort() {} }, erlaubt: () => true, ausfuehren() {}, status: t => text = t });
kaputt.start(); ok('Startfehler abgefangen', !kaputt.aktiv && text.includes('nicht starten'));
const handlers = {}, calls = [];
const m = S.medien({ setActionHandler(a, f) { if (a === 'pause') throw Error(); handlers[a] = f; } }, k => calls.push(k));
handlers.play(); handlers.nexttrack(); handlers.previoustrack(); handlers.stop();
ok('MediaSession Zuordnung und Teilunterstützung', calls.join() === 'fertig,weiter,nochmal,stopp' && m.gesetzt.length === 4);
m.stopp(); ok('MediaSession aufgeräumt', Object.values(handlers).every(v => v === null));
ok('fehlende API abgefangen', S.medien(null, () => {}).gesetzt.length === 0);
console.log(`${n} grün · 0 ROT`);
