/* Udupi Coast Trip: offline support.
   The app shell is precached; pages try the network briefly, then fall back to the cache;
   Google Fonts are cached on install so the type survives with no signal. */
const V = 'udupi-kaavi-4';
const FONTS = 'udupi-kaavi-fonts-1';
const SHELL = ['/', '/css/base.css', '/css/components.css', '/css/pieces.css', '/css/screens.css', '/css/motion.css', '/data/trip.js', '/data/day-tue.js', '/data/day-wed.js', '/data/day-thu.js', '/data/day-fri.js', '/data/day-sat.js', '/js/art.js', '/js/core.js', '/js/pieces.js', '/js/screens.js', '/js/sheets.js', '/js/app.js', '/manifest.webmanifest', '/icons/kindi.svg', '/icons/kindi-192.png', '/icons/kindi-512m.png', '/icons/kindi-180.png'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400..800&family=Tiro+Kannada&display=swap';
const FONT_HOSTS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
const FONT_URL = /url[(](https:[/][/]fonts[.]gstatic[.]com[/][^) ]+)[)]/g;

async function cacheFonts() {
  try {
    const c = await caches.open(FONTS);
    if (await c.match(FONT_CSS, { ignoreVary: true })) return;
    const res = await fetch(FONT_CSS, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return;
    const css = await res.clone().text();
    await c.put(FONT_CSS, res);
    const urls = [...new Set([...css.matchAll(FONT_URL)].map(m => m[1]))];
    await Promise.all(urls.map(u => fetch(u, { mode: 'cors', credentials: 'omit' }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null)));
  } catch (e) { /* fonts are a nicety; the app works with system fonts */ }
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    await Promise.race([cacheFonts(), new Promise(r => setTimeout(r, 15000))]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [V, FONTS];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'v' && e.source) e.source.postMessage({ v: V }); });

const within = (p, ms) => new Promise((ok, no) => { const id = setTimeout(() => no(new Error('slow')), ms); p.then(v => { clearTimeout(id); ok(v); }, err => { clearTimeout(id); no(err); }); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (FONT_HOSTS.includes(url.origin)) {
    e.respondWith((async () => {
      const c = await caches.open(FONTS);
      const hit = await c.match(req.url, { ignoreVary: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req.url, res.clone()).catch(() => {});
        return res;
      } catch (err) { return new Response('', { status: 504 }); }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    const net = fetch(req).then(async res => {
      if (res.ok) { const c = await caches.open(V); await c.put('/', res.clone()); }
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(within(net, 3500).catch(async () => (await caches.match('/')) || net));
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()).catch(() => {}); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })());
});
