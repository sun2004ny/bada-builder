-- Migration: Add missing columns for Mixed-Use and detailed land-based units
-- Execute this in your SQL editor

-- 1. Updates to live_group_projects
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_projects' AND column_name='mixed_use_selected_types') THEN
        ALTER TABLE live_group_projects ADD COLUMN mixed_use_selected_types TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_projects' AND column_name='orientation') THEN
        ALTER TABLE live_group_projects ADD COLUMN orientation VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_projects' AND column_name='parking_type') THEN
        ALTER TABLE live_group_projects ADD COLUMN parking_type VARCHAR(100) DEFAULT 'Front';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_projects' AND column_name='parking_slots') THEN
        ALTER TABLE live_group_projects ADD COLUMN parking_slots INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_projects' AND column_name='entry_points') THEN
        ALTER TABLE live_group_projects ADD COLUMN entry_points TEXT;
    END IF;
END $$;

-- 2. Updates to live_group_towers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_towers' AND column_name='property_type') THEN
        ALTER TABLE live_group_towers ADD COLUMN property_type VARCHAR(100);
    END IF;
END $$;

-- 3. Updates to live_group_units
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='plot_width') THEN
        ALTER TABLE live_group_units ADD COLUMN plot_width NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='plot_depth') THEN
        ALTER TABLE live_group_units ADD COLUMN plot_depth NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='front_side') THEN
        ALTER TABLE live_group_units ADD COLUMN front_side VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='back_side') THEN
        ALTER TABLE live_group_units ADD COLUMN back_side VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='left_side') THEN
        ALTER TABLE live_group_units ADD COLUMN left_side VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='right_side') THEN
        ALTER TABLE live_group_units ADD COLUMN right_side VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='unit_image_url') THEN
        ALTER TABLE live_group_units ADD COLUMN unit_image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='live_group_units' AND column_name='unit_gallery') THEN
        ALTER TABLE live_group_units ADD COLUMN unit_gallery JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

COMMENT ON COLUMN live_group_projects.mixed_use_selected_types IS 'Array of selected property types for Mixed-Use projects';
COMMENT ON COLUMN live_group_units.unit_gallery IS 'Array of gallery image URLs for a specific unit';
