import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { calculateTokenAmount, formatCurrency, calculateTotalPrice, calculateSavings, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import './LiveGroupingDetails.css';

const LiveGroupingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const docRef = doc(db, 'live_grouping_properties', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProperty({ id: docSnap.id, ...docSnap.data() });
      } else {
        // If not found in database, check fallback data
        const fallbackProperty = fallbackData[id];
        if (fallbackProperty) {
          setProperty(fallbackProperty);
        } else {
          setProperty(null);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      // On error, try fallback data
      const fallbackProperty = fallbackData[id];
      if (fallbackProperty) {
        setProperty(fallbackProperty);
      } else {
        setProperty(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback example data
  const fallbackData = {
    1: {
      id: 1,
      title: "Skyline Towers - Group Buy",
      developer: "Shree Balaji Builders",
      location: "Waghodia Road, Vadodara",
      pricePerSqFt: 5172, // Regular price per sq ft
      groupPricePerSqFt: 4690, // Group discounted price per sq ft
      discount: "9% OFF",
      image: "/placeholder-property.jpg",
      type: "3 BHK Apartment",
      area: "1450 sq.ft",
      units: [
        { name: "2 BHK", area: 1200 },
        { name: "3 BHK", area: 1450 },
        { name: "3 BHK Premium", area: 1650 }
      ],
      totalSlots: 20,
      filledSlots: 14,
      timeLeft: "2 Days 5 Hours",
      minBuyers: 15,
      benefits: ["Free Modular Kitchen", "2 Years Maintenance Free", "Premium Flooring"],
      status: "active",
      images: ["/placeholder-property.jpg", "/placeholder-property.jpg", "/placeholder-property.jpg"],
      possession: "Dec 2025",
      reraNumber: "PR/GJ/VADODARA/123456",
      facilities: ["Swimming Pool", "Gym", "Parking", "Security", "Garden", "Power Backup", "Lift", "Club House"],
      description: "Skyline Towers offers premium 3 BHK apartments with modern amenities and excellent connectivity. Join the group buy to save on per sq ft pricing and get exclusive benefits worth ₹5 Lakhs.",
      advantages: [
        { place: "Railway Station", distance: "2.5 km" },
        { place: "Airport", distance: "8 km" },
        { place: "School", distance: "500 m" }
      ],
      groupDetails: {
        refundPolicy: "100% refund if group doesn't fill",
        closingDate: "Dec 20, 2025",
        expectedCompletion: "Dec 2025"
      }
    },
    2: {
      id: 2,
      title: "Green Valley Phase 2",
      developer: "Prestige Group",
      location: "Manjalpur, Vadodara",
      pricePerSqFt: 3864, // Regular price per sq ft
      groupPricePerSqFt: 3455, // Group discounted price per sq ft
      discount: "11% OFF",
      image: "/placeholder-property.jpg",
      type: "4 BHK Villa",
      area: "2200 sq.ft",
      units: [
        { name: "3 BHK Villa", area: 2000 },
        { name: "4 BHK Villa", area: 2200 },
        { name: "4 BHK Duplex", area: 2500 }
      ],
      totalSlots: 15,
      filledSlots: 15,
      timeLeft: "Closing Soon",
      minBuyers: 10,
      benefits: ["Free Club Membership", "Landscaped Garden", "Solar Panels"],
      status: "closing",
      images: ["/placeholder-property.jpg", "/placeholder-property.jpg", "/placeholder-property.jpg"],
      possession: "Ready to Move",
      reraNumber: "PR/GJ/VADODARA/789012",
      facilities: ["Swimming Pool", "Gym", "Parking", "Security", "Garden", "Power Backup", "Club House", "Kids Play Area"],
      description: "Green Valley Phase 2 offers luxurious 4 BHK villas in a gated community with world-class amenities. This group is closing soon!",
      advantages: [
        { place: "Highway", distance: "1 km" },
        { place: "Mall", distance: "3 km" },
        { place: "Hospital", distance: "2 km" }
      ],
      groupDetails: {
        refundPolicy: "100% refund if group doesn't fill",
        closingDate: "Dec 18, 2025",
        expectedCompletion: "Ready to Move"
      }
    },
    3: {
      id: 3,
      title: "Royal Heights Premium",
      developer: "Kalpataru Developers",
      location: "Akota, Vadodara",
      pricePerSqFt: 3429, // Regular price per sq ft
      groupPricePerSqFt: 3000, // Group discounted price per sq ft
      discount: "12% OFF",
      image: "/placeholder-property.jpg",
      type: "Luxury Penthouse",
      area: "3500 sq.ft",
      units: [
        { name: "Penthouse 3 BHK", area: 3000 },
        { name: "Penthouse 4 BHK", area: 3500 },
        { name: "Penthouse Duplex", area: 4200 }
      ],
      totalSlots: 10,
      filledSlots: 6,
      timeLeft: "5 Days 12 Hours",
      minBuyers: 8,
      benefits: ["Private Terrace", "Smart Home System", "Concierge Service"],
      status: "active",
      images: ["/placeholder-property.jpg", "/placeholder-property.jpg", "/placeholder-property.jpg"],
      possession: "Jun 2026",
      reraNumber: "PR/GJ/VADODARA/345678",
      facilities: ["Swimming Pool", "Gym", "Parking", "Security", "Garden", "Power Backup", "Lift", "Club House", "Spa", "Rooftop Lounge"],
      description: "Royal Heights Premium offers ultra-luxury penthouses with breathtaking views and world-class amenities. Join the exclusive group buy.",
      advantages: [
        { place: "Business District", distance: "1.5 km" },
        { place: "Fine Dining", distance: "500 m" },
        { place: "Metro Station", distance: "800 m" }
      ],
      groupDetails: {
        refundPolicy: "100% refund if group doesn't fill",
        closingDate: "Dec 25, 2025",
        expectedCompletion: "Jun 2026"
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading property details...</h2>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="not-found">
        <h2>Property Not Found</h2>
        <button onClick={() => navigate('/exhibition/live-grouping')}>
          Back to Live Grouping
        </button>
      </div>
    );
  }

  const getProgressPercentage = (filled, total) => {
    return (filled / total) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'closing':
        return '#f59e0b';
      case 'closed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const handleJoinGroup = () => {
    // Navigate to 3D view to join the group
    navigate('/exhibition/3d-view', { state: { property } });
  };

  return (
    <div className="live-grouping-details">
      <div className="details-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/exhibition/live-grouping')}>
          ← Back to Live Grouping
        </button>

        {/* Image Gallery */}
        <motion.div 
          className="image-gallery"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="main-image">
            <img src={property.images[0]} alt={property.title} />
            <div className="image-badges">
              <span className="live-badge">🔴 LIVE GROUP</span>
              <span className="discount-badge">{property.discount}</span>
              <span className="timer-badge">⏰ {property.timeLeft}</span>
            </div>
          </div>
          <div className="thumbnail-grid">
            {property.images.slice(1).map((img, idx) => (
              <img key={idx} src={img} alt={`View ${idx + 2}`} />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Title & Info */}
            <motion.div 
              className="property-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1>{property.title}</h1>
              <p className="location">📍 {property.location}</p>
              <div className="property-meta">
                <span className="meta-item">{property.type}</span>
                <span className="meta-item">{property.area}</span>
                <span className="meta-item">Possession: {property.possession}</span>
              </div>
              <div className="rera-badge">
                RERA ✅ {property.reraNumber}
              </div>
            </motion.div>

            {/* Group Progress */}
            <motion.div 
              className="group-progress-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2>Group Buying Progress</h2>
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-value">{property.filledSlots}/{property.totalSlots}</span>
                  <span className="stat-label">Buyers Joined</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{property.minBuyers}</span>
                  <span className="stat-label">Minimum Required</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{property.timeLeft}</span>
                  <span className="stat-label">Time Left</span>
                </div>
              </div>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large"
                  style={{ 
                    width: `${getProgressPercentage(property.filledSlots, property.totalSlots)}%`,
                    backgroundColor: getStatusColor(property.status)
                  }}
                />
              </div>
              <p className="progress-note">
                {property.totalSlots - property.filledSlots} slots remaining
              </p>
            </motion.div>

            {/* Description */}
            <motion.div 
              className="description-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2>About This Property</h2>
              <p>{property.description}</p>
            </motion.div>

            {/* Group Benefits */}
            <motion.div 
              className="benefits-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2>Exclusive Group Benefits</h2>
              <div className="benefits-grid">
                {property.benefits.map((benefit, idx) => (
                  <div key={idx} className="benefit-card">
                    <span className="benefit-icon">✓</span>
                    <span className="benefit-text">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Facilities */}
            <motion.div 
              className="facilities-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2>Amenities & Facilities</h2>
              <div className="facilities-grid">
                {property.facilities.map((facility, idx) => (
                  <div key={idx} className="facility-item">
                    {facility}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location Advantages */}
            <motion.div 
              className="location-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2>Location Advantages</h2>
              <div className="advantages-grid">
                {property.advantages.map((item, idx) => (
                  <div key={idx} className="advantage-card">
                    <p className="advantage-place">{item.place}</p>
                    <p className="advantage-distance">{item.distance}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Developer Info */}
            <motion.div 
              className="developer-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2>Developer</h2>
              <div className="developer-card">
                <div className="developer-icon">🏢</div>
                <div className="developer-info">
                  <h3>{property.developer}</h3>
                  <p>Trusted Real Estate Developer</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sticky Pricing Card */}
          <div className="right-column">
            <motion.div 
              className="pricing-card sticky"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="pricing-header">
                <h3>Group Buying Price</h3>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(property.status) }}>
                  {property.status === 'closing' ? 'Closing Soon' : 'Active'}
                </span>
              </div>

              <div className="price-comparison-large">
                <div className="original-price-large">
                  <span className="label">Regular Price</span>
                  <span className="amount strikethrough">₹{property.pricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                </div>
                <div className="group-price-large">
                  <span className="label">🎯 Live Grouping Price</span>
                  <span className="amount group-highlight">₹{property.groupPricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                </div>
              </div>

              {/* Price Range for Multiple Units */}
              {property.units && property.units.length > 0 && (
                <div className="price-range-section-details">
                  <h4>Price Range (Multiple Units)</h4>
                  
                  <div className="range-item-details">
                    <span className="range-label-details">Regular Price Range:</span>
                    <span className="range-value-details">
                      {formatPriceRange(calculatePriceRange(property.pricePerSqFt, property.units))}
                    </span>
                  </div>
                  
                  {/* Visual Range Bar */}
                  <div className="range-bar-container-details">
                    <div className="range-bar-details">
                      <div className="range-bar-fill-details regular"></div>
                    </div>
                    <div className="range-labels-details">
                      <span className="range-min-details">
                        {formatCurrency(calculatePriceRange(property.pricePerSqFt, property.units).min)}
                      </span>
                      <span className="range-max-details">
                        {formatCurrency(calculatePriceRange(property.pricePerSqFt, property.units).max)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="range-item-details group-range-details">
                    <span className="range-label-details">🎯 Group Price Range:</span>
                    <span className="range-value-details highlight">
                      {formatPriceRange(calculatePriceRange(property.groupPricePerSqFt, property.units))}
                    </span>
                  </div>
                  
                  {/* Visual Range Bar for Group Price */}
                  <div className="range-bar-container-details">
                    <div className="range-bar-details">
                      <div className="range-bar-fill-details group"></div>
                    </div>
                    <div className="range-labels-details">
                      <span className="range-min-details group">
                        {formatCurrency(calculatePriceRange(property.groupPricePerSqFt, property.units).min)}
                      </span>
                      <span className="range-max-details group">
                        {formatCurrency(calculatePriceRange(property.groupPricePerSqFt, property.units).max)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="units-info-details">
                    <span className="units-label-details">Available Units:</span>
                    <div className="units-list-details">
                      {property.units.map((unit, idx) => (
                        <span key={idx} className="unit-badge-details">
                          {unit.name} ({unit.area} sq ft)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pricing-note">
                <p>💡 <strong>Note:</strong> Final price depends on total area selected</p>
                <p className="area-info">Property Area: {property.area}</p>
              </div>

              <div className="group-details">
                <h4>Group Details</h4>
                <div className="detail-row">
                  <span className="detail-label">Token Amount:</span>
                  <span className="detail-value token-highlight">
                    {formatCurrency(calculateTokenAmount(property.groupPricePerSqFt, property.area))}
                    <span className="token-note">(0.5% of discounted price)</span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Closing Date:</span>
                  <span className="detail-value">{property.groupDetails.closingDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Refund Policy:</span>
                  <span className="detail-value">{property.groupDetails.refundPolicy}</span>
                </div>
              </div>

              <button 
                className="join-btn-large"
                onClick={handleJoinGroup}
                disabled={property.status === 'closed'}
              >
                {property.status === 'closing' ? '⚡ Join Now - Closing Soon!' : 
                 property.status === 'closed' ? '❌ Group Closed' : 
                 '🤝 Join This Group'}
              </button>

              <button 
                className="contact-btn"
                onClick={() => navigate('/book-visit', { state: { property: { ...property, type: 'grouping-details' } } })}
              >
                📞 Book Site Visit
              </button>

              <div className="trust-badges">
                <div className="trust-badge">
                  <span>🔒</span>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge">
                  <span>✅</span>
                  <span>RERA Verified</span>
                </div>
                <div className="trust-badge">
                  <span>💯</span>
                  <span>100% Refund</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGroupingDetails;
