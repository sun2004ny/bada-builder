import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🚀 Running Units table extension migration...');
        await client.query(`
            ALTER TABLE live_group_units 
            ADD COLUMN IF NOT EXISTS carpet_area NUMERIC,
            ADD COLUMN IF NOT EXISTS super_built_up_area NUMERIC,
            ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
            ADD COLUMN IF NOT EXISTS discount_price_per_sqft NUMERIC;
        `);
        console.log('✅ Units table updated successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
