# Country Images Storage Setup Guide

## Issue
Getting error: **"Bucket not found"** when trying to upload country hero images in the admin panel.

## Root Cause
The `country-images` storage bucket doesn't exist in Supabase yet.

## Solution

### Step 1: Run the SQL Script in Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `discoverGroup` (or your project name)
3. **Navigate to**: SQL Editor (left sidebar)
4. **Create a new query**
5. **Copy and paste** the contents of `supabase-country-images-storage-setup.sql`
6. **Click "Run"** to execute the script

### Step 2: Verify the Bucket Was Created

Run this verification query in the SQL Editor:

```sql
SELECT * FROM storage.buckets WHERE id = 'country-images';
```

You should see one row with:
- `id`: `country-images`
- `name`: `country-images`
- `public`: `true`
- `file_size_limit`: `10485760` (10MB)

### Step 3: Verify Storage Policies

Run this query to check the policies:

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%country images%';
```

You should see 4 policies:
1. Public read access
2. Authenticated users can upload
3. Authenticated users can update
4. Authenticated users can delete

### Step 4: Test Upload in Admin Panel

1. Go to your admin panel: https://admindiscovergrp.netlify.app/countries
2. Create or edit a country
3. Click "Add Hero Image"
4. Select an image file
5. Upload should now succeed!

## Bucket Structure

After setup, images will be organized as:

```
country-images/
├── hero-images/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.jpg
│   └── ...
└── attraction-images/
    ├── 1234567892-ghi789.jpg
    ├── 1234567893-jkl012.jpg
    └── ...
```

## Security Settings

- **Public Read**: ✅ Anyone can view images (required for website display)
- **Upload**: 🔒 Only authenticated users
- **Update**: 🔒 Only authenticated users
- **Delete**: 🔒 Only authenticated users

## File Restrictions

- **Max Size**: 10MB per image
- **Allowed Types**: 
  - image/jpeg
  - image/jpg
  - image/png
  - image/webp
  - image/gif

## Troubleshooting

### Still Getting "Bucket not found"?

1. **Check Supabase URL/Keys**: Verify your admin `.env` file has correct:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

3. **Check Bucket Exists**:
   ```sql
   SELECT * FROM storage.buckets;
   ```
   Should include `country-images` in the list

4. **Re-run the SQL script**: Delete and recreate:
   ```sql
   DELETE FROM storage.buckets WHERE id = 'country-images';
   -- Then re-run the setup script
   ```

### Upload Fails with "Unauthorized"?

1. **Check you're logged in**: Admin panel should show your email
2. **Verify RLS Policies**: Make sure the 4 policies exist (see Step 3 above)
3. **Check Auth Token**: Log out and log back in to refresh

### Image Doesn't Display After Upload?

1. **Check bucket is public**: 
   ```sql
   SELECT public FROM storage.buckets WHERE id = 'country-images';
   ```
   Should return `true`

2. **Test direct URL**: Copy the image URL and paste in browser
3. **Check CORS**: Bucket should allow requests from your admin domain

## Related Files

- `supabase-country-images-storage-setup.sql` - SQL script to create bucket
- `apps/admin/src/lib/supabase.ts` - Upload utility functions
- `apps/admin/src/pages/CountryManagement.tsx` - Admin upload UI
- `MULTIPLE_HERO_IMAGES_FEATURE.md` - Feature documentation

## Next Steps After Setup

Once the bucket is created and verified:
1. ✅ Upload hero images will work
2. ✅ Multiple images per country supported
3. ✅ Carousel will display on destination pages
4. ✅ Primary image selection will work
5. ✅ Image deletion will work

## Manual Bucket Creation (Alternative)

If you prefer to use the Supabase Dashboard UI instead of SQL:

1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Enter:
   - Name: `country-images`
   - Public: ✅ (checked)
   - File size limit: `10485760`
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp,image/gif`
4. Click **Create bucket**
5. Click on `country-images` bucket
6. Go to **Policies** tab
7. Add the 4 policies from the SQL script (using the "New policy" wizard)

The SQL method is faster and ensures consistent setup.
