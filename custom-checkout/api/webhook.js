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
  // TODO: Replace with your email service
  // Examples: Resend, SendGrid, Postmark, NodeMailer
  
  console.log('Sending confirmation email to:', orderData.customerEmail);
  
  try {
    // Mock email sending - replace with real email service
    const emailData = {
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      template: 'order-confirmation',
      data: orderData
    };
    
    // Example with Resend:
    // await resend.emails.send(emailData);
    
    console.log('Confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - email failure shouldn't fail the webhook
    return false;
  }
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