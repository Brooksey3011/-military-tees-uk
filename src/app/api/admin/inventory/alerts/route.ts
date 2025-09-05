import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { EmailAutomation } from '@/lib/email-automation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = createSupabaseAdmin()

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const critical_only = searchParams.get('critical') === 'true'

    console.log('🚨 Fetching low stock alerts...')

    // Get all variants with stock tracking
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        sku,
        size,
        color,
        stock_quantity,
        low_stock_threshold,
        weight_grams,
        created_at,
        updated_at,
        products!inner (
          id,
          name,
          slug,
          main_image_url,
          price,
          is_active
        )
      `)
      .eq('track_inventory', true)
      .eq('products.is_active', true)
      .order('stock_quantity', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('❌ Low stock alerts fetch error:', error)
      throw error
    }

    // Process variants to determine alert levels
    const alerts = variants
      ?.map(variant => {
        const threshold = variant.low_stock_threshold || 5
        const stockLevel = variant.stock_quantity
        
        let alertLevel: 'critical' | 'warning' | 'normal' = 'normal'
        let alertMessage = ''

        if (stockLevel === 0) {
          alertLevel = 'critical'
          alertMessage = 'Out of stock'
        } else if (stockLevel <= Math.floor(threshold * 0.5)) {
          alertLevel = 'critical'
          alertMessage = `Critical: Only ${stockLevel} left`
        } else if (stockLevel <= threshold) {
          alertLevel = 'warning'
          alertMessage = `Low stock: ${stockLevel} remaining`
        } else {
          return null // Normal stock level
        }

        return {
          variant_id: variant.id,
          product_id: variant.products.id,
          product_name: variant.products.name,
          product_slug: variant.products.slug,
          product_image: variant.products.main_image_url,
          product_price: variant.products.price,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          current_stock: stockLevel,
          low_stock_threshold: threshold,
          alert_level: alertLevel,
          alert_message: alertMessage,
          days_of_stock: stockLevel > 0 ? Math.ceil(stockLevel / 2) : 0, // Assuming 2 sales per day average
          last_updated: variant.updated_at
        }
      })
      .filter(Boolean) // Remove null values

    // Filter for critical only if requested
    const filteredAlerts = critical_only 
      ? alerts?.filter(alert => alert?.alert_level === 'critical') || []
      : alerts || []

    // Calculate summary stats
    const summary = {
      total_alerts: filteredAlerts.length,
      critical_alerts: alerts?.filter(alert => alert?.alert_level === 'critical').length || 0,
      warning_alerts: alerts?.filter(alert => alert?.alert_level === 'warning').length || 0,
      out_of_stock: alerts?.filter(alert => alert?.current_stock === 0).length || 0
    }

    console.log(`✅ Found ${summary.total_alerts} stock alerts (${summary.critical_alerts} critical)`)

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      summary,
      filters: {
        critical_only,
        limit
      }
    })

  } catch (error) {
    console.error('❌ Stock alerts GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch stock alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    const supabase = createSupabaseAdmin()

    console.log(`🚨 Processing stock alert action: ${action}`)

    switch (action) {
      case 'send_alert_email':
        return await sendLowStockAlertEmail(supabase)
      
      case 'mark_acknowledged':
        return await markAlertAcknowledged(body, supabase)
      
      case 'auto_reorder':
        return await processAutoReorder(body, supabase)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          valid_actions: ['send_alert_email', 'mark_acknowledged', 'auto_reorder']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Stock alerts POST error:', error)
    return NextResponse.json({
      error: 'Stock alert operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function sendLowStockAlertEmail(supabase: any) {
  console.log('📧 Preparing low stock alert email...')

  // Get critical stock alerts
  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      id,
      sku,
      size,
      color,
      stock_quantity,
      low_stock_threshold,
      products!inner (
        id,
        name,
        slug,
        main_image_url,
        price
      )
    `)
    .eq('track_inventory', true)
    .eq('products.is_active', true)

  if (!variants) {
    return NextResponse.json({ error: 'No variants found' }, { status: 404 })
  }

  // Filter for low stock items
  const lowStockItems = variants.filter(variant => {
    const threshold = variant.low_stock_threshold || 5
    return variant.stock_quantity <= threshold
  })

  const criticalItems = lowStockItems.filter(variant => variant.stock_quantity === 0)

  if (lowStockItems.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No low stock items found - no email sent',
      low_stock_count: 0
    })
  }

  // Prepare email data
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@militarytees.co.uk'
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Low Stock Alert - Military Tees UK</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert-critical { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; }
        .alert-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item-info { flex: 1; }
        .stock-level { font-weight: bold; padding: 5px 10px; border-radius: 4px; color: white; }
        .stock-critical { background: #dc2626; }
        .stock-warning { background: #f59e0b; }
        .summary { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚨 Low Stock Alert</h1>
        <p>Immediate attention required for inventory management</p>
      </div>
      
      <div class="content">
        <div class="summary">
          <h3>Alert Summary</h3>
          <p><strong>Total Low Stock Items:</strong> ${lowStockItems.length}</p>
          <p><strong>Critical (Out of Stock):</strong> ${criticalItems.length}</p>
          <p><strong>Warning (Low Stock):</strong> ${lowStockItems.length - criticalItems.length}</p>
        </div>

        ${criticalItems.length > 0 ? `
        <div class="alert-critical">
          <h3>🔴 CRITICAL: Out of Stock</h3>
          ${criticalItems.map(item => `
            <div class="item">
              <div class="item-info">
                <strong>${item.products.name}</strong><br>
                ${item.size || ''} ${item.size && item.color ? ' | ' : ''} ${item.color || ''}<br>
                SKU: ${item.sku || 'N/A'}
              </div>
              <div class="stock-level stock-critical">0 units</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${lowStockItems.filter(item => item.stock_quantity > 0).length > 0 ? `
        <div class="alert-warning">
          <h3>🟡 WARNING: Low Stock</h3>
          ${lowStockItems.filter(item => item.stock_quantity > 0).map(item => `
            <div class="item">
              <div class="item-info">
                <strong>${item.products.name}</strong><br>
                ${item.size || ''} ${item.size && item.color ? ' | ' : ''} ${item.color || ''}<br>
                SKU: ${item.sku || 'N/A'}<br>
                <small>Threshold: ${item.low_stock_threshold || 5} units</small>
              </div>
              <div class="stock-level stock-warning">${item.stock_quantity} units</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <h3>Recommended Actions</h3>
        <ul>
          <li>Review and reorder critical items immediately</li>
          <li>Update low stock thresholds if necessary</li>
          <li>Consider promotional strategies for slow-moving stock</li>
          <li>Monitor daily sales to prevent future stockouts</li>
        </ul>

        <p><strong>Alert generated:</strong> ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
      </div>
    </body>
    </html>
  `

  try {
    // Send email (simplified for now - would use EmailAutomation system)
    console.log(`📧 Would send low stock alert email to: ${adminEmail}`)
    console.log(`📊 Alert details: ${lowStockItems.length} low stock items, ${criticalItems.length} critical`)

    return NextResponse.json({
      success: true,
      message: 'Low stock alert email prepared',
      alert_details: {
        total_low_stock: lowStockItems.length,
        critical_items: criticalItems.length,
        warning_items: lowStockItems.length - criticalItems.length,
        admin_email: adminEmail
      },
      // In production, this would actually send the email
      email_sent: false,
      note: 'Email sending disabled in current implementation'
    })

  } catch (error) {
    console.error('❌ Failed to send low stock alert email:', error)
    return NextResponse.json({
      error: 'Failed to send alert email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function markAlertAcknowledged(data: any, supabase: any) {
  const { variant_ids, acknowledged_by, notes } = data

  if (!variant_ids || !Array.isArray(variant_ids)) {
    return NextResponse.json({
      error: 'variant_ids array is required'
    }, { status: 400 })
  }

  console.log(`📝 Marking ${variant_ids.length} alerts as acknowledged`)

  // This would typically update an alerts table, but for now we'll just log it
  const acknowledgements = variant_ids.map(variant_id => ({
    variant_id,
    acknowledged_at: new Date().toISOString(),
    acknowledged_by: acknowledged_by || 'system',
    notes: notes || 'Alert acknowledged'
  }))

  return NextResponse.json({
    success: true,
    message: 'Alerts marked as acknowledged',
    acknowledged_count: variant_ids.length,
    acknowledgements
  })
}

async function processAutoReorder(data: any, supabase: any) {
  const { variant_id, reorder_quantity } = data

  if (!variant_id || !reorder_quantity) {
    return NextResponse.json({
      error: 'variant_id and reorder_quantity are required'
    }, { status: 400 })
  }

  console.log(`🔄 Processing auto-reorder: ${reorder_quantity} units for variant ${variant_id}`)

  // Get variant info
  const { data: variant } = await supabase
    .from('product_variants')
    .select('stock_quantity, products(name)')
    .eq('id', variant_id)
    .single()

  if (!variant) {
    return NextResponse.json({
      error: 'Variant not found'
    }, { status: 404 })
  }

  const previousStock = variant.stock_quantity
  const newStock = previousStock + reorder_quantity

  // Update stock
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({
      stock_quantity: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', variant_id)

  if (updateError) {
    return NextResponse.json({
      error: 'Failed to update stock',
      details: updateError.message
    }, { status: 500 })
  }

  // Log inventory movement
  await supabase
    .from('inventory_movements')
    .insert({
      product_variant_id: variant_id,
      movement_type: 'restock',
      quantity_change: reorder_quantity,
      previous_quantity: previousStock,
      new_quantity: newStock,
      reference_type: 'auto_reorder',
      notes: `Auto-reorder: ${reorder_quantity} units added`
    })

  console.log(`✅ Auto-reorder completed: ${variant.products.name} (${previousStock} → ${newStock})`)

  return NextResponse.json({
    success: true,
    message: 'Auto-reorder processed',
    variant_id,
    product_name: variant.products.name,
    previous_stock: previousStock,
    new_stock: newStock,
    reorder_quantity
  })
}

export const dynamic = 'force-dynamic'