import pool from '../config/database.js';

const migrateReservationTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Migrating short_stay_reservations table...');
    
    // Add booking_code column
    await client.query(`
      ALTER TABLE short_stay_reservations 
      ADD COLUMN IF NOT EXISTS booking_code VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS is_host_verified BOOLEAN DEFAULT FALSE;
    `);

    // Generate booking codes for existing reservations
    const res = await client.query('SELECT id FROM short_stay_reservations WHERE booking_code IS NULL');
    for (const row of res.rows) {
        const uniqueCode = `RES-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        await client.query('UPDATE short_stay_reservations SET booking_code = $1 WHERE id = $2', [uniqueCode, row.id]);
    }

    console.log('✅ short_stay_reservations table migrated successfully.');
  } catch (error) {
    console.error('❌ Error migrating table:', error);
  } finally {
    client.release();
    process.exit();
  }
};

migrateReservationTable();
