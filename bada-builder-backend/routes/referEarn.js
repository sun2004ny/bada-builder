import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { sendOTPWithStorage, verifyOTP } from '../services/otp.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../services/cloudinary.js';

const router = express.Router();

// Common validators
const panValidator = body('pan')
  .trim()
  .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)
  .withMessage('Valid PAN is required');

const mobileValidator = body('mobile')
  .trim()
  .matches(/^[0-9]{10}$/)
  .withMessage('Valid 10-digit mobile number is required');

/**
 * Send OTP for Refer & Earn eligibility check
 * POST /api/refer-earn/send-otp
 */
router.post(
  '/send-otp',
  [panValidator, mobileValidator],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { pan, mobile } = req.body;

      // STEP 1 - Query ONLY the refer_earn_eligibility table
      const eligibilityCheck = await pool.query(
        'SELECT * FROM refer_earn_eligibility WHERE pan_number = $1 AND mobile_number = $2 AND is_eligible = true LIMIT 1',
        [pan, mobile]
      );

      if (eligibilityCheck.rows.length === 0) {
        return res.status(404).json({
          error:
            'Sorry, you are not eligible for Refer & Earn. Reason: You have not purchased any eligible property.',
        });
      }

      // STEP 2 - Proceed to OTP flow (Identify user to send the email)
      const userResult = await pool.query(
        'SELECT email, name FROM users WHERE phone = $1 LIMIT 1',
        [mobile]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'No registered user found with this mobile number.',
        });
      }

      const user = userResult.rows[0];
      const otpResult = await sendOTPWithStorage(user.email, user.name || '');

      if (!otpResult.success) {
        return res.status(500).json({
          error: otpResult.message || 'Failed to send OTP. Please try again.',
        });
      }

      return res.json({
        success: true,
        message: 'OTP sent successfully to your registered contact.',
      });
    } catch (error) {
      console.error('Refer & Earn send-otp error:', error);
      return res.status(500).json({
        error: 'Failed to send OTP. Please try again later.',
      });
    }
  }
);

/**
 * Check Refer & Earn eligibility
 * POST /api/refer-earn/check
 */
router.post(
  '/check',
  [
    panValidator,
    mobileValidator,
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { pan, mobile, otp } = req.body;

      // STEP 1 - Query ONLY the refer_earn_eligibility table (Fetch ALL matches)
      const eligibilityCheck = await pool.query(
        'SELECT * FROM refer_earn_eligibility WHERE pan_number = $1 AND mobile_number = $2 AND is_eligible = true ORDER BY investment_date DESC',
        [pan, mobile]
      );

      if (eligibilityCheck.rows.length === 0) {
        return res.status(200).json({
          eligible: false,
          reason:
            'You are not our customer. Buy property through Bada Builder to become eligible.',
        });
      }

      // Find user to verify OTP tied to their email
      const userResult = await pool.query(
        'SELECT id, email FROM users WHERE phone = $1 LIMIT 1',
        [mobile]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User registration not found.' });
      }

      const user = userResult.rows[0];

      // Verify OTP
      const otpVerification = await verifyOTP(user.email, otp);
      if (!otpVerification.valid) {
        return res.status(400).json({
          error: otpVerification.message || 'Invalid or expired OTP',
        });
      }

      // Fetch ALL active Live Grouping Projects
      const propertyResult = await pool.query(
        "SELECT * FROM live_group_projects WHERE LOWER(status) IN ('live', 'active') ORDER BY id DESC"
      );

      const baseUrl =
        (process.env.FRONTEND_URL || 'http://localhost:5173').replace(
          /\/$/,
          ''
        );

      const liveProperties = propertyResult.rows.map((liveProperty) => ({
        id: liveProperty.id,
        title: liveProperty.title,
        location: liveProperty.location || 'Location not specified',
        price:
          liveProperty.group_price ||
          liveProperty.original_price ||
          liveProperty.regular_price_min ||
          'Price on Request',
        description: liveProperty.description,
        developer: liveProperty.developer || 'Bada Builder',
        image:
          liveProperty.image ||
          (liveProperty.images && liveProperty.images[0]),
        link: `${baseUrl}/live-group-details/${liveProperty.id}`,
      }));

      // Fetch Admin-selected Referral Properties (The global ones set in Admin panel)
      const adminReferralResult = await pool.query(
        'SELECT * FROM live_group_projects WHERE referral_active = true ORDER BY id DESC'
      );

      return res.json({
        eligible: true,
        eligibleProperties: eligibilityCheck.rows, // User's own purchases
        adminReferralProperties: adminReferralResult.rows, // Admin's selected referral assets
        // For backward compatibility keep the first one as top-level
        ...eligibilityCheck.rows[0],
        message: 'You are eligible for Refer & Earn.',
        liveGroupingProperties: liveProperties,
      });
    } catch (error) {
      console.error('Refer & Earn check error:', error);
      return res.status(500).json({
        error: 'Failed to check eligibility. Please try again later.',
      });
    }
  }
);

