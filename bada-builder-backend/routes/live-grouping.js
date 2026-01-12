import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages } from '../services/cloudinary.js';

const router = express.Router();

// Get all live grouping properties
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM live_grouping_properties WHERE status != $1 ORDER BY created_at DESC',
      ['Closed']
    );

    res.json({ properties: result.rows });
  } catch (error) {
    console.error('Get live grouping properties error:', error);
    res.status(500).json({ error: 'Failed to fetch live grouping properties' });
  }
});

// Get single live grouping property
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM live_grouping_properties WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Get live grouping property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Create live grouping property (admin/authenticated)
router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      developer,
      location,
      originalPrice,
      groupPrice,
      discount,
      savings,
      type,
      totalSlots,
      minBuyers,
      benefits,
      area,
      possession,
      reraNumber,
      facilities,
      description,
      advantages,
      groupDetails,
    } = req.body;

    // Upload images
    let image = null;
    let images = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length === 1) {
        image = await uploadImage(req.files[0].buffer, 'live-grouping');
        images = [image];
      } else {
        const buffers = req.files.map(file => file.buffer);
        images = await uploadMultipleImages(buffers, 'live-grouping');
        image = images[0];
      }
    }

    const result = await pool.query(
      `INSERT INTO live_grouping_properties (
        title, developer, location, original_price, group_price, discount, savings,
        type, total_slots, filled_slots, min_buyers, benefits, status, area,
        possession, rera_number, facilities, description, advantages,
        group_details, images, image, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *`,
      [
        title,
        developer,
        location,
        originalPrice,
        groupPrice,
        discount || null,
        savings || null,
        type,
        parseInt(totalSlots) || 0,
        0, // filled_slots starts at 0
        parseInt(minBuyers) || 0,
        Array.isArray(benefits) ? benefits : (benefits ? [benefits] : []),
        'Active',
        area || null,
        possession || null,
        reraNumber || null,
        Array.isArray(facilities) ? facilities : (facilities ? [facilities] : []),
        description || null,
        advantages ? JSON.stringify(advantages) : null,
        groupDetails ? JSON.stringify(groupDetails) : null,
        images,
        image,
        req.user.id,
      ]
    );

    res.status(201).json({ property: result.rows[0] });
  } catch (error) {
    console.error('Create live grouping property error:', error);
    res.status(500).json({ error: 'Failed to create live grouping property' });
  }
});

// Update live grouping property
router.put('/:id', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    const propertyResult = await pool.query(
      'SELECT * FROM live_grouping_properties WHERE id = $1',
      [req.params.id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyResult.rows[0];

    // Check if user is creator or admin (you can add admin check)
    if (property.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateFields = req.body;
    let image = property.image;
    let images = property.images || [];

    // Handle image updates
    if (req.files && req.files.length > 0) {
      if (req.files.length === 1) {
        image = await uploadImage(req.files[0].buffer, 'live-grouping');
        images = [image];
      } else {
        const buffers = req.files.map(file => file.buffer);
        images = await uploadMultipleImages(buffers, 'live-grouping');
        image = images[0];
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'developer', 'location', 'original_price', 'group_price',
      'discount', 'savings', 'type', 'total_slots', 'min_buyers',
      'benefits', 'status', 'area', 'possession', 'rera_number',
      'facilities', 'description', 'advantages', 'group_details',
    ];

    allowedFields.forEach(field => {
      if (updateFields[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        if (field === 'advantages' || field === 'group_details') {
          values.push(JSON.stringify(updateFields[field]));
        } else if (field === 'benefits' || field === 'facilities') {
          values.push(Array.isArray(updateFields[field]) ? updateFields[field] : [updateFields[field]]);
        } else {
          values.push(updateFields[field]);
        }
      }
    });

    updates.push(`images = $${paramCount++}`);
    values.push(images);
    updates.push(`image = $${paramCount++}`);
    values.push(image);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE live_grouping_properties SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Update live grouping property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Update filled slots (when someone joins)
router.patch('/:id/join', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE live_grouping_properties 
       SET filled_slots = filled_slots + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = result.rows[0];

    // Update status if slots are filled
    if (property.filled_slots >= property.total_slots) {
      await pool.query(
        'UPDATE live_grouping_properties SET status = $1 WHERE id = $2',
        ['Closed', req.params.id]
      );
      property.status = 'Closed';
    } else if (property.filled_slots >= property.min_buyers && property.status === 'Active') {
      await pool.query(
        'UPDATE live_grouping_properties SET status = $1 WHERE id = $2',
        ['Closing Soon', req.params.id]
      );
      property.status = 'Closing Soon';
    }

    res.json({ property });
  } catch (error) {
    console.error('Join live grouping error:', error);
    res.status(500).json({ error: 'Failed to join live grouping' });
  }
});

export default router;
