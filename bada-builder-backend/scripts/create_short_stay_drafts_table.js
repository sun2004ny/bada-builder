import pool from '../config/database.js';

const createDraftsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS short_stay_drafts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        data JSONB DEFAULT '{}'::jsonb,
        current_step INTEGER DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Short Stay Drafts table created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating drafts table:', error);
  } finally {
    client.release();
    pool.end();
  }
};

createDraftsTable();
