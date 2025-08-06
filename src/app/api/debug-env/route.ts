import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hostinger_configured: {
      host: !!process.env.HOSTINGER_EMAIL_HOST,
      user: !!process.env.HOSTINGER_EMAIL_USER,
      pass: !!process.env.HOSTINGER_EMAIL_PASS,
      port: !!process.env.HOSTINGER_EMAIL_PORT,
      secure: !!process.env.HOSTINGER_EMAIL_SECURE,
    },
    resend_configured: {
      api_key: !!process.env.RESEND_API_KEY,
    },
    values: {
      hostinger_host: process.env.HOSTINGER_EMAIL_HOST,
      hostinger_user: process.env.HOSTINGER_EMAIL_USER?.substring(0, 5) + '***',
      hostinger_port: process.env.HOSTINGER_EMAIL_PORT,
      hostinger_secure: process.env.HOSTINGER_EMAIL_SECURE,
      resend_key: process.env.RESEND_API_KEY?.substring(0, 8) + '***',
    },
    email_service_priority: process.env.HOSTINGER_EMAIL_HOST && process.env.HOSTINGER_EMAIL_USER && process.env.HOSTINGER_EMAIL_PASS 
      ? 'hostinger (will try first)' 
      : process.env.RESEND_API_KEY 
      ? 'resend (fallback)'
      : 'none configured'
  })
}