import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email/email-service'
import { validateRequestBody, checkoutSchema } from '@/lib/validation'

type CheckoutRequest = z.infer<typeof checkoutSchema>

// Helper function to calculate shipping cost
function calculateShipping(subtotal: number): number {
  return subtotal >= 50 ? 0 : 4.99
}

// Helper function to calculate VAT (20% for UK)
function calculateVAT(subtotal: number, shipping: number): number {
  return (subtotal + shipping) * 0.2
}

// Helper function to generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MT${timestamp.slice(-6)}${random}`
}

// Helper function to authenticate user
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required')
  }

  const token = authHeader.substring(7)
  const supabase = createSupabaseAdmin()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      throw new Error('Invalid authentication token')
    }
    return user
  } catch (error) {
    console.error('Authentication error:', error)
    throw new Error('Authentication failed')
  }
}

// Helper function to get or create customer
async function getOrCreateCustomer(userId: string | null, email: string, firstName: string, lastName: string) {
  const supabase = createSupabaseAdmin()
  
  if (userId) {
    // For authenticated users, check if customer exists
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingCustomer) {
      return existingCustomer.id
    }
  } else {
    // For guest users, check if customer exists by email
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .is('user_id', null)
      .single()

    if (existingCustomer) {
      return existingCustomer.id
    }
  }

  // Create new customer (authenticated or guest)
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert({
      user_id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      marketing_consent: false
    })
    .select('id')
    .single()

  if (createError) {
    console.error('Customer creation error:', createError)
    throw new Error('Failed to create customer record')
  }

  return newCustomer.id
}

