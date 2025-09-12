import { createProfessionalEmailBase, createPlainTextVersion } from './professional-email-base'

export interface CustomQuoteData {
  name: string
  email: string
  orderType: string
  description: string
  quantity: number
  images?: string[]
  requestDate: string
  urgency?: 'standard' | 'priority' | 'rush'
  budget?: string
}

export function generateCustomQuoteEmail(data: CustomQuoteData): { html: string; text: string } {
  const urgencyText = data.urgency === 'rush' ? 'Rush Order' : 
                     data.urgency === 'priority' ? 'Priority Request' : 
                     'Standard Request'

  const content = `
    <h1>Custom Quote Request Received 🎨</h1>
    
    <p>Dear <strong>${data.name}</strong>,</p>
    
    <p>Thank you for your custom design request with Military Tees UK. Our specialized design team has received your requirements and will review them with the precision and attention to detail that military heritage demands.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">📋 Your Request Summary</h3>
      <p style="margin-bottom: 8px;"><strong>Request Type:</strong> ${data.orderType}</p>
      <p style="margin-bottom: 8px;"><strong>Estimated Quantity:</strong> ${data.quantity} units</p>
      <p style="margin-bottom: 8px;"><strong>Request Date:</strong> ${data.requestDate}</p>
      <p style="margin-bottom: 8px;"><strong>Priority:</strong> <span style="color: ${data.urgency === 'rush' ? '#dc3545' : data.urgency === 'priority' ? '#fd7e14' : '#6b7c3a'}">${urgencyText}</span></p>
      ${data.budget ? `<p style="margin: 0;"><strong>Budget Range:</strong> ${data.budget}</p>` : ''}
    </div>

    <h2>📝 Your Design Brief</h2>
    <div class="info-box">
      <p style="margin: 0; white-space: pre-wrap; font-style: italic; padding: 12px; background-color: white; border-left: 3px solid #6b7c3a;">"${data.description}"</p>
    </div>

    ${data.images && data.images.length > 0 ? `
    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 12px;">🖼️ Reference Materials</h3>
      <p style="margin: 0;">You've provided <strong>${data.images.length}</strong> reference image${data.images.length > 1 ? 's' : ''} to help our design team understand your vision. These will be carefully reviewed and used as inspiration for your custom design.</p>
    </div>
    ` : ''}

    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🎯 Our Design Process</h3>
      <div style="margin-bottom: 16px;">
        <strong style="color: #6b7c3a;">1. Initial Review (24-48 hours)</strong><br>
        <span style="font-size: 14px; color: #6c757d;">Our design team analyzes your requirements and reference materials</span>
      </div>
      <div style="margin-bottom: 16px;">
        <strong style="color: #6b7c3a;">2. Consultation Call (2-3 business days)</strong><br>
        <span style="font-size: 14px; color: #6c757d;">We'll contact you to discuss details and provide a detailed quote</span>
      </div>
      <div style="margin-bottom: 16px;">
        <strong style="color: #6b7c3a;">3. Concept Creation (3-5 business days)</strong><br>
        <span style="font-size: 14px; color: #6c757d;">Upon approval, we create initial design concepts for your review</span>
      </div>
      <div style="margin-bottom: 0;">
        <strong style="color: #6b7c3a;">4. Final Refinement</strong><br>
        <span style="font-size: 14px; color: #6c757d;">We work with you to perfect the design before production begins</span>
      </div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">💡 What Makes Our Custom Service Different</h3>
      <p style="margin-bottom: 12px;">• <strong>Military Heritage Expertise:</strong> Deep understanding of military culture and traditions</p>
      <p style="margin-bottom: 12px;">• <strong>Professional Grade Quality:</strong> Premium materials and construction standards</p>
      <p style="margin-bottom: 12px;">• <strong>Collaborative Approach:</strong> You're involved in every step of the design process</p>
      <p style="margin-bottom: 12px;">• <strong>Bulk Order Specialists:</strong> Competitive pricing for unit and organization orders</p>
      <p style="margin: 0;">• <strong>Fast Turnaround:</strong> Rush options available for time-sensitive requirements</p>
    </div>

    ${data.urgency === 'rush' ? `
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-left: 4px solid #fd7e14;">
      <h3 style="margin-top: 0; margin-bottom: 12px; color: #fd7e14;">⚡ Rush Order Processing</h3>
      <p style="margin: 0;">We understand you need this quickly! Your rush request will be prioritized and you can expect initial contact within 4-6 hours during business hours. Rush orders may incur additional fees depending on timeline and complexity.</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://militarytees.co.uk/custom/status" class="btn-primary" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6b7c3a 0%, #2d3e1a 100%); color: white; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-right: 10px;">
        Track Request Status
      </a>
      <a href="https://militarytees.co.uk/custom/gallery" class="btn-secondary" style="display: inline-block; padding: 14px 28px; background: transparent; color: #6b7c3a; text-decoration: none; border: 2px solid #6b7c3a; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        View Our Portfolio
      </a>
    </div>

    <h2>📞 Need to Make Changes or Have Questions?</h2>
    
    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">Contact Our Design Team</h3>
      <p style="margin-bottom: 12px;"><strong>📧 Email:</strong> custom@militarytees.co.uk</p>
      <p style="margin-bottom: 12px;"><strong>📞 Phone:</strong> +44 1234 567890 (ext. 2)</p>
      <p style="margin-bottom: 12px;"><strong>💬 WhatsApp:</strong> +44 7123 456789</p>
      <p style="margin-bottom: 12px;"><strong>🕐 Hours:</strong> Monday-Friday, 9AM-5PM GMT</p>
      <p style="margin: 0;"><strong>⚡ Rush Support:</strong> Available 7 days a week for urgent requests</p>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">💰 Custom Order Pricing</h3>
      <p style="margin-bottom: 12px;"><strong>Design Fee:</strong> £50-150 (depending on complexity, waived on orders over £500)</p>
      <p style="margin-bottom: 12px;"><strong>Unit Pricing:</strong> Decreases with quantity (bulk discounts available)</p>
      <p style="margin-bottom: 12px;"><strong>Rush Orders:</strong> 25-50% surcharge for expedited service</p>
      <p style="margin: 0;"><strong>Military Discount:</strong> 10% off for serving personnel and veterans</p>
    </div>

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border: 1px solid #e9ecef;">
      <h3 style="color: #6b7c3a; margin-bottom: 16px;">🌟 Join Our Custom Design Community</h3>
      <p style="margin-bottom: 16px;">Follow our custom design projects and see what we're creating for other military organizations:</p>
      <p style="margin: 0;">
        <a href="https://instagram.com/militaryteesukltd" style="margin: 0 10px; color: #6b7c3a; text-decoration: none;">Instagram Portfolio</a> |
        <a href="https://www.facebook.com/people/Military-Tees-UK-Ltd/61577312099036/" style="margin: 0 10px; color: #6b7c3a; text-decoration: none;">Facebook Gallery</a>
      </p>
    </div>

    <p>We're genuinely excited to bring your military-themed vision to life! Our design team takes pride in creating apparel that honors military heritage while meeting the highest standards of quality and authenticity.</p>

    <p style="font-weight: 600; color: #6b7c3a;">Thank you for choosing Military Tees UK for your custom design needs. We look forward to creating something exceptional together.</p>
    
    <p style="margin-bottom: 0;">Respectfully,<br>
    <strong>The Military Tees UK Design Team</strong><br>
    <em>Creating Military Heritage with Pride</em></p>
  `

  const html = createProfessionalEmailBase(content)
  const text = createPlainTextVersion(html)

  return { html, text }
}

export function generateCustomQuoteSubject(name: string, orderType: string): string {
  return `Custom ${orderType} Request Received - Military Tees UK`
}