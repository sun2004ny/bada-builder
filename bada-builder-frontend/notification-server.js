// Notification Server for Site Visit Bookings
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Admin contact details
const ADMIN_EMAIL = 'nakulagrawal987@gmail.com';
const ADMIN_PHONE = '7984371588';

// Email configuration (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
  }
});

// Send Email Notification
async function sendEmailNotification(bookingData) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #58335e 0%, #6d4575 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #58335e; margin-bottom: 10px; border-bottom: 2px solid #58335e; padding-bottom: 5px; }
        .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; width: 180px; color: #666; }
        .detail-value { flex: 1; color: #1a1a1a; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; border-radius: 4px; }
        .footer { background: #1a1a1a; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 New Site Visit Booking</h1>
          <p style="margin: 5px 0;">Bada Builder - Property Management</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>⚡ Action Required:</strong> A new site visit has been booked. Please review the details below and arrange the visit accordingly.
          </div>

          <div class="section">
            <div class="section-title">📍 Property Details</div>
            <div class="detail-row">
              <span class="detail-label">Property Name:</span>
              <span class="detail-value"><strong>${bookingData.property_title}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property ID:</span>
              <span class="detail-value">${bookingData.property_id}</span>
            </div>
            ${bookingData.property_location ? `
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${bookingData.property_location}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">👤 Customer Details</div>
            <div class="detail-row">
              <span class="detail-label">Customer Email:</span>
              <span class="detail-value">${bookingData.user_email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer ID:</span>
              <span class="detail-value">${bookingData.user_id}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📅 Visit Schedule</div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value"><strong>${bookingData.visit_date}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value"><strong>${bookingData.visit_time}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">1 Hour (₹300)</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👥 Visitors (${bookingData.number_of_people} ${bookingData.number_of_people > 1 ? 'People' : 'Person'})</div>
            <div class="detail-row">
              <span class="detail-label">1st Person:</span>
              <span class="detail-value"><strong>${bookingData.person1_name}</strong></span>
            </div>
            ${bookingData.person2_name ? `
            <div class="detail-row">
              <span class="detail-label">2nd Person:</span>
              <span class="detail-value"><strong>${bookingData.person2_name}</strong></span>
            </div>
            ` : ''}
            ${bookingData.person3_name ? `
            <div class="detail-row">
              <span class="detail-label">3rd Person:</span>
              <span class="detail-value"><strong>${bookingData.person3_name}</strong></span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">🚗 Pickup Details</div>
            <div class="detail-row">
              <span class="detail-label">Pickup Address:</span>
              <span class="detail-value">${bookingData.pickup_address}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💳 Payment Information</div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">
                <span class="badge">${bookingData.payment_method === 'previsit' ? 'Pre-Visit' : 'Post-Visit'}</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Base Charge:</span>
              <span class="detail-value">₹300 (1 Hour)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Additional:</span>
              <span class="detail-value">₹5 per minute after 1 hour</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ℹ️ Booking Information</div>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${bookingData.booking_id || 'Auto-generated'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Time:</span>
              <span class="detail-value">${new Date(bookingData.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value"><span class="badge" style="background: #f59e0b;">Pending</span></span>
            </div>
          </div>

          <div class="highlight" style="background: #dbeafe; border-left-color: #3b82f6;">
            <strong>📝 Next Steps:</strong>
            <ol style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Arrange car for pickup at the specified address</li>
              <li>Confirm availability of property for viewing</li>
              <li>Contact customer at: <strong>${bookingData.user_email}</strong></li>
              <li>Prepare property documents if needed</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 5px 0;">Bada Builder - Real Estate Management System</p>
          <p style="margin: 5px 0; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `🏠 New Site Visit Booking - ${bookingData.property_title} - ${bookingData.visit_date}`,
    html: emailHTML,
    text: `
NEW SITE VISIT BOOKING

Property: ${bookingData.property_title}
Property ID: ${bookingData.property_id}

Customer: ${bookingData.user_email}

Visit Date: ${bookingData.visit_date}
Visit Time: ${bookingData.visit_time}

Number of People: ${bookingData.number_of_people}
1st Person: ${bookingData.person1_name}
${bookingData.person2_name ? `2nd Person: ${bookingData.person2_name}` : ''}
${bookingData.person3_name ? `3rd Person: ${bookingData.person3_name}` : ''}

Pickup Address: ${bookingData.pickup_address}

Payment Method: ${bookingData.payment_method}

Booking Time: ${new Date(bookingData.created_at).toLocaleString('en-IN')}
    `
  };

  await transporter.sendMail(mailOptions);
}

// Send SMS Notification
async function sendSMSNotification(bookingData) {
  const message = `New Site Visit Booking!
Property: ${bookingData.property_title}
Date: ${bookingData.visit_date}
Time: ${bookingData.visit_time}
People: ${bookingData.number_of_people}
Visitor: ${bookingData.person1_name}
Pickup: ${bookingData.pickup_address.substring(0, 50)}...
Payment: ${bookingData.payment_method}
Check email for full details.`;

  // Using Fast2SMS (you can also use MSG91 or Twilio)
  const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
  
  if (FAST2SMS_API_KEY) {
    try {
      await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'v3',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: ADMIN_PHONE
      }, {
        headers: {
          'authorization': FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ SMS sent to ${ADMIN_PHONE}`);
    } catch (error) {
      console.error('SMS sending failed:', error.message);
    }
  } else {
    console.log(`⚠️ SMS API key not configured. Would send to: ${ADMIN_PHONE}`);
    console.log(`Message: ${message}`);
  }
}

// API Endpoint to send notifications
app.post('/api/notify-booking', async (req, res) => {
  try {
    const bookingData = req.body;

    console.log('📧 Sending email notification...');
    await sendEmailNotification(bookingData);
    console.log('✅ Email sent successfully');

    console.log('📱 Sending SMS notification...');
    await sendSMSNotification(bookingData);
    console.log('✅ SMS sent successfully');

    res.json({ 
      success: true, 
      message: 'Notifications sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Notification server is running' });
});

const PORT = process.env.NOTIFICATION_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Notification Server running on port ${PORT}`);
  console.log(`📧 Email notifications will be sent to: ${ADMIN_EMAIL}`);
  console.log(`📱 SMS notifications will be sent to: ${ADMIN_PHONE}`);
  console.log(`\n📍 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/notify-booking`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});
