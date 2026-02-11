# Render API Redeployment Guide

## Issue
The favorites API endpoint returns 404 because the Render deployment is using an outdated version of the API that doesn't include the favorites routes.

## Solution: Manual Redeploy on Render

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Log in to your account
3. Find your API service: `discovergroup` or similar

### Step 2: Trigger Manual Deploy
1. Click on your API service
2. Click the **"Manual Deploy"** button in the top right
3. Select **"Deploy latest commit"**
4. Wait for the deployment to complete (usually 2-5 minutes)

### Step 3: Verify Deployment
Once deployed, test the endpoints:

```bash
# Test favorites endpoint (should return 401 without auth, not 404)
curl https://discovergroup.onrender.com/api/favorites

# Expected: {"error":"No token provided"}
# NOT: Cannot GET /api/favorites (404)
```

## What's Being Deployed

The current API (`apps/api/src/index.ts`) includes these routes:
- ✅ `/api/tours` - Tour management
- ✅ `/api/bookings` - Booking management  
- ✅ `/api/admin` - Admin operations
- ✅ `/api/auth` - Authentication (login, register, verify)
- ✅ `/api/favorites` - **Favorites management (NEW)**
- ✅ `/api/paymongo` - PayMongo payment stubs

## Build Commands on Render

Make sure your Render service has these settings:

**Build Command:**
```bash
cd apps/api && npm install && npm run build
```

**Start Command:**
```bash
cd apps/api && npm start
```

## Environment Variables Required

Ensure these are set in Render:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `SENDGRID_API_KEY` - SendGrid API key (if using email)
- `VITE_SUPABASE_URL` - Supabase URL (for future use)
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `PORT` - Automatically set by Render

## Troubleshooting

### Still Getting 404 After Redeploy?

1. **Check Render Logs:**
   - Go to your service on Render
   - Click "Logs" tab
   - Look for "API server listening on port..." message
   - Verify favorites route is registered

2. **Check Build Output:**
   - Look for TypeScript compilation errors
   - Ensure `dist/index.js` was created

3. **Verify Route Registration:**
   - Check logs for: "✅ All routes registered"
   - Should see: `/api/favorites` listed

### Check API Health

```bash
# Test if API is running
curl https://discovergroup.onrender.com/

# Expected: Should return something, not timeout
```

## Alternative: Enable Auto-Deploy

To automatically deploy on every git push:

1. Go to your Render service
2. Settings → Build & Deploy
3. Enable **"Auto-Deploy"**
4. Set branch to `main`
5. Click "Save Changes"

Now every git push to main will automatically redeploy! 🚀

## After Successful Redeploy

Clear your browser cache and test:
1. Visit: https://discovergrp.netlify.app
2. Login with a user account
3. Try clicking the heart icon on a tour
4. Check browser console - should NOT see 404 errors for favorites

## Supabase Map Markers

The CSP fix has been pushed. After Netlify rebuilds:
- Map markers will load from Supabase
- No more CSP violation errors
- Make sure you've run the SQL setup in Supabase first!

---

**Note:** The CSP fix for Supabase is already pushed and Netlify will auto-deploy. You just need to manually redeploy the Render API service.
