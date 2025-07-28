import { test, expect } from '@playwright/test'

test.describe('Complete Shopping Flow', () => {
  test('can browse products, add to cart, and checkout', async ({ page }) => {
    // Navigate to products page
    await page.goto('/')
    await page.getByRole('link', { name: /products/i }).click()
    
    await expect(page).toHaveURL(/\/products/)
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()

    // Test product filtering
    await page.getByLabel(/category/i).selectOption('t-shirts')
    await page.waitForLoadState('networkidle')
    
    // Should show filtered products
    const products = page.locator('[data-testid="product-card"]')
    await expect(products).toHaveCount.greaterThan(0)

    // View product details
    const firstProduct = products.first()
    const productName = await firstProduct.getByRole('heading').textContent()
    await firstProduct.getByRole('link').click()

    // Product detail page
    await expect(page.getByRole('heading', { name: productName })).toBeVisible()
    await expect(page.getByText(/£/)).toBeVisible() // Price should be visible

    // Select product options
    await page.getByLabel(/size/i).selectOption('M')
    await page.getByLabel(/color/i).selectOption('Black')

    // Add to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    await expect(addToCartButton).toBeEnabled()
    await addToCartButton.click()

    // Should show success notification
    await expect(page.getByText(/added to cart/i)).toBeVisible()

    // Check cart count updated
    await expect(page.getByText('1')).toBeVisible() // Cart count

    // Open cart drawer
    await page.getByLabelText(/cart/i).click()

    // Verify cart contents
    await expect(page.getByText(productName)).toBeVisible()
    await expect(page.getByText('Size: M')).toBeVisible()
    await expect(page.getByText('Color: Black')).toBeVisible()

    // Test quantity update
    const quantityInput = page.getByLabel(/quantity/i)
    await quantityInput.fill('2')
    await page.keyboard.press('Enter')

    // Cart total should update
    await expect(page.getByText(/total.*£/i)).toBeVisible()

    // Proceed to checkout
    await page.getByRole('button', { name: /checkout/i }).click()

    // Should redirect to checkout page
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('can update cart quantities and remove items', async ({ page }) => {
    // Add a product to cart first
    await page.goto('/products')
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.getByRole('button', { name: /add to cart/i }).click()

    // Open cart
    await page.getByLabelText(/cart/i).click()

    // Update quantity
    const quantityInput = page.getByLabel(/quantity/i)
    await quantityInput.fill('3')
    await page.keyboard.press('Enter')

    // Verify quantity updated
    await expect(quantityInput).toHaveValue('3')

    // Remove item
    await page.getByLabelText(/remove.*item/i).click()

    // Confirm removal in dialog
    await page.getByRole('button', { name: /remove/i }).click()

    // Cart should be empty
    await expect(page.getByText(/cart is empty/i)).toBeVisible()
  })

  test('shows proper cart state persistence', async ({ page }) => {
    // Add item to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Navigate away and back
    await page.goto('/')
    await page.goto('/products')

    // Cart count should persist
    await expect(page.getByText('1')).toBeVisible()

    // Open cart to verify contents persist
    await page.getByLabelText(/cart/i).click()
    await expect(page.getByText(/£/)).toBeVisible() // Price should be visible
  })

  test('handles out of stock products correctly', async ({ page }) => {
    // Mock an out of stock product (this would need actual data setup)
    await page.goto('/products')
    
    // Look for out of stock indicator
    const outOfStockProduct = page.locator('[data-testid="product-card"]')
      .filter({ hasText: /out of stock/i }).first()

    if (await outOfStockProduct.count() > 0) {
      // Add to cart button should be disabled
      const addToCartButton = outOfStockProduct.getByRole('button', { name: /add to cart/i })
      await expect(addToCartButton).toBeDisabled()

      // Should show out of stock message
      await expect(outOfStockProduct.getByText(/out of stock/i)).toBeVisible()
    }
  })

  test('applies discount codes correctly', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Go to checkout
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()

    // Apply discount code
    const discountInput = page.getByLabel(/discount.*code/i)
    await discountInput.fill('MILITARY10')
    await page.getByRole('button', { name: /apply/i }).click()

    // Should show discount applied
    await expect(page.getByText(/discount applied/i)).toBeVisible()
    await expect(page.getByText(/10% off/i)).toBeVisible()
  })

  test('calculates shipping costs correctly', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Go to checkout
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()

    // Check shipping calculation
    await expect(page.getByText(/shipping/i)).toBeVisible()
    
    // For orders under £50, should show shipping cost
    const total = await page.getByText(/total.*£(\d+\.?\d*)/i).textContent()
    const totalAmount = parseFloat(total?.match(/£(\d+\.?\d*)/)?.[1] || '0')
    
    if (totalAmount < 50) {
      await expect(page.getByText(/£4.99/)).toBeVisible() // Standard shipping
    } else {
      await expect(page.getByText(/free shipping/i)).toBeVisible()
    }
  })

  test('handles cart abandonment and recovery', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Start checkout process
    await page.getByLabelText(/cart/i).click()
    await page.getByRole('button', { name: /checkout/i }).click()

    // Fill some checkout information
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/first name/i).fill('John')

    // Leave the page (abandon cart)
    await page.goto('/')

    // Return to cart
    await page.getByLabelText(/cart/i).click()

    // Cart should still contain items
    await expect(page.getByText(/£/)).toBeVisible()
    
    // Should show abandoned cart recovery message (if implemented)
    if (await page.getByText(/complete your order/i).count() > 0) {
      await expect(page.getByText(/complete your order/i)).toBeVisible()
    }
  })
})