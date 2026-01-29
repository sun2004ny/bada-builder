import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * DATABASE SINGLETON REFACTOR
 * Refactored to address "Connection terminated" and timeout errors.
 */

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Optimized for stability and performance
    max: 20,                       // Maintain up to 20 connections
    idleTimeoutMillis: 30000,      // Keep idle connections open for 30s to reduce handshake overhead
    connectionTimeoutMillis: 5000, // Fail fast (5s) if connection cannot be established
    maxUses: 7500,                 // Protect against potential memory leaks in long-running processes
};

// Internal instance
let poolInstance;

const getPool = () => {
    if (!poolInstance) {
        console.log('🚀 Initializing Singleton Database Pool...');
        poolInstance = new Pool(poolConfig);

        // Pool-level error listener (CRITICAL)
        poolInstance.on('error', (err) => {
            console.error('❌ Unexpected error on idle database client:', err.message);
            // pg-pool will automatically remove the broken client from the pool
        });

        // Connection-level setup
        poolInstance.on('connect', (client) => {
            // Set a safe statement timeout to prevent hanging queries from blocking the pool
            client.query('SET statement_timeout = 60000'); // 60 seconds
        });
    }
    return poolInstance;
};

// Export the pool instance directly to maintain compatibility with existing db.query() calls
const pool = getPool();

// Graceful shutdown handler
const shutdown = async (signal) => {
    console.log(`\nSystem received ${signal}. Closing database pool...`);
    try {
        await pool.end();
        console.log('✅ Database pool has been closed gracefully.');
        process.exit(0);
    } catch (err) {
        console.error('Error during pool shutdown:', err.message);
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default pool;