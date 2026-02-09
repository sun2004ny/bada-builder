import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { verifyOTP } from '../services/otp.js';
import { sendOTPWithStorage } from '../services/otp.js';

const router = express.Router();

// Store verification tokens temporarily (in production, use Redis)
const verificationTokens = new Map();

// Store OTP request cooldowns (in production, use Redis)
// Structure: { userId: { lastRequest: timestamp, requestCount: number } }
const otpCooldowns = new Map();

/**
 * Helper function to extract IP address from request
 * Handles proxies and load balancers
 */
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null;
};

/**
 * Helper function to log account deletion for analytics
 * This runs in background and never blocks the deletion process
 */
const logAccountDeletion = async (userId, email, deletionMethod, deletionReason, req) => {
    try {
        const ipAddress = getClientIP(req);
        const userAgent = req.headers['user-agent'] || null;

        await pool.query(
            `INSERT INTO account_deletions 
             (user_id, email, deletion_method, deletion_reason, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, email, deletionMethod, deletionReason, ipAddress, userAgent]
        );

        console.log('📊 Deletion logged:', { userId, email, deletionMethod, deletionReason });
    } catch (error) {
        // NEVER let logging failure block deletion
        console.error('⚠️ Failed to log deletion (non-critical):', error.message);
    }
};

/**
 * Verify user's password before allowing deletion
 * POST /api/users/delete-account/verify-password
 */
router.post('/verify-password', authenticate, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // Get user's stored password hash
        const result = await pool.query(
            'SELECT password FROM users WHERE id = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Generate verification token (valid for 5 minutes)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        verificationTokens.set(verificationToken, {
            userId: req.user.id,
            expiresAt
        });

        // Clean up expired tokens
        for (const [token, data] of verificationTokens.entries()) {
            if (data.expiresAt < Date.now()) {
                verificationTokens.delete(token);
            }
        }

        console.log(`✅ Password verified for user ${req.user.id}`);

        res.json({
            verified: true,
            verificationToken,
            message: 'Password verified successfully'
        });
    } catch (error) {
        console.error('❌ Password verification error:', error);
        res.status(500).json({ error: 'Failed to verify password' });
    }
});

/**
 * Verify user's email before sending OTP (DELETE ACCOUNT ONLY)
 * POST /api/users/delete-account/verify-email
 * Security: Email must match logged-in user's email
 */
router.post('/verify-email', authenticate, async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email is provided
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Get logged-in user's email from database
        const result = await pool.query(
            'SELECT email FROM users WHERE id = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { email: userEmail } = result.rows[0];

        // Compare emails (case-insensitive)
        if (email.trim().toLowerCase() !== userEmail.toLowerCase()) {
            // Log failed attempt for security monitoring
            console.warn(`⚠️ Email mismatch for user ${req.user.id}: provided=${email}, actual=${userEmail}`);
            return res.status(400).json({ error: 'Email does not match your account' });
        }

        console.log(`✅ Email verified for user ${req.user.id}`);

        res.json({
            verified: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

/**
 * Request OTP for account deletion (fallback for forgot password)
 * POST /api/users/delete-account/request-otp
 */
router.post('/request-otp', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = Date.now();

        // Check rate limiting
        const cooldownData = otpCooldowns.get(userId);

        if (cooldownData) {
            // Check 30-second cooldown
            const timeSinceLastRequest = now - cooldownData.lastRequest;
            if (timeSinceLastRequest < 30000) { // 30 seconds
                const waitTime = Math.ceil((30000 - timeSinceLastRequest) / 1000);
                return res.status(429).json({
                    error: `Please wait ${waitTime} seconds before requesting another OTP`
                });
            }

            // Check 15-minute window for max requests
            const fifteenMinutesAgo = now - 15 * 60 * 1000;
            if (cooldownData.windowStart > fifteenMinutesAgo) {
                if (cooldownData.requestCount >= 5) {
                    return res.status(429).json({
                        error: 'Too many OTP requests. Please try again later.'
                    });
                }
                // Increment count in current window
                cooldownData.requestCount++;
            } else {
                // Start new window
                cooldownData.windowStart = now;
                cooldownData.requestCount = 1;
            }

            cooldownData.lastRequest = now;
        } else {
            // First request
            otpCooldowns.set(userId, {
                lastRequest: now,
                windowStart: now,
                requestCount: 1
            });
        }

        // Clean up old cooldown data (entries older than 15 minutes)
        for (const [key, data] of otpCooldowns.entries()) {
            if (now - data.lastRequest > 15 * 60 * 1000) {
                otpCooldowns.delete(key);
            }
        }

        // Get user details
        const result = await pool.query(
            'SELECT email, name FROM users WHERE id = $1 AND (is_deleted = FALSE OR is_deleted IS NULL)',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { email, name } = result.rows[0];

        // Send OTP using existing Brevo service
        const otpResult = await sendOTPWithStorage(email, name);

        if (otpResult.success) {
            console.log(`✅ OTP sent for account deletion to ${email}`);
            res.json({
                success: true,
                message: 'OTP sent to your email address'
            });
        } else {
            console.error('❌ Failed to send OTP:', otpResult.error);
            res.status(500).json({
                error: 'Failed to send OTP. Please try again.',
                details: otpResult.error
            });
        }
    } catch (error) {
        console.error('❌ OTP request error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

/**
 * Delete user account (soft delete)
 * DELETE /api/users/delete-account
 * Requires EITHER verificationToken (from password) OR otp
 */
router.delete('/', authenticate, async (req, res) => {
    const client = await pool.connect();

    try {
        const { verificationToken, otp, deletionReason } = req.body;

        // Verify identity with EITHER password token OR OTP
        let isVerified = false;
        let deletionMethod = null; // Track which method was used

        if (verificationToken) {
            // Check password verification token
            const tokenData = verificationTokens.get(verificationToken);

            if (tokenData && tokenData.userId === req.user.id && tokenData.expiresAt > Date.now()) {
                isVerified = true;
                deletionMethod = 'password';
                verificationTokens.delete(verificationToken); // Use token once
                console.log(`✅ Password token verified for user ${req.user.id}`);
            }
        } else if (otp) {
            // Check OTP
            const result = await pool.query(
                'SELECT email FROM users WHERE id = $1',
                [req.user.id]
            );

            if (result.rows.length > 0) {
                const { email } = result.rows[0];
                const otpResult = await verifyOTP(email, otp);

                if (otpResult.valid) {
                    isVerified = true;
                    deletionMethod = 'otp';
                    console.log(`✅ OTP verified for user ${req.user.id}`);
                }
            }
        }

        if (!isVerified) {
            return res.status(401).json({
                error: 'Verification failed. Please provide valid password or OTP.'
            });
        }

        // Start transaction
        await client.query('BEGIN');

        // First, get user info for logging BEFORE deletion
        const userInfo = await client.query(
            'SELECT id, email, name FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userInfo.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found or already deleted' });
        }

        const deletedUser = userInfo.rows[0];

        console.log(`🗑️ Starting cascade deletion for user ${deletedUser.id}...`);

        // ⚠️ CASCADE DELETE ALL RELATED DATA FIRST (prevents foreign key errors)
        // Order matters: delete dependent records first, then parent records

        // 1. Delete user subscriptions
        await client.query('DELETE FROM user_subscriptions WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted subscriptions');

        // 2. Delete bookings
        await client.query('DELETE FROM bookings WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted bookings');

        // 3. Delete properties owned by user
        await client.query('DELETE FROM properties WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted properties');

        // 4. Delete wishlists
        await client.query('DELETE FROM wishlists WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted wishlists');

        // 5. Delete property reviews
        await client.query('DELETE FROM property_reviews WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted reviews');

        // 6. Delete short stay favorites
        await client.query('DELETE FROM short_stay_favorites WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted short stay favorites');

        // 7. Delete complaints
        await client.query('DELETE FROM complaints WHERE user_id = $1', [req.user.id]);
        console.log('  ✓ Deleted complaints');

        // 8. Delete any other user-related data (add more as needed)
        // Example: DELETE FROM table_name WHERE user_id = $1

        // ⚠️ HARD DELETE - Permanently remove user from database
        const result = await client.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found or already deleted' });
        }

        console.log('  ✓ Deleted user record');

        // Commit transaction
        await client.query('COMMIT');

        // Log deletion for analytics (non-blocking)
        // This happens AFTER commit, so even if logging fails, deletion succeeds
        logAccountDeletion(
            deletedUser.id,
            deletedUser.email,
            deletionMethod,
            deletionReason || null,
            req
        ).catch(err => {
            // Silent catch - already logged in function
        });

        console.log(`✅ Account PERMANENTLY DELETED:`, {
            id: deletedUser.id,
            email: deletedUser.email
        });

        res.json({
            success: true,
            message: 'Account deleted successfully',
            data: {
                deleted_at: new Date()
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Account deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete account',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    } finally {
        client.release();
    }
});

export default router;
