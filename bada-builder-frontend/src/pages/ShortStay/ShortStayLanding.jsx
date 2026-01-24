import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// TODO: Implement short stay listings API endpoint
// import { shortStayAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackgroundVideo from '../../components/BackgroundVideo/BackgroundVideo';
import './ShortStayLanding.css';
import shortStayVideo from '../../assets/sort stay video.mp4';

const ShortStayLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const categories = [
    { id: 'apartment', name: 'Apartments', icon: '🏢', count: 0 },
    { id: 'villa', name: 'Villas', icon: '🏡', count: 0 },
    { id: 'house', name: 'Independent Houses', icon: '🏠', count: 0 },
    { id: 'duplex', name: 'Duplex / Triplex', icon: '🏘️', count: 0 },
    { id: 'service_apartment', name: 'Service Apartments', icon: '🏨', count: 0 }
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // TODO: Implement with shortStayAPI.getAll({ status: 'approved' })
      // For now, using empty array - will fall back to sample data
      const listingsData = [];

      // If no data in Firestore, use fallback sample data
      if (listingsData.length === 0) {
        setListings(fallbackListings);
      } else {
        setListings(listingsData);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Use fallback data on error
      setListings(fallbackListings);
    } finally {
      setLoading(false);
    }
  };

  // Fallback sample data
  const fallbackListings = [
    { id: 1, title: "Modern 2BHK in Alkapuri", propertyType: "apartment", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 2500 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 24, status: "approved" },
    { id: 2, title: "Luxury 3BHK Near Sayajigunj", propertyType: "apartment", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 3500 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 31, status: "approved" },
    { id: 3, title: "Cozy Villa in Fatehgunj", propertyType: "villa", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 9500 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 42, status: "approved" },
    { id: 4, title: "Modern Duplex in Manjalpur", propertyType: "duplex", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 6800 }, capacity: { bedrooms: 4, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 30, status: "approved" },
    { id: 5, title: "Executive Service Apartment in Alkapuri", propertyType: "service_apartment", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 3500 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 28, status: "approved" },
    { id: 6, title: "Elegant House in Gotri", propertyType: "house", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 4900 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 21, status: "approved" },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
    if (searchParams.guests) params.append('guests', searchParams.guests);

    navigate(`/short-stay/search?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/short-stay/search?type=${categoryId}`);
  };

  return (
    <div className="short-stay-page">
      {/* Hero Section */}
      <motion.section
        className="ss-hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <BackgroundVideo
          src={shortStayVideo}
          fallbackColor="#0F172A"
          overlay={false}
        >
          {/* Custom scoped overlay to prevent leakage */}
          <div className="ss-hero-overlay" />

          <div className="ss-hero-container">
            <div className="ss-hero-content">
              <div className="ss-hero-text-box">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Find Your Perfect Short Stay
                </motion.h1>
                <motion.p
                  className="ss-hero-subtitle"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Discover comfortable stays for your next trip
                </motion.p>
              </div>

              {/* Modern Airbnb-Style Search Card */}
              <motion.div
                className="ss-search-card"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="ss-search-row">
                  <div className="ss-search-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    />
                  </div>
                  <div className="ss-divider" />
                  <div className="ss-search-field">
                    <label>Check-in</label>
                    <input
                      type="date"
                      value={searchParams.checkIn}
                      onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="ss-divider" />
                  <div className="ss-search-field">
                    <label>Check-out</label>
                    <input
                      type="date"
                      value={searchParams.checkOut}
                      onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                      min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="ss-divider" />
                  <div className="ss-search-field">
                    <label>Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                    />
                  </div>
                  <motion.button
                    className="ss-search-submit"
                    onClick={handleSearch}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="ss-search-icon">🔍</span>
                    Search
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="ss-quick-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.button
                  className="ss-btn ss-btn-primary"
                  onClick={() => navigate('/short-stay/search')}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Stays
                </motion.button>
                <motion.button
                  className="ss-btn ss-btn-outline"
                  onClick={() => user ? navigate('/short-stay/list-property') : navigate('/login')}
                  whileHover={{ y: -4, scale: 1.05, background: 'rgba(255, 255, 255, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  List Your Property
                </motion.button>
              </motion.div>
            </div>
          </div>
        </BackgroundVideo>
      </motion.section>

      <div className="ss-content-wrapper">
        {/* Categories Section */}
        <section className="ss-categories-section">
          <div className="ss-section-header">
            <h2>Browse by Property Type</h2>
            <p>Find the exact style of stay you're looking for</p>
          </div>
          <div className="ss-categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="ss-category-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="ss-category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{listings.filter(l => l.propertyType === category.id).length} properties</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Listings */}
        <section className="ss-featured-section">
          <div className="ss-section-header-flex">
            <div>
              <h2>Featured Stays</h2>
              <p>Top-rated properties across the country</p>
            </div>
            <button
              className="ss-view-all-link"
              onClick={() => navigate('/short-stay/search')}
            >
              View all stays →
            </button>
          </div>

          {loading ? (
            <div className="ss-loading-state">
              <div className="ss-spinner"></div>
              <p>Finding the best properties for you...</p>
            </div>
          ) : (
            <div className="ss-listings-grid">
              {listings.slice(0, 6).map((listing, index) => (
                <motion.div
                  key={listing.id}
                  className="ss-property-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => navigate(`/short-stay/${listing.id}`)}
                  whileHover={{ y: -8 }}
                >
                  <div className="ss-property-image">
                    <img src={listing.images[0] || '/placeholder-property.jpg'} alt={listing.title} />
                    <div className="ss-property-badge">{listing.propertyType.replace('_', ' ')}</div>
                  </div>
                  <div className="ss-property-info">
                    <div className="ss-property-header">
                      <h3>{listing.title}</h3>
                      {listing.rating && (
                        <div className="ss-property-rating">
                          ⭐ <span>{listing.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="ss-property-location">📍 {listing.location.city}, {listing.location.area}</p>
                    <div className="ss-property-specs">
                      <span>{listing.capacity.bedrooms} Bedrooms</span>
                      <span className="ss-dot">·</span>
                      <span>{listing.capacity.maxGuests} Guests</span>
                    </div>
                    <div className="ss-property-footer">
                      <div className="ss-property-price">
                        <span className="ss-price-amount">₹{listing.pricing.nightlyRate.toLocaleString()}</span>
                        <span className="ss-price-unit">/ night</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Features / Why Choose Us */}
        <section className="ss-features-section">
          <div className="ss-section-header">
            <h2>Why Book With Us?</h2>
            <p>Experience excellence and security in every stay</p>
          </div>
          <div className="ss-features-grid">
            <motion.div
              className="ss-feature-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="ss-feature-icon">🛡️</div>
              <h3>Secure Booking</h3>
              <p>Your safety and security are our top priorities with verified payments.</p>
            </motion.div>
            <motion.div
              className="ss-feature-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="ss-feature-icon">✨</div>
              <h3>Handpicked Homes</h3>
              <p>We personally verify properties to ensure they meet our quality standards.</p>
            </motion.div>
            <motion.div
              className="ss-feature-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="ss-feature-icon">💎</div>
              <h3>Premium Support</h3>
              <p>Our dedicated team is here to help you 24/7 during your stay.</p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShortStayLanding;
