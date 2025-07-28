import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title and military branding', async ({ page }) => {
    await expect(page).toHaveTitle(/Military Tees UK/)
    
    // Check military logo is present
    const logo = page.getByAltText('Military Tees UK')
    await expect(logo).toBeVisible()
  })

  test('displays main navigation correctly', async ({ page }) => {
    // Check main navigation items
    await expect(page.getByRole('link', { name: /products/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /custom orders/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible()
  })

  test('shows cart with initial state', async ({ page }) => {
    const cartButton = page.getByLabelText(/cart/i)
    await expect(cartButton).toBeVisible()
    
    // Cart should show 0 items initially
    const cartCount = page.getByText('0')
    await expect(cartCount).toBeVisible()
  })

  test('displays hero section with call-to-action', async ({ page }) => {
    // Check for hero content
    await expect(page.getByRole('heading', { name: /military heritage/i })).toBeVisible()
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /shop now/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /custom orders/i })).toBeVisible()
  })

  test('shows featured products section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /featured products/i })).toBeVisible()
    
    // Should display product cards
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards).toHaveCount(3) // Assuming 3 featured products
  })

  test('mobile navigation works correctly', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open mobile menu
      const menuButton = page.getByLabelText(/toggle menu/i)
      await expect(menuButton).toBeVisible()
      await menuButton.click()
      
      // Check mobile navigation items appear
      await expect(page.getByRole('link', { name: /products/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /custom orders/i })).toBeVisible()
      
      // Close menu
      await menuButton.click()
    }
  })

  test('footer contains required information', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check footer links
    await expect(page.getByRole('link', { name: /terms & conditions/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /shipping policy/i })).toBeVisible()
    
    // Check company information
    await expect(page.getByText(/military tees uk/i)).toBeVisible()
    await expect(page.getByText(/militarytees\.co\.uk/i)).toBeVisible()
  })

  test('search functionality is accessible', async ({ page }) => {
    const searchButton = page.getByLabelText(/search/i)
    await expect(searchButton).toBeVisible()
    
    await searchButton.click()
    
    const searchInput = page.getByPlaceholder(/search products/i)
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeFocused()
  })

  test('page loads with good performance', async ({ page }) => {
    // Check page loads within reasonable time
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
  })

  test('has proper accessibility attributes', async ({ page }) => {
    // Check main landmark
    await expect(page.getByRole('main')).toBeVisible()
    
    // Check navigation landmark
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check headings hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
  })

  test('newsletter signup works', async ({ page }) => {
    const emailInput = page.getByLabelText(/email.*newsletter/i)
    const subscribeButton = page.getByRole('button', { name: /subscribe/i })
    
    await expect(emailInput).toBeVisible()
    await expect(subscribeButton).toBeVisible()
    
    // Test newsletter signup
    await emailInput.fill('test@example.com')
    await subscribeButton.click()
    
    // Should show success message
    await expect(page.getByText(/subscribed successfully/i)).toBeVisible()
  })
})