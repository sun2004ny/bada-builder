import pool from '../config/database.js';

const createShortStayTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create short_stay_properties table
    // flexible columns: location, pricing, rules, policies, amenities, specific_details
    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_properties (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL, -- 'apartment', 'villa', 'dormitory', etc.
        
        -- Location (JSONB: address, landmark, city, state, country, pincode, lat, lng)
        location JSONB DEFAULT '{}'::jsonb,
        
        -- Pricing (JSONB: perNight, weekly, monthly, extraGuest, cleaning, deposit, taxes)
        pricing JSONB DEFAULT '{}'::jsonb,
        
        -- Rules (JSONB: checkIn, checkOut, minStay, maxStay, instantBooking)
        rules JSONB DEFAULT '{}'::jsonb,
        
        -- Policies (JSONB: cancellation, houseRules, idRequired, smoking, pets, events)
        policies JSONB DEFAULT '{}'::jsonb,
        
        -- Amenities (Array of strings: ['wifi', 'ac', 'pool', ...])
        amenities TEXT[] DEFAULT '{}',
        
        -- Media
        cover_image TEXT,
        images TEXT[] DEFAULT '{}',
        video_url TEXT,
        
        -- Category Specific Details (JSONB: BHK, floor, bedType, tentType, etc.)
        specific_details JSONB DEFAULT '{}'::jsonb,
        
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'booked'
        rating NUMERIC(2, 1) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create index on category and location (for search performance)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_short_stay_category ON short_stay_properties(category);
      CREATE INDEX IF NOT EXISTS idx_short_stay_location_city ON short_stay_properties((location->>'city'));
      CREATE INDEX IF NOT EXISTS idx_short_stay_price ON short_stay_properties((pricing->>'perNight'));
    `);

    // 3. Create short_stay_favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES short_stay_properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, property_id)
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Short Stay tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
  } finally {
    client.release();
    pool.end();
  }
};

createShortStayTables();
