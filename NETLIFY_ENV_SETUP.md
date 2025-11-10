# Netlify Environment Variables Setup

## 🚨 Issue
The Supabase credentials are missing from Netlify's environment variables, causing the error:
```
❌ Supabase credentials missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

## ✅ Solution: Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard

1. Visit https://app.netlify.com
2. Select your site: **`discovergrp`** (client site)
3. Go to **Site settings** → **Environment variables**

### Step 2: Add These Variables

Click **"Add a variable"** and add each of these:

#### Required Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://izrwpdbmgphfnizhbgoc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cndwZGJtZ3BoZm5pemhiZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTU1NjUsImV4cCI6MjA3NzEzMTU2NX0.EtMOp4XtG8_GNT2KX6tiYRvOH1FeHh1hnbJFuejHG7Q` |

#### Existing Variables (Verify These Exist):

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://discovergroup.onrender.com` |
| `VITE_ADMIN_URL` | `https://admin--discovergrp.netlify.app` |
| `VITE_SENDGRID_API_KEY` | `SG.xxxxxxxxxxxxxxxxxxxxx` (your SendGrid API key) |
| `VITE_SENDGRID_TEMPLATE_ID` | `d-0130313057b9456997d09e2e0d48b4da` |
| `VITE_SENDGRID_FROM_EMAIL` | `romanolantano.discovergrp@gmail.com` |
| `VITE_SENDGRID_FROM_NAME` | `Discover Group Bookings` |

### Step 3: Deploy Changes

After adding the variables:

#### Option A: Manual Deploy
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

#### Option B: Automatic Deploy
- Just wait for the next git push
- Netlify will auto-deploy with new env vars

### Step 4: Verify

After deployment completes:
1. Visit https://discovergrp.netlify.app
2. Open browser console (F12)
3. Check for errors
4. Map markers should now load without CSP errors
5. No more "Supabase credentials missing" error

## 🔍 Quick Check

You can verify the variables are set by:
1. Netlify Dashboard → Your Site → Site settings → Environment variables
2. Look for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Should show as "Set" (values are hidden for security)

## ⚠️ Important Notes

### Security
- The `VITE_SUPABASE_ANON_KEY` is safe to expose in client-side code
- It's protected by Row Level Security (RLS) policies in Supabase
- Never expose service role keys in client-side code

### Scope
- Set these for **"All deploys"** (not just production or branch-specific)
- This ensures they work in all environments

### For Admin Panel
If you're also setting up the admin panel (`admin--discovergrp`), repeat the same process:
1. Go to the admin site in Netlify
2. Add the same Supabase environment variables
3. Redeploy

## 🎯 What This Fixes

After adding these variables and redeploying:

✅ Map markers will load from Supabase  
✅ No more CSP violations  
✅ No more "credentials missing" errors  
✅ Supabase storage images will display  
✅ Admin panel can manage map markers  

## 📋 All Environment Variables (Complete List)

For reference, here's the complete list of environment variables that should be in Netlify:

```bash
# API Configuration
VITE_API_BASE_URL=https://discovergroup.onrender.com
VITE_ADMIN_URL=https://admin--discovergrp.netlify.app

# SendGrid Email (Use your actual SendGrid API key from .env file)
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
VITE_SENDGRID_TEMPLATE_ID=d-0130313057b9456997d09e2e0d48b4da
VITE_SENDGRID_FROM_EMAIL=romanolantano.discovergrp@gmail.com
VITE_SENDGRID_FROM_NAME=Discover Group Bookings

# Supabase (ADD THESE!)
VITE_SUPABASE_URL=https://izrwpdbmgphfnizhbgoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cndwZGJtZ3BoZm5pemhiZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTU1NjUsImV4cCI6MjA3NzEzMTU2NX0.EtMOp4XtG8_GNT2KX6tiYRvOH1FeHh1hnbJFuejHG7Q
```

> **Note:** Replace `SG.xxxxxxxxxxxxxxxxxxxxx` with your actual SendGrid API key from your local `.env` file.

## 🐛 Troubleshooting

### Still Getting Errors After Adding Variables?

1. **Clear build cache:**
   - Netlify Dashboard → Deploys
   - Click "Options" → "Clear cache and deploy site"

2. **Verify variables are set:**
   - Site settings → Environment variables
   - Both Supabase variables should show as "Set"

3. **Check build logs:**
   - Deploys → Click on latest deploy
   - Look for "Building with environment variables" section
   - Should list VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

4. **Hard refresh browser:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Or Cmd+Shift+R (Mac)
   - This clears cached JavaScript

### Environment Variables Not Taking Effect?

- Make sure you clicked **"Save"** after adding each variable
- Trigger a new deploy after saving
- Environment variables only apply to new builds, not existing ones

## 📸 Visual Guide

### Adding a Variable:
1. Click **"Add a variable"**
2. Enter **Key**: `VITE_SUPABASE_URL`
3. Enter **Value**: `https://izrwpdbmgphfnizhbgoc.supabase.co`
4. Select **Scope**: All deploys
5. Click **"Create variable"**
6. Repeat for `VITE_SUPABASE_ANON_KEY`

---

**After completing these steps, trigger a redeploy and the Supabase errors will be gone!** 🚀
