import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import { ShippingCalculator, createStripeShippingOptions } from '@/lib/shipping-calculator'

// Enhanced schema for multi-shipping checkout
const directCheckoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10)
  })).min(1),
  customerEmail: z.string().email().optional(),
  preferredCountry: z.string().length(2).optional() // ISO country code for shipping calculation
})

type DirectCheckoutRequest = z.infer<typeof directCheckoutSchema>

// Fast product lookup for immediate checkout
async function getProductDetails(items: DirectCheckoutRequest['items']) {
  const supabase = createSupabaseAdmin()
  const productDetails = []

  for (const item of items) {
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select(`
        id, sku, stock_quantity, price, size, color,
        products!inner (id, name, price, main_image_url)
      `)
      .eq('id', item.variantId)
      .eq('is_active', true)
      .single()

    if (error || !variant) {
      throw new Error(`Product not available`)
    }

    // Quick stock check
    if (variant.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock`)
    }

    const product = variant.products as any
    const unitPrice = product.price
    
    productDetails.push({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
      imageUrl: product.main_image_url
    })
  }

  return productDetails
}

// Calculate subtotal only (shipping handled by Stripe with multiple options)
function calculateSubtotal(productDetails: any[]) {
  return productDetails.reduce((sum, item) => sum + item.totalPrice, 0)
}

export async function POST(request: NextRequest) {
  try {
    // Parse request with shipping preferences
    const body = await request.json()
    const { items, customerEmail, preferredCountry } = directCheckoutSchema.parse(body)

    // Fast product validation
    const productDetails = await getProductDetails(items)
    const subtotal = calculateSubtotal(productDetails)
    
    // Prepare items for shipping calculation
    const shippingItems = productDetails.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.unitPrice
    }))
    
    // Calculate shipping rates based on customer location (default to UK)
    const countryCode = preferredCountry || 'GB'
    const shippingRates = ShippingCalculator.calculateShippingRates({
      items: shippingItems,
      countryCode,
      subtotal
    })

    // Get app URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3002')

    // Generate unique order reference
    const orderRef = `MT${Date.now().toString().slice(-8)}`

    // Create Stripe Checkout Session - DIRECT REDIRECT
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      
      // Success/Cancel URLs
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      
      // Optional customer email
      ...(customerEmail && { customer_email: customerEmail }),
      
      // Let Stripe collect addresses
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE']
      },
      billing_address_collection: 'required',
      
      // Line items from live product data
      line_items: productDetails.map(item => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${item.name} - ${item.size} ${item.color}`,
            description: `SKU: ${item.sku}`,
            images: item.imageUrl ? [`${baseUrl}${item.imageUrl}`] : [],
            metadata: {
              variant_id: item.variantId,
              sku: item.sku
            }
          },
          unit_amount: Math.round(item.unitPrice * 100) // Convert to pence
        },
        quantity: item.quantity
      })),
      
      // Dynamic shipping options based on location and cart value
      shipping_options: createStripeShippingOptions(shippingRates),
      
      // Metadata for order processing
      metadata: {
        orderRef,
        source: 'direct_checkout',
        itemCount: items.length.toString()
      },
      
      // Allow promo codes
      allow_promotion_codes: true,
      
      // 30 minute expiration
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60)
    })

    // Return checkout URL with shipping information
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderRef,
      shipping: {
        country: countryCode,
        availableRates: shippingRates.map(rate => ({
          id: rate.id,
          name: rate.name,
          amount: rate.amount,
          estimatedDays: rate.estimatedDays
        }))
      }
    })

  } catch (error) {
    console.error('Direct Checkout Error:', error)
    
    // Simple error responses - no sensitive data
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Checkout failed' 
    }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'direct-checkout'
  })
}

// Vercel optimizations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'