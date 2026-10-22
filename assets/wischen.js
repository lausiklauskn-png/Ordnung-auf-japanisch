/* Seitwischen wie in Mein-Mixarium: Touch-Anfang/-Ende auf der ganzen Seite.
   Links und Karten bleiben antippbar; nur eine erkannte Seitengeste unterdrückt den Klick. */
(function () {
  'use strict';
  const links = [...document.querySelectorAll('.leiste [data-nav]')];
  const hash = () => location.hash || '#/';
  const index = () => links.findIndex(a => a.hash === hash());
  const gesperrt = () => !window.OJ_BEREIT || index() < 0 ||
    ['pause', 'themaAuswahl', 'spracheAuswahl'].some(id => {
      const e = document.getElementById(id);
      return e && !e.hidden;
    });
  const eingabe = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="slider"],[data-wisch-aus]';
  let spur = null;
  const aus = () => { spur = null; };
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || spur) return aus();
    const t = e.touches[0], ziel = e.target;
    if (gesperrt() || t.clientX < 24 || t.clientX > innerWidth - 24 ||
        ziel.closest('.kopf,.leiste,#uhren,' + eingabe) ||
        document.activeElement?.matches(eingabe) || getSelection()?.toString()) return;
    // Eigene horizontale Listen behalten ihre Geste.
    for (let k = ziel; k && k !== document.documentElement; k = k.parentElement) {
      if (k.scrollWidth > k.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(k).overflowX)) return;
    }
    spur = { id: t.identifier, x: t.clientX, y: t.clientY, hash: hash() };
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!spur) return;
    if (e.touches.length !== 1) return aus();
    const t = e.touches[0];
    if (t.identifier !== spur.id) return aus();
    const x = Math.abs(t.clientX - spur.x), y = Math.abs(t.clientY - spur.y);
    // Mixariums Richtungsprüfung: senkrechtes Scrollen gewinnt.
    if (y > 12 && y > x * 1.2) return aus();
    if (x > 12 && x > y * 1.5) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', e => {
    if (!spur) return;
    const s = spur; aus();
    if (e.touches.length || gesperrt() || hash() !== s.hash) return;
    const t = [...e.changedTouches].find(t => t.identifier === s.id);
    if (!t) return;
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    // Wie Mixarium: 55 px und deutlich waagerecht; kein kurzer Zeitablauf.
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // Ein Wischen auf einer Raumkarte darf danach nicht deren Link öffnen.
    if (e.cancelable) e.preventDefault();
    const ziel = links[index() + (dx < 0 ? 1 : -1)];
    if (ziel) location.hash = ziel.hash;
  }, { passive: false });
  document.addEventListener('touchcancel', aus, { passive: true });
  document.addEventListener('visibilitychange', aus);
  window.addEventListener('blur', aus);
  window.addEventListener('hashchange', aus);
})();
