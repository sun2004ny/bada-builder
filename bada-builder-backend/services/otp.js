import pool from '../config/database.js';
import { sendOtpEmail, sendForgotPasswordOtpEmail } from '../utils/sendEmail.js';

console.log('🔍 OTP Service loaded - using Brevo API (HTTPS)');

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in database with 5-minute expiration
 * IMPORTANT: Only call this AFTER email is successfully sent
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean}>}
 */
export const storeOTP = async (email, otp) => {
  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing OTPs for this email
    await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);

    // Insert new OTP
    await pool.query(
      'INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    console.log(`✅ OTP stored for ${email}, expires at ${expiresAt.toISOString()}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error storing OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP to verify
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export const verifyOTP = async (email, otp) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
      [email, otp]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Invalid or expired OTP for ${email}`);
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Delete OTP after successful verification
    await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);

    console.log(`✅ OTP verified for ${email}`);
    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Send OTP with proper error handling
 * This is the main function to use - it handles email sending AND OTP storage
 * OTP is only saved if email is successfully sent
 * 
 * @param {string} email - User email
 * @param {string} name - User name (optional)
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export const sendOTPWithStorage = async (email, name = '') => {
  try {
    // Step 1: Generate OTP
    const otp = generateOTP();
    console.log(`📧 Attempting to send OTP to ${email}`);

    // Step 2: Try to send email FIRST via Brevo
    const emailResult = await sendOtpEmail(email, otp, name);

    // Step 3: Only store OTP if email was sent successfully
    if (emailResult.success) {
      await storeOTP(email, otp);
      return {
        success: true,
        message: 'OTP sent successfully to your email'
      };
    } else {
      // Email failed - don't store OTP
      console.error('❌ Email failed, OTP not stored');
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error
      };
    }
  } catch (error) {
    console.error('❌ Error in sendOTPWithStorage:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again later.',
      error: error.message
    };
  }
};

/**
 * Send Forgot Password OTP
 * Only sends if user exists (logic should be handled in controller, but here we just send)
 * @param {string} email - User email
 * @param {string} name - User name (optional)
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 */
export const sendForgotPasswordOTP = async (email, name = '') => {
  try {
    // Step 1: Generate OTP
    const otp = generateOTP();
    console.log(`📧 Attempting to send Password Reset OTP to ${email}`);

    // Step 2: Try to send email FIRST via Brevo
    const emailResult = await sendForgotPasswordOtpEmail(email, otp, name);

    // Step 3: Only store OTP if email was sent successfully
    if (emailResult.success) {
      await storeOTP(email, otp);
      return {
        success: true,
        message: 'Password reset OTP sent successfully to your email'
      };
    } else {
      // Email failed - don't store OTP
      console.error('❌ Email failed, OTP not stored');
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error
      };
    }
  } catch (error) {
    console.error('❌ Error in sendForgotPasswordOTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again later.',
      error: error.message
    };
  }
};

/**
 * Clean up expired OTPs (can be run periodically)
 * @returns {Promise<number>} Number of OTPs deleted
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const result = await pool.query('DELETE FROM email_otps WHERE expires_at < NOW()');
    console.log(`🧹 Cleaned up ${result.rowCount} expired OTPs`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error cleaning up OTPs:', error);
    throw error;
  }
};
