// Analytics and performance monitoring for Military Tees UK
// Supports Plausible Analytics, Google Analytics, and custom analytics

interface PageViewEvent {
  url: string
  title?: string
  referrer?: string
  userAgent?: string
  timestamp?: Date
  userId?: string
  sessionId?: string
}

interface CustomEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp?: Date
}

interface ConversionEvent {
  event: 'purchase' | 'signup' | 'quote_request' | 'newsletter_signup'
  value?: number
  currency?: string
  orderId?: string
  items?: Array<{
    id: string
    name: string
    category: string
    quantity: number
    price: number
  }>
  userId?: string
}

interface PerformanceMetrics {
  // Web Vitals
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte

  // Custom metrics
  pageLoadTime?: number
  apiResponseTime?: number
  searchResponseTime?: number
  checkoutTime?: number

  // Technical metrics
  memoryUsage?: number
  connectionType?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
}

class AnalyticsService {
  private isProduction = process.env.NODE_ENV === 'production'
  private plausibleEnabled = Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
  private gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializePlausible()
    this.initializeGA()
    this.initializeWebVitals()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializePlausible() {
    if (this.plausibleEnabled && typeof window !== 'undefined') {
      // Plausible analytics script would be loaded via _document.tsx or app
      console.log('Plausible Analytics initialized')
    }
  }

  private initializeGA() {
    if (this.gaEnabled && typeof window !== 'undefined') {
      // Google Analytics would be initialized here
      console.log('Google Analytics initialized')
    }
  }

  private initializeWebVitals() {
    if (typeof window !== 'undefined') {
      // Initialize Web Vitals monitoring
      this.setupWebVitalsTracking()
    }
  }

  private setupWebVitalsTracking() {
    // Web Vitals tracking implementation
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance({
            LCP: entry.startTime
          })
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance({
            FID: (entry as any).processingStart - entry.startTime
          })
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.trackPerformance({ CLS: clsValue })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  // Page view tracking
  async trackPageView(event: PageViewEvent): Promise<void> {
    const enhancedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
      sessionId: this.sessionId,
      userId: this.userId || event.userId
    }

    // Log in development
    if (!this.isProduction) {
      console.log('📄 Page View:', enhancedEvent)
    }

    // Send to analytics providers
    await Promise.allSettled([
      this.sendToPlausible('pageview', enhancedEvent),
      this.sendToGA('page_view', enhancedEvent),
      this.sendToCustomAnalytics('pageview', enhancedEvent)
    ])
  }

  // Custom event tracking
  async trackEvent(event: CustomEvent): Promise<void> {
    const enhancedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
      sessionId: this.sessionId,
      userId: this.userId || event.userId
    }

    if (!this.isProduction) {
      console.log('🎯 Custom Event:', enhancedEvent)
    }

