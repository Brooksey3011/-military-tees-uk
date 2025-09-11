import { NextRequest, NextResponse } from 'next/server'
import { 
  professionalEmailService,
  type OrderConfirmationData,
  type WelcomeEmailData,
  type ShippingNotificationData,
  type CustomQuoteData
} from '@/lib/email-service-professional'

// Test data for email templates
const testOrderData: OrderConfirmationData = {
  orderNumber: 'MT' + Date.now().toString().slice(-8),
  customerName: 'Staff Sergeant John Smith',
  customerEmail: process.env.ADMIN_EMAIL || 'test@militarytees.co.uk',
  orderDate: new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  }),
  subtotal: 49.98,
  shipping: 4.99,
  tax: 10.99,
  total: 65.96,
  shippingAddress: {
    name: 'Staff Sergeant John Smith',
    address_line_1: '123 Military Base Road',
    address_line_2: 'Building 42, Room 15',
    city: 'Aldershot',
    postcode: 'GU11 2AB',
    country: 'United Kingdom'
  },
  items: [
    {
      name: 'British Army Heritage T-Shirt',
      variant: 'Black - Large',
      quantity: 2,
      price: 19.99,
      total: 39.98
    },
    {
      name: 'Royal Engineers Cap',
      variant: 'Olive Green - One Size',
      quantity: 1,
      price: 9.99,
      total: 9.99
    }
  ]
}

const testWelcomeData: WelcomeEmailData = {
  name: 'Lieutenant Sarah Johnson',
  email: process.env.ADMIN_EMAIL || 'test@militarytees.co.uk'
}

const testShippingData: ShippingNotificationData = {
  orderNumber: 'MT' + Date.now().toString().slice(-8),
  customerName: 'Corporal Michael Brown',
  customerEmail: process.env.ADMIN_EMAIL || 'test@militarytees.co.uk',
  trackingNumber: 'MT' + Date.now().toString(),
  carrier: 'Royal Mail',
  carrierUrl: 'https://www.royalmail.com/track-your-item#/',
  estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
  shippingAddress: {
    name: 'Corporal Michael Brown',
    address_line_1: '456 Garrison Close',
    city: 'Catterick',
    postcode: 'DL9 3EL',
    country: 'United Kingdom'
  },
  items: [
    {
      name: 'Parachute Regiment Hoodie',
      variant: 'Maroon - Medium',
      quantity: 1
    },
    {
      name: 'Military Heritage Mug',
      variant: 'Black - Standard',
      quantity: 2
    }
  ]
}

const testCustomQuoteData: CustomQuoteData = {
  name: 'Major James Wilson',
  email: process.env.ADMIN_EMAIL || 'test@militarytees.co.uk',
  orderType: 'Unit T-Shirts',
  description: 'We need custom t-shirts for our battalion reunion event. Design should include our unit crest, years of service (1985-2010), and "Once a Soldier, Always a Soldier" motto. Colors should be military green with gold text. Professional military look required.',
  quantity: 50,
  images: ['unit-crest.jpg', 'reference-design.png'],
  requestDate: new Date().toLocaleDateString('en-GB'),
  urgency: 'standard',
  budget: '£500-750'
}

export async function POST(request: NextRequest) {
  try {
    const { emailType } = await request.json()
    
    console.log(`🧪 Testing professional email template: ${emailType}`)
    
    let result: { success: boolean; messageId?: string; error?: string }
    
    switch (emailType) {
      case 'order-confirmation':
        result = await professionalEmailService.sendOrderConfirmation(testOrderData)
        if (result.success) {
          await professionalEmailService.sendOrderNotificationToAdmin(testOrderData)
        }
        break
        
      case 'welcome':
        result = await professionalEmailService.sendWelcomeEmail(testWelcomeData)
        break
        
      case 'shipping':
        result = await professionalEmailService.sendShippingNotification(testShippingData)
        break
        
      case 'custom-quote':
        result = await professionalEmailService.sendCustomQuoteConfirmation(testCustomQuoteData)
        if (result.success) {
          await professionalEmailService.sendCustomQuoteNotificationToAdmin(testCustomQuoteData)
        }
        break
        
      case 'connection-test':
        const connectionResult = await professionalEmailService.testConnection()
        return NextResponse.json({
          success: connectionResult.success,
          message: connectionResult.message,
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid email type. Available types: order-confirmation, welcome, shipping, custom-quote, connection-test'
        }, { status: 400 })
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Professional ${emailType} email sent successfully!`,
        messageId: result.messageId,
        emailType,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Unknown error occurred',
        emailType,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Email test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Professional Email Template Testing API',
    availableTypes: [
      'order-confirmation',
      'welcome', 
      'shipping',
      'custom-quote',
      'connection-test'
    ],
    usage: 'POST /api/test-professional-email with { "emailType": "order-confirmation" }',
    features: [
      '✅ Professional HTML templates with Military Tees UK branding',
      '✅ Military-themed design inspired by premium brands',
      '✅ Responsive email design for all devices',
      '✅ Plain text fallback for all email clients',
      '✅ Integrated logo and brand colors',
      '✅ Admin notifications for orders and quotes',
      '✅ Resend.com integration for reliable delivery'
    ]
  })
}