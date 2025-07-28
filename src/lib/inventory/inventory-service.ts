// Inventory Management Service for Military Tees UK
// Handles stock tracking, alerts, and inventory operations

import { supabase } from '@/lib/supabase'
import { captureError } from '@/lib/monitoring/error-tracking'

export interface InventoryItem {
  id: string
  product_id: string
  variant_id: string
  sku: string
  product_name: string
  variant_details: {
    size?: string
    color?: string
  }
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_point: number
  max_stock_level: number
  cost_price: number
  last_restocked_at?: string
  supplier_info?: {
    name: string
    contact: string
    lead_time_days: number
  }
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  product_variant_id: string
  movement_type: 'sale' | 'restock' | 'adjustment' | 'return' | 'damage' | 'transfer'
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  reference_id?: string
  reason?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface LowStockAlert {
  id: string
  product_variant_id: string
  product_name: string
  variant_details: any
  current_stock: number
  reorder_point: number
  suggested_reorder_quantity: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  acknowledged_at?: string
  acknowledged_by?: string
}

export interface InventoryStats {
  total_products: number
  total_variants: number
  low_stock_items: number
  out_of_stock_items: number
  total_inventory_value: number
  movement_summary: {
    sales_today: number
    restocks_today: number
    adjustments_today: number
  }
}

class InventoryService {
  
  // Get all inventory items with filtering and pagination
  async getInventoryItems(options: {
    page?: number
    limit?: number
    search?: string
    category?: string
    lowStock?: boolean
    outOfStock?: boolean
    sortBy?: 'name' | 'stock' | 'updated_at'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{
    items: InventoryItem[]
    total: number
    page: number
    limit: number
  }> {
    try {
      const {
        page = 0,
        limit = 50,
        search,
        category,
        lowStock,
        outOfStock,
        sortBy = 'updated_at',
        sortOrder = 'desc'
      } = options

      let query = supabase
        .from('inventory_view')
        .select('*', { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`product_name.ilike.%${search}%,sku.ilike.%${search}%`)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (lowStock) {
        query = query.lt('available_stock', supabase.raw('reorder_point'))
      }

      if (outOfStock) {
        query = query.eq('available_stock', 0)
      }

      // Apply sorting
      const sortColumn = sortBy === 'name' ? 'product_name' : 
                        sortBy === 'stock' ? 'available_stock' : 'updated_at'
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

      // Apply pagination
      query = query.range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        items: data || [],
        total: count || 0,
        page,
        limit
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_inventory_items' }
      })
      throw new Error('Failed to fetch inventory items')
    }
  }

  // Get single inventory item by variant ID
  async getInventoryItem(variantId: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_view')
        .select('*')
        .eq('variant_id', variantId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data || null

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_inventory_item', variant_id: variantId }
      })
      throw new Error('Failed to fetch inventory item')
    }
  }

