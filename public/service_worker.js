// Service Worker for Email Editor PWA
const CACHE_NAME = 'email-editor-v2.0.0';
const RUNTIME_CACHE = 'email-editor-runtime';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Runtime caching strategies
const RUNTIME_CACHING = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts-stylesheets',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }
    }
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }
    }
  },
  {
    urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'jsdelivr-cdn',
      expiration: {
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      }
    }
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      }
    }
  },
  {
    urlPattern: /\.(?:js|css)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
      }
    }
  }
];

// Install event - precache static assets
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Precaching static assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('email-editor-') && cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) URLs
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same-origin requests
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      // HTML files - Network first with cache fallback
      event.respondWith(handleHtmlRequest(request));
    } else {
      // Static assets - Cache first
      event.respondWith(handleStaticAssets(request));
    }
  } else {
    // Cross-origin requests - Apply runtime caching rules
    event.respondWith(handleCrossOriginRequest(request));
  }
});

// HTML request handler (Network first)
async function handleHtmlRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('📡 Network failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page
    return caches.match('/index.html');
  }
}

// Static assets handler (Cache first)
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    fetchAndCache(request);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Cross-origin request handler
async function handleCrossOriginRequest(request) {
  const url = new URL(request.url);
  
  // Find matching runtime caching rule
  const matchingRule = RUNTIME_CACHING.find(rule => {
    return rule.urlPattern.test(url.href);
  });
  
  if (!matchingRule) {
    // No caching rule, just fetch
    return fetch(request);
  }
  
  const { handler, options } = matchingRule;
  const cacheName = options.cacheName || RUNTIME_CACHE;
  
  switch (handler) {
    case 'CacheFirst':
      return cacheFirst(request, cacheName, options);
    case 'StaleWhileRevalidate':
      return staleWhileRevalidate(request, cacheName, options);
    case 'NetworkFirst':
      return networkFirst(request, cacheName, options);
    default:
      return fetch(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName, options) {
  const cachedResponse = await caches.match(request, { cacheName });
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Handle expiration
      if (options.expiration) {
        await cleanupCache(cacheName, options.expiration);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch and update cache in background
  const fetchAndUpdate = async () => {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        
        // Handle expiration
        if (options.expiration) {
          await cleanupCache(cacheName, options.expiration);
        }
      }
      
      return networkResponse;
    } catch (error) {
      console.warn('Background fetch failed:', error);
    }
  };
  
  if (cachedResponse) {
    // Return cached response immediately and update in background
    fetchAndUpdate();
    return cachedResponse;
  }
  
  // No cached response, wait for network
  return fetchAndUpdate();
}

// Network first strategy
async function networkFirst(request, cacheName, options) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Handle expiration
      if (options.expiration) {
        await cleanupCache(cacheName, options.expiration);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request, { cacheName });
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.warn('Background fetch failed:', request.url);
  }
}

// Cache cleanup based on expiration rules
async function cleanupCache(cacheName, expiration) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  if (expiration.maxEntries && requests.length > expiration.maxEntries) {
    // Remove oldest entries
    const entriesToRemove = requests.length - expiration.maxEntries;
    for (let i = 0; i < entriesToRemove; i++) {
      await cache.delete(requests[i]);
    }
  }
  
  if (expiration.maxAgeSeconds) {
    const maxAge = expiration.maxAgeSeconds * 1000;
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseTime = new Date(dateHeader).getTime();
        if (now - responseTime > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'template-save') {
    event.waitUntil(syncTemplateSave());
  }
});

// Sync template save when back online
async function syncTemplateSave() {
  try {
    // Get pending saves from IndexedDB
    const pendingSaves = await getPendingSaves();
    
    for (const save of pendingSaves) {
      try {
        await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(save.data)
        });
        
        // Remove from pending saves
        await removePendingSave(save.id);
        
        // Notify clients
        await notifyClients({
          type: 'TEMPLATE_SYNCED',
          templateId: save.id
        });
      } catch (error) {
        console.error('Failed to sync template save:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  console.log('📧 Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'email-editor',
    requireInteraction: false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  if (event.action) {
    // Handle specific actions
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Utility functions
async function getPendingSaves() {
  // Implement IndexedDB operations for pending saves
  return [];
}

async function removePendingSave(id) {
  // Implement IndexedDB operations
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

async function handleNotificationAction(action, data) {
  switch (action) {
    case 'open':
      await clients.openWindow('/');
      break;
    case 'dismiss':
      // Do nothing
      break;
    default:
      await clients.openWindow('/');
  }
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('🚀 Service Worker loaded successfully');