import pool from './config/database.js';

const checkLiveGroupingSchema = async () => {
    try {
        const tables = ['live_group_projects', 'live_group_towers', 'live_group_units'];
        for (const table of tables) {
            console.log(`\n=== TABLE: ${table} ===`);
            const res = await pool.query(`
                SELECT column_name, data_type, udt_name 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);

            if (res.rows.length === 0) {
                console.log('  (No columns found or table does not exist)');
            } else {
                res.rows.forEach(row => {
                    console.log(`  - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
                });
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLiveGroupingSchema();
