import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SubscriptionService from '../services/subscriptionService';

/**
 * Test component for subscription service - Remove in production
 */
const SubscriptionTest = () => {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testSubscriptionCheck = async () => {
    if (!currentUser?.uid) {
      addResult('No user logged in', 'error');
      return;
    }

    setLoading(true);
    addResult('Testing subscription check...', 'info');

    try {
      const result = await SubscriptionService.checkPropertyPostingSubscription(currentUser.uid);
      addResult(`Subscription check result: ${JSON.stringify(result, null, 2)}`, 
        result.hasSubscription ? 'success' : 'warning');
    } catch (error) {
      addResult(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionDetails = async () => {
    if (!currentUser?.uid) {
      addResult('No user logged in', 'error');
      return;
    }

    setLoading(true);
    addResult('Testing subscription details...', 'info');

    try {
      const details = await SubscriptionService.getSubscriptionDetails(currentUser.uid);
      addResult(`Subscription details: ${JSON.stringify(details, null, 2)}`, 'info');
    } catch (error) {
      addResult(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '400px', 
      background: 'white', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>🧪 Subscription Test</h3>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button 
          onClick={testSubscriptionCheck}
          disabled={loading}
          style={{ 
            padding: '6px 12px', 
            fontSize: '12px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Check Subscription
        </button>
        
        <button 
          onClick={testSubscriptionDetails}
          disabled={loading}
          style={{ 
            padding: '6px 12px', 
            fontSize: '12px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Get Details
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            padding: '6px 12px', 
            fontSize: '12px', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '4px 8px', 
              margin: '2px 0', 
              borderRadius: '4px',
              background: 
                result.type === 'success' ? '#d4edda' :
                result.type === 'error' ? '#f8d7da' :
                result.type === 'warning' ? '#fff3cd' : '#d1ecf1',
              border: `1px solid ${
                result.type === 'success' ? '#c3e6cb' :
                result.type === 'error' ? '#f5c6cb' :
                result.type === 'warning' ? '#ffeaa7' : '#bee5eb'
              }`
            }}
          >
            <strong>[{result.timestamp}]</strong> {result.message}
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #f3f3f3', 
              borderTop: '2px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SubscriptionTest;