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





  return (
    <section className="hero-section">
      {/* Success Message */}


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
