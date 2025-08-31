import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase'
import { ShippingCalculator } from '@/lib/shipping-calculator'

// Enhanced webhook handler with shipping rate tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log(`🎯 Webhook received: ${event.type}`)

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      console.log('✅ Processing completed checkout session:', session.id)
      
      // Get detailed session with line items and shipping
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'shipping_cost', 'customer_details']
      })

      // Extract shipping information
      const shippingCost = fullSession.shipping_cost
      const shippingDetails = fullSession.shipping_details
      const customerDetails = fullSession.customer_details

      console.log('🚚 Shipping information:', {
        shippingCost: shippingCost?.amount_total,
        shippingRate: shippingCost?.shipping_rate,
        shippingAddress: shippingDetails?.address,
        customerCountry: customerDetails?.address?.country
      })

      // Parse shipping rate details if available
      let shippingInfo = null
      if (shippingCost && shippingCost.shipping_rate) {
        const shippingRate = await stripe.shippingRates.retrieve(shippingCost.shipping_rate as string)
        
        shippingInfo = {
          rateId: shippingRate.metadata?.rate_id || 'unknown',
          rateName: shippingRate.display_name,
          amount: shippingCost.amount_total / 100, // Convert from pence
          type: shippingRate.metadata?.rate_type || 'standard',
          estimatedDelivery: ShippingCalculator.getEstimatedDeliveryDate(
            shippingRate.metadata?.rate_id || 'standard',
            customerDetails?.address?.country || 'GB'
          )
        }
      }

      // Process the order in Supabase
      const supabase = createSupabaseAdmin()
      
      try {
        // Create order record with enhanced shipping info
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            customer_email: session.customer_details?.email || session.customer_email,
            status: 'confirmed',
            total_amount: session.amount_total / 100,
            currency: session.currency,
            
            // Enhanced shipping information
            shipping_amount: shippingInfo?.amount || 0,
            shipping_method: shippingInfo?.rateName || 'Standard Shipping',
            shipping_rate_id: shippingInfo?.rateId || 'standard',
            shipping_type: shippingInfo?.type || 'standard',
            estimated_delivery_min: shippingInfo?.estimatedDelivery?.min?.toISOString(),
            estimated_delivery_max: shippingInfo?.estimatedDelivery?.max?.toISOString(),
            
            // Customer details
            customer_name: session.customer_details?.name,
            customer_phone: session.customer_details?.phone,
            
            // Shipping address
            shipping_address: shippingDetails?.address ? {
              line1: shippingDetails.address.line1,
              line2: shippingDetails.address.line2,
              city: shippingDetails.address.city,
              postal_code: shippingDetails.address.postal_code,
              country: shippingDetails.address.country,
              state: shippingDetails.address.state
            } : null,
            
            // Billing address
            billing_address: session.customer_details?.address ? {
              line1: session.customer_details.address.line1,
              line2: session.customer_details.address.line2,
              city: session.customer_details.address.city,
              postal_code: session.customer_details.address.postal_code,
              country: session.customer_details.address.country,
              state: session.customer_details.address.state
            } : null,
            
            metadata: {
              orderRef: session.metadata?.orderRef,
              source: 'enhanced_checkout',
              shippingCalculated: true
            }
          })
          .select()
          .single()

        if (orderError) {
          throw new Error(`Failed to create order: ${orderError.message}`)
        }

        console.log('✅ Order created:', order.id)

        // Process line items
        if (fullSession.line_items?.data) {
          for (const lineItem of fullSession.line_items.data) {
            const price = lineItem.price
            const product = price?.product
            
            // Extract variant ID from product metadata
            const variantId = (product as any)?.metadata?.variant_id
            
            if (variantId) {
              // Create order item
              const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                  order_id: order.id,
                  product_variant_id: variantId,
                  quantity: lineItem.quantity,
                  unit_price: (price?.unit_amount || 0) / 100,
                  total_price: (lineItem.amount_total || 0) / 100,
                  stripe_line_item_id: lineItem.id
                })

              if (itemError) {
                console.error('❌ Failed to create order item:', itemError)
              } else {
                // Update stock levels
                const { error: stockError } = await supabase
                  .rpc('decrement_stock', {
                    variant_id: variantId,
                    quantity: lineItem.quantity
                  })

                if (stockError) {
                  console.error('❌ Failed to update stock:', stockError)
                } else {
                  console.log('✅ Stock updated for variant:', variantId)
                }
              }
            }
          }
        }

        // Send confirmation emails (order confirmation with shipping info)
        console.log('📧 Order processing complete with shipping details')
        
        return NextResponse.json({ 
          received: true,
          orderId: order.id,
          shipping: shippingInfo
        })

      } catch (dbError) {
        console.error('❌ Database error:', dbError)
        
        // Log to webhook_errors table for debugging
        await supabase
          .from('webhook_errors')
          .insert({
            stripe_event_id: event.id,
            event_type: event.type,
            error_message: dbError instanceof Error ? dbError.message : 'Unknown database error',
            session_id: session.id,
            created_at: new Date().toISOString()
          })

        return NextResponse.json({ 
          error: 'Database error',
          eventId: event.id
        }, { status: 500 })
      }
    }

    // Handle other webhook events
    console.log(`ℹ️ Unhandled webhook event: ${event.type}`)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// Vercel configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'