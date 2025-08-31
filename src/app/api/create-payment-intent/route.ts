import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'

// Optimized PaymentIntent schema for Express Checkout conversion
const expressCheckoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    quantity: z.number().int().min(1).max(10)
  })).min(1, 'Cart cannot be empty'),
  customerEmail: z.string().email().optional(),
  currency: z.string().default('gbp')
})

type ExpressCheckoutRequest = z.infer<typeof expressCheckoutSchema>

// Optimized pricing calculations for conversion
function calculateShipping(subtotal: number): number {
  return subtotal >= 50 ? 0 : 4.99
}

function calculateVAT(subtotal: number, shipping: number): number {
  return Math.round((subtotal + shipping) * 0.2 * 100) / 100
}

function formatAmount(amount: number): number {
  return Math.round(amount * 100) // Convert to pence for Stripe
}

// Fast product lookup optimized for conversion
async function getProductDetails(items: ExpressCheckoutRequest['items']) {
  const supabase = createSupabaseAdmin()
  const productDetails = []

  for (const item of items) {
    const { data: variant, error } = await supabase
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

    if (error || !variant) {
      throw new Error(`Product variant not found: ${item.variantId}`)
    }

    const product = variant.products as any
    if (!product) {
      throw new Error(`Product not found for variant: ${item.variantId}`)
    }

    // Check stock
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
    const body = await request.json()
    const { items, customerEmail, currency } = expressCheckoutSchema.parse(body)

    // Fast product validation and pricing
    const productDetails = await getProductDetails(items)
    const subtotal = productDetails.reduce((sum, product) => sum + product.totalPrice, 0)
    const shipping = calculateShipping(subtotal)
    const tax = calculateVAT(subtotal, shipping)
    const total = subtotal + shipping + tax

    // Create optimized PaymentIntent for Express Checkout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmount(total),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      
      // Streamlined metadata for conversion tracking
      metadata: {
        source: 'express_checkout',
        itemCount: items.length.toString(),
        total: total.toString(),
        ...(customerEmail && { customerEmail })
      },
      
      // Receipt email if provided
      ...(customerEmail && { receipt_email: customerEmail })
    })

    // Clean response optimized for frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total: parseFloat(total.toFixed(2)),
      currency: currency.toLowerCase(),
      breakdown: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2))
      }
    })

  } catch (error) {
    // Conversion-optimized error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Please check your cart and try again' },
        { status: 400 }
      )
    }

    // Generic error for security
    return NextResponse.json(
      { error: 'Payment setup failed', message: 'Please try again or contact support' },
      { status: 500 }
    )
  }
}

// Vercel serverless function configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'