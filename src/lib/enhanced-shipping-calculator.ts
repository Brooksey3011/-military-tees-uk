// Enhanced Military Tees UK Shipping Calculator with BFPO Support
// Handles Royal Mail, BFPO, and courier services for military personnel

export interface EnhancedShippingZone {
  code: string
  name: string
  countries: string[]
  services: ShippingService[]
  freeShippingThreshold: number
  description?: string
}

export interface ShippingService {
  id: string
  name: string
  carrier: string
  type: 'standard' | 'express' | 'bfpo_standard' | 'bfpo_express' | 'courier'
  baseRate: number
  weightMultiplier?: number
  estimatedDays: { min: number; max: number }
  maxWeight?: number // in grams
  requiresSignature?: boolean
  trackingIncluded: boolean
  description: string
}

export interface ShippingQuote {
  service: ShippingService
  zone: EnhancedShippingZone
  finalRate: number
  estimatedDelivery: { min: Date; max: Date }
  isFree: boolean
  weightAdjustment?: number
  specialInstructions?: string
}

// Enhanced shipping zones including BFPO
export const ENHANCED_SHIPPING_ZONES: EnhancedShippingZone[] = [
  {
    code: 'UK',
    name: 'United Kingdom',
    countries: ['GB'],
    freeShippingThreshold: 50.00,
    description: 'Mainland UK addresses',
    services: [
      {
        id: 'uk-royal-mail-standard',
        name: 'Royal Mail Standard',
        carrier: 'Royal Mail',
        type: 'standard',
        baseRate: 4.99,
        estimatedDays: { min: 2, max: 5 },
        trackingIncluded: true,
        description: '2nd Class Signed For - tracked and secure'
      },
      {
        id: 'uk-royal-mail-express',
        name: 'Royal Mail Express',
        carrier: 'Royal Mail',
        type: 'express',
        baseRate: 9.99,
        estimatedDays: { min: 1, max: 2 },
        requiresSignature: true,
        trackingIncluded: true,
        description: '1st Class Signed For - next working day delivery'
      },
      {
        id: 'uk-dpd-courier',
        name: 'DPD Next Day',
        carrier: 'DPD',
        type: 'courier',
        baseRate: 12.99,
        estimatedDays: { min: 1, max: 1 },
        requiresSignature: true,
        trackingIncluded: true,
        maxWeight: 20000, // 20kg
        description: 'DPD next working day courier with 1-hour delivery window'
      }
    ]
  },
  {
    code: 'BFPO',
    name: 'British Forces Post Office',
    countries: ['BFPO'],
    freeShippingThreshold: 40.00,
    description: 'British military personnel overseas',
    services: [
      {
        id: 'bfpo-standard',
        name: 'BFPO Standard Post',
        carrier: 'Royal Mail BFPO',
        type: 'bfpo_standard',
        baseRate: 3.99,
        estimatedDays: { min: 5, max: 14 },
        trackingIncluded: false,
        description: 'Surface mail to BFPO address - economical option'
      },
      {
        id: 'bfpo-priority',
        name: 'BFPO Priority Post',
        carrier: 'Royal Mail BFPO',
        type: 'bfpo_express',
        baseRate: 8.99,
        estimatedDays: { min: 3, max: 7 },
        trackingIncluded: true,
        requiresSignature: true,
        description: 'Airmail to BFPO address - faster delivery with tracking'
      }
    ]
  },
  {
    code: 'NI',
    name: 'Northern Ireland',
    countries: ['GB-NIR'],
    freeShippingThreshold: 50.00,
    description: 'Northern Ireland addresses',
    services: [
      {
        id: 'ni-royal-mail-standard',
        name: 'Royal Mail Standard (NI)',
        carrier: 'Royal Mail',
        type: 'standard',
        baseRate: 5.99,
        estimatedDays: { min: 3, max: 6 },
        trackingIncluded: true,
        description: '2nd Class Signed For to Northern Ireland'
      },
      {
        id: 'ni-royal-mail-express',
        name: 'Royal Mail Express (NI)',
        carrier: 'Royal Mail',
        type: 'express',
        baseRate: 11.99,
        estimatedDays: { min: 1, max: 3 },
        requiresSignature: true,
        trackingIncluded: true,
        description: '1st Class Signed For to Northern Ireland'
      }
    ]
  },
  {
    code: 'EU',
    name: 'European Union',
    countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'IE', 'AT', 'PT', 'DK', 'SE', 'FI', 'LU', 'MT', 'CY'],
    freeShippingThreshold: 75.00,
    description: 'European Union member states',
    services: [
      {
        id: 'eu-royal-mail-international',
        name: 'Royal Mail International Standard',
        carrier: 'Royal Mail International',
        type: 'standard',
        baseRate: 12.99,
        weightMultiplier: 1.2,
        estimatedDays: { min: 5, max: 10 },
        trackingIncluded: true,
        maxWeight: 2000, // 2kg limit
        description: 'International Signed delivery to EU'
      },
      {
        id: 'eu-royal-mail-tracked',
        name: 'Royal Mail International Tracked',
        carrier: 'Royal Mail International',
        type: 'express',
        baseRate: 24.99,
        weightMultiplier: 1.3,
        estimatedDays: { min: 3, max: 5 },
        requiresSignature: true,
        trackingIncluded: true,
        maxWeight: 2000,
        description: 'International Tracked & Signed to EU'
      }
    ]
  },
  {
    code: 'WORLD',
    name: 'Rest of World',
    countries: ['*'],
    freeShippingThreshold: 150.00,
    description: 'International destinations outside EU',
    services: [
      {
        id: 'world-royal-mail-international',
        name: 'Royal Mail International Standard',
        carrier: 'Royal Mail International',
        type: 'standard',
        baseRate: 19.99,
        weightMultiplier: 1.5,
        estimatedDays: { min: 10, max: 21 },
        trackingIncluded: true,
        maxWeight: 2000,
        description: 'International delivery worldwide'
      },
      {
        id: 'world-royal-mail-tracked',
        name: 'Royal Mail International Tracked',
        carrier: 'Royal Mail International',
        type: 'express',
        baseRate: 39.99,
        weightMultiplier: 1.6,
        estimatedDays: { min: 5, max: 14 },
        requiresSignature: true,
        trackingIncluded: true,
        maxWeight: 2000,
        description: 'International Tracked & Signed worldwide'
      }
    ]
  }
]

