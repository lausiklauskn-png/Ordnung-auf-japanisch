/* Ordnung auf Japanisch — Service Worker. Cacht die SCHALE (App-Dateien), nie den Verlauf (der liegt in IndexedDB).
   Wer eine Datei aus SCHALE ändert, erhöht CACHE_VERSION und das ?v= der Datei. */
const CACHE_VERSION = 'ordnung-jp-v2';
const SCHALE = [
  './', './index.html', './manifest.webmanifest',
  './assets/style.css?v=2', './assets/inhalt.js?v=2', './assets/sprechtext.js?v=2', './assets/japanisch.js?v=1', './assets/db.js?v=1', './assets/app.js?v=2',
  './icons/icon-192.png?v=1', './icons/icon-512.png?v=1', './icons/icon-512-maskable.png?v=1',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => Promise.all(SCHALE.map(u => c.add(u).catch(() => null)))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Seite: erst Netz (frisch), dann Vorrat · Dateien: erst Vorrat, dann Netz
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const k = res.clone(); caches.open(CACHE_VERSION).then(c => c.put('./index.html', k)); return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
