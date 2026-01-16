import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Toggle favorite status
router.post('/toggle', authenticate, async (req, res) => {
    const { propertyId } = req.body;
    const userId = req.user.id;

    if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
    }

    try {
        // Check if it already exists
        const checkResult = await pool.query(
            'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
            [userId, propertyId]
        );

        if (checkResult.rows.length > 0) {
            // Remove it
            await pool.query(
                'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
                [userId, propertyId]
            );
            return res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add it
            await pool.query(
                'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)',
                [userId, propertyId]
            );
            return res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// Get all favorite property IDs for the user
router.get('/ids', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT property_id FROM favorites WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ favoriteIds: result.rows.map(row => row.property_id) });
    } catch (error) {
        console.error('Get favorite IDs error:', error);
        res.status(500).json({ error: 'Failed to fetch favorite IDs' });
    }
});

// Get detailed list of favorited properties
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.* FROM properties p
       JOIN favorites f ON p.id = f.property_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
            [req.user.id]
        );
        res.json({ properties: result.rows });
    } catch (error) {
        console.error('Get favorites list error:', error);
        res.status(500).json({ error: 'Failed to fetch favorite properties' });
    }
});

export default router;
