import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { sendPhotographerEmails } from '../services/photographerEmailService.js';

const router = express.Router();

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many signup attempts, please try again later.',
});

/**
 * @route GET /api/marketing-signup/status
 * @desc Check application status for Real Estate Agent and Influencer
 * @access Private
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        const email = req.user.email.toLowerCase().trim();

        // Use EXACT table columns and names
        const agentCheck = await pool.query("SELECT id FROM marketing_real_estate_agents WHERE LOWER(TRIM(email)) = $1", [email]);
        const influencerCheck = await pool.query("SELECT id FROM marketing_influencers WHERE LOWER(TRIM(email)) = $1", [email]);

        // Return keys matching frontend state EXACTLY to avoid mapping confusion
        res.json({
            'real-estate': agentCheck.rows.length > 0,
            'influencer': influencerCheck.rows.length > 0
        });
    } catch (error) {
        console.error('❌ Error checking marketing signup status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/marketing-signup/real-estate-agent/register
 */
router.post(
    '/real-estate-agent/register',
    signupLimiter,
    [
        body('name').trim().notEmpty().withMessage('Full Name is required'),
        body('email').trim().isEmail().withMessage('Valid Email is required').normalizeEmail(),
        body('phone').trim().notEmpty().withMessage('Phone Number is required'),
        body('agencyName').trim().notEmpty().withMessage('Agency Name is required'),
        body('experience').optional().isInt({ min: 0 }),
        body('pdfUrl').trim().notEmpty().withMessage('PDF Upload is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { name, email, phone, agencyName, experience, pdfUrl } = req.body;
            const normalizedEmail = email.toLowerCase().trim();

            const check = await pool.query("SELECT id FROM marketing_real_estate_agents WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);
            if (check.rows.length > 0) {
                return res.status(200).json({ alreadyRegistered: true, message: 'Application already received' });
            }

            const query = `
                INSERT INTO marketing_real_estate_agents (name, email, phone, agency_name, experience, pdf_url)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
            `;
            const result = await pool.query(query, [name, normalizedEmail, phone, agencyName, experience || 0, pdfUrl]);

            // Trigger Emails (Async)
            try {
                sendPhotographerEmails({
                    role: 'Real Estate Agent',
                    name,
                    email: normalizedEmail,
                    phone,
                    agency_name: agencyName,
                    experience,
                    pdf_url: pdfUrl
                });
            } catch (emailErr) {
                console.error('⚠️ [Real Estate Email] Trigger failed:', emailErr.message);
            }

            res.status(201).json({ message: 'Successfully registered', id: result.rows[0].id });
        } catch (error) {
            console.error('Real Estate Agent registration error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/**
 * @route POST /api/marketing-signup/influencer/register
 */
router.post(
    '/influencer/register',
    signupLimiter,
    [
        body('name').trim().notEmpty().withMessage('Full Name is required'),
        body('email').trim().isEmail().withMessage('Valid Email is required').normalizeEmail(),
        body('phone').trim().notEmpty().withMessage('Phone Number is required'),
        body('metaLink').trim().isURL().withMessage('Valid Meta Profile Link is required'),
        body('followers').isInt({ min: 0 }).withMessage('Followers must be a number'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { name, email, phone, metaLink, followers } = req.body;
            const normalizedEmail = email.toLowerCase().trim();

            const check = await pool.query("SELECT id FROM marketing_influencers WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);
            if (check.rows.length > 0) {
                return res.status(200).json({ alreadyRegistered: true, message: 'Application already received' });
            }

            const query = `
                INSERT INTO marketing_influencers (name, email, phone, meta_link, followers)
                VALUES ($1, $2, $3, $4, $5) RETURNING id;
            `;
            const result = await pool.query(query, [name, normalizedEmail, phone, metaLink, followers]);

            // Trigger Emails (Async)
            try {
                sendPhotographerEmails({
                    role: 'Influencer',
                    name,
                    email: normalizedEmail,
                    phone,
                    meta_link: metaLink,
                    followers
                });
            } catch (emailErr) {
                console.error('⚠️ [Influencer Email] Trigger failed:', emailErr.message);
            }

            res.status(201).json({ message: 'Successfully registered', id: result.rows[0].id });
        } catch (error) {
            console.error('Influencer registration error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;
