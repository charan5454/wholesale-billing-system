êconst CACHE_NAME = 'dairy-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
ê*cascade08"(fb2d5543857dc2b4941046b8d268cad1935091d82Xfile:///C:/Users/kanam/OneDrive/Antigravity%20Codes/wholesale-vendor-system/public/sw.js:Kfile:///C:/Users/kanam/OneDrive/Antigravity%20Codes/wholesale-vendor-system