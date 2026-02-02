
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPropertyId() {
    try {
        const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'property_id';
    `);

        if (result.rows.length > 0) {
            console.log('PROPERTY_ID_SCHEMA:', JSON.stringify(result.rows[0]));
        } else {
            console.log('PROPERTY_ID_NOT_FOUND');
        }
        pool.end();
    } catch (error) {
        console.error(error);
        pool.end();
    }
}

checkPropertyId();
