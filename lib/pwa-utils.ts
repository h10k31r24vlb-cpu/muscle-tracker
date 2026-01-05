export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
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
        vibrate: [200, 100, 200, 100, 200],
        tag: 'interval-notification',
        requireInteraction: false,
      });
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
