import pool from '../config/database.js';

async function migrate() {
    try {
        console.log('🚀 Ensuring subscription_usage table exists...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscription_usage (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(50) NOT NULL,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ subscription_usage table ready.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
