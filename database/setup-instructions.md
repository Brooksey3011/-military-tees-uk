# 🛡️ Military Tees UK - Database Setup Instructions

This guide explains how to set up your Supabase database for both local development and production.

## Quick Start (Local Development)

For local development, you only need **ONE FILE**:

### 1. Run the Main Setup File
```sql
-- Copy and paste this file in Supabase SQL Editor:
database/local-dev-setup-fixed.sql
```

This single file creates:
- ✅ All core tables (products, orders, customers, etc.)
- ✅ Sample data (3 products with variants)
- ✅ Row Level Security policies
- ✅ Basic functionality for localhost:3000

## Full Production Setup

For production with all advanced features, run these files **in order**:

### 1. Core Setup (Required)
```sql
database/local-dev-setup-fixed.sql
```

### 2. Advanced Features (Optional)
Add these for full production functionality:

```sql
-- Inventory Management (stock tracking, alerts)
database/inventory-schema.sql

-- Customer Reviews (with photos, moderation)
database/reviews-schema.sql

-- Marketing Automation (campaigns, segmentation, A/B testing)
database/marketing-schema.sql

-- Analytics & Monitoring (performance tracking, error logging)
database/monitoring-schema.sql
```

## Environment Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: **Military Tees UK**
3. Choose region: **EU West** (for UK users)
4. Set strong database password

### 2. Get API Credentials
From Project Settings → API, copy these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run Database Schema
1. Open **SQL Editor** in Supabase dashboard
2. Create **new query**
3. Copy and paste your chosen SQL file(s)
4. Click **"Run"** to execute

## Authentication Setup

### Enable Authentication Methods
Go to Authentication → Settings:

- ✅ **Email Authentication**: Enable for user accounts
- ✅ **Magic Links**: Enable for passwordless login (optional)
- ⚙️ **OAuth Providers**: Google, GitHub, etc. (optional)

### Email Templates
Configure in Authentication → Email Templates:
- **Confirmation**: Welcome message
- **Magic Link**: Passwordless login
- **Recovery**: Password reset

## Storage Setup (For File Uploads)

### Create Storage Buckets
Go to Storage and create these buckets:

1. **`product-images`** (Public)
   - For product photos
   - Allow: `.jpg`, `.png`, `.webp`
   - Max size: 5MB

2. **`custom-designs`** (Private) 
   - For customer design uploads
   - Allow: `.jpg`, `.png`, `.pdf`
   - Max size: 10MB

3. **`review-images`** (Public)
   - For customer review photos
   - Allow: `.jpg`, `.png`, `.webp`
   - Max size: 5MB

### Storage Policies
```sql
-- Allow public read access to product images
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload custom designs
CREATE POLICY "Authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'custom-designs' AND auth.role() = 'authenticated');
```

## Admin Access Setup

### Create Admin User
1. Sign up through your app at `/signup`
2. In Supabase Dashboard → Authentication → Users
3. Find your user and edit `raw_user_meta_data`:
   ```json
   {"role": "admin"}
   ```
4. Access admin at: `/admin`

### Enable 2FA (Production)
For production admin accounts:
1. Login to admin dashboard
2. Go to Admin Settings
3. Enable Two-Factor Authentication
4. Scan QR code with authenticator app

## File Structure Summary

After cleanup, your `/database` folder contains:

```
database/
├── local-dev-setup-fixed.sql    ⭐ Main setup file
├── inventory-schema.sql          📦 Stock management
├── reviews-schema.sql            ⭐ Customer reviews
├── marketing-schema.sql          📧 Email campaigns
├── monitoring-schema.sql         📊 Analytics
└── setup-instructions.md        📖 This file
```

## Verification Checklist

After setup, verify these work:

- [ ] **Products page**: `/products` shows sample products
- [ ] **User signup**: `/signup` creates new accounts
- [ ] **User login**: `/login` authenticates users
- [ ] **Add to cart**: Cart functionality works  
- [ ] **Custom quotes**: `/custom` form submits
- [ ] **Admin access**: `/admin` with your admin account

## Troubleshooting

### Common Issues

**"relation does not exist" errors:**
- Ensure you ran the SQL files in correct order
- Check SQL Editor for any failed queries

**Authentication not working:**
- Verify environment variables in `.env.local`
- Check Authentication settings are enabled

**File uploads failing:**
- Verify storage buckets exist
- Check storage policies allow uploads

**Admin access denied:**
- Confirm user has `"role": "admin"` in metadata
- Check you're using the correct login credentials

## Need Help?

- 📖 **Local Setup**: See `QUICK-START.md`
- 🚀 **Deployment**: See `DEPLOYMENT.md`
- 🛠️ **Development**: See `LOCAL-SETUP.md`

---

**🛡️ Military Tees UK - Database Ready for Service!**