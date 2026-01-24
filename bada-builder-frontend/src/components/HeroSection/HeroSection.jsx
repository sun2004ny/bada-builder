import { motion } from 'framer-motion';
import './HeroSection.css';
import { useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';
import heroVideo from '../../assets/hero_background.mp4';

const HeroSection = () => {
  const locationState = useLocation();

  if (locationState.pathname === '/search') return null;

  return (
    <section className="hero-section">
      {/* Background Video */}
      <video
        className="hero-video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Animated mesh background */}
      <div className="hero-mesh" />

      {/* Floating lights */}
      <div className="hero-lights">
        <span />
        <span />
        <span />
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <h1>Find Your Dream Property</h1>

        <p>Search from a wide range of properties across India</p>

        <motion.div
          className="hero-search-wrapper"
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          <DetailedSearchBar />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
