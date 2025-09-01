// Password reset email template for Military Tees UK
// This template will be used to override Supabase's default password reset email

export function generatePasswordResetHTML(data: {
  resetUrl: string
  email: string
  siteName?: string
}) {
  const { resetUrl, email, siteName = "Military Tees UK" } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Military Tees UK</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">🛡️ MILITARY TEES UK</h1>
      <div style="margin-top: 8px; padding: 8px 16px; background-color: rgba(255,255,255,0.2); border-radius: 20px; display: inline-block;">
        <span style="color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Password Reset</span>
      </div>
    </div>

    <!-- Security Alert -->
    <div style="padding: 32px 24px; text-align: center; border-bottom: 2px solid #f3f4f6;">
      <div style="width: 64px; height: 64px; background-color: #fef3c7; border: 3px solid #d97706; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <div style="color: #d97706; font-size: 32px; font-weight: bold;">🔐</div>
      </div>
      <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 24px; font-weight: bold;">Password Reset Request</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;">We received a request to reset your password for your Military Tees UK account.</p>
      <div style="margin-top: 16px; padding: 12px 20px; background-color: #f3f4f6; border-radius: 6px; display: inline-block;">
        <span style="color: #374151; font-weight: 600;">Account: ${email}</span>
      </div>
    </div>

    <!-- Reset Instructions -->
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: bold;">Reset Your Password</h3>
        <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.6;">
          Click the button below to create a new password for your account. This link will expire in 24 hours for security.
        </p>
        
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); transition: all 0.2s;">
          🔑 Reset Password
        </a>
      </div>

      <!-- Security Notice -->
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h4 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px; font-weight: bold; display: flex; align-items: center;">
          <span style="margin-right: 8px;">⚠️</span>
          Security Notice
        </h4>
        <div style="color: #7f1d1d; font-size: 14px; line-height: 1.5;">
          <p style="margin: 0 0 8px 0;"><strong>If you didn't request this password reset:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Ignore this email - your password won't be changed</li>
            <li>Consider enabling two-factor authentication</li>
            <li>Contact our support team if you're concerned</li>
          </ul>
        </div>
      </div>

      <!-- Alternative Link -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: bold;">Can't click the button?</h4>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Copy and paste this link into your browser:</p>
        <p style="margin: 0; word-break: break-all; color: #16a34a; font-size: 12px; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
          ${resetUrl}
        </p>
      </div>
    </div>

    <!-- Help Section -->
    <div style="padding: 24px; background-color: #f8fafc; border-top: 2px solid #e5e7eb;">
      <div style="text-align: center;">
        <h4 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: bold;">Need Help?</h4>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
          Our support team is standing by to assist you with any account issues.
        </p>
        <div style="margin-bottom: 16px;">
          <a href="mailto:support@militarytees.co.uk" style="color: #16a34a; text-decoration: none; font-weight: 600; font-size: 14px;">
            📧 support@militarytees.co.uk
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 24px; text-align: center; background-color: #111827; color: #ffffff;">
      <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        <p style="margin: 0 0 8px 0;">Military Tees UK - Proudly serving those who serve</p>
        <p style="margin: 0;">© 2025 Military Tees UK. All rights reserved.</p>
        <p style="margin: 8px 0 0 0; color: #9ca3af;">
          This password reset link expires in 24 hours for your security.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generatePasswordResetText(data: {
  resetUrl: string
  email: string
  siteName?: string
}) {
  const { resetUrl, email, siteName = "Military Tees UK" } = data

  return `
MILITARY TEES UK - PASSWORD RESET

We received a request to reset your password for your account: ${email}

To reset your password, click the link below or copy it into your browser:
${resetUrl}

SECURITY NOTICE:
- If you didn't request this reset, simply ignore this email
- This link expires in 24 hours for your security
- Never share this link with anyone

Need help? Contact our support team:
📧 support@militarytees.co.uk

Military Tees UK - Proudly serving those who serve
© 2025 Military Tees UK. All rights reserved.
  `.trim()
}