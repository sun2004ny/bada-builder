import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../services/razorpay.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const individualPlans = [
    {
      id: '1_month',
      name: '1 Month',
      duration: 1,
      price: 100,
      description: 'Post 1 property for 1 month',
    },
    {
      id: '6_months',
      name: '6 Months',
      duration: 6,
      price: 400,
      description: 'Post 1 property for 6 months',
    },
    {
      id: '12_months',
      name: '12 Months',
      duration: 12,
      price: 700,
      description: 'Post 1 property for 12 months',
    },
  ];

  const developerPlans = [
    {
      id: '12_months',
      name: '12 Months',
      duration: 12,
      price: 20000,
      properties: 20,
      description: 'Post 20 properties for 12 months',
    },
  ];

  res.json({
    individualPlans,
    developerPlans,
    plans: individualPlans // For backward compatibility
  });
});

// Create subscription order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan_id } = req.body;

    console.log('📝 Create order request:', { plan_id, userId: req.user.id });

    // Get user type to determine pricing
    const userResult = await pool.query(
      'SELECT user_type FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const userType = userResult.rows[0]?.user_type || 'individual';
    console.log('👤 User type:', userType);

    // Define plans based on user type
    let plans;
    if (userType === 'developer' || userType === 'builder') {
      // Developer/Builder can access BOTH their plans AND individual plans
      plans = {
        '12_months': { duration: 12, price: 20000, properties: 20 }, // Priority to Dev Plan
        '1_month': { duration: 1, price: 100, properties: 1 },
        '6_months': { duration: 6, price: 400, properties: 1 },
      };
    } else {
      // Individual plans
      plans = {
        '1_month': { duration: 1, price: 100, properties: 1 },
        '6_months': { duration: 6, price: 400, properties: 1 },
        '12_months': { duration: 12, price: 700, properties: 1 },
      };
    }

    const plan = plans[plan_id];
    if (!plan) {
      console.error('❌ Invalid plan:', plan_id, 'for user type:', userType);
      return res.status(400).json({ error: 'Invalid plan for your user type' });
    }

    console.log('💰 Plan details:', plan);

    // Create Razorpay order
    const order = await createOrder(plan.price, 'INR', `subscription_${req.user.id}_${Date.now()}`);
    console.log('✅ Razorpay order created:', order.id);

    res.json({
      orderId: order.id,
      amount: plan.price,
      currency: 'INR',
      plan: plan_id,
      duration: plan.duration,
    });
  } catch (error) {
    console.error('❌ Create subscription order error:', error);
    res.status(500).json({ error: 'Failed to create subscription order', details: error.message });
  }
});

