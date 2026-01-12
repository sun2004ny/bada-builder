import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import './ShortStayLanding.css';

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
      const q = query(
        collection(db, 'short_stay_listings'),
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      const listingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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

  // Fallback sample data - 50+ properties across all categories
  const fallbackListings = [
    // Apartments (12 properties)
    { id: 1, title: "Modern 2BHK in Alkapuri", propertyType: "apartment", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 2500 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 24, status: "approved" },
    { id: 2, title: "Luxury 3BHK Near Sayajigunj", propertyType: "apartment", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 3500 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 31, status: "approved" },
    { id: 3, title: "Cozy Studio in Fatehgunj", propertyType: "apartment", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 1800 }, capacity: { bedrooms: 1, beds: 1, maxGuests: 2 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 18, status: "approved" },
    { id: 4, title: "Spacious 3BHK in Manjalpur", propertyType: "apartment", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 3200 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 22, status: "approved" },
    { id: 5, title: "Premium 2BHK in Akota", propertyType: "apartment", location: { city: "Vadodara", area: "Akota" }, pricing: { nightlyRate: 2800 }, capacity: { bedrooms: 2, beds: 3, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 27, status: "approved" },
    { id: 6, title: "Elegant 4BHK in Vasna", propertyType: "apartment", location: { city: "Vadodara", area: "Vasna" }, pricing: { nightlyRate: 4500 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 35, status: "approved" },
    { id: 7, title: "Compact 1BHK in Gotri", propertyType: "apartment", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 1500 }, capacity: { bedrooms: 1, beds: 1, maxGuests: 2 }, images: ["/placeholder-property.jpg"], rating: 4.5, reviewCount: 15, status: "approved" },
    { id: 8, title: "Deluxe 3BHK in Waghodia Road", propertyType: "apartment", location: { city: "Vadodara", area: "Waghodia Road" }, pricing: { nightlyRate: 3800 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 29, status: "approved" },
    { id: 9, title: "Stylish 2BHK in Karelibaug", propertyType: "apartment", location: { city: "Vadodara", area: "Karelibaug" }, pricing: { nightlyRate: 2600 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 20, status: "approved" },
    { id: 10, title: "Penthouse 4BHK in Race Course", propertyType: "apartment", location: { city: "Vadodara", area: "Race Course" }, pricing: { nightlyRate: 5500 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 5.0, reviewCount: 42, status: "approved" },
    { id: 11, title: "Budget 1BHK in Tandalja", propertyType: "apartment", location: { city: "Vadodara", area: "Tandalja" }, pricing: { nightlyRate: 1200 }, capacity: { bedrooms: 1, beds: 1, maxGuests: 2 }, images: ["/placeholder-property.jpg"], rating: 4.4, reviewCount: 12, status: "approved" },
    { id: 12, title: "Executive 3BHK in Sama", propertyType: "apartment", location: { city: "Vadodara", area: "Sama" }, pricing: { nightlyRate: 3400 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 26, status: "approved" },

    // Villas (12 properties)
    { id: 13, title: "Luxury Villa with Pool in Alkapuri", propertyType: "villa", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 8500 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 38, status: "approved" },
    { id: 14, title: "Garden Villa in Manjalpur", propertyType: "villa", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 7200 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 32, status: "approved" },
    { id: 15, title: "Modern Villa in Vasna", propertyType: "villa", location: { city: "Vadodara", area: "Vasna" }, pricing: { nightlyRate: 9000 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 5.0, reviewCount: 45, status: "approved" },
    { id: 16, title: "Cozy Villa in Waghodia", propertyType: "villa", location: { city: "Vadodara", area: "Waghodia" }, pricing: { nightlyRate: 6500 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 28, status: "approved" },
    { id: 17, title: "Premium Villa with Lawn in Akota", propertyType: "villa", location: { city: "Vadodara", area: "Akota" }, pricing: { nightlyRate: 8000 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 36, status: "approved" },
    { id: 18, title: "Spacious Villa in Gotri", propertyType: "villa", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 7500 }, capacity: { bedrooms: 4, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 30, status: "approved" },
    { id: 19, title: "Elegant Villa in Race Course", propertyType: "villa", location: { city: "Vadodara", area: "Race Course" }, pricing: { nightlyRate: 10000 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 5.0, reviewCount: 50, status: "approved" },
    { id: 20, title: "Family Villa in Sama", propertyType: "villa", location: { city: "Vadodara", area: "Sama" }, pricing: { nightlyRate: 6800 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 25, status: "approved" },
    { id: 21, title: "Boutique Villa in Sayajigunj", propertyType: "villa", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 8800 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 40, status: "approved" },
    { id: 22, title: "Heritage Villa in Fatehgunj", propertyType: "villa", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 9500 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 42, status: "approved" },
    { id: 23, title: "Contemporary Villa in Karelibaug", propertyType: "villa", location: { city: "Vadodara", area: "Karelibaug" }, pricing: { nightlyRate: 7800 }, capacity: { bedrooms: 4, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 33, status: "approved" },
    { id: 24, title: "Serene Villa in Tandalja", propertyType: "villa", location: { city: "Vadodara", area: "Tandalja" }, pricing: { nightlyRate: 7000 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 27, status: "approved" },

    // Independent Houses (12 properties)
    { id: 25, title: "Spacious House in Alkapuri", propertyType: "house", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 5500 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 29, status: "approved" },
    { id: 26, title: "Traditional House in Manjalpur", propertyType: "house", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 4800 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 22, status: "approved" },
    { id: 27, title: "Modern House in Vasna", propertyType: "house", location: { city: "Vadodara", area: "Vasna" }, pricing: { nightlyRate: 6000 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 35, status: "approved" },
    { id: 28, title: "Cozy House in Waghodia", propertyType: "house", location: { city: "Vadodara", area: "Waghodia" }, pricing: { nightlyRate: 4200 }, capacity: { bedrooms: 2, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.5, reviewCount: 18, status: "approved" },
    { id: 29, title: "Family House in Akota", propertyType: "house", location: { city: "Vadodara", area: "Akota" }, pricing: { nightlyRate: 5200 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 26, status: "approved" },
    { id: 30, title: "Elegant House in Gotri", propertyType: "house", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 4900 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 21, status: "approved" },
    { id: 31, title: "Premium House in Race Course", propertyType: "house", location: { city: "Vadodara", area: "Race Course" }, pricing: { nightlyRate: 6500 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 38, status: "approved" },
    { id: 32, title: "Comfortable House in Sama", propertyType: "house", location: { city: "Vadodara", area: "Sama" }, pricing: { nightlyRate: 4500 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 20, status: "approved" },
    { id: 33, title: "Charming House in Sayajigunj", propertyType: "house", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 5800 }, capacity: { bedrooms: 4, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 31, status: "approved" },
    { id: 34, title: "Vintage House in Fatehgunj", propertyType: "house", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 5000 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 24, status: "approved" },
    { id: 35, title: "Stylish House in Karelibaug", propertyType: "house", location: { city: "Vadodara", area: "Karelibaug" }, pricing: { nightlyRate: 5300 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 27, status: "approved" },
    { id: 36, title: "Peaceful House in Tandalja", propertyType: "house", location: { city: "Vadodara", area: "Tandalja" }, pricing: { nightlyRate: 4600 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 19, status: "approved" },

    // Duplex/Triplex (10 properties)
    { id: 37, title: "Luxury Duplex in Alkapuri", propertyType: "duplex", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 7500 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 36, status: "approved" },
    { id: 38, title: "Modern Duplex in Manjalpur", propertyType: "duplex", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 6800 }, capacity: { bedrooms: 4, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 30, status: "approved" },
    { id: 39, title: "Spacious Triplex in Vasna", propertyType: "duplex", location: { city: "Vadodara", area: "Vasna" }, pricing: { nightlyRate: 9500 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 5.0, reviewCount: 44, status: "approved" },
    { id: 40, title: "Elegant Duplex in Waghodia", propertyType: "duplex", location: { city: "Vadodara", area: "Waghodia" }, pricing: { nightlyRate: 6200 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 25, status: "approved" },
    { id: 41, title: "Premium Duplex in Akota", propertyType: "duplex", location: { city: "Vadodara", area: "Akota" }, pricing: { nightlyRate: 7200 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 33, status: "approved" },
    { id: 42, title: "Contemporary Duplex in Gotri", propertyType: "duplex", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 6500 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 28, status: "approved" },
    { id: 43, title: "Designer Duplex in Race Course", propertyType: "duplex", location: { city: "Vadodara", area: "Race Course" }, pricing: { nightlyRate: 8500 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 40, status: "approved" },
    { id: 44, title: "Family Duplex in Sama", propertyType: "duplex", location: { city: "Vadodara", area: "Sama" }, pricing: { nightlyRate: 6000 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 8 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 23, status: "approved" },
    { id: 45, title: "Stylish Triplex in Sayajigunj", propertyType: "duplex", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 8800 }, capacity: { bedrooms: 5, beds: 6, maxGuests: 12 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 38, status: "approved" },
    { id: 46, title: "Chic Duplex in Fatehgunj", propertyType: "duplex", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 7000 }, capacity: { bedrooms: 4, beds: 5, maxGuests: 10 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 32, status: "approved" },

    // Service Apartments (10 properties)
    { id: 47, title: "Executive Service Apartment in Alkapuri", propertyType: "service_apartment", location: { city: "Vadodara", area: "Alkapuri" }, pricing: { nightlyRate: 3500 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 28, status: "approved" },
    { id: 48, title: "Business Service Apartment in Sayajigunj", propertyType: "service_apartment", location: { city: "Vadodara", area: "Sayajigunj" }, pricing: { nightlyRate: 4000 }, capacity: { bedrooms: 2, beds: 3, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 34, status: "approved" },
    { id: 49, title: "Luxury Service Apartment in Race Course", propertyType: "service_apartment", location: { city: "Vadodara", area: "Race Course" }, pricing: { nightlyRate: 5000 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 5.0, reviewCount: 42, status: "approved" },
    { id: 50, title: "Comfort Service Apartment in Manjalpur", propertyType: "service_apartment", location: { city: "Vadodara", area: "Manjalpur" }, pricing: { nightlyRate: 3200 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 25, status: "approved" },
    { id: 51, title: "Premium Service Apartment in Akota", propertyType: "service_apartment", location: { city: "Vadodara", area: "Akota" }, pricing: { nightlyRate: 3800 }, capacity: { bedrooms: 2, beds: 3, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.8, reviewCount: 30, status: "approved" },
    { id: 52, title: "Modern Service Apartment in Vasna", propertyType: "service_apartment", location: { city: "Vadodara", area: "Vasna" }, pricing: { nightlyRate: 4200 }, capacity: { bedrooms: 3, beds: 3, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 36, status: "approved" },
    { id: 53, title: "Cozy Service Apartment in Gotri", propertyType: "service_apartment", location: { city: "Vadodara", area: "Gotri" }, pricing: { nightlyRate: 2800 }, capacity: { bedrooms: 1, beds: 2, maxGuests: 2 }, images: ["/placeholder-property.jpg"], rating: 4.6, reviewCount: 20, status: "approved" },
    { id: 54, title: "Deluxe Service Apartment in Waghodia", propertyType: "service_apartment", location: { city: "Vadodara", area: "Waghodia" }, pricing: { nightlyRate: 3600 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 27, status: "approved" },
    { id: 55, title: "Elite Service Apartment in Fatehgunj", propertyType: "service_apartment", location: { city: "Vadodara", area: "Fatehgunj" }, pricing: { nightlyRate: 4500 }, capacity: { bedrooms: 3, beds: 4, maxGuests: 6 }, images: ["/placeholder-property.jpg"], rating: 4.9, reviewCount: 38, status: "approved" },
    { id: 56, title: "Smart Service Apartment in Karelibaug", propertyType: "service_apartment", location: { city: "Vadodara", area: "Karelibaug" }, pricing: { nightlyRate: 3300 }, capacity: { bedrooms: 2, beds: 2, maxGuests: 4 }, images: ["/placeholder-property.jpg"], rating: 4.7, reviewCount: 24, status: "approved" }
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
    <div className="short-stay-landing">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find Your Perfect Short Stay
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover comfortable stays for your next trip
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            className="search-container"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="search-field">
              <label>📍 Location</label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
            <div className="search-field">
              <label>📅 Check-in</label>
              <input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="search-field">
              <label>📅 Check-out</label>
              <input
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="search-field">
              <label>👥 Guests</label>
              <input
                type="number"
                min="1"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
              />
            </div>
            <button className="search-btn" onClick={handleSearch}>
              Search
            </button>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="cta-buttons"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button 
              className="cta-btn primary"
              onClick={() => navigate('/short-stay/search')}
            >
              Explore Stays
            </button>
            <button 
              className="cta-btn secondary"
              onClick={() => user ? navigate('/short-stay/list-property') : navigate('/login')}
            >
              List Your Property
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Browse by Property Type</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleCategoryClick(category.id)}
              whileHover={{ y: -5 }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{listings.filter(l => l.propertyType === category.id).length} properties</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Stays</h2>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/short-stay/search')}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading properties...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <p>No properties available yet. Be the first to list!</p>
            <button 
              className="list-property-btn"
              onClick={() => user ? navigate('/short-stay/list-property') : navigate('/login')}
            >
              List Your Property
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.slice(0, 6).map((listing, index) => (
              <motion.div
                key={listing.id}
                className="listing-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(`/short-stay/${listing.id}`)}
                whileHover={{ y: -8 }}
              >
                <div className="listing-image">
                  <img src={listing.images[0] || '/placeholder-property.jpg'} alt={listing.title} />
                  <div className="listing-badge">{listing.propertyType}</div>
                </div>
                <div className="listing-info">
                  <h3>{listing.title}</h3>
                  <p className="location">📍 {listing.location.city}, {listing.location.area}</p>
                  <div className="listing-details">
                    <span>{listing.capacity.bedrooms} BR</span>
                    <span>•</span>
                    <span>{listing.capacity.beds} Beds</span>
                    <span>•</span>
                    <span>{listing.capacity.maxGuests} Guests</span>
                  </div>
                  <div className="listing-footer">
                    <div className="price">
                      <span className="amount">₹{listing.pricing.nightlyRate.toLocaleString()}</span>
                      <span className="period">/ night</span>
                    </div>
                    {listing.rating && (
                      <div className="rating">
                        ⭐ {listing.rating} ({listing.reviewCount})
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section">
        <h2>Why Choose Bada Builder Short Stay?</h2>
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="feature-icon">🔒</div>
            <h3>Secure Booking</h3>
            <p>Safe and secure payment gateway with full refund protection</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="feature-icon">✅</div>
            <h3>Verified Properties</h3>
            <p>All properties are verified and approved by our team</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Competitive pricing with no hidden charges</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="feature-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support for all your needs</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ShortStayLanding;
