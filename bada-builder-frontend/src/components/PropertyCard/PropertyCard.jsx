import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHome, FiMaximize2, FiCalendar } from 'react-icons/fi';
import './PropertyCard.css';

/**
 * Reusable PropertyCard component that supports both grid and list views
 * @param {Object} property - Property data object
 * @param {string} viewType - 'grid' or 'list'
 * @param {string} source - Source page identifier (optional)
 */
const PropertyCard = ({ property, viewType = 'grid', source = 'home' }) => {
  const navigate = useNavigate();

  const handleBookVisit = (e) => {
    e.preventDefault();
    navigate('/book-visit', { state: { property } });
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/property-details/${property.id}`, { state: { property, type: source } });
  };

  return (
    <div className={`property-card-wrapper ${viewType}-view`}>
      {/* Property Image */}
      <div className="property-card-image">
        <img 
          src={property.image || property.image_url || '/api/placeholder/400/300'} 
          alt={property.title} 
          loading="lazy"
        />
        {property.status && (
          <span className={`property-status-badge ${property.status.toLowerCase()}`}>
            {property.status}
          </span>
        )}
        {property.featured && (
          <span className="featured-badge">Featured</span>
        )}
      </div>

      {/* Property Content */}
      <div className="property-card-content">
        {/* Title */}
        <h3 className="property-title">{property.title}</h3>

        {/* Location */}
        <p className="property-location">
          <FiMapPin className="icon" />
          {property.location}
        </p>

        {/* Price */}
        <p className="property-price">{property.price}</p>

        {/* Key Highlights */}
        <div className="property-highlights">
          {property.bhk && (
            <span className="highlight-item">
              <FiHome className="icon" />
              {property.bhk}
            </span>
          )}
          {property.area && (
            <span className="highlight-item">
              <FiMaximize2 className="icon" />
              {property.area}
            </span>
          )}
          {property.type && (
            <span className="highlight-item type-badge">
              {property.type}
            </span>
          )}
        </div>

        {/* Description (List View Only) */}
        {viewType === 'list' && property.description && (
          <p className="property-description">
            {property.description.length > 150 
              ? `${property.description.substring(0, 150)}...` 
              : property.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="property-actions">
          <button 
            onClick={handleViewDetails}
            className="btn-primary"
          >
            View Details
          </button>
          <button 
            onClick={handleBookVisit}
            className="btn-secondary"
          >
            <FiCalendar className="icon" />
            Book Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
