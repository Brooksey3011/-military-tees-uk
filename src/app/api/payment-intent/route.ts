import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import { validateRequestBody, checkoutSchema } from '@/lib/validation'

type PaymentIntentRequest = z.infer<typeof checkoutSchema>

// Helper functions (reused from checkout route)
function calculateShipping(subtotal: number): number {
  return subtotal >= 50 ? 0 : 4.99
}

function calculateVAT(subtotal: number, shipping: number): number {
  return (subtotal + shipping) * 0.2
}

async function validateInventoryAndGetProducts(items: PaymentIntentRequest['items']) {
  const supabase = createSupabaseAdmin()
  const productDetails = []

  for (const item of items) {
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        stock_quantity,
        price,
        size,
        color,
        products (
          id,
          name,
          price,
          main_image_url
        )
      `)
      .eq('id', item.variantId)
      .eq('is_active', true)
      .single()

    if (variantError || !variant) {
      throw new Error(`Product variant not found: ${item.variantId}`)
    }

    const product = variant.products as any
    if (!product) {
      throw new Error(`Product not found for variant: ${item.variantId}`)
    }

    if (variant.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`)
    }

    const unitPrice = product.price + (variant.price || 0)
    const totalPrice = unitPrice * item.quantity

    productDetails.push({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      stockQuantity: variant.stock_quantity,
      imageUrl: product.main_image_url
    })
  }

  return productDetails
}

export async function POST(request: NextRequest) {
  try {
    console.log('Payment Intent API: Processing request')

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequestBody(checkoutSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: `Validation failed: ${validation.error}`,
          details: validation.error 
        },
        { status: 400 }
      )
    }

    const { items, shippingAddress, billingAddress, customerNotes } = validation.data

    // Validate inventory and get product details
    const productDetails = await validateInventoryAndGetProducts(items)
    console.log('Payment Intent API: Products validated:', productDetails.length)

    // Calculate totals
    const subtotal = productDetails.reduce((sum, product) => sum + product.totalPrice, 0)
    const shipping = calculateShipping(subtotal)
    const tax = calculateVAT(subtotal, shipping)
    const total = subtotal + shipping + tax

    console.log('Payment Intent API: Calculated totals:', { subtotal, shipping, tax, total })

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to pence
      currency: 'gbp',
      payment_method_types: ['card'],
      capture_method: 'automatic',
      setup_future_usage: 'off_session', // Allow saving payment methods
      metadata: {
        customer_email: shippingAddress.email,
        customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        subtotal: subtotal.toString(),
        shipping_cost: shipping.toString(),
        tax_amount: tax.toString(),
        total: total.toString(),
        item_count: items.length.toString(),
        customer_notes: customerNotes || '',
      },
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        phone: shippingAddress.phone,
        address: {
          line1: shippingAddress.address1,
          line2: shippingAddress.address2 || undefined,
          city: shippingAddress.city,
          postal_code: shippingAddress.postcode,
          country: shippingAddress.country,
        },
      },
    })

    console.log('Payment Intent API: Payment Intent created:', paymentIntent.id)

    // Return client secret for frontend
    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: total,
      currency: 'gbp',
      message: 'Payment Intent created successfully'
    })

  } catch (error) {
    console.error('Payment Intent API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('stock') || error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during payment setup. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'payment-intent-api',
    timestamp: new Date().toISOString()
  })
}