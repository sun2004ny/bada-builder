import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../services/cloudinary.js';

const router = express.Router();

// Upload profile photo
router.post('/profile-photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = await uploadImage(req.file.buffer, 'profile-photos');

    // Update user profile
    const result = await pool.query(
      'UPDATE users SET profile_photo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING profile_photo',
      [imageUrl, req.user.id]
    );

    res.json({ profilePhoto: result.rows[0].profile_photo });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get properties count
    const propertiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM properties WHERE user_id = $1',
      [userId]
    );

    // Get bookings count
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE user_id = $1',
      [userId]
    );

    // Get live grouping count (Units booked in Live Groups)
    const groupingResult = await pool.query(
      'SELECT COUNT(*) as count FROM live_group_units WHERE booked_by = $1',
      [userId]
    );

    // Get complaints count
    const complaintsResult = await pool.query(
      'SELECT COUNT(*) as count FROM complaints WHERE user_id = $1',
      [userId]
    );

    // Get favorites count
    const favoritesResult = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [userId]
    );

    // Get short stay properties count
    const shortStayResult = await pool.query(
      'SELECT COUNT(*) as count FROM short_stay_properties WHERE user_id = $1',
      [userId]
    );

    const realEstateCount = parseInt(propertiesResult.rows[0].count) || 0;
    const shortStayCount = parseInt(shortStayResult.rows[0].count) || 0;

    res.json({
      properties: realEstateCount + shortStayCount, // Total of both types
      bookings: parseInt(bookingsResult.rows[0].count) || 0,
      liveGroupings: parseInt(groupingResult.rows[0].count) || 0,
      complaints: parseInt(complaintsResult.rows[0].count) || 0,
      favorites: parseInt(favoritesResult.rows[0].count) || 0,
      // Placeholders for non-Postgres data
      investments: 0,
      shortStayBookings: 0, // This could be queried if there's a shorts stay booking table, but keeping 0 for now
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
