import pool from '../config/database.js';

const createReservationTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating short_stay_reservations table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_reservations (
        id SERIAL PRIMARY KEY,
        property_id UUID REFERENCES short_stay_properties(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        host_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests JSONB DEFAULT '{}', 
        total_price NUMERIC(10, 2) NOT NULL,
        payment_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ short_stay_reservations table created successfully.');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    client.release();
    process.exit();
  }
};

createReservationTable();
