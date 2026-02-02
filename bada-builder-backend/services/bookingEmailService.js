/**
 * Booking Email Service - SMTP Integration
 * Dedicated service for sending site visit booking confirmation emails
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
import { generateBookingConfirmationEmail } from '../templates/bookingConfirmationTemplate.js';
import { generateAdminBookingNotificationEmail } from '../templates/adminBookingNotificationTemplate.js';

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
 * Send booking confirmation email to users (User only)
 * @param {Object} bookingData - Booking information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendBookingConfirmationEmail = async (bookingData) => {
    try {
        // ... (validation logic remains same)
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured.');
        }

        const requiredFields = ['booking_id', 'property_name', 'visit_date', 'visit_time', 'amount', 'user_email', 'user_phone', 'person1_name'];
        const missingFields = requiredFields.filter(field => {
            const value = bookingData[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required booking data: ${missingFields.join(', ')}`);
        }

        const user_names = [
            bookingData.person1_name,
            bookingData.person2_name,
            bookingData.person3_name
        ].filter(name => name && name.trim());

        console.log(`📧 [Booking Email] Sending User Confirmation for Booking #${bookingData.booking_id}`);

        const htmlContent = generateBookingConfirmationEmail({
            booking_id: bookingData.booking_id,
            property_name: bookingData.property_name,
            visit_date: bookingData.visit_date,
            visit_time: bookingData.visit_time,
            amount: bookingData.amount,
            user_phone: bookingData.user_phone,
            user_names: user_names
        });

        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: appName,
                address: process.env.SMTP_USER
            },
            to: bookingData.user_email,
            // BCC REMOVED - Admin will get separate email
            subject: `Site Visit Booking Confirmed - ${appName} (Booking #${bookingData.booking_id})`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ [Booking Email] User email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ [Booking Email] Failed to send user confirmation:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send new booking notification to Admin
 * @param {Object} bookingData - Booking information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAdminBookingNotification = async (bookingData) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ [Admin Notification] ADMIN_EMAIL not set, skipping admin notification.');
            return { success: false, error: 'ADMIN_EMAIL not configured' };
        }

        const user_names = [
            bookingData.person1_name,
            bookingData.person2_name,
            bookingData.person3_name
        ].filter(name => name && name.trim());

        console.log(`📧 [Admin Notification] Sending notification for Booking #${bookingData.booking_id} to ${adminEmail}`);

        const htmlContent = generateAdminBookingNotificationEmail({
            booking_id: bookingData.booking_id,
            property_name: bookingData.property_name,
            property_location: bookingData.property_location,
            visit_date: bookingData.visit_date,
            visit_time: bookingData.visit_time,
            amount: bookingData.amount,
            payment_method: bookingData.payment_method,
            user_name: bookingData.person1_name,
            user_email: bookingData.user_email,
            user_phone: bookingData.user_phone,
            user_names: user_names,
            pickup_address: bookingData.pickup_address
        });

        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: `${appName} System`,
                address: process.env.SMTP_USER
            },
            to: adminEmail,
            subject: `🔔 New Site Visit: #${bookingData.booking_id} - ${bookingData.person1_name}`,
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

export const testSMTPConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ [Booking Email] SMTP connection verified successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ [Booking Email] SMTP connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

export default {
    sendBookingConfirmationEmail,
    sendAdminBookingNotification,
    testSMTPConnection
};
