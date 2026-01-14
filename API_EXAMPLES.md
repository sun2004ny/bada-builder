# API Request Examples

Complete examples for testing the Email OTP Registration System.

---

## Base URL

```
Local: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## 1. Send OTP

### Request

```http
POST /otp/send-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe"
  }'
```

### Success Response (200)

```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "john.doe@example.com"
}
```

### Error Responses

**Email Already Verified (400)**
```json
{
  "error": "User already exists with this email and is verified. Please login."
}
```

**Invalid Email (400)**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## 2. Verify OTP and Register User

### Request

```http
POST /otp/verify-and-register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "9876543210",
  "userType": "individual"
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/otp/verify-and-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456",
    "password": "securePassword123",
    "name": "John Doe",
    "phone": "9876543210",
    "userType": "individual"
  }'
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Email verified and registration successful! Please login.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "userType": "individual",
    "isVerified": true,
    "createdAt": "2026-01-14T10:30:00.000Z"
  }
}
```

### Error Responses

**Invalid OTP (400)**
```json
{
  "error": "Invalid or expired OTP"
}
```

**Password Too Short (400)**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**User Already Exists (400)**
```json
{
  "error": "User already exists and is verified. Please login."
}
```

---

## 3. Resend OTP

### Request

```http
POST /otp/resend-otp
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/otp/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Success Response (200)

```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

### Error Response

**Email Already Verified (400)**
```json
{
  "error": "Email already verified. Please login."
}
```

---

## 4. Login

### Request

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### Success Response (200)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "userType": "individual",
    "profilePhoto": null,
    "isSubscribed": false,
    "subscriptionExpiry": null,
    "subscriptionPlan": null,
    "createdAt": "2026-01-14T10:30:00.000Z"
  }
}
```

### Error Responses

**Invalid Credentials (401)**
```json
{
  "error": "Invalid email or password"
}
```

**Validation Error (400)**
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## 5. Get Current User (Protected Route)

### Request

```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### cURL Command

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Success Response (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "user_type": "individual",
    "profile_photo": null,
    "is_subscribed": false,
    "subscription_expiry": null,
    "subscription_plan": null,
    "subscription_price": null,
    "subscribed_at": null,
    "created_at": "2026-01-14T10:30:00.000Z"
  }
}
```

### Error Response

**Unauthorized (401)**
```json
{
  "error": "No token provided"
}
```

**Invalid Token (401)**
```json
{
  "error": "Invalid token"
}
```

---

## 6. Update Profile (Protected Route)

### Request

```http
PUT /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "John Updated Doe",
  "phone": "9999999999",
  "userType": "developer"
}
```

### cURL Command

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated Doe",
    "phone": "9999999999",
    "userType": "developer"
  }'
```

### Success Response (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Updated Doe",
    "phone": "9999999999",
    "user_type": "developer",
    "profile_photo": null,
    "is_subscribed": false,
    "subscription_expiry": null,
    "subscription_plan": null,
    "created_at": "2026-01-14T10:30:00.000Z"
  }
}
```

---

## Complete Registration Flow Example

### Step 1: Send OTP

```bash
curl -X POST http://localhost:5000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "test@example.com"
}
```

### Step 2: Check Email

You'll receive an email with a 6-digit OTP like: **123456**

### Step 3: Verify OTP and Register

```bash
curl -X POST http://localhost:5000/api/otp/verify-and-register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "password": "password123",
    "name": "Test User",
    "phone": "1234567890",
    "userType": "individual"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified and registration successful! Please login.",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "isVerified": true
  }
}
```

### Step 4: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Step 5: Access Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "OTP Registration System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send OTP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"name\": \"Test User\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/otp/send-otp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "otp", "send-otp"]
        }
      }
    },
    {
      "name": "Verify OTP and Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"otp\": \"123456\",\n  \"password\": \"password123\",\n  \"name\": \"Test User\",\n  \"phone\": \"1234567890\",\n  \"userType\": \"individual\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/otp/verify-and-register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "otp", "verify-and-register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

---

## Testing Tips

1. **Use a real email** for testing to receive OTPs
2. **OTP expires in 5 minutes** - verify quickly
3. **Save the JWT token** from login response for protected routes
4. **Use environment variables** in Postman for base URL and token
5. **Check server logs** for detailed error messages
6. **Test error cases** (invalid OTP, expired OTP, duplicate email)

---

## Common Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid credentials, missing token |
| 404 | Not Found | User not found |
| 500 | Server Error | Database error, email service down |

---

## Rate Limiting

- **100 requests per 15 minutes** per IP address
- Applies to all `/api/*` routes
- Returns 429 status code when exceeded

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4 (random)
- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days by default
- Email validation is case-insensitive
