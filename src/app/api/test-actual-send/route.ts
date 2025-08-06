import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating transporter with verified settings...')
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@militarytees.co.uk',
        pass: 'W;^#;=mi!5X'
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    console.log('Verifying connection...')
    await transporter.verify()
    console.log('✅ Connection verified!')

    console.log('Attempting to send test email...')
    
    const info = await transporter.sendMail({
      from: '"Military Tees UK" <info@militarytees.co.uk>',
      to: 'info@militarytees.co.uk', // Send to yourself first
      subject: 'Test Email - Military Tees UK',
      text: 'This is a test email to verify SMTP is working.',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #4a5d23;">✅ Email Test Successful!</h2>
          <p>This email confirms that your Hostinger SMTP is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Host: smtp.hostinger.com</li>
            <li>Port: 465 (SSL)</li>
            <li>From: info@militarytees.co.uk</li>
            <li>Time: ${new Date().toISOString()}</li>
          </ul>
          <p style="color: #4a5d23;"><strong>Military Tees UK Email System is Ready! 🎖️</strong></p>
        </div>
      `
    })

    console.log('✅ Email sent successfully:', info.messageId)
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Test email sent successfully!',
      details: info
    })

  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}