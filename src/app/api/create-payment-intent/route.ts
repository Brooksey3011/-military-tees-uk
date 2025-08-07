import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('Create Payment Intent API: Processing request')

    const body = await request.json()
    const { items, shippingAddress, amount, currency = 'gbp' } = body

    console.log('Create Payment Intent API: Request data:', {
      itemCount: items?.length,
      amount,
      currency,
      shippingEmail: shippingAddress?.email
    })

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !shippingAddress.email) {
      return NextResponse.json(
        { error: 'Valid shipping address with email is required' },
        { status: 400 }
      )
    }

    if (!amount || amount < 50) { // Minimum 50 pence
      return NextResponse.json(
        { error: 'Valid amount is required (minimum £0.50)' },
        { status: 400 }
      )
    }

    console.log('Create Payment Intent API: Creating Payment Intent...')

    // Create Payment Intent with automatic payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount should already be in pence
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Prevent redirect-based methods for better UX
      },
      metadata: {
        customer_email: shippingAddress.email,
        customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        item_count: items.length.toString(),
        total_gbp: (amount / 100).toFixed(2),
        checkout_type: 'stripe_elements'
      },
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        phone: shippingAddress.phone,
        address: {
          line1: shippingAddress.address1,
          line2: shippingAddress.address2 || undefined,
          city: shippingAddress.city,
          postal_code: shippingAddress.postcode,
          country: shippingAddress.country || 'GB',
        },
      },
      receipt_email: shippingAddress.email,
    })

    console.log('Create Payment Intent API: Payment Intent created successfully:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    })

  } catch (error) {
    console.error('Create Payment Intent API error:', error)

    if (error && typeof error === 'object' && 'type' in error) {
      // Stripe error
      return NextResponse.json(
        { 
          error: 'Payment setup failed',
          details: error.message || 'Unknown Stripe error'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error while setting up payment' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'create-payment-intent-api',
    timestamp: new Date().toISOString(),
    stripe_version: 'latest'
  })
}