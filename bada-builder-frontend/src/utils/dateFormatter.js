// src/utils/dateFormatter.js
// Utility functions for consistent date formatting across the website

/**
 * Format date to dd/mm/yy format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date in dd/mm/yy format
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format date to dd/mm/yyyy format (full year)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date in dd/mm/yyyy format
 */
export const formatDateFull = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format date with month name (e.g., "15 Jan 24")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date with month name
 */
export const formatDateWithMonth = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format timestamp to dd/mm/yy format
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date in dd/mm/yy format
 */
export const formatTimestamp = (timestamp) => {
  return formatDate(timestamp);
};
