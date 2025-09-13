import { NextRequest, NextResponse } from 'next/server'
import { getMonitoringDashboard } from '@/lib/monitoring-enhanced'

/**
 * Monitoring Dashboard API - provides comprehensive e-commerce monitoring data
 * This endpoint returns critical business metrics, error rates, and system health
 */
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication here
    // const isAdmin = await checkAdminAuth(request)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const dashboardData = getMonitoringDashboard()

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })

  } catch (error) {
    console.error('❌ Monitoring dashboard error:', error)

    return NextResponse.json(
      {
        error: 'Failed to retrieve monitoring data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'