/**
 * Marketing User Confirmation Email Template
 * Friendly confirmation for the user after booking a marketing package
 */

export const generateMarketingUserConfirmationEmail = (data) => {
    const {
        name,
        packageName,
        shootDate,
        timeSlot,
        address
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format shoot date if provided
    const formattedDate = shootDate ? new Date(shootDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'To be confirmed';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .wrapper { width: 100%; background-color: #f5f5f5; padding: 20px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .welcome { font-size: 24px; color: #1f2937; margin-top: 0; text-align: center; }
            .confirmation-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
            .confirmation-box p { margin: 0; color: #166534; font-weight: 600; font-size: 18px; }
            .details-list { list-style: none; padding: 20px; background: #f9fafb; border-radius: 8px; margin: 25px 0; }
            .details-list li { margin-bottom: 12px; display: flex; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .details-list li:last-child { border-bottom: none; }
            .label { color: #6b7280; width: 120px; font-weight: 600; font-size: 14px; }
            .val { color: #1f2937; font-weight: 500; font-size: 14px; }
            .cta-section { text-align: center; margin: 35px 0 10px; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; color: #9ca3af; font-size: 13px; }
            .next-steps { margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 25px; }
            .next-steps h4 { color: #1f2937; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1>${appName}</h1>
                </div>
                
                <div class="content">
                    <h2 class="welcome">Booking Confirmed! 🎉</h2>
                    <p style="text-align: center; color: #6b7280;">Dear ${name}, thank you for choosing ${appName} for your marketing needs.</p>
                    
                    <div class="confirmation-box">
                        <p>Your ${packageName} is booked!</p>
                    </div>

                    <ul class="details-list">
                        <li><span class="label">Package:</span> <span class="val">${packageName}</span></li>
                        <li><span class="label">Schedule:</span> <span class="val">${formattedDate}</span></li>
                        <li><span class="label">Time:</span> <span class="val">${timeSlot || 'Pending Confirmation'}</span></li>
                        <li><span class="label">Location:</span> <span class="val">${address || 'As specified'}</span></li>
                    </ul>

                    <div class="next-steps">
                        <h4>What happens next?</h4>
                        <ol style="color: #4b5563; font-size: 14px; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">Our production team will review your booking details.</li>
                            <li style="margin-bottom: 10px;">A manager will call you within 24 hours to confirm the logistics.</li>
                            <li style="margin-bottom: 10px;">The shoot will proceed as per the finalized schedule.</li>
                        </ol>
                    </div>

                    <div class="cta-section">
                        <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">Have questions? We're here to help.</p>
                        <a href="mailto:support@badabuilder.com" style="background: #2563eb; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Contact Support</a>
                    </div>
                </div>

                <div class="footer">
                    <p>© 2026 ${appName}. All rights reserved.</p>
                    <p style="margin-top: 5px;">This is an automated confirmation of your booking.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
