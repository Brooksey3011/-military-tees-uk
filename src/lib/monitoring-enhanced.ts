// Enhanced E-commerce Monitoring & Error Tracking for Military Tees UK
import { NextRequest } from 'next/server'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Business-critical error types for e-commerce
export enum BusinessErrorType {
  CHECKOUT_FAILURE = 'checkout_failure',
  PAYMENT_ERROR = 'payment_error',
  ORDER_PROCESSING = 'order_processing',
  INVENTORY_SYNC = 'inventory_sync',
  EMAIL_DELIVERY = 'email_delivery',
  AUTH_SYSTEM = 'auth_system',
  DATABASE_ERROR = 'database_error',
  API_FAILURE = 'api_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

// Enhanced error context for e-commerce debugging
export interface ErrorContext {
  userId?: string
  sessionId?: string
  orderId?: string
  productId?: string
  variantId?: string
  cartValue?: number
  userAgent?: string
  ip?: string
  path?: string
  method?: string
  timestamp: Date
  severity: ErrorSeverity
  type: BusinessErrorType
  additionalData?: Record<string, any>
}

// Performance metrics interface
export interface PerformanceMetric {
  metric: string
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

// Business metric for revenue tracking
export interface BusinessMetric {
  event: string
  value: number
  metadata: Record<string, any>
  timestamp: Date
}

// Alert configuration
export interface Alert {
  id: string
  type: string
  message: string
  severity: ErrorSeverity
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

// Monitoring configuration
const MONITORING_CONFIG = {
  // Feature flags
  errorTracking: true,
  performanceMonitoring: true,
  businessMetrics: true,
  alerting: true,

  // Alert thresholds
  thresholds: {
    checkoutFailureRate: 0.05,     // 5% failure rate
    paymentErrorRate: 0.02,        // 2% payment error rate
    apiResponseTime: 5000,         // 5 seconds
    errorBurst: 10,                // 10 errors in 1 minute
    criticalErrorBurst: 3,         // 3 critical errors in 5 minutes
    uptimeThreshold: 0.99,         // 99% uptime
    orderProcessingTime: 30000,    // 30 seconds for order processing
    inventoryMismatch: 5,          // 5 inventory sync errors
    emailFailureRate: 0.10         // 10% email delivery failures
  },

  // Data retention
  retentionDays: {
    errors: 30,
    performance: 7,
    business: 90,
    alerts: 30
  }
}

// Enhanced monitoring store
interface EnhancedMonitoringStore {
  errors: Array<ErrorContext & { message: string; stack?: string }>
  metrics: Array<PerformanceMetric>
  businessMetrics: Array<BusinessMetric>
  alerts: Array<Alert>
  uptime: {
    startTime: Date
    lastCheck: Date
    totalRequests: number
    successfulRequests: number
  }
}

// Initialize monitoring store
const monitoringStore: EnhancedMonitoringStore = {
  errors: [],
  metrics: [],
  businessMetrics: [],
  alerts: [],
  uptime: {
    startTime: new Date(),
    lastCheck: new Date(),
    totalRequests: 0,
    successfulRequests: 0
  }
}

/**
 * Enhanced error tracking with business context
 */
export function trackError(
  error: Error | string,
  context: Partial<ErrorContext> = {},
  request?: NextRequest
): void {
  if (!MONITORING_CONFIG.errorTracking) return

  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'object' ? error.stack : undefined

  const enrichedContext: ErrorContext = {
    timestamp: new Date(),
    severity: context.severity || ErrorSeverity.MEDIUM,
    type: context.type || BusinessErrorType.API_FAILURE,
    ...context
  }

  // Add request context if available
  if (request) {
    enrichedContext.userAgent = request.headers.get('user-agent') || undefined
    enrichedContext.ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    enrichedContext.path = request.nextUrl?.pathname
    enrichedContext.method = request.method
  }

  // Store error
  monitoringStore.errors.push({
    ...enrichedContext,
    message: errorMessage,
    stack: errorStack
  })

  // Enhanced logging with business context
  const logLevel = getLogLevel(enrichedContext.severity)
  console[logLevel](`🚨 [${enrichedContext.type.toUpperCase()}] ${errorMessage}`, {
    context: enrichedContext,
    stack: errorStack
  })

  // Handle critical business errors
  if (isCriticalBusinessError(enrichedContext)) {
    handleCriticalBusinessError(errorMessage, enrichedContext)
  }

  // Check for error patterns
  checkErrorPatterns()

  // Cleanup old data periodically
  cleanupOldData()
}

/**
 * Track business-critical checkout events
 */
export function trackCheckoutEvent(
  step: 'initiated' | 'shipping_entered' | 'payment_method_selected' | 'order_reviewed' | 'payment_submitted' | 'completed' | 'failed' | 'abandoned',
  metadata: {
    orderId?: string
    userId?: string
    sessionId?: string
    cartValue: number
    itemCount: number
    paymentMethod?: string
    error?: string
    abandonedAt?: string
  }
): void {
  const timestamp = new Date()

  // Track as business metric
  trackBusinessMetric(`checkout.${step}`, metadata.cartValue, {
    step,
    itemCount: metadata.itemCount,
    orderId: metadata.orderId,
    userId: metadata.userId,
    paymentMethod: metadata.paymentMethod,
    timestamp: timestamp.toISOString()
  })

  // Handle failures with enhanced tracking
  if (step === 'failed') {
    trackError(
      metadata.error || 'Checkout process failed',
      {
        type: BusinessErrorType.CHECKOUT_FAILURE,
        severity: ErrorSeverity.CRITICAL,
        orderId: metadata.orderId,
        userId: metadata.userId,
        cartValue: metadata.cartValue,
        additionalData: {
          itemCount: metadata.itemCount,
          paymentMethod: metadata.paymentMethod
        }
      }
    )

    // Create immediate alert for checkout failure
    createAlert('CHECKOUT_FAILURE', `Checkout failed for order ${metadata.orderId || 'unknown'}`, ErrorSeverity.CRITICAL)
  }

  // Track abandonments for funnel analysis
  if (step === 'abandoned') {
    console.warn(`🛒 CHECKOUT ABANDONED: Cart value £${metadata.cartValue}`, metadata)
  }

  console.info(`🛒 CHECKOUT ${step.toUpperCase()}:`, metadata)
}

/**
 * Enhanced payment monitoring
 */
export function trackPaymentEvent(
  status: 'initiated' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'disputed',
  metadata: {
    orderId: string
    amount: number
    currency: string
    paymentMethod?: string
    stripeSessionId?: string
    customerId?: string
    error?: string
    processingTime?: number
  }
): void {
  // Track as business metric
  trackBusinessMetric(`payment.${status}`, metadata.amount, {
    status,
    currency: metadata.currency,
    paymentMethod: metadata.paymentMethod,
    orderId: metadata.orderId,
    customerId: metadata.customerId,
    processingTime: metadata.processingTime
  })

  // Handle payment failures
  if (status === 'failed') {
    trackError(
      metadata.error || 'Payment processing failed',
      {
        type: BusinessErrorType.PAYMENT_ERROR,
        severity: ErrorSeverity.CRITICAL,
        orderId: metadata.orderId,
        cartValue: metadata.amount,
        additionalData: {
          paymentMethod: metadata.paymentMethod,
          stripeSessionId: metadata.stripeSessionId,
          currency: metadata.currency
        }
      }
    )

    // Immediate alert for payment failures
    createAlert('PAYMENT_FAILURE', `Payment failed for order ${metadata.orderId}: £${metadata.amount}`, ErrorSeverity.CRITICAL)
  }

  // Track successful payments for revenue monitoring
  if (status === 'succeeded') {
    console.info(`💰 REVENUE: £${metadata.amount} - Order ${metadata.orderId}`)
    trackBusinessMetric('revenue.earned', metadata.amount, {
      orderId: metadata.orderId,
      paymentMethod: metadata.paymentMethod
    })
  }

  console.info(`💳 PAYMENT ${status.toUpperCase()}: £${metadata.amount}`, metadata)
}

/**
 * Track inventory-related events
 */
export function trackInventoryEvent(
  event: 'stock_check' | 'stock_updated' | 'low_stock' | 'out_of_stock' | 'sync_failed',
  metadata: {
    productId: string
    variantId?: string
    currentStock: number
    requestedQuantity?: number
    threshold?: number
    error?: string
  }
): void {
  trackBusinessMetric(`inventory.${event}`, metadata.currentStock, metadata)

  // Handle critical inventory issues
  if (event === 'sync_failed') {
    trackError(
      metadata.error || 'Inventory synchronization failed',
      {
        type: BusinessErrorType.INVENTORY_SYNC,
        severity: ErrorSeverity.HIGH,
        productId: metadata.productId,
        variantId: metadata.variantId,
        additionalData: metadata
      }
    )
  }

  // Alert on stock issues
  if (event === 'out_of_stock') {
    createAlert('OUT_OF_STOCK', `Product ${metadata.productId} is out of stock`, ErrorSeverity.MEDIUM)
  }

  console.info(`📦 INVENTORY ${event.toUpperCase()}:`, metadata)
}

/**
 * API endpoint performance monitoring
 */
export function monitorApiEndpoint<T>(
  endpointName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  // Track request
  monitoringStore.uptime.totalRequests++

  return operation()
    .then(result => {
      const duration = Date.now() - startTime

      // Track successful request
      monitoringStore.uptime.successfulRequests++
      trackPerformance(`api.${endpointName}.duration`, duration)
      trackPerformance(`api.${endpointName}.success`, 1)

      // Log slow API calls
      if (duration > MONITORING_CONFIG.thresholds.apiResponseTime) {
        console.warn(`⚡ SLOW API: ${endpointName} took ${duration}ms`)
        createAlert('SLOW_API', `${endpointName} is responding slowly (${duration}ms)`, ErrorSeverity.MEDIUM)
      } else {
        console.debug(`✅ API ${endpointName}: ${duration}ms`)
      }

      return result
    })
    .catch(error => {
      const duration = Date.now() - startTime

      trackPerformance(`api.${endpointName}.duration`, duration)
      trackPerformance(`api.${endpointName}.error`, 1)

      trackError(error, {
        type: BusinessErrorType.API_FAILURE,
        severity: ErrorSeverity.HIGH,
        path: endpointName,
        additionalData: { responseTime: duration }
      })

      throw error
    })
}

/**
 * Track business metrics
 */
export function trackBusinessMetric(
  event: string,
  value: number,
  metadata: Record<string, any> = {}
): void {
  if (!MONITORING_CONFIG.businessMetrics) return

  const businessMetric: BusinessMetric = {
    event: `business.${event}`,
    value,
    metadata,
    timestamp: new Date()
  }

  monitoringStore.businessMetrics.push(businessMetric)

  console.info(`📊 BUSINESS METRIC: ${event} = ${value}`, metadata)
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  metric: string,
  value: number,
  metadata?: Record<string, any>
): void {
  if (!MONITORING_CONFIG.performanceMonitoring) return

  const performanceMetric: PerformanceMetric = {
    metric,
    value,
    timestamp: new Date(),
    metadata
  }

  monitoringStore.metrics.push(performanceMetric)
}

/**
 * Create system alert
 */
export function createAlert(
  type: string,
  message: string,
  severity: ErrorSeverity
): void {
  if (!MONITORING_CONFIG.alerting) return

  const alert: Alert = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    severity,
    timestamp: new Date(),
    resolved: false
  }

