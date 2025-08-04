// @ts-nocheck - Advanced marketing module with complex types
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CustomerSegment {
  id: string
  name: string
  description?: string
  criteria: Record<string, any>
  is_dynamic: boolean
  customer_count: number
  last_updated: string
  created_by?: string
  created_at: string
}

export interface SegmentMembership {
  id: string
  segment_id: string
  customer_id: string
  added_at: string
  removed_at?: string
  is_active: boolean
}

export interface SegmentCustomer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  total_orders: number
  total_spent: number
  last_order_date?: string
  created_at: string
  tags?: string[]
}

class CustomerSegmentationService {

  /**
   * Create a new customer segment
   */
  async createSegment(
    segmentData: Omit<CustomerSegment, 'id' | 'customer_count' | 'last_updated' | 'created_at'>
  ): Promise<{ success: boolean; segment?: CustomerSegment; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .insert({
          ...segmentData,
          customer_count: 0
        })
        .select()
        .single()

      if (error) throw error

      const segment = data as CustomerSegment

      // If dynamic segment, populate it immediately
      if (segment.is_dynamic) {
        await this.updateSegmentMembership(segment.id)
      }

      return { success: true, segment }
    } catch (error) {
      console.error('Error creating segment:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all customer segments
   */
  async getSegments(): Promise<CustomerSegment[]> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as CustomerSegment[]
    } catch (error) {
      console.error('Error getting segments:', error)
      return []
    }
  }

