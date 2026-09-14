/**
 * client/public/sw.js
 * TernakMart Progressive Web App (PWA) Service Worker
 * Handles native mobile background push notifications & resilient offline asset caching
 */

const CACHE_NAME = 'ternakmart-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Safe install phase: cache assets individually with Promise.allSettled
// Prevents complete SW crash if a single resource returns 404
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn('[SW Precache Skipped]:', url, err.message);
          }
        })
      );
      return results;
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network first with Cache fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests and skip API or chrome-extension requests
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/api/') || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'TernakMart Update',
    body: 'Ada pesan baru atau pembaruan status ternak Anda!',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'ternakmart-chat',
    data: {
      url: '/chat'
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: data.badge || '/logo.svg',
    image: data.image || undefined,
    tag: data.tag || `chat-${Date.now()}`,
    vibrate: [200, 100, 200, 100, 300],
    requireInteraction: true,
    actions: data.actions || [
      { action: 'open_url', title: 'Buka Chat' },
      { action: 'dismiss', title: 'Tutup' }
    ],
    data: {
      url: (data.data && data.data.url) || data.url || '/chat'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Notification click listener: focuses or navigates directly to target URL (e.g. /chat)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/chat';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
