/**
 * Email Service using Brevo (formerly Sendinblue)
 * 
 * Why Brevo instead of Gmail?
 * - Gmail SMTP is often blocked on cloud platforms like Render
 * - Brevo has a free tier (300 emails/day)
 * - Works reliably on Render, Heroku, Railway, etc.
 * - Better deliverability
 * 
 * Setup:
 * 1. Sign up at https://www.brevo.com (free)
 * 2. Go to SMTP & API → SMTP
 * 3. Copy your SMTP credentials
 * 4. Add to .env file
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// Brevo SMTP Configuration
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER, // Your Brevo SMTP login
    pass: process.env.SMTP_PASS, // Your Brevo SMTP password
  },
  // Important for Render
  tls: {
    rejectUnauthorized: false
  }
});

// ============================================
// Verify SMTP Connection on Startup
// ============================================
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
    console.error('Please check your SMTP credentials in .env file');
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

/**
 * Send Email Function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendEmail = async (to, subject, html, text = '') => {
  try {
    // Validate inputs
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address');
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Bada Builder'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: info.messageId
    });

    return { 
      success: true, 
      messageId: info.messageId 
    };

  } catch (error) {
    console.error('❌ Email sending failed:', {
      to,
      subject,
      error: error.message,
      code: error.code
    });

    // Return error details for better debugging
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Welcome to Bada Builder, ${name}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>Start exploring properties and find your dream home today!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Welcome to Bada Builder', html);
};

/**
 * Send Site Visit Confirmation Email
 */
export const sendSiteVisitConfirmation = async (email, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Site Visit Booking Confirmed</h2>
      <p>Hello,</p>
      <p>Your site visit has been confirmed:</p>
      <ul style="line-height: 1.8;">
        <li><strong>Property:</strong> ${bookingDetails.property_title}</li>
        <li><strong>Location:</strong> ${bookingDetails.property_location}</li>
        <li><strong>Date:</strong> ${bookingDetails.visit_date}</li>
        <li><strong>Time:</strong> ${bookingDetails.visit_time}</li>
        <li><strong>Number of People:</strong> ${bookingDetails.number_of_people}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Site Visit Booking Confirmed', html);
};

/**
 * Send Subscription Confirmation Email
 */
export const sendSubscriptionConfirmation = async (email, subscriptionDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Subscription Confirmed</h2>
      <p>Hello,</p>
      <p>Your subscription has been activated:</p>
      <ul style="line-height: 1.8;">
        <li><strong>Plan:</strong> ${subscriptionDetails.plan}</li>
        <li><strong>Amount:</strong> ₹${subscriptionDetails.price}</li>
        <li><strong>Expiry Date:</strong> ${new Date(subscriptionDetails.expiry).toLocaleDateString()}</li>
      </ul>
      <p>You can now post properties on our platform!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Subscription Confirmed', html);
};

export default transporter;
