/* Elearning Service Worker – wird beim Build aus src/sw-template.js erzeugt. Nicht von Hand bearbeiten. */
const VERSION = '4478a8942b44';
const PRECACHE = [
  "./",
  "./assets/barlow-latin-500-normal-BPAOfeC8.woff2",
  "./assets/barlow-latin-500-normal-C1h8hMer.woff",
  "./assets/barlow-latin-600-normal-CNwfPWQD.woff",
  "./assets/barlow-latin-600-normal-DILqtrty.woff2",
  "./assets/barlow-latin-700-normal-A9pxMQ4z.woff2",
  "./assets/barlow-latin-700-normal-__SGTsZ1.woff",
  "./assets/barlow-latin-800-normal-BdVooDN4.woff",
  "./assets/barlow-latin-800-normal-s1sAMnoV.woff2",
  "./assets/index-BvG6Z22u.js",
  "./assets/index-D6p4f-4m.css",
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
