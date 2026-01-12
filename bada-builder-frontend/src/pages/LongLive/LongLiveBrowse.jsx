import React, { useState, useEffect } from 'react';
// TODO: Implement rental properties API endpoint
// import { rentalPropertiesAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import './LongLiveBrowse.css';

const LongLiveBrowse = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, rent, lease

  useEffect(() => {
    fetchRentalProperties();
  }, [filter]);

  const fetchRentalProperties = async () => {
    setLoading(true);
    try {
      // TODO: Implement with rentalPropertiesAPI.getAll({ status: 'active', rentalType: filter })
      // For now, using empty array
      const properties = [];

      const querySnapshot = await getDocs(q);
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching rental properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="long-live-browse">
      <div className="browse-header">
        <h1>Long Live - Long Term Rentals</h1>
        <p>Find your perfect long-term rental or lease property</p>
      </div>

      <div className="browse-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Properties
        </button>
        <button
          className={`filter-btn ${filter === 'rent' ? 'active' : ''}`}
          onClick={() => setFilter('rent')}
        >
          For Rent
        </button>
        <button
          className={`filter-btn ${filter === 'lease' ? 'active' : ''}`}
          onClick={() => setFilter('lease')}
        >
          For Lease
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="no-properties">
          <h3>No properties available</h3>
          <p>Check back later or try different filters</p>
          <Link to="/long-live/post" className="post-property-link">
            Post Your Property
          </Link>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-image">
                {property.images && property.images[0] ? (
                  <img src={property.images[0]} alt={property.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <span className="rental-badge">{property.rentalType === 'rent' ? 'For Rent' : 'For Lease'}</span>
              </div>
              <div className="property-details">
                <h3>{property.title}</h3>
                <p className="location">📍 {property.location}</p>
                <p className="price">₹{property.monthlyRent?.toLocaleString()}/month</p>
                <div className="property-specs">
                  <span>{property.bedrooms} BHK</span>
                  <span>{property.area} sq ft</span>
                  <span>{property.furnishing}</span>
                </div>
                <Link to={`/long-live/property/${property.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LongLiveBrowse;
