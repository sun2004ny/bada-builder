/**
 * Group Property Booking Confirmation Email Template
 * Generates HTML email for live group property booking confirmations
 */

/**
 * Generate group property booking confirmation email HTML
 * @param {Object} data - Booking data
 * @param {string} data.booking_id - Booking/Unit ID
 * @param {string} data.user_name - User's name
 * @param {string} data.user_email - User's email
 * @param {string} data.user_phone - User's phone
 * @param {string} data.property_name - Project title
 * @param {string} data.unit_details - Tower, floor, unit number
 * @param {number} data.amount - Unit price
 * @param {string} data.join_date - Booking date
 * @param {string} data.project_location - Property location
 * @param {string} data.developer - Developer name
 * @param {string} [data.unit_type] - Unit type (e.g., 2BHK)
 * @param {number} [data.area] - Unit area
 * @returns {string} HTML email content
 */
export const generateGroupPropertyBookingEmail = (data) => {
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
        developer,
        unit_type = '',
        area = null
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format join date
    const formattedDate = new Date(join_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = new Date(join_date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Group Property Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    ${appName}
                  </h1>
                  <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">
                    Live Group Property Booking
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
                    Congratulations! 🎉
                  </h2>
                  <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; text-align: center; line-height: 1.5;">
                    You've successfully joined the live group for this property! Your booking has been confirmed.
                  </p>

                  <!-- Property Details Card -->
                  <div style="background-color: #faf5ff; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #7c3aed;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Property Details
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">
                          <strong>Project:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                          ${property_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Developer:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${developer || 'Premium Developer'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Location:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${project_location || 'Prime Location'}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Unit Details Card -->
                  <div style="background-color: #f0f9ff; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Your Unit
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">
                          <strong>Unit:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                          ${unit_details}
                        </td>
                      </tr>
                      ${unit_type ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Type:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${unit_type}
                        </td>
                      </tr>
                      ` : ''}
                      ${area ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Area:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${area} sq ft
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Booking ID:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          #${booking_id}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Booking Info Card -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #6b7280;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Booking Information
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">
                          <strong>Name:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${user_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Email:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${user_email}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Phone:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${user_phone}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Joined On:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${formattedDate} at ${formattedTime}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Price Card -->
                  <div style="background-color: #ecfdf5; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                      Unit Price
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Group Price:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #059669; font-size: 24px; font-weight: 700; text-align: right;">
                          ${formattedAmount}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                      📌 Next Steps
                    </h4>
                    <ul style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                      <li>Our team will contact you within 24-48 hours</li>
                      <li>You'll receive updates on the group progress</li>
                      <li>Payment schedule will be shared via email</li>
                      <li>Keep this email for your records</li>
                    </ul>
                  </div>

                  <!-- Call to Action -->
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                      Have questions about your booking?
                    </p>
                    <a href="mailto:${process.env.ADMIN_EMAIL || 'support@badabuilder.com'}" 
                       style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Contact Support
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
                    This is an automated confirmation email for your live group property booking.
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

export default generateGroupPropertyBookingEmail;
