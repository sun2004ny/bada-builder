import pool from './config/database.js';

async function migrate() {
    try {
        console.log('Running migration: Add brochure_url to live_group_projects...');
        await pool.query(`
            ALTER TABLE live_group_projects 
            ADD COLUMN IF NOT EXISTS brochure_url TEXT;
        `);
        console.log('✅ Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
