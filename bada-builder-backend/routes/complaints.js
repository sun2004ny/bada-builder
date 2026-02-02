import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadMultipleImages } from '../services/cloudinary.js';
import { sendComplaintRegistrationEmail, sendAdminComplaintNotification } from '../services/complaintEmailService.js'; // SMTP for complaint confirmations

const router = express.Router();

// Create complaint
router.post(
  '/',
  authenticate,
  upload.array('media', 20),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().notEmpty(),
    body('complaint_type').notEmpty(),
    body('location').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        phone,
        complaint_type,
        location,
        description,
      } = req.body;

      // Upload media files if any
      let mediaUrls = [];
      if (req.files && req.files.length > 0) {
        const buffers = req.files.map(file => file.buffer);
        mediaUrls = await uploadMultipleImages(buffers, 'complaints');
      }

      const result = await pool.query(
        `INSERT INTO complaints (
          user_id, name, email, phone, complaint_type, location, 
          description, media_urls, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          req.user?.id || null,
          name,
          email,
          phone,
          complaint_type,
          location,
          description,
          mediaUrls,
          'Submitted',
        ]
      );

      const complaint = result.rows[0];

      // Send complaint registration confirmation email (non-blocking)
      sendComplaintRegistrationEmail({
        complaint_id: complaint.id,
        user_name: complaint.name,
        user_email: complaint.email,
        user_phone: complaint.phone,
        complaint_type: complaint.complaint_type,
        location: complaint.location,
        description: complaint.description,
        created_date: complaint.created_at,
        status: complaint.status
      }).catch(err => {
        console.error('❌ [Complaint] Email sending failed (non-critical):', err.message);
      });

      // Send admin notification
      sendAdminComplaintNotification({
        complaint_id: complaint.id,
        user_name: complaint.name,
        user_email: complaint.email,
        user_phone: complaint.phone,
        complaint_type: complaint.complaint_type,
        location: complaint.location,
        description: complaint.description,
        created_date: complaint.created_at,
        status: complaint.status
      }).catch(err => {
        console.error('❌ [Complaint] Admin email sending failed:', err.message);
      });

      res.status(201).json({ complaint });
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ error: 'Failed to create complaint' });
    }
  }
);

// Get user's complaints
router.get('/my-complaints', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ complaints: result.rows });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get single complaint
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM complaints WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Get all complaints (admin - add admin check if needed)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM complaints';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` WHERE status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ complaints: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Update complaint status (admin)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE complaints SET
        status = $1,
        admin_notes = COALESCE($2, admin_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [status, admin_notes || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

export default router;
