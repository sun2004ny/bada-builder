# Testing User Registration - PostgreSQL Database

## ✅ Registration Route Verification

The registration endpoint (`POST /api/auth/register`) saves **ALL user data** to PostgreSQL database.

### Data Saved to Database

When a user registers, the following data is stored in the `users` table:

1. **email** - User's email address (UNIQUE, REQUIRED)
2. **password** - Hashed password using bcrypt (REQUIRED)
3. **name** - User's full name (REQUIRED)
4. **phone** - User's phone number (OPTIONAL)
5. **user_type** - Type of user: 'individual' or 'developer' (DEFAULT: 'individual')
6. **created_at** - Timestamp when user was created (AUTO-GENERATED)
7. **updated_at** - Timestamp when user was last updated (AUTO-GENERATED)

### Default Values Set

- `profile_photo` - NULL (can be updated later)
- `is_subscribed` - FALSE (default)
- `subscription_expiry` - NULL
- `subscription_plan` - NULL
- `subscription_price` - NULL
- `subscribed_at` - NULL

---

## 🧪 Test Registration

### 1. Test with Postman

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "test.user@example.com",
  "password": "password123",
  "name": "Test User",
  "phone": "9876543210",
  "userType": "individual"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User registered successfully. Please login.",
  "user": {
    "id": 1,
    "email": "test.user@example.com",
    "name": "Test User",
    "phone": "9876543210",
    "userType": "individual",
    "profilePhoto": null,
    "isSubscribed": false,
    "subscriptionExpiry": null,
    "subscriptionPlan": null,
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
}
```

### 2. Verify in Database

After registration, verify the data in PostgreSQL:

```sql
-- Connect to your database
-- Then run:

SELECT * FROM users WHERE email = 'test.user@example.com';
```

**Expected Result:**
```
id | email                  | password (hashed) | name      | phone       | user_type  | created_at           | updated_at
---|------------------------|-------------------|-----------|-------------|------------|----------------------|------------------
1  | test.user@example.com  | $2a$10$...       | Test User | 9876543210  | individual | 2024-12-20 10:00:00  | 2024-12-20 10:00:00
```

---

## 🔍 Verification Steps

### Step 1: Check Server Logs

After registration, you should see in the server console:
```
✅ User registered and saved to PostgreSQL: {
  id: 1,
  email: 'test.user@example.com',
  name: 'Test User',
  phone: '9876543210',
  user_type: 'individual',
  created_at: 2024-12-20T10:00:00.000Z
}
```

### Step 2: Check Database Directly

**Option A: Using psql**
```bash
psql "postgresql://neondb_owner:npg_KOZuxYB01GHq@ep-withered-feather-ahvoc457-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Then run:
SELECT id, email, name, phone, user_type, created_at FROM users ORDER BY id DESC LIMIT 5;
```

**Option B: Using Database GUI Tool**
- Connect to your Neon database
- Navigate to `users` table
- View all records

### Step 3: Test Login

After registration, test login to verify data was saved:

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "email": "test.user@example.com",
  "password": "password123"
}
```

If login succeeds, the data was saved correctly!

---

## 📊 Database Schema

The `users` table structure:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type VARCHAR(20) DEFAULT 'individual' CHECK (user_type IN ('individual', 'developer')),
  profile_photo TEXT,
  is_subscribed BOOLEAN DEFAULT FALSE,
  subscription_expiry TIMESTAMP,
  subscription_plan VARCHAR(50),
  subscription_price DECIMAL(10, 2),
  subscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Issue: Data not saving

**Check:**
1. Database connection - Run health check: `GET http://localhost:5000/health`
2. Database migration - Run: `npm run migrate` in backend folder
3. Server logs - Check for error messages
4. Database permissions - Ensure user has INSERT permissions

### Issue: Duplicate email error

**Error:** `Email already exists`

**Solution:** Use a different email or delete the existing user from database

### Issue: Required field missing

**Error:** `Required fields are missing`

**Solution:** Ensure `email`, `password`, and `name` are provided in request

---

## ✅ Success Indicators

1. ✅ Server returns `201 Created` status
2. ✅ Response includes user data with `id`
3. ✅ Server logs show "User registered and saved to PostgreSQL"
4. ✅ Database query shows new user record
5. ✅ Login works with registered credentials

---

## 📝 Example Test Data

### Individual User
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9876543210",
  "userType": "individual"
}
```

### Developer User
```json
{
  "email": "developer@abc.com",
  "password": "password123",
  "name": "ABC Developers",
  "phone": "9876543211",
  "userType": "developer"
}
```

### Minimal Required Fields
```json
{
  "email": "minimal@example.com",
  "password": "password123",
  "name": "Minimal User"
}
```
(phone and userType are optional)

---

## 🔐 Security Notes

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **Email Uniqueness**: Database enforces unique email constraint
3. **Input Validation**: All inputs are validated before database insertion
4. **Error Handling**: Detailed error messages help identify issues

---

## 🚀 Quick Test Script

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "9876543210",
    "userType": "individual"
  }'

# Then verify login works
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

If both requests succeed, registration is working correctly and data is being saved to PostgreSQL! ✅
