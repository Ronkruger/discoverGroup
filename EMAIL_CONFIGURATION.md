# 📧 Email Configuration Guide

Your booking system requires email configuration to send booking confirmations and verification emails. The system supports multiple email providers with automatic fallback.

## 🔧 Required Environment Variables

Add these environment variables to your **Render.com** dashboard (or `.env` file for local development):

### Option 1: SendGrid (Recommended for Production) ⭐

SendGrid provides reliable email delivery with templates and analytics.

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Optional, uses inline HTML if not provided
```

**Setup Steps:**
1. Create account at https://sendgrid.com
2. Verify your sender email address
3. Create API Key with "Mail Send" permission
4. (Optional) Create dynamic template for booking confirmations
5. Add environment variables to Render

**SendGrid Setup Guide:** See `SENDGRID_SETUP_GUIDE.md` for detailed instructions

---

### Option 2: Gmail SMTP

Use Gmail to send emails. Good for testing or small volume.

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an app-specific password named "Discover Group Booking"
4. Use that 16-character password (no spaces) as `EMAIL_PASS`
5. Add both variables to Render

⚠️ **Important:** Regular Gmail password won't work. You MUST use an app-specific password.

---

### Option 3: Ethereal Email (Development/Testing Only)

The system automatically uses Ethereal Email for testing if no credentials are provided. Emails are not actually delivered but you get a preview link in the console logs.

**No configuration needed** - this is automatic for development.

---

## 🚀 Adding Environment Variables to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your API service (`discovergroup`)
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Add each variable:
   - **Key:** `SENDGRID_API_KEY` (or `EMAIL_USER`)
   - **Value:** Your API key or email
6. Click **"Save Changes"**
7. Render will automatically redeploy your service

---

## 🧪 Testing Email Configuration

After adding environment variables:

1. **Check Render Logs:**
   ```
   ✅ SendGrid initialized successfully in API
   ```
   or
   ```
   ⚠️ SendGrid API key not found - email sending will use fallback
   ```

2. **Test Booking:**
   - Make a test booking on your website
   - Check Render logs for:
     ```
     📧 Attempting to send booking confirmation email
     🔧 Environment check:
     - SENDGRID_API_KEY: ✅ Set
     ✅ Email sent successfully via SendGrid
     ```

3. **Check Email Inbox:**
   - Customer should receive booking confirmation
   - Booking department email should also receive copy

---

## 📋 Email Types Sent

### 1. Booking Confirmation
- **Sent to:** Customer + Booking Department
- **When:** After successful payment
- **Contains:** Booking ID, tour details, payment info, next steps

### 2. Email Verification
- **Sent to:** New user registrations
- **When:** User registers account
- **Contains:** Verification link (24-hour validity)

---

## 🔍 Troubleshooting

### "Failed to send email" error

**Check Render Logs:**
```bash
# In Render dashboard, go to Logs tab and look for:
❌ Email sending failed
```

**Common Issues:**

1. **SendGrid not configured:**
   ```
   ⚠️ SendGrid API key not found
   ```
   → Add `SENDGRID_API_KEY` to Render environment variables

2. **Invalid SendGrid API Key:**
   ```
   ❌ SendGrid error: Unauthorized
   ```
   → Verify your API key is correct and has "Mail Send" permission

3. **Gmail authentication failed:**
   ```
   ❌ Invalid login: 535-5.7.8 Username and Password not accepted
   ```
   → Use app-specific password, not regular password
   → Enable 2FA first, then create app password

4. **Sender not verified:**
   ```
   ❌ The from address does not match a verified Sender Identity
   ```
   → Verify your sender email in SendGrid dashboard

---

## 📊 Email Settings (Admin Panel)

Configure email settings in your admin panel:

1. Go to: `admindiscovergrp.netlify.app/settings`
2. Scroll to **Email Configuration**
3. Set:
   - **From Address:** `noreply@yourdomain.com` (must be verified in SendGrid)
   - **From Name:** `Discover Group`
   - **Booking Department Email:** `reservations@yourdomain.com`

---

## 🎯 Recommended Configuration for Production

```bash
# Render Environment Variables (Production)
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key
SENDGRID_TEMPLATE_ID=d-your-template-id  # Optional
CLIENT_URL=https://discovergrp.netlify.app
ADMIN_URL=https://admindiscovergrp.netlify.app
```

---

## 📝 Current Status

Based on your error, you need to:

1. ✅ **Booking is saved successfully** - Working!
2. ❌ **Email not sending** - Needs configuration

**Next Step:** Add either `SENDGRID_API_KEY` or `EMAIL_USER` + `EMAIL_PASS` to your Render environment variables.

---

## 💡 Quick Start (Fastest Method)

**Use Gmail (5 minutes):**

1. Go to: https://myaccount.google.com/apppasswords
2. Create app password: "Discover Group"
3. Copy the 16-character password
4. Add to Render:
   - `EMAIL_USER`: your-email@gmail.com
   - `EMAIL_PASS`: the-16-char-password
5. Save and wait for deployment

**Done!** Emails will now be sent via Gmail.

---

## 📞 Support

If you continue having issues:

1. Check Render logs for specific error messages
2. Verify environment variables are set correctly (no typos)
3. Test with a simple booking
4. Check spam folder for emails

For SendGrid-specific issues, see: `SENDGRID_SETUP_GUIDE.md`
