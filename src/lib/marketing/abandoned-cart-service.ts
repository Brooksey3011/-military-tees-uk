import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email/email-service'
import type { CartItem } from '@/store/cart-minimal'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AbandonedCart {
  id: string
  session_id: string
  customer_email?: string
  customer_id?: string
  cart_data: {
    items: CartItem[]
    total_items: number
    total_price: number
  }
  total_value: number
  cart_created_at: string
  last_updated_at: string
  recovered_at?: string
  recovery_email_sent_at?: string
  recovery_email_count: number
  status: 'abandoned' | 'recovered' | 'expired'
}

export interface AbandonedCartEmailData {
  customerName: string
  customerEmail: string
  cartItems: Array<{
    name: string
    variant: string
    quantity: number
    price: number
    total: number
    image?: string
  }>
  cartTotal: number
  recoveryUrl: string
  abandonedDate: string
  hoursAbandoned: number
}

class AbandonedCartService {
  
  /**
   * Track a cart as potentially abandoned
   */
  async trackCart(
    sessionId: string,
    cartItems: CartItem[],
    customerEmail?: string,
    customerId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      const cartData = {
        items: cartItems,
        total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total_price: totalValue
      }

      // Check if cart already exists for this session
      const { data: existingCart } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'abandoned')
        .single()

