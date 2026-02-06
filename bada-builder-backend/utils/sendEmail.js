/**
 * Email Utility - Brevo API Integration
 * Works on Render Free Tier (uses HTTPS, not SMTP)
 * 
 * Environment Variables Required:
 * - BREVO_API_KEY: Your Brevo API key
 * - BREVO_EMAIL: Verified sender email
 * - APP_NAME: Application name
 */

import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_HOST = 'api.brevo.com';
const BREVO_API_PATH = '/v3/smtp/email';

/**
 * Send email via Brevo API (using native https module)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML content
 * @param {string} [options.textContent] - Plain text content (optional)
 * @param {string} [options.recipientName] - Recipient name (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendEmail = async ({ to, subject, htmlContent, textContent = '', recipientName = '' }) => {
  return new Promise((resolve, reject) => {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      const appName = process.env.APP_NAME || 'Bada Builder';
      const fromEmail = process.env.BREVO_EMAIL;

      // Validation
      if (!apiKey) throw new Error('BREVO_API_KEY not configured');
      if (!fromEmail) throw new Error('BREVO_EMAIL not configured');
      if (!to || !subject || !htmlContent) throw new Error('Missing required parameters');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) throw new Error('Invalid email address format');

      console.log(`📧 Sending email to ${to} via Brevo API (Native HTTPS)...`);

      const postData = JSON.stringify({
        sender: { name: appName, email: fromEmail },
        to: [{ email: to, name: recipientName || to }],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || subject
      });

      const options = {
        hostname: BREVO_API_HOST,
        path: BREVO_API_PATH,
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(postData),
          'User-Agent': 'BadaBuilder/1.0 Node.js',
          'Connection': 'close'
        },
        timeout: 30000, 
        agent: false,
        family: 4 // Force IPv4 to avoid potential IPv6 connection issues
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => { data += chunk; });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
             if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log('✅ Email sent successfully:', { to, subject, messageId: parsedData.messageId });
              resolve({ success: true, messageId: parsedData.messageId });
            } else {
              console.error('❌ Brevo API Error:', parsedData);
              resolve({ success: false, error: parsedData.message || `Status Code: ${res.statusCode}` });
            }
          } catch (e) {
             resolve({ success: false, error: 'Invalid JSON response from Brevo' });
          }
        });
      });

      req.on('error', (e) => {
        console.error('❌ Network request failed:', e);
        resolve({ success: false, error: e.message });
      });

      req.write(postData);
      req.end();

    } catch (error) {
      console.error('❌ Failed to prepare email:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} [name] - Recipient name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendOtpEmail = async (to, otp, name = '') => {
  const appName = process.env.APP_NAME || 'Bada Builder';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: #333;">Email Verification</h2>
      
      <p style="color: #555; font-size: 16px;">
        ${name ? `Hello ${name},` : 'Hello,'}
      </p>
      
      <p style="color: #555; font-size: 16px;">
        Thank you for registering with ${appName}. Please use the following OTP to verify your email address:
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
        © 2026 ${appName}. All rights reserved.
      </p>
    </div>
  `;

  const textContent = `Your ${appName} verification OTP is: ${otp}. This OTP will expire in 5 minutes.`;

  return sendEmail({
    to,
    subject: `Verify Your Email - ${appName}`,
    htmlContent,
    textContent,
    recipientName: name
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 * @param {string} [name] - Recipient name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendPasswordResetEmail = async (to, resetLink, name = '') => {
  const appName = process.env.APP_NAME || 'Bada Builder';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p style="color: #555; font-size: 16px;">
        ${name ? `Hello ${name},` : 'Hello,'}
      </p>
      
      <p style="color: #555; font-size: 16px;">
        We received a request to reset your password. Click the button below to reset it:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #555; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      
      <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
        ${resetLink}
      </p>
      
      <p style="color: #555; font-size: 14px;">
        <strong>This link will expire in 1 hour.</strong>
      </p>
      
      <p style="color: #555; font-size: 14px;">
        If you didn't request this, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 ${appName}. All rights reserved.
      </p>
    </div>
  `;

  const textContent = `Reset your password by visiting: ${resetLink}. This link will expire in 1 hour.`;

  return sendEmail({
    to,
    subject: `Password Reset - ${appName}`,
    htmlContent,
    textContent,
    recipientName: name
  });
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} [name] - Recipient name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWelcomeEmail = async (to, name = '') => {
  const appName = process.env.APP_NAME || 'Bada Builder';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: #333;">Welcome to ${appName}!</h2>
      
      <p style="color: #555; font-size: 16px;">
        ${name ? `Hello ${name},` : 'Hello,'}
      </p>
      
      <p style="color: #555; font-size: 16px;">
        Thank you for joining ${appName}. We're excited to have you on board!
      </p>
      
      <p style="color: #555; font-size: 16px;">
        Start exploring properties and find your dream home today.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 ${appName}. All rights reserved.
      </p>
    </div>
  `;

  const textContent = `Welcome to ${appName}! Thank you for joining us.`;

  return sendEmail({
    to,
    subject: `Welcome to ${appName}`,
    htmlContent,
    textContent,
    recipientName: name
  });
};



/**
 * Send Forgot Password OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} [name] - Recipient name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendForgotPasswordOtpEmail = async (to, otp, name = '') => {
  const appName = process.env.APP_NAME || 'Bada Builder';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">${appName}</h1>
      </div>
      
      <h2 style="color: #333;">Reset Your Password</h2>
      
      <p style="color: #555; font-size: 16px;">
        ${name ? `Hello ${name},` : 'Hello,'}
      </p>
      
      <p style="color: #555; font-size: 16px;">
        We received a request to reset your password. Use the OTP below to proceed with resetting your password:
      </p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h1 style="color: #dc2626; font-size: 36px; letter-spacing: 8px; margin: 0;">
          ${otp}
        </h1>
      </div>
      
      <p style="color: #555; font-size: 14px;">
        <strong>This OTP will expire in 5 minutes.</strong>
      </p>
      
      <p style="color: #555; font-size: 14px;">
        If you didn't request a password reset, please ignore this email. Your account is safe.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 ${appName}. All rights reserved.
      </p>
    </div>
  `;

  const textContent = `Your ${appName} password reset OTP is: ${otp}. This OTP will expire in 5 minutes.`;

  return sendEmail({
    to,
    subject: `Password Reset OTP - ${appName}`,
    htmlContent,
    textContent,
    recipientName: name
  });
};

export default {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendForgotPasswordOtpEmail
};
