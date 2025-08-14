import { Resend } from 'resend'
import { generateOrderConfirmationHTML } from './email-templates/order-confirmation-professional'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  variant_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  total_price: number
  sku: string
  size?: string
  color?: string
  product_name?: string
}

interface OrderConfirmationData {
  orderNumber: string
  customerEmail: string
  orderItems: OrderItem[]
  totalAmount: number
  sessionId: string
  shippingAddress?: any
  billingAddress?: any
}

export class EmailService {
  
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    try {
      console.log('📧 Preparing order confirmation email for:', data.customerEmail)

      const emailHtml = this.generateOrderConfirmationHTML(data)
      const emailText = this.generateOrderConfirmationText(data)

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Military Tees UK <orders@militarytees.co.uk>',
        to: [data.customerEmail],
        subject: `Order Confirmation - ${data.orderNumber} - Military Tees UK`,
        html: emailHtml,
        text: emailText
      })

      console.log('✅ Order confirmation email sent:', result.data?.id)
      
      // Send admin notification
      await this.sendAdminOrderNotification(data)
      
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      throw error
    }
  }

  async sendProfessionalOrderConfirmation(data: OrderConfirmationData & {
    customerName: string
    shippingMethod: string
    estimatedDelivery: string
    shippingAddress: any
  }): Promise<void> {
    try {
      console.log('📧 Preparing professional order confirmation email for:', data.customerEmail)

      // Transform data to match professional template format
      const orderData = {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        items: data.orderItems.map(item => ({
          name: item.product_name || 'Military Tees Product',
          price: item.price_at_purchase,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: undefined // Would need to be fetched from product data
        })),
        subtotal: data.orderItems.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0),
        shipping: data.totalAmount > 50 ? 0 : 4.99,
        tax: data.totalAmount * 0.2 / 1.2, // Extract VAT from total
        total: data.totalAmount,
        shippingAddress: data.shippingAddress || {
          firstName: 'Customer',
          lastName: '',
          address1: 'Address not provided',
          city: '',
          postcode: '',
          country: 'United Kingdom'
        },
        shippingMethod: data.shippingMethod || 'Standard Delivery',
        estimatedDelivery: data.estimatedDelivery || '3-5 business days'
      }

      const emailHtml = generateOrderConfirmationHTML(orderData)
      const emailText = this.generateOrderConfirmationText(data)

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Military Tees UK <orders@militarytees.co.uk>',
        to: [data.customerEmail],
        subject: `Order Confirmation - ${data.orderNumber} - Military Tees UK`,
        html: emailHtml,
        text: emailText
      })

      console.log('✅ Professional order confirmation email sent:', result.data?.id)
      
      // Send admin notification
      await this.sendAdminOrderNotification(data)
      
    } catch (error) {
      console.error('❌ Failed to send professional order confirmation email:', error)
      throw error
    }
  }

  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const itemsHTML = data.orderItems.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 8px;">
          <div style="font-weight: 600; color: #111827;">${item.product_name || 'Military Tees Product'}</div>
          <div style="font-size: 14px; color: #6b7280;">
            ${item.size ? `Size: ${item.size}` : ''} ${item.size && item.color ? ' | ' : ''} ${item.color ? `Color: ${item.color}` : ''}
          </div>
          <div style="font-size: 12px; color: #9ca3af;">SKU: ${item.sku}</div>
        </td>
        <td style="padding: 16px 8px; text-align: center; color: #6b7280;">${item.quantity}</td>
        <td style="padding: 16px 8px; text-align: right; font-weight: 600; color: #111827;">£${item.price_at_purchase.toFixed(2)}</td>
        <td style="padding: 16px 8px; text-align: right; font-weight: 600; color: #111827;">£${item.total_price.toFixed(2)}</td>
      </tr>
    `).join('')

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Military Tees UK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">MILITARY TEES UK</h1>
          <div style="margin-top: 8px; padding: 8px 16px; background-color: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
            <span style="color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Confirmed</span>
          </div>
        </div>

        <!-- Success Message -->
        <div style="padding: 32px 24px; text-align: center; border-bottom: 2px solid #f3f4f6;">
          <div style="width: 64px; height: 64px; background-color: #dcfce7; border: 3px solid #16a34a; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <div style="color: #16a34a; font-size: 32px; font-weight: bold;">✓</div>
          </div>
          <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: bold;">Thank You for Your Order!</h2>
          <p style="margin: 0; color: #6b7280; font-size: 16px;">Your mission gear is being prepared for deployment.</p>
          <div style="margin-top: 16px; padding: 12px 20px; background-color: #f3f4f6; border-radius: 6px; display: inline-block;">
            <span style="color: #374151; font-weight: 600;">Order #${data.orderNumber}</span>
          </div>
        </div>

        <!-- Order Details -->
        <div style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: bold; border-bottom: 2px solid #16a34a; padding-bottom: 8px;">Order Items</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Order Total -->
          <div style="margin-top: 24px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Subtotal:</span>
              <span style="color: #111827; font-weight: 600;">£${(data.totalAmount / 1.2).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">VAT (20%):</span>
              <span style="color: #111827; font-weight: 600;">£${(data.totalAmount - (data.totalAmount / 1.2)).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Shipping:</span>
              <span style="color: #16a34a; font-weight: 600;">FREE</span>
            </div>
            <div style="border-top: 2px solid #d1d5db; padding-top: 8px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #111827; font-weight: bold; font-size: 18px;">Total:</span>
                <span style="color: #111827; font-weight: bold; font-size: 18px;">£${data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- What's Next -->
        <div style="padding: 24px; background-color: #f8fafc; border-top: 2px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: bold;">What Happens Next</h3>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="text-align: center; padding: 16px;">
              <div style="width: 48px; height: 48px; background-color: #dbeafe; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #2563eb; font-size: 24px;">📧</span>
              </div>
              <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 4px;">Confirmation</div>
              <div style="color: #6b7280; font-size: 12px;">Email sent to you</div>
            </div>
            
            <div style="text-align: center; padding: 16px;">
              <div style="width: 48px; height: 48px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #d97706; font-size: 24px;">📦</span>
              </div>
              <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 4px;">Processing</div>
              <div style="color: #6b7280; font-size: 12px;">Within 24 hours</div>
            </div>
            
            <div style="text-align: center; padding: 16px;">
              <div style="width: 48px; height: 48px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #16a34a; font-size: 24px;">🚚</span>
              </div>
              <div style="font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 4px;">Delivery</div>
              <div style="color: #6b7280; font-size: 12px;">3-7 business days</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 24px; text-align: center; background-color: #111827; color: #ffffff;">
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px;">Need Help?</h4>
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">Our support team is standing by to assist you.</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <a href="mailto:support@militarytees.co.uk" style="color: #16a34a; text-decoration: none; font-weight: 600;">support@militarytees.co.uk</a>
          </div>
          
          <div style="font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Military Tees UK - Proudly serving those who serve</p>
            <p style="margin: 8px 0 0 0;">© 2025 Military Tees UK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `
  }

  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const itemsList = data.orderItems.map(item => 
      `- ${item.product_name || 'Military Tees Product'} (${item.size || ''} ${item.color || ''}) - Qty: ${item.quantity} - £${item.total_price.toFixed(2)}`
    ).join('\n')

    return `
MILITARY TEES UK - ORDER CONFIRMATION

Thank you for your order!

Order #${data.orderNumber}
Your mission gear is being prepared for deployment.

ORDER ITEMS:
${itemsList}

ORDER TOTAL: £${data.totalAmount.toFixed(2)}

WHAT HAPPENS NEXT:
1. Confirmation - Email sent to you
2. Processing - Your order will be packed within 24 hours  
3. Delivery - Expected delivery in 3-7 business days

Need help? Contact us at support@militarytees.co.uk

Military Tees UK - Proudly serving those who serve
© 2025 Military Tees UK. All rights reserved.
    `.trim()
  }

  private async sendAdminOrderNotification(data: OrderConfirmationData): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@militarytees.co.uk'
      
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Military Tees UK <orders@militarytees.co.uk>',
        to: [adminEmail],
        subject: `🎉 New Order - ${data.orderNumber} - £${data.totalAmount.toFixed(2)}`,
        html: `
          <h2>New Order Received!</h2>
          <p><strong>Order:</strong> ${data.orderNumber}</p>
          <p><strong>Customer:</strong> ${data.customerEmail}</p>
          <p><strong>Total:</strong> £${data.totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong> ${data.orderItems.length}</p>
          <p><strong>Stripe Session:</strong> ${data.sessionId}</p>
          
          <h3>Order Items:</h3>
          <ul>
            ${data.orderItems.map(item => `
              <li>${item.product_name} (${item.size} ${item.color}) - Qty: ${item.quantity} - £${item.total_price.toFixed(2)}</li>
            `).join('')}
          </ul>
        `
      })

      console.log('✅ Admin order notification sent')
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error)
    }
  }
}

export const emailService = new EmailService()