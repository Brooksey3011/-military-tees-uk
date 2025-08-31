# 🚀 Deployment Guide - Military Tees UK Checkout

## Overview
This guide covers deploying the custom Stripe checkout system to Vercel with full production configuration.

---

## 📋 Pre-Deployment Checklist

### ✅ Stripe Configuration
- [ ] Test and Live API keys obtained from Stripe Dashboard
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Payment methods enabled (card, Apple Pay, Google Pay, Link)
- [ ] Business details completed in Stripe Dashboard

### ✅ Domain & SSL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate (automatic with Vercel)
- [ ] DNS records updated if using custom domain

### ✅ Environment Variables
- [ ] All production environment variables ready
- [ ] Email service configured
- [ ] Database connection configured (if using)

---

## 🔧 Step 1: Stripe Setup

### 1.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create business account
3. Complete business verification
4. Enable payment methods needed

### 1.2 Get API Keys
```bash
# Go to: https://dashboard.stripe.com/apikeys
# Copy these values:
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
```

### 1.3 Configure Webhooks
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.vercel.app/api/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy webhook secret: `whsec_...`

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Login to Vercel
```bash
vercel login
```

### 2.3 Deploy from Directory
```bash
# Navigate to checkout directory
cd custom-checkout

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? [Y/n] y
# - Which scope? [your-username]
# - Link to existing project? [y/N] n
# - Project name: military-tees-checkout
# - Directory: ./
```

### 2.4 Configure Environment Variables
```bash
# Add all environment variables
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production

# Add optional variables
vercel env add RESEND_API_KEY production
vercel env add ADMIN_EMAIL production
```

### 2.5 Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🔗 Step 3: Custom Domain (Optional)

### 3.1 Add Domain in Vercel
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain: `checkout.yourdomain.com`
3. Configure DNS records as shown

### 3.2 DNS Configuration
Add these records to your DNS provider:

```
Type: A
Name: checkout (or @)
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3.3 SSL Certificate
- SSL is automatically provided by Vercel
- Certificate automatically renews
- HTTPS redirect enabled by default

---

## 📧 Step 4: Email Service Setup

### Option 1: Resend (Recommended)
```bash
# Sign up at resend.com
# Get API key and add to environment:
vercel env add RESEND_API_KEY production

# Add domain verification records to DNS
# Update webhook.js with email templates
```

### Option 2: SendGrid
```bash
# Sign up at sendgrid.com
# Get API key:
vercel env add SENDGRID_API_KEY production

# Install package and configure in webhook.js
```

### Option 3: SMTP (Gmail, etc.)
```bash
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production  
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production
```

---

## 🗄️ Step 5: Database Integration (Optional)

### Option 1: Supabase
```bash
# Create project at supabase.com
# Get connection details:
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Option 2: PlanetScale
```bash
# Create database at planetscale.com
# Get connection string:
vercel env add DATABASE_URL production
```

### Option 3: File-based Storage
Orders saved to JSON files in `/tmp` (not recommended for production)

---

## 🧪 Step 6: Testing Production Deployment

### 6.1 Automated Testing
```bash
# Run test suite against production
TEST_BASE_URL=https://yourdomain.vercel.app node test/test-checkout.js
```

### 6.2 Manual Testing Checklist
- [ ] Load checkout page
- [ ] Fill contact information
- [ ] Add shipping address
- [ ] Select delivery method
- [ ] Apply promo code
- [ ] Test card payment with test card
- [ ] Test Apple Pay (Safari on iOS/Mac)
- [ ] Test Google Pay (Chrome with saved cards)
- [ ] Verify order confirmation page
- [ ] Check webhook events in Stripe Dashboard

### 6.3 Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires 3D Secure: 4000 0000 0000 3220
Insufficient funds: 4000 0000 0000 9995
```

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics
- Automatic in Vercel Dashboard
- View function logs and performance
- Monitor error rates

### 7.2 Stripe Dashboard
- Monitor payments and failures
- View webhook delivery status
- Check dispute and chargeback reports

### 7.3 Custom Analytics (Optional)
```bash
# Add Plausible
vercel env add NEXT_PUBLIC_PLAUSIBLE_DOMAIN production

# Add Google Analytics  
vercel env add NEXT_PUBLIC_GA_ID production
```

---

## 🔒 Step 8: Security Configuration

### 8.1 Webhook Security
```bash
# Verify webhook secret is set
vercel env ls

# Test webhook signature verification
stripe trigger payment_intent.succeeded
```

### 8.2 CORS Configuration
- Configured automatically in `vercel.json`
- Restricts API access to your domains
- Add additional domains if needed

### 8.3 Rate Limiting (Recommended)
```bash
# Add Upstash Redis for rate limiting
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

---

## 🔄 Step 9: Going Live

### 9.1 Switch to Live Mode
1. Replace test API keys with live keys
2. Update webhook endpoint URL
3. Test with small real transaction
4. Monitor for first few orders

### 9.2 Live Environment Variables
```bash
# Replace test keys with live keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from live webhook)
```

### 9.3 Final Production Test
- Test real payment with minimum amount
- Verify webhook processing
- Check email confirmations
- Confirm order data storage

---

## 🚨 Troubleshooting

### Common Issues

**1. Webhook not receiving events**
```bash
# Check webhook URL in Stripe Dashboard
# Verify STRIPE_WEBHOOK_SECRET is correct
# Check function logs in Vercel Dashboard

# Test webhook manually:
curl -X POST https://yourdomain.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**2. Environment variables not loading**
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally for testing
vercel env pull .env.local
```

**3. Payment intent creation fails**
```bash
# Check Stripe API key permissions
# Verify amount is in correct currency units
# Check network connectivity to Stripe
```

**4. Express checkout not appearing**
```bash
# Verify HTTPS is enabled
# Check browser payment method availability
# Test on different devices/browsers
```

### Debug Mode
```bash
# Enable debug logging
vercel env add DEBUG "stripe:*" production
```

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

## 📈 Performance Optimization

### 1. Caching
- Static assets cached automatically by Vercel
- API responses cacheable where appropriate
- Consider Redis for session data

### 2. Monitoring
```bash
# Add Sentry for error tracking
vercel env add SENTRY_DSN production

# Monitor function execution times
# Set up alerts for payment failures
```

### 3. Scaling
- Vercel automatically scales serverless functions
- Database may need scaling considerations
- Consider CDN for global performance

---

## 🎯 Production Checklist

### Before Launch
- [ ] All tests passing
- [ ] Live API keys configured
- [ ] Webhook endpoint working
- [ ] Email notifications working
- [ ] SSL certificate active
- [ ] Domain properly configured
- [ ] Error monitoring set up

### After Launch
- [ ] Monitor first transactions closely
- [ ] Check webhook delivery rates
- [ ] Verify email delivery
- [ ] Test customer support flow
- [ ] Monitor error rates and performance

### Ongoing Maintenance
- [ ] Regular security updates
- [ ] Monitor Stripe dashboard for issues
- [ ] Review transaction data weekly
- [ ] Update promo codes as needed
- [ ] Backup important configuration

---

## 🏆 Success Metrics

Track these KPIs after deployment:

**Technical Metrics:**
- Page load time < 2 seconds
- Payment success rate > 95%
- Webhook delivery rate > 99%
- Function error rate < 1%

**Business Metrics:**
- Conversion rate improvement
- Cart abandonment rate
- Express checkout usage
- Customer support tickets

**Security Metrics:**
- No unauthorized access attempts
- Webhook signature verification 100%
- SSL certificate valid
- PCI compliance maintained

---

Your Military Tees UK checkout system is now ready for production! 🎖️