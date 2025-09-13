// Sentry Integration for Production Error Tracking
// Install: npm install @sentry/nextjs
// This file provides Sentry integration for production error tracking

interface SentryConfig {
  dsn: string
  environment: string
  tracesSampleRate: number
  profilesSampleRate: number
  beforeSend?: (event: any) => any
}

// Sentry integration for production error tracking
export function initializeSentry(): void {
  // Only initialize in production or when SENTRY_DSN is provided
  if (process.env.NODE_ENV !== 'production' && !process.env.SENTRY_DSN) {
    console.log('🔧 Sentry not initialized - development mode or no DSN provided')
    return
  }

  try {
    // Dynamic import to avoid errors when @sentry/nextjs is not installed
    const initSentry = async () => {
      try {
        const Sentry = await import('@sentry/nextjs' as any)

        const config: SentryConfig = {
          dsn: process.env.SENTRY_DSN || '',
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
          profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
          beforeSend(event) {
            // Filter out non-critical errors in development
            if (process.env.NODE_ENV === 'development') {
              return null
            }

            // Filter sensitive information
            if (event.request?.headers) {
              delete event.request.headers['authorization']
              delete event.request.headers['cookie']
            }

            return event
          }
        }

        Sentry.init(config)

        console.log('✅ Sentry initialized successfully')

        // Set up custom tags for e-commerce context
        Sentry.setTags({
          component: 'military-tees-uk',
          version: process.env.npm_package_version || '1.0.0'
        })

        return Sentry
      } catch (importError) {
        console.warn('⚠️ Sentry package not found. Install @sentry/nextjs for production error tracking')
        return null
      }
    }

    // Initialize async
    initSentry()

  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error)
  }
}

/**
 * Send error to Sentry with business context
 */
export async function captureError(
  error: Error | string,
  context: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: 'error' | 'warning' | 'info' | 'debug'
    user?: {
      id?: string
      email?: string
    }
  } = {}
): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs' as any)

    // Set user context if provided
    if (context.user) {
      Sentry.setUser(context.user)
    }

    // Set tags for filtering
    if (context.tags) {
      Sentry.setTags(context.tags)
    }

    // Set additional context
    if (context.extra) {
      Sentry.setExtras(context.extra)
    }

    // Capture the error
    if (typeof error === 'string') {
      Sentry.captureMessage(error, context.level || 'error')
    } else {
      Sentry.captureException(error)
    }

  } catch (importError) {
    // Fallback to console logging if Sentry is not available
    console.error('❌ Error capture (Sentry not available):', error, context)
  }
}

/**
 * Track business-critical transactions
 */
export async function trackTransaction(
  name: string,
  operation: string,
  callback: () => Promise<any>
): Promise<any> {
  try {
    const Sentry = await import('@sentry/nextjs' as any)

    const transaction = Sentry.startTransaction({ name, op: operation })

    try {
      const result = await callback()
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      throw error
    } finally {
      transaction.finish()
    }

  } catch (importError) {
    // Fallback - just execute callback without tracking
    return await callback()
  }
}

// Business-specific error capture functions
export const sentryHelpers = {
  /**
   * Capture checkout errors with e-commerce context
   */
  captureCheckoutError: (error: Error, orderId?: string, cartValue?: number) => {
    captureError(error, {
      tags: {
        error_type: 'checkout_failure',
        critical: 'true'
      },
      extra: {
        orderId,
        cartValue,
        timestamp: new Date().toISOString()
      },
      level: 'error'
    })
  },

  /**
   * Capture payment errors with financial context
   */
  capturePaymentError: (error: Error, amount: number, currency: string, paymentMethod?: string) => {
    captureError(error, {
      tags: {
        error_type: 'payment_failure',
        critical: 'true',
        payment_method: paymentMethod || 'unknown'
      },
      extra: {
        amount,
        currency,
        timestamp: new Date().toISOString()
      },
      level: 'error'
    })
  },

  /**
   * Capture API errors with endpoint context
   */
  captureApiError: (error: Error, endpoint: string, method: string, statusCode?: number) => {
    captureError(error, {
      tags: {
        error_type: 'api_failure',
        endpoint,
        method
      },
      extra: {
        statusCode,
        timestamp: new Date().toISOString()
      },
      level: 'error'
    })
  },

  /**
   * Capture inventory errors
   */
  captureInventoryError: (error: Error, productId: string, action: string) => {
    captureError(error, {
      tags: {
        error_type: 'inventory_error',
        product_id: productId,
        action
      },
      level: 'warning'
    })
  }
}

// Performance monitoring helpers
export const sentryPerformance = {
  /**
   * Track checkout performance
   */
  trackCheckout: (callback: () => Promise<any>) => {
    return trackTransaction('checkout-process', 'checkout', callback)
  },

  /**
   * Track payment processing performance
   */
  trackPayment: (callback: () => Promise<any>) => {
    return trackTransaction('payment-process', 'payment', callback)
  },

  /**
   * Track database operations
   */
  trackDatabaseOperation: (operation: string, callback: () => Promise<any>) => {
    return trackTransaction(`db-${operation}`, 'db.query', callback)
  }
}