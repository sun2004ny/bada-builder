# ✅ FIXED: Column "role" → "user_type"

## Issue Fixed
The backend was trying to query `role` column, but the database has `user_type` column.

## Changes Made
Updated both endpoints in `bada-builder-backend/routes/subscriptions.js`:
- `/create-order` - Now uses `user_type` instead of `role`
- `/verify-payment` - Now uses `user_type` instead of `role`

## Restart Backend Server

The backend server is currently running on port 5000 but needs to be restarted to pick up the changes.

### Option 1: Stop and Restart (Recommended)
1. In your backend terminal, press `Ctrl + C` to stop the server
2. Run `npm start` again
3. Server should start successfully

### Option 2: Kill Node Process
If Ctrl+C doesn't work:
1. Open Task Manager (Ctrl + Shift + Esc)
2. Find "Node.js" processes
3. End all Node.js tasks
4. Go to backend folder: `cd bada-builder-backend`
5. Run: `npm start`

## After Restart

Try the payment flow again:
1. Go to your app (http://localhost:5173)
2. Login
3. Post Property → Individual → Create New Property
4. Select a plan (₹100, ₹400, or ₹700)
5. Use test card: `4111 1111 1111 1111`
6. Complete payment

## Expected Backend Logs

After restart, you should see:
```
🚀 Server running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
✅ Connected to PostgreSQL database
```

When you try payment:
```
📝 Create order request: { plan_id: '1_month', userId: 2 }
👤 User type: individual
💰 Plan details: { duration: 1, price: 100, properties: 1 }
✅ Razorpay order created: order_xxx
```

## What Was Wrong

**Before:**
```javascript
SELECT role FROM users WHERE id = $1
// ❌ Column "role" does not exist
```

**After:**
```javascript
SELECT user_type FROM users WHERE id = $1
// ✅ Column "user_type" exists
```

The database schema uses `user_type` (individual/developer/builder), not `role`.