export class EnhancedShippingCalculator {
  
  /**
   * Detect if address is BFPO (British Forces Post Office)
   */
  static isBFPOAddress(address: {
    line1?: string
    line2?: string
    city?: string
    postcode?: string
    country?: string
  }): boolean {
    const addressText = `${address.line1} ${address.line2} ${address.city} ${address.postcode} ${address.country}`.toLowerCase()
    
    // Common BFPO indicators
    const bfpoIndicators = [
      'bfpo',
      'british forces',
      'forces post office',
      'army post office',
      'naval post office',
      'raf post office'
    ]
    
    return bfpoIndicators.some(indicator => addressText.includes(indicator))
  }

  /**
   * Get appropriate shipping zone based on country code and address
   */
  static getShippingZone(countryCode: string, address?: any): EnhancedShippingZone {
    const upperCountry = countryCode.toUpperCase()
    
    // Check for BFPO first regardless of country code
    if (address && this.isBFPOAddress(address)) {
      return ENHANCED_SHIPPING_ZONES.find(z => z.code === 'BFPO')!
    }
    
    // Check for Northern Ireland
    if (upperCountry === 'GB' && address?.postcode?.toUpperCase()?.startsWith('BT')) {
      return ENHANCED_SHIPPING_ZONES.find(z => z.code === 'NI')!
    }
    
    // Find specific zone
    for (const zone of ENHANCED_SHIPPING_ZONES) {
      if (zone.countries.includes(upperCountry)) {
        return zone
      }
    }
    
    // Default to world zone
    return ENHANCED_SHIPPING_ZONES.find(z => z.code === 'WORLD')!
  }

  /**
   * Calculate weight-adjusted rate
   */
  static calculateWeightAdjustment(service: ShippingService, totalWeight: number): number {
    if (!service.weightMultiplier) return service.baseRate
    
    // Weight tiers: 0-500g (base), 501-1000g (+20%), 1001-2000g (+50%), 2000g+ (+100%)
    let multiplier = 1.0
    
    if (totalWeight > 2000) {
      multiplier = 2.0
    } else if (totalWeight > 1000) {
      multiplier = 1.5
    } else if (totalWeight > 500) {
      multiplier = 1.2
    }
    
    return service.baseRate * multiplier
  }

