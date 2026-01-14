# Testing Instructions - Payment Flow

## Backend Status: ✅ RUNNING (Port 5000)

The backend server is now running with the updated subscription code.

## Frontend Status: ⚠️ NEEDS TO BE STARTED

### To Start Frontend:

1. Open a new terminal
2. Navigate to frontend directory:
   ```
   cd bada-builder-frontend
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Frontend should start on: http://localhost:5173

## Testing the Payment Flow

### Step 1: Login
1. Go to http://localhost:5173
2. Login with your test account

### Step 2: Navigate to Payment
**For Individual User:**
- Click "Post Property" in header
- Select "Individual"
- Click "Create New Property"
- You'll see the Individual Plan page

**For Developer User:**
- Click "Post Property" in header
- Select "Developer"
- Click "Create New Property"
- You'll see the Developer Plan page

### Step 3: Test Payment

**Individual Plans:**
- 1 Month: ₹100
- 6 Months: ₹400
- 12 Months: ₹700

**Developer Plan:**
- 12 Months: ₹20,000 (20 properties)

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

### Step 4: Complete Payment

1. Click "Choose Plan"
2. Razorpay modal will open
3. Enter test card details
4. Click "Pay"
5. Payment should succeed
6. Backend will verify payment
7. You should be redirected to Form/Template selection

### Step 5: Verify Success

After successful payment, you should see:
- ✅ Two options: "Create Using Form" or "Create Using Template"
- ✅ NO payment screen again
- ✅ Can post property immediately

## Expected Console Logs

### Frontend Console (Browser):
```
✅ Razorpay script loaded successfully
🚀 Starting Individual subscription payment for plan: 1 Month
👤 User role: individual
📝 Creating Razorpay order for plan: 1_month
✅ Order created: { orderId: "order_xxx", amount: 100, ... }
✅ Payment successful: { razorpay_order_id: "...", razorpay_payment_id: "...", ... }
✅ Subscription activated successfully: { message: "...", subscription: {...} }
```

### Backend Console (Terminal):
```
📝 Create order request: { plan_id: '1_month', userId: 123 }
👤 User role: individual
💰 Plan details: { duration: 1, price: 100, properties: 1 }
✅ Razorpay order created: order_xxx
```

## Troubleshooting

### Error: "Failed to create subscription order"

**Check:**
1. Backend server is running (should be on port 5000)
2. Razorpay credentials are in `.env` file:
   ```
   RAZORPAY_KEY_ID=rzp_test_Rt8mnuQxtS0eot
   RAZORPAY_KEY_SECRET=u9vHfRKAbatwQBRVWT33Ykst
   ```
3. Database connection is working
4. User is logged in (JWT token is valid)

**Solution:**
- Restart backend server: `npm start` in `bada-builder-backend` folder
- Check backend console for detailed error logs

### Error: "Payment verification failed"

**Check:**
1. Order was created successfully before payment
2. Razorpay signature is being verified correctly
3. Backend logs show the verification attempt

### Error: "Invalid plan for your user type"

**Check:**
1. User role in database matches the plan being purchased
2. Individual users can only buy individual plans
3. Developer users can only buy developer plans

## What Changed

### Files Modified:
1. `bada-builder-frontend/src/pages/IndividualPlan.jsx`
   - Added order creation before payment
   - Fixed redirect after successful payment

2. `bada-builder-frontend/src/pages/DeveloperPlan.jsx`
   - Added order creation before payment
   - Fixed redirect after successful payment

3. `bada-builder-backend/routes/subscriptions.js`
   - Updated pricing (Individual: ₹100/₹400/₹700, Developer: ₹20,000)
   - Added role-based plan selection
   - Added developer credits management
   - Added detailed error logging

## Next Steps After Testing

1. ✅ Verify payment completes successfully
2. ✅ Verify redirect to Form/Template selection
3. ✅ Verify can post property after payment
4. ✅ Verify developer credits are tracked correctly
5. ✅ Test payment cancellation (close Razorpay modal)
6. ✅ Test all three individual plans
7. ✅ Test developer plan

## Support

If you encounter any issues:
1. Check browser console for frontend errors
2. Check backend terminal for server errors
3. Verify both servers are running
4. Check database connection
5. Verify Razorpay credentials are correct
