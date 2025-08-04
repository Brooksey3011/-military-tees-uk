import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!endpointSecret) {
  console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook validation will be skipped.')
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    // Verify the webhook signature if secret is available
    if (endpointSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } else {
      // Parse the event without verification (development mode)
      event = JSON.parse(body) as Stripe.Event
      console.warn('Webhook signature verification skipped - development mode')
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
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

        console.log('Webhook: Checkout session completed:', session.id)

        // Extract order information from metadata
        const orderNumber = session.metadata?.order_number
        const customerId = session.metadata?.customer_id

        if (!orderNumber) {
          console.error('No order number in session metadata')
          break
        }

        // Update order status to processing
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('order_number', orderNumber)

        if (updateError) {
          console.error('Failed to update order status:', updateError)
        } else {
          console.log(`Order ${orderNumber} marked as processing`)
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('Webhook: Payment intent succeeded:', paymentIntent.id)

        // Update order with successful payment
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Failed to update payment status:', updateError)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('Webhook: Payment intent failed:', paymentIntent.id)

        // Update order with failed payment
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Failed to update payment status:', updateError)
        }

        // TODO: Restore inventory for failed payments
        // This would require querying order items and updating stock levels

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('Webhook: Checkout session expired:', session.id)

        const orderNumber = session.metadata?.order_number

        if (orderNumber) {
          // Mark order as cancelled and restore inventory
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('order_number', orderNumber)

          if (updateError) {
            console.error('Failed to cancel expired order:', updateError)
          } else {
            // Restore inventory for cancelled order
            await restoreInventoryForCancelledOrder(orderNumber)
          }
        }

        break
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper function to restore inventory for cancelled orders
async function restoreInventoryForCancelledOrder(orderNumber: string) {
  const supabase = createSupabaseAdmin()

  try {
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        product_variant_id,
        quantity,
        orders!inner (
          order_number
        )
      `)
      .eq('orders.order_number', orderNumber)

    if (itemsError || !orderItems) {
      console.error('Failed to fetch order items for inventory restoration:', itemsError)
      return
    }

    // Restore inventory for each item
    for (const item of orderItems) {
      // Get current stock
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.product_variant_id)
        .single()

      if (variantError || !variant) {
        console.error('Failed to fetch variant for inventory restoration:', variantError)
        continue
      }

      // Update stock quantity
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: variant.stock_quantity + item.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product_variant_id)

      if (updateError) {
        console.error('Failed to restore inventory:', updateError)
      } else {
        // Record inventory movement
        await supabase
          .from('inventory_movements')
          .insert({
            product_variant_id: item.product_variant_id,
            movement_type: 'return',
            quantity_change: item.quantity,
            reference_id: orderNumber,
            notes: `Inventory restored - Order ${orderNumber} cancelled/expired`
          })
      }
    }

    console.log(`Inventory restored for cancelled order: ${orderNumber}`)

  } catch (error) {
    console.error('Error restoring inventory:', error)
  }
}

// GET method for webhook endpoint verification
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'stripe-webhook',
    timestamp: new Date().toISOString()
  })
}