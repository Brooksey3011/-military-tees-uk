import { test, expect } from '@playwright/test'

/**
 * 🛒 COMPREHENSIVE E2E PAYMENT FLOW TEST
 * Tests the complete customer journey: browse → cart → checkout → payment → confirmation
 */
test.describe('Payment Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('Complete purchase flow with Stripe test card', async ({ page }) => {
    // 🏪 STEP 1: Product Discovery
    await test.step('Navigate to products', async () => {
      await page.click('[data-testid="shop-military-apparel"]')
      await expect(page).toHaveURL(/\/categories/)
    })

    // 🛍️ STEP 2: Product Selection  
    await test.step('Select first product', async () => {
      const firstProduct = page.locator('[data-testid="product-card"]').first()
      await expect(firstProduct).toBeVisible()
      await firstProduct.click()
      
      // Verify we're on product page
      await expect(page).toHaveURL(/\/products\//)
      await expect(page.locator('h1')).toBeVisible()
    })

    // 🛒 STEP 3: Add to Cart
    await test.step('Add product to cart', async () => {
      // Select size if available
      const sizeSelector = page.locator('[data-testid="size-selector"]')
      if (await sizeSelector.isVisible()) {
        await sizeSelector.first().click()
      }
      
      // Add to cart
      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
      await expect(addToCartBtn).toBeEnabled()
      await addToCartBtn.click()
      
      // Verify cart badge updates
      const cartBadge = page.locator('[data-testid="cart-badge"]')
      await expect(cartBadge).toContainText('1')
    })

    // 🛒 STEP 4: View Cart
    await test.step('Open cart drawer', async () => {
      await page.click('[data-testid="cart-icon"]')
      
      const cartDrawer = page.locator('[data-testid="cart-drawer"]')
      await expect(cartDrawer).toBeVisible()
      
      // Verify cart contents
      await expect(cartDrawer.locator('[data-testid="cart-item"]')).toHaveCount(1)
      await expect(cartDrawer.locator('[data-testid="cart-total"]')).toBeVisible()
    })

    // 💳 STEP 5: Initiate Checkout
    await test.step('Start checkout process', async () => {
      const checkoutBtn = page.locator('[data-testid="secure-checkout-button"]')
      await expect(checkoutBtn).toBeEnabled()
      
      await checkoutBtn.click()
      
      // Should redirect to Stripe Checkout
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })
      await expect(page.url()).toContain('checkout.stripe.com')
    })

    // 💳 STEP 6: Complete Stripe Payment  
    await test.step('Complete Stripe payment', async () => {
      // Fill Stripe test card details
      await page.fill('[data-testid="cardNumber"]', '4242 4242 4242 4242')
      await page.fill('[data-testid="cardExpiry"]', '12/34')
      await page.fill('[data-testid="cardCvc"]', '123')
      await page.fill('[data-testid="billingName"]', 'Test Customer')
      
      // Fill billing address
      await page.selectOption('[data-testid="billingCountry"]', 'GB')
      await page.fill('[data-testid="billingPostalCode"]', 'SW1A 1AA')
      
      // Submit payment
      const payButton = page.locator('[data-testid="submit-button"]')
      await expect(payButton).toBeEnabled()
      await payButton.click()
      
      // Wait for payment processing
      await page.waitForLoadState('networkidle')
    })

    // ✅ STEP 7: Verify Success Page
    await test.step('Verify order confirmation', async () => {
      // Should redirect back to success page
      await page.waitForURL(/\/checkout\/success/, { timeout: 15000 })
      
      // Verify success elements
      await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible()
      
      // Verify cart is now empty
      await page.click('[data-testid="cart-icon"]')
      const cartDrawer = page.locator('[data-testid="cart-drawer"]')
      await expect(cartDrawer.locator('[data-testid="empty-cart"]')).toBeVisible()
    })
  })

  test('Handle payment failure gracefully', async ({ page }) => {
    // Use declined test card
    await test.step('Navigate and add product to cart', async () => {
      await page.goto('/categories')
      await page.locator('[data-testid="product-card"]').first().click()
      await page.click('[data-testid="add-to-cart-button"]')
      await page.click('[data-testid="cart-icon"]')
      await page.click('[data-testid="secure-checkout-button"]')
    })

    await test.step('Attempt payment with declined card', async () => {
      await page.waitForURL(/checkout\.stripe\.com/)
      
      // Use declined card number
      await page.fill('[data-testid="cardNumber"]', '4000 0000 0000 0002')
      await page.fill('[data-testid="cardExpiry"]', '12/34')
      await page.fill('[data-testid="cardCvc"]', '123')
      await page.fill('[data-testid="billingName"]', 'Test Customer')
      
      await page.click('[data-testid="submit-button"]')
      
      // Verify error handling
      const errorMessage = page.locator('[data-testid="error-message"]')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText(/declined|failed/)
    })
  })

  test('Cart persistence across sessions', async ({ page, context }) => {
    await test.step('Add item to cart', async () => {
      await page.goto('/categories')
      await page.locator('[data-testid="product-card"]').first().click()
      await page.click('[data-testid="add-to-cart-button"]')
      
      // Verify cart has item
      await page.click('[data-testid="cart-icon"]')
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    })

    await test.step('Verify persistence after page reload', async () => {
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Cart should still have item
      await page.click('[data-testid="cart-icon"]')
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    })

    await test.step('Verify persistence in new tab', async () => {
      const newPage = await context.newPage()
      await newPage.goto('/')
      
      // Cart should be synced
      await newPage.click('[data-testid="cart-icon"]')
      await expect(newPage.locator('[data-testid="cart-item"]')).toHaveCount(1)
    })
  })

  test('Mobile checkout flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await test.step('Mobile product selection', async () => {
      await page.goto('/categories')
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()
      
      // Select product
      await page.locator('[data-testid="product-card"]').first().click()
      await page.click('[data-testid="add-to-cart-button"]')
    })

    await test.step('Mobile cart and checkout', async () => {
      await page.click('[data-testid="cart-icon"]')
      
      // Verify mobile cart drawer
      const cartDrawer = page.locator('[data-testid="cart-drawer"]')
      await expect(cartDrawer).toBeVisible()
      
      // Mobile checkout button should be thumb-friendly
      const checkoutBtn = page.locator('[data-testid="secure-checkout-button"]')
      await expect(checkoutBtn).toBeVisible()
      
      // Verify button is properly sized for mobile
      const buttonBox = await checkoutBtn.boundingBox()
      expect(buttonBox?.height).toBeGreaterThan(44) // iOS minimum touch target
    })
  })

  test('International shipping calculation', async ({ page }) => {
    await test.step('Add product and start checkout', async () => {
      await page.goto('/categories')
      await page.locator('[data-testid="product-card"]').first().click()
      await page.click('[data-testid="add-to-cart-button"]')
      await page.click('[data-testid="cart-icon"]')
      await page.click('[data-testid="secure-checkout-button"]')
    })

    await test.step('Select international shipping', async () => {
      await page.waitForURL(/checkout\.stripe\.com/)
      
      // Select US as shipping country
      await page.selectOption('[data-testid="shippingCountry"]', 'US')
      
      // Verify shipping options appear
      const shippingOptions = page.locator('[data-testid="shipping-options"]')
      await expect(shippingOptions).toBeVisible()
      
      // Should show multiple shipping methods
      await expect(shippingOptions.locator('input[type="radio"]')).toHaveCount.greaterThan(1)
      
      // Verify shipping costs are displayed
      await expect(page.locator('[data-testid="shipping-cost"]')).toContainText(/£\d+\.\d{2}/)
    })
  })
})

/**
 * 🧪 STRIPE WEBHOOK TESTING
 * Tests webhook processing and order completion
 */
test.describe('Stripe Webhook Processing', () => {
  test('Order completion webhook processing', async ({ request }) => {
    // Create a test checkout session first
    const sessionResponse = await request.post('/api/direct-checkout', {
      data: {
        items: [
          { variantId: 'test-variant-id', quantity: 1 }
        ],
        customerEmail: 'test@example.com'
      }
    })
    
    expect(sessionResponse.ok()).toBeTruthy()
    const sessionData = await sessionResponse.json()
    
    // Simulate webhook call
    const webhookPayload = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionData.sessionId,
          payment_status: 'paid',
          customer_email: 'test@example.com',
          amount_total: 2999
        }
      }
    }
    
    const webhookResponse = await request.post('/api/stripe-webhook', {
      data: webhookPayload,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })
    
    expect(webhookResponse.status()).toBe(200)
  })
})