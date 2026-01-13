import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI } from '../services/api';
import './SubscriptionPlans.css';

/* ---------- INDIVIDUAL PLANS (ONLY THESE 3 PLANS) ---------- */
const individualPlans = [
  {
    id: '1_month',
    duration: '1 Month',
    price: 500,
    features: ['Post unlimited properties', 'Featured listing for 1 month', 'Email support']
  },
  {
    id: '6_months',
    duration: '6 Months',
    price: 2500,
    features: ['Post unlimited properties', 'Featured listing for 6 months', 'Email support', 'Save ₹500'],
    popular: true
  },
  {
    id: '12_months',
    duration: '12 Months',
    price: 4500,
    features: ['Post unlimited properties', 'Featured listing for 12 months', 'Email support', 'Save ₹1500']
  }
];

const IndividualPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Get return path from location state
  const returnTo = location.state?.returnTo || '/post-property';
  const userType = location.state?.userType || 'individual';

  // User role is always individual for this component
  const userRole = 'individual';

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

  // Razorpay payment handler
  const handleRazorpayPayment = async (plan) => {
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return false;
    }

    try {
      // Create order on backend
      const orderData = await subscriptionsAPI.createOrder(plan.id);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // Amount in paise
        currency: orderData.currency,
        name: 'Bada Builder',
        description: `Individual Property Listing Plan - ${plan.duration}`,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response) {
          console.log('✅ Payment successful:', response);

          try {
            // Verify payment on backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id
            };

            const result = await subscriptionsAPI.verifyPayment(verificationData);
            console.log('✅ Subscription activated successfully:', result);

            setPaymentLoading(false);
            
            // Redirect to property posting selection page
            setTimeout(() => {
              navigate('/property-posting-selection', {
                state: {
                  userType: userType,
                  subscriptionVerified: true,
                  message: 'Subscription activated successfully!'
                }
              });
            }, 500);

          } catch (error) {
            console.error('Error verifying payment:', error);
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
          subscription_type: 'individual_property_listing'
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

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create payment order. Please try again.');
      return false;
    }
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

    console.log('🚀 Starting Individual subscription payment for plan:', plan.duration);
    console.log('👤 User role:', userRole);

    // Initiate Razorpay payment
    const paymentSuccess = await handleRazorpayPayment(plan);
    if (!paymentSuccess) {
      setPaymentLoading(false);
      setSelectedPlan(null);
    }
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
          <h1>Individual Owner Plans</h1>
          <p>Choose the perfect subscription plan for your property listing needs</p>
          <div className="role-badge">
            👤 Individual Owner Plans
          </div>
        </motion.div>

        <div className="plans-grid">
          {individualPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.bestValue ? 'best-value' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              {plan.popular && <div className="badge">Most Popular</div>}
              {plan.bestValue && <div className="badge best">Best Value</div>}

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

export default IndividualPlan;