import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';

const router = express.Router();

// Create lead
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('requirement_type').notEmpty(),
    body('location').trim().notEmpty(),
    body('phone').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, requirement_type, location, phone } = req.body;

      const result = await pool.query(
        'INSERT INTO leads (name, requirement_type, location, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, requirement_type, location, phone]
      );

      res.status(201).json({ lead: result.rows[0] });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
);

// Get all leads (admin only - add admin check if needed)
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await pool.query(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );

    res.json({ leads: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

export default router;
