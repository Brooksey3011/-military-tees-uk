# Email System Documentation - Military Tees UK

## Overview

The Military Tees UK platform includes a comprehensive email notification system that handles order confirmations, custom quote requests, welcome emails, and admin notifications. The system uses military-themed HTML templates with consistent branding.

## Email Service Architecture

### Core Components

1. **Email Service (`src/lib/email/email-service.ts`)**
   - Centralized email service using Nodemailer
   - Support for multiple SMTP providers
   - Military-themed HTML templates
   - Error handling and logging

2. **API Integrations**
   - Stripe webhook integration for order confirmations
   - Custom quote API integration
   - Welcome email API endpoint
   - Admin notification system

### Supported Email Providers

1. **Gmail** (Recommended for development)
   - Uses app passwords for authentication
   - Reliable and fast delivery
   - Configuration: `EMAIL_PROVIDER=gmail`

2. **Hostinger Email** (Recommended for production)
   - Matches domain branding
   - Professional appearance
   - Configuration: `EMAIL_PROVIDER=hostinger`

3. **Resend** (Premium service)
   - API-based email service
   - Advanced analytics and tracking
   - Configuration: `EMAIL_PROVIDER=resend`

4. **Custom SMTP** (Flexible option)
   - Any SMTP server configuration
   - Full control over email delivery
   - Configuration: `EMAIL_PROVIDER=smtp`

## Email Templates

### 1. Order Confirmation Email
- **Trigger**: Successful payment via Stripe webhook
- **Recipients**: Customer (primary), Admin (notification)
- **Content**: Order details, items, shipping address, totals
- **Features**: Military styling, tracking information

### 2. Custom Quote Confirmation
- **Trigger**: Custom quote request submission
- **Recipients**: Customer
- **Content**: Quote request details, next steps, contact information
- **Features**: Design requirements summary

### 3. Welcome Email
- **Trigger**: New user registration
- **Recipients**: New customer
- **Content**: Welcome message, service overview, getting started guide
- **Features**: Military heritage branding, feature highlights

### 4. Admin Notifications
- **Trigger**: New orders, custom quotes
- **Recipients**: info@militarytees.co.uk
- **Content**: Order processing requirements, customer details
- **Features**: Admin-focused format, action items

## Configuration

### Environment Variables

```bash
# Email Provider Selection
EMAIL_PROVIDER=hostinger  # gmail, hostinger, resend, smtp

# Gmail Configuration
EMAIL_USER=info@militarytees.co.uk
EMAIL_PASS=your_gmail_app_password

# Hostinger Email Configuration
EMAIL_USER=info@militarytees.co.uk
EMAIL_PASS=your_hostinger_email_password

# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key

# Custom SMTP Configuration
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@militarytees.co.uk
SMTP_PASS=your_smtp_password
```

### Development Setup

1. **Copy environment template**:
   ```bash
   cp .env.local.template .env.local
   ```

2. **Configure email provider** (Gmail recommended for development):
   ```bash
   EMAIL_PROVIDER=gmail
   EMAIL_USER=your-dev-email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

3. **Gmail App Password Setup**:
   - Enable 2-factor authentication
   - Generate app password: Google Account → Security → App passwords
   - Use generated password in EMAIL_PASS

### Production Setup

1. **Hostinger Email Configuration**:
   ```bash
   EMAIL_PROVIDER=hostinger
   EMAIL_USER=info@militarytees.co.uk
   EMAIL_PASS=your_hostinger_email_password
   ```

2. **DNS Configuration**:
   - Ensure MX records point to Hostinger mail servers
   - Configure SPF and DKIM records for deliverability

## API Endpoints

### Email Sending Endpoints

1. **Welcome Email**: `POST /api/auth/welcome`
   ```json
   {
     "name": "John Smith",
     "email": "john@example.com"
   }
   ```

2. **Order Confirmation**: Automatic via Stripe webhook
   - Triggered on `checkout.session.completed`
   - Sends to customer and admin automatically

3. **Custom Quote**: Automatic via custom quote API
   - Triggered on custom quote submission
   - Confirmation sent to customer

### Integration Points

1. **Stripe Webhook** (`src/app/api/webhooks/stripe/route.ts`):
   ```typescript
   import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email/email-service'
   
   // In handleCheckoutSessionCompleted function
   await sendOrderConfirmationEmails(order, session)
   ```

2. **Custom Quote API** (`src/app/api/custom-quote/route.ts`):
   ```typescript
   import { sendCustomQuoteConfirmation } from '@/lib/email/email-service'
   
   const emailResult = await sendCustomQuoteConfirmation(emailData)
   ```

3. **User Registration** (Frontend integration):
   ```typescript
   // After successful Supabase signup
   await fetch('/api/auth/welcome', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: fullName, email })
   })
   ```

## Testing

### Development Testing

1. **Email Service Connection Test**:
   ```typescript
   import { emailService } from '@/lib/email/email-service'
   
   const result = await emailService.testConnection()
   console.log(result) // { success: true, message: "Connection successful" }
   ```

2. **Send Test Email**:
   ```typescript
   await sendWelcomeEmail({
     name: "Test User",
     email: "test@example.com"
   })
   ```

### Production Testing

1. **Order Flow Testing**:
   - Complete test purchase with Stripe test mode
   - Verify order confirmation emails
   - Check admin notifications

2. **Custom Quote Testing**:
   - Submit custom quote request
   - Verify confirmation email delivery
   - Test with image attachments

## Email Templates Styling

### Military Heritage Design System

- **Colors**: Military olive (#4a5d23), tactical accents
- **Typography**: Professional, readable fonts
- **Layout**: Clean, disciplined grid structure
- **Branding**: Consistent with website design

### Template Structure

```html
<!-- Email Template Example -->
<div class="container" style="max-width: 600px; margin: 0 auto;">
  <div class="header" style="background-color: #4a5d23; color: white;">
    <h1>🛡️ Military Tees UK</h1>
  </div>
  <div class="content" style="padding: 30px;">
    <!-- Email content -->
  </div>
  <div class="footer" style="background-color: #f8f9fa;">
    <!-- Footer with contact info -->
  </div>
