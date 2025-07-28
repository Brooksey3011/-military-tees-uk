"use client"

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { analytics, setUserId, clearUserId } from '@/lib/monitoring/analytics'

interface AnalyticsContextValue {
  trackEvent: (name: string, properties?: Record<string, any>) => void
  trackConversion: (event: any) => void
  trackPerformance: (metrics: any) => void
  setUserId: (userId: string) => void
  clearUserId: () => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Set user ID when provided
  useEffect(() => {
    if (userId) {
      setUserId(userId)
    } else {
      clearUserId()
    }
  }, [userId])

  // Track page views on route changes
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await analytics.trackPageView({
          url: window.location.href,
          title: document.title,
          referrer: document.referrer
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    // Track initial page view
    trackPageView()
  }, [pathname])

  // Track performance metrics on page load
  useEffect(() => {
    const trackInitialPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        // Track page load performance
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            
            if (navigation) {
              analytics.trackPerformance({
                pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
                TTFB: navigation.responseStart - navigation.fetchStart,
                FCP: navigation.domContentLoadedEventEnd - navigation.fetchStart
              })
            }
          }, 0)
        })

        // Track initial CLS
        let cumulativeLayoutShift = 0
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value
            }
          }
          
          analytics.trackPerformance({
            CLS: cumulativeLayoutShift
          })
        })

        try {
          observer.observe({ entryTypes: ['layout-shift'] })
        } catch (error) {
          // Layout shift not supported in all browsers
        }

        // Cleanup
        return () => {
          observer.disconnect()
        }
      }
    }

    trackInitialPerformance()
  }, [])

  const contextValue: AnalyticsContextValue = {
    trackEvent: (name: string, properties?: Record<string, any>) => {
      analytics.trackEvent({ name, properties })
    },
    trackConversion: (event: any) => {
      analytics.trackConversion(event)
    },
    trackPerformance: (metrics: any) => {
      analytics.trackPerformance(metrics)
    },
    setUserId: (userId: string) => {
      setUserId(userId)
    },
    clearUserId: () => {
      clearUserId()
    }
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Hook for using analytics in components
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// Higher-order component for tracking component interactions
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  eventName?: string
) {
  const WrappedComponent = (props: P) => {
    const { trackEvent } = useAnalytics()

    useEffect(() => {
      if (eventName) {
        trackEvent(`${eventName}_mounted`)
      }
    }, [trackEvent])

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withAnalytics(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for tracking component-specific events
export function useComponentAnalytics(componentName: string) {
  const { trackEvent, trackPerformance } = useAnalytics()

  const trackComponentEvent = (action: string, properties?: Record<string, any>) => {
    trackEvent(`${componentName}_${action}`, {
      component: componentName,
      ...properties
    })
  }

  const trackComponentPerformance = (action: string, duration: number) => {
    trackPerformance({
      [`${componentName}_${action}_time`]: duration
    })
  }

  const measureAction = (action: string) => {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      trackComponentPerformance(action, duration)
    }
  }

  return {
    trackEvent: trackComponentEvent,
    trackPerformance: trackComponentPerformance,
    measureAction
  }
}

export default AnalyticsProvider