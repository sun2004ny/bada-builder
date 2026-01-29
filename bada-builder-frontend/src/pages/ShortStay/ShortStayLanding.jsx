import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from '../../components/BackgroundVideo/BackgroundVideo';
import shortStayVideo from '../../assets/videos/shortstay_hero.mp4';
import './ShortStayLanding.css';
import { shortStayAPI } from '../../services/shortStayApi';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaRegHeart, FaBuilding, FaHome, FaBed, FaHotel, FaTree, FaCampground, FaLeaf, FaUserGraduate, FaSearch } from 'react-icons/fa';
import { CalendarPopup, GuestPopup } from './SearchPopups';

const ShortStayLanding = () => {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth(); // Alias currentUser to user for existing code compatibility
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const [activePopup, setActivePopup] = useState(null); // 'calendar' | 'guests' | 'where'

  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: { adults: 1, children: 0, infants: 0 },
    type: ''
  });

  const categories = [
    { id: 'apartment', name: 'Flats / Apartments', icon: <FaBuilding />, desc: 'Cozy city stays' },
    { id: 'house', name: 'Villa / Bunglow', icon: <FaHome />, desc: 'Spacious private homes' },
    { id: 'dormitory', name: 'Dormitory', icon: <FaBed />, desc: 'Budget friendly beds' },
    { id: 'hotel', name: 'Hotels', icon: <FaHotel />, desc: 'Luxury & Service' },
    { id: 'cottage', name: 'Cottages', icon: <FaHome />, desc: 'Rustic charm' },
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
      setListings(data.properties || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await shortStayAPI.getUserFavorites();
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
    setActivePopup(null);
    try {
      const filters = {};
      if (searchParams.location) filters.location = searchParams.location;

      const totalNumGuests = searchParams.guests.adults + searchParams.guests.children;
      if (totalNumGuests > 1) filters.guests = totalNumGuests;
      if (searchParams.type) filters.type = searchParams.type;

      const data = await shortStayAPI.getAll(filters);
      setListings(data.properties || []);

      const element = document.getElementById('listings-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = () => {
    if (!searchParams.checkIn) return "Add dates";
    const options = { month: 'short', day: 'numeric' };
    const start = new Date(searchParams.checkIn).toLocaleDateString('en-US', options);
    if (!searchParams.checkOut) return `${start} - Add checkout`;
    const end = new Date(searchParams.checkOut).toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  const getGuestLabel = () => {
    const { adults, children, infants } = searchParams.guests;
    const total = adults + children;
    if (total === 1 && infants === 0) return "Add guests";
    let label = `${total} Guest${total !== 1 ? 's' : ''}`;
    if (infants > 0) label += `, ${infants} Infant${infants !== 1 ? 's' : ''}`;
    return label;
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

              {/* Modern Airbnb Search Pill (v2) */}
              <motion.div
                className="airbnb-search-pill-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className={`airbnb-search-pill ${activePopup ? 'search-pill-active' : ''}`}>
                  <div
                    className={`search-pill-item where-item ${activePopup === 'where' ? 'item-active' : ''}`}
                    onClick={() => setActivePopup('where')}
                  >
                    <label>Where</label>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={searchParams.location}
                      onFocus={() => setActivePopup('where')}
                      onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    />
                  </div>

                  <div className="pill-divider" />

                  <div
                    className={`search-pill-item when-item ${activePopup === 'calendar' ? 'item-active' : ''}`}
                    onClick={() => setActivePopup('calendar')}
                  >
                    <label>When</label>
                    <div className={`pill-display-value ${!searchParams.checkIn ? 'value-placeholder' : ''}`}>
                      {getDateLabel()}
                    </div>
                  </div>

                  <div className="pill-divider" />

                  <div
                    className={`search-pill-item who-item ${activePopup === 'guests' ? 'item-active' : ''}`}
                    onClick={() => setActivePopup('guests')}
                  >
                    <label>Who</label>
                    <div className={`pill-display-value ${searchParams.guests.adults + searchParams.guests.children === 1 && searchParams.guests.infants === 0 ? 'value-placeholder' : ''}`}>
                      {getGuestLabel()}
                    </div>
                  </div>

                  <div className="search-pill-btn-container">
                    <button className="airbnb-search-button" onClick={handleSearch}>
                      <FaSearch className="search-icon" />
                      <span>Search</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {activePopup === 'calendar' && (
                      <CalendarPopup
                        checkIn={searchParams.checkIn}
                        checkOut={searchParams.checkOut}
                        onChange={(dates) => setSearchParams(prev => ({ ...prev, ...dates }))}
                        onClose={() => setActivePopup(null)}
                      />
                    )}
                    {activePopup === 'guests' && (
                      <GuestPopup
                        guests={searchParams.guests}
                        onChange={(guests) => setSearchParams(prev => ({ ...prev, guests }))}
                        onClose={() => setActivePopup(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="short-stay-quick-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >


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
        {/* Categories Section Removed - Replaced by Search Dropdown */}

        {/* Listings Section */}
        <section id="listings-section" className="short-stay-featured-section">
          <div className="short-stay-section-header-flex">
            <div>
              <h2>{listings.length > 0 ? `Properties (${listings.length})` : 'Featured Stays'}</h2>
              <p>Top-rated properties across the country</p>
            </div>

            <div className="short-stay-filter-dropdown">
              <select
                value={searchParams.type}
                onChange={async (e) => {
                  const newType = e.target.value;
                  setSearchParams(prev => ({ ...prev, type: newType }));

                  // Trigger immediate filter
                  setLoading(true);
                  try {
                    const filters = {};
                    if (searchParams.location) filters.location = searchParams.location;
                    const totalNumGuests = (searchParams.guests?.adults || 0) + (searchParams.guests?.children || 0);
                    if (totalNumGuests > 1) filters.guests = totalNumGuests;
                    if (newType) filters.type = newType;

                    const data = await shortStayAPI.getAll(filters);
                    setListings(data.properties || []);
                  } catch (error) {
                    console.error('Filter failed:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #DDDDDD',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#222222',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '200px'
                }}
              >
                <option value="">All Property Types</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
              <button className="reset-search-btn" onClick={() => { setSearchParams({ location: '', checkIn: '', checkOut: '', guests: { adults: 1, children: 0, infants: 0 }, type: '' }); fetchListings(); }}>Reset Search</button>
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
