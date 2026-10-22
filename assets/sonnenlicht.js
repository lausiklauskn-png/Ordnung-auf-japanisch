/* Breiter Lichtschein im Thema Morgenlicht. Nur mit Maus und ohne reduzierte Bewegung.
   Bildschirmkoordinaten passen zur festen Hintergrundfläche, auch beim Scrollen. */
(function () {
  'use strict';
  const wurzel = document.documentElement;
  const maus = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const weniger = matchMedia('(prefers-reduced-motion: reduce)');
  let bild = 0, x = 0, y = 0;
  const erlaubt = () => wurzel.dataset.thema === 'morgenlicht' && maus.matches && !weniger.matches;
  function aus() {
    if (bild) cancelAnimationFrame(bild);
    bild = 0; wurzel.removeAttribute('data-sonnenlicht');
  }
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !erlaubt()) return aus();
    x = Math.max(0, Math.min(innerWidth, e.clientX));
    y = Math.max(0, Math.min(innerHeight, e.clientY));
    if (bild) return;
    bild = requestAnimationFrame(() => {
      bild = 0;
      if (!erlaubt()) return aus();
      wurzel.style.setProperty('--sonne-x', x + 'px');
      wurzel.style.setProperty('--sonne-y', y + 'px');
      wurzel.setAttribute('data-sonnenlicht', '');
    });
  }, { passive: true });
  document.addEventListener('pointerout', e => { if (e.relatedTarget === null) aus(); }, { passive: true });
  window.addEventListener('blur', aus);
  document.addEventListener('visibilitychange', () => { if (document.hidden) aus(); });
  maus.addEventListener('change', aus); weniger.addEventListener('change', aus);
  new MutationObserver(aus).observe(wurzel, { attributes: true, attributeFilter: ['data-thema'] });
})();
