import pool from '../config/database.js';

async function createExample() {
    console.log('🚀 Creating example commercial property...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert Project
        const projectRes = await client.query(
            `INSERT INTO live_group_projects (
          title, developer, location, description, status, 
          type, min_buyers, area, road_width, plot_size_width, plot_size_depth,
          orientation, parking_type, parking_slots, entry_points,
          layout_columns, layout_rows, total_slots
      ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id`,
            [
                'Elite Trade Center (Example)', 'Bada Builder Developers', 'Central Business District, Indore',
                'A premium commercial hub featuring high-visibility storefronts and modern architecture.',
                'live', 'Commercial', 10, '5000', 60, 25, 40, 'East', 'Front', 24, 'Main entrance from 60ft road.',
                4, 2, 8
            ]
        );

        const projectId = projectRes.rows[0].id;
        console.log(`✅ Project created with ID: ${projectId}`);

        // 2. Insert Commercial Block (Tower)
        const towerRes = await client.query(
            'INSERT INTO live_group_towers (project_id, tower_name, total_floors, layout_columns, layout_rows) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [projectId, 'Main Block', 1, 4, 2]
        );
        const towerId = towerRes.rows[0].id;

        // 3. Insert Units
        for (let i = 1; i <= 8; i++) {
            await client.query(
                `INSERT INTO live_group_units (
            tower_id, floor_number, unit_number, unit_type, area, price, price_per_sqft, status, plot_width, plot_depth
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [towerId, 0, `E-${i}`, 'Commercial Unit', 1000, 5000000, 5000, 'available', 25, 40]
            );
        }

        await client.query('COMMIT');
        console.log('🎉 Example commercial property posted successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to create example:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createExample();
