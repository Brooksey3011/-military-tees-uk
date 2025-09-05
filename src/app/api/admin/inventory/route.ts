import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

// Schema for inventory adjustment
const inventoryAdjustmentSchema = z.object({
  product_variant_id: z.string().uuid(),
  adjustment_type: z.enum(['adjustment', 'restock', 'damaged', 'lost']),
  quantity_change: z.number().int(), // positive for increase, negative for decrease
  notes: z.string().optional(),
  reason: z.string().min(1)
})

// Schema for stock level update
const stockUpdateSchema = z.object({
  product_variant_id: z.string().uuid(),
  new_stock_quantity: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).optional(),
  track_inventory: z.boolean().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = createSupabaseAdmin()

    // Get query parameters
    const lowStockOnly = searchParams.get('low_stock') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('📊 Fetching inventory data...')

    // Base query for inventory
    let query = supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        sku,
        size,
        color,
        stock_quantity,
        low_stock_threshold,
        track_inventory,
        weight_grams,
        created_at,
        updated_at,
        products!inner (
          id,
          name,
          slug,
          main_image_url
        )
      `)
      .eq('track_inventory', true)
      .order('stock_quantity', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter for low stock only
    if (lowStockOnly) {
      // This requires a custom filter - we need stock_quantity <= low_stock_threshold
      const { data: allVariants, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          sku,
          size,
          color,
          stock_quantity,
          low_stock_threshold,
          track_inventory,
          weight_grams,
          created_at,
          updated_at,
          products!inner (
            id,
            name,
            slug,
            main_image_url
          )
        `)
        .eq('track_inventory', true)
        .order('stock_quantity', { ascending: true })

      if (error) {
        throw error
      }

      // Filter in JavaScript for low stock items
      const lowStockVariants = allVariants?.filter(variant => 
        variant.stock_quantity <= (variant.low_stock_threshold || 5)
      ).slice(offset, offset + limit) || []

      return NextResponse.json({
        success: true,
        variants: lowStockVariants,
        total: lowStockVariants.length,
        low_stock_count: lowStockVariants.length,
        filters: { low_stock_only: lowStockOnly, limit, offset }
      })
    }

    // Execute query
    const { data: variants, error, count } = await query

    if (error) {
      console.error('❌ Inventory fetch error:', error)
      throw error
    }

    // Calculate low stock count
    const lowStockCount = variants?.filter(variant => 
      variant.stock_quantity <= (variant.low_stock_threshold || 5)
    ).length || 0

    console.log(`✅ Fetched ${variants?.length || 0} inventory items (${lowStockCount} low stock)`)

    return NextResponse.json({
      success: true,
      variants: variants || [],
      total: count || 0,
      low_stock_count: lowStockCount,
      filters: { low_stock_only: lowStockOnly, limit, offset }
    })

  } catch (error) {
    console.error('❌ Inventory GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    const supabase = createSupabaseAdmin()

    console.log(`📊 Processing inventory action: ${action}`)

    switch (action) {
      case 'adjust_stock':
        return await handleStockAdjustment(data, supabase)
      
      case 'update_stock':
        return await handleStockUpdate(data, supabase)
      
      case 'bulk_update':
        return await handleBulkUpdate(data, supabase)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          valid_actions: ['adjust_stock', 'update_stock', 'bulk_update']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Inventory POST error:', error)
    return NextResponse.json({
      error: 'Inventory operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleStockAdjustment(data: any, supabase: any) {
  const validatedData = inventoryAdjustmentSchema.parse(data)
  
  console.log(`📦 Processing stock adjustment: ${validatedData.quantity_change} units for variant ${validatedData.product_variant_id}`)

  // Get current variant data
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('stock_quantity, products(name)')
    .eq('id', validatedData.product_variant_id)
    .single()

  if (variantError || !variant) {
    throw new Error('Variant not found')
  }

  const previousStock = variant.stock_quantity
  const newStock = Math.max(0, previousStock + validatedData.quantity_change)

  // Update stock quantity
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({
      stock_quantity: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', validatedData.product_variant_id)

  if (updateError) {
    throw new Error(`Failed to update stock: ${updateError.message}`)
  }

  // Log inventory movement
  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert({
      product_variant_id: validatedData.product_variant_id,
      movement_type: validatedData.adjustment_type,
      quantity_change: validatedData.quantity_change,
      previous_quantity: previousStock,
      new_quantity: newStock,
      reference_type: 'adjustment',
      notes: validatedData.notes || `${validatedData.adjustment_type}: ${validatedData.reason}`
    })

  if (movementError) {
    console.error('⚠️ Failed to log inventory movement:', movementError)
    // Don't fail the main operation for logging failures
  }

  console.log(`✅ Stock adjusted: ${variant.products.name} (${previousStock} → ${newStock})`)

  return NextResponse.json({
    success: true,
    message: 'Stock adjusted successfully',
    variant_id: validatedData.product_variant_id,
    previous_stock: previousStock,
    new_stock: newStock,
    change: validatedData.quantity_change,
    product_name: variant.products.name
  })
}

async function handleStockUpdate(data: any, supabase: any) {
  const validatedData = stockUpdateSchema.parse(data)
  
  console.log(`📦 Updating stock to ${validatedData.new_stock_quantity} for variant ${validatedData.product_variant_id}`)

  // Get current variant data
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('stock_quantity, products(name)')
    .eq('id', validatedData.product_variant_id)
    .single()

  if (variantError || !variant) {
    throw new Error('Variant not found')
  }

  const previousStock = variant.stock_quantity
  const quantityChange = validatedData.new_stock_quantity - previousStock

  // Build update data
  const updateData: any = {
    stock_quantity: validatedData.new_stock_quantity,
    updated_at: new Date().toISOString()
  }

  if (validatedData.low_stock_threshold !== undefined) {
    updateData.low_stock_threshold = validatedData.low_stock_threshold
  }

  if (validatedData.track_inventory !== undefined) {
    updateData.track_inventory = validatedData.track_inventory
  }

  // Update variant
  const { error: updateError } = await supabase
    .from('product_variants')
    .update(updateData)
    .eq('id', validatedData.product_variant_id)

  if (updateError) {
    throw new Error(`Failed to update variant: ${updateError.message}`)
  }

  // Log inventory movement if quantity changed
  if (quantityChange !== 0) {
    await supabase
      .from('inventory_movements')
      .insert({
        product_variant_id: validatedData.product_variant_id,
        movement_type: 'adjustment',
        quantity_change: quantityChange,
        previous_quantity: previousStock,
        new_quantity: validatedData.new_stock_quantity,
        reference_type: 'adjustment',
        notes: validatedData.notes || `Stock level updated (${previousStock} → ${validatedData.new_stock_quantity})`
      })
  }

  console.log(`✅ Stock updated: ${variant.products.name} (${previousStock} → ${validatedData.new_stock_quantity})`)

  return NextResponse.json({
    success: true,
    message: 'Stock updated successfully',
    variant_id: validatedData.product_variant_id,
    previous_stock: previousStock,
    new_stock: validatedData.new_stock_quantity,
    updates_applied: Object.keys(updateData).filter(key => key !== 'updated_at'),
    product_name: variant.products.name
  })
}

async function handleBulkUpdate(data: any, supabase: any) {
  const { updates } = data
  
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('Updates array is required and must not be empty')
  }

  console.log(`📦 Processing bulk update for ${updates.length} variants`)

  const results = []
  const errors = []

  for (const update of updates) {
    try {
      if (update.action === 'adjust_stock') {
        const result = await handleStockAdjustment(update, supabase)
        results.push({ variant_id: update.product_variant_id, success: true, result: await result.json() })
      } else if (update.action === 'update_stock') {
        const result = await handleStockUpdate(update, supabase)
        results.push({ variant_id: update.product_variant_id, success: true, result: await result.json() })
      } else {
        errors.push({ variant_id: update.product_variant_id, error: 'Invalid action' })
      }
    } catch (error) {
      errors.push({ 
        variant_id: update.product_variant_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  console.log(`✅ Bulk update completed: ${results.length} successful, ${errors.length} errors`)

  return NextResponse.json({
    success: true,
    message: 'Bulk update completed',
    successful_updates: results.length,
    failed_updates: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined
  })
}

export const dynamic = 'force-dynamic'