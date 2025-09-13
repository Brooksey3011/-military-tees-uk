import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store - In production, use Redis or a proper database
interface RateLimitEntry {
  count: number
  resetTime: number
  blockedUntil?: number
}

// Memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configurations for different route types
export const RATE_LIMITS = {
  // Authentication routes - strict limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per window
    blockDurationMs: 30 * 60 * 1000, // 30 minute lockout
    skipSuccessfulRequests: false
  },

  // Password reset - very strict
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3, // 3 attempts per hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour lockout
    skipSuccessfulRequests: true
  },

  // Payment/checkout routes - moderate limits
  PAYMENT: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 10, // 10 payment attempts per window
    blockDurationMs: 20 * 60 * 1000, // 20 minute lockout
    skipSuccessfulRequests: true
  },

  // Contact forms - prevent spam
  CONTACT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 5, // 5 contact submissions per hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour lockout
    skipSuccessfulRequests: true
  },

  // API general - lenient for legitimate usage
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100, // 100 requests per minute
    blockDurationMs: 5 * 60 * 1000, // 5 minute lockout
    skipSuccessfulRequests: true
  },

  // Admin routes - strict but reasonable
  ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 20, // 20 admin operations per window
    blockDurationMs: 30 * 60 * 1000, // 30 minute lockout
    skipSuccessfulRequests: true
  }
}

export interface RateLimitConfig {
  windowMs: number
  maxAttempts: number
  blockDurationMs: number
  skipSuccessfulRequests: boolean
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
  blocked?: boolean
}

/**
 * Create rate limit key from request
 */
function createRateLimitKey(request: NextRequest, keyType: string): string {
  // Get client IP - handle various proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

  // Get user agent for additional fingerprinting
  const userAgent = request.headers.get('user-agent')?.substring(0, 100) || 'unknown'

  // Create composite key for better accuracy
  return `${keyType}:${clientIp}:${Buffer.from(userAgent).toString('base64').substring(0, 20)}`
}

/**
 * Clean up expired entries from memory store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Core rate limiting function
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyType: string
): RateLimitResult {
  const key = createRateLimitKey(request, keyType)
  const now = Date.now()

  // Cleanup expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries()
  }

  let entry = rateLimitStore.get(key)

  // Check if currently blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      success: false,
      limit: config.maxAttempts,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      blocked: true
    }
  }

  // Initialize or reset window
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blockedUntil: undefined
    }
    rateLimitStore.set(key, entry)
  }

  // Check if limit exceeded
  if (entry.count >= config.maxAttempts) {
    // Block the client
    entry.blockedUntil = now + config.blockDurationMs
    rateLimitStore.set(key, entry)

    return {
      success: false,
      limit: config.maxAttempts,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
      blocked: true
    }
  }

  // Increment counter
  entry.count += 1
  rateLimitStore.set(key, entry)

  return {
    success: true,
    limit: config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime
  }
}

/**
 * Record successful request to potentially reset counter
 */
export function recordSuccess(
  request: NextRequest,
  config: RateLimitConfig,
  keyType: string
): void {
  if (!config.skipSuccessfulRequests) return

  const key = createRateLimitKey(request, keyType)
  const entry = rateLimitStore.get(key)

  if (entry && entry.count > 0) {
    entry.count = Math.max(0, entry.count - 1)
    rateLimitStore.set(key, entry)
  }
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(result: RateLimitResult, message?: string): NextResponse {
  const response = NextResponse.json(
    {
      error: message || (result.blocked ? 'Rate limit exceeded - temporarily blocked' : 'Rate limit exceeded'),
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: new Date(result.resetTime).toISOString()
    },
    { status: 429 }
  )

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

/**
 * Middleware factory for different route types
 */
export function createRateLimitMiddleware(config: RateLimitConfig, keyType: string) {
  return (request: NextRequest) => {
    const result = checkRateLimit(request, config, keyType)

    if (!result.success) {
      console.warn(`Rate limit exceeded for ${keyType}:`, {
        key: createRateLimitKey(request, keyType),
        remaining: result.remaining,
        blocked: result.blocked,
        retryAfter: result.retryAfter
      })

      return createRateLimitResponse(result)
    }

    return null // Continue to handler
  }
}

/**
 * Pre-built middleware for common route types
 */
export const rateLimitMiddleware = {
  auth: createRateLimitMiddleware(RATE_LIMITS.AUTH, 'auth'),
  passwordReset: createRateLimitMiddleware(RATE_LIMITS.PASSWORD_RESET, 'password_reset'),
  payment: createRateLimitMiddleware(RATE_LIMITS.PAYMENT, 'payment'),
  contact: createRateLimitMiddleware(RATE_LIMITS.CONTACT, 'contact'),
  api: createRateLimitMiddleware(RATE_LIMITS.API_GENERAL, 'api'),
  admin: createRateLimitMiddleware(RATE_LIMITS.ADMIN, 'admin')
}

/**
 * Route-specific rate limit checker
 */
export function getRateLimitForRoute(pathname: string): (request: NextRequest) => NextResponse | null {
  // Authentication routes
  if (pathname.includes('/api/auth/') || pathname.includes('/login') || pathname.includes('/signup')) {
    return rateLimitMiddleware.auth
  }

  // Password reset routes
  if (pathname.includes('password-reset') || pathname.includes('forgot-password')) {
    return rateLimitMiddleware.passwordReset
  }

  // Payment/checkout routes
  if (pathname.includes('/checkout') || pathname.includes('/payment') ||
      pathname.includes('/stripe') || pathname.includes('/order')) {
    return rateLimitMiddleware.payment
  }

  // Contact forms
  if (pathname.includes('/contact') || pathname.includes('/newsletter') ||
      pathname.includes('/custom-quote')) {
    return rateLimitMiddleware.contact
  }

  // Admin routes
  if (pathname.includes('/api/admin/')) {
    return rateLimitMiddleware.admin
  }

  // General API routes
  if (pathname.startsWith('/api/')) {
    return rateLimitMiddleware.api
  }

  // No rate limiting for other routes
  return () => null
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(request: NextRequest, keyType: string): RateLimitResult | null {
  const key = createRateLimitKey(request, keyType)
  const entry = rateLimitStore.get(key)
  const now = Date.now()

  if (!entry) return null

  const config = Object.values(RATE_LIMITS).find(c => c.windowMs > 0) || RATE_LIMITS.API_GENERAL

  return {
    success: entry.count < config.maxAttempts && (!entry.blockedUntil || now > entry.blockedUntil),
    limit: config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime,
    retryAfter: entry.blockedUntil && now < entry.blockedUntil ?
      Math.ceil((entry.blockedUntil - now) / 1000) : undefined,
    blocked: entry.blockedUntil ? now < entry.blockedUntil : false
  }
}