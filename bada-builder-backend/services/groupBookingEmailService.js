/**
 * Group Property Booking Email Service - SMTP Integration
 * Dedicated service for sending live group property booking confirmation emails
 * Uses Gmail SMTP (separate from Brevo API used for OTP/auth)
 * 
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server host (smtp.gmail.com)
 * - SMTP_PORT: SMTP server port (587)
 * - SMTP_USER: Gmail email address
 * - SMTP_PASS: Gmail app password
 * - ADMIN_EMAIL: Admin email for BCC
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateGroupPropertyBookingEmail } from '../templates/groupPropertyBookingTemplate.js';
import { generateAdminGroupBookingNotificationEmail } from '../templates/adminGroupBookingTemplate.js';

dotenv.config();

/**
 * Create SMTP transporter
 * @returns {nodemailer.Transporter}
 */
const createTransporter = () => {
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates
        }
    };

    return nodemailer.createTransport(config);
};

/**
 * Send group property booking confirmation email to user (User Only)
 * @param {Object} bookingData - Booking information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendGroupPropertyBookingEmail = async (bookingData) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured.');
        }

        const requiredFields = [
            'booking_id', 'user_name', 'user_email', 'user_phone',
            'property_name', 'unit_details', 'amount', 'join_date',
            'project_location', 'developer'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = bookingData[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required booking data: ${missingFields.join(', ')}`);
        }

        console.log(`📧 [Group Booking Email] Sending User Confirmation for Booking #${bookingData.booking_id}`);

        const htmlContent = generateGroupPropertyBookingEmail(bookingData);
        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: appName,
                address: process.env.SMTP_USER
            },
            to: bookingData.user_email,
            // BCC REMOVED - Admin gets separate email
            subject: `Group Property Booking Confirmed - ${appName} (Booking #${bookingData.booking_id})`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [Group Booking Email] User email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ [Group Booking Email] Failed to send user confirmation:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send group property booking notification to Admin
 * @param {Object} bookingData - Booking information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAdminGroupBookingNotification = async (bookingData) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ [Admin Notification] ADMIN_EMAIL not set, skipping admin notification.');
            return { success: false, error: 'ADMIN_EMAIL not configured' };
        }

        // Validate required booking data
        const requiredFields = [
            'booking_id', 'user_name', 'user_email', 'user_phone',
            'property_name', 'unit_details', 'amount', 'join_date',
            'project_location', 'developer'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = bookingData[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required booking data: ${missingFields.join(', ')}`);
        }

        console.log(`📧 [Admin Notification] Sending Group Booking Notification for #${bookingData.booking_id} to ${adminEmail}`);
        const htmlContent = generateAdminGroupBookingNotificationEmail(bookingData);

        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: `${appName} System`,
                address: process.env.SMTP_USER
            },
            to: adminEmail,
            subject: `🚀 New Live Group Booking: #${bookingData.booking_id} - ${bookingData.user_name}`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [Admin Notification] Email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ [Admin Notification] Failed to send email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Test SMTP connection
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const testSMTPConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();

        console.log('✅ [Group Booking Email] SMTP connection verified successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ [Group Booking Email] SMTP connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

export default {
    sendGroupPropertyBookingEmail,
    sendAdminGroupBookingNotification,
    testSMTPConnection
};
