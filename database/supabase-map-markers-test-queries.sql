-- Quick Test Queries for Map Markers
-- Use these in Supabase SQL Editor for testing

-- 1. View all markers
SELECT * FROM map_markers ORDER BY id;

-- 2. View only active markers (what client sees)
SELECT id, city, country, top, left, description, tour_slug 
FROM map_markers 
WHERE is_active = true 
ORDER BY id;

-- 3. Count total markers
SELECT 
  COUNT(*) as total_markers,
  COUNT(*) FILTER (WHERE is_active = true) as active_markers,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_markers
FROM map_markers;

-- 4. Add a test marker
INSERT INTO map_markers (city, country, top, left, description, is_active)
VALUES ('Barcelona', 'Spain', '60%', '30%', 'Beautiful coastal city', true)
RETURNING *;

-- 5. Update a marker position
UPDATE map_markers 
SET top = '45%', left = '40%', updated_at = NOW()
WHERE city = 'Paris'
RETURNING *;

-- 6. Toggle marker status
UPDATE map_markers 
SET is_active = NOT is_active, updated_at = NOW()
WHERE city = 'Rome'
RETURNING id, city, is_active;

-- 7. Add marker with tour link
INSERT INTO map_markers (city, country, top, left, description, tour_slug, is_active)
VALUES ('Prague', 'Czech Republic', '48%', '52%', 'Historic city center', 'prague-city-break', true)
RETURNING *;

-- 8. Delete a test marker
DELETE FROM map_markers 
WHERE city = 'Barcelona'
RETURNING *;

-- 9. View markers with timestamp info
SELECT id, city, country, is_active, 
       created_at::date as created_date,
       updated_at::date as updated_date
FROM map_markers 
ORDER BY updated_at DESC;

-- 10. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'map_markers';

-- 11. Reset to initial state (delete all and re-insert initial markers)
TRUNCATE map_markers RESTART IDENTITY;
INSERT INTO map_markers (city, country, top, left, is_active) VALUES
  ('Paris', 'France', '40%', '35%', true),
  ('Rome', 'Italy', '70%', '50%', true),
  ('Lucerne', 'Switzerland', '55%', '42%', true),
  ('Florence', 'Italy', '65%', '48%', true);
SELECT * FROM map_markers ORDER BY id;

-- 12. Find markers by country
SELECT * FROM map_markers WHERE country = 'Italy';

-- 13. Find markers without tour links
SELECT * FROM map_markers WHERE tour_slug IS NULL OR tour_slug = '';

-- 14. Update multiple markers at once
UPDATE map_markers 
SET is_active = true, updated_at = NOW()
WHERE country = 'Italy'
RETURNING id, city, is_active;

-- 15. Add marker with full details
INSERT INTO map_markers (city, country, top, left, description, tour_slug, is_active)
VALUES (
  'Amsterdam', 
  'Netherlands', 
  '35%', 
  '38%', 
  'Canals and culture',
  'amsterdam-highlights',
  true
)
RETURNING *;
