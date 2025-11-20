-- Migration: Add hero_images array column to countries table
-- Date: 2025
-- Description: Adds support for multiple hero images per country

-- Add hero_images column as array of text (URLs)
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS hero_images TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN countries.hero_images IS 'Array of hero image URLs for the country';

-- Optional: Migrate existing hero_image_url to hero_images array
-- Uncomment if you want to migrate existing single hero images to the array
-- UPDATE countries 
-- SET hero_images = ARRAY[hero_image_url] 
-- WHERE hero_image_url IS NOT NULL AND hero_image_url != '';

-- Note: The hero_image_url column is kept for backward compatibility
-- It will serve as the "primary" hero image reference
