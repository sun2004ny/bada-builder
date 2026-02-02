/**
 * Complaint Registration Confirmation Email Template
 * Generates HTML email for complaint registration confirmations
 */

/**
 * Generate complaint registration confirmation email HTML
 * @param {Object} data - Complaint data
 * @param {number} data.complaint_id - Unique complaint ID
 * @param {string} data.user_name - Complaint submitter name
 * @param {string} data.user_email - User's email
 * @param {string} data.user_phone - User's phone
 * @param {string} data.complaint_type - Category/type of complaint
 * @param {string} data.location - Complaint location
 * @param {string} data.description - Complaint description
 * @param {string} data.created_date - Complaint submission date
 * @param {string} data.status - Current status
 * @returns {string} HTML email content
 */
export const generateComplaintRegistrationEmail = (data) => {
    const {
        complaint_id,
        user_name,
        user_email,
        user_phone,
        complaint_type,
        location,
        description,
        created_date,
        status = 'Submitted'
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format created date
    const formattedDate = new Date(created_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = new Date(created_date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complaint Registration Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    ${appName}
                  </h1>
                  <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">
                    Complaint Registration Confirmation
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
                    Complaint Registered Successfully
                  </h2>
                  <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; text-align: center; line-height: 1.5;">
                    Thank you for submitting your complaint. We have received it and our team will review it shortly.
                  </p>

                  <!-- Complaint ID Card -->
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b; text-align: center;">
                    <p style="color: #92400e; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">
                      Your Complaint ID
                    </p>
                    <p style="color: #78350f; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                      #${complaint_id}
                    </p>
                    <p style="color: #92400e; margin: 10px 0 0 0; font-size: 12px;">
                      Please save this ID for future reference
                    </p>
                  </div>

                  <!-- Complaint Details Card -->
                  <div style="background-color: #fef2f2; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Complaint Details
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 35%;">
                          <strong>Type:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                          ${complaint_type}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Location:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${location}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
                          <strong>Description:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
                          ${description}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Status:</strong>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                            ${status}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Contact Information Card -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #6b7280;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                      Your Contact Information
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 35%;">
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
                          <strong>Submitted On:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${formattedDate} at ${formattedTime}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                    <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                      📋 What Happens Next?
                    </h4>
                    <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                      <li>Our team will review your complaint within 24-48 hours</li>
                      <li>You'll receive email updates on the status of your complaint</li>
                      <li>We may contact you for additional information if needed</li>
                      <li>You can track your complaint status using the ID above</li>
                    </ul>
                  </div>

                  <!-- Call to Action -->
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
                      Need to add more information or have questions?
                    </p>
                    <a href="mailto:${process.env.ADMIN_EMAIL || 'support@badabuilder.com'}" 
                       style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Contact Support
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
                    This is an automated confirmation email for your complaint registration.
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

export default generateComplaintRegistrationEmail;
