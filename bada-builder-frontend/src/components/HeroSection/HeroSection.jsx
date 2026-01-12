import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';
import { useNavigate, useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';

const HeroSection = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  // 🔴 HIDE HERO SECTION ON SEARCH PAGE
  if (locationState.pathname === '/search') {
    return null;
  }

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Success message from booking
  useEffect(() => {
    if (locationState.state?.successMessage) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [locationState]);



  return (
    <section className="hero-section">
      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>{locationState.state?.successMessage}</span>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      <div className="hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Find Your Dream Property
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Search from a wide range of properties across India
        </motion.p>

        <DetailedSearchBar />
      </div>
    </section>
  );
};

export default HeroSection;
