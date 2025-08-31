"use client"

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
  }
}

interface PlausibleProviderProps {
  domain: string
  children: React.ReactNode
}

export function PlausibleProvider({ domain, children }: PlausibleProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views on route changes
    if (window.plausible) {
      window.plausible('pageview')
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  )
}

// Custom event tracking functions
export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props })
  }
}

// E-commerce specific tracking
export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  trackEvent('Purchase', {
    orderId,
    value,
    currency: 'GBP',
    itemCount: items.length
  })
}

export const trackAddToCart = (productName: string, value: number, variant?: string) => {
  trackEvent('Add to Cart', {
    product: productName,
    value,
    variant
  })
}

export const trackBeginCheckout = (value: number, itemCount: number) => {
  trackEvent('Begin Checkout', {
    value,
    itemCount
  })
}

export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('Search', {
    query,
    resultsCount
  })
}

export const trackNewsletterSignup = (source: string) => {
  trackEvent('Newsletter Signup', {
    source
  })
}

export const trackCustomQuote = (category: string, value?: number) => {
  trackEvent('Custom Quote Request', {
    category,
    value
  })
}