
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    const sql = `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`;
    console.log('Running migration...');
    await pool.query(sql);
    console.log('✅ Migration successful: bio column added to users table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
};

runMigration();
