# Military Tees UK - Development Archive

**Archive Date:** August 31, 2025  
**Archived By:** Development cleanup process  

## What's Archived Here

This archive contains test pages, development tools, and legacy files that were used during the development process but are no longer needed for the live production website.

## Contents

### Test Pages (`/test-pages/`)
These were development/testing pages that are not part of the live website:

- `test-cart/` - Cart functionality testing page
- `test-express/` - Express checkout testing page  
- `debug-products/` - Product API debugging page
- `test-products/` - Product database testing page (includes test-cart-button.tsx)
- `test-vercel-express/` - Vercel-specific express checkout testing
- `test-registration/` - User registration system diagnostic page
- `direct-checkout-test/` - Direct Stripe checkout testing page
- `size-guide-test/` - Size guide modal testing page

### Test Scripts (`/test-scripts/`)
Standalone test scripts used during development:

- `test-modern-checkout.js` - Checkout design testing script
- `comprehensive-checkout-test.js` - Full system integration testing script

### Custom Checkout (`/custom-checkout/`)
Legacy custom checkout implementation files from earlier development phases.

## Archive Reason

These files were archived because:

1. **No longer referenced** - None of these files are imported or linked by the live website
2. **Development only** - These were testing and debugging tools, not production features
3. **Clean deployment** - Removing them reduces bundle size and simplifies the codebase
4. **Preserved for reference** - Archived rather than deleted to maintain development history

## Production Status

The live website continues to work normally without these files. All core functionality remains intact:
- Product catalog and shopping cart
- Checkout and payment processing  
- User authentication and accounts
- Admin dashboard
- All public pages and navigation

## Restoration

If any of these files are needed in the future, they can be restored from this archive by moving them back to their original locations in the `/src/app/` directory.

---

*Archive created during repository cleanup to maintain production-ready codebase*