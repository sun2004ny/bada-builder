import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/short-stay-reviews
 * @desc    Submit a review for a short stay booking
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            booking_id,
            ratings, // { cleanliness, accuracy, checkIn, communication, location, value }
            overall_rating,
            public_comment,
            private_feedback,
            recommend,
            safety_issues
        } = req.body;

        // 1. Validate Booking Ownership & Status
        const bookingCheck = await client.query(
            `SELECT * FROM short_stay_reservations WHERE id = $1`,
            [booking_id]
        );

        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookingCheck.rows[0];

        // Ensure user owns the booking
        if (booking.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to review this booking' });
        }

        // Ensure booking is completed (or at least checked in?) 
        // Ideally checked out.
        // We can allow review if today >= check_out.
        const checkOutDate = new Date(booking.check_out);
        const today = new Date();
        
        // Normalize time to compare dates only if needed, but strict check_out < now is safer.
        // Let's say check_out date means 11 AM checkout. 
        // If today is same as check_out, maybe allow? 
        // User requested: "when traveller rented the place during that range + 7 days windows"
        // Let's stick to check_out date passed.
        
        if (today < checkOutDate) {
             return res.status(400).json({ error: 'Cannot review before checkout' });
        }

        // Check 7 days window
        const sevenDaysAfter = new Date(checkOutDate);
        sevenDaysAfter.setDate(sevenDaysAfter.getDate() + 7);
        
        if (today > sevenDaysAfter) {
            return res.status(400).json({ error: 'Review period has expired (7 days after checkout)' });
        }

        // 2. Check if review already exists
        const reviewCheck = await client.query(
            `SELECT id FROM short_stay_reviews WHERE booking_id = $1`,
            [booking_id]
        );

        if (reviewCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Review already submitted for this booking' });
        }

        // 3. Insert Review
        await client.query('BEGIN');

        const { cleanliness, accuracy, checkIn, communication, location, value } = ratings;

        const result = await client.query(
            `INSERT INTO short_stay_reviews (
                property_id, booking_id, user_id, user_name, user_photo,
                cleanliness, accuracy, check_in, communication, location, value,
                overall_rating, public_comment, private_feedback,
                recommend, safety_issues
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
                booking.property_id,
                booking_id,
                req.user.id,
                req.user.name,
                req.user.profile_photo,
                cleanliness, accuracy, checkIn, communication, location, value,
                overall_rating,
                public_comment,
                private_feedback || null,
                recommend || false,
                JSON.stringify(safety_issues || [])
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit Review Error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    } finally {
        client.release();
    }
});

/**
 * @route   GET /api/short-stay-reviews/property/:id
 * @desc    Get reviews for a property
 * @access  Public
 */
router.get('/property/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM short_stay_reviews 
             WHERE property_id = $1 
             ORDER BY created_at DESC`,
             [req.params.id]
        );
        res.json({ reviews: result.rows });
    } catch (error) {
        console.error('Fetch Reviews Error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * @route   GET /api/short-stay-reviews/check/:bookingId
 * @desc    Check if a booking has a review
 * @access  Private
 */
router.get('/check/:bookingId', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id FROM short_stay_reviews WHERE booking_id = $1`,
            [req.params.bookingId]
        );
        res.json({ hasReview: result.rows.length > 0 });
    } catch (error) {
        console.error('Check Review Error:', error);
        res.status(500).json({ error: 'Failed to check review status' });
    }
});

export default router;
