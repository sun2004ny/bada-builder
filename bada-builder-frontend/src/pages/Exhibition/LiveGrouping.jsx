import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { liveGroupDynamicAPI } from '../../services/api';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { calculateTokenAmount, formatCurrency, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import './Exhibition.css';
import './Exhibition.css';
import './LiveGrouping.css';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) return 'Expired';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);

      return parts.length > 0 ? parts.join(' ') : 'Ending soon';
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
};

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
    const active = liveGroups.filter(group => group.status !== 'closed' && group.status !== 'archived');
    const closed = liveGroups.filter(group => group.status === 'closed');

    setActiveGroups(active);
    setClosedGroups(closed);
  }, [liveGroups]);

  const fetchLiveGroups = async () => {
    try {
      setLoading(true);
      const response = await liveGroupDynamicAPI.getAll();
      const groupsData = response.projects || [];

      const processedGroups = groupsData.map(group => {
        let benefits = ["Group Discount", "Premium Location", "Verified Builder"];
        if (group.benefits) {
          try {
            benefits = typeof group.benefits === 'string' ? JSON.parse(group.benefits) : group.benefits;
            if (!Array.isArray(benefits)) throw new Error('Not an array');
          } catch (e) {
            // Fallback to comma separated string handling if it's not JSON
            if (typeof group.benefits === 'string' && group.benefits.includes(',')) {
              benefits = group.benefits.split(',').map(b => b.trim()).filter(Boolean);
            } else if (typeof group.benefits === 'string') {
              benefits = [group.benefits];
            }
          }
        }

        return {
          ...group,
          timeLeft: group.status === 'live' ? 'Limited Time' : 'Closed',
          benefits: benefits,
          pricePerSqFt: parseFloat(group.regular_price_per_sqft) || parseFloat(group.original_price?.replace(/[^0-9.]/g, '') || 4500),
          groupPricePerSqFt: parseFloat(group.group_price_per_sqft) || parseFloat(group.group_price?.replace(/[^0-9.]/g, '') || 4000),
          filledSlots: group.filled_slots || 0,
          totalSlots: group.total_slots || 0,
          minBuyers: group.min_buyers || 0,
        };
      });


      setLiveGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching live groups:', error);
      setLiveGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (group) => {
    setSelectedGroup(group);
    const tokenAmount = calculateTokenAmount(group.groupPricePerSqFt, group.area);
    const formattedToken = formatCurrency(tokenAmount);

    // In production, this would open a modal or redirect to registration
    alert(`Joining group for ${group.title}!\n\nToken Amount: ${formattedToken} (0.5% of discounted price)`);
  };

  const getProgressPercentage = (filled, total) => {
    if (!total || total === 0) return 0;
    const perc = (filled / total) * 100;
    if (filled > 0 && perc < 4) return 4; // Minimum 4% width if joined
    return perc;
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

                    {/* NEW: Extended Offer Badge */}
                    {group.offer_type && (
                      <div className="extended-offer-badge">
                        {group.offer_type}
                      </div>
                    )}

                    <div className="property-badge live">🔴 Live Group</div>
                    <div className="discount-badge">{group.discount_label || group.discount}</div>

                    {/* NEW: Offer Countdown */}
                    {group.offer_expiry_datetime ? (
                      <div className="offer-countdown">
                        <span>⏳ Ends in:</span>
                        <Countdown targetDate={group.offer_expiry_datetime} />
                      </div>
                    ) : (
                      <div className="timer-badge">⏰ {group.timeLeft}</div>
                    )}
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

                    {/* Pricing Section - Redesigned */}
                    <div className="pricing-section">

                      {/* 1. Top Section: Regular Total Price */}
                      <div className="price-comparison">
                        <div className="regular-price-top">
                          <span className="label">Regular Price</span>
                          <span className="value">
                            {group.regular_total_price
                              ? `₹${(parseFloat(group.regular_total_price) / 100000).toFixed(2)} Lakhs`
                              : 'Price on Request'
                            }
                          </span>
                        </div>
                      </div>

                      {/* 2. Main Highlight: Price Per Sq Ft */}
                      <div className="main-price-highlight">
                        <div className="label-floating">
                          <span className="icon">🏠</span> Live Group Price
                        </div>
                        <div className="amount">
                          ₹{group.groupPricePerSqFt?.toLocaleString() || 'N/A'} / sq ft
                        </div>
                      </div>

                      {/* 3. Yellow Pricing Container */}
                      {/* 3. Yellow Pricing Container - STRICT IMPLEMENTATION */}
                      {/* V2 Yellow Pricing Container */}
                      <div className="yellow-pricing-container-v2">

                        {/* Row 1: Regular Price Range Title & Value */}
                        <div className="regular-price-row">
                          <span className="label">REGULAR PRICE RANGE:</span>
                          <span className="value">
                            {group.regular_price_min
                              ? `₹${(parseFloat(group.regular_price_min) / 100000).toFixed(2)} Lakhs`
                              : (group.original_price ? group.original_price : '₹62.06 Lakhs')
                            }
                            {' - '}
                            {group.regular_price_max
                              ? `₹${(parseFloat(group.regular_price_max) / 100000).toFixed(2)} Lakhs`
                              : '₹85.34 Lakhs'
                            }
                          </span>
                        </div>

                        {/* Row 2: Orange Range Bar */}
                        <div className="range-bar-orange"></div>
                        <div className="range-limits-labels text-slate-500 mb-4">
                          <span>
                            {group.regular_price_min
                              ? `₹${(parseFloat(group.regular_price_min) / 100000).toFixed(2)} Lakhs`
                              : (group.original_price ? group.original_price : '₹62.06 Lakhs')
                            }
                          </span>
                          <span>
                            {group.regular_price_max
                              ? `₹${(parseFloat(group.regular_price_max) / 100000).toFixed(2)} Lakhs`
                              : '₹85.34 Lakhs'
                            }
                          </span>
                        </div>

                        {/* Row 3: Group Price Box (Green) */}
                        <div className="group-price-box">
                          <div className="group-price-row">
                            <div className="label-col">
                              <span className="icon">🎯</span>
                              <span className="label">GROUP PRICE RANGE:</span>
                            </div>
                            <span className="value">
                              {group.discounted_total_price_min
                                ? `₹${(parseFloat(group.discounted_total_price_min) / 100000).toFixed(2)} Lakhs`
                                : '₹56.28 Lakhs'
                              }
                              {' - '}
                              {group.discounted_total_price_max
                                ? `₹${(parseFloat(group.discounted_total_price_max) / 100000).toFixed(2)} Lakhs`
                                : '₹77.39 Lakhs'
                              }
                            </span>
                          </div>

                          {/* Green Range Bar */}
                          <div className="range-bar-green"></div>
                          <div className="range-limits-labels text-emerald-700">
                            <span>
                              {group.discounted_total_price_min
                                ? `₹${(parseFloat(group.discounted_total_price_min) / 100000).toFixed(2)} Lakhs`
                                : '₹56.28 Lakhs'
                              }
                            </span>
                            <span>
                              {group.discounted_total_price_max
                                ? `₹${(parseFloat(group.discounted_total_price_max) / 100000).toFixed(2)} Lakhs`
                                : '₹77.39 Lakhs'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Row 4: Dashed Separator */}
                        <div className="dashed-separator"></div>

                        {/* Row 5: Available Units */}
                        <div className="available-units-section">
                          <div className="section-label">AVAILABLE UNITS:</div>
                          <div className="units-grid">
                            {/* Parse unit configuration into pills if possible, else show dummies/fallbacks */}
                            {group.unit_configuration && group.unit_configuration.includes(',') ? (
                              group.unit_configuration.split(',').map((u, i) => (
                                <div key={i} className="unit-pill">{u.trim()}</div>
                              ))
                            ) : (group.unit_configuration ? (
                              <div className="unit-pill">{group.unit_configuration}</div>
                            ) : (
                              <>
                                <div className="unit-pill">2 BHK (1200 sq ft)</div>
                                <div className="unit-pill">3 BHK (1450 sq ft)</div>
                                <div className="unit-pill">3 BHK Premium (1650 sq ft)</div>
                              </>
                            )
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Secondary Info Clean */}
                      {(group.unit_configuration || group.project_level) && (
                        <div className="secondary-info-clean">
                          {group.unit_configuration && (
                            <div className="info-pill">{group.unit_configuration}</div>
                          )}
                          {group.project_level && (
                            <div className="info-pill">{group.project_level}</div>
                          )}
                        </div>
                      )}

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
                          if (group.details_page_url) {
                            window.open(group.details_page_url, '_blank');
                          } else {
                            navigate(`/exhibition/live-grouping/${group.id}`);
                          }
                        }}
                      >
                        {group.secondary_cta_text || 'View Details'}
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
                          (group.primary_cta_text || '🤝 Join This Group')}
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
