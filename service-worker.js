/* 따뜻한동행 연수 일정 — 오프라인 지원 서비스워커
 * 한 번 열어본 폰은 인터넷이 없어도 앱이 열립니다.
 * 캐시 버전을 올리면(CACHE 값 변경) 다음 접속 때 새 파일을 받습니다. */
const CACHE = 'tw-tokyo-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  // 기관자료(현재는 해외연수 계획서로 대체) — 현장 오프라인 열람용 선캐시
  encodeURI('./2026 따뜻한동행 일본 해외연수 계획서_20260903.pdf'),
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isVendor =
    url.href.startsWith('https://www.gstatic.com/firebasejs/') ||
    url.href.startsWith('https://cdn.jsdelivr.net/gh/orioncactus/pretendard');

  // Firebase 실시간 DB, 구글 지도, 폰트 등은 손대지 않음 (항상 네트워크)
  if (!sameOrigin && !isVendor) return;

  const isHTML =
    req.mode === 'navigate' ||
    (sameOrigin && (url.pathname === '/' || url.pathname.endsWith('.html')));

  if (isHTML) {
    // HTML: 네트워크 우선 (온라인이면 항상 최신, 오프라인이면 캐시)
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((h) => h || caches.match('./index.html')))
    );
    return;
  }

  // 그 외 자산(아이콘·SDK·폰트CSS): 캐시 우선, 백그라운드 갱신
  e.respondWith(
    caches.match(req).then((hit) => {
      const fromNet = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fromNet;
    })
  );
});
