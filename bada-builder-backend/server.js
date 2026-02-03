import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Fix for ENOTFOUND errors on some Windows/Node versions preferring IPv6
dns.setDefaultResultOrder('ipv4first');

// Import routes
import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js';
import forgotPasswordRoutes from './routes/forgotPassword.js';
import userRoutes from './routes/users.js';
import propertyRoutes from './routes/properties.js';
import leadRoutes from './routes/leads.js';
import bookingRoutes from './routes/bookings.js';
import subscriptionRoutes from './routes/subscriptions.js';
import liveGroupingRoutes from './routes/live-grouping.js';
import liveGroupDynamicRoutes from './routes/live-group-dynamic.js';
import complaintRoutes from './routes/complaints.js';
import reviewRoutes from './routes/reviews.js';
import chatRoutes from './routes/chat.js';
import wishlistRoutes from './routes/wishlists.js';
import adminRoutes from './routes/admin.js';
import adminPropertiesRoutes from './routes/adminProperties.js';
import shortStayRoutes from './routes/shortStay.js';
import marketingRoutes from './routes/marketing.js';
import joinedLiveGroupsRoutes from './routes/joined-live-groups.js';
import proxyRoutes from './routes/proxy.js';


// Import database
import pool from './config/database.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET is not set in environment variables!');
    console.error('Please add JWT_SECRET to your .env file.');
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in environment variables!');
    console.error('Please add DATABASE_URL to your .env file.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001; // Default to 5001 if not set

import favoritesRoutes from './routes/favorites.js';

// Trust proxy for external services (Render, Vercel, etc)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Route-specific limiters
// Strict limiter for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased from 10 to 50 for development testing
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Medium limiter for OTP and sensitive operations
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Increased from 5 to 20 for development testing
    message: 'Too many OTP requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Relaxed limiter for mutations (POST/PUT/DELETE)
const mutationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Very relaxed limiter for read operations (GET)
const readLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'database connected successfully', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// API Routes with route-specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/otp', otpLimiter, otpRoutes);
app.use('/api/forgot-password', otpLimiter, forgotPasswordRoutes);
app.use('/api/users', readLimiter, userRoutes);
app.use('/api/properties', mutationLimiter, propertyRoutes);
app.use('/api/leads', mutationLimiter, leadRoutes);
app.use('/api/bookings', mutationLimiter, bookingRoutes);
app.use('/api/subscriptions', mutationLimiter, subscriptionRoutes);
app.use('/api/live-grouping', readLimiter, liveGroupingRoutes);
app.use('/api/live-grouping-dynamic', readLimiter, liveGroupDynamicRoutes);
app.use('/api/complaints', mutationLimiter, complaintRoutes);
app.use('/api/reviews', mutationLimiter, reviewRoutes);
app.use('/api/chat', mutationLimiter, chatRoutes);
app.use('/api/wishlists', mutationLimiter, wishlistRoutes);
app.use('/api/favorites', mutationLimiter, favoritesRoutes);
app.use('/api/admin/properties', mutationLimiter, adminPropertiesRoutes);
app.use('/api/admin', readLimiter, adminRoutes);
app.use('/api/short-stay', mutationLimiter, shortStayRoutes);
app.use('/api/marketing', mutationLimiter, marketingRoutes);
app.use('/api/joined-live-groups', readLimiter, joinedLiveGroupsRoutes);
app.use('/api/proxy', readLimiter, proxyRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
// Start server
import { createServer } from 'http';
import { initSocket } from './utils/socket.js';

const httpServer = createServer(app);
const io = initSocket(httpServer);

const server = httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.io initialized`);
});

// Periodic Cleanup for Live Grouping Unit Locks (Every 1 minute)
setInterval(async () => {
    try {
        const now = new Date();
        const expiryTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

        const result = await pool.query(
            "UPDATE live_group_units SET status = 'available', locked_at = NULL, locked_by = NULL WHERE status = 'locked' AND locked_at < $1",
            [expiryTime]
        );
        if (result.rowCount > 0) {
            console.log(`🕒 Released ${result.rowCount} expired unit locks.`);
        }
    } catch (error) {
        console.error('Lock cleanup error:', error);
    }
}, 60000);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

export default app;
