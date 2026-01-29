import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from '../../components/BackgroundVideo/BackgroundVideo';
import shortStayVideo from '../../assets/videos/shortstay_hero.mp4';
import './ShortStayLanding.css';
import { shortStayAPI } from '../../services/shortStayApi';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaRegHeart, FaBuilding, FaHome, FaBed, FaHotel, FaTree, FaCampground, FaLeaf, FaUserGraduate } from 'react-icons/fa';

const ShortStayLanding = () => {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth(); // Alias currentUser to user for existing code compatibility
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const categories = [
    { id: 'apartment', name: 'Flats / Apartments', icon: <FaBuilding />, desc: 'Cozy city stays' },
    { id: 'house', name: 'Villa / Bunglow', icon: <FaHome />, desc: 'Spacious private homes' },
    { id: 'dormitory', name: 'Dormitory', icon: <FaBed />, desc: 'Budget friendly beds' },
    { id: 'hotel', name: 'Hotels', icon: <FaHotel />, desc: 'Luxury & Service' },
    { id: 'cottage', name: 'Cottages', icon: <FaHome />, desc: 'Rustic charm' }, // Reusing Home for now or find distinct
    { id: 'tree_house', name: 'Tree House', icon: <FaTree />, desc: 'Nature elevated' },
    { id: 'tent', name: 'Tents', icon: <FaCampground />, desc: 'Glamping experience' },
    { id: 'farmhouse', name: 'Farmhouse', icon: <FaLeaf />, desc: 'Peaceful getaways' },
    { id: 'hostel', name: 'Hostel', icon: <FaUserGraduate />, desc: 'Student living' }
  ];

  useEffect(() => {
    fetchListings();
    if (user) {
        fetchFavorites();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await shortStayAPI.getAll();
      // Ensure we have an array even if API returns { properties: [], count: 0 }
      setListings(data.properties || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Fallback empty state is better than crash
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
      try {
          const data = await shortStayAPI.getUserFavorites();
          // Assuming API returns array of favorite properties, we just need IDs for checking
          const favIds = new Set(data.favorites.map(fav => fav.id));
          setFavorites(favIds);
      } catch (error) {
          console.error('Error fetching favorites:', error);
      }
  };

  const handleToggleFavorite = async (e, propertyId) => {
      e.stopPropagation();
      if (!user) {
          alert('Please login to save favorites');
          return;
      }
      try {
          const result = await shortStayAPI.toggleFavorite(propertyId);
          setFavorites(prev => {
              const newFavs = new Set(prev);
              if (result.isFavorite) {
                  newFavs.add(propertyId);
              } else {
                  newFavs.delete(propertyId);
              }
              return newFavs;
          });
      } catch (error) {
          console.error('Error toggling favorite:', error);
      }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
        // Construct filters
        const filters = {};
        if (searchParams.location) filters.location = searchParams.location;
        if (searchParams.guests > 1) filters.guests = searchParams.guests;
        
        // Pass date filters if implemented on backend
        // if (searchParams.checkIn) filters.checkIn = searchParams.checkIn;
        
        const data = await shortStayAPI.getAll(filters);
        setListings(data.properties || []);
        
        // Scroll to results
        const element = document.getElementById('listings-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    // Determine if we should navigate to search page or just filter locally/API
    // For now, let's filter the current view for better UX
    setLoading(true);
    try {
        const data = await shortStayAPI.getAll({ type: categoryId });
        setListings(data.properties || []);
        const element = document.getElementById('listings-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Filter failed:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleListProperty = () => {
      if (!user) {
          // Redirect to login with return url
          navigate('/login', { state: { from: '/short-stay/list-property' } });
      } else {
          navigate('/short-stay/list-property');
      }
  };

  return (
    <div className="short-stay-page">
      {/* Hero Section */}
      <motion.section
        className="short-stay-hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <BackgroundVideo
          src={shortStayVideo}
          fallbackColor="#0F172A"
          overlay={false}
        >
          <div className="short-stay-hero-overlay" />
          <div className="short-stay-hero-container">
            <div className="short-stay-hero-content">
              <div className="short-stay-hero-text-box">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Find Your Perfect Short Stay
                </motion.h1>
                <motion.p
                  className="short-stay-hero-subtitle"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Discover comfortable stays for your next trip
                </motion.p>
              </div>

              {/* Modern Search Card */}
              <motion.div
                className="short-stay-search-card"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="short-stay-search-row">
                  <div className="short-stay-search-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    />
                  </div>
                  <div className="short-stay-divider" />
                  <div className="short-stay-search-field">
                    <label>Check-in</label>
                    <input
                      type="date"
                      value={searchParams.checkIn}
                      onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="short-stay-divider" />
                  <div className="short-stay-search-field">
                    <label>Check-out</label>
                    <input
                      type="date"
                      value={searchParams.checkOut}
                      onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                      min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="short-stay-divider" />
                  <div className="short-stay-search-field">
                    <label>Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                    />
                  </div>
                  <motion.button
                    className="short-stay-search-submit"
                    onClick={handleSearch}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="short-stay-search-icon">🔍</span>
                    Search
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="short-stay-quick-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {user && (
                    <motion.button
                    className="short-stay-btn short-stay-btn-outline"
                    onClick={() => navigate('/short-stay/my-listings')}
                    whileHover={{ y: -4, scale: 1.05, background: 'rgba(255, 255, 255, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    >
                    My Listings
                    </motion.button>
                )}
                
                <motion.button
                  className="short-stay-btn short-stay-btn-primary"
                  onClick={handleListProperty}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  List Your Property
                </motion.button>
              </motion.div>
            </div>
          </div>
        </BackgroundVideo>
      </motion.section>

      <div className="short-stay-content-wrapper">
        {/* Categories Section */}
        <section className="short-stay-categories-section">
          <div className="short-stay-section-header">
            <h2>Browse by Property Type</h2>
            <p>Find the exact style of stay you're looking for</p>
          </div>
          <div className="short-stay-categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="short-stay-category-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="short-stay-category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Listings Section */}
        <section id="listings-section" className="short-stay-featured-section">
          <div className="short-stay-section-header-flex">
            <div>
              <h2>{listings.length > 0 ? `Properties (${listings.length})` : 'Featured Stays'}</h2>
              <p>Top-rated properties across the country</p>
            </div>
          </div>

          {loading ? (
            <div className="short-stay-loading-state">
              <div className="short-stay-spinner"></div>
              <p>Finding the best properties for you...</p>
            </div>
          ) : listings.length === 0 ? (
             <div className="no-listings-found">
                 <h3>No properties found matching your criteria.</h3>
                 <p>Try adjusting your filters or browse other categories.</p>
                 <button className="reset-search-btn" onClick={() => { setSearchParams({ location: '', checkIn: '', checkOut: '', guests: 1 }); fetchListings(); }}>Reset Search</button>
             </div>
          ) : (
            <div className="short-stay-listings-grid">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  className="short-stay-property-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => navigate(`/short-stay/${listing.id}`)}
                  whileHover={{ y: -8 }}
                >
                    <div className="short-stay-property-image">
                        <img 
                            src={listing.cover_image || (listing.images && listing.images[0]) || '/placeholder-property.jpg'} 
                            alt={listing.title} 
                        />
                        <div className="short-stay-property-badge">
                            {categories.find(c => c.id === listing.category)?.name || listing.category}
                        </div>
                        <button 
                            className={`favorite-btn ${favorites.has(listing.id) ? 'active' : ''}`}
                            onClick={(e) => handleToggleFavorite(e, listing.id)}
                        >
                            {favorites.has(listing.id) ? '❤️' : '🤍'}
                        </button>
                    </div>
                  
                  <div className="short-stay-property-info">
                    <div className="short-stay-property-header">
                      <h3>{listing.title}</h3>
                      <div className="short-stay-property-rating">
                        ⭐ <span>{listing.rating || 'New'}</span>
                      </div>
                    </div>
                    
                    <p className="short-stay-property-location">
                        📍 {listing.location?.city || listing.location?.address || 'Location unavailable'}
                    </p>
                    
                    <div className="short-stay-property-specs">
                        {/* Dynamic specs based on category could go here */}
                        <span>
                            {listing.specific_details?.bhk ? `${listing.specific_details.bhk} BHK` : 
                             listing.specific_details?.bedrooms ? `${listing.specific_details.bedrooms} Beds` :
                             listing.category === 'hotel' ? 'Luxury Room' : 'Comfortable Stay'}
                        </span>
                        <span className="short-stay-dot">·</span>
                        <span>{listing.guests || 2} Guests</span>
                    </div>
                    
                    <div className="short-stay-property-footer">
                      <div className="short-stay-property-price">
                        <span className="short-stay-price-amount">₹{listing.pricing?.perNight?.toLocaleString() || 'N/A'}</span>
                        <span className="short-stay-price-unit">/ night</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShortStayLanding;
