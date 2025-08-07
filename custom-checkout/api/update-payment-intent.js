// Vercel API Route: Update Payment Intent
// /api/update-payment-intent.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Same configuration as create-payment-intent
const VALID_PROMO_CODES = {
  'MILITARY10': { discount: 10, type: 'percentage', description: '10% off for military personnel' },
  'FIRSTORDER': { discount: 15, type: 'percentage', description: '15% off your first order' },
  'SAVE5': { discount: 5, type: 'fixed', description: '£5 off your order' },
  'WELCOME20': { discount: 20, type: 'percentage', description: '20% off welcome discount' }
};

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
    const { 
      paymentIntentId, 
      amount, 
      deliveryOption, 
      promoCode 
    } = req.body;

    // Validation
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Valid amount is required (minimum £0.50)' });
    }

    // Get the existing payment intent
    const existingPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!existingPaymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    // Validate delivery option
    const selectedDelivery = DELIVERY_OPTIONS[deliveryOption || 'standard'];
    if (!selectedDelivery) {
      return res.status(400).json({ error: 'Invalid delivery option' });
    }

    // Validate promo code if provided
    let appliedPromo = null;
    if (promoCode) {
      const promo = VALID_PROMO_CODES[promoCode.toUpperCase()];
      if (promo) {
        appliedPromo = { code: promoCode.toUpperCase(), ...promo };
      }
    }

    // Extract original items from metadata for recalculation
    const items = [];
    let index = 0;
    while (existingPaymentIntent.metadata[`item_${index}_name`]) {
      items.push({
        name: existingPaymentIntent.metadata[`item_${index}_name`],
        quantity: parseInt(existingPaymentIntent.metadata[`item_${index}_quantity`] || '1'),
        price: parseFloat(existingPaymentIntent.metadata[`item_${index}_price`] || '0'),
        size: existingPaymentIntent.metadata[`item_${index}_size`],
        color: existingPaymentIntent.metadata[`item_${index}_color`]
      });
      index++;
    }

    // Recalculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        discount = (subtotal * appliedPromo.discount) / 100;
      } else if (appliedPromo.type === 'fixed') {
        discount = Math.min(appliedPromo.discount, subtotal);
      }
    }

    const discountedSubtotal = subtotal - discount;
    const shipping = selectedDelivery.price;
    const taxableAmount = discountedSubtotal + shipping;
    const tax = taxableAmount * 0.2; // 20% VAT
    const total = discountedSubtotal + shipping + tax;
    const calculatedAmountInPence = Math.round(total * 100);

    // Update metadata
    const updatedMetadata = {
      ...existingPaymentIntent.metadata,
      shipping_gbp: shipping.toFixed(2),
      tax_gbp: tax.toFixed(2),
      total_gbp: total.toFixed(2),
      delivery_option: deliveryOption || 'standard',
      delivery_name: selectedDelivery.name,
      delivery_cost: selectedDelivery.price.toString(),
      delivery_estimate: selectedDelivery.estimatedDays,
      updated_at: new Date().toISOString()
    };

    // Update promo code info
    if (appliedPromo) {
      updatedMetadata.promo_code = appliedPromo.code;
      updatedMetadata.promo_discount = discount.toFixed(2);
      updatedMetadata.promo_type = appliedPromo.type;
      updatedMetadata.promo_description = appliedPromo.description;
    } else {
      // Remove promo code metadata if no promo applied
      delete updatedMetadata.promo_code;
      delete updatedMetadata.promo_discount;
      delete updatedMetadata.promo_type;
      delete updatedMetadata.promo_description;
    }

    // Update the payment intent
    const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: calculatedAmountInPence,
      metadata: updatedMetadata,
      description: `Military Tees UK Order - ${items.length} item(s)${appliedPromo ? ` - ${appliedPromo.code}` : ''}`
    });

    console.log(`Payment intent updated: ${paymentIntentId}, new amount: ${calculatedAmountInPence}`);

    res.status(200).json({
      success: true,
      paymentIntentId: updatedPaymentIntent.id,
      amount: calculatedAmountInPence,
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
    console.error('Payment intent update error:', error);

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid payment intent update request',
        details: error.message
      });
    }

    return res.status(500).json({
      error: 'Failed to update payment intent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}