import pool from './config/database.js';

const migrateWishlistTypes = async () => {
    try {
        console.log('⏳ Starting migration of wishlist column types...');

        // 1. Drop the foreign key constraint temporarily if it exists
        await pool.query('ALTER TABLE wishlist_properties DROP CONSTRAINT IF EXISTS fk_wp_wishlist');

        // 2. Change wishlist_properties.property_id to integer
        // We use USING clause to cast existing values
        await pool.query(`
            ALTER TABLE wishlist_properties 
            ALTER COLUMN property_id TYPE integer USING property_id::integer
        `);
        console.log('✅ wishlist_properties.property_id changed to integer');

        // 3. Change wishlists.user_id to integer
        await pool.query(`
            ALTER TABLE wishlists 
            ALTER COLUMN user_id TYPE integer USING user_id::integer
        `);
        console.log('✅ wishlists.user_id changed to integer');

        // 4. Re-add foreign key constraint
        await pool.query(`
            ALTER TABLE wishlist_properties 
            ADD CONSTRAINT fk_wp_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint re-added');

        console.log('✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateWishlistTypes();
