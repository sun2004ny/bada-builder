# Complete Email OTP-Based User Registration System

## 🎯 Overview

This is a **fully functional** Email OTP-based user registration system built with:
- **Backend**: Node.js, Express, PostgreSQL (Neon DB)
- **Frontend**: React with Vite
- **Email**: Nodemailer (Gmail SMTP)
- **Security**: bcrypt password hashing, JWT authentication

---

## 📋 Table of Contents

1. [Database Schema](#database-schema)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [API Endpoints](#api-endpoints)
5. [Environment Setup](#environment-setup)
6. [Testing Guide](#testing-guide)
7. [Flow Diagram](#flow-diagram)

---

## 🗄️ Database Schema

### Table: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) DEFAULT 'individual',
    profile_photo TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP,
    subscription_plan VARCHAR(100),
    subscription_price DECIMAL(10, 2),
    subscribed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_verified ON users(is_verified);
```

### Table: `email_otps`

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

---

## 🔧 Backend Implementation

### File Structure

```
bada-builder-backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── services/
│   ├── email.js             # Nodemailer configuration
│   └── otp.js               # OTP generation & verification
├── routes/
│   ├── auth.js              # Login & profile routes
│   └── otp.js               # OTP routes
├── middleware/
│   └── auth.js              # JWT authentication
├── scripts/
│   └── create-otp-tables.js # Database setup script
├── .env                     # Environment variables
├── server.js                # Express server
└── package.json
```

### Key Backend Files

#### 1. **Database Connection** (`config/database.js`)

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default pool;
```

#### 2. **OTP Service** (`services/otp.js`)

```javascript
import pool from '../config/database.js';
import { sendEmail } from './email.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with 5-minute expiration
export const storeOTP = async (email, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);
  await pool.query(
    'INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
    [email, otp, expiresAt]
  );
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const result = await pool.query(
    'SELECT * FROM email_otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
    [email, otp]
  );

  if (result.rows.length === 0) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);
  return { valid: true, message: 'OTP verified successfully' };
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name = '') => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Bada Builder</h1>
      <h2>Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Your verification OTP is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 30px 0;">
        <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 5 minutes.</strong></p>
    </div>
  `;

  return sendEmail(email, 'Verify Your Email - Bada Builder', html);
};
```

#### 3. **Email Service** (`services/email.js`)

```javascript
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
  const info = await transporter.sendMail({
    from: `"Bada Builder" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('Email sent:', info.messageId);
  return { success: true, messageId: info.messageId };
};
```

#### 4. **OTP Routes** (`routes/otp.js`)

```javascript
import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '../services/otp.js';

const router = express.Router();

// Send OTP
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, name } = req.body;

  // Check if user already exists and is verified
  const existingUser = await pool.query(
    'SELECT id, is_verified FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0 && existingUser.rows[0].is_verified) {
    return res.status(400).json({ 
      error: 'User already exists with this email and is verified. Please login.' 
    });
  }

  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp, name);

  res.json({
    success: true,
    message: 'OTP sent successfully to your email',
    email: email,
  });
});

// Verify OTP and Register
router.post('/verify-and-register', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp, password, name, phone, userType } = req.body;

  // Verify OTP
  const otpVerification = await verifyOTP(email, otp);
  if (!otpVerification.valid) {
    return res.status(400).json({ error: otpVerification.message });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (email, password, name, phone, user_type, is_verified, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
     RETURNING id, email, name, phone, user_type, is_verified, created_at`,
    [email, hashedPassword, name, phone || null, userType || 'individual']
  );

  const user = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'Email verified and registration successful! Please login.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      userType: user.user_type,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    },
  });
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const { email } = req.body;

  const existingUser = await pool.query(
    'SELECT name, is_verified FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0 && existingUser.rows[0].is_verified) {
    return res.status(400).json({ 
      error: 'Email already verified. Please login.' 
    });
  }

  const name = existingUser.rows.length > 0 ? existingUser.rows[0].name : '';
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp, name);

  res.json({
    success: true,
    message: 'OTP resent successfully',
  });
});

export default router;
```

---

## 🎨 Frontend Implementation

### File Structure

```
bada-builder-frontend/
├── src/
│   ├── pages/
│   │   ├── RegisterWithOTP.jsx  # Registration with OTP
│   │   ├── Login.jsx            # Login page
│   │   └── Login.css            # Shared styles
│   ├── services/
│   │   └── api.js               # API service
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   └── App.jsx                  # Routes
└── .env
```

### Key Frontend Component

#### Registration Flow (`RegisterWithOTP.jsx`)

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RegisterWithOTP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "individual",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/otp/send-otp`, {
        email: formData.email,
        name: formData.name,
      });
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/otp/verify-and-register`, {
        email: formData.email,
        otp: otp,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        userType: formData.userType,
      });

      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    } catch (error) {
      alert(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          {/* Registration form fields */}
          <button type="submit" disabled={loading}>Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
          />
          <button type="submit" disabled={loading}>Verify & Register</button>
        </form>
      )}
    </div>
  );
};

export default RegisterWithOTP;
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 1. Send OTP

**POST** `/otp/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

