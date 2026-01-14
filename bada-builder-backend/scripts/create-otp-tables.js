import pool from '../config/database.js';

const createOTPTables = async () => {
  try {
    console.log('🔄 Creating OTP tables...');

    // Create email_otps table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_otps_expires ON email_otps(expires_at);
    `);

    // Add is_verified column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    console.log('✅ OTP tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating OTP tables:', error);
    process.exit(1);
  }
};

createOTPTables();
