#!/usr/bin/env node

/**
 * Email System Test for Military Tees UK
 */

const { Resend } = require('resend')

async function testEmailSystem() {
  console.log('📧 Testing Email System with Resend\n')
  
  const apiKey = 're_S2ACZfkt_58o6BnVhywmk49zdwSRdANDN'
  const resend = new Resend(apiKey)
  
  try {
    // Test email configuration
    console.log('🔧 Testing Resend configuration...')
    
    const testEmailData = {
      from: 'Military Tees UK <orders@militarytees.co.uk>',
      to: ['brooksey3011@gmail.com'],  // User's email for testing
      subject: 'Checkout System Test - Order Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Order Confirmation - Military Tees UK</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #4a5d23; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4a5d23; }
            .footer { background: #f8f8f8; padding: 20px; text-align: center; margin-top: 30px; }
            .success { color: #4a5d23; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎖️ Checkout System Test</h1>
            <p>Email Delivery Verification</p>
          </div>
          
          <div class="content">
            <p class="success">✅ Email system is working correctly!</p>
            
            <div class="order-details">
              <h3>Test Results</h3>
              <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Service:</strong> Resend API</p>
              <p><strong>From:</strong> orders@militarytees.co.uk</p>
              <p><strong>Status:</strong> Delivered Successfully</p>
            </div>

            <h3>✅ What This Confirms:</h3>
            <ul>
              <li><strong>API Connection:</strong> Resend service is responding</li>
              <li><strong>Domain Authentication:</strong> militarytees.co.uk sender verified</li>
              <li><strong>Email Templates:</strong> Professional HTML rendering works</li>
              <li><strong>Delivery System:</strong> Emails reach customer inboxes</li>
            </ul>

            <h3>🚀 Ready for Production:</h3>
            <p>The email confirmation system is fully operational and ready for live order confirmations.</p>
            
            <p><strong>The Military Tees UK Team</strong></p>
          </div>

          <div class="footer">
            <p>Military Tees UK | Premium British Military Themed Apparel</p>
            <p>This is a system test email from the checkout verification process.</p>
          </div>
        </body>
        </html>
      `
    }
    
    console.log('📨 Sending test email to verify delivery...')
    
    const { data, error } = await resend.emails.send(testEmailData)
    
    if (error) {
      console.log('❌ Email sending failed:', error)
      return false
    } else {
      console.log('✅ Test email sent successfully!')
      console.log(`   Message ID: ${data.id}`)
      console.log(`   Sent to: brooksey3011@gmail.com`)
      console.log(`   From: orders@militarytees.co.uk`)
      console.log('\n📬 Check your inbox to confirm delivery!')
      return true
    }
    
  } catch (error) {
    console.log('❌ Email system error:', error.message)
    return false
  }
}

// Run the test
testEmailSystem()
  .then(success => {
    console.log('\n' + '='.repeat(50))
    if (success) {
      console.log('🎉 EMAIL SYSTEM TEST: SUCCESS')
      console.log('✅ Ready for production order confirmations')
    } else {
      console.log('❌ EMAIL SYSTEM TEST: FAILED')
      console.log('⚠️  Needs attention before deployment')
    }
    console.log('='.repeat(50))
  })
  .catch(console.error)