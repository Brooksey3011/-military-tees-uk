import { createClient } from '@supabase/supabase-js'
import { campaignService } from './campaign-service'
import { abandonedCartService } from './abandoned-cart-service'
import { emailService } from '@/lib/email/email-service'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AutomationRule {
  id: string
  name: string
  description?: string
  trigger_type: 'cart_abandoned' | 'first_purchase' | 'repeat_purchase' | 'birthday' | 'time_based' | 'behavior'
  trigger_criteria: Record<string, any>
  action_type: 'send_email' | 'add_to_segment' | 'send_sms' | 'create_discount'
  action_config: Record<string, any>
  delay_minutes: number
  is_active: boolean
  priority: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AutomationExecution {
  id: string
  rule_id: string
  customer_id?: string
  trigger_data: Record<string, any>
  status: 'pending' | 'executed' | 'failed' | 'skipped'
  scheduled_for: string
  executed_at?: string
  error_message?: string
  result_data?: Record<string, any>
  created_at: string
}

class MarketingAutomationService {

  /**
   * Create a new automation rule
   */
  async createRule(
    ruleData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; rule?: AutomationRule; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('marketing_automation_rules')
        .insert(ruleData)
        .select()
        .single()

      if (error) throw error

      return { success: true, rule: data as AutomationRule }
    } catch (error) {
      console.error('Error creating automation rule:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all automation rules
   */
  async getRules(activeOnly: boolean = false): Promise<AutomationRule[]> {
    try {
      let query = supabase
        .from('marketing_automation_rules')
        .select('*')
        .order('priority', { ascending: true })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data as AutomationRule[]
    } catch (error) {
      console.error('Error getting automation rules:', error)
      return []
    }
  }

  /**
   * Update automation rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<AutomationRule>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('marketing_automation_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating automation rule:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete automation rule
   */
  async deleteRule(ruleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('marketing_automation_rules')
        .delete()
        .eq('id', ruleId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting automation rule:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Trigger automation based on event
   */
  async triggerAutomation(
    triggerType: string,
    triggerData: Record<string, any>,
    customerId?: string
  ): Promise<{ success: boolean; triggered: number; error?: string }> {
    try {
      // Get matching automation rules
      const rules = await this.getRules(true)
      const matchingRules = rules.filter(rule => rule.trigger_type === triggerType)

      let triggered = 0

      for (const rule of matchingRules) {
        // Check if trigger criteria match
        if (this.evaluateTriggerCriteria(rule.trigger_criteria, triggerData)) {
          // Schedule execution
          const scheduledFor = new Date()
          scheduledFor.setMinutes(scheduledFor.getMinutes() + rule.delay_minutes)

          const executionResult = await this.scheduleExecution({
            rule_id: rule.id,
            customer_id: customerId,
            trigger_data: triggerData,
            scheduled_for: scheduledFor.toISOString()
          })

          if (executionResult.success) {
            triggered++
          }
        }
      }

      return { success: true, triggered }
    } catch (error) {
      console.error('Error triggering automation:', error)
      return { success: false, triggered: 0, error: error.message }
    }
  }

  /**
   * Schedule automation execution
   */
  async scheduleExecution(
    executionData: Omit<AutomationExecution, 'id' | 'status' | 'created_at'>
  ): Promise<{ success: boolean; execution?: AutomationExecution; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('marketing_automation_executions')
        .insert({
          ...executionData,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, execution: data as AutomationExecution }
    } catch (error) {
      console.error('Error scheduling execution:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Process pending automation executions
   */
  async processPendingExecutions(): Promise<{
    processed: number
    successful: number
    failed: number
    skipped: number
    errors: string[]
  }> {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }

    try {
      // Get pending executions that are due
      const { data: executions, error } = await supabase
        .from('marketing_automation_executions')
        .select(`
          *,
          marketing_automation_rules (*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      results.processed = executions?.length || 0

      for (const execution of executions || []) {
        try {
          const rule = execution.marketing_automation_rules as AutomationRule

          if (!rule || !rule.is_active) {
            await this.updateExecution(execution.id, { 
              status: 'skipped',
              error_message: 'Rule inactive or not found'
            })
            results.skipped++
            continue
          }

          // Execute the action
          const actionResult = await this.executeAction(rule, execution)

          if (actionResult.success) {
            await this.updateExecution(execution.id, {
              status: 'executed',
              executed_at: new Date().toISOString(),
              result_data: actionResult.result || {}
            })
            results.successful++
          } else {
            await this.updateExecution(execution.id, {
              status: 'failed',
              error_message: actionResult.error || 'Unknown error'
            })
            results.failed++
            results.errors.push(`Execution ${execution.id}: ${actionResult.error}`)
          }

        } catch (error) {
          await this.updateExecution(execution.id, {
            status: 'failed',
            error_message: error.message
          })
          results.failed++
          results.errors.push(`Execution ${execution.id}: ${error.message}`)
        }
      }

      console.log(`Processed ${results.processed} automation executions: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`)

    } catch (error) {
      console.error('Error processing automation executions:', error)
      results.errors.push(`Processing error: ${error.message}`)
    }

    return results
  }

  /**
   * Execute automation action
   */
  private async executeAction(
    rule: AutomationRule,
    execution: AutomationExecution
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      switch (rule.action_type) {
        case 'send_email':
          return await this.executeEmailAction(rule, execution)
        
        case 'add_to_segment':
          return await this.executeSegmentAction(rule, execution)
        
        case 'create_discount':
          return await this.executeDiscountAction(rule, execution)
        
        default:
          return { success: false, error: `Unknown action type: ${rule.action_type}` }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(
    rule: AutomationRule,
    execution: AutomationExecution
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const config = rule.action_config
    const template = config.template
    const subject = config.subject || 'Military Tees UK'

    // Get customer email
    let customerEmail = execution.trigger_data.customer_email

    if (!customerEmail && execution.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('email')
        .eq('user_id', execution.customer_id)
        .single()
      
      customerEmail = customer?.email
    }

    if (!customerEmail) {
      return { success: false, error: 'No customer email available' }
    }

    // Prepare email data based on template
    let emailData: any = {
      customerEmail,
      customerName: customerEmail.split('@')[0], // Fallback name
      ...execution.trigger_data
    }

    // Send different types of emails based on template
    try {
      let emailResult

      switch (template) {
        case 'abandoned_cart_recovery':
          if (execution.trigger_data.cart_id) {
            const { data: cart } = await supabase
              .from('abandoned_carts')
              .select('*')
              .eq('id', execution.trigger_data.cart_id)
              .single()
            
            if (cart) {
              emailResult = await abandonedCartService.sendRecoveryEmail(cart)
            } else {
              return { success: false, error: 'Abandoned cart not found' }
            }
          } else {
            return { success: false, error: 'No cart ID in trigger data' }
          }
          break

        case 'welcome_customer':
          emailResult = await emailService.sendWelcomeEmail({
            name: emailData.customerName,
            email: customerEmail
          })
          break

        default:
          // Generic email sending
          const html = this.generateEmailHTML(template, emailData)
          emailResult = await emailService.sendEmail(customerEmail, subject, html)
      }

      return { 
        success: emailResult.success, 
        result: { message_id: emailResult.messageId },
        error: emailResult.error 
      }

    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Execute segment action
   */
  private async executeSegmentAction(
    rule: AutomationRule,
    execution: AutomationExecution
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!execution.customer_id) {
      return { success: false, error: 'No customer ID available' }
    }

    const config = rule.action_config
    const segmentId = config.segment_id

    try {
      const { error } = await supabase
        .from('customer_segment_memberships')
        .insert({
          segment_id: segmentId,
          customer_id: execution.customer_id,
          is_active: true
        })

      if (error && !error.message.includes('duplicate key')) {
        throw error
      }

      return { success: true, result: { segment_id: segmentId } }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Execute discount action
   */
  private async executeDiscountAction(
    rule: AutomationRule,
    execution: AutomationExecution
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    // This would integrate with a discount/coupon system
    // For now, return success with placeholder data
    const config = rule.action_config
    
    const discountCode = `AUTO-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    
    return { 
      success: true, 
      result: { 
        discount_code: discountCode,
        discount_percentage: config.discount_percentage || 10,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
    }
  }

  /**
   * Update automation execution
   */
  private async updateExecution(
    executionId: string,
    updates: Partial<AutomationExecution>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('marketing_automation_executions')
        .update(updates)
        .eq('id', executionId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating execution:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Evaluate trigger criteria
   */
  private evaluateTriggerCriteria(
    criteria: Record<string, any>,
    triggerData: Record<string, any>
  ): boolean {
    try {
      // Check minimum cart value
      if (criteria.min_cart_value && triggerData.cart_value < criteria.min_cart_value) {
        return false
      }

      // Check maximum email count
      if (criteria.max_email_count !== undefined && triggerData.email_count > criteria.max_email_count) {
        return false
      }

      // Check customer tags
      if (criteria.tags && Array.isArray(criteria.tags)) {
        const customerTags = triggerData.customer_tags || []
        const hasRequiredTag = criteria.tags.some(tag => customerTags.includes(tag))
        if (!hasRequiredTag) return false
      }

      // Check order count
      if (criteria.min_order_count && triggerData.order_count < criteria.min_order_count) {
        return false
      }

      // Check purchase date
      if (criteria.days_since_purchase) {
        const daysSince = triggerData.days_since_purchase || 0
        if (daysSince < criteria.days_since_purchase) return false
      }

      return true
    } catch (error) {
      console.error('Error evaluating trigger criteria:', error)
      return false
    }
  }

  /**
   * Generate HTML for generic email templates
   */
  private generateEmailHTML(template: string, data: any): string {
    const baseStyle = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #4a5d23; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .btn { background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        h1, h2 { color: #4a5d23; }
      </style>
    `

    switch (template) {
      case 'birthday_greeting':
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8">${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Happy Birthday from Military Tees UK!</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.customerName},</h2>
                <p>🎂 Happy Birthday! Thank you for being part of our military heritage community.</p>
                <p>As a birthday gift, enjoy <strong>15% OFF</strong> your next order with code <strong>BIRTHDAY15</strong></p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://militarytees.co.uk?discount=BIRTHDAY15" class="btn">Shop Now</a>
                </div>
              </div>
              <div class="footer">
                <p>Military Tees UK | Honoring Military Heritage with Pride</p>
              </div>
            </div>
          </body>
          </html>
        `

      case 'repeat_customer_thanks':
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8">${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Thank You for Your Loyalty!</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.customerName},</h2>
                <p>Thank you for being a loyal customer! Your continued support means the world to us.</p>
                <p>As a valued repeat customer, here's <strong>10% OFF</strong> your next order: <strong>LOYAL10</strong></p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://militarytees.co.uk?discount=LOYAL10" class="btn">Shop Now</a>
                </div>
              </div>
              <div class="footer">
                <p>Military Tees UK | Honoring Military Heritage with Pride</p>
              </div>
            </div>
          </body>
          </html>
        `

      default:
        return `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8">${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Military Tees UK</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.customerName},</h2>
                <p>Thank you for being part of our military heritage community!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://militarytees.co.uk" class="btn">Visit Our Store</a>
                </div>
              </div>
              <div class="footer">
                <p>Military Tees UK | Honoring Military Heritage with Pride</p>
              </div>
            </div>
          </body>
          </html>
        `
    }
  }

  /**
   * Get automation statistics
   */
  async getAutomationStats(): Promise<{
    total_rules: number
    active_rules: number
    total_executions: number
    successful_executions: number
    failed_executions: number
    success_rate: number
    executions_today: number
  }> {
    try {
      const [rulesResult, executionsResult] = await Promise.all([
        supabase.from('marketing_automation_rules').select('is_active'),
        supabase.from('marketing_automation_executions').select('status, created_at')
      ])

      const rules = rulesResult.data || []
      const executions = executionsResult.data || []

      const today = new Date().toISOString().split('T')[0]
      const executionsToday = executions.filter(e => 
        e.created_at.startsWith(today)
      ).length

      const successfulExecutions = executions.filter(e => e.status === 'executed').length
      const failedExecutions = executions.filter(e => e.status === 'failed').length
      const totalExecutions = executions.length

      return {
        total_rules: rules.length,
        active_rules: rules.filter(r => r.is_active).length,
        total_executions: totalExecutions,
        successful_executions: successfulExecutions,
        failed_executions: failedExecutions,
        success_rate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0,
        executions_today: executionsToday
      }
    } catch (error) {
      console.error('Error getting automation stats:', error)
      return {
        total_rules: 0,
        active_rules: 0,
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        success_rate: 0,
        executions_today: 0
      }
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(limit: number = 50): Promise<AutomationExecution[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_automation_executions')
        .select(`
          *,
          marketing_automation_rules (name, trigger_type, action_type)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as AutomationExecution[]
    } catch (error) {
      console.error('Error getting execution history:', error)
      return []
    }
  }
}

// Export singleton instance
export const automationService = new MarketingAutomationService()

// Convenience functions for common automation triggers
export const triggerAbandonedCartAutomation = (cartData: any, customerEmail?: string, customerId?: string) =>
  automationService.triggerAutomation('cart_abandoned', {
    cart_id: cartData.id,
    cart_value: cartData.total_value,
    customer_email: customerEmail,
    email_count: cartData.recovery_email_count || 0
  }, customerId)

export const triggerFirstPurchaseAutomation = (orderData: any, customerId: string) =>
  automationService.triggerAutomation('first_purchase', {
    order_id: orderData.id,
    order_value: orderData.total,
    customer_email: orderData.customer_email
  }, customerId)

export const triggerRepeatPurchaseAutomation = (orderData: any, customerId: string, orderCount: number) =>
  automationService.triggerAutomation('repeat_purchase', {
    order_id: orderData.id,
    order_value: orderData.total,
    order_count: orderCount,
    customer_email: orderData.customer_email
  }, customerId)

export const processPendingAutomations = () => automationService.processPendingExecutions()

export const getAutomationStats = () => automationService.getAutomationStats()