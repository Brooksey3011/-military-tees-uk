# 📧 Hostinger Email Setup Guide for Military Tees UK

## 🎯 Quick Setup (2 minutes)

Your order confirmation emails are ready to go! Just add these environment variables to enable Hostinger SMTP.

## 📋 **Step 1: Get Your Hostinger Email Settings**

### **From Your Hostinger Account:**
1. **Login to Hostinger hPanel**
2. **Go to:** Email Accounts → Your Domain → Email Accounts
3. **Find Your Email Settings:**

**Your Hostinger SMTP Settings:**
```
Incoming Server (IMAP): imap.hostinger.com (Port 993)
Outgoing Server (SMTP): smtp.hostinger.com (Port 465)
Incoming Server (POP): pop.hostinger.com (Port 995)
Authentication: Required
```

**We'll use the SMTP server: `smtp.hostinger.com` with port `465`**

## 🔧 **Step 2: Environment Variables**

Add these exact variables to your **environment** (replace with your actual details):

### **For Local Development (.env.local):**
```env
# Hostinger Email Configuration
HOSTINGER_EMAIL_HOST=smtp.hostinger.com
HOSTINGER_EMAIL_USER=your-email@yourdomain.com
HOSTINGER_EMAIL_PASS=your_email_password_here
HOSTINGER_EMAIL_PORT=465
HOSTINGER_EMAIL_SECURE=true
```

### **For Production (Vercel Environment Variables):**
```
HOSTINGER_EMAIL_HOST → smtp.hostinger.com
HOSTINGER_EMAIL_USER → your-email@yourdomain.com  
HOSTINGER_EMAIL_PASS → your_email_password_here
HOSTINGER_EMAIL_PORT → 465
HOSTINGER_EMAIL_SECURE → true
```

## 📨 **Step 3: Email Account Setup**

### **Recommended Email Address:**
- **Create:** `orders@militarytees.co.uk` (or your domain)
- **Purpose:** Dedicated to order confirmations
- **Professional:** Matches your brand

### **Alternative Options:**
- `noreply@militarytees.co.uk`
- `shop@militarytees.co.uk`
- `info@militarytees.co.uk`

## ⚙️ **Step 4: Configuration Options**

### **Port Settings:**
- **587 (Recommended):** STARTTLS encryption, set `HOSTINGER_EMAIL_SECURE=false`
- **465 (Alternative):** SSL encryption, set `HOSTINGER_EMAIL_SECURE=true`

### **Security Settings:**
- **TLS/STARTTLS (Port 587):** Modern, recommended
- **SSL (Port 465):** Legacy but works

## 🧪 **Step 5: Test the Setup**

Once configured, test with:
```bash
curl -X POST http://localhost:3001/api/email/order-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "MTU-TEST123",
    "customerEmail": "your-test-email@gmail.com",
    "customerName": "Test Customer",
    "items": [{"name": "Test Product", "price": 20.99, "quantity": 1}],
    "shippingAddress": {"address1": "123 Test St", "city": "London", "postcode": "SW1A 1AA"},
    "subtotal": 20.99,
    "shipping": 4.99,
    "tax": 5.20,
    "total": 31.18
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "messageId": "unique-message-id",
  "service": "hostinger"
}
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **"Authentication Failed"**
- ✅ **Check:** Email password is correct
- ✅ **Verify:** Email account exists in Hostinger
- ✅ **Try:** Reset email password in hPanel

#### **"Connection Timeout"**
- ✅ **Check:** `HOSTINGER_EMAIL_HOST` is correct (usually `mail.yourdomain.com`)
- ✅ **Try:** Different port (587 or 465)
- ✅ **Verify:** Domain DNS settings are correct

#### **"TLS/SSL Error"**
- ✅ **Port 587:** Set `HOSTINGER_EMAIL_SECURE=false`
- ✅ **Port 465:** Set `HOSTINGER_EMAIL_SECURE=true`

### **Hostinger-Specific Settings:**
Most Hostinger accounts use:
```
Host: mail.yourdomain.com
Port: 587 or 465
Security: STARTTLS (587) or SSL (465)
```

## 🎖️ **Professional Email Template Features**

Once configured, customers will receive:

### ✅ **Professional Order Confirmations:**
- Military heritage branding
- Complete order details with itemization
- Customer shipping address
- Order number and estimated delivery
- Professional Military Tees UK styling

### ✅ **Email Content Includes:**
- Order confirmation with military branding
- Itemized product details (name, size, color, quantity)
- Complete pricing breakdown (subtotal, shipping, VAT, total)
- Shipping address confirmation
- Estimated delivery dates
- Next steps and contact information
- Professional footer with company details

## 🚀 **Quick Start Summary**

1. **Create email:** `orders@militarytees.co.uk` in Hostinger
2. **Add 5 environment variables** (see Step 2)
3. **Deploy/restart** your application
4. **Test** with the curl command above
5. **✅ Done!** Customers now get professional order confirmations

## 💡 **Pro Tips**

- **Email Address:** Use `orders@` for professional appearance
- **Port 587:** Generally more reliable than 465
- **Password Security:** Use a strong, unique password for your email account
- **Testing:** Always test with your own email first

Your Hostinger email will now send professional, military-themed order confirmations to every customer! 🎖️