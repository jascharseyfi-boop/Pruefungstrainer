/* Elearning Service Worker – wird beim Build aus src/sw-template.js erzeugt. Nicht von Hand bearbeiten. */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `elearning-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })))),
  );
  // Beim allerersten Installieren sofort aktiv werden; Updates warten auf Bestätigung im Banner.
  if (!self.registration.active) self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('elearning-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Von Netlify eingefügte Skripte (/.netlify/…) nicht abfangen
  if (url.pathname.startsWith('/.netlify/')) return;

  // Seitenaufrufe (auch mit #/route) → App-Hülle aus dem Cache
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match('./index.html', { ignoreVary: true }).then((hit) => hit || fetch(req)),
      ).catch(() => fetch(req)),
    );
    return;
  }

  // Alles andere: Cache zuerst, dann Netz
  event.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(req)),
  );
});
