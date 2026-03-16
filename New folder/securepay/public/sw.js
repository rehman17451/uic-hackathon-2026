// Empty service worker to satisfy Vite PWA plugin
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', () => {
  // Let browser handle fetches normally
});
