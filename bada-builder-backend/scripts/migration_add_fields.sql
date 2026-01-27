-- Migration: Add new optional fields to live_group_projects
-- All fields are NULLABLE to ensure backward compatibility

ALTER TABLE live_group_projects 
ADD COLUMN IF NOT EXISTS project_name TEXT,
ADD COLUMN IF NOT EXISTS builder_name TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS unit_configuration TEXT,
ADD COLUMN IF NOT EXISTS project_level TEXT,
ADD COLUMN IF NOT EXISTS offer_type TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS discount_label TEXT,
ADD COLUMN IF NOT EXISTS offer_expiry_datetime TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS regular_price_per_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS group_price_per_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS price_unit TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS regular_total_price NUMERIC,
ADD COLUMN IF NOT EXISTS discounted_total_price_min NUMERIC,
ADD COLUMN IF NOT EXISTS discounted_total_price_max NUMERIC,
ADD COLUMN IF NOT EXISTS total_savings_min NUMERIC,
ADD COLUMN IF NOT EXISTS total_savings_max NUMERIC,
ADD COLUMN IF NOT EXISTS regular_price_min NUMERIC,
ADD COLUMN IF NOT EXISTS regular_price_max NUMERIC,
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_cta_text TEXT,
ADD COLUMN IF NOT EXISTS secondary_cta_text TEXT,
ADD COLUMN IF NOT EXISTS details_page_url TEXT;

COMMENT ON COLUMN live_group_projects.benefits IS 'Store benefits list as a JSON array';
