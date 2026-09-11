/* 따뜻한동행 연수 일정 — 오프라인 지원 서비스워커
 * 한 번 열어본 폰은 인터넷이 없어도 앱이 열립니다.
 * 캐시 버전을 올리면(CACHE 값 변경) 다음 접속 때 새 파일을 받습니다. */
const CACHE = 'tw-tokyo-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  // 연수 핸드북 · 기관별 사전조사 자료 · 계획서 — 현장 오프라인 열람용 선캐시(약 4MB)
  encodeURI('./2026 따뜻한동행 일본 해외연수 계획서_20260903.pdf'),
  encodeURI('./핸드북/2026 따뜻한동행 일본 해외연수 핸드북.pdf'),
  encodeURI('./핸드북/1. 메이지가쿠인대학 및 일본 복지정책.pdf'),
  encodeURI('./핸드북/2. Sports of Heart.pdf'),
  encodeURI('./핸드북/3. 서비스그랜트 재팬.pdf'),
  encodeURI('./핸드북/4. 유이마루 타마다이라의숲.pdf'),
  encodeURI('./핸드북/5. 데이서비스 라스베가스.pdf'),
  encodeURI('./핸드북/6. 트러스트뱅크(고향사랑기부제).pdf'),
  encodeURI('./핸드북/7. 쿄마루엔.pdf'),
  encodeURI('./핸드북/8. ATC 에이지리스센터.pdf'),
  encodeURI('./핸드북/9. 고향의집 오사카.pdf'),
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
    // HTML: 네트워크 우선 (온라인이면 항상 최신) — 단, 3초 안에 응답이 없으면 캐시로 넘어간다.
    // 비행기 모드는 fetch가 즉시 실패하지만, 호텔 와이파이·캡티브 포털·로밍 전환 중처럼
    // "연결은 됐는데 응답이 없는" 상태에서는 예전엔 흰 화면으로 계속 매달려 있었다.
    const fromNet = fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
      }
      return res;
    });
    fromNet.catch(() => {});   // 타임아웃 후 뒤늦게 실패해도 조용히 (unhandled rejection 방지)
    const fallback = () => caches.match(req).then((h) => h || caches.match('./index.html'));
    e.respondWith(
      Promise.race([
        fromNet,
        new Promise((_, rej) => setTimeout(() => rej(new Error('slow-network')), 3000))
      ])
        .catch(() => fallback().then((h) => h || fromNet))
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
