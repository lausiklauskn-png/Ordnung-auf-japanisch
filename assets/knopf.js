/* Glas- und Neigungsverhalten nach lausiklauskn-png/family-project, assets/app.js wireHoloButtons.
   Keine Größenänderung. Delegation gilt auch für nachgeladene Schritte und Karten. */
(function () {
  'use strict';
  const WAHL = '.knopf,.kopf-knopf';
  const weniger = matchMedia('(prefers-reduced-motion: reduce)');
  let aktiv = null;
  function zurueck() {
    if (!aktiv) return;
    ['--mx', '--my', '--rx', '--ry'].forEach(k => aktiv.style.removeProperty(k));
    aktiv = null;
  }
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.(WAHL);
    if (!b || b.disabled || e.pointerType === 'touch' || weniger.matches) return zurueck();
    if (aktiv && aktiv !== b) zurueck();
    aktiv = b;
    const r = b.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    b.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    b.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    b.style.setProperty('--ry', ((x - .5) * 18).toFixed(2) + 'deg');
    b.style.setProperty('--rx', (-(y - .5) * 18).toFixed(2) + 'deg');
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const b = e.target.closest?.(WAHL);
    if (b && !b.contains(e.relatedTarget)) zurueck();
  }, { passive: true });
  document.addEventListener('pointercancel', zurueck, { passive: true });
  window.addEventListener('blur', zurueck);
  weniger.addEventListener('change', zurueck);
})();
