import pool from '../config/database.js';

async function checkSchema() {
    try {
        const tables = ['users', 'properties', 'user_subscriptions'];
        for (const table of tables) {
            const res = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
                [table]
            );
            console.log(`\n--- ${table.toUpperCase()} ---`);
            res.rows.forEach(row => {
                console.log(`${row.column_name.padEnd(25)} | ${row.data_type}`);
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
