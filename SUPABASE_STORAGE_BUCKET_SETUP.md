## Supabase Storage Setup Required

You need to create the missing storage buckets in your Supabase project. Follow these steps:

### Step 1: Go to Supabase SQL Editor

1. Visit: https://supabase.com/dashboard/project/awcwijvsncfmdvmobiey/sql/new
2. You'll see a blank SQL editor

### Step 2: Run Tour Images Setup

Copy and paste this SQL, then click "Run":

```sql
-- Create the tour-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tour-images',
  'tour-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete tour images" ON storage.objects;

-- Policy: Allow public read access
CREATE POLICY "Public read access for tour images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tour-images');

-- Policy: Allow public uploads
CREATE POLICY "Public can upload tour images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'tour-images');

-- Policy: Allow public updates
CREATE POLICY "Public can update tour images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'tour-images');

-- Policy: Allow public deletes
CREATE POLICY "Public can delete tour images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'tour-images');
```

✅ You should see "Query executed successfully"

### Step 3: Run Country Images Setup

Copy and paste this SQL in a new query, then click "Run":

```sql
-- Create the country-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-images',
  'country-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for country images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload country images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update country images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete country images" ON storage.objects;

-- Policy: Allow public read access
CREATE POLICY "Public read access for country images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'country-images');

-- Policy: Allow public uploads
CREATE POLICY "Public can upload country images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'country-images');

-- Policy: Allow public updates
CREATE POLICY "Public can update country images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'country-images');

-- Policy: Allow public deletes
CREATE POLICY "Public can delete country images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'country-images');
```

✅ You should see "Query executed successfully"

### Step 4: Verify Buckets Were Created

Copy and paste this SQL in a new query:

```sql
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('tour-images', 'country-images')
ORDER BY id;
```

✅ You should see 2 rows returned:
- `country-images`
- `tour-images`

### Step 5: Update Netlify Environment Variables

1. Go to https://app.netlify.com
2. Select the **admin-discoverg** site
3. Go to: Site settings → Environment variables
4. Add or update these variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://awcwijvsncfmdvmobiey.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3dpanZzbmNmbWR2bW9iaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTI4NDQsImV4cCI6MjA3ODMyODg0NH0.3IMur0Fal2TaiMqx5gpDjBjsKTzKSMAvAqxuqCESgrs` |

5. Click "Deploy site" to redeploy with new environment variables

### Step 6: Test Image Upload

1. Go to https://admin-discoverg.netlify.app
2. Navigate to "Tours"
3. Create a new tour or edit an existing one
4. Try uploading an image for the main image
5. ✅ Image should upload successfully

---

## What Was Wrong

The Supabase project `awcwijvsncfmdvmobiey` didn't have the required storage buckets (`tour-images` and `country-images`). The error "Bucket not found" means those buckets didn't exist in the Supabase storage.

Now that we've:
1. ✅ Updated `.env.production` with correct Supabase URL
2. ✅ Committed and pushed the fix
3. 🔄 Need to create the storage buckets in Supabase (your action)
4. 🔄 Need to update Netlify env vars (your action)
5. 🔄 Need to redeploy admin site (your action)

Once you complete steps 1-5 above, all image uploads will work!
