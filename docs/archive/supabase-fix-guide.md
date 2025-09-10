# 🔧 Supabase Connection Fix Guide

## 🚨 ISSUE IDENTIFIED
Your Supabase API keys are returning "Invalid API key" errors. This means they've either expired or been regenerated.

## 📋 IMMEDIATE ACTION REQUIRED

### Step 1: Get New API Keys from Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `rdpjldootsglcbzhfkdi` 
3. **Navigate to Settings → API**
4. **Copy the new keys**:
   - `anon public` key
   - `service_role` key (keep this secret!)

### Step 2: Update Environment Variables

Replace in your `.env.local` file:

```env
# OLD KEYS (INVALID)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NzQxMDEsImV4cCI6MjA1MTM1MDEwMX0.4Y0UKfcj3_DyV3KeYHwW83HQqUBnvkW9GgkGzBOq9Q0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc3NDEwMSwiZXhwIjoyMDUxMzUwMTAxfQ.k1gy_9rkVpyoKRYGKr0XuPPPUHeCAfDGLd39RzOEBKE

# NEW KEYS (GET FROM DASHBOARD)
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_ANON_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY_HERE]
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 ALTERNATIVE: Check Project Status

If new keys don't work, check:

1. **Project Status**: Is the project active/not paused?
2. **Billing**: Is there an outstanding payment?
3. **Usage Limits**: Have you exceeded free tier limits?

## 📞 NEXT STEPS AFTER FIX

Once you get new API keys:

1. Update `.env.local` with new keys
2. Restart the dev server
3. Test: `curl -s http://localhost:3002/api/debug`
4. Should see working database connection
5. Test checkout with real products from your Supabase database

## 🎯 WHY THIS HAPPENED

- Supabase API keys have expiration dates
- Keys may be regenerated for security reasons
- Project settings might have changed

---

**IMPORTANT**: Get the new keys from your Supabase dashboard first, then I'll help test the connection and get your checkout working with real data.