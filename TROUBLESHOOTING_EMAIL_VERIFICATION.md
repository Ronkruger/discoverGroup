# 🔧 Troubleshooting Email Verification Issues

## Current Issues

### 1️⃣ 403 Forbidden Error on Login
**Cause:** User account is not email verified  
**Solution:** Verify the email or bypass verification (see options below)

### 2️⃣ 500 Error on Resend Verification Email
**Cause:** Email service not properly configured on Render  
**Solution:** Configure SendGrid or Gmail SMTP (see options below)

---

## ✅ Solution Options

### Option A: Manually Verify User (Quick Fix for Development)

Run this script to verify your email in the database:

```bash
# Navigate to project root
cd c:\Users\romsl\Desktop\scratch\discoverGroup-clean

# Run the verification script
node scripts/verify-user-email.cjs romslantano@gmail.com
```

This will:
- ✅ Set `isEmailVerified: true` in the database
- ✅ Remove verification token
- ✅ Allow immediate login

---

### Option B: Configure SendGrid on Render (Production Fix)

#### Step 1: Verify SendGrid API Key is Active

1. Log in to SendGrid: https://app.sendgrid.com
2. Go to **Settings** → **API Keys**
3. Check if your API key exists and is active
4. If not, create a new one with **Mail Send** permissions

#### Step 2: Add to Render Environment Variables

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your API service (discovergroup.onrender.com)
3. Go to **Environment** tab
4. Add/Update these variables:

```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=info@discovergrouptravel.com
SENDGRID_FROM_NAME=Discover Group Travel
CLIENT_URL=https://discovergroup.netlify.app
```

5. Click **Save Changes**
6. Render will automatically redeploy

#### Step 3: Verify Sender Identity in SendGrid

1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Add your email: `info@discovergrouptravel.com`
4. Check the email inbox and click verification link
5. ⚠️ **Critical:** SendGrid won't send emails until sender is verified!

---

### Option C: Use Gmail SMTP (Alternative)

If SendGrid is not working, use Gmail as a backup:

#### Step 1: Generate Gmail App Password

1. Log in to your Gmail account
2. Enable 2-Factor Authentication if not already enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Create app password named "Discover Group API"
5. Copy the 16-character password (no spaces)

#### Step 2: Add to Render Environment Variables

```bash
EMAIL_USER=romslantano@gmail.com
EMAIL_PASS=your-16-char-app-password
```

Remove or comment out `SENDGRID_API_KEY` to force Gmail fallback.

---

## 🔍 Checking Server Logs

To see detailed email sending logs on Render:

1. Go to Render dashboard
2. Select your API service
3. Click **Logs** tab
4. Look for these log messages:

```
📧 Sending verification email to: [email]
🔧 Environment check for verification email:
- SENDGRID_API_KEY: ✅ Set
- EMAIL_USER: ❌ Not set
```

**If you see "✅ Set" but still getting errors:**
- SendGrid sender email might not be verified
- API key might be revoked or restricted
- SendGrid account might be suspended

---

## 🧪 Testing Email Configuration

After configuring, test the resend verification:

1. Try logging in with unverified account
2. Click "Resend Verification Email" button
3. Check browser console for detailed error
4. Check Render logs for server-side details

---

## 🚀 Quick Development Workflow

For local development without email setup:

1. **Bypass verification check** temporarily:
   ```typescript
   // In apps/api/src/routes/auth.ts, comment out lines 218-222
   // if (user.role === 'client' && !user.isEmailVerified) {
   //   return res.status(403).json({ ... });
   // }
   ```

2. **Or use the script** to verify users as they register:
   ```bash
   node scripts/verify-user-email.cjs <email>
   ```

---

## 📧 Common SendGrid Issues

### "Sender email not verified"
**Solution:** Go to SendGrid → Sender Authentication → Verify sender

### "Invalid API Key"
**Solution:** Regenerate API key in SendGrid and update Render environment

### "Daily sending limit exceeded"
**Solution:** Upgrade SendGrid plan or wait 24 hours

### "Account suspended"
**Solution:** Contact SendGrid support or use Gmail fallback

---

## 🔗 Useful Links

- **SendGrid Dashboard:** https://app.sendgrid.com
- **SendGrid Setup Guide:** See `SENDGRID_SETUP_GUIDE.md`
- **Email Configuration:** See `EMAIL_CONFIGURATION.md`
- **Render Dashboard:** https://dashboard.render.com
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

---

## 💡 Recommended Production Setup

1. ✅ Use SendGrid for production (more reliable, better deliverability)
2. ✅ Verify sender email in SendGrid
3. ✅ Set all environment variables on Render
4. ✅ Keep Gmail as fallback option
5. ✅ Monitor Render logs for email sending issues
6. ✅ Test verification flow after deployment

---

## 🆘 Still Having Issues?

Check these in order:

1. [ ] SendGrid API key is set on Render
2. [ ] Sender email is verified in SendGrid
3. [ ] CLIENT_URL is set correctly on Render
4. [ ] Server logs show email sending attempt
5. [ ] No SendGrid account suspension
6. [ ] API key has "Mail Send" permission

If all checks pass and still failing, use the manual verification script or switch to Gmail SMTP.
