import { test, expect } from '@playwright/test'

test.describe('Admin Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@militarytees.co.uk')
    await page.getByLabel(/password/i).fill('AdminPassword123!')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await expect(page).toHaveURL(/\/admin/)
  })

  test('complete product management workflow', async ({ page }) => {
    // Step 1: View products dashboard
    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: /product management/i })).toBeVisible()
    
    // View product statistics
    await expect(page.getByText(/total.*products/i)).toBeVisible()
    await expect(page.getByText(/active.*products/i)).toBeVisible()
    await expect(page.getByText(/low.*stock/i)).toBeVisible()
    
    // Step 2: Add new product
    await page.getByRole('button', { name: /add.*product/i }).click()
    
    // Fill product details
    await page.getByLabel(/product name/i).fill('Paratrooper Elite Hoodie')
    await page.getByLabel(/slug/i).fill('paratrooper-elite-hoodie')
    await page.getByLabel(/category/i).selectOption('hoodies')
    
    const productDescription = `
      Premium quality hoodie honoring the elite Paratrooper Regiment.
      Features embroidered winged parachute badge and regiment motto.
      Made from high-quality cotton blend for comfort and durability.
    `
    await page.getByLabel(/description/i).fill(productDescription.trim())
    
    await page.getByLabel(/price/i).fill('45.99')
    await page.getByLabel(/sku/i).fill('PARA-HOOD-001')
    
    // Upload product image
    const imageInput = page.getByLabel(/main.*image/i)
    await imageInput.setInputFiles('tests/fixtures/paratrooper-hoodie.jpg')
    
    // Add product variants
    await page.getByRole('button', { name: /add.*variant/i }).click()
    
    // Variant 1: Small Black
    await page.getByLabel(/size/i).first().selectOption('S')
    await page.getByLabel(/color/i).first().selectOption('Black')
    await page.getByLabel(/stock.*quantity/i).first().fill('25')
    
    // Add more variants
    const variants = [
      { size: 'M', color: 'Black', stock: '30' },
      { size: 'L', color: 'Black', stock: '35' },
      { size: 'XL', color: 'Black', stock: '20' },
      { size: 'S', color: 'Olive', stock: '20' },
      { size: 'M', color: 'Olive', stock: '25' },
      { size: 'L', color: 'Olive', stock: '30' },
      { size: 'XL', color: 'Olive', stock: '15' }
    ]
    
    for (const variant of variants) {
      await page.getByRole('button', { name: /add.*variant/i }).click()
      const variantIndex = variants.indexOf(variant) + 1
      
      await page.getByLabel(/size/i).nth(variantIndex).selectOption(variant.size)
      await page.getByLabel(/color/i).nth(variantIndex).selectOption(variant.color)
      await page.getByLabel(/stock.*quantity/i).nth(variantIndex).fill(variant.stock)
    }
    
    // Set product as active and featured
    await page.getByLabel(/active/i).check()
    await page.getByLabel(/featured/i).check()
    
    // Save product
    await page.getByRole('button', { name: /save.*product/i }).click()
    await expect(page.getByText(/product.*created.*successfully/i)).toBeVisible()
    
    // Step 3: Verify product appears in list
    await page.goto('/admin/products')
    await expect(page.getByText('Paratrooper Elite Hoodie')).toBeVisible()
    await expect(page.getByText('£45.99')).toBeVisible()
    await expect(page.getByText(/active/i)).toBeVisible()
    
    // Step 4: Update product inventory
    await page.getByText('Paratrooper Elite Hoodie').click()
    await page.getByRole('tab', { name: /inventory/i }).click()
    
    // Update stock for specific variant
    const lowStockVariant = page.locator('[data-testid="variant-row"]').first()
    await lowStockVariant.getByLabel(/stock/i).fill('5')
    await page.getByRole('button', { name: /update.*inventory/i }).click()
    
    // Should show low stock warning
    await expect(page.getByText(/low.*stock.*warning/i)).toBeVisible()
    
    // Step 5: Set up automatic reorder
    await page.getByLabel(/auto.*reorder/i).check()
    await page.getByLabel(/reorder.*threshold/i).fill('10')
    await page.getByLabel(/reorder.*quantity/i).fill('50')
    
    await page.getByRole('button', { name: /save.*settings/i }).click()
    
    // Step 6: Bulk update prices
    await page.goto('/admin/products')
    await page.getByRole('button', { name: /bulk.*actions/i }).click()
    await page.getByText(/price.*update/i).click()
    
    // Select products for bulk update
    await page.getByLabel(/select.*product/i).first().check()
    await page.getByLabel(/select.*product/i).nth(1).check()
    
    // Apply percentage increase
    await page.getByLabel(/price.*adjustment/i).selectOption('percentage')
    await page.getByLabel(/adjustment.*value/i).fill('5')
    
    await page.getByRole('button', { name: /apply.*update/i }).click()
    await expect(page.getByText(/prices.*updated/i)).toBeVisible()
  })

  test('order management and fulfillment workflow', async ({ page }) => {
    // Step 1: View orders dashboard
    await page.goto('/admin/orders')
    await expect(page.getByRole('heading', { name: /order management/i })).toBeVisible()
    
    // View order statistics
    await expect(page.getByText(/pending.*orders/i)).toBeVisible()
    await expect(page.getByText(/revenue.*today/i)).toBeVisible()
    
    // Step 2: Process pending order
    const pendingOrder = page.locator('[data-testid="pending-order"]').first()
    await pendingOrder.click()
    
    // View order details
    await expect(page.getByText(/order.*details/i)).toBeVisible()
    await expect(page.getByText(/customer.*information/i)).toBeVisible()
    await expect(page.getByText(/shipping.*address/i)).toBeVisible()
    
    // Step 3: Verify stock availability
    await page.getByRole('button', { name: /check.*stock/i }).click()
    await expect(page.getByText(/stock.*available/i)).toBeVisible()
    
    // Step 4: Print picking list
    await page.getByRole('button', { name: /print.*picking.*list/i }).click()
    
    // New tab should open with printable picking list
    const [pickingList] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /print.*picking.*list/i }).click()
    ])
    
    await expect(pickingList.getByText(/picking.*list/i)).toBeVisible()
    await pickingList.close()
    
    // Step 5: Update order status to processing
    await page.getByLabel(/order.*status/i).selectOption('processing')
    await page.getByLabel(/tracking.*number/i).fill('MT-2024-001234')
    
    const statusNote = 'Order picked and packed. Ready for shipping.'
    await page.getByLabel(/status.*notes/i).fill(statusNote)
    
    await page.getByRole('button', { name: /update.*order/i }).click()
    await expect(page.getByText(/order.*updated/i)).toBeVisible()
    
    // Step 6: Send shipping notification
    await page.getByRole('button', { name: /send.*shipping.*notification/i }).click()
    await expect(page.getByText(/notification.*sent/i)).toBeVisible()
    
    // Step 7: Process refund request
    await page.goto('/admin/orders')
    const refundOrder = page.locator('[data-testid="refund-request"]').first()
    
    if (await refundOrder.count() > 0) {
      await refundOrder.click()
      
      // Review refund details
      await expect(page.getByText(/refund.*request/i)).toBeVisible()
      await expect(page.getByText(/reason.*for.*return/i)).toBeVisible()
      
      // Approve partial refund
      await page.getByLabel(/refund.*amount/i).fill('24.99')
      await page.getByLabel(/refund.*reason/i).fill('Approved return - item as described')
      
      await page.getByRole('button', { name: /process.*refund/i }).click()
      await expect(page.getByText(/refund.*processed/i)).toBeVisible()
    }
    
    // Step 8: Generate order reports
    await page.goto('/admin/reports')
    await page.getByRole('tab', { name: /orders/i }).click()
    
    // Daily order report
    await page.getByLabel(/report.*type/i).selectOption('daily-orders')
    await page.getByLabel(/date/i).fill('2024-01-15')
    
    await page.getByRole('button', { name: /generate.*report/i }).click()
    await expect(page.getByText(/orders.*processed.*today/i)).toBeVisible()
    
    // Export report
    await page.getByRole('button', { name: /export.*csv/i }).click()
    // File download would be handled by browser
  })

  test('customer management and support workflow', async ({ page }) => {
    // Step 1: View customer dashboard
    await page.goto('/admin/customers')
    await expect(page.getByRole('heading', { name: /customer management/i })).toBeVisible()
    
    // Step 2: Search for specific customer
    await page.getByLabel(/search.*customers/i).fill('john@example.com')
    await page.getByRole('button', { name: /search/i }).click()
    
    // View customer profile
    const customer = page.locator('[data-testid="customer-row"]').first()
    await customer.click()
    
    // Step 3: Review customer details
    await expect(page.getByText(/customer.*profile/i)).toBeVisible()
    await expect(page.getByText(/order.*history/i)).toBeVisible()
    await expect(page.getByText(/lifetime.*value/i)).toBeVisible()
    
    // Step 4: Add customer note
    const customerNote = `
      VIP Customer - Military veteran
      Prefers olive/military colors
      Always orders size L
      Ships to military base
    `
    await page.getByLabel(/customer.*notes/i).fill(customerNote.trim())
    await page.getByRole('button', { name: /save.*notes/i }).click()
    
    // Step 5: Apply customer discount
    await page.getByRole('button', { name: /apply.*discount/i }).click()
    await page.getByLabel(/discount.*type/i).selectOption('percentage')
    await page.getByLabel(/discount.*value/i).fill('10')
    await page.getByLabel(/discount.*reason/i).fill('Military veteran discount')
    
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText(/discount.*applied/i)).toBeVisible()
    
    // Step 6: Handle customer complaint
    await page.goto('/admin/support')
    const complaint = page.locator('[data-testid="support-ticket"]').first()
    await complaint.click()
    
    // Review complaint details
    await expect(page.getByText(/support.*ticket/i)).toBeVisible()
    
    // Respond to customer
    const response = `
      Thank you for contacting us. I understand your concern about the sizing.
      We'll send you a replacement in the correct size at no charge.
      Please expect delivery within 3-5 business days.
      We've also added a note to your account for future reference.
    `
    await page.getByLabel(/response/i).fill(response.trim())
    
    // Mark as resolved
    await page.getByLabel(/status/i).selectOption('resolved')
    await page.getByRole('button', { name: /send.*response/i }).click()
    
    await expect(page.getByText(/response.*sent/i)).toBeVisible()
    
    // Step 7: Create customer segment
    await page.goto('/admin/marketing')
    await page.getByRole('tab', { name: /segments/i }).click()
    
    await page.getByRole('button', { name: /create.*segment/i }).click()
    
    await page.getByLabel(/segment.*name/i).fill('Military Veterans')
    await page.getByLabel(/description/i).fill('Customers who are military veterans')
    
    // Set segment criteria
    await page.getByLabel(/criteria/i).selectOption('customer_notes')
    await page.getByLabel(/condition/i).selectOption('contains')
    await page.getByLabel(/value/i).fill('veteran')
    
    await page.getByRole('button', { name: /create.*segment/i }).click()
    await expect(page.getByText(/segment.*created/i)).toBeVisible()
  })

  test('marketing campaign management workflow', async ({ page }) => {
    // Step 1: Create email campaign
    await page.goto('/admin/marketing')
    await page.getByRole('tab', { name: /campaigns/i }).click()
    
    await page.getByRole('button', { name: /create.*campaign/i }).click()
    
    // Campaign details
    await page.getByLabel(/campaign.*name/i).fill('Spring Collection Launch')
    await page.getByLabel(/subject.*line/i).fill('🌟 New Spring Military Collection - 15% Off!')
    
    // Select template
    await page.getByLabel(/template/i).selectOption('product-announcement')
    
    // Campaign content
    const campaignContent = `
      Attention Military Personnel and Enthusiasts!
      
      Our new Spring Collection has arrived featuring:
      • Lightweight tactical polo shirts
      • Breathable military-inspired t-shirts  
      • Updated designs with authentic regimental badges
      
      Use code SPRING15 for 15% off your entire order!
      Valid until March 31st.
    `
    await page.getByLabel(/campaign.*content/i).fill(campaignContent.trim())
    
    // Step 2: Select target audience
    await page.getByLabel(/target.*audience/i).selectOption('all-customers')
    await page.getByLabel(/exclude.*recent.*buyers/i).check()
    
    // Step 3: Schedule campaign
    await page.getByLabel(/send.*immediately/i).uncheck()
    await page.getByLabel(/schedule.*date/i).fill('2024-03-01')
    await page.getByLabel(/schedule.*time/i).fill('09:00')
    
    await page.getByRole('button', { name: /schedule.*campaign/i }).click()
    await expect(page.getByText(/campaign.*scheduled/i)).toBeVisible()
    
    // Step 4: Set up abandoned cart recovery
    await page.getByRole('tab', { name: /abandoned.*cart/i }).click()
    
    await page.getByRole('button', { name: /create.*sequence/i }).click()
    
    // Email 1: After 1 hour
    await page.getByLabel(/email.*1.*delay/i).fill('1')
    await page.getByLabel(/email.*1.*unit/i).selectOption('hours')
    await page.getByLabel(/email.*1.*subject/i).fill('Forgot something? Your cart is waiting')
    
    // Email 2: After 24 hours
    await page.getByRole('button', { name: /add.*email/i }).click()
    await page.getByLabel(/email.*2.*delay/i).fill('24')
    await page.getByLabel(/email.*2.*unit/i).selectOption('hours')
    await page.getByLabel(/email.*2.*subject/i).fill('Last chance - 10% off your abandoned items')
    
    await page.getByRole('button', { name: /save.*sequence/i }).click()
    
    // Step 5: Create A/B test
    await page.getByRole('tab', { name: /ab.*testing/i }).click()
    
    await page.getByRole('button', { name: /create.*test/i }).click()
    
    await page.getByLabel(/test.*name/i).fill('Subject Line Test - March Promo')
    
    // Version A
    await page.getByLabel(/version.*a.*subject/i).fill('March Military Sale - 20% Off Everything!')
    
    // Version B  
    await page.getByLabel(/version.*b.*subject/i).fill('🎖️ Honor Spring - Exclusive Military Discount')
    
    // Test settings
    await page.getByLabel(/test.*percentage/i).fill('50')
    await page.getByLabel(/winning.*metric/i).selectOption('open_rate')
    
    await page.getByRole('button', { name: /start.*test/i }).click()
    await expect(page.getByText(/ab.*test.*started/i)).toBeVisible()
    
    // Step 6: Monitor campaign performance
    await page.getByRole('tab', { name: /analytics/i }).click()
    
    // View campaign metrics
    await expect(page.getByText(/open.*rate/i)).toBeVisible()
    await expect(page.getByText(/click.*rate/i)).toBeVisible()
    await expect(page.getByText(/conversion.*rate/i)).toBeVisible()
    
    // Export analytics
    await page.getByRole('button', { name: /export.*analytics/i }).click()
  })

  test('inventory management and alerts workflow', async ({ page }) => {
    // Step 1: View inventory dashboard
    await page.goto('/admin/inventory')
    await expect(page.getByRole('heading', { name: /inventory management/i })).toBeVisible()
    
    // View critical alerts
    await expect(page.getByText(/low.*stock.*alerts/i)).toBeVisible()
    await expect(page.getByText(/out.*of.*stock/i)).toBeVisible()
    
    // Step 2: Process low stock alert
    const lowStockItem = page.locator('[data-testid="low-stock-item"]').first()
    await lowStockItem.click()
    
    // Update stock level
    await page.getByLabel(/current.*stock/i).fill('50')
    await page.getByLabel(/reorder.*note/i).fill('Restocked from supplier - batch #2024-001')
    
    await page.getByRole('button', { name: /update.*stock/i }).click()
    await expect(page.getByText(/stock.*updated/i)).toBeVisible()
    
    // Step 3: Set up automatic reordering
    await page.getByRole('tab', { name: /automation/i }).click()
    
    await page.getByRole('button', { name: /create.*rule/i }).click()
    
    await page.getByLabel(/rule.*name/i).fill('Auto-reorder Popular T-Shirts')
    await page.getByLabel(/product.*category/i).selectOption('t-shirts')
    await page.getByLabel(/threshold/i).fill('15')
    await page.getByLabel(/reorder.*quantity/i).fill('100')
    
    // Supplier settings
    await page.getByLabel(/supplier/i).selectOption('primary-supplier')
    await page.getByLabel(/lead.*time/i).fill('7')
    
    await page.getByRole('button', { name: /create.*rule/i }).click()
    
    // Step 4: Generate inventory report
    await page.getByRole('tab', { name: /reports/i }).click()
    
    await page.getByLabel(/report.*type/i).selectOption('stock-movement')
    await page.getByLabel(/date.*range/i).selectOption('last-30-days')
    
    await page.getByRole('button', { name: /generate/i }).click()
    
    // View report data
    await expect(page.getByText(/stock.*movements/i)).toBeVisible()
    await expect(page.getByText(/top.*selling/i)).toBeVisible()
    await expect(page.getByText(/slow.*moving/i)).toBeVisible()
    
    // Step 5: Bulk inventory update
    await page.getByRole('tab', { name: /bulk.*update/i }).click()
    
    // Upload CSV file
    const csvInput = page.getByLabel(/upload.*csv/i)
    await csvInput.setInputFiles('tests/fixtures/inventory-update.csv')
    
    // Preview changes
    await page.getByRole('button', { name: /preview.*changes/i }).click()
    await expect(page.getByText(/preview.*inventory.*changes/i)).toBeVisible()
    
    // Apply updates
    await page.getByRole('button', { name: /apply.*updates/i }).click()
    await expect(page.getByText(/inventory.*updated/i)).toBeVisible()
  })

  test('security and user management workflow', async ({ page }) => {
    // Step 1: View security dashboard
    await page.goto('/admin/security')
    await expect(page.getByRole('heading', { name: /security.*settings/i })).toBeVisible()
    
    // Step 2: Review login attempts
    await page.getByRole('tab', { name: /login.*attempts/i }).click()
    
    // Check for suspicious activity
    const suspiciousAttempts = page.locator('[data-testid="failed-login"]')
    if (await suspiciousAttempts.count() > 0) {
      await suspiciousAttempts.first().click()
      
      // Block suspicious IP
      await page.getByRole('button', { name: /block.*ip/i }).click()
      await expect(page.getByText(/ip.*blocked/i)).toBeVisible()
    }
    
    // Step 3: Manage admin users
    await page.getByRole('tab', { name: /admin.*users/i }).click()
    
    // Add new admin user
    await page.getByRole('button', { name: /add.*admin/i }).click()
    
    await page.getByLabel(/email/i).fill('newadmin@militarytees.co.uk')
    await page.getByLabel(/role/i).selectOption('admin')
    await page.getByLabel(/permissions/i).selectOption('orders-only')
    
    await page.getByRole('button', { name: /create.*admin/i }).click()
    await expect(page.getByText(/admin.*created/i)).toBeVisible()
    
    // Step 4: Configure 2FA requirement
    await page.getByRole('tab', { name: /security.*policies/i }).click()
    
    await page.getByLabel(/require.*2fa/i).check()
    await page.getByLabel(/session.*timeout/i).fill('30')
    await page.getByLabel(/password.*policy/i).selectOption('strong')
    
    await page.getByRole('button', { name: /save.*policies/i }).click()
    
    // Step 5: Review audit log
    await page.getByRole('tab', { name: /audit.*log/i }).click()
    
    // Filter by recent admin actions
    await page.getByLabel(/filter.*by/i).selectOption('admin-actions')
    await page.getByLabel(/date.*range/i).selectOption('last-7-days')
    
    await page.getByRole('button', { name: /apply.*filter/i }).click()
    
    // Verify admin actions are logged
    await expect(page.getByText(/product.*created/i)).toBeVisible()
    await expect(page.getByText(/order.*updated/i)).toBeVisible()
    
    // Step 6: Backup data
    await page.getByRole('tab', { name: /backup/i }).click()
    
    await page.getByRole('button', { name: /create.*backup/i }).click()
    await expect(page.getByText(/backup.*started/i)).toBeVisible()
    
    // Schedule automatic backups
    await page.getByLabel(/auto.*backup/i).check()
    await page.getByLabel(/backup.*frequency/i).selectOption('daily')
    await page.getByLabel(/backup.*time/i).fill('02:00')
    
    await page.getByRole('button', { name: /save.*schedule/i }).click()
  })
})