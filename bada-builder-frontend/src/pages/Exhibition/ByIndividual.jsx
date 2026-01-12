import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { filterAndMarkExpiredProperties } from '../../utils/propertyExpiry';
import './Exhibition.css';

const ByIndividual = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useViewPreference();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use real-time listener for immediate updates
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('user_type', '==', 'individual'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const propertiesData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter active properties on client side
            if (data.status === 'active') {
              propertiesData.push({
                id: doc.id,
                ...data
              });
            }
          });
          
          // Filter out expired properties and mark them as expired
          const activeProperties = await filterAndMarkExpiredProperties(propertiesData);
          
          // Sort by created_at on client side
          activeProperties.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          
          setProperties(activeProperties);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching individual properties:', error);
          setError(`Failed to load properties: ${error.message}`);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error('Error setting up properties listener:', error);
        setError(`Failed to load properties: ${error.message}`);
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
          <h1>Properties by Individual Owners</h1>
          <p>Direct listings from property owners - No middleman, better deals</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab active">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab">
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
            <p>Loading individual properties...</p>
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
                    image: property.image_url,
                    area: property.area || property.size,
                    status: property.status || 'Available',
                    badge: 'Individual'
                  }}
                  viewType={view}
                  source="individual"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State if no properties */}
        {!loading && !error && properties.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No properties available yet</h3>
            <p>Check back soon for new listings from individual owners</p>
            <Link to="/post-property" className="post-property-link">
              Be the first to post a property!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByIndividual;