// Verify subscription payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

    // Verify payment
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Get user type to determine pricing
    const userResult = await pool.query(
      'SELECT user_type, subscription_expiry FROM users WHERE id = $1',
      [req.user.id]
    );

    const userType = userResult.rows[0]?.user_type || 'individual';
    const currentExpiry = userResult.rows[0]?.subscription_expiry;

    // Define plans based on user type
    let plans;
    if (userType === 'developer' || userType === 'builder') {
      // Developer/Builder can access BOTH their plans AND individual plans
      plans = {
        '12_months': { duration: 12, price: 20000, properties: 20 }, // Priority to Dev Plan
        '1_month': { duration: 1, price: 100, properties: 1 },
        '6_months': { duration: 6, price: 400, properties: 1 },
      };
    } else {
      // Individual plans
      plans = {
        '1_month': { duration: 1, price: 100, properties: 1 },
        '6_months': { duration: 6, price: 400, properties: 1 },
        '12_months': { duration: 12, price: 700, properties: 1 },
      };
    }

    const plan = plans[plan_id];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan for your user type' });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

    let newExpiryDate = expiryDate;

    // If user already has an active subscription, extend from current expiry
    if (currentExpiry) {
      const currentExpiryDate = new Date(currentExpiry);
      if (currentExpiryDate > new Date()) {
        // Extend from current expiry
        newExpiryDate = new Date(currentExpiryDate);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + plan.duration);
      }
    }

    // Update user subscription (for backward compatibility)
    const updateUserQuery = `UPDATE users SET
      is_subscribed = TRUE,
      subscription_expiry = $1,
      subscription_plan = $2,
      subscription_price = $3,
      subscribed_at = COALESCE(subscribed_at, CURRENT_TIMESTAMP),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *`;
    const updateUserParams = [newExpiryDate, plan_id, plan.price, req.user.id];
    const userResultUpdate = await pool.query(updateUserQuery, updateUserParams);
    const user = userResultUpdate.rows[0];

    // NEW: Insert into strict user_subscriptions table (Firebase style)
    const propertiesAllowed = plan.properties || 1;
    const insertUserSubscriptionQuery = `
      INSERT INTO user_subscriptions (
        user_id, plan_id, plan_name, plan_price,
        properties_allowed, properties_used, status, 
        expiry_date, payment_id, razorpay_order_id, 
        razorpay_payment_id, razorpay_signature
      ) VALUES ($1, $2, $3, $4, $5, 0, 'active', $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const subResult = await pool.query(insertUserSubscriptionQuery, [
      req.user.id,
      plan_id,
      plan.name || plan_id,
      plan.price,
      propertiesAllowed,
      newExpiryDate,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    ]);
    const activeSub = subResult.rows[0];

    // Send confirmation email
    sendEmail({
      to: user.email,
      subject: `Subscription Activated - ${process.env.APP_NAME || 'Bada Builder'}`,
      htmlContent: `
        <h2>Subscription Activated!</h2>
        <p>Your subscription has been activated successfully.</p>
        <p><strong>Plan:</strong> ${plan_id}</p>
        <p><strong>Price:</strong> ₹${plan.price}</p>
        <p><strong>Properties Allowed:</strong> ${propertiesAllowed}</p>
        <p><strong>Valid Until:</strong> ${newExpiryDate.toLocaleDateString()}</p>
      `,
      textContent: `Subscription activated! Plan: ${plan_id}, Price: ₹${plan.price}, Properties Allowed: ${propertiesAllowed}, Valid until: ${newExpiryDate.toLocaleDateString()}`
    }).catch(err => console.error('Subscription email failed:', err));

    res.json({
      message: 'Subscription activated successfully',
      subscription: {
        isSubscribed: user.is_subscribed,
        expiry: user.subscription_expiry,
        plan: user.subscription_plan,
        price: user.subscription_price,
        propertiesAllowed: activeSub.properties_allowed,
        propertiesUsed: activeSub.properties_used,
        id: activeSub.id
      },
    });
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// Get current subscription status
router.get('/status', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT is_subscribed, subscription_expiry, subscription_plan, 
              subscription_price, subscribed_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = result.rows[0];
    const isActive = subscription.is_subscribed &&
      (subscription.subscription_expiry === null ||
        new Date(subscription.subscription_expiry) > new Date());

    // Also get details from strict user_subscriptions table
    const subDetails = await pool.query(
      `SELECT properties_allowed, properties_used, status as sub_status, expiry_date
       FROM user_subscriptions 
       WHERE user_id = $1 AND status = 'active' AND expiry_date > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    const activeDetails = subDetails.rows[0] || { properties_allowed: 0, properties_used: 0 };

    res.json({
      isSubscribed: isActive,
      expiry: subscription.subscription_expiry,
      plan: subscription.subscription_plan,
      price: subscription.subscription_price,
      subscribedAt: subscription.subscribed_at,
      propertiesAllowed: activeDetails.properties_allowed,
      propertiesUsed: activeDetails.properties_used,
      postsLeft: Math.max(0, activeDetails.properties_allowed - activeDetails.properties_used)
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

export default router;
