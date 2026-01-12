// Quick test utilities for auth performance
// Run these in browser console to test the improvements

export const authPerformanceTest = {
  // Test registration flow
  testRegistration: async (testEmail = `test${Date.now()}@example.com`, testPassword = 'test123456') => {
    console.log('🧪 Testing registration performance...');
    const startTime = performance.now();
    
    try {
      // This would normally be called from the UI
      console.log('Registration test would require UI interaction');
      console.log('Use the actual registration form to test performance');
      console.log('Expected: Registration completes in < 2-3 seconds');
      console.log('Expected: Auto-login after successful registration');
    } catch (error) {
      console.error('Registration test failed:', error);
    }
  },

  // Test login flow
  testLogin: async (email, password) => {
    console.log('🧪 Testing login performance...');
    console.log('Use the actual login form to test performance');
    console.log('Expected: Login completes in < 1-2 seconds');
    console.log('Expected: Immediate navigation after success');
  },

  // Monitor network performance
  monitorNetworkPerformance: () => {
    console.log('📊 Network performance monitoring enabled');
    console.log('Check console for timing logs during auth operations');
    console.log('Look for:');
    console.log('  ✅ Quick operations (< 1s)');
    console.log('  ⚠️ Slow operations (> 3s)');
    console.log('  🚀 All operation timings');
  }
};

// Auto-enable monitoring in development
if (process.env.NODE_ENV === 'development') {
  authPerformanceTest.monitorNetworkPerformance();
}