  monitoringStore.alerts.push(alert)

  // Enhanced logging for alerts
  const logLevel = getLogLevel(severity)
  console[logLevel](`🚨 ALERT [${severity.toUpperCase()}]: ${message}`, alert)
}

/**
 * Get comprehensive monitoring dashboard data
 */
export function getMonitoringDashboard() {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

  // Recent errors with business context
  const recentErrors = monitoringStore.errors
    .filter(error => error.timestamp > last24h)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)

  // Business metrics for revenue tracking
  const businessMetrics = monitoringStore.businessMetrics
    .filter(metric => metric.timestamp > last24h)

  // Calculate conversion funnel
  const checkoutEvents = businessMetrics.filter(m => m.event.startsWith('business.checkout.'))
  const conversionFunnel = {
    initiated: checkoutEvents.filter(e => e.event.includes('initiated')).length,
    completed: checkoutEvents.filter(e => e.event.includes('completed')).length,
    failed: checkoutEvents.filter(e => e.event.includes('failed')).length,
    abandoned: checkoutEvents.filter(e => e.event.includes('abandoned')).length
  }

  // Revenue tracking
  const revenueMetrics = businessMetrics.filter(m => m.event === 'business.revenue.earned')
  const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0)

  // Uptime calculation
  const uptimePercentage = monitoringStore.uptime.totalRequests > 0
    ? (monitoringStore.uptime.successfulRequests / monitoringStore.uptime.totalRequests) * 100
    : 100

