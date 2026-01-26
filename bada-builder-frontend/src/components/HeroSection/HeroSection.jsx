import { motion } from 'framer-motion';
import './HeroSection.css';
import { useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';
import BackgroundVideo from '../BackgroundVideo/BackgroundVideo';
import heroVideo from '../../assets/hero_background.mp4';

const HeroSection = () => {
  const locationState = useLocation();


  return (
    <section className="home-hero-section">
      <BackgroundVideo
        src={heroVideo}
        fallbackColor="#0F172A"
        overlay={false}
      >
        {/* Subtle gradient overlay */}
        <div className="home-hero-gradient-overlay" />

        <div className="home-hero-wrapper">


          {/* Search bar - separate, no background */}
          <div className="home-hero-search-positioner">
            <motion.div
              className="home-hero-search-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <DetailedSearchBar />
            </motion.div>
          </div>
        </div>
      </BackgroundVideo>
    </section>
  );
};

export default HeroSection;