  /**
   * Calculate shipping quotes for given parameters
   */
  static calculateShippingQuotes(params: {
    items: Array<{ variantId: string; quantity: number; weight?: number }>
    countryCode: string
    address?: any
    subtotal: number
  }): ShippingQuote[] {
    
    const { items, countryCode, address, subtotal } = params
    const zone = this.getShippingZone(countryCode, address)
    const quotes: ShippingQuote[] = []
    
    // Calculate total weight (default 200g per item if not specified)
    const totalWeight = items.reduce((total, item) => {
      const itemWeight = item.weight || 200
      return total + (itemWeight * item.quantity)
    }, 0)

    // Generate quotes for each service in the zone
    for (const service of zone.services) {
      // Check weight limits
      if (service.maxWeight && totalWeight > service.maxWeight) {
        continue // Skip services that can't handle the weight
      }

      // Calculate final rate with weight adjustment
      const finalRate = this.calculateWeightAdjustment(service, totalWeight)
      
      // Check for free shipping
      const isFree = subtotal >= zone.freeShippingThreshold && service.type === 'standard'
      
      // Calculate delivery dates
      const now = new Date()
      const minDelivery = new Date(now.getTime() + (service.estimatedDays.min * 24 * 60 * 60 * 1000))
      const maxDelivery = new Date(now.getTime() + (service.estimatedDays.max * 24 * 60 * 60 * 1000))
      
      // Skip weekends for business days calculation
      this.adjustForBusinessDays(minDelivery)
      this.adjustForBusinessDays(maxDelivery)

      quotes.push({
        service,
        zone,
        finalRate: isFree ? 0 : finalRate,
        estimatedDelivery: { min: minDelivery, max: maxDelivery },
        isFree,
        weightAdjustment: totalWeight > 500 ? totalWeight : undefined,
        specialInstructions: this.getSpecialInstructions(service, zone)
      })
    }

    // Sort by price (free shipping first, then by price)
    return quotes.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return a.finalRate - b.finalRate
    })
  }

  /**
   * Adjust date to next business day if it falls on weekend
   */
  private static adjustForBusinessDays(date: Date): void {
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) { // Sunday
      date.setDate(date.getDate() + 1)
    } else if (dayOfWeek === 6) { // Saturday
      date.setDate(date.getDate() + 2)
    }
  }

  /**
   * Get special instructions for shipping service
   */
  private static getSpecialInstructions(service: ShippingService, zone: EnhancedShippingZone): string | undefined {
    if (zone.code === 'BFPO') {
      return 'BFPO addresses: Please ensure your military mail forwarding is active. Allow extra time for overseas delivery.'
    }
    
    if (service.requiresSignature) {
      return 'Signature required on delivery. Someone must be present to receive the package.'
    }
    
    if (service.carrier === 'DPD') {
      return 'You will receive a 1-hour delivery window notification via SMS or email.'
    }
    
    return undefined
  }

  /**
   * Get shipping service by ID
   */
  static getShippingServiceById(serviceId: string): { service: ShippingService; zone: EnhancedShippingZone } | null {
    for (const zone of ENHANCED_SHIPPING_ZONES) {
      for (const service of zone.services) {
        if (service.id === serviceId) {
          return { service, zone }
        }
      }
    }
    return null
  }

  /**
   * Validate BFPO postcode format
   */
  static validateBFPOPostcode(postcode: string): boolean {
    // BFPO postcodes typically follow patterns like: BFPO 123, BFPO 1234
    const bfpoPattern = /^BFPO\s*\d{1,4}$/i
    return bfpoPattern.test(postcode.trim())
  }

  /**
   * Get estimated delivery date range
   */
  static getEstimatedDeliveryRange(serviceId: string, orderDate = new Date()): { min: Date; max: Date } {
    const serviceData = this.getShippingServiceById(serviceId)
    if (!serviceData) {
      // Default fallback
      const minDate = new Date(orderDate.getTime() + (7 * 24 * 60 * 60 * 1000))
      const maxDate = new Date(orderDate.getTime() + (14 * 24 * 60 * 60 * 1000))
      return { min: minDate, max: maxDate }
    }

    const { service } = serviceData
    const minDate = new Date(orderDate.getTime() + (service.estimatedDays.min * 24 * 60 * 60 * 1000))
    const maxDate = new Date(orderDate.getTime() + (service.estimatedDays.max * 24 * 60 * 60 * 1000))
    
    this.adjustForBusinessDays(minDate)
    this.adjustForBusinessDays(maxDate)
    
    return { min: minDate, max: maxDate }
  }
}

// Helper function for Stripe integration with enhanced services
export function createStripeShippingOptionsEnhanced(quotes: ShippingQuote[]) {
  return quotes.map(quote => ({
    shipping_rate_data: {
      type: 'fixed_amount' as const,
      fixed_amount: {
        amount: Math.round(quote.finalRate * 100), // Convert to pence
        currency: 'gbp'
      },
      display_name: quote.service.name,
      delivery_estimate: {
        minimum: { unit: 'business_day' as const, value: quote.service.estimatedDays.min },
        maximum: { unit: 'business_day' as const, value: quote.service.estimatedDays.max }
      },
      metadata: {
        service_id: quote.service.id,
        carrier: quote.service.carrier,
        service_type: quote.service.type,
        zone_code: quote.zone.code,
        tracking_included: quote.service.trackingIncluded.toString(),
        requires_signature: quote.service.requiresSignature?.toString() || 'false',
        description: quote.service.description,
        special_instructions: quote.specialInstructions || ''
      }
    }
  }))
}