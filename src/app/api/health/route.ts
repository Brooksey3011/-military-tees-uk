import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API is operational and protection disabled',
    environment: process.env.NODE_ENV || 'development',
    deployment: 'vercel-production'
  })
}