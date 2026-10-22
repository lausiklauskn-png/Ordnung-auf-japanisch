/* Seitwischen folgt den sichtbaren Hauptmenü-Links. Keine Änderung an Schritt- oder Uhrdaten. */
(function () {
  'use strict';
  const flaeche = document.getElementById('ansicht');
  const links = [...document.querySelectorAll('.leiste [data-nav]')];
  const hash = () => location.hash || '#/';
  const index = () => links.findIndex(a => a.hash === hash());
  const gesperrt = () => !window.OJ_BEREIT || index() < 0 ||
    ['pause', 'themaAuswahl', 'spracheAuswahl'].some(id => !document.getElementById(id).hidden);
  let spur = null;
  const aus = () => { spur = null; };
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    if (!e.isPrimary || spur) return aus();
    if (gesperrt() || !flaeche.contains(e.target) || e.clientX < 24 || e.clientX > innerWidth - 24 ||
        e.target.closest('a,button,input,textarea,select,label,summary,[contenteditable]:not([contenteditable="false"]),[role="slider"],[data-wisch-aus]') ||
        document.activeElement?.matches('input,textarea,select,[contenteditable="true"]') ||
        getSelection()?.toString()) return;
    for (let k = e.target; k && k !== flaeche; k = k.parentElement) {
      if (k.scrollWidth > k.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(k).overflowX)) return;
    }
    spur = { id: e.pointerId, x: e.clientX, y: e.clientY, zeit: performance.now(), hash: hash() };
  }, { passive: true });
  document.addEventListener('pointermove', e => {
    if (!spur || e.pointerId !== spur.id) return;
    const x = Math.abs(e.clientX - spur.x), y = Math.abs(e.clientY - spur.y);
    if (y > 12 && y > x) aus();
  }, { passive: true });
  document.addEventListener('pointerup', e => {
    if (!spur || e.pointerId !== spur.id) return;
    const s = spur; aus();
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (gesperrt() || hash() !== s.hash || performance.now() - s.zeit > 850 ||
        Math.abs(dx) < Math.max(64, Math.min(100, innerWidth * .18)) || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const ziel = links[index() + (dx < 0 ? 1 : -1)];
    if (ziel) location.hash = ziel.hash;
  }, { passive: true });
  document.addEventListener('pointercancel', aus, { passive: true });
  document.addEventListener('visibilitychange', aus);
  window.addEventListener('blur', aus);
  window.addEventListener('hashchange', aus);
})();
