import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'
import {
  trackPaymentEvent,
  trackError,
  trackCheckoutEvent,
  monitorApiEndpoint,
  BusinessErrorType,
  ErrorSeverity
} from '@/lib/monitoring-enhanced'

// This endpoint handles Stripe webhooks to complete orders
export async function POST(request: NextRequest) {
  return monitorApiEndpoint('stripe-webhook', async () => {
  try {
    console.log('🔔 Stripe webhook received')

    // Validate required environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      )
    }

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

    // Verify the webhook signature with proper error handling
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
      console.log('✅ Webhook signature verified')
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error)
      // Log security incident - invalid signature could indicate attack
      await logSecurityIncident('invalid_webhook_signature', {
        timestamp: new Date().toISOString(),
        signature_provided: !!signature,
        error_message: error instanceof Error ? error.message : 'Unknown signature error'
      })
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
        // Track successful payment
        trackPaymentEvent('succeeded', {
          orderId: session.metadata?.orderNumber || 'unknown',
          amount: (session.amount_total || 0) / 100, // Convert from cents
          currency: session.currency || 'gbp',
          stripeSessionId: session.id,
          customerId: session.customer_details?.email || 'unknown'
        })

        await processCompletedOrder(session)

        // Track completed order
        trackCheckoutEvent('completed', {
          orderId: session.metadata?.orderNumber,
          cartValue: (session.amount_total || 0) / 100,
          itemCount: parseInt(session.metadata?.itemCount || '1'),
          userId: session.customer_details?.email
        })
      } else {
        console.log('⚠️ Payment not completed, skipping order processing')

        // Track payment failure
        trackPaymentEvent('failed', {
          orderId: session.metadata?.orderNumber || 'unknown',
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'gbp',
          stripeSessionId: session.id,
          error: `Payment status: ${session.payment_status}`
        })
      }
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)

    // Track webhook processing failure
    trackError(error instanceof Error ? error.message : 'Webhook processing failed', {
      type: BusinessErrorType.PAYMENT_ERROR,
      severity: ErrorSeverity.CRITICAL,
      path: '/api/stripe-webhook'
    }, request)

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
  })
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
    // TODO: Implement proper transaction handling
    // await supabase.transaction(async (trx) => {
    try {
      console.log('🔄 Starting database transaction...')

      // 1. Create the order record
      const { data: order, error: orderError } = await supabase
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
        const { error: orderItemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_variant_id: item.variant_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            product_name: item.product_name || 'Product',
            sku: item.sku
          })

        if (orderItemError) {
          console.error('❌ Failed to create order item:', orderItemError)
          throw new Error(`Failed to create order item: ${orderItemError.message}`)
        }

        // Update stock quantity (secure approach - no raw SQL)
        const { data: currentVariant, error: fetchError } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (fetchError || !currentVariant) {
          throw new Error(`Failed to fetch current stock for variant ${item.variant_id}`)
        }

        const newStockQuantity = Math.max(0, currentVariant.stock_quantity - item.quantity)
        
        const { error: stockError } = await supabase
          .from('product_variants')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', item.variant_id)

        if (stockError) {
          console.error('❌ Failed to update stock:', stockError)
          throw new Error(`Failed to update stock: ${stockError.message}`)
        }

        console.log(`📦 Stock updated for variant ${item.variant_id}: -${item.quantity}`)
      }

      console.log('✅ All order items created and stock updated')
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError)
      throw dbError
    }

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

// Send professional order confirmation email with full order details
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
    console.log('📧 Sending professional order confirmation email to:', customerEmail)

    // Get expanded session with shipping details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['shipping_cost', 'total_details']
    })

    // Extract customer name from shipping or metadata
    const customerName = (session as any).shipping?.name || 
                        (session as any).customer_details?.name || 
                        (session as any).metadata?.customerName ||
                        customerEmail.split('@')[0]

    // Calculate breakdown
    const subtotal = totalAmount
    const shippingCost = session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0
    const taxAmount = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0
    const orderTotal = subtotal + shippingCost + taxAmount

    // Format shipping address
    const shippingAddress = (session as any).shipping ? {
      name: (session as any).shipping.name,
      address_line_1: (session as any).shipping.address?.line1 || '',
      address_line_2: (session as any).shipping.address?.line2 || undefined,
      city: (session as any).shipping.address?.city || '',
      postcode: (session as any).shipping.address?.postal_code || '',
      country: (session as any).shipping.address?.country || 'United Kingdom'
    } : {
      name: customerName,
      address_line_1: 'Address details pending',
      city: '',
      postcode: '',
      country: 'United Kingdom'
    }

    // Format order items for professional template
    const formattedItems = orderItems.map(item => ({
      name: item.product_name || 'Military Tees UK Product',
      variant: `${item.size || ''} ${item.color || ''}`.trim() || item.sku || 'Standard',
      quantity: item.quantity,
      price: item.price_at_purchase,
      total: item.total_price
    }))

    // Use professional email service
    const { professionalEmailService } = await import('@/lib/email-service-professional')
    
    const orderData = {
      orderNumber,
      customerName,
      customerEmail,
      orderDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      subtotal,
      shipping: shippingCost,
      tax: taxAmount,
      total: orderTotal,
      shippingAddress,
      items: formattedItems
    }

    // Send customer confirmation
    await professionalEmailService.sendOrderConfirmation(orderData)
    
    // Send admin notification
    await professionalEmailService.sendOrderNotificationToAdmin(orderData)

    console.log('✅ Professional order confirmation emails sent successfully')

  } catch (error) {
    console.error('❌ Failed to send professional confirmation email:', error)
    // Don't throw - email failure shouldn't stop the order process
    
    // Fallback to basic email if professional service fails
    try {
      console.log('📧 Attempting fallback email...')
      const { emailService } = await import('@/lib/email-service')
      await emailService.sendOrderConfirmation({
        orderNumber,
        customerEmail,
        orderItems,
        totalAmount,
        sessionId
      })
      console.log('✅ Fallback email sent successfully')
    } catch (fallbackError) {
      console.error('❌ Fallback email also failed:', fallbackError)
    }
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

// Log security incidents for monitoring and alerting
async function logSecurityIncident(type: string, details: Record<string, any>) {
  const supabase = createSupabaseAdmin()
  
  try {
    await supabase
      .from('security_logs')
      .insert({
        incident_type: type,
        details: details,
        severity: 'high',
        source: 'stripe-webhook',
        created_at: new Date().toISOString()
      })
    
    console.warn('🚨 Security incident logged:', type, details)
  } catch (error) {
    console.error('❌ Failed to log security incident:', error)
    // In production, you might want to send alerts to external monitoring
  }
}