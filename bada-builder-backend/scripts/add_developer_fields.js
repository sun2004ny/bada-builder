import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const addDeveloperFields = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Adding missing columns to properties table...');

        const columnsToAdd = [
            { name: 'scheme_type', type: 'VARCHAR(50)' },
            { name: 'residential_options', type: 'TEXT[]' },
            { name: 'commercial_options', type: 'TEXT[]' },
            { name: 'base_price', type: 'VARCHAR(100)' },
            { name: 'max_price', type: 'VARCHAR(100)' },
            { name: 'project_location', type: 'VARCHAR(255)' },
            { name: 'amenities', type: 'TEXT[]' },
            { name: 'owner_name', type: 'VARCHAR(255)' },
            { name: 'possession_status', type: 'VARCHAR(50)' },
            { name: 'rera_status', type: 'VARCHAR(20)' },
            { name: 'project_stats', type: 'JSONB' },
            { name: 'contact_phone', type: 'VARCHAR(20)' }
        ];

        for (const column of columnsToAdd) {
            try {
                await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
                console.log(`✅ Column ${column.name} added or already exists.`);
            } catch (err) {
                console.warn(`⚠️ Could not add column ${column.name}:`, err.message);
            }
        }

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

addDeveloperFields()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
