# Fix Netlify Environment Variables

## Problem
Supabase uploads are failing with "Failed to fetch" because the Netlify-deployed admin panel doesn't have the Supabase environment variables set.

The `.env.production` file we created is only used for **local builds** - Netlify doesn't read it automatically.

## Solution: Set Environment Variables in Netlify Dashboard

### Step 1: Go to Netlify Dashboard
1. Visit https://app.netlify.com
2. Select your **admin site** (admin-discoverg.netlify.app)
3. Go to **Site Settings** (gear icon)
4. Click **Environment variables** (or **Build & Deploy** → **Environment**)

### Step 2: Add Supabase Variables
Create these environment variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://izrwpdbmgphfnizhbgoc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cndwZGJtZ3BoZm5pemhiZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTU1NjUsImV4cCI6MjA3NzEzMTU2NX0.EtMOp4XtG8_GNT2KX6tiYRvOH1FeHh1hnbJFuejHG7Q` |
| `VITE_API_URL` | `https://discovergroup.onrender.com` |
| `VITE_ADMIN_API_URL` | `https://discovergroup.onrender.com` |

### Step 3: Save and Redeploy
1. Click **Save** after adding all variables
2. Go to **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**
4. Wait for deployment to complete (2-3 minutes)

### Step 4: Test
Go to https://admin-discoverg.netlify.app/tours/create and try uploading an image.

---

## Why This Is Needed

### Local Development (Works)
```bash
npm run dev:admin
# Uses .env (local file)
```

### Netlify Production (Needs Environment Variables)
```
Netlify doesn't see .env files
Must use Dashboard environment variables
```

---

## Reference: What Each Variable Does

| Variable | Purpose | Used By |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | TourForm.tsx, CountryManagement.tsx |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key for uploads | Supabase client initialization |
| `VITE_API_URL` | Backend API URL | apiClient functions (tours, countries, etc.) |
| `VITE_ADMIN_API_URL` | Same as above | apiClient (admin-specific override) |

---

## Verify Variables Are Set
1. Open browser DevTools (F12)
2. Go to **Console**
3. You should see:
   ```
   supabaseUrl: https://izrwpdbmgphfnizhbgoc.supabase.co
   supabaseAnonKey: eyJhbGc...
   [CountryManagement] supabaseUrl: https://izrwpdbmgphfnizhbgoc.supabase.co
   [CountryManagement] supabaseAnonKey: eyJhbGc...
   ```

If these show `undefined`, the environment variables are not set in Netlify.

---

## Quick Checklist
- [ ] Logged into Netlify dashboard
- [ ] Found admin site (admin-discoverg.netlify.app)
- [ ] Added 4 environment variables
- [ ] Clicked Save
- [ ] Triggered a new deploy
- [ ] Waited for deploy to complete
- [ ] Tested image upload on /tours/create
