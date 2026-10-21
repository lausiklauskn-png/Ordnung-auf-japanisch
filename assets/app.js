/* Ordnung auf Japanisch — die App.
   Ansichten über die Adresse (#/…): Start · Station · Sitzung · Kalender · Flecken · Regeln · Verlauf · Info.
   Inhalt aus assets/inhalt.js (gebaut aus docs/INHALT.md), Speicher assets/db.js, Vorlesen assets/sprechtext.js. */
(function () {
  'use strict';
  const I = window.OJ_INHALT;
  const DB = window.OJ.DB;
  const ST = window.OJ.Sprechtext;
  const J = window.OJ.Japanisch;
  const K = window.OJ.Klang;
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

  /* ---------- Profil: welche Räume, welche Reihenfolge, welcher Takt ---------- */
  // Räume, nach denen gefragt wird (Putzschrank und Böden gibt es in jeder Wohnung)
  const RAUM_FRAGEN = [
    { nr: 1, name: 'Eingang / Flur', max: 2, vor: 1 },
    { nr: 2, name: 'Küche', max: 2, vor: 1 },
    { nr: 3, name: 'Bad / WC', max: 4, vor: 1 },
    { nr: 5, name: 'Schlafzimmer', max: 6, vor: 1 },
    { nr: 6, name: 'Wohn- / Arbeitszimmer', max: 4, vor: 1 },
    { nr: 4, name: 'Wäsche (Waschmaschine)', max: 1, vor: 1 },
    { nr: 8, name: 'Keller / Abstellraum', max: 3, vor: 0 },
    { nr: 9, name: 'Balkon / Garten', max: 2, vor: 0 },
  ];
  const IMMER = [0, 7];
  const TAKT_ARBEIT = [10, 15, 20, 25], TAKT_PAUSE = [5, 10, 15];
  const STANDARD = { raeume: Object.fromEntries(RAUM_FRAGEN.map(r => [r.nr, r.vor])), wahl: [], takt: { arbeit: 20, pause: 10 } };
  const profil = () => Z.profil || STANDARD;
  const anzahl = nr => IMMER.includes(nr) ? 1 : (profil().raeume[nr] || 0);
  // gewählte Räume zuerst (in der Reihenfolge des Antippens), dann alle übrigen vorhandenen in Wohnungs-Reihenfolge
  function reihenfolge(p = profil()) {
    const da = nr => IMMER.includes(nr) || (p.raeume[nr] || 0) > 0;
    const wahl = (p.wahl || []).filter(da);
    return wahl.concat(I.stationen.map(s => s.nr).filter(nr => da(nr) && !wahl.includes(nr)));
  }
  const raeumeZahl = (p = profil()) => Object.values(p.raeume).reduce((a, b) => a + b, 0);

  /* ---------- Vorlesen ---------- */
  const Stimme = {
    de: null, ja: null,
    laden() {
      if (!('speechSynthesis' in window)) return;
      const v = speechSynthesis.getVoices();
      Stimme.de = v.find(x => /^de(-|_)DE/i.test(x.lang) && /google|natural|neural/i.test(x.name)) || v.find(x => /^de/i.test(x.lang)) || null;
      Stimme.ja = v.find(x => /^ja/i.test(x.lang)) || null;
    },
    // ein japanisches Wort: mit japanischer Stimme in Kana, sonst die Lautschrift mit der deutschen Stimme
    wort(k) { const w = J.wort(k) || J.fuerStation(k); if (!w) return null; return Stimme.ja ? { text: w.kana, ja: true } : { text: J.lautFuerStimme(w) }; },
    // teile: Text (deutsch) oder {text, ja}; nacheinander gesprochen
    folge(teile, opt = {}) {
      teile = teile.filter(t => t && (t.text || typeof t === 'string'));
      if (Z.stumm || !('speechSynthesis' in window) || !teile.length) { opt.fertig && opt.fertig(); return; }
      speechSynthesis.cancel();
      const us = teile.map(t => {
        const ja = typeof t === 'object' && t.ja, u = new SpeechSynthesisUtterance(typeof t === 'string' ? t : t.text);
        u.lang = ja ? 'ja-JP' : 'de-DE'; const v = ja ? Stimme.ja : Stimme.de; if (v) u.voice = v; u.rate = ja ? .85 : .92; u.pitch = 1;
        return u;
      });
      us[0].onstart = () => { K.ducken(true); opt.start && opt.start(); };
      const letzte = us[us.length - 1]; letzte.onend = letzte.onerror = () => { K.ducken(false); opt.fertig && opt.fertig(); };
      us.forEach(u => speechSynthesis.speak(u));
    },
    sprechen(text, opt = {}) { Stimme.folge([text], opt); },
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
    const meine = reihenfolge().flatMap(nr => alleSchritte.filter(s => s.station === nr));
    const nie = meine.find(s => !st(s.id).n);
    if (nie) return nie;
    return meine.slice().sort((a, b) => st(a.id).zuletzt - st(b.id).zuletzt)[0];
  }
  const naechsteStation = nr => { const r = reihenfolge(); const i = r.indexOf(nr); return i >= 0 && i < r.length - 1 ? I.stationen[r[i + 1]] : null; };
  // Aussprache-Zeile: 玄関 · genkan · sprich gen-kan 🔊
  function aussprache(w, mitDe) {
    if (!w) return '';
    return `<span class="aussprache"><span lang="ja-Latn" class="romaji">${esc(w.romaji)}</span> · sprich <b class="laut">${esc(w.laut)}</b>${mitDe ? ' · ' + esc(w.de) : ''}
      <button class="knopf mini" data-aktion="wort" data-k="${w.k}" aria-label="Aussprechen: ${esc(w.romaji)}">🔊</button></span>`;
  }
  function warumKarte() {
    return `<section class="karte" data-warum><h2>Warum in kleinen Schritten?</h2>
      <ul class="warum">${I.warumKurz.map(w => `<li><b>${esc(w.satz)}</b> ${esc(w.grund)}</li>`).join('')}</ul>
      <div class="knopfreihe"><button class="knopf klein" data-aktion="warum-vorlesen">🔊 Vorlesen</button></div></section>`;
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
          ${s.einwirk && s.einwirk <= 120 ? `<button class="knopf klein" data-aktion="uhr" data-ref="${s.id}" aria-label="Uhr für ${s.einwirk} Minuten starten">⌛ ${s.einwirk}′</button>` : ''}
          <button class="knopf klein" data-aktion="vorlesen" data-ref="${s.id}" aria-label="Vorlesen: ${esc(s.titel)}">🔊</button>
          <button class="knopf klein tusche" data-aktion="erledigt" data-ref="${s.id}">✓ Erledigt</button>
        </span>
      </div>
    </article>`;
  }

  /* ---------- Ansichten ---------- */
  const ANSICHTEN = {
    start() {
      if (!Z.profil) return `
      <section class="held">
        <div class="held-enso">${enso(.94)}</div>
        <div class="held-kanji" lang="ja">整理</div>
        <div class="held-sub">Ordnung auf Japanisch</div>
        <p class="held-laut">${aussprache(J.wort('seiri'), true)}</p>
      </section>
      <section class="karte weiter" data-willkommen>
        <h2>Willkommen.</h2>
        <p>Drei kurze Fragen, dann geht es los: Welche Räume hast du? Wo möchtest du anfangen? Wie lange am Stück?</p>
        <div class="knopfreihe"><a class="knopf haupt" href="#/einrichten/1">▶ Einrichten</a></div>
      </section>
      ${warumKarte()}`;
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
        <p class="held-laut">${aussprache(J.wort('seiri'), true)}</p>
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
      ${(() => { const f = meine().filter(g => g.takt !== 'Gelegenheit'), d = f.filter(g => gStand(g).fertig).length; return `
      <a class="karte g-start" href="#/gewohnheiten" data-g-start>
        <span class="g-start-kanji" lang="ja">習慣</span>
        <span><span class="wo leise klein">Gute Gewohnheiten · heute ${d} von ${f.length}</span><br><b>${f.filter(g => !gStand(g).fertig).map(g => esc(g.titel)).slice(0, 2).join(' · ') || 'Alles für heute erledigt'}</b></span>
      </a>`; })()}
      <a class="karte" href="#/kalender" style="display:block;text-decoration:none" data-monat-karte>
        <div class="wo leise klein">Dieser Monat · ${mFertig} von ${m.aufgaben.length}</div>
        <h2>${esc(m.name)} — ${esc(m.motto)}</h2>
      </a>
      <div class="zeile-titel"><h2 class="leise">Deine Wohnung · ${raeumeZahl()} Räume · Takt ${profil().takt.arbeit}/${profil().takt.pause} Min.</h2><a href="#/einrichten/1" class="leise klein" data-aendern>ändern</a></div>
      <div class="stationen">
        ${reihenfolge().map((nr, pos) => { const s = I.stationen[nr], x = stationStand(s), a = anzahl(nr); return `
          <a class="station-kachel" href="#/station/${s.nr}" data-station="${s.nr}">
            <span class="platz">${pos + 1}</span>${a > 1 ? `<span class="mal">×${a}</span>` : ''}
            ${x.heute ? `<span class="heute">✓ ${x.heute}</span>` : ''}
            ${enso(x.anteil, s.kanji)}
            <span class="name">${esc(s.titel)}</span>
            <span class="stand">${x.je} von ${x.n}</span>
          </a>`; }).join('')}
      </div>
      <p class="leise" style="text-align:center;margin-top:26px"><a href="#/woerter">Japanische Wörter</a> · <a href="#/info">Über die App · Rechte</a></p>`;
    },

    station(nr) {
      const s = I.stationen[+nr]; if (!s) return ANSICHTEN.start();
      const x = stationStand(s);
      return `
      <a class="zurueck" href="#/">← Übersicht</a>
      <div class="station-kopf">
        <div class="kanji" lang="ja">${esc(s.kanji)}</div>
        <div><h1>${esc(s.titel)}${anzahl(s.nr) > 1 ? ` <span class="leise">×${anzahl(s.nr)}</span>` : ''}</h1><div class="lesung">${aussprache(J.fuerStation(s.nr))}</div><div class="lesung">${s.zusatz ? esc(s.zusatz) + ' · ' : ''}${x.je} von ${x.n} schon einmal gemacht</div></div>
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
      Z.sitzung = { nr: s.nr, i: warn ? -1 : i, erledigt: 0, start: i, runde: 1, runden: Math.max(1, anzahl(s.nr)) };
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
      ${warumKarte()}
      <section class="karte"><h2>Leitsätze</h2><ul>${I.leitsaetze.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>
      ${warnkarte()}
      <section class="karte warnkarte"><h2>Nie worauf</h2><ul>${I.nieWorauf.map(t => `<li>${fmt(t)}</li>`).join('')}</ul></section>
      <section class="karte"><h2>Wenn es passiert ist</h2><p>Sofort raus, Tür zu, nicht zurück. Bei Husten, Atemnot oder brennenden Augen <a href="tel:112"><b>112</b></a> rufen und beide Mittel nennen. Giftnotruf: Vorwahl des Bundeslands und 19240.</p></section>
      <section class="karte"><h2>Pausen-Brücke: Einwirkzeiten</h2>
        <table class="tabelle"><thead><tr><th>Was</th><th>Zeit</th><th>In der Zeit</th></tr></thead><tbody>${I.pausen.map(p => `<tr><td>${esc(p.was)}</td><td>${esc(p.dauer)}</td><td>${esc(p.inDerZeit)}</td></tr>`).join('')}</tbody></table></section>
      <p class="leise" style="text-align:center"><a href="#/woerter">Die japanischen Wörter der App, mit Aussprache →</a></p>`;
    },

    woerter() {
      return `<a class="zurueck" href="#/regeln">← Regeln</a>
      <h1 style="font-size:1.45rem;margin:4px 0 4px">Japanische Wörter</h1>
      <p class="leise">So spricht man sie: Silben gleich betont, „ß“ scharf, Doppelvokal lang. ${Stimme.ja ? 'Dein Gerät hat eine japanische Stimme.' : 'Auf diesem Gerät gibt es keine japanische Stimme — die deutsche Stimme liest die Lautschrift.'}</p>
      <div class="woerter">${J.WOERTER.map(w => `<article class="karte wort" data-wort="${w.k}">
        <div class="wort-ja" lang="ja">${esc(w.ja)}</div>
        <div><div class="wort-de">${esc(w.de)}</div><div class="leise klein"><span lang="ja-Latn">${esc(w.romaji)}</span> · sprich <b class="laut">${esc(w.laut)}</b></div></div>
        <button class="knopf klein" data-aktion="wort" data-k="${w.k}" aria-label="Aussprechen: ${esc(w.romaji)}">🔊</button></article>`).join('')}</div>`;
    },

    einrichten(schritt) { return einrichtenHtml(+schritt || 1); },

    gewohnheiten() {
      const m = meine(), ids = new Set(m.map(g => g.id));
      const ordnen = l => l.slice().sort((a, b) => WANN_ORDNUNG.indexOf(a.wann) - WANN_ORDNUNG.indexOf(b.wann));
      const fest = m.filter(g => g.takt !== 'Gelegenheit'), fertig = fest.filter(g => gStand(g).fertig).length;
      const weitere = ordnen(I.gewohnheiten.filter(g => !ids.has(g.id)));
      return `<h1 style="font-size:1.45rem;margin:4px 0 2px"><span lang="ja">習慣</span> Gute Gewohnheiten</h1>
      <p class="lesung">${aussprache(J.wort('shukan'), true)}</p>
      <section class="karte g-heute" data-g-heute>
        <div class="g-ring">${enso(fest.length ? fertig / fest.length : 0, fertig + '/' + fest.length)}</div>
        <div><h2>${fertig === fest.length && fest.length ? 'Alles für heute erledigt.' : 'Heute'}</h2>
        <p class="leise klein">Fang mit wenigen an. Sitzt eine (21-mal, Zeichen <span lang="ja">習</span>), nimm die nächste dazu. Kleine, gleiche Handgriffe jeden Tag halten mehr als ein großer Putz am Samstag.</p></div>
      </section>
      <h2 class="abschnitt">Meine Gewohnheiten · ${m.length}</h2>
      ${m.length ? ordnen(m).map(g => gKarte(g, true)).join('') : '<p class="leer">Noch keine gewählt — such dir unten zwei oder drei aus.</p>'}
      <h2 class="abschnitt">Weitere gute Gewohnheiten aus allen Räumen · ${weitere.length}</h2>
      ${weitere.map(g => gKarte(g, false)).join('')}`;
    },

    verlauf() {
      if (!Z.log.length) return `<h1 style="font-size:1.45rem"><span lang="ja">歴</span> Verlauf</h1><p class="leer">Noch nichts erledigt. Jeder Haken landet hier, Tag für Tag.</p>`;
      const tage = new Map();
      Z.log.slice().sort((a, b) => b.zeit - a.zeit).forEach(e => { const k = tagKey(e.zeit); (tage.get(k) || tage.set(k, []).get(k)).push(e); });
      const titel = e => { if (e.art === 'gewohnheit') { const g = gewohnheit(e.ref); return g ? '習慣 ' + g.titel : e.ref; } if (e.art === 'kalender') { const k = kalAufgabe(e.ref); return k ? `${k.monat.name}: ${k.a.text.split('(')[0].trim()}` : e.ref; } const s = schrittVon(e.ref); return s ? `${I.stationen[s.station].titel} · ${s.titel}` : e.ref; };
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
        <p class="leise klein" data-version>Version 1.0 · Oktober 2026</p>
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

  /* ---------- Gute Gewohnheiten: abhaken, Serie, Kette der letzten 21 Tage/Wochen ---------- */
  const tagNr = t => Math.round(new Date(t).setHours(0, 0, 0, 0) / 864e5);
  const wocheNr = t => Math.floor((tagNr(t) + 3) / 7);                    // Wochen ab Montag
  const ANFANG = ['g7', 'g4', 'g1'];                                       // Vorschlag: Spüle am Abend, Dusche abziehen, Bett lüften
  const WANN_ORDNUNG = ['morgens', 'nach dem Duschen', 'abends', 'nach dem Benutzen', 'beim Heimkommen', 'beim Putzen', 'nach dem Waschen', 'beim Ausziehen', 'beim Einkauf', 'beim Anziehen', 'Donnerstag', 'einmal pro Woche'];
  const gewohnheit = id => I.gewohnheiten.find(g => g.id === id);
  function gStand(g) {
    const es = Z.log.filter(e => e.art === 'gewohnheit' && e.ref === g.id);
    const woche = g.takt === 'Woche', nr = woche ? wocheNr : tagNr, jetzt = nr(Date.now());
    const perioden = new Set(es.map(e => nr(e.zeit)));
    let serie = 0, p = perioden.has(jetzt) ? jetzt : jetzt - 1;
    while (perioden.has(p)) { serie++; p--; }
    const heute = es.filter(e => nr(e.zeit) === jetzt);
    return { n: es.length, serie, jetzt: heute, fertig: heute.length > 0, kette: Array.from({ length: 21 }, (_, i) => perioden.has(jetzt - 20 + i)), woche };
  }
  const meine = () => (Z.meine || ANFANG).map(gewohnheit).filter(Boolean);
  function gKarte(g, mein) {
    const x = gStand(g), sitzt = x.n >= GEWOHNHEIT_AB;
    const knopf = g.takt === 'Gelegenheit'
      ? `<button class="g-haken${x.fertig ? ' an' : ''}" data-aktion="g-mal" data-ref="${g.id}" aria-label="${esc(g.titel)}: einmal gemacht">${x.jetzt.length ? `<b>${x.jetzt.length}×</b>` : '＋'}</button>`
      : `<button class="g-haken${x.fertig ? ' an' : ''}" data-aktion="g-haken" data-ref="${g.id}" aria-pressed="${x.fertig}" aria-label="${esc(g.titel)} ${x.woche ? 'diese Woche' : 'heute'} ${x.fertig ? 'erledigt' : 'abhaken'}">${x.fertig ? '<span lang="ja">済</span>' : ''}</button>`;
    return `<article class="karte gewohnheit-karte${x.fertig ? ' fertig' : ''}" data-gewohnheit="${g.id}">
      ${knopf}
      <div class="g-text">
        <h3>${esc(g.titel)}${sitzt ? ' <span class="gewohnheit" lang="ja" title="Gewohnheit sitzt">習</span>' : ''}</h3>
        <div class="g-wann">${esc(g.wann)} · ${g.takt === 'Gelegenheit' ? 'jedes Mal' : g.takt === 'Woche' ? 'einmal pro Woche' : 'einmal am Tag'}</div>
        <p>${fmt(g.handgriff)}</p>
        <p class="g-warum">${esc(g.warum)}</p>
        <div class="g-fuss">
          <span class="kette" aria-label="${x.kette.filter(Boolean).length} der letzten 21 ${x.woche ? 'Wochen' : 'Tage'}">${x.kette.map(k => `<i class="${k ? 'an' : ''}"></i>`).join('')}</span>
          <span class="serie" data-serie>${x.serie ? `${x.serie} ${x.woche ? (x.serie === 1 ? 'Woche' : 'Wochen') : (x.serie === 1 ? 'Tag' : 'Tage')} in Folge` : (x.n ? x.n + '× bisher' : 'noch nie')}</span>
        </div>
        <div class="knopfreihe">
          <button class="knopf klein" data-aktion="g-vorlesen" data-ref="${g.id}" aria-label="Vorlesen: ${esc(g.titel)}">🔊</button>
          ${mein ? `<button class="knopf klein" data-aktion="g-weg" data-ref="${g.id}">Aus meiner Liste</button>` : `<button class="knopf klein tusche" data-aktion="g-dazu" data-ref="${g.id}">＋ In meine Liste</button>`}
        </div>
      </div>
    </article>`;
  }
  async function meineSpeichern(liste) { Z.meine = liste; await DB.einst('gewohnheiten', liste); }

  /* ---------- Takt-Uhr (Arbeit/Pause) und Einwirk-Uhren ----------
     Gerechnet wird mit Endzeiten (Date.now), nicht mit gezählten Sekunden: läuft der Bildschirm aus und der
     Browser bremst die Uhr, stimmt die Zeit beim Zurückkommen trotzdem. Beide liegen in localStorage. */
  const lies = (k, v) => { try { return JSON.parse(localStorage.getItem(k)) || v; } catch (_) { return v; } };
  const merk = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  Z.takt = lies('oj_takt', null);                                         // {phase: 'arbeit'|'pause', ende, dauer}
  Z.uhren = lies('oj_uhren', []);                                         // [{ref, titel, ende}]
  Z.musik = lies('oj_musik', true);
  const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function taktStart(phase = 'arbeit') {
    const min = profil().takt[phase];
    Z.takt = { phase, ende: Date.now() + min * 60e3, dauer: min * 60e3 };
    merk('oj_takt', Z.takt); uhrenZeigen();
  }
  function taktStopp() { Z.takt = null; merk('oj_takt', null); K.musikStopp(); pauseZeigen(); uhrenZeigen(); }
  function taktWechsel() {
    const war = Z.takt.phase;
    if (war === 'arbeit') {
      taktStart('pause'); K.gong(); if (navigator.vibrate) try { navigator.vibrate([60, 80, 60]); } catch (_) {}
      if (Z.musik) K.musikStart();
      const w = I.warumKurz[Math.floor(Math.random() * I.warumKurz.length)];
      Stimme.folge([`Zeit für eine Pause. ${profil().takt.pause} Minuten. Auf Japanisch:`, Stimme.wort('kyukei'), `${w.satz} ${w.grund}`]);
    } else {
      K.musikStopp(); K.gong(.35); taktStart('arbeit');
      const z = Z.sitzung, s = z && I.stationen[z.nr], x = s && s.schritte[z.i];
      Stimme.folge(['Pause vorbei.', x ? `Weiter mit ${x.titel}.` : 'Weiter geht’s.']);
    }
    pauseZeigen();
  }
  function uhrStart(ref) {
    const x = schrittVon(ref); if (!x || !x.einwirk) return;
    Z.uhren = Z.uhren.filter(u => u.ref !== ref).concat({ ref, titel: x.titel, ende: Date.now() + x.einwirk * 60e3 });
    merk('oj_uhren', Z.uhren); uhrenZeigen();
    Stimme.sprechen(`Uhr läuft: ${x.einwirk} Minuten für ${x.titel}. Mach in der Zeit etwas anderes.`);
  }
  function uhrenZeigen() {
    const box = $('#uhren'); if (!box) return;
    const jetzt = Date.now(), teile = [];
    if (Z.takt) teile.push(`<span class="chip ${Z.takt.phase}" data-chip="takt">${Z.takt.phase === 'arbeit' ? '⏱ Arbeit' : '🍵 Pause'} <b data-rest>${mmss(Z.takt.ende - jetzt)}</b><button data-aktion="takt-stopp" aria-label="Uhr anhalten">✕</button></span>`);
    for (const u of Z.uhren) teile.push(`<span class="chip einwirk" data-chip="${u.ref}">⌛ ${esc(u.titel)} <b>${mmss(u.ende - jetzt)}</b><button data-aktion="uhr-weg" data-ref="${u.ref}" aria-label="Uhr ${esc(u.titel)} löschen">✕</button></span>`);
    box.innerHTML = teile.join(''); box.hidden = !teile.length;
    const leiste = $('[data-taktleiste]');
    if (leiste && Z.takt) { leiste.querySelector('[data-rest]').textContent = mmss(Z.takt.ende - jetzt); leiste.querySelector('i').style.width = (100 * (1 - (Z.takt.ende - jetzt) / Z.takt.dauer)).toFixed(1) + '%'; }
    const p = $('#pause [data-rest]'); if (p && Z.takt) p.textContent = mmss(Z.takt.ende - jetzt);
    const ring = $('#pause .strich'); if (ring && Z.takt) { const u = 2 * Math.PI * 32; ring.setAttribute('stroke-dashoffset', (u * (1 - (Z.takt.ende - jetzt) / Z.takt.dauer)).toFixed(1)); }
  }
  function pauseZeigen() {
    const el = $('#pause'), an = Z.takt && Z.takt.phase === 'pause';
    el.hidden = !an;
    if (!an) { el.innerHTML = ''; return; }
    const w = J.wort('kyukei');
    el.innerHTML = `<div class="pause-innen" data-pausefenster>
      <div class="pause-ring">${enso(1)}<div class="pause-mitte"><div class="pause-kanji" lang="ja">休憩</div><b data-rest>${mmss(Z.takt.ende - Date.now())}</b></div></div>
      <p class="held-laut">${aussprache(w, true)}</p>
      <p class="leitsatz">${esc(I.leitsaetze[Math.floor(Date.now() / 6e4) % I.leitsaetze.length])}</p>
      <div class="knopfreihe" style="justify-content:center">
        <button class="knopf" data-aktion="musik" aria-pressed="${K.laeuft()}">${K.laeuft() ? '🎵 Klang aus' : '🎵 Klang an'}</button>
        <button class="knopf haupt" data-aktion="pause-ende">Pause beenden →</button>
      </div></div>`;
  }
  setInterval(function tick() {
    const jetzt = Date.now();
    if (Z.takt && jetzt >= Z.takt.ende) taktWechsel();
    const fertig = Z.uhren.filter(u => jetzt >= u.ende);
    if (fertig.length) {
      Z.uhren = Z.uhren.filter(u => jetzt < u.ende); merk('oj_uhren', Z.uhren);
      K.gong(.4); Stimme.sprechen('Einwirkzeit vorbei: ' + fertig.map(u => u.titel).join(', ') + '.');
      melden('⌛ Einwirkzeit vorbei: ' + fertig.map(u => u.titel).join(', '));
    }
    uhrenZeigen();
  }, 1000);
  // Bildschirm wach halten, solange eine Sitzung läuft (wo der Browser es kann)
  let wach = null;
  async function wachHalten(an) {
    try {
      if (an && !wach && navigator.wakeLock) { wach = await navigator.wakeLock.request('screen'); wach.addEventListener('release', () => { wach = null; }); }
      else if (!an && wach) { await wach.release(); wach = null; }
    } catch (_) { wach = null; }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Z.sitzung) wachHalten(true); });

  /* ---------- Einrichten: Räume, Reihenfolge, Takt ---------- */
  const FRAGEN = {
    1: 'Wie viele Räume hast du? Stell die Zahl für jeden Raum ein.',
    2: 'Was ist dir am wichtigsten? Wo möchtest du starten? Tippe die Räume in der Reihenfolge an, die dir wichtig ist.',
    3: 'Wie lange möchtest du am Stück arbeiten, und wie lange Pause machen?',
    4: 'Das ist deine Reihenfolge. Bereit?',
  };
  function entwurf() { if (!Z.entwurf) Z.entwurf = JSON.parse(JSON.stringify(Z.profil || STANDARD)); return Z.entwurf; }
  function einrichtenHtml(n) {
    const e = entwurf();
    const kopf = `<div class="einrichten-kopf"><span class="leise">Frage ${Math.min(n, 3)} von 3</span><div class="punkte">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? 'an' : ''}"></i>`).join('')}</div></div>`;
    const fuss = (weiter, text = 'Weiter →') => `<div class="knopfreihe einrichten-fuss">
      ${n > 1 ? `<a class="knopf" href="#/einrichten/${n - 1}">← Zurück</a>` : (Z.profil ? '<a class="knopf" href="#/">Abbrechen</a>' : '')}
      ${weiter}</div>`;
    if (n === 1) return `<div data-einrichten="1">${kopf}
      <h1 class="frage">Wie viele Räume hast du?</h1>
      <p class="leise">Putzschrank und Böden gibt es überall — die kommen von selbst dazu.</p>
      <section class="karte raeume">${RAUM_FRAGEN.map(r => { const w = J.fuerStation(r.nr), z = e.raeume[r.nr] || 0; return `
        <div class="raum${z ? '' : ' aus'}" data-raum="${r.nr}">
          <span class="raum-kanji" lang="ja">${esc(w.ja)}</span>
          <span class="raum-name">${esc(r.name)}</span>
          <span class="zaehlwerk">
            <button class="knopf rund" data-aktion="e-minus" data-nr="${r.nr}" aria-label="${esc(r.name)} weniger"${z <= 0 ? ' disabled' : ''}>−</button>
            <b data-zahl>${z}</b>
            <button class="knopf rund" data-aktion="e-plus" data-nr="${r.nr}" aria-label="${esc(r.name)} mehr"${z >= r.max ? ' disabled' : ''}>＋</button>
          </span></div>`; }).join('')}</section>
      <p class="summe">Zusammen <b data-summe>${raeumeZahl(e)}</b> Räume</p>
      ${fuss(`<a class="knopf haupt" href="#/einrichten/2" data-weiter-e${raeumeZahl(e) ? '' : ' aria-disabled="true"'}>Weiter →</a>`)}</div>`;
    if (n === 2) {
      const da = reihenfolge(e);
      return `<div data-einrichten="2">${kopf}
      <h1 class="frage">Was ist dir am wichtigsten? Wo möchtest du starten?</h1>
      <p class="leise">Tippe die Räume in der Reihenfolge an, die dir wichtig ist. Der erste ist dein Start. Was du nicht antippst, folgt danach in der üblichen Reihenfolge durch die Wohnung.</p>
      <div class="stationen wahl">${I.stationen.filter(s => da.includes(s.nr)).map(s => { const i = (e.wahl || []).indexOf(s.nr); return `
        <button class="station-kachel${i >= 0 ? ' gewaehlt' : ''}" data-aktion="e-wahl" data-nr="${s.nr}" aria-pressed="${i >= 0}">
          ${i >= 0 ? `<span class="platz an">${i + 1}</span>` : ''}${e.raeume[s.nr] > 1 ? `<span class="mal">×${e.raeume[s.nr]}</span>` : ''}
          ${enso(i >= 0 ? 1 : 0, s.kanji)}<span class="name">${esc(s.titel)}</span></button>`; }).join('')}</div>
      ${fuss(`<a class="knopf haupt" href="#/einrichten/3">${(e.wahl || []).length ? 'Weiter →' : 'Übliche Reihenfolge →'}</a>`)}</div>`;
    }
    if (n === 3) return `<div data-einrichten="3">${kopf}
      <h1 class="frage">Wie lange am Stück?</h1>
      <section class="karte"><h2>Arbeiten</h2><div class="wahlreihe">${TAKT_ARBEIT.map(m => `<button class="knopf${e.takt.arbeit === m ? ' haupt' : ''}" data-aktion="e-arbeit" data-m="${m}" aria-pressed="${e.takt.arbeit === m}">${m} Min.</button>`).join('')}</div>
        <h2 style="margin-top:14px">Pause</h2><div class="wahlreihe">${TAKT_PAUSE.map(m => `<button class="knopf${e.takt.pause === m ? ' haupt' : ''}" data-aktion="e-pause" data-m="${m}" aria-pressed="${e.takt.pause === m}">${m} Min.</button>`).join('')}</div>
        <p class="leise klein">In der Pause spielt später Musik deiner Wahl. Einwirkzeiten der Mittel fallen oft genau in die Pause.</p></section>
      ${warumKarte()}
      ${fuss(`<a class="knopf haupt" href="#/einrichten/4">Weiter →</a>`)}</div>`;
    const r = reihenfolge(e);
    return `<div data-einrichten="4">${kopf}
      <h1 class="frage">Deine Reihenfolge</h1>
      <ol class="reihe karte">${r.map(nr => { const s = I.stationen[nr]; return `<li data-reihe="${nr}"><span lang="ja">${esc(s.kanji)}</span> ${esc(s.titel)}${e.raeume[nr] > 1 ? ` <span class="leise">×${e.raeume[nr]}</span>` : ''} <span class="leise klein">· ${s.schritte.length} kleine Schritte</span></li>`; }).join('')}</ol>
      <p class="leise">Takt: ${e.takt.arbeit} Minuten arbeiten, ${e.takt.pause} Minuten Pause. Jeder Schritt ist klein — erledigt ist er, wenn du „Fertig“ sagst oder tippst.</p>
      ${fuss(`<button class="knopf haupt" data-aktion="e-los">▶ Los geht’s: ${esc(I.stationen[r[0]].titel)}</button>`)}</div>`;
  }
  async function einrichtenAktion(a, k) {
    const e = entwurf(), nr = +k.dataset.nr;
    const max = (RAUM_FRAGEN.find(r => r.nr === nr) || {}).max || 1;
    if (a === 'e-plus') e.raeume[nr] = Math.min(max, (e.raeume[nr] || 0) + 1);
    else if (a === 'e-minus') { e.raeume[nr] = Math.max(0, (e.raeume[nr] || 0) - 1); if (!e.raeume[nr]) e.wahl = (e.wahl || []).filter(x => x !== nr); }
    else if (a === 'e-wahl') { e.wahl = e.wahl || []; const i = e.wahl.indexOf(nr); if (i >= 0) e.wahl.splice(i, 1); else e.wahl.push(nr); }
    else if (a === 'e-arbeit') e.takt.arbeit = +k.dataset.m;
    else if (a === 'e-pause') e.takt.pause = +k.dataset.m;
    else if (a === 'e-los') {
      Z.profil = e; Z.entwurf = null; await DB.einst('profil', e);
      location.hash = '#/sitzung/' + reihenfolge()[0];
      return;
    }
    zeichnen(false);
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
        <h2>${esc(s.titel)}${z.runden > 1 ? ` ${z.runde} von ${z.runden}` : ''} geschafft</h2>
        <p class="leise">${z.erledigt} Schritt${z.erledigt === 1 ? '' : 'e'} erledigt.</p>
        <p class="held-laut">${aussprache(J.wort('otsukare'), true)}</p>
        <div class="knopfreihe" style="justify-content:center;margin-top:16px">
          ${z.runde < z.runden ? `<button class="knopf haupt" data-aktion="s-runde">▶ ${esc(s.titel)} ${z.runde + 1} von ${z.runden}</button>` : ''}
          ${naechsteStation(s.nr) ? `<a class="knopf${z.runde < z.runden ? '' : ' haupt'}" href="#/sitzung/${naechsteStation(s.nr).nr}" data-naechste>Weiter: ${esc(naechsteStation(s.nr).titel)}</a>` : ''}
          <a class="knopf" href="#/">Zur Übersicht</a>
        </div></div>`;
    }
    const x = s.schritte[z.i], stx = st(x.id);
    const t = Z.takt;
    return `<div class="sitzung" data-sitzung data-phase="schritt" data-ref="${x.id}">
      <div class="taktleiste ${t ? t.phase : ''}" data-taktleiste>
        <span>${t && t.phase === 'pause' ? '🍵 Pause' : `⏱ Arbeit · ${profil().takt.arbeit} Min.`} · noch <b data-rest>${t ? mmss(t.ende - Date.now()) : profil().takt.arbeit + ':00'}</b></span>
        <button class="knopf klein" data-aktion="pause-jetzt">🍵 Pause jetzt</button>
        <div class="taktbalken"><i style="width:${t ? (100 * (1 - (t.ende - Date.now()) / t.dauer)).toFixed(1) : 0}%"></i></div>
      </div>
      <div class="fortschritt"><i style="width:${(z.i / gesamt * 100).toFixed(1)}%"></i></div>
      <div class="wo"><span><span lang="ja">${esc(s.kanji)}</span> ${esc(s.titel)}${z.runden > 1 ? ` ${z.runde}/${z.runden}` : ''}</span><span>Schritt ${z.i + 1} von ${gesamt}</span></div>
      <section class="karte buehne" data-buehne>
        <h2>${esc(x.titel)}</h2>
        <p>${fmt(x.text)}</p>
        ${x.einwirk && x.einwirk <= 120 ? `<div><button class="knopf klein" data-aktion="uhr" data-ref="${x.id}">⌛ Uhr für ${x.einwirk} Min. starten</button></div>` : ''}
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
    let teile;
    const raum = `${s.titel}${z.runden > 1 ? ', Raum ' + z.runde + ' von ' + z.runden : ''}`;
    if (z.i === -1) teile = [`Station ${raum}. Beachte bitte vorher: ` + I.nieMischen.slice(0, 4).map(ST.sprechtext).join(' ')];
    else if (z.i >= s.schritte.length) teile = [Stimme.wort('otsukare'), `Gut gemacht. ${raum} geschafft.`];
    else if (z.i === z.start) teile = [Stimme.wort('hajime'), `Fangen wir an. Station ${raum}. Auf Japanisch:`, Stimme.wort(s.nr), ST.ansage(s.schritte[z.i])];
    else teile = [ST.ansage(s.schritte[z.i])];
    Stimme.folge(teile, { start: () => b && b.classList.add('spricht'), fertig: () => { const bb = $('[data-buehne]'); bb && bb.classList.remove('spricht'); } });
  }
  function sitzungZeigen(vorlesen = true) {
    ansicht.innerHTML = sitzungHtml();
    ansicht.classList.remove('tinte'); void ansicht.offsetWidth; ansicht.classList.add('tinte');
    if (vorlesen) sitzungVorlesen();
    if (Z.sitzung && Z.sitzung.i >= 0 && !Z.takt) taktStart('arbeit');
    uhrenZeigen();
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

  document.addEventListener('click', () => K.wecken(), { capture: true, once: true });
  document.addEventListener('click', async ev => {
    const k = ev.target.closest('[data-aktion]'); if (!k) return;
    const a = k.dataset.aktion, ref = k.dataset.ref;
    if (a === 'vorlesen') { const s = schrittVon(ref); Stimme.sprechen(ST.ansage(s)); }
    else if (a === 'wort') { const w = J.wort(k.dataset.k); Stimme.folge([Stimme.wort(w.k), `${w.de}.`]); }
    else if (a === 'g-haken') {
      const g = gewohnheit(ref), x = gStand(g);
      if (x.fertig) { for (const e of x.jetzt) await DB.loeschen(e.id); Z.log = Z.log.filter(e => !x.jetzt.includes(e)); rechnen(); }
      else { await erledigen('gewohnheit', ref); if (gStand(g).n === GEWOHNHEIT_AB) Stimme.folge([Stimme.wort('shukan'), `${g.titel}: Gewohnheit sitzt.`]); }
      zeichnen(false);
    }
    else if (a === 'g-mal') { await erledigen('gewohnheit', ref); zeichnen(false); }
    else if (a === 'g-vorlesen') { const g = gewohnheit(ref); Stimme.sprechen(ST.sprechtext(`${g.titel}. ${g.wann}. ${g.handgriff} Warum: ${g.warum}`)); }
    else if (a === 'g-dazu') { await meineSpeichern(meine().map(g => g.id).concat(ref)); zeichnen(false); melden('In deiner Liste: ' + gewohnheit(ref).titel); }
    else if (a === 'g-weg') { await meineSpeichern(meine().map(g => g.id).filter(id => id !== ref)); zeichnen(false); }
    else if (a === 'uhr') uhrStart(ref);
    else if (a === 'uhr-weg') { Z.uhren = Z.uhren.filter(u => u.ref !== ref); merk('oj_uhren', Z.uhren); uhrenZeigen(); }
    else if (a === 'takt-stopp') taktStopp();
    else if (a === 'pause-jetzt') { if (!Z.takt || Z.takt.phase === 'arbeit') { if (!Z.takt) taktStart('arbeit'); Z.takt.ende = Date.now(); taktWechsel(); } }
    else if (a === 'pause-ende') { Z.takt.ende = Date.now(); taktWechsel(); }
    else if (a === 'musik') { Z.musik = !K.laeuft(); merk('oj_musik', Z.musik); Z.musik ? K.musikStart() : K.musikStopp(); pauseZeigen(); }
    else if (a === 'warum-vorlesen') Stimme.sprechen('Warum in kleinen Schritten? ' + I.warumKurz.map(w => w.satz + ' ' + w.grund).join(' '));
    else if (a.startsWith('e-')) await einrichtenAktion(a, k);
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
      else if (a === 's-runde') { z.runde++; z.i = 0; z.start = 0; z.erledigt = 0; sitzungZeigen(); }
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
    if (name !== 'einrichten') Z.entwurf = null;
    const f = ANSICHTEN[name] || ANSICHTEN.start;
    const y = animiert ? 0 : scrollY;
    ansicht.innerHTML = f(...teile.slice(1));
    document.querySelectorAll('[data-nav]').forEach(n => n.toggleAttribute('aria-current', false));
    const nav = document.querySelector(`[data-nav="${({ station: 'start', sitzung: 'start', info: 'start', einrichten: 'start', woerter: 'regeln' })[name] || name}"]`);
    if (nav) nav.setAttribute('aria-current', 'page');
    if (animiert) { ansicht.classList.remove('tinte'); void ansicht.offsetWidth; ansicht.classList.add('tinte'); scrollTo(0, 0); }
    else scrollTo(0, y);
    if (name === 'sitzung' && animiert) sitzungVorlesen();
    if (name === 'sitzung' && Z.sitzung && Z.sitzung.i >= 0 && !Z.takt) taktStart('arbeit');
    wachHalten(name === 'sitzung');
    uhrenZeigen();
    if (name === 'einrichten' && animiert) Stimme.sprechen(FRAGEN[+teile[1] || 1]);
    if (name === 'kalender' && animiert) { const j = $('details.monat.jetzt'); if (j) scrollTo(0, j.getBoundingClientRect().top + scrollY - 70); }
  }
  window.addEventListener('hashchange', () => zeichnen(true));

  /* ---------- Start ---------- */
  (async function los() {
    Z.log = await DB.alle(); rechnen();
    Z.stumm = !!(await DB.einst('stumm'));
    Z.profil = (await DB.einst('profil')) || null;
    Z.meine = (await DB.einst('gewohnheiten')) || null;
    const b = $('#btnStumm'); b.setAttribute('aria-pressed', Z.stumm); b.textContent = Z.stumm ? '🔇' : '🔊';
    zeichnen(true);
    pauseZeigen();
    window.OJ_BEREIT = true;
  })();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.OJ.App = { stimme: Stimme, zustand: Z, reihenfolge };
})();
