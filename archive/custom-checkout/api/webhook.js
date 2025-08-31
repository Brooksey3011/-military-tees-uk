// Vercel API Route: Stripe Webhook Handler
// /api/webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to log events (replace with your preferred logging service)
function logEvent(eventType, data) {
  console.log(`[${new Date().toISOString()}] Webhook ${eventType}:`, JSON.stringify(data, null, 2));
  
  // TODO: Replace with your preferred logging service
  // Examples: Winston, Pino, or cloud logging service
}

// Helper function to save order (replace with your database)
async function saveOrder(orderData) {
  // TODO: Replace with your database integration
  // Examples: PostgreSQL, MongoDB, Supabase, PlanetScale
  
  console.log('Saving order:', orderData);
  
  // Mock implementation - replace with real database
  try {
    // Example structure for your database:
    const order = {
      id: orderData.paymentIntentId,
      orderNumber: `MTU-${Date.now().toString().slice(-6)}`,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      discount: orderData.discount || 0,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      deliveryOption: orderData.deliveryOption,
      promoCode: orderData.promoCode || null,
      paymentStatus: orderData.paymentStatus,
      status: orderData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Here you would save to your database
    // await db.orders.create(order);
    
    return order;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

// Helper function to send confirmation email
async function sendConfirmationEmail(orderData) {
  console.log('Sending confirmation email to:', orderData.customerEmail);
  
  try {
    // Generate HTML email template
    const emailHTML = generateOrderConfirmationEmail(orderData);
    
    // Try different email services based on available environment variables
    if (process.env.RESEND_API_KEY) {
      await sendEmailViaResend(orderData, emailHTML);
    } else if (process.env.SENDGRID_API_KEY) {
      await sendEmailViaSendGrid(orderData, emailHTML);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await sendEmailViaSMTP(orderData, emailHTML);
    } else {
      console.warn('No email service configured - email not sent');
      return false;
    }
    
    console.log('Confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - email failure shouldn't fail the webhook
    return false;
  }
}

// Email template generator
function generateOrderConfirmationEmail(orderData) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${orderData.orderNumber}</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #e1e5e9; }
        .header { background: #4a5d23; color: white; padding: 30px; text-align: center; }
        .header h1 { font-family: 'Staatliches', sans-serif; font-size: 28px; margin: 0; letter-spacing: 2px; }
        .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .order-number { background: #f8f9fa; border-left: 4px solid #4a5d23; padding: 15px; margin: 20px 0; }
        .order-number strong { color: #4a5d23; font-size: 18px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e1e5e9; }
        .items-table th { background: #f8f9fa; font-weight: 600; color: #4a5d23; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
        .total-section { background: #f8f9fa; padding: 20px; margin: 20px 0; }
        .total-line { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-line.final { border-top: 2px solid #4a5d23; padding-top: 12px; margin-top: 12px; font-weight: bold; font-size: 18px; color: #4a5d23; }
        .shipping-info { background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .trust-badge { display: inline-block; background: #4a5d23; color: white; padding: 8px 12px; margin: 5px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Military Tees UK</h1>
            <p>Proudly serving those who serve</p>
        </div>
        
        <div class="content">
            <h2 style="color: #4a5d23; margin-top: 0;">Order Confirmed! 🎖️</h2>
            <p>Thank you for your order! Your mission gear is being prepared for deployment.</p>
            
            <div class="order-number">
                <strong>Order #${orderData.orderNumber}</strong><br>
                <span style="color: #666; font-size: 14px;">Placed on ${new Date(orderData.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
            
            <h3 style="color: #4a5d23;">Order Items</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Size/Color</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.size || ''} ${item.color || ''}</td>
                        <td>${item.quantity}</td>
                        <td>£${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-line">
                    <span>Subtotal</span>
                    <span>£${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-line">
                    <span>Shipping</span>
                    <span>£${orderData.shipping.toFixed(2)}</span>
                </div>
                ${orderData.discount > 0 ? `
                <div class="total-line" style="color: #28a745;">
                    <span>Discount ${orderData.promoCode ? `(${orderData.promoCode})` : ''}</span>
                    <span>-£${orderData.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-line">
                    <span>VAT (20%)</span>
                    <span>£${orderData.tax.toFixed(2)}</span>
                </div>
                <div class="total-line final">
                    <span>Total</span>
                    <span>£${orderData.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="shipping-info">
                <h3 style="color: #4a5d23; margin-top: 0;">Shipping Information</h3>
                <p><strong>Delivery Method:</strong> ${orderData.deliveryOption || 'Standard Delivery'}</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                <p><strong>Shipping Address:</strong><br>
                ${orderData.shippingAddress ? `
                    ${orderData.shippingAddress.name}<br>
                    ${orderData.shippingAddress.line1}<br>
                    ${orderData.shippingAddress.line2 ? orderData.shippingAddress.line2 + '<br>' : ''}
                    ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postal_code}<br>
                    ${orderData.shippingAddress.country}
                ` : 'Address on file'}
                </p>
            </div>
            
            <h3 style="color: #4a5d23;">What's Next?</h3>
            <ul style="line-height: 1.8;">
                <li>📦 <strong>Processing:</strong> Your order will be packed and dispatched within 24 hours</li>
                <li>📧 <strong>Tracking:</strong> You'll receive tracking information once your order ships</li>
                <li>🚚 <strong>Delivery:</strong> Your items will arrive within 3-5 business days</li>
                <li>📞 <strong>Support:</strong> Contact us if you have any questions about your order</li>
            </ul>
        </div>
        
        <div class="footer">
            <div>
                <span class="trust-badge">🔒 SSL Encrypted</span>
                <span class="trust-badge">💳 PCI Compliant</span>
                <span class="trust-badge">↩️ 30-Day Guarantee</span>
            </div>
            <p style="margin-top: 20px;">
                Military Tees UK | Proudly serving those who serve<br>
                <a href="mailto:support@militarytees.co.uk" style="color: #4a5d23;">support@militarytees.co.uk</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Resend email service
async function sendEmailViaResend(orderData, emailHTML) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Military Tees UK <orders@militarytees.co.uk>',
        to: [orderData.customerEmail],
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html: emailHTML
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    console.log('Email sent via Resend successfully');
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
}

// SendGrid email service
async function sendEmailViaSendGrid(orderData, emailHTML) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: orderData.customerEmail }]
        }],
        from: { 
          email: 'orders@militarytees.co.uk',
          name: 'Military Tees UK'
        },
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        content: [{
          type: 'text/html',
          value: emailHTML
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log('Email sent via SendGrid successfully');
  } catch (error) {
    console.error('SendGrid email error:', error);
    throw error;
  }
}

// SMTP email service (for Gmail, etc.)
async function sendEmailViaSMTP(orderData, emailHTML) {
  // This would require importing nodemailer or similar
  // For now, just log that SMTP would be used
  console.log('SMTP email service configured but not implemented in this example');
  console.log('To implement SMTP, install nodemailer and configure with your SMTP settings');
  
  // Example implementation:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({ ... });
  // await transporter.sendMail({ ... });
}

// Helper function to update inventory
async function updateInventory(items, operation = 'decrease') {
  // TODO: Replace with your inventory system
  console.log(`${operation === 'decrease' ? 'Decreasing' : 'Increasing'} inventory for items:`, items);
  
  try {
    for (const item of items) {
      // Example inventory update
      // await db.productVariants.updateStock(item.variantId, item.quantity, operation);
    }
    console.log('Inventory updated successfully');
  } catch (error) {
    console.error('Error updating inventory:', error);
    // Don't throw - continue processing
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook endpoint secret not configured' });
  }

  let event;

  try {
    // Verify the webhook signature
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Log all events for debugging
  logEvent(event.type, {
    id: event.id,
    created: event.created,
    data: event.data.object
  });

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

        // Extract order information from metadata
        const orderData = {
          paymentIntentId: paymentIntent.id,
          orderNumber: `MTU-${Date.now().toString().slice(-6)}`,
          customerEmail: paymentIntent.metadata.customer_email,
          customerName: paymentIntent.metadata.customer_name,
          items: extractItemsFromMetadata(paymentIntent.metadata),
          subtotal: parseFloat(paymentIntent.metadata.subtotal_gbp || '0'),
          shipping: parseFloat(paymentIntent.metadata.shipping_gbp || '0'),
          tax: parseFloat(paymentIntent.metadata.tax_gbp || '0'),
          discount: parseFloat(paymentIntent.metadata.promo_discount || '0'),
          total: parseFloat(paymentIntent.metadata.total_gbp || '0'),
          deliveryOption: paymentIntent.metadata.delivery_option || 'standard',
          promoCode: paymentIntent.metadata.promo_code || null,
          paymentStatus: 'paid',
          status: 'processing',
          shippingAddress: paymentIntent.shipping?.address ? {
            name: paymentIntent.shipping.name,
            line1: paymentIntent.shipping.address.line1,
            line2: paymentIntent.shipping.address.line2,
            city: paymentIntent.shipping.address.city,
            postal_code: paymentIntent.shipping.address.postal_code,
            country: paymentIntent.shipping.address.country,
            phone: paymentIntent.shipping.phone
          } : null
        };

        // Save order to database
        await saveOrder(orderData);

        // Update inventory
        await updateInventory(orderData.items, 'decrease');

        // Send confirmation email
        await sendConfirmationEmail(orderData);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);

        // Log the failure reason
        const lastError = paymentIntent.last_payment_error;
        if (lastError) {
          console.error('Payment failure reason:', lastError.message);
        }

        // TODO: Handle failed payment
        // - Send failure notification email to customer
        // - Log for customer service follow-up
        // - Update any order status if order was pre-created

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        console.log(`🚫 Payment canceled: ${paymentIntent.id}`);

        // TODO: Handle canceled payment
        // - Restore inventory if it was decremented
        // - Clean up any temporary order records

        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object;
        console.log(`💳 Payment method attached: ${paymentMethod.id}`);
        
        // TODO: Handle payment method attachment if needed
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        console.log(`⚠️ Dispute created: ${dispute.id}`);
        
        // TODO: Handle dispute
        // - Send notification to admin
        // - Log for manual review
        // - Update order status
        
        break;
      }

      case 'invoice.payment_succeeded': {
        // Handle successful subscription payments if you add subscriptions
        const invoice = event.data.object;
        console.log(`📄 Invoice payment succeeded: ${invoice.id}`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Handle subscription events if you add subscriptions later
        const subscription = event.data.object;
        console.log(`📋 Subscription ${event.type}: ${subscription.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.status(200).json({
      received: true,
      eventType: event.type,
      eventId: event.id
    });

  } catch (error) {
    console.error(`Webhook error processing ${event.type}:`, error);
    
    // Return error response
    res.status(500).json({
      error: 'Webhook processing failed',
      eventType: event.type,
      eventId: event.id,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to extract items from metadata
function extractItemsFromMetadata(metadata) {
  const items = [];
  let index = 0;
  
  while (metadata[`item_${index}_name`]) {
    items.push({
      name: metadata[`item_${index}_name`],
      quantity: parseInt(metadata[`item_${index}_quantity`] || '1'),
      price: parseFloat(metadata[`item_${index}_price`] || '0'),
      size: metadata[`item_${index}_size`] || null,
      color: metadata[`item_${index}_color`] || null,
      variantId: metadata[`item_${index}_variant_id`] || null
    });
    index++;
  }
  
  return items;
}

// Configure API route to handle raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}