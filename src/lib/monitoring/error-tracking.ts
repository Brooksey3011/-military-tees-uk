// Error tracking and monitoring service for Military Tees UK
// Supports multiple providers: Sentry, LogTail, and custom logging

interface ErrorContext {
  userId?: string
  userEmail?: string
  sessionId?: string
  userAgent?: string
  url?: string
  timestamp?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  tags?: Record<string, string>
  extra?: Record<string, any>
}

interface ErrorEvent {
  message: string
  error?: Error
  context?: ErrorContext
  stack?: string
  fingerprint?: string[]
}

interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  tags?: Record<string, string>
  timestamp?: Date
}

class ErrorTrackingService {
  private isProduction = process.env.NODE_ENV === 'production'
  private sentryEnabled = Boolean(process.env.SENTRY_DSN)
  private logTailEnabled = Boolean(process.env.LOGTAIL_TOKEN)

  constructor() {
    this.initializeSentry()
    this.initializeLogTail()
  }

  private initializeSentry() {
    if (this.sentryEnabled && typeof window !== 'undefined') {
      // Client-side Sentry initialization would go here
      console.log('Sentry error tracking initialized')
    } else if (this.sentryEnabled) {
      // Server-side Sentry initialization would go here
      console.log('Sentry server-side tracking initialized')
    }
  }

  private initializeLogTail() {
    if (this.logTailEnabled) {
      console.log('LogTail logging initialized')
    }
  }

  // Core error tracking method
  async captureError(event: ErrorEvent): Promise<void> {
    const enhancedContext = {
      ...event.context,
      timestamp: event.context?.timestamp || new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service: 'military-tees-uk',
      version: process.env.npm_package_version || '1.0.0'
    }

    const errorData = {
      message: event.message,
      stack: event.error?.stack || event.stack,
      fingerprint: event.fingerprint || [event.message],
      context: enhancedContext,
      level: event.context?.severity || 'medium'
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('🚨 Error Captured:', {
        message: event.message,
        error: event.error,
        context: enhancedContext
      })
    }

    // Send to external services
    await Promise.allSettled([
      this.sendToSentry(errorData),
      this.sendToLogTail(errorData),
      this.sendToCustomEndpoint(errorData)
    ])
  }

  private async sendToSentry(errorData: any): Promise<void> {
    if (!this.sentryEnabled) return

    try {
      // In a real implementation, use Sentry SDK
      // Sentry.captureException(errorData)
      console.log('Error sent to Sentry:', errorData.message)
    } catch (error) {
      console.error('Failed to send error to Sentry:', error)
    }
  }

  private async sendToLogTail(errorData: any): Promise<void> {
    if (!this.logTailEnabled) return

    try {
      // In a real implementation, send to LogTail API
      const logTailPayload = {
        level: errorData.level,
        message: errorData.message,
        dt: new Date().toISOString(),
        context: errorData.context,
        stack: errorData.stack
      }

      console.log('Error sent to LogTail:', logTailPayload)
    } catch (error) {
      console.error('Failed to send error to LogTail:', error)
    }
  }

  private async sendToCustomEndpoint(errorData: any): Promise<void> {
    try {
      // Send to internal logging API if available
      if (typeof window !== 'undefined') {
        await fetch('/api/monitoring/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData)
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Failed to send error to custom endpoint:', error)
    }
  }

  // Convenience methods for different error types
  async captureException(error: Error, context?: ErrorContext): Promise<void> {
    await this.captureError({
      message: error.message,
      error,
      context: {
        ...context,
        severity: context?.severity || 'high'
      }
    })
  }

  async captureMessage(message: string, context?: ErrorContext): Promise<void> {
    await this.captureError({
      message,
      context: {
        ...context,
        severity: context?.severity || 'medium'
      }
    })
  }

  // E-commerce specific error tracking
  async capturePaymentError(error: Error, orderData?: any): Promise<void> {
    await this.captureError({
      message: `Payment Error: ${error.message}`,
      error,
      context: {
        severity: 'critical',
        tags: {
          category: 'payment',
          provider: 'stripe'
        },
        extra: {
          orderData: orderData ? {
            orderId: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency
          } : undefined
        }
      }
    })
  }

  async captureAuthError(error: Error, userContext?: any): Promise<void> {
    await this.captureError({
      message: `Authentication Error: ${error.message}`,
      error,
      context: {
        severity: 'high',
        tags: {
          category: 'authentication',
          provider: 'supabase'
        },
        extra: {
          userId: userContext?.userId,
          action: userContext?.action
        }
      }
    })
  }

  async captureAPIError(error: Error, endpoint: string, statusCode?: number): Promise<void> {
    await this.captureError({
      message: `API Error: ${error.message}`,
      error,
      context: {
        severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
        tags: {
          category: 'api',
          endpoint,
          status_code: statusCode?.toString() || 'unknown'
        }
      }
    })
  }

  // Performance tracking
  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    const performanceData = {
      ...metric,
      timestamp: metric.timestamp || new Date(),
      environment: process.env.NODE_ENV,
      service: 'military-tees-uk'
    }

    // Log performance metric
    if (!this.isProduction) {
      console.log('📊 Performance Metric:', performanceData)
    }

    // Send to monitoring services
    await this.sendPerformanceMetric(performanceData)
  }

  private async sendPerformanceMetric(metric: any): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/monitoring/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric)
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Failed to send performance metric:', error)
    }
  }

  // User context management
  setUserContext(userId: string, email?: string, additionalData?: Record<string, any>): void {
    // Set user context for all subsequent error reports
    this.userContext = {
      userId,
      userEmail: email,
      ...additionalData
    }

    if (this.sentryEnabled) {
      // Sentry.setUser({ id: userId, email })
      console.log('User context set for error tracking:', { userId, email })
    }
  }

  clearUserContext(): void {
    this.userContext = undefined
    if (this.sentryEnabled) {
      // Sentry.setUser(null)
      console.log('User context cleared')
    }
  }

  private userContext?: ErrorContext

  // Get current context for error reports
  private getCurrentContext(): ErrorContext {
    const baseContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    return {
      ...baseContext,
      ...this.userContext
    }
  }

  // React Error Boundary integration
  captureReactError(error: Error, errorInfo: any): void {
    this.captureError({
      message: `React Error: ${error.message}`,
      error,
      context: {
        ...this.getCurrentContext(),
        severity: 'high',
        tags: {
          category: 'react',
          component: errorInfo.componentStack?.split('\n')[0] || 'unknown'
        },
        extra: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      }
    })
  }
}

// Export singleton instance
export const errorTracker = new ErrorTrackingService()

// Convenience functions for common use cases
export const captureError = (error: Error, context?: ErrorContext) => 
  errorTracker.captureException(error, context)

export const captureMessage = (message: string, context?: ErrorContext) => 
  errorTracker.captureMessage(message, context)

export const trackPerformance = (metric: PerformanceMetric) => 
  errorTracker.trackPerformance(metric)

// E-commerce specific exports
export const capturePaymentError = (error: Error, orderData?: any) => 
  errorTracker.capturePaymentError(error, orderData)

export const captureAuthError = (error: Error, userContext?: any) => 
  errorTracker.captureAuthError(error, userContext)

export const captureAPIError = (error: Error, endpoint: string, statusCode?: number) => 
  errorTracker.captureAPIError(error, endpoint, statusCode)

// Context management exports
export const setUserContext = (userId: string, email?: string, additionalData?: Record<string, any>) => 
  errorTracker.setUserContext(userId, email, additionalData)

export const clearUserContext = () => 
  errorTracker.clearUserContext()

export default errorTracker