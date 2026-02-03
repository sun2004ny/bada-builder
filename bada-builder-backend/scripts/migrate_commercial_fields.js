import pool from '../config/database.js';

async function migrate() {
    console.log('🚀 Starting commercial schema migration...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const columnsToAdd = [
            { name: 'orientation', type: 'VARCHAR(100)' },
            { name: 'parking_type', type: 'VARCHAR(100) DEFAULT \'Front\'' },
            { name: 'parking_slots', type: 'INTEGER DEFAULT 0' },
            { name: 'pedestrian_entry', type: 'TEXT' }
        ];

        for (const col of columnsToAdd) {
            console.log(`🔍 Checking column: ${col.name}`);
            const checkRes = await client.query(
                'SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name=$2',
                ['live_group_projects', col.name]
            );

            if (checkRes.rows.length === 0) {
                console.log(`➕ Adding column: ${col.name}`);
                await client.query(`ALTER TABLE live_group_projects ADD COLUMN ${col.name} ${col.type}`);
            } else {
                console.log(`✅ Column ${col.name} already exists.`);
            }
        }

        await client.query('COMMIT');
        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
