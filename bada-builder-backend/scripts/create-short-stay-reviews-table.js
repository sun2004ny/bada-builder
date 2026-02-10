import pool from '../config/database.js';

const createShortStayReviewsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating short_stay_reviews table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        property_id UUID REFERENCES short_stay_properties(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES short_stay_reservations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        user_photo TEXT,
        
        -- Ratings (1-5)
        cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),
        accuracy INT CHECK (accuracy BETWEEN 1 AND 5),
        check_in INT CHECK (check_in BETWEEN 1 AND 5),
        communication INT CHECK (communication BETWEEN 1 AND 5),
        location INT CHECK (location BETWEEN 1 AND 5),
        value INT CHECK (value BETWEEN 1 AND 5),
        
        overall_rating NUMERIC(2, 1) CHECK (overall_rating BETWEEN 1 AND 5),
        
        -- Text Content
        public_comment TEXT,
        private_feedback TEXT,
        
        -- Additional
        recommend BOOLEAN DEFAULT FALSE,
        safety_issues JSONB DEFAULT '[]',
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT unique_booking_review UNIQUE (booking_id)
      );
    `);

    // Create index for faster lookups
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_property ON short_stay_reviews(property_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user ON short_stay_reviews(user_id);`);

    console.log('✅ short_stay_reviews table created successfully');
  } catch (error) {
    console.error('❌ Error creating reviews table:', error);
  } finally {
    client.release();
    pool.end();
  }
};

createShortStayReviewsTable();
