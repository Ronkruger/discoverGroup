-- =====================================================
-- Supabase Storage Setup for DiscoverGroup
-- =====================================================
-- This script creates storage buckets and policies for:
-- - Tour images, gallery images, PDFs
-- - Homepage videos, logos, hero images
-- - User profile images
-- =====================================================

-- Create storage buckets
-- Note: Run these in Supabase Dashboard > Storage
-- Or use Supabase API

-- 1. Tour Media Bucket (images, PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-media', 'tour-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Homepage Media Bucket (videos, images, logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage-media', 'homepage-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. User Profiles Bucket (profile images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-profiles', 'user-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies
-- =====================================================

-- TOUR MEDIA POLICIES
-- Allow public read access
CREATE POLICY "Public read access for tour media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tour-media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload tour media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update tour media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-media');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete tour media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tour-media');

-- HOMEPAGE MEDIA POLICIES
-- Allow public read access
CREATE POLICY "Public read access for homepage media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homepage-media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload homepage media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homepage-media');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update homepage media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'homepage-media');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete homepage media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homepage-media');

-- USER PROFILES POLICIES
-- Allow public read access
CREATE POLICY "Public read access for user profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-profiles');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-profiles');

-- Allow users to update their own profile images
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-profiles');

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-profiles');

-- =====================================================
-- Featured Videos Table
-- =====================================================
-- Store featured video metadata in database

CREATE TABLE IF NOT EXISTS featured_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for featured videos
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for featured videos"
ON featured_videos FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users to manage
CREATE POLICY "Authenticated users can manage featured videos"
ON featured_videos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_featured_videos_order 
ON featured_videos(display_order, created_at);

-- =====================================================
-- Helper Function: Update timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for featured_videos
DROP TRIGGER IF EXISTS update_featured_videos_updated_at ON featured_videos;
CREATE TRIGGER update_featured_videos_updated_at
    BEFORE UPDATE ON featured_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES FOR SUPABASE DASHBOARD SETUP
-- =====================================================
-- 
-- 1. Go to Supabase Dashboard > Storage
-- 2. The buckets should auto-create from the INSERT statements
-- 3. If not, manually create:
--    - tour-media (public)
--    - homepage-media (public)
--    - user-profiles (public)
--
-- 4. File size limits (configure in bucket settings):
--    - tour-media: 10MB for images, 50MB for PDFs
--    - homepage-media: 100MB for videos, 10MB for images
--    - user-profiles: 5MB for profile images
--
-- 5. Allowed MIME types:
--    - tour-media: image/*, application/pdf
--    - homepage-media: video/mp4, video/webm, image/*
--    - user-profiles: image/*
--
-- =====================================================
