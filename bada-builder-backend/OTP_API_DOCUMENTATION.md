# Email OTP Verification API Documentation

## Overview
This API implements a secure email OTP (One-Time Password) verification system for user registration. Users must verify their email address before their account is created.

## Base URL
```
http://localhost:5000/api/otp
```

## Endpoints

### 1. Send OTP
Send a 6-digit OTP to the user's email address.

**Endpoint:** `POST /send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email format or user already exists
- `500 Internal Server Error`: Failed to send OTP

---

### 2. Verify OTP and Register User
Verify the OTP and create the user account.

**Endpoint:** `POST /verify-and-register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "userType": "individual"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Email verified and registration successful! Please login.",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "userType": "individual",
    "isVerified": true,
    "createdAt": "2026-01-14T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired OTP, validation errors
- `500 Internal Server Error`: Registration failed

---

### 3. Resend OTP
Resend OTP to the user's email address.

**Endpoint:** `POST /resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Email already verified
- `500 Internal Server Error`: Failed to resend OTP

---

## Database Schema

### `email_otps` Table
```sql
CREATE TABLE email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_expires ON email_otps(expires_at);
```

### `users` Table (Updated)
```sql
ALTER TABLE users 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
```

---

## OTP Configuration

- **OTP Length:** 6 digits
- **Expiration Time:** 5 minutes
- **Format:** Numeric only (100000 - 999999)
- **Storage:** Hashed in database
- **Cleanup:** Automatic deletion after verification or expiration

---

## Email Template

The OTP email includes:
- Professional branding
- Large, centered OTP display
- Expiration warning (5 minutes)
- Security notice

---

## Security Features

1. **OTP Expiration:** OTPs expire after 5 minutes
2. **Single Use:** OTPs are deleted after successful verification
3. **Email Validation:** Email format validation before sending OTP
4. **Password Hashing:** Passwords are hashed using bcrypt (10 rounds)
5. **Rate Limiting:** Built-in rate limiting on all API endpoints
6. **Unique Constraint:** Email uniqueness enforced at database level

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here",
  "details": "Detailed error (development mode only)"
}
```

---

## Testing the API

### Using cURL:

**1. Send OTP:**
```bash
curl -X POST http://localhost:5000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**2. Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/otp/verify-and-register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otp":"123456",
    "password":"password123",
    "name":"Test User",
    "phone":"+1234567890",
    "userType":"individual"
  }'
```

**3. Resend OTP:**
```bash
curl -X POST http://localhost:5000/api/otp/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Frontend Integration

### Registration Flow:

1. User fills registration form
2. Click "Send OTP" → Call `/send-otp`
3. User receives email with OTP
4. User enters OTP in verification form
5. Click "Verify & Register" → Call `/verify-and-register`
6. Redirect to login page on success

### Example Frontend Code:

```javascript
// Send OTP
const sendOTP = async (email, name) => {
  const response = await fetch('http://localhost:5000/api/otp/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  return response.json();
};

// Verify and Register
const verifyAndRegister = async (data) => {
  const response = await fetch('http://localhost:5000/api/otp/verify-and-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

---

## Environment Variables Required

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Database
DATABASE_URL=your-neon-db-connection-string

# JWT
JWT_SECRET=your-secret-key
```

---

## Maintenance

### Cleanup Expired OTPs

Run periodically (e.g., via cron job):

```javascript
import { cleanupExpiredOTPs } from './services/otp.js';

// Clean up expired OTPs
await cleanupExpiredOTPs();
```

---

## Best Practices

1. **Always use HTTPS in production**
2. **Implement rate limiting** to prevent abuse
3. **Monitor OTP sending** to detect spam
4. **Log failed verification attempts** for security
5. **Use environment variables** for sensitive data
6. **Test email delivery** before going live
7. **Provide clear error messages** to users
8. **Implement resend cooldown** (60 seconds)

---

## Troubleshooting

### OTP Not Received
- Check spam/junk folder
- Verify SMTP credentials
- Check email service logs
- Ensure email address is valid

### OTP Expired
- OTPs expire after 5 minutes
- Use resend functionality
- Check server time synchronization

### Registration Failed
- Verify all required fields
- Check password strength (min 6 characters)
- Ensure email is not already registered
- Check database connection

---

## Support

For issues or questions, contact: support@badabuilder.com
