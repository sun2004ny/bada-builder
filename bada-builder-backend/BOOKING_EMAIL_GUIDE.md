# SMTP Email Integration - Usage Guide

## Overview

The booking email system uses **Gmail SMTP** to send site visit confirmation emails. This is completely separate from the **Brevo API** system used for login/register/OTP emails.

## Email Systems

| System | Purpose | Configuration |
|--------|---------|---------------|
| **Brevo API** | Login, Register, OTP, Password Reset | `BREVO_API_KEY`, `BREVO_EMAIL` |
| **Gmail SMTP** | Site Visit Booking Confirmations | `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT` |

## Environment Variables

Required variables in `.env`:

```env
# Gmail SMTP Configuration (for booking emails)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Admin email (receives BCC of all booking confirmations)
ADMIN_EMAIL=admin@yourdomain.com

# App name (used in email branding)
APP_NAME=Bada Builder
```

### Getting Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this password in `SMTP_PASS`

## Usage

### Sending Booking Confirmation Email

```javascript
import { sendBookingConfirmationEmail } from './services/bookingEmailService.js';

// After successful booking/payment
const result = await sendBookingConfirmationEmail({
  booking_id: 12345,
  property_name: 'Luxury Villa in Bandra',
  visit_date: '2026-02-10',
  visit_time: '10:00 AM - 11:00 AM',
  amount: 300,
  user_email: 'user@example.com',
  user_phone: '+91 98765 43210',
  person1_name: 'John Doe',
  person2_name: 'Jane Doe',      // Optional
  person3_name: 'Bob Smith'       // Optional
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Email Features

✅ **Dynamic User Support**: Automatically handles 1-3 users per booking  
✅ **Professional Template**: Responsive HTML design with company branding  
✅ **Admin BCC**: Admin receives copy of all booking confirmations  
✅ **Error Handling**: Email failures don't break booking flow  
✅ **Detailed Logging**: All email operations are logged for debugging  

## Testing

### Test SMTP Email Service

```bash
node test-booking-email.js
```

This will:
- Test SMTP connection
- Send test emails with 3 users
- Send test emails with 1 user
- Verify emails in your inbox

### Test Brevo OTP System

```bash
node test-otp-system.js
```

Verifies the existing OTP system is unaffected.

## Email Template

The booking confirmation email includes:

- ✅ Success icon and confirmation message
- 📋 Booking details (ID, property, date, time, phone)
- 👥 List of all visitors (1-3 people)
- 💰 Payment confirmation
- 📌 Important notes and instructions
- 📧 Contact support button

## Error Handling

Email sending is wrapped in try-catch blocks and runs asynchronously:

```javascript
sendBookingConfirmationEmail(data).catch(err => {
  console.error('Email failed (non-critical):', err.message);
});
```

**Result**: Email failures are logged but don't break the booking/payment flow.

## Troubleshooting

### Email not sending

1. Check SMTP credentials in `.env`
2. Verify Gmail app password is correct
3. Check server logs for detailed error messages
4. Test SMTP connection: `node test-booking-email.js`

### Gmail blocking emails

- Enable "Less secure app access" (not recommended)
- Use App Password instead (recommended)
- Check Gmail account for security alerts

### Admin not receiving BCC

- Verify `ADMIN_EMAIL` is set in `.env`
- Check admin spam folder
- Verify admin email is valid

## File Structure

```
bada-builder-backend/
├── services/
│   ├── bookingEmailService.js    # SMTP email service
│   └── otp.js                     # Brevo OTP service (unchanged)
├── templates/
│   └── bookingConfirmationTemplate.js  # HTML email template
├── routes/
│   └── bookings.js                # Integrated email sending
├── utils/
│   └── sendEmail.js               # Brevo API (unchanged)
└── test-booking-email.js          # Email test script
```

## Integration Points

### 1. Post-Visit Booking (No Upfront Payment)

**File**: `routes/bookings.js` (lines 108-123)

Email sent immediately after booking creation with `amount: 0`.

### 2. Pre-Visit Payment (Razorpay)

**File**: `routes/bookings.js` (lines 165-180)

Email sent after successful payment verification with actual payment amount.

## Important Notes

⚠️ **Do NOT modify** `utils/sendEmail.js` - it's used for OTP/auth emails via Brevo  
⚠️ **Do NOT modify** `services/otp.js` - it's the existing OTP system  
✅ **Only use** `services/bookingEmailService.js` for booking emails  

## Support

For issues or questions:
- Check server logs for detailed error messages
- Run test scripts to verify configuration
- Review environment variables
- Contact system administrator