    await Promise.allSettled([
      this.sendToPlausible(event.name, enhancedEvent),
      this.sendToGA(event.name, enhancedEvent),
      this.sendToCustomAnalytics('custom_event', enhancedEvent)
    ])
  }

  // E-commerce conversion tracking
  async trackConversion(event: ConversionEvent): Promise<void> {
    const enhancedEvent = {
      ...event,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    if (!this.isProduction) {
      console.log('💰 Conversion Event:', enhancedEvent)
    }

    await Promise.allSettled([
      this.sendToPlausible(event.event, enhancedEvent),
      this.sendToGA('purchase', enhancedEvent),
      this.sendToCustomAnalytics('conversion', enhancedEvent)
    ])
  }

  // Performance metrics tracking
  async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    const performanceData = {
      ...metrics,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    if (!this.isProduction) {
      console.log('⚡ Performance Metrics:', performanceData)
    }

    await this.sendToCustomAnalytics('performance', performanceData)
  }

  private async sendToPlausible(eventName: string, data: any): Promise<void> {
    if (!this.plausibleEnabled || typeof window === 'undefined') return

    try {
      // Send to Plausible Analytics
      if (window.plausible) {
        window.plausible(eventName, {
          props: {
            ...data.properties,
            userId: data.userId,
            sessionId: data.sessionId
          }
        })
      }
    } catch (error) {
      console.error('Failed to send event to Plausible:', error)
    }
  }

  private async sendToGA(eventName: string, data: any): Promise<void> {
    if (!this.gaEnabled || typeof window === 'undefined') return

    try {
      // Send to Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, {
          ...data.properties,
          user_id: data.userId,
          session_id: data.sessionId
        })
      }
    } catch (error) {
      console.error('Failed to send event to Google Analytics:', error)
    }
  }

  private async sendToCustomAnalytics(eventType: string, data: any): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/monitoring/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            data,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Failed to send to custom analytics:', error)
    }
  }

  // E-commerce specific tracking methods
  async trackProductView(productId: string, productName: string, category: string, price: number): Promise<void> {
    await this.trackEvent({
      name: 'product_view',
      properties: {
        product_id: productId,
        product_name: productName,
        category,
        price
      }
    })
  }

  async trackAddToCart(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    await this.trackEvent({
      name: 'add_to_cart',
      properties: {
        product_id: productId,
        product_name: productName,
        price,
        quantity,
        value: price * quantity
      }
    })
  }

  async trackPurchase(orderId: string, value: number, currency: string, items: any[]): Promise<void> {
    await this.trackConversion({
      event: 'purchase',
      value,
      currency,
      orderId,
      items,
      userId: this.userId
    })
  }

  async trackSearch(query: string, resultsCount: number): Promise<void> {
    await this.trackEvent({
      name: 'search',
      properties: {
        search_term: query,
        results_count: resultsCount
      }
    })
  }

  async trackCustomQuoteRequest(orderType: string, quantity: number): Promise<void> {
    await this.trackConversion({
      event: 'quote_request',
      properties: {
        order_type: orderType,
        quantity
      }
    })
  }

  // User identification
  setUserId(userId: string): void {
    this.userId = userId
    
    if (this.plausibleEnabled && typeof window !== 'undefined' && window.plausible) {
      window.plausible('User Identified', { props: { userId } })
    }

    if (this.gaEnabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        user_id: userId
      })
    }
  }

  clearUserId(): void {
    this.userId = undefined
  }

  // Session management
  getSessionId(): string {
    return this.sessionId
  }

  renewSession(): string {
    this.sessionId = this.generateSessionId()
    return this.sessionId
  }

  // Utility methods for measuring performance
  startTimer(name: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.trackPerformance({
        [`${name}Time`]: duration
      } as any)
    }
  }

  async measureApiCall<T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      await this.trackPerformance({
        apiResponseTime: duration
      })
      
      await this.trackEvent({
        name: 'api_call_success',
        properties: {
          endpoint,
          duration,
          status: 'success'
        }
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      await this.trackEvent({
        name: 'api_call_error',
        properties: {
          endpoint,
          duration,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Convenience functions
export const trackPageView = (url: string, title?: string) =>
  analytics.trackPageView({ url, title })

export const trackEvent = (name: string, properties?: Record<string, any>) =>
  analytics.trackEvent({ name, properties })

export const trackConversion = (event: ConversionEvent) =>
  analytics.trackConversion(event)

export const trackPerformance = (metrics: PerformanceMetrics) =>
  analytics.trackPerformance(metrics)

// E-commerce specific exports
export const trackProductView = (productId: string, productName: string, category: string, price: number) =>
  analytics.trackProductView(productId, productName, category, price)

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) =>
  analytics.trackAddToCart(productId, productName, price, quantity)

export const trackPurchase = (orderId: string, value: number, currency: string, items: any[]) =>
  analytics.trackPurchase(orderId, value, currency, items)

export const trackSearch = (query: string, resultsCount: number) =>
  analytics.trackSearch(query, resultsCount)

export const trackCustomQuoteRequest = (orderType: string, quantity: number) =>
  analytics.trackCustomQuoteRequest(orderType, quantity)

// User and session management
export const setUserId = (userId: string) => analytics.setUserId(userId)
export const clearUserId = () => analytics.clearUserId()
export const getSessionId = () => analytics.getSessionId()

// Performance measurement utilities
export const startTimer = (name: string) => analytics.startTimer(name)
export const measureApiCall = <T>(apiCall: () => Promise<T>, endpoint: string) =>
  analytics.measureApiCall(apiCall, endpoint)

export default analytics

// Type declarations for global analytics objects
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
    gtag?: (...args: any[]) => void
  }
}