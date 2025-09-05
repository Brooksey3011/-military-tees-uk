import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import { EmailAutomation } from '@/lib/email-automation'
import { EnhancedShippingCalculator } from '@/lib/enhanced-shipping-calculator'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (endpointSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } else {
      event = JSON.parse(body) as Stripe.Event
      console.warn('⚠️ Webhook signature verification skipped - development mode')
    }
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('🔔 Enhanced webhook: Checkout session completed:', session.id)

        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('🔔 Enhanced webhook: Payment intent succeeded:', paymentIntent.id)

        await handlePaymentSucceeded(paymentIntent, supabase)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('🔔 Enhanced webhook: Payment intent failed:', paymentIntent.id)

        await handlePaymentFailed(paymentIntent, supabase)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('🔔 Enhanced webhook: Checkout session expired:', session.id)

        await handleSessionExpired(session, supabase)
        break
      }

      default:
        console.log(`Unhandled enhanced webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, enhanced: true })

  } catch (error) {
    console.error('❌ Enhanced webhook processing error:', error)
    
    // Log webhook error to database
    await supabase.from('webhook_errors').insert({
      stripe_session_id: 'session_id' in event.data.object ? event.data.object.id : 'unknown',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      resolved: false
    })

    return NextResponse.json(
      { error: 'Enhanced webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const orderNumber = session.metadata?.order_number
  const customerId = session.metadata?.customer_id

  if (!orderNumber) {
    console.error('❌ No order number in session metadata')
    return
  }

  console.log(`📦 Processing checkout completion for order: ${orderNumber}`)

  // Update order status to processing with enhanced fields
  const updateData: any = {
    status: 'paid',
    payment_status: 'paid',
    fulfillment_status: 'processing',
    stripe_checkout_session_id: session.id,
    updated_at: new Date().toISOString()
  }

  // Extract shipping information from session
  if (session.shipping_cost?.shipping_rate) {
    const shippingRate = await stripe.shippingRates.retrieve(session.shipping_cost.shipping_rate as string)
    updateData.shipping_method = shippingRate.display_name
    updateData.shipping_carrier = shippingRate.metadata?.carrier || 'Royal Mail'
    
    // Detect address type
    const shippingAddress = session.shipping_details?.address
    if (shippingAddress) {
      const isBFPO = EnhancedShippingCalculator.isBFPOAddress({
        line1: shippingAddress.line1 || '',
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city || '',
        postcode: shippingAddress.postal_code || '',
        country: shippingAddress.country || ''
      })
      
      updateData.shipping_address_type = isBFPO ? 'bfpo' : 'standard'
      
      // Calculate estimated delivery
      const serviceId = shippingRate.metadata?.service_id
      if (serviceId) {
        const deliveryRange = EnhancedShippingCalculator.getEstimatedDeliveryRange(serviceId)
        updateData.estimated_delivery_date = deliveryRange.max.toISOString().split('T')[0]
      }
    }
  }

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('order_number', orderNumber)
    .select(`
      *,
      order_items(
        quantity,
        price_at_purchase,
        product_name,
        size,
        color,
        product_variant_id
      )
    `)
    .single()

  if (updateError) {
    console.error('❌ Failed to update order:', updateError)
    throw new Error('Failed to update order in database')
  }

  console.log(`✅ Order ${orderNumber} updated with enhanced data`)

  // Process inventory deductions
  await processInventoryDeductions(order, supabase)

  // Send enhanced payment received email
  await sendPaymentReceivedEmail(order, session, supabase)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log(`💳 Payment succeeded: ${paymentIntent.id}`)

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (updateError) {
    console.error('❌ Failed to update payment status:', updateError)
  } else {
    console.log(`✅ Payment status updated for payment intent: ${paymentIntent.id}`)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`)

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'cancelled',
      fulfillment_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (updateError) {
    console.error('❌ Failed to update failed payment status:', updateError)
  }

  // TODO: Restore inventory for failed payments
  // TODO: Send payment failed email notification
}

async function handleSessionExpired(session: Stripe.Checkout.Session, supabase: any) {
  const orderNumber = session.metadata?.order_number

  if (orderNumber) {
    console.log(`⏰ Cancelling expired order: ${orderNumber}`)

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        fulfillment_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('order_number', orderNumber)

    if (updateError) {
      console.error('❌ Failed to cancel expired order:', updateError)
    } else {
      console.log(`✅ Expired order cancelled: ${orderNumber}`)
      
      // TODO: Restore inventory for cancelled order
      // TODO: Send cancellation email if customer provided email
    }
  }
}

async function processInventoryDeductions(order: any, supabase: any) {
  console.log(`📊 Processing inventory deductions for order: ${order.order_number}`)

  try {
    for (const item of order.order_items) {
      // Get current variant data
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('stock_quantity, track_inventory')
        .eq('id', item.product_variant_id)
        .single()

      if (variantError || !variant) {
        console.error(`❌ Could not find variant ${item.product_variant_id}`)
        continue
      }

      if (variant.track_inventory) {
        const previousStock = variant.stock_quantity
        const newStock = Math.max(0, previousStock - item.quantity)

        // Update stock quantity
        const { error: stockError } = await supabase
          .from('product_variants')
          .update({
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_variant_id)

        if (stockError) {
          console.error(`❌ Failed to update stock for variant ${item.product_variant_id}:`, stockError)
        } else {
          console.log(`✅ Stock updated: ${item.product_name} (${previousStock} → ${newStock})`)

          // Log inventory movement
          await supabase.from('inventory_movements').insert({
            product_variant_id: item.product_variant_id,
            movement_type: 'sale',
            quantity_change: -item.quantity,
            previous_quantity: previousStock,
            new_quantity: newStock,
            reference_id: order.order_number,
            reference_type: 'order',
            notes: `Stock deduction for order ${order.order_number}`
          })
        }
      }
    }
  } catch (error) {
    console.error('❌ Inventory processing error:', error)
  }
}

async function sendPaymentReceivedEmail(order: any, session: Stripe.Checkout.Session, supabase: any) {
  try {
    console.log(`📧 Sending payment received email for order: ${order.order_number}`)

    const shippingDetails = session.shipping_details || session.customer_details
    if (!shippingDetails?.email) {
      console.log('⚠️ No email address found in session')
      return
    }

    // Detect BFPO address
    const shippingAddress = shippingDetails.address
    const isBFPO = shippingAddress ? EnhancedShippingCalculator.isBFPOAddress({
      line1: shippingAddress.line1 || '',
      line2: shippingAddress.line2 || '',
      city: shippingAddress.city || '',
      postcode: shippingAddress.postal_code || '',
      country: shippingAddress.country || ''
    }) : false

    // TODO: Send enhanced payment received/processing email
    console.log(`📧 Would send payment received email to: ${shippingDetails.email}`)
    console.log(`🏛️ BFPO address detected: ${isBFPO}`)

  } catch (error) {
    console.error('❌ Email sending error:', error)
  }
}

export const dynamic = 'force-dynamic'