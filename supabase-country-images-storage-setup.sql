-- =====================================================
-- Supabase Storage Setup for Country Images
-- =====================================================
-- This script creates the storage bucket for country hero and attraction images
-- Run this in your Supabase SQL Editor

-- 1. Create the country-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'country-images',
  'country-images',
  true,  -- Make bucket public so images are accessible
  10485760,  -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for country-images bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for country images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload country images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update country images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete country images" ON storage.objects;

-- Policy: Allow public read access (anyone can view images)
CREATE POLICY "Public read access for country images"
ON storage.objects FOR SELECT
USING (bucket_id = 'country-images');

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload country images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'country-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update country images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'country-images' 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'country-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete country images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'country-images' 
  AND auth.uid() IS NOT NULL
);

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the bucket was created successfully:
-- SELECT * FROM storage.buckets WHERE id = 'country-images';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. After running this script, the bucket will be PUBLIC
--    All images will be accessible via direct URL
-- 
-- 2. Only authenticated users can upload/modify/delete
--    Make sure your admin users are authenticated
--
-- 3. File structure in bucket:
--    - hero-images/     (country hero images)
--    - attraction-images/  (attraction images)
--
-- 4. Supported formats: JPEG, JPG, PNG, WebP, GIF
-- 5. Max file size: 10MB per image
