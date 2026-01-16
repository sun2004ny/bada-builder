-- Create property_reviews table
CREATE TABLE IF NOT EXISTS property_reviews (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL, -- Assuming property ID is INTEGER
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    user_name VARCHAR(255) NOT NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    connectivity_rating INTEGER NOT NULL CHECK (connectivity_rating >= 1 AND connectivity_rating <= 5),
    lifestyle_rating INTEGER NOT NULL CHECK (lifestyle_rating >= 1 AND lifestyle_rating <= 5),
    safety_rating INTEGER NOT NULL CHECK (safety_rating >= 1 AND safety_rating <= 5),
    green_area_rating INTEGER NOT NULL CHECK (green_area_rating >= 1 AND green_area_rating <= 5),
    comment TEXT,
    positives JSONB DEFAULT '[]', -- List of positive tags
    negatives JSONB DEFAULT '[]', -- List of negative tags
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookup by property
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews(property_id);
-- Index for admin pending reviews
CREATE INDEX IF NOT EXISTS idx_property_reviews_is_approved ON property_reviews(is_approved);
