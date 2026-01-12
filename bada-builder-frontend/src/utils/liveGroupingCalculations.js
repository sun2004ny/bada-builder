// src/utils/liveGroupingCalculations.js
// Utility functions for Live Grouping price calculations

/**
 * Calculate token amount (0.5% of discounted total property price)
 * @param {number} groupPricePerSqFt - Group discounted price per sq ft
 * @param {string|number} area - Property area (e.g., "1450 sq.ft" or 1450)
 * @returns {number} Token amount
 */
export const calculateTokenAmount = (groupPricePerSqFt, area) => {
  if (!groupPricePerSqFt || !area) return 0;
  
  // Extract numeric value from area string if needed
  const areaValue = typeof area === 'string' 
    ? parseFloat(area.replace(/[^0-9.]/g, '')) 
    : area;
  
  // Calculate total discounted price
  const totalGroupPrice = groupPricePerSqFt * areaValue;
  
  // Calculate 0.5% as token amount
  const tokenAmount = totalGroupPrice * 0.005;
  
  return Math.round(tokenAmount);
};

/**
 * Calculate total property price
 * @param {number} pricePerSqFt - Price per sq ft
 * @param {string|number} area - Property area
 * @returns {number} Total price
 */
export const calculateTotalPrice = (pricePerSqFt, area) => {
  if (!pricePerSqFt || !area) return 0;
  
  const areaValue = typeof area === 'string' 
    ? parseFloat(area.replace(/[^0-9.]/g, '')) 
    : area;
  
  return Math.round(pricePerSqFt * areaValue);
};

/**
 * Calculate savings amount
 * @param {number} regularPricePerSqFt - Regular price per sq ft
 * @param {number} groupPricePerSqFt - Group price per sq ft
 * @param {string|number} area - Property area
 * @returns {number} Savings amount
 */
export const calculateSavings = (regularPricePerSqFt, groupPricePerSqFt, area) => {
  const regularTotal = calculateTotalPrice(regularPricePerSqFt, area);
  const groupTotal = calculateTotalPrice(groupPricePerSqFt, area);
  
  return regularTotal - groupTotal;
};

/**
 * Format currency in Indian format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  
  // Convert to lakhs or crores for better readability
  if (amount >= 10000000) {
    // Crores
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    // Lakhs
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  } else {
    // Thousands
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

/**
 * Calculate price range for multiple units
 * @param {number} pricePerSqFt - Price per sq ft (same for all units)
 * @param {Array} units - Array of unit objects with area
 * @returns {Object} Price range {min, max}
 */
export const calculatePriceRange = (pricePerSqFt, units) => {
  if (!pricePerSqFt || !units || units.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = units.map(unit => {
    const area = typeof unit.area === 'string' 
      ? parseFloat(unit.area.replace(/[^0-9.]/g, '')) 
      : unit.area;
    return pricePerSqFt * area;
  });

  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

/**
 * Format price range display
 * @param {Object} range - Price range {min, max}
 * @returns {string} Formatted range string
 */
export const formatPriceRange = (range) => {
  if (!range || range.min === 0 || range.max === 0) {
    return 'N/A';
  }

  const minFormatted = formatCurrency(range.min);
  const maxFormatted = formatCurrency(range.max);

  if (range.min === range.max) {
    return minFormatted;
  }

  return `${minFormatted} - ${maxFormatted}`;
};

/**
 * Calculate discount percentage
 * @param {number} regularPrice - Regular price
 * @param {number} groupPrice - Group price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (regularPrice, groupPrice) => {
  if (!regularPrice || !groupPrice) return 0;
  
  const discount = ((regularPrice - groupPrice) / regularPrice) * 100;
  return Math.round(discount);
};
