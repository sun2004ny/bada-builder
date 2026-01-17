import pool from './config/database.js';

const checkSchema = async () => {
    try {
        const tables = ['users', 'favorites', 'properties', 'wishlists'];
        for (const table of tables) {
            console.log(`\n--- ${table} column types ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            res.rows.forEach(row => {
                console.log(`${row.column_name}: ${row.data_type}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSchema();