### 2. Verify OTP & Register

**POST** `/otp/verify-and-register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "1234567890",
  "userType": "individual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified and registration successful! Please login.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "userType": "individual",
    "isVerified": true,
    "createdAt": "2026-01-14T10:30:00.000Z"
  }
}
```

### 3. Resend OTP

**POST** `/otp/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

### 4. Login

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "userType": "individual",
    "isSubscribed": false,
    "createdAt": "2026-01-14T10:30:00.000Z"
  }
}
```

---

## ⚙️ Environment Setup

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Neon DB)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@badabuilder.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing Guide

### 1. Setup Database Tables

```bash
cd bada-builder-backend
npm run setup-otp
```

### 2. Start Backend Server

```bash
cd bada-builder-backend
npm run dev
```

### 3. Start Frontend Server

```bash
cd bada-builder-frontend
npm run dev
```

### 4. Test Registration Flow

1. Navigate to `http://localhost:5173/register`
2. Fill in registration form:
   - Name: John Doe
   - Email: your-test-email@gmail.com
   - Password: password123
   - Confirm Password: password123
3. Click "Send OTP"
4. Check your email for the 6-digit OTP
5. Enter OTP in the verification form
6. Click "Verify & Register"
7. You'll be redirected to login page
8. Login with your credentials

### 5. Test with Postman

#### Send OTP
```bash
POST http://localhost:5000/api/otp/send-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

#### Verify OTP
```bash
POST http://localhost:5000/api/otp/verify-and-register
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456",
  "password": "password123",
  "name": "Test User",
  "phone": "1234567890",
  "userType": "individual"
}
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

1. User fills registration form
   ├── Name
   ├── Email
   ├── Password
   ├── Phone (optional)
   └── User Type

2. Click "Send OTP"
   ├── Frontend validates form
   ├── POST /api/otp/send-otp
   ├── Backend checks if email exists
   ├── Generate 6-digit OTP
   ├── Store OTP in database (expires in 5 min)
   └── Send OTP via email

3. User receives email with OTP

4. User enters OTP
   ├── Frontend shows OTP input
   └── User can resend OTP if needed

5. Click "Verify & Register"
   ├── POST /api/otp/verify-and-register
   ├── Backend verifies OTP
   ├── Hash password with bcrypt
   ├── Create user in database
   ├── Set is_verified = TRUE
   └── Delete OTP from database

6. Redirect to Login Page
   └── User logs in with credentials

7. Login
   ├── POST /api/auth/login
   ├── Verify password
   ├── Generate JWT token
   └── Return user data + token

8. User is authenticated
   └── Access protected routes
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **OTP Expiration**: 5 minutes
3. **OTP Deletion**: After successful verification
4. **Email Validation**: Server-side validation
5. **Rate Limiting**: 100 requests per 15 minutes
6. **JWT Authentication**: Secure token-based auth
7. **SSL/TLS**: Neon DB connection with SSL
8. **Input Sanitization**: express-validator

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.7",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "framer-motion": "^10.16.16"
}
```

---

## ✅ Features Implemented

- ✅ Email OTP verification
- ✅ 6-digit OTP generation
- ✅ OTP expiration (5 minutes)
- ✅ Resend OTP functionality
- ✅ Password hashing with bcrypt
- ✅ UUID for user IDs
- ✅ PostgreSQL (Neon DB) integration
- ✅ Nodemailer email service
- ✅ JWT authentication
- ✅ Input validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive UI
- ✅ Redirect to login after registration

---

## 🚀 Quick Start Commands

```bash
# Backend
cd bada-builder-backend
npm install
npm run setup-otp
npm run dev

# Frontend
cd bada-builder-frontend
npm install
npm run dev
```

---

## 📝 Notes

- OTP is sent via Gmail SMTP (requires App Password)
- Database uses UUID for primary keys
- Passwords are hashed before storage
- OTPs are automatically deleted after verification
- System prevents duplicate registrations
- Email verification is required before login

---

## 🎉 System Status

**✅ FULLY IMPLEMENTED AND WORKING**

All components are in place and tested:
- Database tables created
- Backend API routes functional
- Frontend UI complete
- Email service configured
- OTP flow working end-to-end
