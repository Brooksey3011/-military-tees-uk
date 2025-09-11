import { createProfessionalEmailBase, createPlainTextVersion } from './professional-email-base'

export interface ShippingNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  carrier: string
  carrierUrl?: string
  estimatedDelivery: string
  shippingAddress: {
    name: string
    address_line_1: string
    address_line_2?: string
    city: string
    postcode: string
    country: string
  }
  items: Array<{
    name: string
    variant: string
    quantity: number
    image?: string
  }>
}

export function generateShippingNotificationEmail(data: ShippingNotificationData): { html: string; text: string } {
  const trackingUrl = data.carrierUrl 
    ? `${data.carrierUrl}${data.trackingNumber}`
    : `https://www.google.com/search?q=${data.carrier}+tracking+${data.trackingNumber}`

  const content = `
    <h1>Your Order is On Its Way! 📦</h1>
    
    <p>Dear <strong>${data.customerName}</strong>,</p>
    
    <p>Great news! Your Military Tees UK order has been processed, carefully packaged, and is now en route to you. Our logistics team has deployed your order with military precision.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🚚 Shipping Details</h3>
      <p style="margin-bottom: 8px;"><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p style="margin-bottom: 8px;"><strong>Tracking Number:</strong> <span style="font-family: monospace; background-color: #f8f9fa; padding: 2px 6px;">${data.trackingNumber}</span></p>
      <p style="margin-bottom: 8px;"><strong>Carrier:</strong> ${data.carrier}</p>
      <p style="margin: 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" class="btn-primary" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6b7c3a 0%, #2d3e1a 100%); color: white; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Track Your Package
      </a>
    </div>

    <h2>📍 Delivery Address</h2>
    <div class="address-box">
      ${data.shippingAddress.name}<br>
      ${data.shippingAddress.address_line_1}<br>
      ${data.shippingAddress.address_line_2 ? `${data.shippingAddress.address_line_2}<br>` : ''}
      ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
      ${data.shippingAddress.country}
    </div>

    <h2>📦 Items in This Shipment</h2>
    <div style="border: 1px solid #e9ecef; margin: 20px 0;">
      ${data.items.map(item => `
        <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #e9ecef;">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #6c757d; font-size: 14px; margin-bottom: 4px;">${item.variant}</div>
            <div style="color: #6c757d; font-size: 14px;">Quantity: ${item.quantity}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">📱 Tracking Your Order</h3>
      <p style="margin-bottom: 12px;">• <strong>Real-Time Updates:</strong> Track every step from dispatch to delivery</p>
      <p style="margin-bottom: 12px;">• <strong>SMS Notifications:</strong> Receive updates on your phone (if enabled)</p>
      <p style="margin-bottom: 12px;">• <strong>Delivery Window:</strong> Get notified when your package is out for delivery</p>
      <p style="margin: 0;">• <strong>Safe Place Options:</strong> Leave delivery instructions if needed</p>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🛡️ Military-Grade Packaging</h3>
      <p style="margin-bottom: 12px;">Your order has been packaged with the same attention to detail we apply to our designs:</p>
      <p style="margin-bottom: 8px;">• <strong>Secure Protection:</strong> Moisture-resistant packaging</p>
      <p style="margin-bottom: 8px;">• <strong>Quality Control:</strong> Each item inspected before packing</p>
      <p style="margin-bottom: 8px;">• <strong>Discrete Packaging:</strong> Professional, unmarked outer packaging</p>
      <p style="margin: 0;">• <strong>Eco-Friendly:</strong> Sustainable packaging materials where possible</p>
    </div>

    <h2>❓ Delivery FAQs</h2>
    
    <div style="margin: 20px 0;">
      <div style="margin-bottom: 20px;">
        <h4 style="color: #6b7c3a; margin-bottom: 8px;">What if I'm not home for delivery?</h4>
        <p style="margin: 0; font-size: 15px;">Most carriers will leave a note with redelivery options or take the package to a local collection point. You can usually reschedule delivery online using your tracking number.</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #6b7c3a; margin-bottom: 8px;">Can I change my delivery address?</h4>
        <p style="margin: 0; font-size: 15px;">Once shipped, address changes depend on the carrier. Contact us immediately if you need to redirect your package, and we'll do our best to help.</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #6b7c3a; margin-bottom: 8px;">What about international deliveries?</h4>
        <p style="margin: 0; font-size: 15px;">International orders may require customs clearance, which can add 1-3 days to delivery time. You may be contacted by customs or the carrier for additional information.</p>
      </div>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">📞 Need Help?</h3>
      <p style="margin-bottom: 12px;">Our support team is standing by if you have any questions about your delivery:</p>
      <p style="margin-bottom: 8px;"><strong>Email:</strong> shipping@militarytees.co.uk</p>
      <p style="margin-bottom: 8px;"><strong>Phone:</strong> +44 1234 567890</p>
      <p style="margin: 0;"><strong>Hours:</strong> Monday-Friday, 9AM-5PM GMT</p>
    </div>

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border: 1px solid #e9ecef;">
      <h3 style="color: #6b7c3a; margin-bottom: 16px;">🌟 We'd Love Your Feedback</h3>
      <p style="margin-bottom: 16px;">Once your order arrives, we'd appreciate a few minutes of your time to let us know how we did.</p>
      <a href="https://militarytees.co.uk/reviews" class="btn-secondary" style="display: inline-block; padding: 12px 24px; background: transparent; color: #6b7c3a; text-decoration: none; border: 2px solid #6b7c3a; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Leave a Review
      </a>
    </div>

    <p>We're excited for you to receive your order and hope you love wearing your Military Tees UK apparel with pride.</p>

    <p style="font-weight: 600; color: #6b7c3a;">Thank you for supporting military heritage and choosing Military Tees UK.</p>
    
    <p style="margin-bottom: 0;">Regards,<br>
    <strong>The Military Tees UK Team</strong><br>
    <em>Proudly Serving Those Who Serve</em></p>
  `

  const html = createProfessionalEmailBase(content)
  const text = createPlainTextVersion(html)

  return { html, text }
}

export function generateShippingNotificationSubject(orderNumber: string): string {
  return `Your Order #${orderNumber} Has Shipped - Military Tees UK`
}