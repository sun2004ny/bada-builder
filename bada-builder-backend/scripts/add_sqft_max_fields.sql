-- Migration: Add max price per sqft fields to live_group_projects
ALTER TABLE live_group_projects 
ADD COLUMN IF NOT EXISTS regular_price_per_sqft_max NUMERIC,
ADD COLUMN IF NOT EXISTS group_price_per_sqft_max NUMERIC;
