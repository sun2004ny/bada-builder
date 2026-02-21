import pool from '../config/database.js';

const createPhotographerTable = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Creating photographers table...');

        const query = `
            CREATE TABLE IF NOT EXISTS photographers (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(50) NOT NULL,
                city VARCHAR(100),
                experience INTEGER,
                photography_type VARCHAR(100),
                drive_link TEXT NOT NULL,
                instagram VARCHAR(255),
                website VARCHAR(255),
                has_dslr BOOLEAN DEFAULT FALSE,
                has_drone BOOLEAN DEFAULT FALSE,
                outstation_available BOOLEAN DEFAULT FALSE,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_photographers_email ON photographers(email);
        `;

        await client.query(query);
        console.log('✅ Photographers table created successfully with unique email constraint and index.');

    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        client.release();
        // Since the pool is a singleton and might be used by the app, we usually don't end it if we were importing it from a running app context, 
        // but this is a standalone script execution.
        pool.end();
    }
};

createPhotographerTable();
