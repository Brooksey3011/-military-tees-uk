# 🚀 Deployment Guide - Military Tees UK

## ✅ Ready to Deploy with Test Mode!

Your site is configured with **Stripe Test Mode** for safe live testing. No real money will be processed.

## 🔑 Your Stripe Test Keys (Provided Separately)
You have your test keys starting with:
- `pk_test_...` (Publishable Key)
- `sk_test_...` (Secret Key)

## 🌐 Deploy to Vercel (Recommended - 2 minutes)

### Option 1: GitHub Integration (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and select your `military-tees-uk` repo
3. Add these environment variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your `pk_test_...` key
   - `STRIPE_SECRET_KEY` = Your `sk_test_...` key  
   - Copy all other variables from `.env.production.template`
4. Click Deploy!

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts and add environment variables when asked
```

## 🧪 Test Cards for Your Live Site

Once deployed, test with these **safe** test cards:

**✅ Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/25` (any future date)
- CVV: `123` (any 3 digits)

**❌ Test Failures:**
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

## 🔄 Switch to Live Mode (When Ready)

1. In your deployment environment variables, replace:
   - `pk_test_...` → `pk_live_51RZY2qRXzJTxwxZ4mQQKBYdt2OLJ5gjgHyWypJierPgWnIAsx74JLfEtj7H5Tl7w5mB7LYKXE8gPFIpM3nz6gGrJ00tgTWjNHb`
   - `sk_test_...` → `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`
2. Redeploy automatically

## 🎯 What You Get

- **Express Checkout** with PayPal/Google Pay/Apple Pay buttons
- **Full e-commerce** functionality 
- **Safe testing** with test cards
- **Order management** and email confirmations
- **Admin dashboard** for managing orders
- **Responsive design** that works on all devices

## 🛡️ Security Features

- SSL encryption (automatic with Vercel)
- PCI compliant payment processing  
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure authentication with Supabase

---

**Ready to deploy?** Just follow the Vercel steps above and your site will be live with safe test mode in minutes!