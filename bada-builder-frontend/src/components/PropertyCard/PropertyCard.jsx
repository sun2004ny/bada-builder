import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHome, FiMaximize2, FiCalendar } from 'react-icons/fi';
import './PropertyCard.css';
import BookmarkButton from '../BookmarkButton/BookmarkButton';
import { motion } from 'framer-motion';
import AnimatedButton from '../Motion/AnimatedButton';

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

  const propertyTitle = property.project_name || property.projectName || property.title || property.projectName || 'Untitled Property';

  return (
    <motion.div
      className={`property-card-wrapper ${viewType}-view cursor-pointer`}
      onClick={handleViewDetails}
      whileHover={{ y: -8, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Property Image */}
      <div className="property-card-image">
        <img
          src={property.image || property.image_url || '/api/placeholder/400/300'}
          alt={propertyTitle}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 z-10">
          <BookmarkButton propertyId={property.id} />
        </div>

        {/* Special Badges */}
        {property.status && (
          <span className={`property-status-badge ${property.status.toLowerCase()}`}>
            {property.status === 'live' ? '🔴 Live Room' : property.status}
          </span>
        )}
        {property.discount && (
          <span className="discount-badge-overlay">{property.discount} OFF</span>
        )}
        {property.timeLeft && (
          <span className="timer-badge-overlay">⏰ {property.timeLeft}</span>
        )}
        {property.featured && !property.discount && (
          <span className="featured-badge">Featured</span>
        )}
      </div>

      {/* Property Content */}
      <div className="property-card-content">
        {/* Title */}
        <h3 className="property-title">{propertyTitle}</h3>

        {/* Location */}
        <p className="property-location">
          <FiMapPin className="icon" />
          {property.project_location || property.projectLocation || property.location || 'Location Not Specified'}
        </p>

        {/* Price Section */}
        <div className="property-price-container">
          {property.original_price && property.group_price ? (
            <div className="group-pricing-display">
              <div className="price-row regular">
                <span className="label">Regular:</span>
                <span className="value strikethrough">{property.original_price}</span>
              </div>
              <div className="price-row highlight">
                <span className="label">Group Price:</span>
                <span className="value">{property.group_price}</span>
              </div>
            </div>
          ) : (
            <p className="property-price">
              {property.price && !property.price.toString().includes('undefined')
                ? property.price
                : (property?.base_price && property?.max_price ? `${property.base_price} - ${property.max_price}` : (property?.base_price ? property.base_price : (property?.price && !property?.price.toString().includes('undefined') ? property.price : 'Contact for Price')))}
            </p>
          )}
        </div>

        {/* Key Highlights */}
        <div className="property-highlights">
          {property.bhk && (
            <span className="highlight-item">
              <FiHome className="icon" />
              {property.bhk}
            </span>
          )}
          {(property.area || (property.project_stats && property.project_stats.area)) && (
            <span className="highlight-item">
              <FiMaximize2 className="icon" />
              {property.area || property.project_stats.area}
            </span>
          )}
          {property.type && (
            <span className="highlight-item type-badge">
              {property.type}
            </span>
          )}
        </div>

        {/* Progress Bar for Grouping */}
        {(property.total_slots || property.totalSlots || property.min_buyers || property.minBuyers) && (
          <div className="property-progress">
            <div className="progress-info">
              <span className="joined-count">
                {property.filled_slots || property.filledSlots || 0}/{property.total_slots || property.totalSlots || 0} Buyers Joined
              </span>
              <span className="min-tag">Min: {property.min_buyers || property.minBuyers || 0}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.max(((property.filled_slots || property.filledSlots || 0) / (property.total_slots || property.totalSlots || 1)) * 100, (property.filled_slots || property.filledSlots) > 0 ? 5 : 0)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="property-actions">
          <AnimatedButton
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(e);
            }}
            className="btn-primary"
          >
            {property.source === 'live-grouping' ? 'Join Group' : 'View Details'}
          </AnimatedButton>
          <AnimatedButton
            onClick={(e) => {
              e.stopPropagation();
              handleBookVisit(e);
            }}
            className="btn-secondary"
          >
            <FiCalendar className="icon" />
            Book Visit
          </AnimatedButton>
        </div>
      </div>
    </motion.div >
  );
};

export default PropertyCard;
