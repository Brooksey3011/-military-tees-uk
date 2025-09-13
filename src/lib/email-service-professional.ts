import { Resend } from 'resend'
import { 
  generateOrderConfirmationEmail, 
  generateOrderConfirmationSubject,
  type OrderConfirmationData 
} from './email-templates/order-confirmation'
import {
  generateWelcomeEmail,
  generateWelcomeEmailSubject,
  type WelcomeEmailData
} from './email-templates/welcome-email'
import {
  generateShippingNotificationEmail,
  generateShippingNotificationSubject,
  type ShippingNotificationData
} from './email-templates/shipping-notification'
import {
  generateCustomQuoteEmail,
  generateCustomQuoteSubject,
  type CustomQuoteData
} from './email-templates/custom-quote'

class ProfessionalEmailService {
  private resend: Resend
  private fromEmail = 'Military Tees UK <info@militarytees.co.uk>'
  private replyTo = 'info@militarytees.co.uk'
  
  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  private async sendEmail(
    to: string, 
    subject: string, 
    html: string, 
    text: string,
    replyTo?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
        replyTo: replyTo || this.replyTo,
      })

      if (result.error) {
        console.error('❌ Email sending failed:', result.error)
        return { success: false, error: result.error.message }
      }

      console.log('✅ Professional email sent successfully:', {
        to,
        subject,
        messageId: result.data?.id
      })

      return { 
        success: true, 
        messageId: result.data?.id 
      }
    } catch (error) {
      console.error('❌ Email service error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Send professional order confirmation email
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { html, text } = generateOrderConfirmationEmail(data)
    const subject = generateOrderConfirmationSubject(data.orderNumber)
    
    return this.sendEmail(data.customerEmail, subject, html, text)
  }

  // Send professional welcome email
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { html, text } = generateWelcomeEmail(data)
    const subject = generateWelcomeEmailSubject(data.name)
    
    return this.sendEmail(data.email, subject, html, text)
  }

  // Send professional shipping notification
  async sendShippingNotification(data: ShippingNotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { html, text } = generateShippingNotificationEmail(data)
    const subject = generateShippingNotificationSubject(data.orderNumber)
    
    return this.sendEmail(data.customerEmail, subject, html, text)
  }

  // Send professional custom quote confirmation
  async sendCustomQuoteConfirmation(data: CustomQuoteData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { html, text } = generateCustomQuoteEmail(data)
    const subject = generateCustomQuoteSubject(data.name, data.orderType)
    
    return this.sendEmail(data.email, subject, html, text)
  }

  // Send admin notification for new orders
  async sendOrderNotificationToAdmin(data: OrderConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@militarytees.co.uk'
    
    const adminContent = `
      <h1>🛡️ New Order Received - ${data.orderNumber}</h1>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #6b7c3a; margin: 20px 0;">
        <h2 style="color: #6b7c3a; margin-top: 0;">Order Details</h2>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
        <p><strong>Order Date:</strong> ${data.orderDate}</p>
        <p><strong>Total Value:</strong> £${data.total.toFixed(2)}</p>
      </div>

      <h3>Items Ordered</h3>
      <ul>
        ${data.items.map(item => 
          `<li><strong>${item.name}</strong> - ${item.variant} (Qty: ${item.quantity}) - £${item.total.toFixed(2)}</li>`
        ).join('')}
      </ul>

      <h3>Shipping Address</h3>
      <p>
        ${data.shippingAddress.name}<br>
        ${data.shippingAddress.address_line_1}<br>
        ${data.shippingAddress.address_line_2 ? data.shippingAddress.address_line_2 + '<br>' : ''}
        ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
        ${data.shippingAddress.country}
      </p>

      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ Action Required</h3>
        <p style="margin: 0;">Process this order in the admin dashboard and prepare for dispatch.</p>
      </div>

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="background-color: #6b7c3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Admin Dashboard</a></p>
    `

    const subject = `New Order #${data.orderNumber} - Action Required | Military Tees UK`
    
    // Simple HTML wrapper for admin emails
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #6b7c3a; }
        </style>
      </head>
      <body>${adminContent}</body>
      </html>
    `

    const adminText = adminContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return this.sendEmail(adminEmail, subject, adminHtml, adminText)
  }

  // Send admin notification for custom quotes
  async sendCustomQuoteNotificationToAdmin(data: CustomQuoteData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const adminEmail = process.env.ADMIN_EMAIL || 'custom@militarytees.co.uk'
    
    const adminContent = `
      <h1>🎨 New Custom Quote Request</h1>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #6b7c3a; margin: 20px 0;">
        <h2 style="color: #6b7c3a; margin-top: 0;">Request Details</h2>
        <p><strong>Customer:</strong> ${data.name} (${data.email})</p>
        <p><strong>Order Type:</strong> ${data.orderType}</p>
        <p><strong>Quantity:</strong> ${data.quantity} units</p>
        <p><strong>Request Date:</strong> ${data.requestDate}</p>
        ${data.urgency ? `<p><strong>Urgency:</strong> ${data.urgency}</p>` : ''}
        ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ''}
      </div>

      <h3>Design Brief</h3>
      <div style="background-color: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0;">
        <p style="font-style: italic; white-space: pre-wrap;">"${data.description}"</p>
      </div>

      ${data.images && data.images.length > 0 ? `
        <h3>Reference Images</h3>
        <p>${data.images.length} reference image(s) provided</p>
      ` : ''}

      <div style="background-color: ${data.urgency === 'rush' ? '#fff3cd' : '#d4edda'}; border: 1px solid ${data.urgency === 'rush' ? '#ffeaa7' : '#c3e6cb'}; padding: 15px; margin: 20px 0;">
        <h3 style="color: ${data.urgency === 'rush' ? '#856404' : '#155724'}; margin-top: 0;">
          ${data.urgency === 'rush' ? '⚡ Rush Order' : '📋 Action Required'}
        </h3>
        <p style="margin: 0;">
          ${data.urgency === 'rush' ? 'Priority response required within 4-6 hours.' : 'Contact customer within 24-48 hours to discuss requirements and provide quote.'}
        </p>
      </div>

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/custom-quotes" style="background-color: #6b7c3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Admin Dashboard</a></p>
    `

    const subject = `New Custom Quote Request - ${data.orderType} | Military Tees UK`
    
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1, h2, h3 { color: #6b7c3a; }
        </style>
      </head>
      <body>${adminContent}</body>
      </html>
    `

    const adminText = adminContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return this.sendEmail(adminEmail, subject, adminHtml, adminText)
  }

  // Test the email service
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Send a test email to verify the service is working
      const testEmail = process.env.ADMIN_EMAIL || 'info@militarytees.co.uk'
      
      const result = await this.sendEmail(
        testEmail,
        'Email Service Test - Military Tees UK',
        '<h1>Email Service Test</h1><p>Professional email service is working correctly!</p>',
        'Email Service Test\n\nProfessional email service is working correctly!'
      )
      
      if (result.success) {
        return { success: true, message: 'Professional email service connection successful' }
      } else {
        return { success: false, message: `Email service test failed: ${result.error}` }
      }
    } catch (error) {
      console.error('Professional email service test failed:', error)
      return { 
        success: false, 
        message: `Email service test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }
}

// Export singleton instance
export const professionalEmailService = new ProfessionalEmailService()

// Export all the data interfaces for external use
export type { 
  OrderConfirmationData, 
  WelcomeEmailData, 
  ShippingNotificationData, 
  CustomQuoteData 
}

// Convenience functions for external use
export const sendProfessionalOrderConfirmation = (data: OrderConfirmationData) => 
  professionalEmailService.sendOrderConfirmation(data)

export const sendProfessionalWelcomeEmail = (data: WelcomeEmailData) => 
  professionalEmailService.sendWelcomeEmail(data)

export const sendProfessionalShippingNotification = (data: ShippingNotificationData) => 
  professionalEmailService.sendShippingNotification(data)

export const sendProfessionalCustomQuote = (data: CustomQuoteData) => 
  professionalEmailService.sendCustomQuoteConfirmation(data)

export const sendOrderNotificationToAdmin = (data: OrderConfirmationData) => 
  professionalEmailService.sendOrderNotificationToAdmin(data)

export const sendCustomQuoteNotificationToAdmin = (data: CustomQuoteData) => 
  professionalEmailService.sendCustomQuoteNotificationToAdmin(data)