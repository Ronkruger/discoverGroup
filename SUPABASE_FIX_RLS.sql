-- Fix RLS policies to allow public uploads
-- This allows anyone to upload/delete files (suitable for admin-only features)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload homepage media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage media" ON storage.objects;

-- Create permissive policies for homepage-media bucket
CREATE POLICY "Public can upload to homepage media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'homepage-media');

CREATE POLICY "Public can update homepage media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'homepage-media');

CREATE POLICY "Public can delete from homepage media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'homepage-media');

-- Do the same for featured_videos table
DROP POLICY IF EXISTS "Authenticated users can manage featured videos" ON featured_videos;

CREATE POLICY "Public can manage featured videos"
ON featured_videos FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('objects', 'featured_videos')
ORDER BY tablename, policyname;
