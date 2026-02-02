/**
 * Booking Confirmation Email Template
 * Generates HTML email for site visit booking confirmations
 * Supports 1-3 users dynamically
 */

/**
 * Generate booking confirmation email HTML
 * @param {Object} data - Booking data
 * @param {string} data.booking_id - Booking ID
 * @param {string} data.property_name - Property title
 * @param {string} data.visit_date - Visit date
 * @param {string} data.visit_time - Visit time
 * @param {number} data.amount - Payment amount
 * @param {string} data.user_phone - User contact phone
 * @param {Array<string>} data.user_names - Array of user names (1-3)
 * @returns {string} HTML email content
 */
export const generateBookingConfirmationEmail = (data) => {
    const {
        booking_id,
        property_name,
        visit_date,
        visit_time,
        amount,
        user_phone,
        user_names = []
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format visit date
    const formattedDate = new Date(visit_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate user names list HTML
    const userNamesHTML = user_names
        .filter(name => name && name.trim())
        .map((name, index) => `
      <tr>
        <td style="padding: 8px 0; color: #555; font-size: 15px;">
          <strong>Person ${index + 1}:</strong> ${name}
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
      <title>Site Visit Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    ${appName}
                  </h1>
                  <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">
                    Your Trusted Real Estate Partner
                  </p>
                </td>
              </tr>

              <!-- Success Icon -->
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #ffffff; font-size: 48px; line-height: 80px;">✓</span>
                  </div>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; text-align: center;">
                    Booking Confirmed!
                  </h2>
                  <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; text-align: center; line-height: 1.5;">
                    Your site visit has been successfully booked and payment confirmed. We look forward to showing you the property!
                  </p>

                  <!-- Booking Details Card -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Booking Details
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">
                          <strong>Booking ID:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                          #${booking_id}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Property:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${property_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Visit Date:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Visit Time:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${visit_time}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Contact Phone:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${user_phone}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Visitors Card -->
                  <div style="background-color: #f0f9ff; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Visitors (${user_names.filter(n => n && n.trim()).length})
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${userNamesHTML}
                    </table>
                  </div>

                  <!-- Payment Card -->
                  <div style="background-color: #ecfdf5; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Payment Confirmed
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Amount Paid:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #059669; font-size: 20px; font-weight: 700; text-align: right;">
                          ₹${amount}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Important Notes -->
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                      📌 Important Notes
                    </h4>
                    <ul style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                      <li>Please arrive 10 minutes before your scheduled time</li>
                      <li>Bring a valid ID proof for verification</li>
                      <li>Our representative will contact you 24 hours before the visit</li>
                      <li>For any changes, please contact us at least 24 hours in advance</li>
                    </ul>
                  </div>

                  <!-- Call to Action -->
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                      Need to make changes to your booking?
                    </p>
                    <a href="mailto:${process.env.ADMIN_EMAIL || 'support@badabuilder.com'}" 
                       style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Contact Support
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
                    This is an automated confirmation email for your site visit booking.
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.
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

export default generateBookingConfirmationEmail;
