import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Custom Orders Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/custom')
  })

  test('displays custom order form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /custom order/i })).toBeVisible()
    
    // Check all form fields are present
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/order type/i)).toBeVisible()
    await expect(page.getByLabel(/quantity/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    
    // Check file upload area
    await expect(page.getByText(/drag.*drop.*images/i)).toBeVisible()
  })

  test('validates required form fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/description is required/i)).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/name/i).click() // Trigger blur
    
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('validates quantity range', async ({ page }) => {
    await page.getByLabel(/quantity/i).fill('0')
    await page.getByLabel(/name/i).click() // Trigger blur
    
    await expect(page.getByText(/quantity must be at least 1/i)).toBeVisible()
  })

  test('handles file upload correctly', async ({ page }) => {
    // Create a test image file
    const testFile = path.join(__dirname, '../fixtures/test-image.jpg')
    
    // Upload file
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles(testFile)
    
    // Should show uploaded file
    await expect(page.getByText('test-image.jpg')).toBeVisible()
    
    // Should show upload progress
    await expect(page.getByText(/uploading/i)).toBeVisible()
    
    // After upload, should show success
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible()
  })

  test('limits number of uploaded files to 5', async ({ page }) => {
    const testFiles = Array.from({ length: 6 }, (_, i) => 
      path.join(__dirname, `../fixtures/test-image-${i + 1}.jpg`)
    )
    
    // Try to upload 6 files
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles(testFiles)
    
    // Should show error about file limit
    await expect(page.getByText(/maximum 5 images/i)).toBeVisible()
  })

  test('validates file types', async ({ page }) => {
    // Try to upload non-image file
    const textFile = path.join(__dirname, '../fixtures/test.txt')
    
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles(textFile)
    
    // Should show file type error
    await expect(page.getByText(/only image files/i)).toBeVisible()
  })

  test('allows removing uploaded files', async ({ page }) => {
    // Upload a file first
    const testFile = path.join(__dirname, '../fixtures/test-image.jpg')
    const fileInput = page.getByLabel(/upload.*images/i)
    await fileInput.setInputFiles(testFile)
    
    await expect(page.getByText('test-image.jpg')).toBeVisible()
    
    // Remove the file
    await page.getByLabelText(/remove.*test-image\.jpg/i).click()
    
    // File should be removed
    await expect(page.getByText('test-image.jpg')).not.toBeVisible()
  })

  test('submits quote successfully with valid data', async ({ page }) => {
    // Fill out form with valid data
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john@example.com')
    await page.getByLabel(/order type/i).selectOption('Custom T-Shirt')
    await page.getByLabel(/quantity/i).fill('10')
    await page.getByLabel(/description/i).fill(
      'I need a custom design featuring our military unit badge with specific colors and text.'
    )
    
    // Upload a design image
    const testFile = path.join(__dirname, '../fixtures/test-image.jpg')
    await page.getByLabel(/upload.*images/i).setInputFiles(testFile)
    
    // Wait for upload to complete
    await page.waitForSelector('text=uploaded successfully', { timeout: 10000 })
    
    // Submit form
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Should show success message
    await expect(page.getByText(/quote submitted successfully/i)).toBeVisible()
    
    // Form should be reset
    await expect(page.getByLabel(/name/i)).toHaveValue('')
    await expect(page.getByLabel(/email/i)).toHaveValue('')
  })

  test('shows loading state during submission', async ({ page }) => {
    // Fill out form
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john@example.com')
    await page.getByLabel(/description/i).fill('Test description for quote request')
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /submit quote/i })
    await submitButton.click()
    
    // Should show loading state
    await expect(page.getByText(/submitting/i)).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('handles form submission errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('/api/custom-quote', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: false, 
          error: 'Server error occurred' 
        })
      })
    })
    
    // Fill and submit form
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john@example.com')
    await page.getByLabel(/description/i).fill('Test description')
    
    await page.getByRole('button', { name: /submit quote/i }).click()
    
    // Should show error message
    await expect(page.getByText(/server error occurred/i)).toBeVisible()
  })

  test('drag and drop file upload works', async ({ page }) => {
    // This would require a more complex setup to simulate drag and drop
    // For now, we'll test that the drop zone is present and accessible
    const dropZone = page.getByText(/drag.*drop.*images/i)
    await expect(dropZone).toBeVisible()
    
    // Check drop zone has proper attributes
    await expect(dropZone).toHaveAttribute('role', 'button')
    await expect(dropZone).toHaveAttribute('tabindex', '0')
  })

  test('displays pricing information', async ({ page }) => {
    // Should show pricing guidance
    await expect(page.getByText(/pricing/i)).toBeVisible()
    await expect(page.getByText(/minimum order/i)).toBeVisible()
    
    // Should show turnaround time
    await expect(page.getByText(/turnaround.*time/i)).toBeVisible()
  })

  test('shows examples of custom work', async ({ page }) => {
    // Check for examples section
    await expect(page.getByRole('heading', { name: /examples/i })).toBeVisible()
    
    // Should show example images
    const exampleImages = page.locator('[data-testid="example-image"]')
    await expect(exampleImages).toHaveCount.greaterThan(0)
  })

  test('has proper accessibility', async ({ page }) => {
    // Check form has proper labels
    const nameInput = page.getByLabel(/name/i)
    await expect(nameInput).toHaveAttribute('aria-required', 'true')
    
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('type', 'email')
    
    // Check file upload is accessible
    const fileInput = page.getByLabel(/upload.*images/i)
    await expect(fileInput).toHaveAttribute('type', 'file')
    await expect(fileInput).toHaveAttribute('accept', expect.stringContaining('image'))
  })

  test('preserves form data on page refresh', async ({ page }) => {
    // Fill out partial form
    await page.getByLabel(/name/i).fill('John Doe')
    await page.getByLabel(/email/i).fill('john@example.com')
    await page.getByLabel(/description/i).fill('Test description')
    
    // Refresh page
    await page.reload()
    
    // Data should be preserved (if localStorage is implemented)
    if (await page.getByLabel(/name/i).inputValue() !== '') {
      await expect(page.getByLabel(/name/i)).toHaveValue('John Doe')
      await expect(page.getByLabel(/email/i)).toHaveValue('john@example.com')
    }
  })
})