  // Active alerts
  const activeAlerts = monitoringStore.alerts
    .filter(alert => !alert.resolved)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return {
    summary: {
      totalErrors24h: recentErrors.length,
      criticalErrors24h: recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      activeAlerts: activeAlerts.length,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      totalRevenue24h: totalRevenue,
      successfulOrders24h: conversionFunnel.completed,
      failedOrders24h: conversionFunnel.failed
    },
    conversionFunnel,
    recentErrors: recentErrors.slice(0, 10),
    businessMetrics: businessMetrics.slice(-20),
    activeAlerts,
    uptime: {
      ...monitoringStore.uptime,
      percentage: uptimePercentage
    }
  }
}

// Helper functions
function getLogLevel(severity: ErrorSeverity): 'debug' | 'info' | 'warn' | 'error' {
  switch (severity) {
    case ErrorSeverity.LOW: return 'debug'
    case ErrorSeverity.MEDIUM: return 'info'
    case ErrorSeverity.HIGH: return 'warn'
    case ErrorSeverity.CRITICAL: return 'error'
    default: return 'error'
  }
}

function isCriticalBusinessError(context: ErrorContext): boolean {
  return context.severity === ErrorSeverity.CRITICAL ||
         context.type === BusinessErrorType.CHECKOUT_FAILURE ||
         context.type === BusinessErrorType.PAYMENT_ERROR ||
         context.type === BusinessErrorType.ORDER_PROCESSING
}

