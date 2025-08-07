// Vercel API Route: Validate Promo Code
// /api/validate-promo.js

// Promo codes configuration - In production, this should come from a database
const PROMO_CODES = {
  'MILITARY10': {
    discount: 10,
    type: 'percentage',
    description: '10% off for military personnel',
    minAmount: 0,
    maxDiscount: null,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: null,
    usageCount: 0,
    active: true
  },
  'FIRSTORDER': {
    discount: 15,
    type: 'percentage',
    description: '15% off your first order',
    minAmount: 25,
    maxDiscount: 50,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: 1000,
    usageCount: 150,
    active: true
  },
  'SAVE5': {
    discount: 5,
    type: 'fixed',
    description: '£5 off your order',
    minAmount: 30,
    maxDiscount: null,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: null,
    usageCount: 0,
    active: true
  },
  'WELCOME20': {
    discount: 20,
    type: 'percentage',
    description: '20% off welcome discount',
    minAmount: 50,
    maxDiscount: 100,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-06-30'),
    usageLimit: 500,
    usageCount: 89,
    active: true
  },
  'EXPIRED10': {
    discount: 10,
    type: 'percentage',
    description: '10% off expired code',
    minAmount: 0,
    maxDiscount: null,
    validFrom: new Date('2023-01-01'),
    validUntil: new Date('2023-12-31'),
    usageLimit: null,
    usageCount: 0,
    active: false
  }
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
    const { code, subtotal, customerEmail } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({
        valid: false,
        error: 'Promo code is required'
      });
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({
        valid: false,
        error: 'Valid subtotal is required'
      });
    }

    const promoCode = code.toUpperCase().trim();
    const promo = PROMO_CODES[promoCode];

    // Check if promo code exists
    if (!promo) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid promo code'
      });
    }

    // Check if promo code is active
    if (!promo.active) {
      return res.status(200).json({
        valid: false,
        error: 'This promo code is no longer active'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < promo.validFrom) {
      return res.status(200).json({
        valid: false,
        error: 'This promo code is not yet valid'
      });
    }

    if (now > promo.validUntil) {
      return res.status(200).json({
        valid: false,
        error: 'This promo code has expired'
      });
    }

    // Check minimum amount requirement
    if (promo.minAmount && subtotal < promo.minAmount) {
      return res.status(200).json({
        valid: false,
        error: `Minimum order amount of £${promo.minAmount.toFixed(2)} required for this promo code`
      });
    }

    // Check usage limits
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return res.status(200).json({
        valid: false,
        error: 'This promo code has reached its usage limit'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = (subtotal * promo.discount) / 100;
      
      // Apply maximum discount limit if set
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else if (promo.type === 'fixed') {
      discountAmount = Math.min(promo.discount, subtotal);
    }

    // TODO: In production, you might want to:
    // 1. Check if customer has already used this promo (if it's single-use per customer)
    // 2. Log the promo validation attempt
    // 3. Update usage statistics

    // Optional: Check customer-specific restrictions
    if (customerEmail) {
      // TODO: Check customer history, first-time customer status, etc.
    }

    // Return successful validation
    return res.status(200).json({
      valid: true,
      discount: promo.discount,
      type: promo.type,
      description: promo.description,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      originalDescription: promo.description
    });

  } catch (error) {
    console.error('Promo validation error:', error);
    
    return res.status(500).json({
      valid: false,
      error: 'Failed to validate promo code. Please try again.'
    });
  }
}

// Additional helper functions that could be useful

// Function to get all active promo codes (for admin dashboard)
export function getActivePromoCodes() {
  const now = new Date();
  return Object.entries(PROMO_CODES)
    .filter(([code, promo]) => 
      promo.active && 
      now >= promo.validFrom && 
      now <= promo.validUntil &&
      (!promo.usageLimit || promo.usageCount < promo.usageLimit)
    )
    .map(([code, promo]) => ({
      code,
      ...promo,
      remainingUses: promo.usageLimit ? promo.usageLimit - promo.usageCount : null
    }));
}

// Function to increment usage count (call this from webhook when order is completed)
export function incrementPromoUsage(code) {
  const promoCode = code.toUpperCase().trim();
  if (PROMO_CODES[promoCode]) {
    PROMO_CODES[promoCode].usageCount++;
    
    // TODO: In production, update this in your database
    console.log(`Incremented usage count for ${promoCode}: ${PROMO_CODES[promoCode].usageCount}`);
  }
}