import pool from '../config/database.js';

async function setupReferralSettings() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refer_earn_settings (
                id SERIAL PRIMARY KEY,
                referral_property_id INTEGER,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if a row exists, if not create one
        const check = await pool.query('SELECT * FROM refer_earn_settings LIMIT 1');
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO refer_earn_settings (referral_property_id) VALUES (NULL)');
        }

        console.log('Referral settings table setup complete.');
    } catch (error) {
        console.error('Error setting up referral settings:', error);
    } finally {
        process.exit();
    }
}

setupReferralSettings();
