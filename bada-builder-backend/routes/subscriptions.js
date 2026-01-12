import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../services/razorpay.js';
import { sendSubscriptionConfirmation } from '../services/email.js';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: '1_month',
      name: '1 Month',
      duration: 1,
      price: 500,
      description: 'Post properties for 1 month',
    },
    {
      id: '6_months',
      name: '6 Months',
      duration: 6,
      price: 2500,
      description: 'Post properties for 6 months',
      savings: 'Save ₹500',
    },
    {
      id: '12_months',
      name: '12 Months',
      duration: 12,
      price: 4500,
      description: 'Post properties for 12 months',
      savings: 'Save ₹1500',
    },
  ];

  res.json({ plans });
});

// Create subscription order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan_id } = req.body;

    const plans = {
      '1_month': { duration: 1, price: 500 },
      '6_months': { duration: 6, price: 2500 },
      '12_months': { duration: 12, price: 4500 },
    };

    const plan = plans[plan_id];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create Razorpay order
    const order = await createOrder(plan.price, 'INR', `subscription_${req.user.id}_${Date.now()}`);

    res.json({
      orderId: order.id,
      amount: plan.price,
      currency: 'INR',
      plan: plan_id,
      duration: plan.duration,
    });
  } catch (error) {
    console.error('Create subscription order error:', error);
    res.status(500).json({ error: 'Failed to create subscription order' });
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

    const plans = {
      '1_month': { duration: 1, price: 500 },
      '6_months': { duration: 6, price: 2500 },
      '12_months': { duration: 12, price: 4500 },
    };

    const plan = plans[plan_id];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

    // Get current user subscription
    const userResult = await pool.query(
      'SELECT subscription_expiry FROM users WHERE id = $1',
      [req.user.id]
    );

    let newExpiryDate = expiryDate;

    // If user already has an active subscription, extend from current expiry
    if (userResult.rows[0].subscription_expiry) {
      const currentExpiry = new Date(userResult.rows[0].subscription_expiry);
      if (currentExpiry > new Date()) {
        // Extend from current expiry
        newExpiryDate = new Date(currentExpiry);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + plan.duration);
      }
    }

    // Update user subscription
    const result = await pool.query(
      `UPDATE users SET
        is_subscribed = TRUE,
        subscription_expiry = $1,
        subscription_plan = $2,
        subscription_price = $3,
        subscribed_at = COALESCE(subscribed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`,
      [newExpiryDate, plan_id, plan.price, req.user.id]
    );

    const user = result.rows[0];

    // Send confirmation email
    sendSubscriptionConfirmation(user.email, {
      plan: plan_id,
      price: plan.price,
      expiry: newExpiryDate,
    }).catch(err => console.error('Subscription email failed:', err));

    res.json({
      message: 'Subscription activated successfully',
      subscription: {
        isSubscribed: user.is_subscribed,
        expiry: user.subscription_expiry,
        plan: user.subscription_plan,
        price: user.subscription_price,
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

    res.json({
      isSubscribed: isActive,
      expiry: subscription.subscription_expiry,
      plan: subscription.subscription_plan,
      price: subscription.subscription_price,
      subscribedAt: subscription.subscribed_at,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

export default router;
