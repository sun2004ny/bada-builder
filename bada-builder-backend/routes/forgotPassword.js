import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { sendForgotPasswordOTP, verifyOTP } from '../services/otp.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Send OTP for Password Reset
 * POST /api/forgot-password/send-otp
 */
router.post(
    '/send-otp',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Valid email is required', details: errors.array() });
            }

            const { email } = req.body;

            // Check if user exists
            const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [email]);

            if (userResult.rows.length === 0) {
                // Return 404 so frontend can show specific error
                return res.status(404).json({
                    error: 'User not found with this email address.'
                });
            }

            const user = userResult.rows[0];

            // Send OTP
            const result = await sendForgotPasswordOTP(email, user.name);

            if (result.success) {
                return res.json({
                    success: true,
                    message: result.message
                });
            } else {
                return res.status(500).json({
                    error: result.message,
                    details: result.error
                });
            }

        } catch (error) {
            console.error('Forgot Password Send OTP Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/**
 * Verify OTP for Password Reset
 * POST /api/forgot-password/verify-otp
 */
router.post(
    '/verify-otp',
    [
        body('email').isEmail().normalizeEmail(),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Invalid input', details: errors.array() });
            }

            const { email, otp } = req.body;

            // Verify OTP
            const verifyResult = await verifyOTP(email, otp);

            if (!verifyResult.valid) {
                return res.status(400).json({ error: verifyResult.message });
            }

            // Generate a temporary reset token
            // This token checks that the user has verified the OTP
            // Token expires in 15 minutes
            const resetToken = jwt.sign(
                { email, type: 'password-reset' },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            return res.json({
                success: true,
                message: 'OTP verified successfully.',
                resetToken // Send this to the client to use in the next step
            });

        } catch (error) {
            console.error('Forgot Password Verify OTP Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/**
 * Reset Password
 * POST /api/forgot-password/reset-password
 */
router.post(
    '/reset-password',
    [
        body('email').isEmail().normalizeEmail(),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('resetToken').notEmpty().withMessage('Reset token is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Invalid input', details: errors.array() });
            }

            const { email, newPassword, resetToken } = req.body;

            // Verify the reset token
            try {
                const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

                if (decoded.email !== email || decoded.type !== 'password-reset') {
                    return res.status(401).json({ error: 'Invalid reset token' });
                }
            } catch (tokenError) {
                return res.status(401).json({ error: 'Invalid or expired reset token' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in database
            const result = await pool.query(
                'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id',
                [hashedPassword, email]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            console.log(`✅ Password reset successfully for ${email}`);

            res.json({
                success: true,
                message: 'Password has been reset successfully. You can now login with your new password.'
            });

        } catch (error) {
            console.error('Password Reset Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;
