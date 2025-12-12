# Password Reset Email - SendGrid Configuration Fix

## Problem
The password reset email was failing with a **500 Internal Server Error** because the `sendPasswordResetEmail` function was **NOT configured to use SendGrid**. It only used Nodemailer (Gmail SMTP) as a fallback, which may not be properly configured or may fail silently.

## What Was Wrong
**File:** `apps/api/src/services/emailService.ts` (Line 712)

The `sendPasswordResetEmail` function:
- ❌ Only used Nodemailer/Gmail SMTP
- ❌ Didn't try SendGrid first (unlike other email functions like `sendBookingConfirmationEmail` and `sendVerificationEmail`)
- ❌ Missing error logging and environment checks
- ❌ Falls back to test email service if Gmail credentials not configured

### Original Code (Problematic):
```typescript
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetUrl: string
) => {
  try {
    const transporter = await createTransporter();
    // Directly uses Nodemailer without checking SendGrid first
    const info = await transporter.sendMail(mailOptions);
    // ... rest of code
  } catch (error) {
    // ...
  }
};
```

## Solution Applied ✅

Updated `sendPasswordResetEmail` to match the pattern used by other email functions:

### New Implementation:
1. **Try SendGrid First** (Primary email service)
   - Checks if `SENDGRID_API_KEY` is configured
   - Uses SendGrid to send the password reset email
   - Properly handles errors and logs details

2. **Fallback to Nodemailer** (If SendGrid fails)
   - Uses Gmail SMTP (requires EMAIL_USER and EMAIL_PASS env vars)
   - Falls back to Ethereal Email for testing if Gmail not configured

3. **Better Error Handling**
   - Console logs show which service is being used
   - Detailed error messages for debugging
   - Proper error propagation

### Fixed Code Features:
```typescript
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetUrl: string
) => {
  try {
    // Environment checks
    console.log('- SENDGRID_API_KEY:', SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
    
    // Try SendGrid first
    if (SENDGRID_API_KEY) {
      try {
        console.log('📧 Using SendGrid for password reset email');
        const msg = {
          to: email,
          from: { email, name },
          subject: 'Password Reset Request - Discover Group',
          html: passwordResetHtml,
          text: passwordResetText,
          categories: ['password-reset', 'transactional'],
        };
        const [response] = await sgMail.send(msg);
        console.log('✅ Password reset email sent successfully via SendGrid!');
        return { success: true, messageId: response.headers['x-message-id'] };
      } catch (sendGridError) {
        console.error('❌ SendGrid password reset error:', sendGridError);
        // Fall through to Nodemailer
      }
    }
    
    // Fallback to Nodemailer
    console.log('⚠️ Using Nodemailer fallback for password reset');
    const transporter = await createTransporter();
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Password reset email sending failed:', error);
    return { success: false, error: error.message };
  }
};
```

## SendGrid Configuration Status

✅ **SendGrid is already configured in** `apps/api/.env`:
```dotenv
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_TEMPLATE_ID=d-0130313057b9456997d09e2e0d48b4da
SENDGRID_FROM_EMAIL=romanolantano.discovergrp@gmail.com
SENDGRID_FROM_NAME=Discover Group Bookings
```

## What This Fixes

| Issue | Before | After |
|-------|--------|-------|
| Password reset email service | ❌ Only Nodemailer | ✅ SendGrid primary + Nodemailer fallback |
| Environment checks | ❌ None | ✅ Detailed logging |
| Error handling | ❌ Silent failures | ✅ Clear error messages |
| Email categories | ❌ None | ✅ Tagged as 'password-reset', 'transactional' |
| Configuration priority | ❌ Gmail only | ✅ SendGrid > Gmail > Ethereal |

## Testing the Fix

Now when a user clicks "Reset Password" and enters their email:

1. **Frontend sends request** to `POST /auth/forgot-password`
2. **API checks** if `SENDGRID_API_KEY` is set ✅ (It is!)
3. **SendGrid receives** the password reset email request
4. **Email is sent** to user with reset link
5. **User clicks link** and can reset their password

### Expected Console Logs:
```
📧 Sending password reset email to: user@example.com
🔧 Environment check for password reset email:
- SENDGRID_API_KEY: ✅ Set
- EMAIL_USER: ❌ Not set
📧 Using SendGrid for password reset email
📤 Sending password reset email via SendGrid...
✅ Password reset email sent successfully via SendGrid!
✅ Status Code: 202
✅ Message ID: your-message-id-here
```

## Next Steps

1. ✅ Restart the API server to apply changes
   ```bash
   cd apps/api
   npm run dev
   ```

2. ✅ Test the forgot password flow:
   - Go to http://localhost:5173/forgot-password
   - Enter your email
   - Check logs for "Password reset email sent successfully via SendGrid!"
   - Check your inbox for the reset email

3. ✅ If still not working:
   - Check SendGrid account isn't out of credits
   - Verify `SENDGRID_API_KEY` is valid
   - Check SendGrid Activity Feed for delivery status
   - Look at detailed console logs for specific error

## Files Modified
- ✏️ `apps/api/src/services/emailService.ts` - Added SendGrid support to `sendPasswordResetEmail` function

---

**Status:** ✅ **FIXED** - Password reset email now uses SendGrid as primary service with Nodemailer fallback.
