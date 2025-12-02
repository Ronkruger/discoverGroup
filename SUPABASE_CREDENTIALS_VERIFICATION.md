# Supabase Credentials Verification & Configuration

## Current Status
You have TWO Supabase projects configured:

### Local Development Project
- **URL**: `https://awcwijvsncfmdvmobiey.supabase.co`
- **Location**: `.env` file in `apps/admin`
- **Usage**: Local development only

### Production Project  
- **URL**: `https://izrwpdbmgphfnizhbgoc.supabase.co`
- **Location**: `.env.production` in `apps/admin` and Netlify environment variables
- **Usage**: Netlify deployment (admin panel and Render API)
- **Status**: ❌ Browser cannot resolve this domain (DNS error)

---

## Problem: DNS Resolution Failure

The error `net::ERR_NAME_NOT_RESOLVED` for `izrwpdbmgphfnizhbgoc.supabase.co` means:
1. The URL is not a valid/resolvable domain
2. OR there's a network policy blocking Supabase access
3. OR the domain is deprecated/deleted

---

## Solution: Verify & Reconfigure

### Step 1: Check Supabase Dashboard
1. Go to **https://supabase.com/dashboard**
2. Select **DiscoverGroup's Org**
3. Look at the projects list
4. **Note the actual project URL** for the company account

### Step 2: Get Correct Credentials
From Supabase Dashboard for the correct project:
1. Click on the project
2. Go to **Settings** > **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)
4. Make note of these exact values

### Step 3: Update Configuration

#### Option A: If using a different Supabase project
Update in `apps/admin/.env.production`:
```dotenv
VITE_SUPABASE_URL=https://[CORRECT_PROJECT_URL].supabase.co
VITE_SUPABASE_ANON_KEY=[CORRECT_ANON_KEY]
```

#### Option B: If using the same project, verify in Netlify
1. Go to **Netlify Dashboard** > Your admin site
2. Click **Site settings** > **Build & deploy** > **Environment**
3. Verify these variables are set:
   ```
   VITE_SUPABASE_URL=https://izrwpdbmgphfnizhbgoc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 4: Verify Supabase Storage Bucket
In Supabase Dashboard:
1. Go to **Storage**
2. Check these buckets exist and are PUBLIC:
   - `tour-images` ✓
   - `country-images` ✓
   - `homepage-media` ✓

### Step 5: Check Storage Policies
Each bucket needs these policies:
1. **Public read access** - Anyone can view
2. **Public upload** - Admin can upload (or authenticated users)

---

## Testing After Reconfiguration

### Local Development
```bash
npm run dev:admin
# Try uploading an image to a tour
# Check browser console for upload success
```

### Production
1. Rebuild and redeploy admin to Netlify
2. Go to `https://admin-discoverg.netlify.app/tours/create`
3. Try uploading an image
4. Check browser console for success message

---

## Common Issues & Fixes

### Issue: Still getting DNS error
**Possible causes**:
- Wrong Supabase URL (typo)
- Project was deleted
- Network firewall blocking Supabase

**Fix**:
- Verify the exact URL from Supabase Dashboard
- Check if project still exists
- Try from a different network (mobile hotspot)

### Issue: Upload succeeds but image doesn't show
**Cause**: Storage policies not configured correctly

**Fix**:
- Go to Supabase > Storage > Select bucket
- Edit policies to allow public read access

### Issue: Multiple GoTrueClient warnings
**Cause**: Creating multiple Supabase clients at module load time

**Fix** (if needed):
- Create Supabase client once and reuse it
- Or wrap in a React context

---

## Commands to Run After Changes

```bash
# Update .env.production
cd apps/admin
# Edit .env.production with correct credentials

# Rebuild
cd ../..
npm run build:admin

# Commit and push
git add apps/admin/.env.production
git commit -m "chore: Update Supabase credentials for production"
git push origin main
git push company main

# Netlify will automatically redeploy
```

---

## Next Steps

1. **Verify** the correct Supabase project URL in your Supabase dashboard
2. **Compare** it with what's currently in `.env.production`
3. **If different**, update and redeploy
4. **If same**, then the issue is a network/firewall problem

Let me know what URL you find in your Supabase dashboard and we can proceed!
