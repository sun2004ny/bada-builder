import pool from './config/database.js';

const createWishlistTables = async () => {
    try {
        console.log('⏳ Creating wishlist tables...');

        // 1. Create wishlists table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ wishlists table created or already exists');

        // 2. Create wishlist_properties table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlist_properties (
                wishlist_id UUID NOT NULL,
                property_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (wishlist_id, property_id),
                CONSTRAINT fk_wp_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ wishlist_properties table created or already exists');

        // 3. Create index for faster user-specific queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlists(user_id)
        `);
        console.log('✅ Index on wishlists(user_id) created or already exists');

        console.log('✨ Database schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating wishlist tables:', error);
        process.exit(1);
    }
};

createWishlistTables();