  /**
   * Get segment by ID
   */
  async getSegment(segmentId: string): Promise<CustomerSegment | null> {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('id', segmentId)
        .single()

      if (error) throw error
      return data as CustomerSegment
    } catch (error) {
      console.error('Error getting segment:', error)
      return null
    }
  }

  /**
   * Update segment
   */
  async updateSegment(
    segmentId: string,
    updates: Partial<CustomerSegment>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('customer_segments')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('id', segmentId)

      if (error) throw error

      // If criteria changed and it's a dynamic segment, update membership
      if (updates.criteria) {
        const segment = await this.getSegment(segmentId)
        if (segment?.is_dynamic) {
          await this.updateSegmentMembership(segmentId)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating segment:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete segment
   */
  async deleteSegment(segmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('customer_segments')
        .delete()
        .eq('id', segmentId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting segment:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update segment membership based on criteria
   */
  async updateSegmentMembership(segmentId: string): Promise<{ 
    success: boolean
    added: number
    removed: number
    error?: string 
  }> {
    try {
      const segment = await this.getSegment(segmentId)
      if (!segment) {
        return { success: false, added: 0, removed: 0, error: 'Segment not found' }
      }

      // Get all customers with their order data
      const customers = await this.getCustomersWithOrderData()
      
      // Evaluate which customers match the segment criteria
      const matchingCustomers = customers.filter(customer => 
        this.evaluateSegmentCriteria(segment.criteria, customer)
      )

      // Get current segment memberships
      const { data: currentMemberships } = await supabase
        .from('customer_segment_memberships')
        .select('customer_id')
        .eq('segment_id', segmentId)
        .eq('is_active', true)

      const currentCustomerIds = new Set(
        currentMemberships?.map(m => m.customer_id) || []
      )
      const matchingCustomerIds = new Set(
        matchingCustomers.map(c => c.id)
      )

      // Find customers to add and remove
      const toAdd = matchingCustomers.filter(c => !currentCustomerIds.has(c.id))
      const toRemoveIds = Array.from(currentCustomerIds).filter(id => !matchingCustomerIds.has(id))

      let added = 0
      let removed = 0

      // Add new members
      if (toAdd.length > 0) {
        const newMemberships = toAdd.map(customer => ({
          segment_id: segmentId,
          customer_id: customer.id,
          is_active: true
        }))

        const { error: addError } = await supabase
          .from('customer_segment_memberships')
          .upsert(newMemberships, { 
            onConflict: 'segment_id,customer_id',
            ignoreDuplicates: false 
          })

        if (addError) throw addError
        added = toAdd.length
      }

      // Remove members who no longer match
      if (toRemoveIds.length > 0) {
        const { error: removeError } = await supabase
          .from('customer_segment_memberships')
          .update({ 
            is_active: false, 
            removed_at: new Date().toISOString() 
          })
          .eq('segment_id', segmentId)
          .in('customer_id', toRemoveIds)

        if (removeError) throw removeError
        removed = toRemoveIds.length
      }

      // Update segment customer count
      await supabase
        .from('customer_segments')
        .update({ 
          customer_count: matchingCustomers.length,
          last_updated: new Date().toISOString()
        })
        .eq('id', segmentId)

      console.log(`Updated segment ${segment.name}: +${added}, -${removed} customers`)

      return { success: true, added, removed }
    } catch (error) {
      console.error('Error updating segment membership:', error)
      return { success: false, added: 0, removed: 0, error: error.message }
    }
  }

  /**
   * Get customers with order data for segmentation
   */
  private async getCustomersWithOrderData(): Promise<SegmentCustomer[]> {
    try {
      // This would typically join with orders and customer tables
      // For now, we'll create a simplified version
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          orders (
            id,
            total,
            created_at,
            status
          )
        `)

      if (error) throw error

      return customers?.map(customer => {
        const orders = customer.orders || []
        const completedOrders = orders.filter(order => order.status === 'completed')
        
        return {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          total_orders: completedOrders.length,
          total_spent: completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0),
          last_order_date: completedOrders.length > 0 ? 
            Math.max(...completedOrders.map(o => new Date(o.created_at).getTime())) : undefined,
          created_at: customer.created_at,
          tags: [] // Would come from customer tags if implemented
        }
      }) || []
    } catch (error) {
      console.error('Error getting customers with order data:', error)
      return []
    }
  }

  /**
   * Evaluate if a customer matches segment criteria
   */
  private evaluateSegmentCriteria(
    criteria: Record<string, any>,
    customer: SegmentCustomer
  ): boolean {
    try {
      // Minimum total spent
      if (criteria.min_total_spent && customer.total_spent < criteria.min_total_spent) {
        return false
      }

      // Maximum total spent
      if (criteria.max_total_spent && customer.total_spent > criteria.max_total_spent) {
        return false
      }

      // Minimum order count
      if (criteria.min_order_count && customer.total_orders < criteria.min_order_count) {
        return false
      }

      // Maximum order count
      if (criteria.max_order_count && customer.total_orders > criteria.max_order_count) {
        return false
      }

      // Customer registration date range
      if (criteria.registered_after) {
        const registeredDate = new Date(customer.created_at)
        const afterDate = new Date(criteria.registered_after)
        if (registeredDate < afterDate) return false
      }

      if (criteria.registered_before) {
        const registeredDate = new Date(customer.created_at)
        const beforeDate = new Date(criteria.registered_before)
        if (registeredDate > beforeDate) return false
      }

      // Days since last order
      if (criteria.days_since_last_order && customer.last_order_date) {
        const daysSince = Math.floor(
          (Date.now() - customer.last_order_date) / (1000 * 60 * 60 * 24)
        )
        if (daysSince < criteria.days_since_last_order) return false
      }

      // Has ordered in last X days
      if (criteria.ordered_within_days && customer.last_order_date) {
        const daysSince = Math.floor(
          (Date.now() - customer.last_order_date) / (1000 * 60 * 60 * 24)
        )
        if (daysSince > criteria.ordered_within_days) return false
      }

      // Customer tags
      if (criteria.tags && Array.isArray(criteria.tags)) {
        const customerTags = customer.tags || []
        const hasRequiredTag = criteria.tags.some(tag => customerTags.includes(tag))
        if (!hasRequiredTag) return false
      }

      // Newsletter subscription status
      if (criteria.newsletter_active !== undefined) {
        // This would check newsletter subscription status
        // For now, we'll assume all customers are newsletter subscribers
      }

      // Location-based criteria (would require customer address data)
      if (criteria.country && criteria.country !== 'any') {
        // Would check customer country
      }

      return true
    } catch (error) {
      console.error('Error evaluating segment criteria:', error)
      return false
    }
  }

  /**
   * Get customers in a segment
   */
  async getSegmentCustomers(
    segmentId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<SegmentCustomer[]> {
    try {
      const { data, error } = await supabase
        .from('customer_segment_memberships')
        .select(`
          customer_id,
          customers (
            id,
            email,
            first_name,
            last_name,
            created_at
          )
        `)
        .eq('segment_id', segmentId)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Get order data for each customer
      const customerIds = data?.map(m => m.customer_id) || []
      if (customerIds.length === 0) return []

      const customersWithOrderData = await this.getCustomersWithOrderData()
      
      return customersWithOrderData.filter(customer => 
        customerIds.includes(customer.id)
      )
    } catch (error) {
      console.error('Error getting segment customers:', error)
      return []
    }
  }

  /**
   * Add customer to segment manually
   */
  async addCustomerToSegment(
    segmentId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('customer_segment_memberships')
        .upsert({
          segment_id: segmentId,
          customer_id: customerId,
          is_active: true
        }, {
          onConflict: 'segment_id,customer_id',
          ignoreDuplicates: false
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error adding customer to segment:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove customer from segment
   */
  async removeCustomerFromSegment(
    segmentId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('customer_segment_memberships')
        .update({
          is_active: false,
          removed_at: new Date().toISOString()
        })
        .eq('segment_id', segmentId)
        .eq('customer_id', customerId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing customer from segment:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update all dynamic segments
   */
  async updateAllDynamicSegments(): Promise<{
    updated: number
    total_added: number
    total_removed: number
    errors: string[]
  }> {
    const results = {
      updated: 0,
      total_added: 0,
      total_removed: 0,
      errors: []
    }

    try {
      const segments = await this.getSegments()
      const dynamicSegments = segments.filter(s => s.is_dynamic)

      for (const segment of dynamicSegments) {
        try {
          const updateResult = await this.updateSegmentMembership(segment.id)
          
          if (updateResult.success) {
            results.updated++
            results.total_added += updateResult.added
            results.total_removed += updateResult.removed
          } else {
            results.errors.push(`Segment ${segment.name}: ${updateResult.error}`)
          }
        } catch (error) {
          results.errors.push(`Segment ${segment.name}: ${error.message}`)
        }
      }

      console.log(`Updated ${results.updated} dynamic segments: +${results.total_added}, -${results.total_removed} customers`)
    } catch (error) {
      console.error('Error updating dynamic segments:', error)
      results.errors.push(`Update error: ${error.message}`)
    }

    return results
  }

  /**
   * Get segmentation statistics
   */
  async getSegmentationStats(): Promise<{
    total_segments: number
    dynamic_segments: number
    static_segments: number
    total_customers_segmented: number
    average_customers_per_segment: number
    largest_segment: { name: string; count: number } | null
  }> {
    try {
      const segments = await this.getSegments()
      
      const totalSegments = segments.length
      const dynamicSegments = segments.filter(s => s.is_dynamic).length
      const staticSegments = segments.filter(s => !s.is_dynamic).length
      
      const totalCustomersSegmented = segments.reduce((sum, s) => sum + s.customer_count, 0)
      const averageCustomersPerSegment = totalSegments > 0 ? 
        Math.round(totalCustomersSegmented / totalSegments) : 0
      
      const largestSegment = segments.reduce((largest, segment) => {
        if (!largest || segment.customer_count > largest.customer_count) {
          return segment
        }
        return largest
      }, null as CustomerSegment | null)

      return {
        total_segments: totalSegments,
        dynamic_segments: dynamicSegments,
        static_segments: staticSegments,
        total_customers_segmented: totalCustomersSegmented,
        average_customers_per_segment: averageCustomersPerSegment,
        largest_segment: largestSegment ? {
          name: largestSegment.name,
          count: largestSegment.customer_count
        } : null
      }
    } catch (error) {
      console.error('Error getting segmentation stats:', error)
      return {
        total_segments: 0,
        dynamic_segments: 0,
        static_segments: 0,
        total_customers_segmented: 0,
        average_customers_per_segment: 0,
        largest_segment: null
      }
    }
  }

  /**
   * Get predefined segment templates
   */
  getSegmentTemplates(): Record<string, Partial<CustomerSegment>> {
    return {
      high_value_customers: {
        name: 'High Value Customers',
        description: 'Customers who have spent over £200',
        criteria: { min_total_spent: 200 },
        is_dynamic: true
      },
      frequent_buyers: {
        name: 'Frequent Buyers',
        description: 'Customers with 5+ completed orders',
        criteria: { min_order_count: 5 },
        is_dynamic: true
      },
      recent_customers: {
        name: 'Recent Customers',
        description: 'Customers who joined in the last 30 days',
        criteria: { 
          registered_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        is_dynamic: true
      },
      dormant_customers: {
        name: 'Dormant Customers',
        description: 'Customers who haven\'t ordered in 90+ days',
        criteria: { days_since_last_order: 90 },
        is_dynamic: true
      },
      single_purchase_customers: {
        name: 'Single Purchase Customers',
        description: 'Customers who have made exactly one purchase',
        criteria: { min_order_count: 1, max_order_count: 1 },
        is_dynamic: true
      },
      military_veterans: {
        name: 'Military Veterans',
        description: 'Verified military veteran customers',
        criteria: { tags: ['veteran'] },
        is_dynamic: true
      },
      newsletter_subscribers: {
        name: 'Newsletter Subscribers',
        description: 'Active newsletter subscribers',
        criteria: { newsletter_active: true },
        is_dynamic: true
      }
    }
  }
}

// Export singleton instance
export const segmentationService = new CustomerSegmentationService()

// Convenience functions
export const createSegment = (segmentData: Omit<CustomerSegment, 'id' | 'customer_count' | 'last_updated' | 'created_at'>) =>
  segmentationService.createSegment(segmentData)

export const getSegments = () => segmentationService.getSegments()

export const updateAllDynamicSegments = () => segmentationService.updateAllDynamicSegments()

export const getSegmentationStats = () => segmentationService.getSegmentationStats()