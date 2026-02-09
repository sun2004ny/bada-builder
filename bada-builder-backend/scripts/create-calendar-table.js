import pool from '../config/database.js';

const createCalendarTable = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Creating short_stay_calendar table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_calendar (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES short_stay_properties(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        price DECIMAL(10, 2), -- Nullable: if null, use base price
        status VARCHAR(20) DEFAULT 'available', -- 'available' or 'blocked'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, date)
      );
    `);

    console.log('✅ short_stay_calendar table created successfully.');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    client.release();
    pool.end();
  }
};

createCalendarTable();
