import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  // Rate limiting for API routes (exclude webhooks)
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/webhook/')) {
    const key = getRateLimitKey(request)
    
    // Different limits for different endpoints
    let limit = 100 // default: 100 requests per minute
    let windowMs = 60 * 1000 // 1 minute
    
    // Stricter limits for auth endpoints
    if (request.nextUrl.pathname.includes('/auth/') || 
        request.nextUrl.pathname.includes('/checkout/')) {
      limit = 10 // 10 requests per minute for sensitive endpoints
    }
    
    // Stricter limits for newsletter/contact
    if (request.nextUrl.pathname.includes('/newsletter') || 
        request.nextUrl.pathname.includes('/contact')) {
      limit = 5 // 5 requests per minute
      windowMs = 5 * 60 * 1000 // 5 minutes
    }
    
    if (isRateLimited(key, limit, windowMs)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      )
    }
  }

  // Security headers for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only apply middleware to API routes and admin routes
    '/api/:path*',
    '/admin/:path*'
  ],
}