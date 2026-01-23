import pool from './config/database.js';

const migrate = async () => {
    try {
        console.log('Adding carpet_area column to live_group_units table...');

        await pool.query(`
            ALTER TABLE live_group_units 
            ADD COLUMN IF NOT EXISTS carpet_area NUMERIC DEFAULT NULL;
        `);

        console.log('Successfully added carpet_area column.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
