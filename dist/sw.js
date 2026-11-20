/* Elearning Service Worker – wird beim Build aus src/sw-template.js erzeugt. Nicht von Hand bearbeiten. */
const VERSION = '45f80e03c28e';
const PRECACHE = [
  "./",
  "./assets/barlow-condensed-latin-600-normal-BFJEwTuo.woff",
  "./assets/barlow-condensed-latin-600-normal-DepVgxBB.woff2",
  "./assets/barlow-condensed-latin-700-normal-Dmwat-ge.woff",
  "./assets/barlow-condensed-latin-700-normal-v1xN8_Wq.woff2",
  "./assets/index-DVcRNy68.js",
  "./assets/index-kVLghooC.css",
  "./assets/source-sans-3-latin-400-normal-DQi5PRDE.woff2",
  "./assets/source-sans-3-latin-400-normal-RR2C27NP.woff",
  "./assets/source-sans-3-latin-600-normal-Ck0n4g8U.woff",
  "./assets/source-sans-3-latin-600-normal-DeckBYAU.woff2",
  "./assets/source-sans-3-latin-700-normal-B-h9tW5h.woff",
  "./assets/source-sans-3-latin-700-normal-CkzU-mV9.woff2",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];
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
