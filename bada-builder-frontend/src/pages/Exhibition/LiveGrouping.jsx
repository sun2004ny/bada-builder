import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { liveGroupDynamicAPI } from '../../services/api';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { calculateTokenAmount, formatCurrency, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import './Exhibition.css';
import './LiveGrouping.css';

const Highlight = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} style={{ fontWeight: 'bold', color: 'inherit' }}>{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

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

const CustomDropdown = ({ label, value, options, onChange, mobileMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only for desktop, mobile uses backdrop
      if (!mobileMode && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (!mobileMode) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMode]);

  return (
    <>
      {/* Mobile Backdrop for clicking outside */}
      {mobileMode && isOpen && (
        <div
          className="mobile-dropdown-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`custom-dropdown-container ${mobileMode ? 'mobile-dropdown' : ''}`} ref={dropdownRef}>
        <motion.div
          className={`dropdown-trigger ${value !== 'All' ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={!mobileMode ? { color: '#6366f1' } : {}}
          whileTap={{ scale: 0.98 }}
        >
          <div className="trigger-label">
            <span className="actual-label">{label}</span>
            <span className="current-value">{value === 'All' ? 'Any' : value}</span>
          </div>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </motion.svg>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="dropdown-menu"
              initial={mobileMode ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={mobileMode ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={mobileMode ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {options.map((option) => (
                <div
                  key={option}
                  className={`menu-item ${value === option ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false); // Always close on selection
                  }}
                >
                  {option}
                  {value === option && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const LiveGrouping = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [liveGroups, setLiveGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useViewPreference();
  const [activeGroups, setActiveGroups] = useState([]);
  const [closedGroups, setClosedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [filterType, setFilterType] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');
  const [filterArea, setFilterArea] = useState('Any'); // Default to 'Any'
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false); // New State
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced Search Logic
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = [];
    const allGroups = [...activeGroups, ...closedGroups];

    // 0. Pre-filter by Type and Budget
    let filteredGroups = allGroups;

    if (filterType !== 'All') {
      filteredGroups = filteredGroups.filter(group => {
        const type = (group.property_type || group.type || '').toLowerCase();
        return type.includes(filterType.toLowerCase());
      });
    }

    if (filterBudget !== 'All') {
      filteredGroups = filteredGroups.filter(group => {
        const price = parseFloat(group.discounted_total_price_min || group.group_price || 0);
        if (!price) return true;
        if (filterBudget === 'Under 50L') return price < 5000000;
        if (filterBudget === '50L - 1Cr') return price >= 5000000 && price <= 10000000;
        if (filterBudget === 'Above 1Cr') return price > 10000000;
        return true;
      });
    }

    if (filterArea !== 'All') {
      filteredGroups = filteredGroups.filter(group => {
        const location = (group.location || '').toLowerCase();
        return location.includes(filterArea.toLowerCase());
      });
    }

    filteredGroups.forEach(group => {
      // 1. Property Name Match
      if (group.title?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Property',
          text: group.title,
          group: group,
          matchTerm: group.title
        });
      }

      // 2. Builder/Developer Match
      const devName = group.developer || group.builder_name || '';
      if (devName.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Builder',
          text: devName,
          group: group,
          matchTerm: devName
        });
      }

      // 2.5 Location Match
      if (group.location?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Location',
          text: group.location,
          group: group,
          matchTerm: group.location
        });
      }

      // 2.6 Type Match
      const propType = group.property_type || group.type || '';
      if (propType.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Type',
          text: propType,
          group: group,
          matchTerm: propType
        });
      }

      // 3. Benefits Match
      if (group.benefits && Array.isArray(group.benefits)) {
        group.benefits.forEach(benefit => {
          if (benefit.toLowerCase().includes(lowerQuery)) {
            // Check for duplicates
            const exists = results.find(r => r.type === 'Benefit' && r.group.id === group.id && r.text === benefit);
            if (!exists) {
              results.push({
                type: 'Benefit',
                text: benefit,
                group: group,
                matchTerm: benefit
              });
            }
          }
        });
      }

      // 4. Live Offers / Status Match
      const statusText = group.timeLeft || '';
      if (statusText.toLowerCase().includes(lowerQuery) || 'live'.includes(lowerQuery)) {
        results.push({
          type: 'Offer',
          text: group.status === 'active' ? 'Live Offer' : statusText,
          group: group,
          matchTerm: statusText
        });
      }
    });

    // We limit results to avoid huge dropdowns
    setSearchResults(results.slice(0, 10)); // Top 10 matches
    setShowDropdown(results.length > 0);
  }, [searchQuery, filterType, filterBudget, activeGroups, closedGroups]);

  const scrollToGroup = (groupId) => {
    // Wait for state updates/filtering to complete potentially
    setTimeout(() => {
      const element = document.getElementById(`group-${groupId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add a temporary flash effect
        element.style.transition = 'box-shadow 0.3s ease';
        element.style.boxShadow = '0 0 0 4px rgba(22, 163, 74, 0.5)';
        setTimeout(() => {
          element.style.boxShadow = '';
        }, 1500);
        setShowDropdown(false);
      }
    }, 100);
  };

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      scrollToGroup(searchResults[0].group.id);
    } else if (filteredActiveGroups.length > 0) {
      scrollToGroup(filteredActiveGroups[0].id);
    } else if (filteredClosedGroups.length > 0) {
      scrollToGroup(filteredClosedGroups[0].id);
    }
  };

  const filterGroups = (groups) => {
    let filtered = groups;

    // 1. Text Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(group => {
        const titleMatch = group.title?.toLowerCase().includes(lowerQuery);
        const devName = group.developer || group.builder_name || '';
        const devMatch = devName.toLowerCase().includes(lowerQuery);
        const locMatch = group.location?.toLowerCase().includes(lowerQuery);
        const typeMatch = (group.property_type || group.type)?.toLowerCase().includes(lowerQuery);
        const benefitMatch = group.benefits?.some(b => b.toLowerCase().includes(lowerQuery));
        const statusMatch = group.timeLeft?.toLowerCase().includes(lowerQuery) || 'live'.includes(lowerQuery);
        return titleMatch || devMatch || locMatch || typeMatch || benefitMatch || statusMatch;
      });
    }

    // 2. Type Filter
    if (filterType !== 'All') {
      filtered = filtered.filter(group => {
        const type = (group.property_type || group.type || '').toLowerCase();
        return type.includes(filterType.toLowerCase());
      });
    }

    // 3. Budget Filter
    if (filterBudget !== 'All') {
      filtered = filtered.filter(group => {
        // Use discounted total price min if available, fallback to something reasonable
        const price = parseFloat(group.discounted_total_price_min || group.group_price || 0);
        if (!price) return true; // Keep if no price data

        if (filterBudget === 'Under 50L') return price < 5000000;
        if (filterBudget === '50L - 1Cr') return price >= 5000000 && price <= 10000000;
        if (filterBudget === 'Above 1Cr') return price > 10000000;
        return true;
      });
    }

    return filtered;
  };

  const filteredActiveGroups = filterGroups(activeGroups);
  const filteredClosedGroups = filterGroups(closedGroups);

  // Scroll Restoration Logic
  useLayoutEffect(() => {
    // If we have a saved scroll position and we just finished loading
    if (!loading && sessionStorage.getItem('liveGroupingScrollY')) {
      const scrollY = parseInt(sessionStorage.getItem('liveGroupingScrollY'), 10);
      window.scrollTo(0, scrollY);
      // Clear it so it doesn't persist forever, or keep it if you want to support multiple backs
      sessionStorage.removeItem('liveGroupingScrollY');
    } else if (loading) {
      // If loading, ensure we start at top (or keep current if minimizing jumpiness is priority, but here we prioritize header visibility)
      // window.scrollTo(0, 0); 
      // Commented out: Let ScrollToTop component handle initial scroll to top on navigation.
    }
  }, [loading]);

  const handleNavigateToDetails = (id) => {
    // Save current scroll position before navigating away
    sessionStorage.setItem('liveGroupingScrollY', window.scrollY.toString());
    navigate(`/exhibition/live-grouping/${id}`);
  };

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
          // Robust mapping for price per sqft
          pricePerSqFt: parseFloat(group.regular_price_per_sqft) || parseFloat(group.price_min_reg) || parseFloat(group.original_price?.toString().replace(/[^0-9.]/g, '') || 0),
          pricePerSqFtMax: parseFloat(group.regular_price_per_sqft_max) || parseFloat(group.price_max_reg) || null,
          groupPricePerSqFt: parseFloat(group.group_price_per_sqft) || parseFloat(group.price_min_disc) || parseFloat(group.group_price?.toString().replace(/[^0-9.]/g, '') || 0),
          groupPricePerSqFtMax: parseFloat(group.group_price_per_sqft_max) || parseFloat(group.price_max_disc) || null,

          filledSlots: group.filled_slots || 0,
          totalSlots: group.total_slots || 0,
          minBuyers: group.min_buyers || 0,
          totalSavingsMin: parseFloat(group.total_savings_min) || null,
          totalSavingsMax: parseFloat(group.total_savings_max) || null,
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

        {/* Modernized Search Bar */}
        <motion.div
          className="modern-search-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -4, 0],
            transition: {
              opacity: { duration: 0.8 },
              y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
            }
          }}
          style={{ marginTop: '-67px', zIndex: 500 }}
        >
          {!isMobile ? (
            // DESKTOP LAYOUT
            <div className={`search-glass-pill ${isFocused ? 'focused' : ''}`}>
              <div className="shimmer-layer"></div>
              {/* Search Input Section */}
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search properties, builders, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="modern-input"
                />
              </div>

              {/* Desktop Filters Section */}
              <div className="filters-wrapper">
                <div className="divider-v"></div>
                <CustomDropdown
                  label="Type"
                  value={filterType}
                  options={['All', 'Apartment', 'Villa', 'Plot/Land', 'Commercial']}
                  onChange={setFilterType}
                />
                <div className="divider-v"></div>
                <CustomDropdown
                  label="Area"
                  value={filterArea}
                  options={['Any', 'Below 800 sq ft', '800 – 1,500 sq ft', '1,500 – 2,500 sq ft', 'Above 2,500 sq ft']}
                  onChange={setFilterArea}
                />
                <div className="divider-v"></div>
                <CustomDropdown
                  label="Budget"
                  value={filterBudget}
                  options={['All', 'Under 50L', '50L - 1Cr', 'Above 1Cr']}
                  onChange={setFilterBudget}
                />
              </div>

              {/* Search Action Button */}
              <motion.button
                className="modern-search-btn"
                whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearchSubmit}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </motion.button>
            </div>
          ) : (
            // MOBILE LAYOUT
            <div className="mobile-search-wrapper">
              <div className="mobile-search-unified-bar">
                {/* Filter Toggle Button (Inside Left) */}
                <motion.button
                  className={`mobile-inner-btn filter ${showMobileFilters ? 'active' : ''}`}
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </motion.button>

                {/* Input Field (Middle) */}
                <input
                  type="text"
                  placeholder="Find Your Dream Property"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="mobile-inner-input"
                />

                {/* Search Action Button (Inside Right) */}
                <motion.button
                  className="mobile-inner-btn search"
                  onClick={handleSearchSubmit}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </motion.button>
              </div>

              {/* Mobile Filters Section (Horizontal Row) */}
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    className="mobile-filters-row"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CustomDropdown
                      label="Type"
                      value={filterType}
                      options={['All', 'Apartment', 'Villa', 'Plot/Land', 'Commercial']}
                      onChange={setFilterType}
                      mobileMode={true}
                    />
                    <CustomDropdown
                      label="Area"
                      value={filterArea}
                      options={['Any', 'Below 800 sq ft', '800 – 1,500 sq ft', '1,500 – 2,500 sq ft', 'Above 2,500 sq ft']}
                      onChange={setFilterArea}
                      mobileMode={true}
                    />
                    <CustomDropdown
                      label="Budget"
                      value={filterBudget}
                      options={['All', 'Under 50L', '50L - 1Cr', 'Above 1Cr']}
                      onChange={setFilterBudget}
                      mobileMode={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && searchResults.length > 0 && (
            <motion.div
              className="search-results-dropdown-v2"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="results-scroll-area">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.group.id}-${index}`}
                    className="result-item-v2"
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', x: 5 }}
                    onClick={() => {
                      scrollToGroup(result.group.id);
                      setShowDropdown(false);
                    }}
                  >
                    <div className={`result-category ${result.type.toLowerCase()}`}>
                      {result.type}
                    </div>
                    <div className="result-content">
                      <span className="group-title">{result.group.title}</span>
                      <div className="match-text">
                        <Highlight text={result.text} highlight={searchQuery} />
                      </div>
                    </div>
                    <svg className="result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


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
        {
          !loading && (activeGroups.length > 0 || closedGroups.length > 0) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          )
        }

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
              // Skeleton Loader
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="property-card live-group-card skeleton-card">
                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line subtitle" />
                    <div className="skeleton-line full" />
                    <div className="skeleton-line full" />
                  </div>
                </div>
              ))
            ) : filteredActiveGroups.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', color: '#666' }}>
                No active groups available at the moment. Check back soon!
              </p>
            ) : (
              filteredActiveGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  id={`group-${group.id}`}
                  className={`property-card live-group-card ${group.status}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleNavigateToDetails(group.id)}
                  style={{ cursor: 'pointer', scrollMarginTop: '150px' }}
                >
                  <div className="property-image">
                    <img src={group.image} alt={group.title} />



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
                    <h3><Highlight text={group.title} highlight={searchQuery} /></h3>
                    <p className="owner">🏢 <Highlight text={group.developer || group.builder_name || 'Verified Builder'} highlight={searchQuery} /></p>
                    <p className="location">📍 <Highlight text={group.location} highlight={searchQuery} /></p>
                    <p className="type-info"><Highlight text={group.property_type || group.type} highlight={searchQuery} /></p>

                    {/* Progress Bar */}
                    <div className="group-progress">
                      <div className="progress-header">
                        <span className="progress-label">
                          {group.filledSlots}/{group.totalSlots} Buyers Joined
                        </span>
                        {group.minBuyers && <span className="min-buyers">Min: {group.minBuyers}</span>}
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

                      {/* Price Header Group */}
                      <div className="price-header-group" style={{ textAlign: 'center', marginBottom: '24px' }}>

                        {/* Regular Price Box (Top) */}
                        <div className="regular-price-box" style={{ marginBottom: '16px', padding: '10px' }}>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>
                            Regular Price (PER SQ FT)
                          </div>
                          {/* Price hidden to fix spacing as requested */}
                          <div style={{ display: 'none' }}>
                            {group.pricePerSqFtMax
                              ? `₹${group.pricePerSqFt?.toLocaleString()} - ₹${group.pricePerSqFtMax?.toLocaleString()} / sq ft`
                              : `₹${group.pricePerSqFt?.toLocaleString() || 'N/A'} / sq ft`
                            }
                          </div>
                          {/* Orange Bar for Regular Price */}
                          <div className="range-bar-orange" style={{ height: '8px', marginBottom: '2px' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                            <span style={{ textDecoration: 'line-through' }}>{group.pricePerSqFt ? `₹${group.pricePerSqFt.toLocaleString()} / sq ft` : ''}</span>
                            <span style={{ textDecoration: 'line-through' }}>{group.pricePerSqFtMax ? `₹${group.pricePerSqFtMax.toLocaleString()} / sq ft` : ''}</span>
                          </div>
                        </div>

                        {/* Live Group Price Bar (Top) */}
                        <div className="live-price-bar" style={{
                          background: 'linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderRadius: '16px',
                          padding: '16px 12px',
                          position: 'relative',
                          border: '1px solid #86efac',
                          boxShadow: '0 4px 12px rgba(74, 222, 128, 0.15)'
                        }}>
                          <div className="floating-label" style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'white',
                            padding: '4px 14px',
                            borderRadius: '16px',
                            fontSize: '10px',
                            fontWeight: '800',
                            color: '#166534',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            border: '1px solid #86efac'
                          }}>
                            <span>🏠</span> LIVE GROUP PRICE RANGE (PER SQ FT)
                          </div>
                          <div className="price-value" style={{ display: 'none' }}>
                            {group.groupPricePerSqFtMax
                              ? `₹${group.groupPricePerSqFt?.toLocaleString()} - ₹${group.groupPricePerSqFtMax?.toLocaleString()} / sq ft`
                              : `₹${group.groupPricePerSqFt?.toLocaleString() || 'N/A'} / sq ft`
                            }
                          </div>

                          {/* Green Bar for Group Price */}
                          <div className="range-bar-green" style={{ height: '10px', marginBottom: '4px' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#166534', fontWeight: '700' }}>
                            <span>{group.groupPricePerSqFt ? `₹${group.groupPricePerSqFt.toLocaleString()} / sq ft` : ''}</span>
                            <span>{group.groupPricePerSqFtMax ? `₹${group.groupPricePerSqFtMax.toLocaleString()} / sq ft` : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Yellow Pricing Container */}
                      {/* 3. Yellow Pricing Container - STRICT IMPLEMENTATION */}
                      {/* V2 Yellow Pricing Container */}
                      <div className="yellow-pricing-container-v2">

                        {/* Row 1 & 2: Regular Price Range Box */}
                        <div className="price-box-v2 regular-price-box">
                          <div className="regular-price-row">
                            <div className="label-col">
                              <span className="icon">🏠</span>
                              <span className="label">REGULAR PRICE RANGE (per unit):</span>
                            </div>
                            <span className="value" style={{ display: 'none' }}>
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
                          <div className="range-limits-labels text-slate-500">
                            <span style={{ textDecoration: 'line-through' }}>
                              {group.regular_price_min
                                ? `₹${(parseFloat(group.regular_price_min) / 100000).toFixed(2)} Lakhs`
                                : (group.original_price ? group.original_price : '₹62.06 Lakhs')
                              }
                            </span>
                            <span style={{ textDecoration: 'line-through' }}>
                              {group.regular_price_max
                                ? `₹${(parseFloat(group.regular_price_max) / 100000).toFixed(2)} Lakhs`
                                : '₹85.34 Lakhs'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Row 3: Group Price Box (Green) */}
                        <div className="price-box-v2 group-price-box">
                          <div className="group-price-row">
                            <div className="label-col">
                              <span className="icon">🎯</span>
                              <span className="label">LIVE GROUP PRICE RANGE (per unit):</span>
                            </div>
                            <span className="value" style={{ display: 'none' }}>
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

                        {/* Savings Display (Conditional) - INSIDE YELLOW CONTAINER */}
                        {(group.totalSavingsMin || group.totalSavingsMax) && (
                          <div className="price-box-v2 savings-box" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                            <div className="group-price-row">
                              <div className="label-col">
                                <span className="icon">💰</span>
                                <span className="label" style={{ color: '#1e40af' }}>TOTAL SAVINGS (per unit):</span>
                              </div>
                              <span className="value" style={{ display: 'none' }}>
                                {group.totalSavingsMax
                                  ? `₹${group.totalSavingsMin?.toLocaleString()} - ₹${group.totalSavingsMax?.toLocaleString()}`
                                  : `Up to ₹${(group.totalSavingsMin || group.totalSavingsMax)?.toLocaleString()}`
                                }
                              </span>
                            </div>

                            {/* Blue Range Bar */}
                            <div className="range-bar-blue"></div>
                            <div className="range-limits-labels text-blue-700">
                              <span>
                                {group.totalSavingsMin ? `₹${group.totalSavingsMin.toLocaleString()}` : ''}
                              </span>
                              <span>
                                {group.totalSavingsMax ? `₹${group.totalSavingsMax.toLocaleString()}` : ''}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Row 4: Dashed Separator */}
                        <div className="dashed-separator"></div>

                        {/* Row 5: Available Units */}
                        <div className="available-units-section">
                          <div className="section-label">Types of Units:</div>
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

                      <div className="final-price-disclaimer" style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: '#eff6ff',
                        border: '1px dashed #bfdbfe',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}>
                        <span style={{ fontSize: '13px' }}>💡</span>Final price depends on unit & area selected
                      </div>

                      {/* Secondary Info Clean */}


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
                            handleNavigateToDetails(group.id);
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
                {filteredClosedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    id={`group-${group.id}`}
                    className="property-card live-group-card closed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => handleNavigateToDetails(group.id)}
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
                      <h3><Highlight text={group.title} highlight={searchQuery} /></h3>
                      <p className="owner">🏢 <Highlight text={group.developer} highlight={searchQuery} /></p>
                      <p className="location">📍 <Highlight text={group.location} highlight={searchQuery} /></p>
                      <p className="type-info"><Highlight text={group.type} highlight={searchQuery} /></p>

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
