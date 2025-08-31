# Archived Checkout Experiments

This folder contains experimental checkout implementations that were developed but not used in the final production system.

## Production System (Keep)
The production system uses a simple direct-to-Stripe approach:
- **Main Checkout Button**: `src/components/cart/checkout-button.tsx`
- **Checkout Redirect Page**: `src/app/checkout/page.tsx`

## Archived Experimental Systems

### Pages
- `checkout-pro/` - Express checkout test page with device detection
- `thrudark/` - ThruDark-inspired checkout theme experiment
- `professional/` - Professional multi-step checkout flow
- `express/` - Alternative express checkout redirect page (redundant with main checkout)

### Components (`components/`)
Complex checkout flow components that formed a complete multi-step checkout system:
- `checkout-flow.tsx` - Main orchestrator component
- `customer-information.tsx` - Customer details collection
- `shipping-information.tsx` - Shipping address forms
- `payment-information.tsx` - Payment method selection
- `order-review.tsx` - Final order confirmation
- `order-summary.tsx` - Cart summary display
- `progress-indicator.tsx` - Multi-step progress display
- `customer-support.tsx` - Help and support integration

### Express Checkout Variants
Multiple implementations of express checkout (Apple Pay, Google Pay):
- `express-checkout-simple.tsx` - Simplified express checkout
- `express-checkout-pro.tsx` - Advanced express checkout
- `enhanced-express-checkout.tsx` - Full-featured express checkout
- `vercel-express-checkout.tsx` - Vercel-optimized implementation
- `stripe-express-element.tsx` - Direct Stripe element wrapper

### Additional Components
- `thrudark-inspired-checkout.tsx` - Military-themed checkout variant
- `direct-checkout-button.tsx` - Alternative direct checkout implementation
- `modern-payment-checkout.tsx` - Modern payment UI variant
- `simple-stripe-checkout.tsx` - Basic Stripe implementation
- `stripe-card-element.tsx` - Card element wrapper

## Why These Were Archived
The production system opted for maximum simplicity and conversion optimization:
1. **Single Button Approach**: Users click one button and go directly to Stripe
2. **Reduced Friction**: No multi-step forms or complex UI
3. **Higher Conversion**: Minimal steps between intent and payment
4. **Easier Maintenance**: Simple system with fewer failure points

These experimental systems remain available for future use if needed.

*Archived: August 31st, 2025*