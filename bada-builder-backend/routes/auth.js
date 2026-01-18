import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Register
router.post(
    '/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name, phone, userType } = req.body;

            // Check if user exists
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user - Save ALL data to PostgreSQL
            const result = await pool.query(
                `INSERT INTO users (email, password, name, phone, user_type, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING id, email, name, phone, user_type, profile_photo, is_subscribed, 
                   subscription_expiry, subscription_plan, subscription_price, 
                   subscribed_at, created_at, updated_at`, [email, hashedPassword, name, phone || null, userType || 'individual']
            );

            const user = result.rows[0];

            // Log successful registration to database
            console.log('✅ User registered and saved to PostgreSQL:', {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                user_type: user.user_type,
                created_at: user.created_at
            });

            // Send welcome email (non-blocking)
            sendWelcomeEmail(email, name).catch(err => console.error('Welcome email failed:', err));

            res.status(201).json({
                message: 'User registered successfully. Please login.',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    userType: user.user_type,
                    profilePhoto: user.profile_photo,
                    isSubscribed: user.is_subscribed,
                    subscriptionExpiry: user.subscription_expiry,
                    subscriptionPlan: user.subscription_plan,
                    createdAt: user.created_at,
                },
            });
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                detail: error.detail
            });

            // Provide more specific error messages
            let errorMessage = 'Registration failed';
            if (error.code === '23505') { // Unique constraint violation
                errorMessage = 'Email already exists';
            } else if (error.code === '23502') { // Not null violation
                errorMessage = 'Required fields are missing';
            } else if (error.message) {
                errorMessage = error.message;
            }

            res.status(500).json({
                error: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }
);

// Login
router.post(
    '/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = result.rows[0];

            // Check if user has a password (should always exist, but safety check)
            if (!user.password) {
                console.error('Login error: User found but password field is missing');
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Check if JWT_SECRET is configured
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not configured in environment variables');
                return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
            }

            // Generate JWT
            const token = jwt.sign({ userId: user.id, email: user.email },
                process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            // Remove password from response
            delete user.password;

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    userType: user.user_type,
                    profilePhoto: user.profile_photo,
                    isSubscribed: user.is_subscribed,
                    subscriptionExpiry: user.subscription_expiry,
                    subscriptionPlan: user.subscription_plan,
                    createdAt: user.created_at,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            // Provide more specific error messages
            if (error.message && error.message.includes('JWT_SECRET')) {
                return res.status(500).json({
                    error: 'Server configuration error. JWT_SECRET is missing.'
                });
            }

            res.status(500).json({
                error: 'Login failed',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, name, phone, user_type, profile_photo, 
              is_subscribed, subscription_expiry, subscription_plan, 
              subscription_price, subscribed_at, created_at 
       FROM users WHERE id = $1`, [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, phone, userType, profile_photo } = req.body;

        console.log('📝 Profile update request:', { name, phone, userType, profile_photo: profile_photo ? 'provided' : 'not provided' });

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }
        if (userType) {
            // SECURITY FIX: Only allow admins to change user_type. 
            // If the logged-in user is NOT an admin, ignore the userType update request.
            if (req.user.user_type === 'admin') {
                updates.push(`user_type = $${paramCount++}`);
                values.push(userType);
            } else {
                console.warn(`🛑 Unauthorized user_type update attempt by user ${req.user.id}`);
            }
        }
        if (profile_photo !== undefined) {
            updates.push(`profile_photo = $${paramCount++}`);
            values.push(profile_photo);
        }

        if (updates.length === 0) {
            console.log('❌ No fields to update');
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.user.id);

        console.log('💾 Updating user with:', { updates, values });

        const result = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, name, phone, user_type, profile_photo, 
                 is_subscribed, subscription_expiry, subscription_plan, created_at`,
            values
        );

        console.log('✅ Profile updated successfully');
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
