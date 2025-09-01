import { NextResponse } from 'next/server'

export async function GET() {
  // Simple health check endpoint - minimal information exposure
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}