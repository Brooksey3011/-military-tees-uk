// Basic monitoring and error reporting utilities
// This can be extended with Sentry or other monitoring services

interface ErrorReport {
  message: string
  stack?: string
  context?: Record<string, any>
  timestamp: string
  url?: string
  userAgent?: string
}

class MonitoringService {
  private static instance: MonitoringService
  private errorReports: ErrorReport[] = []
  private isEnabled = process.env.NODE_ENV === 'production'

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Log errors to console and store for reporting
  logError(error: Error, context?: Record<string, any>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    }

    // Always log to console for development
    console.error('Error logged:', report)

    if (this.isEnabled) {
      this.errorReports.push(report)
      
      // In a real app, send to monitoring service
      // this.sendToMonitoringService(report)
    }
  }

  // Log performance metrics
  logPerformance(name: string, duration: number, context?: Record<string, any>) {
    if (!this.isEnabled) return

    console.log(`Performance: ${name} took ${duration}ms`, context)
    
    // In a real app, send to analytics service
    // this.sendPerformanceMetric({ name, duration, context })
  }

  // Log custom events
  logEvent(name: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    console.log(`Event: ${name}`, properties)
    
    // In a real app, send to analytics service
    // this.sendEvent({ name, properties })
  }

  // Get error reports (for admin dashboard)
  getErrorReports(): ErrorReport[] {
    return this.errorReports
  }

  // Clear error reports
  clearErrorReports() {
    this.errorReports = []
  }

  // Future: Send to external monitoring service
  private async sendToMonitoringService(report: ErrorReport) {
    // Example: Send to Sentry, LogRocket, etc.
    try {
      // await fetch('/api/monitoring/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // })
    } catch (err) {
      console.error('Failed to send error report:', err)
    }
  }
}

export const monitoring = MonitoringService.getInstance()

// Error boundary hook for React components
export function useErrorHandler() {
  return (error: Error, context?: Record<string, any>) => {
    monitoring.logError(error, context)
  }
}

// Performance timing hook
export function usePerformanceTimer(name: string) {
  const startTime = performance.now()
  
  return (context?: Record<string, any>) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    monitoring.logPerformance(name, duration, context)
  }
}

// Global error handler setup
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      monitoring.logError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        { type: 'unhandledrejection' }
      )
    })

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      monitoring.logError(
        new Error(event.message),
        { 
          type: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })
  }
}

// API error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    monitoring.logError(error as Error, context)
    throw error
  }
}