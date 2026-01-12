import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import './Exhibition.css';

const ByBadaBuilder = () => {
  const [view, setView] = useViewPreference();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback data
  const fallbackProperties = [
    {
      id: 1,
      title: "Premium Investment Opportunity",
      category: "Curated by Bada Builder",
      location: "Prime Location, Vadodara",
      price: "₹75 L - ₹1.5 Cr",
      image: "/placeholder-property.jpg",
      type: "Mixed Development",
      roi: "12% Expected ROI",
      verified: true
    },
    {
      id: 2,
      title: "Smart City Project",
      category: "Curated by Bada Builder",
      location: "IT Park Area, Vadodara",
      price: "₹60 L - ₹1.2 Cr",
      image: "/placeholder-property.jpg",
      type: "Residential + Commercial",
      roi: "15% Expected ROI",
      verified: true
    },
    {
      id: 3,
      title: "Luxury Waterfront Villas",
      category: "Curated by Bada Builder",
      location: "Ajwa Road, Vadodara",
      price: "₹1.5 Cr - ₹3 Cr",
      image: "/placeholder-property.jpg",
      type: "Ultra Luxury",
      roi: "10% Expected ROI",
      verified: true
    }
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('badaBuilderProperties') || '[]');
    if (stored.length > 0) {
      // Ensure robust structure
      const processed = stored.map(p => ({
        ...p,
        verified: true,
        roi: 'High ROI', // Default for posted ones
        image: (p.images && p.images.length > 0) ? p.images[0] : (p.imageUrl || '/placeholder-property.jpg'),
        price: p.price || 'Price on Request',
        // Map correct fields for PropertyCard
        owner: p.developer || 'Bada Builder Curated',
        type: p.type || p.category || 'Premium Property'
      }));
      setProperties(processed);
    } else {
      setProperties(fallbackProperties);
    }
    setLoading(false);
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Properties Grid */}
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
