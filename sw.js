const CACHE_NAME = 'dawala-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/dashboard.html',
    '/warga.html',
    '/keuangan.html',
    '/galeri.html',
    '/pengaturan.html',
    '/assets/css/style.css',
    '/assets/js/main.js'
    // Jika Anda memiliki ikon atau logo lokal, tambahkan path-nya di sini
    // contoh: '/assets/images/logo.png'
];

// Event 'install': Menyimpan aset inti ke dalam cache.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache dibuka, menambahkan aset inti untuk penggunaan offline.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Event 'fetch': Menyajikan aset dari cache, atau dari jaringan jika tidak tersedia di cache.
self.addEventListener('fetch', event => {
    // Abaikan permintaan selain GET atau permintaan yang menuju ke API
    const isApiRequest = event.request.url.includes('/warga') || 
                         event.request.url.includes('/data') || 
                         event.request.url.includes('/pengguna') || 
                         event.request.url.includes('/logs') || 
                         event.request.url.includes('/login');

    if (event.request.method !== 'GET' || isApiRequest) {
        return; // Biarkan browser mengambil langsung dari jaringan
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika aset ditemukan di cache, kembalikan dari cache.
                if (response) {
                    return response;
                }

                // Jika tidak, coba ambil dari jaringan.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Periksa apakah respons valid.
                        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Event 'activate': Membersihkan cache lama agar aplikasi tetap terbarui.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                    return caches.delete(cacheName);
                }
            })
        ))
    );
});