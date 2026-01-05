const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `muscle-tracker-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// インストール時にキャッシュを作成
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// アクティベーション時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時にネットワーク優先で返す（常に最新版を取得）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したらキャッシュを更新
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

// プッシュ通知を受信
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Muscle Tracker';
  const options = {
    body: data.body || 'インターバルが終了しました！',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'interval-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知をクリックした時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// バックグラウンドでのメッセージ受信
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INTERVAL_COMPLETE') {
    // インターバル完了通知を表示
    self.registration.showNotification('インターバル終了', {
      body: 'インターバルが終了しました！次のセットを始めましょう。',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'interval-notification',
      requireInteraction: false,
    });
  }
  
  // 強制更新リクエスト
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
