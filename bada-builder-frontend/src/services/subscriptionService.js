import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Subscription Service for handling property posting subscriptions
 */
export class SubscriptionService {
  
  /**
   * Check if user has an active, unused subscription for property posting
   * @param {string} userId - Firebase user ID
   * @returns {Promise<{hasSubscription: boolean, subscription: object|null, reason: string}>}
   */
  static async checkPropertyPostingSubscription(userId) {
    try {
      console.log('🔍 Checking property posting subscription for user:', userId);
      
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { hasSubscription: false, subscription: null, reason: 'User profile not found' };
      }
      
      const userProfile = userDoc.data();
      
      // Check if user has an active subscription
      if (!userProfile.is_subscribed) {
        return { hasSubscription: false, subscription: null, reason: 'No active subscription' };
      }
      
      // Check subscription expiry
      if (userProfile.subscription_expiry) {
        const expiryDate = new Date(userProfile.subscription_expiry);
        if (expiryDate <= new Date()) {
          return { hasSubscription: false, subscription: null, reason: 'Subscription expired' };
        }
      }
      
      // Check if subscription allows property posting
      const subscriptionType = userProfile.subscription_type;
      if (!subscriptionType || !subscriptionType.includes('individual')) {
        return { hasSubscription: false, subscription: null, reason: 'Subscription does not include property posting' };
      }
      
      // Check if subscription has been used for property posting
      const propertiesQuery = query(
        collection(db, 'properties'),
        where('user_id', '==', userId),
        where('subscription_id', '==', userProfile.current_subscription_id || 'current')
      );
      
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesPosted = propertiesSnapshot.size;
      
      // Individual plans typically allow 1 property per subscription
      const allowedProperties = 1;
      
      if (propertiesPosted >= allowedProperties) {
        return { 
          hasSubscription: false, 
          subscription: userProfile, 
          reason: `Subscription limit reached (${propertiesPosted}/${allowedProperties} properties used)` 
        };
      }
      
      return { 
        hasSubscription: true, 
        subscription: userProfile, 
        reason: `Valid subscription (${propertiesPosted}/${allowedProperties} properties used)` 
      };
      
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { hasSubscription: false, subscription: null, reason: 'Error checking subscription' };
    }
  }
  
  /**
   * Mark subscription as used after successful property posting
   * @param {string} userId - Firebase user ID
   * @param {string} propertyId - Property document ID
   * @returns {Promise<boolean>}
   */
  static async markSubscriptionUsed(userId, propertyId) {
    try {
      console.log('📝 Marking subscription as used for property:', propertyId);
      
      // Get current user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userProfile = userDoc.data();
      const subscriptionId = userProfile.current_subscription_id || 'current';
      
      // Update the property document to include subscription tracking
      await updateDoc(doc(db, 'properties', propertyId), {
        subscription_id: subscriptionId,
        subscription_used_at: new Date().toISOString()
      });
      
      // Log the subscription usage
      await addDoc(collection(db, 'subscription_usage'), {
        user_id: userId,
        subscription_id: subscriptionId,
        property_id: propertyId,
        action: 'property_posted',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Subscription usage recorded successfully');
      return true;
      
    } catch (error) {
      console.error('Error marking subscription as used:', error);
      return false;
    }
  }
  
  /**
   * Create a new subscription record after successful payment
   * @param {string} userId - Firebase user ID
   * @param {object} subscriptionData - Subscription details
   * @returns {Promise<string>} - Subscription ID
   */
  static async createSubscription(userId, subscriptionData) {
    try {
      console.log('💳 Creating new subscription for user:', userId);
      
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate expiry date
      const expiryDate = new Date();
      const months = subscriptionData.duration_months || 1;
      expiryDate.setMonth(expiryDate.getMonth() + months);
      
      // Create subscription record
      const subscriptionRecord = {
        subscription_id: subscriptionId,
        user_id: userId,
        plan_id: subscriptionData.plan_id,
        plan_name: subscriptionData.plan_name,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'INR',
        duration_months: months,
        created_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        status: 'active',
        payment_id: subscriptionData.payment_id,
        properties_allowed: 1,
        properties_used: 0
      };
      
      await addDoc(collection(db, 'subscriptions'), subscriptionRecord);
      
      // Update user profile
      await updateDoc(doc(db, 'users', userId), {
        is_subscribed: true,
        subscription_type: `individual_${subscriptionData.plan_id}`,
        subscription_expiry: expiryDate.toISOString(),
        current_subscription_id: subscriptionId,
        last_subscription_date: new Date().toISOString()
      });
      
      console.log('✅ Subscription created successfully:', subscriptionId);
      return subscriptionId;
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
  
  /**
   * Get subscription details for display
   * @param {string} userId - Firebase user ID
   * @returns {Promise<object|null>}
   */
  static async getSubscriptionDetails(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      
      const userProfile = userDoc.data();
      if (!userProfile.is_subscribed) return null;
      
      // Get properties count for this subscription
      const propertiesQuery = query(
        collection(db, 'properties'),
        where('user_id', '==', userId),
        where('subscription_id', '==', userProfile.current_subscription_id || 'current')
      );
      
      const propertiesSnapshot = await getDocs(propertiesQuery);
      
      return {
        isActive: userProfile.is_subscribed,
        expiryDate: userProfile.subscription_expiry,
        subscriptionType: userProfile.subscription_type,
        propertiesUsed: propertiesSnapshot.size,
        propertiesAllowed: 1
      };
      
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return null;
    }
  }
}

export default SubscriptionService;