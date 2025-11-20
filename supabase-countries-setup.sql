-- Create countries table for destination country management
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  hero_image_url TEXT,
  hero_query VARCHAR(200),
  best_time VARCHAR(200),
  currency VARCHAR(100),
  language VARCHAR(100),
  visa_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create attractions table for country attractions
CREATE TABLE IF NOT EXISTS country_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create country testimonials table
CREATE TABLE IF NOT EXISTS country_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  author VARCHAR(200),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_countries_slug ON countries(slug);
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_country_attractions_country_id ON country_attractions(country_id);
CREATE INDEX idx_country_testimonials_country_id ON country_testimonials(country_id);

-- Create storage bucket for country images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('country-images', 'country-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for country images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'country-images' );

CREATE POLICY "Authenticated users can upload country images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'country-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update country images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'country-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete country images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'country-images' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for countries"
ON countries FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read access for country attractions"
ON country_attractions FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read access for country testimonials"
ON country_testimonials FOR SELECT
TO public
USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Authenticated users can insert countries"
ON countries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update countries"
ON countries FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete countries"
ON countries FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert attractions"
ON country_attractions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update attractions"
ON country_attractions FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete attractions"
ON country_attractions FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
ON country_testimonials FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
ON country_testimonials FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete testimonials"
ON country_testimonials FOR DELETE
TO authenticated
USING (true);

-- Insert sample data for existing countries
INSERT INTO countries (name, slug, description, hero_query, best_time, currency, language, visa_info) VALUES
('France', 'france', 'From the boulevards of Paris to the lavender fields of Provence and the sun-kissed Riviera, France offers rich history, world-class cuisine, and unforgettable landscapes.', 'france,paris', 'Apr – Jun, Sep – Oct', 'EUR (€)', 'French', 'Schengen visa may be required depending on nationality'),
('Italy', 'italy', 'Italy blends ancient history, Renaissance art and beautiful coastal scenery — explore Rome, Florence and the gems of Tuscany and the Amalfi coast.', 'italy,rome', 'Apr – Jun, Sep – Oct', 'EUR (€)', 'Italian', 'Schengen visa may be required depending on nationality'),
('Switzerland', 'switzerland', 'Alpine scenery, lakes and scenic train rides — a paradise for nature lovers and photographers.', 'switzerland,lucerne', 'Jun – Sep', 'CHF (Swiss Franc)', 'German/French/Italian', 'Schengen'),
('Vatican City', 'vatican-city', 'A spiritual microstate at the heart of Rome — small but packed with history and art.', 'vatican,st-peters', 'Apr – Oct', 'EUR (€)', 'Italian', 'Schengen')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample attractions for France
INSERT INTO country_attractions (country_id, title, description, image_url, display_order)
SELECT 
  id,
  'Eiffel Tower',
  'Iconic Paris landmark with panoramic city views.',
  'https://source.unsplash.com/800x450/?eiffel-tower',
  1
FROM countries WHERE slug = 'france'
ON CONFLICT DO NOTHING;

INSERT INTO country_attractions (country_id, title, description, image_url, display_order)
SELECT 
  id,
  'Louvre Museum',
  'Home of the Mona Lisa and world-class collections.',
  'https://source.unsplash.com/800x450/?louvre',
  2
FROM countries WHERE slug = 'france'
ON CONFLICT DO NOTHING;

-- Insert sample testimonials for France
INSERT INTO country_testimonials (country_id, quote, author, display_order)
SELECT 
  id,
  'Fantastic itinerary — food, culture and guides were superb.',
  'A. Santos',
  1
FROM countries WHERE slug = 'france'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE countries IS 'Stores destination country information with images and details';
COMMENT ON TABLE country_attractions IS 'Stores tourist attractions for each country';
COMMENT ON TABLE country_testimonials IS 'Stores customer testimonials for each country';
