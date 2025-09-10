# Email System Setup - Military Tees UK

Complete guide to set up all email functionality including welcome emails and password reset styling.

## 📧 Current Email Status

| Email Type | Status | Location |
|------------|--------|----------|
| Order Confirmation | ✅ **ACTIVE** | Stripe webhook → `src/lib/email-service.ts` |
| Welcome Email | ✅ **READY** | Template + API created, needs deployment |
| Password Reset | ✅ **READY** | Custom styling created, needs deployment |

---

## 🚀 Deployment Steps

### Step 1: Update Domain URLs

**Update these files with your actual domain:**

1. **`database/functions/send-welcome-email.sql`** (Line 4):
   ```sql
   webhook_url TEXT := 'https://your-domain.vercel.app/api/auth/welcome';
   ```

2. **`database/auth-hooks/password-reset-hook.sql`** (Lines 7, 16):
   ```sql
   webhook_url TEXT := 'https://your-domain.vercel.app/api/auth/password-reset';
   reset_url := 'https://your-domain.vercel.app/auth/reset-password?token=' || NEW.recovery_token || '&type=recovery';
   ```

Replace `your-domain.vercel.app` with your actual domain (e.g., `militarytees.co.uk`).

---

### Step 2: Deploy Code Changes

```bash
# Commit and push the new email functionality
git add .
git commit -m "✉️ COMPLETE EMAIL SYSTEM: Welcome emails + password reset styling"
git push
```

---

### Step 3: Configure Supabase Database

**In your Supabase SQL Editor, run these commands:**

1. **Enable HTTP extension** (if not already enabled):
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

2. **Deploy welcome email trigger**:
   - Copy contents of `database/functions/send-welcome-email.sql`
   - Update the webhook URL with your domain
   - Run in Supabase SQL Editor

3. **Deploy password reset hook**:
   - Copy contents of `database/auth-hooks/password-reset-hook.sql`
   - Update webhook URLs with your domain
   - Run in Supabase SQL Editor

---

### Step 4: Test Email Functionality

**Test Welcome Emails:**
1. Create a new account on your site
2. Check logs in Supabase Dashboard → Database → Logs
3. Verify email arrives with Military Tees UK styling

**Test Password Reset:**
1. Go to login page → "Forgot Password"
2. Enter email address
3. Check for custom styled password reset email
4. Verify reset link works correctly

**Test Order Confirmation:**
- Already working via Stripe webhook ✅

---

## 🔧 Advanced Configuration

### Option A: Webhook-Based (Recommended)
- Uses the API endpoints we created
- Full control over email styling
- Better logging and error handling
- Current setup uses this approach

### Option B: Supabase Email Template Override
If webhooks don't work, you can override Supabase's built-in templates:

1. Go to **Supabase Dashboard → Auth → Email Templates**
2. Edit "Reset Password" template
3. Use HTML from `src/lib/email-templates/password-reset.ts`

---

## 📊 Monitoring & Logs

**Check email delivery:**
- **Resend Dashboard**: View sent emails and delivery status
- **Supabase Logs**: Database → Logs → Functions (webhook triggers)
- **Vercel Logs**: Function logs for API endpoints

**Common issues:**
- 🔍 **Webhook not triggering**: Check Supabase logs for errors
- 📧 **Emails not sending**: Check Resend API key and from address
- 🌐 **Wrong reset URLs**: Verify domain configuration

---

## ✅ Final Checklist

- [ ] Updated domain URLs in all SQL files
- [ ] Deployed code changes to Vercel/production
- [ ] Ran welcome email SQL in Supabase
- [ ] Ran password reset hook SQL in Supabase
- [ ] Enabled pg_net extension in Supabase
- [ ] Tested new user signup → welcome email
- [ ] Tested password reset → custom styled email
- [ ] Verified all emails have Military Tees UK branding

---

## 🎯 Email System Complete!

Once deployed, your email system will include:

✅ **Professional order confirmations** (already working)  
✅ **Welcome emails** for new signups  
✅ **Styled password reset emails**  
✅ **Military heritage branding** throughout  
✅ **Admin notifications** for orders  
✅ **Enterprise-grade deliverability** via Resend  

Your email system is now complete and professional! 🚀