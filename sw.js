/* ASTROICERS // SECURE ID — service worker
   策略：
   - 導頁(navigate)：network-first → 部署後一進站即拿到新版 HTML，離線才回退快取首頁。
   - 其他 GET 資源：stale-while-revalidate → 秒開且離線可用，背景更新。
   CDN/字型已加 crossorigin=anonymous，回應為 CORS(非 opaque) 故可被快取，離線完整呈現。 */
const CACHE = 'astroicers-id-v3';

/* 同源 app shell（跨源的 CDN/字型由 runtime 快取處理，避免單一資源失敗導致整批 install 失敗） */
const SHELL = [
  '/',
  '/index.html',
  '/404.html',
  '/site.webmanifest',
  '/assets/me.jpg',
  '/assets/og.png',
  '/assets/favicon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 快取成功的同源與 CORS 回應；跳過 opaque（status 0）避免快取膨脹 */
function cachePut(req, resp) {
  if (resp && resp.status === 200 && resp.type !== 'opaque') {
    const copy = resp.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return resp;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  /* 導頁：network-first，離線回退快取首頁 */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((resp) => cachePut(req, resp))
        .catch(() => caches.match(req).then((c) => c || caches.match('/index.html')))
    );
    return;
  }

  /* 其他 GET：stale-while-revalidate */
  e.respondWith(
    caches.match(req).then((cached) => {
      const fromNet = fetch(req)
        .then((resp) => cachePut(req, resp))
        .catch(() => cached);
      return cached || fromNet;
    })
  );
});
