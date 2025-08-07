# Military Tees UK - Custom Stripe Checkout System

## 🎯 Overview

A production-ready, custom-built Stripe checkout system modeled after ThruDark's UX but with original code. Features express checkout (Apple Pay, Google Pay, Link), secure card payments, real-time order summaries, and full mobile responsiveness.

## ✅ Features

### 💳 Payment Processing
- **Express Checkout**: Apple Pay, Google Pay, Stripe Link
- **Card Payments**: Secure Stripe Elements integration
- **Real-time Validation**: Server-side amount verification
- **Mobile Optimized**: Responsive design for all devices

### 🛒 Checkout Flow
- **3-Step Process**: Contact → Shipping → Payment
- **Progress Indicator**: Visual step tracking
- **Form Validation**: Real-time error handling
- **Promo Codes**: Percentage and fixed discounts
- **Shipping Options**: Multiple delivery methods with live pricing

### 🔧 Backend Integration
- **Vercel API Routes**: Serverless payment processing
- **Webhook Handling**: Secure event processing
- **Order Management**: Complete order lifecycle
- **Email Notifications**: Automated confirmations

### 🔒 Security
- **Webhook Verification**: Stripe signature validation
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Server-side data verification
- **PCI Compliance**: Stripe-handled card data

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the checkout system
cd custom-checkout

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables
```env
# Required - Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional - Set your domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or connect to GitHub and auto-deploy
```

### 4. Configure Webhooks
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.vercel.app/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📁 File Structure

```
custom-checkout/
├── index.html              # Main checkout page
├── success.html             # Order confirmation page
├── styles.css               # Complete CSS styling
├── checkout.js              # Main JavaScript functionality
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment template
├── README.md                # This documentation
└── api/                     # Vercel API routes
    ├── create-payment-intent.js    # Payment setup
    ├── webhook.js                  # Stripe webhooks
    ├── validate-promo.js           # Promo code validation
    ├── update-payment-intent.js    # Payment updates
    └── config/
        └── stripe.js               # Stripe configuration
```

## 🔧 API Endpoints

### `POST /api/create-payment-intent`
Creates a new payment intent for checkout.

**Request:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "Royal Marines T-Shirt",
      "price": 24.99,
      "quantity": 1,
      "size": "Large",
      "color": "Olive Green"
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "address1": "123 Main St",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "GB"
  },
  "deliveryOption": "standard",
  "promoCode": "MILITARY10"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "publishableKey": "pk_test_xxx",
  "deliveryOption": {
    "name": "Standard Delivery",
    "price": 4.99,
    "estimatedDays": "3-5 business days"
  },
  "appliedPromo": {
    "code": "MILITARY10",
    "discount": 10,
    "type": "percentage",
    "description": "10% off for military personnel"
  }
}
```

### `POST /api/validate-promo`
Validates promo codes and calculates discounts.

**Request:**
```json
{
  "code": "MILITARY10",
  "subtotal": 49.98
}
```

**Response:**
```json
{
  "valid": true,
  "discount": 10,
  "type": "percentage",
  "description": "10% off for military personnel",
  "discountAmount": 4.99
}
```

### `POST /api/webhook`
Handles Stripe webhook events.

**Supported Events:**
- `payment_intent.succeeded` - Order confirmation
- `payment_intent.payment_failed` - Payment failure handling
- `payment_intent.canceled` - Order cancellation

## 💡 Configuration

### Promo Codes
Add promo codes in `/api/validate-promo.js`:

```javascript
const PROMO_CODES = {
  'MILITARY10': {
    discount: 10,
    type: 'percentage',
    description: '10% off for military personnel',
    minAmount: 0,
    validUntil: new Date('2025-12-31'),
    active: true
  }
};
```

### Delivery Options
Configure shipping in `/api/create-payment-intent.js`:

```javascript
const DELIVERY_OPTIONS = {
  'standard': { name: 'Standard Delivery', price: 4.99, estimatedDays: '3-5 business days' },
  'express': { name: 'Express Delivery', price: 8.99, estimatedDays: '1 business day' }
};
```

### Styling
Customize the military theme in `styles.css`:

```css
:root {
  --military-green: #4a5d23;
  --military-green-light: #5c6b2a;
  --military-green-dark: #3a4a1a;
}
```

## 🧪 Testing

### Test Cards
Use Stripe test cards for development:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Declined: 4000 0000 0000 0002
```

