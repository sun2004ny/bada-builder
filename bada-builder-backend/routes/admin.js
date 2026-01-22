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

        // Fetch Total Bookings
        const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');

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

        // Fetch Recent Activity (Combining latest users, properties, and bookings)
        const recentUsers = await pool.query(
            "SELECT 'user_registration' as type, CONCAT('New user registered: ', email) as message, created_at FROM users ORDER BY created_at DESC LIMIT 5"
        );

        const recentProperties = await pool.query(
            "SELECT CASE WHEN status = 'pending' THEN 'property_submitted' ELSE 'property_approved' END as type, CONCAT('Property ', status, ': ', title) as message, created_at FROM properties ORDER BY created_at DESC LIMIT 5"
        );

        const recentSubscriptions = await pool.query(
            "SELECT 'subscription_purchased' as type, CONCAT('Subscription purchased: ', plan_name) as message, created_at FROM user_subscriptions ORDER BY created_at DESC LIMIT 5"
        );

        const recentBookings = await pool.query(
            "SELECT 'site_visit_booked' as type, CONCAT('New site visit booked for: ', property_title) as message, created_at FROM bookings ORDER BY created_at DESC LIMIT 5"
        );

        // Combine and sort recent activity
        const recentActivity = [
            ...recentUsers.rows,
            ...recentProperties.rows,
            ...recentSubscriptions.rows,
            ...recentBookings.rows
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
            totalBookings: parseInt(bookingsCount.rows[0].count),
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

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all site visit bookings
 * @access  Private (Admin)
 */
router.get('/bookings', authenticate, isAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            status = '',
            payment_status = '',
            start_date = '',
            end_date = ''
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE clause for filtering
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (search) {
            whereConditions.push(`(
                b.user_email ILIKE $${paramIndex} OR 
                b.property_title ILIKE $${paramIndex} OR 
                b.person1_name ILIKE $${paramIndex} OR
                b.person2_name ILIKE $${paramIndex} OR
                b.person3_name ILIKE $${paramIndex} OR
                b.property_location ILIKE $${paramIndex} OR
                u.phone ILIKE $${paramIndex} OR
                u.name ILIKE $${paramIndex}
            )`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            whereConditions.push(`b.status = $${paramIndex}`);
            queryParams.push(status);
            paramIndex++;
        }

        if (payment_status) {
            whereConditions.push(`b.payment_status = $${paramIndex}`);
            queryParams.push(payment_status);
            paramIndex++;
        }

        if (start_date) {
            whereConditions.push(`b.visit_date >= $${paramIndex}`);
            queryParams.push(start_date);
            paramIndex++;
        }

        if (end_date) {
            whereConditions.push(`b.visit_date <= $${paramIndex}`);
            queryParams.push(end_date);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) 
            FROM bookings b
            LEFT JOIN properties p ON b.property_id = p.id
            LEFT JOIN users u ON b.user_id = u.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, queryParams);
        const totalBookings = parseInt(countResult.rows[0].count);

        // Fetch bookings with property details
        const bookingsQuery = `
            SELECT 
                b.*,
                p.image_url as property_image,
                p.type as property_type,
                p.price as property_price,
                u.name as user_name,
                u.phone as user_phone
            FROM bookings b
            LEFT JOIN properties p ON b.property_id = p.id
            LEFT JOIN users u ON b.user_id = u.id
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        queryParams.push(limit, offset);
        const bookingsResult = await pool.query(bookingsQuery, queryParams);

        res.json({
            bookings: bookingsResult.rows,
            pagination: {
                total: totalBookings,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalBookings / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
