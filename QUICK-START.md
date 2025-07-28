# 🚀 Military Tees UK - Quick Start Guide

Get the Military Tees UK e-commerce platform running on `localhost:3000` in just a few minutes!

## Prerequisites

- **Node.js 18+** installed
- **Supabase account** (free at [supabase.com](https://supabase.com))

## 1. Automated Setup (Recommended)

Run the automated setup script:

```bash
npm run setup
```

This will:
- ✅ Install all dependencies
- ✅ Create your `.env.local` file
- ✅ Verify project structure
- ✅ Generate security keys

## 2. Supabase Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard)

2. **Get your credentials** from Project Settings > API:
   - Project URL
   - Anon public key  
   - Service role key (secret)

3. **Update `.env.local`** with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

4. **Run the database setup** in Supabase SQL Editor:
   - Copy and paste: `database/local-dev-setup.sql`
   - This creates all tables and sample data

## 3. Start Development Server

```bash
npm run dev
```

🌐 **Open**: http://localhost:3000

## 4. Admin Access (Optional)

To access the admin dashboard at `/admin`:

1. **Create an account** at `/signup`
2. **In Supabase Dashboard** → Authentication → Users
3. **Edit your user** and add to `raw_user_meta_data`:
   ```json
   {"role": "admin"}
   ```
4. **Access admin** at: http://localhost:3000/admin

## ✅ You're Ready!

The platform includes:
- 🛍️ **Full e-commerce** - Products, cart, checkout
- 👤 **User accounts** - Registration, login, profiles  
- 🎨 **Custom orders** - Quote system with image uploads
- ⭐ **Reviews system** - Customer reviews with photos
- 📊 **Admin dashboard** - Complete management interface
- 📧 **Marketing suite** - Email campaigns, automation, A/B testing
- 📱 **Responsive design** - Works on all devices

## Troubleshooting

**Port 3000 in use?**
```bash
npx kill-port 3000
# Or use different port:
npm run dev -- -p 3001
```

**Database issues?**
- Check your Supabase credentials in `.env.local`
- Ensure the SQL script ran successfully
- Verify your Supabase project is active

**Need help?**
- See `LOCAL-SETUP.md` for detailed instructions
- Check `docs/` folder for additional documentation

---

**🛡️ Military Tees UK - Ready to serve!**