/**
 * Short Stay Email Service
 * Handles sending transactional emails for Short Stay bookings.
 * Uses Brevo API via utils/sendEmail.js
 */

import { sendEmail } from '../utils/sendEmail.js';
import { generateShortStayTravelerEmail } from '../templates/shortStayTravelerTemplate.js';
import { generateShortStayHostEmail } from '../templates/shortStayHostTemplate.js';

// Helper for retry logic
const sendWithRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`Email attempt ${i + 1} failed. Retrying in ${delay}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
};

export const sendShortStayTravelerEmail = async (bookingData) => {
    try {
        const htmlContent = generateShortStayTravelerEmail(bookingData);

        const result = await sendWithRetry(() => sendEmail({
            to: bookingData.guest_email,
            subject: `Reservation Confirmed: ${bookingData.property_title}`,
            htmlContent: htmlContent,
            recipientName: bookingData.guest_name
        }));

        if (result.success) {
            console.log(`✅ Traveler Email Sent: ${result.messageId}`);
            return { success: true, messageId: result.messageId };
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Failed to send traveler email after retries:', error);
        return { success: false, error: error.message };
    }
};

export const sendShortStayHostEmail = async (bookingData) => {
    try {
        if (!bookingData.host_email) {
            console.warn('Host email missing. Skipping host email.');
            return;
        }

        const htmlContent = generateShortStayHostEmail(bookingData);

        const result = await sendWithRetry(() => sendEmail({
            to: bookingData.host_email,
            subject: `New Booking! ${bookingData.guest_name} arrives ${new Date(bookingData.check_in).toLocaleDateString('en-IN')}`,
            htmlContent: htmlContent,
            recipientName: bookingData.host_name
        }));

        if (result.success) {
            console.log(`✅ Host Email Sent: ${result.messageId}`);
            return { success: true, messageId: result.messageId };
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('❌ Failed to send host email after retries:', error);
        return { success: false, error: error.message };
    }
};
