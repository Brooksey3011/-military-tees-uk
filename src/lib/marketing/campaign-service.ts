import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email/email-service'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface EmailCampaign {
  id: string
  name: string
  type: 'newsletter' | 'promotional' | 'abandoned_cart' | 'welcome' | 'product_announcement'
  subject: string
  template_name: string
  template_data: Record<string, any>
  sender_email: string
  sender_name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  scheduled_for?: string
  sent_at?: string
  recipient_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CampaignRecipient {
  id: string
  campaign_id: string
  email: string
  customer_id?: string
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  personalization_data: Record<string, any>
}

export interface CampaignTemplate {
  name: string
  subject: string
  html: string
  variables: string[]
  preview_text?: string
}

class EmailCampaignService {

  /**
   * Get all campaign templates
   */
  getCampaignTemplates(): Record<string, CampaignTemplate> {
    return {
      newsletter_weekly: {
        name: 'Weekly Newsletter',
        subject: 'Weekly Military Heritage Update 🛡️',
        preview_text: 'Your weekly dose of military-themed apparel and heritage updates',
        variables: ['recipient_name', 'featured_products', 'military_news', 'unsubscribe_url'],
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Military Heritage Update</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background-color: #4a5d23; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .product-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
              .product-image { width: 100%; height: 150px; object-fit: cover; }
              .news-section { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #4a5d23; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              .btn { background-color: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
              h1, h2 { color: #4a5d23; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Military Tees UK</h1>
                <p>Weekly Heritage Update</p>
              </div>
              
              <div class="content">
                <h2>Hello {{recipient_name}},</h2>
                
                <p>Welcome to your weekly dose of military heritage updates! Here's what's new this week:</p>

                <h3>🎖️ Featured Products</h3>
                <div class="product-grid">
                  {{#each featured_products}}
                  <div class="product-card">
                    <img src="{{image}}" alt="{{name}}" class="product-image">
                    <h4>{{name}}</h4>
                    <p>£{{price}}</p>
                    <a href="{{url}}" class="btn">View Product</a>
                  </div>
                  {{/each}}
                </div>

                <div class="news-section">
                  <h3>📰 Military Heritage News</h3>
                  {{#each military_news}}
                  <div style="margin-bottom: 15px;">
                    <strong>{{title}}</strong><br>
                    <p>{{summary}}</p>
                    <a href="{{url}}">Read more</a>
                  </div>
                  {{/each}}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://militarytees.co.uk" class="btn">Shop All Products</a>
                </div>

                <p>Thank you for being part of the Military Tees UK community!</p>
              </div>

              <div class="footer">
                <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
                <p>Honoring Military Heritage with Pride</p>
                <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://militarytees.co.uk/privacy">Privacy Policy</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      promotional_sale: {
        name: 'Promotional Sale',
        subject: '🎖️ {{discount_percentage}}% OFF Military Tees - Limited Time!',
        preview_text: 'Don\'t miss out on our biggest military apparel sale of the year',
        variables: ['recipient_name', 'discount_percentage', 'discount_code', 'sale_end_date', 'featured_products', 'unsubscribe_url'],
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Military Tees Sale</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background-color: #4a5d23; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .discount-banner { background-color: #d4af37; color: white; padding: 25px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; }
              .code-box { background-color: #f8f9fa; border: 2px dashed #4a5d23; padding: 20px; margin: 20px 0; text-align: center; }
              .urgency { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center; }
              .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .product-card { border: 1px solid #ddd; padding: 15px; text-align: center; position: relative; }
              .sale-badge { position: absolute; top: 10px; right: 10px; background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
              .product-image { width: 100%; height: 150px; object-fit: cover; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              .btn { background-color: #4a5d23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; font-size: 16px; font-weight: bold; }
              .btn-large { font-size: 20px; padding: 20px 40px; }
              h1, h2 { color: #4a5d23; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ MILITARY TEES UK SALE</h1>
                <p>Exclusive Military Heritage Discount</p>
              </div>
              
              <div class="content">
                <div class="discount-banner">
                  {{discount_percentage}}% OFF EVERYTHING
                </div>

                <h2>Hello {{recipient_name}},</h2>
                
                <p>🎖️ <strong>ATTENTION!</strong> Our biggest military apparel sale is now live! Get {{discount_percentage}}% off everything in our store.</p>

                <div class="code-box">
                  <h3 style="margin-top: 0; color: #4a5d23;">Your Exclusive Discount Code:</h3>
                  <div style="font-size: 24px; font-weight: bold; color: #4a5d23; font-family: monospace;">{{discount_code}}</div>
                  <p style="margin-bottom: 0; font-size: 14px; color: #666;">Copy and paste at checkout</p>
                </div>

                <div class="urgency">
                  ⏰ <strong>Limited Time Only!</strong><br>
                  Sale ends {{sale_end_date}} - Don't miss out!
                </div>

                <h3>🔥 Featured Sale Items</h3>
                <div class="product-grid">
                  {{#each featured_products}}
                  <div class="product-card">
                    <div class="sale-badge">{{../discount_percentage}}% OFF</div>
                    <img src="{{image}}" alt="{{name}}" class="product-image">
                    <h4>{{name}}</h4>
                    <p style="text-decoration: line-through; color: #666;">£{{original_price}}</p>
                    <p style="color: #dc3545; font-weight: bold; font-size: 18px;">£{{sale_price}}</p>
                    <a href="{{url}}" class="btn">Shop Now</a>
                  </div>
                  {{/each}}
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="https://militarytees.co.uk?discount={{discount_code}}" class="btn btn-large">SHOP ALL SALE ITEMS</a>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <h4 style="color: #4a5d23; margin-top: 0;">Why Shop Military Tees UK?</h4>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>✅ Authentic military heritage designs</li>
                    <li>✅ Premium quality materials</li>
                    <li>✅ Fast UK shipping</li>
                    <li>✅ 30-day money-back guarantee</li>
                  </ul>
                </div>

                <p><em>This exclusive offer is only available to our valued newsletter subscribers. Thank you for your continued support!</em></p>
              </div>

              <div class="footer">
                <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
                <p>Honoring Military Heritage with Pride</p>
                <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://militarytees.co.uk/privacy">Privacy Policy</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      product_announcement: {
        name: 'New Product Announcement',
        subject: '🚀 New Arrival: {{product_name}} - Military Heritage Collection',
        preview_text: 'Discover our latest addition to the military heritage collection',
        variables: ['recipient_name', 'product_name', 'product_description', 'product_image', 'product_price', 'product_url', 'unsubscribe_url'],
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Product: {{product_name}}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background-color: #4a5d23; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .product-showcase { text-align: center; margin: 30px 0; }
              .product-image { max-width: 100%; height: auto; border-radius: 8px; }
              .price { font-size: 24px; color: #4a5d23; font-weight: bold; margin: 20px 0; }
              .features { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              .btn { background-color: #4a5d23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0; font-size: 16px; font-weight: bold; }
              .new-badge { background-color: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 20px; }
              h1, h2 { color: #4a5d23; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Military Tees UK</h1>
                <p>New Product Launch</p>
              </div>
              
              <div class="content">
                <div class="new-badge">🚀 NEW ARRIVAL</div>
                
                <h2>Hello {{recipient_name}},</h2>
                
                <p>We're excited to introduce the latest addition to our military heritage collection!</p>

                <div class="product-showcase">
                  <h2>{{product_name}}</h2>
                  <img src="{{product_image}}" alt="{{product_name}}" class="product-image">
                  <div class="price">£{{product_price}}</div>
                  <p style="font-size: 16px; color: #666; max-width: 400px; margin: 0 auto;">{{product_description}}</p>
                </div>

                <div class="features">
                  <h3 style="color: #4a5d23; margin-top: 0;">Product Highlights:</h3>
                  <ul style="margin: 0; padding-left: 20px; text-align: left;">
                    <li>✅ Authentic military heritage design</li>
                    <li>✅ Premium quality materials</li>
                    <li>✅ Available in multiple sizes</li>
                    <li>✅ Machine washable</li>
                    <li>✅ Fast UK delivery</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{product_url}}" class="btn">View Product Details</a>
                  <a href="{{product_url}}" class="btn" style="background-color: #d4af37;">Add to Cart</a>
                </div>

                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                  <strong>🎖️ Limited Launch Offer</strong><br>
                  Be among the first 50 customers to order and receive <strong>FREE UK shipping</strong>!
                </div>

                <p>As a valued member of our military heritage community, you get first access to all our new releases. We hope you love this latest addition to our collection!</p>

                <p>Thank you for supporting military heritage and tradition.</p>
              </div>

              <div class="footer">
                <p>Military Tees UK | info@militarytees.co.uk | +44 1234 567890</p>
                <p>Honoring Military Heritage with Pride</p>
                <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://militarytees.co.uk/privacy">Privacy Policy</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    }
  }

  /**
   * Create a new email campaign
   */
  async createCampaign(
    campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'recipient_count' | 'delivered_count' | 'opened_count' | 'clicked_count'>
  ): Promise<{ success: boolean; campaign?: EmailCampaign; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          recipient_count: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, campaign: data as EmailCampaign }
    } catch (error) {
      console.error('Error creating campaign:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(): Promise<EmailCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as EmailCampaign[]
    } catch (error) {
      console.error('Error getting campaigns:', error)
      return []
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error
      return data as EmailCampaign
    } catch (error) {
      console.error('Error getting campaign:', error)
      return null
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<EmailCampaign>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating campaign:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add recipients to a campaign
   */
  async addRecipients(
    campaignId: string,
    recipients: Array<{
      email: string
      customer_id?: string
      personalization_data?: Record<string, any>
    }>
  ): Promise<{ success: boolean; added: number; error?: string }> {
    try {
      const recipientData = recipients.map(recipient => ({
        campaign_id: campaignId,
        email: recipient.email,
        customer_id: recipient.customer_id,
        personalization_data: recipient.personalization_data || {},
        status: 'pending' as const
      }))

      const { data, error } = await supabase
        .from('email_campaign_recipients')
        .insert(recipientData)
        .select('id')

      if (error) throw error

      const addedCount = data?.length || 0

      // Update campaign recipient count
      await supabase
        .from('email_campaigns')
        .update({ recipient_count: addedCount })
        .eq('id', campaignId)

      return { success: true, added: addedCount }
    } catch (error) {
      console.error('Error adding recipients:', error)
      return { success: false, added: 0, error: error.message }
    }
  }

  /**
   * Schedule campaign for sending
   */
  async scheduleCampaign(
    campaignId: string,
    scheduledFor: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledFor.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error scheduling campaign:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send campaign immediately
   */
  async sendCampaign(campaignId: string): Promise<{
    success: boolean
    sent: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: false,
      sent: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get campaign details
      const campaign = await this.getCampaign(campaignId)
      if (!campaign) {
        return { ...results, errors: ['Campaign not found'] }
      }

      // Update campaign status to sending
      await this.updateCampaign(campaignId, { status: 'sending' })

      // Get all pending recipients
      const { data: recipients, error: recipientsError } = await supabase
        .from('email_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')

      if (recipientsError) throw recipientsError

      if (!recipients || recipients.length === 0) {
        await this.updateCampaign(campaignId, { status: 'sent', sent_at: new Date().toISOString() })
        return { ...results, success: true }
      }

      // Get email template
      const templates = this.getCampaignTemplates()
      const template = templates[campaign.template_name]
      
      if (!template) {
        results.errors.push('Template not found')
        await this.updateCampaign(campaignId, { status: 'draft' })
        return results
      }

      // Send emails to all recipients
      for (const recipient of recipients) {
        try {
          // Merge template data with personalization data
          const templateData = {
            ...campaign.template_data,
            ...recipient.personalization_data,
            recipient_email: recipient.email,
            unsubscribe_url: `https://militarytees.co.uk/unsubscribe?email=${encodeURIComponent(recipient.email)}&campaign=${campaignId}`
          }

          // Process template with data
          const processedHtml = this.processTemplate(template.html, templateData)
          const processedSubject = this.processTemplate(campaign.subject, templateData)

          // Send email
          const emailResult = await emailService.sendEmail(
            recipient.email,
            processedSubject,
            processedHtml
          )

          if (emailResult.success) {
            // Update recipient status
            await supabase
              .from('email_campaign_recipients')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', recipient.id)

            results.sent++
          } else {
            // Update recipient status as failed
            await supabase
              .from('email_campaign_recipients')
              .update({ status: 'failed' })
              .eq('id', recipient.id)

            results.failed++
            results.errors.push(`${recipient.email}: ${emailResult.error}`)
          }
        } catch (error) {
          results.failed++
          results.errors.push(`${recipient.email}: ${error.message}`)
        }
      }

      // Update campaign status and stats
      await this.updateCampaign(campaignId, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        delivered_count: results.sent
      })

      results.success = true
      console.log(`Campaign ${campaignId} completed: ${results.sent} sent, ${results.failed} failed`)

    } catch (error) {
      console.error('Error sending campaign:', error)
      results.errors.push(`Campaign error: ${error.message}`)
      
      // Revert campaign status
      await this.updateCampaign(campaignId, { status: 'draft' })
    }

    return results
  }

  /**
   * Process scheduled campaigns
   */
  async processScheduledCampaigns(): Promise<{
    processed: number
    successful: number
    failed: number
    errors: string[]
  }> {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get campaigns scheduled for now or earlier
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', new Date().toISOString())

      if (error) throw error

      results.processed = campaigns?.length || 0

      for (const campaign of campaigns || []) {
        const sendResult = await this.sendCampaign(campaign.id)
        
        if (sendResult.success) {
          results.successful++
        } else {
          results.failed++
          results.errors.push(`Campaign ${campaign.name}: ${sendResult.errors.join(', ')}`)
        }
      }

      console.log(`Processed ${results.processed} scheduled campaigns`)
    } catch (error) {
      console.error('Error processing scheduled campaigns:', error)
      results.errors.push(`Processing error: ${error.message}`)
    }

    return results
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId?: string): Promise<{
    total_campaigns: number
    total_recipients: number
    total_sent: number
    total_delivered: number
    total_opened: number
    total_clicked: number
    open_rate: number
    click_rate: number
    delivery_rate: number
  }> {
    try {
      let campaignQuery = supabase.from('email_campaigns').select('*')
      let recipientQuery = supabase.from('email_campaign_recipients').select('*')

      if (campaignId) {
        campaignQuery = campaignQuery.eq('id', campaignId)
        recipientQuery = recipientQuery.eq('campaign_id', campaignId)
      }

      const [campaignResult, recipientResult] = await Promise.all([
        campaignQuery,
        recipientQuery
      ])

      if (campaignResult.error) throw campaignResult.error
      if (recipientResult.error) throw recipientResult.error

      const campaigns = campaignResult.data || []
      const recipients = recipientResult.data || []

      const stats = campaigns.reduce((acc, campaign) => {
        acc.total_campaigns++
        acc.total_recipients += campaign.recipient_count
        acc.total_sent += campaign.delivered_count
        acc.total_delivered += campaign.delivered_count
        acc.total_opened += campaign.opened_count
        acc.total_clicked += campaign.clicked_count
        return acc
      }, {
        total_campaigns: 0,
        total_recipients: 0,
        total_sent: 0,
        total_delivered: 0,
        total_opened: 0,
        total_clicked: 0
      })

      const open_rate = stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0
      const click_rate = stats.total_delivered > 0 ? (stats.total_clicked / stats.total_delivered) * 100 : 0
      const delivery_rate = stats.total_recipients > 0 ? (stats.total_delivered / stats.total_recipients) * 100 : 0

      return {
        ...stats,
        open_rate: Math.round(open_rate * 100) / 100,
        click_rate: Math.round(click_rate * 100) / 100,
        delivery_rate: Math.round(delivery_rate * 100) / 100
      }
    } catch (error) {
      console.error('Error getting campaign stats:', error)
      return {
        total_campaigns: 0,
        total_recipients: 0,
        total_sent: 0,
        total_delivered: 0,
        total_opened: 0,
        total_clicked: 0,
        open_rate: 0,
        click_rate: 0,
        delivery_rate: 0
      }
    }
  }

  /**
   * Simple template processing (supports basic variable substitution)
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template

    // Replace simple variables {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processed = processed.replace(regex, String(data[key] || ''))
    })

    // Handle array loops {{#each array}} ... {{/each}}
    const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g
    processed = processed.replace(eachRegex, (match, arrayName, content) => {
      const array = data[arrayName]
      if (!Array.isArray(array)) return ''

      return array.map(item => {
        let itemContent = content
        Object.keys(item).forEach(itemKey => {
          const itemRegex = new RegExp(`{{${itemKey}}}`, 'g')
          itemContent = itemContent.replace(itemRegex, String(item[itemKey] || ''))
        })
        return itemContent
      }).join('')
    })

    return processed
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error pausing campaign:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Resume paused campaign
   */
  async resumeCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error resuming campaign:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export const campaignService = new EmailCampaignService()

// Convenience functions
export const createCampaign = (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'recipient_count' | 'delivered_count' | 'opened_count' | 'clicked_count'>) =>
  campaignService.createCampaign(campaignData)

export const getCampaigns = () => campaignService.getCampaigns()

export const sendCampaign = (campaignId: string) => campaignService.sendCampaign(campaignId)

export const processScheduledCampaigns = () => campaignService.processScheduledCampaigns()

export const getCampaignStats = (campaignId?: string) => campaignService.getCampaignStats(campaignId)