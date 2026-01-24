import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // Reduced from 20 to be safer with Neon free tier limits
    min: 2,  // Minimum number of idle connections
    idleTimeoutMillis: 10000, // Close idle clients faster (10s instead of 30s)
    connectionTimeoutMillis: 5000, // Fail faster on connection (5s)
    maxUses: 7500, // Close connection after 7500 queries to prevent leaks
});

// Test connection and set query timeout
pool.on('connect', (client) => {
    // Set statement timeout for this connection
    client.query('SET statement_timeout = 30000'); // 30 seconds
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