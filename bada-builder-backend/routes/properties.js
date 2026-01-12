import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages } from '../services/cloudinary.js';

const router = express.Router();

// Get all properties (public, with optional filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, location, minPrice, maxPrice, userType, status = 'active', limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM properties WHERE status = $1';
    const params = [status];
    let paramCount = 2;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }
    if (location) {
      query += ` AND location ILIKE $${paramCount++}`;
      params.push(`%${location}%`);
    }
    if (userType) {
      query += ` AND user_type = $${paramCount++}`;
      params.push(userType);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ properties: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get single property
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
       FROM properties p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Create property (requires auth and subscription)
router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    // Check subscription
    const userResult = await pool.query(
      'SELECT is_subscribed, subscription_expiry FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const isSubscribed = user.is_subscribed && 
      (user.subscription_expiry === null || new Date(user.subscription_expiry) > new Date());

    if (!isSubscribed) {
      return res.status(403).json({ error: 'Subscription required to post properties' });
    }

    const {
      title,
      type,
      location,
      price,
      bhk,
      description,
      facilities,
      company_name,
      project_name,
      total_units,
      completion_date,
      rera_number,
    } = req.body;

    // Upload images
    let imageUrl = null;
    let images = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length === 1) {
        imageUrl = await uploadImage(req.files[0].buffer, 'properties');
        images = [imageUrl];
      } else {
        const buffers = req.files.map(file => file.buffer);
        images = await uploadMultipleImages(buffers, 'properties');
        imageUrl = images[0];
      }
    }

    // Calculate subscription expiry (copy from user's subscription)
    const subscriptionExpiry = user.subscription_expiry;

    const result = await pool.query(
      `INSERT INTO properties (
        title, type, location, price, bhk, description, facilities, 
        image_url, images, user_id, user_type, company_name, project_name, 
        total_units, completion_date, rera_number, subscription_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        title,
        type,
        location,
        price,
        bhk || null,
        description,
        Array.isArray(facilities) ? facilities : (facilities ? [facilities] : []),
        imageUrl,
        images,
        req.user.id,
        req.user.user_type,
        company_name || null,
        project_name || null,
        total_units || null,
        completion_date || null,
        rera_number || null,
        subscriptionExpiry,
      ]
    );

    res.status(201).json({ property: result.rows[0] });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update property (only within 3 days)
router.put('/:id', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    // Check if property exists and belongs to user
    const propertyResult = await pool.query(
      'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found or unauthorized' });
    }

    const property = propertyResult.rows[0];

    // Check if within 3 days
    const createdAt = new Date(property.created_at);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    if (createdAt < threeDaysAgo) {
      return res.status(403).json({ error: 'Property can only be edited within 3 days of creation' });
    }

    const {
      title,
      type,
      location,
      price,
      bhk,
      description,
      facilities,
      company_name,
      project_name,
      total_units,
      completion_date,
      rera_number,
    } = req.body;

    // Handle image updates
    let imageUrl = property.image_url;
    let images = property.images || [];

    if (req.files && req.files.length > 0) {
      if (req.files.length === 1) {
        imageUrl = await uploadImage(req.files[0].buffer, 'properties');
        images = [imageUrl];
      } else {
        const buffers = req.files.map(file => file.buffer);
        images = await uploadMultipleImages(buffers, 'properties');
        imageUrl = images[0];
      }
    }

    const result = await pool.query(
      `UPDATE properties SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        location = COALESCE($3, location),
        price = COALESCE($4, price),
        bhk = COALESCE($5, bhk),
        description = COALESCE($6, description),
        facilities = COALESCE($7, facilities),
        image_url = $8,
        images = $9,
        company_name = COALESCE($10, company_name),
        project_name = COALESCE($11, project_name),
        total_units = COALESCE($12, total_units),
        completion_date = COALESCE($13, completion_date),
        rera_number = COALESCE($14, rera_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 AND user_id = $16
      RETURNING *`,
      [
        title,
        type,
        location,
        price,
        bhk,
        description,
        Array.isArray(facilities) ? facilities : (facilities ? [facilities] : null),
        imageUrl,
        images,
        company_name,
        project_name,
        total_units,
        completion_date,
        rera_number,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Delete property
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found or unauthorized' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Get user's properties
router.get('/user/my-properties', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ properties: result.rows });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

export default router;
