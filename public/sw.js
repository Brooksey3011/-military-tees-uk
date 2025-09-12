// Service Worker for Military Tees UK - Performance Optimization
const CACHE_NAME = 'military-tees-v1'
const STATIC_CACHE = 'military-tees-static-v1'
const DYNAMIC_CACHE = 'military-tees-dynamic-v1'

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/logowhite.webp',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/_next/static/css/',
  '/_next/static/js/'
]

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching critical resources')
      // Note: In production, these paths would be generated from the build
      return cache.addAll([
        '/',
        '/logowhite.webp',
        '/favicon-32x32.png',
        '/apple-touch-icon.png'
      ]).catch((error) => {
        console.error('Failed to cache critical resources:', error)
      })
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName.startsWith('military-tees-')
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    }).then(() => {
      // Take control of all clients
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip API requests, they have their own caching
  if (url.pathname.startsWith('/api/')) {
    return
  }
  
  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request))
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request))
  } else {
    event.respondWith(networkFirstStrategy(request))
  }
})

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache-first strategy failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Stale-while-revalidate strategy for pages
async function staleWhileRevalidateStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    
    // Always try to update the cache in the background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE)
        cache.then(c => c.put(request, networkResponse.clone()))
      }
      return networkResponse
    })
    
    // Return cached version if available, otherwise wait for network
    if (cachedResponse) {
      return cachedResponse
    } else {
      return await fetchPromise
    }
  } catch (error) {
    console.error('Stale-while-revalidate strategy failed:', error)
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Network-first strategy failed:', error)
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff')
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'))
}

function isImageRequest(url) {
  return url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.avif') ||
         url.pathname.endsWith('.svg')
}

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls
    caches.open(STATIC_CACHE).then((cache) => {
      cache.addAll(urls)
    })
  }
})