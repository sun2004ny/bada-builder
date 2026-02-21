import pool from '../config/database.js';

async function fixUsersTable() {
    try {
        console.log('🛠️ Fixing users table schema...');
        
        // Add is_deleted column
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Column is_deleted added or already exists.');

        // Add bio column
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS bio TEXT;
        `);
        console.log('✅ Column bio added or already exists.');

        // Add is_verified column
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Column is_verified added or already exists.');

        console.log('✨ Users table schema is now correct.');
    } catch (error) {
        console.error('❌ Failed to fix users table:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

fixUsersTable();
