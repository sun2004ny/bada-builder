import { useState, useEffect } from 'react';

/**
 * Custom hook to manage view preference (grid/list) with localStorage persistence
 * @returns {[string, function]} Current view and setter function
 */
const useViewPreference = () => {
  const [view, setView] = useState(() => {
    // Initialize from localStorage or default to 'grid'
    const savedView = localStorage.getItem('propertyViewPreference');
    return savedView || 'grid';
  });

  useEffect(() => {
    // Save to localStorage whenever view changes
    localStorage.setItem('propertyViewPreference', view);
  }, [view]);

  return [view, setView];
};

export default useViewPreference;
