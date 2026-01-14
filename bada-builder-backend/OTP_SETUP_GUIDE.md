# Email OTP Verification System - Setup Guide

## 📋 Overview

This guide will help you set up the Email OTP verification system for user registration in your Bada Builder application.

---

## 🚀 Quick Start

### Step 1: Install Dependencies

All required dependencies are already installed:
- ✅ `nodemailer` - Email sending
- ✅ `uuid` - Secure token generation (built-in with PostgreSQL)
- ✅ `pg` - PostgreSQL client
- ✅ `bcryptjs` - Password hashing
- ✅ `express-validator` - Input validation

### Step 2: Configure Environment Variables

Your `.env` file already has the required email configuration:

```env
# Email (SMTP) - Already configured
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ayushzala4460@gmail.com
SMTP_PASS="ombq ghse xhcw dyuz"
SMTP_FROM=noreply@badabuilder.com
```

**Note:** For production, consider using a dedicated email service like:
- SendGrid
- AWS SES
- Mailgun
- Postmark

### Step 3: Create Database Tables

Run the migration script to create the OTP tables:

```bash
cd bada-builder-backend
node scripts/create-otp-tables.js
```

This will:
- Create the `email_otps` table
- Add `is_verified` column to `users` table
- Create necessary indexes

### Step 4: Start the Backend Server

```bash
cd bada-builder-backend
npm run dev
```

The server will start on `http://localhost:5000`

### Step 5: Test the API

Use the health check endpoint:
```bash
curl http://localhost:5000/health
```

---

## 📁 File Structure

```
bada-builder-backend/
├── config/
│   └── database.js              # Neon DB connection
├── routes/
│   ├── auth.js                  # Existing auth routes
│   └── otp.js                   # NEW: OTP routes
├── services/
│   ├── email.js                 # Email service (updated)
│   └── otp.js                   # NEW: OTP service
├── scripts/
│   └── create-otp-tables.js     # NEW: Database migration
├── server.js                    # Main server (updated)
├── OTP_API_DOCUMENTATION.md     # NEW: API docs
└── OTP_SETUP_GUIDE.md          # NEW: This file

bada-builder-frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx            # Existing login page
│   │   └── RegisterWithOTP.jsx  # NEW: Registration with OTP
│   └── App.jsx                  # Updated with new route
```

---

## 🔧 Configuration Details

### Database Schema

**email_otps table:**
```sql
CREATE TABLE email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**users table (updated):**
```sql
ALTER TABLE users 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
```

### API Endpoints

1. **Send OTP:** `POST /api/otp/send-otp`
2. **Verify & Register:** `POST /api/otp/verify-and-register`
3. **Resend OTP:** `POST /api/otp/resend-otp`

---

## 🎨 Frontend Setup

### Step 1: Update Frontend Environment

Check your `bada-builder-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Start Frontend

```bash
cd bada-builder-frontend
npm run dev
```

### Step 3: Access Registration Page

Navigate to: `http://localhost:5173/register`

---

## 🧪 Testing the System

### Manual Testing Flow:

1. **Open Registration Page:**
   - Go to `http://localhost:5173/register`

2. **Fill Registration Form:**
   - Name: Test User
   - Email: your-email@example.com
   - Password: password123
   - Confirm Password: password123

3. **Click "Send OTP":**
   - Check your email inbox
   - You should receive a 6-digit OTP

4. **Enter OTP:**
   - Enter the 6-digit code
   - Click "Verify & Register"

5. **Success:**
   - You'll be redirected to login page
   - Login with your credentials

### API Testing with cURL:

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# 2. Check your email for OTP

# 3. Verify and Register
curl -X POST http://localhost:5000/api/otp/verify-and-register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otp":"123456",
    "password":"password123",
    "name":"Test User"
  }'
