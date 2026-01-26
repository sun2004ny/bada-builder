import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { propertiesAPI } from '../../services/api';
import './Exhibition.css';

const ByBadaBuilder = () => {
  const [view, setView] = useViewPreference();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Fetch curated/admin properties
        const response = await propertiesAPI.getAll({
          user_type: 'admin',
          status: 'active'
        });

        const propertiesData = response.properties || response || [];
        
        // Sort by created_at desc (newest first)
        propertiesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setProperties(propertiesData);
      } catch (err) {
        console.error('Error fetching Bada Builder properties:', err);
        setError('Failed to load curated properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="exhibition-page">
      <div className="exhibition-container">
        {/* Header */}
        <motion.div
          className="exhibition-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Curated by Bada Builder</h1>
          <p>Handpicked premium properties verified by our experts</p>
          <div className="badge-container">
            <span className="verified-badge">✓ 100% Verified</span>
            <span className="verified-badge">✓ Best ROI</span>
            <span className="verified-badge">✓ Legal Clearance</span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab active">
            By Bada Builder
          </Link>
          <Link to="/go-global" className="tab">
            🌍 Go Global
          </Link>
        </motion.div>

        {/* View Toggle */}
        {!loading && !error && properties.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading curated properties...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>⚠️ {error}</h3>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <div className={`properties-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PropertyCard
                  property={{
                    ...property,
                    status: 'Verified',
                    badge: 'Bada Builder',
                    owner: property.category,
                    featured: true
                  }}
                  viewType={view}
                  source="badabuilder"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Why Choose Bada Builder Section */}
        <motion.div
          className="why-choose-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Why Choose Bada Builder Curated Properties?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔍</div>
              <h3>Verified Properties</h3>
              <p>Every property is thoroughly verified for legal compliance</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Best ROI</h3>
              <p>Handpicked for maximum return on investment</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Secure Investment</h3>
              <p>Complete legal clearance and documentation support</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Expert Guidance</h3>
              <p>Dedicated support from property experts</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ByBadaBuilder;
