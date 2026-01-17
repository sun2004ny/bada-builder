import pool from '../config/database.js';

async function verifyTable() {
    try {
        console.log('Verifying chats table...');
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'chats'
        `);

        if (result.rows.length === 0) {
            console.log('❌ chats table DOES NOT exist.');
            console.log('Creating chats table...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS chats (
                    chat_id TEXT PRIMARY KEY,
                    property_id INTEGER NOT NULL,
                    buyer_id UUID NOT NULL REFERENCES users(id),
                    owner_id UUID NOT NULL REFERENCES users(id),
                    last_message TEXT,
                    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    buyer_unread_count INTEGER DEFAULT 0,
                    owner_unread_count INTEGER DEFAULT 0,
                    messages JSONB DEFAULT '[]'::jsonb,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_chats_property_id ON chats(property_id);
                CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON chats(buyer_id);
                CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON chats(owner_id);
            `);
            console.log('✅ chats table created successfully.');
        } else {
            console.log('✅ chats table exists.');
            const columns = result.rows.map(r => r.column_name);
            console.log('Current columns:', columns.join(', '));

            // Check for missing columns and add them if necessary
            // (Minimal check as per user description)
            const required = ['chat_id', 'property_id', 'buyer_id', 'owner_id', 'last_message', 'last_message_time', 'buyer_unread_count', 'owner_unread_count', 'messages'];
            for (const col of required) {
                if (!columns.includes(col)) {
                    console.log(`⚠️ Missing column: ${col}. You might need to add it manually or recreate the table.`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error verifying/creating table:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

verifyTable();
