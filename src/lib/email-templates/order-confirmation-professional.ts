interface OrderItem {
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

interface OrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    address2?: string
    city: string
    postcode: string
    country: string
    company?: string
  }
  shippingMethod: string
  estimatedDelivery: string
}

export function generateOrderConfirmationHTML(order: OrderData): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${item.image ? `
            <img src="${item.image}" alt="${item.name}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;">
          ` : `
            <div style="width: 60px; height: 60px; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 12px;">
              IMG
            </div>
          `}
          <div style="flex: 1;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #111827;">${item.name}</h3>
            ${(item.size || item.color) ? `
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">
                ${item.size ? `Size: ${item.size}` : ''}${item.size && item.color ? ' • ' : ''}${item.color ? `Color: ${item.color}` : ''}
              </p>
            ` : ''}
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">£${(item.price * item.quantity).toFixed(2)}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">£${item.price.toFixed(2)} each</p>
          </div>
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Military Tees UK</title>
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 0;">
        
        <!-- Email Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #065f46 100%); color: white; padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">MILITARY TEES UK</h1>
                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Proudly serving those who serve</p>
            </div>
            
            <!-- Order Confirmation -->
            <div style="padding: 40px;">
                
                <!-- Success Message -->
                <div style="text-align: center; margin-bottom: 30px; padding: 25px; background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 12px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #065f46;">Order Confirmed!</h2>
                    <p style="margin: 0; color: #047857; font-size: 16px;">Thank you for your order, ${order.customerName}. Your order has been received and is being processed.</p>
                </div>
                
                <!-- Order Details -->
                <div style="margin-bottom: 30px; padding: 25px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Details</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #374151;">Order Number</p>
                            <p style="margin: 0; font-size: 16px; color: #111827; font-family: monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #d1d5db;">${order.orderNumber}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #374151;">Order Date</p>
                            <p style="margin: 0; font-size: 16px; color: #111827;">${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHTML}
                    </table>
                </div>
                
                <!-- Order Summary -->
                <div style="margin-bottom: 30px; padding: 25px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Summary</h3>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Subtotal (${order.items.reduce((sum, item) => sum + item.quantity, 0)} items)</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">£${order.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Shipping</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: ${order.shipping === 0 ? '#059669' : '#111827'};">
                                ${order.shipping === 0 ? 'FREE' : `£${order.shipping.toFixed(2)}`}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">VAT (20%)</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">£${order.tax.toFixed(2)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #d1d5db;">
                            <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: 700; color: #111827;">Total</td>
                            <td style="padding: 15px 0 0 0; text-align: right; font-size: 20px; font-weight: 700; color: #059669;">£${order.total.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Shipping Information -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Shipping Information</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                        <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #374151;">Delivery Address</h4>
                            <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                ${order.shippingAddress.company ? `<p style="margin: 0 0 2px 0; font-weight: 500;">${order.shippingAddress.company}</p>` : ''}
                                <p style="margin: 0 0 2px 0;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                                <p style="margin: 0 0 2px 0;">${order.shippingAddress.address1}</p>
                                ${order.shippingAddress.address2 ? `<p style="margin: 0 0 2px 0;">${order.shippingAddress.address2}</p>` : ''}
                                <p style="margin: 0 0 2px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postcode}</p>
                                <p style="margin: 0; font-weight: 500;">${order.shippingAddress.country}</p>
                            </div>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #374151;">Delivery Method</h4>
                            <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                <p style="margin: 0 0 8px 0; font-weight: 500; color: #111827;">${order.shippingMethod}</p>
                                <p style="margin: 0; display: flex; align-items: center; gap: 5px;">
                                    <span style="font-size: 12px;">📦</span>
                                    <span>Estimated delivery: ${order.estimatedDelivery}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Next Steps -->
                <div style="margin-bottom: 30px; padding: 25px; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-radius: 12px; border: 1px solid #a7f3d0;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #065f46;">What happens next?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #047857;">
                        <li style="margin-bottom: 8px;">We'll start processing your order within 1-2 business days</li>
                        <li style="margin-bottom: 8px;">You'll receive tracking information once your order ships</li>
                        <li style="margin-bottom: 8px;">Your order will be delivered to the address provided above</li>
                        <li>If you have any questions, contact our support team</li>
                    </ul>
                </div>
                
                <!-- Support Information -->
                <div style="text-align: center; padding: 25px; background-color: #f3f4f6; border-radius: 12px; border: 1px solid #d1d5db;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #111827;">Need Help?</h3>
                    <p style="margin: 0 0 15px 0; color: #6b7280;">Our military support team is here to help with your order.</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div>
                            <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151;">📧 Email</p>
                            <a href="mailto:orders@militarytees.co.uk" style="color: #059669; text-decoration: none; font-size: 14px;">orders@militarytees.co.uk</a>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151;">📞 Phone</p>
                            <a href="tel:08001234567" style="color: #059669; text-decoration: none; font-size: 14px;">0800 123 4567</a>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151;">💬 Live Chat</p>
                            <a href="https://militarytees.co.uk/support" style="color: #059669; text-decoration: none; font-size: 14px;">militarytees.co.uk</a>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111827; color: #9ca3af; padding: 30px 40px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">Thank you for supporting Military Tees UK</p>
                <p style="margin: 0 0 15px 0; font-size: 12px;">This email was sent to ${order.customerEmail}</p>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                    Military Tees UK | Proudly serving those who serve<br>
                    <a href="mailto:hello@militarytees.co.uk" style="color: #6b7280; text-decoration: none;">hello@militarytees.co.uk</a>
                </p>
            </div>
            
        </div>
        
    </body>
    </html>
  `
}