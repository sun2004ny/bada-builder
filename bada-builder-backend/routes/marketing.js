import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendEmail } from '../utils/sendEmail.js';
import { sendMarketingEmails } from '../services/marketingEmailService.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * @route POST /api/marketing/inquiry
 * @desc Send marketing package inquiry email to [EMAIL_ADDRESS]
 * @access Public
 */
router.post(
    '/inquiry',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('packageTitle').trim().notEmpty().withMessage('Package title is required')
    ],
    async (req, res) => {
        const client = await pool.connect();
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, phone, address, propertyPrice, packageTitle, packagePrice, packageTarget, email, shootDate, timeSlot, buildingLandmark, city, state, pincode, paymentPreference, paymentId, status } = req.body;

            // Determine form_type
            // If paymentPreference is present, it's a BOOKING (either Pre-shoot or Post-shoot)
            // If strictly inquiry for custom packages, it might not have paymentPreference
            const formType = paymentPreference ? 'BOOKING' : 'INQUIRY';

            // Start transaction
            await client.query('BEGIN');

            // Insert into Database
            const insertQuery = `
                INSERT INTO marketing_photographers (
                    form_type, name, phone, email, shoot_date, time_slot, 
                    building_landmark, city, state, pincode, address, 
                    property_price, payment_preference, package_title, 
                    package_price, package_target, status, payment_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
                ) RETURNING id;
            `;

            const values = [
                formType,
                name,
                phone,
                email || null,
                shootDate || null,
                timeSlot || null,
                buildingLandmark || null,
                city,
                state,
                pincode,
                address || null, // Address is optional as per new requirement, though validated as required in some frontend parts, we allow null in DB
                propertyPrice || null,
                paymentPreference || null,
                packageTitle,
                packagePrice || null,
                packageTarget || null,
                status || 'PENDING',
                paymentId || null
            ];

            const dbResult = await client.query(insertQuery, values);
            const inquiryId = dbResult.rows[0].id;

            // Format property price
            const formattedPrice = propertyPrice ? new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(propertyPrice) : 'N/A';

            // Premium Email Template
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 40px 0;">
                                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">BADA BUILDER</h1>
                                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px;">New ${formType.toLowerCase()} Received</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin: 0 0 25px 0; font-size: 22px; color: #1e293b; border-bottom: 3px solid #38bdf8; padding-bottom: 15px;">Customer Information</h2>
                                            
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">ID</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${inquiryId}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Full Name</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Phone Number</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${phone}</td>
                                                </tr>
                                                ${email ? `
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Email</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${email}</td>
                                                </tr>` : ''}
                                                ${propertyPrice ? `
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Property Price</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0ea5e9; font-weight: 700; font-size: 18px;">${formattedPrice}</td>
                                                </tr>` : ''}
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; vertical-align: top;">Location</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; line-height: 1.6;">${city}, ${state} (${pincode})</td>
                                                </tr>
                                                ${address ? `
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; vertical-align: top;">Full Address</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; line-height: 1.6;">${address}</td>
                                                </tr>` : ''}
                                            </table>

                                            <!-- Package Selection -->
                                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                                                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Selected Package</h3>
                                                <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${packageTitle}</div>
                                                <div style="font-size: 16px; color: #0ea5e9; font-weight: 600;">${packagePrice} <span style="font-size: 14px; color: #64748b; font-weight: 400;">• ${packageTarget}</span></div>
                                                ${paymentPreference ? `<div style="margin-top: 10px; font-weight: bold; color: ${status === 'PAID' ? '#10b981' : '#f59e0b'}">Status: ${status} (${paymentPreference})</div>` : ''}
                                            </div>

                                            <!-- Call to Action -->
                                            <p style="margin: 25px 0 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; color: #92400e; font-size: 14px; line-height: 1.6;">
                                                <strong>Action Required:</strong> Please contact this customer as soon as possible.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0; color: #94a3b8; font-size: 13px;">© 2026 Bada Builder • System Notification</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            // ⚠️ [Refactored] Use SMTP service for Admin and User emails
            // This runs asynchronously and won't block the booking flow
            sendMarketingEmails({
                inquiryId,
                formType,
                name,
                phone,
                email,
                packageName: packageTitle,
                packagePrice,
                packageTarget,
                shootDate,
                timeSlot,
                address,
                paymentType: paymentPreference || (formType === 'INQUIRY' ? 'Notify Me' : 'Postpaid'),
                submittedAt: new Date().toLocaleString('en-IN')
            }).catch(err => console.error('❌ [Marketing Email] Background sending failed:', err));

            await client.query('COMMIT');

            res.status(200).json({
                message: 'Submitted successfully',
                id: inquiryId
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Marketing inquiry error:', error);
            res.status(500).json({ error: 'Failed to process request. Please try again.' });
        } finally {
            client.release();
        }
    }
);

export default router;
