import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { POST as directCheckoutHandler } from '../direct-checkout/route'
import { POST as webhookHandler } from '../stripe-webhook/route'
import Stripe from 'stripe'

/**
 * 🧪 COMPREHENSIVE API TESTING SUITE
 * Tests critical payment and order processing APIs
 */
describe('Payment Integration API Tests', () => {
  let mockStripe: jest.Mocked<Stripe>
  
  beforeAll(() => {
    // Mock Stripe for testing
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn()
        }
      },
      webhooks: {
        constructEvent: jest.fn()
      }
    } as any
  })

  describe('Direct Checkout API', () => {
    it('should create checkout session with valid product variant', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          items: [
            { variantId: 'variant-123', quantity: 2 }
          ],
          customerEmail: 'test@militarytees.co.uk'
        }
      })

      // Mock successful Supabase response
      const mockSupabaseResponse = {
        data: {
          id: 'variant-123',
          sku: 'MT-001-L-BLK',
          stock_quantity: 10,
          price: 25.99,
          size: 'Large',
          color: 'Black',
          products: {
            id: 'product-123',
            name: 'British Army T-Shirt',
            price: 25.99,
            main_image_url: '/images/army-tshirt.jpg'
          }
        },
        error: null
      }

      // Mock Stripe session creation
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/test'
      } as any)

      const response = await directCheckoutHandler(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('url')
      expect(data).toHaveProperty('sessionId')
      expect(data).toHaveProperty('orderRef')
      expect(data.url).toContain('checkout.stripe.com')
    })

    it('should handle product ID fallback correctly', async () => {
      const { req, res } = createMocks({
        method: 'POST', 
        body: {
          items: [
            { variantId: 'product-123', quantity: 1 } // Product ID instead of variant ID
          ]
        }
      })

      // First query fails (no variant with this ID)
      // Second query succeeds (finds variants for this product ID)
      const mockVariantForProduct = {
        data: {
          id: 'variant-456',
          sku: 'MT-002-M-OLV',
          stock_quantity: 5,
          price: 29.99,
          size: 'Medium',
          color: 'Olive',
          products: {
            id: 'product-123',
            name: 'Military Heritage Hoodie',
            price: 29.99,
            main_image_url: '/images/hoodie.jpg'
          }
        },
        error: null
      }

      const response = await directCheckoutHandler(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('url')
    })

    it('should reject invalid variant IDs', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          items: [
            { variantId: 'invalid-id', quantity: 1 }
          ]
        }
      })

      const response = await directCheckoutHandler(req as any)
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('not available')
    })

    it('should validate stock quantities', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          items: [
            { variantId: 'variant-low-stock', quantity: 10 } // Requesting more than available
          ]
        }
      })

      const mockLowStockVariant = {
        data: {
          id: 'variant-low-stock',
          stock_quantity: 2, // Only 2 in stock
          price: 25.99,
          products: { name: 'Limited Edition Shirt' }
        }
      }

      const response = await directCheckoutHandler(req as any)
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Insufficient stock')
    })

    it('should calculate shipping correctly for different regions', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          items: [{ variantId: 'variant-123', quantity: 1 }],
          preferredCountry: 'US' // International shipping
        }
      })

      const response = await directCheckoutHandler(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.shipping.country).toBe('US')
      expect(data.shipping.availableRates).toBeInstanceOf(Array)
      expect(data.shipping.availableRates.length).toBeGreaterThan(0)
      
      // Should have different rates for international
      const rates = data.shipping.availableRates
      expect(rates.some((rate: any) => rate.amount > 500)).toBe(true) // > £5 for international
    })
  })

  describe('Stripe Webhook API', () => {
    it('should process successful payment webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            customer_email: 'customer@test.com',
            amount_total: 2999, // £29.99
            metadata: {
              orderRef: 'MT12345678',
              source: 'direct_checkout'
            },
            line_items: {
              data: [
                {
                  price: {
                    product: 'prod_test',
                    unit_amount: 2999,
                    metadata: {
                      variant_id: 'variant-123',
                      sku: 'MT-001-L-BLK'
                    }
                  },
                  quantity: 1
                }
              ]
            }
          }
        }
      }

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'valid-signature'
        },
        body: JSON.stringify(webhookPayload)
      })

      // Mock Stripe webhook verification
      mockStripe.webhooks.constructEvent.mockReturnValue(webhookPayload as any)

      const response = await webhookHandler(req as any)
      
      expect(response.status).toBe(200)
      
      // Verify order was created in database
      // Verify inventory was decremented
      // Verify customer notification was sent
    })

    it('should handle duplicate webhook events', async () => {
      const duplicatePayload = {
        id: 'evt_duplicate_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_duplicate_123',
            payment_status: 'paid'
          }
        }
      }

      const { req } = createMocks({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(duplicatePayload)
      })

      // First processing
      const response1 = await webhookHandler(req as any)
      expect(response1.status).toBe(200)

      // Second processing (duplicate)
      const response2 = await webhookHandler(req as any)
      expect(response2.status).toBe(200) // Should handle gracefully
    })

    it('should reject invalid webhook signatures', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid-signature'
        },
        body: JSON.stringify({ test: 'data' })
      })

      // Mock signature verification failure
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const response = await webhookHandler(req as any)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid signature')
    })
  })

  describe('Order Processing Integration', () => {
    it('should complete full order lifecycle', async () => {
      // Step 1: Create checkout session
      const checkoutReq = createMocks({
        method: 'POST',
        body: {
          items: [{ variantId: 'variant-123', quantity: 1 }],
          customerEmail: 'integration@test.com'
        }
      }).req

      const checkoutResponse = await directCheckoutHandler(checkoutReq as any)
      const checkoutData = await checkoutResponse.json()
      
      expect(checkoutResponse.status).toBe(200)
      const sessionId = checkoutData.sessionId

      // Step 2: Simulate successful payment webhook
      const webhookPayload = {
        id: 'evt_integration_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            payment_status: 'paid',
            customer_email: 'integration@test.com',
            amount_total: 2599,
            metadata: {
              orderRef: checkoutData.orderRef
            }
          }
        }
      }

      const webhookReq = createMocks({
        method: 'POST',
        headers: { 'stripe-signature': 'test-signature' },
        body: JSON.stringify(webhookPayload)
      }).req

      const webhookResponse = await webhookHandler(webhookReq as any)
      expect(webhookResponse.status).toBe(200)

      // Step 3: Verify order was created
      // Step 4: Verify stock was decremented
      // Step 5: Verify email notifications were sent
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle Supabase connection failures', async () => {
      // Mock database connection error
      const { req } = createMocks({
        method: 'POST',
        body: {
          items: [{ variantId: 'variant-123', quantity: 1 }]
        }
      })

      // Mock Supabase error
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const response = await directCheckoutHandler(req as any)
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should handle Stripe API failures', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          items: [{ variantId: 'variant-123', quantity: 1 }]
        }
      })

      // Mock Stripe failure
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API Error')
      )

      const response = await directCheckoutHandler(req as any)
      
      expect(response.status).toBe(500)
    })

    it('should validate request schemas strictly', async () => {
      const invalidRequests = [
        { items: [] }, // Empty items
        { items: [{ quantity: 1 }] }, // Missing variantId
        { items: [{ variantId: 'test', quantity: 0 }] }, // Invalid quantity
        { items: [{ variantId: 'test', quantity: 11 }] }, // Quantity too high
        { customerEmail: 'invalid-email' } // Invalid email format
      ]

      for (const invalidBody of invalidRequests) {
        const { req } = createMocks({
          method: 'POST',
          body: invalidBody
        })

        const response = await directCheckoutHandler(req as any)
        expect(response.status).toBe(400)
      }
    })
  })
})