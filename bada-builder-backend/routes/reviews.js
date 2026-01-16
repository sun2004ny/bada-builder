import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a property
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
    const {
        property_id,
        user_id,
        user_name,
        overall_rating,
        connectivity_rating,
        lifestyle_rating,
        safety_rating,
        green_area_rating,
        comment,
        positives,
        negatives
    } = req.body;

    try {
        const query = `
            INSERT INTO property_reviews (
                property_id, user_id, user_name, overall_rating, 
                connectivity_rating, lifestyle_rating, safety_rating, green_area_rating, 
                comment, positives, negatives, is_approved
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE)
            RETURNING *;
        `;

        const values = [
            property_id, user_id, user_name, overall_rating,
            connectivity_rating, lifestyle_rating, safety_rating, green_area_rating,
            comment, JSON.stringify(positives || []), JSON.stringify(negatives || [])
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Review submitted successfully and is pending approval.', review: result.rows[0] });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   GET /api/reviews/property/:id
 * @desc    Get all approved reviews for a property
 * @access  Public
 */
router.get('/property/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM property_reviews WHERE property_id = $1 AND is_approved = TRUE ORDER BY created_at DESC';
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   GET /api/reviews/stats/:id
 * @desc    Get rating statistics for a property
 * @access  Public
 */
router.get('/stats/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                COUNT(*) as total_reviews,
                AVG(overall_rating) as avg_overall,
                AVG(connectivity_rating) as avg_connectivity,
                AVG(lifestyle_rating) as avg_lifestyle,
                AVG(safety_rating) as avg_safety,
                AVG(green_area_rating) as avg_green_area,
                COUNT(CASE WHEN overall_rating = 5 THEN 1 END) as star_5,
                COUNT(CASE WHEN overall_rating = 4 THEN 1 END) as star_4,
                COUNT(CASE WHEN overall_rating = 3 THEN 1 END) as star_3,
                COUNT(CASE WHEN overall_rating = 2 THEN 1 END) as star_2,
                COUNT(CASE WHEN overall_rating = 1 THEN 1 END) as star_1
            FROM property_reviews 
            WHERE property_id = $1 AND is_approved = TRUE
        `;

        const result = await pool.query(query, [id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   GET /api/reviews/admin/pending
 * @desc    Get all pending reviews (Admin only)
 * @access  Private (Admin Role Recommended)
 */
router.get('/admin/pending', authenticate, async (req, res) => {
    try {
        // In a real scenario, you'd check for admin role here
        const query = 'SELECT * FROM property_reviews WHERE is_approved = FALSE ORDER BY created_at DESC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   PATCH /api/reviews/admin/approve/:id
 * @desc    Approve or reject a review (Admin only)
 * @access  Private (Admin Role Recommended)
 */
router.patch('/admin/:action/:id', authenticate, async (req, res) => {
    const { action, id } = req.params;

    try {
        if (action === 'approve') {
            const query = 'UPDATE property_reviews SET is_approved = TRUE WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            if (result.rowCount === 0) return res.status(404).json({ error: 'Review not found' });
            res.json({ message: 'Review approved successfully', review: result.rows[0] });
        } else if (action === 'reject') {
            const query = 'DELETE FROM property_reviews WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            if (result.rowCount === 0) return res.status(404).json({ error: 'Review not found' });
            res.json({ message: 'Review rejected and deleted' });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error processing review action:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