      if (existingCart) {
        // Update existing cart
        const { error } = await supabase
          .from('abandoned_carts')
          .update({
            cart_data: cartData,
            total_value: totalValue,
            customer_email: customerEmail || existingCart.customer_email,
            customer_id: customerId || existingCart.customer_id,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', existingCart.id)

        if (error) throw error
      } else {
        // Create new abandoned cart record
        const { error } = await supabase
          .from('abandoned_carts')
          .insert({
            session_id: sessionId,
            customer_email: customerEmail,
            customer_id: customerId,
            cart_data: cartData,
            total_value: totalValue,
            status: 'abandoned'
          })

        if (error) throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error tracking abandoned cart:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mark a cart as recovered when customer completes purchase
   */
  async markCartRecovered(
    sessionId: string,
    orderId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('status', 'abandoned')

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error marking cart as recovered:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get abandoned carts ready for recovery emails
   */
  async getCartsForRecovery(
    hoursAbandoned: number = 1,
    maxEmailsSent: number = 2
  ): Promise<AbandonedCart[]> {
    try {
      const cutoffTime = new Date()
      cutoffTime.setHours(cutoffTime.getHours() - hoursAbandoned)

      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('status', 'abandoned')
        .not('customer_email', 'is', null)
        .gt('total_value', 0)
        .lt('recovery_email_count', maxEmailsSent)
        .lte('cart_created_at', cutoffTime.toISOString())
        .order('cart_created_at', { ascending: true })

      if (error) throw error

      // Filter out carts that had recovery email sent within last 24 hours
      const now = new Date()
      const filteredData = data?.filter(cart => {
        if (!cart.recovery_email_sent_at) return true
        
        const lastEmailSent = new Date(cart.recovery_email_sent_at)
        const hoursSinceLastEmail = (now.getTime() - lastEmailSent.getTime()) / (1000 * 60 * 60)
        
        return hoursSinceLastEmail >= 24
      }) || []

      return filteredData as AbandonedCart[]
    } catch (error) {
      console.error('Error getting carts for recovery:', error)
      return []
    }
  }

  /**
   * Send abandoned cart recovery email
   */
  async sendRecoveryEmail(cart: AbandonedCart): Promise<{ success: boolean; error?: string }> {
    if (!cart.customer_email) {
      return { success: false, error: 'No customer email available' }
    }

    try {
      // Prepare email data
      const cartItems = cart.cart_data.items.map(item => ({
        name: item.name,
        variant: item.size && item.color ? `${item.size}, ${item.color}` : item.size || item.color || 'Standard',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        image: item.image
      }))

      const hoursAbandoned = Math.floor(
        (new Date().getTime() - new Date(cart.cart_created_at).getTime()) / (1000 * 60 * 60)
      )

      // Generate recovery URL with session restoration
      const recoveryUrl = `https://militarytees.co.uk/cart/recover?session=${cart.session_id}&email=${encodeURIComponent(cart.customer_email)}`

      const emailData: AbandonedCartEmailData = {
        customerName: cart.customer_email.split('@')[0], // Use email username as name fallback
        customerEmail: cart.customer_email,
        cartItems,
        cartTotal: cart.total_value,
        recoveryUrl,
        abandonedDate: new Date(cart.cart_created_at).toLocaleDateString(),
        hoursAbandoned
      }

      // Send the recovery email
      const emailResult = await this.sendAbandonedCartEmail(emailData, cart.recovery_email_count)

      if (emailResult.success) {
        // Update cart record with email sent info
        const { error } = await supabase
          .from('abandoned_carts')
          .update({
            recovery_email_sent_at: new Date().toISOString(),
            recovery_email_count: cart.recovery_email_count + 1
          })
          .eq('id', cart.id)

        if (error) throw error
      }

      return emailResult
    } catch (error) {
      console.error('Error sending recovery email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send abandoned cart recovery email with dynamic content based on attempt number
   */
  private async sendAbandonedCartEmail(
    data: AbandonedCartEmailData, 
    attemptNumber: number = 0
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    
    const isFirstEmail = attemptNumber === 0
    const subject = isFirstEmail 
      ? "Don't forget your Military Tees! 🛡️" 
      : "Still thinking about your Military Tees order? 🎖️"

    const urgencyMessage = isFirstEmail 
      ? "Your items are waiting for you!"
      : "These items might sell out soon. Complete your order today!"

    const discountOffer = !isFirstEmail 
      ? `<div style="background-color: #d4af37; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
           <strong>🎖️ EXCLUSIVE OFFER: Save 10% with code RETURN10</strong><br>
           <span style="font-size: 14px;">Valid for 48 hours only</span>
         </div>`
      : ""

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Military Tees Order</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #4a5d23; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .cart-summary { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #4a5d23; }
          .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; }
          .item:last-child { border-bottom: none; }
          .item-image { width: 80px; height: 80px; margin-right: 15px; }
          .item-details { flex: 1; }
          .item-price { text-align: right; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; color: #4a5d23; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .btn { background-color: #4a5d23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0; font-size: 16px; font-weight: bold; }
          .btn:hover { background-color: #5a6d33; }
          .urgency { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px; }
          h1, h2 { color: #4a5d23; }
          .abandoned-info { font-size: 14px; color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Military Tees UK</h1>
            <p>${urgencyMessage}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            
            <div class="abandoned-info">
              You left these items in your cart ${data.hoursAbandoned} hours ago. Complete your order now with military precision!
            </div>

            ${discountOffer}
            
            <div class="urgency">
              <strong>⏰ ${isFirstEmail ? 'Your cart is reserved' : 'Limited stock remaining'}</strong><br>
              ${isFirstEmail 
                ? 'We\'ve saved your items, but they won\'t stay reserved forever.'
                : 'Other customers are viewing these items. Act fast to secure yours!'
              }
            </div>

            <div class="cart-summary">
              <h3>Your Military Tees Order</h3>
              ${data.cartItems.map(item => `
                <div class="item">
                  ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                  <div class="item-details">
                    <strong>${item.name}</strong><br>
                    <span style="color: #666;">${item.variant}</span><br>
                    <span>Quantity: ${item.quantity}</span>
                  </div>
                  <div class="item-price">
                    £${item.total.toFixed(2)}
                  </div>
                </div>
              `).join('')}
              
              <hr style="margin: 20px 0;">
              <div style="display: flex; justify-content: space-between;" class="total-row">
                <span>Total:</span>
                <span>£${data.cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.recoveryUrl}" class="btn">Complete Your Order Now</a>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
              <h4 style="color: #4a5d23; margin-top: 0;">Why choose Military Tees UK?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Authentic Military Heritage:</strong> Designs created with respect for military tradition</li>
                <li><strong>Premium Quality:</strong> Built to last with military-grade durability</li>
                <li><strong>Fast, Secure Delivery:</strong> Quick dispatch with tracking</li>
                <li><strong>Customer Support:</strong> Our team understands military culture</li>
              </ul>
            </div>

            ${!isFirstEmail ? `
              <div style="background-color: #fff; border: 2px solid #4a5d23; padding: 20px; margin: 20px 0; text-align: center;">
                <h4 style="color: #4a5d23; margin-top: 0;">Need Help?</h4>
                <p>Our team is standing by to assist with your order:</p>
                <p>📧 <a href="mailto:info@militarytees.co.uk">info@militarytees.co.uk</a><br>
                📞 +44 1234 567890</p>
              </div>
            ` : ''}

            <p style="font-size: 14px; color: #666;">
              <em>This email was sent because you have items in your cart. If you've already completed your purchase, please disregard this message.</em>
            </p>
          </div>

          <div class="footer">
            <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
            <p>Honoring Military Heritage with Pride</p>
            <p><a href="https://militarytees.co.uk/unsubscribe?email=${encodeURIComponent(data.customerEmail)}">Unsubscribe from cart reminders</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      return await emailService.sendEmail(data.customerEmail, subject, html)
    } catch (error) {
      console.error('Error sending abandoned cart email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Process all abandoned carts for recovery
   */
  async processAbandonedCarts(): Promise<{
    processed: number
    successful: number
    failed: number
    errors: string[]
  }> {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get carts abandoned 1 hour ago (first email)
      const firstEmailCarts = await this.getCartsForRecovery(1, 1)
      
      // Get carts abandoned 24 hours ago (second email)
      const secondEmailCarts = await this.getCartsForRecovery(24, 2)

      const allCarts = [...firstEmailCarts, ...secondEmailCarts]
      results.processed = allCarts.length

      console.log(`Processing ${allCarts.length} abandoned carts`)

      for (const cart of allCarts) {
        const result = await this.sendRecoveryEmail(cart)
        
        if (result.success) {
          results.successful++
          console.log(`Recovery email sent for cart ${cart.id}`)
        } else {
          results.failed++
          results.errors.push(`Cart ${cart.id}: ${result.error}`)
          console.error(`Failed to send recovery email for cart ${cart.id}:`, result.error)
        }
      }

      console.log(`Abandoned cart recovery completed: ${results.successful} successful, ${results.failed} failed`)
      
    } catch (error) {
      console.error('Error processing abandoned carts:', error)
      results.errors.push(`Processing error: ${error.message}`)
    }

    return results
  }

  /**
   * Clean up old abandoned carts (expired after 30 days)
   */
  async cleanupExpiredCarts(): Promise<{ cleaned: number; error?: string }> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('abandoned_carts')
        .update({ status: 'expired' })
        .eq('status', 'abandoned')
        .lte('cart_created_at', thirtyDaysAgo.toISOString())
        .select('id')

      if (error) throw error

      const cleanedCount = data?.length || 0
      console.log(`Cleaned up ${cleanedCount} expired abandoned carts`)

      return { cleaned: cleanedCount }
    } catch (error) {
      console.error('Error cleaning up expired carts:', error)
      return { cleaned: 0, error: error.message }
    }
  }

  /**
   * Get abandoned cart statistics
   */
  async getAbandonedCartStats(): Promise<{
    total_abandoned: number
    total_recovered: number
    recovery_rate: number
    total_value_abandoned: number
    total_value_recovered: number
    average_cart_value: number
  }> {
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('status, total_value')

      if (error) throw error

      const stats = data?.reduce((acc, cart) => {
        if (cart.status === 'abandoned') {
          acc.total_abandoned++
          acc.total_value_abandoned += parseFloat(cart.total_value)
        } else if (cart.status === 'recovered') {
          acc.total_recovered++
          acc.total_value_recovered += parseFloat(cart.total_value)
        }
        return acc
      }, {
        total_abandoned: 0,
        total_recovered: 0,
        total_value_abandoned: 0,
        total_value_recovered: 0
      }) || {
        total_abandoned: 0,
        total_recovered: 0,
        total_value_abandoned: 0,
        total_value_recovered: 0
      }

      const totalCarts = stats.total_abandoned + stats.total_recovered
      const recovery_rate = totalCarts > 0 ? (stats.total_recovered / totalCarts) * 100 : 0
      const total_value = stats.total_value_abandoned + stats.total_value_recovered
      const average_cart_value = totalCarts > 0 ? total_value / totalCarts : 0

      return {
        ...stats,
        recovery_rate: Math.round(recovery_rate * 100) / 100,
        average_cart_value: Math.round(average_cart_value * 100) / 100
      }
    } catch (error) {
      console.error('Error getting abandoned cart stats:', error)
      return {
        total_abandoned: 0,
        total_recovered: 0,
        recovery_rate: 0,
        total_value_abandoned: 0,
        total_value_recovered: 0,
        average_cart_value: 0
      }
    }
  }
}

// Export singleton instance
export const abandonedCartService = new AbandonedCartService()

// Convenience functions
export const trackAbandonedCart = (
  sessionId: string,
  cartItems: CartItem[],
  customerEmail?: string,
  customerId?: string
) => abandonedCartService.trackCart(sessionId, cartItems, customerEmail, customerId)

export const markCartRecovered = (sessionId: string, orderId?: string) =>
  abandonedCartService.markCartRecovered(sessionId, orderId)

export const processAbandonedCarts = () => abandonedCartService.processAbandonedCarts()

export const getAbandonedCartStats = () => abandonedCartService.getAbandonedCartStats()