import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    // Don't exit, let the pool handle reconnection
});

// Graceful shutdown
process.on('SIGTERM', () => {
    pool.end(() => {
        console.log('Pool has ended');
        process.exit(0);
    });
});

export default pool;