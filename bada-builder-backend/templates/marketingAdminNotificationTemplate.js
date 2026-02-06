/**
 * Marketing Admin Notification Email Template
 * Detailed report for admin when a new marketing package is booked
 */

export const generateMarketingAdminNotificationEmail = (data) => {
    const {
        inquiryId,
        formType,
        name,
        phone,
        email,
        packageName,
        packagePrice,
        packageTarget,
        shootDate,
        timeSlot,
        address,
        paymentType,
        submittedAt = new Date().toLocaleString('en-IN')
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
            .container { max-width: 650px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: #0f172a; color: #fff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 10px; background: #38bdf8; color: #0f172a; }
            .content { padding: 35px; }
            .section-title { font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .data-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
            .label { font-weight: 600; color: #475569; width: 35%; }
            .value { color: #1e293b; }
            .package-box { background: #f8fafc; border-radius: 8px; border-left: 5px solid #0ea5e9; padding: 20px; margin-bottom: 30px; }
            .package-title { font-size: 18px; font-weight: bold; color: #0f172a; }
            .package-detail { font-size: 14px; color: #0ea5e9; font-weight: 600; margin-top: 5px; }
            .footer { background: #f8fafc; padding: 25px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${appName} Admin</h1>
                <div class="badge">New ${formType}</div>
            </div>
            
            <div class="content">
                <div class="section-title">Submission Details</div>
                <table class="data-table">
                    <tr>
                        <td class="label">Booking ID</td>
                        <td class="value">#${inquiryId}</td>
                    </tr>
                    <tr>
                        <td class="label">Submitted At</td>
                        <td class="value">${submittedAt}</td>
                    </tr>
                    <tr>
                        <td class="label">Payment Type</td>
                        <td class="value"><strong>${paymentType || 'Not Specified'}</strong></td>
                    </tr>
                </table>

                <div class="section-title">Customer Contact</div>
                <table class="data-table">
                    <tr>
                        <td class="label">Full Name</td>
                        <td class="value">${name}</td>
                    </tr>
                    <tr>
                        <td class="label">Phone</td>
                        <td class="value">${phone}</td>
                    </tr>
                    <tr>
                        <td class="label">Email</td>
                        <td class="value">${email || 'N/A'}</td>
                    </tr>
                </table>

                <div class="section-title">Selected Package</div>
                <div class="package-box">
                    <div class="package-title">${packageName}</div>
                    <div class="package-detail">${packagePrice} &bull; ${packageTarget}</div>
                </div>

                <div class="section-title">Logistics</div>
                <table class="data-table">
                    <tr>
                        <td class="label">Shoot Date</td>
                        <td class="value">${shootDate || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="label">Time Slot</td>
                        <td class="value">${timeSlot || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="label">Address</td>
                        <td class="value">${address || 'N/A'}</td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                &copy; 2026 ${appName} Internal System Notification
            </div>
        </div>
    </body>
    </html>
    `;
};
