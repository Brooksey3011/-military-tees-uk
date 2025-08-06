import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

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

    const supabase = createSupabaseAdmin()
    
    console.log('Creating order with data:', {
      customerDetails,
      shippingAddress,
      items: items.length,
      total
    })

    // Generate order number
    const orderNumber = `MTU-${Date.now().toString().slice(-6)}`
    
    // Create order with minimal schema (what actually works)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber
      })
      .select()
      .single()

    if (orderError) {
      console.error('Database error creating order:', orderError)
      throw new Error('Failed to create order in database')
    }

    console.log('Order created in database:', order)

    // Log complete order details for manual processing/admin review
    console.log('COMPLETE ORDER DETAILS:', {
      orderId: order.id,
      orderNumber: orderNumber,
      customerDetails,
      shippingAddress,
      billingAddress,
      items,
      totals: { subtotal, shipping, tax, total },
      paymentMethodId,
      createdAt: new Date().toISOString()
    })

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
      orderId: order.id,
      orderNumber: orderNumber,
      message: 'Order created successfully in database'
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