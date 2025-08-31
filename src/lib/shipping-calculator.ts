// Military Tees UK - Advanced Shipping Calculator
// Handles dynamic shipping rates based on location and product selection

export interface ShippingZone {
  code: string
  name: string
  countries: string[]
  standardRate: number
  expressRate: number
  freeShippingThreshold: number
  standardDays: { min: number; max: number }
  expressDays: { min: number; max: number }
}

export interface ShippingRate {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  estimatedDays: { min: number; max: number }
  type: 'standard' | 'express' | 'free'
}

export interface ProductWeight {
  variantId: string
  weight: number // in grams
  requiresExpress?: boolean // some products may need express only
}

// Define shipping zones for Military Tees UK
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    code: 'UK',
    name: 'United Kingdom',
    countries: ['GB'],
    standardRate: 4.99,
    expressRate: 9.99,
    freeShippingThreshold: 50.00,
    standardDays: { min: 3, max: 7 },
    expressDays: { min: 1, max: 2 }
  },
  {
    code: 'EU',
    name: 'European Union',
    countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI'],
    standardRate: 12.99,
    expressRate: 24.99,
    freeShippingThreshold: 75.00,
    standardDays: { min: 5, max: 10 },
    expressDays: { min: 2, max: 4 }
  },
  {
    code: 'NA',
    name: 'North America',
    countries: ['US', 'CA'],
    standardRate: 15.99,
    expressRate: 29.99,
    freeShippingThreshold: 100.00,
    standardDays: { min: 7, max: 14 },
    expressDays: { min: 3, max: 5 }
  },
  {
    code: 'OCEANIA',
    name: 'Australia & New Zealand',
    countries: ['AU', 'NZ'],
    standardRate: 18.99,
    expressRate: 34.99,
    freeShippingThreshold: 100.00,
    standardDays: { min: 10, max: 18 },
    expressDays: { min: 5, max: 8 }
  },
  {
    code: 'WORLD',
    name: 'Rest of World',
    countries: ['*'], // catch-all
    standardRate: 19.99,
    expressRate: 39.99,
    freeShippingThreshold: 150.00,
    standardDays: { min: 14, max: 21 },
    expressDays: { min: 7, max: 14 }
  }
]

// Product weight database (in real app, this would come from database)
const PRODUCT_WEIGHTS: Record<string, number> = {
  // Standard t-shirts/apparel
  'default': 200, // 200g average
  // Heavier items like hoodies
  'hoodie': 500,
  // Light items like patches
  'patch': 50
}

export class ShippingCalculator {
  
  /**
   * Get shipping zone for a country code
   */
  static getShippingZone(countryCode: string): ShippingZone {
    const upperCountry = countryCode.toUpperCase()
    
    // Find specific zone first
    for (const zone of SHIPPING_ZONES) {
      if (zone.countries.includes(upperCountry)) {
        return zone
      }
    }
    
    // Default to world zone
    return SHIPPING_ZONES.find(z => z.code === 'WORLD')!
  }

  /**
   * Calculate total weight of products
   */
  static calculateTotalWeight(items: Array<{ variantId: string; quantity: number }>): number {
    return items.reduce((total, item) => {
      const weight = PRODUCT_WEIGHTS[item.variantId] || PRODUCT_WEIGHTS.default
      return total + (weight * item.quantity)
    }, 0)
  }

