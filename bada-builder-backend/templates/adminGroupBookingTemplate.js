/**
 * Admin Group Booking Notification Template
 * Generates HTML email for admin notifications of new live group unit bookings
 */

/**
 * Generate admin group booking notification email HTML
 * @param {Object} data - Booking data
 * @param {number|string} data.booking_id - Booking/Unit ID
 * @param {string} data.user_name - User's name
 * @param {string} data.user_email - User's email
 * @param {string} data.user_phone - User's phone
 * @param {string} data.property_name - Project title
 * @param {string} data.unit_details - Tower, floor, unit number
 * @param {number} data.amount - Amount paid/Unit price
 * @param {string} data.join_date - Booking date
 * @param {string} data.project_location - Property location
 * @param {string} data.developer - Developer name
 * @returns {string} HTML email content
 */
export const generateAdminGroupBookingNotificationEmail = (data) => {
    const {
        booking_id,
        user_name,
        user_email,
        user_phone,
        property_name,
        unit_details,
        amount,
        join_date,
        project_location,
        developer
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format date
    const formattedDate = new Date(join_date).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Live Group Booking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 100%;">
              
              <!-- Admin Header -->
              <tr>
                <td style="background-color: #4f46e5; padding: 20px 30px;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px;">
                    🚀 New Live Group Booking
                  </h2>
                  <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">
                    Unit ID/Booking Ref: #${booking_id}
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Investor Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">
                      👤 Investor Details
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600; font-size: 14px;">Name:</td>
                        <td style="color: #1e293b; font-size: 14px;">${user_name}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Email:</td>
                        <td style="color: #1e293b; font-size: 14px;">${user_email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Phone:</td>
                        <td style="color: #1e293b; font-size: 14px;">${user_phone}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Investment Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 16px;">
                      🏢 Investment & Property
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600; font-size: 14px;">Project:</td>
                        <td style="color: #1e293b; font-size: 14px;"><strong>${property_name}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Developer:</td>
                        <td style="color: #1e293b; font-size: 14px;">${developer}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Location:</td>
                        <td style="color: #1e293b; font-size: 14px;">${project_location}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Unit Details:</td>
                        <td style="color: #1e293b; font-size: 14px; background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                          ${unit_details}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Booking Time:</td>
                        <td style="color: #1e293b; font-size: 14px;">${formattedDate}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Financials -->
                  <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #065f46; font-weight: 600; font-size: 14px;">Unit Value / Amount Paid</td>
                        <td style="color: #059669; font-weight: 700; font-size: 18px; text-align: right;">
                          ₹${amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Actions -->
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${user_email}?subject=Regarding your investment in ${property_name}" 
                       style="display: inline-block; background-color: #ffffff; color: #4f46e5; border: 1px solid #4f46e5; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Contact Investor
                    </a>
                  </div>

                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #cbd5e1;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    System Notification • ${appName} Admin Panel
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
};

export default generateAdminGroupBookingNotificationEmail;
