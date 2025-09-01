import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📋 Fetching order history for user:', user.email)

    // Get user's orders with order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        customer_notes,
        created_at,
        updated_at,
        order_items (
          id,
          product_variant_id,
          quantity,
          price_at_purchase,
          product_name,
          sku,
          size,
          color
        )
      `)
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch order history' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${orders?.length || 0} orders for user`)

    // Get URL parameters for pagination (if needed in future)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Apply pagination if there are many orders
    const paginatedOrders = orders?.slice(offset, offset + limit) || []

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      total: orders?.length || 0,
      has_more: (orders?.length || 0) > (offset + limit)
    })

  } catch (error) {
    console.error('❌ Order history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'