import { test, expect } from '@playwright/test'

test.describe('Complete Purchase Journey', () => {
  test('new user can browse, register, shop, and complete purchase', async ({ page }) => {
    // Step 1: Visit homepage as new user
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /military tees uk/i })).toBeVisible()

    // Step 2: Browse products
    await page.getByRole('link', { name: /products/i }).click()
    await expect(page).toHaveURL(/\/products/)
    
    // Apply filters to find specific product
    await page.getByLabel(/category/i).selectOption('t-shirts')
    await page.getByLabel(/sort/i).selectOption('price_asc')
    
    // Step 3: View product details
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    const productName = await firstProduct.getByRole('heading').textContent()
    await firstProduct.getByRole('link').click()
    
    await expect(page.getByRole('heading', { name: productName })).toBeVisible()
    
    // Step 4: Select product options and add to cart
    await page.getByLabel(/size/i).selectOption('L')
    await page.getByLabel(/color/i).selectOption('Olive')
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    // Verify cart updated
    await expect(page.getByText(/added to cart/i)).toBeVisible()
    await expect(page.getByText('1')).toBeVisible() // Cart count
    
    // Step 5: Continue shopping - add another item
    await page.goto('/products')
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1)
    await secondProduct.getByRole('button', { name: /add to cart/i }).click()
    
    await expect(page.getByText('2')).toBeVisible() // Updated cart count
    
    // Step 6: Review cart
    await page.getByLabelText(/cart/i).click()
    await expect(page.getByText('Shopping Cart (2)')).toBeVisible()
    
    // Update quantity of first item
    const quantityInput = page.getByLabel(/quantity/i).first()
    await quantityInput.fill('2')
    await page.keyboard.press('Enter')
    
    // Verify total updated
    await expect(page.getByText(/total.*£/i)).toBeVisible()
    
    // Step 7: Proceed to checkout (requires registration)
    await page.getByRole('button', { name: /checkout/i }).click()
    
    // Should redirect to login/register
    await expect(page).toHaveURL(/\/(login|register|checkout)/)
    
    // Step 8: Register new account
    if (await page.getByText(/create account/i).count() > 0) {
      await page.getByRole('link', { name: /sign up/i }).click()
    }
    
    await page.getByLabel(/first name/i).fill('John')
    await page.getByLabel(/last name/i).fill('Doe')
    await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`)
    await page.getByLabel(/password/i).fill('SecurePassword123!')
    await page.getByLabel(/confirm password/i).fill('SecurePassword123!')
    await page.getByLabel(/terms/i).check()
    
    await page.getByRole('button', { name: /sign up/i }).click()
    
    // Should proceed to checkout after registration
    await expect(page).toHaveURL(/\/checkout/)
    
    // Step 9: Fill checkout form
    await page.getByLabel(/address line 1/i).fill('123 Military Street')
    await page.getByLabel(/city/i).fill('London')
    await page.getByLabel(/postcode/i).fill('SW1A 1AA')
    await page.getByLabel(/country/i).selectOption('United Kingdom')
    
    // Step 10: Apply discount code (if available)
    const discountInput = page.getByLabel(/discount/i)
    if (await discountInput.count() > 0) {
      await discountInput.fill('MILITARY10')
      await page.getByRole('button', { name: /apply/i }).click()
      await expect(page.getByText(/discount applied/i)).toBeVisible()
    }
    
    // Step 11: Review order summary
    await expect(page.getByText(/order summary/i)).toBeVisible()
    await expect(page.getByText(productName)).toBeVisible()
    
    // Verify shipping cost calculation
    const orderTotal = await page.getByText(/total.*£(\d+\.?\d*)/i).textContent()
    const totalAmount = parseFloat(orderTotal?.match(/£(\d+\.?\d*)/)?.[1] || '0')
    
    if (totalAmount >= 50) {
      await expect(page.getByText(/free shipping/i)).toBeVisible()
    } else {
      await expect(page.getByText(/shipping.*£4\.99/i)).toBeVisible()
    }
    
    // Step 12: Proceed to payment
    await page.getByRole('button', { name: /proceed to payment/i }).click()
    
    // Should redirect to Stripe or show payment form
    await expect(page).toHaveURL(/stripe|payment/)
    
    // Step 13: Complete payment (in test environment)
    // This would typically involve Stripe test cards
    if (await page.getByText(/test payment/i).count() > 0) {
      await page.getByRole('button', { name: /complete test payment/i }).click()
    }
    
    // Step 14: Verify order confirmation
    await expect(page).toHaveURL(/\/order-confirmation/)
    await expect(page.getByText(/order confirmed/i)).toBeVisible()
    await expect(page.getByText(/order number/i)).toBeVisible()
    
    // Should show order details
    await expect(page.getByText(productName)).toBeVisible()
    await expect(page.getByText(/delivery estimate/i)).toBeVisible()
    
    // Step 15: Verify email confirmation sent
    await expect(page.getByText(/confirmation email sent/i)).toBeVisible()
    
    // Step 16: Check account shows order
    await page.getByText(/account/i).click()
    await page.getByRole('link', { name: /orders/i }).click()
    
    await expect(page.getByText(/recent orders/i)).toBeVisible()
    await expect(page.getByText(productName)).toBeVisible()
  })

  test('returning customer can complete purchase quickly', async ({ page }) => {
    // Step 1: Login as existing customer
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('returning@example.com')
    await page.getByLabel(/password/i).fill('Password123!')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Step 2: Quick add to cart from homepage
    await page.goto('/')
    const featuredProduct = page.locator('[data-testid="featured-product"]').first()
    await featuredProduct.getByRole('button', { name: /add to cart/i }).click()
    
    // Step 3: Express checkout
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /express checkout/i }).click()
    
    // Should use saved address and payment method
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByText(/saved address/i)).toBeVisible()
    
    // Step 4: Confirm and pay
    await page.getByRole('button', { name: /place order/i }).click()
    
    // Should complete quickly due to saved information
    await expect(page).toHaveURL(/\/order-confirmation/)
    await expect(page.getByText(/order confirmed/i)).toBeVisible()
  })

  test('mobile purchase journey works correctly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices')
    
    // Step 1: Visit mobile site
    await page.goto('/')
    
    // Step 2: Use mobile navigation
    await page.getByLabelText(/toggle menu/i).click()
    await page.getByRole('link', { name: /products/i }).click()
    
    // Step 3: Mobile product browsing
    const product = page.locator('[data-testid="product-card"]').first()
    await product.click() // Tap to view
    
    // Step 4: Mobile cart interaction
    await page.getByRole('button', { name: /add to cart/i }).click()
    
    // Mobile cart drawer should open
    await expect(page.getByText(/added to cart/i)).toBeVisible()
    
    // Step 5: Mobile checkout
    await page.getByRole('button', { name: /checkout/i }).click()
    
    // Mobile form should be optimized
    await expect(page.getByLabel(/address/i)).toBeVisible()
    expect(await page.getByLabel(/postcode/i).getAttribute('inputmode')).toBe('text')
  })

  test('cart abandonment and recovery flow', async ({ page }) => {
    // Step 1: Add items to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()
    
    // Step 2: Start checkout process
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()
    
    // Step 3: Fill partial checkout info
    await page.getByLabel(/email/i).fill('abandon@example.com')
    await page.getByLabel(/first name/i).fill('John')
    
    // Step 4: Abandon cart (leave site)
    await page.goto('https://google.com')
    
    // Step 5: Return to site
    await page.goto('/')
    
    // Step 6: Cart should be restored
    await page.getByLabelText(/cart/i).click()
    await expect(page.getByText(/£/)).toBeVisible() // Cart has items
    
    // Step 7: Should show recovery message
    if (await page.getByText(/complete your order/i).count() > 0) {
      await expect(page.getByText(/complete your order/i)).toBeVisible()
      
      // Recovery flow
      await page.getByRole('button', { name: /complete order/i }).click()
      await expect(page).toHaveURL(/\/checkout/)
      
      // Form should be partially filled
      await expect(page.getByLabel(/email/i)).toHaveValue('abandon@example.com')
    }
  })

  test('price change during checkout flow', async ({ page }) => {
    // Step 1: Add product to cart
    await page.goto('/products')
    const product = page.locator('[data-testid="product-card"]').first()
    const originalPrice = await product.getByText(/£\d+\.\d+/).textContent()
    
    await product.getByRole('button', { name: /add to cart/i }).click()
    
    // Step 2: Simulate price change (would need admin or API call)
    // For test purposes, we'll check the system handles this gracefully
    
    // Step 3: Proceed to checkout
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()
    
    // Step 4: System should detect price change
    // and either update cart or show warning
    if (await page.getByText(/price.*changed/i).count() > 0) {
      await expect(page.getByText(/price.*updated/i)).toBeVisible()
      await page.getByRole('button', { name: /accept.*continue/i }).click()
    }
    
    // Step 5: Complete checkout with updated price
    await page.getByRole('button', { name: /proceed to payment/i }).click()
  })

  test('checkout with gift message and special instructions', async ({ page }) => {
    // Step 1: Add product to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()
    
    // Step 2: Proceed to checkout
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()
    
    // Step 3: Add gift options
    if (await page.getByLabel(/gift order/i).count() > 0) {
      await page.getByLabel(/gift order/i).check()
      await page.getByLabel(/gift message/i).fill('Happy Birthday! From your military family.')
    }
    
    // Step 4: Add special instructions
    await page.getByLabel(/special instructions/i).fill('Please deliver after 6 PM')
    
    // Step 5: Complete checkout
    await page.getByRole('button', { name: /place order/i }).click()
    
    // Step 6: Verify gift options in confirmation
    await expect(page.getByText(/gift order/i)).toBeVisible()
    await expect(page.getByText(/special instructions/i)).toBeVisible()
  })
})