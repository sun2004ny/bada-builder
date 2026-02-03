import pool from '../config/database.js';

async function migrate() {
    console.log('🚀 Renaming column...');
    const client = await pool.connect();
    try {
        await client.query('ALTER TABLE live_group_projects RENAME COLUMN pedestrian_entry TO entry_points');
        console.log('🎉 Column renamed successfully!');
    } catch (error) {
        console.error('❌ Rename failed (already done?):', error.message);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
