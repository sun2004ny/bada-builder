/**
 * Admin Complaint Notification Template
 * Generates HTML email for admin notifications of new complaint registrations
 */

/**
 * Generate admin complaint notification email HTML
 * @param {Object} data - Complaint data
 * @param {number|string} data.complaint_id - Unique complaint ID
 * @param {string} data.user_name - Complaint submitter name
 * @param {string} data.user_email - User's email
 * @param {string} data.user_phone - User's phone
 * @param {string} data.complaint_type - Category/type of complaint
 * @param {string} data.location - Complaint location
 * @param {string} data.description - Complaint description
 * @param {string} data.created_date - Complaint submission date
 * @param {string} [data.status] - Current status
 * @returns {string} HTML email content
 */
export const generateAdminComplaintNotificationEmail = (data) => {
    const {
        complaint_id,
        user_name,
        user_email,
        user_phone,
        complaint_type,
        location,
        description,
        created_date,
        status
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    // Format date
    const formattedDate = new Date(created_date).toLocaleString('en-IN', {
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
      <title>New Complaint Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 100%;">
              
              <!-- Admin Header -->
              <tr>
                <td style="background-color: #ef4444; padding: 20px 30px;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px;">
                    🚩 New Complaint Registered
                  </h2>
                  <p style="color: #fee2e2; margin: 5px 0 0 0; font-size: 14px;">
                    Complaint ID: #${complaint_id}
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Submitter Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">
                      👤 Submitter Information
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="30%" style="color: #64748b; font-weight: 600; font-size: 14px;">Name:</td>
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

                  <!-- Complaint Details -->
                  <div style="margin-bottom: 25px;">
                    <h3 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-size: 16px;">
                      📝 Complaint Details
                    </h3>
                    <table width="100%" cellpadding="5">
                      <tr>
                        <td width="30%" style="color: #64748b; font-weight: 600; font-size: 14px;">Type:</td>
                        <td style="color: #1e293b; font-size: 14px; background-color: #fef2f2; padding: 2px 6px; border-radius: 4px; display: inline-block; color: #b91c1c;">
                          ${complaint_type}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Location:</td>
                        <td style="color: #1e293b; font-size: 14px;">${location}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; font-size: 14px;">Time:</td>
                        <td style="color: #1e293b; font-size: 14px;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 10px;">
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                            <span style="color: #64748b; font-weight: 600; font-size: 12px; display: block; margin-bottom: 4px;">Description:</span>
                            <span style="color: #334155; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${description}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Actions -->
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${user_email}?subject=Regarding Complaint #${complaint_id}" 
                       style="display: inline-block; background-color: #ffffff; color: #ef4444; border: 1px solid #ef4444; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Reply to User
                    </a>
                  </div>

                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #cbd5e1;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    System Notification • ${appName} Support
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

export default generateAdminComplaintNotificationEmail;
