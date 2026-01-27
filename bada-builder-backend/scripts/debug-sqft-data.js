import pool from '../config/database.js';

const debugDB = async () => {
    try {
        const result = await pool.query(
            'SELECT id, title, regular_price_per_sqft, regular_price_per_sqft_max, group_price_per_sqft, group_price_per_sqft_max FROM live_group_projects ORDER BY created_at DESC LIMIT 3'
        );
        console.log('--- LATEST PROJECTS ---');
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err);
        process.exit(1);
    }
};

debugDB();
