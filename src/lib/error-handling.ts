import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

// Error types for proper categorization
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication', 
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Custom application error class
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

// Predefined common errors
export const CommonErrors = {
  // Validation errors (400)
  INVALID_INPUT: (details?: any) => new AppError(
    'Invalid input provided',
    ErrorType.VALIDATION,
    400,
    ErrorSeverity.LOW,
    true,
    details
  ),
  
  MISSING_REQUIRED_FIELD: (field: string) => new AppError(
    `Missing required field: ${field}`,
    ErrorType.VALIDATION,
    400,
    ErrorSeverity.LOW,
    true,
    { field }
  ),

  // Authentication errors (401)
  AUTHENTICATION_REQUIRED: () => new AppError(
    'Authentication required',
    ErrorType.AUTHENTICATION,
    401,
    ErrorSeverity.MEDIUM,
    true
  ),

  INVALID_CREDENTIALS: () => new AppError(
    'Invalid credentials provided',
    ErrorType.AUTHENTICATION,
    401,
    ErrorSeverity.MEDIUM,
    true
  ),

  TOKEN_EXPIRED: () => new AppError(
    'Authentication token has expired',
    ErrorType.AUTHENTICATION,
    401,
    ErrorSeverity.MEDIUM,
    true
  ),

  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS: () => new AppError(
    'Insufficient permissions to access this resource',
    ErrorType.AUTHORIZATION,
    403,
    ErrorSeverity.HIGH,
    true
  ),

  // Not found errors (404)
  RESOURCE_NOT_FOUND: (resource: string) => new AppError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    404,
    ErrorSeverity.LOW,
    true,
    { resource }
  ),

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: (limit: number, window: string) => new AppError(
    'Rate limit exceeded',
    ErrorType.RATE_LIMIT,
    429,
    ErrorSeverity.MEDIUM,
    true,
    { limit, window }
  ),

  // External API errors (502-504)
  EXTERNAL_SERVICE_UNAVAILABLE: (service: string) => new AppError(
    'External service temporarily unavailable',
    ErrorType.EXTERNAL_API,
    503,
    ErrorSeverity.HIGH,
    true,
    { service }
  ),

  // Database errors (500)
  DATABASE_CONNECTION_FAILED: () => new AppError(
    'Database connection failed',
    ErrorType.DATABASE,
    500,
    ErrorSeverity.CRITICAL,
    true
  ),

  // Internal errors (500)
  INTERNAL_SERVER_ERROR: () => new AppError(
    'Internal server error',
    ErrorType.INTERNAL,
    500,
    ErrorSeverity.HIGH,
    false
  )
}

// Error logging interface
interface ErrorLog {
  id?: string
  timestamp: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  stack?: string
  endpoint?: string
  method?: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  request_body?: any
  details?: any
  resolved: boolean
}

// Enhanced error logger
export class ErrorLogger {
  private static supabase = createSupabaseAdmin()

  static async logError(error: Error | AppError, context?: {
    endpoint?: string
    method?: string
    user_id?: string
    ip_address?: string
    user_agent?: string
    request_body?: any
  }): Promise<void> {
    try {
      const isAppError = error instanceof AppError
      
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: isAppError ? error.type : ErrorType.INTERNAL,
        severity: isAppError ? error.severity : ErrorSeverity.HIGH,
        message: error.message,
        stack: error.stack,
        endpoint: context?.endpoint,
        method: context?.method,
        user_id: context?.user_id,
        ip_address: context?.ip_address,
        user_agent: context?.user_agent,
        request_body: context?.request_body,
        details: isAppError ? error.details : undefined,
        resolved: false
      }

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorLog)
      }

      // Log to database for production monitoring
      const { error: dbError } = await this.supabase
        .from('error_logs')
        .insert(errorLog)

      if (dbError) {
        // Fallback logging if database is unavailable
        console.error('Failed to log error to database:', dbError)
        console.error('Original error:', errorLog)
      }

      // For critical errors, consider external alerting
      if (isAppError && error.severity === ErrorSeverity.CRITICAL) {
        await this.alertCriticalError(errorLog)
      }

    } catch (loggingError) {
      // Don't let logging errors crash the application
      console.error('Error logging failed:', loggingError)
      console.error('Original error:', error)
    }
  }

  private static async alertCriticalError(errorLog: ErrorLog): Promise<void> {
    // Implement critical error alerting (email, Slack, etc.)
    console.error('🚨 CRITICAL ERROR:', errorLog)
    
    // TODO: Implement external alerting system
    // Examples:
    // - Send email to admin
    // - Post to Slack webhook
    // - Create PagerDuty incident
  }
}

// Error response formatter
export function formatErrorResponse(error: Error | AppError, includeStack: boolean = false): {
  error: string
  type?: ErrorType
  details?: any
  timestamp: string
  stack?: string
} {
  const isAppError = error instanceof AppError
  
  // Never expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction && !isAppError) {
    return {
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  }

  return {
    error: error.message,
    type: isAppError ? error.type : undefined,
    details: isAppError ? error.details : undefined,
    timestamp: new Date().toISOString(),
    stack: includeStack && !isProduction ? error.stack : undefined
  }
}

// Error response helper
export async function handleError(
  error: Error | AppError,
  context?: {
    endpoint?: string
    method?: string
    user_id?: string
    ip_address?: string
    user_agent?: string
    request_body?: any
  }
): Promise<NextResponse> {
  
  // Log the error
  await ErrorLogger.logError(error, context)
  
  // Determine status code
  const statusCode = error instanceof AppError ? error.statusCode : 500
  
  // Format response
  const errorResponse = formatErrorResponse(error)
  
  return NextResponse.json(errorResponse, { status: statusCode })
}

// Async error handler wrapper
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context?: Partial<{
    endpoint: string
    method: string
  }>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return await handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        context
      )
    }
  }
}

// Database error handler
export function handleDatabaseError(error: any, operation: string): AppError {
  console.error(`Database error in ${operation}:`, error)
  
  // Parse common database errors
  if (error.code === '23505') {
    return new AppError(
      'Resource already exists',
      ErrorType.VALIDATION,
      409,
      ErrorSeverity.LOW,
      true,
      { operation, code: error.code }
    )
  }
  
  if (error.code === '23503') {
    return new AppError(
      'Referenced resource not found',
      ErrorType.VALIDATION,
      400,
      ErrorSeverity.LOW,
      true,
      { operation, code: error.code }
    )
  }
  
  if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
    return new AppError(
      'Access denied to resource',
      ErrorType.AUTHORIZATION,
      403,
      ErrorSeverity.MEDIUM,
      true,
      { operation }
    )
  }

  // Generic database error
  return new AppError(
    'Database operation failed',
    ErrorType.DATABASE,
    500,
    ErrorSeverity.HIGH,
    true,
    { operation, originalError: error.message }
  )
}

// Request validation helper
export function validateRequestHeaders(headers: Headers): {
  userAgent?: string
  ip?: string
  origin?: string
} {
  return {
    userAgent: headers.get('user-agent') || undefined,
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || undefined,
    origin: headers.get('origin') || undefined
  }
}