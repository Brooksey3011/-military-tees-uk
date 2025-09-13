// Enhanced Email Automation System for Military Tees UK
// Handles all order lifecycle notifications with military-themed templates

import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { createSupabaseAdmin } from './supabase'

export type EmailType = 
  | 'order_confirmation'
  | 'payment_received' 
  | 'order_processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refund_processed'
  | 'low_stock_alert'

export interface EmailTemplateData {
  // Order details
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  estimatedDelivery?: string
  
  // Order items
  items: Array<{
    name: string
    size?: string
    color?: string
    quantity: number
    price: number
    image?: string
  }>
  
  // Financial details
  subtotal: number
  shipping: number
  tax: number
  total: number
  
  // Shipping details
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    postcode: string
    country: string
  }
  
  // Status-specific data
  trackingNumber?: string
  carrier?: string
  estimatedDeliveryDate?: string
  cancellationReason?: string
  refundAmount?: number
  
  // BFPO specific
  isBFPO?: boolean
  militaryUnit?: string
}

export class EmailAutomation {
  private static resend: Resend | null = null
  private static transporter: any = null
  private static emailService: 'hostinger' | 'resend' | null = null

  /**
   * Initialize email service
   */
  static async initialize() {
    // Check for Hostinger SMTP first (preferred for custom domain)
    if (process.env.HOSTINGER_EMAIL_HOST && process.env.HOSTINGER_EMAIL_USER && process.env.HOSTINGER_EMAIL_PASS) {
      this.emailService = 'hostinger'
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.HOSTINGER_EMAIL_HOST,
          port: parseInt(process.env.HOSTINGER_EMAIL_PORT || '465'),
          secure: process.env.HOSTINGER_EMAIL_SECURE === 'true',
          auth: {
            user: process.env.HOSTINGER_EMAIL_USER,
            pass: process.env.HOSTINGER_EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        })
        console.log('✅ Hostinger SMTP initialized')
      } catch (error) {
        console.error('❌ Hostinger SMTP initialization failed:', error)
        this.emailService = null
      }
    } else if (process.env.RESEND_API_KEY) {
      // Fallback to Resend
      this.emailService = 'resend'
      this.resend = new Resend(process.env.RESEND_API_KEY)
      console.log('✅ Resend initialized')
    } else {
      console.warn('⚠️ No email service configured')
    }
  }

  /**
   * Send email with template
   */
  static async sendEmail(
    emailType: EmailType,
    templateData: EmailTemplateData,
    adminCopy = false
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    
    if (!this.emailService) {
      await this.initialize()
    }

    if (!this.emailService) {
      return { success: false, error: 'No email service configured' }
    }

    try {
      const template = this.getEmailTemplate(emailType, templateData)
      const recipients = adminCopy 
        ? [templateData.customerEmail, process.env.ADMIN_EMAIL || 'orders@militarytees.co.uk']
        : [templateData.customerEmail]

      let result
      
      if (this.emailService === 'hostinger' && this.transporter) {
        result = await this.sendViaHostinger(template, recipients)
      } else if (this.emailService === 'resend' && this.resend) {
        result = await this.sendViaResend(template, recipients)
      } else {
        return { success: false, error: 'Email service not properly initialized' }
      }

      // Log email notification to database
      await this.logEmailNotification(emailType, templateData, result)

      return result

    } catch (error) {
      console.error(`Email sending failed for ${emailType}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send via Hostinger SMTP
   */
  private static async sendViaHostinger(
    template: { subject: string; html: string },
    recipients: string[]
  ) {
    const freshTransporter = nodemailer.createTransport({
      host: process.env.HOSTINGER_EMAIL_HOST,
      port: parseInt(process.env.HOSTINGER_EMAIL_PORT || '465'),
      secure: process.env.HOSTINGER_EMAIL_SECURE === 'true',
      auth: {
        user: process.env.HOSTINGER_EMAIL_USER,
        pass: process.env.HOSTINGER_EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    const info = await freshTransporter.sendMail({
      from: `"Military Tees UK" <${process.env.HOSTINGER_EMAIL_USER}>`,
      to: recipients.join(', '),
      subject: template.subject,
      html: template.html,
    })

    return { success: true, messageId: info.messageId }
  }

  /**
   * Send via Resend
   */
  private static async sendViaResend(
    template: { subject: string; html: string },
    recipients: string[]
  ) {
    if (!this.resend) throw new Error('Resend not initialized')

    const { data, error } = await this.resend.emails.send({
      from: 'Military Tees UK <orders@militarytees.co.uk>',
      to: recipients,
      subject: template.subject,
      html: template.html,
    })

    if (error) throw new Error(error.message)

    return { success: true, messageId: data?.id }
  }

  /**
   * Get email template for specific type
   */
  private static getEmailTemplate(emailType: EmailType, data: EmailTemplateData): { subject: string; html: string } {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #4a5d23; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4a5d23; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
        .totals { margin-top: 20px; border-top: 2px solid #4a5d23; padding-top: 15px; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .final-total { font-weight: bold; font-size: 18px; color: #4a5d23; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; margin-top: 30px; }
        .status-badge { background: #4a5d23; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .bfpo-notice { background: #e8f5e8; border: 1px solid #4a5d23; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .tracking-box { background: #f0f8ff; border: 1px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    `

    switch (emailType) {
      case 'order_confirmation':
        return {
          subject: `Order Confirmation - ${data.orderNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Order Confirmation</title>${baseStyles}</head>
            <body>
              <div class="header">
                <h1>🛡️ Order Confirmed</h1>
                <p>Thank you for your order, ${data.customerName}!</p>
              </div>
              <div class="content">
                <p>Dear ${data.customerName},</p>
                <p>We've received your order and are preparing your military gear for dispatch.</p>
                
                ${data.isBFPO ? `
                <div class="bfpo-notice">
                  <h3>🏛️ BFPO Delivery Notice</h3>
                  <p><strong>Your order is being sent to a BFPO address.</strong></p>
                  <p>• Please ensure your military mail forwarding is active</p>
                  <p>• Allow additional time for overseas delivery</p>
                  <p>• Delivery times may vary depending on operational requirements</p>
                  ${data.militaryUnit ? `<p>• Unit: ${data.militaryUnit}</p>` : ''}
                </div>
                ` : ''}
                
                <div class="order-details">
                  <h3>Order Details</h3>
                  <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                  <p><strong>Order Date:</strong> ${data.orderDate}</p>
                  <p><strong>Status:</strong> <span class="status-badge">Processing</span></p>
                  ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
                </div>

                <h3>Items Ordered:</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <div>
                      <strong>${item.name}</strong><br>
                      ${item.size ? `Size: ${item.size}` : ''} ${item.size && item.color ? ' | ' : ''} ${item.color ? `Color: ${item.color}` : ''}<br>
                      Quantity: ${item.quantity}
                    </div>
                    <div><strong>£${(item.price * item.quantity).toFixed(2)}</strong></div>
                  </div>
                `).join('')}

                <div class="totals">
                  <div class="total-row"><span>Subtotal:</span><span>£${data.subtotal.toFixed(2)}</span></div>
                  <div class="total-row"><span>Shipping:</span><span>${data.shipping === 0 ? 'FREE' : '£' + data.shipping.toFixed(2)}</span></div>
                  <div class="total-row"><span>VAT (20%):</span><span>£${data.tax.toFixed(2)}</span></div>
                  <div class="total-row final-total"><span>Total:</span><span>£${data.total.toFixed(2)}</span></div>
                </div>

                <h3>Shipping Address:</h3>
                <div class="order-details">
                  <p>${data.shippingAddress.name}<br>
                  ${data.shippingAddress.line1}<br>
                  ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
                  ${data.shippingAddress.country}</p>
                </div>

                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Your order will be processed within 24 hours</li>
                  <li>You'll receive tracking information once dispatched</li>
                  <li>Expected delivery: ${data.isBFPO ? '5-14 business days for BFPO addresses' : '2-5 business days for UK addresses'}</li>
                </ul>

                <p>Thank you for supporting Military Tees UK!</p>
                <p><strong>The Military Tees UK Team</strong></p>
              </div>
              <div class="footer">
                <p>Military Tees UK | Premium British Military Themed Apparel</p>
                <p>Questions? Reply to this email or visit our support center</p>
              </div>
            </body>
            </html>
          `
        }

      case 'shipped':
        return {
          subject: `Your Order Has Shipped - ${data.orderNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Order Shipped</title>${baseStyles}</head>
            <body>
              <div class="header">
                <h1>📦 Order Shipped</h1>
                <p>Your military gear is on its way, ${data.customerName}!</p>
              </div>
              <div class="content">
                <p>Dear ${data.customerName},</p>
                <p>Great news! Your order <strong>${data.orderNumber}</strong> has been dispatched.</p>
                
                ${data.trackingNumber ? `
                <div class="tracking-box">
                  <h3>📍 Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                  <p><strong>Carrier:</strong> ${data.carrier || 'Royal Mail'}</p>
                  ${data.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDeliveryDate}</p>` : ''}
                  <p>You can track your package using the tracking number above.</p>
                </div>
                ` : ''}
                
                ${data.isBFPO ? `
                <div class="bfpo-notice">
                  <h3>🏛️ BFPO Shipment Notice</h3>
                  <p>Your order is being sent to a BFPO address. Please note:</p>
                  <p>• Delivery may take longer than standard UK addresses</p>
                  <p>• Tracking may have limited updates once it enters the BFPO system</p>
                  <p>• Contact your local mail room if you have concerns about delivery</p>
                </div>
                ` : ''}

                <div class="order-details">
                  <h3>Shipping Details</h3>
                  <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                  <p><strong>Shipped To:</strong></p>
                  <p>${data.shippingAddress.name}<br>
                  ${data.shippingAddress.line1}<br>
                  ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
                  ${data.shippingAddress.city}, ${data.shippingAddress.postcode}</p>
                </div>

                <p>Thank you for your order and for supporting Military Tees UK!</p>
                <p><strong>The Military Tees UK Team</strong></p>
              </div>
              <div class="footer">
                <p>Military Tees UK | Premium British Military Themed Apparel</p>
                <p>Need help? Contact us at orders@militarytees.co.uk</p>
              </div>
            </body>
            </html>
          `
        }

      case 'delivered':
        return {
          subject: `Order Delivered - ${data.orderNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Order Delivered</title>${baseStyles}</head>
            <body>
              <div class="header">
                <h1>✅ Order Delivered</h1>
                <p>Mission accomplished, ${data.customerName}!</p>
              </div>
              <div class="content">
                <p>Dear ${data.customerName},</p>
                <p>Your order <strong>${data.orderNumber}</strong> has been successfully delivered!</p>
                
                <div class="order-details">
                  <h3>Delivery Confirmation</h3>
                  <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                  <p><strong>Delivered To:</strong> ${data.shippingAddress.line1}, ${data.shippingAddress.city}</p>
                  <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                </div>

                <p><strong>How was your experience?</strong></p>
                <p>We'd love to hear about your Military Tees UK experience. Your feedback helps us serve the military community better.</p>

                <p>Thank you for choosing Military Tees UK!</p>
                <p><strong>The Military Tees UK Team</strong></p>
              </div>
              <div class="footer">
                <p>Military Tees UK | Premium British Military Themed Apparel</p>
                <p>Follow us for new arrivals and special offers</p>
              </div>
            </body>
            </html>
          `
        }

      default:
        throw new Error(`Unsupported email type: ${emailType}`)
    }
  }

  /**
   * Log email notification to database
   */
  private static async logEmailNotification(
    emailType: EmailType,
    templateData: EmailTemplateData,
    result: { success: boolean; messageId?: string; error?: string }
  ) {
    try {
      const supabase = createSupabaseAdmin()
      
      // Attempt to log - don't fail if this fails
      await supabase.from('email_notifications').insert({
        order_id: templateData.orderNumber, // We'll use order number as reference
        email_type: emailType,
        recipient_email: templateData.customerEmail,
        subject: `${emailType} - ${templateData.orderNumber}`,
        email_service: this.emailService,
        message_id: result.messageId,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error
      })
    } catch (error) {
      // Silently fail - email logging shouldn't break email sending
      console.error('Failed to log email notification:', error)
    }
  }

  /**
   * Send order status update email
   */
  static async sendOrderStatusUpdate(
    orderNumber: string,
    newStatus: string,
    trackingNumber?: string,
    estimatedDelivery?: string
  ) {
    // This would fetch order details from database and send appropriate email
    // Implementation depends on order data structure
    console.log(`Order status update: ${orderNumber} -> ${newStatus}`)
    
    // TODO: Implement based on actual order structure
  }
}

// Initialize email service on module load
EmailAutomation.initialize()