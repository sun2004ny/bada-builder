import pool from '../config/database.js';

const migrate = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('UPGRADING: properties table schema...');

        // 1. Add property_source column
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS property_source VARCHAR(50) DEFAULT 'Individual'
        `);

        // 2. Add is_featured column
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE
        `);

        // 3. Add tracking columns
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS inquiries INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0
        `);

        // 4. Add metadata JSONB column
        await client.query(`
            ALTER TABLE properties 
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
        `);

        // 5. Update Status Constraint
        try {
            await client.query(`
                ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check
            `);
            await client.query(`
                ALTER TABLE properties ADD CONSTRAINT properties_status_check 
                CHECK (status IN ('active', 'expired', 'pending', 'inactive', 'rejected', 'closed', 'closing'))
            `);
        } catch (e) {
            console.log('Note: Status constraint update skipped or already updated.');
        }

        console.log('MIGRATING: data from live_grouping_properties to properties...');

        // 6. Migrate data
        // We select the first image as image_url if available
        await client.query(`
            INSERT INTO properties (
                title, type, location, price, description, facilities, images, image_url,
                user_type, property_source, status, created_at, updated_at, metadata
            )
            SELECT 
                title, type, location, group_price, description, facilities, images, 
                CASE WHEN array_length(images, 1) > 0 THEN images[1] ELSE NULL END,
                'admin', 'Live Grouping', LOWER(status), created_at, updated_at,
                jsonb_build_object(
                    'original_price', original_price,
                    'discount', discount,
                    'savings', savings,
                    'total_slots', total_slots,
                    'filled_slots', filled_slots,
                    'min_buyers', min_buyers,
                    'time_left', time_left,
                    'area', area,
                    'possession', possession,
                    'rera_number', rera_number,
                    'advantages', advantages,
                    'group_details', group_details
                )
            FROM live_grouping_properties
            ON CONFLICT DO NOTHING
        `);

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
    } finally {
        client.release();
    }
};

migrate().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
