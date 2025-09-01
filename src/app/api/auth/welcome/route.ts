import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🎉 Processing welcome email request...')
    
    const body = await request.json()
    const { email, name, user_id } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Extract first name if full name provided
    const firstName = name ? name.split(' ')[0] : email.split('@')[0]

    console.log('📧 Sending welcome email to:', email)

    // Send welcome email using the existing template
    const result = await emailService.sendWelcomeEmail({
      name: firstName,
      email: email
    })

    if (result.success) {
      console.log('✅ Welcome email sent successfully')
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      })
    } else {
      console.error('❌ Failed to send welcome email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'