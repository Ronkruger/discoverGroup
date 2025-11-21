# Security Issues - Client Environment Variables

## ⚠️ CRITICAL: Sensitive Keys Exposed in Client

The following environment variables are currently exposed in the client-side code and should be moved to the backend API:

### SendGrid API Credentials
```
VITE_SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXX [REDACTED - Real key exposed in client]
VITE_SENDGRID_TEMPLATE_ID=d-0130313057b9456997d09e2e0d48b4da
VITE_SENDGRID_FROM_EMAIL=romanolantano.discovergrp@gmail.com
VITE_SENDGRID_FROM_NAME=Discover Group Bookings
```

**Risk**: Anyone can use your SendGrid API key to send emails, potentially exhausting your quota or sending spam.

**Solution**: Move email sending to backend API endpoint (e.g., `/api/send-email`)

### EmailJS Credentials (Alternative)
```
VITE_EMAILJS_SERVICE_ID=service_uac8ja9
VITE_EMAILJS_TEMPLATE_ID=template_zyols7w
VITE_EMAILJS_PUBLIC_KEY=HDcNoEEoPzbJe9Yd-
VITE_EMAILJS_PRIVATE_KEY=XXXXXXXXXXXXXXXX [REDACTED - Real key exposed in client]
```

**Risk**: Exposed private keys can be used to send emails on your behalf.

**Solution**: Use only public key on client, handle private operations on backend.

## Recommended Actions

1. **Immediate**: Rotate all exposed API keys
2. **Create backend endpoints**:
   - `POST /api/emails/booking-confirmation`
   - `POST /api/emails/contact-form`
   - `POST /api/emails/verification`
3. **Update client code**: Replace direct SendGrid/EmailJS calls with backend API calls
4. **Environment variables**: Keep only public keys in client env (VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY)

## Safe Environment Variables (OK to keep in client)

```
VITE_API_BASE_URL=https://discovergroup.onrender.com
VITE_ADMIN_URL=https://admin--discovergrp.netlify.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (test mode public key)
VITE_SUPABASE_URL=https://awcwijvsncfmdvmobiey.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1... (public anon key with RLS)
```

These are public/publishable keys designed to be exposed.
