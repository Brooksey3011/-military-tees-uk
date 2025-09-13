import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '../stripe-webhook/route'
import { NextRequest } from 'next/server'

// Mock Stripe
const mockConstructEvent = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent
    }
  }
}))

// Mock Supabase
const mockSupabaseFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  createSupabaseAdmin: () => ({
    from: mockSupabaseFrom
  })
}))

// Mock monitoring
const mockTrackPaymentEvent = vi.fn()
const mockTrackCheckoutEvent = vi.fn()
const mockTrackError = vi.fn()
const mockMonitorApiEndpoint = vi.fn((name, callback) => callback())

vi.mock('@/lib/monitoring-enhanced', () => ({
  trackPaymentEvent: mockTrackPaymentEvent,
  trackCheckoutEvent: mockTrackCheckoutEvent,
  trackError: mockTrackError,
  monitorApiEndpoint: mockMonitorApiEndpoint,
  BusinessErrorType: { PAYMENT_ERROR: 'payment_error' },
  ErrorSeverity: { CRITICAL: 'critical' }
}))

describe('/api/stripe-webhook', () => {
  const mockStripeEvent = {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123456789',
        payment_status: 'paid',
        amount_total: 6836, // £68.36 in pence
        currency: 'gbp',
        metadata: {
          orderNumber: 'MT123456789',
          itemCount: '2'
        },
        customer_details: {
          email: 'john.doe@example.com',
          name: 'John Doe'
        },
        line_items: {
          data: [
            {
              price: {
                product: 'prod_123'
              },
              quantity: 2
            }
          ]
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConstructEvent.mockReturnValue(mockStripeEvent)

    // Mock successful database operations
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'orders') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'order_123',
                    order_number: 'MT123456789',
                    status: 'completed',
                    total: 68.36
                  },
                  error: null
                })
              })
            })
          })
        }
      }

      if (table === 'order_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'item_123',
                  product_variant_id: 'var_123',
                  quantity: 2
                }
              ],
              error: null
            })
          })
        }
      }

      if (table === 'product_variants') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        }
      }

      return {
        select: vi.fn(),
        update: vi.fn(),
        insert: vi.fn()
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully process completed checkout session', async () => {
    const webhookPayload = JSON.stringify(mockStripeEvent)
    const signature = 'test-signature'

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.received).toBe(true)
    expect(mockConstructEvent).toHaveBeenCalledWith(
      webhookPayload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  })

  it('should track successful payment event', async () => {
    const webhookPayload = JSON.stringify(mockStripeEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    await POST(request)

    expect(mockTrackPaymentEvent).toHaveBeenCalledWith('succeeded', {
      orderId: 'MT123456789',
      amount: 68.36,
      currency: 'gbp',
      stripeSessionId: 'cs_test_123456789',
      customerId: 'john.doe@example.com'
    })
  })

  it('should track completed checkout event', async () => {
    const webhookPayload = JSON.stringify(mockStripeEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    await POST(request)

    expect(mockTrackCheckoutEvent).toHaveBeenCalledWith('completed', {
      orderId: 'MT123456789',
      cartValue: 68.36,
      itemCount: 2,
      userId: 'john.doe@example.com'
    })
  })

  it('should handle failed payment status', async () => {
    const failedPaymentEvent = {
      ...mockStripeEvent,
      data: {
        object: {
          ...mockStripeEvent.data.object,
          payment_status: 'unpaid'
        }
      }
    }

    mockConstructEvent.mockReturnValue(failedPaymentEvent)
    const webhookPayload = JSON.stringify(failedPaymentEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    await POST(request)

    expect(mockTrackPaymentEvent).toHaveBeenCalledWith('failed', expect.objectContaining({
      orderId: 'MT123456789',
      error: 'Payment status: unpaid'
    }))
  })

  it('should handle webhook signature verification failure', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: 'invalid body',
      headers: {
        'stripe-signature': 'invalid-signature'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toBe('Webhook processing failed')
    expect(mockTrackError).toHaveBeenCalledWith(
      'Invalid signature',
      expect.objectContaining({
        type: 'payment_error',
        severity: 'critical',
        path: '/api/stripe-webhook'
      }),
      request
    )
  })

  it('should handle database update failures gracefully', async () => {
    // Mock database error
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'orders') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database update failed' }
                })
              })
            })
          })
        }
      }
      return { select: vi.fn(), update: vi.fn(), insert: vi.fn() }
    })

    const webhookPayload = JSON.stringify(mockStripeEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toBe('Webhook processing failed')
  })

  it('should update product variant stock after successful payment', async () => {
    const webhookPayload = JSON.stringify(mockStripeEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    await POST(request)

    // Verify stock was updated
    const orderItemsQuery = mockSupabaseFrom('order_items')
    expect(orderItemsQuery.select).toHaveBeenCalled()

    const variantsUpdate = mockSupabaseFrom('product_variants')
    expect(variantsUpdate.update).toHaveBeenCalled()
  })

  it('should handle non-checkout webhook events gracefully', async () => {
    const otherEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123'
        }
      }
    }

    mockConstructEvent.mockReturnValue(otherEvent)
    const webhookPayload = JSON.stringify(otherEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.received).toBe(true)
    // Should not trigger payment tracking for non-checkout events
    expect(mockTrackPaymentEvent).not.toHaveBeenCalled()
  })

  it('should use monitoring wrapper for endpoint tracking', async () => {
    const webhookPayload = JSON.stringify(mockStripeEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe-webhook', {
      method: 'POST',
      body: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })

    await POST(request)

    expect(mockMonitorApiEndpoint).toHaveBeenCalledWith('stripe-webhook', expect.any(Function))
  })
})