// Helper function to validate inventory and get product details
async function validateInventoryAndGetProducts(items: CheckoutRequest['items']) {
  const supabase = createSupabaseAdmin()
  const productDetails = []

  for (const item of items) {
    // Get product variant with product details
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        stock_quantity,
        price_adjustment,
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

    // Type assertion for the nested products relation
    const product = variant.products as any
    if (!product) {
      throw new Error(`Product not found for variant: ${item.variantId}`)
    }

    if (variant.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`)
    }

    const unitPrice = product.price + (variant.price_adjustment || 0)
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

// Helper function to create order in database
async function createOrderInDatabase(
  customerId: string,
  orderNumber: string,
  productDetails: any[],
  shippingAddress: CheckoutRequest['shippingAddress'],
  billingAddress: CheckoutRequest['billingAddress'],
  customerNotes: string | undefined,
  subtotal: number,
  shipping: number,
  tax: number,
  total: number,
  stripePaymentIntentId: string
) {
  const supabase = createSupabaseAdmin()

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      status: 'pending',
      subtotal,
      shipping_cost: shipping,
      tax_amount: tax,
      discount_amount: 0,
      total,
      shipping_address: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address_line_1: shippingAddress.address1,
        address_line_2: shippingAddress.address2 || null,
        city: shippingAddress.city,
        postcode: shippingAddress.postcode,
        country: shippingAddress.country
      },
      billing_address: {
        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        address_line_1: billingAddress.address1,
        address_line_2: billingAddress.address2 || null,
        city: billingAddress.city,
        postcode: billingAddress.postcode,
        country: billingAddress.country
      },
      payment_status: 'pending',
      payment_method: 'stripe',
      stripe_payment_intent_id: stripePaymentIntentId,
      customer_notes: customerNotes || null
    })
    .select('id')
    .single()

  if (orderError) {
    console.error('Order creation error:', orderError)
    throw new Error('Failed to create order')
  }

  // Create order items
  const orderItems = productDetails.map(product => ({
    order_id: order.id,
    product_variant_id: product.variantId,
    product_snapshot: {
      name: product.name,
      sku: product.sku,
      size: product.size,
      color: product.color,
      image_url: product.imageUrl
    },
    quantity: product.quantity,
    unit_price: product.unitPrice,
    total_price: product.totalPrice
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Order items creation error:', itemsError)
    throw new Error('Failed to create order items')
  }

  // Update inventory
  for (const product of productDetails) {
    const { error: inventoryError } = await supabase
      .from('product_variants')
      .update({
        stock_quantity: product.stockQuantity - product.quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.variantId)

    if (inventoryError) {
      console.error('Inventory update error:', inventoryError)
      // Note: In production, you might want to implement compensation logic here
    }

    // Record inventory movement
    await supabase
      .from('inventory_movements')
      .insert({
        product_variant_id: product.variantId,
        movement_type: 'sale',
        quantity_change: -product.quantity,
        reference_id: order.id,
        notes: `Sale - Order ${orderNumber}`
      })
  }

  return order.id
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    console.log('Checkout API: Processing request')

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequestBody(checkoutSchema, body)
    
    if (!validation.success) {
      console.error('Validation error details:', validation.error)
      console.error('Request body:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: `Validation failed: ${validation.error}` },
        { status: 400 }
      )
    }

    const { items, shippingAddress, billingAddress, customerNotes } = validation.data

    // Try to authenticate user (optional for guest checkout)
    let user = null
    let isGuest = false
    try {
      user = await authenticateUser(request)
      console.log('Checkout API: User authenticated:', user.id)
    } catch (error) {
      console.log('Checkout API: Guest checkout detected')
      isGuest = true
    }

    // Validate inventory and get product details
    const productDetails = await validateInventoryAndGetProducts(items)
    console.log('Checkout API: Products validated:', productDetails.length)

    // Calculate totals
    const subtotal = productDetails.reduce((sum, product) => sum + product.totalPrice, 0)
    const shipping = calculateShipping(subtotal)
    const tax = calculateVAT(subtotal, shipping)
    const total = subtotal + shipping + tax

    console.log('Checkout API: Calculated totals:', { subtotal, shipping, tax, total })

    // Get or create customer (handle guest checkout)
    const customerId = await getOrCreateCustomer(
      user?.id || null,
      shippingAddress.email,
      shippingAddress.firstName,
      shippingAddress.lastName
    )

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: shippingAddress.email,
      
      line_items: productDetails.map(product => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
            description: `${product.size ? `Size: ${product.size}` : ''}${product.size && product.color ? ', ' : ''}${product.color ? `Color: ${product.color}` : ''}`.trim(),
            images: product.imageUrl ? [product.imageUrl] : undefined,
            metadata: {
              sku: product.sku,
              variant_id: product.variantId
            }
          },
          unit_amount: Math.round(product.unitPrice * 100), // Convert to pence
        },
        quantity: product.quantity,
      })),

      // Add shipping as a separate line item if applicable
      ...(shipping > 0 ? {
        line_items: [
          ...productDetails.map(product => ({
            price_data: {
              currency: 'gbp',
              product_data: {
                name: product.name,
                description: `${product.size ? `Size: ${product.size}` : ''}${product.size && product.color ? ', ' : ''}${product.color ? `Color: ${product.color}` : ''}`.trim(),
                images: product.imageUrl ? [product.imageUrl] : undefined,
                metadata: {
                  sku: product.sku,
                  variant_id: product.variantId
                }
              },
              unit_amount: Math.round(product.unitPrice * 100),
            },
            quantity: product.quantity,
          })),
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: 'Shipping',
                description: 'Standard UK delivery'
              },
              unit_amount: Math.round(shipping * 100),
            },
            quantity: 1,
          }
        ]
      } : {}),

      // Apply VAT
      automatic_tax: {
        enabled: false, // We're calculating manually
      },

      shipping_address_collection: {
        allowed_countries: ['GB'],
      },

      billing_address_collection: 'required',

      metadata: {
        order_number: orderNumber,
        customer_id: customerId,
        user_id: user?.id || 'guest',
        subtotal: subtotal.toString(),
        shipping_cost: shipping.toString(),
        tax_amount: tax.toString(),
        total: total.toString(),
        customer_notes: customerNotes || '',
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://militarytees.co.uk'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://militarytees.co.uk'}/checkout?cancelled=true`,

      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    })

    console.log('Checkout API: Stripe session created:', session.id)

    // Create order in database with pending status
    const orderId = await createOrderInDatabase(
      customerId,
      orderNumber,
      productDetails,
      shippingAddress,
      billingAddress,
      customerNotes,
      subtotal,
      shipping,
      tax,
      total,
      session.payment_intent as string
    )

    console.log('Checkout API: Order created in database:', orderId)

    // Send confirmation emails (async - don't wait for completion)
    const emailData = {
      orderNumber,
      customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      customerEmail: shippingAddress.email,
      orderDate: new Date().toLocaleDateString('en-GB'),
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address_line_1: shippingAddress.address1,
        address_line_2: shippingAddress.address2,
        city: shippingAddress.city,
        postcode: shippingAddress.postcode,
        country: shippingAddress.country
      },
      items: productDetails.map(product => ({
        name: product.name,
        variant: `${product.size ? `Size: ${product.size}` : ''}${product.size && product.color ? ', ' : ''}${product.color ? `Color: ${product.color}` : ''}`.trim() || 'Standard',
        quantity: product.quantity,
        price: product.unitPrice,
        total: product.totalPrice,
        image: product.imageUrl
      }))
    }

    // Send emails asynchronously
    Promise.all([
      sendOrderConfirmation(emailData),
      sendOrderNotificationToAdmin(emailData)
    ]).catch(error => {
      console.error('Email sending failed:', error)
    })

    // Return Stripe session details
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderNumber,
      message: 'Checkout session created successfully'
    })

  } catch (error) {
    console.error('Checkout API error:', error)
    
    // Return appropriate error responses
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in.' },
          { status: 401 }
        )
      }
      
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

    // Generic server error
    return NextResponse.json(
      { error: 'An unexpected error occurred during checkout. Please try again.' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'checkout-api',
    timestamp: new Date().toISOString()
  })
}