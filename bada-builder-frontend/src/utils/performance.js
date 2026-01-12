// Performance monitoring utilities for auth operations

export const performanceMonitor = {
  // Track auth operation timing
  trackAuthOperation: (operationType, startTime) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`🚀 ${operationType} completed in ${duration.toFixed(2)}ms`);
    
    // Log performance warnings
    if (duration > 3000) {
      console.warn(`⚠️ ${operationType} took longer than expected (${duration.toFixed(2)}ms)`);
    } else if (duration < 1000) {
      console.log(`✅ ${operationType} completed quickly (${duration.toFixed(2)}ms)`);
    }
    
    return duration;
  },

  // Track network requests
  trackNetworkRequest: async (requestName, requestPromise) => {
    const startTime = performance.now();
    
    try {
      const result = await requestPromise;
      performanceMonitor.trackAuthOperation(requestName, startTime);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ ${requestName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Simple retry mechanism for failed operations
  retryOperation: async (operation, maxRetries = 2, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt <= maxRetries) {
          console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }
};