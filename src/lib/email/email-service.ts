import { createTransport } from 'nodemailer'
import { render } from '@react-email/render'

// Email service configuration
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template data interfaces
export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    name: string
    address_line_1: string
    address_line_2?: string
    city: string
    postcode: string
    country: string
  }
  items: Array<{
    name: string
    variant: string
    quantity: number
    price: number
    total: number
    image?: string
  }>
}

export interface CustomQuoteData {
  name: string
  email: string
  orderType: string
  description: string
  quantity: number
  images?: string[]
  requestDate: string
}

export interface WelcomeEmailData {
  name: string
  email: string
}

class EmailService {
  private transporter: any
  private config: EmailConfig
  private fromEmail = 'info@militarytees.co.uk'
  private fromName = 'Military Tees UK'

  constructor() {
    this.config = this.getEmailConfig()
    this.initializeTransporter()
  }

  private getEmailConfig(): EmailConfig {
    // Default configuration for various email providers
    const provider = process.env.EMAIL_PROVIDER || 'smtp'

    switch (provider) {
      case 'gmail':
        return {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || this.fromEmail,
            pass: process.env.EMAIL_PASS || ''
          }
        }
      
      case 'hostinger':
        return {
          host: 'smtp.hostinger.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || this.fromEmail,
            pass: process.env.EMAIL_PASS || ''
          }
        }

