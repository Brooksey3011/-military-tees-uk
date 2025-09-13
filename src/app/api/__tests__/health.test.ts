import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockSupabaseFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  createSupabaseAdmin: () => ({
    from: mockSupabaseFrom
  })
}))

// Import after mocks
const { GET } = await import('../health/route')

describe('/api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.RESEND_API_KEY = 'test-key'

    // Mock successful database connection
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [{ id: 'test' }],
          error: null
        })
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return healthy status when all services are operational', async () => {
    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.status).toBe('healthy')
    expect(result.services).toEqual({
      database: 'connected',
      stripe: 'available',
      email: 'operational'
    })
    expect(result.version).toBe('1.0.0')
    expect(result.timestamp).toBeDefined()
  })

  it('should return degraded status when database fails', async () => {
    // Mock database error
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' }
        })
      })
    })

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.status).toBe('degraded')
    expect(result.services.database).toBe('error')
  })

  it('should handle missing Stripe configuration', async () => {
    delete process.env.STRIPE_SECRET_KEY

    const response = await GET()
    const result = await response.json()

    expect(result.services.stripe).toBe('not_configured')
  })

  it('should handle missing email configuration', async () => {
    delete process.env.RESEND_API_KEY

    const response = await GET()
    const result = await response.json()

    expect(result.services.email).toBe('not_configured')
  })

  it('should return unhealthy status on complete failure', async () => {
    // Mock complete failure
    mockSupabaseFrom.mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const response = await GET()
    const result = await response.json()

    expect(response.status).toBe(503)
    expect(result.status).toBe('unhealthy')
    expect(result.error).toBe('Health check failed')
  })

  it('should include timestamp in ISO format', async () => {
    const response = await GET()
    const result = await response.json()

    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})