import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Define mock functions at the top level
const mockStripeSessionCreate = vi.fn()
const mockSupabaseSelect = vi.fn()
const mockSupabaseInsert = vi.fn()
const mockSupabaseUpdate = vi.fn()
const mockSupabaseFrom = vi.fn()

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockStripeSessionCreate
      }
    }
  }
}))

const mockStripeSession = {
  id: 'cs_test_123456789',
  url: 'https://checkout.stripe.com/pay/cs_test_123456789',
  payment_status: 'unpaid',
  metadata: {
    orderNumber: 'MT123456789'
  }
}

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createSupabaseAdmin: () => ({
    from: mockSupabaseFrom
  })
}))

// Mock monitoring
vi.mock('@/lib/monitoring-enhanced', () => ({
  trackCheckoutEvent: vi.fn(),
  trackError: vi.fn(),
  monitorApiEndpoint: vi.fn((name, callback) => callback()),
  BusinessErrorType: { CHECKOUT_FAILURE: 'checkout_failure' },
  ErrorSeverity: { CRITICAL: 'critical' }
}))

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  rateLimitMiddleware: vi.fn(() => null),
  recordSuccess: vi.fn(),
  RATE_LIMITS: { PAYMENT: 'payment' }
}))

describe('/api/checkout', () => {
  const validCheckoutData = {
    items: [
      {
        variantId: 'var_123',
        quantity: 2
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address1: '123 Test St',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'GB'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Test St',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'GB'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Supabase mocks
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'var_123',
                  product_id: 'prod_123',
                  size: 'M',
                  color: 'Black',
                  price: 25.99,
                  stock_quantity: 10,
                  sku: 'TEST-SKU-123'
                },
                error: null
              })
            })
          })
        }
      }

      if (table === 'orders') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'order_123',
                  order_number: 'MT123456789',
                  total: 31.18
                },
                error: null
              })
            })
          })
        }
      }

      if (table === 'order_items') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        }
      }

      return {
        select: mockSupabaseSelect,
        insert: mockSupabaseInsert,
        update: mockSupabaseUpdate
      }
    })

    // Setup Stripe mock
    mockStripeSessionCreate.mockResolvedValue(mockStripeSession)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully create checkout session with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.sessionId).toBe('cs_test_123456789')
    expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_123456789')
    expect(result.orderNumber).toMatch(/^MT[A-Z0-9]{10}$/)
    expect(mockStripeSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: 'gbp',
              unit_amount: 2599, // £25.99 in pence
            }),
            quantity: 2
          })
        ]),
        metadata: expect.objectContaining({
          orderNumber: expect.stringMatching(/^MT[A-Z0-9]{10}$/)
        })
      })
    )
  })

  it('should validate required fields and return 400 for invalid data', async () => {
    const invalidData = {
      items: [], // Empty items
      shippingAddress: {
        firstName: '',
        email: 'invalid-email'
      }
    }

    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(invalidData),
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

  it('should handle Stripe session creation failure', async () => {
    mockStripeSessionCreate.mockRejectedValue(new Error('Stripe API error'))

    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.error).toContain('error')
  })

  it('should handle insufficient stock gracefully', async () => {
    // Mock insufficient stock
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'var_123',
                  product_id: 'prod_123',
                  size: 'M',
                  color: 'Black',
                  price: 25.99,
                  stock_quantity: 1, // Only 1 in stock, but requesting 2
                  sku: 'TEST-SKU-123'
                },
                error: null
              })
            })
          })
        }
      }
      return { select: vi.fn(), insert: vi.fn(), update: vi.fn() }
    })

    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('stock')
  })

  it('should calculate totals correctly including VAT and shipping', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.totals).toEqual({
      subtotal: 51.98, // £25.99 × 2
      shipping: 4.99,  // Standard shipping
      vat: 11.39,      // 20% VAT
      total: 68.36     // Total including VAT and shipping
    })
  })

  it('should apply free shipping for orders over £50', async () => {
    // Mock higher price product for free shipping threshold
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'var_123',
                  product_id: 'prod_123',
                  size: 'M',
                  color: 'Black',
                  price: 30.00, // Higher price to exceed £50 threshold
                  stock_quantity: 10,
                  sku: 'TEST-SKU-123'
                },
                error: null
              })
            })
          })
        }
      }
      return mockSupabaseFrom(table)
    })

    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.totals.subtotal).toBe(60.00) // £30 × 2
    expect(result.totals.shipping).toBe(0) // Free shipping over £50
  })

  it('should track monitoring events during checkout process', async () => {
    const { trackCheckoutEvent } = await import('@/lib/monitoring-enhanced')

    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(validCheckoutData),
      headers: {
        'content-type': 'application/json'
      }
    })

    await POST(request)

    // Verify monitoring events were tracked
    expect(trackCheckoutEvent).toHaveBeenCalledWith('initiated', expect.objectContaining({
      cartValue: expect.any(Number),
      itemCount: 2,
      userId: 'john.doe@example.com'
    }))

    expect(trackCheckoutEvent).toHaveBeenCalledWith('payment_submitted', expect.objectContaining({
      orderId: expect.stringMatching(/^MT[A-Z0-9]{10}$/),
      cartValue: expect.any(Number),
      itemCount: 2,
      paymentMethod: 'stripe'
    }))
  })
})

// Import the route handler after mocks are set up
const { POST } = await import('../checkout/route')