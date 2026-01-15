/**
 * Brevo SMTP Email Service
 * 
 * Configuration from .env:
 * - BREVO_SMTP_SERVER
 * - BREVO_SMTP_PORT
 * - BREVO_SMTP_LOGIN
 * - BREVO_SMTP_PASSWORD
 * - BREVO_EMAIL (verified sender)
 * - APP_NAME (optional)
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log configuration (remove in production)
console.log('📧 Brevo SMTP Configuration:');
console.log('   Server:', process.env.BREVO_SMTP_SERVER);
console.log('   Port:', process.env.BREVO_SMTP_PORT);
console.log('   Login:', process.env.BREVO_SMTP_LOGIN);
console.log('   Password:', process.env.BREVO_SMTP_PASSWORD ? '***' + process.env.BREVO_SMTP_PASSWORD.slice(-6) : 'NOT SET');
console.log('   From Email:', process.env.BREVO_EMAIL);
console.log('   App Name:', process.env.APP_NAME || 'Bada Builder');

// Create Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_SERVER,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  pool: true, // Use connection pooling
  maxConnections: 5,
  maxMessages: 100,
  requireTLS: true,
  logger: false,
  debug: false
});

// Verify SMTP connection on startup (non-blocking)
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Brevo SMTP Connection Error:', error.message);
    console.error('Please check your Brevo credentials in .env file');
    console.log('⚠️  Email service will retry on first send attempt');
  } else {
    console.log('✅ Brevo SMTP Server is ready to send emails');
  }
});

/**
 * Helper function to send OTP email via Brevo
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendOtpEmail = async (to, otp, name = '', retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📧 Sending OTP to ${to} via Brevo SMTP... (Attempt ${attempt}/${retries})`);

      // Validate inputs
      if (!to || !otp) {
        throw new Error('Missing required parameters: to and otp');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error('Invalid email address format');
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be a 6-digit number');
      }

      const appName = process.env.APP_NAME || 'Bada Builder';
      const fromEmail = process.env.BREVO_EMAIL;

      // Email HTML template
      const html = `
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

      // Plain text version
      const text = `Your ${appName} verification OTP is: ${otp}. This OTP will expire in 5 minutes.`;

      // Send email
      const info = await transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to: to,
        subject: `Verify Your Email - ${appName}`,
        text: text,
        html: html,
      });

      console.log('✅ OTP email sent successfully:', {
        to,
        messageId: info.messageId,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error(`❌ Failed to send OTP email (Attempt ${attempt}/${retries}):`, {
        to,
        error: error.message,
        code: error.code,
        command: error.command
      });

      // If this was the last attempt, return error
      if (attempt === retries) {
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return {
    success: false,
    error: 'Failed after all retry attempts'
  };
};

/**
 * Send general email (for other purposes)
 */
export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const appName = process.env.APP_NAME || 'Bada Builder';
    const fromEmail = process.env.BREVO_EMAIL;

    const info = await transporter.sendMail({
      from: `"${appName}" <${fromEmail}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
  const appName = process.env.APP_NAME || 'Bada Builder';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Welcome to ${appName}, ${name}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>Start exploring properties and find your dream home today!</p>
      <p>Best regards,<br>${appName} Team</p>
    </div>
  `;

  return sendEmail(email, `Welcome to ${appName}`, html);
};

export default transporter;
