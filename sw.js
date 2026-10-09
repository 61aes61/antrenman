// Sürümü her güncellemede artır: telefon yeni dosyaları bu sayede indirir.
const VERSION = 'v12';
const CACHE = 'antrenman-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './anim.js', './css/app.css', './js/util.js', './js/data.js', './js/state.js', './js/cloud.js', './js/views.js', './js/timer.js', './js/actions.js', './js/boot.js', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten dene (güncel sürüm gelsin), internet yoksa telefondaki kopyayı aç.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Videolar ve dış siteler doğrudan internetten gelsin (iPhone video oynatma için gerekli).
  const u = new URL(e.request.url);
  // Firebase kütüphaneleri: bir kez indirilince telefonda saklanır (internetsiz açılış için).
  if (u.origin === 'https://www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
