-- Live Grouping Schema Overhaul

-- 1. Projects table (replaces/extends functionality of live_grouping_properties)
CREATE TABLE IF NOT EXISTS live_group_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    developer VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, live, closed
    image TEXT,
    images TEXT[],
    original_price VARCHAR(50),
    group_price VARCHAR(50),
    discount VARCHAR(50),
    savings VARCHAR(50),
    type VARCHAR(100), -- Apartment, Villa, etc.
    min_buyers INTEGER DEFAULT 5,
    total_slots INTEGER DEFAULT 0, -- Sum of units in all towers
    filled_slots INTEGER DEFAULT 0,
    benefits TEXT[],
    facilities TEXT[],
    advantages JSONB,
    group_details JSONB,
    possession VARCHAR(100),
    rera_number VARCHAR(100),
    area VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    brochure_url TEXT,
    project_name VARCHAR(255),
    builder_name VARCHAR(255),
    property_type VARCHAR(255),
    unit_configuration TEXT,
    project_level VARCHAR(100),
    offer_type VARCHAR(100),
    discount_percentage DECIMAL(5, 2),
    discount_label VARCHAR(255),
    offer_expiry_datetime TIMESTAMP,
    regular_price_per_sqft DECIMAL(15, 2),
    regular_price_per_sqft_max DECIMAL(15, 2),
    group_price_per_sqft DECIMAL(15, 2),
    group_price_per_sqft_max DECIMAL(15, 2),
    price_unit VARCHAR(50) DEFAULT 'sq ft',
    currency VARCHAR(10) DEFAULT 'INR',
    regular_total_price DECIMAL(15, 2),
    discounted_total_price_min DECIMAL(15, 2),
    discounted_total_price_max DECIMAL(15, 2),
    regular_price_min DECIMAL(15, 2),
    regular_price_max DECIMAL(15, 2),
    total_savings_min DECIMAL(15, 2),
    total_savings_max DECIMAL(15, 2),
    primary_cta_text VARCHAR(100),
    secondary_cta_text VARCHAR(100),
    details_page_url TEXT,
    layout_columns INTEGER,
    layout_rows INTEGER
);

-- 2. Towers table
CREATE TABLE IF NOT EXISTS live_group_towers (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES live_group_projects(id) ON DELETE CASCADE,
    tower_name VARCHAR(100) NOT NULL,
    total_floors INTEGER NOT NULL,
    layout_columns INTEGER,
    layout_rows INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Units table
CREATE TABLE IF NOT EXISTS live_group_units (
    id SERIAL PRIMARY KEY,
    tower_id INTEGER REFERENCES live_group_towers(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    unit_type VARCHAR(100), -- 1BHK, 2BHK, etc.
    area FLOAT,
    price DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'available', -- available, locked, booked
    locked_at TIMESTAMP,
    locked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings table
CREATE TABLE IF NOT EXISTS live_group_bookings (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER REFERENCES live_group_units(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_group_projects_modtime
    BEFORE UPDATE ON live_group_projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
