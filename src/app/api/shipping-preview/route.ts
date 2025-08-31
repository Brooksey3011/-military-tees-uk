import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ShippingCalculator } from '@/lib/shipping-calculator'

// Schema for shipping preview request
const shippingPreviewSchema = z.object({
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().min(0)
  })).min(1),
  countryCode: z.string().length(2),
  subtotal: z.number().min(0)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, countryCode, subtotal } = shippingPreviewSchema.parse(body)

    // Calculate shipping rates
    const shippingRates = ShippingCalculator.calculateShippingRates({
      items,
      countryCode,
      subtotal
    })

    // Get shipping zone info
    const zone = ShippingCalculator.getShippingZone(countryCode)

    return NextResponse.json({
      success: true,
      zone: {
        code: zone.code,
        name: zone.name,
        freeShippingThreshold: zone.freeShippingThreshold
      },
      rates: shippingRates,
      qualifiesForFree: subtotal >= zone.freeShippingThreshold,
      subtotal
    })

  } catch (error) {
    console.error('Shipping preview error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request',
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to calculate shipping rates' 
    }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'