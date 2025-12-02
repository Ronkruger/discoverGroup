-- =====================================================
-- Supabase Storage Setup for Tour Images
-- =====================================================
-- This script creates the storage bucket for tour images and videos
-- Run this in your Supabase SQL Editor

-- 1. Create the tour-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tour-images',
  'tour-images',
  true,  -- Make bucket public so images are accessible
  10485760,  -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for tour-images bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for tour images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload tour images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update tour images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update tour images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete tour images" ON storage.objects;

-- Policy: Allow public read access (anyone can view images)
CREATE POLICY "Public read access for tour images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tour-images');

-- Policy: Allow public uploads (suitable for admin-only features)
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

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the bucket was created successfully:
-- SELECT * FROM storage.buckets WHERE id = 'tour-images';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. After running this script, the bucket will be PUBLIC
--    All images will be accessible via direct URL
-- 
-- 2. Storage policies allow public upload/update/delete
--    This is suitable for admin-only features
--    Make sure your admin panel has proper authentication
--
-- 3. File structure in bucket:
--    - [tourId]/main-*.jpg     (main tour images)
--    - [tourId]/gallery-*.jpg  (gallery images)
--    - [tourId]/related-*.jpg  (related images)
--
-- 4. Supported formats: JPEG, JPG, PNG, WebP, GIF
-- 5. Max file size: 10MB per image
--
-- NOTE: These permissive policies match the existing country-images bucket setup.
-- The admin panel should handle access control at the application level.
