/* Offline-Sprachwahl. Texte stammen aus dem deutschen Katalog und den gespeicherten Sprachdateien.
   Kein Übersetzungsdienst zur Laufzeit. Kennungen, Zeitwerte und gespeicherter Fortschritt bleiben stabil. */
(function () {
  'use strict';
  const OPTIONEN = { de: 'de-DE', en: 'en-GB', ru: 'ru-RU', ja: 'ja-JP', es: 'es-ES', pl: 'pl-PL' };
  let code = 'de';
  try { const wahl = localStorage.getItem('oj_sprache'); if (Object.hasOwn(OPTIONEN, wahl)) code = wahl; } catch (_) {}
  const daten = window.OJ_SPRACHEN || { quellen: [], sprachen: {} };
  const texte = Object.fromEntries(daten.quellen.map((q, i) => [q, daten.sprachen[code]?.[i] || q]));
  const norm = s => String(s).replace(/\s+/gu, ' ').trim();
  const regexSicher = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const muster = Object.entries(texte).filter(([q]) => /__OJ_\d+__/.test(q) && /\p{L}/u.test(q.replace(/__OJ_\d+__/g, ''))).map(([q, ziel]) => {
    const keys = [];
    const teile = q.split(/(__OJ_\d+__)/);
    const regex = teile.map(teil => { if (/^__OJ_\d+__$/.test(teil)) { keys.push(teil); return '(.*?)'; } return regexSicher(teil); }).join('');
    return { regex: new RegExp('^' + regex + '$', 'u'), keys, ziel, laenge: q.replace(/__OJ_\d+__/g, '').length };
  }).sort((a, b) => b.laenge - a.laenge);
  const ziele = new Set(Object.values(texte));
  function t(wert, tiefe = 0) {
    const roh = String(wert ?? ''); if (code === 'de') return roh;
    const q = norm(roh); if (!q) return roh;
    const anfang = roh.match(/^\s*/u)[0], ende = roh.match(/\s*$/u)[0];
    if (Object.hasOwn(texte, q)) return anfang + texte[q] + ende;
    if (ziele.has(q)) return roh;
    if (tiefe < 5) for (const m of muster) {
      const treffer = q.match(m.regex); if (!treffer) continue;
      let ziel = m.ziel;
      m.keys.forEach((k, i) => { ziel = ziel.split(k).join(t(treffer[i + 1], tiefe + 1)); });
      return anfang + ziel + ende;
    }
    return roh;
  }
  function dom(root) {
    if (code === 'de') return;
    const laeufer = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const knoten = []; while (laeufer.nextNode()) knoten.push(laeufer.currentNode);
    for (const n of knoten) {
      const p = n.parentElement;
      if (p?.closest('script,style,[translate="no"]') || p?.getAttribute('lang')?.startsWith('ja')) continue;
      n.data = t(n.data);
    }
    root.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(el => {
      if (el.closest('[translate="no"]') || el.getAttribute('lang')?.startsWith('ja')) return;
      for (const attr of ['title', 'aria-label', 'placeholder', 'alt']) if (el.hasAttribute(attr)) el.setAttribute(attr, t(el.getAttribute(attr)));
    });
  }
  function html(wert) {
    if (code === 'de') return wert;
    const vorlage = document.createElement('template'); vorlage.innerHTML = wert; dom(vorlage.content); return vorlage.innerHTML;
  }
  // Nur Anzeigewerte übersetzen. Taktwerte und Kennungen gehören zur Speicher-/Ablauflogik.
  const original = structuredClone(window.OJ_INHALT);
  function inhalt(v, key = '') {
    if (['id', 'nr', 'kanji', 'lesung', 'bilder'].includes(key) || (key === 'takt' && typeof v === 'string')) return v;
    if (typeof v === 'string') return t(v);
    if (Array.isArray(v)) return v.map(x => inhalt(x));
    if (v && typeof v === 'object') Object.keys(v).forEach(k => { v[k] = inhalt(v[k], k); });
    return v;
  }
  if (code !== 'de') {
    inhalt(window.OJ_INHALT);
    window.OJ.Japanisch.WOERTER.forEach(w => { w.de = t(w.de); });
  }
  const stoffe = ['angesetzte Sauerstoffbleiche','saurer WC-Reiniger','Wasserstoffperoxid','Zitronensäure','Zwei Reinigungsmittel','Chlorreiniger','Schmierseife','Rohrreiniger','Glasreiniger','Ammoniak','Salmiak','alter Urin','Spiritus','Sauerstoffbleiche','Natron','Essig','Seife','Säure','Chlor','irgendetwas'];
  const formen = { en: ['glass cleaners'], ru: ['средства для мытья стёкол', 'кислоты'], pl: ['płyny do szyb'] };
  const namen = [...new Set([...stoffe.map(s => t(s)), ...(formen[code] || [])])].sort((a, b) => b.length - a.length).map(regexSicher).join('|');
  const mischMuster = new RegExp(code === 'ja' ? '(' + namen + ')' : '(?<!\\p{L})(' + namen + ')(?!\\p{L})', 'giu');
  // Ergänzt die deutsche Offline-Suche um Begriffe der gewählten Sprache.
  const A = window.OJ.Absicht;
  if (code !== 'de') {
    const g = A.gewohnheitenFuer, m = A.mittelFuer;
    A.gewohnheitenFuer = nr => g(nr, original); A.mittelFuer = nr => m(nr, original);
    window.OJ_INHALT.stationen.forEach(s => { A.RAUM[s.nr].push(...A.woerter(s.titel)); });
  }
  const worte = {
    en: ['Warning', 'Contact time', 'Working time', 'and', 'to', 'tablespoons', 'teaspoons', 'minutes', 'hours', 'seconds', 'degrees Celsius'],
    ru: ['Внимание', 'Время воздействия', 'Время работы', 'и', 'к', 'столовых ложек', 'чайных ложек', 'минут', 'часов', 'секунд', 'градусов Цельсия'],
    ja: ['注意', '放置時間', '作業時間', 'と', '対', '大さじ', '小さじ', '分', '時間', '秒', '度'],
    es: ['Atención', 'Tiempo de actuación', 'Tiempo de trabajo', 'y', 'a', 'cucharadas', 'cucharaditas', 'minutos', 'horas', 'segundos', 'grados Celsius'],
    pl: ['Uwaga', 'Czas działania', 'Czas pracy', 'i', 'do', 'łyżek stołowych', 'łyżeczek', 'minut', 'godzin', 'sekund', 'stopni Celsjusza'],
  };
  function vorlesetext(wert) {
    let s = t(wert);
    if (code === 'de') return s;
    s = s.split(/(?<=[.!?])\s+/u).map(x => t(x)).join(' ');
    const w = worte[code];
    return s.replace(/\*\*/g, '').replace(/⚠\s*/g, w[0] + ': ').replace(/⌛\s*/g, w[1] + ' ').replace(/⏱\s*/g, w[2] + ' ')
      .replace(/\bEL\b/g, w[5]).replace(/\bTL\b/g, w[6]).replace(/\bMin\./g, w[7]).replace(/\bStd\./g, w[8]).replace(/\bSek\./g, w[9]).replace(/°C/g, w[10])
      .replace(/\s*→\s*/g, ': ').replace(/\s+·\s+|\s+—\s+/g, '. ').replace(/\+/g, ' ' + w[3] + ' ').replace(/(\d)\s*:\s*(\d)/g, '$1 ' + w[4] + ' $2').replace(/\s{2,}/g, ' ').trim();
  }
  const hinweise = {
    en: 'The syllable guide follows German pronunciation. Japanese terms use a Japanese voice if one is available on your device.',
    ru: 'Подсказки по слогам основаны на немецком произношении. Для японских слов используется японский голос, если он доступен на устройстве.',
    ja: '音節の表記はドイツ語の発音に基づいています。端末に日本語の音声があれば、日本語の言葉はその音声で読み上げます。',
    es: 'La guía por sílabas se basa en la pronunciación alemana. Las palabras japonesas se leen con una voz japonesa si tu dispositivo dispone de ella.',
    pl: 'Zapis sylab opiera się na niemieckiej wymowie. Japońskie słowa są czytane japońskim głosem, jeśli jest dostępny na urządzeniu.',
  };
  const api = { ausspracheHinweis: hinweise[code] || '', code, locale: OPTIONEN[code], t, html, dom, mischMuster, original, vorlesetext };
  (window.OJ = window.OJ || {}).Sprache = api;
  document.documentElement.lang = code;
  dom(document.body);
  const knopf = document.getElementById('btnSprache'), auswahl = document.getElementById('spracheAuswahl');
  function schliessen(fokus) { auswahl.hidden = true; knopf.setAttribute('aria-expanded', 'false'); if (fokus) knopf.focus(); }
  if (knopf && auswahl) {
    auswahl.querySelectorAll('[data-sprache]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sprache === code)));
    knopf.addEventListener('click', () => {
      if (!auswahl.hidden) return schliessen(false);
      document.getElementById('themaAuswahl').hidden = true; document.getElementById('btnThema').setAttribute('aria-expanded', 'false');
      auswahl.hidden = false; knopf.setAttribute('aria-expanded', 'true'); auswahl.querySelector('[aria-pressed="true"]').focus();
    });
    auswahl.addEventListener('click', e => {
      const b = e.target.closest('[data-sprache]'); if (!b || !Object.hasOwn(OPTIONEN, b.dataset.sprache)) return;
      if (b.dataset.sprache === code) return schliessen(true);
      try { localStorage.setItem('oj_sprache', b.dataset.sprache); } catch (_) { return; }
      window.speechSynthesis?.cancel(); location.reload();
    });
    document.addEventListener('click', e => { if (!auswahl.hidden && !auswahl.contains(e.target) && !knopf.contains(e.target)) schliessen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !auswahl.hidden) { e.preventDefault(); schliessen(true); } });
    document.addEventListener('focusin', e => { if (!auswahl.hidden && !auswahl.contains(e.target) && e.target !== knopf) schliessen(false); });
  }
})();
