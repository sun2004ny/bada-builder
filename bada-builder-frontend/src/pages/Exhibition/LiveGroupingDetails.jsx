import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
// TODO: Implement with liveGroupingAPI.getById()
import { liveGroupDynamicAPI } from '../../services/api';
import { calculateTokenAmount, formatCurrency, calculatePriceRange, formatPriceRange } from '../../utils/liveGroupingCalculations';
import PropertyMap from '../../components/Map/PropertyMap';
import './LiveGroupingDetails.css';

const LiveGroupingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await liveGroupDynamicAPI.getFullHierarchy(id);
        const project = data.project;

        if (project) {
          const processedProject = {
            ...project,
            title: project.title || 'Untitled Project',
            location: project.location || project.map_address || 'Location not specified',
            images: project.images || (project.image ? [project.image] : ['/placeholder-property.jpg']),

            // Map Form Fields
            builder_name: project.builder_name || project.developer || '',
            property_type: project.property_type || project.type || '',
            unit_configuration: project.unit_configuration || '',
            description: project.description || 'No description available.',

            // Progress
            filledSlots: project.filled_slots || 0,
            totalSlots: project.total_slots || 0, // Using total_slots as target participants
            minBuyers: project.min_buyers || 0,

            // Timers & Status
            timeLeft: project.offer_expiry_datetime ? new Date(project.offer_expiry_datetime).toLocaleDateString() : (project.time_left || 'Limited Time'),
            status: project.status || 'live',

            // Plot Specifics
            road_width: project.road_width,
            plot_gap: project.plot_gap,

            // Pricing Mappings
            pricePerSqFt: parseFloat(project.regular_price_per_sqft) || parseFloat(project.price_min_reg) || 0,
            pricePerSqFtMax: parseFloat(project.regular_price_per_sqft_max) || parseFloat(project.price_max_reg) || null,
            groupPricePerSqFt: parseFloat(project.group_price_per_sqft) || parseFloat(project.price_min_disc) || 0,
            groupPricePerSqFtMax: parseFloat(project.group_price_per_sqft_max) || parseFloat(project.price_max_disc) || null,

            totalSavingsMin: parseFloat(project.total_savings_min) || null,
            totalSavingsMax: parseFloat(project.total_savings_max) || null,

            regular_price_min: project.regular_price_min,
            regular_price_max: project.regular_price_max,
            discounted_total_price_min: project.discounted_total_price_min,
            discounted_total_price_max: project.discounted_total_price_max,

            latitude: project.latitude,
            longitude: project.longitude,
            map_address: project.map_address,
          };
          setProperty(processedProject);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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
    navigate('/exhibition/3d-view', { state: { property: property } });
  };

  const handleDownloadBrochure = () => {
    if (property.brochure_url) {
      // Open in new tab for PDFs, more reliable across origins
      window.open(property.brochure_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Brochure not available for this project.');
    }
  };

  return (
    <div className="live-grouping-details">
      <div className="details-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/exhibition/live-grouping')}>
          ← Back to Live Grouping
        </button>

        {/* Image Gallery */}
        <Motion.div
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
        </Motion.div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Title & Info */}
            <Motion.div
              className="property-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1>{property.title}</h1>
              <p className="location">📍 {property.location}</p>
              <div className="property-meta">
                <span className="meta-item">{property.property_type}</span>
                {property.unit_configuration && <span className="meta-item">{property.unit_configuration}</span>}
                {property.area && <span className="meta-item">{property.area} Sq Ft</span>}
              </div>
            </Motion.div>

            {/* Group Progress */}
            <Motion.div
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
            </Motion.div>



            {/* Developer Info - ONLY if builder_name exists */}
            {property.builder_name && (
              <Motion.div
                className="developer-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2>Developer</h2>
                <div className="developer-card">
                  <div className="developer-icon">🏢</div>
                  <div className="developer-info">
                    <h3>{property.builder_name}</h3>
                    <p>Trusted Real Estate Developer</p>
                  </div>
                </div>
              </Motion.div>
            )}
          </div>

          {/* Right Column - Sticky Pricing Card */}
          <div className="right-column">
            <Motion.div
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

              {/* REPLICATED PRICING SECTION FROM CARD */}
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
                  <div style={{ display: 'none' }}>
                    {property.pricePerSqFtMax
                      ? `₹${property.pricePerSqFt?.toLocaleString()} - ₹${property.pricePerSqFtMax?.toLocaleString()} / sq ft`
                      : `₹${property.pricePerSqFt?.toLocaleString() || 'N/A'} / sq ft`
                    }
                  </div>
                  {/* Orange Bar for Regular Price */}
                  <div className="range-bar-orange" style={{ height: '8px', marginBottom: '2px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                    <span style={{ textDecoration: 'line-through' }}>{property.pricePerSqFt ? `₹${property.pricePerSqFt.toLocaleString()} / sq ft` : ''}</span>
                    <span style={{ textDecoration: 'line-through' }}>{property.pricePerSqFtMax ? `₹${property.pricePerSqFtMax.toLocaleString()} / sq ft` : ''}</span>
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

                  {/* Green Bar for Group Price */}
                  <div className="range-bar-green" style={{ height: '10px', marginBottom: '4px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#166534', fontWeight: '700' }}>
                    <span>{property.groupPricePerSqFt ? `₹${property.groupPricePerSqFt.toLocaleString()} / sq ft` : ''}</span>
                    <span>{property.groupPricePerSqFtMax ? `₹${property.groupPricePerSqFtMax.toLocaleString()} / sq ft` : ''}</span>
                  </div>
                </div>
              </div>

              {/* V2 Yellow Pricing Container */}
              <div className="yellow-pricing-container-v2">

                {/* Row 1 & 2: Regular Price Range Box */}
                <div className="price-box-v2 regular-price-box">
                  <div className="regular-price-row">
                    <div className="label-col">
                      <span className="icon">🏠</span>
                      <span className="label">REGULAR PRICE RANGE (per unit):</span>
                    </div>
                  </div>

                  {/* Row 2: Orange Range Bar */}
                  <div className="range-bar-orange"></div>
                  <div className="range-limits-labels text-slate-500">
                    <span style={{ textDecoration: 'line-through' }}>
                      {property.regular_price_min
                        ? `₹${(parseFloat(property.regular_price_min) / 100000).toFixed(2)} Lakhs`
                        : (property.original_price ? property.original_price : 'N/A')
                      }
                    </span>
                    <span style={{ textDecoration: 'line-through' }}>
                      {property.regular_price_max
                        ? `₹${(parseFloat(property.regular_price_max) / 100000).toFixed(2)} Lakhs`
                        : ''
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
                  </div>

                  {/* Green Range Bar */}
                  <div className="range-bar-green"></div>
                  <div className="range-limits-labels text-emerald-700">
                    <span>
                      {property.discounted_total_price_min
                        ? `₹${(parseFloat(property.discounted_total_price_min) / 100000).toFixed(2)} Lakhs`
                        : ''
                      }
                    </span>
                    <span>
                      {property.discounted_total_price_max
                        ? `₹${(parseFloat(property.discounted_total_price_max) / 100000).toFixed(2)} Lakhs`
                        : ''
                      }
                    </span>
                  </div>
                </div>

                {/* Savings Display (Conditional) */}
                {(property.totalSavingsMin || property.totalSavingsMax) && (
                  <div className="price-box-v2 savings-box" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                    <div className="group-price-row">
                      <div className="label-col">
                        <span className="icon">💰</span>
                        <span className="label" style={{ color: '#1e40af' }}>TOTAL SAVINGS (per unit):</span>
                      </div>
                    </div>

                    {/* Blue Range Bar */}
                    <div className="range-bar-blue"></div>
                    <div className="range-limits-labels text-blue-700">
                      <span>
                        {property.totalSavingsMin ? `₹${property.totalSavingsMin.toLocaleString()}` : ''}
                      </span>
                      <span>
                        {property.totalSavingsMax ? `₹${property.totalSavingsMax.toLocaleString()}` : ''}
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
                    {property.unit_configuration && property.unit_configuration.includes(',') ? (
                      property.unit_configuration.split(',').map((u, i) => (
                        <div key={i} className="unit-pill">{u.trim()}</div>
                      ))
                    ) : (property.unit_configuration ? (
                      <div className="unit-pill">{property.unit_configuration}</div>
                    ) : (
                      <>
                        {property.units && property.units.map((unit, idx) => (
                          <div key={idx} className="unit-pill">{unit.name} ({unit.area} sq ft)</div>
                        ))}
                      </>
                    ))}
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

              <button
                className="join-btn-large"
                onClick={handleJoinGroup}
                disabled={property.status === 'closed'}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🏢</span>
                  {property.status === 'closing' ? '⚡ Join Now - Closing Soon!' :
                    property.status === 'closed' ? '❌ Group Closed' :
                      '🤝 Join This Group'}
                </div>
              </button>



              <button
                className="contact-btn"
                onClick={handleDownloadBrochure}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📥</span> Download Brochure
                </div>
              </button>

              <button
                className="contact-btn"
                style={{ border: '1px solid #e2e8f0', color: '#64748b' }}
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
            </Motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGroupingDetails;
