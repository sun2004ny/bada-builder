import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generatePhotographerUserConfirmationEmail } from '../templates/photographerUserConfirmationTemplate.js';
import { generatePhotographerAdminNotificationEmail } from '../templates/photographerAdminNotificationTemplate.js';

dotenv.config();

/**
 * Create SMTP transporter
 * Reuses the same logic as other email services to avoid duplication issues
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
            rejectUnauthorized: false
        }
    };

    return nodemailer.createTransport(config);
};

/**
 * Send Admin and User emails for photographer, agent or influencer registration
 * @param {Object} emailData - Validated registration data including role
 */
export const sendPhotographerEmails = async (emailData) => {
    try {
        const role = emailData.role || 'Photographer';
        const userEmail = emailData.email;
        const userName = emailData.full_name || emailData.name;

        console.log(`📧 [Marketing Email] sendPhotographerEmails called for: ${userEmail} as ${role}`);

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ [Marketing Email] SMTP credentials not configured, skipping emails.');
            return;
        }

        const transporter = createTransporter();
        const adminEmail = process.env.ADMIN_EMAIL;
        const appName = process.env.APP_NAME || 'Bada Builder';

        // 1. Send User Confirmation
        try {
            const userHtml = generatePhotographerUserConfirmationEmail(emailData);

            let userSubject = 'Application Received – Join Our Creative Network';
            if (role === 'Real Estate Agent') userSubject = 'Application Received – Real Estate Partner Program';
            if (role === 'Influencer') userSubject = 'Application Received – Influencer Collaboration';

            await transporter.sendMail({
                from: { name: appName, address: process.env.SMTP_USER },
                to: userEmail,
                subject: userSubject,
                html: userHtml
            });
            console.log(`✅ [Marketing Email] User confirmation sent to ${userEmail}.`);
        } catch (userErr) {
            console.error('❌ [Marketing Email] User confirmation failed:', userErr.message);
        }

        // 2. Send Admin Notification
        if (adminEmail) {
            try {
                const adminHtml = generatePhotographerAdminNotificationEmail(emailData);

                let adminSubject = `New Photographer Application Submitted - ${userName}`;
                if (role === 'Real Estate Agent') adminSubject = `New Real Estate Partner Application - ${userName}`;
                if (role === 'Influencer') adminSubject = `New Influencer Application - ${userName}`;

                await transporter.sendMail({
                    from: { name: `${appName} System`, address: process.env.SMTP_USER },
                    to: adminEmail,
                    replyTo: userEmail,
                    subject: adminSubject,
                    html: adminHtml
                });
                console.log(`✅ [Marketing Email] Admin notification sent for ${role}.`);
            } catch (adminErr) {
                console.error('❌ [Marketing Email] Admin email failed:', adminErr.message);
            }
        }

    } catch (globalErr) {
        console.error('❌ [Marketing Email] Global service error:', globalErr.message);
    }
};

export default {
    sendPhotographerEmails
};
