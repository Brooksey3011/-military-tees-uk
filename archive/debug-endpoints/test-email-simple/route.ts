import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    // Create a test with multiple configurations
    const configs = [
      {
        name: 'Hostinger SSL (465)',
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true
      },
      {
        name: 'Hostinger TLS (587)', 
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false
      },
      {
        name: 'Domain-specific SSL',
        host: 'mail.militarytees.co.uk',
        port: 465,
        secure: true
      },
      {
        name: 'Domain-specific TLS',
        host: 'mail.militarytees.co.uk', 
        port: 587,
        secure: false
      }
    ]

    const results = []

    for (const config of configs) {
      try {
        console.log(`Testing ${config.name}...`)
        
        const transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: 'info@militarytees.co.uk',
            pass: 'W;^#;=mi!5X'
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        // Test connection
        await transporter.verify()
        
        results.push({
          config: config.name,
          status: 'SUCCESS - Connection verified!',
          settings: config
        })
        
        console.log(`✅ ${config.name} works!`)
        break // Stop on first success
        
      } catch (error) {
        results.push({
          config: config.name,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          settings: config
        })
        console.log(`❌ ${config.name} failed: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({
      message: 'SMTP Configuration Test Complete',
      results: results,
      recommendation: results.find(r => r.status.includes('SUCCESS')) 
        ? 'Found working configuration!' 
        : 'No working configurations found - check Hostinger settings'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}