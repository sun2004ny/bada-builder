import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DetailedSearchBar from '../components/DetailedSearchBar/DetailedSearchBar';
import './SearchResults.css';

// Sample data - replace with actual database query
const sampleProperties = [
  {
    id: 1,
    title: "Luxury 3BHK Apartment",
    type: "flat",
    location: "Alkapuri, Vadodara",
    price: "₹65 Lakhs",
    area: "1450 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    title: "Modern Villa with Garden",
    type: "villa",
    location: "Waghodia Road, Vadodara",
    price: "₹1.2 Cr",
    area: "2500 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    title: "Commercial Shop Space",
    type: "commercial",
    location: "RC Dutt Road, Vadodara",
    price: "₹45 Lakhs",
    area: "800 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 4,
    title: "Independent House",
    type: "house",
    location: "Manjalpur, Vadodara",
    price: "₹85 Lakhs",
    area: "1800 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 5,
    title: "Residential Plot",
    type: "land",
    location: "Gorwa, Vadodara",
    price: "₹35 Lakhs",
    area: "1200 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 6,
    title: "Office Space",
    type: "office",
    location: "Sayajigunj, Vadodara",
    price: "₹55 Lakhs",
    area: "1000 sq.ft",
    image: "/api/placeholder/400/300"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filtered = sampleProperties;

      // Filter by search query
      if (query) {
        filtered = filtered.filter(prop =>
          prop.title.toLowerCase().includes(query.toLowerCase()) ||
          prop.location.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Filter by type
      if (type) {
        // Handle comma-separated types if needed, or simple exact match
        filtered = filtered.filter(prop => prop.type === type);
      }

      // Filter by category
      if (category) {
        const lowerCat = category.toLowerCase();
        if (lowerCat === 'commercial') {
          filtered = filtered.filter(prop => ['shop', 'office', 'godown', 'warehouse', 'showroom', 'commercial'].includes(prop.type));
        } else if (lowerCat === 'residential') {
          filtered = filtered.filter(prop => ['flat', 'bungalow', 'villa', 'house', 'residential'].includes(prop.type));
        } else if (lowerCat === 'land') {
          filtered = filtered.filter(prop => ['land', 'plot'].includes(prop.type));
        } else {
          // Fallback: try to match type directly or just pass if no specific logic
          filtered = filtered.filter(prop => prop.type === lowerCat || prop.type.includes(lowerCat));
        }
      }

      // Filter by location
      if (location) {
        filtered = filtered.filter(prop =>
          prop.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      setResults(filtered);
      setLoading(false);
    }, 500);
  }, [query, type, location, category]);

  return (
    <div className="search-results-page">
      {/* Search Bar Section */}
      <div className="search-section">
        <div className="search-container">
          <h1>Find Your Dream Property</h1>
          <DetailedSearchBar />
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-container">
          {/* Search Info */}
          <div className="search-info">
            <h2>Search Results</h2>
            {(query || type || location || category) && (
              <div className="search-filters">
                {query && <span className="filter-tag">Query: {query}</span>}
                {category && <span className="filter-tag">Category: {category}</span>}
                {type && <span className="filter-tag">Type: {type}</span>}
                {location && <span className="filter-tag">Location: {location}</span>}
              </div>
            )}
            <p className="results-count">
              {loading ? 'Searching...' : `${results.length} properties found`}
            </p>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Searching properties...</p>
            </div>
          ) : results.length > 0 ? (
            <motion.div
              className="results-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {results.map((property, index) => (
                <motion.div
                  key={property.id}
                  className="property-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="card-image">
                    <img src={property.image} alt={property.title} />
                    <span className="property-type-badge">{property.type}</span>
                  </div>
                  <div className="card-content">
                    <h3>{property.title}</h3>
                    <p className="location">
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                    <div className="card-details">
                      <span className="price">{property.price}</span>
                      <span className="area">{property.area}</span>
                    </div>
                    <div className="card-actions">
                      <Link
                        to={`/property-details/${property.id}`}
                        state={{ property, type: 'search' }}
                        className="view-btn"
                      >
                        View Details
                      </Link>
                      <Link
                        to="/book-visit"
                        state={{ property: { ...property, type: 'search' } }}
                        className="book-btn"
                      >
                        Book Site Visit
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="no-results">
              <svg className="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3>No properties found</h3>
              <p>Try adjusting your search criteria or browse all properties</p>
              <Link to="/" className="browse-btn">
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
