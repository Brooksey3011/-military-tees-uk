import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Promo codes and delivery options
const validPromoCodes = {
  'MILITARY10': { discount: 10, type: 'percentage', description: '10% off for military personnel' },
  'FIRSTORDER': { discount: 15, type: 'percentage', description: '15% off your first order' },
  'SAVE5': { discount: 5, type: 'fixed', description: '£5 off your order' }
} as const

const deliveryOptions = {
  'standard': { name: 'Standard Delivery', price: 4.99, estimatedDays: '3-5 business days' },
  'express': { name: 'Express Delivery', price: 8.99, estimatedDays: '1 business day' },
  'premium': { name: 'Premium Delivery', price: 12.99, estimatedDays: '1-2 business days' }
} as const

export async function POST(request: NextRequest) {
  try {
    console.log('Create Payment Intent API: Processing request')

    const body = await request.json()
    const { 
      items, 
      shippingAddress, 
      amount, 
      currency = 'gbp',
      deliveryOption = 'standard',
      promoCode
    } = body

    console.log('Create Payment Intent API: Request data:', {
      itemCount: items?.length,
      amount,
      currency,
      deliveryOption,
      promoCode,
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

    // Validate delivery option
    const selectedDelivery = deliveryOptions[deliveryOption as keyof typeof deliveryOptions]
    if (!selectedDelivery) {
      return NextResponse.json(
        { error: 'Invalid delivery option' },
        { status: 400 }
      )
    }

    // Validate and apply promo code if provided
    let appliedPromo = null
    if (promoCode) {
      const promo = validPromoCodes[promoCode as keyof typeof validPromoCodes]
      if (promo) {
        appliedPromo = { code: promoCode, ...promo }
      }
    }

    console.log('Create Payment Intent API: Creating Payment Intent...')

    // Create metadata with delivery and promo info
    const metadata: Record<string, string> = {
      customer_email: shippingAddress.email,
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      item_count: items.length.toString(),
      total_gbp: (amount / 100).toFixed(2),
      checkout_type: 'enhanced_checkout',
      delivery_option: deliveryOption,
      delivery_name: selectedDelivery.name,
      delivery_cost: selectedDelivery.price.toString(),
      delivery_estimate: selectedDelivery.estimatedDays
    }

    if (appliedPromo) {
      metadata.promo_code = appliedPromo.code
      metadata.promo_discount = appliedPromo.discount.toString()
      metadata.promo_type = appliedPromo.type
      metadata.promo_description = appliedPromo.description
    }

    // Add item details to metadata
    items.forEach((item: any, index: number) => {
      metadata[`item_${index}_name`] = item.name || 'Unknown Item'
      metadata[`item_${index}_variant_id`] = item.variantId || 'unknown'
      metadata[`item_${index}_quantity`] = item.quantity?.toString() || '1'
      metadata[`item_${index}_price`] = item.price?.toString() || '0'
      if (item.size) metadata[`item_${index}_size`] = item.size
      if (item.color) metadata[`item_${index}_color`] = item.color
    })

    // Create Payment Intent with automatic payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount should already be in pence
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Prevent redirect-based methods for better UX
      },
      payment_method_types: [
        'card',
        'klarna',
        'clearpay',
        'link'
      ],
      metadata,
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
      description: `Military Tees UK Order - ${items.length} item(s) - ${selectedDelivery.name}${appliedPromo ? ` - Promo: ${appliedPromo.code}` : ''}`,
    })

    console.log('Create Payment Intent API: Payment Intent created successfully:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      deliveryOption: selectedDelivery,
      appliedPromo,
    })

  } catch (error) {
    console.error('Create Payment Intent API error:', error)

    if (error && typeof error === 'object' && 'type' in error) {
      // Stripe error
      return NextResponse.json(
        { 
          error: 'Payment setup failed',
          details: (error as any)?.message || 'Unknown Stripe error'
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