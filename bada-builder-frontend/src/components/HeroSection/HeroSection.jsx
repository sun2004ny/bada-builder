import { motion } from 'framer-motion';
import './HeroSection.css';
import { useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';
import BackgroundVideo from '../BackgroundVideo/BackgroundVideo';
import heroVideo from '../../assets/hero_background.mp4';

const HeroSection = () => {
  const locationState = useLocation();

  if (locationState.pathname === '/search') return null;

  return (
    <section className="hero-section">
      <BackgroundVideo
        src={heroVideo}
        fallbackColor="#0F172A"
        overlay={false}
      >
        {/* Subtle gradient overlay */}
        <div className="hero-gradient-overlay" />

        <div className="hero-wrapper">
          {/* Text container with background */}
          <motion.div
            className="hero-text-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            >
              Find Your Dream Property
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            >
              Search from a wide range of properties across India
            </motion.p>
          </motion.div>

          {/* Search bar - separate, no background */}
          <motion.div
            className="hero-search-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <DetailedSearchBar />
          </motion.div>
        </div>
      </BackgroundVideo>
    </section>
  );
};

export default HeroSection;