  /**
   * Calculate shipping rates for given parameters
   */
  static calculateShippingRates(params: {
    items: Array<{ variantId: string; quantity: number; price: number }>
    countryCode: string
    subtotal: number
  }): ShippingRate[] {
    const { items, countryCode, subtotal } = params
    const zone = this.getShippingZone(countryCode)
    const totalWeight = this.calculateTotalWeight(items)
    const rates: ShippingRate[] = []

    // Weight-based rate adjustment (for very heavy orders)
    const weightMultiplier = totalWeight > 1000 ? 1.5 : 1.0 // 50% increase for >1kg

    // Standard Shipping
    let standardRate = zone.standardRate * weightMultiplier
    let expressRate = zone.expressRate * weightMultiplier

    // Check for free shipping
    const qualifiesForFreeShipping = subtotal >= zone.freeShippingThreshold

    if (qualifiesForFreeShipping) {
      rates.push({
        id: 'free-standard',
        name: 'Free Standard Shipping',
        description: `Free delivery (${zone.standardDays.min}–${zone.standardDays.max} business days)`,
        amount: 0,
        currency: 'gbp',
        estimatedDays: zone.standardDays,
        type: 'free'
      })
    } else {
      rates.push({
        id: 'standard',
        name: 'Standard Shipping',
        description: `Standard delivery (${zone.standardDays.min}–${zone.standardDays.max} business days)`,
        amount: Math.round(standardRate * 100) / 100,
        currency: 'gbp',
        estimatedDays: zone.standardDays,
        type: 'standard'
      })
    }

    // Express Shipping (always available)
    rates.push({
      id: 'express',
      name: 'Express Shipping',
      description: `Express delivery (${zone.expressDays.min}–${zone.expressDays.max} business days)`,
      amount: Math.round(expressRate * 100) / 100,
      currency: 'gbp',
      estimatedDays: zone.expressDays,
      type: 'express'
    })

    return rates
  }

  /**
   * Get shipping rate by ID (for webhook processing)
   */
  static getShippingRateById(rateId: string, countryCode: string, subtotal: number): ShippingRate | null {
    const zone = this.getShippingZone(countryCode)
    
    switch (rateId) {
      case 'free-standard':
        return {
          id: 'free-standard',
          name: 'Free Standard Shipping',
          description: `Free delivery (${zone.standardDays.min}–${zone.standardDays.max} business days)`,
          amount: 0,
          currency: 'gbp',
          estimatedDays: zone.standardDays,
          type: 'free'
        }
      
      case 'standard':
        return {
          id: 'standard',
          name: 'Standard Shipping',
          description: `Standard delivery (${zone.standardDays.min}–${zone.standardDays.max} business days)`,
          amount: zone.standardRate,
          currency: 'gbp',
          estimatedDays: zone.standardDays,
          type: 'standard'
        }
      
      case 'express':
        return {
          id: 'express',
          name: 'Express Shipping',
          description: `Express delivery (${zone.expressDays.min}–${zone.expressDays.max} business days)`,
          amount: zone.expressRate,
          currency: 'gbp',
          estimatedDays: zone.expressDays,
          type: 'express'
        }
      
      default:
        return null
    }
  }

  /**
   * Validate if country code is supported
   */
  static isCountrySupported(countryCode: string): boolean {
    return this.getShippingZone(countryCode).code !== 'WORLD' || countryCode === '*'
  }

  /**
   * Get estimated delivery date
   */
  static getEstimatedDeliveryDate(rateId: string, countryCode: string): { min: Date; max: Date } {
    const rate = this.getShippingRateById(rateId, countryCode, 0)
    const now = new Date()
    
    if (!rate) {
      // Default fallback
      const minDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
      const maxDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000))
      return { min: minDate, max: maxDate }
    }

    const minDate = new Date(now.getTime() + (rate.estimatedDays.min * 24 * 60 * 60 * 1000))
    const maxDate = new Date(now.getTime() + (rate.estimatedDays.max * 24 * 60 * 60 * 1000))
    
    return { min: minDate, max: maxDate }
  }
}

// Helper function for Stripe integration
export function createStripeShippingOptions(rates: ShippingRate[]) {
  return rates.map(rate => ({
    shipping_rate_data: {
      type: 'fixed_amount' as const,
      fixed_amount: {
        amount: Math.round(rate.amount * 100), // Convert to pence
        currency: rate.currency
      },
      display_name: rate.name,
      delivery_estimate: {
        minimum: { unit: 'business_day' as const, value: rate.estimatedDays.min },
        maximum: { unit: 'business_day' as const, value: rate.estimatedDays.max }
      },
      metadata: {
        rate_id: rate.id,
        rate_type: rate.type,
        description: rate.description
      }
    }
  }))
}