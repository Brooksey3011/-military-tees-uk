import { NextRequest, NextResponse } from 'next/server'
import { EmailAutomation, EmailTemplateData } from '@/lib/email-automation'
import { EnhancedShippingCalculator } from '@/lib/enhanced-shipping-calculator'

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

    console.log(`📧 Sending enhanced order confirmation email to: ${customerEmail}`)

    // Check if this is a BFPO address
    const isBFPO = EnhancedShippingCalculator.isBFPOAddress(shippingAddress)
    
    // Prepare email template data
    const emailData: EmailTemplateData = {
      orderNumber,
      customerName,
      customerEmail,
      orderDate: new Date().toLocaleDateString('en-GB'),
      estimatedDelivery: isBFPO 
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      isBFPO,
      militaryUnit: isBFPO ? shippingAddress.line2 : undefined
    }

    // Send email using enhanced automation system
    const result = await EmailAutomation.sendEmail('order_confirmation', emailData, true)

    if (result.success) {
      console.log('✅ Enhanced order confirmation email sent successfully')
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        service: 'enhanced_email_automation',
        bfpo_detected: isBFPO,
        features: [
          'BFPO address detection',
          'Military-themed templates',
          'Enhanced delivery estimates',
          'Automatic admin copy'
        ]
      })
    } else {
      console.error('❌ Enhanced email sending failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        fallback: 'Email automation system failed'
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