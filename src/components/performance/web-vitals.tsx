'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital:', metric)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Send to your analytics service (e.g., Google Analytics, Plausible)
      if (window.plausible) {
        window.plausible('Web Vital', {
          props: {
            metric_name: metric.name,
            metric_value: Math.round(metric.value),
            metric_rating: metric.rating,
            metric_id: metric.id,
          }
        })
      }

      // Log performance thresholds for monitoring
      const thresholds = {
        LCP: 2500, // Largest Contentful Paint should be under 2.5s
        FID: 100,  // First Input Delay should be under 100ms  
        CLS: 0.1,  // Cumulative Layout Shift should be under 0.1
        FCP: 1800, // First Contentful Paint should be under 1.8s
        TTFB: 800, // Time to First Byte should be under 800ms
      }

      const threshold = thresholds[metric.name as keyof typeof thresholds]
      if (threshold && metric.value > threshold) {
        console.warn(`⚠️ ${metric.name} exceeded threshold:`, {
          value: metric.value,
          threshold,
          rating: metric.rating
        })
      }
    }
  })

  return null
}

// Performance optimization hook
export function usePerformanceOptimizations() {
  if (typeof window !== 'undefined') {
    // Preload critical resources
    const preloadResource = (href: string, as: string) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      document.head.appendChild(link)
    }

    // Defer non-critical CSS
    const deferCSS = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.media = 'print'
      link.onload = () => {
        link.media = 'all'
      }
      document.head.appendChild(link)
    }

    return { preloadResource, deferCSS }
  }

  return { preloadResource: () => {}, deferCSS: () => {} }
}