import pool from '../config/database.js';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting migration: Adding unit_gallery column to live_group_units...');

        await client.query('BEGIN');

        // Add unit_gallery column as TEXT[] with empty array as default
        await client.query(`
            ALTER TABLE live_group_units 
            ADD COLUMN IF NOT EXISTS unit_gallery TEXT[] DEFAULT '{}'
        `);

        await client.query('COMMIT');
        console.log('✅ Migration successful: unit_gallery column added.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
