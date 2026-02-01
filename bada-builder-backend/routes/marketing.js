import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendEmail } from '../utils/sendEmail.js';

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
        body('address').trim().notEmpty().withMessage('Property location is required'),
        body('propertyPrice').trim().notEmpty().withMessage('Property price is required'),
        body('packageTitle').trim().notEmpty().withMessage('Package title is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, phone, address, propertyPrice, packageTitle, packagePrice, packageTarget } = req.body;
            
            // Format property price
            const formattedPrice = new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR',
                maximumFractionDigits: 0 
            }).format(propertyPrice);

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
                                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px;">New Package Inquiry</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin: 0 0 25px 0; font-size: 22px; color: #1e293b; border-bottom: 3px solid #38bdf8; padding-bottom: 15px;">Customer Information</h2>
                                            
                                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Full Name</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Phone Number</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${phone}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Property Price</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0ea5e9; font-weight: 700; font-size: 18px;">${formattedPrice}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; vertical-align: top;">Property Location</td>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; line-height: 1.6;">${address}</td>
                                                </tr>
                                            </table>

                                            <!-- Package Selection -->
                                            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                                                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Selected Package</h3>
                                                <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${packageTitle}</div>
                                                <div style="font-size: 16px; color: #0ea5e9; font-weight: 600;">${packagePrice} <span style="font-size: 14px; color: #64748b; font-weight: 400;">• ${packageTarget}</span></div>
                                            </div>

                                            <!-- Call to Action -->
                                            <p style="margin: 25px 0 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; color: #92400e; font-size: 14px; line-height: 1.6;">
                                                <strong>Action Required:</strong> Please contact this customer as soon as possible to discuss their requirements and finalize the package details.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0; color: #94a3b8; font-size: 13px;">© 2026 Bada Builder • Automated Marketing Inquiry System</p>
                                            <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 11px;">This email was sent by the Bada Builder marketing inquiry form</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            // Send email
            const result = await sendEmail({
                to: '1001_nakul@badabuilder.com',
                subject: `🏠 New Package Inquiry: ${packageTitle} - ${name}`,
                htmlContent: htmlContent,
                textContent: `New inquiry from ${name} (${phone}) for ${packageTitle}. Property Price: ${formattedPrice}. Location: ${address}`
            });

            if (result.success) {
                res.status(200).json({ message: 'Inquiry sent successfully' });
            } else {
                throw new Error(result.error || 'Failed to send email');
            }

        } catch (error) {
            console.error('Marketing inquiry error:', error);
            res.status(500).json({ error: 'Failed to process inquiry. Please try again.' });
        }
    }
);

export default router;
