import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all wishlists for the current user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT w.*, COUNT(wp.property_id) as property_count 
             FROM wishlists w 
             LEFT JOIN wishlist_properties wp ON w.id = wp.wishlist_id 
             WHERE w.user_id = $1::integer 
             GROUP BY w.id 
             ORDER BY w.created_at DESC`,
            [userId]
        );
        res.json({ wishlists: result.rows });
    } catch (error) {
        console.error('Error fetching wishlists:', error);
        res.status(500).json({ error: 'Failed to fetch wishlists' });
    }
});

// Create a new wishlist
router.post('/', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Wishlist name is required' });
        }

        if (name.length > 50) {
            return res.status(400).json({ error: 'Wishlist name must be less than 50 characters' });
        }

        const result = await pool.query(
            'INSERT INTO wishlists (user_id, name) VALUES ($1::integer, $2) RETURNING *',
            [userId, name.trim()]
        );

        res.status(201).json({ wishlist: result.rows[0] });
    } catch (error) {
        console.error('Error creating wishlist:', error);
        res.status(500).json({ error: 'Failed to create wishlist' });
    }
});

// Get properties for a specific wishlist
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const wishlistCheck = await pool.query(
            'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2::integer',
            [id, userId]
        );

        if (wishlistCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found or unauthorized' });
        }

        // Fetch properties in this wishlist
        const result = await pool.query(
            `SELECT p.* FROM properties p 
             JOIN wishlist_properties wp ON p.id = wp.property_id 
             WHERE wp.wishlist_id = $1`,
            [id]
        );

        res.json({ properties: result.rows });
    } catch (error) {
        console.error('Error fetching wishlist properties:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist properties' });
    }
});

// Add a property to a wishlist
router.post('/:id/properties', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { propertyId } = req.body;
        const userId = req.user.id;

        if (!propertyId) {
            return res.status(400).json({ error: 'Property ID is required' });
        }

        // Verify wishlist ownership
        const wishlistCheck = await pool.query(
            'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2::integer',
            [id, userId]
        );

        if (wishlistCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found or unauthorized' });
        }

        // Check if property is already in the wishlist
        const duplicateCheck = await pool.query(
            'SELECT * FROM wishlist_properties WHERE wishlist_id = $1 AND property_id = $2::integer',
            [id, propertyId]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Property already in this wishlist' });
        }

        // Add property to wishlist
        await pool.query(
            'INSERT INTO wishlist_properties (wishlist_id, property_id) VALUES ($1, $2::integer)',
            [id, propertyId]
        );

        res.json({ success: true, message: 'Property added to wishlist' });
    } catch (error) {
        console.error('Error adding property to wishlist:', error);
        res.status(500).json({ error: 'Failed to add property to wishlist' });
    }
});

// Remove a property from a wishlist
router.delete('/:id/properties/:propertyId', authenticate, async (req, res) => {
    try {
        const { id, propertyId } = req.params;
        const userId = req.user.id;

        // Verify wishlist ownership
        const wishlistCheck = await pool.query(
            'SELECT id FROM wishlists WHERE id = $1 AND user_id = $2::integer',
            [id, userId]
        );

        if (wishlistCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found or unauthorized' });
        }

        await pool.query(
            'DELETE FROM wishlist_properties WHERE wishlist_id = $1 AND property_id = $2::integer',
            [id, propertyId]
        );

        res.json({ success: true, message: 'Property removed from wishlist' });
    } catch (error) {
        console.error('Error removing property from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove property from wishlist' });
    }
});

// Delete a wishlist
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM wishlists WHERE id = $1 AND user_id = $2::integer RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found or unauthorized' });
        }

        res.json({ success: true, message: 'Wishlist deleted successfully' });
    } catch (error) {
        console.error('Error deleting wishlist:', error);
        res.status(500).json({ error: 'Failed to delete wishlist' });
    }
});

export default router;
