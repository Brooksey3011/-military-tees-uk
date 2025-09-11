import { createProfessionalEmailBase, createPlainTextVersion } from './professional-email-base'

export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  subtotal: number
  shipping: number
  tax: number
  total: number
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
    price: number
    total: number
    image?: string
  }>
}

export function generateOrderConfirmationEmail(data: OrderConfirmationData): { html: string; text: string } {
  const content = `
    <h1>Order Confirmed - Thank You!</h1>
    
    <p>Dear <strong>${data.customerName}</strong>,</p>
    
    <p>Thank you for your order with Military Tees UK. We're honored to serve those who serve, and we're excited to get your premium military-themed apparel to you with the precision and care you deserve.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">📋 Order Summary</h3>
      <p style="margin: 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p style="margin: 0;"><strong>Order Date:</strong> ${data.orderDate}</p>
      <p style="margin: 0;"><strong>Customer:</strong> ${data.customerName}</p>
    </div>

    <h2>Items Ordered</h2>
    <div style="border: 1px solid #e9ecef; margin: 20px 0;">
      ${data.items.map(item => `
        <div class="item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e9ecef;">
          <div class="item-details" style="flex: 1;">
            <div class="item-name" style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${item.name}</div>
            <div class="item-variant" style="color: #6c757d; font-size: 14px; margin-bottom: 4px;">${item.variant}</div>
            <div class="item-quantity" style="color: #6c757d; font-size: 14px;">Quantity: ${item.quantity}</div>
          </div>
          <div class="item-price" style="font-weight: 700; color: #6b7c3a; font-size: 16px;">
            £${item.total.toFixed(2)}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="totals-section">
      <div class="total-row" style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px;">
        <span>Subtotal:</span>
        <span>£${data.subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row" style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px;">
        <span>Shipping:</span>
        <span>£${data.shipping.toFixed(2)}</span>
      </div>
      <div class="total-row" style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px;">
        <span>VAT (20%):</span>
        <span>£${data.tax.toFixed(2)}</span>
      </div>
      <div class="total-row final" style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; color: #6b7c3a; border-top: 2px solid #6b7c3a; margin-top: 12px;">
        <span>Total:</span>
        <span>£${data.total.toFixed(2)}</span>
      </div>
    </div>

    <h2>📦 Delivery Information</h2>
    <div class="address-box">
      <strong>Shipping Address:</strong><br>
      ${data.shippingAddress.name}<br>
      ${data.shippingAddress.address_line_1}<br>
      ${data.shippingAddress.address_line_2 ? `${data.shippingAddress.address_line_2}<br>` : ''}
      ${data.shippingAddress.city}, ${data.shippingAddress.postcode}<br>
      ${data.shippingAddress.country}
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🎯 What Happens Next?</h3>
      <p style="margin-bottom: 12px;">• <strong>Order Processing:</strong> 1-2 business days (we hand-check every order)</p>
      <p style="margin-bottom: 12px;">• <strong>Production:</strong> 2-3 business days (military-grade quality takes time)</p>
      <p style="margin-bottom: 12px;">• <strong>Shipping:</strong> 2-5 business days with full tracking</p>
      <p style="margin: 0;">• <strong>Delivery:</strong> Your order arrives with military precision</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://militarytees.co.uk/track-order?order=${data.orderNumber}" class="btn-primary" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6b7c3a 0%, #2d3e1a 100%); color: white; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Track Your Order
      </a>
    </div>

    <div class="highlight-box">
      <h3 style="margin-top: 0; margin-bottom: 16px;">🛡️ Our Promise to You</h3>
      <p style="margin-bottom: 12px;">• <strong>Quality Guarantee:</strong> Military-grade materials and construction</p>
      <p style="margin-bottom: 12px;">• <strong>Secure Packaging:</strong> Your order is protected like classified intel</p>
      <p style="margin-bottom: 12px;">• <strong>Customer Support:</strong> Our team understands military culture</p>
      <p style="margin: 0;">• <strong>30-Day Returns:</strong> Not satisfied? We'll make it right, no questions asked</p>
    </div>

    <p>Questions about your order? Our support team is standing by and ready to assist. Simply reply to this email or contact us directly.</p>

    <p style="font-weight: 600; color: #6b7c3a;">Thank you for supporting military heritage and choosing Military Tees UK.</p>
    
    <p style="margin-bottom: 0;">Regards,<br>
    <strong>The Military Tees UK Team</strong><br>
    <em>Proudly Serving Those Who Serve</em></p>
  `

  const html = createProfessionalEmailBase(content)
  const text = createPlainTextVersion(html)

  return { html, text }
}

export function generateOrderConfirmationSubject(orderNumber: string): string {
  return `Order Confirmed #${orderNumber} - Military Tees UK`
}