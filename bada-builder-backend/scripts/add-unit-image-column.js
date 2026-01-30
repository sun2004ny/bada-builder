import pool from '../config/database.js';

const migrate = async () => {
    try {
        console.log('Adding unit_image_url column to live_group_units table...');

        await pool.query(`
            ALTER TABLE live_group_units 
            ADD COLUMN IF NOT EXISTS unit_image_url VARCHAR(255) DEFAULT NULL;
        `);

        console.log('Successfully added unit_image_url column.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
