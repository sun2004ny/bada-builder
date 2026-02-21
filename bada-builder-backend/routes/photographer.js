import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';

import { sendPhotographerEmails } from '../services/photographerEmailService.js';

const router = express.Router();

// Specific rate limiter for photographer registration to prevent spam
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 requests per hour
    message: 'Too many registration attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route GET /api/photographer/status
 * @desc Check if the authenticated user has already applied
 * @access Private
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id FROM marketing_photographers WHERE email = $1 AND form_type = 'PHOTOGRAPHER'",
            [req.user.email]
        );

        res.json({ applied: result.rows.length > 0 });
    } catch (error) {
        console.error('❌ Error checking photographer status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/photographer/register
 * @desc Register a new photographer
 * @access Public
 */
router.post(
    '/register',
    registerLimiter,
    [
        // Validation & Sanitization
        body('fullName').trim().notEmpty().withMessage('Full Name is required').escape(),
        body('email').trim().isEmail().withMessage('Valid Email is required').normalizeEmail(),
        body('phone').trim().notEmpty().withMessage('Phone Number is required').escape(),
        body('city').trim().optional().escape(),
        body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
        body('photographyType').trim().optional().escape(),
        body('driveLink').trim().notEmpty().withMessage('Portfolio/Drive Link is required').isURL().withMessage('Must be a valid URL'),
        body('instagram').trim().optional().escape(), // Check if URL validation is needed, but username is also common
        body('website').trim().optional().isURL().withMessage('Website must be a valid URL'),
        body('hasDslr').isBoolean().withMessage('Invalid value for DSLR ownership'),
        body('hasDrone').isBoolean().withMessage('Invalid value for Drone ownership'),
        body('outstationAvailable').isBoolean().withMessage('Invalid value for Outstation availability'),
        body('bio').trim().optional().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters').escape(),
    ],
    async (req, res) => {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const client = await pool.connect();

        try {
            const {
                fullName, email, phone, city, experience, photographyType,
                driveLink, instagram, website, hasDslr, hasDrone, outstationAvailable, bio
            } = req.body;

            // Start transaction
            await client.query('BEGIN');

            // Check for duplicate email
            const emailCheck = await client.query("SELECT id FROM marketing_photographers WHERE email = $1 AND form_type = 'PHOTOGRAPHER'", [email]);
            if (emailCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({ error: 'Email already registered. Please use a different email.' });
            }

            // Insert into Database
            const insertQuery = `
                INSERT INTO marketing_photographers (
                    name, email, phone, city, experience, photography_type,
                    drive_link, instagram, website, has_dslr, has_drone,
                    outstation_available, bio, form_type
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
                ) RETURNING id;
            `;

            const values = [
                fullName, email, phone, city, experience || 0, photographyType,
                driveLink, instagram, website, hasDslr, hasDrone,
                outstationAvailable, bio, 'PHOTOGRAPHER'
            ];

            const dbResult = await client.query(insertQuery, values);
            const newPhotographerId = dbResult.rows[0].id;

            await client.query('COMMIT');

            console.log(`✅ New photographer registered: ${email} (ID: ${newPhotographerId})`);

            // Send Emails (Async - Fire and forget)
            console.log('🚀 [Debug] Attempting to trigger email service...');
            try {
                const emailData = {
                    full_name: fullName,
                    email,
                    phone,
                    city,
                    experience,
                    photography_type: photographyType,
                    drive_link: driveLink,
                    instagram,
                    website,
                    has_dslr: hasDslr,
                    has_drone: hasDrone,
                    outstation_available: outstationAvailable,
                    bio
                };
                console.log('📦 [Debug] Email payload prepared:', JSON.stringify(emailData, null, 2));
                sendPhotographerEmails(emailData); // No await to block response
                console.log('➡️ [Debug] sendPhotographerEmails function called.');
            } catch (emailError) {
                console.error('⚠️ [Debug] Email trigger failed synchronously:', emailError);
                // Do not fail the request
            }

            res.status(201).json({
                message: 'Application submitted successfully!',
                photographerId: newPhotographerId
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Photographer registration error:', error);
            res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
        } finally {
            client.release();
        }
    }
);

export default router;
