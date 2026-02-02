/**
 * Admin Booking Notification Template
 * Generates HTML email for admin notifications of new site visit bookings
 */

/**
 * Generate admin booking notification email HTML
 * @param {Object} data - Booking data
 * @param {string} data.booking_id - Booking ID
 * @param {string} data.property_name - Property title
 * @param {string} data.property_location - Property location
 * @param {string} data.visit_date - Visit date
 * @param {string} data.visit_time - Visit time
 * @param {number} data.amount - Payment amount or 0
 * @param {string} data.payment_method - Payment method (postvisit/previsit)
 * @param {string} data.user_name - Primary user name
 * @param {string} data.user_email - User email
 * @param {string} data.user_phone - User contact phone
 * @param {Array<string>} data.user_names - Array of all visitor names
 * @param {string} [data.pickup_address] - Pickup address (optional)
 * @returns {string} HTML email content
 */
export const generateAdminBookingNotificationEmail = (data) => {
    const {
        booking_id,
        property_name,
        property_location,
        visit_date,
        visit_time,
        amount,
        payment_method,
        user_name,
        user_email,
        user_phone,
        user_names = [],
        pickup_address
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format visit date
    const formattedDate = new Date(visit_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const paymentStatus = amount > 0 ? 'Paid' : 'Pending/Pay at Site';
    const paymentColor = amount > 0 ? '#10b981' : '#f59e0b';

    // Generate user names list HTML
    const userNamesHTML = user_names
        .filter(name => name && name.trim())
        .map((name, index) => `
      <tr>
        <td style="padding: 5px 0; color: #333;">
          ${index + 1}. ${name}
        </td>
      </tr>
    `)
        .join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Site Visit Booking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #d1d5db; max-width: 100%;">
              
              <!-- Admin Header -->
              <tr>
                <td style="background-color: #1e293b; padding: 20px 30px; text-align: left;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px;">
                    🔔 New Site Visit Booking
                  </h2>
                  <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">
                    Booking ID: #${booking_id}
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Customer Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">
                      👤 Customer Details
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="30%" style="color: #64748b; font-weight: 600;">Name:</td>
                        <td style="color: #1e293b;">${user_name}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Email:</td>
                        <td style="color: #1e293b;">${user_email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Phone:</td>
                        <td style="color: #1e293b;">${user_phone}</td>
                      </tr>
                      ${pickup_address ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Pickup Addr:</td>
                        <td style="color: #1e293b;">${pickup_address}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>

                  <!-- Booking Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                      📍 Visit Details
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="30%" style="color: #64748b; font-weight: 600;">Property:</td>
                        <td style="color: #1e293b;"><strong>${property_name}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Location:</td>
                        <td style="color: #1e293b;">${property_location || 'Not Specified'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Date:</td>
                        <td style="color: #1e293b;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Time:</td>
                        <td style="color: #1e293b;">${visit_time}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Payment:</td>
                        <td style="color: #1e293b;">
                          <span style="background-color: ${paymentColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            ${paymentStatus} (₹${amount})
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Visitor List -->
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 10px 0; color: #475569;">👥 Visitor Group (${user_names.length})</h4>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${userNamesHTML}
                    </table>
                  </div>

                  <!-- Action Buttons -->
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${user_email}" style="display: inline-block; background-color: #fff; color: #2563eb; border: 1px solid #2563eb; padding: 8px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px; font-weight: 500;">
                      Reply to Customer
                    </a>
                  </div>

                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                  System Notification • ${appName} Admin Panel
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

export default generateAdminBookingNotificationEmail;
