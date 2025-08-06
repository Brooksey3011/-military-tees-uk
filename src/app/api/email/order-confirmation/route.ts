import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Email service setup - supports both Hostinger SMTP and Resend
let emailService: 'hostinger' | 'resend' | null = null
let resend: Resend | null = null
let transporter: any = null

// Check for Hostinger SMTP configuration first (preferred)
if (process.env.HOSTINGER_EMAIL_HOST && process.env.HOSTINGER_EMAIL_USER && process.env.HOSTINGER_EMAIL_PASS) {
  emailService = 'hostinger'
  try {
    transporter = nodemailer.createTransport({
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
    console.log('✅ Hostinger SMTP transporter created successfully')
  } catch (error) {
    console.error('❌ Error creating Hostinger transporter:', error)
    emailService = null
    transporter = null
  }
} else if (process.env.RESEND_API_KEY) {
  // Fallback to Resend if available
  emailService = 'resend'
  resend = new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderNumber,
      customerEmail,
      customerName,
      items,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      total
    } = body

    // Check if email service is available
    if (!emailService) {
      console.log('❌ EMAIL SERVICE NOT CONFIGURED')
      console.log('⚠️  To enable email confirmations with Hostinger:')
      console.log('1. Add these environment variables:')
      console.log('   HOSTINGER_EMAIL_HOST=mail.yourdomain.com')
      console.log('   HOSTINGER_EMAIL_USER=orders@yourdomain.com')
      console.log('   HOSTINGER_EMAIL_PASS=your-email-password')
      console.log('   HOSTINGER_EMAIL_PORT=587')
      console.log('2. Customer will NOT receive email confirmation until configured')
      
      return NextResponse.json({ 
        success: false, 
        message: 'Email service not configured - customer will not receive confirmation email',
        instructions: 'Add Hostinger SMTP credentials to environment variables'
      }, { status: 200 })
    }

    console.log(`Sending order confirmation email to: ${customerEmail} using ${emailService}`)

    // Create HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Military Tees UK</title>
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>We've received your order and are preparing your military gear for dispatch.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
            </div>

            <h3>Items Ordered:</h3>
            ${items.map((item: any) => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  ${item.size ? `Size: ${item.size}` : ''} ${item.size && item.color ? '|' : ''} ${item.color ? `Color: ${item.color}` : ''}<br>
                  Quantity: ${item.quantity}
                </div>
                <div><strong>£${(item.price * item.quantity).toFixed(2)}</strong></div>
              </div>
            `).join('')}

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>£${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '£' + shipping.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>VAT (20%):</span>
                <span>£${tax.toFixed(2)}</span>
              </div>
              <div class="total-row final-total">
                <span>Total:</span>
                <span>£${total.toFixed(2)}</span>
              </div>
            </div>

            <h3>Shipping Address:</h3>
            <div class="order-details">
              <p>
                ${customerName}<br>
                ${shippingAddress.address1}${shippingAddress.address2 ? '<br>' + shippingAddress.address2 : ''}<br>
                ${shippingAddress.city}, ${shippingAddress.postcode}<br>
                ${shippingAddress.country}
              </p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your order will be packed and dispatched within 24 hours</li>
              <li>You'll receive tracking information once your order ships</li>
              <li>Expected delivery: 5-7 business days for UK addresses</li>
            </ul>

            <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            
            <p>Thank you for supporting Military Tees UK!</p>
            <p><strong>The Military Tees UK Team</strong></p>
          </div>

          <div class="footer">
            <p>Military Tees UK | Premium British Military Themed Apparel</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </body>
      </html>
    `

    // Send email using the configured service
    if (emailService === 'hostinger') {
      // Create fresh transporter for this request (avoid stale connections)
      try {
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
          to: customerEmail,
          subject: `Order Confirmation - ${orderNumber}`,
          html: emailHtml,
        })

        console.log('Hostinger email sent successfully:', info.messageId)
        return NextResponse.json({ 
          success: true, 
          messageId: info.messageId,
          service: 'hostinger'
        })
      } catch (error) {
        console.error('Error sending Hostinger email:', error)
        return NextResponse.json({ 
          error: 'Failed to send email via Hostinger SMTP',
          details: error instanceof Error ? error.message : 'Unknown error',
          config: {
            host: process.env.HOSTINGER_EMAIL_HOST,
            port: process.env.HOSTINGER_EMAIL_PORT,
            secure: process.env.HOSTINGER_EMAIL_SECURE,
            user: process.env.HOSTINGER_EMAIL_USER?.substring(0, 5) + '***'
          }
        }, { status: 500 })
      }
    } else if (emailService === 'resend' && resend) {
      // Send email using Resend (fallback)
      try {
        const { data, error } = await resend.emails.send({
          from: 'Military Tees UK <orders@militarytees.co.uk>',
          to: [customerEmail],
          subject: `Order Confirmation - ${orderNumber}`,
          html: emailHtml,
        })

        if (error) {
          console.error('Error sending Resend email:', error)
          return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 500 })
        }

        console.log('Resend email sent successfully:', data)
        return NextResponse.json({ 
          success: true, 
          messageId: data?.id,
          service: 'resend'
        })
      } catch (error) {
        console.error('Resend email error:', error)
        return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ 
        error: 'Email service configuration error' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'