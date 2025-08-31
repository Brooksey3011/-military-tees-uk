import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'

// PaymentIntent request schema for Express Checkout
const paymentIntentSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().min(1, 'Variant ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10')
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postcode: z.string().min(1, 'Postcode is required'),
    country: z.string().min(2, 'Country is required')
  }).optional(),
  currency: z.string().default('gbp')
})

type PaymentIntentRequest = z.infer<typeof paymentIntentSchema>

// Helper functions
function calculateShipping(subtotal: number): number {
  return subtotal >= 50 ? 0 : 4.99
}

function calculateVAT(subtotal: number, shipping: number): number {
  return Math.round((subtotal + shipping) * 0.2 * 100) / 100
}

// Get product details from Supabase
async function getProductDetails(items: PaymentIntentRequest['items']) {
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
    console.log('🚀 PaymentIntent API: Processing Express Checkout request')

    // Parse and validate request
    const body = await request.json()
    const validatedData = paymentIntentSchema.parse(body)
    const { items, shippingAddress, currency } = validatedData

    // Get product details from database
    const productDetails = await getProductDetails(items)
    
    // Calculate totals
    const subtotal = productDetails.reduce((sum, product) => sum + product.totalPrice, 0)
    const shipping = calculateShipping(subtotal)
    const tax = calculateVAT(subtotal, shipping)
    const total = subtotal + shipping + tax

    console.log('💰 PaymentIntent totals:', { subtotal, shipping, tax, total })

    // Create PaymentIntent for Express Checkout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to pence/cents
      currency: currency.toLowerCase(),
      
      // Enable automatic payment methods (required for Express Checkout)
      automatic_payment_methods: {
        enabled: true,
      },
      
      // Add metadata for order processing
      metadata: {
        orderType: 'express_checkout',
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        tax: tax.toString(),
        total: total.toString(),
        itemCount: items.length.toString(),
        ...(shippingAddress && {
          customerEmail: shippingAddress.email,
          customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`
        })
      },

      // Shipping information (if provided)
      ...(shippingAddress && {
        shipping: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          phone: shippingAddress.phone,
          address: {
            line1: shippingAddress.address1,
            line2: shippingAddress.address2 || undefined,
            city: shippingAddress.city,
            postal_code: shippingAddress.postcode,
            country: shippingAddress.country.toUpperCase(),
          },
        },
      }),

      // Receipt email (if provided)
      ...(shippingAddress?.email && {
        receipt_email: shippingAddress.email,
      }),
    })

    console.log('✅ PaymentIntent created:', paymentIntent.id)

    // Return client secret for frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: currency.toLowerCase(),
      totals: {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total
      },
      items: productDetails.map(item => ({
        name: item.name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })

  } catch (error) {
    console.error('❌ PaymentIntent API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create PaymentIntent',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Vercel serverless function configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'