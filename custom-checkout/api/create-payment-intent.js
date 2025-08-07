// Vercel API Route: Create Payment Intent
// /api/create-payment-intent.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Promo codes configuration
const VALID_PROMO_CODES = {
  'MILITARY10': { discount: 10, type: 'percentage', description: '10% off for military personnel' },
  'FIRSTORDER': { discount: 15, type: 'percentage', description: '15% off your first order' },
  'SAVE5': { discount: 5, type: 'fixed', description: '£5 off your order' },
  'WELCOME20': { discount: 20, type: 'percentage', description: '20% off welcome discount' }
};

// Delivery options configuration
const DELIVERY_OPTIONS = {
  'standard': { name: 'Standard Delivery', price: 4.99, estimatedDays: '3-5 business days' },
  'express': { name: 'Express Delivery', price: 8.99, estimatedDays: '1 business day' },
  'premium': { name: 'Premium Delivery', price: 12.99, estimatedDays: '1-2 business days' }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating payment intent...');
    
    const { 
      items, 
      amount, 
      currency = 'gbp',
      shippingAddress,
      deliveryOption = 'standard',
      promoCode 
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    if (!shippingAddress || !shippingAddress.email) {
      return res.status(400).json({ error: 'Valid shipping address with email is required' });
    }

    if (!amount || amount < 50) { // Minimum 50 pence
      return res.status(400).json({ error: 'Valid amount is required (minimum £0.50)' });
    }

    // Validate delivery option
    const selectedDelivery = DELIVERY_OPTIONS[deliveryOption];
    if (!selectedDelivery) {
      return res.status(400).json({ error: 'Invalid delivery option' });
    }

    // Calculate and validate totals server-side
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let appliedPromo = null;

    // Apply promo code if provided
    if (promoCode) {
      const promo = VALID_PROMO_CODES[promoCode.toUpperCase()];
      if (promo) {
        appliedPromo = { code: promoCode.toUpperCase(), ...promo };
        if (promo.type === 'percentage') {
          discount = (subtotal * promo.discount) / 100;
        } else if (promo.type === 'fixed') {
          discount = Math.min(promo.discount, subtotal);
        }
      }
    }

    // Calculate final totals
    const discountedSubtotal = subtotal - discount;
    const shipping = selectedDelivery.price;
    const taxableAmount = discountedSubtotal + shipping;
    const tax = taxableAmount * 0.2; // 20% VAT
    const total = discountedSubtotal + shipping + tax;

    // Validate the provided amount matches our calculation (with small tolerance for rounding)
    const calculatedAmountInPence = Math.round(total * 100);
    if (Math.abs(amount - calculatedAmountInPence) > 1) {
      console.warn(`Amount mismatch: provided ${amount}, calculated ${calculatedAmountInPence}`);
      // Use our calculated amount for security
    }

    // Create metadata for the payment
    const metadata = {
      customer_email: shippingAddress.email,
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      item_count: items.length.toString(),
      subtotal_gbp: subtotal.toFixed(2),
      shipping_gbp: shipping.toFixed(2),
      tax_gbp: tax.toFixed(2),
      total_gbp: total.toFixed(2),
      checkout_type: 'custom_checkout',
      delivery_option: deliveryOption,
      delivery_name: selectedDelivery.name,
      delivery_cost: selectedDelivery.price.toString(),
      delivery_estimate: selectedDelivery.estimatedDays,
      order_timestamp: new Date().toISOString()
    };

    if (appliedPromo) {
      metadata.promo_code = appliedPromo.code;
      metadata.promo_discount = discount.toFixed(2);
      metadata.promo_type = appliedPromo.type;
      metadata.promo_description = appliedPromo.description;
    }

    // Add item details to metadata (Stripe has a limit, so we'll add key items)
    items.slice(0, 5).forEach((item, index) => {
      metadata[`item_${index}_name`] = (item.name || 'Unknown Item').substring(0, 100);
      metadata[`item_${index}_quantity`] = item.quantity?.toString() || '1';
      metadata[`item_${index}_price`] = item.price?.toString() || '0';
      if (item.size) metadata[`item_${index}_size`] = item.size.substring(0, 50);
      if (item.color) metadata[`item_${index}_color`] = item.color.substring(0, 50);
    });

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedAmountInPence,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Better UX for single page checkout
      },
      metadata,
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        phone: shippingAddress.phone || undefined,
        address: {
          line1: shippingAddress.address1,
          line2: shippingAddress.address2 || undefined,
          city: shippingAddress.city,
          postal_code: shippingAddress.postcode,
          country: shippingAddress.country || 'GB',
        },
      },
      receipt_email: shippingAddress.email,
      description: `Military Tees UK Order - ${items.length} item(s)${appliedPromo ? ` - ${appliedPromo.code}` : ''}`,
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

    // Return response
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      deliveryOption: selectedDelivery,
      appliedPromo,
      calculatedTotal: {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);

    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Payment setup failed',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'Internal server error while setting up payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}