</div>
```

## Monitoring and Analytics

### Email Delivery Monitoring

1. **Success/Failure Logging**:
   - All email attempts logged to console
   - Error tracking with detailed messages
   - Delivery confirmations when available

2. **Performance Metrics**:
   - Email send duration tracking
   - Provider reliability monitoring
   - Template rendering performance

### Error Handling

1. **Graceful Degradation**:
   - Email failures don't break order processing
   - Retry logic for temporary failures
   - Admin notifications for persistent issues

2. **Fallback Strategies**:
   - Console logging when email unavailable
   - Alternative provider configuration
   - Manual email processing for critical failures

## Security Considerations

### Email Security

1. **Authentication**:
   - App passwords for Gmail
   - Secure credential storage
   - Environment variable protection

2. **Content Security**:
   - HTML sanitization
   - No user-generated content in templates
   - Secure attachment handling

3. **Privacy Compliance**:
   - No sensitive data in email logs
   - Proper data retention policies
   - GDPR-compliant unsubscribe handling

## Troubleshooting

### Common Issues

1. **Gmail Authentication Failed**:
   - Verify 2FA is enabled
   - Check app password generation
   - Ensure EMAIL_USER matches Gmail account

2. **Hostinger Email Issues**:
   - Verify email account exists
   - Check password correctness
   - Confirm SMTP settings with Hostinger

3. **Email Not Delivered**:
   - Check spam/junk folders
   - Verify recipient email address
   - Review email provider logs

### Debugging Steps

1. **Test Email Service Connection**:
   ```typescript
   const result = await emailService.testConnection()
   console.log('Email test result:', result)
   ```

2. **Check Environment Variables**:
   ```bash
   # Verify variables are loaded
   console.log('Email Provider:', process.env.EMAIL_PROVIDER)
   console.log('Email User:', process.env.EMAIL_USER)
   ```

3. **Review Email Logs**:
   - Check console output for email send attempts
   - Look for nodemailer error messages
   - Verify email template rendering

## Future Enhancements

### Planned Features

1. **Email Templates System**:
   - React Email integration
   - Template versioning
   - A/B testing capabilities

2. **Advanced Analytics**:
   - Email open tracking
   - Click-through analytics
   - Conversion metrics

3. **Automation Features**:
   - Abandoned cart recovery
   - Order status updates
   - Marketing automation

### Integration Opportunities

1. **CRM Integration**:
   - Customer communication history
   - Email preference management
   - Segmented email campaigns

2. **Marketing Tools**:
   - Newsletter subscription management
   - Promotional email campaigns
   - Customer lifecycle emails

## Support and Maintenance

### Regular Maintenance

1. **Template Updates**:
   - Keep military branding consistent
   - Update contact information
   - Refresh promotional content

2. **Provider Management**:
   - Monitor email delivery rates
   - Update authentication credentials
   - Review provider performance

3. **Security Updates**:
   - Update nodemailer dependencies
   - Review email security practices
   - Audit credential management

For technical support or questions about the email system, contact the development team or refer to the main project documentation.