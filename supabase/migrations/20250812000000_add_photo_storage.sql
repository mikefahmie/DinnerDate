-- Database Migration: Add photo storage support
-- File: supabase/migrations/20250812000000_add_photo_storage.sql

BEGIN;

-- Add photo_storage_path column to restaurants table if it doesn't exist
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS photo_storage_path text;

-- Create index for photo_storage_path for efficient queries
CREATE INDEX IF NOT EXISTS idx_restaurants_photo_storage_path 
ON public.restaurants USING btree (photo_storage_path)
WHERE photo_storage_path IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.restaurants.photo_storage_path 
IS 'Path to photo stored in Supabase Storage bucket restaurant-photos. Format: {restaurant_id}.{ext}';

-- Update the existing index on primary_photo_url to be more specific
DROP INDEX IF EXISTS idx_restaurants_primary_photo_url;
CREATE INDEX IF NOT EXISTS idx_restaurants_primary_photo_url 
ON public.restaurants USING btree (primary_photo_url)
WHERE primary_photo_url IS NOT NULL;

-- Create composite index for migration queries
CREATE INDEX IF NOT EXISTS idx_restaurants_photo_migration 
ON public.restaurants USING btree (photo_storage_path, primary_photo_url, photos)
WHERE photos IS NOT NULL;

-- Create storage bucket for restaurant photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-photos', 
  'restaurant-photos', 
  true,
  5242880, -- 5MB limit per photo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Storage policies for restaurant photos bucket

-- Allow public read access (photos are public content)
DROP POLICY IF EXISTS "Restaurant photos are publicly accessible" ON storage.objects;
CREATE POLICY "Restaurant photos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'restaurant-photos');

-- Allow service role full access (for edge functions)
DROP POLICY IF EXISTS "Service role can manage restaurant photos" ON storage.objects;
CREATE POLICY "Service role can manage restaurant photos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'restaurant-photos');

-- Allow authenticated users to upload/update (for future admin features)
DROP POLICY IF EXISTS "Authenticated users can upload restaurant photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload restaurant photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-photos' AND
  -- Ensure filename matches restaurant ID pattern
  (storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$')
);

DROP POLICY IF EXISTS "Authenticated users can update restaurant photos" ON storage.objects;
CREATE POLICY "Authenticated users can update restaurant photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-photos' AND
  (storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$')
);

-- Create a function to get restaurant photo URL (for backward compatibility)
CREATE OR REPLACE FUNCTION get_restaurant_photo_url(
  restaurant_row restaurants
) RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Prefer storage path (new system)
  IF restaurant_row.photo_storage_path IS NOT NULL THEN
    RETURN (
      SELECT 
        CASE 
          WHEN bucket.public THEN
            format('%s/storage/v1/object/public/%s/%s',
              current_setting('app.supabase_url', true),
              bucket.id,
              restaurant_row.photo_storage_path
            )
          ELSE NULL
        END
      FROM storage.buckets bucket
      WHERE bucket.id = 'restaurant-photos'
    );
  END IF;
  
  -- Fallback to legacy URL
  RETURN restaurant_row.primary_photo_url;
END;
$$;

-- Create helper function to check if restaurant needs photo migration
CREATE OR REPLACE FUNCTION needs_photo_migration(
  restaurant_row restaurants
) RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    restaurant_row.photos IS NOT NULL AND
    array_length(restaurant_row.photos, 1) > 0 AND
    restaurant_row.photo_storage_path IS NULL
  );
END;
$$;

-- Create helper function to check if photo URL is likely broken
CREATE OR REPLACE FUNCTION has_broken_photo_url(
  restaurant_row restaurants
) RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    restaurant_row.primary_photo_url IS NOT NULL AND
    restaurant_row.photo_storage_path IS NULL AND
    (
      restaurant_row.primary_photo_url LIKE '%googleapis.com%' OR
      restaurant_row.primary_photo_url LIKE '%googleusercontent.com%' OR
      restaurant_row.primary_photo_url LIKE '%ggpht.com%'
    )
  );
END;
$$;

-- Create view for migration status monitoring
CREATE OR REPLACE VIEW migration_status AS
SELECT 
  'Photo Migration Status' as category,
  COUNT(*) FILTER (WHERE photos IS NOT NULL AND array_length(photos, 1) > 0) as total_with_photos,
  COUNT(*) FILTER (WHERE photo_storage_path IS NOT NULL) as migrated_to_storage,
  COUNT(*) FILTER (WHERE needs_photo_migration(restaurants.*)) as needs_migration,
  COUNT(*) FILTER (WHERE has_broken_photo_url(restaurants.*)) as has_broken_urls,
  ROUND(
    (COUNT(*) FILTER (WHERE photo_storage_path IS NOT NULL) * 100.0) / 
    NULLIF(COUNT(*) FILTER (WHERE photos IS NOT NULL AND array_length(photos, 1) > 0), 0),
    1
  ) as migration_progress_percent
FROM restaurants;

-- Grant access to the view
GRANT SELECT ON migration_status TO authenticated, anon;

-- Add helpful comments
COMMENT ON FUNCTION get_restaurant_photo_url(restaurants) 
IS 'Returns the appropriate photo URL for a restaurant, preferring storage over legacy URLs';

COMMENT ON FUNCTION needs_photo_migration(restaurants) 
IS 'Checks if a restaurant has photo references but no storage path (needs migration)';

COMMENT ON FUNCTION has_broken_photo_url(restaurants) 
IS 'Checks if a restaurant has a legacy Google photo URL that may be broken';

COMMENT ON VIEW migration_status 
IS 'Real-time view of photo migration progress and statistics';

COMMIT;