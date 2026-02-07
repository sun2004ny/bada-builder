import pool from '../config/database.js';

const addGuestDetailsColumn = async () => {
  const client = await pool.connect();
  try {
    console.log('Adding guest_details column to short_stay_reservations...');
    
    await client.query(`
      ALTER TABLE short_stay_reservations
      ADD COLUMN IF NOT EXISTS guest_details JSONB DEFAULT '[]'
    `);

    console.log('✅ Guest details column added successfully.');
  } catch (error) {
    console.error('❌ Error updating table:', error);
  } finally {
    client.release();
    process.exit();
  }
};

addGuestDetailsColumn();
