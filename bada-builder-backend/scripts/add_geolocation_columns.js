import pool from '../config/database.js';

const addGeolocationColumns = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Geolocation Migration...');
        await client.query('BEGIN');

        // 1. Add columns to 'properties' table
        console.log('Adding columns to properties table...');
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS map_address TEXT;
        `);

        // 2. Add columns to 'live_group_projects' table
        console.log('Adding columns to live_group_projects table...');
        await client.query(`
            ALTER TABLE live_group_projects 
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS map_address TEXT;
        `);

        await client.query('COMMIT');
        console.log('✅ Geolocation columns added successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', error);
    } finally {
        client.release();
        process.exit();
    }
};

addGeolocationColumns();
