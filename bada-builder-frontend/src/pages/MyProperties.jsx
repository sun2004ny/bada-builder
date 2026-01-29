import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import useViewPreference from '../hooks/useViewPreference';
import { FiEdit2, FiEye, FiTrash2, FiClock, FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';
import { isPropertyExpired, markPropertyAsExpired } from '../utils/propertyExpiry';
import { formatDate } from '../utils/dateFormatter';
import { shortStayAPI } from '../services/shortStayApi';
import ShortStayForm from '../components/ShortStay/ShortStayForm';
import { AnimatePresence } from 'framer-motion';
import './MyProperties.css';

const MyProperties = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useViewPreference();
  const [timerRefresh, setTimerRefresh] = useState(0);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual', 'developer', or 'short-stay'
  const [shortStayProperties, setShortStayProperties] = useState([]);
  const [editingShortStay, setEditingShortStay] = useState(null);

  // Initial data fetch
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchProperties();
    fetchSubscriptionData();
  }, [currentUser, navigate]);

  // Auto-refresh timer every minute
  useEffect(() => {
    if (properties.length > 0) {
      const interval = setInterval(() => {
        setTimerRefresh(prev => prev + 1);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      const [realEstateRes, shortStayRes] = await Promise.all([
          propertiesAPI.getMyProperties(),
          shortStayAPI.getMyListings().catch(err => ({ properties: [] }))
      ]);

      const propertiesData = realEstateRes.properties || [];
      const shortStayData = shortStayRes.properties || [];

      // Check for expired properties
      propertiesData.forEach(property => {
        if (property.status === 'active' && isPropertyExpired(property)) {
          property.status = 'expired'; // Update local state
        }
      });

      // Sort by created_at (newest first)
      const sortByDate = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);
      
      propertiesData.sort(sortByDate);
      shortStayData.sort(sortByDate);

      setProperties(propertiesData);
      setShortStayProperties(shortStayData);

    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    // Disabled due to missing dependencies
    // try {
    //   const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    //   if (userDoc.exists()) {
    //     const userData = userDoc.data();
    //     setSubscriptionExpiry(userData.subscription_expiry);
    //   }
    // } catch (error) {
    //   console.error('Error fetching subscription data:', error);
    // }
  };

  const getSubscriptionTimeRemaining = (property) => {
    // Use property's own subscription expiry if available
    const expiryDate = property.subscription_expiry ? new Date(property.subscription_expiry) : (subscriptionExpiry ? new Date(subscriptionExpiry) : null);

    if (!expiryDate) {
      return { expired: false, text: 'Active', daysLeft: null };
    }

    const now = new Date();
    const diffMs = expiryDate - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Subscription expired', daysLeft: 0 };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return {
        expired: false,
        text: `${months}mo ${remainingDays}d left`,
        daysLeft: diffDays,
        urgent: false
      };
    } else if (diffDays > 7) {
      return {
        expired: false,
        text: `${diffDays} days left`,
        daysLeft: diffDays,
        urgent: false
      };
    } else if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays}d ${diffHours}h left`,
        daysLeft: diffDays,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffHours}h left`,
        daysLeft: 0,
        urgent: true
      };
    }
  };

  const isEditable = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();
    return now < threeDaysLater;
  };

  const getTimeRemaining = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();

    const diffMs = threeDaysLater - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Edit period expired' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays}d ${diffHours}h left`,
        urgent: diffDays === 0
      };
    } else if (diffHours > 0) {
      return {
        expired: false,
        text: `${diffHours}h ${diffMinutes}m left`,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffMinutes}m left`,
        urgent: true
      };
    }
  };

  const handleView = (property) => {
    navigate(`/property-details/${property.id}`, {
      state: { property, type: property.user_type }
    });
  };

  const handleEdit = (property) => {
    if (!isEditable(property.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.');
      return;
    }
    navigate('/post-property', {
      state: {
        userType: property.user_type,
        editProperty: property
      }
    });
  };

  const handleDelete = async (property) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${property.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await propertiesAPI.delete(property.id);
      alert('✅ Property deleted successfully!');
      // Refresh the list
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('❌ Failed to delete property. Please try again.');
    }
  };

  // --- Short Stay Handlers ---
  const handleShortStayDelete = async (property) => {
      if (window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
          try {
              await shortStayAPI.delete(property.id);
              
              setShortStayProperties(prev => prev.filter(p => p.id !== property.id));
              alert('Property deleted successfully.');
          } catch (error) {
              console.error('Delete failed:', error);
              alert('Failed to delete property.');
          }
      }
  };

  const handleShortStayEdit = (property) => {
      setEditingShortStay(property);
  };
  
  const closeShortStayForm = () => {
      setEditingShortStay(null);
      // Refresh to get updates
      shortStayAPI.getMyListings().then(res => setShortStayProperties(res.properties || []));
  };

  // Separate properties by user type
  const individualProperties = properties.filter(p => !p.user_type || p.user_type === 'individual');
  const developerProperties = properties.filter(p => p.user_type === 'developer');

  const renderPropertyCard = (property, index) => {
    const timeRemaining = getTimeRemaining(property.created_at);
    const editable = isEditable(property.created_at);
    const subscriptionTime = getSubscriptionTimeRemaining(property);

    return (
      <motion.div
        key={property.id}
        className={`property-item ${!editable ? 'expired' : ''} ${subscriptionTime.expired ? 'subscription-expired' : ''} ${view}-view-item`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        {/* Property Image */}
        <div className="property-image">
          <img
            src={property.image_url || '/placeholder-property.jpg'}
            alt={property.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-property.jpg';
            }}
          />
          <div className={`status-badge ${property.status || 'active'}`}>
            {property.status === 'expired' ? 'Expired' : property.status || 'Active'}
          </div>
          {subscriptionTime.expired && (
            <div className="expired-overlay">
              <span>Subscription Expired</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="property-details">
          <h3 className="property-title">{property.title}</h3>

          <div className="property-meta">
            <span className="meta-item">
              <FiMapPin /> {property.location}
            </span>
            {property.bhk && (
              <span className="meta-item">
                <FiHome /> {property.bhk}
              </span>
            )}
            <span className="meta-item type-badge">
              {property.type}
            </span>
          </div>

          <div className="property-price">{property.price}</div>

          <div className="property-info-row">
            <span className="posted-date">
              Posted: {formatDate(property.created_at)}
            </span>
          </div>

          {/* Subscription Timeline */}
          <div className={`subscription-timer ${subscriptionTime.expired ? 'expired' : subscriptionTime.urgent ? 'urgent' : 'active'}`}>
            <FiCalendar className="timer-icon" />
            <span className="timer-label">Listing Active:</span>
            <span className="timer-text">{subscriptionTime.text}</span>
          </div>

          {/* Edit Timer */}
          <div className={`edit-timer ${timeRemaining.expired ? 'expired' : timeRemaining.urgent ? 'urgent' : 'active'}`}>
            <FiClock className="timer-icon" />
            <span className="timer-label">Edit Window:</span>
            <span className="timer-text">{timeRemaining.text}</span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn view-btn"
              onClick={() => handleView(property)}
              title="View Property"
            >
              <FiEye /> View
            </button>

            {editable ? (
              <button
                className="action-btn edit-btn"
                onClick={() => handleEdit(property)}
                title="Edit Property"
              >
                <FiEdit2 /> Edit
              </button>
            ) : (
              <button
                className="action-btn edit-btn disabled"
                disabled
                title="Edit period expired"
              >
                <FiEdit2 /> Locked
              </button>
            )}

            <button
              className="action-btn delete-btn"
              onClick={() => handleDelete(property)}
              title="Delete Property"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  
  const renderShortStayCard = (property, index) => {
      return (
        <motion.div
            key={property.id}
            className={`property-item short-stay-item ${view}-view-item`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
             <div className="property-image">
                <img
                    src={property.cover_image || (property.images && property.images[0]) || '/placeholder-property.jpg'}
                    alt={property.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-property.jpg'; }}
                />
                <div className={`status-badge active`}>Active</div>
            </div>
            
            <div className="property-details">
                <h3 className="property-title">{property.title}</h3>
                
                <div className="property-meta">
                    <span className="meta-item">
                        <FiMapPin /> {property.location?.city || 'Location N/A'}
                    </span>
                    <span className="meta-item type-badge">
                        {property.category}
                    </span>
                </div>
                
                <div className="property-price">₹{parseInt(property.pricing?.perNight || 0).toLocaleString()} <span style={{fontSize: '0.8em', color: '#666', fontWeight: 'normal'}}>/ night</span></div>
                
                 <div className="property-info-row">
                    <span className="posted-date">
                        Posted: {formatDate(property.created_at)}
                    </span>
                </div>
                
                {/* Spacer to push buttons down if needed */}
                <div style={{flex: 1}}></div>

                <div className="action-buttons">
                    <button
                        className="action-btn view-btn"
                        onClick={() => navigate(`/short-stay/${property.id}`)}
                        title="View Property"
                    >
                        <FiEye /> View
                    </button>
                    <button
                        className="action-btn edit-btn"
                        onClick={() => handleShortStayEdit(property)}
                        title="Edit Property"
                    >
                        <FiEdit2 /> Edit
                    </button>
                     <button
                        className="action-btn delete-btn"
                        onClick={() => handleShortStayDelete(property)}
                        title="Delete Property"
                    >
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>
        </motion.div>
      );
  };

  return (
    <div className="my-properties-page">
      <div className="my-properties-container">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <h1>My Properties</h1>
            <p>Manage all your property listings in one place</p>
          </div>
          {!loading && properties.length > 0 && (
            <ViewToggle view={view} onViewChange={setView} />
          )}
        </motion.div>

        {/* Filter Cards Section */}
        {!loading && (
          <div className="filter-cards-container">
            <motion.div 
              className={`filter-card ${activeTab === 'individual' ? 'active' : ''}`}
              onClick={() => setActiveTab('individual')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon-wrapper individual">
                <FiHome />
              </div>
              <div className="card-content">
                <span className="card-label">By Individual</span>
                <span className="card-count">{individualProperties.length}</span>
              </div>
              {activeTab === 'individual' && <motion.div className="active-indicator" layoutId="activeIndicator" />}
            </motion.div>

            <motion.div 
              className={`filter-card ${activeTab === 'developer' ? 'active' : ''}`}
              onClick={() => setActiveTab('developer')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon-wrapper developer">
                <FiMapPin />
              </div>
              <div className="card-content">
                <span className="card-label">By Developer</span>
                <span className="card-count">{developerProperties.length}</span>
              </div>
              {activeTab === 'developer' && <motion.div className="active-indicator" layoutId="activeIndicator" />}
            </motion.div>

            <motion.div 
              className={`filter-card ${activeTab === 'short-stay' ? 'active' : ''}`}
              onClick={() => setActiveTab('short-stay')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon-wrapper short-stay">
                <FiCalendar />
              </div>
              <div className="card-content">
                <span className="card-label">Short Stay</span>
                <span className="card-count">{shortStayProperties.length}</span>
              </div>
              {activeTab === 'short-stay' && <motion.div className="active-indicator" layoutId="activeIndicator" />}
            </motion.div>
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
            <p>Loading your properties...</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && shortStayProperties.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">🏠</div>
            <h3>No Properties Yet</h3>
            <p>You haven't posted any properties. Start by adding your first property!</p>
            <button
              className="add-property-btn"
              onClick={() => navigate('/post-property')}
            >
              + Add Your First Property
            </button>
          </motion.div>
        )}

        {/* Tabs and Properties List */}
        {!loading && (properties.length > 0 || shortStayProperties.length > 0) && (
          <div className="properties-content">
            {/* Content Area */}
            <div className="tab-content">
              {activeTab === 'individual' && (
                <div className="property-section">
                  {individualProperties.length > 0 ? (
                    <div className={`properties-list ${view === 'list' ? 'list-view' : 'grid-view'}`}>
                      {individualProperties.map(renderPropertyCard)}
                    </div>
                  ) : (
                    <div className="section-empty-state">
                      <p>No properties uploaded as Individual</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'developer' && (
                <div className="property-section">
                  {developerProperties.length > 0 ? (
                    <div className={`properties-list ${view === 'list' ? 'list-view' : 'grid-view'}`}>
                      {developerProperties.map(renderPropertyCard)}
                    </div>
                  ) : (
                    <div className="section-empty-state">
                      <p>No properties uploaded as Developer / Builder</p>
                    </div>
                  )}
                </div>
              )}
              
               {activeTab === 'short-stay' && (
                <div className="property-section">
                  {shortStayProperties.length > 0 ? (
                    <div className={`properties-list ${view === 'list' ? 'list-view' : 'grid-view'}`}>
                      {shortStayProperties.map(renderShortStayCard)}
                    </div>
                  ) : (
                    <div className="section-empty-state">
                      <p>No Short Stay properties listed.</p>
                      <button className="add-small-btn" onClick={() => navigate('/short-stay/list-property')}>+ List Property</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        {/* Edit Modal for Short Stay */}
        <AnimatePresence>
            {editingShortStay && (
                <ShortStayForm 
                    category={editingShortStay.category} 
                    initialData={editingShortStay} 
                    onClose={closeShortStayForm} 
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default MyProperties;
