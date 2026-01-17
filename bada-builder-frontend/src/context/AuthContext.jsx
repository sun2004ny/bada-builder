import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      if (response.user) {
        const user = response.user;
        setCurrentUser({
          id: user.id,
          uid: user.id, // Add uid for compatibility with existing components
          email: user.email,
          name: user.name,
        });
        setUserProfile({
          ...user, // Include all fields from backend
          id: user.id,
          uid: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.user_type,
          user_type: user.user_type, // Maintain both just in case
          profilePhoto: user.profile_photo,
          profile_photo: user.profile_photo, // Maintain both just in case
          is_subscribed: user.is_subscribed,
          isSubscribed: user.is_subscribed,
          subscription_expiry: user.subscription_expiry,
          subscriptionExpiry: user.subscription_expiry,
          subscription_plan: user.subscription_plan,
          subscription_price: user.subscription_price,
          subscribed_at: user.subscribed_at,
          created_at: user.created_at,
        });
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Only log out if it's strictly a 401 Unauthorized error
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setUserProfile(null);
      } else {
        // For other errors (429, 500, Network), keep the session active
        console.warn('Preserving session despite API error:', error.message);
      }
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser({
          id: user.id,
          uid: user.id, // Add uid for compatibility with existing components
          email: user.email,
          name: user.name,
        });
        // Fetch fresh profile data
        fetchUserProfile();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      authAPI.logout();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const isSubscribed = useCallback(() => {
    if (!userProfile) {
      return false;
    }

    if (!userProfile.is_subscribed) {
      return false;
    }

    // Check if subscription is still valid
    if (userProfile.subscription_expiry) {
      const expiryDate = new Date(userProfile.subscription_expiry);
      const isValid = expiryDate > new Date();
      return isValid;
    }

    // If no expiry date, assume it's valid (lifetime subscription)
    return true;
  }, [userProfile]);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    logout,
    isSubscribed,
    isAuthenticated: !!currentUser,
    refreshProfile,
    setUserProfile, // Allow manual updates
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};