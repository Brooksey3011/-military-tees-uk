// Service Worker for Military Tees UK - Performance & Offline Optimization
const CACHE_NAME = 'military-tees-v1.2.0'
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`
const IMAGE_CACHE = `${CACHE_NAME}-images`
const API_CACHE = `${CACHE_NAME}-api`

// Cache duration settings
const CACHE_DURATION = {
  API: 5 * 60 * 1000, // 5 minutes
  IMAGES: 24 * 60 * 60 * 1000, // 24 hours
}

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/offline',
  '/logowhite.webp',
  '/placeholder-product.jpg',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/manifest.json'
]

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching critical resources')
      // Note: In production, these paths would be generated from the build
      return cache.addAll(CRITICAL_RESOURCES.filter(resource => 
        !resource.includes('_next') // Filter out dynamic paths for install
      )).catch((error) => {
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
                   cacheName !== IMAGE_CACHE &&
                   cacheName !== API_CACHE &&
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
  
  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiCacheStrategy(request))
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request))
  } else if (isImageRequest(url)) {
    event.respondWith(imageCacheStrategy(request))
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

// API caching strategy with offline support
async function apiCacheStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cached-at', Date.now().toString())
      
      const enhancedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      })
      
      cache.put(request, enhancedResponse)
    }
    
    return networkResponse
  } catch (error) {
    console.log('API request failed, checking cache...')
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.API)) {
      console.log('Serving cached API response')
      return cachedResponse
    }
    
    return new Response(JSON.stringify({ 
      error: 'Service unavailable', 
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Enhanced image caching strategy
async function imageCacheStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Image request failed, serving placeholder')
    return caches.match('/placeholder-product.jpg') || 
           new Response('Image not available offline', { status: 503 })
  }
}

// Enhanced navigation strategy with offline page
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Navigation request failed, checking cache...')
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for failed navigation
    const offlinePage = await caches.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Military Tees UK</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-container { max-width: 400px; margin: 0 auto; }
            .offline-icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📡</div>
            <h1>You're Offline</h1>
            <p>Check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Helper function to check cache expiry
function isCacheExpired(cachedResponse, maxAge) {
  const cachedAt = cachedResponse.headers.get('sw-cached-at')
  if (!cachedAt) return true
  
  const age = Date.now() - parseInt(cachedAt)
  return age > maxAge
}

// Message handling for cache updates and offline functionality
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
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('military-tees-')) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  }
})