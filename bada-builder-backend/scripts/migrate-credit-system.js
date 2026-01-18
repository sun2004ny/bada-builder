import pool from '../config/database.js';

const migrate = async () => {
    try {
        console.log('🚀 Starting Credit System Migration...');

        // 1. Update USERS table
        console.log('Updating USERS table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS individual_credits INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS developer_credits INTEGER DEFAULT 0
        `);

        // 2. Update PROPERTIES table
        console.log('Updating PROPERTIES table...');
        await pool.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS credit_used VARCHAR(20),
            ADD COLUMN IF NOT EXISTS property_type_strict VARCHAR(50)
        `);

        // 3. Migrate existing credit data from user_subscriptions / users.posts_left
        console.log('Migrating existing credits...');

        // This is a bit complex as we need to figure out which user has what credits currently.
        // For now, let's assume we can map existing active subscriptions to these new columns.

        const activeSubs = await pool.query(`
            SELECT user_id, plan_id, (properties_allowed - properties_used) as remaining
            FROM user_subscriptions
            WHERE status = 'active' AND expiry_date > NOW()
        `);

        for (const sub of activeSubs.rows) {
            if (sub.plan_id.startsWith('ind_')) {
                await pool.query('UPDATE users SET individual_credits = individual_credits + $1 WHERE id = $2', [sub.remaining, sub.user_id]);
            } else if (sub.plan_id.startsWith('dev_')) {
                await pool.query('UPDATE users SET developer_credits = developer_credits + $1 WHERE id = $2', [sub.remaining, sub.user_id]);
            }
        }

        // 4. Backfill existing properties
        console.log('Backfilling existing properties...');
        // If property_source was 'Developer', set credit_used = 'developer' and property_type_strict = 'developer'
        await pool.query(`
            UPDATE properties 
            SET credit_used = 'developer', property_type_strict = 'developer' 
            WHERE property_source = 'Developer' OR user_type = 'developer'
        `);

        await pool.query(`
            UPDATE properties 
            SET credit_used = 'individual', property_type_strict = 'individual' 
            WHERE (property_source = 'Individual' OR user_type = 'individual') AND credit_used IS NULL
        `);

        console.log('✅ Credit System Migration Completed Successfully.');
    } catch (e) {
        console.error('❌ Migration failed:', e);
    } finally {
        process.exit(0);
    }
};

migrate();
