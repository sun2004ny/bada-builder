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
    const { type, location, minPrice, maxPrice, userType, user_type, status = 'active', limit = 50, offset = 0 } = req.query;

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

    // Support both camelCase and snake_case for user type
    const targetUserType = userType || user_type;
    if (targetUserType) {
      query += ` AND user_type = $${paramCount++}`;
      params.push(targetUserType);
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

// Create property (requires auth and credits)
router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title, type, location, price, bhk, description, facilities,
      image_url, images: bodyImages, company_name, project_name,
      total_units, completion_date, rera_number, scheme_type,
      residential_options, commercial_options, base_price,
      max_price, project_location, amenities, owner_name,
      possession_status, rera_status, project_stats, contact_phone,
      user_type, credit_used
    } = req.body;

    await client.query('BEGIN');

    // 1. Determine credit and property type
    // The user MUST provide credit_used. Default to individual if not provided but it should be explicit.
    const requestedCredit = credit_used || 'individual';
    const propertyTypeStrict = requestedCredit; // individual -> individual, developer -> developer

    // 2. Fetch the user's credits with FOR UPDATE lock
    const userResult = await client.query(
      `SELECT individual_credits, developer_credits, user_type FROM users WHERE id = $1 FOR UPDATE`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userResult.rows[0];
    const creditField = requestedCredit === 'developer' ? 'developer_credits' : 'individual_credits';
    const availableCredits = userData[creditField];

    if (!availableCredits || availableCredits <= 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: `Insufficient credits. You must use ${requestedCredit === 'developer' ? 'Developer' : 'Individual'} Credit to post a ${requestedCredit === 'developer' ? 'Developer' : 'Individual'} property.`
      });
    }

    // 3. Process images
    let finalImageUrl = image_url;
    let finalImages = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length === 1) {
        finalImageUrl = await uploadImage(req.files[0].buffer, 'properties');
        finalImages = [finalImageUrl];
      } else {
        const buffers = req.files.map(file => file.buffer);
        finalImages = await uploadMultipleImages(buffers, 'properties');
        finalImageUrl = finalImages[0];
      }
    } else {
      if (bodyImages) {
        if (Array.isArray(bodyImages)) finalImages = bodyImages;
        else {
          try {
            const parsed = JSON.parse(bodyImages);
            finalImages = Array.isArray(parsed) ? parsed : [bodyImages];
          } catch (e) {
            finalImages = [bodyImages];
          }
        }
      }
      if (!finalImageUrl && finalImages.length > 0) finalImageUrl = finalImages[0];
    }

    // 4. Insert the property with strict types
    const finalUserType = user_type || userData.user_type;
    const propertySource = requestedCredit === 'developer' ? 'Developer' : 'Individual';

    const propertyResult = await client.query(
      `INSERT INTO properties (
        title, type, location, price, bhk, description, facilities, 
        image_url, images, user_id, user_type, property_source, 
        credit_used, property_type_strict,
        company_name, project_name, total_units, completion_date, rera_number,
        scheme_type, residential_options, commercial_options, base_price,
        max_price, project_location, amenities, owner_name, possession_status,
        rera_status, project_stats, contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
      RETURNING *`,
      [
        title, type, location, price, bhk || null, description,
        Array.isArray(facilities) ? facilities : (facilities ? [facilities] : []),
        finalImageUrl, finalImages, req.user.id, finalUserType, propertySource,
        requestedCredit, propertyTypeStrict,
        company_name || null, project_name || null, total_units || null,
        completion_date || null, rera_number || null,
        scheme_type || null,
        Array.isArray(residential_options) ? residential_options : (residential_options ? [residential_options] : []),
        Array.isArray(commercial_options) ? commercial_options : (commercial_options ? [commercial_options] : []),
        base_price || null, max_price || null, project_location || null,
        Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []),
        owner_name || null, possession_status || null, rera_status || null,
        typeof project_stats === 'string' ? project_stats : JSON.stringify(project_stats || null),
        contact_phone || null
      ]
    );

    // 5. Deduct credit
    await client.query(
      `UPDATE users SET ${creditField} = ${creditField} - 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.user.id]
    );

    // 6. Log usage
    await client.query(
      "INSERT INTO subscription_usage (user_id, action, metadata) VALUES ($1, $2, $3)",
      [req.user.id, 'property_posted', JSON.stringify({ credit_used: requestedCredit, property_id: propertyResult.rows[0].id })]
    );

    await client.query('COMMIT');
    res.status(201).json({
      property: propertyResult.rows[0],
      credits: {
        type: requestedCredit,
        remaining: availableCredits - 1
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property', details: error.message });
  } finally {
    client.release();
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
      // New fields
      scheme_type,
      residential_options,
      commercial_options,
      base_price,
      max_price,
      project_location,
      amenities,
      owner_name,
      possession_status,
      rera_status,
      project_stats,
      contact_phone,
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
        scheme_type = COALESCE($15, scheme_type),
        residential_options = COALESCE($16, residential_options),
        commercial_options = COALESCE($17, commercial_options),
        base_price = COALESCE($18, base_price),
        max_price = COALESCE($19, max_price),
        project_location = COALESCE($20, project_location),
        amenities = COALESCE($21, amenities),
        owner_name = COALESCE($22, owner_name),
        possession_status = COALESCE($23, possession_status),
        rera_status = COALESCE($24, rera_status),
        project_stats = COALESCE($25, project_stats),
        contact_phone = COALESCE($26, contact_phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $27 AND user_id = $28
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
        scheme_type,
        Array.isArray(residential_options) ? residential_options : (residential_options ? [residential_options] : null),
        Array.isArray(commercial_options) ? commercial_options : (commercial_options ? [commercial_options] : null),
        base_price,
        max_price,
        project_location,
        Array.isArray(amenities) ? amenities : (amenities ? [amenities] : null),
        owner_name,
        possession_status,
        rera_status,
        typeof project_stats === 'string' ? project_stats : (project_stats ? JSON.stringify(project_stats) : null),
        contact_phone,
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
