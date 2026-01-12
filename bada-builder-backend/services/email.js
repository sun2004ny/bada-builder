import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html, text = '') => {
  try {
    const info = await transporter.sendMail({
      from: `"Bada Builder" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Bada Builder, ${name}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>Start exploring properties and find your dream home today!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Welcome to Bada Builder', html);
};

export const sendSiteVisitConfirmation = async (email, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Site Visit Booking Confirmed</h2>
      <p>Hello,</p>
      <p>Your site visit has been confirmed:</p>
      <ul>
        <li><strong>Property:</strong> ${bookingDetails.property_title}</li>
        <li><strong>Location:</strong> ${bookingDetails.property_location}</li>
        <li><strong>Date:</strong> ${bookingDetails.visit_date}</li>
        <li><strong>Time:</strong> ${bookingDetails.visit_time}</li>
        <li><strong>Number of People:</strong> ${bookingDetails.number_of_people}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Site Visit Booking Confirmed', html);
};

export const sendSubscriptionConfirmation = async (email, subscriptionDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Subscription Confirmed</h2>
      <p>Hello,</p>
      <p>Your subscription has been activated:</p>
      <ul>
        <li><strong>Plan:</strong> ${subscriptionDetails.plan}</li>
        <li><strong>Amount:</strong> ₹${subscriptionDetails.price}</li>
        <li><strong>Expiry Date:</strong> ${new Date(subscriptionDetails.expiry).toLocaleDateString()}</li>
      </ul>
      <p>You can now post properties on our platform!</p>
      <p>Best regards,<br>Bada Builder Team</p>
    </div>
  `;

  return sendEmail(email, 'Subscription Confirmed', html);
};

export default transporter;
