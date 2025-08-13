-- Supabase Storage Bucket Setup
-- File: supabase/migrations/add_restaurant_photos_storage.sql

-- Create the restaurant-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-photos', 'restaurant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the restaurant-photos bucket
-- Allow public read access (since photos are public content)
CREATE POLICY "Restaurant photos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'restaurant-photos');

-- Allow authenticated users to upload (for edge functions)
CREATE POLICY "Allow authenticated uploads to restaurant photos"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'restaurant-photos');

-- Allow authenticated users to update/replace photos
CREATE POLICY "Allow authenticated updates to restaurant photos"
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'restaurant-photos');

-- Allow service role to manage all restaurant photos (for edge functions)
CREATE POLICY "Service role can manage restaurant photos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'restaurant-photos');

-- Add photo_storage_path column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS photo_storage_path text;

-- Create index for photo_storage_path for efficient queries
CREATE INDEX IF NOT EXISTS idx_restaurants_photo_storage_path 
ON public.restaurants USING btree (photo_storage_path)
WHERE photo_storage_path IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.restaurants.photo_storage_path IS 'Path to photo stored in Supabase Storage bucket restaurant-photos';