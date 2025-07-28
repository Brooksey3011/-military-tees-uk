# 📁 FILE MANAGER DEPLOYMENT - Military Tees UK

## 🎯 SIMPLE UPLOAD WITH FILE MANAGER ONLY

You can deploy your entire website using just Hostinger's File Manager! Here's the simplified process:

---

## 📦 STEP 1: Create Your Upload ZIP

### **What to Include:**
Create a ZIP file with these folders/files:
```
.next/              ← Your built website
public/             ← Images and static files  
src/                ← Source code
node_modules/       ← All dependencies
package.json        ← Project configuration
package-lock.json   ← Dependency versions
server.js           ← Server startup file
next.config.ts      ← Next.js configuration
tsconfig.json       ← TypeScript config
postcss.config.mjs  ← CSS config
```

### **How to Create ZIP:**
1. Select all these folders/files in Windows Explorer
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Name it: `military-tees-uk-production.zip`

---

## 🌐 STEP 2: Hostinger File Manager Upload

### **Access File Manager:**
1. Login to Hostinger Control Panel
2. Go to **"File Manager"** 
3. Navigate to **"public_html"** folder

### **Upload Process:**
1. Click **"Upload"** button in File Manager
2. Select your `military-tees-uk-production.zip`
3. Wait for upload to complete
4. Right-click the ZIP file → **"Extract"**
5. Extract to: `/public_html/` (root directory)

### **File Structure After Extract:**
```
public_html/
  ├── .next/
  ├── public/
  ├── src/
  ├── node_modules/
  ├── package.json
  ├── server.js
  └── other files...
```

---

## ⚙️ STEP 3: Create Node.js App

### **In Hostinger Control Panel:**
1. Go to **"Node.js"** section
2. Click **"Create Node.js Application"**
3. Configure:
   - **App Name:** military-tees-uk
   - **Domain:** militarytees.co.uk
   - **Node Version:** 18.x
   - **App Root:** `/public_html`
   - **Startup File:** `server.js`

---

## 🔧 STEP 4: Environment Variables

In your Node.js app settings, add these variables:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://rdpjldootsglcbzhfkdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzc2MjMsImV4cCI6MjA2ODcxMzYyM30.yp7j4ulpuu6uAhQDY2C0ahBLvovNo3fuf332fta3wQw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RZY2qRXzJTxwxZ4mQQKBYdt2OLJ5gjgHyWypJierPgWnIAsx74JLfEtj7H5Tl7w5mB7LYKXE8gPFIpM3nz6gGrJ00tgTWjNHb
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_3UctK9aMDIjfSCrwnecDe3jMzmJ40QL5
NEXT_PUBLIC_APP_URL=https://militarytees.co.uk
NEXT_PUBLIC_APP_NAME=Military Tees UK
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@militarytees.co.uk
SMTP_PASS=W;^#;=mi!5X
EMAIL_FROM=info@militarytees.co.uk
ADMIN_EMAIL=admin@militarytees.co.uk
```

---

## 🚀 STEP 5: Start Your Website

1. Click **"Start"** button in Node.js app panel
2. Wait for startup (may take 1-2 minutes)
3. Check logs for any errors
4. Visit your domain: **militarytees.co.uk**

---

## 📋 SIMPLIFIED CHECKLIST

**File Manager Steps:**
- [ ] Upload ZIP file to `/public_html/`
- [ ] Extract ZIP file
- [ ] Verify all folders are present

**Node.js App Steps:**
- [ ] Create Node.js application
- [ ] Set startup file to `server.js`
- [ ] Add all environment variables
- [ ] Start the application

**Domain Steps:**
- [ ] Point domain to Node.js app
- [ ] Test website loads
- [ ] Verify SSL certificate

---

## 🆘 QUICK TROUBLESHOOTING

**❌ Upload Too Large?**
- Try uploading in parts (src/, public/, .next/ separately)
- Use File Manager's folder upload feature

**❌ Extract Failed?**
- Try extracting to a subfolder first
- Then move files to public_html root

**❌ App Won't Start?**
- Check Node.js version is 18+
- Verify server.js is in the right location
- Check application logs

---

## ⏱️ ESTIMATED TIME: 20-30 MINUTES

1. **ZIP Creation:** 5 minutes
2. **Upload:** 5-10 minutes (depends on connection)
3. **Node.js Setup:** 5-10 minutes
4. **Testing:** 5-10 minutes

---

## 📞 NEED HELP?

If anything goes wrong:
1. Check Hostinger's Node.js app logs
2. Verify file permissions in File Manager
3. Contact Hostinger support for technical issues

**Your website is ready to go live with just File Manager! 🚀**