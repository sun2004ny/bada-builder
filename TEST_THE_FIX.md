# 🧪 Test the OTP Registration Fix

## Quick Start

Follow these steps to verify the OTP registration is working correctly.

---

## Step 1: Start the Servers

### Backend
```bash
cd bada-builder-backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
✅ Connected to PostgreSQL database
```

### Frontend (in a new terminal)
```bash
cd bada-builder-frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 2: Test Login Page

1. **Open browser:** `http://localhost:5173/login`

2. **Verify you see:**
   - ✅ Only login form (email + password)
   - ✅ "Login" button
   - ✅ "Register with OTP" link at the bottom
   - ❌ NO registration fields (name, confirm password)

3. **Click "Register with OTP" link**
   - ✅ Should redirect to `/register` page

---

## Step 3: Test Registration Form

1. **You should now be on:** `http://localhost:5173/register`

2. **Verify you see:**
   - ✅ "Create Account" heading
   - ✅ Name field
   - ✅ Email field
   - ✅ Phone field (optional)
   - ✅ User Type dropdown
   - ✅ Password field
   - ✅ Confirm Password field
   - ✅ "Send OTP" button

3. **Fill in the form:**
   ```
   Name: Test User
   Email: your-real-email@gmail.com  (use your real email!)
   Phone: 1234567890
   User Type: Individual
   Password: password123
   Confirm Password: password123
   ```

4. **Click "Send OTP" button**

---

## Step 4: Verify OTP Screen Appears ✅

**THIS IS THE KEY TEST!**

After clicking "Send OTP", you should see:

1. **Screen changes to OTP verification:**
   - ✅ "Verify Email" heading
   - ✅ Message: "We've sent a 6-digit OTP to your-email@gmail.com"
   - ✅ Large OTP input field (6 digits)
   - ✅ "Verify & Register" button
   - ✅ "Resend OTP" button (disabled for 60 seconds)
   - ✅ "← Back to Form" button

2. **Check your email:**
   - ✅ You should receive an email from "Bada Builder"
   - ✅ Subject: "Verify Your Email - Bada Builder"
   - ✅ Email contains a 6-digit OTP (e.g., 123456)

**If you DON'T see the OTP screen, the fix didn't work!**

---

## Step 5: Enter OTP and Verify

1. **Copy the 6-digit OTP from your email**

2. **Enter it in the OTP input field**
   - Type or paste the 6 digits
   - The field should show: `1 2 3 4 5 6` (with spacing)

3. **Click "Verify & Register" button**

4. **Expected result:**
   - ✅ Success message appears
   - ✅ Redirected to `/login` page
   - ✅ Message: "Registration successful! Please login."

---

## Step 6: Login with New Account

1. **You should now be on:** `http://localhost:5173/login`

2. **Enter your credentials:**
   ```
   Email: your-email@gmail.com
   Password: password123
   ```

3. **Click "Login" button**

4. **Expected result:**
   - ✅ Successfully logged in
   - ✅ Redirected to home page
   - ✅ User menu shows your name

---

## Additional Tests

### Test 1: Resend OTP

1. Go through registration until OTP screen
2. Wait 60 seconds
3. Click "Resend OTP" button
4. ✅ New OTP should be sent to email
5. ✅ Timer resets to 60 seconds

### Test 2: Back Button

1. Go through registration until OTP screen
2. Click "← Back to Form" button
3. ✅ Should return to registration form
4. ✅ All your data should still be there

### Test 3: Invalid OTP

1. Go through registration until OTP screen
2. Enter wrong OTP (e.g., 000000)
3. Click "Verify & Register"
4. ✅ Should show error: "Invalid or expired OTP"

### Test 4: Expired OTP

1. Go through registration until OTP screen
2. Wait 6 minutes (OTP expires in 5 minutes)
3. Enter the OTP
4. ✅ Should show error: "Invalid or expired OTP"
5. ✅ Use "Resend OTP" to get a new one

### Test 5: Duplicate Email

1. Try to register with an email that already exists
2. ✅ Should show error: "User already exists with this email and is verified. Please login."

---

## Troubleshooting

### Issue: OTP Screen Not Showing

**Possible causes:**
1. Using `/login` page instead of `/register`
2. Old code still cached in browser
3. Frontend not restarted after fix

