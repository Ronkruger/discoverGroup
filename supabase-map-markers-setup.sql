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
-- Note: You may want to add more specific role-based policies
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

-- Optional: Grant permissions (adjust as needed for your Supabase setup)
GRANT SELECT ON map_markers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON map_markers TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE map_markers_id_seq TO authenticated;

-- Verify the setup
SELECT * FROM map_markers ORDER BY id;
