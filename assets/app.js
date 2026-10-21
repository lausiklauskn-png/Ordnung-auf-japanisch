/* Ordnung auf Japanisch — die App.
   Ansichten über die Adresse (#/…): Start · Station · Sitzung · Kalender · Flecken · Regeln · Verlauf · Info.
   Inhalt aus assets/inhalt.js (gebaut aus docs/INHALT.md), Speicher assets/db.js, Vorlesen assets/sprechtext.js. */
(function () {
  'use strict';
  const I = window.OJ_INHALT;
  const DB = window.OJ.DB;
  const ST = window.OJ.Sprechtext;
  const $ = s => document.querySelector(s);
  const ansicht = $('#ansicht');

  /* ---------- Hilfen ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ⚠ bis zum Ende rot, ⌛/⏱ mit ihrer Zeit hervorgehoben
  function fmt(text) {
    let s = esc(text);
    s = s.replace(/([⌛⏱])\s*((?:ca\.\s*)?[\d,–\-]+\s*(?:Min\.?|Std\.?|Sek\.?)|eine Nacht|über Nacht)/g, '<span class="zeit">$1 $2</span>');
    s = s.replace(/⚠\s*(.*)$/s, '<span class="warn">⚠ $1</span>');
    return s;
  }
  const heute0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const tagKey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function vorWann(t) {
    if (!t) return 'noch nie';
    const tage = Math.round((heute0() - new Date(t).setHours(0, 0, 0, 0)) / 864e5);
    return tage <= 0 ? 'heute' : tage === 1 ? 'gestern' : `vor ${tage} Tagen`;
  }
  const alleSchritte = I.stationen.flatMap(s => s.schritte.map(x => Object.assign({ station: s.nr }, x)));
  const schrittVon = id => alleSchritte.find(s => s.id === id);
  const kalAufgabe = id => { for (const m of I.kalender) { const a = m.aufgaben.find(x => x.id === id); if (a) return { monat: m, a }; } return null; };
  const MISCH_STATIONEN = [0, 2, 3, 4];                                    // vor diesen Stationen kommt die Warnkarte
  const GEWOHNHEIT_AB = 21;                                               // so oft erledigt = „sitzt“ (習)

  /* ---------- Zustand ---------- */
  const Z = { log: [], stats: new Map(), stumm: false, sitzung: null };
  // Warnkarte einmal je Station und Tag (sessionStorage, damit Neuladen sie nicht wiederholt)
  const WARN_KEY = 'oj_warn_' + new Date().toDateString();
  const warnGelesen = {
    has(nr) { try { return (JSON.parse(sessionStorage.getItem(WARN_KEY)) || []).includes(nr); } catch (_) { return false; } },
    add(nr) { try { const a = JSON.parse(sessionStorage.getItem(WARN_KEY)) || []; a.push(nr); sessionStorage.setItem(WARN_KEY, JSON.stringify(a)); } catch (_) {} },
  };
  function rechnen() {
    Z.stats = new Map();
    for (const e of Z.log) {
      const k = e.ref; const s = Z.stats.get(k) || { n: 0, zuletzt: 0, heute: false, jahr: new Set() };
      s.n++; s.zuletzt = Math.max(s.zuletzt, e.zeit); if (e.zeit >= heute0()) s.heute = true;
      s.jahr.add(new Date(e.zeit).getFullYear());
      Z.stats.set(k, s);
    }
  }
  const st = ref => Z.stats.get(ref) || { n: 0, zuletzt: 0, heute: false, jahr: new Set() };

  /* ---------- Vorlesen ---------- */
  const Stimme = {
    de: null, ja: null,
    laden() {
      if (!('speechSynthesis' in window)) return;
      const v = speechSynthesis.getVoices();
      Stimme.de = v.find(x => /^de(-|_)DE/i.test(x.lang) && /google|natural|neural/i.test(x.name)) || v.find(x => /^de/i.test(x.lang)) || null;
      Stimme.ja = v.find(x => /^ja/i.test(x.lang)) || null;
    },
    sprechen(text, opt = {}) {
      if (Z.stumm || !('speechSynthesis' in window) || !text) { opt.fertig && opt.fertig(); return; }
      speechSynthesis.cancel();
      const teile = [];
      if (opt.gruss && Stimme.ja) teile.push(Object.assign(new SpeechSynthesisUtterance(opt.gruss), { lang: 'ja-JP', voice: Stimme.ja, rate: .9 }));
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE'; if (Stimme.de) u.voice = Stimme.de; u.rate = .92; u.pitch = 1;
      teile.push(u);
      u.onstart = () => opt.start && opt.start();
      u.onend = u.onerror = () => opt.fertig && opt.fertig();
      teile.forEach(t => speechSynthesis.speak(t));
    },
    stopp() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
  };
  if ('speechSynthesis' in window) { Stimme.laden(); speechSynthesis.onvoiceschanged = Stimme.laden; }

  /* ---------- Bausteine ---------- */
  function enso(anteil, kanji, gross) {
    const r = 32, u = 2 * Math.PI * r, rest = u * (1 - Math.min(1, anteil)) + (anteil >= 1 ? 0 : 6);
    return `<svg class="enso${anteil >= 1 ? ' voll' : ''}" viewBox="0 0 80 80" aria-hidden="true"${gross ? ' style="width:100%;height:100%"' : ''}>
      <circle class="grund" cx="40" cy="40" r="${r}"/>
      <circle class="strich" cx="40" cy="40" r="${r}" stroke-dasharray="${u.toFixed(1)}" stroke-dashoffset="${rest.toFixed(1)}" transform="rotate(-100 40 40)"/>
      ${kanji ? `<text x="40" y="50" text-anchor="middle" lang="ja">${esc(kanji)}</text>` : ''}</svg>`;
  }
  function stationStand(s) {
    const n = s.schritte.length, je = s.schritte.filter(x => st(x.id).n > 0).length, heute = s.schritte.filter(x => st(x.id).heute).length;
    return { n, je, heute, anteil: n ? je / n : 0 };
  }
  // der nächste sinnvolle Schritt: zuerst nie Erledigtes in Reihenfolge, sonst das am längsten nicht Erledigte
  function naechster() {
    const nie = alleSchritte.find(s => !st(s.id).n);
    if (nie) return nie;
    return alleSchritte.slice().sort((a, b) => st(a.id).zuletzt - st(b.id).zuletzt)[0];
  }
  function warnkarte(zu) {
    return `<section class="karte warnkarte" data-warnkarte>
      <h2>Nie mischen</h2>
      <ul>${I.nieMischen.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>
      ${zu ? '' : `<div class="knopfreihe"><button class="knopf klein" data-aktion="vorlesen-warn">🔊 Vorlesen</button></div>`}
    </section>`;
  }
  function schrittKarte(s) {
    const x = st(s.id);
    return `<article class="karte schritt${x.heute ? ' erledigt-heute' : ''}" data-schritt="${s.id}">
      <h3><span class="nr">${esc(s.nr)}</span>${esc(s.titel)}${x.n >= GEWOHNHEIT_AB ? '<span class="gewohnheit" lang="ja" title="Gewohnheit sitzt">習</span>' : ''}</h3>
      <p>${fmt(s.text)}</p>
      <div class="fuss">
        <span class="zaehler">${x.n ? `${x.n}× · zuletzt ${vorWann(x.zuletzt)}` : 'noch nie'}</span>
        <span class="knopfreihe">
          <button class="knopf klein" data-aktion="vorlesen" data-ref="${s.id}" aria-label="Vorlesen: ${esc(s.titel)}">🔊</button>
          <button class="knopf klein tusche" data-aktion="erledigt" data-ref="${s.id}">✓ Erledigt</button>
        </span>
      </div>
    </article>`;
  }

  /* ---------- Ansichten ---------- */
  const ANSICHTEN = {
    start() {
      const n = naechster(), stn = I.stationen[n.station];
      const tag = Math.floor(Date.now() / 864e5);
      const satz = I.leitsaetze[tag % I.leitsaetze.length];
      const m = I.kalender[new Date().getMonth()], jahr = new Date().getFullYear();
      const mFertig = m.aufgaben.filter(a => st(a.id).jahr.has(jahr)).length;
      const heute = Z.log.filter(e => e.zeit >= heute0()).length;
      return `
      <section class="held">
        <div class="held-enso">${enso(.94)}</div>
        <div class="held-kanji" lang="ja">整理</div>
        <div class="held-sub">Ordnung auf Japanisch</div>
        <p class="leitsatz" data-leitsatz>${esc(satz)}</p>
      </section>
      <section class="karte weiter" data-weiter>
        <div class="wo">${heute ? `Heute ${heute} erledigt · ` : ''}Weiter mit</div>
        <h2>${esc(stn.titel)} · ${esc(n.titel)}</h2>
        <div class="knopfreihe">
          <a class="knopf haupt" href="#/sitzung/${stn.nr}/${encodeURIComponent(n.id)}">▶ Beginnen</a>
          <a class="knopf" href="#/station/${stn.nr}">Station ansehen</a>
        </div>
      </section>
      <a class="karte" href="#/kalender" style="display:block;text-decoration:none" data-monat-karte>
        <div class="wo leise klein">Dieser Monat · ${mFertig} von ${m.aufgaben.length}</div>
        <h2>${esc(m.name)} — ${esc(m.motto)}</h2>
      </a>
      <h2 style="margin:22px 4px 6px;font-size:1.05rem" class="leise">Die Wohnung, Raum für Raum</h2>
      <div class="stationen">
        ${I.stationen.map(s => { const x = stationStand(s); return `
          <a class="station-kachel" href="#/station/${s.nr}" data-station="${s.nr}">
            ${x.heute ? `<span class="heute">✓ ${x.heute}</span>` : ''}
            ${enso(x.anteil, s.kanji)}
            <span class="name">${esc(s.titel)}</span>
            <span class="stand">${x.je} von ${x.n}</span>
          </a>`; }).join('')}
      </div>
      <p class="leise" style="text-align:center;margin-top:26px"><a href="#/info">Über die App · Rechte</a></p>`;
    },

    station(nr) {
      const s = I.stationen[+nr]; if (!s) return ANSICHTEN.start();
      const x = stationStand(s);
      return `
      <a class="zurueck" href="#/">← Übersicht</a>
      <div class="station-kopf">
        <div class="kanji" lang="ja">${esc(s.kanji)}</div>
        <div><h1>${esc(s.titel)}</h1><div class="lesung"><span lang="ja-Latn">${esc(s.lesung)}</span>${s.zusatz ? ' · ' + esc(s.zusatz) : ''} · ${x.je} von ${x.n} schon einmal gemacht</div></div>
      </div>
      <div class="knopfreihe"><a class="knopf haupt" href="#/sitzung/${s.nr}" data-start-sitzung>▶ Station Schritt für Schritt</a></div>
      ${s.einleitung ? `<p class="leise">${esc(s.einleitung)}</p>` : ''}
      ${MISCH_STATIONEN.includes(s.nr) ? warnkarte() : ''}
      ${s.schritte.map(schrittKarte).join('')}`;
    },

    sitzung(nr, startId) {
      const s = I.stationen[+nr]; if (!s) return ANSICHTEN.start();
      let i = startId ? s.schritte.findIndex(x => x.id === startId) : s.schritte.findIndex(x => !st(x.id).heute);
      if (i < 0) i = 0;
      const warn = MISCH_STATIONEN.includes(s.nr) && !warnGelesen.has(s.nr);
      Z.sitzung = { nr: s.nr, i: warn ? -1 : i, erledigt: 0, start: i };
      return sitzungHtml();
    },

    kalender() {
      const jetzt = new Date().getMonth(), jahr = new Date().getFullYear();
      return `
      <h1 style="font-size:1.45rem;margin:4px 0 4px"><span lang="ja">暦</span> Jahreskalender ${jahr}</h1>
      <p class="leise">${esc(I.kalenderEinleitung)}</p>
      ${I.kalender.map((m, i) => {
        const fertig = m.aufgaben.filter(a => st(a.id).jahr.has(jahr)).length;
        return `<details class="karte monat${i === jetzt ? ' jetzt' : ''}" data-monat="${m.monat}"${i === jetzt ? ' open' : ''}>
          <summary><span><span class="titel">${esc(m.name)}</span><br><span class="motto">${esc(m.motto)}</span></span><span class="leise">${fertig}/${m.aufgaben.length}</span></summary>
          <ul class="aufgaben">${m.aufgaben.map(a => { const f = st(a.id).jahr.has(jahr); return `
            <li class="${f ? 'fertig' : ''}"><button class="haken" data-aktion="kal" data-ref="${a.id}" aria-pressed="${f}" aria-label="${f ? 'Erledigt' : 'Abhaken'}"></button><span class="t">${fmt(a.text)}</span></li>`; }).join('')}</ul>
        </details>`; }).join('')}
      <section class="karte"><h2>Die drei vergessenen Stellen</h2>
        <table class="tabelle"><tbody>${I.vergessen.map(v => `<tr><th scope="row">${esc(v.stelle)}</th><td>${fmt(v.was)}</td></tr>`).join('')}</tbody></table></section>
      <section class="karte"><h2>Im Takt</h2>
        <table class="tabelle"><tbody>${I.takt.map(t => `<tr><th scope="row">${esc(t.wann)}</th><td>${t.was.map(esc).join(' · ')}</td></tr>`).join('')}</tbody></table></section>`;
    },

    flecken(q) {
      return `
      <h1 style="font-size:1.45rem;margin:4px 0 4px"><span lang="ja">染</span> Fleckenkarten</h1>
      <p class="leise">${esc(I.fleckenRegeln)}</p>
      <input class="suche" type="search" id="fleckSuche" placeholder="Fleck suchen, z. B. Rotwein" value="${esc(q || '')}" autocomplete="off" aria-label="Fleck suchen">
      <div class="flecken" id="fleckListe">${fleckenListe(q)}</div>`;
    },

    regeln() {
      return `
      <h1 style="font-size:1.45rem;margin:4px 0 10px"><span lang="ja">規</span> Regeln</h1>
      <section class="karte"><h2>Leitsätze</h2><ul>${I.leitsaetze.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>
      ${warnkarte()}
      <section class="karte warnkarte"><h2>Nie worauf</h2><ul>${I.nieWorauf.map(t => `<li>${fmt(t)}</li>`).join('')}</ul></section>
      <section class="karte"><h2>Wenn es passiert ist</h2><p>Sofort raus, Tür zu, nicht zurück. Bei Husten, Atemnot oder brennenden Augen <a href="tel:112"><b>112</b></a> rufen und beide Mittel nennen. Giftnotruf: Vorwahl des Bundeslands und 19240.</p></section>
      <section class="karte"><h2>Pausen-Brücke: Einwirkzeiten</h2>
        <table class="tabelle"><thead><tr><th>Was</th><th>Zeit</th><th>In der Zeit</th></tr></thead><tbody>${I.pausen.map(p => `<tr><td>${esc(p.was)}</td><td>${esc(p.dauer)}</td><td>${esc(p.inDerZeit)}</td></tr>`).join('')}</tbody></table></section>`;
    },

    verlauf() {
      if (!Z.log.length) return `<h1 style="font-size:1.45rem"><span lang="ja">歴</span> Verlauf</h1><p class="leer">Noch nichts erledigt. Jeder Haken landet hier, Tag für Tag.</p>`;
      const tage = new Map();
      Z.log.slice().sort((a, b) => b.zeit - a.zeit).forEach(e => { const k = tagKey(e.zeit); (tage.get(k) || tage.set(k, []).get(k)).push(e); });
      const titel = e => { if (e.art === 'kalender') { const k = kalAufgabe(e.ref); return k ? `${k.monat.name}: ${k.a.text.split('(')[0].trim()}` : e.ref; } const s = schrittVon(e.ref); return s ? `${I.stationen[s.station].titel} · ${s.titel}` : e.ref; };
      return `<h1 style="font-size:1.45rem;margin:4px 0"><span lang="ja">歴</span> Verlauf</h1>
        <p class="leise">${Z.log.length} Haken insgesamt${DB.dauerhaft() ? '' : ' · ⚠ nur bis zum Schließen gespeichert (privates Fenster?)'}</p>
        ${[...tage].map(([k, es]) => `<section class="tag"><h2>${new Date(k + 'T12:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · ${es.length}</h2>
          ${es.map(e => `<div class="karte eintrag" data-eintrag="${e.id}"><span>${esc(titel(e))}<br><span class="wann">${new Date(e.zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span></span><button data-aktion="loeschen" data-id="${e.id}" aria-label="Eintrag löschen">✕</button></div>`).join('')}
        </section>`).join('')}`;
    },

    info() {
      return `<a class="zurueck" href="#/">← Übersicht</a>
      <h1 style="font-size:1.45rem;margin:4px 0 10px">Über die App</h1>
      <section class="karte"><p><b lang="ja">整理</b> (seiri) heißt „Ordnung schaffen“. Die App führt Raum für Raum durch die Wohnung, liest jeden Schritt vor und zählt mit, bis aus dem Handgriff eine Gewohnheit wird.</p>
        <p class="leise klein">Alles bleibt auf diesem Gerät. Nichts geht ins Netz. Speicher: ${DB.dauerhaft() ? 'dauerhaft (IndexedDB)' : 'nur bis zum Schließen'}.</p></section>
      <section class="karte" data-rechte><h2>Rechte und Quellen</h2>
        <p>© 2026 Klaus — App, Gestaltung und Texte der Ansagen.</p>
        <p class="klein">Die Tipps (Mengen, Zeiten, Reihenfolgen, Warnungen) stammen sinngemäß aus fünf Begleitheften zu einem Haushaltsbuch: „Das Heft der Mengen“, „Die zwei Häuser“, „Fünfzig Rezepte für das Haus“, „Das Wäsche-Heft“, „Der Hauskalender“. Übernommen sind nur Fakten, neu formuliert; Text, Gestaltung und Erzählfigur der Hefte nicht. Die Rechte an den Heften liegen bei ihren Urhebern.</p>
        <p class="klein leise">Die Hinweise ersetzen keine fachliche, ärztliche oder rechtliche Beratung. Im Notfall 112.</p></section>`;
    },
  };

  function fleckenListe(q) {
    const n = (q || '').trim().toLowerCase();
    const treffer = I.flecken.filter(f => !n || (f.name + ' ' + f.mittel + ' ' + f.griff).toLowerCase().includes(n));
    if (!treffer.length) return `<p class="leer">Kein Fleck passt zu „${esc(q)}“.</p>`;
    return treffer.map((f, i) => `<article class="karte fleck" data-fleck="${esc(f.name)}"><h3>${esc(f.name)}<button class="knopf klein" data-aktion="fleck-vorlesen" data-i="${I.flecken.indexOf(f)}" aria-label="Vorlesen: ${esc(f.name)}">🔊</button></h3>
      <div class="mittel">${esc(f.mittel)}</div>${f.griff ? `<p>${fmt(f.griff)}</p>` : ''}</article>`).join('');
  }

  /* ---------- Sitzung: ein Schritt nach dem anderen ---------- */
  function sitzungHtml() {
    const z = Z.sitzung, s = I.stationen[z.nr];
    const gesamt = s.schritte.length;
    if (z.i === -1) {
      return `<div class="sitzung" data-sitzung data-phase="warn">
        <div class="wo"><span>${esc(s.titel)}</span><span>Vorab</span></div>
        <section class="karte buehne warnkarte" data-buehne><h2>Beachte bitte vorher</h2><ul>${I.nieMischen.slice(0, 4).map(t => `<li>${fmt(t)}</li>`).join('')}</ul>
          <p class="klein leise">Zwei Mittel auf derselben Fläche: erst ganz abspülen, lüften, neues Tuch.</p></section>
        <div class="steuer">
          <button class="knopf" data-aktion="s-wiederholen">↺ Nochmal</button>
          <a class="knopf" href="#/station/${s.nr}">✕ Ende</a>
          <button class="knopf" data-aktion="s-stopp">⏹ Still</button>
          <button class="knopf haupt fertig" data-aktion="s-warn-ok">Verstanden · Los geht’s</button>
        </div></div>`;
    }
    if (z.i >= gesamt) {
      return `<div class="sitzung abschluss" data-sitzung data-phase="ende">
        <div class="hanko" lang="ja">済</div>
        <h2>${esc(s.titel)} geschafft</h2>
        <p class="leise">${z.erledigt} Schritt${z.erledigt === 1 ? '' : 'e'} erledigt. Otsukaresama deshita.</p>
        <div class="knopfreihe" style="justify-content:center;margin-top:16px">
          <a class="knopf haupt" href="#/">Zur Übersicht</a>
          ${I.stationen[s.nr + 1] ? `<a class="knopf" href="#/sitzung/${s.nr + 1}">Weiter: ${esc(I.stationen[s.nr + 1].titel)}</a>` : ''}
        </div></div>`;
    }
    const x = s.schritte[z.i], stx = st(x.id);
    return `<div class="sitzung" data-sitzung data-phase="schritt" data-ref="${x.id}">
      <div class="fortschritt"><i style="width:${(z.i / gesamt * 100).toFixed(1)}%"></i></div>
      <div class="wo"><span><span lang="ja">${esc(s.kanji)}</span> ${esc(s.titel)}</span><span>Schritt ${z.i + 1} von ${gesamt}</span></div>
      <section class="karte buehne" data-buehne>
        <h2>${esc(x.titel)}</h2>
        <p>${fmt(x.text)}</p>
        <div class="leise klein">${stx.n ? `${stx.n}× gemacht · zuletzt ${vorWann(stx.zuletzt)}` : 'Zum ersten Mal'}${stx.n >= GEWOHNHEIT_AB ? ' · <span class="gewohnheit" lang="ja">習</span> Gewohnheit' : ''}</div>
      </section>
      <div class="steuer">
        <button class="knopf" data-aktion="s-zurueck"${z.i === 0 ? ' disabled' : ''}>← Zurück</button>
        <button class="knopf" data-aktion="s-wiederholen">↺ Nochmal</button>
        <button class="knopf" data-aktion="s-weiter">Weiter →</button>
        <button class="knopf haupt fertig" data-aktion="s-fertig">✓ Fertig</button>
      </div>
      <div class="knopfreihe" style="justify-content:space-between"><a class="zurueck" href="#/station/${s.nr}">✕ Sitzung beenden</a><button class="knopf klein" data-aktion="s-stopp">⏹ Still</button></div>
    </div>`;
  }
  function sitzungVorlesen() {
    const z = Z.sitzung; if (!z) return;
    const s = I.stationen[z.nr], b = $('[data-buehne]');
    let text, gruss;
    if (z.i === -1) text = `Station ${s.titel}. Beachte bitte vorher: ` + I.nieMischen.slice(0, 4).map(ST.sprechtext).join(' ');
    else if (z.i >= s.schritte.length) { text = `${s.titel} geschafft.`; gruss = 'おつかれさまでした'; }
    else { text = (z.i === z.start ? `Station ${s.titel}. ` : '') + ST.ansage(s.schritte[z.i]); if (z.i === z.start) gruss = 'はじめましょう'; }
    Stimme.sprechen(text, { gruss, start: () => b && b.classList.add('spricht'), fertig: () => { const bb = $('[data-buehne]'); bb && bb.classList.remove('spricht'); } });
  }
  function sitzungZeigen(vorlesen = true) {
    ansicht.innerHTML = sitzungHtml();
    ansicht.classList.remove('tinte'); void ansicht.offsetWidth; ansicht.classList.add('tinte');
    if (vorlesen) sitzungVorlesen();
  }

  /* ---------- Handlungen ---------- */
  function blatt(anzahl = 1) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = $('#blaetter');
    for (let i = 0; i < anzahl; i++) {
      const b = document.createElement('i'); b.className = 'blatt';
      b.style.left = (10 + Math.random() * 80) + 'vw';
      b.style.setProperty('--wind', (Math.random() * 120 - 40).toFixed(0) + 'px');
      b.style.setProperty('--dauer', (3 + Math.random() * 2).toFixed(1) + 's');
      b.style.animationDelay = (i * .25) + 's';
      box.appendChild(b); setTimeout(() => b.remove(), 6500);
    }
  }
  let meldungUhr = null;
  function melden(text, rueck) {
    const m = $('#meldung');
    m.innerHTML = `<span>${esc(text)}</span>${rueck ? '<button data-aktion="rueckgaengig">Rückgängig</button>' : ''}`;
    m.hidden = false; m._rueck = rueck || null;
    clearTimeout(meldungUhr); meldungUhr = setTimeout(() => { m.hidden = true; m._rueck = null; }, rueck ? 6000 : 2600);
  }
  async function erledigen(art, ref) {
    const e = await DB.eintragen(art, ref);
    Z.log.push(e); rechnen(); blatt(Z.stats.get(ref).n % 7 === 0 ? 6 : 1);
    const n = Z.stats.get(ref).n;
    melden(n === GEWOHNHEIT_AB ? '習 Gewohnheit sitzt — ' + n + '×' : `Erledigt · ${n}×`, async () => { await DB.loeschen(e.id); Z.log = Z.log.filter(x => x.id !== e.id); rechnen(); zeichnen(false); });
    if (navigator.vibrate) try { navigator.vibrate(18); } catch (_) {}
    return e;
  }
  async function kalUmschalten(ref) {
    const jahr = new Date().getFullYear();
    const vorhanden = Z.log.filter(e => e.ref === ref && new Date(e.zeit).getFullYear() === jahr);
    if (vorhanden.length) {                                               // Haken weg: die Einträge dieses Jahres löschen
      for (const e of vorhanden) await DB.loeschen(e.id);
      Z.log = Z.log.filter(e => !vorhanden.includes(e)); rechnen();
    } else await erledigen('kalender', ref);
    zeichnen(false);
  }

  document.addEventListener('click', async ev => {
    const k = ev.target.closest('[data-aktion]'); if (!k) return;
    const a = k.dataset.aktion, ref = k.dataset.ref;
    if (a === 'vorlesen') { const s = schrittVon(ref); Stimme.sprechen(ST.ansage(s)); }
    else if (a === 'vorlesen-warn') Stimme.sprechen('Nie mischen. ' + I.nieMischen.map(ST.sprechtext).join(' '));
    else if (a === 'fleck-vorlesen') { const f = I.flecken[+k.dataset.i]; Stimme.sprechen(ST.sprechtext(`${f.name}. ${f.mittel}. ${f.griff}`)); }
    else if (a === 'erledigt') {
      await erledigen('schritt', ref);
      const karte = k.closest('[data-schritt]'); if (karte) karte.outerHTML = schrittKarte(schrittVon(ref));
    }
    else if (a === 'kal') await kalUmschalten(ref);
    else if (a === 'loeschen') { const id = +k.dataset.id; await DB.loeschen(id); Z.log = Z.log.filter(e => e.id !== id); rechnen(); zeichnen(false); }
    else if (a === 'rueckgaengig') { const m = $('#meldung'); const f = m._rueck; m.hidden = true; m._rueck = null; f && f(); }
    else if (a === 'stumm') { Z.stumm = !Z.stumm; k.setAttribute('aria-pressed', Z.stumm); k.textContent = Z.stumm ? '🔇' : '🔊'; if (Z.stumm) Stimme.stopp(); DB.einst('stumm', Z.stumm); }
    else if (Z.sitzung) {
      const z = Z.sitzung, gesamt = I.stationen[z.nr].schritte.length;
      if (a === 's-wiederholen') sitzungVorlesen();
      else if (a === 's-stopp') Stimme.stopp();
      else if (a === 's-warn-ok') { warnGelesen.add(z.nr); z.i = z.start; sitzungZeigen(); }
      else if (a === 's-zurueck' && z.i > 0) { z.i--; sitzungZeigen(); }
      else if (a === 's-weiter') { z.i = Math.min(gesamt, z.i + 1); sitzungZeigen(); }
      else if (a === 's-fertig') { await erledigen('schritt', I.stationen[z.nr].schritte[z.i].id); z.erledigt++; z.i++; sitzungZeigen(); }
    }
  });
  document.addEventListener('input', ev => {
    if (ev.target.id === 'fleckSuche') $('#fleckListe').innerHTML = fleckenListe(ev.target.value);
  });

  /* ---------- Weg durch die Ansichten ---------- */
  function zeichnen(animiert = true) {
    const teile = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    const name = teile[0] || 'start';
    if (name !== 'sitzung') { Z.sitzung = null; Stimme.stopp(); }
    const f = ANSICHTEN[name] || ANSICHTEN.start;
    const y = animiert ? 0 : scrollY;
    ansicht.innerHTML = f(...teile.slice(1));
    document.querySelectorAll('[data-nav]').forEach(n => n.toggleAttribute('aria-current', false));
    const nav = document.querySelector(`[data-nav="${name === 'station' || name === 'sitzung' || name === 'info' ? 'start' : name}"]`);
    if (nav) nav.setAttribute('aria-current', 'page');
    if (animiert) { ansicht.classList.remove('tinte'); void ansicht.offsetWidth; ansicht.classList.add('tinte'); scrollTo(0, 0); }
    else scrollTo(0, y);
    if (name === 'sitzung' && animiert) sitzungVorlesen();
    if (name === 'kalender' && animiert) { const j = $('details.monat.jetzt'); if (j) scrollTo(0, j.getBoundingClientRect().top + scrollY - 70); }
  }
  window.addEventListener('hashchange', () => zeichnen(true));

  /* ---------- Start ---------- */
  (async function los() {
    Z.log = await DB.alle(); rechnen();
    Z.stumm = !!(await DB.einst('stumm'));
    const b = $('#btnStumm'); b.setAttribute('aria-pressed', Z.stumm); b.textContent = Z.stumm ? '🔇' : '🔊';
    zeichnen(true);
    window.OJ_BEREIT = true;
  })();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.OJ.App = { stimme: Stimme, zustand: Z };
})();
