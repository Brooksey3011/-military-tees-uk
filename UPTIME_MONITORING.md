# Uptime Monitoring Setup for Military Tees UK

## Overview

This guide provides comprehensive uptime monitoring setup for the Military Tees UK e-commerce platform to ensure 99.9% availability and prevent lost sales.

## Recommended Services

### 1. **UptimeRobot** (Recommended - Free Tier Available)
- **Website**: https://uptimerobot.com
- **Free Plan**: 50 monitors, 5-minute intervals
- **Paid Plan**: 1-minute intervals, SMS alerts, phone calls

#### Setup Instructions:
1. Create account at https://uptimerobot.com
2. Add HTTP(S) monitors for:
   - `https://militarytees.co.uk` (Homepage)
   - `https://militarytees.co.uk/api/health` (API Health)
   - `https://militarytees.co.uk/products` (Product Catalog)
   - `https://militarytees.co.uk/api/products` (Products API)
   - `https://militarytees.co.uk/checkout` (Checkout Page)

#### Alert Contacts:
```
Email: admin@militarytees.co.uk
SMS: +44 XXXX XXX XXX (Business mobile)
Webhook: https://militarytees.co.uk/api/uptime-webhook
```

### 2. **BetterStack** (Advanced Option)
- **Website**: https://betterstack.com/uptime
- **Features**: Incident management, status pages, team coordination
- **Pricing**: £29/month for small teams

### 3. **Pingdom** (Enterprise Option)
- **Website**: https://pingdom.com
- **Features**: Global monitoring, detailed analytics, custom checks
- **Pricing**: $10-15/month

## Critical Endpoints to Monitor

### High Priority (1-minute intervals)
```
✅ Homepage: https://militarytees.co.uk
✅ Checkout: https://militarytees.co.uk/checkout
✅ API Health: https://militarytees.co.uk/api/health
✅ Product API: https://militarytees.co.uk/api/products
```

### Medium Priority (5-minute intervals)
```
🔍 Product Pages: https://militarytees.co.uk/products/[slug]
🔍 Category Pages: https://militarytees.co.uk/categories/[category]
🔍 Auth Pages: https://militarytees.co.uk/auth/login
🔍 Admin Panel: https://militarytees.co.uk/admin
```

### Low Priority (15-minute intervals)
```
📱 Contact Page: https://militarytees.co.uk/contact
📱 About Page: https://militarytees.co.uk/about
📱 Static Assets: https://militarytees.co.uk/logowhite.webp
```

## Health Check Endpoint

We've created a dedicated health check endpoint at `/api/health`:

```typescript
// Expected Response:
{
  "status": "healthy",
  "timestamp": "2025-09-13T19:00:00.000Z",
  "services": {
    "database": "connected",
    "stripe": "available",
    "email": "operational"
  },
  "version": "1.0.0"
}
```

## Alert Configuration

### Immediate Alerts (Critical)
- **Checkout page down**: Phone call + SMS + Email
- **API endpoints failing**: SMS + Email within 1 minute
- **Database connectivity issues**: Immediate notification

### Standard Alerts (Important)
- **Homepage issues**: Email within 5 minutes
- **Product pages down**: Email notification
- **Performance degradation**: Email alert

### Monitoring Intervals
```
🔴 Critical Business Endpoints: 30 seconds
🟡 Important User-Facing Pages: 1 minute
🟢 Informational Pages: 5 minutes
```

## Custom Monitoring Checks

### 1. **E-commerce Flow Check**
Monitor complete purchase flow:
```
1. Homepage load → 200 OK
2. Product page load → 200 OK
3. Add to cart → 200 OK
4. Checkout page → 200 OK
5. API connectivity → 200 OK
```

### 2. **Payment System Check**
```
- Stripe API connectivity
- Webhook endpoint availability
- Payment processing status
```

### 3. **Database Health Check**
```
- Connection pool status
- Query response times
- Transaction processing
```

## Status Page Setup

### Option 1: UptimeRobot Public Status Page
1. Enable public status page in UptimeRobot
2. Custom domain: `status.militarytees.co.uk`
3. Brand with Military Tees colors/logo

### Option 2: Custom Status Page
Create internal status dashboard at `/admin/status` with:
- Real-time uptime metrics
- Current incident status
- Historical uptime data
- Performance metrics

## Incident Response Plan

### When Uptime Monitor Triggers:

#### Immediate Response (0-5 minutes)
1. **Acknowledge Alert**: Log into monitoring dashboard
2. **Quick Assessment**: Check main site functionality
3. **Initial Communication**: If confirmed outage, prepare customer communication

#### Investigation Phase (5-15 minutes)
1. **Server Status**: Check hosting provider status
2. **Error Logs**: Review recent error reports
3. **Database Status**: Verify database connectivity
4. **External Services**: Check Stripe, email services

#### Resolution Phase (15+ minutes)
1. **Implement Fix**: Apply identified solution
2. **Monitor Recovery**: Verify systems return to normal
3. **Update Status**: Communicate resolution to customers
4. **Post-Incident**: Document issue and prevention steps

## Integration with Internal Monitoring

Link uptime monitoring with our internal monitoring system:

```typescript
// Webhook endpoint for uptime alerts
export async function POST(request: NextRequest) {
  const alert = await request.json()

  // Track downtime in our monitoring system
  trackError(`Uptime alert: ${alert.alertTypeFriendlyName}`, {
    type: BusinessErrorType.SYSTEM_OUTAGE,
    severity: ErrorSeverity.CRITICAL,
    additionalData: {
      monitor: alert.monitorFriendlyName,
      status: alert.alertDetails
    }
  })

  return NextResponse.json({ received: true })
}
```

## Cost-Effective Setup Recommendation

### Free Tier Setup (£0/month)
- **UptimeRobot Free**: 50 monitors, 5-minute intervals
- **Monitor**: 5 critical endpoints
- **Alerts**: Email notifications
- **Status**: Public status page

### Business Plan (£10-15/month)
- **UptimeRobot Pro**: 1-minute intervals, SMS alerts
- **Monitor**: 20+ endpoints including API health checks
- **Alerts**: SMS + Email + Phone calls for critical issues
- **Advanced**: Custom status page with branding

### Enterprise Setup (£50+/month)
- **BetterStack/Pingdom**: Global monitoring, incident management
- **Custom Integrations**: Slack/Discord alerts, PagerDuty integration
- **Advanced Analytics**: Performance insights, historical reporting

## Expected ROI

**Investment**: £10-15/month for business monitoring
**Potential Savings**:
- Prevented downtime: £500-2000/hour in lost sales
- Faster incident response: 80% reduction in resolution time
- Customer trust: Maintain 99.9% uptime reputation

## Implementation Checklist

```
□ Sign up for UptimeRobot account
□ Configure 5 critical endpoint monitors
□ Set up email alerts for admin@militarytees.co.uk
□ Add SMS alerts for business mobile
□ Create public status page
□ Test alert notifications
□ Document incident response procedures
□ Train team on monitoring dashboard
□ Set up monthly uptime reports
□ Review and optimize monitoring setup quarterly
```

## Conclusion

Uptime monitoring is **critical** for preventing lost sales in e-commerce. Even 1 hour of downtime can cost hundreds of pounds in lost revenue. The recommended setup provides enterprise-grade monitoring at a reasonable cost.

**Priority**: Implement within 24 hours of going live
**Cost**: £10-15/month
**ROI**: Prevent £500-2000/hour in lost sales