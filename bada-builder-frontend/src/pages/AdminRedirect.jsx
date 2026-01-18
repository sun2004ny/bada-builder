import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRedirect = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading, profileLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (loading || profileLoading) return;

    // Check if user is already logged in and is admin
    if (currentUser) {
      const userType = userProfile?.user_type || userProfile?.userType || currentUser?.user_type || currentUser?.userType;
      console.log('AdminRedirect check:', { userType, currentUser, userProfile });
      if (userType === 'admin') {
        navigate('/admin');
      } else {
        // Redirect regular users back to user login or home
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [currentUser, userProfile, loading, profileLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;