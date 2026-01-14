/**
 * Email Service using Resend
 * 
 * Why Resend?
 * - Simple API (no SMTP configuration needed)
 * - Free tier: 100 emails/day, 3,000/month
 * - Works perfectly on Render, Vercel, etc.
 * - Better deliverability than Gmail
 * - Easy to setup (just API key)
 * 
 * Setup:
 * 1. Sign up at https://resend.com (free)
 * 2. Get API key from dashboard
 * 3. Add to .env: RESEND_API_KEY=re_xxxxx
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Debug: Log configuration
console.log('📧 Email Service: Resend');
console.log('   API Key:', process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-6) : 'NOT SET');
console.log('   From Email:', process.env.RESEND_FROM || 'onboarding@resend.dev');

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

    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Bada Builder <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
      text: text || subject,
    });

    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: data.id
    });

    return { 
      success: true, 
      messageId: data.id 
    };

  } catch (error) {
    console.error('❌ Email sending failed:', {
      to,
      subject,
      error: error.message,
      name: error.name
    });

    // Return error details for better debugging
    return {
      success: false,
      error: error.message,
      name: error.name
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

export default resend;
