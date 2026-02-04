import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from '../../components/BackgroundVideo/BackgroundVideo';
import shortStayVideo from '../../assets/videos/shortstay_hero.mp4';
import './ShortStayLanding.css';
import { shortStayAPI } from '../../services/shortStayApi';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaRegHeart, FaBuilding, FaHome, FaBed, FaHotel, FaTree, FaCampground, FaLeaf, FaUserGraduate, FaSearch, FaArrowRight, FaTimes } from 'react-icons/fa';



import { CalendarPopup, GuestPopup } from './SearchPopups';
import ShortStayCard from '../../components/PropertyCard/ShortStayCard';

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
    guests: { adults: 0, children: 0, infants: 0, pets: 0 },
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
    const { adults, children, infants, pets } = searchParams.guests;
    const total = adults + children;
    if (total === 0) return "Add guests";
    let label = `${total} Guest${total !== 1 ? 's' : ''}`;
    if (infants > 0) label += `, ${infants} Infant${infants !== 1 ? 's' : ''}`;
    if (pets > 0) label += `, ${pets} Pet${pets !== 1 ? 's' : ''}`;
    return label;
  };

  const handleClearDates = (e) => {
    e.stopPropagation();
    setSearchParams(prev => ({ ...prev, checkIn: '', checkOut: '' }));
  };





  const handleClearGuests = (e) => {
    e.stopPropagation();
    setSearchParams(prev => ({
      ...prev,
      guests: { adults: 0, children: 0, infants: 0, pets: 0 }
    }));
  };

  const hasGuests = searchParams.guests.adults > 0 || searchParams.guests.children > 0 || searchParams.guests.infants > 0 || searchParams.guests.pets > 0;

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div className="short-stay-page">
      {/* Hero Section */}
      <Motion.section
        className={`short-stay-hero-section ${mobileSearchOpen ? 'mobile-search-active' : ''}`}
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

             
            {!mobileSearchOpen && (
                <div className="short-stay-hero-content">
                <div className="short-stay-hero-text-box">
                    <Motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    >
                    Find Your Perfect Short Stay
                    </Motion.h1>
                    <Motion.p
                    className="short-stay-hero-subtitle"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    >
                    Discover comfortable stays for your next trip
                    </Motion.p>
                    
                    <Motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        onClick={() => navigate('/hosting')}
                        className="switch-to-hosting-btn-hero-centered"
                    >
                        Switch to Hosting
                    </Motion.button>
                </div>
                </div>
            )}

              {/* Mobile Compact Search Trigger */}
              {!mobileSearchOpen && (
                  <Motion.div 
                    className="mobile-search-trigger"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => setMobileSearchOpen(true)}
                  >
                      <FaSearch className="mobile-search-icon" />
                      <div className="mobile-search-text">
                          <span className="mobile-search-title">Where to?</span>
                          <span className="mobile-search-subtitle">Anywhere • Any week • Add guests</span>
                      </div>
                  </Motion.div>
              )}

              {/* Modern Airbnb Search Pill (v2) - Expanded */}
              <Motion.div
                className={`airbnb-search-pill-container ${mobileSearchOpen ? 'mobile-expanded' : ''}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className={`airbnb-search-pill ${activePopup ? 'search-pill-active' : ''}`}>
                  {/* Mobile Close Button */}
                  {mobileSearchOpen && (
                      <button className="mobile-search-close-btn" onClick={(e) => {
                          e.stopPropagation();
                          setMobileSearchOpen(false);
                      }}>
                          <FaTimes />
                      </button>
                  )}
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
                    <div className="pill-value-container">
                      <div className={`pill-display-value ${!searchParams.checkIn ? 'value-placeholder' : ''}`}>
                        {getDateLabel()}
                      </div>
                      {searchParams.checkIn && (
                        <button className="clear-date-btn" onClick={handleClearDates}>
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pill-divider" />

                  <div
                    className={`search-pill-item who-item ${activePopup === 'guests' ? 'item-active' : ''}`}
                    onClick={() => setActivePopup('guests')}
                  >
                    <label>Who</label>
                    <div className="pill-value-container">
                        <div className={`pill-display-value ${!hasGuests ? 'value-placeholder' : ''}`}>
                          {getGuestLabel()}
                        </div>
                        {hasGuests && (
                            <button className="clear-date-btn" onClick={handleClearGuests}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                  </div>

                  <div className="search-pill-btn-container">
                    <button className="airbnb-search-button" onClick={handleSearch}>
                      <span>Search</span>
                      <FaSearch className="search-icon" />
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
              </Motion.div>
            </div>
        </BackgroundVideo>
      </Motion.section>

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
              <button className="reset-search-btn" onClick={() => { setSearchParams({ location: '', checkIn: '', checkOut: '', guests: { adults: 1, children: 0, infants: 0, pets: 0 }, type: '' }); fetchListings(); }}>Reset Search</button>
            </div>
          ) : (
            <div className="short-stay-groups-container">
              {Object.entries(listings.reduce((acc, listing) => {
                  const city = listing.location?.city || 'Other Locations';
                  if (!acc[city]) acc[city] = [];
                  acc[city].push(listing);
                  return acc;
              }, {})).map(([city, cityListings]) => (
                <div key={city} className="location-group-section">
                  <div className="location-group-header">
                     <h3>{city === 'Other Locations' ? 'Explore more stays' : `Stay in ${city}`}</h3>
                     <button className="see-all-btn" onClick={() => navigate(`/short-stay/search?location=${city}`)}>
                        <FaArrowRight size={12} />
                     </button>
                  </div>
                  
                  <div className="horizontal-scroll-container">
                    {cityListings.map((listing, index) => (
                      <ShortStayCard 
                        key={listing.id} 
                        listing={listing} 
                        index={index} 
                        favorites={favorites} 
                        onToggleFavorite={handleToggleFavorite} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShortStayLanding;
