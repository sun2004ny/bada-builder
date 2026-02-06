/**
 * Marketing Email Service - SMTP Integration
 * Handles Admin and User notifications for marketing package bookings
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateMarketingAdminNotificationEmail } from '../templates/marketingAdminNotificationTemplate.js';
import { generateMarketingUserConfirmationEmail } from '../templates/marketingUserConfirmationTemplate.js';

dotenv.config();

/**
 * Create SMTP transporter
 * Reuses the same logic as bookingEmailService
 */
const createTransporter = () => {
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    };

    return nodemailer.createTransport(config);
};

/**
 * Send Admin and User emails for a marketing package booking
 * @param {Object} bookingData - Complete booking information
 * @returns {Promise<void>} - Fires and forgets (or logs success/fail)
 */
export const sendMarketingEmails = async (bookingData) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ [Marketing Email] SMTP credentials not configured, skipping emails.');
            return;
        }

        const transporter = createTransporter();
        const adminEmail = process.env.ADMIN_EMAIL;
        const appName = process.env.APP_NAME || 'Bada Builder';

        console.log(`📧 [Marketing Email] Processing emails for Inquiry #${bookingData.inquiryId}`);

        // 1. Send Admin Email
        if (adminEmail) {
            try {
                const adminHtml = generateMarketingAdminNotificationEmail(bookingData);
                await transporter.sendMail({
                    from: { name: `${appName} System`, address: process.env.SMTP_USER },
                    to: adminEmail,
                    subject: `🔔 New Marketing Package Booking Received - ${bookingData.name}`,
                    html: adminHtml
                });
                console.log('✅ [Marketing Email] Admin notification sent.');
            } catch (adminErr) {
                console.error('❌ [Marketing Email] Admin email failed:', adminErr.message);
            }
        }

        // 2. Send User Email
        if (bookingData.email) {
            try {
                const userHtml = generateMarketingUserConfirmationEmail(bookingData);
                await transporter.sendMail({
                    from: { name: appName, address: process.env.SMTP_USER },
                    to: bookingData.email,
                    subject: `Your Booking is Confirmed 🎉 - ${appName}`,
                    html: userHtml
                });
                console.log(`✅ [Marketing Email] User confirmation sent to ${bookingData.email}.`);
            } catch (userErr) {
                console.error('❌ [Marketing Email] User confirmation failed:', userErr.message);
            }
        }

    } catch (globalErr) {
        console.error('❌ [Marketing Email] Global service error:', globalErr.message);
    }
};

export default {
    sendMarketingEmails
};
