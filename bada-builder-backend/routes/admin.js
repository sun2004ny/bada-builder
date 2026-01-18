import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.user_type === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, isAdmin, async (req, res) => {
    try {
        // Fetch Total Users
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');

        // Fetch Total Properties
        const propertiesCount = await pool.query('SELECT COUNT(*) FROM properties');

        // Fetch Pending Approvals
        // Note: Assuming status 'pending' exists based on the requirement
        const pendingCount = await pool.query("SELECT COUNT(*) FROM properties WHERE status = 'pending'");

        // Fetch Total Revenue
        const revenueResult = await pool.query('SELECT SUM(plan_price) as total FROM user_subscriptions');

        // Fetch Active Listings
        const activeListings = await pool.query("SELECT COUNT(*) FROM properties WHERE status = 'active'");

        // Approval Rate calculation
        const approvalRateResult = await pool.query(`
            SELECT 
                CASE 
                    WHEN COUNT(*) FILTER (WHERE status IN ('active', 'rejected')) = 0 THEN 0
                    ELSE (COUNT(*) FILTER (WHERE status = 'active')::float / COUNT(*) FILTER (WHERE status IN ('active', 'rejected'))::float) * 100
                END as rate
            FROM properties
        `);

        // Average Response Time calculation (in hours)
        const responseTimeResult = await pool.query(`
            SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
            FROM properties 
            WHERE status IN ('active', 'rejected') AND updated_at > created_at
        `);

        // User Satisfaction (Average of all approved reviews)
        const satisfactionResult = await pool.query(`
            SELECT AVG(overall_rating) as avg_rating FROM property_reviews WHERE is_approved = TRUE
        `);

        // Fetch Recent Activity (Combining latest users and properties)
        const recentUsers = await pool.query(
            "SELECT 'user_registration' as type, CONCAT('New user registered: ', email) as message, created_at FROM users ORDER BY created_at DESC LIMIT 5"
        );

        const recentProperties = await pool.query(
            "SELECT CASE WHEN status = 'pending' THEN 'property_submitted' ELSE 'property_approved' END as type, CONCAT('Property ', status, ': ', title) as message, created_at FROM properties ORDER BY created_at DESC LIMIT 5"
        );

        const recentSubscriptions = await pool.query(
            "SELECT 'subscription_purchased' as type, CONCAT('Subscription purchased: ', plan_name) as message, created_at FROM user_subscriptions ORDER BY created_at DESC LIMIT 5"
        );

        // Combine and sort recent activity
        const recentActivity = [
            ...recentUsers.rows,
            ...recentProperties.rows,
            ...recentSubscriptions.rows
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map((item, index) => ({
                id: index + 1,
                type: item.type,
                message: item.message,
                time: item.created_at // Will be formatted on frontend or use a helper
            }));

        res.json({
            totalUsers: parseInt(usersCount.rows[0].count),
            totalProperties: parseInt(propertiesCount.rows[0].count),
            pendingApprovals: parseInt(pendingCount.rows[0].count),
            totalRevenue: parseFloat(revenueResult.rows[0].total || 0),
            activeListings: parseInt(activeListings.rows[0].count),
            approvalRate: Math.round(parseFloat(approvalRateResult.rows[0].rate || 0)),
            avgResponseTime: parseFloat(responseTimeResult.rows[0].avg_hours || 0).toFixed(1),
            userSatisfaction: parseFloat(satisfactionResult.rows[0].avg_rating || 4.5).toFixed(1),
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
