import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDebug = () => {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>

          {/* User Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>

          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Is Logged In:</strong> {currentUser ? 'Yes' : 'No'}</p>
              <p><strong>User Type (currentUser):</strong> {currentUser?.user_type || currentUser?.userType || 'Not found'}</p>
              <p><strong>User Type (userProfile):</strong> {userProfile?.user_type || userProfile?.userType || 'Not found'}</p>
              <p><strong>Email:</strong> {currentUser?.email || 'Not found'}</p>
              <p><strong>Name:</strong> {currentUser?.name || 'Not found'}</p>
            </div>
          </div>

          {/* Admin Access Check */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Access Check</h2>
            <div className="space-y-2">
              {!currentUser ? (
                <p className="text-red-600">❌ Not logged in</p>
              ) : (
                <>
                  <p className="text-green-600">✅ User is logged in</p>
                  {(currentUser.user_type === 'admin' || currentUser.userType === 'admin') ? (
                    <p className="text-green-600">✅ User has admin privileges</p>
                  ) : (
                    <p className="text-red-600">❌ User does not have admin privileges</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-x-4">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
          <a 
            href="/admin" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Admin Panel
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;