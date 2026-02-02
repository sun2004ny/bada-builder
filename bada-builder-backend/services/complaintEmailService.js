/**
 * Complaint Registration Email Service - SMTP Integration
 * Dedicated service for sending complaint registration confirmation emails
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
import { generateComplaintRegistrationEmail } from '../templates/complaintRegistrationTemplate.js';
import { generateAdminComplaintNotificationEmail } from '../templates/adminComplaintNotificationTemplate.js';

dotenv.config();

// ... (createTransporter remains same)

/**
 * Send complaint registration confirmation email to user (User Only)
 * @param {Object} complaintData - Complaint information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendComplaintRegistrationEmail = async (complaintData) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured.');
        }

        const requiredFields = [
            'complaint_id', 'user_name', 'user_email', 'user_phone',
            'complaint_type', 'location', 'description', 'created_date'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = complaintData[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required complaint data: ${missingFields.join(', ')}`);
        }

        console.log(`📧 [Complaint Email] Sending User Confirmation for Complaint #${complaintData.complaint_id}`);

        const htmlContent = generateComplaintRegistrationEmail(complaintData);
        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: appName,
                address: process.env.SMTP_USER
            },
            to: complaintData.user_email,
            // BCC REMOVED - Admin gets separate email
            subject: `Complaint Registered - ${appName} (ID: #${complaintData.complaint_id})`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [Complaint Email] User email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ [Complaint Email] Failed to send user confirmation:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send complaint notification to Admin
 * @param {Object} complaintData - Complaint information
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendAdminComplaintNotification = async (complaintData) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ [Admin Notification] ADMIN_EMAIL not set, skipping admin notification.');
            return { success: false, error: 'ADMIN_EMAIL not configured' };
        }

        const requiredFields = [
            'complaint_id', 'user_name', 'user_email', 'user_phone',
            'complaint_type', 'location', 'description', 'created_date'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = complaintData[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required complaint data: ${missingFields.join(', ')}`);
        }

        console.log(`📧 [Admin Notification] Sending Complaint Notification for #${complaintData.complaint_id} to ${adminEmail}`);

        const htmlContent = generateAdminComplaintNotificationEmail(complaintData);
        const transporter = createTransporter();
        const appName = process.env.APP_NAME || 'Bada Builder';

        const mailOptions = {
            from: {
                name: `${appName} System`,
                address: process.env.SMTP_USER
            },
            to: adminEmail,
            subject: `🚩 New Complaint: #${complaintData.complaint_id} - ${complaintData.complaint_type}`,
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

        console.log('✅ [Complaint Email] SMTP connection verified successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ [Complaint Email] SMTP connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

export default {
    sendComplaintRegistrationEmail,
    sendAdminComplaintNotification,
    testSMTPConnection
};
