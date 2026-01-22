-- Add new location fields to bookings table
-- Run this in your Neon DB SQL editor

-- Add new columns for enhanced location data
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS location_from_map TEXT,
ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8);

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_bookings_location_coords ON bookings(pickup_latitude, pickup_longitude);

-- Add comments for documentation
COMMENT ON COLUMN bookings.location_from_map IS 'Address selected from map (optional reference)';
COMMENT ON COLUMN bookings.pickup_latitude IS 'Latitude coordinate for pickup location';
COMMENT ON COLUMN bookings.pickup_longitude IS 'Longitude coordinate for pickup location';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('location_from_map', 'pickup_latitude', 'pickup_longitude');