      case 'resend':
        // Resend API (if using Resend service)
        return {
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY || ''
          }
        }

      default:
        // Generic SMTP configuration
        return {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || this.fromEmail,
            pass: process.env.SMTP_PASS || ''
          }
        }
    }
  }

  private initializeTransporter() {
    this.transporter = createTransport(this.config)
  }

  private async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', { to, subject, messageId: result.messageId })
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  private htmlToText(html: string): string {
    // Basic HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Order confirmation email
  async sendOrderConfirmation(data: OrderConfirmationData) {
    const subject = `Order Confirmation - ${data.orderNumber} | Military Tees UK`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #4a5d23; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .order-summary { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #4a5d23; }
          .item { border-bottom: 1px solid #eee; padding: 15px 0; }
          .item:last-child { border-bottom: none; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .btn { background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
          h1, h2 { color: #4a5d23; }
          .address { background-color: #f8f9fa; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Military Tees UK</h1>
            <p>Order Confirmed - Thank You!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            
            <p>Thank you for your order! We're excited to get your military-themed apparel to you with the precision and care you deserve.</p>
            
            <div class="order-summary">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Customer:</strong> ${data.customerName}</p>
            </div>

            <h3>Items Ordered</h3>
            ${data.items.map(item => `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${item.name}</strong><br>
                    <span style="color: #666;">${item.variant}</span><br>
                    <span>Quantity: ${item.quantity}</span>
                  </div>
                  <div style="text-align: right;">
                    <strong>£${item.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            `).join('')}

            <div class="order-summary">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>£${data.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Shipping:</span>
                <span>£${data.shipping.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span>Tax:</span>
                <span>£${data.tax.toFixed(2)}</span>
              </div>
              <hr>
              <div style="display: flex; justify-content: space-between;" class="total-row">
                <span>Total:</span>
                <span>£${data.total.toFixed(2)}</span>
              </div>
            </div>

            <h3>Shipping Address</h3>
            <div class="address">
              ${data.shippingAddress.name}<br>
              ${data.shippingAddress.address_line_1}<br>
              ${data.shippingAddress.address_line_2 ? data.shippingAddress.address_line_2 + '<br>' : ''}
              ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
              ${data.shippingAddress.country}
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We'll process your order within 1-2 business days</li>
              <li>You'll receive a shipping confirmation with tracking details</li>
              <li>Your order will be delivered with military precision</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://militarytees.co.uk/track-order" class="btn">Track Your Order</a>
            </div>

            <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>
            
            <p><strong>Thank you for supporting military heritage!</strong></p>
          </div>

          <div class="footer">
            <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
            <p>Honoring Military Heritage with Pride</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail(data.customerEmail, subject, html)
  }

  // Custom quote confirmation email
  async sendCustomQuoteConfirmation(data: CustomQuoteData) {
    const subject = 'Custom Quote Request Received | Military Tees UK'
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Quote Request</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #4a5d23; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .quote-summary { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #4a5d23; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          h1, h2 { color: #4a5d23; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Military Tees UK</h1>
            <p>Custom Quote Request Received</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.name},</h2>
            
            <p>Thank you for your custom design request! Our design team has received your requirements and will review them with the attention to detail that military precision demands.</p>
            
            <div class="quote-summary">
              <h3>Your Request Details</h3>
              <p><strong>Order Type:</strong> ${data.orderType}</p>
              <p><strong>Estimated Quantity:</strong> ${data.quantity}</p>
              <p><strong>Request Date:</strong> ${data.requestDate}</p>
              <p><strong>Description:</strong></p>
              <p style="background-color: white; padding: 15px; margin: 10px 0;">${data.description}</p>
              ${data.images && data.images.length > 0 ? `<p><strong>Reference Images:</strong> ${data.images.length} image(s) attached</p>` : ''}
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our design team will review your requirements (within 24 hours)</li>
              <li>We'll contact you to discuss details and provide a detailed quote</li>
              <li>Upon approval, we'll create initial design concepts</li>
              <li>We'll work with you to perfect the design before production</li>
            </ul>

            <p><strong>Need to make changes or have questions?</strong><br>
            Simply reply to this email or contact us directly:</p>
            
            <ul>
              <li>📧 Email: custom@militarytees.co.uk</li>
              <li>📞 Phone: +44 1234 567890</li>
              <li>🕐 Hours: Mon-Fri, 9AM-5PM GMT</li>
            </ul>

            <p>We're excited to bring your military-themed vision to life!</p>
            
            <p><strong>Thank you for choosing Military Tees UK for your custom design needs.</strong></p>
          </div>

          <div class="footer">
            <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
            <p>Creating Custom Military Heritage Designs</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail(data.email, subject, html)
  }

  // Welcome email for new customers
  async sendWelcomeEmail(data: WelcomeEmailData) {
    const subject = 'Welcome to Military Tees UK - Your Journey Begins!'
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Military Tees UK</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #4a5d23; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .benefit { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #4a5d23; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .btn { background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
          h1, h2 { color: #4a5d23; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Welcome to Military Tees UK</h1>
            <p>Honoring Military Heritage with Pride</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.name},</h2>
            
            <p>Welcome to the Military Tees UK family! We're honored to have you join our community of military personnel, veterans, families, and supporters who share a passion for military heritage.</p>

            <h3>What makes us different:</h3>
            
            <div class="benefit">
              <strong>🎖️ Authentic Military Heritage</strong><br>
              Every design is created with respect and understanding of military tradition and culture.
            </div>
            
            <div class="benefit">
              <strong>👕 Premium Quality</strong><br>
              Built to last with military-grade durability using only the finest materials.
            </div>
            
            <div class="benefit">
              <strong>🎨 Custom Design Service</strong><br>
              Need something unique? Our design team creates bespoke military-themed apparel.
            </div>
            
            <div class="benefit">
              <strong>🚚 Fast, Secure Delivery</strong><br>
              Quick dispatch with tracking, plus free shipping to BFPO addresses.
            </div>

            <h3>Get Started:</h3>
            <ul>
              <li>Browse our extensive catalog of military-themed apparel</li>
              <li>Request custom designs for your unit or event</li>
              <li>Join our community of military heritage enthusiasts</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://militarytees.co.uk" class="btn">Start Shopping</a>
              <a href="https://militarytees.co.uk/custom" class="btn" style="background-color: #6b7c3a;">Custom Orders</a>
            </div>

            <p><strong>Questions? We're here to help!</strong><br>
            Our team understands military culture and is ready to assist with any questions about our products or services.</p>

            <p>Thank you for your service, and welcome to Military Tees UK!</p>
          </div>

          <div class="footer">
            <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
            <p>Proudly supporting military heritage since 2024</p>
            <p><a href="https://militarytees.co.uk/unsubscribe">Unsubscribe</a> | <a href="https://militarytees.co.uk/privacy">Privacy Policy</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail(data.email, subject, html)
  }

  // Admin notification for new orders
  async sendOrderNotificationToAdmin(data: OrderConfirmationData) {
    const subject = `New Order Received - ${data.orderNumber} | Military Tees UK`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Notification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .order-summary { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #4a5d23; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          h1, h2 { color: #4a5d23; }
        </style>
      </head>
      <body>
        <h1>🛡️ New Order Received</h1>
        
        <div class="order-summary">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Total:</strong> £${data.total.toFixed(2)}</p>
        </div>

        <h3>Items Ordered</h3>
        ${data.items.map(item => `
          <div class="item">
            <strong>${item.name}</strong> - ${item.variant}<br>
            Quantity: ${item.quantity} × £${item.price.toFixed(2)} = £${item.total.toFixed(2)}
          </div>
        `).join('')}

        <h3>Shipping Address</h3>
        <p>
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.address_line_1}<br>
          ${data.shippingAddress.address_line_2 ? data.shippingAddress.address_line_2 + '<br>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
          ${data.shippingAddress.country}
        </p>

        <p><strong>Action Required:</strong> Process this order in the admin dashboard.</p>
        <p><a href="https://militarytees.co.uk/admin/orders">View in Admin Dashboard</a></p>
      </body>
      </html>
    `

    return await this.sendEmail('info@militarytees.co.uk', subject, html)
  }

  // Test email connectivity
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify()
      return { success: true, message: 'Email service connection successful' }
    } catch (error) {
      console.error('Email service connection failed:', error)
      return { success: false, message: `Email service connection failed: ${error.message}` }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Convenience functions
export const sendOrderConfirmation = (data: OrderConfirmationData) => 
  emailService.sendOrderConfirmation(data)

export const sendCustomQuoteConfirmation = (data: CustomQuoteData) => 
  emailService.sendCustomQuoteConfirmation(data)

export const sendWelcomeEmail = (data: WelcomeEmailData) => 
  emailService.sendWelcomeEmail(data)

export const sendOrderNotificationToAdmin = (data: OrderConfirmationData) => 
  emailService.sendOrderNotificationToAdmin(data)