import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = createSupabaseAdmin()

    // Get query parameters
    const variantId = searchParams.get('variant_id')
    const movementType = searchParams.get('movement_type')
    const referenceId = searchParams.get('reference_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    console.log('📊 Fetching inventory movements...')

    // Build query
    let query = supabase
      .from('inventory_movements')
      .select(`
        id,
        product_variant_id,
        movement_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reference_id,
        reference_type,
        notes,
        created_at,
        created_by,
        product_variants!inner (
          id,
          sku,
          size,
          color,
          products!inner (
            id,
            name,
            slug,
            main_image_url
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (variantId) {
      query = query.eq('product_variant_id', variantId)
    }

    if (movementType) {
      query = query.eq('movement_type', movementType)
    }

    if (referenceId) {
      query = query.eq('reference_id', referenceId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: movements, error, count } = await query

    if (error) {
      console.error('❌ Inventory movements fetch error:', error)
      throw error
    }

    // Get summary statistics
    const { data: summaryData } = await supabase
      .rpc('get_inventory_summary', {
        variant_id_filter: variantId,
        start_date_filter: startDate,
        end_date_filter: endDate
      })
      .single()

    console.log(`✅ Fetched ${movements?.length || 0} inventory movements`)

    return NextResponse.json({
      success: true,
      movements: movements || [],
      total: count || 0,
      summary: summaryData || {
        total_movements: count || 0,
        total_stock_in: 0,
        total_stock_out: 0,
        net_change: 0
      },
      filters: {
        variant_id: variantId,
        movement_type: movementType,
        reference_id: referenceId,
        start_date: startDate,
        end_date: endDate,
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('❌ Inventory movements GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch inventory movements',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      product_variant_id,
      movement_type,
      quantity_change,
      reference_id,
      reference_type,
      notes
    } = body

    const supabase = createSupabaseAdmin()

    console.log(`📊 Creating manual inventory movement: ${movement_type} ${quantity_change} for variant ${product_variant_id}`)

    // Validate input
    if (!product_variant_id || !movement_type || quantity_change === undefined) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['product_variant_id', 'movement_type', 'quantity_change']
      }, { status: 400 })
    }

    // Get current variant stock
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('stock_quantity, products(name)')
      .eq('id', product_variant_id)
      .single()

    if (variantError || !variant) {
      return NextResponse.json({
        error: 'Variant not found',
        variant_id: product_variant_id
      }, { status: 404 })
    }

    const previousStock = variant.stock_quantity
    const newStock = Math.max(0, previousStock + quantity_change)

    // Update variant stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', product_variant_id)

    if (updateError) {
      console.error('❌ Failed to update variant stock:', updateError)
      return NextResponse.json({
        error: 'Failed to update stock',
        details: updateError.message
      }, { status: 500 })
    }

    // Create inventory movement record
    const { data: movement, error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_variant_id,
        movement_type,
        quantity_change,
        previous_quantity: previousStock,
        new_quantity: newStock,
        reference_id,
        reference_type: reference_type || 'manual',
        notes: notes || `Manual ${movement_type} adjustment`
      })
      .select(`
        id,
        created_at,
        product_variants (
          products (
            name
          )
        )
      `)
      .single()

    if (movementError) {
      console.error('❌ Failed to create inventory movement:', movementError)
      return NextResponse.json({
        error: 'Failed to log inventory movement',
        details: movementError.message
      }, { status: 500 })
    }

    console.log(`✅ Inventory movement created: ${variant.products.name} (${previousStock} → ${newStock})`)

    return NextResponse.json({
      success: true,
      message: 'Inventory movement recorded',
      movement_id: movement.id,
      variant_id: product_variant_id,
      product_name: variant.products.name,
      previous_stock: previousStock,
      new_stock: newStock,
      quantity_change,
      created_at: movement.created_at
    })

  } catch (error) {
    console.error('❌ Inventory movement POST error:', error)
    return NextResponse.json({
      error: 'Failed to create inventory movement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'