import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { sendOTPWithStorage, verifyOTP } from '../services/otp.js';

const router = express.Router();

/**
 * Send OTP for registration
 * POST /api/otp/send-otp
 */
router.post(
  '/send-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const { email, name } = req.body;

      // Check if user already exists and is verified
      const existingUser = await pool.query(
        'SELECT id, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0 && existingUser.rows[0].is_verified) {
        return res.status(400).json({ 
          error: 'User already exists with this email and is verified. Please login.' 
        });
      }

      // Send OTP (email is sent first, then OTP is stored)
      const result = await sendOTPWithStorage(email, name);

      if (result.success) {
        console.log(`✅ OTP sent successfully to ${email}`);
        return res.json({
          success: true,
          message: 'OTP sent successfully to your email',
          email: email,
        });
      } else {
        // Email sending failed
        console.error(`❌ Failed to send OTP to ${email}:`, result.error);
        return res.status(500).json({
          error: 'Failed to send OTP email. Please try again.',
          details: process.env.NODE_ENV === 'development' ? result.error : undefined
        });
      }

    } catch (error) {
      console.error('❌ Send OTP error:', error);
      res.status(500).json({
        error: 'Failed to send OTP. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * Verify OTP and Register User
 * POST /api/otp/verify-and-register
 */
router.post(
  '/verify-and-register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const { email, otp, password, name, phone, userType } = req.body;

      // Verify OTP
      const otpVerification = await verifyOTP(email, otp);

      if (!otpVerification.valid) {
        return res.status(400).json({ error: otpVerification.message });
      }

      // Check if user already exists and is verified
      const existingUser = await pool.query(
        'SELECT id, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0 && existingUser.rows[0].is_verified) {
        return res.status(400).json({ 
          error: 'User already exists and is verified. Please login.' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      let user;

      if (existingUser.rows.length > 0) {
        // Update existing unverified user
        const result = await pool.query(
          `UPDATE users 
           SET password = $1, name = $2, phone = $3, user_type = $4, 
               is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
           WHERE email = $5
           RETURNING id, email, name, phone, user_type, profile_photo, 
                     is_subscribed, subscription_expiry, subscription_plan, 
                     is_verified, created_at`,
          [hashedPassword, name, phone || null, userType || 'individual', email]
        );
        user = result.rows[0];
      } else {
        // Create new user
        const result = await pool.query(
          `INSERT INTO users (email, password, name, phone, user_type, is_verified, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
           RETURNING id, email, name, phone, user_type, profile_photo, 
                     is_subscribed, subscription_expiry, subscription_plan, 
                     is_verified, created_at`,
          [email, hashedPassword, name, phone || null, userType || 'individual']
        );
        user = result.rows[0];
      }

      console.log('✅ User registered and verified:', {
        id: user.id,
        email: user.email,
        name: user.name,
        is_verified: user.is_verified,
      });

      res.status(201).json({
        success: true,
        message: 'Email verified and registration successful! Please login.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.user_type,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('❌ Verify and register error:', error);
      res.status(500).json({
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;
