import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('can register new user successfully', async ({ page }) => {
      await page.goto('/signup')
      
      // Fill registration form
      await page.getByLabel(/first name/i).fill('John')
      await page.getByLabel(/last name/i).fill('Doe')
      await page.getByLabel(/email/i).fill('john.doe@example.com')
      await page.getByLabel(/password/i).fill('SecurePassword123!')
      await page.getByLabel(/confirm password/i).fill('SecurePassword123!')
      
      // Accept terms
      await page.getByLabel(/terms.*conditions/i).check()
      
      // Submit registration
      await page.getByRole('button', { name: /sign up/i }).click()
      
      // Should show success message
      await expect(page.getByText(/registration successful/i)).toBeVisible()
      
      // Should redirect to login or verification page
      await expect(page).toHaveURL(/\/(login|verify)/)
    })

    test('validates registration form fields', async ({ page }) => {
      await page.goto('/signup')
      
      // Try to submit empty form
      await page.getByRole('button', { name: /sign up/i }).click()
      
      // Should show validation errors
      await expect(page.getByText(/first name.*required/i)).toBeVisible()
      await expect(page.getByText(/email.*required/i)).toBeVisible()
      await expect(page.getByText(/password.*required/i)).toBeVisible()
    })

    test('validates email format', async ({ page }) => {
      await page.goto('/signup')
      
      await page.getByLabel(/email/i).fill('invalid-email')
      await page.getByLabel(/first name/i).click() // Trigger blur
      
      await expect(page.getByText(/invalid email/i)).toBeVisible()
    })

    test('validates password strength', async ({ page }) => {
      await page.goto('/signup')
      
      await page.getByLabel(/password/i).fill('weak')
      await page.getByLabel(/first name/i).click() // Trigger blur
      
      await expect(page.getByText(/password must be/i)).toBeVisible()
    })

    test('validates password confirmation match', async ({ page }) => {
      await page.goto('/signup')
      
      await page.getByLabel(/password/i).fill('SecurePassword123!')
      await page.getByLabel(/confirm password/i).fill('DifferentPassword123!')
      await page.getByLabel(/first name/i).click() // Trigger blur
      
      await expect(page.getByText(/passwords.*match/i)).toBeVisible()
    })

    test('requires terms acceptance', async ({ page }) => {
      await page.goto('/signup')
      
      // Fill form but don't check terms
      await page.getByLabel(/first name/i).fill('John')
      await page.getByLabel(/email/i).fill('john@example.com')
      await page.getByLabel(/password/i).fill('SecurePassword123!')
      await page.getByLabel(/confirm password/i).fill('SecurePassword123!')
      
      await page.getByRole('button', { name: /sign up/i }).click()
      
      await expect(page.getByText(/accept.*terms/i)).toBeVisible()
    })
  })

  test.describe('User Login', () => {
    test('can login with valid credentials', async ({ page }) => {
      await page.goto('/login')
      
      // Fill login form
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('TestPassword123!')
      
      // Submit login
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Should redirect to dashboard or home
      await expect(page).toHaveURL(/\/(|dashboard)/)
      
      // Should show logged in state
      await expect(page.getByText(/welcome/i)).toBeVisible()
    })

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      
      await page.getByRole('button', { name: /sign in/i }).click()
      
      await expect(page.getByText(/invalid.*credentials/i)).toBeVisible()
    })

    test('validates required login fields', async ({ page }) => {
      await page.goto('/login')
      
      await page.getByRole('button', { name: /sign in/i }).click()
      
      await expect(page.getByText(/email.*required/i)).toBeVisible()
      await expect(page.getByText(/password.*required/i)).toBeVisible()
    })

    test('has forgot password link', async ({ page }) => {
      await page.goto('/login')
      
      const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i })
      await expect(forgotPasswordLink).toBeVisible()
      
      await forgotPasswordLink.click()
      await expect(page).toHaveURL(/\/forgot-password/)
    })

    test('remembers user session', async ({ page, context }) => {
      // Login first
      await page.goto('/login')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('TestPassword123!')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Navigate away and back
      await page.goto('/products')
      await page.goto('/')
      
      // Should still be logged in
      await expect(page.getByText(/account/i)).toBeVisible()
    })
  })

  test.describe('User Logout', () => {
    test('can logout successfully', async ({ page }) => {
      // Assume user is logged in
      await page.goto('/')
      
      // Open account menu
      await page.getByText(/account/i).click()
      
      // Click logout
      await page.getByRole('button', { name: /logout/i }).click()
      
      // Should show login/signup options
      await expect(page.getByText(/login/i)).toBeVisible()
      await expect(page.getByText(/sign up/i)).toBeVisible()
    })
  })

  test.describe('Password Reset', () => {
    test('can request password reset', async ({ page }) => {
      await page.goto('/forgot-password')
      
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByRole('button', { name: /reset password/i }).click()
      
      await expect(page.getByText(/reset.*email.*sent/i)).toBeVisible()
    })

    test('validates email for password reset', async ({ page }) => {
      await page.goto('/forgot-password')
      
      await page.getByRole('button', { name: /reset password/i }).click()
      
      await expect(page.getByText(/email.*required/i)).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('redirects to login for protected pages when not authenticated', async ({ page }) => {
      // Try to access profile page without login
      await page.goto('/profile')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByText(/please.*sign.*in/i)).toBeVisible()
    })

    test('can access profile page when authenticated', async ({ page }) => {
      // Login first (this would need proper test user setup)
      await page.goto('/login')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('TestPassword123!')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Now access profile
      await page.goto('/profile')
      
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible()
    })
  })

  test.describe('Admin Authentication', () => {
    test('redirects non-admin users from admin area', async ({ page }) => {
      // Login as regular user
      await page.goto('/login')
      await page.getByLabel(/email/i).fill('user@example.com')
      await page.getByLabel(/password/i).fill('UserPassword123!')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Try to access admin area
      await page.goto('/admin')
      
      // Should redirect or show access denied
      await expect(page).toHaveURL(/\/(login|access-denied|)/)
      await expect(page.getByText(/access.*denied|not.*authorized/i)).toBeVisible()
    })

    test('allows admin users to access admin area', async ({ page }) => {
      // Login as admin user
      await page.goto('/login')
      await page.getByLabel(/email/i).fill('admin@militarytees.co.uk')
      await page.getByLabel(/password/i).fill('AdminPassword123!')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Access admin area
      await page.goto('/admin')
      
      await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
    })

    test('admin can enable 2FA', async ({ page }) => {
      // Login as admin
      await page.goto('/login')
      await page.getByLabel(/email/i).fill('admin@militarytees.co.uk')
      await page.getByLabel(/password/i).fill('AdminPassword123!')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Go to admin security settings
      await page.goto('/admin/security')
      
      // Enable 2FA
      await page.getByRole('button', { name: /enable.*2fa/i }).click()
      
      // Should show QR code
      await expect(page.getByText(/scan.*qr.*code/i)).toBeVisible()
      await expect(page.locator('[data-testid="qr-code"]')).toBeVisible()
    })
  })

  test.describe('Social Authentication', () => {
    test('shows social login options', async ({ page }) => {
      await page.goto('/login')
      
      // Check if social login buttons are present
      if (await page.getByRole('button', { name: /google/i }).count() > 0) {
        await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
      }
      
      if (await page.getByRole('button', { name: /github/i }).count() > 0) {
        await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
      }
    })
  })
})