import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoGlobal.css';

const GoGlobal = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample international properties
  const globalProperties = [
    {
      id: 'uae-1',
      title: 'Luxury Apartment in Dubai Marina',
      country: 'UAE',
      city: 'Dubai',
      location: 'Dubai Marina',
      type: '2 BHK Apartment',
      area: 1200,
      price: 1500000,
      currency: 'AED',
      currencySymbol: 'د.إ',
      priceInINR: 33750000,
      image: '/placeholder-property.jpg',
      features: ['Sea View', 'Swimming Pool', 'Gym', 'Parking'],
      roi: '8-10%',
      flag: '🇦🇪'
    },
    {
      id: 'usa-1',
      title: 'Modern Condo in Manhattan',
      country: 'USA',
      city: 'New York',
      location: 'Manhattan, NYC',
      type: '1 BHK Condo',
      area: 800,
      price: 750000,
      currency: 'USD',
      currencySymbol: '$',
      priceInINR: 62250000,
      image: '/placeholder-property.jpg',
      features: ['City View', 'Doorman', 'Fitness Center', 'Rooftop'],
      roi: '6-8%',
      flag: '🇺🇸'
    },
    {
      id: 'uk-1',
      title: 'Victorian House in London',
      country: 'UK',
      city: 'London',
      location: 'Kensington, London',
      type: '3 BHK House',
      area: 1800,
      price: 950000,
      currency: 'GBP',
      currencySymbol: '£',
      priceInINR: 103500000,
      image: '/placeholder-property.jpg',
      features: ['Garden', 'Period Features', 'Parking', 'Near Tube'],
      roi: '5-7%',
      flag: '🇬🇧'
    },
    {
      id: 'aus-1',
      title: 'Beachfront Apartment in Sydney',
      country: 'Australia',
      city: 'Sydney',
      location: 'Bondi Beach, Sydney',
      type: '2 BHK Apartment',
      area: 1100,
      price: 1200000,
      currency: 'AUD',
      currencySymbol: 'A$',
      priceInINR: 66000000,
      image: '/placeholder-property.jpg',
      features: ['Ocean View', 'Balcony', 'Pool', 'Gym'],
      roi: '7-9%',
      flag: '🇦🇺'
    },
    {
      id: 'can-1',
      title: 'Downtown Condo in Toronto',
      country: 'Canada',
      city: 'Toronto',
      location: 'Downtown Toronto',
      type: '2 BHK Condo',
      area: 1000,
      price: 650000,
      currency: 'CAD',
      currencySymbol: 'C$',
      priceInINR: 39650000,
      image: '/placeholder-property.jpg',
      features: ['CN Tower View', 'Concierge', 'Gym', 'Parking'],
      roi: '6-8%',
      flag: '🇨🇦'
    },
    {
      id: 'sg-1',
      title: 'High-Rise Apartment in Singapore',
      country: 'Singapore',
      city: 'Singapore',
      location: 'Marina Bay',
      type: '3 BHK Apartment',
      area: 1400,
      price: 2000000,
      currency: 'SGD',
      currencySymbol: 'S$',
      priceInINR: 122000000,
      image: '/placeholder-property.jpg',
      features: ['Skyline View', 'Infinity Pool', 'Gym', 'Security'],
      roi: '4-6%',
      flag: '🇸🇬'
    }
  ];

  const countries = ['all', ...new Set(globalProperties.map(p => p.country))];

  const filteredProperties = globalProperties.filter(property => {
    const matchesCountry = selectedCountry === 'all' || property.country === selectedCountry;
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const formatINR = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="go-global-page">
      {/* Hero Section */}
      <div className="global-hero">
        <div className="global-hero-content">
          <h1>🌍 Go Global</h1>
          <p className="global-subtitle">Invest in Premium Properties Across the World</p>
          <div className="global-stats">
            <div className="stat-item">
              <span className="stat-number">6</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Cities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Properties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="search-filter-section">
        <div className="search-container-global">
          <input
            type="text"
            placeholder="Search by city, country, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="global-search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="country-filters">
          {countries.map(country => (
            <button
              key={country}
              className={`country-filter-btn ${selectedCountry === country ? 'active' : ''}`}
              onClick={() => setSelectedCountry(country)}
            >
              {country === 'all' ? '🌐 All Countries' : `${globalProperties.find(p => p.country === country)?.flag} ${country}`}
            </button>
          ))}
        </div>
      </div>

      {/* Why Invest Globally */}
      <div className="why-global-section">
        <h2>Why Invest Globally?</h2>
        <div className="benefits-grid-global">
          <div className="benefit-card-global">
            <span className="benefit-icon-global">📈</span>
            <h3>Portfolio Diversification</h3>
            <p>Spread risk across multiple markets and currencies</p>
          </div>
          <div className="benefit-card-global">
            <span className="benefit-icon-global">💰</span>
            <h3>Higher ROI Potential</h3>
            <p>Access to high-growth international markets</p>
          </div>
          <div className="benefit-card-global">
            <span className="benefit-icon-global">🏆</span>
            <h3>Premium Properties</h3>
            <p>Invest in world-class developments</p>
          </div>
          <div className="benefit-card-global">
            <span className="benefit-icon-global">🔒</span>
            <h3>Secure Investments</h3>
            <p>Verified properties with legal compliance</p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="global-properties-section">
        <h2>Featured International Properties</h2>
        {filteredProperties.length === 0 ? (
          <div className="no-results">
            <h3>No properties found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="global-properties-grid">
            {filteredProperties.map(property => (
              <div key={property.id} className="global-property-card">
                <div className="global-property-image">
                  <img src={property.image} alt={property.title} />
                  <div className="property-badges">
                    <span className="country-badge">{property.flag} {property.country}</span>
                    <span className="roi-badge">ROI: {property.roi}</span>
                  </div>
                </div>
                <div className="global-property-info">
                  <h3>{property.title}</h3>
                  <p className="property-location">📍 {property.location}</p>
                  <div className="property-details-row">
                    <span>{property.type}</span>
                    <span>{property.area} sq ft</span>
                  </div>
                  <div className="property-features">
                    {property.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <div className="property-pricing">
                    <div className="price-row">
                      <span className="price-label">Local Price:</span>
                      <span className="price-value">{property.currencySymbol}{property.price.toLocaleString()}</span>
                    </div>
                    <div className="price-row inr">
                      <span className="price-label">In INR:</span>
                      <span className="price-value">{formatINR(property.priceInINR)}</span>
                    </div>
                  </div>
                  <button 
                    className="view-property-btn"
                    onClick={() => navigate(`/go-global/property/${property.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="how-it-works-global">
        <h2>How It Works</h2>
        <div className="steps-grid-global">
          <div className="step-card-global">
            <div className="step-number-global">1</div>
            <h3>Browse Properties</h3>
            <p>Explore verified international properties across multiple countries</p>
          </div>
          <div className="step-card-global">
            <div className="step-number-global">2</div>
            <h3>Get Expert Guidance</h3>
            <p>Our team helps with legal, tax, and investment advice</p>
          </div>
          <div className="step-card-global">
            <div className="step-number-global">3</div>
            <h3>Secure Investment</h3>
            <p>Complete documentation and secure payment process</p>
          </div>
          <div className="step-card-global">
            <div className="step-number-global">4</div>
            <h3>Manage Remotely</h3>
            <p>Track your investment and returns from anywhere</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section-global">
        <h2>Ready to Invest Globally?</h2>
        <p>Connect with our international property experts today</p>
        <button 
          className="cta-btn-global"
          onClick={() => navigate('/contact')}
        >
          Schedule Consultation
        </button>
      </div>
    </div>
  );
};

export default GoGlobal;
