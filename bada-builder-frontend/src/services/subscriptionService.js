import { subscriptionsAPI } from './api';

/**
 * Subscription Service for handling property posting subscriptions
 */
export class SubscriptionService {

  /**
   * Check if user has an active, unused subscription for property posting
   * @returns {Promise<{hasSubscription: boolean, subscription: object|null, reason: string}>}
   */
  static async checkPropertyPostingSubscription() {
    try {
      console.log('🔍 Checking property posting subscription...');

      const response = await subscriptionsAPI.getStatus();

      if (response && response.isSubscribed) {
        // For individuals, we check if they have posts left
        const hasPostsLeft = (response.postsLeft || 0) > 0;

        return {
          hasSubscription: hasPostsLeft,
          subscription: response,
          reason: hasPostsLeft ? 'Active subscription' : 'Subscription exhausted. Please purchase a new plan.'
        };
      }

      return {
        hasSubscription: false,
        subscription: null,
        reason: 'No active subscription found.'
      };

    } catch (error) {
      console.error('Error checking subscription:', error);
      return { hasSubscription: false, subscription: null, reason: 'Error checking subscription status' };
    }
  }

  /**
   * Mark subscription as used after successful property posting
   * @returns {Promise<boolean>}
   */
  static async markSubscriptionUsed() {
    // This is handled automatically by the backend property posting transaction now
    console.log('✅ Subscription usage is handled automatically by the server during posting.');
    return true;
  }

  /**
   * Get subscription details for display
   * @returns {Promise<object|null>}
   */
  static async getSubscriptionDetails() {
    try {
      const response = await subscriptionsAPI.getStatus();
      return response;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      return null;
    }
  }
}

export default SubscriptionService;