```

---

## 🔐 Security Features

1. **OTP Expiration:** 5 minutes
2. **Single Use:** OTPs deleted after verification
3. **Password Hashing:** bcrypt with 10 rounds
4. **Email Validation:** Format validation
5. **Rate Limiting:** 100 requests per 15 minutes
6. **HTTPS Ready:** Use SSL in production

---

## 🐛 Troubleshooting

### Issue: OTP Email Not Received

**Solutions:**
1. Check spam/junk folder
2. Verify SMTP credentials in `.env`
3. Check email service logs:
   ```bash
   # Backend logs will show email sending status
   npm run dev
   ```
4. Test SMTP connection:
   ```javascript
   // In services/email.js, add:
   transporter.verify((error, success) => {
     if (error) console.log('SMTP Error:', error);
     else console.log('SMTP Ready');
   });
   ```

### Issue: Database Connection Failed

**Solutions:**
1. Verify `DATABASE_URL` in `.env`
2. Check Neon DB dashboard
3. Test connection:
   ```bash
   curl http://localhost:5000/health
   ```

### Issue: OTP Expired

**Solutions:**
1. OTPs expire after 5 minutes
2. Use "Resend OTP" button
3. Check server time is synchronized

### Issue: Registration Failed

**Solutions:**
1. Check all required fields are filled
2. Password must be at least 6 characters
3. Email must not be already registered
4. Check backend logs for detailed errors

---

## 📊 Database Queries

### Check OTPs:
```sql
SELECT * FROM email_otps;
```

### Check Users:
```sql
SELECT id, email, name, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Clean Expired OTPs:
```sql
DELETE FROM email_otps WHERE expires_at < NOW();
```

### Find Unverified Users:
```sql
SELECT email, name, created_at 
FROM users 
WHERE is_verified = FALSE;
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 2. Enable HTTPS

Ensure your server uses HTTPS in production.

### 3. Update CORS

In `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### 4. Set Up Cron Job for Cleanup

Add to your server or use a service like:
```javascript
// Run every hour
setInterval(async () => {
  await cleanupExpiredOTPs();
}, 60 * 60 * 1000);
```

### 5. Monitor Email Delivery

- Set up email delivery monitoring
- Track bounce rates
- Monitor spam complaints

---

## 📈 Performance Optimization

### 1. Database Indexes

Already created:
```sql
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_expires ON email_otps(expires_at);
```

### 2. Connection Pooling

Already configured in `config/database.js`

### 3. Rate Limiting

Already configured in `server.js`:
- 100 requests per 15 minutes per IP

---

## 🔄 Migration from Old System

If you have existing users without OTP verification:

### Option 1: Mark All as Verified
```sql
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;
```

### Option 2: Send Verification Emails
Create a script to send verification emails to existing users.

---

## 📝 Maintenance Tasks

### Daily:
- Monitor email delivery rates
- Check for failed OTP attempts

### Weekly:
- Clean up expired OTPs (automated)
- Review error logs

### Monthly:
- Analyze registration conversion rates
- Update email templates if needed

---

## 🆘 Support

### Common Questions:

**Q: Can I customize the OTP length?**
A: Yes, modify `generateOTP()` in `services/otp.js`

**Q: Can I change the expiration time?**
A: Yes, modify the expiration time in `storeOTP()` function

**Q: Can I use SMS instead of email?**
A: Yes, integrate an SMS service like Twilio

**Q: Can I skip OTP for testing?**
A: Create a test endpoint that bypasses OTP (development only)

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Neon DB Documentation](https://neon.tech/docs)
- [Express Validator](https://express-validator.github.io/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## ✅ Checklist

Before going live:

- [ ] Database tables created
- [ ] Environment variables configured
- [ ] Email sending tested
- [ ] OTP flow tested end-to-end
- [ ] Error handling verified
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation reviewed

---

## 🎉 You're All Set!

Your Email OTP verification system is now ready to use. Users will need to verify their email before registration is complete, adding an extra layer of security to your application.

For questions or issues, refer to the troubleshooting section or check the API documentation.
