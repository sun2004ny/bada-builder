import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './SubscriptionPlans.css';

/* ---------- BASE PLANS (Individual) ---------- */
const individualPlans = [
  {
    id: '1month',
    duration: '1 Month',
    price: 100,
    features: ['Post 1 property', 'Featured listing for 1 month', 'Email support']
  },
  {
    id: '3months',
    duration: '6 Months',
    price: 400,
    features: ['Post 1 property', 'Featured listing for 6 month', 'Email support'],
    popular: true
  },
  {
    id: '6months',
    duration: '1 Year',
    price: 700,
    features: ['Post 1 property', 'Featured listing for 1 year', 'Email support']
  }
];

/* ---------- DEVELOPER / BUILDER PLAN (ONLY ONE PLAN) ---------- */
const developerPlan = [
  {
    id: '12months',
    duration: '12 month',
    price: 20000,
    features: [
      'Post 20 property',
      'Featured listing for 1 year',
      'Email support'
    ],
    bestValue: true
  }
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Get user role from navigation state or user profile
  const locationState = window.history.state?.usr;
  const userRole = locationState?.userType || userProfile?.user_type || 'individual';

  /* ---------- LOAD RAZORPAY ---------- */
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          console.log('✅ Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay script');
          resolve(false);
        };
        document.head.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  /* ---------- ROLE-BASED PLAN FILTERING ---------- */
  const plans = userRole === 'developer' ? developerPlan : individualPlans;

  const calculateExpiryDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  // Razorpay payment handler (reusing exact logic from BookSiteVisit)
  const handleRazorpayPayment = async (plan) => {
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return false;
    }

    const amount = plan.price;
    const currency = 'INR';

    // Calculate plan duration in months
    let months = 1;
    if (plan.id === '3months') months = 6; // 6 months plan
    else if (plan.id === '6months') months = 12; // 1 year plan

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Amount in paise
      currency: currency,
      name: 'Bada Builder',
      description: `Property Listing Subscription Plan - ${plan.duration}`,
      image: '/logo.png', // Your company logo
      order_id: '', // Will be generated from backend if needed
      handler: async function (response) {
        console.log('✅ Payment successful:', response);

        // Calculate expiry date
        const expiryDate = calculateExpiryDate(months);

        // Prepare payment data
        const paymentData = {
          payment_id: response.razorpay_payment_id,
          amount: amount,
          plan_name: plan.duration,
          user_id: currentUser.uid,
          payment_status: 'success',
          created_at: new Date().toISOString(),
          razorpay_order_id: response.razorpay_order_id || '',
          razorpay_signature: response.razorpay_signature || '',
          payment_currency: currency,
          payment_timestamp: new Date().toISOString(),
          user_role: userRole // Store user role with payment
        };

        // Prepare subscription data
        const subscriptionData = {
          active_plan: plan.id,
          plan_start_date: new Date().toISOString(),
          plan_status: 'active',
          is_subscribed: true,
          subscription_expiry: expiryDate,
          subscription_plan: plan.id,
          subscription_price: plan.price,
          subscribed_at: new Date().toISOString(),
          user_type: userRole // Store user role in profile
        };

        try {
          // Store payment details in database
          await addDoc(collection(db, 'payments'), paymentData);
          console.log('✅ Payment data stored successfully');

          // Update user subscription in Firestore
          await updateDoc(doc(db, 'users', currentUser.uid), subscriptionData);
          console.log('✅ Subscription activated successfully');

          // Show success and redirect
          setPaymentLoading(false);
          // alert(`Successfully subscribed to ${plan.duration} plan! Payment ID: ${response.razorpay_payment_id}`); // Removed blocking alert

          // Redirect to post property page
          setTimeout(() => {
            navigate('/post-property');
          }, 500);

        } catch (error) {
          console.error('Error saving payment/subscription:', error);
          alert('Payment successful but subscription activation failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          setPaymentLoading(false);
        }
      },
      prefill: {
        name: userProfile?.name || currentUser?.displayName || '',
        email: userProfile?.email || currentUser?.email || '',
        contact: userProfile?.phone || currentUser?.phoneNumber || ''
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.duration,
        plan_price: plan.price,
        user_id: currentUser.uid,
        user_role: userRole,
        subscription_type: 'property_listing'
      },
      theme: {
        color: '#58335e'
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user');
          setPaymentLoading(false);
          setSelectedPlan(null);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return true;
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setSelectedPlan(plan.id);
    setPaymentLoading(true);

    console.log('🚀 Starting subscription payment for plan:', plan.duration);
    console.log('👤 User role:', userRole);

    // Initiate Razorpay payment
    const paymentSuccess = await handleRazorpayPayment(plan);
    if (!paymentSuccess) {
      setPaymentLoading(false);
      setSelectedPlan(null);
    }
    // Note: Subscription will be activated after successful payment in handleRazorpayPayment
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <motion.div
          className="subscription-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Choose Your Plan</h1>
          <p>
            {userRole === 'developer'
              ? 'Developer/Builder subscription plan for property listings'
              : 'Select a subscription plan to start posting properties'
            }
          </p>
          {userRole === 'developer' && (
            <div className="role-badge">
              🏢 Developer / Builder Plan
            </div>
          )}
        </motion.div>

        <div className="plans-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.bestValue ? 'best-value' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              {plan.popular && <div className="badge">Most Popular</div>}
              {plan.bestValue && userRole === 'developer' && <div className="badge best">Developer Plan</div>}
              {plan.bestValue && userRole !== 'developer' && <div className="badge best">Best Value</div>}

              <div className="plan-header">
                <h3>{plan.duration}</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price.toLocaleString()}</span>
                </div>
              </div>

              <ul className="features-list">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="select-button"
                onClick={() => handleSelectPlan(plan)}
                disabled={paymentLoading || !razorpayLoaded}
              >
                {paymentLoading && selectedPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Processing Payment...
                  </span>
                ) : !razorpayLoaded ? (
                  'Loading Payment Gateway...'
                ) : (
                  'Choose Plan'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="subscription-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>🔒 Secure payment powered by Razorpay. Your subscription will be activated immediately after successful payment.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;