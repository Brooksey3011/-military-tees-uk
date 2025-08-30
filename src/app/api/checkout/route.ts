import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'

// Checkout request schema - using live data validation
const checkoutSchema = z.object({
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
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postcode: z.string().min(1, 'Postcode is required'),
    country: z.string().min(2, 'Country is required')
  }),
  customerNotes: z.string().optional()
})

type CheckoutRequest = z.infer<typeof checkoutSchema>

// Helper functions
function calculateShipping(subtotal: number): number {
  return subtotal >= 50 ? 0 : 4.99
}

function calculateVAT(subtotal: number, shipping: number): number {
  return Math.round((subtotal + shipping) * 0.2 * 100) / 100
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MT${timestamp.slice(-6)}${random}`
}

// Get product details from live Supabase data
async function getProductDetails(items: CheckoutRequest['items']) {
  const supabase = createSupabaseAdmin()
  const productDetails = []

  console.log(`🔍 Looking up ${items.length} product variants from live Supabase data...`)

  for (const item of items) {
    console.log(`📦 Processing live variant: ${item.variantId}`)

    // Get product variant with product details from real database
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        stock_quantity,
        price,
        size,
        color,
        product_id,
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
      console.error(`❌ Live variant ${item.variantId} not found:`, variantError)
      throw new Error(`Product variant not found: ${item.variantId}`)
    }

    console.log(`✅ Found live variant: ${variant.sku}`)

    // Cast products to any to handle the nested relation
    const product = variant.products as any
    if (!product) {
      throw new Error(`Product not found for variant: ${item.variantId}`)
    }

    // Check real stock from database
    if (variant.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (${variant.size} ${variant.color}). Available: ${variant.stock_quantity}, Requested: ${item.quantity}`)
    }

    // Calculate pricing using real product price
    const unitPrice = product.price
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

  console.log(`✅ All ${productDetails.length} live variants validated`)
  return productDetails
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'checkout-api',
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    supabase_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    using_live_data: true
  });
}

// Main checkout processing with live data
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Checkout API called - USING LIVE DATA')

    // Parse and validate request body
    const body = await request.json()
    console.log('📋 Request body received:', {
      itemCount: body.items?.length || 0,
      hasShipping: !!body.shippingAddress,
      hasBilling: !!body.billingAddress
    })

    // Validate request
    const validatedData = checkoutSchema.parse(body)
    console.log('✅ Request validation passed')

    // Get product details from live Supabase database
    const productDetails = await getProductDetails(validatedData.items)
    console.log('✅ Live product details retrieved')

    // Calculate totals with real pricing
    const subtotal = productDetails.reduce((sum, item) => sum + item.totalPrice, 0)
    const shipping = calculateShipping(subtotal)
    const vat = calculateVAT(subtotal, shipping)
    const total = subtotal + shipping + vat

    console.log('💰 Order totals calculated from live data:', { subtotal, shipping, vat, total })

    // Verify Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured')
    }

    // Generate order number
    const orderNumber = generateOrderNumber()
    console.log('🔢 Order number generated:', orderNumber)

    // Create Stripe Checkout Session with live product data
    console.log('🔄 Creating Stripe Checkout Session with live data...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/checkout`,
      customer_email: validatedData.shippingAddress.email,
      metadata: {
        orderNumber,
        customerEmail: validatedData.shippingAddress.email,
        customerNotes: validatedData.customerNotes || '',
        source: 'military_tees_uk_live_data'
      },
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE']
      },
      billing_address_collection: 'required',
      line_items: productDetails.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${item.name} - ${item.size} ${item.color}`,
            description: `SKU: ${item.sku} | Live Data`,
            images: item.imageUrl ? [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}${item.imageUrl}`] : [],
            metadata: {
              sku: item.sku,
              variant_id: item.variantId,
              product_id: item.productId,
              size: item.size,
              color: item.color,
              data_source: 'live_supabase'
            }
          },
          unit_amount: Math.round(item.unitPrice * 100) // Convert to pence
        },
        quantity: item.quantity
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shipping * 100), // Convert to pence
              currency: 'gbp'
            },
            display_name: shipping === 0 ? 'Free UK Shipping (Over £50)' : 'Standard UK Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ],
      tax_id_collection: { enabled: false }, // VAT included in prices
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    })

    console.log('✅ Stripe Checkout Session created with live data:', session.id)

    // Return success response with live data confirmation
    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderNumber,
      totals: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      },
      items: productDetails.map(item => ({
        name: item.name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toFixed(2)),
        totalPrice: parseFloat(item.totalPrice.toFixed(2))
      })),
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        stripeMode: 'test',
        dataSource: 'live_supabase',
        variantsProcessed: productDetails.length
      }
    })

  } catch (error) {
    console.error('❌ Live Checkout API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ')
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Checkout failed',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    )
  }
}