# 📧 Gmail SMTP Configuration for Discover Group

## ✅ Sender Email: romanolantano.discovergrp@gmail.com

---

## 🔧 Environment Variables to Add on Render

Go to: https://dashboard.render.com → Your API Service → Environment Tab

**Remove or comment out:**
```bash
# SENDGRID_API_KEY=...  (Comment this out to use Gmail)
```

**Add these variables:**
```bash
EMAIL_USER=romanolantano.discovergrp@gmail.com
EMAIL_PASS=<your-16-char-app-password>
SENDGRID_FROM_EMAIL=romanolantano.discovergrp@gmail.com
SENDGRID_FROM_NAME=Discover Group Travel
CLIENT_URL=https://discovergroup.netlify.app
```

---

## 📝 How to Get App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with: `romanolantano.discovergrp@gmail.com`
3. **If you see "App passwords unavailable":**
   - Enable 2-Step Verification first: https://myaccount.google.com/signinoptions/two-step-verification
   - Wait a few minutes, then try again
4. Click "Select app" → Choose "Mail"
5. Click "Select device" → Choose "Other" → Type "Discover Group API"
6. Click "Generate"
7. **Copy the 16-character password** (remove spaces when copying)

---

## 🚀 After Setting Environment Variables

1. **Save changes** on Render (it will auto-redeploy)
2. **Wait 2-3 minutes** for deployment to complete
3. **Test the verification email:**
   - Go to: https://discovergroup.netlify.app/login
   - Try to login with unverified account
   - Click "Resend Verification Email"
   - Check `romanolantano.discovergrp@gmail.com` inbox for the email

---

## 📊 Gmail Sending Limits

- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2,000 emails/day

This should be sufficient for your booking system.

---

## 🔍 Verifying Configuration

After deploying, check Render logs for:

```
📧 Using Nodemailer with Gmail for verification email
✅ Verification email sent successfully!
```

If you see:
```
❌ SendGrid not configured or failed, using Nodemailer fallback
```
That's expected and correct!

---

## ⚠️ Important Notes

1. **Never commit app password to Git** (keep it in Render environment only)
2. **The app password is different from your Gmail password**
3. **2-Step Verification must be enabled** to generate app passwords
4. **Remove spaces** from the 16-character password when adding to Render

---

## 🆘 Troubleshooting

### "App passwords unavailable"
→ Enable 2-Step Verification first

### "Invalid credentials" error
→ Make sure you copied the entire 16-char password without spaces

### Still getting 500 errors
→ Check Render logs to see detailed error message

---

## ✅ Verification Checklist

- [ ] 2-Step Verification enabled on Gmail account
- [ ] App password generated
- [ ] `EMAIL_USER` added to Render environment
- [ ] `EMAIL_PASS` added to Render environment (16 chars, no spaces)
- [ ] `SENDGRID_API_KEY` removed or commented out
- [ ] Render service redeployed
- [ ] Test verification email sent successfully

---

## 📞 Next Steps After Setup

Once configured:

1. **Test immediately:** Try resending verification email
2. **Monitor logs:** Check Render logs for email sending status
3. **Verify inbox:** Check romanolantano.discovergrp@gmail.com inbox
4. **Update docs:** Document this as the official email for the system

---

**Configuration Time:** ~5 minutes  
**Status:** Ready to use for development and production ✅