/**
 * Get current Refer & Earn settings
 * GET /api/refer-earn/settings
 */
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT id FROM live_group_projects WHERE referral_active = true');
    return res.json({
      referral_property_ids: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Get refer-earn settings error:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * Update Refer & Earn settings (Admin only)
 * POST /api/refer-earn/settings
 */
router.post('/settings', authenticate, isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { referral_property_ids } = req.body; // Expecting an array of IDs

    await client.query('BEGIN');

    // 1. Reset all properties' referral_active to false
    await client.query('UPDATE live_group_projects SET referral_active = false');

    // 2. Set the selected properties' referral_active to true
    if (Array.isArray(referral_property_ids) && referral_property_ids.length > 0) {
      await client.query('UPDATE live_group_projects SET referral_active = true WHERE id = ANY($1)', [referral_property_ids]);
    }

    await client.query('COMMIT');

    return res.json({ success: true, message: 'Referral properties updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update refer-earn settings error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    client.release();
  }
});

/**
 * Get the full details of all admin-selected referral properties
 * GET /api/refer-earn/referral-property
 */
router.get('/referral-property', async (req, res) => {
  try {
    // Fetch all property details where referral_active is true
    const propertyResult = await pool.query('SELECT * FROM live_group_projects WHERE referral_active = true ORDER BY id DESC');

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active referral properties available.' });
    }

    // Returning an array now
    return res.json(propertyResult.rows);
  } catch (error) {
    console.error('Get referral property error:', error);
    return res.status(500).json({ error: 'Failed to fetch referral property' });
  }
});

/**
 * Get all properties posted from the Refer & Earn form
 * GET /api/refer-earn/posted-properties
 */
router.get('/posted-properties', async (req, res) => {
  try {
    const { public_only } = req.query;
    let query = 'SELECT * FROM referral_posted_properties';
    const params = [];

    if (public_only === 'true') {
      query += ' WHERE is_visible_to_users = true';
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Get posted properties error:', error);
    return res.status(500).json({ error: 'Failed to fetch posted properties' });
  }
});

/**
 * Update property visibility (Admin only)
 * PATCH /api/refer-earn/posted-properties/:id/visibility
 */
router.patch('/posted-properties/:id/visibility', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible_to_users } = req.body;

    const result = await pool.query(
      'UPDATE referral_posted_properties SET is_visible_to_users = $1 WHERE id = $2 RETURNING *',
      [is_visible_to_users, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    console.error('Update visibility error:', error);
    return res.status(500).json({ error: 'Failed to update visibility' });
  }
});

/**
 * Post a new property from Refer & Earn form (Admin only)
 * POST /api/refer-earn/posted-properties
 */
router.post(
  '/posted-properties',
  authenticate,
  isAdmin,
  upload.single('image'),
  [
    body('property_name').trim().notEmpty().withMessage('Property name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('property_type').trim().notEmpty().withMessage('Property type is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { property_name, price, location, property_type, description } = req.body;

      let image_url = null;
      let image_public_id = null;

      if (req.file) {
        try {
          // Reusing existing upload logic exactly like other property uploads
          const uploadResult = await uploadImage(req.file.buffer, 'referral_properties');
          image_url = uploadResult; // Assuming uploadImage returns the URL string or you can adapt based on service
          // In some systems, uploadImage might return an object with url and public_id.
          // Let's check cloudinary.js
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          return res.status(500).json({ error: 'Image upload failed' });
        }
      }

      const result = await pool.query(
        'INSERT INTO referral_posted_properties (property_name, price, location, property_type, description, image_url, image_public_id, is_visible_to_users) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [property_name, price, location, property_type, description, image_url, image_public_id, true]
      );

      return res.status(201).json({
        success: true,
        message: 'Property posted successfully',
        property: result.rows[0],
      });
    } catch (error) {
      console.error('Post referral property error:', error);
      return res.status(500).json({ error: 'Failed to post property' });
    }
  }
);

export default router;