function handleCriticalBusinessError(message: string, context: ErrorContext): void {
  console.error('🚨🚨 CRITICAL BUSINESS ERROR 🚨🚨', { message, context })

  createAlert('CRITICAL_BUSINESS_ERROR', `${context.type}: ${message}`, ErrorSeverity.CRITICAL)

  // In production, implement:
  // - Send Slack/Discord notifications
  // - Send SMS to on-call team
  // - Create incident in incident management system
  // - Send email alerts to business stakeholders
}

function checkErrorPatterns(): void {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  // Check for error bursts
  const recentErrors = monitoringStore.errors.filter(e => e.timestamp > oneMinuteAgo)
  if (recentErrors.length >= MONITORING_CONFIG.thresholds.errorBurst) {
    createAlert('ERROR_BURST', `${recentErrors.length} errors in the last minute`, ErrorSeverity.HIGH)
  }

  // Check for critical error bursts
  const criticalErrors = monitoringStore.errors.filter(
    e => e.timestamp > fiveMinutesAgo && e.severity === ErrorSeverity.CRITICAL
  )
  if (criticalErrors.length >= MONITORING_CONFIG.thresholds.criticalErrorBurst) {
    createAlert('CRITICAL_ERROR_BURST', `${criticalErrors.length} critical errors in 5 minutes`, ErrorSeverity.CRITICAL)
  }
}

function cleanupOldData(): void {
  const now = new Date()

  // Cleanup errors
  const errorCutoff = new Date(now.getTime() - MONITORING_CONFIG.retentionDays.errors * 24 * 60 * 60 * 1000)
  monitoringStore.errors = monitoringStore.errors.filter(e => e.timestamp > errorCutoff)

  // Cleanup metrics
  const metricCutoff = new Date(now.getTime() - MONITORING_CONFIG.retentionDays.performance * 24 * 60 * 60 * 1000)
  monitoringStore.metrics = monitoringStore.metrics.filter(m => m.timestamp > metricCutoff)

  // Cleanup business metrics
  const businessCutoff = new Date(now.getTime() - MONITORING_CONFIG.retentionDays.business * 24 * 60 * 60 * 1000)
  monitoringStore.businessMetrics = monitoringStore.businessMetrics.filter(m => m.timestamp > businessCutoff)

  // Cleanup resolved alerts
  const alertCutoff = new Date(now.getTime() - MONITORING_CONFIG.retentionDays.alerts * 24 * 60 * 60 * 1000)
  monitoringStore.alerts = monitoringStore.alerts.filter(
    a => (!a.resolved || a.timestamp > alertCutoff)
  )
}