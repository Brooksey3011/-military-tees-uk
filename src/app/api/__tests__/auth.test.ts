import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '../auth/register/route'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockSupabaseAuth = {
  admin: {
    createUser: vi.fn()
  }
}
const mockSupabaseFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createSupabaseAdmin: () => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom
  })
}))

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  rateLimitMiddleware: vi.fn(() => null),
  recordSuccess: vi.fn(),
  RATE_LIMITS: { AUTHENTICATION: 'authentication' }
}))

// Mock monitoring
vi.mock('@/lib/monitoring-enhanced', () => ({
  trackError: vi.fn(),
  monitorApiEndpoint: vi.fn((name, callback) => callback()),
  BusinessErrorType: { AUTH_FAILURE: 'auth_failure' },
  ErrorSeverity: { HIGH: 'high' }
}))

describe('/api/auth/register', () => {
  const validRegistrationData = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful user creation
    mockSupabaseAuth.admin.createUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_123',
          email: 'test@example.com',
          user_metadata: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      },
      error: null
    })

    // Mock successful customer record creation
    mockSupabaseFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: {
          id: 'customer_123',
          user_id: 'user_123',
          first_name: 'John',
          last_name: 'Doe'
        },
        error: null
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully register a new user with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.success).toBe(true)
    expect(result.message).toBe('User registered successfully')
    expect(result.user).toEqual(
      expect.objectContaining({
        id: 'user_123',
        email: 'test@example.com'
      })
    )

    expect(mockSupabaseAuth.admin.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePassword123!',
      user_metadata: {
        firstName: 'John',
        lastName: 'Doe'
      },
      email_confirm: false
    })
  })

  it('should validate email format', async () => {
    const invalidEmailData = {
      ...validRegistrationData,
      email: 'invalid-email'
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidEmailData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.error).toContain('validation')
  })

  it('should enforce password strength requirements', async () => {
    const weakPasswordData = {
      ...validRegistrationData,
      password: 'weak'
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(weakPasswordData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.error).toContain('validation')
  })

  it('should handle duplicate email registration', async () => {
    mockSupabaseAuth.admin.createUser.mockResolvedValue({
      data: { user: null },
      error: {
        message: 'User already registered'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.success).toBe(false)
    expect(result.error).toBe('User already registered')
  })

  it('should handle Supabase auth service errors', async () => {
    mockSupabaseAuth.admin.createUser.mockRejectedValue(new Error('Auth service unavailable'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Registration failed')
  })

  it('should create customer record after successful user creation', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    await POST(request)

    expect(mockSupabaseFrom).toHaveBeenCalledWith('customers')

    const customersTable = mockSupabaseFrom('customers')
    expect(customersTable.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user_123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com'
      })
    )
  })

  it('should handle customer record creation failure', async () => {
    mockSupabaseFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Customer creation failed' }
      })
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Registration failed')
  })

  it('should respect rate limiting', async () => {
    const { rateLimitMiddleware } = await import('@/lib/rate-limit')

    // Mock rate limit hit
    vi.mocked(rateLimitMiddleware).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 })
    )

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(429)
    expect(result.error).toBe('Rate limit exceeded')
  })

  it('should sanitize user input to prevent XSS', async () => {
    const maliciousData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: '<script>alert("xss")</script>John',
      lastName: '<img src=x onerror=alert("xss")>Doe'
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(maliciousData),
      headers: {
        'content-type': 'application/json'
      }
    })

    await POST(request)

    expect(mockSupabaseAuth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        user_metadata: {
          firstName: expect.not.stringContaining('<script>'),
          lastName: expect.not.stringContaining('<img')
        }
      })
    )
  })

  it('should track authentication errors for monitoring', async () => {
    mockSupabaseAuth.admin.createUser.mockRejectedValue(new Error('Database connection failed'))

    const { trackError } = await import('@/lib/monitoring-enhanced')

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validRegistrationData),
      headers: {
        'content-type': 'application/json'
      }
    })

    await POST(request)

    expect(trackError).toHaveBeenCalledWith(
      'Database connection failed',
      expect.objectContaining({
        type: 'auth_failure',
        severity: 'high'
      }),
      request
    )
  })
})