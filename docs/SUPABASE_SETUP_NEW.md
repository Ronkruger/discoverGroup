# Supabase Setup Guide - New Account

## 🎯 Overview
This guide will help you set up your new Supabase project for the DiscoverGroup application.

## 📋 Prerequisites
- New Supabase account created
- Project is being provisioned (you're on the "Setting up project" screen)

## Step 1: Wait for Project Provisioning

Your Supabase project is currently being set up. This takes 2-5 minutes.

**Status**: "We are provisioning your database and API endpoints"

Wait for the dashboard to fully load before proceeding to the next steps.

## Step 2: Get Your API Keys

Once the project is ready:

1. **Navigate to Project Settings**
   - Click on the ⚙️ (Settings) icon in the left sidebar
   - Select **"API"**

2. **Copy Your API Keys**
   
   You'll see two keys:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

   Copy both of these - you'll need them in the next steps.

## Step 3: Update Local Environment Files

### Update `.env` file:

Open `c:\Users\romsl\Desktop\scratch\discoverGroup-clean\.env` and update:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `YOUR_PROJECT_REF` with your actual project reference
- `your_anon_key_here` with your actual anon key

### Update `env/netlify-client.env`:

Open `env/netlify-client.env` and update the same variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Create the Map Markers Table

### Option A: Using SQL Editor (Recommended)

1. **Go to SQL Editor**
   - Click on "SQL Editor" (📄 icon) in the left sidebar
   - Click "New query"

2. **Run the Setup Script**

   Copy and paste the entire contents of `supabase-map-markers-setup.sql`:

   ```sql
   -- Create map_markers table for storing map location markers
   -- Run this SQL in Supabase SQL Editor

   CREATE TABLE IF NOT EXISTS map_markers (
     id SERIAL PRIMARY KEY,
     city TEXT NOT NULL,
     country TEXT,
     top TEXT NOT NULL,
     left TEXT NOT NULL,
     description TEXT,
     tour_slug TEXT,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create updated_at trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER update_map_markers_updated_at
     BEFORE UPDATE ON map_markers
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();

   -- Insert initial marker data (from existing Home.tsx hardcoded values)
   INSERT INTO map_markers (city, country, top, left, is_active) VALUES
     ('Paris', 'France', '40%', '35%', true),
     ('Rome', 'Italy', '70%', '50%', true),
     ('Lucerne', 'Switzerland', '55%', '42%', true),
     ('Florence', 'Italy', '65%', '48%', true);

   -- Create index on is_active for faster queries
   CREATE INDEX IF NOT EXISTS idx_map_markers_active ON map_markers(is_active);

   -- Enable Row Level Security (RLS)
   ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow public read access to active markers
   CREATE POLICY "Public can view active markers" ON map_markers
     FOR SELECT
     USING (is_active = true);

   -- Create policy to allow authenticated users to manage markers (for admin panel)
   CREATE POLICY "Authenticated users can insert markers" ON map_markers
     FOR INSERT
     TO authenticated
     WITH CHECK (true);

   CREATE POLICY "Authenticated users can update markers" ON map_markers
     FOR UPDATE
     TO authenticated
     USING (true)
     WITH CHECK (true);

   CREATE POLICY "Authenticated users can delete markers" ON map_markers
     FOR DELETE
     TO authenticated
     USING (true);

   -- Grant permissions
   GRANT SELECT ON map_markers TO anon, authenticated;
   GRANT INSERT, UPDATE, DELETE ON map_markers TO authenticated;
   GRANT USAGE, SELECT ON SEQUENCE map_markers_id_seq TO authenticated;

   -- Verify the setup
   SELECT * FROM map_markers ORDER BY id;
   ```

3. **Click "Run"**

4. **Verify Success**
   - You should see 4 rows returned (Paris, Rome, Lucerne, Florence)
   - Check for any errors in the results panel

### Option B: Using Table Editor

If you prefer a visual approach:

1. Go to "Table Editor" in the left sidebar
2. Click "New table"
3. Manually create the table structure (not recommended - use SQL instead)

## Step 5: Set Up Storage (Optional - for tour images)

If you plan to store tour images in Supabase:

1. **Go to Storage**
   - Click "Storage" (🗄️ icon) in the left sidebar

2. **Create a Bucket**
   - Click "New bucket"
   - Name: `tour-images`
   - Public: ✅ (checked)
   - Click "Create bucket"

3. **Set Bucket Policies**
   - Click on the bucket
   - Go to "Policies" tab
   - Add policy for public read access

## Step 6: Update Netlify Environment Variables

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site: `discovergrp`

2. **Update Environment Variables**
   - Site settings → Environment variables
   - Find or add these variables:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | Your new project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your new anon key |

3. **Trigger Redeploy**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## Step 7: Update Admin Panel (if applicable)

If you're using the admin panel:

1. Go to Netlify
2. Select the admin site: `admin--discovergrp`
3. Update the same environment variables
4. Redeploy

## Step 8: Test the Setup

### Test Locally:

1. **Restart your dev server**
   ```bash
   npm run dev
   ```

2. **Check browser console**
   - Visit http://localhost:5173
   - Open DevTools (F12)
   - Look for any Supabase errors
   - Should see no "credentials missing" errors

3. **Test map markers**
   - Scroll to "Explore Europe at a Glance" section
   - Should see 4 blue dots on the map
   - Hover over them - should show city names

### Test in Production:

After Netlify redeploys:

1. Visit https://discovergrp.netlify.app
2. Check browser console
3. Verify map markers load
4. No CSP violations

## Step 9: Admin Panel - Test CRUD Operations

1. **Login to Admin Panel**
   - Visit https://admin--discovergrp.netlify.app
   - Login with admin credentials

2. **Navigate to Map Markers**
   - Click "Map Markers" in the sidebar

3. **Test Operations**
   - ✅ View existing markers
   - ✅ Add a new marker
   - ✅ Edit an existing marker
   - ✅ Toggle active/inactive
   - ✅ Delete a marker

## 🔧 Troubleshooting

### "Failed to fetch map markers"

**Check:**
1. ✅ Table `map_markers` exists in Supabase
2. ✅ RLS policies are set correctly
3. ✅ Environment variables are correct in Netlify
4. ✅ Netlify has been redeployed after env var changes

**Solution:**
```sql
-- Verify table exists
SELECT * FROM map_markers;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'map_markers';

-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'map_markers';
```

### "supabaseUrl is required"

**Problem:** Environment variables not loaded

**Solution:**
1. Check `.env` file has correct values
2. Restart dev server
3. Clear browser cache
4. For production: Redeploy on Netlify

### Admin Panel: "Failed to create marker"

**Problem:** RLS policies blocking authenticated users

**Solution:**
```sql
-- Grant permissions to authenticated users
GRANT INSERT, UPDATE, DELETE ON map_markers TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE map_markers_id_seq TO authenticated;
```

### CORS Errors

**Problem:** Supabase blocking requests from your domain

**Solution:**
1. Go to Supabase Dashboard
2. Settings → API
3. Add your domain to CORS allowed origins:
   - `https://discovergrp.netlify.app`
   - `https://admin--discovergrp.netlify.app`

## 📊 Verify Database

Run this query in SQL Editor to check everything:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'map_markers';

-- Check data
SELECT * FROM map_markers ORDER BY id;

-- Check RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'map_markers';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'map_markers';
```

Expected results:
- 10 columns in map_markers table
- 4 initial markers (Paris, Rome, Lucerne, Florence)
- 4 RLS policies (1 SELECT, 1 INSERT, 1 UPDATE, 1 DELETE)
- 2 indexes (primary key + is_active index)

## 🎯 Success Checklist

- [ ] Supabase project created and provisioned
- [ ] API keys copied
- [ ] Local `.env` updated
- [ ] `env/netlify-client.env` updated
- [ ] `map_markers` table created with SQL script
- [ ] 4 initial markers inserted
- [ ] RLS policies configured
- [ ] Netlify environment variables updated
- [ ] Netlify redeployed
- [ ] Tested locally - no errors
- [ ] Tested in production - map markers visible
- [ ] Admin panel can manage markers

## 📝 Quick Reference

### Your New Credentials

```bash
# Save these somewhere safe!
Project Name: DiscoverGroup's Project
Project URL: https://awcwijysncfmdvmobiejy.supabase.co
Project Ref: awcwijysncfmdvmobiejy

# API Keys (get from Supabase Dashboard → Settings → API)
VITE_SUPABASE_URL=https://awcwijysncfmdvmobiejy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....(your key)
```

### Files to Update

1. `.env` (root)
2. `env/netlify-client.env`
3. Netlify client site env vars
4. Netlify admin site env vars (if applicable)

## 🚀 Next Steps After Setup

1. **Commit environment changes** (if needed)
   ```bash
   git add .env env/netlify-client.env
   git commit -m "Update Supabase credentials for new project"
   git push
   ```

2. **Test all features**
   - Map markers display
   - Admin CRUD operations
   - Image storage (if configured)

3. **Monitor usage**
   - Supabase Dashboard → Usage
   - Check API requests
   - Monitor storage usage

## 🔐 Security Notes

- ✅ `anon` key is safe to expose in client-side code
- ✅ RLS policies protect your data
- ❌ NEVER expose the `service_role` key
- ✅ Always use RLS policies for data access control

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: File an issue in your repo

**Last Updated:** November 10, 2025
