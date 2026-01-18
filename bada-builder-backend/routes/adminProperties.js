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
 * @route   GET /api/admin-properties/stats
 * @desc    Get property management summary stats
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE status = 'active')::int as active,
                COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
                COUNT(*) FILTER (WHERE is_featured = TRUE)::int as featured
            FROM properties
        `);
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   GET /api/admin-properties
 * @desc    Get all properties with filtering and real-time support
 * @access  Private (Admin)
 */
router.get('/', authenticate, isAdmin, async (req, res) => {
    const { source, status, search } = req.query;
    try {
        let query = 'SELECT * FROM properties WHERE 1=1';
        const params = [];

        if (source && source !== 'all' && source !== 'All') {
            params.push(source);
            query += ` AND property_source = $${params.length}`;
        }

        if (status && status !== 'all') {
            params.push(status.toLowerCase());
            query += ` AND status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR location ILIKE $${params.length} OR company_name ILIKE $${params.length})`;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   POST /api/admin-properties
 * @desc    Add a new property of any type
 * @access  Private (Admin)
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
    const {
        title, type, location, price, description, facilities, images,
        property_source, status, metadata, is_featured, rera_number, bhk, area
    } = req.body;

    // Map property_source to user_type for public filtering compatibility
    let mappedUserType = 'admin';
    if (property_source === 'Individual') mappedUserType = 'individual';
    else if (property_source === 'Developer') mappedUserType = 'developer';

    try {
        const result = await pool.query(
            `INSERT INTO properties (
                title, type, location, price, description, facilities, images, image_url,
                property_source, status, metadata, is_featured, rera_number, bhk, 
                area, user_id, user_type, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
            RETURNING *`,
            [
                title, type, location, price, description, facilities || [], images || [], images?.[0] || null,
                property_source || 'Individual', status || 'active', metadata || {}, is_featured || false,
                rera_number, bhk, area, req.user.id, mappedUserType
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   PUT /api/admin-properties/:id
 * @desc    Update a property
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        title, type, location, price, description, facilities, images,
        property_source, status, metadata, is_featured, rera_number, bhk, area
    } = req.body;

    // Map property_source to user_type for public filtering compatibility
    let mappedUserType = 'admin';
    if (property_source === 'Individual') mappedUserType = 'individual';
    else if (property_source === 'Developer') mappedUserType = 'developer';

    try {
        const result = await pool.query(
            `UPDATE properties SET 
                title = $1, type = $2, location = $3, price = $4, description = $5, 
                facilities = $6, images = $7, image_url = $8, property_source = $9, 
                status = $10, metadata = $11, is_featured = $12, rera_number = $13, 
                bhk = $14, area = $15, user_type = $16, updated_at = NOW()
            WHERE id = $17 RETURNING *`,
            [
                title, type, location, price, description, facilities || [], images || [], images?.[0] || null,
                property_source, status, metadata || {}, is_featured || false, rera_number, bhk, area, mappedUserType, id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   PATCH /api/admin-properties/:id/status
 * @desc    Toggle status or featured flag
 * @access  Private (Admin)
 */
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, is_featured } = req.body;

    try {
        let query = 'UPDATE properties SET updated_at = NOW()';
        const params = [];
        let paramCount = 1;

        if (status !== undefined) {
            query += `, status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (is_featured !== undefined) {
            query += `, is_featured = $${paramCount}`;
            params.push(is_featured);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error patching property:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   DELETE /api/admin-properties/:id
 * @desc    Delete a property
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.json({ message: 'Property deleted successfully', id });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
