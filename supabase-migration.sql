-- Tastly Database Migration
-- Run this in Supabase SQL Editor before using the new features

-- 1. Add images and tags columns to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Add preferences column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
    "cuisineTypes": [],
    "priceRange": [1, 4],
    "maxDistance": 5,
    "onboardingCompleted": false
  }'::jsonb;

-- 3. Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_restaurants_tags ON restaurants USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants USING GIN (cuisine_type);

-- 4. Backfill images from existing image_url
UPDATE restaurants
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (images IS NULL OR images = '{}');

-- 5. Backfill tags from existing data (optional, customize as needed)
-- Example: Add 'terrasse' tag to some restaurants
-- UPDATE restaurants SET tags = ARRAY['terrasse'] WHERE id IN (...);
