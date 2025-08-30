import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

// This endpoint handles Stripe webhooks to complete orders
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Stripe webhook received')

    // Get the raw body as text for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
      console.log('✅ Webhook signature verified')
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      console.log('🎉 Processing checkout.session.completed event')
      
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Session ID:', session.id)
      console.log('Customer Email:', session.customer_email)
      console.log('Payment Status:', session.payment_status)
      console.log('Metadata:', session.metadata)

      // Only process if payment was successful
      if (session.payment_status === 'paid') {
        await processCompletedOrder(session)
      } else {
        console.log('⚠️ Payment not completed, skipping order processing')
      }
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Process a completed order with atomic database operations
async function processCompletedOrder(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseAdmin()
  
  try {
    console.log('🔄 Starting order completion process...')
    
    // Extract metadata
    const orderNumber = session.metadata?.orderNumber
    const customerEmail = session.metadata?.customerEmail || session.customer_email
    const customerNotes = session.metadata?.customerNotes || ''
    
    if (!orderNumber) {
      throw new Error('Order number missing from session metadata')
    }

    console.log('📋 Processing order:', orderNumber)

    // Get the line items from the session to understand what was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    })

    console.log(`📦 Found ${lineItems.data.length} line items`)

    // Extract product details from line items
    const orderItems = []
    let totalAmount = 0

    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product
      const metadata = product.metadata || {}
      
      const variantId = metadata.variant_id
      const productId = metadata.product_id
      const unitPrice = item.price?.unit_amount ? item.price.unit_amount / 100 : 0
      const quantity = item.quantity || 1
      const totalPrice = unitPrice * quantity

      if (!variantId) {
        console.error('❌ Missing variant_id in product metadata:', metadata)
        continue
      }

      orderItems.push({
        variant_id: variantId,
        product_id: productId,
        quantity: quantity,
        price_at_purchase: unitPrice,
        total_price: totalPrice,
        sku: metadata.sku,
        size: metadata.size,
        color: metadata.color
      })

      totalAmount += totalPrice
    }

    console.log(`💰 Total amount: £${totalAmount}`)

    // Perform atomic database operations
    await supabase.transaction(async (trx) => {
      console.log('🔄 Starting database transaction...')

      // 1. Create the order record
      const { data: order, error: orderError } = await trx
        .from('orders')
        .insert({
          order_number: orderNumber,
          stripe_checkout_session_id: session.id,
          customer_email: customerEmail,
          customer_notes: customerNotes,
          status: 'paid',
          total_amount: totalAmount,
          payment_status: 'completed',
          stripe_payment_intent_id: session.payment_intent as string,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (orderError) {
        console.error('❌ Failed to create order:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      console.log('✅ Order created:', order.id)

      // 2. Create order items and update stock
      for (const item of orderItems) {
        // Create order item
        const { error: orderItemError } = await trx
          .from('order_items')
          .insert({
            order_id: order.id,
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            product_name: `${metadata.size} ${metadata.color}`,
            sku: item.sku
          })

        if (orderItemError) {
          console.error('❌ Failed to create order item:', orderItemError)
          throw new Error(`Failed to create order item: ${orderItemError.message}`)
        }

        // Update stock quantity
        const { error: stockError } = await trx
          .from('product_variants')
          .update({
            stock_quantity: trx.raw('stock_quantity - ?', [item.quantity])
          })
          .eq('id', item.variant_id)

        if (stockError) {
          console.error('❌ Failed to update stock:', stockError)
          throw new Error(`Failed to update stock: ${stockError.message}`)
        }

        console.log(`📦 Stock updated for variant ${item.variant_id}: -${item.quantity}`)
      }

      console.log('✅ All order items created and stock updated')
    })

    // 3. Send order confirmation email
    await sendOrderConfirmationEmail({
      orderNumber,
      customerEmail: customerEmail!,
      orderItems,
      totalAmount,
      sessionId: session.id
    })

    console.log('🎉 Order completion process finished successfully')

  } catch (error) {
    console.error('❌ Order processing failed:', error)
    
    // Log the error for manual review
    await logOrderError(session.id, error instanceof Error ? error.message : 'Unknown error')
    
    throw error
  }
}

// Send order confirmation email
async function sendOrderConfirmationEmail({
  orderNumber,
  customerEmail,
  orderItems,
  totalAmount,
  sessionId
}: {
  orderNumber: string
  customerEmail: string
  orderItems: any[]
  totalAmount: number
  sessionId: string
}) {
  try {
    console.log('📧 Sending order confirmation email to:', customerEmail)

    const { emailService } = await import('@/lib/email-service')
    
    await emailService.sendOrderConfirmation({
      orderNumber,
      customerEmail,
      orderItems,
      totalAmount,
      sessionId
    })

    console.log('✅ Order confirmation email sent successfully')

  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error)
    // Don't throw - email failure shouldn't stop the order process
  }
}

// Log errors for manual review
async function logOrderError(sessionId: string, errorMessage: string) {
  const supabase = createSupabaseAdmin()
  
  try {
    await supabase
      .from('webhook_errors')
      .insert({
        stripe_session_id: sessionId,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('❌ Failed to log error:', error)
  }
}