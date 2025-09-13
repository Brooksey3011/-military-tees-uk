import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      stripe: 'unknown',
      email: 'unknown'
    },
    version: '1.0.0'
  }

  try {
    // Check database connectivity
    try {
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase.from('products').select('id').limit(1)
      healthCheck.services.database = error ? 'error' : 'connected'
    } catch (dbError) {
      healthCheck.services.database = 'error'
    }

    // Check Stripe connectivity (basic)
    try {
      const stripeAvailable = !!process.env.STRIPE_SECRET_KEY
      healthCheck.services.stripe = stripeAvailable ? 'available' : 'not_configured'
    } catch (stripeError) {
      healthCheck.services.stripe = 'error'
    }

    // Check email service
    try {
      const emailConfigured = !!process.env.RESEND_API_KEY
      healthCheck.services.email = emailConfigured ? 'operational' : 'not_configured'
    } catch (emailError) {
      healthCheck.services.email = 'error'
    }

    // Determine overall status
    const hasErrors = Object.values(healthCheck.services).some(service => service === 'error')
    healthCheck.status = hasErrors ? 'degraded' : 'healthy'

    return NextResponse.json(healthCheck)

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}