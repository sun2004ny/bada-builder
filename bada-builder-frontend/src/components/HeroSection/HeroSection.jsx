import { motion } from 'framer-motion';
import './HeroSection.css';
import { useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';
import heroVideo from '../../assets/hero_background.mp4';

const HeroSection = () => {
  const locationState = useLocation();

  return (
    <section className="home-hero-section relative overflow-hidden">

      {/* ================= VIDEO FRAME ================= */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          right: '24px',
          bottom: '24px',
          borderRadius: '28px',
          overflow: 'hidden',
          zIndex: 0,
          background: '#0f172a'
        }}
      >
        <video
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
          }}
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.75))',
          }}
        />
      </div>

      {/* ================= ANIMATED BORDER ================= */}
      <svg
        className="hero-animated-border"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="borderGradient" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Base Track */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="28"
          ry="28"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />

        {/* Animated Line - Controlled by Framer Motion for guarantee */}
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="28"
          ry="28"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="30 70"
          pathLength="100"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -100 }}
          transition={{
            duration: 6,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </svg>


      {/* ================= CONTENT ================= */}
      <div className="home-hero-wrapper relative" style={{ zIndex: 20 }}>
        <div className="home-hero-search-positioner">
          <motion.div
            className="home-hero-search-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <DetailedSearchBar />
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;