"use client"

import { useState, useEffect, useCallback } from 'react'

export type ProductView = 'grid' | 'list'

const STORAGE_KEY = 'military-tees-product-view'
const DEFAULT_MOBILE_VIEW: ProductView = 'grid' // 2x2 grid on mobile
const DEFAULT_DESKTOP_VIEW: ProductView = 'grid' // 3-4 column grid on desktop

interface UseProductViewReturn {
  view: ProductView
  setView: (view: ProductView) => void
  isLoaded: boolean
  isMobile: boolean
}

export function useProductView(): UseProductViewReturn {
  const [view, setViewState] = useState<ProductView>(DEFAULT_MOBILE_VIEW)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      return mobile
    }

    if (typeof window !== 'undefined') {
      const mobile = checkMobile()
      
      // Load saved preference or use default based on device
      const savedView = localStorage.getItem(STORAGE_KEY) as ProductView | null
      const initialView = savedView || (mobile ? DEFAULT_MOBILE_VIEW : DEFAULT_DESKTOP_VIEW)
      
      setViewState(initialView)
      setIsLoaded(true)

      // Listen for window resize
      const handleResize = () => {
        const newMobile = checkMobile()
        if (newMobile !== mobile) {
          // Device changed from mobile to desktop or vice versa
          // Keep the current view but update mobile state
          setIsMobile(newMobile)
        }
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Apply body class for global styling
  useEffect(() => {
    if (isLoaded && typeof document !== 'undefined') {
      // Remove any existing product view classes
      document.body.classList.remove('product-view-grid', 'product-view-list')
      // Add current view class
      document.body.classList.add(`product-view-${view}`)
    }
  }, [view, isLoaded])

  const setView = useCallback((newView: ProductView) => {
    if (newView === view) return

    setViewState(newView)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newView)
    }

    // Analytics tracking
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if ('gtag' in window) {
        (window as any).gtag('event', 'product_view_change', {
          event_category: 'user_interface',
          event_label: newView,
          custom_parameter_1: isMobile ? 'mobile' : 'desktop',
        })
      }

      // Custom event for other tracking
      window.dispatchEvent(new CustomEvent('product-view-changed', {
        detail: { view: newView, isMobile }
      }))
    }

    console.log(`Product view changed to: ${newView} (${isMobile ? 'mobile' : 'desktop'})`)
  }, [view, isMobile])

  return {
    view,
    setView,
    isLoaded,
    isMobile
  }
}

// Utility hook for getting responsive grid classes
export function useProductGridClasses() {
  const { view, isLoaded } = useProductView()

  const getGridClasses = useCallback(() => {
    if (!isLoaded) {
      // Return default classes during SSR/hydration
      return {
        container: 'product-grid-view',
        card: ''
      }
    }

    if (view === 'list') {
      return {
        container: 'product-list-view',
        card: 'list-card'
      }
    }

    return {
      container: 'product-grid-view',
      card: 'grid-card'
    }
  }, [view, isLoaded])

  return getGridClasses()
}

// Hook for components that need to know about view changes
export function useProductViewListener(callback: (view: ProductView) => void) {
  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      callback(event.detail.view)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('product-view-changed', handleViewChange as EventListener)
      return () => {
        window.removeEventListener('product-view-changed', handleViewChange as EventListener)
      }
    }
  }, [callback])
}