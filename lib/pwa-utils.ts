export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    
    // 更新チェック
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新しいバージョンが利用可能
            console.log('新しいバージョンが利用可能です。リロードします...');
            // 自動的にリロード
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        });
      }
    });
    
    // 定期的に更新をチェック（1時間ごと）
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function showIntervalNotification(message: string = 'インターバルが終了しました！') {
  if (typeof window === 'undefined') return;

  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    // Service Workerが利用可能な場合はそちらを使用
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'INTERVAL_COMPLETE',
        message,
      });
    } else {
      // フォールバック: 直接通知を表示
      new Notification('インターバル終了', {
        body: message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'interval-notification',
        requireInteraction: false,
      } as NotificationOptions);
    }
    
    // バイブレーション
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  // iOS Safari
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandaloneIOS = (window.navigator as any).standalone === true;
  
  // Android Chrome
  const isStandaloneAndroid = window.matchMedia('(display-mode: standalone)').matches;
  
  return isStandaloneIOS || isStandaloneAndroid;
}
