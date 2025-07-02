const cacheName = 'civi-table-v1';
const assetsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(assetsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.notification.tag);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // If a window is already open, focus it.
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window.
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'CiviTable Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: 'images/icon-192x192.png',
    badge: 'images/icon-192x192.png',
    vibrate: [200, 100, 200],
    sound: 'sounds/notification.mp3' // Optional: add a sound file
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
