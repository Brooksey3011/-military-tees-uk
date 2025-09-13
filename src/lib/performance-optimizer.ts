// Performance optimization utilities for Military Tees UK

export interface CriticalResource {
  url: string
  type: 'script' | 'style' | 'image' | 'font'
  priority: 'high' | 'low' | 'auto'
  crossOrigin?: boolean
}

export const CRITICAL_RESOURCES: CriticalResource[] = [
  // Critical images for LCP - only logo as it's used on every page
  {
    url: '/logowhite.webp',
    type: 'image',
    priority: 'high'
  }
  // Removed font preloading as it was causing preload warnings
  // Fonts will be loaded naturally by Next.js font optimization
]

// Preload critical resources programmatically
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  CRITICAL_RESOURCES.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.url
    link.as = resource.type
    
    if (resource.type === 'image') {
      link.fetchPriority = resource.priority as any
    }
    
    if (resource.crossOrigin) {
      link.crossOrigin = 'anonymous'
    }
    
    // Add to head if not already present
    if (!document.querySelector(`link[href="${resource.url}"]`)) {
      document.head.appendChild(link)
    }
  })
}

// Early hints for HTTP/2 push
export function generateEarlyHints(): string {
  return CRITICAL_RESOURCES
    .filter(resource => resource.priority === 'high')
    .map(resource => {
      const crossorigin = resource.crossOrigin ? '; crossorigin' : ''
      return `<${resource.url}>; rel=preload; as=${resource.type}${crossorigin}`
    })
    .join(', ')
}

// Optimize server response time with caching headers
export interface CacheConfig {
  maxAge: number
  staleWhileRevalidate?: number
  mustRevalidate?: boolean
  public?: boolean
}

export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static assets - long cache
  static: {
    maxAge: 31536000, // 1 year
    public: true
  },
  
  // HTML pages - short cache with stale-while-revalidate
  page: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
    public: true
  },
  
  // API responses - medium cache
  api: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
    public: true
  },
  
  // Images - long cache
  image: {
    maxAge: 86400, // 1 day
    public: true
  }
}

export function getCacheHeader(type: keyof typeof CACHE_CONFIGS): string {
  const config = CACHE_CONFIGS[type]
  let parts = []
  
  if (config.public) parts.push('public')
  parts.push(`max-age=${config.maxAge}`)
  
  if (config.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
  }
  
  if (config.mustRevalidate) {
    parts.push('must-revalidate')
  }
  
  return parts.join(', ')
}

// Performance monitoring utilities
export function measureServerResponseTime() {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return null
  
  return {
    responseTime: navigation.responseEnd - navigation.requestStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
    loadComplete: navigation.loadEventEnd - navigation.navigationStart,
    ttfb: navigation.responseStart - navigation.requestStart
  }
}

// Optimize critical rendering path
export function optimizeCriticalRenderingPath() {
  if (typeof window === 'undefined') return
  
  // Preload critical resources
  preloadCriticalResources()
  
  // Add performance observer for LCP
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
          
          // Log if LCP is slow
          if (entry.startTime > 2500) {
            console.warn('LCP is slow:', entry.startTime + 'ms')
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }
}

// Service Worker for aggressive caching
export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return
  
  // Run optimizations after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeCriticalRenderingPath()
    })
  } else {
    optimizeCriticalRenderingPath()
  }
  
  // Register service worker for caching
  registerServiceWorker()
}