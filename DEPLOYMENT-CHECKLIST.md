# Military Tees UK - Deployment Checklist

This checklist ensures a successful deployment to Hostinger. Follow each step in order and check off completed items.

## 🚀 Pre-Deployment Phase

### Code Preparation
- [ ] Run `npm run pre-deploy` to validate everything is ready
- [ ] Ensure all code is committed and pushed to main branch
- [ ] Verify no sensitive data in code (API keys, passwords, etc.)
- [ ] Test the application locally with `npm run dev`
- [ ] Test production build locally with `npm run build && npm start`

### Environment Setup
- [ ] Supabase project created and configured
- [ ] Database schema deployed (`database/schema.sql`)
- [ ] Database functions deployed (`database/functions.sql`)
- [ ] Sample data inserted (categories, test products)
- [ ] Row Level Security (RLS) policies enabled
- [ ] Stripe account set up (test mode first)
- [ ] Stripe products and prices configured
- [ ] Domain registered and DNS configured

## 🌐 Hostinger Setup

### Initial Configuration
- [ ] Node.js application created in Hostinger control panel
- [ ] Node.js version 18.x or higher selected
- [ ] Application folder set to `public_html/military-tees-uk`
- [ ] Git integration enabled (if using GitHub deployment)
- [ ] Domain connected to the application

### Environment Variables Configuration
Set these in Hostinger Node.js Environment Variables section:

#### Required Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` = Your Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret
- [ ] `NEXT_PUBLIC_APP_URL` = https://militarytees.co.uk
- [ ] `NODE_ENV` = production

#### Optional Variables (if needed)
- [ ] `RESEND_API_KEY` = Your Resend API key (for emails)
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` = militarytees.co.uk (for analytics)

## 📦 Deployment Execution

### Code Deployment
Choose one method:

#### Method A: Git Integration (Recommended)
- [ ] Repository connected in Hostinger panel
- [ ] Branch set to `main` or `production`
- [ ] Auto-deployment enabled
- [ ] Push code to trigger deployment
- [ ] Monitor deployment logs for success

#### Method B: Manual Upload
- [ ] Run `npm run build` locally
- [ ] Create deployment archive (exclude node_modules, .git, .env.local)
- [ ] Upload via Hostinger File Manager
- [ ] Extract files to application directory

### Post-Upload Configuration
- [ ] Dependencies installed automatically (`npm install`)
- [ ] Application built successfully (`npm run build`)
- [ ] Application started successfully (`npm start`)
- [ ] No errors in Hostinger Node.js logs

## 🔗 External Service Configuration

### Stripe Webhook Setup
- [ ] Webhook endpoint added: `https://militarytees.co.uk/api/webhooks/stripe`
- [ ] Webhook events configured:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook secret copied to environment variables
- [ ] Test webhook with Stripe CLI or dashboard

### SSL Certificate
- [ ] SSL certificate automatically generated (Let's Encrypt)
- [ ] HTTPS redirect enabled
- [ ] Certificate valid and trusted
- [ ] No mixed content warnings

### DNS Configuration
- [ ] Domain pointing to Hostinger nameservers
- [ ] A record configured (if using custom DNS)
- [ ] CNAME records configured (if needed)
- [ ] DNS propagation complete (24-48 hours)

## 🧪 Testing Phase

### Functional Testing
- [ ] Website loads at https://militarytees.co.uk
- [ ] All pages load without errors
- [ ] Product catalog displays correctly
- [ ] Search functionality works
- [ ] Shopping cart operations work
- [ ] User registration/login works
- [ ] Admin panel accessible (with 2FA)

### E-commerce Flow Testing
- [ ] Product browsing works
- [ ] Add to cart functionality works
- [ ] Checkout process completes
- [ ] Payment processing via Stripe works
- [ ] Order confirmation emails sent
- [ ] Order appears in admin panel
- [ ] Webhook events processed correctly

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] Mobile responsiveness works
- [ ] Images load properly and are optimized
- [ ] No console errors in browser
- [ ] Core Web Vitals scores are good

### Security Testing
- [ ] HTTPS everywhere (no HTTP access)
- [ ] Security headers present (check with securityheaders.com)
- [ ] No sensitive data exposed in client-side code
- [ ] Admin routes properly protected
- [ ] SQL injection protection working (via Supabase)

## 📊 Monitoring Setup

### Error Monitoring
- [ ] Check Hostinger error logs for issues
- [ ] Set up log monitoring/alerts (if available)
- [ ] Consider adding Sentry for detailed error tracking

### Performance Monitoring
- [ ] Set up Google PageSpeed Insights monitoring
- [ ] Configure Plausible Analytics (if using)
- [ ] Monitor Core Web Vitals

### Business Monitoring
- [ ] Test order notifications
- [ ] Verify email delivery works
- [ ] Check payment webhook processing
- [ ] Monitor conversion funnel

## 🔄 Post-Launch Tasks

### Immediate (First 24 Hours)
- [ ] Monitor error logs continuously
- [ ] Test all critical user flows
- [ ] Verify email notifications work
- [ ] Check payment processing
- [ ] Monitor site performance
- [ ] Ensure search engines can crawl site

### First Week
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if not using Plausible)
- [ ] Monitor user feedback and support requests
- [ ] Optimize any performance issues
- [ ] Fine-tune SEO settings

### First Month
- [ ] Review analytics and user behavior
- [ ] Optimize conversion funnel based on data
- [ ] Address any UX issues discovered
- [ ] Plan feature improvements based on user feedback

## 🚨 Rollback Plan

If issues occur after deployment:

### Emergency Rollback
- [ ] Revert to previous Git commit (if using Git deployment)
- [ ] Or restore from backup files
- [ ] Check that previous version works
- [ ] Investigate and fix issues offline
- [ ] Re-deploy when ready

### Maintenance Mode
- [ ] Display maintenance page if needed
- [ ] Communicate with users about downtime
- [ ] Fix issues in staging environment
- [ ] Test thoroughly before re-deployment

## 📞 Support Contacts

### Technical Issues
- **Hostinger Support**: 24/7 live chat
- **Supabase Support**: support.supabase.com
- **Stripe Support**: dashboard.stripe.com/support

### Domain/DNS Issues
- **Domain Registrar**: Check your domain provider
- **DNS**: Hostinger DNS management or your DNS provider

## ✅ Final Sign-Off

Once all items are checked:

- [ ] **Development Team**: All code and configuration verified
- [ ] **QA Testing**: All functionality tested and working
- [ ] **Business Owner**: Final approval for go-live
- [ ] **Technical Lead**: Post-launch monitoring in place

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approved By**: _______________

---

**🎯 Deployment Status**: Ready for production deployment to Hostinger

**🛡️ Military Precision**: This checklist ensures zero-defect deployment with military-grade reliability.