**Solutions:**
1. Make sure you're on `/register` page
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache
4. Restart frontend server

### Issue: OTP Email Not Received

**Possible causes:**
1. Email in spam folder
2. SMTP credentials incorrect
3. Email service down

**Solutions:**
1. Check spam/junk folder
2. Verify backend `.env` has correct SMTP settings
3. Check backend logs for email errors
4. Test with different email provider

### Issue: "Invalid or expired OTP"

**Possible causes:**
1. OTP expired (5 minutes)
2. Wrong OTP entered
3. System time incorrect

**Solutions:**
1. Use "Resend OTP" button
2. Double-check OTP from email
3. Verify system time is correct

### Issue: Can't Login After Registration

**Possible causes:**
1. User not created in database
2. Password not hashed correctly
3. is_verified not set to TRUE

**Solutions:**
1. Check database:
   ```sql
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```
2. Verify `is_verified = TRUE`
3. Check backend logs for errors

---

## Database Verification

### Check User Was Created

```sql
-- Connect to your database and run:
SELECT 
    id, 
    name, 
    email, 
    is_verified, 
    created_at 
FROM users 
WHERE email = 'your-email@example.com';
```

**Expected result:**
```
id: uuid-here
name: Test User
email: your-email@example.com
is_verified: TRUE  ← Must be TRUE!
created_at: 2026-01-14 10:30:00
```

### Check OTP Was Deleted

```sql
-- Should return no rows (OTP deleted after verification)
SELECT * FROM email_otps 
WHERE email = 'your-email@example.com';
```

**Expected result:** No rows (empty result)

---

## Success Criteria

✅ **The fix is working if:**

1. Login page shows only login form (no registration fields)
2. "Register with OTP" link redirects to `/register`
3. Registration form shows all fields
4. "Send OTP" button sends OTP to email
5. **OTP input screen appears** ← KEY TEST
6. Email is received with 6-digit OTP
7. OTP verification works
8. User is created with `is_verified = TRUE`
9. Redirect to login after registration
10. Can login with new credentials

---

## Test Results Template

Copy this and fill it out:

```
Date: _______________
Tester: _______________

[ ] Step 1: Servers started successfully
[ ] Step 2: Login page shows only login form
[ ] Step 3: Registration form shows all fields
[ ] Step 4: OTP screen appears after sending OTP ← CRITICAL
[ ] Step 5: OTP verification works
[ ] Step 6: Can login with new account

Additional Tests:
[ ] Resend OTP works
[ ] Back button works
[ ] Invalid OTP shows error
[ ] Expired OTP shows error
[ ] Duplicate email shows error

Database Verification:
[ ] User created with is_verified = TRUE
[ ] OTP deleted after verification

Overall Result: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## Quick Test Script

Run this in your browser console on the registration page:

```javascript
// Check if OTP screen elements exist after sending OTP
setTimeout(() => {
  const otpInput = document.querySelector('input[maxlength="6"]');
  const verifyButton = document.querySelector('button:contains("Verify")');
  const resendButton = document.querySelector('button:contains("Resend")');
  
  if (otpInput && verifyButton && resendButton) {
    console.log('✅ OTP screen is showing correctly!');
  } else {
    console.log('❌ OTP screen not found!');
  }
}, 3000); // Wait 3 seconds after sending OTP
```

---

## Video Test Guide

If you want to record a test video, follow this sequence:

1. **Start recording**
2. Show login page (only login form)
3. Click "Register with OTP"
4. Fill registration form
5. Click "Send OTP"
6. **Show OTP screen appearing** ← KEY MOMENT
7. Open email and show OTP
8. Enter OTP
9. Click "Verify & Register"
10. Show redirect to login
11. Login with new credentials
12. **Stop recording**

---

## Need Help?

If the OTP screen is still not showing:

1. Check `REGISTRATION_FIX_GUIDE.md` for detailed explanation
2. Check `VISUAL_FLOW_COMPARISON.md` for visual guide
3. Verify `Login.jsx` was modified correctly
4. Check browser console for errors
5. Check backend logs for errors

---

**Expected Test Duration:** 5-10 minutes

**Status:** Ready to test ✅
