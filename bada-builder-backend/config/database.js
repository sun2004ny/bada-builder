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
    ssl: {
        rejectUnauthorized: false // Match Neon/AWS requirements
    },
    // Optimized for stability and performance with Neon Pooler
    max: 20,                       // Maintain up to 20 connections
    idleTimeoutMillis: 10000,      // Keep connections alive for 10s to avoid frequent handshakes
    connectionTimeoutMillis: 30000, // Increased to 30s to allow for slow SSL handshakes on Windows
    maxUses: 7500,                 // Protect against potential memory leaks
    keepAlive: true,              // Enable TCP keep-alive to prevent silent drops
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