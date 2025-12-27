/**
 * CiviTable Service Worker
 * Managed by Workbox
 */

// Import Workbox (ensure this file exists in your directory)
importScripts('workbox-915e8d08.js');

// --- VERSIONING (CRITICAL) ---
// CHANGE THIS VALUE every time you update index.html or data.js
const APP_VERSION = 'v1.1.0-mobile-ui-update'; 
const RUNTIME_CACHE = `civi-runtime-${APP_VERSION}`;
const CORE_CACHE = `civi-core-${APP_VERSION}`;

// --- Core Assets ---
// Files to cache immediately so the app works offline.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data.js',
  './images/icon-192x192.png',
  './images/icon-512x512.png'
  // Removed './dist/styles.css' as you are now using Tailwind CDN
];

// --- Settings ---
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Handle Skip Waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// --- 1. Pre-caching Core Assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (e) {
        console.warn('[SW] Precache error:', e);
      }
    })()
  );
});

// --- 2. Cleanup Old Caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cn) => {
          // Delete caches that don't match the current version
          if (!cn.includes(APP_VERSION) && (cn.startsWith('civi-core-') || cn.startsWith('civi-runtime-'))) {
            return caches.delete(cn);
          }
        })
      );
    })()
  );
});

// --- 3. Dynamic Caching Strategies ---

// A. Local Data (Fastest update)
workbox.routing.registerRoute(
  ({url}) => url.pathname.endsWith('/data.js'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'civi-data-cache',
  })
);

// B. Tailwind CSS CDN (CRITICAL FOR UI)
// Cache the Tailwind script so the UI doesn't break offline.
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://cdn.tailwindcss.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'tailwind-cdn-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
        maxEntries: 5,
      }),
    ],
  })
);

// C. Google Fonts
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-cache',
  })
);

// D. Images & Local Assets
workbox.routing.registerRoute(
  ({request, url}) => request.method === 'GET' && url.origin === self.location.origin,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: RUNTIME_CACHE,
  })
);

// --- 4. Offline Fallback ---
// If a navigation request fails (e.g., no internet), return the cached index.html
const handler = async (options) => {
  try {
    return await fetch(options.request);
  } catch (error) {
    const cache = await caches.open(CORE_CACHE);
    const cachedResp = await cache.match('index.html') || await cache.match('./index.html');
    return cachedResp || new Response('Offline - App Shell Missing', { status: 503 });
  }
};

workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  handler
);
