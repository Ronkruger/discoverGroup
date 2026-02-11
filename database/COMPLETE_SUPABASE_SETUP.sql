-- =====================================================
-- COMPLETE SUPABASE SETUP FOR DISCOVERGROUP
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =====================================================

-- =====================================================
-- 1. STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets (public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tour-media', 'tour-media', true, 52428800, ARRAY['image/*', 'application/pdf']),  -- 50MB limit
  ('homepage-media', 'homepage-media', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/*']),  -- 100MB limit
  ('user-profiles', 'user-profiles', true, 5242880, ARRAY['image/*'])  -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- TOUR MEDIA BUCKET POLICIES
CREATE POLICY "Public read access for tour media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tour-media');

CREATE POLICY "Authenticated users can upload tour media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-media');

CREATE POLICY "Authenticated users can update tour media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-media');

CREATE POLICY "Authenticated users can delete tour media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tour-media');

-- HOMEPAGE MEDIA BUCKET POLICIES
CREATE POLICY "Public read access for homepage media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homepage-media');

CREATE POLICY "Authenticated users can upload homepage media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homepage-media');

CREATE POLICY "Authenticated users can update homepage media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'homepage-media');

CREATE POLICY "Authenticated users can delete homepage media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homepage-media');

-- USER PROFILES BUCKET POLICIES
CREATE POLICY "Public read access for user profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-profiles');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-profiles');

CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-profiles');

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-profiles');

-- =====================================================
-- 3. MAP MARKERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS map_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT,
  top TEXT NOT NULL,
  "left" TEXT NOT NULL,
  description TEXT,
  tour_slug TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active markers
CREATE INDEX IF NOT EXISTS idx_map_markers_active ON map_markers(is_active);

-- Enable RLS
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for map_markers
CREATE POLICY "Public can view active markers" ON map_markers
  FOR SELECT
  USING (is_active = true);

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

-- Insert initial markers
INSERT INTO map_markers (city, country, top, "left", is_active) VALUES
  ('Paris', 'France', '40%', '35%', true),
  ('Rome', 'Italy', '70%', '50%', true),
  ('Lucerne', 'Switzerland', '55%', '42%', true),
  ('Florence', 'Italy', '65%', '48%', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. FEATURED VIDEOS TABLE
-- =====================================================

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

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_featured_videos_order 
ON featured_videos(display_order, created_at);

-- Enable RLS
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for featured_videos
CREATE POLICY "Public read access for featured videos"
ON featured_videos FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can manage featured videos"
ON featured_videos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. TOUR IMAGES TABLE (NEW!)
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('cover', 'gallery', 'thumbnail')),
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  caption TEXT,
  is_active BOOLEAN DEFAULT true,
  storage_path TEXT,  -- Path in Supabase storage for easy deletion
  file_size INTEGER,  -- Size in bytes
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tour_images_slug ON tour_images(tour_slug);
CREATE INDEX IF NOT EXISTS idx_tour_images_type ON tour_images(tour_slug, image_type);
CREATE INDEX IF NOT EXISTS idx_tour_images_active ON tour_images(is_active);
CREATE INDEX IF NOT EXISTS idx_tour_images_order ON tour_images(tour_slug, display_order);

-- Enable RLS
ALTER TABLE tour_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_images
CREATE POLICY "Public can view active tour images"
ON tour_images FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can insert tour images"
ON tour_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tour images"
ON tour_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tour images"
ON tour_images FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 6. TOUR PDFs TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tour_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_slug TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_type TEXT NOT NULL CHECK (pdf_type IN ('booking', 'itinerary', 'terms', 'brochure')),
  title TEXT NOT NULL,
  description TEXT,
  file_size INTEGER,
  storage_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tour_pdfs_slug ON tour_pdfs(tour_slug);
CREATE INDEX IF NOT EXISTS idx_tour_pdfs_type ON tour_pdfs(tour_slug, pdf_type);
CREATE INDEX IF NOT EXISTS idx_tour_pdfs_active ON tour_pdfs(is_active);

-- Enable RLS
ALTER TABLE tour_pdfs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_pdfs
CREATE POLICY "Public can view active tour PDFs"
ON tour_pdfs FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can manage tour PDFs"
ON tour_pdfs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. HOMEPAGE SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on setting_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_homepage_settings_key ON homepage_settings(setting_key);

-- Enable RLS
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_settings
CREATE POLICY "Public can view homepage settings"
ON homepage_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage homepage settings"
ON homepage_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default homepage settings
INSERT INTO homepage_settings (setting_key, setting_value, description) VALUES
  ('hero_section', '{
    "title": "Experience the Magic of",
    "subtitle": "European Adventures",
    "description": "Join thousands of travelers exploring Europe''s most stunning destinations — expert guides, guaranteed departures, and memories that last a lifetime.",
    "backgroundImage": "/hero-bg.jpg",
    "ctaText": "Explore Tours",
    "ctaLink": "/tours"
  }'::jsonb, 'Hero section content and settings'),
  ('logo', '{
    "url": "/logo.png",
    "height": 64,
    "alt": "DiscoverGroup Logo"
  }'::jsonb, 'Site logo configuration'),
  ('stats', '{
    "yearsExperience": 25,
    "countriesVisited": 50,
    "tourPackages": 75,
    "customerRating": 4.9
  }'::jsonb, 'Homepage statistics'),
  ('features', '{
    "items": [
      {"icon": "shield", "title": "100% Secure", "description": "Guaranteed Departures"},
      {"icon": "award", "title": "Award Winning", "description": "Best Tour Operator 2024"},
      {"icon": "headphones", "title": "24/7 Support", "description": "Expert Travel Assistance"},
      {"icon": "star", "title": "4.9/5 Rating", "description": "From 2,500+ Reviews"}
    ]
  }'::jsonb, 'Trust signals and features')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 8. HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_map_markers_updated_at ON map_markers;
CREATE TRIGGER update_map_markers_updated_at
    BEFORE UPDATE ON map_markers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_featured_videos_updated_at ON featured_videos;
CREATE TRIGGER update_featured_videos_updated_at
    BEFORE UPDATE ON featured_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_images_updated_at ON tour_images;
CREATE TRIGGER update_tour_images_updated_at
    BEFORE UPDATE ON tour_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_pdfs_updated_at ON tour_pdfs;
CREATE TRIGGER update_tour_pdfs_updated_at
    BEFORE UPDATE ON tour_pdfs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_settings_updated_at ON homepage_settings;
CREATE TRIGGER update_homepage_settings_updated_at
    BEFORE UPDATE ON homepage_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for anon and authenticated users
GRANT SELECT ON map_markers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON map_markers TO authenticated;

GRANT SELECT ON featured_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON featured_videos TO authenticated;

GRANT SELECT ON tour_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON tour_images TO authenticated;

GRANT SELECT ON tour_pdfs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON tour_pdfs TO authenticated;

GRANT SELECT ON homepage_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON homepage_settings TO authenticated;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('map_markers', 'featured_videos', 'tour_images', 'tour_pdfs', 'homepage_settings')
ORDER BY tablename;

-- Check storage buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('tour-media', 'homepage-media', 'user-profiles');

-- Check initial data
SELECT 'Map Markers' as table_name, COUNT(*) as record_count FROM map_markers
UNION ALL
SELECT 'Featured Videos', COUNT(*) FROM featured_videos
UNION ALL
SELECT 'Tour Images', COUNT(*) FROM tour_images
UNION ALL
SELECT 'Tour PDFs', COUNT(*) FROM tour_pdfs
UNION ALL
SELECT 'Homepage Settings', COUNT(*) FROM homepage_settings;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
-- Next steps:
-- 1. Copy your Supabase URL and anon key
-- 2. Add to .env file:
--    VITE_SUPABASE_URL=your-url-here
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- 3. Test uploads in admin panel
-- 4. Verify images appear on frontend
-- =====================================================
