import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Check if a property's subscription has expired
 * @param {Object} property - Property object with subscription_expiry field
 * @returns {boolean} - True if expired, false otherwise
 */
export const isPropertyExpired = (property) => {
  if (!property.subscription_expiry) {
    return false; // No expiry date means it's active
  }

  const expiryDate = new Date(property.subscription_expiry);
  const now = new Date();
  
  return now > expiryDate;
};

/**
 * Mark an expired property as inactive in Firestore
 * @param {string} propertyId - Property document ID
 */
export const markPropertyAsExpired = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      status: 'expired',
      expired_at: new Date().toISOString()
    });
    console.log(`✅ Property ${propertyId} marked as expired`);
  } catch (error) {
    console.error(`❌ Error marking property ${propertyId} as expired:`, error);
  }
};

/**
 * Filter out expired properties and mark them as expired in Firestore
 * @param {Array} properties - Array of property objects
 * @returns {Array} - Filtered array of active properties only
 */
export const filterAndMarkExpiredProperties = async (properties) => {
  const activeProperties = [];
  const expiredPropertyIds = [];

  properties.forEach(property => {
    if (isPropertyExpired(property)) {
      expiredPropertyIds.push(property.id);
    } else {
      activeProperties.push(property);
    }
  });

  // Mark expired properties in Firestore (async, don't wait)
  if (expiredPropertyIds.length > 0) {
    console.log(`🔄 Found ${expiredPropertyIds.length} expired properties, marking as expired...`);
    expiredPropertyIds.forEach(id => {
      markPropertyAsExpired(id); // Fire and forget
    });
  }

  return activeProperties;
};

/**
 * Check if property should be displayed (active and not expired)
 * @param {Object} property - Property object
 * @returns {boolean} - True if should be displayed
 */
export const shouldDisplayProperty = (property) => {
  // Must be active status
  if (property.status !== 'active') {
    return false;
  }

  // Must not be expired
  if (isPropertyExpired(property)) {
    return false;
  }

  return true;
};
