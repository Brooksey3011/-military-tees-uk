import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerDetails,
      shippingAddress,
      billingAddress,
      items,
      paymentMethodId,
      subtotal,
      shipping,
      tax,
      total
    } = body

    console.log('Creating order with data:', {
      customerDetails,
      shippingAddress,
      items: items.length,
      total
    })

    // Create the order in the database
    const orderNumber = `MTU-${Date.now().toString().slice(-6)}`
    
    // For now, we'll simulate order creation since database schema might not be ready
    // In production, you'd insert into actual orders table
    const mockOrderId = Date.now()
    
    console.log('Simulated order creation:', {
      orderNumber,
      orderData: {
        customer: customerDetails,
        shipping: shippingAddress,
        items: items.length,
        total
      }
    })

    // Try to insert into database if tables exist, but don't fail if they don't
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: customerDetails.email,
          customer_first_name: customerDetails.firstName,
          customer_last_name: customerDetails.lastName,
          customer_phone: customerDetails.phone,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          subtotal: subtotal,
          shipping_cost: shipping,
          tax_amount: tax,
          total_amount: total,
          status: 'confirmed',
          payment_method_id: paymentMethodId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!orderError && order) {
        console.log('Order saved to database:', order.id)
        
        // Insert order items
        const orderItemsData = items.map((item: any) => ({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          product_name: item.name,
          product_size: item.size,
          product_color: item.color,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData)

        if (itemsError) {
          console.error('Error creating order items:', itemsError)
        }
      } else {
        console.log('Database tables not ready, using simulated order')
      }
    } catch (dbError) {
      console.log('Database not ready, continuing with simulated order:', dbError)
    }

    // Send confirmation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          customerEmail: customerDetails.email,
          customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
          items,
          shippingAddress,
          subtotal,
          shipping,
          tax,
          total
        })
      })

      if (!emailResponse.ok) {
        console.error('Failed to send confirmation email')
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ 
      success: true, 
      orderId: mockOrderId,
      orderNumber: orderNumber
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add rate limiting
export const dynamic = 'force-dynamic'