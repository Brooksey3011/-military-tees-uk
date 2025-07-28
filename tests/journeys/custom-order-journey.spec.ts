import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Custom Order Journey', () => {
  test('complete custom order from inquiry to approval', async ({ page }) => {
    // Step 1: Customer discovers custom order option
    await page.goto('/')
    await expect(page.getByText(/custom.*orders/i)).toBeVisible()
    
    // Navigate via hero CTA
    await page.getByRole('link', { name: /custom orders/i }).click()
    await expect(page).toHaveURL(/\/custom/)
    
    // Step 2: Review custom order information
    await expect(page.getByRole('heading', { name: /custom.*order/i })).toBeVisible()
    await expect(page.getByText(/minimum.*order/i)).toBeVisible()
    await expect(page.getByText(/turnaround.*time/i)).toBeVisible()
    
    // View examples and pricing
    const exampleImages = page.locator('[data-testid="example-image"]')
    if (await exampleImages.count() > 0) {
      await exampleImages.first().click()
      await expect(page.getByRole('dialog')).toBeVisible() // Modal with example
      await page.getByLabelText(/close/i).click()
    }
    
    // Step 3: Fill out detailed quote request
    await page.getByLabel(/name/i).fill('Sergeant James Wilson')
    await page.getByLabel(/email/i).fill('james.wilson@military.co.uk')
    await page.getByLabel(/phone/i).fill('+44 7700 900123')
    await page.getByLabel(/order type/i).selectOption('Custom T-Shirt')
    await page.getByLabel(/quantity/i).fill('25')
    
    // Detailed description
    const description = `
      I need custom t-shirts for my regiment reunion. Requirements:
      - Front: Regiment badge with "2nd Battalion Royal Regiment"
      - Back: List of service years "1985-2010"
      - Colors: Military olive green
      - High-quality materials suitable for veterans
      - Need delivery by March 15th for reunion event
    `
    await page.getByLabel(/description/i).fill(description.trim())
    
    // Step 4: Upload design references
    const designFiles = [
      path.join(__dirname, '../fixtures/regiment-badge.jpg'),
      path.join(__dirname, '../fixtures/text-layout.png'),
      path.join(__dirname, '../fixtures/color-reference.jpg')
    ]
    
    // Upload multiple design files
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles(designFiles)
    
    // Wait for uploads to complete
    for (let i = 0; i < designFiles.length; i++) {
      await expect(page.getByText(/uploaded successfully/i)).toBeVisible()
    }
    
    // Step 5: Submit quote request
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Verify submission success
    await expect(page.getByText(/quote.*submitted.*successfully/i)).toBeVisible()
    await expect(page.getByText(/quote.*reference.*#/i)).toBeVisible()
    
    // Should show next steps
    await expect(page.getByText(/review.*within.*24.*hours/i)).toBeVisible()
    await expect(page.getByText(/email.*confirmation/i)).toBeVisible()
    
    // Step 6: Customer receives email confirmation
    // (This would be tested separately with email service)
    
    // Step 7: Admin reviews quote in dashboard
    // Login as admin
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@militarytees.co.uk')
    await page.getByLabel(/password/i).fill('AdminPassword123!')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Navigate to admin dashboard
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
    
    // Check quotes section
    await page.getByRole('link', { name: /custom quotes/i }).click()
    await expect(page.getByText('Sergeant James Wilson')).toBeVisible()
    
    // Step 8: Admin reviews quote details
    await page.getByRole('button', { name: /view details/i }).first().click()
    
    // Verify all customer information is displayed
    await expect(page.getByText('james.wilson@military.co.uk')).toBeVisible()
    await expect(page.getByText('25')).toBeVisible() // Quantity
    await expect(page.getByText(/regiment.*badge/i)).toBeVisible()
    
    // View uploaded images
    const uploadedImages = page.locator('[data-testid="uploaded-image"]')
    await expect(uploadedImages).toHaveCount(3)
    
    // Step 9: Admin provides quote and notes
    await page.getByLabel(/quoted price/i).fill('375.00')
    
    const adminNotes = `
      Custom quote for 25 military t-shirts:
      - Premium cotton material: £8 per shirt
      - Custom embroidered badge: £6 per shirt
      - Back text printing: £1 per shirt
      - Setup fee: £50
      - Total: £375 (£15 per shirt)
      - Delivery: 10-14 business days
      - Rush delivery available for additional £50
    `
    await page.getByLabel(/admin notes/i).fill(adminNotes.trim())
    
    // Update status to quoted
    await page.getByLabel(/status/i).selectOption('quoted')
    
    await page.getByRole('button', { name: /update quote/i }).click()
    await expect(page.getByText(/quote.*updated/i)).toBeVisible()
    
    // Step 10: Customer receives quote notification
    // Customer checks quote status
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('james.wilson@military.co.uk')
    await page.getByLabel(/password/i).fill('CustomerPassword123!')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // View quote status
    await page.goto('/account/quotes')
    await expect(page.getByText(/quoted.*£375/i)).toBeVisible()
    
    // Step 11: Customer approves quote
    await page.getByRole('button', { name: /approve.*quote/i }).click()
    
    // Should proceed to payment
    await expect(page).toHaveURL(/\/checkout.*quote/)
    await expect(page.getByText('£375.00')).toBeVisible()
    
    // Step 12: Payment for custom order
    await page.getByRole('button', { name: /pay.*now/i }).click()
    
    // Complete payment process
    await expect(page).toHaveURL(/\/order-confirmation/)
    await expect(page.getByText(/custom.*order.*confirmed/i)).toBeVisible()
    
    // Step 13: Production begins
    // Admin updates status
    await page.goto('/admin/quotes')
    await page.getByText('Sergeant James Wilson').click()
    await page.getByLabel(/status/i).selectOption('in_production')
    
    const productionUpdate = `
      Production started:
      - Materials ordered
      - Badge design finalized
      - Expected completion: March 10th
      - Will send preview photos before final production
    `
    await page.getByLabel(/admin notes/i).fill(productionUpdate)
    await page.getByRole('button', { name: /update/i }).click()
    
    // Step 14: Customer receives production updates
    // (Email notifications would be sent automatically)
    
    // Step 15: Quality check and completion
    await page.getByLabel(/status/i).selectOption('completed')
    
    const completionNotes = `
      Order completed successfully:
      - All 25 t-shirts produced to specification
      - Quality checked and approved
      - Packaged for delivery
      - Tracking number: MT2024-0001
      - Delivered on schedule
    `
    await page.getByLabel(/admin notes/i).fill(completionNotes)
    await page.getByRole('button', { name: /update/i }).click()
    
    // Step 16: Customer receives completion notification
    // Customer can view final status
    await page.goto('/account/quotes')
    await expect(page.getByText(/completed/i)).toBeVisible()
    await expect(page.getByText(/tracking.*MT2024-0001/i)).toBeVisible()
  })

  test('customer can modify quote request before approval', async ({ page }) => {
    // Submit initial quote
    await page.goto('/custom')
    await page.getByLabel(/name/i).fill('Captain Smith')
    await page.getByLabel(/email/i).fill('smith@example.com')
    await page.getByLabel(/order type/i).selectOption('Custom Polo')
    await page.getByLabel(/quantity/i).fill('15')
    await page.getByLabel(/description/i).fill('Initial request for polo shirts')
    
    await page.getByRole('button', { name: /submit quote/i }).click()
    await expect(page.getByText(/quote.*submitted/i)).toBeVisible()
    
    // Customer realizes they need to modify request
    await page.goto('/account/quotes')
    await page.getByRole('button', { name: /modify.*request/i }).click()
    
    // Update quantity and description
    await page.getByLabel(/quantity/i).fill('20')
    const updatedDescription = `
      Updated requirements:
      - Increased quantity to 20 polo shirts
      - Need embroidered logo on chest
      - Navy blue color preferred
      - Delivery needed by end of month
    `
    await page.getByLabel(/description/i).fill(updatedDescription.trim())
    
    await page.getByRole('button', { name: /update.*quote/i }).click()
    await expect(page.getByText(/quote.*updated/i)).toBeVisible()
    
    // Admin should see the modification
    await page.goto('/admin/quotes')
    await expect(page.getByText('Captain Smith')).toBeVisible()
    await expect(page.getByText(/modified/i)).toBeVisible()
  })

  test('handles quote rejection and revision flow', async ({ page }) => {
    // Customer submits quote
    await page.goto('/custom')
    await page.getByLabel(/name/i).fill('Lieutenant Brown')
    await page.getByLabel(/email/i).fill('brown@example.com')
    await page.getByLabel(/order type/i).selectOption('Custom Jacket')
    await page.getByLabel(/quantity/i).fill('5')
    await page.getByLabel(/description/i).fill('Custom jackets for special unit')
    
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Admin provides high quote
    await page.goto('/admin/quotes')
    await page.getByText('Lieutenant Brown').click()
    await page.getByLabel(/quoted price/i).fill('750.00')
    await page.getByLabel(/status/i).selectOption('quoted')
    await page.getByRole('button', { name: /update/i }).click()
    
    // Customer rejects quote
    await page.goto('/account/quotes')
    await page.getByRole('button', { name: /reject.*quote/i }).click()
    
    const rejectionReason = 'Price is higher than our budget. Maximum we can spend is £500.'
    await page.getByLabel(/reason/i).fill(rejectionReason)
    await page.getByRole('button', { name: /submit.*rejection/i }).click()
    
    // Admin sees rejection and can revise
    await page.goto('/admin/quotes')
    await expect(page.getByText(/rejected/i)).toBeVisible()
    
    // Admin provides revised quote
    await page.getByLabel(/quoted price/i).fill('500.00')
    await page.getByLabel(/admin notes/i).fill('Revised quote to meet budget')
    await page.getByLabel(/status/i).selectOption('quoted')
    await page.getByRole('button', { name: /update/i }).click()
    
    // Customer can now approve revised quote
    await page.goto('/account/quotes')
    await expect(page.getByText('£500.00')).toBeVisible()
    await page.getByRole('button', { name: /approve/i }).click()
  })

  test('quote expires after timeout period', async ({ page }) => {
    // Submit quote request
    await page.goto('/custom')
    await page.getByLabel(/name/i).fill('Major Davis')
    await page.getByLabel(/email/i).fill('davis@example.com')
    await page.getByLabel(/order type/i).selectOption('Custom Badge')
    await page.getByLabel(/description/i).fill('Custom unit badges')
    
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Admin provides quote
    await page.goto('/admin/quotes')
    await page.getByText('Major Davis').click()
    await page.getByLabel(/quoted price/i).fill('200.00')
    await page.getByLabel(/status/i).selectOption('quoted')
    await page.getByRole('button', { name: /update/i }).click()
    
    // Simulate quote expiration (would be handled by background job)
    // For testing, manually set to expired
    await page.getByLabel(/status/i).selectOption('expired')
    await page.getByRole('button', { name: /update/i }).click()
    
    // Customer sees expired quote
    await page.goto('/account/quotes')
    await expect(page.getByText(/expired/i)).toBeVisible()
    
    // Customer can request renewal
    await page.getByRole('button', { name: /renew.*quote/i }).click()
    await expect(page.getByText(/renewal.*requested/i)).toBeVisible()
  })

  test('bulk custom order for large quantities', async ({ page }) => {
    // Large organization submits bulk order
    await page.goto('/custom')
    await page.getByLabel(/name/i).fill('Colonel Thompson')
    await page.getByLabel(/email/i).fill('thompson@regiment.mil')
    await page.getByLabel(/organization/i).fill('3rd Royal Regiment')
    await page.getByLabel(/order type/i).selectOption('Custom T-Shirt')
    await page.getByLabel(/quantity/i).fill('500')
    
    const bulkDescription = `
      Large bulk order for entire regiment:
      - 500 custom t-shirts
      - Multiple sizes (S-XXXL)
      - Regiment crest on front
      - Service years on back
      - Need size breakdown estimate
      - Delivery to military base
      - Payment via government purchase order
    `
    await page.getByLabel(/description/i).fill(bulkDescription.trim())
    
    // Upload official crest and requirements
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles([
      path.join(__dirname, '../fixtures/official-crest.png'),
      path.join(__dirname, '../fixtures/size-requirements.pdf')
    ])
    
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Admin handles bulk order differently
    await page.goto('/admin/quotes')
    await page.getByText('Colonel Thompson').click()
    
    // Admin flags as bulk order
    await page.getByLabel(/bulk order/i).check()
    
    // Provides detailed bulk pricing
    const bulkNotes = `
      Bulk Order - 500 units:
      - Base price: £12 per shirt (bulk discount applied)
      - Setup fee: £200
      - Design digitization: £150  
      - Delivery to base: £100
      - Total: £6,450
      - Payment terms: Net 30 days
      - Production time: 3-4 weeks
    `
    await page.getByLabel(/admin notes/i).fill(bulkNotes.trim())
    await page.getByLabel(/quoted price/i).fill('6450.00')
    await page.getByLabel(/status/i).selectOption('quoted')
    
    await page.getByRole('button', { name: /update/i }).click()
    
    // Customer approves bulk order
    await page.goto('/account/quotes')
    await expect(page.getByText('£6,450.00')).toBeVisible()
    await expect(page.getByText(/bulk.*order/i)).toBeVisible()
    
    await page.getByRole('button', { name: /approve/i }).click()
  })
})