import pool from '../config/database.js';

const createShortStayCalendarTable = async () => {
    const client = await pool.connect();
    try {
        console.log('Creating short_stay_calendar table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS short_stay_calendar (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                property_id UUID REFERENCES short_stay_properties(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                price NUMERIC(15, 2),
                status VARCHAR(50) DEFAULT 'available',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT unique_property_date UNIQUE (property_id, date)
            );
        `);

        // Create index for faster range lookups
        await client.query(`CREATE INDEX IF NOT EXISTS idx_calendar_property_date ON short_stay_calendar(property_id, date);`);

        console.log('✅ short_stay_calendar table created successfully');
    } catch (error) {
        console.error('❌ Error creating calendar table:', error);
    } finally {
        client.release();
        process.exit();
    }
};

createShortStayCalendarTable();
