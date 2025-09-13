import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimitMiddleware, recordSuccess, RATE_LIMITS } from '@/lib/rate-limit'
import { trackError, BusinessErrorType, ErrorSeverity } from '@/lib/monitoring-enhanced'

/**
 * Common API Helper Functions
 *
 * This file consolidates repeated patterns across API routes to reduce code duplication:
 * - Request validation and sanitization
 * - Error handling with consistent formatting
 * - Rate limiting wrapper
 * - Response formatting
 * - Logging and monitoring integration
 */

// Common response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
  code?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}

/**
 * Standardized API route wrapper that handles common patterns
 */
export function createApiHandler<T>(
  handler: (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>>,
  options: {
    rateLimitType?: keyof typeof RATE_LIMITS
    requireAuth?: boolean
    validateSchema?: z.ZodSchema
    monitoringPath?: string
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // 1. Rate limiting (if specified)
      if (options.rateLimitType) {
        const rateLimitResult = await rateLimitMiddleware(request, RATE_LIMITS[options.rateLimitType])
        if (rateLimitResult) {
          return rateLimitResult as NextResponse<ApiResponse<T>>
        }
      }

      // 2. Request validation (if schema provided)
      if (options.validateSchema) {
        if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
          return createErrorResponse('Invalid request method', 405)
        }

        const body = await request.json().catch(() => null)
        if (!body) {
          return createErrorResponse('Request body is required', 400)
        }

        const validation = options.validateSchema.safeParse(body)
        if (!validation.success) {
          const errorMessage = validation.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ')

          return createErrorResponse(`Validation failed: ${errorMessage}`, 400)
        }
      }

      // 3. Execute handler
      const response = await handler(request)

      // 4. Record success (if rate limiting enabled)
      if (options.rateLimitType) {
        recordSuccess(request, RATE_LIMITS[options.rateLimitType], options.rateLimitType)
      }

      return response

    } catch (error) {
      // 5. Error handling with monitoring
      const errorMessage = error instanceof Error ? error.message : 'Internal server error'

      // Track error for monitoring
      trackError(errorMessage, {
        type: BusinessErrorType.API_FAILURE,
        severity: ErrorSeverity.HIGH,
        path: options.monitoringPath || request.nextUrl?.pathname || 'unknown'
      }, request)

      console.error(`API Error [${request.method} ${request.nextUrl?.pathname}]:`, error)

      return createErrorResponse(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
        500
      )
    }
  }
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  additionalFields?: Record<string, any>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...additionalFields
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  code?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(code && { code })
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Extract and validate query parameters
 */
export function extractQueryParams(request: NextRequest, schema: z.ZodSchema) {
  const { searchParams } = new URL(request.url)
  const params: Record<string, any> = {}

  // Convert URLSearchParams to object
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  // Validate with schema
  const validation = schema.safeParse(params)
  if (!validation.success) {
    throw new Error(`Invalid query parameters: ${validation.error.errors.map(e => e.message).join(', ')}`)
  }

  return validation.data
}

/**
 * Common address validation schema (reusable)
 */
export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim(),
  address1: z.string().min(1, 'Address is required').max(100, 'Address too long').trim(),
  address2: z.string().max(100, 'Address line 2 too long').trim().optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long').trim(),
  postcode: z.string().min(1, 'Postcode is required').max(20, 'Postcode too long').trim(),
  country: z.string().min(2, 'Country is required').max(2, 'Country code must be 2 letters').toUpperCase()
})

/**
 * Common email validation schema
 */
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email address too long')
  .toLowerCase()
  .trim()

/**
 * Common name validation schema
 */
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name too long')
  .trim()

/**
 * Common password validation schema
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain at least one number')

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Remove HTML-like characters
    .trim()
    .slice(0, 500) // Limit length
}

/**
 * Parse pagination parameters
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Parse sorting parameters
 */
export function parseSortingParams(
  searchParams: URLSearchParams,
  allowedFields: string[] = ['created_at', 'updated_at', 'name', 'price']
) {
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Validate sort field
  if (!allowedFields.includes(sortBy)) {
    throw new Error(`Invalid sort field. Allowed: ${allowedFields.join(', ')}`)
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder)) {
    throw new Error('Sort order must be "asc" or "desc"')
  }

  return { sortBy, sortOrder }
}

/**
 * Create consistent cache headers
 */
export function createCacheHeaders(maxAge: number = 300) {
  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=60`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`
  }
}

/**
 * Add CORS headers for API responses
 */
export function addCorsHeaders(response: NextResponse, methods: string[] = ['GET', 'POST']) {
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://militarytees.co.uk' : '*')
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

/**
 * Validate environment variables
 */
export function requireEnvVars(variables: string[]): void {
  const missing = variables.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}