  // Update stock levels for a variant
  async updateStock(
    variantId: string,
    newQuantity: number,
    movementType: StockMovement['movement_type'],
    options: {
      reason?: string
      notes?: string
      referenceId?: string
      userId?: string
    } = {}
  ): Promise<void> {
    try {
      // Get current stock level
      const currentItem = await this.getInventoryItem(variantId)
      if (!currentItem) {
        throw new Error('Inventory item not found')
      }

      const quantityChange = newQuantity - currentItem.current_stock

      // Update stock in database
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', variantId)

      if (updateError) throw updateError

      // Record stock movement
      await this.recordStockMovement({
        product_variant_id: variantId,
        movement_type: movementType,
        quantity_change: quantityChange,
        previous_quantity: currentItem.current_stock,
        new_quantity: newQuantity,
        reference_id: options.referenceId,
        reason: options.reason,
        notes: options.notes,
        created_by: options.userId
      })

      // Check if reorder alert needed
      if (newQuantity <= currentItem.reorder_point) {
        await this.createLowStockAlert(variantId)
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'high',
        tags: { 
          operation: 'update_stock',
          variant_id: variantId,
          movement_type: movementType
        }
      })
      throw new Error('Failed to update stock levels')
    }
  }

  // Bulk stock update for multiple variants
  async bulkUpdateStock(updates: Array<{
    variantId: string
    newQuantity: number
    reason?: string
    notes?: string
  }>, userId?: string): Promise<void> {
    try {
      for (const update of updates) {
        await this.updateStock(
          update.variantId,
          update.newQuantity,
          'adjustment',
          {
            reason: update.reason || 'Bulk adjustment',
            notes: update.notes,
            userId
          }
        )
      }
    } catch (error) {
      await captureError(error as Error, {
        severity: 'high',
        tags: { operation: 'bulk_update_stock' }
      })
      throw new Error('Failed to perform bulk stock update')
    }
  }

  // Record stock movement in history
  private async recordStockMovement(movement: Omit<StockMovement, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_movements')
        .insert({
          ...movement,
          created_at: new Date().toISOString()
        })

      if (error) throw error

    } catch (error) {
      console.error('Failed to record stock movement:', error)
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Get stock movement history
  async getStockMovementHistory(
    variantId?: string,
    options: {
      page?: number
      limit?: number
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<{
    movements: StockMovement[]
    total: number
  }> {
    try {
      const { page = 0, limit = 50, startDate, endDate } = options

      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          product_variants!inner (
            products!inner (
              name
            ),
            size,
            color
          )
        `, { count: 'exact' })

      if (variantId) {
        query = query.eq('product_variant_id', variantId)
      }

      if (startDate) {
        query = query.gte('created_at', startDate)
      }

      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        movements: data || [],
        total: count || 0
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_stock_movement_history' }
      })
      throw new Error('Failed to fetch stock movement history')
    }
  }

  // Create low stock alert
  private async createLowStockAlert(variantId: string): Promise<void> {
    try {
      // Check if alert already exists
      const { data: existingAlert } = await supabase
        .from('low_stock_alerts')
        .select('id')
        .eq('product_variant_id', variantId)
        .eq('acknowledged_at', null)
        .single()

      if (existingAlert) return // Alert already exists

      const item = await this.getInventoryItem(variantId)
      if (!item) return

      // Determine priority based on stock level
      let priority: LowStockAlert['priority'] = 'low'
      if (item.available_stock === 0) {
        priority = 'critical'
      } else if (item.available_stock <= item.reorder_point * 0.5) {
        priority = 'high'
      } else if (item.available_stock <= item.reorder_point * 0.75) {
        priority = 'medium'
      }

      // Calculate suggested reorder quantity
      const suggestedReorder = Math.max(
        item.max_stock_level - item.available_stock,
        item.reorder_point * 2
      )

      const { error } = await supabase
        .from('low_stock_alerts')
        .insert({
          product_variant_id: variantId,
          product_name: item.product_name,
          variant_details: item.variant_details,
          current_stock: item.available_stock,
          reorder_point: item.reorder_point,
          suggested_reorder_quantity: suggestedReorder,
          priority,
          created_at: new Date().toISOString()
        })

      if (error) throw error

    } catch (error) {
      console.error('Failed to create low stock alert:', error)
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(options: {
    acknowledged?: boolean
    priority?: string
    page?: number
    limit?: number
  } = {}): Promise<{
    alerts: LowStockAlert[]
    total: number
  }> {
    try {
      const { acknowledged, priority, page = 0, limit = 50 } = options

      let query = supabase
        .from('low_stock_alerts')
        .select('*', { count: 'exact' })

      if (acknowledged !== undefined) {
        if (acknowledged) {
          query = query.not('acknowledged_at', 'is', null)
        } else {
          query = query.is('acknowledged_at', null)
        }
      }

      if (priority) {
        query = query.eq('priority', priority)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        alerts: data || [],
        total: count || 0
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_low_stock_alerts' }
      })
      throw new Error('Failed to fetch low stock alerts')
    }
  }

  // Acknowledge low stock alert
  async acknowledgeLowStockAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId
        })
        .eq('id', alertId)

      if (error) throw error

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'acknowledge_alert', alert_id: alertId }
      })
      throw new Error('Failed to acknowledge alert')
    }
  }

  // Get inventory statistics
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      // Get basic counts
      const { data: basicStats } = await supabase
        .from('inventory_stats_view')
        .select('*')
        .single()

      // Get movement summary for today
      const today = new Date().toISOString().split('T')[0]
      const { data: movements } = await supabase
        .from('inventory_movements')
        .select('movement_type, quantity_change')
        .gte('created_at', today)

      const movementSummary = {
        sales_today: 0,
        restocks_today: 0,
        adjustments_today: 0
      }

      movements?.forEach(movement => {
        switch (movement.movement_type) {
          case 'sale':
            movementSummary.sales_today += Math.abs(movement.quantity_change)
            break
          case 'restock':
            movementSummary.restocks_today += movement.quantity_change
            break
          case 'adjustment':
            movementSummary.adjustments_today += Math.abs(movement.quantity_change)
            break
        }
      })

      return {
        total_products: basicStats?.total_products || 0,
        total_variants: basicStats?.total_variants || 0,
        low_stock_items: basicStats?.low_stock_items || 0,
        out_of_stock_items: basicStats?.out_of_stock_items || 0,
        total_inventory_value: basicStats?.total_inventory_value || 0,
        movement_summary: movementSummary
      }

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'get_inventory_stats' }
      })
      throw new Error('Failed to fetch inventory statistics')
    }
  }

  // Set reorder points for variants
  async setReorderPoint(variantId: string, reorderPoint: number, maxStockLevel?: number): Promise<void> {
    try {
      const updateData: any = { reorder_point: reorderPoint }
      if (maxStockLevel !== undefined) {
        updateData.max_stock_level = maxStockLevel
      }

      const { error } = await supabase
        .from('product_variants')
        .update(updateData)
        .eq('id', variantId)

      if (error) throw error

    } catch (error) {
      await captureError(error as Error, {
        severity: 'medium',
        tags: { operation: 'set_reorder_point', variant_id: variantId }
      })
      throw new Error('Failed to set reorder point')
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()

// Convenience functions
export const getInventoryItems = (options?: Parameters<InventoryService['getInventoryItems']>[0]) =>
  inventoryService.getInventoryItems(options)

export const updateStock = (
  variantId: string,
  newQuantity: number,
  movementType: StockMovement['movement_type'],
  options?: Parameters<InventoryService['updateStock']>[3]
) => inventoryService.updateStock(variantId, newQuantity, movementType, options)

export const getLowStockAlerts = (options?: Parameters<InventoryService['getLowStockAlerts']>[0]) =>
  inventoryService.getLowStockAlerts(options)

export const getInventoryStats = () => inventoryService.getInventoryStats()

export default inventoryService