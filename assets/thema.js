/* Gewähltes Naturthema vor dem Stylesheet anwenden; Start bleibt helles Washi. */
(function () {
  'use strict';
  const SCHLUESSEL = 'oj_thema';
  const THEMEN = { washi: '#f7f2e9', sand: '#f3e9da', salbei: '#eff2e8', leinen: '#f4f1eb', morgenlicht: '#fbf1df', kirschbluete: '#f8eeec', daemmerung: '#3b322c', moos: '#29352f' };
  let aktuell = 'washi';
  try { const wert = localStorage.getItem(SCHLUESSEL); if (Object.hasOwn(THEMEN, wert)) aktuell = wert; } catch (_) {}

  function anwenden(name, speichern) {
    if (!Object.hasOwn(THEMEN, name)) return;
    aktuell = name;
    document.documentElement.dataset.thema = name;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEMEN[name];
    document.querySelectorAll('[data-thema-wahl]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themaWahl === name)));
    if (speichern) try { localStorage.setItem(SCHLUESSEL, name); } catch (_) {}
  }
  anwenden(aktuell, false);

  document.addEventListener('DOMContentLoaded', () => {
    const knopf = document.getElementById('btnThema'), wahl = document.getElementById('themaAuswahl');
    if (!knopf || !wahl) return;
    anwenden(aktuell, false);
    function schliessen(fokus) {
      wahl.hidden = true; knopf.setAttribute('aria-expanded', 'false');
      if (fokus) knopf.focus();
    }
    knopf.addEventListener('click', () => {
      if (!wahl.hidden) return schliessen(false);
      wahl.hidden = false; knopf.setAttribute('aria-expanded', 'true');
      wahl.querySelector('[aria-pressed="true"]').focus();
    });
    wahl.addEventListener('click', e => {
      const b = e.target.closest('[data-thema-wahl]'); if (!b) return;
      anwenden(b.dataset.themaWahl, true); schliessen(true);
    });
    document.addEventListener('click', e => {
      if (!wahl.hidden && !wahl.contains(e.target) && !knopf.contains(e.target)) schliessen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !wahl.hidden) { e.preventDefault(); schliessen(true); }
    });
    document.addEventListener('focusin', e => {
      if (!wahl.hidden && !wahl.contains(e.target) && e.target !== knopf) schliessen(false);
    });
    window.addEventListener('storage', e => {
      if (e.key === SCHLUESSEL) anwenden(Object.hasOwn(THEMEN, e.newValue) ? e.newValue : 'washi', false);
    });
  });
})();
