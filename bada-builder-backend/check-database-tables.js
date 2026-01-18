/**
 * Check if all required database tables exist
 */

import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // Check if tables exist
    const tables = [
      'users',
      'properties', 
      'live_grouping_properties',
      'email_otps',
      'bookings',
      'subscriptions',
      'leads',
      'complaints'
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);

        const exists = result.rows[0].exists;
        console.log(`${exists ? '✅' : '❌'} Table "${table}": ${exists ? 'EXISTS' : 'MISSING'}`);

        if (exists) {
          // Count rows
          const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`   └─ Rows: ${countResult.rows[0].count}`);
        }
      } catch (error) {
        console.log(`❌ Table "${table}": ERROR - ${error.message}`);
      }
    }

    console.log('\n🔍 Checking live_grouping_properties table structure...');
    
    try {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'live_grouping_properties' 
        ORDER BY ordinal_position;
      `);

      if (result.rows.length > 0) {
        console.log('📋 Columns:');
        result.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      } else {
        console.log('❌ Table structure not found');
      }
    } catch (error) {
      console.log(`❌ Error checking table structure: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();