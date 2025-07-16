importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Suppress all Workbox logs in production
workbox.setConfig({ debug: false });

// Precache all app assets for full offline support
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [
  { url: 'index.html', revision: null },
  { url: 'manifest.json', revision: null },

  { url: 'images/icon-192x192.png', revision: null },
  { url: 'images/icon-512x512.png', revision: null },
  { url: 'images/org.png', revision: null },
  // Add more assets as needed
]);

// Cache all static assets (CSS, JS, images, fonts, sounds)
workbox.routing.registerRoute(
  ({ request }) => [
    'style', 'script', 'image', 'font', 'audio'
  ].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache Google Fonts
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
        maxEntries: 30,
      }),
    ],
  })
);

// Use StaleWhileRevalidate for navigation requests for a fast, offline-first experience.

// Cache timetable data from Google Apps Script for offline use
const DATA_URL = 'https://script.google.com/macros/s/AKfycbzB-Q2T4Tg8yAjatGip2nO0ktkACiM6LXDCPwBo3Gf57PZH907_FmTcupuAsVMKRp2o/exec';

workbox.routing.registerRoute(
  ({url}) => url.href === DATA_URL,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'external-data-v1',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Auto-reload the app if new data is fetched in the background
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.url === DATA_URL) {
    event.respondWith(
      caches.open('external-data-v1').then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            // Notify clients to reload if new data was fetched
            self.clients.matchAll().then(clients => {
              clients.forEach(client => client.postMessage({type: 'DATA_UPDATED'}));
            });
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
  }
});

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'pages-v1',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// --- BACKGROUND SYNC EVENT ---
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // Try to get the queue from IndexedDB or fallback to localStorage (for demo, using localStorage)
  let pending = [];
  try {
    const data = await self.clients.matchAll({type: 'window'}).then(windows => {
      if (windows.length > 0) {
        // Communicate with the first client to get localStorage data
        return new Promise(resolve => {
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => resolve(event.data);
          windows[0].postMessage({type: 'GET_PENDING_ACTIONS'}, [channel.port2]);
        });
      }
      return [];
    });
    pending = data || [];
  } catch (e) { /* fallback empty */ }

  if (pending && pending.length > 0) {
    for (const action of pending) {
      try {
        await fetch('/sync', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(action)
        });
      } catch (e) {
        // If failed, keep in queue
        return;
      }
    }
    // Notify clients to clear the queue
    const windows = await self.clients.matchAll({type: 'window'});
    for (const client of windows) {
      client.postMessage({type: 'CLEAR_PENDING_ACTIONS'});
    }
  }
}

// Suppress all unhandled promise rejections and errors in the SW
self.addEventListener('unhandledrejection', event => {
  event.preventDefault();
});
self.addEventListener('error', event => {
  event.preventDefault();
});

// Fallback to index.html for navigation requests when offline
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
  }
});
