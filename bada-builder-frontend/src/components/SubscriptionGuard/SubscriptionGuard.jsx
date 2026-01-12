import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SubscriptionService from '../../services/subscriptionService';
import './SubscriptionGuard.css';

/**
 * SubscriptionGuard - Enforces subscription requirement for property posting
 * Shows subscription status and redirects to purchase if needed
 */
const SubscriptionGuard = ({ 
  children, 
  onSubscriptionVerified, 
  userType = 'individual',
  action = 'post property' 
}) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    loading: true,
    hasSubscription: false,
    subscription: null,
    reason: ''
  });

  useEffect(() => {
    checkSubscription();
  }, [currentUser, userProfile]);

  const checkSubscription = async () => {
    if (!currentUser?.uid) {
      setSubscriptionStatus({
        loading: false,
        hasSubscription: false,
        subscription: null,
        reason: 'User not authenticated'
      });
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true }));
      
      const result = await SubscriptionService.checkPropertyPostingSubscription(currentUser.uid);
      
      setSubscriptionStatus({
        loading: false,
        hasSubscription: result.hasSubscription,
        subscription: result.subscription,
        reason: result.reason
      });

      // If subscription is valid, notify parent component
      if (result.hasSubscription && onSubscriptionVerified) {
        onSubscriptionVerified(result.subscription);
      }

    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus({
        loading: false,
        hasSubscription: false,
        subscription: null,
        reason: 'Error checking subscription status'
      });
    }
  };

  const handlePurchaseSubscription = () => {
    // Navigate to subscription plans with return path
    navigate('/individual-plan', {
      state: {
        returnTo: '/post-property',
        userType: userType,
        action: action
      }
    });
  };

  const handleRefreshSubscription = () => {
    checkSubscription();
  };

  // Loading state
  if (subscriptionStatus.loading) {
    return (
      <div className="subscription-guard">
        <div className="subscription-guard-container">
          <div className="subscription-loading">
            <div className="spinner-large"></div>
            <h3>Checking Subscription Status...</h3>
            <p>Please wait while we verify your subscription</p>
          </div>
        </div>
      </div>
    );
  }

  // Subscription valid - render children
  if (subscriptionStatus.hasSubscription) {
    return children;
  }

  // No subscription - show purchase prompt
  return (
    <div className="subscription-guard">
      <div className="subscription-guard-container">
        <div className="subscription-required">
          <div className="subscription-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FFD700"/>
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#FFA500" strokeWidth="1"/>
            </svg>
          </div>
          
          <h2>Subscription Required</h2>
          <p className="subscription-message">
            To {action}, you need an active subscription plan.
          </p>
          
          <div className="subscription-reason">
            <strong>Status:</strong> {subscriptionStatus.reason}
          </div>

          <div className="subscription-benefits">
            <h4>What you'll get:</h4>
            <ul>
              <li>✅ Post 1 property listing</li>
              <li>✅ Featured listing visibility</li>
              <li>✅ Email support</li>
              <li>✅ Property management tools</li>
            </ul>
          </div>

          <div className="subscription-actions">
            <button 
              className="purchase-subscription-btn"
              onClick={handlePurchaseSubscription}
            >
              <span className="btn-icon">💳</span>
              Purchase Subscription
            </button>
            
            <button 
              className="refresh-subscription-btn"
              onClick={handleRefreshSubscription}
            >
              <span className="btn-icon">🔄</span>
              Refresh Status
            </button>
          </div>

          <div className="subscription-note">
            <p>
              <strong>Note:</strong> Each subscription allows you to post one property. 
              After posting, you'll need a new subscription for additional properties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuard;