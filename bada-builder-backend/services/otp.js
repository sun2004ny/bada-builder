import pool from '../config/database.js';
import { sendEmail } from './email-resend.js'; // Using Resend - Simple and Reliable

console.log('🔍 OTP Service loaded - using Resend email service');

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in database with 5-minute expiration
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

    console.log(`✅ OTP stored for ${email}, expires at ${expiresAt}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error storing OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
      [email, otp]
    );

    if (result.rows.length === 0) {
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

// Send OTP email
export const sendOTPEmail = async (email, otp, name = '') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Bada Builder</h1>
      </div>
      
      <h2 style="color: #333;">Email Verification</h2>
      
      <p style="color: #555; font-size: 16px;">
        ${name ? `Hello ${name},` : 'Hello,'}
      </p>
      
      <p style="color: #555; font-size: 16px;">
        Thank you for registering with Bada Builder. Please use the following OTP to verify your email address:
      </p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0;">
          ${otp}
        </h1>
      </div>
      
      <p style="color: #555; font-size: 14px;">
        <strong>This OTP will expire in 5 minutes.</strong>
      </p>
      
      <p style="color: #555; font-size: 14px;">
        If you didn't request this verification, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 Bada Builder. All rights reserved.
      </p>
    </div>
  `;

  const text = `Your Bada Builder verification OTP is: ${otp}. This OTP will expire in 5 minutes.`;

  return sendEmail(email, 'Verify Your Email - Bada Builder', html, text);
};

// Clean up expired OTPs (can be run periodically)
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
