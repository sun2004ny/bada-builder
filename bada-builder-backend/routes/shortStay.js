import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadMultipleImages } from '../services/cloudinary.js';

const router = express.Router();

// --- 1. Create New Short Stay Listing ---
router.post('/', authenticate, upload.array('images', 30), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title, description, category,
      location, pricing, rules, policies,
      amenities, specific_details
    } = req.body;

    // Handle Image Uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      imageUrls = await uploadMultipleImages(buffers, 'short_stay');
    }

    // Insert into DB
    const result = await client.query(
      `INSERT INTO short_stay_properties (
        user_id, title, description, category,
        location, pricing, rules, policies,
        amenities, specific_details, images,
        cover_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        req.user.id,
        title,
        description,
        category,
        typeof location === 'string' ? JSON.parse(location) : location,
        typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
        typeof rules === 'string' ? JSON.parse(rules) : rules,
        typeof policies === 'string' ? JSON.parse(policies) : policies,
        typeof amenities === 'string' ? JSON.parse(amenities) : amenities, // Should be array of strings
        typeof specific_details === 'string' ? JSON.parse(specific_details) : specific_details,
        imageUrls,
        imageUrls.length > 0 ? imageUrls[0] : null // Set first image as cover by default
      ]
    );

    res.status(201).json({ 
      message: 'Property listed successfully', 
      property: result.rows[0] 
    });

  } catch (error) {
    console.error('Create Short Stay Error:', error);
    res.status(500).json({ error: 'Failed to list property' });
  } finally {
    client.release();
  }
});

// --- 2. Get All Listings (Search & Filters) ---
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      location, checkIn, checkOut, guests, 
      type, minPrice, maxPrice, limit = 50, offset = 0 
    } = req.query;

    let query = `
      SELECT p.*,
      EXISTS(SELECT 1 FROM short_stay_favorites f WHERE f.property_id = p.id AND f.user_id = $1) as is_favorite
      FROM short_stay_properties p
      WHERE status = 'active'
    `;
    const params = [req.user ? req.user.id : null];
    let paramCount = 2;

    // --- Filters ---
    if (type) {
      query += ` AND category = $${paramCount++}`;
      params.push(type);
    }
    
    if (location) {
      // Search in city, state, or address
      query += ` AND (
        (location->>'city') ILIKE $${paramCount} OR 
        (location->>'state') ILIKE $${paramCount} OR
        (location->>'address') ILIKE $${paramCount}
      )`;
      params.push(`%${location}%`);
      paramCount++;
    }

    // Basic Price Filter (using perNight)
    if (minPrice) {
      query += ` AND (pricing->>'perNight')::numeric >= $${paramCount++}`;
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND (pricing->>'perNight')::numeric <= $${paramCount++}`;
      params.push(maxPrice);
    }
    
    // Guest Capacity Filter
    if (guests) {
      // Assuming 'pricing' JSON has 'maxGuests' or checking specific details for capacity
      // For now, let's look in specific_details OR standard capacity field if we had one.
      // Let's assume specific_details has 'maxGuests' for all types or we query it loosely.
      // A better approach is to ensure maxGuests is in specific_details.
      query += ` AND (specific_details->>'maxGuests')::int >= $${paramCount++}`;
      params.push(guests);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    res.json({ 
      properties: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Fetch Short Stay Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// --- 3. Get Single Property Details ---
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
       u.name as host_name, u.email as host_email, u.phone as host_phone, u.profile_photo as host_photo,
       EXISTS(SELECT 1 FROM short_stay_favorites f WHERE f.property_id = p.id AND f.user_id = $2) as is_favorite
       FROM short_stay_properties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id, req.user ? req.user.id : null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property: result.rows[0] });

  } catch (error) {
    console.error('Fetch Property Details Error:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// --- 4. Get My Listings (Owner) ---
router.get('/user/my-listings', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM short_stay_properties WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ properties: result.rows });
  } catch (error) {
    console.error('Fetch My Listings Error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// --- 5. Validating Owner Middleware ---
const validateOwner = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM short_stay_properties WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (String(result.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// --- 6. Update Property (Owner Only) ---
router.put('/:id', authenticate, validateOwner, upload.array('images', 30), async (req, res) => {
  const client = await pool.connect();
  try {
     const {
      title, description, category,
      location, pricing, rules, policies,
      amenities, specific_details, existing_images
    } = req.body;

    let finalImages = [];
    if (existing_images) {
        try {
            const parsed = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
            finalImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            console.error('Error parsing existing_images:', e);
            finalImages = [];
        }
    }
    
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      const newUrls = await uploadMultipleImages(buffers, 'short_stay');
      finalImages = [...finalImages, ...newUrls];
    }

    const result = await client.query(
      `UPDATE short_stay_properties SET 
        title = $1, description = $2, category = $3,
        location = $4, pricing = $5, rules = $6, policies = $7,
        amenities = $8, specific_details = $9, images = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [
        title, description, category,
        typeof location === 'string' ? JSON.parse(location) : location,
        typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
        typeof rules === 'string' ? JSON.parse(rules) : rules,
        typeof policies === 'string' ? JSON.parse(policies) : policies,
        typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
        typeof specific_details === 'string' ? JSON.parse(specific_details) : specific_details,
        finalImages,
        req.params.id
      ]
    );

    res.json({ message: 'Property updated', property: result.rows[0] });

  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  } finally {
    client.release();
  }
});

// --- 7. Delete Property (Owner Only) ---
router.delete('/:id', authenticate, validateOwner, async (req, res) => {
  try {
    await pool.query('DELETE FROM short_stay_properties WHERE id = $1', [req.params.id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete Property Error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// --- 8. Toggle Favorite ---
router.post('/favorites/toggle', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    const check = await pool.query(
      'SELECT id FROM short_stay_favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.id, propertyId]
    );

    if (check.rows.length > 0) {
      await pool.query(
        'DELETE FROM short_stay_favorites WHERE user_id = $1 AND property_id = $2',
        [req.user.id, propertyId]
      );
      res.json({ isFavorite: false });
    } else {
      await pool.query(
        'INSERT INTO short_stay_favorites (user_id, property_id) VALUES ($1, $2)',
        [req.user.id, propertyId]
      );
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Favorite Toggle Error:', error);
    res.status(500).json({ error: 'Action failed' });
  }
});

// --- 9. Get User Favorites ---
router.get('/user/favorites', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM short_stay_properties p
       JOIN short_stay_favorites f ON p.id = f.property_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Fetch Favorites Error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

export default router;
