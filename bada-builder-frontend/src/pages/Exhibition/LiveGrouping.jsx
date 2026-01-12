import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { calculateTokenAmount, formatCurrency, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import './Exhibition.css';
import './LiveGrouping.css';

const LiveGrouping = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [liveGroups, setLiveGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useViewPreference();
  const [activeGroups, setActiveGroups] = useState([]);
  const [closedGroups, setClosedGroups] = useState([]);

  useEffect(() => {
    fetchLiveGroups();
  }, []);

  useEffect(() => {
    // Separate active and closed groups
    const active = liveGroups.filter(group => {
      // Auto-close if group is full
      if (group.filledSlots >= group.totalSlots) {
        return false; // Move to closed
      }
      return group.status !== 'closed';
    });

    const closed = liveGroups.filter(group => {
      // Group is closed if full or manually closed
      return group.filledSlots >= group.totalSlots || group.status === 'closed';
    });

    setActiveGroups(active);
    setClosedGroups(closed);
  }, [liveGroups]);

  const fetchLiveGroups = async () => {
    try {
      // Load from LocalStorage (Admin Posted)
      const storedGroups = JSON.parse(localStorage.getItem('liveGroupingProperties') || '[]');

      if (storedGroups.length > 0) {
        // Ensure robust structure for display
        const processedGroups = storedGroups.map(group => {
          // Parse numeric inputs safely
          const storedPrice = Number(group.pricePerSqFt);
          const validPrice = !isNaN(storedPrice) && storedPrice > 0 ? storedPrice : 4500;

          // Calculate group price based on discount
          const discountStr = group.discount || '10%';
          const discountVal = parseInt(discountStr.replace(/[^0-9]/g, '')) || 10;
          const groupPrice = Math.round(validPrice * (1 - (discountVal / 100)));

          return {
            ...group,
            // Add defaults if missing to prevent crashes
            units: group.units || [
              { name: "Standard Unit", area: 1200 },
              { name: "Premium Unit", area: 1500 }
            ],
            benefits: group.benefits && group.benefits.length > 0 ? group.benefits : ["Group Discount", "Premium Location", "Verified Builder"],
            filledSlots: parseInt(group.filledSlots) || 0,
            totalSlots: parseInt(group.totalSlots) || 20,
            minBuyers: parseInt(group.minBuyers) || 5,
            pricePerSqFt: validPrice,
            groupPricePerSqFt: groupPrice,
            status: group.status || 'active',
            image: (group.images && group.images.length > 0) ? group.images[0] : (group.imageUrl || '/placeholder-property.jpg'),
            type: group.type || group.category || '3 BHK Apartment',
            developer: group.developer || 'Verified Builder',
            location: group.location || 'Vadodara'
          };
        });
        setLiveGroups(processedGroups);
      } else {
        setLiveGroups(fallbackGroups);
      }
    } catch (error) {
      console.error('Error fetching live groups:', error);
      setLiveGroups(fallbackGroups);
    } finally {
      setLoading(false);
    }
  };

  // Fallback example properties
  const fallbackGroups = [
    {
      id: 1,
      title: "Skyline Towers - Group Buy",
      developer: "Shree Balaji Builders",
      location: "Waghodia Road, Vadodara",
      pricePerSqFt: 5172, // Regular price per sq ft
      groupPricePerSqFt: 4690, // Group discounted price per sq ft
      discount: "9% OFF",
      image: "/placeholder-property.jpg",
      type: "3 BHK Apartment",
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
      status: "active"
    },
    {
      id: 2,
      title: "Green Valley Phase 2",
      developer: "Prestige Group",
      location: "Manjalpur, Vadodara",
      pricePerSqFt: 3864, // Regular price per sq ft
      groupPricePerSqFt: 3455, // Group discounted price per sq ft
      discount: "11% OFF",
      image: "/placeholder-property.jpg",
      type: "4 BHK Villa",
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
      status: "closing"
    },
    {
      id: 3,
      title: "Royal Heights Premium",
      developer: "Kalpataru Developers",
      location: "Akota, Vadodara",
      pricePerSqFt: 3429, // Regular price per sq ft
      groupPricePerSqFt: 3000, // Group discounted price per sq ft
      discount: "12% OFF",
      image: "/placeholder-property.jpg",
      type: "Luxury Penthouse",
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
      status: "active"
    }
  ];

  const handleJoinGroup = (group) => {
    setSelectedGroup(group);
    const tokenAmount = calculateTokenAmount(group.groupPricePerSqFt, group.area);
    const formattedToken = formatCurrency(tokenAmount);

    // In production, this would open a modal or redirect to registration
    alert(`Joining group for ${group.title}!\n\nToken Amount: ${formattedToken} (0.5% of discounted price)`);
  };

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

  return (
    <div className="exhibition-page live-grouping-page">
      <div className="exhibition-container">
        {/* Header */}
        <motion.div
          className="exhibition-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="live-badge">🔴 LIVE</div>
          <h1>Live Group Buying</h1>
          <p>Join with other buyers and save up to 15% on premium properties</p>
          <div className="badge-container">
            <span className="info-badge">💰 Better Prices</span>
            <span className="info-badge">🤝 Group Benefits</span>
            <span className="info-badge">⚡ Limited Time</span>
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
          <Link to="/exhibition/live-grouping" className="tab active">
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
        {!loading && (activeGroups.length > 0 || closedGroups.length > 0) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}

        {/* How It Works Section */}
        <motion.div
          className="how-it-works"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>How Group Buying Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Choose a Group</h3>
              <p>Select from active group buying opportunities</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Join & Pay Token</h3>
              <p>Pay a small token amount to secure your spot</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Wait for Group</h3>
              <p>Group activates when minimum buyers join</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Get Discount</h3>
              <p>Enjoy group discount and exclusive benefits</p>
            </div>
          </div>
        </motion.div>

        {/* Active Live Groups Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">🔴 Active Live Groups</h2>
          <div className={`properties-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                Loading properties...
              </p>
            ) : activeGroups.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', color: '#666' }}>
                No active groups available at the moment. Check back soon!
              </p>
            ) : (
              activeGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  className={`property-card live-group-card ${group.status}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/exhibition/live-grouping/${group.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="property-image">
                    <img src={group.image} alt={group.title} />
                    <div className="property-badge live">🔴 Live Group</div>
                    <div className="discount-badge">{group.discount}</div>
                    <div className="timer-badge">⏰ {group.timeLeft}</div>
                  </div>

                  <div className="property-info">
                    <h3>{group.title}</h3>
                    <p className="owner">🏢 {group.developer}</p>
                    <p className="location">📍 {group.location}</p>
                    <p className="type-info">{group.type}</p>

                    {/* Progress Bar */}
                    <div className="group-progress">
                      <div className="progress-header">
                        <span className="progress-label">
                          {group.filledSlots}/{group.totalSlots} Buyers Joined
                        </span>
                        <span className="min-buyers">Min: {group.minBuyers}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getProgressPercentage(group.filledSlots, group.totalSlots)}%`,
                            backgroundColor: getStatusColor(group.status)
                          }}
                        />
                      </div>
                    </div>

                    {/* Pricing - Per Sq Ft & Price Range */}
                    <div className="pricing-section">
                      <div className="price-comparison">
                        <div className="original-price">
                          <span className="label">Regular Price</span>
                          <span className="amount strikethrough">₹{group.pricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                        </div>
                        <div className="group-price">
                          <span className="label">🎯 Live Grouping Price</span>
                          <span className="amount group-highlight">₹{group.groupPricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                        </div>
                      </div>

                      {/* Price Range for Multiple Units */}
                      {group.units && group.units.length > 0 && (
                        <div className="price-range-section">
                          <div className="range-item">
                            <span className="range-label">Regular Price Range:</span>
                            <span className="range-value">
                              {formatPriceRange(calculatePriceRange(group.pricePerSqFt, group.units))}
                            </span>
                          </div>

                          {/* Visual Range Bar */}
                          <div className="range-bar-container">
                            <div className="range-bar">
                              <div className="range-bar-fill regular"></div>
                            </div>
                            <div className="range-labels">
                              <span className="range-min">
                                {formatCurrency(calculatePriceRange(group.pricePerSqFt, group.units).min)}
                              </span>
                              <span className="range-max">
                                {formatCurrency(calculatePriceRange(group.pricePerSqFt, group.units).max)}
                              </span>
                            </div>
                          </div>

                          <div className="range-item group-range">
                            <span className="range-label">🎯 Group Price Range:</span>
                            <span className="range-value highlight">
                              {formatPriceRange(calculatePriceRange(group.groupPricePerSqFt, group.units))}
                            </span>
                          </div>

                          {/* Visual Range Bar for Group Price */}
                          <div className="range-bar-container">
                            <div className="range-bar">
                              <div className="range-bar-fill group"></div>
                            </div>
                            <div className="range-labels">
                              <span className="range-min group">
                                {formatCurrency(calculatePriceRange(group.groupPricePerSqFt, group.units).min)}
                              </span>
                              <span className="range-max group">
                                {formatCurrency(calculatePriceRange(group.groupPricePerSqFt, group.units).max)}
                              </span>
                            </div>
                          </div>

                          <div className="units-info">
                            <span className="units-label">Available Units:</span>
                            <div className="units-list">
                              {group.units.map((unit, idx) => (
                                <span key={idx} className="unit-badge">
                                  {unit.name} ({unit.area} sq ft)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="savings-note">
                        💡 Final price depends on unit & area selected
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="benefits-list">
                      <h4>Group Benefits:</h4>
                      <ul>
                        {group.benefits.map((benefit, idx) => (
                          <li key={idx}>✓ {benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Property Actions */}
                    <div className="property-actions-grouping">
                      <button
                        className="view-details-btn-grouping"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exhibition/live-grouping/${group.id}`);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className="book-visit-btn-grouping"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/book-visit', {
                            state: { property: { ...group, type: 'grouping' } }
                          });
                        }}
                      >
                        Book Site Visit
                      </button>
                    </div>



                    {/* Action Button - Navigate to 3D View */}
                    <button
                      className={`join-group-btn ${group.status}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/exhibition/3d-view', { state: { property: group } });
                      }}
                      disabled={group.status === 'closed'}
                    >
                      {group.status === 'closing' ? '⚡ Join Now - Closing Soon!' :
                        group.status === 'closed' ? '❌ Group Closed' :
                          '🤝 Join This Group'}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Closed Live Groups Section */}
        {
          closedGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{ marginTop: '60px' }}
            >
              <h2 className="section-title closed-section">✅ Closed Live Groups</h2>
              <p className="section-subtitle">These groups have been successfully filled</p>
              <div className={`properties-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
                {closedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    className="property-card live-group-card closed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => navigate(`/exhibition/live-grouping/${group.id}`)}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                  >
                    <div className="property-image">
                      <img src={group.image} alt={group.title} />
                      <div className="property-badge closed-badge">✅ Group Closed</div>
                      <div className="closed-overlay">
                        <span>FULLY BOOKED</span>
                      </div>
                    </div>

                    <div className="property-info">
                      <h3>{group.title}</h3>
                      <p className="owner">🏢 {group.developer}</p>
                      <p className="location">📍 {group.location}</p>
                      <p className="type-info">{group.type}</p>

                      {/* Progress Bar - Full */}
                      <div className="group-progress">
                        <div className="progress-header">
                          <span className="progress-label success">
                            ✅ {group.totalSlots}/{group.totalSlots} Buyers Joined
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: '100%',
                              backgroundColor: '#10b981'
                            }}
                          />
                        </div>
                      </div>

                      {/* Pricing - Per Sq Ft & Price Range */}
                      <div className="pricing-section">
                        <div className="price-comparison">
                          <div className="original-price">
                            <span className="label">Regular Price</span>
                            <span className="amount strikethrough">₹{group.pricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                          </div>
                          <div className="group-price">
                            <span className="label">🎯 Final Group Price</span>
                            <span className="amount group-highlight">₹{group.groupPricePerSqFt?.toLocaleString() || 'N/A'} / sq ft</span>
                          </div>
                        </div>

                        {/* Price Range for Multiple Units */}
                        {group.units && group.units.length > 0 && (
                          <div className="price-range-section">
                            <div className="range-item group-range">
                              <span className="range-label">🎯 Final Price Range:</span>
                              <span className="range-value highlight">
                                {formatPriceRange(calculatePriceRange(group.groupPricePerSqFt, group.units))}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Closed Status */}
                      <div className="closed-status">
                        <span className="closed-icon">✅</span>
                        <span className="closed-text">This group is now closed</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        }

        {/* FAQ Section */}
        <motion.div
          className="faq-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h3>❓ What is Group Buying?</h3>
              <p>Group buying allows multiple buyers to purchase properties together, getting bulk discounts and exclusive benefits from developers.</p>
            </div>
            <div className="faq-card">
              <h3>💰 How much can I save?</h3>
              <p>Savings range from 8% to 15% depending on the project and group size. Plus, you get exclusive benefits worth lakhs.</p>
            </div>
            <div className="faq-card">
              <h3>⏰ What if group doesn't fill?</h3>
              <p>If minimum buyers don't join within the time limit, your token amount is fully refunded within 7 days.</p>
            </div>
            <div className="faq-card">
              <h3>🔒 Is it safe?</h3>
              <p>Yes! All transactions are secure, and properties are verified. You get the same legal documentation as regular purchases.</p>
            </div>
          </div>
        </motion.div>
      </div >
    </div >
  );
};

export default LiveGrouping;
