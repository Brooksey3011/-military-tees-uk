import { createProfessionalEmailBase, createPlainTextVersion } from './professional-email-base'

export interface WelcomeEmailData {
  name: string
  email: string
}

export function generateWelcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
  const content = `
    <h1>Welcome to Military Tees UK!</h1>
    
    <p>Dear <strong>${data.name}</strong>,</p>
    
    <p>Welcome to the Military Tees UK family! We're honored to have you join our community of military personnel, veterans, families, and supporters who share a passion for military heritage and premium quality apparel.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🎖️ You've Joined an Elite Community</h3>
      <p style="margin: 0;">As a member of Military Tees UK, you're now part of a community that understands military values: <strong>Honor, Quality, Service, and Pride</strong>.</p>
    </div>

    <h2>Why Military Professionals Choose Us</h2>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 12px;">🛡️ Authentic Military Heritage</h3>
      <p style="margin: 0;">Every design is created with respect and understanding of military tradition, culture, and pride. We don't just make clothing – we honor your service.</p>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 12px;">⭐ Premium Quality Standards</h3>
      <p style="margin: 0;">Military-grade durability using only the finest materials. Our apparel is built to last, just like the values you represent.</p>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 12px;">🎨 Custom Design Services</h3>
      <p style="margin: 0;">Need something unique for your unit, event, or organization? Our design team creates bespoke military-themed apparel with precision and care.</p>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 12px;">🚚 Military-Precision Delivery</h3>
      <p style="margin: 0;">Fast, secure shipping with full tracking. Plus, we offer free delivery to BFPO addresses because we support our forces wherever they serve.</p>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <h3 style="color: #6b7c3a; margin-bottom: 20px;">Ready to Get Started?</h3>
      <a href="https://militarytees.co.uk/categories" class="btn-primary" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6b7c3a 0%, #2d3e1a 100%); color: white; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 10px 10px 0;">
        Browse Collection
      </a>
      <a href="https://militarytees.co.uk/custom" class="btn-secondary" style="display: inline-block; padding: 14px 28px; background: transparent; color: #6b7c3a; text-decoration: none; border: 2px solid #6b7c3a; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
        Custom Orders
      </a>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🏆 Exclusive Member Benefits</h3>
      <p style="margin-bottom: 12px;">• <strong>Early Access:</strong> Be first to see new designs and collections</p>
      <p style="margin-bottom: 12px;">• <strong>Member Discounts:</strong> Exclusive offers and seasonal promotions</p>
      <p style="margin-bottom: 12px;">• <strong>Free BFPO Shipping:</strong> Complimentary delivery to military bases</p>
      <p style="margin-bottom: 12px;">• <strong>Priority Support:</strong> Our team prioritizes member inquiries</p>
      <p style="margin: 0;">• <strong>Custom Design Discounts:</strong> Special pricing on bespoke orders</p>
    </div>

    <h2>Popular Categories to Explore</h2>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
      <div class="info-box">
        <h4 style="margin: 0 0 8px 0; color: #6b7c3a;">🇬🇧 British Army</h4>
        <p style="margin: 0; font-size: 14px;">Infantry, armoured corps, and regiment designs</p>
      </div>
      <div class="info-box">
        <h4 style="margin: 0 0 8px 0; color: #6b7c3a;">⚓ Royal Navy</h4>
        <p style="margin: 0; font-size: 14px;">Naval traditions and fleet designs</p>
      </div>
      <div class="info-box">
        <h4 style="margin: 0 0 8px 0; color: #6b7c3a;">✈️ Royal Air Force</h4>
        <p style="margin: 0; font-size: 14px;">RAF squadron and aviation designs</p>
      </div>
      <div class="info-box">
        <h4 style="margin: 0 0 8px 0; color: #6b7c3a;">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Royal Marines</h4>
        <p style="margin: 0; font-size: 14px;">Commando and amphibious warfare designs</p>
      </div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">💬 Need Help Getting Started?</h3>
      <p style="margin-bottom: 12px;">Our customer support team understands military culture and is ready to assist with:</p>
      <p style="margin-bottom: 8px;">• Product recommendations based on your service branch</p>
      <p style="margin-bottom: 8px;">• Custom design consultations for unit apparel</p>
      <p style="margin-bottom: 8px;">• Sizing guidance and fit recommendations</p>
      <p style="margin: 0;">• Special bulk order pricing for military organizations</p>
    </div>

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border: 1px solid #e9ecef;">
      <h3 style="color: #6b7c3a; margin-bottom: 16px;">📧 Stay Connected</h3>
      <p style="margin-bottom: 16px;">Follow us for the latest designs, military heritage stories, and exclusive member offers:</p>
      <p style="margin: 0;">
        <a href="https://facebook.com/militaryteesukltd" style="margin: 0 10px; color: #6b7c3a; text-decoration: none;">Facebook</a> |
        <a href="https://instagram.com/militaryteesukltd" style="margin: 0 10px; color: #6b7c3a; text-decoration: none;">Instagram</a> |
        <a href="https://militarytees.co.uk/newsletter" style="margin: 0 10px; color: #6b7c3a; text-decoration: none;">Newsletter</a>
      </p>
    </div>

    <p>Have questions or need assistance? Our team is here to help. Simply reply to this email, and we'll get back to you promptly.</p>

    <p style="font-weight: 600; color: #6b7c3a;">Thank you for joining Military Tees UK. We look forward to serving you with the honor and excellence you deserve.</p>
    
    <p style="margin-bottom: 0;">Respectfully,<br>
    <strong>The Military Tees UK Team</strong><br>
    <em>Proudly Serving Those Who Serve</em></p>
  `

  const html = createProfessionalEmailBase(content)
  const text = createPlainTextVersion(html)

  return { html, text }
}

export function generateWelcomeEmailSubject(name: string): string {
  return `Welcome to Military Tees UK, ${name}! 🎖️`
}