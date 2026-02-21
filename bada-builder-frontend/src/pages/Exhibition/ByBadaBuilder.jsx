import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { propertiesAPI } from "../../services/api";
import ViewToggle from "../../components/ViewToggle/ViewToggle";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import useViewPreference from "../../hooks/useViewPreference";
import { filterAndMarkExpiredProperties } from "../../utils/propertyExpiry";

import "./Exhibition.css";

// --- Internal Components for Clean Structure ---

const FloatingBackground = ({ children }) => {
  return (
    <div className="floating-background-wrapper">
      <div className="mesh-gradient"></div>
      <div className="noise-overlay"></div>
      <div className="floating-shapes">
        {[
          { cls: "shape-1", anim: { x: [0, 50, -30, 0], y: [0, -40, 60, 0], scale: [1, 1.2, 0.9, 1], rotate: [0, 90, 180, 0] }, dur: 25 },
          { cls: "shape-2", anim: { x: [0, -60, 40, 0], y: [0, 50, -20, 0], scale: [1.2, 0.8, 1.1, 1.2], rotate: [0, -120, -240, 0] }, dur: 30 },
          { cls: "shape-3", anim: { x: [0, 30, -50, 0], y: [0, 100, 50, 0], opacity: [0.4, 0.7, 0.4] }, dur: 20 }
        ].map((shape, i) => (
          <motion.div
            key={i}
            className={`blur-shape ${shape.cls}`}
            animate={shape.anim}
            transition={{ duration: shape.dur, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>
      <div className="content-relative">
        {children}
      </div>
    </div>
  );
};

const ExhibitionBadaBuilderHero = ({ title, subtitle }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Split title into two specific lines: "Curated by" and "Bada Builder"
  const titleLines = ["Curated by", "Bada Builder"];

  return (
    <motion.div
      className="hero-glass-container"
      style={{ scale, opacity }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="hero-glass-box">
        <div className="hero-content-flex">
          <div className="hero-left">
            <motion.div className="title-wrapper">
              {titleLines.map((line, lineIdx) => (
                <div key={lineIdx} className="title-line">
                  {line.split(" ").map((word, wordIdx) => (
                    <span key={wordIdx} className="word-span">
                      {word.split("").map((letter, letterIdx) => (
                        <motion.span key={letterIdx} variants={letterVariants} className="letter-span">
                          {letter}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
            <motion.div
              className="hero-subtitle-divider"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            />
            <motion.p variants={itemVariants} className="hero-subtitle">{subtitle}</motion.p>
            <motion.div
              variants={itemVariants}
              className="hero-badge"
              animate={{ boxShadow: ["0 0 0px rgba(124, 58, 237, 0)", "0 0 15px rgba(124, 58, 237, 0.4)", "0 0 0px rgba(124, 58, 237, 0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="badge-text">100% Verified</span>
              <div className="pulse-dot"></div>
            </motion.div>
          </div>

          <div className="hero-right">
            <motion.div className="floating-property-icons" style={{ y: y1 }}>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`float-box box-${i}`}
                  animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  <div className="inner-glass"><div className="shimmer"></div></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="hero-background-glow"></div>
      </div>
    </motion.div>
  );
};

const AnimatedTabs = () => {
  const location = useLocation();
  return (
    <motion.div
      className="exhibition-tabs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Link to="/exhibition/individual" className={`tab ${location.pathname === "/exhibition/individual" ? "active" : ""}`}>
        By Individual
      </Link>
      <Link to="/exhibition/developer" className={`tab ${location.pathname === "/exhibition/developer" ? "active" : ""}`}>
        By Developer
      </Link>
      <Link to="/exhibition/live-grouping" className={`tab ${location.pathname === "/exhibition/live-grouping" ? "active" : ""}`}>
        🔴 Live Grouping
      </Link>
      <Link to="/exhibition/badabuilder" className={`tab ${location.pathname === "/exhibition/badabuilder" ? "active" : ""}`}>
        By Bada Builder
      </Link>
    </motion.div>
  );
};

const StickyFilterBar = ({ children }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [100, 200], [0, 1]);
  const y = useTransform(scrollY, [100, 200], [-50, 0]);
  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      <div className="sticky-filter-wrapper">
        <div className="sticky-filter-content">{children}</div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const ByBadaBuilder = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useViewPreference();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertiesAPI.getAll({ user_type: "admin", status: "active" });
        const propertiesData = response.properties || response || [];
        const activeProperties = await filterAndMarkExpiredProperties(propertiesData);
        activeProperties.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setProperties(activeProperties);
      } catch (error) {
        console.error("Error fetching Bada Builder properties:", error);
        setError(`Failed to load curated properties: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
    const interval = setInterval(fetchProperties, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FloatingBackground>
      <ExhibitionBadaBuilderHero
        title="Curated by Bada Builder"
        subtitle="Handpicked premium properties verified by our experts. Best ROI, legal clearance, and complete documentation support."
      />
      <div className="exhibition-container">
        <AnimatedTabs />
        {!loading && !error && properties.length > 0 && (
          <StickyFilterBar>
            <ViewToggle view={view} onViewChange={setView} />
          </StickyFilterBar>
        )}
        <div className="content-grid-area">
          {loading && (
            <motion.div className="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="spinner"></div>
              <p>Loading curated properties...</p>
            </motion.div>
          )}
          {error && (
            <motion.div className="error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>⚠️ {error}</h3>
              <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {!loading && !error && (
              <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className={`properties-grid ${view === "list" ? "list-view" : "grid-view"}`}
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <PropertyCard
                      property={{
                        ...property,
                        status: "Verified",
                        badge: "Bada Builder",
                        owner: property.category || "Curated",
                        featured: true,
                      }}
                      viewType={view}
                      source="badabuilder"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {!loading && !error && properties.length === 0 && (
            <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>No curated properties available yet</h3>
              <p>Check back soon for handpicked premium properties</p>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Consolidated Styles */
        .floating-background-wrapper { position: relative; min-height: 100vh; width: 100%; overflow: hidden; background-color: #0f172a; }
        .mesh-gradient { position: absolute; inset: 0; background: radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(30, 64, 175, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(15, 23, 42, 1) 0px, transparent 100%); z-index: 0; }
        .noise-overlay { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); opacity: 0.05; mix-blend-mode: soft-light; pointer-events: none; z-index: 1; }
        .floating-shapes { position: absolute; inset: 0; pointer-events: none; z-index: 0; filter: blur(80px); }
        .blur-shape { position: absolute; border-radius: 50%; opacity: 0.4; }
        .shape-1 { width: 400px; height: 400px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); top: -100px; left: -50px; }
        .shape-2 { width: 500px; height: 500px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); bottom: 10%; right: -100px; }
        .shape-3 { width: 300px; height: 300px; background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%); top: 40%; left: 30%; }
        .content-relative { position: relative; z-index: 2; }

        .hero-glass-container { 
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 24px 0 40px;
          z-index: 10;
        }

        .hero-glass-box { 
          width: calc(100% - 48px);
          max-width: 1400px; 
          background: rgba(255, 255, 255, 0.03); 
          backdrop-filter: blur(25px); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 24px; 
          padding: 40px 24px; 
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2); 
          position: relative; 
          overflow: hidden; 
        }
        .hero-glass-box::before { content: ''; position: absolute; inset: 0; border-radius: 24px; background: linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(59, 130, 246, 0.1)); filter: blur(20px); z-index: -1; }
        @media (min-width: 1024px) { .hero-glass-box { padding: 48px 48px; } }
        .hero-content-flex { display: grid; grid-template-columns: 1fr; align-items: center; gap: 24px; position: relative; z-index: 2; }
        @media (min-width: 1024px) { .hero-content-flex { grid-template-columns: repeat(2, 1fr); } }
        
        .title-wrapper { margin-bottom: 20px; }
        .title-line { display: block; margin-bottom: 4px; }
        .word-span { display: inline-block; margin-right: 14px; }
        .word-span:last-child { margin-right: 0; }
        .letter-span { 
          display: inline-block; 
          font-size: 32px; 
          font-weight: 800; 
          color: #ffffff; 
          text-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); 
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        @media (min-width: 1024px) { .letter-span { font-size: 44px; } }
        @media (min-width: 1280px) { .letter-span { font-size: 56px; } }
        
        .hero-subtitle-divider { width: 120px; height: 3px; background: linear-gradient(90deg, #7c3aed, rgba(124, 58, 237, 0.3), transparent); margin-top: 16px; margin-bottom: 24px; }
        .hero-subtitle { 
          font-size: 17px; 
          color: rgba(255, 255, 255, 0.85); 
          line-height: 1.7; 
          max-width: 600px; 
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        
        .hero-badge { 
          display: inline-flex; 
          align-items: center; 
          gap: 12px; 
          background: rgba(124, 58, 237, 0.15); 
          border: 1px solid rgba(124, 58, 237, 0.4); 
          padding: 0 24px; 
          height: 44px; 
          border-radius: 100px; 
          color: #c084fc; 
          font-weight: 700; 
          font-size: 15px; 
          margin-top: 28px; 
        }
        .badge-text { display: flex; align-items: center; height: 100%; padding-top: 1px; }
        .pulse-dot { width: 8px; height: 8px; background-color: #7c3aed; border-radius: 50%; position: relative; }
        .pulse-dot::after { content: ''; position: absolute; inset: -4px; border: 2px solid #7c3aed; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        .floating-property-icons { 
          position: absolute; 
          top: 55%; 
          right: -40px;
          transform: translateY(-50%) scale(0.6); 
          width: 250px; 
          height: 250px; 
          opacity: 0.4; 
          pointer-events: none;
        }

        .float-box { position: absolute; width: 100px; height: 130px; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
        .box-1 { top: 0; right: 0px; z-index: 3; } 
        .box-2 { top: 20px; right: 40px; z-index: 2; } 
        .box-3 { top: 80px; right: 10px; z-index: 1; }

        @media (min-width: 1024px) {
          .floating-property-icons {
            top: 20px;
            right: 40px;
            transform: scale(1.0);
            width: 500px;
            height: 500px;
            opacity: 0.75;
          }
          .float-box { width: 220px; height: 280px; border-radius: 32px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4); } 
          .box-1 { top: 0; right: 0; }
          .box-2 { top: 70px; right: 170px; }
          .box-3 { top: 190px; right: 40px; } 
        }
        @media (min-width: 1440px) {
          .floating-property-icons {
            right: 80px;
            top: 10px;
            width: 600px;
            height: 600px;
          }
          .float-box { width: 260px; height: 340px; }
          .box-2 { right: 220px; top: 90px; }
          .box-3 { top: 240px; right: 60px; }
        }
        .inner-glass { width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); position: relative; }
        .shimmer { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent); animation: shimmer 3s infinite; }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }

        .hero-background-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1), transparent 70%); pointer-events: none; z-index: 0; }

        .sticky-filter-wrapper { position: sticky; top: 80px; z-index: 50; margin-bottom: 40px; pointer-events: none; }
        .sticky-filter-content { display: flex; justify-content: flex-end; max-width: 1200px; margin: 0 auto; pointer-events: auto; padding: 10px 20px; }
        .sticky-filter-bg { position: fixed; top: 0; inset-inline: 0; height: 140px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); z-index: 49; pointer-events: none; }
        .sticky-filter-content > * { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 4px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); }

        .content-grid-area { min-height: 400px; margin-top: 20px; padding-bottom: 100px; }
      `}</style>
    </FloatingBackground>
  );
};

export default ByBadaBuilder;
