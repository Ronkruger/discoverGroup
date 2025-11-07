# Netlify Environment Variables Update

## ⚠️ IMPORTANT: Update Netlify Dashboard Settings

The environment variables in your Netlify dashboard need to be updated to use the correct API URL. The code has been fixed, but Netlify needs manual configuration.

---

## 📋 Steps to Update

### 1. Client Site (discovergrp.netlify.app or main site)

1. Go to: https://app.netlify.com/sites/YOUR-CLIENT-SITE/settings/deploys#environment
2. Update or add these variables:

```bash
VITE_API_BASE_URL=https://discovergroup.onrender.com
VITE_ADMIN_URL=https://admin--discovergrp.netlify.app

# Keep existing Supabase variables (copy from env/netlify-client.env)
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Optional: SendGrid (if used in client) - copy from env/netlify-client.env
VITE_SENDGRID_API_KEY=<your-sendgrid-api-key>
VITE_SENDGRID_TEMPLATE_ID=<your-sendgrid-template-id>
VITE_SENDGRID_FROM_EMAIL=<your-from-email>
VITE_SENDGRID_FROM_NAME=Discover Group Bookings
```

### 2. Admin Site (admin--discovergrp.netlify.app)

1. Go to: https://app.netlify.com/sites/YOUR-ADMIN-SITE/settings/deploys#environment
2. Update or add these variables:

```bash
VITE_API_URL=https://discovergroup.onrender.com
VITE_ADMIN_API_URL=https://discovergroup.onrender.com

# Keep existing Supabase variables (copy from env/netlify-admin.env)
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 3. Trigger Rebuild

After updating the environment variables:

1. Click **"Trigger deploy"** → **"Clear cache and deploy site"** on both sites
2. Wait 2-5 minutes for builds to complete

---

## ✅ What Was Fixed in Code

### Changed Files:

1. **`src/api/tours.ts`**
   - ✅ Removed mock tours fallback
   - ✅ Now uses `VITE_API_BASE_URL` (consistent with env files)
   - ✅ Throws errors instead of silently falling back to mocks
   - ✅ Added console logs to debug API calls

2. **`src/api/bookings.ts`**
   - ✅ Updated to use `VITE_API_BASE_URL` 
   - ✅ Already configured to use backend (no mocks)

3. **`.env`** (local development)
   - ✅ Updated to point to Render API: `https://discovergroup.onrender.com`

4. **`.env.production`** (client production)
   - ✅ Updated API URL from wrong Netlify URL to correct Render URL

5. **`apps/admin/.env.production`** (admin production)
   - ✅ Updated API URL to `https://discovergroup.onrender.com`

6. **`env/netlify-client.env`** (reference file)
   - ✅ Updated for your reference

7. **`env/netlify-admin.env`** (reference file)
   - ✅ Updated for your reference

---

## 🔍 How to Verify It's Working

### Client Site:
1. Visit your client site (e.g., https://discovergrp.netlify.app)
2. Open browser DevTools (F12) → Console tab
3. Navigate to tours page
4. Look for console logs:
   - ✅ **"✅ Loaded tours from API: X"** (where X is the number of tours)
   - ❌ **"❌ Error fetching tours from API"** = API is unreachable or Netlify env vars not updated

### Admin Site:
1. Visit admin site (e.g., https://admin--discovergrp.netlify.app)
2. Log in with admin credentials
3. Go to Tours management page
4. Check console for:
   - ✅ **"[admin apiClient] fetchTours -> X tours"** = Working correctly
   - ❌ **"Failed to fetch tours: 500"** = API issue or env vars not set

### Bookings:
1. Create a test booking on client site
2. Check admin panel → Bookings
3. Verify the booking appears (coming from MongoDB Atlas)

---

## 🚫 Removed Mock Data

The following mock/stub components are **ONLY for PayMongo/Dragonpay payment mockups** (intentional):
- ✅ `src/components/PaymentMockup.tsx` - **Keep** (payment gateway mockups)
- ✅ `src/lib/paymongo-stub.ts` - **Keep** (payment stub)
- ✅ `src/api/paymongo-stub.ts` - **Keep** (payment stub)

The following **REAL DATA** is now loaded from MongoDB Atlas:
- ✅ **Tours** - via `/public/tours` API endpoint
- ✅ **Bookings** - via `/api/bookings` API endpoint  
- ✅ **Admin Panel** - all data via `/admin/*` API endpoints

---

## 🗄️ Database Verification

Your MongoDB Atlas database is at:
```
mongodb+srv://discovergroup_user:***@discovergroup.s2s329l.mongodb.net/discovergroup
```

Collections:
- `tours` - Tour packages
- `bookings` - Customer bookings
- `users` - Admin users

---

## 🔧 Troubleshooting

### Issue: "Failed to load tours"
**Solution:** 
1. Check Render API is running: https://discovergroup.onrender.com/health
2. Update Netlify environment variables (see steps above)
3. Clear cache and redeploy Netlify sites

### Issue: "CORS Error"
**Solution:**
- Check `apps/api/src/index.ts` allowedOrigins array includes your Netlify URLs
- Render API already has CORS configured for your domains

### Issue: Tours/bookings not appearing
**Solution:**
1. Check MongoDB Atlas connection string in Render env vars
2. Verify collections have data: https://cloud.mongodb.com
3. Check Render API logs for database connection errors

---

## 📝 Summary

**Before:** 
- Tours API fell back to mock data when API failed
- Environment variables were inconsistent
- Admin pointed to wrong API URL

**After:**
- Tours loaded directly from MongoDB Atlas (no mocks)
- All environment variables point to: `https://discovergroup.onrender.com`
- Error messages show clearly when API is unreachable
- Console logs help debug connection issues

**Action Required:**
1. Update Netlify dashboard environment variables (both client and admin)
2. Trigger cache-clear rebuilds on both sites
3. Verify tours and bookings load from real database