### Express Checkout Testing
- **Apple Pay**: Use Safari on iOS/macOS with configured cards
- **Google Pay**: Use Chrome with Google account payment methods
- **Link**: Use email with existing Link account

### Webhook Testing
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhook

# Test webhook manually
stripe trigger payment_intent.succeeded
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add all required env vars in Vercel dashboard
3. **Deploy**: Automatic deployment on git push
4. **Configure Domain**: Add custom domain in Vercel settings

### Manual Deployment
```bash
# Build and deploy
vercel --prod

# Set environment variables
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

## 🔐 Security Checklist

- [ ] All secret keys stored in environment variables
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced in production
- [ ] CORS headers configured
- [ ] Input validation on all API endpoints
- [ ] Amount verification server-side
- [ ] Rate limiting implemented (recommended)

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS 14+, Android 10+

## 🎨 Customization

### Branding
Replace military theme with your brand:

1. Update CSS variables in `styles.css`
2. Change logo and text in `index.html`
3. Modify success page messaging in `success.html`
4. Update email templates (when implemented)

### Cart Integration
Connect to your existing cart system:

```javascript
// In checkout.js
loadCart() {
  // Replace with your cart system
  return JSON.parse(localStorage.getItem('your_cart_key'));
}
```

### Database Integration
Add order persistence in `/api/webhook.js`:

```javascript
async function saveOrder(orderData) {
  // Replace with your database
  await db.orders.create(orderData);
}
```

## 📧 Email Integration

### Resend (Recommended)
```bash
npm install resend
```

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'orders@yourdomain.com',
  to: customerEmail,
  subject: 'Order Confirmation',
  html: orderConfirmationTemplate
});
```

### SendGrid
```bash
npm install @sendgrid/mail
```

### Postmark
```bash
npm install postmark
```

## 📊 Analytics & Monitoring

### Plausible Analytics
Add to `index.html`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Sentry Error Tracking
```bash
npm install @sentry/browser
```

### Google Analytics
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🐛 Troubleshooting

### Common Issues

**1. Webhook signature verification failed**
- Check `STRIPE_WEBHOOK_SECRET` is correctly set
- Ensure webhook endpoint URL matches exactly
- Verify Stripe CLI forwarding for development

**2. Payment intent creation fails**
- Validate all required fields are provided
- Check Stripe secret key is correct and not expired
- Ensure amounts are in the correct currency (pence for GBP)

**3. Express checkout not appearing**
- Verify Stripe publishable key is set
- Check browser supports payment methods
- Ensure HTTPS in production (required for Apple Pay)

**4. CORS errors**
- Check API route CORS headers
- Verify domain matches in production
- Ensure proper Vercel routing configuration

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

### Logs
Check Vercel function logs in the Vercel dashboard for server-side issues.

## 🤝 Support

For issues specific to this checkout system:
1. Check this documentation first
2. Review Stripe documentation for payment-related issues
3. Check Vercel documentation for deployment issues

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

## 📄 License

MIT License - Feel free to customize for your needs.

## 🎖️ Military Heritage Theme

This checkout system maintains authentic military heritage styling:
- **Colors**: Professional military greens and tactical styling
- **Typography**: Strong, disciplined fonts (Staatliches for headings)
- **Language**: Military-inspired terminology and messaging
- **Icons**: Military-appropriate imagery and trust signals

Perfect for military-themed e-commerce stores serving the armed forces community.