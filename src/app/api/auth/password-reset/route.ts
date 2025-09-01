import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generatePasswordResetHTML, generatePasswordResetText } from '@/lib/email-templates/password-reset'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Processing password reset email request...')
    
    const body = await request.json()
    const { email, reset_url } = body

    if (!email || !reset_url) {
      return NextResponse.json(
        { error: 'Email and reset URL are required' },
        { status: 400 }
      )
    }

    console.log('📧 Sending password reset email to:', email)

    // Generate HTML and text versions
    const htmlContent = generatePasswordResetHTML({
      resetUrl: reset_url,
      email: email
    })

    const textContent = generatePasswordResetText({
      resetUrl: reset_url,
      email: email
    })

    // Send email via Resend
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Military Tees UK <noreply@militarytees.co.uk>',
      to: [email],
      subject: 'Password Reset - Military Tees UK',
      html: htmlContent,
      text: textContent
    })

    if (result.data) {
      console.log('✅ Password reset email sent successfully:', result.data.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset email sent successfully',
        email_id: result.data.id
      })
    } else {
      console.error('❌ Failed to send password reset email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Password reset email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'