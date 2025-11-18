-- =====================================================
-- Tour Videos Storage Setup for Supabase
-- =====================================================
-- This script adds video storage capability for tours
-- Videos are stored in the existing 'homepage-media' bucket
-- with appropriate RLS policies

-- =====================================================
-- 1. VERIFY STORAGE BUCKET EXISTS
-- =====================================================
-- The 'homepage-media' bucket should already exist from previous setup
-- If not, create it with these settings:
-- Bucket name: homepage-media
-- Public: Yes
-- File size limit: 104857600 (100MB)
-- Allowed MIME types: video/mp4, video/webm, video/quicktime, image/*

-- =====================================================
-- 2. ADD TOUR VIDEO METADATA (OPTIONAL)
-- =====================================================
-- This table is optional - only create if you want to track
-- video metadata separately from the tour document
CREATE TABLE IF NOT EXISTS tour_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_slug TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  video_type TEXT CHECK (video_type IN ('tour', 'intro', 'highlight', 'testimonial')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for tour lookup
CREATE INDEX IF NOT EXISTS idx_tour_videos_slug 
ON tour_videos(tour_slug, display_order);

-- Enable RLS
ALTER TABLE tour_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_videos
CREATE POLICY "Public read access for active tour videos"
ON tour_videos FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can manage tour videos"
ON tour_videos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. STORAGE POLICIES (if not already set)
-- =====================================================
-- Ensure the homepage-media bucket has proper policies
-- Note: Drop existing policies first, then recreate

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for homepage-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to homepage-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from homepage-media" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for homepage-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homepage-media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to homepage-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homepage-media');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update homepage-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'homepage-media');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete from homepage-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homepage-media');

-- =====================================================
-- 4. HELPER FUNCTION TO UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tour_videos
DROP TRIGGER IF EXISTS update_tour_videos_updated_at ON tour_videos;
CREATE TRIGGER update_tour_videos_updated_at
BEFORE UPDATE ON tour_videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. SAMPLE DATA (OPTIONAL - for testing)
-- =====================================================
-- Uncomment to insert sample tour video record
-- INSERT INTO tour_videos (tour_slug, video_url, video_type, is_active) 
-- VALUES 
--   ('route-a-preferred', 'https://your-supabase-url/storage/v1/object/public/homepage-media/tour-videos/sample.mp4', 'tour', true)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================
-- Run these to verify setup:

-- Check if table exists
-- SELECT * FROM tour_videos LIMIT 1;

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE name = 'homepage-media';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'tour_videos';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Verify the homepage-media bucket exists in Supabase Dashboard → Storage
-- 2. Update your .env files with Supabase credentials if not already done
-- 3. Upload a test video through the admin panel
-- 4. Verify video URL is saved in MongoDB tour document (video_url field)
-- 5. Check that video displays correctly on tour detail page
